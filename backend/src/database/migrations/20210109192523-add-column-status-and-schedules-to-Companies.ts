import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const dialect = queryInterface.sequelize.getDialect();
    const schedulesType =
      dialect === "postgres" ? DataTypes.JSONB : DataTypes.JSON;
    const table = await queryInterface.describeTable("Companies");
    const tasks: Promise<unknown>[] = [];

    if (!table.status) {
      tasks.push(
        queryInterface.addColumn("Companies", "status", {
          type: DataTypes.BOOLEAN,
          defaultValue: true
        })
      );
    }

    if (!table.schedules) {
      tasks.push(
        queryInterface.addColumn("Companies", "schedules", {
          type: schedulesType,
          defaultValue: []
        })
      );
    }

    await Promise.all(tasks);
  },

  down: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("Companies");
    const tasks: Promise<unknown>[] = [];

    if (table.schedules) {
      tasks.push(queryInterface.removeColumn("Companies", "schedules"));
    }

    if (table.status) {
      tasks.push(queryInterface.removeColumn("Companies", "status"));
    }

    await Promise.all(tasks);
  }
};
