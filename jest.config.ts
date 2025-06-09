import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'jsdom',
  testMatch: ['**/tests/**/*.test.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      'ts-jest',
      { tsconfig: 'tsconfig.jest.json', useESM: true }
    ]
  },
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
}

export default config
