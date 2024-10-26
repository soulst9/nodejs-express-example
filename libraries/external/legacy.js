const axios = require("axios");
const { env } = require("../../config/env");

function request(options) {
  return axios(options)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
}

exports.getPaystubByUser = async (bodyJson, timeout) => {
  console.log(`${env.legacy.baseUrl}/entpr/payinfo`, bodyJson);
  const options = {
    url: `${env.legacy.baseUrl}/entpr/payinfo`,
    method: "post",
    timeout,
    headers: {
      "x-access-token": env.legacy.accessToken,
    },
    data: {
      ...bodyJson,
    },
  };

  return await request(options);
};

exports.sendAuthCode = async (phone) => {
  const options = {
    url: `${env.legacy.baseUrl}/auth/send`,
    method: "post",
    timeout: 3000,
    data: {
      phone,
    },
  };

  return await request(options);
};
