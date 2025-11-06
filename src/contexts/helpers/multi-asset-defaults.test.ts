import { describe, test, expect } from 'vitest'
import { createFallbackMultiAssetConfig, createFallbackWithdrawalConfig } from './multi-asset-defaults'

describe('multi-asset-defaults', () => {
  describe('createFallbackMultiAssetConfig', () => {
    test('should create a valid savings phase configuration', () => {
      const config = createFallbackMultiAssetConfig()

      // Verify structure
      expect(config).toBeDefined()
      expect(config.enabled).toBe(false)
      expect(config.assetClasses).toBeDefined()
      expect(config.rebalancing).toBeDefined()
      expect(config.simulation).toBeDefined()

      // Verify asset classes
      expect(config.assetClasses.stocks_domestic).toBeDefined()
      expect(config.assetClasses.stocks_domestic.name).toBe('Deutsche/Europäische Aktien')
      expect(config.assetClasses.stocks_domestic.expectedReturn).toBe(0.08)
      expect(config.assetClasses.stocks_domestic.volatility).toBe(0.2)
      expect(config.assetClasses.stocks_domestic.targetAllocation).toBe(0.4)
      expect(config.assetClasses.stocks_domestic.enabled).toBe(true)
      expect(config.assetClasses.stocks_domestic.taxCategory).toBe('equity')

      // Verify all asset classes are present
      expect(Object.keys(config.assetClasses)).toEqual([
        'stocks_domestic',
        'stocks_international',
        'bonds_government',
        'bonds_corporate',
        'real_estate',
        'commodities',
        'cash',
      ])

      // Verify rebalancing config
      expect(config.rebalancing.frequency).toBe('annually')
      expect(config.rebalancing.threshold).toBe(0.05)
      expect(config.rebalancing.useThreshold).toBe(false)

      // Verify simulation config
      expect(config.simulation.useCorrelation).toBe(true)
      expect(config.simulation.seed).toBeUndefined()
    })

    test('should have all expected asset classes configured', () => {
      const config = createFallbackMultiAssetConfig()

      const enabledAssets = Object.values(config.assetClasses).filter((asset) => asset.enabled)
      const totalAllocation = enabledAssets.reduce((sum, asset) => sum + asset.targetAllocation, 0)

      // In savings phase, not all assets are enabled by default
      // stocks_domestic (0.4) + stocks_international (0.2) + bonds_government (0.2) + bonds_corporate (0.1) = 0.9
      expect(totalAllocation).toBe(0.9)
      expect(enabledAssets).toHaveLength(4)
    })
  })

  describe('createFallbackWithdrawalConfig', () => {
    test('should create a valid withdrawal phase configuration', () => {
      const config = createFallbackWithdrawalConfig()

      // Verify structure
      expect(config).toBeDefined()
      expect(config.enabled).toBe(false)
      expect(config.assetClasses).toBeDefined()
      expect(config.rebalancing).toBeDefined()
      expect(config.simulation).toBeDefined()

      // Verify asset classes (withdrawal phase is more conservative)
      expect(config.assetClasses.stocks_domestic).toBeDefined()
      expect(config.assetClasses.stocks_domestic.expectedReturn).toBe(0.06)
      expect(config.assetClasses.stocks_domestic.volatility).toBe(0.18)
      expect(config.assetClasses.stocks_domestic.targetAllocation).toBe(0.3)
      expect(config.assetClasses.stocks_domestic.enabled).toBe(true)
      expect(config.assetClasses.stocks_domestic.taxCategory).toBe('equity')

      // Verify all asset classes are present
      expect(Object.keys(config.assetClasses)).toEqual([
        'stocks_domestic',
        'stocks_international',
        'bonds_government',
        'bonds_corporate',
        'real_estate',
        'commodities',
        'cash',
      ])

      // Verify rebalancing config
      expect(config.rebalancing.frequency).toBe('annually')
      expect(config.rebalancing.threshold).toBe(0.05)
      expect(config.rebalancing.useThreshold).toBe(false)

      // Verify simulation config
      expect(config.simulation.useCorrelation).toBe(true)
      expect(config.simulation.seed).toBeUndefined()
    })

    test('should have all expected asset classes configured', () => {
      const config = createFallbackWithdrawalConfig()

      const enabledAssets = Object.values(config.assetClasses).filter((asset) => asset.enabled)
      const totalAllocation = enabledAssets.reduce((sum, asset) => sum + asset.targetAllocation, 0)

      // In withdrawal phase, not all assets are enabled by default
      // stocks_domestic (0.3) + stocks_international (0.15) + bonds_government (0.35) + bonds_corporate (0.15) = 0.95
      expect(totalAllocation).toBe(0.95)
      expect(enabledAssets).toHaveLength(4)
    })

    test('should have more conservative allocations than savings phase', () => {
      const savingsConfig = createFallbackMultiAssetConfig()
      const withdrawalConfig = createFallbackWithdrawalConfig()

      // Withdrawal phase should have lower stock allocation
      const savingsStockAllocation =
        savingsConfig.assetClasses.stocks_domestic.targetAllocation +
        savingsConfig.assetClasses.stocks_international.targetAllocation
      const withdrawalStockAllocation =
        withdrawalConfig.assetClasses.stocks_domestic.targetAllocation +
        withdrawalConfig.assetClasses.stocks_international.targetAllocation

      expect(withdrawalStockAllocation).toBeLessThan(savingsStockAllocation)

      // Withdrawal phase should have higher bond allocation
      const savingsBondAllocation =
        savingsConfig.assetClasses.bonds_government.targetAllocation +
        savingsConfig.assetClasses.bonds_corporate.targetAllocation
      const withdrawalBondAllocation =
        withdrawalConfig.assetClasses.bonds_government.targetAllocation +
        withdrawalConfig.assetClasses.bonds_corporate.targetAllocation

      expect(withdrawalBondAllocation).toBeGreaterThan(savingsBondAllocation)
    })
  })
})
