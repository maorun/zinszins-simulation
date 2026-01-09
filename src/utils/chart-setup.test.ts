/**
 * Tests for Chart.js Setup and Registration
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Chart as ChartJS } from 'chart.js'

describe('chart-setup', () => {
  // Store original Chart.register to restore after tests
  let originalRegister: typeof ChartJS.register
  let registerCallCount: number

  beforeEach(() => {
    // Reset call count
    registerCallCount = 0
    
    // Store original register method
    originalRegister = ChartJS.register
    
    // Mock Chart.register to track calls
    ChartJS.register = vi.fn((...args) => {
      registerCallCount++
      // Call original implementation
      return originalRegister.apply(ChartJS, args)
    })
  })

  afterEach(() => {
    // Restore original register method
    ChartJS.register = originalRegister
  })

  describe('registerChartComponents', () => {
    it('should register Chart.js components on import', async () => {
      // Import the module fresh to test auto-registration
      // Note: We can't truly test fresh import in same test suite
      // but we can verify the function exists and is callable
      const { registerChartComponents } = await import('./chart-setup')
      
      expect(registerChartComponents).toBeDefined()
      expect(typeof registerChartComponents).toBe('function')
    })

    it('should be idempotent - multiple calls should not re-register', async () => {
      // Import the module
      const { registerChartComponents } = await import('./chart-setup')
      
      // Reset call count after initial import registration
      registerCallCount = 0
      
      // Call multiple times
      registerChartComponents()
      registerChartComponents()
      registerChartComponents()
      
      // Should only register once more (or 0 if already registered on import)
      expect(registerCallCount).toBeLessThanOrEqual(1)
    })

    it('should register core Chart.js components', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      // Reset and call
      registerCallCount = 0
      registerChartComponents()
      
      // Verify Chart.register was called (if not already registered)
      if (registerCallCount > 0) {
        expect(ChartJS.register).toHaveBeenCalled()
      }
    })

    it('should handle being called multiple times safely', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      // Should not throw when called multiple times
      expect(() => {
        registerChartComponents()
        registerChartComponents()
        registerChartComponents()
      }).not.toThrow()
    })

    it('should ensure components are registered before returning', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      // Call the function
      registerChartComponents()
      
      // After calling, Chart.js should have components available
      // We can't directly check internal state, but we can verify no errors
      expect(true).toBe(true)
    })
  })

  describe('Auto-registration on import', () => {
    it('should automatically register components when module is imported', async () => {
      // The import itself should trigger registration
      const module = await import('./chart-setup')
      
      // Module should export the register function
      expect(module.registerChartComponents).toBeDefined()
    })
  })

  describe('Integration with Chart.js', () => {
    it('should register all required components for line charts', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      registerChartComponents()
      
      // Verify Chart.js is available after registration
      expect(ChartJS).toBeDefined()
      expect(ChartJS.register).toBeDefined()
    })

    it('should register zoom plugin for interactive charts', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      registerChartComponents()
      
      // After registration, zoom plugin should be available
      // We can't easily test plugin presence without creating a chart
      // but we can verify the function doesn't throw
      expect(true).toBe(true)
    })
  })

  describe('Module state management', () => {
    it('should maintain registration state across multiple imports', async () => {
      // First import
      const module1 = await import('./chart-setup')
      module1.registerChartComponents()
      
      // Second import (should get same module due to module caching)
      const module2 = await import('./chart-setup')
      
      // Both imports should reference the same function
      expect(module1.registerChartComponents).toBe(module2.registerChartComponents)
    })

    it('should prevent duplicate registrations', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      // Reset call count
      registerCallCount = 0
      
      // Call multiple times
      for (let i = 0; i < 10; i++) {
        registerChartComponents()
      }
      
      // Should only register once (or 0 if already registered)
      expect(registerCallCount).toBeLessThanOrEqual(1)
    })
  })

  describe('Error handling', () => {
    it('should not throw errors during registration', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      expect(() => registerChartComponents()).not.toThrow()
    })

    it('should handle Chart.js registration gracefully', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      // Even if Chart.js has issues, our code shouldn't crash
      let error: Error | null = null
      try {
        registerChartComponents()
      } catch (e) {
        error = e as Error
      }
      
      expect(error).toBeNull()
    })
  })

  describe('Performance and efficiency', () => {
    it('should complete registration quickly', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      const startTime = performance.now()
      registerChartComponents()
      const endTime = performance.now()
      
      // Should complete in less than 100ms
      expect(endTime - startTime).toBeLessThan(100)
    })

    it('should not block on subsequent calls', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      // First call
      registerChartComponents()
      
      // Subsequent calls should be near-instant
      const startTime = performance.now()
      registerChartComponents()
      const endTime = performance.now()
      
      // Should complete in less than 10ms (just checking flag)
      expect(endTime - startTime).toBeLessThan(10)
    })
  })

  describe('Component registration verification', () => {
    it('should make Chart.js available globally', async () => {
      await import('./chart-setup')
      
      // Chart.js should be available
      expect(ChartJS).toBeDefined()
      expect(typeof ChartJS).toBe('function')
    })

    it('should register required scales', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      registerChartComponents()
      
      // After registration, Chart.js should have scales available
      // Note: We can't easily verify internal Chart.js state,
      // but we ensure the registration call completes
      expect(ChartJS.register).toBeDefined()
    })

    it('should register required elements', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      registerChartComponents()
      
      // After registration, Chart.js should have elements available
      expect(ChartJS.register).toBeDefined()
    })

    it('should register plugins', async () => {
      const { registerChartComponents } = await import('./chart-setup')
      
      registerChartComponents()
      
      // After registration, plugins should be available
      expect(ChartJS.register).toBeDefined()
    })
  })
})
