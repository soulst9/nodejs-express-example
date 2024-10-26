/**
 * 공공데이터포털에서 제공하는 데이터를 가져오는 라이브러리
 */
const axios = require("axios");
const { env } = require("../../config/env");

const { baseUrl, serviceKey } = env.nps;
console.log("baseUrl, serviceKey:", baseUrl, serviceKey);

function request(options) {
  return axios(options)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
}

exports.getEnterpriseFromNPS = async (wkpl_nm, bzowr_rgst_no) => {
  console.log("wkpl_nm, bzowr_rgst_no:", wkpl_nm, bzowr_rgst_no);

  const options = {
    headers: {},
    method: "GET",
    baseURL: baseUrl,
    timeout: 10 * 1000, // 10초
    url: `/B552015/NpsBplcInfoInqireService/getBassInfoSearch`,
    params: {
      serviceKey,
      wkpl_nm,
      bzowr_rgst_no,
      pageNo: 1,
    },
  };

  return await request(options);
};
