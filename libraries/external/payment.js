const axios = require("axios");
const { env } = require("../../config/env");

function request(options) {
  return axios(options)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
}

const getSubscribeStatus = async (enterprise) => {
  const options = {
    url: `${env.payment.baseUrl}/subscribes/enterprise/${enterprise}/status`,
    method: "get",
    headers: {
      "x-access-token": env.payment.accessToken,
    },
  };

  return await request(options);
};
exports.getSubscribeStatus = getSubscribeStatus;

exports.startSubscribe = async (enterprise, userId) => {
  const options = {
    url: `${env.payment.baseUrl}/subscribes/basic`,
    method: "post",
    headers: {
      "x-access-token": env.payment.accessToken,
    },
    data: {
      enterprise,
      userId,
    },
  };

  return await request(options);
};

exports.getProducts = async () => {
  const options = {
    url: `${env.payment.baseUrl}/products`,
    method: "get",
    headers: {
      "x-access-token": env.payment.accessToken,
    },
  };

  const res = await request(options);
  return res.data;
};

exports.getSubscribeEndAt = async (enterprise) => {
  const { data } = await getSubscribeStatus(enterprise);
  const { endAt } = data;
  return endAt;
};

const getMaxPaidUser = async (enterprise) => {
  const { data } = await getSubscribeStatus(enterprise);
  const { maxUserPaid = 0 } = data?.product ?? {};
  return maxUserPaid;
};

exports.isBasicGrade = async (enterprise) => {
  const maxPaidUser = await getMaxPaidUser(enterprise);
  if (maxPaidUser === 0) {
    return true;
  }

  return false;
};

exports.checkEnterpriseSubscription = async (enterprise) => {
  const subscribeStatus = await getSubscribeStatus(enterprise);

  return {
    subscribeStatus,
    basicGrade: subscribeStatus?.data?.product?.maxUserPaid === 0 ?? true,
  };
};
