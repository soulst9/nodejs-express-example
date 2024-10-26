const _ = require("lodash");
const Helper = require("../libraries/helper");
const createError = require("http-errors");
const CommonError = require("../libraries/error/common_error");

// model: sequelize model
// 검증 제외 필드: excludeFields
exports.validateModelRequiredFields = (model, excludeFields) => {
  return function (req, res, next) {
    // 타입 검증
    if (!_.isObject(req.body) || !_.isObject(model)) {
      throw createError(500, CommonError.INTERNAL_SERVER_ERROR);
    }

    // http POST method에서만 동작
    if (!Helper.equalsIgnoreCase(req.method, "post")) {
      throw createError(405, CommonError.METHOD_NOT_ALLOWED);
    }

    const modelAttributes = model.rawAttributes;
    const missingParams = [];

    // params, body의 합
    const requestParams = Object.assign({}, req.params, req.body);

    for (const [key, attribute] of Object.entries(modelAttributes)) {
      if (excludeFields.includes(key)) {
        continue; // 제외할 필드면 검증을 건너뜁니다.
      }

      const isRequiredAndNotAutoIncrement =
        attribute.allowNull === false && attribute.autoIncrement !== true;
      const isMissing = requestParams[key] === undefined;

      // 필수이면서 자동 증가가 아닌 컬럼이 requestParams에 누락된 경우,
      // missingParams 배열에 추가합니다.
      if (isRequiredAndNotAutoIncrement && isMissing) {
        missingParams.push(key);
      }
    }

    console.log("missingParams:", missingParams);
    if (missingParams.length > 0) {
      throw createError(400, CommonError.MISSING_REQUIRED_PARAMETERS);
    }

    next();
  };
};
