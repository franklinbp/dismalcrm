import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("CommercialLeads", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      contactId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      ticketId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      channel: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "whatsapp"
      },
      origin: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "WhatsApp"
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "NEW"
      },
      customerType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "UNKNOWN"
      },
      interest: {
        type: DataTypes.STRING,
        allowNull: true
      },
      estimatedValue: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
      },
      nextActionAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      lastContactAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex("CommercialLeads", ["companyId", "status"]);
    await queryInterface.addIndex("CommercialLeads", ["companyId", "customerType"]);
    await queryInterface.addIndex("CommercialLeads", ["companyId", "nextActionAt"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("CommercialLeads");
  }
};
