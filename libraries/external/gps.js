const axios = require("axios");
const { env } = require("../../config/env");

function request(options) {
  return axios(options)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
}

exports.getCoordinateByAddress = async (address) => {
  const geocodeUrl = env.naver.geocodeUrl;
  const geocodeApiId = env.naver.geocodeApiId;
  const geocodeApiKey = env.naver.geocodeApiKey;

  const options = {
    headers: {
      "X-NCP-APIGW-API-KEY-ID": geocodeApiId,
      "X-NCP-APIGW-API-KEY": geocodeApiKey,
    },
    method: "GET",
    url: geocodeUrl,
    params: {
      query: address,
    },
  };

  console.log("options:", options);

  return await request(options);
};
