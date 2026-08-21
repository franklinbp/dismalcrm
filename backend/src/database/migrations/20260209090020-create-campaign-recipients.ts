import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("CampaignRecipients", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Campaigns", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      phoneE164: {
        type: DataTypes.STRING,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PENDING"
      },
      createdAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE(6),
        allowNull: false
      }
    });

    await queryInterface.addIndex("CampaignRecipients", ["campaignId", "phoneE164"], {
      unique: true,
      name: "campaign_recipients_unique_campaign_phone"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("CampaignRecipients");
  }
};
