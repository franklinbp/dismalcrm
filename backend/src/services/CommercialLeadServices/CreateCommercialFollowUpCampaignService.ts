import { Op } from "sequelize";

import AppError from "../../errors/AppError";
import Campaign from "../../models/Campaign";
import CommercialLead from "../../models/CommercialLead";
import Contact from "../../models/Contact";
import CreateCampaignService from "../CampaignServices/CreateCampaignService";
import ImportRecipientsService from "../CampaignServices/ImportRecipientsService";
import ReadyCampaignService from "../CampaignServices/ReadyCampaignService";

interface Request {
  leadIds: Array<number | string>;
  companyId?: number;
  name: string;
  messageBody: string;
  senderMode: "SINGLE" | "ROUND_ROBIN";
  senderId?: number | null;
  ratePerMin?: number | null;
  scheduleAt?: Date | string | null;
  markReady?: boolean;
}

interface Response {
  campaign: Campaign;
  recipientsImported: number;
  leadsUpdated: number;
}

const normalizePhone = (value?: string): string =>
  (value || "").replace(/\D/g, "");

const CreateCommercialFollowUpCampaignService = async ({
  leadIds,
  companyId,
  name,
  messageBody,
  senderMode,
  senderId,
  ratePerMin,
  scheduleAt,
  markReady = true
}: Request): Promise<Response> => {
  const normalizedLeadIds = Array.from(
    new Set(
      (leadIds || [])
        .map(leadId => Number(leadId))
        .filter(leadId => Number.isInteger(leadId) && leadId > 0)
    )
  );

  if (normalizedLeadIds.length === 0) {
    throw new AppError("Selecciona al menos un lead para seguimiento", 400);
  }

  if (!messageBody?.trim()) {
    throw new AppError("El mensaje de seguimiento es requerido", 400);
  }

  const leads = await CommercialLead.findAll({
    where: {
      id: { [Op.in]: normalizedLeadIds },
      ...(companyId ? { companyId } : {})
    },
    include: [{ model: Contact, as: "contact" }]
  });

  if (leads.length === 0) {
    throw new AppError("No se encontraron leads validos", 404);
  }

  const recipients = leads
    .map(lead => ({
      phoneE164: normalizePhone(lead.contact?.number),
      name: lead.contact?.name || "Cliente"
    }))
    .filter(recipient => recipient.phoneE164.length > 0);

  if (recipients.length === 0) {
    throw new AppError("Los leads seleccionados no tienen telefono valido", 400);
  }

  const campaign = await CreateCampaignService({
    name:
      name?.trim() ||
      `Seguimiento comercial ${new Date().toLocaleDateString("es-EC")}`,
    messageBody,
    senderMode,
    senderId: senderId || undefined,
    ratePerMin: ratePerMin || undefined,
    scheduleAt: scheduleAt || null
  });

  const recipientsImported = await ImportRecipientsService(
    campaign.id,
    recipients
  );

  const followUpAt = scheduleAt ? new Date(scheduleAt) : new Date();
  const [leadsUpdated] = await CommercialLead.update(
    {
      status: "FOLLOW_UP",
      nextActionAt: followUpAt,
      lastContactAt: new Date()
    },
    {
      where: { id: { [Op.in]: leads.map(lead => lead.id) } }
    }
  );

  const readyCampaign = markReady
    ? await ReadyCampaignService(campaign.id)
    : campaign;

  return {
    campaign: readyCampaign,
    recipientsImported,
    leadsUpdated
  };
};

export default CreateCommercialFollowUpCampaignService;
