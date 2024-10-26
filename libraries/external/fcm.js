const axios = require("axios");
const { env } = require("../../config/env");

function request(options) {
  return axios(options)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
}

exports.updateFcmToken = async (userId, token) => {
  console.log(env.push.baseUrl);

  const options = {
    headers: {},
    method: "POST",
    baseURL: `${env.push.baseUrl}`,
    url: `/tokens`,
    data: {
      userId,
      token,
    },
  };

  return await request(options);
};
