import { QueryInterface, DataTypes, Sequelize } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    const dialect = queryInterface.sequelize.getDialect();
    const defaultUuid =
      dialect === "postgres"
        ? Sequelize.literal("uuid_generate_v4()")
        : Sequelize.literal("UUID()");

    return Promise.all([
      queryInterface.addColumn("Tickets", "uuid", {
        type: DataTypes.UUID,
        allowNull: true,
        defaultValue: defaultUuid
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tickets", "uuid");
  }
};
