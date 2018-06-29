/**
 * This jest config file is used when running jest manually from the root of the monorepo.
 *
 * This is used by CI and by vscode-jest.
 *
 * Inspired and simplified from:
 * https://github.com/jest-community/vscode-jest/issues/129#issuecomment-355066310
 */

module.exports = {
  transform: {
    ".(ts|tsx|js)$": "<rootDir>/node_modules/ts-jest/preprocessor.js"
  },
  bail: false,
  verbose: true,
  collectCoverageFrom: ["src/**/*.ts[x]?", "!src/**/*.test.ts[x]?", "!src/**/*.d.ts"],
  coveragePathIgnorePatterns: ["/__tests__/", "/node_modules/"],
  testEnvironment: "node",
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js|jsx)$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "core", "node"],
  cacheDirectory: ".jest/cache",
  coverageDirectory: "coverage",
  coverageReporters: ["text-summary", "html"],
  testPathIgnorePatterns: [
    "<rootDir>/.*/node_modules/",
    "<rootDir>/.*/coverage/",
    "<rootDir>/.*/build/",
    "<rootDir>/.*/dist/"
  ],
  globals: {
    'ts-jest': {
      tsConfigFile: "tsconfig.jest.json"
    }
  },
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|csv)$":
      "<rootDir>/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/__mocks__/styleMock.js"
  }
};