import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("OutboxMessages", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      campaignId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "Campaigns", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: "CampaignRecipients", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "Senders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      to: {
        type: DataTypes.STRING,
        allowNull: false
      },
      body: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "PENDING"
      },
      runAt: {
        type: DataTypes.DATE(6),
        allowNull: true
      },
      lockedAt: {
        type: DataTypes.DATE(6),
        allowNull: true
      },
      lockedBy: {
        type: DataTypes.STRING,
        allowNull: true
      },
      attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      providerMessageId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      lastError: {
        type: DataTypes.TEXT,
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

    await queryInterface.addIndex("OutboxMessages", ["campaignId", "recipientId"], {
      unique: true,
      name: "outbox_messages_unique_campaign_recipient"
    });

    await queryInterface.addIndex("OutboxMessages", ["status", "runAt"], {
      name: "outbox_messages_status_run_at"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("OutboxMessages");
  }
};
