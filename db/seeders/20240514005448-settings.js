"use strict";

const {
  sequelize,
  SequelizeSeedMeta,
  SettingCategories,
  DefaultEnterpriseSettings,
} = require("../../db/models");
const { settingType, commuteType } = require("../../config/constants");
const path = require("path");
const { create } = require("../../mongo/models/GPSOffice");
const { SWITCH, SELECTED } = settingType;
const { BOTH, QR, GPS } = commuteType;

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     */

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
          name: "work",
          title: "근무 설정",
          isActive: true,
        });

        const SettingBulk = await SettingCategories.bulkCreate(
          [
            {
              parentId: work.id,
              name: "mandatedBreakTime",
              title: "휴게시간",
              description:
                "· 4시간마다 30분의 휴게 시간이 자동으로 계산돼요.\n· 휴게 시간 변경은 직원 근무 내역에서 수정할 수 있어요.\n· 휴게 시간을 설정하지 않으면 기본 0분으로 설정돼요.",
              type: SWITCH,
              scope: "employee",
              isActive: true,
            },
            {
              parentId: work.id,
              name: "adjustCommuteTime",
              title: "출퇴근 시간 보정",
              description:
                "· 직원이 출퇴근 시간을 기록하면 자동으로 보정돼요.\n· 출퇴근 시간 보정은 직원이 출퇴근 시간을 기록할 때 자동으로 보정돼요.",
              type: SWITCH,
              scope: "enterprise",
              isActive: false,
            },
            {
              parentId: work.id,
              name: "autoApproveRequest",
              title: "요청 자동승인",
              description:
                "· 직원이 근무 변경 요청을 하면 자동으로 승인돼요.\n· 직원이 변경할 수 있는 근무 항목은 다음과 같습니다:    \n· 근무 시간 변경    \n· 근무 일자 변경    \n· 휴일 근무 신청    \n· 휴가 신청",
              type: SWITCH,
              scope: "enterprise",
              isActive: true,
            },
          ],
          { returning: true }
        );
        console.log("SettingBulk:", SettingBulk);

        await DefaultEnterpriseSettings.bulkCreate([
          {
            categoryId: SettingBulk[0].id,
            value: 1,
          },
          {
            categoryId: SettingBulk[1].id,
            value: 1,
          },
          {
            categoryId: SettingBulk[2].id,
            value: 0,
          },
        ]);

        const commute = await SettingCategories.create({
          name: "commute",
          title: "출퇴근 설정",
          isActive: false,
        });
        console.log("commute:", commute);

        const commuteType = await SettingCategories.bulkCreate(
          [
            {
              parentId: commute.id,
              name: "commuteType",
              title: "출퇴근 방법",
              description:
                "· 직원이 출퇴근을 기록할 때 사용할 수 있는 방법을 설정할 수 있어요.\n· 출퇴근 방법은 QR코드, GPS, 둘 다로 설정할 수 있어요.",
              type: SELECTED,
              selected: [BOTH, QR, GPS],
              scope: "enterprise",
              isActive: false,
            },
          ],
          { returning: true }
        );

        // DefaultEnterpriseSettings에 기본값 추가
        await DefaultEnterpriseSettings.bulkCreate([
          {
            categoryId: commuteType[0].id,
            value: BOTH,
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
