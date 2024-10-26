const TelegramBot = require("node-telegram-bot-api");
const { env } = require("../../config/env");

const bot = new TelegramBot(env.app.telegram.token, { polling: false });

// https://api.telegram.org/bot5666058797:AAEHshEKLDB0hRhSZ6Ju-YoMqGoJGUVjLDI/getUpdates

// {"ok":true,"result":[{"update_id":12779366,
// "message":{"message_id":1,"from":{"id":1802696137,"is_bot":false,"first_name":"\uc601\uc6b0","last_name":"\ud55c","language_code":"ko"},"chat":{"id":1802696137,"first_name":"\uc601\uc6b0","last_name":"\ud55c","type":"private"},"date":1662348512,"text":"/start","entities":[{"offset":0,"length":6,"type":"bot_command"}]}},{"update_id":12779367,
// "message":{"message_id":2,"from":{"id":1802696137,"is_bot":false,"first_name":"\uc601\uc6b0","last_name":"\ud55c","language_code":"ko"},"chat":{"id":1802696137,"first_name":"\uc601\uc6b0","last_name":"\ud55c","type":"private"},"date":1662348517,"text":"\u3147\u3147"}}]}

exports.sendMessage = function (message) {
  try {
    if (typeof message === "object") {
      message = JSON.stringify(message, null, 2);
    }

    bot.sendMessage(env.app.telegram.chatId, message.slice(0, 4096));
  } catch (err) {
    console.log("Error sending", err);
  }
};
