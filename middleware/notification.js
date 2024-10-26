const dayjs = require("../libraries/day");
const { telegram } = require("../libraries/external");
const rTracer = require("cls-rtracer");

const SECURITY_BODY = ["/users/login"];

module.exports = function notification(req, res, next) {
  res.on("finish", async () => {
    const startTime = req._startTime;
    const endTime = new Date();
    const accessInfo = {
      transactionId: rTracer.id(),
      statusCode: res.statusCode,
      startTime: startTime,
      endTime: endTime,
      processSecTime: `${dayjs(endTime).diff(
        dayjs(startTime),
        "second",
        false
      )} seconds`,
      method: req.method,
      url: req.url,
      body: SECURITY_BODY.includes(req.url)
        ? "This is information that needs to be secured."
        : req.body,
      error: {
        stack: res.statusCode === 500 ? res.error?.stack : {},
      },
    };

    if (
      process.env.NODE_ENV === "local" ||
      process.env.NODE_ENV === "development"
    ) {
      console.log(`                                             `);
      console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
      console.log(
        `               [${accessInfo.statusCode}] start log               `
      );
      console.log(accessInfo);
      console.log(
        `               [${accessInfo.statusCode}] end log                 `
      );
      console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
      console.log(`                                             `);
    }

    if (
      process.env.NODE_ENV === "staging" ||
      process.env.NODE_ENV === "production"
    ) {
      if (accessInfo.processSecTime > 3) {
        const notiMessage = {
          systemName: process.env.SYSTEM_NAME,
          statuCode: accessInfo.statusCode,
          reason: "Process time exceeding 3 seconds.",
          accessInfo,
        };

        telegram.sendMessage(notiMessage);
      } else if (res.statusCode === 500) {
        const notiMessage = {
          systemName: process.env.SYSTEM_NAME,
          statuCode: accessInfo.statusCode,
          message: res.error.message,
          reason: "System failure has occurred.",
          accessInfo,
        };
        telegram.sendMessage(notiMessage);
        telegram.sendMessage(res.error.stack);
      }
    }
  });
  next();
};
