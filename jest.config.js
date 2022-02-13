/** @type {import('@ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  rootDir: './',
  testMatch: ['**/tests/**/*.ts'],
  testPathIgnorePatterns: ['node_modules', 'cdk.out'],
};
