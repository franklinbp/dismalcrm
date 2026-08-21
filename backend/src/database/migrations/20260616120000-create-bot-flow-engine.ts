import { QueryInterface, DataTypes } from "sequelize";

const addIndexIfMissing = async (
  queryInterface: QueryInterface,
  tableName: string,
  indexName: string,
  fields: string[]
) => {
  const indexes = await queryInterface.showIndex(tableName);
  const exists = indexes.some(index => index.name === indexName);

  if (!exists) {
    await queryInterface.addIndex(tableName, fields, { name: indexName });
  }
};

const preserveLegacyTableIfIncompatible = async (
  queryInterface: QueryInterface,
  tableName: string,
  requiredColumn: string,
  legacyTableName: string
) => {
  const tables = (await queryInterface.showAllTables()) as string[];
  if (!tables.includes(tableName)) return;

  const columns = (await queryInterface.describeTable(tableName)) as Record<
    string,
    unknown
  >;
  if (columns[requiredColumn]) return;

  if (tables.includes(legacyTableName)) {
    throw new Error(
      `Cannot preserve ${tableName}: ${legacyTableName} already exists`
    );
  }

  await queryInterface.renameTable(tableName, legacyTableName);
};

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await preserveLegacyTableIfIncompatible(
      queryInterface,
      "BotExecutions",
      "flowId",
      "BotExecutionsLegacy202604"
    );

    await queryInterface.createTable("BotFlows", {
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
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      channel: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "all"
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
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

    await queryInterface.createTable("BotNodes", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      flowId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "BotFlows", key: "id" },
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
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "RESPONSE"
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false
      },
      positionX: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      positionY: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      configJson: {
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

    await queryInterface.createTable("BotConnections", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      flowId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "BotFlows", key: "id" },
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
      sourceNodeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "BotNodes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      targetNodeId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "BotNodes", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      conditionJson: {
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

    await queryInterface.createTable("BotExecutions", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      flowId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "BotFlows", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      ticketId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Tickets", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      contactId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      currentNodeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "BotNodes", key: "id" },
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
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "SIMULATED"
      },
      channel: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "simulator"
      },
      lastInput: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      lastOutput: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      metadataJson: {
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

    await addIndexIfMissing(
      queryInterface,
      "BotFlows",
      "bot_flows_company_id_active",
      ["companyId", "active"]
    );
    await addIndexIfMissing(
      queryInterface,
      "BotFlows",
      "bot_flows_company_id_priority",
      ["companyId", "priority"]
    );
    await addIndexIfMissing(
      queryInterface,
      "BotNodes",
      "bot_nodes_flow_id_type",
      ["flowId", "type"]
    );
    await addIndexIfMissing(
      queryInterface,
      "BotConnections",
      "bot_connections_flow_id",
      ["flowId"]
    );
    await addIndexIfMissing(
      queryInterface,
      "BotExecutions",
      "bot_executions_company_id_status",
      ["companyId", "status"]
    );
    await addIndexIfMissing(
      queryInterface,
      "BotExecutions",
      "bot_executions_flow_id_created_at",
      ["flowId", "createdAt"]
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("BotExecutions");
    await queryInterface.dropTable("BotConnections");
    await queryInterface.dropTable("BotNodes");
    await queryInterface.dropTable("BotFlows");
  }
};
