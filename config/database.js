require("dotenv").config();
const { env } = require("../config/env");

const config = {
  operation: {
    host: env.database.host,
    username: env.database.user,
    password: env.database.pass,
    port: env.database.port,
    database: env.database.name,
    logging: env.database.logging,
    dialect: "mysql",
    timezone: "Asia/Seoul",
    freezeTableName: true,
    define: {
      freezeTableName: true,
    },
    dialectOptions: {
      charset: "utf8mb4",
      collate: "utf8mb4_unicode_ci",
      dateStrings: true,
      typeCast: true,
      options: {
        requestTimeout: 3000,
      },
    },
  },
  staging: {
    host: env.migration.staging.host,
    port: env.migration.staging.port,
    username: env.migration.staging.user,
    database: env.migration.staging.name,
    password: env.migration.staging.pass,
    dialect: "mysql",
  },
  production: {
    host: env.migration.production.host,
    port: env.migration.production.port,
    username: env.migration.production.user,
    database: env.migration.production.name,
    password: env.migration.production.pass,
    dialect: "mysql",
  },
};

module.exports = config;
