import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn("CommercialLeads", "interest", {
      type: DataTypes.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn("CommercialLeads", "interest", {
      type: DataTypes.STRING,
      allowNull: true
    });
  }
};
