import { describe, it, expect } from 'vitest'
import {
  createDefaultMultiAssetConfig,
  validateMultiAssetConfig,
  getAssetClassLabel,
  getRebalancingFrequencyLabel,
  type AssetClass,
  type MultiAssetPortfolioConfig,
  DEFAULT_ASSET_CLASSES,
  ASSET_CORRELATION_MATRIX,
} from './multi-asset-portfolio'

describe('multi-asset-portfolio helpers', () => {
  describe('createDefaultMultiAssetConfig', () => {
    it('creates a valid default configuration', () => {
      const config = createDefaultMultiAssetConfig()

      expect(config.enabled).toBe(false)
      expect(config.assetClasses).toBeDefined()
      expect(config.rebalancing).toBeDefined()
      expect(config.simulation).toBeDefined()
    })

    it('includes all expected asset classes', () => {
      const config = createDefaultMultiAssetConfig()
      const assetClasses = Object.keys(config.assetClasses) as AssetClass[]

      expect(assetClasses).toContain('stocks_domestic')
      expect(assetClasses).toContain('stocks_international')
      expect(assetClasses).toContain('bonds_government')
      expect(assetClasses).toContain('bonds_corporate')
      expect(assetClasses).toContain('real_estate')
      expect(assetClasses).toContain('commodities')
      expect(assetClasses).toContain('cash')
    })

    it('has correct default allocations totaling 90%', () => {
      const config = createDefaultMultiAssetConfig()
      const enabledAssets = Object.values(config.assetClasses).filter(asset => asset.enabled)
      const totalAllocation = enabledAssets.reduce((sum, asset) => sum + asset.targetAllocation, 0)

      expect(totalAllocation).toBeCloseTo(0.9, 2) // 90% allocation for enabled assets
    })

    it('has realistic expected returns and volatilities', () => {
      const config = createDefaultMultiAssetConfig()

      // German stocks should have higher expected return and volatility
      expect(config.assetClasses.stocks_domestic.expectedReturn).toBe(0.08)
      expect(config.assetClasses.stocks_domestic.volatility).toBe(0.2)

      // Bonds should have lower expected return and volatility
      expect(config.assetClasses.bonds_government.expectedReturn).toBe(0.03)
      expect(config.assetClasses.bonds_government.volatility).toBe(0.05)

      // Cash should have lowest volatility
      expect(config.assetClasses.cash.volatility).toBe(0.0)
    })

    it('sets correct default rebalancing settings', () => {
      const config = createDefaultMultiAssetConfig()

      expect(config.rebalancing.frequency).toBe('annually')
      expect(config.rebalancing.threshold).toBe(0.05)
      expect(config.rebalancing.useThreshold).toBe(false)
    })

    it('sets correct default simulation settings', () => {
      const config = createDefaultMultiAssetConfig()

      expect(config.simulation.useCorrelation).toBe(true)
      expect(config.simulation.seed).toBeUndefined()
    })
  })

  describe('validateMultiAssetConfig', () => {
    let validConfig: MultiAssetPortfolioConfig

    beforeEach(() => {
      validConfig = createDefaultMultiAssetConfig()
      validConfig.enabled = true
    })

    it('detects allocation not totaling 100%', () => {
      const errors = validateMultiAssetConfig(validConfig)

      expect(errors).toContain('Die Gesamtallokation muss 100% betragen (aktuell: 90.0%)')
    })

    it('detects no enabled asset classes', () => {
      const noAssetsConfig = { ...validConfig }
      Object.keys(noAssetsConfig.assetClasses).forEach(key => {
        noAssetsConfig.assetClasses[key as AssetClass].enabled = false
      })

      const errors = validateMultiAssetConfig(noAssetsConfig)

      expect(errors).toContain('Mindestens eine Anlageklasse muss aktiviert sein')
    })

    it.skip('detects invalid allocation ranges', () => {
      validConfig.assetClasses.stocks_domestic.targetAllocation = 1.5 // 150%

      const errors = validateMultiAssetConfig(validConfig)

      console.log('Validation errors:', errors)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(error => error.includes('Allokation muss zwischen 0% und 100% liegen'))).toBe(true)
    })

    it.skip('detects invalid expected return ranges', () => {
      validConfig.assetClasses.stocks_domestic.expectedReturn = 0.8 // 80%

      const errors = validateMultiAssetConfig(validConfig)

      console.log('Expected return errors:', errors)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(error => error.includes('Erwartete Rendite muss zwischen -50% und 50% liegen'))).toBe(true)
    })

    it.skip('detects invalid volatility ranges', () => {
      validConfig.assetClasses.bonds_government.volatility = -0.1 // -10%

      const errors = validateMultiAssetConfig(validConfig)

      console.log('Volatility errors:', errors)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(error => error.includes('Volatilität muss zwischen 0% und 100% liegen'))).toBe(true)
    })

    it.skip('validates rebalancing threshold range', () => {
      validConfig.rebalancing.threshold = 0.5 // 50%

      const errors = validateMultiAssetConfig(validConfig)

      console.log('Rebalancing errors:', errors)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(error => error.includes('Rebalancing-Schwellenwert muss zwischen 0% und 50% liegen'))).toBe(
        true,
      )
    })

    it('validates multiple validation errors at once', () => {
      // Set allocation to 100% initially for single asset
      validConfig.assetClasses.stocks_domestic.targetAllocation = 1.0
      validConfig.assetClasses.stocks_domestic.enabled = true
      Object.keys(validConfig.assetClasses).forEach(key => {
        if (key !== 'stocks_domestic') {
          validConfig.assetClasses[key as AssetClass].enabled = false
        }
      })

      // Now introduce multiple errors (but keep total allocation valid)
      validConfig.assetClasses.stocks_domestic.expectedReturn = 0.8 // Invalid return (> 0.5)
      validConfig.assetClasses.stocks_domestic.volatility = -0.1 // Invalid volatility (< 0)
      validConfig.rebalancing.threshold = 0.6 // Invalid threshold (> 0.5)

      const errors = validateMultiAssetConfig(validConfig)

      // Should have 3 errors (return, volatility, threshold)
      expect(errors.length).toBe(3)
      expect(errors.some(error => error.includes('Erwartete Rendite muss zwischen -50% und 50% liegen'))).toBe(true)
      expect(errors.some(error => error.includes('Volatilität muss zwischen 0% und 100% liegen'))).toBe(true)
      expect(errors.some(error => error.includes('Rebalancing-Schwellenwert muss zwischen 0% und 50% liegen'))).toBe(
        true,
      )
    })

    it('returns no errors for valid 100% allocation config', () => {
      // Configure to 100% allocation with valid values
      validConfig.assetClasses.stocks_domestic.targetAllocation = 1.0
      validConfig.assetClasses.stocks_domestic.enabled = true
      validConfig.assetClasses.stocks_domestic.expectedReturn = 0.08 // Valid
      validConfig.assetClasses.stocks_domestic.volatility = 0.2 // Valid
      validConfig.rebalancing.threshold = 0.05 // Valid
      Object.keys(validConfig.assetClasses).forEach(key => {
        if (key !== 'stocks_domestic') {
          validConfig.assetClasses[key as AssetClass].enabled = false
        }
      })

      const errors = validateMultiAssetConfig(validConfig)

      expect(errors).toHaveLength(0)
    })

    it('validates invalid allocation and total allocation', () => {
      // Set allocation > 1.0 for a single enabled asset
      validConfig.assetClasses.stocks_domestic.targetAllocation = 1.5
      validConfig.assetClasses.stocks_domestic.enabled = true
      Object.keys(validConfig.assetClasses).forEach(key => {
        if (key !== 'stocks_domestic') {
          validConfig.assetClasses[key as AssetClass].enabled = false
        }
      })

      const errors = validateMultiAssetConfig(validConfig)

      // Should have 2 errors: total allocation wrong AND individual allocation out of range
      expect(errors.length).toBe(2)
      expect(errors.some(error => error.includes('Die Gesamtallokation muss 100% betragen'))).toBe(true)
      expect(errors.some(error => error.includes('Allokation muss zwischen 0% und 100% liegen'))).toBe(true)
    })
  })

  describe('getAssetClassLabel', () => {
    it('returns correct labels for all asset classes', () => {
      expect(getAssetClassLabel('stocks_domestic')).toBe('Deutsche/Europäische Aktien')
      expect(getAssetClassLabel('stocks_international')).toBe('Internationale Aktien')
      expect(getAssetClassLabel('bonds_government')).toBe('Staatsanleihen')
      expect(getAssetClassLabel('bonds_corporate')).toBe('Unternehmensanleihen')
      expect(getAssetClassLabel('real_estate')).toBe('Immobilien (REITs)')
      expect(getAssetClassLabel('commodities')).toBe('Rohstoffe')
      expect(getAssetClassLabel('cash')).toBe('Liquidität')
    })
  })

  describe('getRebalancingFrequencyLabel', () => {
    it('returns correct labels for all frequencies', () => {
      expect(getRebalancingFrequencyLabel('never')).toBe('Nie')
      expect(getRebalancingFrequencyLabel('annually')).toBe('Jährlich')
      expect(getRebalancingFrequencyLabel('quarterly')).toBe('Quartalsweise')
      expect(getRebalancingFrequencyLabel('monthly')).toBe('Monatlich')
    })
  })

  describe('DEFAULT_ASSET_CLASSES', () => {
    it('contains all required asset classes', () => {
      const assetClasses = Object.keys(DEFAULT_ASSET_CLASSES) as AssetClass[]

      expect(assetClasses).toHaveLength(7)
      expect(assetClasses).toContain('stocks_domestic')
      expect(assetClasses).toContain('stocks_international')
      expect(assetClasses).toContain('bonds_government')
      expect(assetClasses).toContain('bonds_corporate')
      expect(assetClasses).toContain('real_estate')
      expect(assetClasses).toContain('commodities')
      expect(assetClasses).toContain('cash')
    })

    it('has proper tax categories for each asset class', () => {
      expect(DEFAULT_ASSET_CLASSES.stocks_domestic.taxCategory).toBe('equity')
      expect(DEFAULT_ASSET_CLASSES.stocks_international.taxCategory).toBe('equity')
      expect(DEFAULT_ASSET_CLASSES.bonds_government.taxCategory).toBe('bond')
      expect(DEFAULT_ASSET_CLASSES.bonds_corporate.taxCategory).toBe('bond')
      expect(DEFAULT_ASSET_CLASSES.real_estate.taxCategory).toBe('reit')
      expect(DEFAULT_ASSET_CLASSES.commodities.taxCategory).toBe('commodity')
      expect(DEFAULT_ASSET_CLASSES.cash.taxCategory).toBe('cash')
    })
  })

  describe('ASSET_CORRELATION_MATRIX', () => {
    it('contains correlations for all asset classes', () => {
      const assetClasses = Object.keys(ASSET_CORRELATION_MATRIX) as AssetClass[]

      expect(assetClasses).toHaveLength(7)
      assetClasses.forEach(assetClass => {
        expect(ASSET_CORRELATION_MATRIX[assetClass]).toBeDefined()
        expect(typeof ASSET_CORRELATION_MATRIX[assetClass]).toBe('object')
      })
    })

    it('has self-correlation of 1.0 for all assets', () => {
      Object.keys(ASSET_CORRELATION_MATRIX).forEach(assetClass => {
        const correlations = ASSET_CORRELATION_MATRIX[assetClass as AssetClass]
        expect(correlations[assetClass as AssetClass]).toBe(1.0)
      })
    })

    it('has realistic correlation values', () => {
      // Correlations should be between -1 and 1
      Object.values(ASSET_CORRELATION_MATRIX).forEach(correlations => {
        Object.values(correlations).forEach(correlation => {
          if (correlation !== undefined) {
            expect(correlation).toBeGreaterThanOrEqual(-1)
            expect(correlation).toBeLessThanOrEqual(1)
          }
        })
      })
    })
  })
})
