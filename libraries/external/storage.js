const axios = require("axios");
const fs = require("fs");
const { env } = require("../../config/env");

function request(options) {
  return axios(options)
    .then((res) => res.data)
    .catch((error) => {
      throw error;
    });
}

function requestPipe(options, res) {
  return axios(options).then((response) => {
    res.setHeader("Content-disposition", "attachment; filename=contracts.zip");
    response.data.pipe(res);
  });
}

exports.requestPayroll = async (bodyJson) => {
  const options = {
    // url: `${env.storage.baseUrl}/email/payroll/fullTimeWorker/monthly`,
    url: `${env.storage.baseUrl}/files/payroll/fullTimeWorker`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": env.storage.accessToken,
    },
    data: {
      ...bodyJson,
    },
  };

  return await request(options);
  // return result;
};

exports.requestPaystub = async (bodyJson) => {
  const options = {
    url: `${env.storage.baseUrl}/email/paystub/send`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": env.storage.accessToken,
    },
    data: {
      ...bodyJson,
    },
  };

  return await request(options);
  // return result;
};

exports.requestPayDocument = async (bodyJson) => {
  const options = {
    url: `${env.storage.baseUrl}/email/documents/send`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": env.storage.accessToken,
    },
    data: {
      ...bodyJson,
    },
  };

  return await request(options);
};

exports.createFileTimesheetReq = async (bodyJson) => {
  const options = {
    url: `${env.storage.baseUrl}/email/commutesheet/monthly`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": env.storage.accessToken,
    },
    data: {
      ...bodyJson,
    },
  };

  return await request(options);
};

exports.createFileDouzoneReq = async (enterprise, statsType, bodyJson) => {
  const options = {
    url: `${env.storage.baseUrl}/enterprises/${enterprise}/companies/douzone/statsTypes/${statsType}`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": env.storage.accessToken,
    },
    data: {
      ...bodyJson,
    },
  };

  return await request(options);
};

exports.fileDownloadS3 = async (enterprise, usercode, res) => {
  const options = {
    url: `${env.storage.baseUrl}/enterprises/${enterprise}/employees/${usercode}/contract/download`,
    method: "get",
    responseType: "stream",
    headers: {
      "Content-Type": "application/pdf",
      "x-access-token": env.storage.accessToken,
    },
  };

  await requestPipe(options, res);
};

exports.fileDownloadS3Zip = async (enterprise, usercodeArray, res) => {
  const options = {
    url: `${
      env.storage.baseUrl
    }/enterprises/${enterprise}/employees/${usercodeArray.join(
      ","
    )}/contracts/download`,
    method: "get",
    responseType: "stream",
    headers: {
      "Content-Type": "application/zip",
      "x-access-token": env.storage.accessToken,
    },
  };

  await requestPipe(options, res);
};

exports.sendAuthUserEmail = async (toMail, link) => {
  const options = {
    url: `${env.storage.baseUrl}/email/auth/user`,
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": env.storage.accessToken,
    },
    data: {
      toMail,
      link,
    },
  };

  return await request(options);
};

exports.getImageBase64 = async ({
  enterprise,
  usercode,
  contractNo,
  fileName,
}) => {
  const url =
    contractNo && fileName
      ? `${env.storage.baseUrl}/enterprises/${enterprise}/employees/${usercode}/contracts/${contractNo}/files/${fileName}/signature`
      : `${env.storage.baseUrl}/enterprises/${enterprise}/employees/${usercode}/files/${fileName}/signature`;

  const options = {
    url,
    method: "get",
    headers: {
      "Content-Type": "application/json",
      "x-access-token": env.storage.accessToken,
    },
  };

  return await request(options);
};

// storage api에 파일 업로드
exports.uploadPDF = async ({
  enterprise,
  usercode,
  contractNo,
  fileName,
  filePath,
}) => {
  console.log(
    "uploadPDF: enterprise, usercode, contractNo, fileName, filePath:",
    enterprise,
    usercode,
    contractNo,
    fileName,
    filePath
  );
  const fileStream = fs.createReadStream(filePath);
  const options = {
    url: `${
      env.storage.baseUrl
    }/enterprises/${enterprise}/employees/${usercode}/contracts/${contractNo}/files/${encodeURIComponent(
      fileName
    )}`,
    method: "post",
    headers: {
      "Content-Type": "application/octet-stream",
      "x-access-token": env.storage.accessToken,
    },
    data: fileStream,
  };

  return await request(options);
};

// 근로계약서 작성자 서명 이미지 업로드
exports.uploadSignature = async ({
  enterprise,
  usercode,
  contractNo,
  fileName,
  fileStream,
}) => {
  const options = {
    url: `${
      env.storage.baseUrl
    }/enterprises/${enterprise}/employees/${usercode}/contracts/${contractNo}/files/${encodeURIComponent(
      fileName
    )}`,
    method: "post",
    headers: {
      "Content-Type": "application/octet-stream",
      "x-access-token": env.storage.accessToken,
    },
    data: fileStream,
  };

  return await request(options);
};
