import { describe, expect, it } from 'vitest'
import {
  simulateLossCarryforwardScenario,
  compareStrategies,
  calculateOptimalTiming,
  generateTimelineData,
  validateSimulatorConfig,
  getDefaultSimulatorConfig,
  type LossCarryforwardSimulatorConfig,
  type LossRealizationStrategy,
} from './loss-carryforward-simulator'
import { createInitialLossAccountState } from './loss-offset-accounts'

describe('loss-carryforward-simulator', () => {
  describe('getDefaultSimulatorConfig', () => {
    it('should return valid default configuration', () => {
      const config = getDefaultSimulatorConfig(2024, 2030)

      expect(config.startYear).toBe(2024)
      expect(config.endYear).toBe(2030)
      expect(config.strategy).toBe('optimized')
      expect(config.taxRate).toBe(0.26375)
      expect(config.initialLosses.stockLosses).toBe(0)
      expect(config.initialLosses.otherLosses).toBe(0)
      expect(config.minAnnualGainRealization).toBe(500)
    })
  })

  describe('validateSimulatorConfig', () => {
    it('should validate correct configuration', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: createInitialLossAccountState(2024),
        projectedRealizedLosses: {},
        projectedMaxGains: {},
        strategy: 'optimized',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2030,
      }

      const errors = validateSimulatorConfig(config)
      expect(errors).toEqual([])
    })

    it('should reject invalid year range', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: createInitialLossAccountState(2024),
        projectedRealizedLosses: {},
        projectedMaxGains: {},
        strategy: 'optimized',
        taxRate: 0.26375,
        startYear: 2030,
        endYear: 2024,
      }

      const errors = validateSimulatorConfig(config)
      expect(errors).toContain('Endjahr muss nach Startjahr liegen')
    })

    it('should reject invalid tax rate', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: createInitialLossAccountState(2024),
        projectedRealizedLosses: {},
        projectedMaxGains: {},
        strategy: 'optimized',
        taxRate: 1.5,
        startYear: 2024,
        endYear: 2030,
      }

      const errors = validateSimulatorConfig(config)
      expect(errors).toContain('Steuersatz muss zwischen 0 und 1 (0% und 100%) liegen')
    })

    it('should reject negative initial losses', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: {
          stockLosses: -1000,
          otherLosses: 0,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {},
        strategy: 'optimized',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2030,
      }

      const errors = validateSimulatorConfig(config)
      expect(errors).toContain('Anfangsverluste können nicht negativ sein')
    })
  })

  describe('simulateLossCarryforwardScenario', () => {
    it('should simulate immediate strategy with available losses', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: {
          stockLosses: 10000,
          otherLosses: 5000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 8000, otherGains: 3000 },
          2025: { stockGains: 5000, otherGains: 2000 },
        },
        strategy: 'immediate',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2025,
      }

      const scenario = simulateLossCarryforwardScenario(config)

      expect(scenario.strategy).toBe('immediate')
      expect(scenario.totalTaxSavings).toBeGreaterThan(0)
      expect(scenario.yearlyResults).toHaveLength(2)
      expect(scenario.efficiencyScore).toBeGreaterThan(0)
      expect(scenario.efficiencyScore).toBeLessThanOrEqual(100)
    })

    it('should simulate gradual strategy', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: {
          stockLosses: 20000,
          otherLosses: 10000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 15000, otherGains: 8000 },
          2025: { stockGains: 15000, otherGains: 8000 },
          2026: { stockGains: 15000, otherGains: 8000 },
        },
        strategy: 'gradual',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2026,
      }

      const scenario = simulateLossCarryforwardScenario(config)

      expect(scenario.strategy).toBe('gradual')
      expect(scenario.yearlyResults).toHaveLength(3)
      
      // Check that gains are distributed relatively evenly
      const gains2024 = scenario.yearlyResults[0].projectedGains.stockGains
      const gains2025 = scenario.yearlyResults[1].projectedGains.stockGains
      const gains2026 = scenario.yearlyResults[2].projectedGains.stockGains

      // All years should have similar gain realization (within 50% of each other)
      const avgGains = (gains2024 + gains2025 + gains2026) / 3
      expect(Math.abs(gains2024 - avgGains)).toBeLessThan(avgGains * 0.5)
      expect(Math.abs(gains2025 - avgGains)).toBeLessThan(avgGains * 0.5)
      expect(Math.abs(gains2026 - avgGains)).toBeLessThan(avgGains * 0.5)
    })

    it('should simulate optimized strategy', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: {
          stockLosses: 15000,
          otherLosses: 8000,
          year: 2024,
        },
        projectedRealizedLosses: {
          2025: { stockLosses: 5000, otherLosses: 2000, year: 2025 },
        },
        projectedMaxGains: {
          2024: { stockGains: 10000, otherGains: 5000 },
          2025: { stockGains: 12000, otherGains: 6000 },
        },
        strategy: 'optimized',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2025,
      }

      const scenario = simulateLossCarryforwardScenario(config)

      expect(scenario.strategy).toBe('optimized')
      expect(scenario.totalTaxSavings).toBeGreaterThan(0)
      expect(scenario.efficiencyScore).toBeGreaterThan(50) // Should be reasonably efficient
    })

    it('should calculate efficiency score correctly with no losses', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: createInitialLossAccountState(2024),
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 10000, otherGains: 5000 },
        },
        strategy: 'optimized',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2024,
      }

      const scenario = simulateLossCarryforwardScenario(config)

      expect(scenario.efficiencyScore).toBe(0) // No losses to utilize
      expect(scenario.totalTaxSavings).toBe(0)
    })

    it('should handle aggressive strategy with front-loading', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: {
          stockLosses: 30000,
          otherLosses: 15000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 20000, otherGains: 10000 },
          2025: { stockGains: 20000, otherGains: 10000 },
          2026: { stockGains: 20000, otherGains: 10000 },
        },
        strategy: 'aggressive',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2026,
      }

      const scenario = simulateLossCarryforwardScenario(config)

      expect(scenario.strategy).toBe('aggressive')
      
      // First year should have highest gain realization
      const gains2024 = scenario.yearlyResults[0].projectedGains.stockGains
      const gains2025 = scenario.yearlyResults[1].projectedGains.stockGains
      const gains2026 = scenario.yearlyResults[2].projectedGains.stockGains

      expect(gains2024).toBeGreaterThanOrEqual(gains2025)
      expect(gains2025).toBeGreaterThanOrEqual(gains2026)
    })

    it('should handle conservative strategy', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: {
          stockLosses: 20000,
          otherLosses: 10000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 5000, otherGains: 2000 },
          2025: { stockGains: 5000, otherGains: 2000 },
        },
        strategy: 'conservative',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2025,
      }

      const scenario = simulateLossCarryforwardScenario(config)

      expect(scenario.strategy).toBe('conservative')
      
      // Conservative should maintain high carryforward
      const finalLosses = scenario.finalUnusedLosses.stockLosses + scenario.finalUnusedLosses.otherLosses
      expect(finalLosses).toBeGreaterThan(15000) // Most losses should remain
    })
  })

  describe('compareStrategies', () => {
    it('should compare multiple strategies and recommend best one', () => {
      const baseConfig = {
        initialLosses: {
          stockLosses: 15000,
          otherLosses: 8000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 10000, otherGains: 5000 },
          2025: { stockGains: 12000, otherGains: 6000 },
          2026: { stockGains: 8000, otherGains: 4000 },
        },
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2026,
      }

      const strategies: LossRealizationStrategy[] = ['immediate', 'gradual', 'optimized', 'aggressive', 'conservative']

      const comparison = compareStrategies(baseConfig, strategies)

      expect(comparison.scenarios).toHaveLength(5)
      expect(comparison.recommendedScenario).toBeDefined()
      expect(comparison.highestSavingsScenario).toBeDefined()
      expect(comparison.fastestUtilizationScenario).toBeDefined()
      expect(comparison.comparison.strategicRecommendations.length).toBeGreaterThan(0)

      // Verify all scenarios are different
      const savingsSet = new Set(comparison.scenarios.map(s => s.totalTaxSavings))
      expect(savingsSet.size).toBeGreaterThan(1) // At least some differences in savings

      // Highest savings scenario should indeed have highest savings
      const maxSavings = Math.max(...comparison.scenarios.map(s => s.totalTaxSavings))
      expect(comparison.highestSavingsScenario.totalTaxSavings).toBe(maxSavings)

      // Fastest utilization should have highest efficiency
      const maxEfficiency = Math.max(...comparison.scenarios.map(s => s.efficiencyScore))
      expect(comparison.fastestUtilizationScenario.efficiencyScore).toBe(maxEfficiency)
    })

    it('should calculate max difference correctly', () => {
      const baseConfig = {
        initialLosses: {
          stockLosses: 10000,
          otherLosses: 5000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 8000, otherGains: 4000 },
          2025: { stockGains: 8000, otherGains: 4000 },
        },
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2025,
      }

      const strategies: LossRealizationStrategy[] = ['immediate', 'conservative']

      const comparison = compareStrategies(baseConfig, strategies)

      expect(comparison.comparison.maxSavingsDifference).toBeGreaterThanOrEqual(0)
      expect(comparison.comparison.maxEfficiencyDifference).toBeGreaterThanOrEqual(0)
    })

    it('should generate strategic recommendations', () => {
      const baseConfig = {
        initialLosses: {
          stockLosses: 25000,
          otherLosses: 12000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 15000, otherGains: 8000 },
          2025: { stockGains: 15000, otherGains: 8000 },
        },
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2025,
      }

      const strategies: LossRealizationStrategy[] = ['optimized', 'aggressive', 'conservative']

      const comparison = compareStrategies(baseConfig, strategies)

      expect(comparison.comparison.strategicRecommendations).toBeDefined()
      expect(comparison.comparison.strategicRecommendations.length).toBeGreaterThan(0)

      // Should have at least one high-priority recommendation
      const hasHighPriority = comparison.comparison.strategicRecommendations.some(r => r.priority === 'high')
      expect(hasHighPriority).toBe(true)
    })
  })

  describe('calculateOptimalTiming', () => {
    it('should generate timing recommendations for each year', () => {
      const config = {
        initialLosses: {
          stockLosses: 20000,
          otherLosses: 10000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 15000, otherGains: 8000 },
          2025: { stockGains: 10000, otherGains: 5000 },
          2026: { stockGains: 12000, otherGains: 6000 },
        },
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2026,
      }

      const recommendations = calculateOptimalTiming(config)

      expect(recommendations).toHaveLength(3)
      
      recommendations.forEach(rec => {
        expect(rec.year).toBeGreaterThanOrEqual(2024)
        expect(rec.year).toBeLessThanOrEqual(2026)
        expect(rec.recommendedStockGainRealization).toBeGreaterThanOrEqual(0)
        expect(rec.recommendedOtherGainRealization).toBeGreaterThanOrEqual(0)
        expect(rec.projectedTaxSavings).toBeGreaterThanOrEqual(0)
        expect(rec.reasoning).toBeDefined()
        expect(['low', 'medium', 'high']).toContain(rec.priority)
      })
    })

    it('should prioritize years with high savings potential', () => {
      const config = {
        initialLosses: {
          stockLosses: 30000,
          otherLosses: 15000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 20000, otherGains: 10000 },
          2025: { stockGains: 1000, otherGains: 500 },
        },
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2025,
      }

      const recommendations = calculateOptimalTiming(config)

      // 2024 should have higher priority due to larger potential savings
      const rec2024 = recommendations.find(r => r.year === 2024)
      const rec2025 = recommendations.find(r => r.year === 2025)

      expect(rec2024).toBeDefined()
      expect(rec2025).toBeDefined()

      if (rec2024 && rec2025) {
        expect(rec2024.projectedTaxSavings).toBeGreaterThan(rec2025.projectedTaxSavings)
        
        // Priority should reflect savings potential
        const priorityOrder = { low: 1, medium: 2, high: 3 }
        expect(priorityOrder[rec2024.priority]).toBeGreaterThanOrEqual(priorityOrder[rec2025.priority])
      }
    })

    it('should recommend no realization when no efficient opportunities exist', () => {
      const config = {
        initialLosses: {
          stockLosses: 1000,
          otherLosses: 500,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 20000, otherGains: 10000 },
        },
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2024,
      }

      const recommendations = calculateOptimalTiming(config)

      expect(recommendations).toHaveLength(1)
      
      // Should recommend using most or all of available losses
      const rec = recommendations[0]
      expect(rec.recommendedStockGainRealization).toBeGreaterThan(0)
      expect(rec.recommendedOtherGainRealization).toBeGreaterThan(0)
    })
  })

  describe('generateTimelineData', () => {
    it('should generate timeline data points from scenario', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: {
          stockLosses: 15000,
          otherLosses: 8000,
          year: 2024,
        },
        projectedRealizedLosses: {
          2025: { stockLosses: 3000, otherLosses: 1500, year: 2025 },
        },
        projectedMaxGains: {
          2024: { stockGains: 10000, otherGains: 5000 },
          2025: { stockGains: 8000, otherGains: 4000 },
          2026: { stockGains: 6000, otherGains: 3000 },
        },
        strategy: 'optimized',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2026,
      }

      const scenario = simulateLossCarryforwardScenario(config)
      const timeline = generateTimelineData(scenario)

      expect(timeline).toHaveLength(3)

      timeline.forEach((point, index) => {
        expect(point.year).toBe(2024 + index)
        expect(point.availableStockLosses).toBeGreaterThanOrEqual(0)
        expect(point.availableOtherLosses).toBeGreaterThanOrEqual(0)
        expect(point.realizedStockGains).toBeGreaterThanOrEqual(0)
        expect(point.realizedOtherGains).toBeGreaterThanOrEqual(0)
        expect(point.stockLossesUsed).toBeGreaterThanOrEqual(0)
        expect(point.otherLossesUsed).toBeGreaterThanOrEqual(0)
        expect(point.taxSavings).toBeGreaterThanOrEqual(0)
        expect(point.carryforwardStockLosses).toBeGreaterThanOrEqual(0)
        expect(point.carryforwardOtherLosses).toBeGreaterThanOrEqual(0)
      })
    })

    it('should show declining carryforward over time when losses are used', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: {
          stockLosses: 20000,
          otherLosses: 10000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 8000, otherGains: 4000 },
          2025: { stockGains: 8000, otherGains: 4000 },
          2026: { stockGains: 8000, otherGains: 4000 },
        },
        strategy: 'immediate',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2026,
      }

      const scenario = simulateLossCarryforwardScenario(config)
      const timeline = generateTimelineData(scenario)

      // Carryforward should generally decrease over time with immediate strategy
      const carryforward2024 = timeline[0].carryforwardStockLosses + timeline[0].carryforwardOtherLosses
      const carryforward2025 = timeline[1].carryforwardStockLosses + timeline[1].carryforwardOtherLosses
      const carryforward2026 = timeline[2].carryforwardStockLosses + timeline[2].carryforwardOtherLosses

      expect(carryforward2024).toBeGreaterThanOrEqual(carryforward2025)
      expect(carryforward2025).toBeGreaterThanOrEqual(carryforward2026)
    })

    it('should track cumulative tax savings accurately', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: {
          stockLosses: 10000,
          otherLosses: 5000,
          year: 2024,
        },
        projectedRealizedLosses: {},
        projectedMaxGains: {
          2024: { stockGains: 5000, otherGains: 2500 },
          2025: { stockGains: 5000, otherGains: 2500 },
        },
        strategy: 'immediate',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2025,
      }

      const scenario = simulateLossCarryforwardScenario(config)
      const timeline = generateTimelineData(scenario)

      const totalTimelineSavings = timeline.reduce((sum, point) => sum + point.taxSavings, 0)
      
      // Total should match scenario total (within rounding)
      expect(Math.abs(totalTimelineSavings - scenario.totalTaxSavings)).toBeLessThan(0.01)
    })
  })

  describe('integration scenarios', () => {
    it('should handle complex multi-year scenario with mixed losses', () => {
      const config: LossCarryforwardSimulatorConfig = {
        initialLosses: {
          stockLosses: 25000,
          otherLosses: 12000,
          year: 2024,
        },
        projectedRealizedLosses: {
          2025: { stockLosses: 5000, otherLosses: 2000, year: 2025 },
          2027: { stockLosses: 8000, otherLosses: 3000, year: 2027 },
        },
        projectedMaxGains: {
          2024: { stockGains: 15000, otherGains: 8000 },
          2025: { stockGains: 10000, otherGains: 5000 },
          2026: { stockGains: 20000, otherGains: 10000 },
          2027: { stockGains: 12000, otherGains: 6000 },
          2028: { stockGains: 8000, otherGains: 4000 },
        },
        strategy: 'optimized',
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2028,
      }

      const scenario = simulateLossCarryforwardScenario(config)

      expect(scenario.yearlyResults).toHaveLength(5)
      expect(scenario.totalTaxSavings).toBeGreaterThan(0)
      expect(scenario.efficiencyScore).toBeGreaterThan(0)

      // Should have meaningful years with loss usage
      expect(scenario.yearsWithLossUsage).toBeGreaterThan(2)

      // Timeline should show progression
      const timeline = generateTimelineData(scenario)
      expect(timeline).toHaveLength(5)
    })

    it('should correctly compare all five strategies', () => {
      const baseConfig = {
        initialLosses: {
          stockLosses: 30000,
          otherLosses: 15000,
          year: 2024,
        },
        projectedRealizedLosses: {
          2025: { stockLosses: 5000, otherLosses: 2500, year: 2025 },
        },
        projectedMaxGains: {
          2024: { stockGains: 20000, otherGains: 10000 },
          2025: { stockGains: 15000, otherGains: 8000 },
          2026: { stockGains: 18000, otherGains: 9000 },
        },
        taxRate: 0.26375,
        startYear: 2024,
        endYear: 2026,
      }

      const allStrategies: LossRealizationStrategy[] = [
        'immediate',
        'gradual',
        'optimized',
        'aggressive',
        'conservative',
      ]

      const comparison = compareStrategies(baseConfig, allStrategies)

      expect(comparison.scenarios).toHaveLength(5)

      // All strategies should have valid results
      comparison.scenarios.forEach(scenario => {
        expect(scenario.totalTaxSavings).toBeGreaterThanOrEqual(0)
        expect(scenario.efficiencyScore).toBeGreaterThanOrEqual(0)
        expect(scenario.efficiencyScore).toBeLessThanOrEqual(100)
        expect(scenario.yearlyResults).toHaveLength(3)
      })

      // Verify recommendations are actionable
      expect(comparison.comparison.strategicRecommendations.length).toBeGreaterThan(0)
      comparison.comparison.strategicRecommendations.forEach(rec => {
        expect(rec.title).toBeDefined()
        expect(rec.description).toBeDefined()
        expect(['low', 'medium', 'high']).toContain(rec.priority)
      })
    })
  })
})
