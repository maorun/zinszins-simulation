import os from 'node:os'
import { defineConfig } from 'vitest/config'

// Optimize worker count for CI environments
// CI machines often have limited resources - use fewer workers to prevent overload
const cpuCount = os.cpus().length
const isCI = !!process.env.CI

// For CI: use 2-4 workers (avoid overloading shared runners)
// For local: let Vitest use defaults (typically cpuCount - 1)
const maxWorkers = isCI ? Math.max(2, Math.min(4, Math.floor(cpuCount / 2))) : undefined

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
    poolOptions: isCI
      ? {
          threads: {
            minThreads: maxWorkers,
            maxThreads: maxWorkers,
          },
        }
      : undefined, // Let Vitest use defaults for local development
    fileParallelism: true, // Run test files in parallel (enabled by default, explicit for clarity)

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
