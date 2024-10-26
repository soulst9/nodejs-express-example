const telegram = require("./telegram");
const storageAPI = require("./storage");
const legacyAPI = require("./legacy");
const paymentAPI = require("./payment");
const pushAPI = require("./push");
const smsAPI = require("./sms");
module.exports = {
  telegram,
  storageAPI,
  legacyAPI,
  paymentAPI,
  pushAPI,
  smsAPI,
};
