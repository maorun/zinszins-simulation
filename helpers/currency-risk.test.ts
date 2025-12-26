import { describe, it, expect } from 'vitest'
import {
  calculateCurrencyExposure,
  calculatePortfolioCurrencyRisk,
  calculateHedgingCost,
  calculateEffectiveHedgingRatio,
  calculateHedgedRisk,
  calculateCurrencyRisk,
  adjustReturnForHedgingCost,
  estimateCurrencyRiskImpact,
  DEFAULT_HEDGING_CONFIG,
  DEFAULT_CURRENCY_VOLATILITIES,
  type Currency,
  type CurrencyHedgingConfig,
} from './currency-risk'

describe('currency-risk', () => {
  describe('calculateCurrencyExposure', () => {
    it('calculates single currency exposure correctly', () => {
      const portfolioValue = 100000
      const allocations = new Map<Currency, number>([['USD', 0.3]])

      const result = calculateCurrencyExposure(portfolioValue, allocations)

      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        currency: 'USD',
        amountEUR: 30000,
        percentageOfPortfolio: 0.3,
        volatility: DEFAULT_CURRENCY_VOLATILITIES.USD,
      })
    })

    it('calculates multiple currency exposures correctly', () => {
      const portfolioValue = 100000
      const allocations = new Map<Currency, number>([
        ['EUR', 0.5],
        ['USD', 0.3],
        ['GBP', 0.2],
      ])

      const result = calculateCurrencyExposure(portfolioValue, allocations)

      expect(result).toHaveLength(3)
      expect(result[0].currency).toBe('EUR')
      expect(result[0].amountEUR).toBe(50000)
      expect(result[1].currency).toBe('USD')
      expect(result[1].amountEUR).toBe(30000)
      expect(result[2].currency).toBe('GBP')
      expect(result[2].amountEUR).toBe(20000)
    })

    it('sorts exposures by amount descending', () => {
      const portfolioValue = 100000
      const allocations = new Map<Currency, number>([
        ['GBP', 0.1],
        ['USD', 0.4],
        ['EUR', 0.5],
      ])

      const result = calculateCurrencyExposure(portfolioValue, allocations)

      expect(result[0].amountEUR).toBeGreaterThan(result[1].amountEUR)
      expect(result[1].amountEUR).toBeGreaterThan(result[2].amountEUR)
    })

    it('excludes zero or negative allocations', () => {
      const portfolioValue = 100000
      const allocations = new Map<Currency, number>([
        ['EUR', 0.5],
        ['USD', 0],
        ['GBP', -0.1],
      ])

      const result = calculateCurrencyExposure(portfolioValue, allocations)

      expect(result).toHaveLength(1)
      expect(result[0].currency).toBe('EUR')
    })

    it('handles empty allocations', () => {
      const portfolioValue = 100000
      const allocations = new Map<Currency, number>()

      const result = calculateCurrencyExposure(portfolioValue, allocations)

      expect(result).toHaveLength(0)
    })
  })

  describe('calculatePortfolioCurrencyRisk', () => {
    it('calculates zero risk for EUR-only portfolio', () => {
      const portfolioValue = 100000
      const exposures = [
        {
          currency: 'EUR' as Currency,
          amountEUR: 100000,
          percentageOfPortfolio: 1.0,
          volatility: 0,
        },
      ]

      const result = calculatePortfolioCurrencyRisk(exposures, portfolioValue)

      expect(result).toBe(0)
    })

    it('calculates risk for single foreign currency', () => {
      const portfolioValue = 100000
      const exposures = [
        {
          currency: 'USD' as Currency,
          amountEUR: 100000,
          percentageOfPortfolio: 1.0,
          volatility: 0.1,
        },
      ]

      const result = calculatePortfolioCurrencyRisk(exposures, portfolioValue)

      expect(result).toBe(0.1) // Full exposure to USD volatility
    })

    it('calculates weighted risk for multiple currencies', () => {
      const portfolioValue = 100000
      const exposures = [
        {
          currency: 'EUR' as Currency,
          amountEUR: 50000,
          percentageOfPortfolio: 0.5,
          volatility: 0,
        },
        {
          currency: 'USD' as Currency,
          amountEUR: 30000,
          percentageOfPortfolio: 0.3,
          volatility: 0.1,
        },
        {
          currency: 'GBP' as Currency,
          amountEUR: 20000,
          percentageOfPortfolio: 0.2,
          volatility: 0.08,
        },
      ]

      const result = calculatePortfolioCurrencyRisk(exposures, portfolioValue)

      // Expected: 0.5 * 0 + 0.3 * 0.1 + 0.2 * 0.08 = 0.046
      expect(result).toBeCloseTo(0.046, 5)
    })

    it('handles zero portfolio value', () => {
      const portfolioValue = 0
      const exposures = [
        {
          currency: 'USD' as Currency,
          amountEUR: 100000,
          percentageOfPortfolio: 1.0,
          volatility: 0.1,
        },
      ]

      const result = calculatePortfolioCurrencyRisk(exposures, portfolioValue)

      expect(result).toBe(0)
    })

    it('handles empty exposures', () => {
      const portfolioValue = 100000
      const exposures: any[] = []

      const result = calculatePortfolioCurrencyRisk(exposures, portfolioValue)

      expect(result).toBe(0)
    })
  })

  describe('calculateHedgingCost', () => {
    it('calculates zero cost for unhedged strategy', () => {
      const config: CurrencyHedgingConfig = {
        strategy: 'unhedged',
        hedgingRatio: 0,
        hedgingCostPercent: 0.01,
      }
      const totalForeignExposure = 50000

      const result = calculateHedgingCost(config, totalForeignExposure)

      expect(result).toBe(0)
    })

    it('calculates full cost for fully hedged strategy', () => {
      const config: CurrencyHedgingConfig = {
        strategy: 'fully_hedged',
        hedgingRatio: 0.5, // Should be ignored
        hedgingCostPercent: 0.01,
      }
      const totalForeignExposure = 50000

      const result = calculateHedgingCost(config, totalForeignExposure)

      expect(result).toBe(500) // 50000 * 1.0 * 0.01
    })

    it('calculates partial cost for partial hedging', () => {
      const config: CurrencyHedgingConfig = {
        strategy: 'partial_hedged',
        hedgingRatio: 0.5,
        hedgingCostPercent: 0.01,
      }
      const totalForeignExposure = 50000

      const result = calculateHedgingCost(config, totalForeignExposure)

      expect(result).toBe(250) // 50000 * 0.5 * 0.01
    })

    it('handles different hedging cost percentages', () => {
      const config: CurrencyHedgingConfig = {
        strategy: 'fully_hedged',
        hedgingRatio: 1.0,
        hedgingCostPercent: 0.02, // 2% cost
      }
      const totalForeignExposure = 100000

      const result = calculateHedgingCost(config, totalForeignExposure)

      expect(result).toBe(2000) // 100000 * 1.0 * 0.02
    })

    it('handles zero foreign exposure', () => {
      const config: CurrencyHedgingConfig = {
        strategy: 'fully_hedged',
        hedgingRatio: 1.0,
        hedgingCostPercent: 0.01,
      }
      const totalForeignExposure = 0

      const result = calculateHedgingCost(config, totalForeignExposure)

      expect(result).toBe(0)
    })
  })

  describe('calculateEffectiveHedgingRatio', () => {
    it('returns 0 for unhedged strategy', () => {
      const config: CurrencyHedgingConfig = {
        strategy: 'unhedged',
        hedgingRatio: 0.5, // Should be ignored
        hedgingCostPercent: 0.01,
      }

      const result = calculateEffectiveHedgingRatio(config)

      expect(result).toBe(0)
    })

    it('returns 1 for fully hedged strategy', () => {
      const config: CurrencyHedgingConfig = {
        strategy: 'fully_hedged',
        hedgingRatio: 0.5, // Should be ignored
        hedgingCostPercent: 0.01,
      }

      const result = calculateEffectiveHedgingRatio(config)

      expect(result).toBe(1.0)
    })

    it('returns hedging ratio for partial hedging', () => {
      const config: CurrencyHedgingConfig = {
        strategy: 'partial_hedged',
        hedgingRatio: 0.7,
        hedgingCostPercent: 0.01,
      }

      const result = calculateEffectiveHedgingRatio(config)

      expect(result).toBe(0.7)
    })

    it('clamps hedging ratio to valid range', () => {
      const configAbove: CurrencyHedgingConfig = {
        strategy: 'partial_hedged',
        hedgingRatio: 1.5, // Above 1.0
        hedgingCostPercent: 0.01,
      }

      const configBelow: CurrencyHedgingConfig = {
        strategy: 'partial_hedged',
        hedgingRatio: -0.2, // Below 0
        hedgingCostPercent: 0.01,
      }

      expect(calculateEffectiveHedgingRatio(configAbove)).toBe(1.0)
      expect(calculateEffectiveHedgingRatio(configBelow)).toBe(0)
    })
  })

  describe('calculateHedgedRisk', () => {
    it('returns full risk with no hedging', () => {
      const unhedgedRisk = 0.1
      const hedgingRatio = 0

      const result = calculateHedgedRisk(unhedgedRisk, hedgingRatio)

      expect(result).toBe(0.1)
    })

    it('returns zero risk with full hedging', () => {
      const unhedgedRisk = 0.1
      const hedgingRatio = 1.0

      const result = calculateHedgedRisk(unhedgedRisk, hedgingRatio)

      expect(result).toBe(0)
    })

    it('returns proportional risk with partial hedging', () => {
      const unhedgedRisk = 0.1
      const hedgingRatio = 0.5

      const result = calculateHedgedRisk(unhedgedRisk, hedgingRatio)

      expect(result).toBe(0.05) // 50% of original risk
    })

    it('handles edge cases', () => {
      expect(calculateHedgedRisk(0, 0.5)).toBe(0) // No risk to hedge
      expect(calculateHedgedRisk(0.1, 0.3)).toBeCloseTo(0.07, 5) // 70% of original
    })
  })

  describe('calculateCurrencyRisk', () => {
    it('calculates complete risk analysis for unhedged portfolio', () => {
      const portfolioValue = 100000
      const allocations = new Map<Currency, number>([
        ['EUR', 0.5],
        ['USD', 0.3],
        ['GBP', 0.2],
      ])
      const hedgingConfig = DEFAULT_HEDGING_CONFIG

      const result = calculateCurrencyRisk(portfolioValue, allocations, hedgingConfig)

      expect(result.exposures).toHaveLength(3)
      expect(result.totalUnhedgedExposure).toBe(50000) // 30k USD + 20k GBP
      expect(result.portfolioCurrencyRisk).toBeGreaterThan(0)
      expect(result.annualHedgingCost).toBe(0) // Unhedged
      expect(result.effectiveHedgingRatio).toBe(0)
      expect(result.hedgedCurrencyRisk).toBe(result.portfolioCurrencyRisk)
    })

    it('calculates complete risk analysis for fully hedged portfolio', () => {
      const portfolioValue = 100000
      const allocations = new Map<Currency, number>([
        ['EUR', 0.5],
        ['USD', 0.5],
      ])
      const hedgingConfig: CurrencyHedgingConfig = {
        strategy: 'fully_hedged',
        hedgingRatio: 1.0,
        hedgingCostPercent: 0.01,
      }

      const result = calculateCurrencyRisk(portfolioValue, allocations, hedgingConfig)

      expect(result.totalUnhedgedExposure).toBe(50000)
      expect(result.annualHedgingCost).toBe(500) // 50000 * 0.01
      expect(result.effectiveHedgingRatio).toBe(1.0)
      expect(result.hedgedCurrencyRisk).toBe(0) // Fully hedged
    })

    it('calculates complete risk analysis for partially hedged portfolio', () => {
      const portfolioValue = 100000
      const allocations = new Map<Currency, number>([
        ['EUR', 0.5],
        ['USD', 0.5],
      ])
      const hedgingConfig: CurrencyHedgingConfig = {
        strategy: 'partial_hedged',
        hedgingRatio: 0.5,
        hedgingCostPercent: 0.01,
      }

      const result = calculateCurrencyRisk(portfolioValue, allocations, hedgingConfig)

      expect(result.totalUnhedgedExposure).toBe(50000)
      expect(result.annualHedgingCost).toBe(250) // 50000 * 0.5 * 0.01
      expect(result.effectiveHedgingRatio).toBe(0.5)
      expect(result.hedgedCurrencyRisk).toBeLessThan(result.portfolioCurrencyRisk)
      expect(result.hedgedCurrencyRisk).toBeCloseTo(
        result.portfolioCurrencyRisk * 0.5,
        5
      )
    })

    it('handles EUR-only portfolio', () => {
      const portfolioValue = 100000
      const allocations = new Map<Currency, number>([['EUR', 1.0]])
      const hedgingConfig = DEFAULT_HEDGING_CONFIG

      const result = calculateCurrencyRisk(portfolioValue, allocations, hedgingConfig)

      expect(result.totalUnhedgedExposure).toBe(0)
      expect(result.portfolioCurrencyRisk).toBe(0)
      expect(result.annualHedgingCost).toBe(0)
      expect(result.hedgedCurrencyRisk).toBe(0)
    })

    it('handles multiple foreign currencies with different volatilities', () => {
      const portfolioValue = 200000
      const allocations = new Map<Currency, number>([
        ['USD', 0.3],
        ['JPY', 0.2], // Higher volatility
        ['CHF', 0.2], // Lower volatility
        ['EUR', 0.3],
      ])
      const hedgingConfig = DEFAULT_HEDGING_CONFIG

      const result = calculateCurrencyRisk(portfolioValue, allocations, hedgingConfig)

      expect(result.exposures).toHaveLength(4)
      expect(result.totalUnhedgedExposure).toBe(140000) // 60k+40k+40k
      expect(result.portfolioCurrencyRisk).toBeGreaterThan(0)
      // Should reflect weighted average of different volatilities
      const expectedRisk =
        0.3 * DEFAULT_CURRENCY_VOLATILITIES.USD +
        0.2 * DEFAULT_CURRENCY_VOLATILITIES.JPY +
        0.2 * DEFAULT_CURRENCY_VOLATILITIES.CHF +
        0.3 * DEFAULT_CURRENCY_VOLATILITIES.EUR
      expect(result.portfolioCurrencyRisk).toBeCloseTo(expectedRisk, 5)
    })
  })

  describe('adjustReturnForHedgingCost', () => {
    it('adjusts return for hedging cost correctly', () => {
      const baseReturn = 0.07 // 7% return
      const hedgingCost = 1000 // 1000 EUR
      const portfolioValue = 100000

      const result = adjustReturnForHedgingCost(baseReturn, hedgingCost, portfolioValue)

      expect(result).toBeCloseTo(0.06, 5) // 7% - 1% = 6%
    })

    it('handles zero hedging cost', () => {
      const baseReturn = 0.07
      const hedgingCost = 0
      const portfolioValue = 100000

      const result = adjustReturnForHedgingCost(baseReturn, hedgingCost, portfolioValue)

      expect(result).toBe(0.07) // No adjustment
    })

    it('handles zero portfolio value', () => {
      const baseReturn = 0.07
      const hedgingCost = 1000
      const portfolioValue = 0

      const result = adjustReturnForHedgingCost(baseReturn, hedgingCost, portfolioValue)

      expect(result).toBe(0.07) // No adjustment when portfolio is zero
    })

    it('can result in negative return if hedging cost is high', () => {
      const baseReturn = 0.02 // 2% return
      const hedgingCost = 3000 // 3000 EUR
      const portfolioValue = 100000

      const result = adjustReturnForHedgingCost(baseReturn, hedgingCost, portfolioValue)

      expect(result).toBeCloseTo(-0.01, 5) // 2% - 3% = -1%
    })
  })

  describe('estimateCurrencyRiskImpact', () => {
    it('calculates variance drag for currency risk', () => {
      const currencyRisk = 0.1 // 10% volatility

      const result = estimateCurrencyRiskImpact(currencyRisk)

      // Expected: -0.5 * 0.1^2 = -0.005
      expect(result).toBeCloseTo(-0.005, 6)
    })

    it('returns zero for zero risk', () => {
      const currencyRisk = 0

      const result = estimateCurrencyRiskImpact(currencyRisk)

      expect(Math.abs(result)).toBe(0)
    })

    it('calculates higher drag for higher volatility', () => {
      const lowRisk = 0.05
      const highRisk = 0.15

      const lowImpact = estimateCurrencyRiskImpact(lowRisk)
      const highImpact = estimateCurrencyRiskImpact(highRisk)

      expect(Math.abs(highImpact)).toBeGreaterThan(Math.abs(lowImpact))
      expect(lowImpact).toBeCloseTo(-0.00125, 6) // -0.5 * 0.05^2
      expect(highImpact).toBeCloseTo(-0.01125, 6) // -0.5 * 0.15^2
    })

    it('always returns negative impact', () => {
      const risks = [0.05, 0.1, 0.15, 0.2]

      for (const risk of risks) {
        const impact = estimateCurrencyRiskImpact(risk)
        if (risk > 0) {
          expect(impact).toBeLessThan(0)
        } else {
          expect(impact).toBe(0)
        }
      }
    })
  })

  describe('Integration tests', () => {
    it('demonstrates full currency risk workflow for German investor with US stocks', () => {
      // German investor with 60% EUR, 40% USD portfolio
      const portfolioValue = 500000
      const allocations = new Map<Currency, number>([
        ['EUR', 0.6],
        ['USD', 0.4],
      ])

      // Test unhedged scenario
      const unhedgedResult = calculateCurrencyRisk(portfolioValue, allocations, {
        strategy: 'unhedged',
        hedgingRatio: 0,
        hedgingCostPercent: 0.01,
      })

      expect(unhedgedResult.totalUnhedgedExposure).toBe(200000)
      expect(unhedgedResult.portfolioCurrencyRisk).toBeCloseTo(0.04, 5) // 40% * 10%
      expect(unhedgedResult.annualHedgingCost).toBe(0)

      // Test fully hedged scenario
      const hedgedResult = calculateCurrencyRisk(portfolioValue, allocations, {
        strategy: 'fully_hedged',
        hedgingRatio: 1.0,
        hedgingCostPercent: 0.01,
      })

      expect(hedgedResult.annualHedgingCost).toBe(2000) // 200k * 1%
      expect(hedgedResult.hedgedCurrencyRisk).toBe(0)

      // Verify hedging reduces risk but adds cost
      expect(hedgedResult.hedgedCurrencyRisk).toBeLessThan(
        unhedgedResult.portfolioCurrencyRisk
      )
      expect(hedgedResult.annualHedgingCost).toBeGreaterThan(0)
    })

    it('demonstrates diversified multi-currency portfolio', () => {
      // Portfolio with global diversification
      const portfolioValue = 1000000
      const allocations = new Map<Currency, number>([
        ['EUR', 0.4], // European stocks/bonds
        ['USD', 0.3], // US stocks
        ['GBP', 0.1], // UK stocks
        ['JPY', 0.1], // Japanese stocks
        ['CHF', 0.1], // Swiss bonds
      ])

      const result = calculateCurrencyRisk(portfolioValue, allocations, {
        strategy: 'partial_hedged',
        hedgingRatio: 0.5,
        hedgingCostPercent: 0.015,
      })

      expect(result.exposures).toHaveLength(5)
      expect(result.totalUnhedgedExposure).toBe(600000)
      expect(result.effectiveHedgingRatio).toBe(0.5)
      expect(result.annualHedgingCost).toBe(4500) // 600k * 0.5 * 1.5%

      // Verify currency risk reflects portfolio composition
      expect(result.portfolioCurrencyRisk).toBeGreaterThan(0)
      expect(result.hedgedCurrencyRisk).toBeCloseTo(
        result.portfolioCurrencyRisk * 0.5,
        5
      )
    })
  })
})
