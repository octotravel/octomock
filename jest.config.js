module.exports = {
  roots: ["<rootDir>/src"],
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)",
  ],
  transform: {
    "\\.tsx?$": "ts-jest",
  },
  testEnvironment: "node",
  // setupFiles: ['<rootDir>/jest.setup.js'],
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.json",
    },
  },
};
