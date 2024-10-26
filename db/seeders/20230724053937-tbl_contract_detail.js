"use strict";
const { Op } = require("sequelize");
const {
  // sequelize,
  tbl_contract,
  tbl_contract_detail,
  tbl_user,
  tbl_user_detail,
} = require("../../db/models");
const { encryptiv, decryptiv } = require("../../libraries/encrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // tbl_user_detail에 암호화를 위한 referCode 생성
    // 첫 배포 시에만 임시로
    try {
      // await tbl_user_detail.update(
      //   {
      //     referCode: Sequelize.literal("SUBSTR(MD5(RAND()), 1, 10)"),
      //   },
      //   {
      //     where: {
      //       referCode: "",
      //     },
      //   }
      // );

      await tbl_contract_detail.update(
        {
          referCode: Sequelize.literal("SUBSTR(MD5(RAND()), 1, 10)"),
        },
        {
          where: {
            referCode: "",
          },
        }
      );

      // 개인정보 암호화/복화화는 v1.1에 배포하도록 결정

      // tbl_user_detail 개인 정보 암호화
      // const userAll = await tbl_user_detail.findAll({ raw: true });
      // await Promise.allSettled(
      //   userAll
      //     .filter(
      //       (user) => user.tel && user.tel.length >= 11 && user.tel.length <= 13
      //     )
      //     .map(async (user) => {
      //       const { userID, tel, referCode } = user;
      //       const encryptedText = encryptiv(tel.replaceAll("-", ""), referCode);

      //       console.log("encryptiv tel ==>", encryptedText, userID);
      //       return await tbl_user_detail.update(
      //         { phoneNumber: encryptedText },
      //         { where: { userID } }
      //       );
      //     })
      // );
      // 전화번호 복호화
      // await Promise.allSettled(
      //   userAll
      //     .filter((row) => {
      //       const { tel } = row;
      //       return tel !== null;
      //     })
      //     .map(async (row) => {
      //       const { tel, userID, referCode } = row;
      //       const decryptedText = decryptiv(tel, referCode);
      //       console.log("decryptiv =>", decryptedText, referCode, userID);
      //       return await tbl_user_detail.update(
      //         { phoneNumber: decryptedText },
      //         { where: { userID } }
      //       );
      //     })
      // );

      // tbl_contract_detail 개인 정보 암호화
      const { count, rows } = await tbl_contract.findAndCountAll({
        include: [
          {
            model: tbl_contract_detail,
            required: true,
            where: {
              [Op.or]: [{ registrationNumber: null }, { accountNumber: null }],
            },
          },
          // {
          //   model: tbl_user_detail,
          //   required: true,
          // },
        ],
        raw: true,
        nest: true,
      });

      console.log("==============================");
      console.log("findAndCountAll", count);
      console.log("==============================");

      if (count > 0) {
        // 암호화하기 이전에 생성된 주민등록번호 암호화 작업
        await Promise.allSettled(
          rows
            .filter((row) => {
              const { tbl_contract_detail } = row;
              const { jumin } = tbl_contract_detail;
              return jumin && jumin.length === 13; // 암호화 되지 않은 주민번호에 대해서만 filtering
            })
            .map(async (row) => {
              const { tbl_contract_detail: contract_detail } = row;
              const { jumin, referCode } = contract_detail;
              const encryptedText = encryptiv(jumin, referCode);
              console.log(
                "encryptiv jumin ==>",
                encryptedText,
                jumin,
                referCode,
                row.contractno
              );
              return await tbl_contract_detail.update(
                { registrationNumber: encryptedText },
                { where: { contractno: row.contractno } }
              );
            })
        );
        // 암호화하기 이전에 생성된 은행계좌번호 암호화 작업
        await Promise.allSettled(
          rows
            .filter((row) => {
              const { tbl_contract_detail } = row;
              const { depositnumber } = tbl_contract_detail;
              return (
                depositnumber &&
                depositnumber.replaceAll("-", "").length >= 10 &&
                depositnumber.replaceAll("-", "").length <= 14
              );
            })
            .map(async (row) => {
              const { tbl_contract_detail: contract_detail } = row;
              const { depositnumber, referCode } = contract_detail;
              const encryptedText = encryptiv(depositnumber, referCode);
              console.log(
                "encryptiv depositnumber ==>",
                encryptedText,
                depositnumber,
                referCode,
                row.contractno
              );
              return await tbl_contract_detail.update(
                { accountNumber: encryptedText },
                { where: { contractno: row.contractno } }
              );
            })
        );
      }
    } catch (error) {
      console.log("복호화 seed error", error);
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
