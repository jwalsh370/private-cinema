module.exports = {
    collectCoverageFrom: [
      'src/lib/metadata/**/*.{ts,tsx}',
      '!src/**/*.d.ts',
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  };
  