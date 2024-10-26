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
        const work = await SettingCategories.create({
          name: "pay",
          title: "급여 설정",
          isActive: true,
        });

        console.log("work", work);

        const newSettings = await SettingCategories.create({
          parentId: work.id,
          name: "incomeType",
          title: "소득유형",
          description:
            "· 근로소득: 근로자가 사업주에게 근로를 제공하여 받는 소득 (4대보험)\n· 사업소득: 사업주가 사업을 행하여 얻는 소득 (3.3%)",
          type: SELECTED,
          scope: "employee",
          isActive: true,
        });

        console.log("newSettings", newSettings);

        // SelectedOptions에 기본값 추가
        await SelectedOptions.bulkCreate([
          {
            categoryId: newSettings.id,
            key: "employee_income",
            value: "근로소득",
            description: "근로자가 사업주에게 근로를 제공하여 받는 소득",
            alias: "사회보험",
            isChild: true,
          },
          {
            categoryId: newSettings.id,
            key: "business_income",
            value: "사업소득",
            description: "사업주가 사업을 행하여 얻는 소득",
            alias: "3.3%",
          },
          {
            categoryId: newSettings.id,
            key: "etc_income",
            value: "기타소득",
            description:
              "이자소득/배당소득/사업소득/근로소득/연금, 퇴직소득/양도소득 이외에 비반복적으로 발생하는 소득",
            alias: "8.8%",
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
