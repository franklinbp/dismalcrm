import { QueryInterface, QueryTypes, Transaction } from "sequelize";

type CompanyRow = { id: number };

const repairTicketsFromRelationships = async (
  queryInterface: QueryInterface,
  transaction: Transaction
): Promise<void> => {
  // Legacy rows may contain several null-company tickets for one contact.
  // Select one repair candidate to preserve the existing unique constraint.
  await queryInterface.sequelize.query(
    "CREATE TEMPORARY TABLE `tmp_ticket_company_repairs` (" +
      "  `ticketId` INT NOT NULL PRIMARY KEY," +
      "  `companyId` INT NOT NULL" +
      ") ENGINE=MEMORY",
    { transaction }
  );

  try {
    await queryInterface.sequelize.query(
      "INSERT INTO `tmp_ticket_company_repairs` (`ticketId`, `companyId`) " +
        "SELECT MAX(ticket.`id`) AS `ticketId`, " +
        "       COALESCE(whatsapp.`companyId`, contact.`companyId`) AS `companyId` " +
        "FROM `Tickets` AS ticket " +
        "LEFT JOIN `Whatsapps` AS whatsapp ON whatsapp.`id` = ticket.`whatsappId` " +
        "LEFT JOIN `Contacts` AS contact ON contact.`id` = ticket.`contactId` " +
        "LEFT JOIN `Tickets` AS existing " +
        "  ON existing.`contactId` = ticket.`contactId` " +
        " AND existing.`companyId` = COALESCE(whatsapp.`companyId`, contact.`companyId`) " +
        "WHERE ticket.`companyId` IS NULL " +
        "  AND COALESCE(whatsapp.`companyId`, contact.`companyId`) IS NOT NULL " +
        "  AND existing.`id` IS NULL " +
        "GROUP BY ticket.`contactId`, COALESCE(whatsapp.`companyId`, contact.`companyId`)",
      { transaction }
    );

    await queryInterface.sequelize.query(
      "UPDATE `Tickets` AS ticket " +
        "JOIN `tmp_ticket_company_repairs` AS repair " +
        "  ON repair.`ticketId` = ticket.`id` " +
        "SET ticket.`companyId` = repair.`companyId` " +
        "WHERE ticket.`companyId` IS NULL",
      { transaction }
    );
  } finally {
    await queryInterface.sequelize.query(
      "DROP TEMPORARY TABLE IF EXISTS `tmp_ticket_company_repairs`",
      { transaction }
    );
  }
};

const repairSingleCompanyRows = async (
  queryInterface: QueryInterface,
  transaction: Transaction
): Promise<void> => {
  const companies = (await queryInterface.sequelize.query(
    "SELECT `id` FROM `Companies` ORDER BY `id`",
    { transaction, type: QueryTypes.SELECT }
  )) as unknown as CompanyRow[];

  if (companies.length !== 1) return;

  const companyId = companies[0].id;
  for (const tableName of ["Whatsapps", "Contacts"]) {
    await queryInterface.sequelize.query(
      `UPDATE \`${tableName}\` SET \`companyId\` = :companyId ` +
        "WHERE `companyId` IS NULL",
      { replacements: { companyId }, transaction }
    );
  }
};

const repairMessageRows = async (
  queryInterface: QueryInterface,
  transaction: Transaction
): Promise<void> => {
  await queryInterface.sequelize.query(
    "UPDATE `Messages` AS message " +
      "JOIN `Tickets` AS ticket ON ticket.`id` = message.`ticketId` " +
      "SET message.`companyId` = ticket.`companyId` " +
      "WHERE message.`companyId` IS NULL " +
      "AND ticket.`companyId` IS NOT NULL",
    { transaction }
  );
};

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async transaction => {
      await queryInterface.sequelize.query(
        "UPDATE `Whatsapps` AS whatsapp " +
          "JOIN (" +
          "  SELECT `whatsappId`, MIN(`companyId`) AS `companyId` " +
          "  FROM `Tickets` " +
          "  WHERE `whatsappId` IS NOT NULL AND `companyId` IS NOT NULL " +
          "  GROUP BY `whatsappId` " +
          "  HAVING COUNT(DISTINCT `companyId`) = 1" +
          ") AS inferred ON inferred.`whatsappId` = whatsapp.`id` " +
          "SET whatsapp.`companyId` = inferred.`companyId` " +
          "WHERE whatsapp.`companyId` IS NULL",
        { transaction }
      );

      await queryInterface.sequelize.query(
        "UPDATE `Contacts` AS contact " +
          "JOIN (" +
          "  SELECT `contactId`, MIN(`companyId`) AS `companyId` " +
          "  FROM `Tickets` " +
          "  WHERE `contactId` IS NOT NULL AND `companyId` IS NOT NULL " +
          "  GROUP BY `contactId` " +
          "  HAVING COUNT(DISTINCT `companyId`) = 1" +
          ") AS inferred ON inferred.`contactId` = contact.`id` " +
          "SET contact.`companyId` = inferred.`companyId` " +
          "WHERE contact.`companyId` IS NULL",
        { transaction }
      );

      await repairSingleCompanyRows(queryInterface, transaction);
      await repairTicketsFromRelationships(queryInterface, transaction);
      await repairMessageRows(queryInterface, transaction);
    });
  },

  down: async (): Promise<void> => {
    // Data ownership repair is intentionally irreversible.
  }
};
