// jest.setup.js

const { setup: setupPuppeteer } = require("jest-environment-puppeteer");

module.exports = async function globalSetup(globalConfig) {
  if (globalConfig.testEnvironment === "node") {
    // Jest 테스트 환경에서만 Puppeteer를 활성화
    await setupPuppeteer(globalConfig);
  }
  // 기타 필요한 전역 설정 추가
};
