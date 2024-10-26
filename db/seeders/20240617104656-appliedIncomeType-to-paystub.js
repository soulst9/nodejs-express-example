"use strict";

const path = require("path");
// const { Op } = require("sequelize");
const {
  sequelize,
  SequelizeSeedMeta,
  paystub,
  tbl_contract_detail,
  SelectedOptions,
} = require("../models");

console.log(
  "SequelizeSeedMetaSequelizeSeedMetaSequelizeSeedMeta",
  SequelizeSeedMeta
);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 자신의 파일이름 가져오기

    try {
      const fileName = path.basename(__filename);
      console.log("fileName:", fileName);
      const exists = await SequelizeSeedMeta.findOne({
        where: {
          name: fileName,
        },
      });

      if (!exists) {
        await sequelize.transaction(async (t) => {
          const employeIncome = await SelectedOptions.findOne({
            where: {
              key: "employee_income",
            },
            raw: true,
          });

          const pensionOption = await SelectedOptions.findOne({
            where: {
              key: "pension",
            },
            raw: true,
          });
          const healthOption = await SelectedOptions.findOne({
            where: {
              key: "healthIns",
            },
            raw: true,
          });
          const employmentOption = await SelectedOptions.findOne({
            where: {
              key: "employmentIns",
            },
            raw: true,
          });
          const compenOption = await SelectedOptions.findOne({
            where: {
              key: "compensationIns",
            },
            raw: true,
          });

          const { rows } = await paystub.findAndCountAll({
            where: {
              appliedIncomeType: null,
            },
            raw: true,
          });

          for (const row of rows) {
            const { employeeId, result, contractNo } = row;
            const contract = await tbl_contract_detail.findOne({
              where: {
                contractno: contractNo,
              },
            });

            if (!contract) {
              continue;
            }

            const appliedIncomeType = {
              parentOption: employeIncome.id,
              selectedOptions: [],
            };

            const {
              pension: c_pension,
              health: c_health,
              employment: c_employment,
              accident: c_accident,
            } = contract;
            const {
              pension: p_pension,
              healthIns: p_health,
              employmentIns: p_employment,
            } = result;

            if (c_pension == 1 || p_pension > 0) {
              appliedIncomeType.selectedOptions.push(pensionOption.id);
            }

            if (c_health == 1 || p_health > 0) {
              appliedIncomeType.selectedOptions.push(healthOption.id);
            }

            if (c_employment == 1 || p_employment > 0) {
              appliedIncomeType.selectedOptions.push(employmentOption.id);
            }

            if (c_accident == 1) {
              appliedIncomeType.selectedOptions.push(compenOption.id);
            }

            console.log(
              "appliedIncomeType",
              employeeId,
              contractNo,
              appliedIncomeType
            );

            await paystub.update(
              {
                appliedIncomeType,
              },
              {
                where: {
                  employeeId,
                },
              }
            );
          }

          // SeedMeta에 기록
          await SequelizeSeedMeta.create({
            name: fileName,
          });
        });
      }
    } catch (error) {
      console.error("error", error);
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
