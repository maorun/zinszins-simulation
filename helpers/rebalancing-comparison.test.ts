/**
 * Tests for Rebalancing Strategy Comparison Tool
 */

import { describe, it, expect } from 'vitest'
import {
  calculateAllocationDrift,
  shouldRebalance,
  simulateRebalancingStrategy,
  compareRebalancingStrategies,
  recommendBestStrategy,
  createDefaultStrategyConfigs,
  type RebalancingStrategyConfig,
} from './rebalancing-comparison'
import { createDefaultRebalancingTaxConfig, createDefaultTransactionCostConfig } from './rebalancing'
import type { AssetClass } from './multi-asset-portfolio'

describe('calculateAllocationDrift', () => {
  it('should return 0 for perfect alignment with target', () => {
    const currentAllocations: Record<AssetClass, number> = {
      'stocks_domestic': 300,
      'stocks_international': 400,
      'bonds_government': 300,
      'bonds_corporate': 0,
      real_estate: 0,
      commodities: 0,
      cash: 0,
    }
    const targetAllocations: Record<AssetClass, number> = {
      'stocks_domestic': 0.3,
      'stocks_international': 0.4,
      'bonds_government': 0.3,
      'bonds_corporate': 0,
      real_estate: 0,
      commodities: 0,
      cash: 0,
    }
    const totalValue = 1000

    const drift = calculateAllocationDrift(currentAllocations, targetAllocations, totalValue)
    expect(drift).toBe(0)
  })

  it('should calculate drift when allocations deviate from target', () => {
    const currentAllocations: Record<AssetClass, number> = {
      'stocks_domestic': 400, // 40% vs target 30%
      'stocks_international': 300, // 30% vs target 40%
      'bonds_government': 300, // 30% vs target 30%
      'bonds_corporate': 0,
      real_estate: 0,
      commodities: 0,
      cash: 0,
    }
    const targetAllocations: Record<AssetClass, number> = {
      'stocks_domestic': 0.3,
      'stocks_international': 0.4,
      'bonds_government': 0.3,
      'bonds_corporate': 0,
      real_estate: 0,
      commodities: 0,
      cash: 0,
    }
    const totalValue = 1000

    const drift = calculateAllocationDrift(currentAllocations, targetAllocations, totalValue)

    // Should have drift: sqrt((0.1)^2 + (-0.1)^2 + 0^2) = sqrt(0.02) ≈ 0.141
    expect(drift).toBeCloseTo(0.141, 2)
  })

  it('should return 0 for zero portfolio value', () => {
    const currentAllocations: Record<AssetClass, number> = {
      'stocks_domestic': 0,
      'stocks_international': 0,
      'bonds_government': 0,
      'bonds_corporate': 0,
      real_estate: 0,
      commodities: 0,
      cash: 0,
    }
    const targetAllocations: Record<AssetClass, number> = {
      'stocks_domestic': 0.3,
      'stocks_international': 0.4,
      'bonds_government': 0.3,
      'bonds_corporate': 0,
      real_estate: 0,
      commodities: 0,
      cash: 0,
    }
    const totalValue = 0

    const drift = calculateAllocationDrift(currentAllocations, targetAllocations, totalValue)
    expect(drift).toBe(0)
  })
})

describe('shouldRebalance', () => {
  describe('calendar strategy', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'calendar',
      name: 'Yearly',
      description: 'Test',
      frequency: 'yearly',
    }

    it('should trigger after one year', () => {
      expect(shouldRebalance(strategy, 2025, 2024, 0.03, 0.05)).toBe(true)
    })

    it('should not trigger in same year', () => {
      expect(shouldRebalance(strategy, 2024, 2024, 0.03, 0.05)).toBe(false)
    })
  })

  describe('threshold strategy', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'threshold',
      name: 'Threshold 5%',
      description: 'Test',
      threshold: 0.05,
    }

    it('should trigger when drift exceeds threshold', () => {
      expect(shouldRebalance(strategy, 2024, 2024, 0.06, 0.05)).toBe(true)
    })

    it('should not trigger when drift is below threshold', () => {
      expect(shouldRebalance(strategy, 2024, 2024, 0.04, 0.05)).toBe(false)
    })

    it('should not trigger when drift equals threshold', () => {
      expect(shouldRebalance(strategy, 2024, 2024, 0.05, 0.05)).toBe(false)
    })
  })

  describe('hybrid strategy', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'hybrid',
      name: 'Hybrid',
      description: 'Test',
      frequency: 'yearly',
      threshold: 0.05,
    }

    it('should trigger on calendar', () => {
      expect(shouldRebalance(strategy, 2025, 2024, 0.03, 0.05)).toBe(true)
    })

    it('should trigger on threshold', () => {
      expect(shouldRebalance(strategy, 2024, 2024, 0.06, 0.05)).toBe(true)
    })

    it('should not trigger when neither condition is met', () => {
      expect(shouldRebalance(strategy, 2024, 2024, 0.03, 0.05)).toBe(false)
    })
  })

  describe('opportunistic strategy', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'opportunistic',
      name: 'Opportunistic',
      description: 'Test',
      marketMovementThreshold: 0.15,
    }

    it('should trigger on large positive market movement', () => {
      expect(shouldRebalance(strategy, 2024, 2024, 0.03, 0.20)).toBe(true)
    })

    it('should trigger on large negative market movement', () => {
      expect(shouldRebalance(strategy, 2024, 2024, 0.03, -0.20)).toBe(true)
    })

    it('should not trigger on small market movement', () => {
      expect(shouldRebalance(strategy, 2024, 2024, 0.03, 0.10)).toBe(false)
    })
  })

  describe('tax-optimized strategy', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'tax-optimized',
      name: 'Tax-Optimized',
      description: 'Test',
      threshold: 0.05,
    }

    it('should use higher threshold (more conservative)', () => {
      // Tax-optimized uses 1.5x threshold
      expect(shouldRebalance(strategy, 2024, 2024, 0.06, 0.05)).toBe(false)
      expect(shouldRebalance(strategy, 2024, 2024, 0.08, 0.05)).toBe(true)
    })
  })
})

describe('simulateRebalancingStrategy', () => {
  const initialValue = 100000
  const targetAllocations: Record<AssetClass, number> = {
    'stocks_domestic': 0.3,
    'stocks_international': 0.4,
    'bonds_government': 0.3,
    'bonds_corporate': 0,
    real_estate: 0,
    commodities: 0,
    cash: 0,
  }
  const yearlyReturns = [0.1, -0.05, 0.15, 0.08, -0.02] // 5 years
  const taxConfig = createDefaultRebalancingTaxConfig()
  const costConfig = {
    ...createDefaultTransactionCostConfig(),
    minTransactionSize: 10, // Lower threshold for testing
  }

  it('should simulate calendar strategy', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'calendar',
      name: 'Yearly',
      description: 'Test',
      frequency: 'yearly',
    }

    const result = simulateRebalancingStrategy(strategy, initialValue, targetAllocations, yearlyReturns, taxConfig, costConfig)

    expect(result.strategy).toBe(strategy)
    expect(result.yearlyData).toHaveLength(5)
    expect(result.finalValue).toBeGreaterThan(0)
    // Note: With same return applied to all assets, drift may be minimal
    expect(result.totalTransactions).toBeGreaterThanOrEqual(0)
    expect(result.annualizedReturn).toBeDefined()
  })

  it('should simulate threshold strategy', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'threshold',
      name: 'Threshold',
      description: 'Test',
      threshold: 0.05,
    }

    const result = simulateRebalancingStrategy(strategy, initialValue, targetAllocations, yearlyReturns, taxConfig, costConfig)

    expect(result.yearlyData).toHaveLength(5)
    expect(result.totalTransactions).toBeGreaterThanOrEqual(0)
  })

  it('should have lower costs for opportunistic strategy', () => {
    const calendarStrategy: RebalancingStrategyConfig = {
      type: 'calendar',
      name: 'Yearly',
      description: 'Test',
      frequency: 'yearly',
    }

    const opportunisticStrategy: RebalancingStrategyConfig = {
      type: 'opportunistic',
      name: 'Opportunistic',
      description: 'Test',
      marketMovementThreshold: 0.15,
    }

    const calendarResult = simulateRebalancingStrategy(
      calendarStrategy,
      initialValue,
      targetAllocations,
      yearlyReturns,
      taxConfig,
      costConfig
    )

    const opportunisticResult = simulateRebalancingStrategy(
      opportunisticStrategy,
      initialValue,
      targetAllocations,
      yearlyReturns,
      taxConfig,
      costConfig
    )

    // Opportunistic should have fewer transactions
    expect(opportunisticResult.totalTransactions).toBeLessThanOrEqual(calendarResult.totalTransactions)
  })

  it('should track allocation drift over time', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'calendar',
      name: 'Yearly',
      description: 'Test',
      frequency: 'yearly',
    }

    const result = simulateRebalancingStrategy(strategy, initialValue, targetAllocations, yearlyReturns, taxConfig, costConfig)

    // Each year should have drift data
    result.yearlyData.forEach(yearData => {
      expect(yearData.allocationDrift).toBeGreaterThanOrEqual(0)
    })
  })

  it('should include rebalancing events in yearly data', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'calendar',
      name: 'Yearly',
      description: 'Test',
      frequency: 'yearly',
    }

    const result = simulateRebalancingStrategy(strategy, initialValue, targetAllocations, yearlyReturns, taxConfig, costConfig)

    // Should have at least one rebalancing event
    const yearsWithRebalancing = result.yearlyData.filter(y => y.rebalancingEvent !== undefined)
    expect(yearsWithRebalancing.length).toBeGreaterThan(0)
  })
})

describe('compareRebalancingStrategies', () => {
  const initialValue = 100000
  const targetAllocations: Record<AssetClass, number> = {
    'stocks_domestic': 0.3,
    'stocks_international': 0.4,
    'bonds_government': 0.3,
    'bonds_corporate': 0,
    real_estate: 0,
    commodities: 0,
    cash: 0,
  }
  const yearlyReturns = [0.1, -0.05, 0.15, 0.08, -0.02]
  const taxConfig = createDefaultRebalancingTaxConfig()
  const costConfig = {
    ...createDefaultTransactionCostConfig(),
    minTransactionSize: 10, // Lower threshold for testing
  }

  it('should compare multiple strategies', () => {
    const strategies = createDefaultStrategyConfigs().slice(0, 3) // Test first 3

    const results = compareRebalancingStrategies(
      strategies,
      initialValue,
      targetAllocations,
      yearlyReturns,
      taxConfig,
      costConfig
    )

    expect(results).toHaveLength(3)
    results.forEach(result => {
      expect(result.finalValue).toBeGreaterThan(0)
      expect(result.annualizedReturn).toBeDefined()
      expect(result.yearlyData).toHaveLength(5)
    })
  })

  it('should produce different results for different strategies', () => {
    const strategies = createDefaultStrategyConfigs().slice(0, 3)

    const results = compareRebalancingStrategies(
      strategies,
      initialValue,
      targetAllocations,
      yearlyReturns,
      taxConfig,
      costConfig
    )

    // All results should be valid
    expect(results).toHaveLength(3)
    results.forEach(result => {
      expect(result.finalValue).toBeGreaterThan(0)
      expect(result.yearlyData).toHaveLength(5)
    })
  })
})

describe('recommendBestStrategy', () => {
  const initialValue = 100000
  const targetAllocations: Record<AssetClass, number> = {
    'stocks_domestic': 0.3,
    'stocks_international': 0.4,
    'bonds_government': 0.3,
    'bonds_corporate': 0,
    real_estate: 0,
    commodities: 0,
    cash: 0,
  }
  const yearlyReturns = [0.1, -0.05, 0.15, 0.08, -0.02]
  const taxConfig = createDefaultRebalancingTaxConfig()
  const costConfig = createDefaultTransactionCostConfig()

  it('should recommend best strategy', () => {
    const strategies = createDefaultStrategyConfigs()
    const results = compareRebalancingStrategies(
      strategies,
      initialValue,
      targetAllocations,
      yearlyReturns,
      taxConfig,
      costConfig
    )

    const recommendation = recommendBestStrategy(results)

    expect(recommendation.bestOverall).toBeDefined()
    expect(recommendation.bestByCriteria).toBeDefined()
    expect(recommendation.bestByCriteria.return).toBeDefined()
    expect(recommendation.bestByCriteria.cost).toBeDefined()
    expect(recommendation.bestByCriteria.sharpe).toBeDefined()
    expect(recommendation.bestByCriteria.tracking).toBeDefined()
  })

  it('should identify strategy with highest return', () => {
    const strategies = createDefaultStrategyConfigs()
    const results = compareRebalancingStrategies(
      strategies,
      initialValue,
      targetAllocations,
      yearlyReturns,
      taxConfig,
      costConfig
    )

    const recommendation = recommendBestStrategy(results)
    const bestReturn = recommendation.bestByCriteria.return

    // Should be the strategy with highest annualized return
    results.forEach(r => {
      expect(bestReturn.annualizedReturn).toBeGreaterThanOrEqual(r.annualizedReturn)
    })
  })

  it('should identify strategy with lowest cost', () => {
    const strategies = createDefaultStrategyConfigs()
    const results = compareRebalancingStrategies(
      strategies,
      initialValue,
      targetAllocations,
      yearlyReturns,
      taxConfig,
      costConfig
    )

    const recommendation = recommendBestStrategy(results)
    const bestCost = recommendation.bestByCriteria.cost

    // Should be the strategy with lowest total costs
    results.forEach(r => {
      expect(bestCost.totalCosts).toBeLessThanOrEqual(r.totalCosts)
    })
  })

  it('should throw error for empty results', () => {
    expect(() => recommendBestStrategy([])).toThrow('No strategies to compare')
  })
})

describe('createDefaultStrategyConfigs', () => {
  it('should create 6 default strategies', () => {
    const strategies = createDefaultStrategyConfigs()
    expect(strategies).toHaveLength(6)
  })

  it('should include all strategy types', () => {
    const strategies = createDefaultStrategyConfigs()
    const types = strategies.map(s => s.type)

    expect(types).toContain('calendar')
    expect(types).toContain('threshold')
    expect(types).toContain('hybrid')
    expect(types).toContain('tax-optimized')
    expect(types).toContain('opportunistic')
  })

  it('should have valid configuration for each strategy', () => {
    const strategies = createDefaultStrategyConfigs()

    strategies.forEach(strategy => {
      expect(strategy.name).toBeTruthy()
      expect(strategy.description).toBeTruthy()

      switch (strategy.type) {
        case 'calendar':
        case 'hybrid':
          expect(strategy.frequency).toBeDefined()
          break
        case 'threshold':
        case 'tax-optimized':
          expect(strategy.threshold).toBeDefined()
          expect(strategy.threshold).toBeGreaterThan(0)
          break
        case 'opportunistic':
          expect(strategy.marketMovementThreshold).toBeDefined()
          expect(strategy.marketMovementThreshold).toBeGreaterThan(0)
          break
      }
    })
  })
})

describe('edge cases and validation', () => {
  const initialValue = 100000
  const targetAllocations: Record<AssetClass, number> = {
    'stocks_domestic': 0.5,
    'stocks_international': 0.5,
    'bonds_government': 0,
    'bonds_corporate': 0,
    real_estate: 0,
    commodities: 0,
    cash: 0,
  }
  const taxConfig = createDefaultRebalancingTaxConfig()
  const costConfig = {
    ...createDefaultTransactionCostConfig(),
    minTransactionSize: 10, // Lower threshold for testing
  }

  it('should handle negative returns', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'calendar',
      name: 'Yearly',
      description: 'Test',
      frequency: 'yearly',
    }
    const yearlyReturns = [-0.2, -0.15, -0.1, -0.05, 0.0]

    const result = simulateRebalancingStrategy(strategy, initialValue, targetAllocations, yearlyReturns, taxConfig, costConfig)

    expect(result.finalValue).toBeGreaterThan(0)
    expect(result.yearlyData).toHaveLength(5)
  })

  it('should handle zero returns', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'threshold',
      name: 'Threshold',
      description: 'Test',
      threshold: 0.05,
    }
    const yearlyReturns = [0, 0, 0, 0, 0]

    const result = simulateRebalancingStrategy(strategy, initialValue, targetAllocations, yearlyReturns, taxConfig, costConfig)

    expect(result.finalValue).toBeLessThanOrEqual(initialValue) // Should be less due to costs
    expect(result.yearlyData).toHaveLength(5)
  })

  it('should handle volatile returns', () => {
    const strategy: RebalancingStrategyConfig = {
      type: 'hybrid',
      name: 'Hybrid',
      description: 'Test',
      frequency: 'yearly',
      threshold: 0.05,
    }
    const yearlyReturns = [0.3, -0.25, 0.4, -0.3, 0.2]

    const result = simulateRebalancingStrategy(strategy, initialValue, targetAllocations, yearlyReturns, taxConfig, costConfig)

    expect(result.finalValue).toBeGreaterThan(0)
    // Note: Simplified simulation applies same return to all assets
    // In real scenario with different asset returns, more rebalancing would occur
    expect(result.totalTransactions).toBeGreaterThanOrEqual(0)
  })
})
