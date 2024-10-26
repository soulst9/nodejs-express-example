"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("paystub", "isLessThanFive", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: "상시 근로자 수 5인 미만 여부 (true: 5인 미만, false: 5인 이상)",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
