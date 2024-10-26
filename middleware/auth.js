const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const CommonError = require("../libraries/error/common_error");
const url = require("url");
const Helper = require("../libraries/helper");
const micromatch = require("micromatch");
const { ADMIN } = require("../config/constants").userType;

const freePath = [
  {
    method: "POST",
    path: "/users",
  },
  {
    method: "POST",
    path: "/users/duplicate",
  },
  {
    method: "POST",
    path: "/users/login",
  },
  {
    method: "POST",
    path: "/v3/users/login",
  },
  {
    method: "GET",
    path: "/users/auth/email/verify/*",
  },
  {
    method: "POST",
    path: "/entpr/qrcode",
  },
  // {
  //   method: "POST",
  //   path: "/entpr/*/paystubs",
  // },
  // {
  //   method: "POST",
  //   path: "/entpr/*/finalPaystubs",
  // },
  // {
  //   method: "GET",
  //   path: "/entpr/*/payrolls/*/steps/1",
  // },
  {
    method: "GET",
    path: "/entpr/*/users/*/payrolls/*/steps/*",
  },
  {
    method: "POST",
    path: "/entpr/qrcode/auth",
  },
  {
    method: "POST",
    path: "/users/search",
  },
  {
    method: "GET",
    path: "/users/phone/*/send",
  },
  {
    method: "GET",
    path: "/survey/*",
  },
  {
    method: "POST",
    path: "/survey/*/answer",
  },
  {
    method: "POST",
    path: "/invites/kakao/callback",
  },
];

exports.authentication = async (req, res, next) => {
  console.log("authentication");
  try {
    if (isExcludeAuth(req.method, req.url)) {
      return next();
    }
    const token =
      req.query.token || req.body.token || req.headers["x-access-token"];
    console.log("verifyToken token: %s", token);
    if (!token) {
      next(createError(400, CommonError.BAD_REQUEST));
    } else {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          next(createError(401, CommonError.UNAUTHENTICATED));
        } else {
          req.decoded = decoded;
          req.decoded.userID = decoded.userID ?? decoded.userId;
          req.decoded.userId = decoded.userId ?? decoded.userID;
          next();
        }
      });
    }
  } catch (error) {
    next(createError(400, CommonError.BAD_REQUEST));
  }
};

/**
 * 외부 오픈된 링크를 위한 auth 검증
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
exports.authenticationOpenLink = async (req, res, next) => {
  console.log("authenticationOpenLink");
  try {
    const { token } = req.query;
    const { enterprise } = req.params;
    // const token = req.query.token;
    console.log("verifyToken token: %s", token);
    if (!token) {
      next(createError(400, CommonError.BAD_REQUEST));
    } else {
      jwt.verify(token, process.env.JWT_SECRET_KEY_OPENLINK, (err, decoded) => {
        if (err) {
          next(createError(401, CommonError.UNAUTHENTICATED));
        } else {
          // req.decoded = decoded;
          // const { enterprise }
          console.log("=====>", decoded.enterprise, enterprise);
          if (decoded.enterprise !== enterprise) {
            next(createError(403, CommonError.FORBIDDEN));
          } else {
            next();
          }
        }
      });
    }
  } catch (error) {
    next(createError(401, CommonError.BAD_REQUEST));
  }
};

exports.authorization = async (req, res, next) => {
  try {
    const { enterprises = [], system, usertype } = req.decoded;
    if (usertype == ADMIN || system === process.env.SYSTEM_NAME) {
      return next();
    }

    let enterprise;
    if (
      Helper.equalsIgnoreCase(req.method, "get") ||
      Helper.equalsIgnoreCase(req.method, "put") ||
      Helper.equalsIgnoreCase(req.method, "patch")
    ) {
      enterprise = req.params.enterprise;
    } else if (
      Helper.equalsIgnoreCase(req.method, "post") ||
      Helper.equalsIgnoreCase(req.method, "delete")
    ) {
      enterprise = req.body.enterprise || req.params.enterprise;
    }

    console.log("authorization", enterprises, enterprise);

    if (!enterprises.includes(enterprise)) {
      throw createError(403, CommonError.FORBIDDEN);
    }
    next();
  } catch (error) {
    console.log("authorization error", error);
    next(createError(401, CommonError.BAD_REQUEST));
  }
};

function isExcludeAuth(method, reqUrl) {
  console.log("🚀 ~ isExcludeAuth ~ reqUrl:", reqUrl);
  console.log("🚀 ~ isExcludeAuth ~ method:", method);
  let url_parse = url.parse(reqUrl, true);
  let pathname = url_parse.pathname;

  // console.log("isExcludeAuth", method, pathname);

  let include = false;
  freePath.forEach((key) => {
    if (
      Helper.equalsIgnoreCase(key.method, method) &&
      micromatch([pathname], [key.path]).length
    ) {
      include = true;
    }
  });

  if (include) {
    console.log(`exclude path: ${pathname}`);
  }
  return include;
}

exports.authentication_admin = async (req, res, next) => {
  console.log("authentication");
  try {
    if (isExcludeAuth(req.method, req.url)) {
      return next();
    }
    const token =
      req.query.token || req.body.token || req.headers["x-access-token"];
    console.log("verifyToken token: %s", token);
    if (!token) {
      next(createError(400, CommonError.BAD_REQUEST));
    } else {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
          next(createError(401, CommonError.UNAUTHENTICATED));
        } else {
          req.decoded = decoded;
          req.decoded.userID = decoded.userID ?? decoded.userId;
          req.decoded.userId = decoded.userId ?? decoded.userID;

          if (decoded.usertype == 0) {
            next();
          } else {
            next(createError(401, CommonError.IS_NOT_ADMIN));
          }
        }
      });
    }
  } catch (error) {
    next(createError(401, CommonError.BAD_REQUEST));
  }
};
