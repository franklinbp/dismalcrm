import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("CommercialLeadTasks", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      leadId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "CommercialLeads", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      dueAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PENDING"
      },
      priority: {
        type: DataTypes.STRING,
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

    await queryInterface.addIndex("CommercialLeadTasks", ["companyId", "status"]);
    await queryInterface.addIndex("CommercialLeadTasks", ["companyId", "dueAt"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("CommercialLeadTasks");
  }
};
