import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['shared/**/*.test.js', 'server/src/**/*.test.js'],
    testTimeout: 30000,
  },
});
