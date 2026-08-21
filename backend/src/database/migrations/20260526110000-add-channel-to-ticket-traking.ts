import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("TicketTraking", "channel", {
      type: DataTypes.TEXT,
      defaultValue: "whatsapp"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("TicketTraking", "channel");
  }
};
