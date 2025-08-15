/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^~/(.*)$': '<rootDir>/app/$1',
    '^helpers/(.*)$': '<rootDir>/helpers/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy'
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  testMatch: [
    '<rootDir>/**/*.test.(ts|tsx)',
    '<rootDir>/**/__tests__/**/*.(ts|tsx)'
  ],
  collectCoverageFrom: [
    'helpers/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!app/**/*.d.ts',
    '!**/*.config.{ts,js}',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};