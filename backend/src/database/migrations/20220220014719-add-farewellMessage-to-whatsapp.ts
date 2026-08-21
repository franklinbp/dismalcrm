import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("Whatsapps");
    if (table.farewellMessage) {
      return;
    }

    return queryInterface.addColumn("Whatsapps", "farewellMessage", {
      type: DataTypes.TEXT
    });
  },

  down: async (queryInterface: QueryInterface) => {
    const table = await queryInterface.describeTable("Whatsapps");
    if (!table.farewellMessage) {
      return;
    }

    return queryInterface.removeColumn("Whatsapps", "farewellMessage");
  }
};
