const CommonError = require("./common_error");

module.exports = function errorHandler(err, req, res, next) {
  console.error("handler", JSON.stringify(err));
  console.error("handler", err.statusCode);
  console.error("handler", err.message);

  if (res.headersSent) {
    return next(err);
  }

  console.log(req.path);
  console.log(req.url);

  // EJS 문법 오류 발생 시 404 페이지로 이동
  if (req.url.includes("webview")) {
    res.render("notfound");
    return;
  }

  const errorResponse = {
    name: err.name,
    status: err.status,
    message: err.message,
    path: req.path,
    status_code: "09",
    status_name: "오류",
  };

  if (!err.status) {
    switch (err.name) {
      // case "SequelizeValidationError":
      case "SequelizeUniqueConstraintError":
        errorResponse.status = 400;
        errorResponse.message = CommonError.CONFLICT;
        break;
      default:
        errorResponse.status = 500;
        errorResponse.message = CommonError.UNKNOWN;
        break;
    }
  }

  console.log(errorResponse);
  if (errorResponse.status) {
    res.status(errorResponse.status).send(errorResponse);
  } else {
    res.status(500).send("server error");
  }
};
