import { describe, test, expect } from 'vitest'
import {
  generateRandomReturns,
  generateMonteCarloReturns,
  calculateMonteCarloStatistics,
  type RandomReturnConfig,
} from './random-returns'

describe('Random Returns Utility', () => {
  describe('generateRandomReturns', () => {
    test('should generate returns for all specified years', () => {
      const years = [2025, 2026, 2027]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 12345,
      }

      const returns = generateRandomReturns(years, config)

      expect(Object.keys(returns)).toHaveLength(3)
      expect(returns[2025]).toBeDefined()
      expect(returns[2026]).toBeDefined()
      expect(returns[2027]).toBeDefined()
    })

    test('should be deterministic with same seed', () => {
      const years = [2025, 2026]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        seed: 42,
      }

      const returns1 = generateRandomReturns(years, config)
      const returns2 = generateRandomReturns(years, config)

      expect(returns1[2025]).toBe(returns2[2025])
      expect(returns1[2026]).toBe(returns2[2026])
    })

    test('should generate different returns with different seeds', () => {
      const years = [2025]
      const config1: RandomReturnConfig = { averageReturn: 0.07, seed: 1 }
      const config2: RandomReturnConfig = { averageReturn: 0.07, seed: 2 }

      const returns1 = generateRandomReturns(years, config1)
      const returns2 = generateRandomReturns(years, config2)

      expect(returns1[2025]).not.toBe(returns2[2025])
    })

    test('should clamp extreme negative returns', () => {
      const years = Array.from({ length: 100 }, (_, i) => 2025 + i)
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 1.0, // Very high std dev to test clamping
        seed: 123,
      }

      const returns = generateRandomReturns(years, config)
      const allReturns = Object.values(returns)

      // All returns should be >= -0.5 (minimum -50%)
      expect(allReturns.every(r => r >= -0.5)).toBe(true)
    })

    test('should use default standard deviation if not provided', () => {
      const years = [2025]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        seed: 42,
      }

      const returns = generateRandomReturns(years, config)

      // Should not throw and should generate a reasonable return
      expect(typeof returns[2025]).toBe('number')
      expect(returns[2025]).toBeGreaterThan(-1)
      expect(returns[2025]).toBeLessThan(1)
    })
  })

  describe('generateMonteCarloReturns', () => {
    test('should generate specified number of simulation runs', () => {
      const years = [2025, 2026]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        seed: 42,
      }
      const runs = 10

      const results = generateMonteCarloReturns(years, config, runs)

      expect(results).toHaveLength(runs)
      expect(results[0]).toHaveProperty('2025')
      expect(results[0]).toHaveProperty('2026')
    })

    test('should generate different results for each run when seed is provided', () => {
      const years = [2025]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        seed: 42,
      }
      const runs = 5

      const results = generateMonteCarloReturns(years, config, runs)
      const returns2025 = results.map(r => r[2025])

      // All runs should have different returns (very unlikely to be same with proper seeding)
      const uniqueReturns = new Set(returns2025)
      expect(uniqueReturns.size).toBeGreaterThan(1)
    })
  })

  describe('calculateMonteCarloStatistics', () => {
    test('should calculate basic statistics correctly', () => {
      const results = [0.05, 0.07, 0.09, 0.11, 0.13] // Simple test data

      const stats = calculateMonteCarloStatistics(results)

      expect(stats.mean).toBeCloseTo(0.09, 4)
      expect(stats.median).toBeCloseTo(0.09, 4)
      expect(stats.standardDeviation).toBeGreaterThan(0)
    })

    test('should handle confidence intervals', () => {
      // Generate larger dataset for better confidence interval testing
      const results = Array.from({ length: 1000 }, (_, i) => 0.05 + (i / 1000) * 0.1)

      const stats = calculateMonteCarloStatistics(results, 0.95)

      expect(stats.confidenceInterval[0]).toBeLessThan(stats.mean)
      expect(stats.confidenceInterval[1]).toBeGreaterThan(stats.mean)
      expect(stats.percentile5).toBeLessThan(stats.percentile95)
    })

    test('should handle single value array', () => {
      const results = [0.07]

      const stats = calculateMonteCarloStatistics(results)

      expect(stats.mean).toBe(0.07)
      expect(stats.median).toBe(0.07)
      expect(stats.standardDeviation).toBe(0)
    })

    test('should handle empty array gracefully', () => {
      const results: number[] = []

      const stats = calculateMonteCarloStatistics(results)

      expect(stats.mean).toBeNaN()
      expect(stats.median).toBeNaN()
    })
  })

  describe('Random returns distribution properties', () => {
    test('should approximate normal distribution over many samples', () => {
      const years = [2025]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.10, // Smaller std dev to avoid too much clamping
        seed: 42,
      }

      // Generate many samples
      const samples = 10000
      const results = generateMonteCarloReturns(years, config, samples)
      const returns = results.map(r => r[2025])

      const stats = calculateMonteCarloStatistics(returns)

      // Mean should be close to the specified average
      expect(stats.mean).toBeCloseTo(0.07, 1)

      // Standard deviation should be reasonably close (allowing for clamping effects)
      expect(stats.standardDeviation).toBeGreaterThan(0.05)
      expect(stats.standardDeviation).toBeLessThan(0.20)
    })
  })
})
