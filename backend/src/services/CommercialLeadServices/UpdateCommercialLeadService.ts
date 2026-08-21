import AppError from "../../errors/AppError";
import CommercialLead from "../../models/CommercialLead";

interface Request {
  leadId: string | number;
  data: {
    status?: string;
    customerType?: string;
    origin?: string;
    interest?: string;
    estimatedValue?: number;
    nextActionAt?: Date | string | null;
    notes?: string;
  };
}

const UpdateCommercialLeadService = async ({
  leadId,
  data
}: Request): Promise<CommercialLead> => {
  const lead = await CommercialLead.findByPk(leadId);

  if (!lead) {
    throw new AppError("Lead comercial no encontrado", 404);
  }

  await lead.update(data);
  await lead.reload({ include: ["contact", "ticket", "tasks"] });

  return lead;
};

export default UpdateCommercialLeadService;
