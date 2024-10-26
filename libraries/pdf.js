const puppeteer =
  process.env.LOAD_PUPPETEER === "true" ? require("puppeteer") : undefined;
const fs = require("fs");
const path = require("path");
const dayjs = require("./day");
const Helper = require("./helper");
const ContractService = require("../components/v1/contracts/service");

exports.createPdf = async ({ contractNo, rootPath, username, birth }) => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    ignoreHTTPSErrors: true,
  });
  const page = await browser.newPage();

  // public/font/NanumBarunGothic.ttf
  const fontPath = path.join(rootPath, "/public/font/NanumBarunGothic.ttf"); // 폰트 파일 경로

  // ejs 파일을 html로 변환
  const dynamicHTML = await ContractService.getContractHtml(
    contractNo,
    rootPath
  );

  await page.setContent(dynamicHTML, { waitUntil: "domcontentloaded" });
  await page.emulateMediaType("screen");

  const font = fs.readFileSync(fontPath, "base64");
  const fontFace = `
    @font-face {
      font-family: 'NanumBarunGothic';
      src: url(data:font/truetype;charset=utf-8;base64,${font}) format('truetype');
    }
    body {
      font-family: 'NanumBarunGothic', sans-serif;
    }
  `;
  await page.addStyleTag({ content: fontFace });

  // c_김@석(960126)_202308210122030.pdf
  const contractFilename = `c_${Helper.maskSubstring(
    username,
    1,
    1,
    "@"
  )}${birth}_${dayjs().format("YYYYMMDDHHmmss")}.pdf`;

  const filePath = `${rootPath}/temp/${dayjs().unix()}`;
  fs.mkdirSync(`${filePath}`, { recursive: true });
  await page.pdf({
    path: path.join(filePath, contractFilename),
    margin: { top: "100px", right: "50px", bottom: "100px", left: "50px" },
    printBackground: true,
    format: "A4",
  });
  await browser.close();

  return {
    file: {
      originFilename: contractFilename,
      path: filePath,
    },
  };
};
