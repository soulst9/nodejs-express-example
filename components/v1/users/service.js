const {
  sequelize,
  tbl_user,
  tbl_user_detail,
  tbl_pw,
  tbl_login,
  AdminBusinessAccess,
} = require("../../../db/models");
const error = require("./error");
const _ = require("lodash");
const createError = require("http-errors");
const dayjs = require("../../../libraries/day");

const { userType } = require("../../../config/constants");
const { ADMIN, EMPLOYER } = userType;

const EnterpriseService = require("../enterprises/service");
const Helper = require("../../../libraries/helper");

const findAndThrow = async (userId) => {
  const userOne = await tbl_user.findOne({
    include: [
      {
        model: tbl_user_detail,
      },
    ],
    where: {
      userID: userId,
    },
    raw: true,
    nest: true,
  });

  if (!userOne) {
    throw createError(404, error.NOT_EXIST_USER);
  }

  return {
    ..._.pick(userOne, [
      "userID",
      "usertype",
      "usercode",
      "salesReferCode",
      "isVirtualUser",
    ]),
    ...userOne["tbl_user_detail"],
  };
};

exports.signin = async ({ userID, password, os, appVersion }) => {
  const userOne = await findAndThrow(userID);

  const pw = await tbl_pw.findOne({ where: { userID } });
  if (!pw.comparePassword(password)) {
    throw createError(400, error.DO_NOT_MATCH_PASSWORD);
  }

  const { usertype } = userOne;
  if ([ADMIN, EMPLOYER].includes(usertype.toString()) === false) {
    throw createError(404, error.UNAUTHORIZED_ACCESS_EMPLOYER_ONLY);
  }

  const { userID: userId, tel, username, thumbnail } = userOne;
  // 4. get enterprise information
  let enterprises = [];
  if (usertype == EMPLOYER) {
    const allEnterprises = await EnterpriseService.getAllEntperprisesByUserId(
      userId
    );
    enterprises = [...allEnterprises.map((item) => item.enterprise)];
  } else if (usertype == ADMIN) {
    const allEnterprises = await AdminBusinessAccess.findAll({
      where: { adminID: userId },
    });
    enterprises = [...allEnterprises.map((item) => item.enterprise)];
  }

  // 4. generate jwt token
  const newLoginCode = Helper.generateToken(
    {
      userId,
      username,
      usertype,
      phone: tel,
      enterprises,
    },
    "365d"
  );

  // 5. sign in 이력 저장
  const now = dayjs().format("YYYY-MM-DD HH:mm:ss");
  await sequelize.transaction(async (t) => {
    // 로그인 기록 업데이트 또는 삽입
    const [loginRecord, created] = await tbl_login.upsert(
      {
        userID: userId,
        phone: tel,
        // logincode: newLoginCode,
        lastlogindate: now,
        os,
        appVersion,
      },
      { transaction: t, returning: true }
    );

    // 로그인 횟수 증가
    console.log("loginRecord:", loginRecord, created);
    if (loginRecord) {
      await tbl_login.update(
        { loginCount: sequelize.literal("loginCount + 1") },
        { where: { userID: userId } }
      );
    }

    // 사용자 활성화 업데이트
    await tbl_user.update({ isActive: true }, { where: { userID: userId } });
  });

  return {
    user_name: username,
    user_img: thumbnail,
    usertype,
    last_login_date: now,
    logincode: newLoginCode,
  };
};

exports.updateEmployeeInfo = async (userInfo, obj) => {
  const { userID, isVirtualUser } = userInfo;

  if (!isVirtualUser) {
    throw createError(400, error.EMPLOYEE_LINK_COMPLETED_EDITING_NOT_ALLOWED);
  }

  const updatedEmployee = await tbl_user_detail.update(obj, {
    where: { userID },
  });

  if (updatedEmployee[0] === 0) {
    throw createError(404, "Employee not found");
  }

  // 업데이트된 직원 정보 조회
  const employee = await tbl_user_detail.findByPk(userID);
  return employee;
};
