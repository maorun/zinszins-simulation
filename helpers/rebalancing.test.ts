/**
 * Tests for cost-based rebalancing strategy
 */

import { describe, it, expect } from 'vitest'
import {
  type TransactionCostConfig,
  createDefaultTransactionCostConfig,
  createDefaultRebalancingTaxConfig,
  calculateTransactionCost,
  calculateTaxableGains,
  calculateCapitalGainsTax,
  calculateRebalancingCostBenefit,
  optimizeRebalancingTrades,
  shouldSkipSmallTransactions,
} from './rebalancing'

describe('rebalancing', () => {
  describe('createDefaultTransactionCostConfig', () => {
    it('should create default transaction cost configuration', () => {
      const config = createDefaultTransactionCostConfig()

      expect(config.percentageCost).toBe(0.001) // 0.1%
      expect(config.fixedCost).toBe(0)
      expect(config.minTransactionSize).toBe(100)
    })
  })

  describe('createDefaultRebalancingTaxConfig', () => {
    it('should create default rebalancing tax configuration', () => {
      const config = createDefaultRebalancingTaxConfig()

      expect(config.kapitalertragsteuer).toBe(0.26375) // 26.375%
      expect(config.freibetragAvailable).toBe(2000)
      expect(config.teilfreistellungsquoten.equity).toBe(0.3)
      expect(config.teilfreistellungsquoten.bond).toBe(0.0)
      expect(config.teilfreistellungsquoten.reit).toBe(0.2)
      expect(config.teilfreistellungsquoten.commodity).toBe(0.0)
      expect(config.teilfreistellungsquoten.cash).toBe(0.0)
    })
  })

  describe('calculateTransactionCost', () => {
    it('should calculate percentage-based transaction cost', () => {
      const config: TransactionCostConfig = {
        percentageCost: 0.001, // 0.1%
        fixedCost: 0,
        minTransactionSize: 100,
      }

      const cost = calculateTransactionCost(10000, config)
      expect(cost).toBe(10) // 10,000 * 0.1% = 10
    })

    it('should calculate fixed transaction cost', () => {
      const config: TransactionCostConfig = {
        percentageCost: 0,
        fixedCost: 5,
        minTransactionSize: 100,
      }

      const cost = calculateTransactionCost(10000, config)
      expect(cost).toBe(5)
    })

    it('should calculate combined transaction cost', () => {
      const config: TransactionCostConfig = {
        percentageCost: 0.001, // 0.1%
        fixedCost: 5,
        minTransactionSize: 100,
      }

      const cost = calculateTransactionCost(10000, config)
      expect(cost).toBe(15) // 10 + 5
    })

    it('should handle zero amount', () => {
      const config = createDefaultTransactionCostConfig()
      const cost = calculateTransactionCost(0, config)
      expect(cost).toBe(0)
    })
  })

  describe('calculateTaxableGains', () => {
    const taxConfig = createDefaultRebalancingTaxConfig()

    it('should apply 30% Teilfreistellung for equity funds', () => {
      const capitalGains = 1000
      const taxableGains = calculateTaxableGains(capitalGains, 'equity', taxConfig)

      expect(taxableGains).toBe(700) // 1000 * (1 - 0.3)
    })

    it('should apply 0% Teilfreistellung for bonds', () => {
      const capitalGains = 1000
      const taxableGains = calculateTaxableGains(capitalGains, 'bond', taxConfig)

      expect(taxableGains).toBe(1000) // No exemption
    })

    it('should apply 20% Teilfreistellung for REITs', () => {
      const capitalGains = 1000
      const taxableGains = calculateTaxableGains(capitalGains, 'reit', taxConfig)

      expect(taxableGains).toBe(800) // 1000 * (1 - 0.2)
    })

    it('should handle negative gains (losses)', () => {
      const capitalGains = -500
      const taxableGains = calculateTaxableGains(capitalGains, 'equity', taxConfig)

      expect(taxableGains).toBe(-350) // -500 * (1 - 0.3)
    })

    it('should handle zero gains', () => {
      const capitalGains = 0
      const taxableGains = calculateTaxableGains(capitalGains, 'equity', taxConfig)

      expect(taxableGains).toBe(0)
    })
  })

  describe('calculateCapitalGainsTax', () => {
    const taxConfig = createDefaultRebalancingTaxConfig()

    it('should calculate tax without using Freibetrag', () => {
      const result = calculateCapitalGainsTax(1000, 0, taxConfig)

      expect(result.tax).toBeCloseTo(263.75, 2) // 1000 * 26.375%
      expect(result.freibetragUsed).toBe(0)
      expect(result.freibetragRemaining).toBe(0)
    })

    it('should use Freibetrag to reduce tax', () => {
      const result = calculateCapitalGainsTax(3000, 2000, taxConfig)

      // 3000 - 2000 = 1000 taxable after Freibetrag
      expect(result.tax).toBeCloseTo(263.75, 2) // 1000 * 26.375%
      expect(result.freibetragUsed).toBe(2000)
      expect(result.freibetragRemaining).toBe(0)
    })

    it('should fully use Freibetrag when gains are smaller', () => {
      const result = calculateCapitalGainsTax(1500, 2000, taxConfig)

      expect(result.tax).toBe(0) // All gains covered by Freibetrag
      expect(result.freibetragUsed).toBe(1500)
      expect(result.freibetragRemaining).toBe(500)
    })

    it('should handle zero gains', () => {
      const result = calculateCapitalGainsTax(0, 2000, taxConfig)

      expect(result.tax).toBe(0)
      expect(result.freibetragUsed).toBe(0)
      expect(result.freibetragRemaining).toBe(2000)
    })

    it('should handle negative gains (losses)', () => {
      const result = calculateCapitalGainsTax(-500, 2000, taxConfig)

      expect(result.tax).toBe(0)
      expect(result.freibetragUsed).toBe(0)
      expect(result.freibetragRemaining).toBe(2000)
    })
  })

  describe('calculateRebalancingCostBenefit', () => {
    it('should recommend rebalancing when costs are low', () => {
      const result = calculateRebalancingCostBenefit(
        50, // transaction costs
        100, // tax costs
        0.1, // 10% drift
        100000, // portfolio value
        0.01 // 1% cost threshold
      )

      expect(result.totalTransactionCosts).toBe(50)
      expect(result.totalTaxCosts).toBe(100)
      expect(result.totalCosts).toBe(150)
      expect(result.expectedBenefit).toBe(1000) // 10% * 100000 * 0.1
      expect(result.netBenefit).toBe(850) // 1000 - 150
      expect(result.recommendRebalancing).toBe(true)
      expect(result.reason).toContain('empfohlen')
    })

    it('should not recommend rebalancing when costs exceed threshold', () => {
      const result = calculateRebalancingCostBenefit(
        500, // transaction costs
        500, // tax costs
        0.05, // 5% drift
        100000, // portfolio value
        0.005 // 0.5% cost threshold
      )

      expect(result.totalCosts).toBe(1000)
      expect(result.recommendRebalancing).toBe(false)
      expect(result.reason).toContain('überschreiten Schwellenwert')
    })

    it('should not recommend rebalancing when net benefit is negative', () => {
      const result = calculateRebalancingCostBenefit(
        500, // transaction costs
        600, // tax costs
        0.02, // 2% drift
        100000, // portfolio value
        0.02 // 2% cost threshold
      )

      expect(result.totalCosts).toBe(1100)
      expect(result.expectedBenefit).toBe(200) // 2% * 100000 * 0.1
      expect(result.netBenefit).toBe(-900)
      expect(result.recommendRebalancing).toBe(false)
      expect(result.reason).toContain('negativ')
    })

    it('should handle zero costs', () => {
      const result = calculateRebalancingCostBenefit(0, 0, 0.1, 100000, 0.01)

      expect(result.totalCosts).toBe(0)
      expect(result.netBenefit).toBeGreaterThan(0)
      expect(result.recommendRebalancing).toBe(true)
    })

    it('should handle zero drift', () => {
      const result = calculateRebalancingCostBenefit(100, 50, 0, 100000, 0.01)

      expect(result.expectedBenefit).toBe(0)
      expect(result.netBenefit).toBe(-150)
      expect(result.recommendRebalancing).toBe(false)
    })
  })

  describe('optimizeRebalancingTrades', () => {
    const costConfig = createDefaultTransactionCostConfig()
    const taxConfig = createDefaultRebalancingTaxConfig()

    it('should optimize simple sell trade with gains and Freibetrag', () => {
      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          amount: 5000,
          type: 'sell' as const,
          costBasis: 4000,
          taxCategory: 'equity' as const,
        },
      ]

      const result = optimizeRebalancingTrades(trades, costConfig, taxConfig)

      expect(result.trades).toHaveLength(1)
      expect(result.trades[0].capitalGains).toBe(1000) // 5000 - 4000
      expect(result.trades[0].taxableGains).toBe(700) // 1000 * (1 - 0.3)
      expect(result.trades[0].tax).toBe(0) // Covered by Freibetrag
      expect(result.freibetragUtilized).toBe(700)
      expect(result.freibetragRemaining).toBe(1300)
      expect(result.totalTaxCosts).toBe(0)
      expect(result.optimizationSuccessful).toBe(true)
    })

    it('should prioritize selling losses first (tax loss harvesting)', () => {
      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          amount: 3000,
          type: 'sell' as const,
          costBasis: 5000, // Loss
          taxCategory: 'equity' as const,
        },
        {
          assetClass: 'bonds_government' as const,
          amount: 6000,
          type: 'sell' as const,
          costBasis: 5000, // Gain
          taxCategory: 'bond' as const,
        },
      ]

      const result = optimizeRebalancingTrades(trades, costConfig, taxConfig)

      expect(result.trades).toHaveLength(2)
      // First trade should be the one with loss
      expect(result.trades[0].capitalGains).toBe(-2000)
      expect(result.lossesUtilized).toBe(2000)
      expect(result.optimizationSuccessful).toBe(true)
      expect(result.optimizationExplanation).toContain('Tax Loss Harvesting')
    })

    it('should handle multiple sells with mixed gains and losses', () => {
      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          amount: 3000,
          type: 'sell' as const,
          costBasis: 5000, // -2000 loss
          taxCategory: 'equity' as const,
        },
        {
          assetClass: 'bonds_government' as const,
          amount: 6000,
          type: 'sell' as const,
          costBasis: 5000, // +1000 gain
          taxCategory: 'bond' as const,
        },
        {
          assetClass: 'stocks_international' as const,
          amount: 4000,
          type: 'sell' as const,
          costBasis: 3000, // +1000 gain
          taxCategory: 'equity' as const,
        },
      ]

      const result = optimizeRebalancingTrades(trades, costConfig, taxConfig)

      expect(result.trades).toHaveLength(3)
      expect(result.lossesUtilized).toBe(2000)
      expect(result.freibetragUtilized).toBeGreaterThan(0)
      expect(result.totalTaxCosts).toBeGreaterThanOrEqual(0)
    })

    it('should handle buy trades (no tax implications)', () => {
      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          amount: 5000,
          type: 'buy' as const,
          taxCategory: 'equity' as const,
        },
        {
          assetClass: 'bonds_government' as const,
          amount: 3000,
          type: 'buy' as const,
          taxCategory: 'bond' as const,
        },
      ]

      const result = optimizeRebalancingTrades(trades, costConfig, taxConfig)

      expect(result.trades).toHaveLength(2)
      expect(result.totalTaxCosts).toBe(0)
      expect(result.freibetragUtilized).toBe(0)
      expect(result.totalTransactionCosts).toBeGreaterThan(0)
    })

    it('should handle mixed buy and sell trades', () => {
      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          amount: 5000,
          type: 'sell' as const,
          costBasis: 4000,
          taxCategory: 'equity' as const,
        },
        {
          assetClass: 'bonds_government' as const,
          amount: 3000,
          type: 'buy' as const,
          taxCategory: 'bond' as const,
        },
      ]

      const result = optimizeRebalancingTrades(trades, costConfig, taxConfig)

      expect(result.trades).toHaveLength(2)
      const sellTrade = result.trades.find((t) => t.type === 'sell')
      const buyTrade = result.trades.find((t) => t.type === 'buy')

      expect(sellTrade).toBeDefined()
      expect(buyTrade).toBeDefined()
      expect(sellTrade?.tax).toBeDefined()
      expect(buyTrade?.tax).toBeUndefined()
    })

    it('should calculate transaction costs for all trades', () => {
      const customCostConfig: TransactionCostConfig = {
        percentageCost: 0.001, // 0.1%
        fixedCost: 5,
        minTransactionSize: 100,
      }

      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          amount: 10000,
          type: 'sell' as const,
          costBasis: 9000,
          taxCategory: 'equity' as const,
        },
      ]

      const result = optimizeRebalancingTrades(trades, customCostConfig, taxConfig)

      // Transaction cost = 10000 * 0.001 + 5 = 15
      expect(result.totalTransactionCosts).toBe(15)
      expect(result.trades[0].transactionCost).toBe(15)
    })

    it('should handle empty trades array', () => {
      const result = optimizeRebalancingTrades([], costConfig, taxConfig)

      expect(result.trades).toHaveLength(0)
      expect(result.totalCosts).toBe(0)
      expect(result.freibetragRemaining).toBe(2000)
      expect(result.optimizationSuccessful).toBe(false)
    })

    it('should handle trades with no cost basis (assume no gains)', () => {
      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          amount: 5000,
          type: 'sell' as const,
          // No costBasis provided
          taxCategory: 'equity' as const,
        },
      ]

      const result = optimizeRebalancingTrades(trades, costConfig, taxConfig)

      expect(result.trades).toHaveLength(1)
      expect(result.trades[0].capitalGains).toBe(0)
      expect(result.totalTaxCosts).toBe(0)
    })

    it('should apply different Teilfreistellungsquoten correctly', () => {
      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          amount: 11000,
          type: 'sell' as const,
          costBasis: 10000,
          taxCategory: 'equity' as const, // 30% exemption
        },
        {
          assetClass: 'bonds_government' as const,
          amount: 11000,
          type: 'sell' as const,
          costBasis: 10000,
          taxCategory: 'bond' as const, // 0% exemption
        },
      ]

      const result = optimizeRebalancingTrades(trades, costConfig, taxConfig)

      expect(result.trades).toHaveLength(2)

      // Equity: 1000 * (1 - 0.3) = 700 taxable
      const equityTrade = result.trades.find((t) => t.assetClass === 'stocks_domestic')
      expect(equityTrade?.taxableGains).toBe(700)

      // Bond: 1000 * (1 - 0) = 1000 taxable
      const bondTrade = result.trades.find((t) => t.assetClass === 'bonds_government')
      expect(bondTrade?.taxableGains).toBe(1000)
    })
  })

  describe('shouldSkipSmallTransactions', () => {
    it('should skip when all trades are below minimum size', () => {
      const costConfig: TransactionCostConfig = {
        percentageCost: 0.001,
        fixedCost: 5,
        minTransactionSize: 100,
      }

      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          type: 'buy' as const,
          amount: 50,
          transactionCost: 5.05,
          totalCost: 5.05,
        },
        {
          assetClass: 'bonds_government' as const,
          type: 'sell' as const,
          amount: 30,
          transactionCost: 5.03,
          totalCost: 5.03,
        },
      ]

      const shouldSkip = shouldSkipSmallTransactions(trades, costConfig)
      expect(shouldSkip).toBe(true)
    })

    it('should not skip when some trades are above minimum size and fixed costs do not dominate', () => {
      const costConfig: TransactionCostConfig = {
        percentageCost: 0.01, // 1% - higher percentage cost
        fixedCost: 5,
        minTransactionSize: 100,
      }

      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          type: 'buy' as const,
          amount: 50,
          transactionCost: 5.5, // 50 * 0.01 + 5 = 5.5
          totalCost: 5.5,
        },
        {
          assetClass: 'bonds_government' as const,
          type: 'sell' as const,
          amount: 5000,
          transactionCost: 55, // 5000 * 0.01 + 5 = 55
          totalCost: 55,
        },
      ]

      // Total fixed costs: 2 * 5 = 10
      // Total costs: 5.5 + 55 = 60.5
      // Fixed costs: 10 / 60.5 = 16.5% < 50% (does not dominate)

      const shouldSkip = shouldSkipSmallTransactions(trades, costConfig)
      expect(shouldSkip).toBe(false)
    })

    it('should skip when fixed costs dominate', () => {
      const costConfig: TransactionCostConfig = {
        percentageCost: 0.0001, // Very low percentage cost
        fixedCost: 10,
        minTransactionSize: 100,
      }

      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          type: 'buy' as const,
          amount: 200,
          transactionCost: 10.02, // Fixed cost dominates
          totalCost: 10.02,
        },
        {
          assetClass: 'bonds_government' as const,
          type: 'sell' as const,
          amount: 150,
          transactionCost: 10.015,
          totalCost: 10.015,
        },
      ]

      const shouldSkip = shouldSkipSmallTransactions(trades, costConfig)
      expect(shouldSkip).toBe(true)
    })

    it('should not skip when fixed costs are zero', () => {
      const costConfig: TransactionCostConfig = {
        percentageCost: 0.001,
        fixedCost: 0,
        minTransactionSize: 100,
      }

      const trades = [
        {
          assetClass: 'stocks_domestic' as const,
          type: 'buy' as const,
          amount: 50,
          transactionCost: 0.05,
          totalCost: 0.05,
        },
      ]

      const shouldSkip = shouldSkipSmallTransactions(trades, costConfig)
      expect(shouldSkip).toBe(true) // Still skip due to small size
    })

    it('should handle empty trades array', () => {
      const costConfig = createDefaultTransactionCostConfig()
      const shouldSkip = shouldSkipSmallTransactions([], costConfig)
      expect(shouldSkip).toBe(true)
    })
  })
})
