module.exports = {
  testEnvironment: "node",
  testMatch: ["<rootDir>/tests/**/*.test.js"],
  clearMocks: true,
  collectCoverageFrom: [
    "<rootDir>/**/*.js",
    "!<rootDir>/node_modules/**",
  ],
};