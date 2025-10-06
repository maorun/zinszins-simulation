import '@testing-library/jest-dom'

// Ensure Math functions are available in test environment
global.Math = Math

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  observe() {
    // do nothing
  }

  unobserve() {
    // do nothing
  }

  disconnect() {
    // do nothing
  }
}
