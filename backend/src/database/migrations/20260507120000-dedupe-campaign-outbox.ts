import { QueryInterface } from "sequelize";

const addIndexIfMissing = async (
  queryInterface: QueryInterface,
  tableName: string,
  indexName: string,
  fields: string[]
) => {
  const indexes = await queryInterface.showIndex(tableName);
  const exists = indexes.some(index => index.name === indexName);
  if (!exists) {
    await queryInterface.addIndex(tableName, fields, {
      unique: true,
      name: indexName
    });
  }
};

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query(`
      DELETE om1 FROM OutboxMessages om1
      INNER JOIN OutboxMessages om2
        ON om1.campaignId = om2.campaignId
       AND om1.recipientId = om2.recipientId
       AND om1.id > om2.id;
    `);

    await queryInterface.sequelize.query(`
      DELETE cr1 FROM CampaignRecipients cr1
      INNER JOIN CampaignRecipients cr2
        ON cr1.campaignId = cr2.campaignId
       AND cr1.phoneE164 = cr2.phoneE164
       AND cr1.id > cr2.id;
    `);

    await addIndexIfMissing(
      queryInterface,
      "CampaignRecipients",
      "campaign_recipients_unique_campaign_phone",
      ["campaignId", "phoneE164"]
    );

    await addIndexIfMissing(
      queryInterface,
      "OutboxMessages",
      "outbox_messages_unique_campaign_recipient",
      ["campaignId", "recipientId"]
    );
  },

  down: async () => {
    return Promise.resolve();
  }
};
