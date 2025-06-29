import { defineConfig } from 'vitest/config';

export default defineConfig({
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
