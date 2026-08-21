import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("QuickAnswers", "mediaUrl", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn("QuickAnswers", "mediaType", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn("QuickAnswers", "mediaName", {
      type: DataTypes.TEXT,
      allowNull: true
    });

    await queryInterface.changeColumn("QuickAnswers", "message", {
      type: DataTypes.TEXT,
      allowNull: true
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.changeColumn("QuickAnswers", "message", {
      type: DataTypes.TEXT,
      allowNull: false
    });

    await queryInterface.removeColumn("QuickAnswers", "mediaName");
    await queryInterface.removeColumn("QuickAnswers", "mediaType");
    await queryInterface.removeColumn("QuickAnswers", "mediaUrl");
  }
};
