const Sequelize = require("sequelize");
const { decryptiv } = require("../../libraries/encrypt");
const { v4: uuidv4 } = require("uuid");
const { is } = require("indicative");
const { UNREGISTERED_EMPLOYEE } = require("../../config/constants").userType;

module.exports = function (sequelize, DataTypes) {
  const User = sequelize.define(
    "tbl_user",
    {
      userID: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
        comment: "로그인아이디",
      },
      usertype: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 1,
        comment: "회원유형(0:어드민,1:개인회원,2:기업회원,3:세무사)",
      },
      isVirtualUser: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "가상 사용자 여부",
      },
      usercode: {
        type: DataTypes.STRING(7),
        allowNull: false,
        comment: "식별코드",
      },
      joindate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.literal("CURRENT_TIMESTAMP"),
        comment: "가입일시",
      },
      editdate: {
        type: DataTypes.DATE,
        allowNull: false,
        comment: "5",
      },
      ftoken: {
        type: DataTypes.STRING(200),
        allowNull: true,
        comment: "Firebase Token",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "사용자 활성 상태",
      },
    },
    {
      sequelize,
      tableName: "tbl_user",
      timestamps: false,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [{ name: "userID" }],
        },
        {
          name: "usercode",
          using: "BTREE",
          fields: [{ name: "usercode" }],
        },
      ],
    }
  );

  User.associate = function (models) {
    models.tbl_user.hasMany(models.tbl_contract, {
      foreignKey: "employerID",
    });
    models.tbl_user.hasMany(models.tbl_contract, {
      foreignKey: "employeeID",
    });
    models.tbl_user.hasOne(models.tbl_user_detail, {
      foreignKey: "userID",
    });
    models.tbl_user.hasOne(models.tbl_user_backup, {
      foreignKey: "userID",
    });
    models.tbl_user.hasMany(models.tbl_auth_history, {
      foreignKey: "userID",
    });
    models.tbl_user.hasMany(models.tbl_enterprise, {
      foreignKey: "managerID",
    });
  };

  // // UNREGISTERED_EMPLOYEE의 경우 userID를 랜덤하게 생성
  // User.beforeCreate((user, options) => {
  //   console.log("beforeCreate:", user);
  //   // UNREGISTERED_EMPLOYEE의 경우 userID를 랜덤하게 생성
  //   if (user.usertype === UNREGISTERED_EMPLOYEE) {
  //     user.userID = uuidv4(); // 랜덤 userID 생성 함수 호출
  //   }
  // });

  /**
   * 개인정보 암호화/복화화는 v1.1에 배포하도록 결정
   */
  User.afterFind((user) => {
    user = Array.isArray(user) ? user : [user];
    const { tbl_user_detail } = user[0] || {};
    if (tbl_user_detail) {
      const { phoneNumber, referCode } = tbl_user_detail;
      if (phoneNumber) {
        if (!referCode) {
          throw new Error("To decrypt tel, attributes must contain referCode.");
        }

        user.map((one) => {
          one.tbl_user_detail.tel = decryptiv(
            one.tbl_user_detail.phoneNumber,
            one.tbl_user_detail.referCode
          );
          delete one.tbl_user_detail.referCode;
          delete one.tbl_user_detail.phoneNumber;
        });
      }
    }
  });

  return User;
};
