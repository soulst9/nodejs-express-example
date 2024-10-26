/**
 * 환경 변수
 */
const env = {
  app: {
    port: process.env.API_SERVER_PORT,
    telegram: {
      token: process.env.TELEGRAM_TOKEN,
      chatId: process.env.TELEGRAM_CHAT_ID,
    },
    cryptoKey: process.env.CRYPTO_KEY,
    jwtKey: process.env.JWT_SECRET_KEY,
    jwtKeyforOpenLink: process.env.JWT_SECRET_KEY_OPENLINK,
    enterprise: {
      keep_delete: process.env.KEEP_DELETE_ENTERPRISE,
    },
    payClose: {
      perDaily: process.env.PER_DAILY,
    },
  },
  payment: {
    baseUrl: process.env.PAYMENT_DOMAIN,
    accessToken: process.env.PAYMENT_ACCESS_TOKEN,
  },
  push: {
    baseUrl: process.env.PUSH_DOMAIN,
  },
  storage: {
    baseUrl: process.env.STORAGE_DOMAIN,
    accessToken: process.env.STORAGE_ACCESS_TOKEN,
  },
  legacy: {
    baseUrl: process.env.LEGACY_DOMAIN,
    accessToken: process.env.LEGACY_ACCESS_TOKEN,
  },
  base: {
    baseUrl: process.env.EXTERNAL_BASE_DOMAIN,
    accessToken: process.env.BASE_ACCESS_TOKEN,
  },
  sms: {
    url: process.env.SMS_URL,
    key: process.env.SMS_KEY,
    id: process.env.SMS_ID,
    senderPhoneNumber: process.env.SMS_SENDER_PHONE_NUMBER,
  },
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_DATABASE,
    logging: process.env.DATABASE_LOGGING === "false" ? undefined : console.log,
    freezeTableName: true,
    pool: {
      max: 50,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
  migration: {
    env: process.env.MIGRATION_ENV || "operation",
    staging: {
      host: process.env.STAGING_DB_HOST || "",
      port: Number(process.env.STAGING_DB_PORT) || 3306,
      user: process.env.STAGING_DB_USER || "",
      name: process.env.STAGING_DB_DATABASE || "",
      pass: process.env.STAGING_DB_PASS || "",
    },
    production: {
      host: process.env.DEPLOY_DB_HOST || "",
      port: Number(process.env.DEPLOY_DB_PORT) || 3306,
      user: process.env.DEPLOY_DB_USER || "",
      name: process.env.DEPLOY_DB_DATABASE || "",
      pass: process.env.DEPLOY_DB_PASS || "",
    },
  },
  mongo: {
    mongoUrl: process.env.BASE_MONGO_URL,
  },
  product: {},
  naver: {
    geocodeUrl: process.env.GEOCODE_URL,
    geocodeApiId: process.env.GEOCODE_API_ID,
    geocodeApiKey: process.env.GEOCODE_API_KEY,
  },
  nps: {
    baseUrl: process.env.NPS_BASE_URL,
    serviceKey: process.env.NPS_SERVICE_KEY,
  },
};
exports.env = env;
