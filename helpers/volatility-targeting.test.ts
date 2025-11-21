import { describe, it, expect, beforeEach } from 'vitest'
import {
  createDefaultVolatilityTargetingConfig,
  calculateRealizedVolatility,
  calculateScalingFactor,
  isRiskyAsset,
  applyVolatilityTargeting,
  getStrategyName,
  getStrategyDescription,
  validateVolatilityTargetingConfig,
  type VolatilityTargetingConfig,
  type HistoricalReturns,
} from './volatility-targeting'
import { createDefaultMultiAssetConfig, type AssetClass } from './multi-asset-portfolio'

describe('volatility-targeting', () => {
  describe('createDefaultVolatilityTargetingConfig', () => {
    it('creates a valid default configuration', () => {
      const config = createDefaultVolatilityTargetingConfig()

      expect(config.enabled).toBe(false)
      expect(config.targetVolatility).toBe(0.1)
      expect(config.strategy).toBe('simple')
      expect(config.lookbackYears).toBe(3)
      expect(config.minRiskyAllocation).toBe(0.2)
      expect(config.maxRiskyAllocation).toBe(1.0)
      expect(config.smoothingFactor).toBe(0.3)
    })

    it('has reasonable default values', () => {
      const config = createDefaultVolatilityTargetingConfig()

      expect(config.targetVolatility).toBeGreaterThan(0)
      expect(config.targetVolatility).toBeLessThan(1)
      expect(config.minRiskyAllocation).toBeLessThanOrEqual(config.maxRiskyAllocation)
      expect(config.smoothingFactor).toBeGreaterThanOrEqual(0)
      expect(config.smoothingFactor).toBeLessThanOrEqual(1)
    })
  })

  describe('calculateRealizedVolatility', () => {
    it('returns 0 for empty returns', () => {
      const historicalReturns: HistoricalReturns = { returns: [], periods: 0 }
      const volatility = calculateRealizedVolatility(historicalReturns)

      expect(volatility).toBe(0)
    })

    it('calculates volatility correctly for simple returns', () => {
      // Returns with known volatility: [0.1, -0.1, 0.1, -0.1]
      // Mean = 0, Variance = 0.01, StdDev = 0.1
      const historicalReturns: HistoricalReturns = {
        returns: [0.1, -0.1, 0.1, -0.1],
        periods: 4,
      }
      const volatility = calculateRealizedVolatility(historicalReturns, 0)

      expect(volatility).toBeCloseTo(0.1, 5)
    })

    it('calculates volatility with exponential weighting', () => {
      const historicalReturns: HistoricalReturns = {
        returns: [0.05, 0.07, -0.03, 0.1],
        periods: 4,
      }
      const volatility = calculateRealizedVolatility(historicalReturns, 0.3)

      expect(volatility).toBeGreaterThan(0)
      expect(volatility).toBeLessThan(1)
    })

    it('handles single return correctly', () => {
      const historicalReturns: HistoricalReturns = {
        returns: [0.05],
        periods: 1,
      }
      const volatility = calculateRealizedVolatility(historicalReturns)

      expect(volatility).toBe(0)
    })

    it('produces higher volatility for more variable returns', () => {
      const lowVolReturns: HistoricalReturns = {
        returns: [0.05, 0.051, 0.049, 0.05],
        periods: 4,
      }
      const highVolReturns: HistoricalReturns = {
        returns: [0.1, -0.1, 0.2, -0.15],
        periods: 4,
      }

      const lowVol = calculateRealizedVolatility(lowVolReturns)
      const highVol = calculateRealizedVolatility(highVolReturns)

      expect(highVol).toBeGreaterThan(lowVol)
    })
  })

  describe('calculateScalingFactor', () => {
    it('returns 1.0 when realized equals target', () => {
      const scale = calculateScalingFactor(0.15, 0.15)

      expect(scale).toBeCloseTo(1.0, 5)
    })

    it('returns value < 1 when realized > target (reduce exposure)', () => {
      const scale = calculateScalingFactor(0.2, 0.1) // Realized 20%, target 10%

      expect(scale).toBeLessThan(1.0)
      expect(scale).toBeCloseTo(0.5, 5)
    })

    it('would increase exposure when realized < target (but capped at max)', () => {
      const scale = calculateScalingFactor(0.05, 0.1) // Realized 5%, target 10%
      // Scaling factor would be 2.0 (0.1/0.05), but capped at maxScale (1.0 by default)
      expect(scale).toBe(1.0)
    })

    it('respects minimum scaling factor', () => {
      const scale = calculateScalingFactor(0.5, 0.1, 0.3, 1.0) // Very high realized vol

      expect(scale).toBeGreaterThanOrEqual(0.3)
      expect(scale).toBeCloseTo(0.3, 5)
    })

    it('respects maximum scaling factor', () => {
      const scale = calculateScalingFactor(0.02, 0.1, 0.2, 0.8) // Very low realized vol

      expect(scale).toBeLessThanOrEqual(0.8)
      expect(scale).toBeCloseTo(0.8, 5)
    })

    it('handles zero realized volatility', () => {
      const scale = calculateScalingFactor(0, 0.1)

      expect(scale).toBe(1.0)
    })
  })

  describe('isRiskyAsset', () => {
    it('classifies stocks as risky', () => {
      expect(isRiskyAsset('stocks_domestic')).toBe(true)
      expect(isRiskyAsset('stocks_international')).toBe(true)
    })

    it('classifies corporate bonds as risky', () => {
      expect(isRiskyAsset('bonds_corporate')).toBe(true)
    })

    it('classifies REITs as risky', () => {
      expect(isRiskyAsset('real_estate')).toBe(true)
    })

    it('classifies commodities as risky', () => {
      expect(isRiskyAsset('commodities')).toBe(true)
    })

    it('classifies government bonds as safe', () => {
      expect(isRiskyAsset('bonds_government')).toBe(false)
    })

    it('classifies cash as safe', () => {
      expect(isRiskyAsset('cash')).toBe(false)
    })
  })

  describe('applyVolatilityTargeting', () => {
    let assetClasses: ReturnType<typeof createDefaultMultiAssetConfig>['assetClasses']
    let config: VolatilityTargetingConfig
    let historicalReturns: HistoricalReturns

    beforeEach(() => {
      const multiAssetConfig = createDefaultMultiAssetConfig()
      assetClasses = multiAssetConfig.assetClasses
      config = createDefaultVolatilityTargetingConfig()
      historicalReturns = {
        returns: [0.07, 0.05, -0.03, 0.1, 0.08],
        periods: 5,
      }
    })

    it('returns original allocations when disabled', () => {
      config.enabled = false

      const result = applyVolatilityTargeting(assetClasses, historicalReturns, config)

      expect(result.wasAdjusted).toBe(false)
      expect(result.scalingFactor).toBe(1.0)

      // Check that allocations match originals
      Object.keys(assetClasses).forEach(key => {
        const assetClass = key as AssetClass
        expect(result.adjustedAllocations[assetClass]).toBe(result.originalAllocations[assetClass])
      })
    })

    it('returns original allocations when strategy is none', () => {
      config.enabled = true
      config.strategy = 'none'

      const result = applyVolatilityTargeting(assetClasses, historicalReturns, config)

      expect(result.wasAdjusted).toBe(false)
      expect(result.scalingFactor).toBe(1.0)
    })

    it('calculates realized volatility correctly', () => {
      config.enabled = true

      const result = applyVolatilityTargeting(assetClasses, historicalReturns, config)

      expect(result.realizedVolatility).toBeGreaterThan(0)
      expect(result.targetVolatility).toBe(config.targetVolatility)
    })

    it('reduces risky allocation when volatility is high', () => {
      config.enabled = true
      config.targetVolatility = 0.02 // Very low target
      // Historical returns with high volatility
      const highVolReturns: HistoricalReturns = {
        returns: [0.15, -0.2, 0.25, -0.1, 0.3],
        periods: 5,
      }

      const result = applyVolatilityTargeting(assetClasses, highVolReturns, config)

      expect(result.scalingFactor).toBeLessThan(1.0)
      expect(result.wasAdjusted).toBe(true)

      // Risky assets should be scaled down
      const riskyAssets: AssetClass[] = ['stocks_domestic', 'stocks_international']
      riskyAssets.forEach(asset => {
        if (assetClasses[asset].enabled && result.originalAllocations[asset] > 0) {
          expect(result.adjustedAllocations[asset]).toBeLessThan(result.originalAllocations[asset])
        }
      })
    })

    it('maintains allocation sum of 1.0', () => {
      config.enabled = true

      const result = applyVolatilityTargeting(assetClasses, historicalReturns, config)

      const totalAllocation = Object.values(result.adjustedAllocations).reduce((sum, val) => sum + val, 0)

      expect(totalAllocation).toBeCloseTo(1.0, 5)
    })

    it('respects minimum and maximum risky allocation constraints', () => {
      config.enabled = true
      config.minRiskyAllocation = 0.3
      config.maxRiskyAllocation = 0.8

      const result = applyVolatilityTargeting(assetClasses, historicalReturns, config)

      const riskyAssets: AssetClass[] = [
        'stocks_domestic',
        'stocks_international',
        'bonds_corporate',
        'real_estate',
        'commodities',
      ]
      const totalRiskyAllocation = riskyAssets.reduce((sum, asset) => {
        return sum + (assetClasses[asset].enabled ? result.adjustedAllocations[asset] : 0)
      }, 0)

      expect(totalRiskyAllocation).toBeGreaterThanOrEqual(config.minRiskyAllocation - 0.01)
      expect(totalRiskyAllocation).toBeLessThanOrEqual(config.maxRiskyAllocation + 0.01)
    })

    it('handles disabled assets correctly', () => {
      config.enabled = true
      // Disable some assets
      assetClasses.commodities.enabled = false
      assetClasses.real_estate.enabled = false

      const result = applyVolatilityTargeting(assetClasses, historicalReturns, config)

      expect(result.adjustedAllocations.commodities).toBe(0)
      expect(result.adjustedAllocations.real_estate).toBe(0)
    })

    it('provides meaningful explanation in German', () => {
      config.enabled = true

      const result = applyVolatilityTargeting(assetClasses, historicalReturns, config)

      expect(result.explanation).toBeTruthy()
      expect(result.explanation.length).toBeGreaterThan(0)
      expect(typeof result.explanation).toBe('string')
    })

    it('works with simple strategy', () => {
      config.enabled = true
      config.strategy = 'simple'

      const result = applyVolatilityTargeting(assetClasses, historicalReturns, config)

      expect(result).toBeDefined()
      expect(result.adjustedAllocations).toBeDefined()
    })

    it('works with inverse strategy', () => {
      config.enabled = true
      config.strategy = 'inverse'

      const result = applyVolatilityTargeting(assetClasses, historicalReturns, config)

      expect(result).toBeDefined()
      expect(result.adjustedAllocations).toBeDefined()
    })

    it('works with risk_parity strategy', () => {
      config.enabled = true
      config.strategy = 'risk_parity'

      const result = applyVolatilityTargeting(assetClasses, historicalReturns, config)

      expect(result).toBeDefined()
      expect(result.adjustedAllocations).toBeDefined()
    })
  })

  describe('getStrategyName', () => {
    it('returns German names for all strategies', () => {
      expect(getStrategyName('none')).toBe('Keine')
      expect(getStrategyName('simple')).toBe('Einfache Skalierung')
      expect(getStrategyName('inverse')).toBe('Inverse Volatilitätsgewichtung')
      expect(getStrategyName('risk_parity')).toBe('Risk Parity')
    })
  })

  describe('getStrategyDescription', () => {
    it('returns meaningful descriptions in German', () => {
      const strategies: Array<VolatilityTargetingConfig['strategy']> = [
        'none',
        'simple',
        'inverse',
        'risk_parity',
      ]

      strategies.forEach(strategy => {
        const description = getStrategyDescription(strategy)
        expect(description).toBeTruthy()
        expect(description.length).toBeGreaterThan(20)
        expect(typeof description).toBe('string')
      })
    })
  })

  describe('validateVolatilityTargetingConfig', () => {
    let validConfig: VolatilityTargetingConfig

    beforeEach(() => {
      validConfig = createDefaultVolatilityTargetingConfig()
    })

    it('validates a correct configuration with no errors', () => {
      const errors = validateVolatilityTargetingConfig(validConfig)

      expect(errors).toHaveLength(0)
    })

    it('detects invalid target volatility', () => {
      validConfig.targetVolatility = 1.5 // > 1.0
      const errors = validateVolatilityTargetingConfig(validConfig)

      expect(errors).toContain('Ziel-Volatilität muss zwischen 0% und 100% liegen')
    })

    it('detects negative target volatility', () => {
      validConfig.targetVolatility = -0.1
      const errors = validateVolatilityTargetingConfig(validConfig)

      expect(errors).toContain('Ziel-Volatilität muss zwischen 0% und 100% liegen')
    })

    it('detects invalid lookback years', () => {
      validConfig.lookbackYears = 0
      const errors1 = validateVolatilityTargetingConfig(validConfig)
      expect(errors1).toContain('Lookback-Periode muss zwischen 1 und 10 Jahren liegen')

      validConfig.lookbackYears = 15
      const errors2 = validateVolatilityTargetingConfig(validConfig)
      expect(errors2).toContain('Lookback-Periode muss zwischen 1 und 10 Jahren liegen')
    })

    it('detects invalid min risky allocation', () => {
      validConfig.minRiskyAllocation = -0.1
      const errors1 = validateVolatilityTargetingConfig(validConfig)
      expect(errors1).toContain('Minimale Risikoallokation muss zwischen 0% und 100% liegen')

      validConfig.minRiskyAllocation = 1.5
      const errors2 = validateVolatilityTargetingConfig(validConfig)
      expect(errors2).toContain('Minimale Risikoallokation muss zwischen 0% und 100% liegen')
    })

    it('detects invalid max risky allocation', () => {
      validConfig.maxRiskyAllocation = -0.1
      const errors1 = validateVolatilityTargetingConfig(validConfig)
      expect(errors1).toContain('Maximale Risikoallokation muss zwischen 0% und 100% liegen')

      validConfig.maxRiskyAllocation = 1.5
      const errors2 = validateVolatilityTargetingConfig(validConfig)
      expect(errors2).toContain('Maximale Risikoallokation muss zwischen 0% und 100% liegen')
    })

    it('detects min > max risky allocation', () => {
      validConfig.minRiskyAllocation = 0.8
      validConfig.maxRiskyAllocation = 0.5
      const errors = validateVolatilityTargetingConfig(validConfig)

      expect(errors).toContain('Minimale Risikoallokation darf nicht größer als maximale sein')
    })

    it('detects invalid smoothing factor', () => {
      validConfig.smoothingFactor = -0.1
      const errors1 = validateVolatilityTargetingConfig(validConfig)
      expect(errors1).toContain('Glättungsfaktor muss zwischen 0 und 1 liegen')

      validConfig.smoothingFactor = 1.5
      const errors2 = validateVolatilityTargetingConfig(validConfig)
      expect(errors2).toContain('Glättungsfaktor muss zwischen 0 und 1 liegen')
    })

    it('accumulates multiple errors', () => {
      validConfig.targetVolatility = 1.5
      validConfig.lookbackYears = 0
      validConfig.minRiskyAllocation = 1.5

      const errors = validateVolatilityTargetingConfig(validConfig)

      expect(errors.length).toBeGreaterThan(1)
    })
  })
})
