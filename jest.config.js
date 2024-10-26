module.exports = {
  preset: "jest-playwright-preset",
  testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],
  testPathIgnorePatterns: ["/node_modules/", "/build/"],
  setupFilesAfterEnv: ["./jest.setup.js"],
};
