import { Op } from "sequelize";
import { startOfDay, endOfDay } from "date-fns";

import CommercialLead from "../../models/CommercialLead";
import CommercialLeadTask from "../../models/CommercialLeadTask";

const CommercialLeadStatsService = async () => {
  const todayStart = startOfDay(new Date());
  const todayEnd = endOfDay(new Date());

  const [today, followUp, wholesale, won, tasksToday] = await Promise.all([
    CommercialLead.count({
      where: { createdAt: { [Op.between]: [todayStart, todayEnd] } }
    }),
    CommercialLead.count({ where: { status: "FOLLOW_UP" } }),
    CommercialLead.count({ where: { customerType: "WHOLESALE" } }),
    CommercialLead.count({ where: { status: "WON" } }),
    CommercialLeadTask.count({
      where: {
        status: "PENDING",
        dueAt: { [Op.between]: [todayStart, todayEnd] }
      }
    })
  ]);

  return { today, followUp, wholesale, won, tasksToday };
};

export default CommercialLeadStatsService;
