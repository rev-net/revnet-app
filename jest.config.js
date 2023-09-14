/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!fpnum)"],
  transform: {
    "^.+\\.[tj]s$": "ts-jest",
  },
};
