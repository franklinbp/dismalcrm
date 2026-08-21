import AppError from "../../errors/AppError";
import CommercialLead from "../../models/CommercialLead";
import CommercialLeadTask from "../../models/CommercialLeadTask";

interface Request {
  leadId: string | number;
  title: string;
  dueAt?: Date | string;
  priority?: string;
  notes?: string;
}

const CreateCommercialLeadTaskService = async ({
  leadId,
  title,
  dueAt,
  priority = "normal",
  notes
}: Request): Promise<CommercialLeadTask> => {
  const lead = await CommercialLead.findByPk(leadId);

  if (!lead) {
    throw new AppError("Lead comercial no encontrado", 404);
  }

  const task = await CommercialLeadTask.create({
    leadId: lead.id,
    companyId: lead.companyId,
    title,
    dueAt,
    priority,
    notes,
    status: "PENDING"
  });

  if (dueAt) {
    await lead.update({ nextActionAt: dueAt });
  }

  return task;
};

export default CreateCommercialLeadTaskService;
