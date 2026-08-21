import { Op } from "sequelize";
import Contact from "../../models/Contact";
import CommercialLead from "../../models/CommercialLead";
import CommercialLeadTask from "../../models/CommercialLeadTask";
import Ticket from "../../models/Ticket";

interface Request {
  searchParam?: string;
  status?: string;
  customerType?: string;
}

const ListCommercialLeadsService = async ({
  searchParam = "",
  status,
  customerType
}: Request): Promise<CommercialLead[]> => {
  const whereCondition: any = {};

  if (status) {
    whereCondition.status = status;
  }

  if (customerType) {
    whereCondition.customerType = customerType;
  }

  const contactWhere = searchParam
    ? {
        [Op.or]: [
          { name: { [Op.like]: `%${searchParam}%` } },
          { number: { [Op.like]: `%${searchParam}%` } },
          { email: { [Op.like]: `%${searchParam}%` } }
        ]
      }
    : undefined;

  const leads = await CommercialLead.findAll({
    where: whereCondition,
    include: [
      {
        model: Contact,
        as: "contact",
        where: contactWhere,
        required: Boolean(searchParam)
      },
      { model: Ticket, as: "ticket" },
      {
        model: CommercialLeadTask,
        as: "tasks",
        required: false,
        where: { status: "PENDING" }
      }
    ],
    limit: 80,
    order: [
      ["updatedAt", "DESC"],
      [{ model: CommercialLeadTask, as: "tasks" }, "dueAt", "ASC"]
    ]
  });

  return leads;
};

export default ListCommercialLeadsService;
