"use strict";

const path = require("path");
const { Op } = require("sequelize");
const {
  sequelize,
  SequelizeSeedMeta,
  // SettingCategories,
  // DefaultEnterpriseSettings,
  SelectedOptions,
  OptionRelationships,
} = require("../models");
const { settingType } = require("../../config/constants");
const { raw } = require("body-parser");
const { SELECTED } = settingType;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 자신의 파일이름 가져오기
    const fileName = path.basename(__filename);
    const exists = await SequelizeSeedMeta.findOne({
      where: {
        name: fileName,
      },
    });

    if (!exists) {
      await sequelize.transaction(async (t) => {
        const parentOption = await SelectedOptions.findOne({
          where: {
            key: "employee_income",
          },
        });

        const childOptions = await SelectedOptions.findAll({
          where: {
            key: {
              [Op.in]: [
                "pension",
                "healthIns",
                "employmentIns",
                "compensationIns",
              ],
            },
          },
          raw: true,
        });

        const items = childOptions.map((item) => ({
          parentOptionId: parentOption.id,
          childOptionId: item.id,
          depth: 2,
        }));

        // 옵션 관계 생성
        await OptionRelationships.bulkCreate(items);

        // SeedMeta에 기록
        await SequelizeSeedMeta.create({
          name: fileName,
        });
      });
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
