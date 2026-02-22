import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    // Allow absolute imports from src/
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/__tests__/**',
    '!src/index.ts',      // entry point — excluded from coverage
    '!src/types/**',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  // Each test file gets a clean module registry — important for mocking Redis/Mongoose
  clearMocks: true,
  restoreMocks: true,
  // Increase timeout for DB startup (mongodb-memory-server can be slow)
  testTimeout: 30000,
};

export default config;
