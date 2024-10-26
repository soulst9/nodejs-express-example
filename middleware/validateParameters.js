const createError = require("http-errors");
const CommonError = require("../libraries/error/common_error");

exports.validateRequiredParameters = (requiredParams, requestParams) => {
  const missingParams = requiredParams.filter((param) => !requestParams[param]);
  console.log("missingParams:", missingParams);

  if (missingParams.length > 0) {
    throw createError(400, CommonError.MISSING_REQUIRED_PARAMETERS);
  }
};
