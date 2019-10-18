const path = require('path');
const { pathsToModuleNameMapper: resolver } = require('ts-jest/utils');
const { compilerOptions } = require('./tsconfig');
const moduleNameMapper = resolver(compilerOptions.paths, { prefix: '<rootDir>/' });

module.exports = {
  projects: ['<rootDir>'],
  rootDir: path.resolve('.'),
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.spec.json',
      allowSyntheticDefaultImports: true
    }
  },
  preset: 'jest-preset-angular',
  moduleNameMapper,
  cache: false,
  testMatch: ['<rootDir>/src/tests/**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
  coverageReporters: ['json', 'lcovonly', 'lcov', 'text', 'html'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  bail: true,
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  modulePaths: ['<rootDir>']
};
