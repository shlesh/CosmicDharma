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
      // Never put tests under pages/: Next turns every file there into a route and the build fails.
      'components/**/*.test.{js,jsx,ts,tsx}',
      'util/**/*.test.{js,jsx,ts,tsx}'
    ],
    coverage: {
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage'
    }
  }
});
