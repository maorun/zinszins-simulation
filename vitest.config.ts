import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['**/*.test.{ts,tsx}'],
    testTimeout: 10000,  // Maximum 10 seconds per test
    hookTimeout: 5000,   // Maximum 5 seconds for hooks
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