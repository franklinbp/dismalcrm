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
  fields: string[]
): Promise<void> => {
  const indexes = (await queryInterface.showIndex(
    tableName
  )) as IndexDescription[];

  if (!indexes.some(index => index.name === indexName)) {
    await queryInterface.addIndex(tableName, fields, { name: indexName });
  }
};

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await addColumnIfMissing(queryInterface, "CampaignClients", "source", {
      type: DataTypes.STRING,
      allowNull: true
    });

    await addColumnIfMissing(queryInterface, "CampaignClients", "segment", {
      type: DataTypes.STRING,
      allowNull: true
    });

    await addIndexIfMissing(
      queryInterface,
      "CampaignClients",
      "campaign_clients_country_source_segment",
      ["countryCode", "source", "segment"]
    );
  },

  down: async (): Promise<void> => {
    // Metadata is kept to avoid losing campaign segmentation history.
  }
};
