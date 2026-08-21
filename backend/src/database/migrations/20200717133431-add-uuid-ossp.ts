import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== "postgres") {
      return;
    }

    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'
    );
  },

  down: async (queryInterface: QueryInterface) => {
    const dialect = queryInterface.sequelize.getDialect();
    if (dialect !== "postgres") {
      return;
    }

    await queryInterface.sequelize.query('DROP EXTENSION IF EXISTS "uuid-ossp"');
  }
};
