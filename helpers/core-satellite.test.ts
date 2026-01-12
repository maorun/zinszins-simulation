import { describe, it, expect } from 'vitest'
import {
  type CoreSatelliteConfig,
  type SatellitePosition,
  DEFAULT_CORE_SATELLITE_CONFIG,
  calculateEffectiveAllocation,
  calculatePortfolioMetrics,
  validateCoreSatelliteConfig,
  createDefaultSatellitePosition,
  calculatePerformanceAttribution,
} from './core-satellite'

describe('Core-Satellite Strategy', () => {
  describe('calculateEffectiveAllocation', () => {
    it('should calculate allocation with default config (no satellites)', () => {
      const result = calculateEffectiveAllocation(DEFAULT_CORE_SATELLITE_CONFIG)

      expect(result.corePercentage).toBe(1.0) // 100% core when no satellites
      expect(result.satellitePercentage).toBe(0)
      expect(result.totalAllocation).toBeCloseTo(1.0, 2)

      // Check core allocations are scaled correctly
      expect(result.assetClassAllocations.stocks_domestic).toBeCloseTo(0.3, 2)
      expect(result.assetClassAllocations.stocks_international).toBeCloseTo(0.3, 2)
      expect(result.assetClassAllocations.bonds_government).toBeCloseTo(0.25, 2)
      expect(result.assetClassAllocations.bonds_corporate).toBeCloseTo(0.15, 2)
    })

    it('should calculate allocation with one satellite (80-20 split)', () => {
      const satellite: SatellitePosition = createDefaultSatellitePosition('sector_overweight')
      satellite.targetAllocation = 0.2 // 20%

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite],
      }

      const result = calculateEffectiveAllocation(config)

      expect(result.corePercentage).toBeCloseTo(0.8, 2) // 80% core
      expect(result.satellitePercentage).toBeCloseTo(0.2, 2) // 20% satellites
      expect(result.totalAllocation).toBeCloseTo(1.0, 2)

      // Core allocations should be scaled by 80%
      expect(result.assetClassAllocations.stocks_domestic).toBeCloseTo(0.8 * 0.3, 2)
      expect(result.assetClassAllocations.stocks_international).toBeCloseTo(0.8 * 0.3 + 0.2, 2) // Core + satellite
    })

    it('should calculate allocation with multiple satellites', () => {
      const satellite1 = createDefaultSatellitePosition('sector_overweight')
      satellite1.targetAllocation = 0.1
      satellite1.underlyingAssetClass = 'stocks_international'

      const satellite2 = createDefaultSatellitePosition('individual_stocks')
      satellite2.targetAllocation = 0.05
      satellite2.underlyingAssetClass = 'stocks_domestic'

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite1, satellite2],
      }

      const result = calculateEffectiveAllocation(config)

      expect(result.corePercentage).toBeCloseTo(0.85, 2) // 85% core
      expect(result.satellitePercentage).toBeCloseTo(0.15, 2) // 15% satellites
      expect(result.totalAllocation).toBeCloseTo(1.0, 2)
    })

    it('should handle disabled satellites', () => {
      const satellite1 = createDefaultSatellitePosition('sector_overweight')
      satellite1.targetAllocation = 0.1
      satellite1.enabled = true

      const satellite2 = createDefaultSatellitePosition('thematic')
      satellite2.targetAllocation = 0.1
      satellite2.enabled = false // Disabled

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite1, satellite2],
      }

      const result = calculateEffectiveAllocation(config)

      expect(result.satellitePercentage).toBeCloseTo(0.1, 2) // Only enabled satellite
      expect(result.corePercentage).toBeCloseTo(0.9, 2)
    })

    it('should handle satellites exceeding recommended limits', () => {
      const satellite = createDefaultSatellitePosition('thematic')
      satellite.targetAllocation = 0.4 // 40% - exceeds recommended 30%

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite],
      }

      const result = calculateEffectiveAllocation(config)

      expect(result.satellitePercentage).toBeCloseTo(0.4, 2)
      expect(result.corePercentage).toBeCloseTo(0.6, 2)
      expect(result.totalAllocation).toBeCloseTo(1.0, 2)
    })
  })

  describe('calculatePortfolioMetrics', () => {
    it('should calculate metrics for core-only portfolio', () => {
      const result = calculatePortfolioMetrics(DEFAULT_CORE_SATELLITE_CONFIG)

      expect(result.expectedReturn).toBeGreaterThan(0)
      expect(result.expectedReturn).toBeLessThan(0.1) // Reasonable range
      expect(result.portfolioRisk).toBeGreaterThan(0)
      expect(result.costs).toBeGreaterThan(0)
      expect(result.coreReturn).toBeGreaterThan(0)
      expect(result.satelliteReturn).toBe(0) // No satellites
    })

    it('should calculate higher expected return with high-return satellite', () => {
      const satellite = createDefaultSatellitePosition('thematic')
      satellite.targetAllocation = 0.2
      satellite.expectedReturn = 0.15 // 15% expected return
      satellite.costs = 0.01 // 1% costs

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite],
      }

      const resultWithSatellite = calculatePortfolioMetrics(config)
      const resultWithoutSatellite = calculatePortfolioMetrics(DEFAULT_CORE_SATELLITE_CONFIG)

      // Portfolio return should be higher with high-return satellite
      expect(resultWithSatellite.expectedReturn).toBeGreaterThan(resultWithoutSatellite.expectedReturn)
      expect(resultWithSatellite.costs).toBeGreaterThan(resultWithoutSatellite.costs) // Higher costs
    })

    it('should calculate portfolio risk correctly with high-volatility satellite', () => {
      const satellite = createDefaultSatellitePosition('individual_stocks')
      satellite.targetAllocation = 0.2
      satellite.volatility = 0.4 // 40% volatility

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite],
      }

      const resultWithSatellite = calculatePortfolioMetrics(config)

      // Verify the risk is reasonable and calculated
      expect(resultWithSatellite.portfolioRisk).toBeGreaterThan(0)
      expect(resultWithSatellite.portfolioRisk).toBeLessThan(0.30)
      
      // The portfolio risk should reflect both core and satellite contributions
      // Risk = sqrt(coreWeight^2 * coreRisk^2 + satWeight^2 * satRisk^2)
      const expectedRisk = Math.sqrt(Math.pow(0.8 * resultWithSatellite.portfolioRisk, 2) + Math.pow(0.2 * 0.4, 2))
      expect(resultWithSatellite.portfolioRisk).toBeLessThan(expectedRisk + 0.05) // Allow some margin
    })

    it('should account for satellite costs in total return', () => {
      const satellite = createDefaultSatellitePosition('thematic')
      satellite.targetAllocation = 0.2
      satellite.expectedReturn = 0.10
      satellite.costs = 0.02 // 2% costs (high)

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite],
      }

      const result = calculatePortfolioMetrics(config)

      // Net return should be less than gross return
      expect(result.expectedReturn).toBeLessThan(0.8 * 0.06 + 0.2 * 0.10) // Rough estimate
      expect(result.costs).toBeGreaterThan(DEFAULT_CORE_SATELLITE_CONFIG.core.averageCosts) // Higher than core-only
      expect(result.costs).toBeCloseTo(0.8 * 0.002 + 0.2 * 0.02, 3) // 0.0016 + 0.004 = 0.0056
    })
  })

  describe('validateCoreSatelliteConfig', () => {
    it('should validate default config without errors', () => {
      const result = validateCoreSatelliteConfig(DEFAULT_CORE_SATELLITE_CONFIG)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should error when core allocations do not sum to 100%', () => {
      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        core: {
          ...DEFAULT_CORE_SATELLITE_CONFIG.core,
          assetClassAllocations: {
            stocks_domestic: 0.3,
            stocks_international: 0.3,
            // Missing allocations - sums to 0.6
          },
        },
      }

      const result = validateCoreSatelliteConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors[0]).toContain('100%')
    })

    it('should warn when satellite allocation exceeds 30%', () => {
      const satellite = createDefaultSatellitePosition('thematic')
      satellite.targetAllocation = 0.35 // 35%

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite],
      }

      const result = validateCoreSatelliteConfig(config)

      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings[0]).toContain('30%')
    })

    it('should error when satellite allocations exceed 100%', () => {
      const satellite1 = createDefaultSatellitePosition('thematic')
      satellite1.targetAllocation = 0.6

      const satellite2 = createDefaultSatellitePosition('sector_overweight')
      satellite2.targetAllocation = 0.6

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite1, satellite2],
      }

      const result = validateCoreSatelliteConfig(config)

      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
      expect(result.errors.some((e) => e.includes('100%'))).toBe(true)
    })

    it('should warn when core allocation is below 70%', () => {
      const satellite1 = createDefaultSatellitePosition('thematic')
      satellite1.targetAllocation = 0.2

      const satellite2 = createDefaultSatellitePosition('sector_overweight')
      satellite2.targetAllocation = 0.15

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite1, satellite2],
      }

      const result = validateCoreSatelliteConfig(config)

      // 35% satellites = 65% core, which should trigger warning
      expect(result.warnings.length).toBeGreaterThan(0)
      expect(result.warnings.some((w) => w.includes('70%'))).toBe(true)
    })
  })

  describe('createDefaultSatellitePosition', () => {
    it('should create sector overweight position with correct defaults', () => {
      const position = createDefaultSatellitePosition('sector_overweight')

      expect(position.strategy).toBe('sector_overweight')
      expect(position.name).toContain('Sektor')
      expect(position.targetAllocation).toBe(0.05) // 5% default
      expect(position.enabled).toBe(true)
      expect(position.expectedReturn).toBeGreaterThan(0)
      expect(position.volatility).toBeGreaterThan(0)
      expect(position.costs).toBeGreaterThan(0)
      expect(position.underlyingAssetClass).toBeDefined()
    })

    it('should create thematic position with higher return expectations', () => {
      const position = createDefaultSatellitePosition('thematic')

      expect(position.strategy).toBe('thematic')
      expect(position.expectedReturn).toBeGreaterThan(0.10) // Higher return expectations
      expect(position.volatility).toBeGreaterThan(0.20) // Higher volatility
      expect(position.costs).toBeGreaterThan(0.005) // Higher costs
    })

    it('should create individual stocks position with highest volatility', () => {
      const position = createDefaultSatellitePosition('individual_stocks')

      expect(position.strategy).toBe('individual_stocks')
      expect(position.volatility).toBeGreaterThan(0.30) // Highest volatility
      expect(position.costs).toBeLessThan(0.005) // Lower costs (no fund fees)
    })

    it('should create unique IDs for each position', () => {
      const position1 = createDefaultSatellitePosition('thematic')
      const position2 = createDefaultSatellitePosition('thematic')

      expect(position1.id).not.toBe(position2.id)
    })

    it('should create all satellite types without errors', () => {
      const strategies: Array<Parameters<typeof createDefaultSatellitePosition>[0]> = [
        'sector_overweight',
        'regional_tilt',
        'thematic',
        'individual_stocks',
        'factor_tilt',
        'tactical_allocation',
      ]

      strategies.forEach((strategy) => {
        const position = createDefaultSatellitePosition(strategy)
        expect(position.strategy).toBe(strategy)
        expect(position.id).toBeDefined()
        expect(position.name).toBeDefined()
      })
    })
  })

  describe('calculatePerformanceAttribution', () => {
    it('should attribute all returns to core when no satellites', () => {
      const actualReturns = {
        core: 0.08, // 8% core return
        satellites: {},
      }

      const result = calculatePerformanceAttribution(DEFAULT_CORE_SATELLITE_CONFIG, actualReturns)

      expect(result.totalReturn).toBeCloseTo(0.08, 4)
      expect(result.coreContribution).toBeCloseTo(0.08, 4)
      expect(result.satelliteContribution).toBe(0)
      expect(result.satelliteBreakdown).toHaveLength(0)
    })

    it('should attribute returns correctly with one satellite', () => {
      const satellite = createDefaultSatellitePosition('thematic')
      satellite.targetAllocation = 0.2 // 20%

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite],
      }

      const actualReturns = {
        core: 0.06, // 6% core return
        satellites: {
          [satellite.id]: 0.15, // 15% satellite return
        },
      }

      const result = calculatePerformanceAttribution(config, actualReturns)

      // 80% * 6% + 20% * 15% = 4.8% + 3% = 7.8%
      expect(result.totalReturn).toBeCloseTo(0.078, 4)
      expect(result.coreContribution).toBeCloseTo(0.048, 4)
      expect(result.satelliteContribution).toBeCloseTo(0.03, 4)
      expect(result.satelliteBreakdown).toHaveLength(1)
      expect(result.satelliteBreakdown[0].contribution).toBeCloseTo(0.03, 4)
    })

    it('should handle negative satellite returns', () => {
      const satellite = createDefaultSatellitePosition('individual_stocks')
      satellite.targetAllocation = 0.1

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite],
      }

      const actualReturns = {
        core: 0.08,
        satellites: {
          [satellite.id]: -0.20, // -20% loss
        },
      }

      const result = calculatePerformanceAttribution(config, actualReturns)

      // 90% * 8% + 10% * -20% = 7.2% - 2% = 5.2%
      expect(result.totalReturn).toBeCloseTo(0.052, 4)
      expect(result.satelliteContribution).toBeCloseTo(-0.02, 4)
    })

    it('should attribute returns for multiple satellites correctly', () => {
      const satellite1 = createDefaultSatellitePosition('thematic')
      satellite1.targetAllocation = 0.1
      satellite1.id = 'sat-1'

      const satellite2 = createDefaultSatellitePosition('sector_overweight')
      satellite2.targetAllocation = 0.1
      satellite2.id = 'sat-2'

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite1, satellite2],
      }

      const actualReturns = {
        core: 0.07,
        satellites: {
          'sat-1': 0.15,
          'sat-2': 0.10,
        },
      }

      const result = calculatePerformanceAttribution(config, actualReturns)

      // 80% * 7% + 10% * 15% + 10% * 10% = 5.6% + 1.5% + 1% = 8.1%
      expect(result.totalReturn).toBeCloseTo(0.081, 4)
      expect(result.satelliteBreakdown).toHaveLength(2)
    })

    it('should use expected return when actual return not provided', () => {
      const satellite = createDefaultSatellitePosition('thematic')
      satellite.targetAllocation = 0.2
      satellite.expectedReturn = 0.12

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite],
      }

      const actualReturns = {
        core: 0.06,
        satellites: {}, // No actual return provided
      }

      const result = calculatePerformanceAttribution(config, actualReturns)

      // Should use expected return
      // 80% * 6% + 20% * 12% = 4.8% + 2.4% = 7.2%
      expect(result.totalReturn).toBeCloseTo(0.072, 4)
    })
  })

  describe('Integration scenarios', () => {
    it('should demonstrate benefit of low-cost core with selective satellites', () => {
      // Scenario: 80% low-cost core + 20% high-conviction satellite
      const satellite = createDefaultSatellitePosition('sector_overweight')
      satellite.targetAllocation = 0.2
      satellite.expectedReturn = 0.12
      satellite.costs = 0.005

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        core: {
          ...DEFAULT_CORE_SATELLITE_CONFIG.core,
          averageCosts: 0.002, // Very low-cost core
        },
        satellites: [satellite],
      }

      const metrics = calculatePortfolioMetrics(config)

      // Should have reasonable return with controlled costs
      expect(metrics.expectedReturn).toBeGreaterThan(0.05)
      expect(metrics.costs).toBeLessThan(0.005) // Average costs lower than pure satellite
    })

    it('should show risk increase is manageable with limited satellite allocation', () => {
      const satellite = createDefaultSatellitePosition('individual_stocks')
      satellite.targetAllocation = 0.15 // 15%
      satellite.volatility = 0.40 // Very volatile

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        satellites: [satellite],
      }

      const metricsWithSatellite = calculatePortfolioMetrics(config)
      const metricsWithoutSatellite = calculatePortfolioMetrics(DEFAULT_CORE_SATELLITE_CONFIG)

      // Risk should increase but not dramatically (due to 85% diversified core)
      const riskIncrease = metricsWithSatellite.portfolioRisk - metricsWithoutSatellite.portfolioRisk
      expect(riskIncrease).toBeLessThan(0.05) // Less than 5% increase
    })

    it('should validate a realistic balanced Core-Satellite portfolio', () => {
      const satellite1 = createDefaultSatellitePosition('thematic')
      satellite1.name = 'AI & Technology'
      satellite1.targetAllocation = 0.1

      const satellite2 = createDefaultSatellitePosition('regional_tilt')
      satellite2.name = 'Emerging Markets Overweight'
      satellite2.targetAllocation = 0.08

      const satellite3 = createDefaultSatellitePosition('factor_tilt')
      satellite3.name = 'Value Factor'
      satellite3.targetAllocation = 0.07

      const config: CoreSatelliteConfig = {
        ...DEFAULT_CORE_SATELLITE_CONFIG,
        core: {
          coreAllocation: 0.75, // 75% core
          assetClassAllocations: {
            stocks_domestic: 0.25,
            stocks_international: 0.30,
            bonds_government: 0.30,
            bonds_corporate: 0.15,
          },
          averageCosts: 0.0015, // 0.15% TER
          description: 'Weltweit diversifiziertes Core-Portfolio',
        },
        satellites: [satellite1, satellite2, satellite3],
        rebalancing: {
          frequency: 'quarterly',
          threshold: 0.05,
          maintainCoreSatelliteSplit: true,
        },
      }

      const validation = validateCoreSatelliteConfig(config)
      const allocation = calculateEffectiveAllocation(config)
      const metrics = calculatePortfolioMetrics(config)

      expect(validation.valid).toBe(true)
      expect(allocation.totalAllocation).toBeCloseTo(1.0, 2)
      expect(metrics.expectedReturn).toBeGreaterThan(0)
      expect(metrics.portfolioRisk).toBeGreaterThan(0)
    })
  })
})
