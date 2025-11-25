/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  
  // CORRECT: moduleNameMapping is the right property
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
  ],
};
