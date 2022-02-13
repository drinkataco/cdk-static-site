/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  rootDir: './',
  testMatch: [
    '**/__tests__/**/*.+(ts|js)',
    '**/?(*.)+(spec|test).+(ts)',
  ],
  testPathIgnorePatterns: ['node_modules', 'cdk.out'],
};
