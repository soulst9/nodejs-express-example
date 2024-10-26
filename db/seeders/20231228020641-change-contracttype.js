"use strict";

const { tbl_contract } = require("../../db/models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await tbl_contract.update(
        {
          contracttype: 3,
        },
        {
          where: {
            contracttype: 2,
          },
        }
      );
    } catch (error) {
      console.error(error);
    }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
