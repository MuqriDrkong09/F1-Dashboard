module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/src/test/setupTests.js"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  moduleFileExtensions: ["js", "jsx", "json"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/main.jsx",
    "!src/test/**",
    "!**/*.test.{js,jsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 75,
      lines: 80,
      statements: 80,
    },
  },
};
