import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // The API tests run in Node and talk to Express through Supertest.
    environment: 'node',
    include: ['tests/**/*.test.js'],
    globals: false,
    // Every file gets a fresh module registry so the in-memory store never
    // leaks between test files.
    isolate: true,
    restoreMocks: true,
    reporters: ['default'],
  },
});
