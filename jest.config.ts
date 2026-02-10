import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/default-esm', // Use the ESM-specific preset
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  // This is the CRITICAL part:
  moduleNameMapper: {
    // Tells Jest: "If you see an import ending in .js, look for the .ts file instead"
    '^(\\.\\.?\\/.+)\\.js$': '$1',
  },
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true, // Tells ts-jest to support ES modules
      },
    ],
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['**/__tests__/**/*.test.ts'],
};

export default config;
