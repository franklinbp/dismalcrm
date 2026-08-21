import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const dialect = queryInterface.sequelize.getDialect();
    const safe = async (fn: () => Promise<unknown>) => {
      try {
        await fn();
      } catch (_err) {
        // Ignore when constraint/column state already matches.
      }
    };

    const table = await queryInterface.describeTable("Settings");

    await queryInterface.bulkDelete("Settings", {});
    await safe(async () => {
      if (dialect === "mysql" || dialect === "mariadb") {
        await queryInterface.sequelize.query(
          "ALTER TABLE `Settings` DROP PRIMARY KEY;"
        );
        return;
      }

      await queryInterface.removeConstraint("Settings", "Settings_pkey");
    });

    if (!table.id) {
      await queryInterface.addColumn("Settings", "id", {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    const dialect = queryInterface.sequelize.getDialect();
    const safe = async (fn: () => Promise<unknown>) => {
      try {
        await fn();
      } catch (_err) {
        // Ignore when constraint/column state already matches.
      }
    };

    const table = await queryInterface.describeTable("Settings");

    await queryInterface.bulkDelete("Settings", {});

    if (table.id) {
      await safe(() => queryInterface.removeColumn("Settings", "id"));
    }

    await safe(async () => {
      if (dialect === "mysql" || dialect === "mariadb") {
        await queryInterface.sequelize.query(
          "ALTER TABLE `Settings` ADD PRIMARY KEY (`key`);"
        );
        return;
      }

      await queryInterface.addConstraint("Settings", ["key"], {
        type: "primary key",
        name: "Settings_pkey"
      });
    });
  }
};
