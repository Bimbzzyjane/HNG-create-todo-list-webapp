import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite configuration for the TaskNest React client.
 *
 * In development the client runs on port 5173 and proxies every /api request to
 * the Express server, so the frontend never needs a hard-coded backend URL.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  test: {
    // The client tests cover pure utilities and API helpers, so Node is enough.
    environment: 'node',
    include: ['src/**/*.test.js'],
    globals: false,
  },
});
