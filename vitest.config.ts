import os from 'node:os'
import { defineConfig } from 'vitest/config'

// Optimize worker count for CI environments
// CI machines often have limited resources - use fewer workers to prevent overload
const cpuCount = os.cpus().length
const maxWorkers = process.env.CI
  ? Math.max(2, Math.min(4, Math.floor(cpuCount / 2))) // CI: 2-4 workers
  : undefined // Local: use Vitest defaults

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.ts',
    include: ['**/*.test.{ts,tsx}'],
    testTimeout: 3000, // Maximum 3 seconds per test - much shorter
    hookTimeout: 1000, // Maximum 1 second for hooks - much shorter

    // Performance optimizations for faster test execution
    pool: 'threads', // Use worker threads (faster than forks)
    poolOptions: {
      threads: {
        minThreads: maxWorkers,
        maxThreads: maxWorkers,
      },
    },
    fileParallelism: true, // Run test files in parallel (enabled by default, explicit for clarity)
    isolate: false, // Disable isolation for faster test execution (safe as tests don't rely on global state)

    coverage: {
      provider: 'v8',
      include: ['helpers/**/*.{ts,tsx}', 'app/**/*.{ts,tsx}'],
      exclude: ['app/**/*.d.ts', '**/*.config.{ts,js}', '**/node_modules/**', 'coverage/**'],
      reporter: ['text', 'lcov', 'html'],
    },
  },
  resolve: {
    alias: {
      '~/': new URL('./app/', import.meta.url).pathname,
      'helpers/': new URL('./helpers/', import.meta.url).pathname,
    },
  },
})
