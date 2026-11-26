import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Next.js uses the automatic JSX runtime, so components don't import React.
  esbuild: { jsx: 'automatic' },
  resolve: {
    // Mirror the "@/*" path alias from tsconfig.json.
    alias: { '@': fileURLToPath(new URL('./', import.meta.url)) },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: [
      'components/**/*.test.{js,jsx,ts,tsx}',
      'pages/**/*.test.{js,jsx,ts,tsx}',
      'util/**/*.test.{js,jsx,ts,tsx}'
    ],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage'
    }
  }
});
