import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    const dialect = queryInterface.sequelize.getDialect();
    const schedulesType =
      dialect === "postgres" ? DataTypes.JSONB : DataTypes.JSON;

    return Promise.all([
      queryInterface.addColumn("Queues", "schedules", {
        type: schedulesType,
        defaultValue: []
      }),
      queryInterface.addColumn("Queues", "outOfHoursMessage", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Queues", "schedules"),
      queryInterface.removeColumn("Queues", "outOfHoursMessage")
    ]);
  }
};
