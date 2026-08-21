import CampaignRecipient from "../../models/CampaignRecipient";
import OutboxMessage from "../../models/OutboxMessage";

const CampaignMetricsService = async (campaignId: number | string) => {
  const totalRecipients = await CampaignRecipient.count({ where: { campaignId } });
  const sentRecipients = await CampaignRecipient.count({
    where: { campaignId, status: "SENT" }
  });
  const failedRecipients = await CampaignRecipient.count({
    where: { campaignId, status: "FAILED" }
  });
  const retryingRecipients = await CampaignRecipient.count({
    where: { campaignId, status: "RETRYING" }
  });
  const pendingRecipients = await CampaignRecipient.count({
    where: { campaignId, status: "PENDING" }
  });

  const outboxPending = await OutboxMessage.count({
    where: { campaignId, status: "PENDING" }
  });
  const outboxProcessing = await OutboxMessage.count({
    where: { campaignId, status: "PROCESSING" }
  });
  const outboxSent = await OutboxMessage.count({
    where: { campaignId, status: "SENT" }
  });
  const outboxFailed = await OutboxMessage.count({
    where: { campaignId, status: "FAILED" }
  });

  return {
    recipients: {
      total: totalRecipients,
      pending: pendingRecipients,
      retrying: retryingRecipients,
      sent: sentRecipients,
      failed: failedRecipients
    },
    outbox: {
      pending: outboxPending,
      processing: outboxProcessing,
      sent: outboxSent,
      failed: outboxFailed
    }
  };
};

export default CampaignMetricsService;
