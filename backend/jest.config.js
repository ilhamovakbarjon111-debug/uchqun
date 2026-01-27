export default {
  testEnvironment: 'node',
  transform: {},
  extensionsToTreatAsEsm: [],
  moduleNameMapper: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'middleware/**/*.js',
    'config/**/*.js',
    'utils/**/*.js',
  ],
  coverageDirectory: 'coverage',
  setupFiles: ['./__tests__/helpers/setup.js'],
};
