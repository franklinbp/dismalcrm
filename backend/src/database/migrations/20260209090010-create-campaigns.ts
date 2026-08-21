import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("Campaigns", {
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
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "DRAFT"
      },
      messageBody: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      senderMode: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "SINGLE"
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Senders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      ratePerMin: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      scheduleAt: {
        type: DataTypes.DATE(6),
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
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("Campaigns");
  }
};
