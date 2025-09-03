import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['**/*.test.{ts,tsx}'],
    testTimeout: 3000,   // Maximum 3 seconds per test - much shorter
    hookTimeout: 1000,   // Maximum 1 second for hooks - much shorter
    coverage: {
      provider: 'v8',
      include: [
        'helpers/**/*.{ts,tsx}',
        'app/**/*.{ts,tsx}'
      ],
      exclude: [
        'app/**/*.d.ts',
        '**/*.config.{ts,js}',
        '**/node_modules/**',
        'coverage/**'
      ],
      reporter: ['text', 'lcov', 'html']
    }
  },
  resolve: {
    alias: {
      '~/': new URL('./app/', import.meta.url).pathname,
      'helpers/': new URL('./helpers/', import.meta.url).pathname
    }
  }
});