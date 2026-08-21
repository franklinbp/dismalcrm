import * as Yup from "yup";
import Campaign from "../../models/Campaign";
import CampaignRecipient from "../../models/CampaignRecipient";
import AppError from "../../errors/AppError";

interface RecipientInput {
  phoneE164: string;
  name?: string | null;
}

const normalizePhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  return digits;
};

const ImportRecipientsService = async (
  campaignId: number | string,
  recipients: RecipientInput[]
): Promise<number> => {
  const campaign = await Campaign.findByPk(campaignId);
  if (!campaign) {
    throw new AppError("Campaign not found", 404);
  }

  if (campaign.status !== "DRAFT") {
    throw new AppError("Only DRAFT campaigns can import recipients", 400);
  }

  const schema = Yup.array().of(
    Yup.object().shape({
      phoneE164: Yup.string().required(),
      name: Yup.string().nullable()
    })
  );

  try {
    await schema.validate(recipients);
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const normalized = recipients
    .map(recipient => ({
      phoneE164: normalizePhone(recipient.phoneE164 || ""),
      name: recipient.name || null
    }))
    .filter(recipient => recipient.phoneE164.length > 0);

  const uniqueByPhone = Array.from(
    normalized
      .reduce((acc, recipient) => {
        if (!acc.has(recipient.phoneE164)) {
          acc.set(recipient.phoneE164, recipient);
        }
        return acc;
      }, new Map<string, { phoneE164: string; name: string | null }>())
      .values()
  );

  if (uniqueByPhone.length === 0) {
    throw new AppError("No valid recipients provided", 400);
  }

  const created = await CampaignRecipient.bulkCreate(
    uniqueByPhone.map(recipient => ({
      campaignId: Number(campaignId),
      phoneE164: recipient.phoneE164,
      name: recipient.name,
      status: "PENDING"
    })),
    { ignoreDuplicates: true }
  );

  return created.length;
};

export default ImportRecipientsService;
