import { DataTypes, QueryInterface } from "sequelize";

type ColumnMap = Record<string, unknown>;
type IndexDescription = { name?: string };

const describe = async (
  queryInterface: QueryInterface,
  tableName: string
): Promise<ColumnMap> =>
  (await queryInterface.describeTable(tableName)) as ColumnMap;

const addColumnIfMissing = async (
  queryInterface: QueryInterface,
  tableName: string,
  columnName: string,
  definition: any
): Promise<void> => {
  const columns = await describe(queryInterface, tableName);
  if (!columns[columnName]) {
    await queryInterface.addColumn(tableName, columnName, definition);
  }
};

const addIndexIfMissing = async (
  queryInterface: QueryInterface,
  tableName: string,
  indexName: string,
  fields: string[],
  unique = false
): Promise<void> => {
  const indexes = (await queryInterface.showIndex(
    tableName
  )) as IndexDescription[];

  if (!indexes.some(index => index.name === indexName)) {
    await queryInterface.addIndex(tableName, fields, {
      name: indexName,
      unique
    });
  }
};

const addContactLookupIndexIfMissing = async (
  queryInterface: QueryInterface
): Promise<void> => {
  const indexName = "contacts_company_number_channel";
  const indexes = (await queryInterface.showIndex(
    "Contacts"
  )) as IndexDescription[];

  if (indexes.some(index => index.name === indexName)) return;

  // Contacts.channel is TEXT in legacy installations. Prefixes keep the
  // composite key below MariaDB's 3072-byte limit without rewriting data.
  await queryInterface.sequelize.query(
    `CREATE INDEX \`${indexName}\` ON \`Contacts\` ` +
      "(`companyId`, `number`(191), `channel`(32))"
  );
};

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await addColumnIfMissing(queryInterface, "BotFlows", "runtimeEnabled", {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await addColumnIfMissing(queryInterface, "BotExecutions", "messageId", {
      type: DataTypes.STRING,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, "BotExecutions", "ruleId", {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: "BotRules", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL"
    });
    await addColumnIfMissing(queryInterface, "BotExecutions", "attempts", {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    });
    await addColumnIfMissing(queryInterface, "BotExecutions", "errorMessage", {
      type: DataTypes.TEXT,
      allowNull: true
    });
    await addColumnIfMissing(queryInterface, "BotExecutions", "processedAt", {
      type: DataTypes.DATE,
      allowNull: true
    });

    await addIndexIfMissing(
      queryInterface,
      "BotFlows",
      "bot_flows_company_runtime",
      ["companyId", "active", "runtimeEnabled"]
    );
    await addIndexIfMissing(
      queryInterface,
      "BotExecutions",
      "bot_executions_message_unique",
      ["companyId", "channel", "messageId"],
      true
    );
    await addIndexIfMissing(
      queryInterface,
      "BotExecutions",
      "bot_executions_ticket_created_at",
      ["ticketId", "createdAt"]
    );
    await addContactLookupIndexIfMissing(queryInterface);
  },

  down: async (queryInterface: QueryInterface): Promise<void> => {
    const executionIndexes = (await queryInterface.showIndex(
      "BotExecutions"
    )) as IndexDescription[];
    const flowIndexes = (await queryInterface.showIndex(
      "BotFlows"
    )) as IndexDescription[];
    const contactIndexes = (await queryInterface.showIndex(
      "Contacts"
    )) as IndexDescription[];

    for (const indexName of [
      "bot_executions_message_unique",
      "bot_executions_ticket_created_at"
    ]) {
      if (executionIndexes.some(index => index.name === indexName)) {
        await queryInterface.removeIndex("BotExecutions", indexName);
      }
    }

    if (flowIndexes.some(index => index.name === "bot_flows_company_runtime")) {
      await queryInterface.removeIndex("BotFlows", "bot_flows_company_runtime");
    }
    if (
      contactIndexes.some(
        index => index.name === "contacts_company_number_channel"
      )
    ) {
      await queryInterface.removeIndex(
        "Contacts",
        "contacts_company_number_channel"
      );
    }

    const executionColumns = await describe(queryInterface, "BotExecutions");
    for (const columnName of [
      "processedAt",
      "errorMessage",
      "attempts",
      "ruleId",
      "messageId"
    ]) {
      if (executionColumns[columnName]) {
        await queryInterface.removeColumn("BotExecutions", columnName);
      }
    }

    const flowColumns = await describe(queryInterface, "BotFlows");
    if (flowColumns.runtimeEnabled) {
      await queryInterface.removeColumn("BotFlows", "runtimeEnabled");
    }
  }
};
