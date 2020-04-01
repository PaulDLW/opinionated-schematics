module.exports = {
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.html?$',
      tsConfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.+(ts|tsx)', '**/?(*.)+(spec|test).+(ts|tsx)'],
  transform: {
    '^.+\\.(ts|tsx)?$': 'ts-jest'
  },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
  setupFilesAfterEnv: ['<rootDir>/jest-test-setup.ts']
  //modulePathIgnorePatterns: ['<rootDir>/src/angular/**/testing/**/']
};
