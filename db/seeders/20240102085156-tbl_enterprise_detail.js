"use strict";

const { tbl_enterprise_detail } = require("../../db/models");
const { count } = require("../../mongo/models/GPSOffice");

// businesscategory를 majorCategory로 옮기는 작업
const majorCategory = (businesscategory) => {
  switch (businesscategory) {
    case "A00006": // 건설업
      return "F";
    case "A00007": // 도, 소매업
      return "G";
    case "A00009": // 숙박, 음식점업
      return "I";
    case "A00013": // 서비스업
    case "A00014": // 서비스업
    case "A00015": // 서비스업
    case "A00016": // 서비스업
    case "A00017": // 서비스업
    case "A00018": // 서비스업
      return "Y";
    default: // 기타
      return "Z";
  }
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const { count, rows } = await tbl_enterprise_detail.findAndCountAll({
      where: { majorCategory: "" },
      raw: true,
    });
    console.log("count:", count);

    if (count > 0) {
      await Promise.all(
        rows.map(async (row) => {
          const { enterprise, businesscategory } = row;
          const updateData = {
            majorCategory: majorCategory(businesscategory),
          };
          console.log(enterprise, updateData);
          return tbl_enterprise_detail.update(updateData, {
            where: { enterprise },
          });
        })
      ).catch((error) => {
        console.error("업데이트 중 에러 발생:", error);
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
