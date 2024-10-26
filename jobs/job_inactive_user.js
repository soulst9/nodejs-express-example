const { sequelize, tbl_login, tbl_user } = require("../db/models");

const { Op } = require("sequelize");

exports.change = async () => {
  const threeMonthsAgo = sequelize.literal("CURRENT_DATE - INTERVAL 3 MONTH");

  await sequelize.transaction(async (t) => {
    const inactiveUsers = await tbl_login.findAll({
      attributes: ["userID"],
      include: [
        {
          model: tbl_user,
          where: { isActive: true },
        },
      ],
      where: {
        lastlogindate: { [Op.lt]: threeMonthsAgo },
      },
      raw: true,
    });

    const userIDs = inactiveUsers.map((user) => user.userID);
    console.log("userIDs:", userIDs);

    if (userIDs.length > 0) {
      await tbl_user.update(
        { isActive: false },
        { where: { userID: { [Op.in]: userIDs } } }
      );
    }
  });
};
