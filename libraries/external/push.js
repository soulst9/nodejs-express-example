const got = require("got");
const { env } = require("../../config/env");

const EVN_TAG = {
  local: "[로컬]",
  development: "[개발]",
  staging: "[스테이징]",
  production: "",
};

const sendMessageByToken = (message) => {
  const pushBaseUrl = env.push.baseUrl;

  console.log(pushBaseUrl);
  return got
    .post(`${pushBaseUrl}/messages/token`, {
      headers: {
        // Authorization:
        //   "Basic " + Buffer.from(env.toss.secretKey + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      json: {
        ...message,
      },
      responseType: "json",
      timeout: 5000,
    })
    .then((response) => response.body)
    .catch((error) => {
      console.log("[push] sendMessageByToken:", message);
      console.log("[push] errorBody:", error.response?.body);
      error.status = 400;
      error.message = error.response?.body;
      throw error;
    });
};
exports.sendMessageByToken = sendMessageByToken;

exports.sendMessageMulticastReq = async ({
  userIds,
  data,
  notification,
  message,
}) => {
  const pushBaseUrl = env.push.baseUrl;
  return got
    .post(`${pushBaseUrl}/messages/registrationIds`, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(env.toss.secretKey + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      json: {
        userIds,
        data,
        notification,
        message,
      },
      responseType: "json",
    })
    .then((response) => response.body)
    .catch(async (error) => {
      console.log("[push] sendMessageMulticastReq:", message);
      console.log("[push] errorBody:", error.response?.body);
      error.status = 400;
      error.message = error.response?.body;
    });
};

exports.sendMessageByTopic = async (message) => {
  const pushBaseUrl = env.push.baseUrl;
  return got
    .post(`${pushBaseUrl}/messages/topic`, {
      headers: {
        Authorization:
          "Basic " + Buffer.from(env.toss.secretKey + ":").toString("base64"),
        "Content-Type": "application/json",
      },
      json: {
        message,
      },
      responseType: "json",
    })
    .then((response) => response.body)
    .catch(async (error) => {
      console.log("[push] sendMessageByTopic:", message);
      console.log("[push] errorBody:", error.response?.body);
      error.status = 400;
      error.message = error.response?.body;
      throw error;
    });
};

exports.sendMessageToken = async ({ title, body, data, userId }) => {
  // token 전달
  try {
    const pushResult = await sendMessageByToken({
      notification: {
        title: `${EVN_TAG[process.env.NODE_ENV]}${title}`,
        body,
      },
      data,
      userId,
    });
    console.log("sendMessageToken:", pushResult);
    return { result: pushResult };
  } catch (error) {
    console.log(error);
    return { error };
  }
};
