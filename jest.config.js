module.exports = {
  preset: 'ts-jest',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testEnvironment: 'node',
  testMatch: [
    '<rootDir>/test/**/*.{test,spec}.ts',
    '<rootDir>/test/*.{test,spec}.ts',
  ],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['<rootDir>/test/env-setup.ts'],
  resetModules: false,
  collectCoverage: true,
  coverageDirectory: './',
  collectCoverageFrom: ['**/*.{ts,dts}', '!**/node_modules/**', '!**/test/**'],
  coverageReporters: ['lcov', 'text'],
  coveragePathIgnorePatterns: ['/dist/'],
};
