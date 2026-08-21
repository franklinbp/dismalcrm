import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Campaigns", "mediaUrl", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Campaigns", "mediaType", {
        type: DataTypes.STRING,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Campaigns", "mediaUrl"),
      queryInterface.removeColumn("Campaigns", "mediaType")
    ]);
  }
};
