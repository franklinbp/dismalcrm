import os from "os";
import { Op } from "sequelize";
import sequelize from "../../database";
import Campaign from "../../models/Campaign";
import CampaignRecipient from "../../models/CampaignRecipient";
import OutboxMessage from "../../models/OutboxMessage";
import Sender from "../../models/Sender";
import SendTextByWhatsappId from "../GatewayServices/SendTextByWhatsappId";
import SendMediaByWhatsappId from "../GatewayServices/SendMediaByWhatsappId";
import { logger } from "../../utils/logger";
import uploadConfig from "../../config/upload";
import path from "path";

const WORKER_ENABLED = process.env.CAMPAIGN_WORKER_ENABLED !== "false";
const CAMPAIGNS_ENABLED = process.env.ENABLE_CAMPAIGNS === "true";
const WORKER_INTERVAL_MS = Number(process.env.CAMPAIGN_WORKER_INTERVAL_MS || 5000);
const WORKER_BATCH_SIZE = Number(process.env.CAMPAIGN_WORKER_BATCH_SIZE || 50);
const LOCK_TIMEOUT_SECONDS = Number(process.env.CAMPAIGN_WORKER_LOCK_TIMEOUT_SECONDS || 300);
const MAX_ATTEMPTS = Number(process.env.CAMPAIGN_WORKER_MAX_ATTEMPTS || 3);
const RETRY_BASE_MS = Number(process.env.CAMPAIGN_RETRY_BASE_MS || 2000);
const RETRY_MAX_MS = Number(process.env.CAMPAIGN_RETRY_MAX_MS || 60000);

const workerId =
  process.env.CAMPAIGN_WORKER_ID || `${os.hostname()}-${process.pid}`;

const lockOutboxMessages = async (lockOwner: string) => {
  const query = `
    UPDATE OutboxMessages AS om
    JOIN Campaigns AS c ON c.id = om.campaignId
    SET om.status = 'PROCESSING',
        om.lockedAt = NOW(6),
        om.lockedBy = :lockOwner
    WHERE om.status = 'PENDING'
      AND (om.runAt IS NULL OR om.runAt <= NOW(6))
      AND c.status IN ('READY', 'RUNNING')
      AND (c.scheduleAt IS NULL OR c.scheduleAt <= NOW(6))
      AND (om.lockedAt IS NULL OR om.lockedAt < DATE_SUB(NOW(6), INTERVAL :lockTimeout SECOND))
    ORDER BY om.runAt ASC
    LIMIT :batchSize;
  `;

  await sequelize.query(query, {
    replacements: {
      lockOwner,
      lockTimeout: LOCK_TIMEOUT_SECONDS,
      batchSize: WORKER_BATCH_SIZE
    }
  });
};

const loadLockedMessages = async (lockOwner: string): Promise<OutboxMessage[]> => {
  return OutboxMessage.findAll({
    where: {
      lockedBy: lockOwner,
      status: "PROCESSING"
    },
    include: [
      { model: Campaign },
      { model: CampaignRecipient },
      { model: Sender }
    ],
    limit: WORKER_BATCH_SIZE
  });
};

const pickSender = async (outbox: OutboxMessage): Promise<Sender | null> => {
  if (outbox.sender) {
    return outbox.sender.status === "online" ? outbox.sender : null;
  }

  const campaign = outbox.campaign as Campaign;
  if (!campaign) {
    return null;
  }

  if (campaign.senderMode === "SINGLE") {
    if (!campaign.senderId) {
      return null;
    }
    const sender = await Sender.findByPk(campaign.senderId);
    if (!sender || sender.status !== "online") {
      return null;
    }
    return sender;
  }

  const senders = await Sender.findAll({
    where: { status: "online" },
    order: [["id", "ASC"]]
  });

  if (senders.length === 0) {
    return null;
  }

  const index = outbox.id % senders.length;
  return senders[index];
};

const applyRateLimit = async (sender: Sender, campaign: Campaign): Promise<Date | null> => {
  const rate = sender.ratePerMin || campaign.ratePerMin;
  if (!rate || rate <= 0) {
    return null;
  }

  const minIntervalMs = Math.floor(60000 / rate);
  const lastSent = await OutboxMessage.findOne({
    where: {
      senderId: sender.id,
      status: "SENT"
    },
    order: [["updatedAt", "DESC"]]
  });

  if (!lastSent) {
    return null;
  }

  const nextAllowed = new Date(lastSent.updatedAt.getTime() + minIntervalMs);
  if (nextAllowed > new Date()) {
    return nextAllowed;
  }

  return null;
};

const markCampaignRunning = async (campaign: Campaign) => {
  if (campaign.status === "READY") {
    await campaign.update({ status: "RUNNING" });
  }
};

const updateCampaignCompletion = async (campaignId: number) => {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign || campaign.status === "CANCELED") {
    return;
  }

  const total = await CampaignRecipient.count({ where: { campaignId } });
  if (total === 0) {
    return;
  }

  const sent = await CampaignRecipient.count({
    where: { campaignId, status: "SENT" }
  });
  const failed = await CampaignRecipient.count({
    where: { campaignId, status: "FAILED" }
  });
  const pending = await CampaignRecipient.count({
    where: { campaignId, status: { [Op.in]: ["PENDING", "RETRYING"] } }
  });

  if (pending === 0 && sent + failed === total) {
    await campaign.update({ status: failed > 0 ? "FAILED" : "COMPLETED" });
  }
};

const handleFailure = async (outbox: OutboxMessage, error: Error) => {
  const attempts = (outbox.attempts || 0) + 1;
  const retryDelay = Math.min(RETRY_BASE_MS * Math.pow(2, attempts - 1), RETRY_MAX_MS);
  const runAt = new Date(Date.now() + retryDelay);

  if (attempts >= MAX_ATTEMPTS) {
    await outbox.update({
      status: "FAILED",
      attempts,
      lastError: error.message,
      lockedAt: null,
      lockedBy: null
    });
    await CampaignRecipient.update(
      { status: "FAILED" },
      { where: { id: outbox.recipientId } }
    );
    return;
  }

  await outbox.update({
    status: "PENDING",
    attempts,
    runAt,
    lastError: error.message,
    lockedAt: null,
    lockedBy: null
  });

  await CampaignRecipient.update(
    { status: "RETRYING" },
    { where: { id: outbox.recipientId } }
  );
};

const handleSuccess = async (outbox: OutboxMessage, providerMessageId?: string) => {
  await outbox.update({
    status: "SENT",
    providerMessageId: providerMessageId || null,
    lockedAt: null,
    lockedBy: null,
    lastError: null
  });

  await CampaignRecipient.update(
    { status: "SENT" },
    { where: { id: outbox.recipientId } }
  );
};

const wasAlreadySentToPhone = async (outbox: OutboxMessage): Promise<boolean> => {
  const sentCount = await OutboxMessage.count({
    where: {
      campaignId: outbox.campaignId,
      to: outbox.to,
      status: "SENT",
      id: { [Op.ne]: outbox.id }
    }
  });

  return sentCount > 0;
};

export const runCampaignWorkerOnce = async () => {
  if (!WORKER_ENABLED || !CAMPAIGNS_ENABLED) {
    return;
  }

  const lockOwner = `${workerId}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;

  try {
    await lockOutboxMessages(lockOwner);
    const messages = await loadLockedMessages(lockOwner);
    const phonesHandledInRun = new Set<string>();

    for (const outbox of messages) {
      const campaign = outbox.campaign as Campaign;
      const recipient = outbox.recipient as CampaignRecipient;

      if (!campaign || campaign.status === "CANCELED") {
        await outbox.update({ status: "FAILED", lastError: "Campaign canceled", lockedAt: null, lockedBy: null });
        continue;
      }

      if (!recipient) {
        await outbox.update({ status: "FAILED", lastError: "Recipient not found", lockedAt: null, lockedBy: null });
        continue;
      }

      const recipientKey = `${outbox.campaignId}:${outbox.to}`;
      if (phonesHandledInRun.has(recipientKey) || (await wasAlreadySentToPhone(outbox))) {
        await handleSuccess(outbox, "deduplicated");
        await updateCampaignCompletion(campaign.id);
        continue;
      }
      phonesHandledInRun.add(recipientKey);

      const sender = await pickSender(outbox);
      if (!sender) {
        await outbox.update({
          status: "PENDING",
          runAt: new Date(Date.now() + RETRY_BASE_MS),
          lastError: "No sender available",
          lockedAt: null,
          lockedBy: null
        });
        await CampaignRecipient.update(
          { status: "RETRYING" },
          { where: { id: outbox.recipientId } }
        );
        continue;
      }

      if (!outbox.senderId) {
        await outbox.update({ senderId: sender.id });
      }

      const rateLimitedUntil = await applyRateLimit(sender, campaign);
      if (rateLimitedUntil) {
        await outbox.update({
          status: "PENDING",
          runAt: rateLimitedUntil,
          lockedAt: null,
          lockedBy: null
        });
        continue;
      }

      await markCampaignRunning(campaign);

      try {
        const sentMessage: any = campaign.mediaUrl
          ? await SendMediaByWhatsappId({
              whatsappId: sender.whatsappId,
              to: outbox.to,
              filePath: path.join(uploadConfig.directory, campaign.mediaUrl),
              caption: outbox.body,
              skipInbox: true
            })
          : await SendTextByWhatsappId({
              whatsappId: sender.whatsappId,
              to: outbox.to,
              body: outbox.body,
              skipInbox: true
            });

        const providerMessageId =
          sentMessage?.id?.id || sentMessage?.id?._serialized || null;

        await handleSuccess(outbox, providerMessageId || undefined);
      } catch (err: any) {
        await handleFailure(outbox, err);
      }

      await updateCampaignCompletion(campaign.id);
    }
  } catch (err) {
    logger.error({ err }, "Campaign worker error");
  }
};

let workerTimer: NodeJS.Timeout | null = null;

export const startCampaignWorker = () => {
  if (!WORKER_ENABLED || !CAMPAIGNS_ENABLED) {
    return;
  }

  if (workerTimer) {
    return;
  }

  workerTimer = setInterval(runCampaignWorkerOnce, WORKER_INTERVAL_MS);
};

export const stopCampaignWorker = () => {
  if (workerTimer) {
    clearInterval(workerTimer);
    workerTimer = null;
  }
};
