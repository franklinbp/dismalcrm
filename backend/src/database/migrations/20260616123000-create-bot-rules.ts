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
      "BotRules",
      "flowId",
      "BotRulesLegacy202604"
    );

    await queryInterface.createTable("BotRules", {
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
      name: {
        type: DataTypes.STRING,
        allowNull: false
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
      operand: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "CONTAINS"
      },
      keyword: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      responseText: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      attachmentsJson: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      buttonsJson: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      catalogJson: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      actionsJson: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      nextStepJson: {
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
      "BotRules",
      "bot_rules_company_id_active",
      ["companyId", "active"]
    );
    await addIndexIfMissing(
      queryInterface,
      "BotRules",
      "bot_rules_flow_id_priority",
      ["flowId", "priority"]
    );
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("BotRules");
  }
};
