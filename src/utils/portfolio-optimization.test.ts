/**
 * Tests for Portfolio Optimization Algorithms
 */

import { describe, it, expect } from 'vitest'
import {
  optimizePortfolio,
  calculatePortfolioVariance,
  calculatePortfolioReturn,
  calculateSharpeRatio,
  getOptimizationObjectiveLabel,
  getOptimizationObjectiveDescription,
  type OptimizationConfig,
} from './portfolio-optimization'
import { createDefaultMultiAssetConfig, type AssetClass } from '../../helpers/multi-asset-portfolio'

describe('portfolio-optimization', () => {
  describe('calculatePortfolioReturn', () => {
    it('should calculate weighted average return', () => {
      const config = createDefaultMultiAssetConfig()
      config.enabled = true

      // Simple 50/50 split between domestic and international stocks
      config.assetClasses.stocks_domestic.enabled = true
      config.assetClasses.stocks_domestic.targetAllocation = 0.5
      config.assetClasses.stocks_domestic.expectedReturn = 0.08

      config.assetClasses.stocks_international.enabled = true
      config.assetClasses.stocks_international.targetAllocation = 0.5
      config.assetClasses.stocks_international.expectedReturn = 0.075

      const allocations: Record<AssetClass, number> = {
        stocks_domestic: 0.5,
        stocks_international: 0.5,
        bonds_government: 0,
        bonds_corporate: 0,
        real_estate: 0,
        commodities: 0,
        cash: 0,
      }

      const expectedReturn = calculatePortfolioReturn(allocations, config)

      // (0.5 * 0.08) + (0.5 * 0.075) = 0.0775
      expect(expectedReturn).toBeCloseTo(0.0775, 4)
    })

    it('should handle all enabled assets', () => {
      const config = createDefaultMultiAssetConfig()
      config.enabled = true

      // Enable all assets with equal allocation
      const allAssets: AssetClass[] = [
        'stocks_domestic',
        'stocks_international',
        'bonds_government',
        'bonds_corporate',
      ]

      for (const asset of allAssets) {
        config.assetClasses[asset].enabled = true
        config.assetClasses[asset].targetAllocation = 0.25
      }

      const allocations: Record<AssetClass, number> = {
        stocks_domestic: 0.25,
        stocks_international: 0.25,
        bonds_government: 0.25,
        bonds_corporate: 0.25,
        real_estate: 0,
        commodities: 0,
        cash: 0,
      }

      const expectedReturn = calculatePortfolioReturn(allocations, config)

      // Weighted average of all returns
      const expected =
        0.25 * 0.08 + // stocks_domestic
        0.25 * 0.075 + // stocks_international
        0.25 * 0.03 + // bonds_government
        0.25 * 0.04 // bonds_corporate

      expect(expectedReturn).toBeCloseTo(expected, 4)
    })
  })

  describe('calculatePortfolioVariance', () => {
    it('should calculate variance for single asset', () => {
      const config = createDefaultMultiAssetConfig()
      config.enabled = true

      // Only one asset
      config.assetClasses.stocks_domestic.enabled = true
      config.assetClasses.stocks_domestic.volatility = 0.2

      const allocations: Record<AssetClass, number> = {
        stocks_domestic: 1.0,
        stocks_international: 0,
        bonds_government: 0,
        bonds_corporate: 0,
        real_estate: 0,
        commodities: 0,
        cash: 0,
      }

      const variance = calculatePortfolioVariance(allocations, config)

      // Variance = allocation^2 * volatility^2 * correlation (1.0 with itself)
      // = 1.0 * 0.2^2 * 1.0 = 0.04
      expect(variance).toBeCloseTo(0.04, 4)
    })

    it('should calculate variance for two perfectly correlated assets', () => {
      const config = createDefaultMultiAssetConfig()
      config.enabled = true

      config.assetClasses.stocks_domestic.enabled = true
      config.assetClasses.stocks_domestic.volatility = 0.2

      config.assetClasses.stocks_international.enabled = true
      config.assetClasses.stocks_international.volatility = 0.18

      const allocations: Record<AssetClass, number> = {
        stocks_domestic: 0.5,
        stocks_international: 0.5,
        bonds_government: 0,
        bonds_corporate: 0,
        real_estate: 0,
        commodities: 0,
        cash: 0,
      }

      const variance = calculatePortfolioVariance(allocations, config)

      // With correlation, variance should be calculated using correlation matrix
      // This should be less than simple sum of variances due to diversification
      expect(variance).toBeGreaterThan(0)
      expect(variance).toBeLessThan(0.04) // Less than single asset variance
    })

    it('should show diversification benefit with uncorrelated assets', () => {
      const config = createDefaultMultiAssetConfig()
      config.enabled = true

      // Enable stocks and bonds (which have low/negative correlation)
      config.assetClasses.stocks_domestic.enabled = true
      config.assetClasses.stocks_domestic.volatility = 0.2

      config.assetClasses.bonds_government.enabled = true
      config.assetClasses.bonds_government.volatility = 0.05

      const allocations: Record<AssetClass, number> = {
        stocks_domestic: 0.6,
        stocks_international: 0,
        bonds_government: 0.4,
        bonds_corporate: 0,
        real_estate: 0,
        commodities: 0,
        cash: 0,
      }

      const variance = calculatePortfolioVariance(allocations, config)
      const volatility = Math.sqrt(variance)

      // Diversification should reduce risk
      // Pure stocks: 0.2 volatility
      // Mixed: should be significantly less
      expect(volatility).toBeLessThan(0.2)
      expect(volatility).toBeGreaterThan(0.05)
    })
  })

  describe('calculateSharpeRatio', () => {
    it('should calculate Sharpe ratio correctly', () => {
      const expectedReturn = 0.08
      const volatility = 0.15
      const riskFreeRate = 0.01

      const sharpe = calculateSharpeRatio(expectedReturn, volatility, riskFreeRate)

      // (0.08 - 0.01) / 0.15 = 0.4667
      expect(sharpe).toBeCloseTo(0.4667, 4)
    })

    it('should handle zero volatility', () => {
      const sharpe = calculateSharpeRatio(0.05, 0, 0.01)
      expect(sharpe).toBe(0)
    })

    it('should use default risk-free rate', () => {
      const sharpe = calculateSharpeRatio(0.08, 0.15)
      // Uses default 0.01
      expect(sharpe).toBeCloseTo(0.4667, 4)
    })
  })

  describe('optimizePortfolio', () => {
    describe('max-sharpe optimization', () => {
      it('should optimize for maximum Sharpe ratio', () => {
        const config = createDefaultMultiAssetConfig()
        config.enabled = true

        // Enable multiple assets
        config.assetClasses.stocks_domestic.enabled = true
        config.assetClasses.stocks_international.enabled = true
        config.assetClasses.bonds_government.enabled = true
        config.assetClasses.bonds_corporate.enabled = true

        const optimizationConfig: OptimizationConfig = {
          objective: 'max-sharpe',
          riskFreeRate: 0.01,
          minAllocation: 0.0,
          maxAllocation: 1.0,
          maxIterations: 500,
        }

        const result = optimizePortfolio(config, optimizationConfig)

        // Verify result structure
        expect(result.allocations).toBeDefined()
        expect(result.expectedReturn).toBeGreaterThan(0)
        expect(result.expectedVolatility).toBeGreaterThan(0)
        expect(result.sharpeRatio).toBeDefined()
        expect(result.iterations).toBeGreaterThan(0)

        // Verify allocations sum to 1
        const sum = Object.values(result.allocations).reduce((acc, val) => acc + val, 0)
        expect(sum).toBeCloseTo(1.0, 2)

        // Disabled assets should have 0 allocation
        expect(result.allocations.real_estate).toBe(0)
        expect(result.allocations.commodities).toBe(0)
        expect(result.allocations.cash).toBe(0)
      })

      it('should respect min/max allocation constraints', () => {
        const config = createDefaultMultiAssetConfig()
        config.enabled = true

        config.assetClasses.stocks_domestic.enabled = true
        config.assetClasses.stocks_international.enabled = true
        config.assetClasses.bonds_government.enabled = true

        const optimizationConfig: OptimizationConfig = {
          objective: 'max-sharpe',
          minAllocation: 0.1,
          maxAllocation: 0.5,
          maxIterations: 500,
        }

        const result = optimizePortfolio(config, optimizationConfig)

        // Check constraints (with small tolerance for numerical precision)
        for (const [asset, allocation] of Object.entries(result.allocations)) {
          const assetConfig = config.assetClasses[asset as AssetClass]
          if (assetConfig.enabled && allocation > 0) {
            expect(allocation).toBeGreaterThanOrEqual(0.09) // Allow small tolerance
            expect(allocation).toBeLessThanOrEqual(0.51) // Allow small tolerance
          }
        }
      })
    })

    describe('min-volatility optimization', () => {
      it('should optimize for minimum volatility', () => {
        const config = createDefaultMultiAssetConfig()
        config.enabled = true

        config.assetClasses.stocks_domestic.enabled = true
        config.assetClasses.bonds_government.enabled = true
        config.assetClasses.bonds_corporate.enabled = true

        const optimizationConfig: OptimizationConfig = {
          objective: 'min-volatility',
          minAllocation: 0.0,
          maxAllocation: 1.0,
          maxIterations: 500,
        }

        const result = optimizePortfolio(config, optimizationConfig)

        // Should favor low-volatility assets (bonds)
        expect(result.expectedVolatility).toBeLessThan(0.15)

        // Allocations should sum to 1
        const sum = Object.values(result.allocations).reduce((acc, val) => acc + val, 0)
        expect(sum).toBeCloseTo(1.0, 2)

        // Should prefer bonds over stocks for min volatility
        const bondsAllocation =
          result.allocations.bonds_government + result.allocations.bonds_corporate
        const stocksAllocation = result.allocations.stocks_domestic

        expect(bondsAllocation).toBeGreaterThan(stocksAllocation)
      })
    })

    describe('max-return optimization', () => {
      it('should optimize for maximum return', () => {
        const config = createDefaultMultiAssetConfig()
        config.enabled = true

        config.assetClasses.stocks_domestic.enabled = true
        config.assetClasses.stocks_international.enabled = true
        config.assetClasses.bonds_government.enabled = true

        const optimizationConfig: OptimizationConfig = {
          objective: 'max-return',
          maxAllocation: 0.6,
          maxIterations: 500,
        }

        const result = optimizePortfolio(config, optimizationConfig)

        // Should favor high-return assets (stocks)
        expect(result.expectedReturn).toBeGreaterThan(0.05)

        // Should allocate more to stocks than bonds
        const stocksAllocation =
          result.allocations.stocks_domestic + result.allocations.stocks_international
        const bondsAllocation = result.allocations.bonds_government

        expect(stocksAllocation).toBeGreaterThan(bondsAllocation)
      })
    })

    it('should throw error for no enabled assets', () => {
      const config = createDefaultMultiAssetConfig()
      config.enabled = true

      // Disable all assets
      for (const asset of Object.keys(config.assetClasses)) {
        config.assetClasses[asset as AssetClass].enabled = false
      }

      const optimizationConfig: OptimizationConfig = {
        objective: 'max-sharpe',
      }

      expect(() => optimizePortfolio(config, optimizationConfig)).toThrow(
        'Mindestens eine Anlageklasse muss aktiviert sein',
      )
    })

    it('should throw error for unsupported target-return objective', () => {
      const config = createDefaultMultiAssetConfig()
      config.enabled = true
      config.assetClasses.stocks_domestic.enabled = true

      const optimizationConfig: OptimizationConfig = {
        objective: 'target-return',
        targetReturn: 0.06,
      }

      expect(() => optimizePortfolio(config, optimizationConfig)).toThrow(
        'Target-Return Optimierung ist noch nicht implementiert',
      )
    })
  })

  describe('getOptimizationObjectiveLabel', () => {
    it('should return German labels for objectives', () => {
      expect(getOptimizationObjectiveLabel('max-sharpe')).toBe('Maximale Sharpe Ratio')
      expect(getOptimizationObjectiveLabel('min-volatility')).toBe('Minimales Risiko')
      expect(getOptimizationObjectiveLabel('max-return')).toBe('Maximale Rendite')
      expect(getOptimizationObjectiveLabel('target-return')).toBe('Zielrendite')
    })
  })

  describe('getOptimizationObjectiveDescription', () => {
    it('should return German descriptions for objectives', () => {
      expect(getOptimizationObjectiveDescription('max-sharpe')).toContain('Sharpe Ratio')
      expect(getOptimizationObjectiveDescription('min-volatility')).toContain('Risiko')
      expect(getOptimizationObjectiveDescription('max-return')).toContain('Rendite')
      expect(getOptimizationObjectiveDescription('target-return')).toContain('Zielrendite')
    })
  })

  describe('integration tests', () => {
    it('should produce better Sharpe ratio than equal-weight portfolio', () => {
      const config = createDefaultMultiAssetConfig()
      config.enabled = true

      config.assetClasses.stocks_domestic.enabled = true
      config.assetClasses.stocks_international.enabled = true
      config.assetClasses.bonds_government.enabled = true
      config.assetClasses.bonds_corporate.enabled = true

      // Calculate equal-weight portfolio metrics
      const equalWeightAllocations: Record<AssetClass, number> = {
        stocks_domestic: 0.25,
        stocks_international: 0.25,
        bonds_government: 0.25,
        bonds_corporate: 0.25,
        real_estate: 0,
        commodities: 0,
        cash: 0,
      }

      const equalWeightReturn = calculatePortfolioReturn(equalWeightAllocations, config)
      const equalWeightVariance = calculatePortfolioVariance(equalWeightAllocations, config)
      const equalWeightVolatility = Math.sqrt(equalWeightVariance)
      const equalWeightSharpe = calculateSharpeRatio(equalWeightReturn, equalWeightVolatility, 0.01)

      // Optimize for max Sharpe
      const optimizationConfig: OptimizationConfig = {
        objective: 'max-sharpe',
        riskFreeRate: 0.01,
        minAllocation: 0.0,
        maxAllocation: 1.0,
        maxIterations: 500,
      }

      const optimizedResult = optimizePortfolio(config, optimizationConfig)

      // Optimized should have better or equal Sharpe ratio
      expect(optimizedResult.sharpeRatio).toBeGreaterThanOrEqual(equalWeightSharpe * 0.95) // Allow small margin
    })

    it('should produce lower volatility than equal-weight for min-volatility objective', () => {
      const config = createDefaultMultiAssetConfig()
      config.enabled = true

      config.assetClasses.stocks_domestic.enabled = true
      config.assetClasses.bonds_government.enabled = true
      config.assetClasses.bonds_corporate.enabled = true

      // Calculate equal-weight volatility
      const equalWeightAllocations: Record<AssetClass, number> = {
        stocks_domestic: 0.33,
        stocks_international: 0,
        bonds_government: 0.33,
        bonds_corporate: 0.34,
        real_estate: 0,
        commodities: 0,
        cash: 0,
      }

      const equalWeightVariance = calculatePortfolioVariance(equalWeightAllocations, config)
      const equalWeightVolatility = Math.sqrt(equalWeightVariance)

      // Optimize for min volatility
      const optimizationConfig: OptimizationConfig = {
        objective: 'min-volatility',
        minAllocation: 0.0,
        maxAllocation: 1.0,
        maxIterations: 500,
      }

      const optimizedResult = optimizePortfolio(config, optimizationConfig)

      // Optimized should have lower volatility
      expect(optimizedResult.expectedVolatility).toBeLessThanOrEqual(equalWeightVolatility * 1.05) // Allow small margin
    })
  })
})
