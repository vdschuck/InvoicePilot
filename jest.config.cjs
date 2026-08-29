/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest.polyfills.cjs'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy',
  },
}
