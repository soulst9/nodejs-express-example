"use strict";

const path = require("path");
const {
  sequelize,
  SequelizeSeedMeta,
  SettingCategories,
  DefaultEnterpriseSettings,
  SelectedOptions,
} = require("../../db/models");
const { settingType } = require("../../config/constants");
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
        const category = await SettingCategories.findOne({
          where: {
            name: "incomeType",
          },
        });

        // SelectedOptions에 기본값 추가
        await SelectedOptions.bulkCreate([
          {
            categoryId: null,
            key: "pension",
            value: "국민연금",
            description: `1개월 동안의 소정근로시간이 60시간 이상 근로자 가입 대상`,
            isMultiple: true,
            isActive: true,
            alias: "국민",
          },
          {
            categoryId: null,
            key: "healthIns",
            value: "건강보험",
            description: `1개월 동안의 소정근로시간이 60시간 이상 근로자 가입 대상`,
            isMultiple: true,
            isActive: true,
            alias: "건강",
          },
          {
            categoryId: null,
            key: "employmentIns",
            value: "고용보험",
            description: `1개월 동안의 소정근로시간이 60시간 이상 혹은 3개월 이상 근무 시 가입 대상`,
            isMultiple: true,
            isActive: true,
            alias: "고용",
          },
          {
            categoryId: null,
            key: "compensationIns",
            value: "산재보험",
            description: `단, 1일을 근무하더라도 가입 대상`,
            isMultiple: true,
            isActive: true,
            alias: "산재",
          },
        ]);

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
