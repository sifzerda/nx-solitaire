// jest.config.mjs

import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

const customJestConfig = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  clearMocks: true,
  coverageProvider: "v8",
};

export default createJestConfig(customJestConfig);