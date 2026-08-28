import Company from "../../models/Company";
import Whatsapp from "../../models/Whatsapp";

const EnsureWhatsappCompanyService = async (
  whatsapp: Whatsapp
): Promise<Whatsapp> => {
  if (whatsapp.companyId) {
    return whatsapp;
  }

  const companies = await Company.findAll({
    attributes: ["id"],
    limit: 2,
    order: [["id", "ASC"]]
  });

  if (companies.length !== 1) {
    return whatsapp;
  }

  await whatsapp.update({ companyId: companies[0].id });
  await whatsapp.reload();

  return whatsapp;
};

export default EnsureWhatsappCompanyService;
