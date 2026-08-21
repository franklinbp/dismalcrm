import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("CampaignClients", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tradeName: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phoneE164: {
        type: DataTypes.STRING,
        allowNull: false
      },
      countryCode: {
        type: DataTypes.STRING,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true
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

    await queryInterface.addIndex("CampaignClients", ["phoneE164"], {
      unique: true,
      name: "campaign_clients_unique_phone"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("CampaignClients");
  }
};
