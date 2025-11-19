import { describe, it, expect } from 'vitest'
import {
  calculateParametricVaR,
  calculateHistoricalVaR,
  calculateMonteCarloVaR,
  getVaRDescription,
  getVaRMethodDescription,
  type VaRConfidenceLevel,
} from './value-at-risk'

describe('Value at Risk (VaR) Calculations', () => {
  describe('calculateParametricVaR', () => {
    it('should calculate VaR for default confidence levels', () => {
      const portfolioValue = 100000
      const averageReturn = 0.07 // 7%
      const standardDeviation = 0.15 // 15%

      const result = calculateParametricVaR(portfolioValue, averageReturn, standardDeviation)

      expect(result.results).toHaveLength(3)
      expect(result.timeHorizon).toBe(1)
      expect(result.averageReturn).toBe(averageReturn)
      expect(result.standardDeviation).toBe(standardDeviation)
      expect(result.dataPoints).toBe(0)

      // Check all results are for parametric method
      result.results.forEach(r => {
        expect(r.method).toBe('parametric')
        expect(r.portfolioValue).toBe(portfolioValue)
      })

      // Check confidence levels
      expect(result.results[0].confidenceLevel).toBe(90)
      expect(result.results[1].confidenceLevel).toBe(95)
      expect(result.results[2].confidenceLevel).toBe(99)
    })

    it('should calculate higher VaR for higher confidence levels', () => {
      const portfolioValue = 100000
      const averageReturn = 0.07
      const standardDeviation = 0.15

      const result = calculateParametricVaR(portfolioValue, averageReturn, standardDeviation)

      // 90% confidence should have lower VaR than 95%, which should be lower than 99%
      expect(result.results[0].maxExpectedLossEur).toBeLessThan(result.results[1].maxExpectedLossEur)
      expect(result.results[1].maxExpectedLossEur).toBeLessThan(result.results[2].maxExpectedLossEur)
    })

    it('should calculate VaR as positive loss amounts', () => {
      const portfolioValue = 100000
      const averageReturn = 0.07
      const standardDeviation = 0.15

      const result = calculateParametricVaR(portfolioValue, averageReturn, standardDeviation)

      // All VaR values should be positive (representing potential losses)
      result.results.forEach(r => {
        expect(r.maxExpectedLossEur).toBeGreaterThan(0)
        expect(r.maxExpectedLossPercent).toBeGreaterThan(0)
      })
    })

    it('should adjust VaR for different time horizons', () => {
      const portfolioValue = 100000
      const averageReturn = 0.07
      const standardDeviation = 0.15

      const oneYear = calculateParametricVaR(portfolioValue, averageReturn, standardDeviation, 1, [95])
      const fiveYears = calculateParametricVaR(portfolioValue, averageReturn, standardDeviation, 5, [95])

      // Longer time horizon should have different (typically higher absolute) VaR
      // because volatility scales with sqrt(time)
      expect(oneYear.results[0].maxExpectedLossEur).not.toBe(fiveYears.results[0].maxExpectedLossEur)
    })

    it('should calculate higher VaR for higher volatility', () => {
      const portfolioValue = 100000
      const averageReturn = 0.07

      const lowVol = calculateParametricVaR(portfolioValue, averageReturn, 0.10, 1, [95])
      const highVol = calculateParametricVaR(portfolioValue, averageReturn, 0.20, 1, [95])

      // Higher volatility should result in higher VaR
      expect(highVol.results[0].maxExpectedLossEur).toBeGreaterThan(lowVol.results[0].maxExpectedLossEur)
    })

    it('should support custom confidence levels', () => {
      const portfolioValue = 100000
      const averageReturn = 0.07
      const standardDeviation = 0.15
      const customLevels: VaRConfidenceLevel[] = [90, 99]

      const result = calculateParametricVaR(
        portfolioValue,
        averageReturn,
        standardDeviation,
        1,
        customLevels,
      )

      expect(result.results).toHaveLength(2)
      expect(result.results[0].confidenceLevel).toBe(90)
      expect(result.results[1].confidenceLevel).toBe(99)
    })

    it('should handle zero portfolio value gracefully', () => {
      const portfolioValue = 0
      const averageReturn = 0.07
      const standardDeviation = 0.15

      const result = calculateParametricVaR(portfolioValue, averageReturn, standardDeviation)

      result.results.forEach(r => {
        expect(r.maxExpectedLossEur).toBe(0)
        expect(r.portfolioValue).toBe(0)
      })
    })
  })

  describe('calculateHistoricalVaR', () => {
    it('should calculate VaR from historical returns', () => {
      const portfolioValue = 100000
      // Simulated historical returns: mix of positive and negative
      const historicalReturns = [
        0.15, 0.08, -0.05, 0.12, 0.03, -0.10, 0.20, 0.05, -0.02, 0.10, 0.07, -0.15, 0.18, 0.06,
        -0.08, 0.09, 0.11, -0.03, 0.14, 0.04,
      ]

      const result = calculateHistoricalVaR(portfolioValue, historicalReturns)

      expect(result.results).toHaveLength(3)
      expect(result.timeHorizon).toBe(1)
      expect(result.dataPoints).toBe(20)
      expect(result.averageReturn).toBeDefined()
      expect(result.standardDeviation).toBeDefined()

      result.results.forEach(r => {
        expect(r.method).toBe('historical')
        expect(r.portfolioValue).toBe(portfolioValue)
        expect(r.maxExpectedLossEur).toBeGreaterThanOrEqual(0)
      })
    })

    it('should calculate higher VaR for higher confidence levels', () => {
      const portfolioValue = 100000
      const historicalReturns = [
        0.15, 0.08, -0.05, 0.12, 0.03, -0.10, 0.20, 0.05, -0.02, 0.10, 0.07, -0.15, 0.18, 0.06,
        -0.08, 0.09, 0.11, -0.03, 0.14, 0.04,
      ]

      const result = calculateHistoricalVaR(portfolioValue, historicalReturns)

      // Higher confidence level = more extreme percentile = higher VaR
      expect(result.results[0].maxExpectedLossEur).toBeLessThanOrEqual(
        result.results[1].maxExpectedLossEur,
      )
      expect(result.results[1].maxExpectedLossEur).toBeLessThanOrEqual(
        result.results[2].maxExpectedLossEur,
      )
    })

    it('should handle all positive returns', () => {
      const portfolioValue = 100000
      const historicalReturns = [0.05, 0.08, 0.10, 0.12, 0.15, 0.07, 0.09, 0.11, 0.13, 0.06]

      const result = calculateHistoricalVaR(portfolioValue, historicalReturns)

      // Even with all positive returns, VaR should be calculated
      // (might be negative, representing gains at worst case)
      result.results.forEach(r => {
        expect(r.maxExpectedLossEur).toBeGreaterThanOrEqual(0)
      })
    })

    it('should handle all negative returns (crisis scenario)', () => {
      const portfolioValue = 100000
      const historicalReturns = [-0.05, -0.08, -0.10, -0.12, -0.15, -0.07, -0.09, -0.11, -0.13, -0.06]

      const result = calculateHistoricalVaR(portfolioValue, historicalReturns)

      // All negative returns should result in positive VaR (losses)
      result.results.forEach(r => {
        expect(r.maxExpectedLossEur).toBeGreaterThan(0)
        expect(r.maxExpectedLossPercent).toBeGreaterThan(0)
      })
    })

    it('should throw error for empty historical returns', () => {
      const portfolioValue = 100000
      const historicalReturns: number[] = []

      expect(() => calculateHistoricalVaR(portfolioValue, historicalReturns)).toThrow(
        'Historical returns array cannot be empty',
      )
    })

    it('should adjust for time horizon', () => {
      const portfolioValue = 100000
      const historicalReturns = [0.05, 0.08, -0.03, 0.10, 0.02, -0.05, 0.12, 0.04]

      const oneYear = calculateHistoricalVaR(portfolioValue, historicalReturns, 1, [95])
      const twoYears = calculateHistoricalVaR(portfolioValue, historicalReturns, 2, [95])

      // Two-year horizon should scale returns by 2
      expect(twoYears.results[0].maxExpectedLossPercent).not.toBe(
        oneYear.results[0].maxExpectedLossPercent,
      )
    })
  })

  describe('calculateMonteCarloVaR', () => {
    it('should calculate VaR from simulated portfolio values', () => {
      const portfolioValue = 100000
      // Simulate 1000 portfolio outcomes
      const simulatedValues = Array.from({ length: 1000 }, () => {
        // Random walk around portfolio value
        const randomReturn = (Math.random() - 0.5) * 0.4 // -20% to +20%
        return portfolioValue * (1 + randomReturn)
      })

      const result = calculateMonteCarloVaR(portfolioValue, simulatedValues)

      expect(result.results).toHaveLength(3)
      expect(result.timeHorizon).toBe(1)
      expect(result.dataPoints).toBe(1000)
      expect(result.averageReturn).toBeDefined()
      expect(result.standardDeviation).toBeDefined()

      result.results.forEach(r => {
        expect(r.method).toBe('montecarlo')
        expect(r.portfolioValue).toBe(portfolioValue)
        expect(r.maxExpectedLossEur).toBeGreaterThanOrEqual(0)
      })
    })

    it('should calculate higher VaR for higher confidence levels', () => {
      const portfolioValue = 100000
      const simulatedValues = Array.from({ length: 1000 }, () => {
        const randomReturn = (Math.random() - 0.5) * 0.4
        return portfolioValue * (1 + randomReturn)
      })

      const result = calculateMonteCarloVaR(portfolioValue, simulatedValues)

      // Higher confidence level = more extreme percentile = higher VaR
      expect(result.results[0].maxExpectedLossEur).toBeLessThanOrEqual(
        result.results[1].maxExpectedLossEur,
      )
      expect(result.results[1].maxExpectedLossEur).toBeLessThanOrEqual(
        result.results[2].maxExpectedLossEur,
      )
    })

    it('should handle favorable simulations (all gains)', () => {
      const portfolioValue = 100000
      // All simulations show gains
      const simulatedValues = Array.from(
        { length: 100 },
        (_v, i) => portfolioValue * (1.05 + i * 0.01),
      )

      const result = calculateMonteCarloVaR(portfolioValue, simulatedValues)

      // With all gains, VaR should be 0 or very small
      result.results.forEach(r => {
        expect(r.maxExpectedLossEur).toBeGreaterThanOrEqual(0)
        // At worst case (5th percentile), still should be gains
        expect(r.maxExpectedLossEur).toBeLessThan(portfolioValue * 0.01) // Less than 1% loss
      })
    })

    it('should handle unfavorable simulations (all losses)', () => {
      const portfolioValue = 100000
      // All simulations show losses
      const simulatedValues = Array.from({ length: 100 }, (_v, i) => portfolioValue * (0.95 - i * 0.001))

      const result = calculateMonteCarloVaR(portfolioValue, simulatedValues)

      // With all losses, VaR should be substantial
      result.results.forEach(r => {
        expect(r.maxExpectedLossEur).toBeGreaterThan(0)
        expect(r.maxExpectedLossPercent).toBeGreaterThan(0)
      })
    })

    it('should throw error for empty simulated values', () => {
      const portfolioValue = 100000
      const simulatedValues: number[] = []

      expect(() => calculateMonteCarloVaR(portfolioValue, simulatedValues)).toThrow(
        'Simulated values array cannot be empty',
      )
    })

    it('should handle large number of simulations efficiently', () => {
      const portfolioValue = 100000
      // 10,000 simulations
      const simulatedValues = Array.from({ length: 10000 }, () => {
        const randomReturn = (Math.random() - 0.5) * 0.4
        return portfolioValue * (1 + randomReturn)
      })

      const start = Date.now()
      const result = calculateMonteCarloVaR(portfolioValue, simulatedValues)
      const duration = Date.now() - start

      expect(result.dataPoints).toBe(10000)
      expect(duration).toBeLessThan(100) // Should complete in less than 100ms
    })

    it('should provide reasonable return statistics', () => {
      const portfolioValue = 100000
      const expectedReturn = 0.07 // 7% average
      const volatility = 0.15 // 15% std dev

      // Generate normally distributed returns
      const simulatedValues = Array.from({ length: 1000 }, () => {
        // Simple normal approximation using central limit theorem
        let normalRandom = 0
        for (let i = 0; i < 12; i++) {
          normalRandom += Math.random()
        }
        normalRandom = (normalRandom - 6) / Math.sqrt(12)

        const returnValue = expectedReturn + normalRandom * volatility
        return portfolioValue * (1 + returnValue)
      })

      const result = calculateMonteCarloVaR(portfolioValue, simulatedValues)

      // Average return should be in a reasonable range
      // Due to random sampling, we use very wide bounds
      expect(result.averageReturn).toBeGreaterThan(expectedReturn - 0.15)
      expect(result.averageReturn).toBeLessThan(expectedReturn + 0.15)

      // Standard deviation should be positive and in reasonable range
      // Due to random sampling, we use very wide bounds
      expect(result.standardDeviation).toBeGreaterThan(0)
      expect(result.standardDeviation).toBeLessThan(volatility + 0.15)
    })
  })

  describe('getVaRDescription', () => {
    it('should provide German description for VaR results', () => {
      const result = {
        confidenceLevel: 95 as VaRConfidenceLevel,
        maxExpectedLossEur: 15000,
        maxExpectedLossPercent: 15.0,
        portfolioValue: 100000,
        method: 'parametric' as const,
      }

      const description = getVaRDescription(result)

      expect(description).toContain('95%')
      expect(description).toContain('15.000')
      expect(description).toContain('15,0%')
      expect(description).toContain('5%') // Tail probability
      expect(description).toContain('Wahrscheinlichkeit')
    })

    it('should format currency values correctly', () => {
      const result = {
        confidenceLevel: 99 as VaRConfidenceLevel,
        maxExpectedLossEur: 25432.67,
        maxExpectedLossPercent: 25.4,
        portfolioValue: 100000,
        method: 'historical' as const,
      }

      const description = getVaRDescription(result)

      // Should format as German currency without decimals
      expect(description).toContain('25.433') // Rounded
      expect(description).toContain('€')
    })

    it('should calculate tail probability correctly', () => {
      const result90 = {
        confidenceLevel: 90 as VaRConfidenceLevel,
        maxExpectedLossEur: 10000,
        maxExpectedLossPercent: 10.0,
        portfolioValue: 100000,
        method: 'montecarlo' as const,
      }

      const description90 = getVaRDescription(result90)
      expect(description90).toContain('10%') // Tail probability for 90% confidence

      const result99 = {
        confidenceLevel: 99 as VaRConfidenceLevel,
        maxExpectedLossEur: 20000,
        maxExpectedLossPercent: 20.0,
        portfolioValue: 100000,
        method: 'montecarlo' as const,
      }

      const description99 = getVaRDescription(result99)
      expect(description99).toContain('1%') // Tail probability for 99% confidence
    })
  })

  describe('getVaRMethodDescription', () => {
    it('should return German descriptions for all methods', () => {
      expect(getVaRMethodDescription('parametric')).toBe('Parametrische Methode (Normalverteilung)')
      expect(getVaRMethodDescription('historical')).toBe('Historische Methode (tatsächliche Renditen)')
      expect(getVaRMethodDescription('montecarlo')).toBe('Monte-Carlo-Simulation')
    })
  })

  describe('VaR Integration Tests', () => {
    it('should produce consistent results across methods for similar inputs', () => {
      const portfolioValue = 100000
      const averageReturn = 0.07
      const standardDeviation = 0.15

      // Parametric VaR
      const parametric = calculateParametricVaR(portfolioValue, averageReturn, standardDeviation, 1, [
        95,
      ])

      // Generate historical returns that match the parametric assumptions using Box-Muller
      const historicalReturns = Array.from({ length: 1000 }, () => {
        // Box-Muller transform for normal distribution
        const u1 = Math.random()
        const u2 = Math.random()
        const normalRandom = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
        return averageReturn + normalRandom * standardDeviation
      })

      const historical = calculateHistoricalVaR(portfolioValue, historicalReturns, 1, [95])

      // Results should be in the same general range
      // Due to the nature of random sampling, we just check they're both reasonable
      const parametricVaR = parametric.results[0].maxExpectedLossEur
      const historicalVaR = historical.results[0].maxExpectedLossEur

      // Both should be positive and less than portfolio value
      expect(parametricVaR).toBeGreaterThan(0)
      expect(parametricVaR).toBeLessThan(portfolioValue)
      expect(historicalVaR).toBeGreaterThan(0)
      expect(historicalVaR).toBeLessThan(portfolioValue)

      // They should be in the same order of magnitude (within 2x of each other)
      const ratio = Math.max(parametricVaR, historicalVaR) / Math.min(parametricVaR, historicalVaR)
      expect(ratio).toBeLessThan(2)
    })

    it('should handle realistic portfolio scenario', () => {
      // Realistic scenario: €250,000 portfolio, 6% expected return, 18% volatility
      const portfolioValue = 250000
      const averageReturn = 0.06
      const standardDeviation = 0.18
      const timeHorizon = 1

      const result = calculateParametricVaR(
        portfolioValue,
        averageReturn,
        standardDeviation,
        timeHorizon,
      )

      // Check that results are reasonable
      result.results.forEach(r => {
        // VaR should be less than portfolio value
        expect(r.maxExpectedLossEur).toBeLessThan(portfolioValue)

        // VaR percentage should be reasonable (less than 50% for normal scenarios)
        expect(r.maxExpectedLossPercent).toBeLessThan(50)

        // Higher confidence = higher VaR
        if (r.confidenceLevel === 99) {
          expect(r.maxExpectedLossEur).toBeGreaterThan(
            result.results.find(res => res.confidenceLevel === 95)!.maxExpectedLossEur,
          )
        }
      })
    })
  })
})
