"use strict";

const { bizCategory } = require("../../db/models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const count = await bizCategory.count();
      if (count === 0) {
        await bizCategory.bulkCreate([
          {
            id: "F",
            name: "건설업",
          },
          {
            id: "G",
            name: "도, 소매업",
          },
          {
            id: "I",
            name: "숙박, 음식점업",
          },
          {
            id: "Y",
            name: "서비스업",
          },
          {
            id: "Z",
            name: "기타",
          },
        ]);
      }
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
