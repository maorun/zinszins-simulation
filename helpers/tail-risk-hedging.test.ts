import { describe, it, expect } from 'vitest'
import {
  getDefaultTailRiskHedgingConfig,
  calculateHedgingCost,
  calculateHedgingBenefit,
  calculateYearlyHedgingResult,
  calculateHedgingSummary,
  getStrategyCostRange,
  validateHedgingConfig,
  HEDGING_STRATEGY_NAMES,
  HEDGING_STRATEGY_DESCRIPTIONS,
  type TailRiskHedgingConfig,
  type HedgingStrategy,
} from './tail-risk-hedging'

describe('tail-risk-hedging', () => {
  describe('getDefaultTailRiskHedgingConfig', () => {
    it('should return valid default configuration', () => {
      const config = getDefaultTailRiskHedgingConfig()

      expect(config.enabled).toBe(false)
      expect(config.strategy).toBe('protective-put')
      expect(config.protectionLevel).toBe(0.85)
      expect(config.hedgeRatio).toBe(0.5)
      expect(config.annualCost).toBe(0.02)
      expect(config.rebalancingMonths).toBe(12)
    })
  })

  describe('HEDGING_STRATEGY_NAMES', () => {
    it('should have German names for all strategies', () => {
      const strategies: HedgingStrategy[] = [
        'none',
        'protective-put',
        'dynamic-cppi',
        'tail-risk-fund',
        'systematic-rebalancing',
      ]

      strategies.forEach(strategy => {
        expect(HEDGING_STRATEGY_NAMES[strategy]).toBeDefined()
        expect(HEDGING_STRATEGY_NAMES[strategy].length).toBeGreaterThan(0)
      })
    })
  })

  describe('HEDGING_STRATEGY_DESCRIPTIONS', () => {
    it('should have German descriptions for all strategies', () => {
      const strategies: HedgingStrategy[] = [
        'none',
        'protective-put',
        'dynamic-cppi',
        'tail-risk-fund',
        'systematic-rebalancing',
      ]

      strategies.forEach(strategy => {
        expect(HEDGING_STRATEGY_DESCRIPTIONS[strategy]).toBeDefined()
        expect(HEDGING_STRATEGY_DESCRIPTIONS[strategy].length).toBeGreaterThan(0)
      })
    })
  })

  describe('calculateHedgingCost', () => {
    it('should return 0 when hedging is disabled', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = false

      const cost = calculateHedgingCost(config, 100000)
      expect(cost).toBe(0)
    })

    it('should return 0 for none strategy', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'none'

      const cost = calculateHedgingCost(config, 100000)
      expect(cost).toBe(0)
    })

    it('should calculate cost based on hedgeRatio and annualCost', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.hedgeRatio = 0.5
      config.annualCost = 0.02

      const portfolioValue = 100000
      const cost = calculateHedgingCost(config, portfolioValue)

      // Should be at least the base cost (hedgeRatio * annualCost * portfolioValue)
      const expectedBaseCost = 0.5 * 0.02 * 100000
      expect(cost).toBeGreaterThanOrEqual(expectedBaseCost)
    })

    it('should enforce minimum costs for protective-put strategy', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.hedgeRatio = 0.5
      config.annualCost = 0.01 // Below minimum

      const portfolioValue = 100000
      const cost = calculateHedgingCost(config, portfolioValue)

      // Should use at least 2% for protective-put
      const expectedMinCost = 0.5 * 0.02 * 100000
      expect(cost).toBeGreaterThanOrEqual(expectedMinCost)
    })

    it('should have different costs for different strategies', () => {
      const portfolioValue = 100000
      const strategies: HedgingStrategy[] = [
        'protective-put',
        'dynamic-cppi',
        'tail-risk-fund',
        'systematic-rebalancing',
      ]

      const costs = strategies.map(strategy => {
        const config = getDefaultTailRiskHedgingConfig()
        config.enabled = true
        config.strategy = strategy
        config.hedgeRatio = 0.5
        config.annualCost = 0.02
        return calculateHedgingCost(config, portfolioValue)
      })

      // All costs should be positive
      costs.forEach(cost => {
        expect(cost).toBeGreaterThan(0)
      })

      // Costs should vary by strategy
      const uniqueCosts = new Set(costs)
      expect(uniqueCosts.size).toBeGreaterThan(1)
    })
  })

  describe('calculateHedgingBenefit', () => {
    it('should return 0 when hedging is disabled', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = false

      const benefit = calculateHedgingBenefit(config, 100000, -0.3)
      expect(benefit).toBe(0)
    })

    it('should return 0 for none strategy', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'none'

      const benefit = calculateHedgingBenefit(config, 100000, -0.3)
      expect(benefit).toBe(0)
    })

    it('should return 0 when market return is positive', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'

      const benefit = calculateHedgingBenefit(config, 100000, 0.1)
      expect(benefit).toBe(0)
    })

    it('should return 0 when loss does not breach protection threshold', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.protectionLevel = 0.85

      // -10% loss brings value to 90,000, above 85,000 threshold
      const benefit = calculateHedgingBenefit(config, 100000, -0.1)
      expect(benefit).toBe(0)
    })

    it('should provide benefit when protection threshold is breached', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.protectionLevel = 0.85
      config.hedgeRatio = 0.5

      // -30% loss brings value to 70,000, below 85,000 threshold
      const benefit = calculateHedgingBenefit(config, 100000, -0.3)
      expect(benefit).toBeGreaterThan(0)
    })

    it('should scale benefit with hedge ratio', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.protectionLevel = 0.85

      config.hedgeRatio = 0.5
      const benefit50 = calculateHedgingBenefit(config, 100000, -0.3)

      config.hedgeRatio = 1.0
      const benefit100 = calculateHedgingBenefit(config, 100000, -0.3)

      expect(benefit100).toBeGreaterThan(benefit50)
    })
  })

  describe('calculateYearlyHedgingResult', () => {
    it('should return no hedging when disabled', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = false

      const result = calculateYearlyHedgingResult(config, 100000, -0.3)

      expect(result.originalReturn).toBe(-0.3)
      expect(result.returnAfterCosts).toBe(-0.3)
      expect(result.hedgingCost).toBe(0)
      expect(result.lossPreventedAmount).toBe(0)
      expect(result.hedgeTriggered).toBe(false)
      expect(result.netBenefit).toBe(0)
    })

    it('should reduce returns by hedging cost in positive years', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.hedgeRatio = 0.5
      config.annualCost = 0.02

      const result = calculateYearlyHedgingResult(config, 100000, 0.1)

      expect(result.originalReturn).toBe(0.1)
      expect(result.returnAfterCosts).toBeLessThan(0.1)
      expect(result.hedgingCost).toBeGreaterThan(0)
      expect(result.lossPreventedAmount).toBe(0)
      expect(result.hedgeTriggered).toBe(false)
      expect(result.netBenefit).toBeLessThan(0) // Cost without benefit
    })

    it('should provide protection in severe downturn', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.protectionLevel = 0.85
      config.hedgeRatio = 1.0

      const result = calculateYearlyHedgingResult(config, 100000, -0.4) // -40% crash

      expect(result.hedgeTriggered).toBe(true)
      expect(result.lossPreventedAmount).toBeGreaterThan(0)
      expect(result.returnAfterCosts).toBeGreaterThan(-0.4) // Less loss than without hedging
    })

    it('should calculate net benefit correctly', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'

      const result = calculateYearlyHedgingResult(config, 100000, -0.3)

      expect(result.netBenefit).toBe(result.lossPreventedAmount - result.hedgingCost)
    })
  })

  describe('calculateHedgingSummary', () => {
    it('should calculate summary statistics over multiple years', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.protectionLevel = 0.85
      config.hedgeRatio = 0.5

      const yearlyData = [
        { portfolioValue: 100000, marketReturn: 0.1 }, // Good year
        { portfolioValue: 110000, marketReturn: -0.3 }, // Crash year
        { portfolioValue: 90000, marketReturn: 0.15 }, // Recovery
      ]

      const summary = calculateHedgingSummary(config, yearlyData)

      expect(summary.totalYears).toBe(3)
      expect(summary.totalCosts).toBeGreaterThan(0)
      expect(summary.yearsHedgeTriggered).toBeGreaterThanOrEqual(0)
      expect(summary.netBenefit).toBe(summary.totalLossesPrevented - summary.totalCosts)
      expect(summary.finalValueWithHedging).toBeGreaterThan(0)
      expect(summary.finalValueWithoutHedging).toBeGreaterThan(0)
    })

    it('should track hedge triggers correctly', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.protectionLevel = 0.9 // High protection level

      const yearlyData = [
        { portfolioValue: 100000, marketReturn: -0.05 }, // Small loss, no trigger
        { portfolioValue: 95000, marketReturn: -0.15 }, // Larger loss, trigger
        { portfolioValue: 90000, marketReturn: 0.1 }, // Recovery, no trigger
      ]

      const summary = calculateHedgingSummary(config, yearlyData)

      expect(summary.yearsHedgeTriggered).toBeGreaterThan(0)
      expect(summary.totalLossesPrevented).toBeGreaterThan(0)
    })

    it('should show cumulative costs even without hedge triggers', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.protectionLevel = 0.7 // Low protection level, unlikely to trigger

      const yearlyData = [
        { portfolioValue: 100000, marketReturn: 0.08 },
        { portfolioValue: 108000, marketReturn: 0.1 },
        { portfolioValue: 118800, marketReturn: 0.05 },
      ]

      const summary = calculateHedgingSummary(config, yearlyData)

      expect(summary.totalCosts).toBeGreaterThan(0) // Costs paid every year
      expect(summary.yearsHedgeTriggered).toBe(0) // No crashes
      expect(summary.totalLossesPrevented).toBe(0)
      expect(summary.netBenefit).toBeLessThan(0) // Negative (costs without benefits)
    })

    it('should calculate final values correctly', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'

      const yearlyData = [
        { portfolioValue: 100000, marketReturn: 0.1 },
        { portfolioValue: 110000, marketReturn: 0.1 },
      ]

      const summary = calculateHedgingSummary(config, yearlyData)

      // Final value without hedging should be 100,000 * 1.1 * 1.1 = 121,000
      expect(summary.finalValueWithoutHedging).toBeCloseTo(121000, 0)

      // Final value with hedging should be lower due to costs
      expect(summary.finalValueWithHedging).toBeLessThan(summary.finalValueWithoutHedging)
    })
  })

  describe('getStrategyCostRange', () => {
    it('should return valid cost ranges for all strategies', () => {
      const strategies: HedgingStrategy[] = [
        'none',
        'protective-put',
        'dynamic-cppi',
        'tail-risk-fund',
        'systematic-rebalancing',
      ]

      strategies.forEach(strategy => {
        const [minCost, maxCost] = getStrategyCostRange(strategy)

        expect(minCost).toBeGreaterThanOrEqual(0)
        expect(maxCost).toBeGreaterThanOrEqual(minCost)
        expect(maxCost).toBeLessThanOrEqual(0.1) // Max 10%
      })
    })

    it('should return [0, 0] for none strategy', () => {
      const [minCost, maxCost] = getStrategyCostRange('none')
      expect(minCost).toBe(0)
      expect(maxCost).toBe(0)
    })

    it('should have higher costs for protective-put than rebalancing', () => {
      const [, maxCostPut] = getStrategyCostRange('protective-put')
      const [, maxCostRebalancing] = getStrategyCostRange('systematic-rebalancing')

      expect(maxCostPut).toBeGreaterThan(maxCostRebalancing)
    })
  })

  describe('validateHedgingConfig', () => {
    it('should return null for valid configuration', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true

      const error = validateHedgingConfig(config)
      expect(error).toBeNull()
    })

    it('should return null when hedging is disabled', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = false

      const error = validateHedgingConfig(config)
      expect(error).toBeNull()
    })

    it('should validate protection level range', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true

      config.protectionLevel = 0.3
      expect(validateHedgingConfig(config)).not.toBeNull()

      config.protectionLevel = 1.5
      expect(validateHedgingConfig(config)).not.toBeNull()

      config.protectionLevel = 0.8
      expect(validateHedgingConfig(config)).toBeNull()
    })

    it('should validate hedge ratio range', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true

      config.hedgeRatio = -0.1
      expect(validateHedgingConfig(config)).not.toBeNull()

      config.hedgeRatio = 1.5
      expect(validateHedgingConfig(config)).not.toBeNull()

      config.hedgeRatio = 0.5
      expect(validateHedgingConfig(config)).toBeNull()
    })

    it('should validate annual cost range', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true

      config.annualCost = -0.01
      expect(validateHedgingConfig(config)).not.toBeNull()

      config.annualCost = 0.15
      expect(validateHedgingConfig(config)).not.toBeNull()

      config.annualCost = 0.03
      expect(validateHedgingConfig(config)).toBeNull()
    })

    it('should validate rebalancing frequency', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true

      config.rebalancingMonths = 2
      expect(validateHedgingConfig(config)).not.toBeNull()

      config.rebalancingMonths = 18
      expect(validateHedgingConfig(config)).not.toBeNull()

      config.rebalancingMonths = 6
      expect(validateHedgingConfig(config)).toBeNull()
    })

    it('should warn about unrealistic costs for strategy', () => {
      const config = getDefaultTailRiskHedgingConfig()
      config.enabled = true
      config.strategy = 'protective-put'
      config.annualCost = 0.0001 // Unrealistically low

      const error = validateHedgingConfig(config)
      expect(error).not.toBeNull()
      expect(error).toContain('Unralistisch')
    })
  })

  describe('Integration scenarios', () => {
    it('should demonstrate benefit during market crash', () => {
      const config: TailRiskHedgingConfig = {
        enabled: true,
        strategy: 'protective-put',
        protectionLevel: 0.85,
        hedgeRatio: 0.8,
        annualCost: 0.025,
        rebalancingMonths: 12,
      }

      // Simulate 2008-style crash
      const yearlyData = [
        { portfolioValue: 100000, marketReturn: 0.05 }, // 2007
        { portfolioValue: 105000, marketReturn: -0.4 }, // 2008 crash
        { portfolioValue: 63000, marketReturn: 0.25 }, // 2009 recovery
      ]

      const summary = calculateHedgingSummary(config, yearlyData)

      expect(summary.yearsHedgeTriggered).toBeGreaterThan(0)
      expect(summary.totalLossesPrevented).toBeGreaterThan(0)
      // In severe crashes, hedging should provide net benefit
      expect(summary.netBenefit).toBeGreaterThan(0)
    })

    it('should show drag on returns in bull market', () => {
      const config: TailRiskHedgingConfig = {
        enabled: true,
        strategy: 'protective-put',
        protectionLevel: 0.85,
        hedgeRatio: 0.5,
        annualCost: 0.02,
        rebalancingMonths: 12,
      }

      // Simulate long bull market
      const yearlyData = [
        { portfolioValue: 100000, marketReturn: 0.12 },
        { portfolioValue: 112000, marketReturn: 0.15 },
        { portfolioValue: 128800, marketReturn: 0.1 },
        { portfolioValue: 141680, marketReturn: 0.08 },
      ]

      const summary = calculateHedgingSummary(config, yearlyData)

      expect(summary.yearsHedgeTriggered).toBe(0)
      expect(summary.totalLossesPrevented).toBe(0)
      expect(summary.netBenefit).toBeLessThan(0) // Negative due to costs
      // Portfolio with hedging should lag the unhedged portfolio
      expect(summary.finalValueWithHedging).toBeLessThan(summary.finalValueWithoutHedging)
    })
  })
})
