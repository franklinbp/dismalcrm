import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const safe = async (fn: () => Promise<unknown>) => {
      try {
        await fn();
      } catch (_err) {
        // Ignore when constraint/index does not exist.
      }
    };

    await safe(() =>
      queryInterface.removeConstraint("Queues", "Queues_color_key")
    );
    await safe(() =>
      queryInterface.removeConstraint("Queues", "Queues_name_key")
    );
    await safe(() => queryInterface.removeIndex("Queues", "Queues_color_key"));
    await safe(() => queryInterface.removeIndex("Queues", "Queues_name_key"));
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addConstraint("Queues", ["color"], {
        name: "Queues_color_key",
        type: 'unique'
      }),
      queryInterface.addConstraint("Queues", ["name"], {
        name: "Queues_name_key",
        type: 'unique'
      }),
    ]);
  }
};
