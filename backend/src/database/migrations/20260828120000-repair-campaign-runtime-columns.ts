import { DataTypes, QueryInterface, Transaction } from "sequelize";

type TableColumns = Record<string, unknown>;

const describeCampaigns = async (
  queryInterface: QueryInterface
): Promise<TableColumns> => {
  return (await queryInterface.describeTable("Campaigns")) as unknown as TableColumns;
};

const addColumnIfMissing = async (
  queryInterface: QueryInterface,
  transaction: Transaction,
  columns: TableColumns,
  columnName: string,
  definition: any
): Promise<void> => {
  if (columns[columnName]) return;

  await queryInterface.addColumn("Campaigns", columnName, definition, {
    transaction
  });

  columns[columnName] = definition;
};

module.exports = {
  up: async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.transaction(async transaction => {
      const columns = await describeCampaigns(queryInterface);

      await addColumnIfMissing(queryInterface, transaction, columns, "messageBody", {
        type: DataTypes.TEXT,
        allowNull: true
      });

      await addColumnIfMissing(queryInterface, transaction, columns, "mediaUrl", {
        type: DataTypes.TEXT,
        allowNull: true
      });

      await addColumnIfMissing(queryInterface, transaction, columns, "mediaType", {
        type: DataTypes.STRING,
        allowNull: true
      });

      await addColumnIfMissing(queryInterface, transaction, columns, "senderMode", {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "SINGLE"
      });

      await addColumnIfMissing(queryInterface, transaction, columns, "senderId", {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Senders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      });

      await addColumnIfMissing(queryInterface, transaction, columns, "ratePerMin", {
        type: DataTypes.INTEGER,
        allowNull: true
      });

      await addColumnIfMissing(queryInterface, transaction, columns, "scheduleAt", {
        type: DataTypes.DATE(6),
        allowNull: true
      });

      if (columns.messageBody && columns.message1) {
        await queryInterface.sequelize.query(
          "UPDATE `Campaigns` " +
            "SET `messageBody` = COALESCE(NULLIF(`messageBody`, ''), NULLIF(`message1`, ''), '') " +
            "WHERE `messageBody` IS NULL OR `messageBody` = ''",
          { transaction }
        );
      }

      if (columns.senderMode) {
        await queryInterface.sequelize.query(
          "UPDATE `Campaigns` SET `senderMode` = 'SINGLE' " +
            "WHERE `senderMode` IS NULL OR `senderMode` = ''",
          { transaction }
        );
      }

      if (columns.scheduleAt && columns.scheduledAt) {
        await queryInterface.sequelize.query(
          "UPDATE `Campaigns` SET `scheduleAt` = `scheduledAt` " +
            "WHERE `scheduleAt` IS NULL AND `scheduledAt` IS NOT NULL",
          { transaction }
        );
      }
    });
  },

  down: async (): Promise<void> => {
    // Compatibility columns are intentionally kept to avoid data loss.
  }
};
