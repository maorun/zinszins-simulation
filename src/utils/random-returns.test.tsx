import { describe, it, expect } from 'vitest'
import {
  generateRandomReturns,
  generateMonteCarloReturns,
  calculateMonteCarloStatistics,
  type RandomReturnConfig,
} from './random-returns'

describe('random-returns', () => {
  describe('generateRandomReturns', () => {
    it('should generate returns for all years', () => {
      const years = [2020, 2021, 2022, 2023, 2024]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 12345,
      }

      const result = generateRandomReturns(years, config)

      expect(Object.keys(result)).toHaveLength(5)
      years.forEach(year => {
        expect(result[year]).toBeDefined()
        expect(typeof result[year]).toBe('number')
      })
    })

    it('should use the provided average return as base', () => {
      const years = Array.from({ length: 1000 }, (_, i) => 2000 + i)
      const config: RandomReturnConfig = {
        averageReturn: 0.08,
        standardDeviation: 0.1,
        seed: 54321,
      }

      const result = generateRandomReturns(years, config)
      const returns = Object.values(result)
      const average = returns.reduce((sum, val) => sum + val, 0) / returns.length

      // The average should be close to the specified average (within reasonable tolerance)
      expect(average).toBeGreaterThan(0.05)
      expect(average).toBeLessThan(0.11)
    })

    it('should use default standard deviation of 0.15 when not provided', () => {
      const years = [2020, 2021, 2022]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        seed: 99999,
      }

      const result = generateRandomReturns(years, config)

      expect(Object.keys(result)).toHaveLength(3)
      Object.values(result).forEach(returnValue => {
        expect(typeof returnValue).toBe('number')
      })
    })

    it('should produce reproducible results with the same seed', () => {
      const years = [2020, 2021, 2022, 2023]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 42,
      }

      const result1 = generateRandomReturns(years, config)
      const result2 = generateRandomReturns(years, config)

      expect(result1).toEqual(result2)
    })

    it('should produce different results with different seeds', () => {
      const years = [2020, 2021, 2022]
      const config1: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 100,
      }
      const config2: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 200,
      }

      const result1 = generateRandomReturns(years, config1)
      const result2 = generateRandomReturns(years, config2)

      expect(result1).not.toEqual(result2)
    })

    it('should clamp returns to minimum of -50%', () => {
      const years = Array.from({ length: 100 }, (_, i) => 2000 + i)
      const config: RandomReturnConfig = {
        averageReturn: 0.05,
        standardDeviation: 0.5, // Large deviation to potentially trigger clamping
        seed: 777,
      }

      const result = generateRandomReturns(years, config)
      const returns = Object.values(result)

      returns.forEach(returnValue => {
        expect(returnValue).toBeGreaterThanOrEqual(-0.5)
      })
    })

    it('should handle empty years array', () => {
      const years: number[] = []
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 123,
      }

      const result = generateRandomReturns(years, config)

      expect(Object.keys(result)).toHaveLength(0)
    })

    it('should handle single year', () => {
      const years = [2025]
      const config: RandomReturnConfig = {
        averageReturn: 0.06,
        standardDeviation: 0.12,
        seed: 456,
      }

      const result = generateRandomReturns(years, config)

      expect(Object.keys(result)).toHaveLength(1)
      expect(result[2025]).toBeDefined()
      expect(typeof result[2025]).toBe('number')
    })

    it('should use different distributions with different standard deviations', () => {
      const years = Array.from({ length: 500 }, (_, i) => 2000 + i)
      const config1: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.05,
        seed: 888,
      }
      const config2: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.25,
        seed: 888,
      }

      const result1 = generateRandomReturns(years, config1)
      const result2 = generateRandomReturns(years, config2)

      const values1 = Object.values(result1)
      const values2 = Object.values(result2)

      // Calculate standard deviations
      const mean1 = values1.reduce((sum, val) => sum + val, 0) / values1.length
      const mean2 = values2.reduce((sum, val) => sum + val, 0) / values2.length

      const variance1 = values1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / values1.length
      const variance2 = values2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / values2.length

      const stdDev1 = Math.sqrt(variance1)
      const stdDev2 = Math.sqrt(variance2)

      // Higher standard deviation should result in more spread
      expect(stdDev2).toBeGreaterThan(stdDev1)
    })
  })

  describe('generateMonteCarloReturns', () => {
    it('should generate the specified number of simulation runs', () => {
      const years = [2020, 2021, 2022]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 12345,
      }
      const runs = 100

      const result = generateMonteCarloReturns(years, config, runs)

      expect(result).toHaveLength(runs)
      result.forEach(run => {
        expect(Object.keys(run)).toHaveLength(years.length)
      })
    })

    it('should use default of 1000 runs when not specified', () => {
      const years = [2020, 2021]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        seed: 999,
      }

      const result = generateMonteCarloReturns(years, config)

      expect(result).toHaveLength(1000)
    })

    it('should generate different results for each run with seed', () => {
      const years = [2020, 2021, 2022]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 555,
      }
      const runs = 10

      const result = generateMonteCarloReturns(years, config, runs)

      // Each run should be different
      for (let i = 0; i < runs - 1; i++) {
        expect(result[i]).not.toEqual(result[i + 1])
      }
    })

    it('should be reproducible with the same seed', () => {
      const years = [2020, 2021, 2022]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 333,
      }
      const runs = 50

      const result1 = generateMonteCarloReturns(years, config, runs)
      const result2 = generateMonteCarloReturns(years, config, runs)

      expect(result1).toEqual(result2)
    })

    it('should handle single run', () => {
      const years = [2020, 2021]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        seed: 111,
      }

      const result = generateMonteCarloReturns(years, config, 1)

      expect(result).toHaveLength(1)
      expect(Object.keys(result[0])).toHaveLength(2)
    })
  })

  describe('calculateMonteCarloStatistics', () => {
    it('should calculate mean correctly', () => {
      const results = [1, 2, 3, 4, 5]

      const stats = calculateMonteCarloStatistics(results)

      expect(stats.mean).toBe(3)
    })

    it('should calculate median correctly for odd number of values', () => {
      const results = [1, 3, 5, 7, 9]

      const stats = calculateMonteCarloStatistics(results)

      expect(stats.median).toBe(5)
    })

    it('should calculate median correctly for even number of values', () => {
      const results = [1, 2, 3, 4]

      const stats = calculateMonteCarloStatistics(results)

      expect(stats.median).toBe(2.5) // (2 + 3) / 2
    })

    it('should calculate standard deviation correctly', () => {
      const results = [2, 4, 4, 4, 5, 5, 7, 9]

      const stats = calculateMonteCarloStatistics(results)

      // Expected standard deviation for this data set
      const expectedMean = 5
      const variance = ((2 - expectedMean) ** 2 + (4 - expectedMean) ** 2 * 3 + (5 - expectedMean) ** 2 * 2 + (7 - expectedMean) ** 2 + (9 - expectedMean) ** 2) / 8
      const expectedStdDev = Math.sqrt(variance)

      expect(stats.standardDeviation).toBeCloseTo(expectedStdDev, 10)
    })

    it('should calculate 5th and 95th percentiles correctly', () => {
      const results = Array.from({ length: 100 }, (_, i) => i + 1) // 1 to 100

      const stats = calculateMonteCarloStatistics(results)

      // Math.floor(0.05 * 100) = 5, which is index 5 (6th element)
      // Math.floor(0.95 * 100) = 95, which is index 95 (96th element)
      expect(stats.percentile5).toBe(6)
      expect(stats.percentile95).toBe(96)
    })

    it('should calculate confidence interval for 95% confidence level', () => {
      const results = Array.from({ length: 100 }, (_, i) => i + 1) // 1 to 100

      const stats = calculateMonteCarloStatistics(results, 0.95)

      // For 95% confidence level, we exclude 2.5% on each side
      expect(stats.confidenceInterval[0]).toBe(3) // 2.5th percentile (rounded)
      expect(stats.confidenceInterval[1]).toBe(98) // 97.5th percentile (rounded)
    })

    it('should calculate confidence interval for custom confidence level', () => {
      const results = Array.from({ length: 100 }, (_, i) => i + 1) // 1 to 100

      const stats = calculateMonteCarloStatistics(results, 0.90)

      // For 90% confidence level, we exclude 5% on each side
      expect(stats.confidenceInterval[0]).toBe(5) // 5th percentile
      expect(stats.confidenceInterval[1]).toBe(95) // 95th percentile
    })

    it('should handle single value', () => {
      const results = [42]

      const stats = calculateMonteCarloStatistics(results)

      expect(stats.mean).toBe(42)
      expect(stats.median).toBe(42)
      expect(stats.standardDeviation).toBe(0)
      expect(stats.percentile5).toBe(42)
      expect(stats.percentile95).toBe(42)
    })

    it('should handle two values', () => {
      const results = [10, 20]

      const stats = calculateMonteCarloStatistics(results)

      expect(stats.mean).toBe(15)
      expect(stats.median).toBe(15)
      expect(stats.percentile5).toBe(10)
      expect(stats.percentile95).toBe(20)
    })

    it('should handle negative values', () => {
      const results = [-5, -3, -1, 1, 3, 5]

      const stats = calculateMonteCarloStatistics(results)

      expect(stats.mean).toBe(0)
      expect(stats.median).toBe(0)
      expect(stats.percentile5).toBe(-5)
      expect(stats.percentile95).toBe(5)
    })

    it('should not modify the original array', () => {
      const results = [5, 2, 8, 1, 9]
      const originalCopy = [...results]

      calculateMonteCarloStatistics(results)

      expect(results).toEqual(originalCopy)
    })

    it('should handle decimal values', () => {
      const results = [0.05, 0.07, 0.09, 0.11, 0.13]

      const stats = calculateMonteCarloStatistics(results)

      expect(stats.mean).toBeCloseTo(0.09, 10)
      expect(stats.median).toBeCloseTo(0.09, 10)
    })
  })

  describe('integration: full Monte Carlo simulation', () => {
    it('should perform a complete Monte Carlo analysis', () => {
      const years = [2020, 2021, 2022, 2023, 2024]
      const config: RandomReturnConfig = {
        averageReturn: 0.07,
        standardDeviation: 0.15,
        seed: 12345,
      }
      const runs = 500

      // Generate Monte Carlo simulations
      const simulations = generateMonteCarloReturns(years, config, runs)

      // Calculate final values for each simulation (simplified compound growth)
      const finalValues = simulations.map(simulation => {
        let value = 10000 // Start with 10,000
        years.forEach(year => {
          value *= 1 + simulation[year]
        })
        return value
      })

      // Calculate statistics
      const stats = calculateMonteCarloStatistics(finalValues)

      // Verify statistics make sense
      expect(stats.mean).toBeGreaterThan(10000) // Should grow on average
      expect(stats.median).toBeGreaterThan(10000)
      expect(stats.standardDeviation).toBeGreaterThan(0)
      expect(stats.percentile5).toBeLessThan(stats.median)
      expect(stats.percentile95).toBeGreaterThan(stats.median)
      expect(stats.confidenceInterval[0]).toBeLessThan(stats.confidenceInterval[1])
    })
  })
})
