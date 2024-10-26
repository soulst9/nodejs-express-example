const { newEnforcer } = require("casbin");
const { SequelizeAdapter } = require("casbin-sequelize-adapter");
const path = require("path");
const { env } = require("../../config/env");
const MIGRATION_ENV = env.migration.env;
const config = require(__dirname + "/../../config/database.js")[MIGRATION_ENV];

let enforcer;

exports.setupCasbin = async () => {
  try {
    const adapter = await SequelizeAdapter.newAdapter(config);

    const modelPath = path.resolve(__dirname, "casbin_model.conf");
    enforcer = await newEnforcer(modelPath, adapter);

    await enforcer.addGroupingPolicy("saladyuser3", "manager");
    const ss = await enforcer.addPolicy("manager", "/v2/users/me", "GET");
    console.log("ss: =============>", ss);
  } catch (error) {
    new Error(error);
  }
};

exports.middlewareCasbin = async (req, res, next) => {
  try {
    const { userId } = req.decoded;
    const { method, path } = req;

    const hasPermission = await enforcer.enforce(userId, path, method);
    console.log("hasPermission:", hasPermission);
    if (!hasPermission) {
      return res.status(403).json({
        message: "You don't have permission to access this resource",
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
