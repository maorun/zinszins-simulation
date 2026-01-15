/**
 * Tests for Tax Loss Harvesting Tracker helper functions
 */

import { describe, it, expect } from 'vitest'
import {
  calculatePositionGainLoss,
  arePositionsSubstantiallyIdentical,
  checkWashSaleViolation,
  calculateTransactionCosts,
  calculateTaxSavings,
  generateReplacementSuggestions,
  identifyLossHarvestingOpportunities,
  createPortfolioPosition,
  validatePortfolioPosition,
  getDefaultWashSaleConfig,
  getDefaultTransactionCostConfig,
  type WashSaleConfig,
  type TransactionCostConfig,
} from './tax-loss-harvesting-tracker'

describe('calculatePositionGainLoss', () => {
  it('calculates profit correctly', () => {
    const result = calculatePositionGainLoss(100, 120, 10, 1000)
    expect(result.currentValue).toBe(1200)
    expect(result.unrealizedGainLoss).toBe(200)
    expect(result.unrealizedGainLossPercent).toBe(20)
  })

  it('calculates loss correctly', () => {
    const result = calculatePositionGainLoss(100, 80, 10, 1000)
    expect(result.currentValue).toBe(800)
    expect(result.unrealizedGainLoss).toBe(-200)
    expect(result.unrealizedGainLossPercent).toBe(-20)
  })

  it('handles zero cost edge case', () => {
    const result = calculatePositionGainLoss(100, 120, 10, 0)
    expect(result.unrealizedGainLossPercent).toBe(0)
  })
})

describe('arePositionsSubstantiallyIdentical', () => {
  it('identifies identical symbols', () => {
    const pos1 = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      110,
      10,
      1000,
      true,
    )
    const pos2 = createPortfolioPosition(
      '2',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-06-01'),
      105,
      110,
      10,
      1050,
      true,
    )

    expect(arePositionsSubstantiallyIdentical(pos1, pos2)).toBe(true)
  })

  it('identifies similar names in same asset class', () => {
    const pos1 = createPortfolioPosition(
      '1',
      'MSCI World ETF A',
      'SYMBOL1',
      'stocks',
      new Date('2023-01-01'),
      100,
      110,
      10,
      1000,
      true,
    )
    const pos2 = createPortfolioPosition(
      '2',
      'MSCI World ETF B',
      'SYMBOL2',
      'stocks',
      new Date('2023-06-01'),
      105,
      110,
      10,
      1050,
      true,
    )

    expect(arePositionsSubstantiallyIdentical(pos1, pos2)).toBe(true)
  })

  it('identifies different positions', () => {
    const pos1 = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'SYMBOL1',
      'stocks',
      new Date('2023-01-01'),
      100,
      110,
      10,
      1000,
      true,
    )
    const pos2 = createPortfolioPosition(
      '2',
      'S&P 500 ETF',
      'SYMBOL2',
      'stocks',
      new Date('2023-06-01'),
      105,
      110,
      10,
      1050,
      true,
    )

    expect(arePositionsSubstantiallyIdentical(pos1, pos2)).toBe(false)
  })

  it('identifies different asset classes as non-identical', () => {
    const pos1 = createPortfolioPosition(
      '1',
      'Government Bonds',
      'SYMBOL1',
      'bonds',
      new Date('2023-01-01'),
      100,
      110,
      10,
      1000,
      false,
    )
    const pos2 = createPortfolioPosition(
      '2',
      'Government Bonds',
      'SYMBOL2',
      'stocks',
      new Date('2023-06-01'),
      105,
      110,
      10,
      1050,
      true,
    )

    expect(arePositionsSubstantiallyIdentical(pos1, pos2)).toBe(false)
  })
})

describe('checkWashSaleViolation', () => {
  const washSaleConfig: WashSaleConfig = {
    daysBefore: 30,
    daysAfter: 30,
    enabled: true,
  }

  it('detects wash-sale violation with recent purchase', () => {
    const soldPosition = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      80,
      10,
      1000,
      true,
    )

    const recentPurchase = createPortfolioPosition(
      '2',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-06-15'), // 15 days before sale
      105,
      80,
      10,
      1050,
      true,
    )

    const saleDate = new Date('2023-06-30')
    const portfolio = [soldPosition, recentPurchase]

    const violation = checkWashSaleViolation(soldPosition, saleDate, portfolio, washSaleConfig)

    expect(violation).not.toBeNull()
    expect(violation?.violationType).toBe('before')
    expect(violation?.daysBetween).toBe(15)
    expect(violation?.disallowedLoss).toBe(200)
  })

  it('detects wash-sale violation with future purchase', () => {
    const soldPosition = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      80,
      10,
      1000,
      true,
    )

    const futurePurchase = createPortfolioPosition(
      '2',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-07-15'), // 15 days after sale
      105,
      80,
      10,
      1050,
      true,
    )

    const saleDate = new Date('2023-06-30')
    const portfolio = [soldPosition, futurePurchase]

    const violation = checkWashSaleViolation(soldPosition, saleDate, portfolio, washSaleConfig)

    expect(violation).not.toBeNull()
    expect(violation?.violationType).toBe('after')
    expect(violation?.daysBetween).toBe(15)
  })

  it('does not detect violation outside wash-sale window', () => {
    const soldPosition = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      80,
      10,
      1000,
      true,
    )

    const oldPurchase = createPortfolioPosition(
      '2',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-04-01'), // 90 days before sale
      105,
      80,
      10,
      1050,
      true,
    )

    const saleDate = new Date('2023-06-30')
    const portfolio = [soldPosition, oldPurchase]

    const violation = checkWashSaleViolation(soldPosition, saleDate, portfolio, washSaleConfig)

    expect(violation).toBeNull()
  })

  it('does not detect violation for non-identical positions', () => {
    const soldPosition = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'SYMBOL1',
      'stocks',
      new Date('2023-01-01'),
      100,
      80,
      10,
      1000,
      true,
    )

    const differentPosition = createPortfolioPosition(
      '2',
      'S&P 500 ETF',
      'SYMBOL2',
      'stocks',
      new Date('2023-06-15'),
      105,
      80,
      10,
      1050,
      true,
    )

    const saleDate = new Date('2023-06-30')
    const portfolio = [soldPosition, differentPosition]

    const violation = checkWashSaleViolation(soldPosition, saleDate, portfolio, washSaleConfig)

    expect(violation).toBeNull()
  })

  it('returns null when wash-sale checking is disabled', () => {
    const soldPosition = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      80,
      10,
      1000,
      true,
    )

    const recentPurchase = createPortfolioPosition(
      '2',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-06-15'),
      105,
      80,
      10,
      1050,
      true,
    )

    const saleDate = new Date('2023-06-30')
    const portfolio = [soldPosition, recentPurchase]
    const disabledConfig: WashSaleConfig = { ...washSaleConfig, enabled: false }

    const violation = checkWashSaleViolation(soldPosition, saleDate, portfolio, disabledConfig)

    expect(violation).toBeNull()
  })
})

describe('calculateTransactionCosts', () => {
  it('calculates percentage and fixed costs', () => {
    const config: TransactionCostConfig = {
      percentageFee: 0.25,
      fixedFee: 5,
      minTransactionAmount: 500,
    }

    const result = calculateTransactionCosts(10000, config)

    expect(result.percentageCost).toBe(25) // 0.25% of 10000
    expect(result.fixedCost).toBe(5)
    expect(result.totalCost).toBe(30)
  })

  it('handles zero fixed fee', () => {
    const config: TransactionCostConfig = {
      percentageFee: 0.25,
      fixedFee: 0,
      minTransactionAmount: 500,
    }

    const result = calculateTransactionCosts(10000, config)

    expect(result.totalCost).toBe(25)
  })

  it('handles zero percentage fee', () => {
    const config: TransactionCostConfig = {
      percentageFee: 0,
      fixedFee: 10,
      minTransactionAmount: 500,
    }

    const result = calculateTransactionCosts(10000, config)

    expect(result.totalCost).toBe(10)
  })
})

describe('calculateTaxSavings', () => {
  it('calculates tax savings for non-stock fund', () => {
    const savings = calculateTaxSavings(1000, 0.26375, false, 0)
    expect(savings).toBeCloseTo(263.75)
  })

  it('calculates tax savings for stock fund with Teilfreistellung', () => {
    const savings = calculateTaxSavings(1000, 0.26375, true, 30)
    // Tax rate after Teilfreistellung: 0.26375 * (1 - 0.30) = 0.184625
    expect(savings).toBeCloseTo(184.625)
  })

  it('returns zero for no loss', () => {
    const savings = calculateTaxSavings(0, 0.26375, false, 0)
    expect(savings).toBe(0)
  })

  it('returns zero for negative loss (gain)', () => {
    const savings = calculateTaxSavings(-1000, 0.26375, false, 0)
    expect(savings).toBe(0)
  })
})

describe('generateReplacementSuggestions', () => {
  it('generates suggestions for stocks', () => {
    const position = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      80,
      10,
      1000,
      true,
    )

    const suggestions = generateReplacementSuggestions(position)

    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.some(s => s.assetClass === 'stocks')).toBe(true)
    expect(suggestions.some(s => s.assetClass === 'cash')).toBe(true)
  })

  it('generates suggestions for bonds', () => {
    const position = createPortfolioPosition(
      '1',
      'Government Bonds',
      'BOND123',
      'bonds',
      new Date('2023-01-01'),
      100,
      95,
      10,
      1000,
      false,
    )

    const suggestions = generateReplacementSuggestions(position)

    expect(suggestions.length).toBeGreaterThan(0)
    expect(suggestions.some(s => s.assetClass === 'bonds')).toBe(true)
  })

  it('always includes cash option', () => {
    const position = createPortfolioPosition(
      '1',
      'Some Asset',
      'ASSET123',
      'other',
      new Date('2023-01-01'),
      100,
      80,
      10,
      1000,
      false,
    )

    const suggestions = generateReplacementSuggestions(position)

    expect(suggestions.some(s => s.assetClass === 'cash')).toBe(true)
    expect(suggestions.find(s => s.assetClass === 'cash')?.maintainsExposure).toBe(false)
  })

  it('suggests maintaining exposure for most replacements', () => {
    const position = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      80,
      10,
      1000,
      true,
    )

    const suggestions = generateReplacementSuggestions(position)
    const nonCashSuggestions = suggestions.filter(s => s.assetClass !== 'cash')

    expect(nonCashSuggestions.every(s => s.maintainsExposure)).toBe(true)
  })
})

describe('identifyLossHarvestingOpportunities', () => {
  const taxRate = 0.26375
  const teilfreistellungsquote = 30
  const transactionCostConfig = getDefaultTransactionCostConfig()
  const washSaleConfig = getDefaultWashSaleConfig()

  it('identifies loss positions with positive net benefit', () => {
    const lossPosition = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      80,
      100, // 100 shares
      10000,
      true,
    )

    const portfolio = [lossPosition]

    const opportunities = identifyLossHarvestingOpportunities(
      portfolio,
      taxRate,
      teilfreistellungsquote,
      transactionCostConfig,
      washSaleConfig,
    )

    expect(opportunities.length).toBe(1)
    expect(opportunities[0].lossAmount).toBe(2000)
    expect(opportunities[0].potentialTaxSavings).toBeGreaterThan(0)
    expect(opportunities[0].netBenefit).toBeGreaterThan(0)
  })

  it('filters out positions with negative net benefit', () => {
    // Small loss with high transaction costs (small position)
    const smallLossPosition = createPortfolioPosition(
      '1',
      'Small Position',
      'SMALL123',
      'stocks',
      new Date('2023-01-01'),
      100,
      99,
      1, // Only 1 share - very small position
      100,
      true,
    )

    const portfolio = [smallLossPosition]

    const opportunities = identifyLossHarvestingOpportunities(
      portfolio,
      taxRate,
      teilfreistellungsquote,
      transactionCostConfig,
      washSaleConfig,
    )

    expect(opportunities.length).toBe(0)
  })

  it('identifies wash-sale risk', () => {
    const lossPosition = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      80,
      100,
      10000,
      true,
    )

    const recentPurchase = createPortfolioPosition(
      '2',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
      105,
      80,
      10,
      1050,
      true,
    )

    const portfolio = [lossPosition, recentPurchase]

    const opportunities = identifyLossHarvestingOpportunities(
      portfolio,
      taxRate,
      teilfreistellungsquote,
      transactionCostConfig,
      washSaleConfig,
    )

    // Both positions have losses, but one has wash-sale risk
    expect(opportunities.length).toBeGreaterThanOrEqual(1)
    expect(opportunities.some(opp => opp.washSaleRisk)).toBe(true)
    const washSaleOpp = opportunities.find(opp => opp.washSaleRisk)
    expect(washSaleOpp?.earliestSaleDate.getTime()).toBeGreaterThan(Date.now())
  })

  it('sorts opportunities by net benefit', () => {
    const bigLossPosition = createPortfolioPosition(
      '1',
      'Position A',
      'A123',
      'stocks',
      new Date('2023-01-01'),
      100,
      70, // 30% loss
      100,
      10000,
      true,
    )

    const smallLossPosition = createPortfolioPosition(
      '2',
      'Position B',
      'B123',
      'stocks',
      new Date('2023-01-01'),
      100,
      90, // 10% loss
      100,
      10000,
      true,
    )

    const portfolio = [smallLossPosition, bigLossPosition]

    const opportunities = identifyLossHarvestingOpportunities(
      portfolio,
      taxRate,
      teilfreistellungsquote,
      transactionCostConfig,
      washSaleConfig,
    )

    expect(opportunities.length).toBe(2)
    expect(opportunities[0].priority).toBe(1)
    expect(opportunities[1].priority).toBe(2)
    expect(opportunities[0].lossAmount).toBeGreaterThan(opportunities[1].lossAmount)
  })

  it('assigns priority levels correctly', () => {
    const highPriorityPosition = createPortfolioPosition(
      '1',
      'High Priority',
      'HIGH123',
      'stocks',
      new Date('2023-01-01'),
      100,
      50, // Big loss - 50% loss on 100 shares = 5000 EUR loss
      100,
      10000,
      true,
    )

    const portfolio = [highPriorityPosition]

    const opportunities = identifyLossHarvestingOpportunities(
      portfolio,
      taxRate,
      teilfreistellungsquote,
      transactionCostConfig,
      washSaleConfig,
    )

    expect(opportunities.length).toBe(1)
    // With 5000 EUR loss and good net benefit, should be high priority
    expect(opportunities[0].priorityLevel).toMatch(/high|medium/)
  })

  it('includes replacement suggestions', () => {
    const lossPosition = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      80,
      100,
      10000,
      true,
    )

    const portfolio = [lossPosition]

    const opportunities = identifyLossHarvestingOpportunities(
      portfolio,
      taxRate,
      teilfreistellungsquote,
      transactionCostConfig,
      washSaleConfig,
    )

    expect(opportunities[0].replacementSuggestions.length).toBeGreaterThan(0)
  })

  it('filters out positions below minimum transaction amount', () => {
    const tooSmallPosition = createPortfolioPosition(
      '1',
      'Too Small',
      'SMALL123',
      'stocks',
      new Date('2023-01-01'),
      100,
      50, // 50% loss but very small position
      1, // Only 1 share
      100, // Only 100 EUR
      true,
    )

    const portfolio = [tooSmallPosition]

    const opportunities = identifyLossHarvestingOpportunities(
      portfolio,
      taxRate,
      teilfreistellungsquote,
      transactionCostConfig,
      washSaleConfig,
    )

    // Should be filtered out because current value (50 EUR) < minTransactionAmount (500 EUR)
    expect(opportunities.length).toBe(0)
  })
})

describe('createPortfolioPosition', () => {
  it('creates a valid portfolio position', () => {
    const position = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      110,
      10,
      1000,
      true,
    )

    expect(position.id).toBe('1')
    expect(position.name).toBe('MSCI World ETF')
    expect(position.currentValue).toBe(1100)
    expect(position.unrealizedGainLoss).toBe(100)
    expect(position.isStockFund).toBe(true)
  })
})

describe('validatePortfolioPosition', () => {
  it('validates correct position', () => {
    const position = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      110,
      10,
      1000,
      true,
    )

    const errors = validatePortfolioPosition(position)
    expect(errors.length).toBe(0)
  })

  it('detects missing ID', () => {
    const position = createPortfolioPosition(
      '',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      110,
      10,
      1000,
      true,
    )

    const errors = validatePortfolioPosition(position)
    expect(errors.some(e => e.includes('ID'))).toBe(true)
  })

  it('detects invalid purchase price', () => {
    const position = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      -100,
      110,
      10,
      1000,
      true,
    )

    const errors = validatePortfolioPosition(position)
    expect(errors.some(e => e.includes('Kaufpreis'))).toBe(true)
  })

  it('detects invalid quantity', () => {
    const position = createPortfolioPosition(
      '1',
      'MSCI World ETF',
      'IE00B4L5Y983',
      'stocks',
      new Date('2023-01-01'),
      100,
      110,
      -10,
      1000,
      true,
    )

    const errors = validatePortfolioPosition(position)
    expect(errors.some(e => e.includes('Anzahl'))).toBe(true)
  })
})

describe('default configurations', () => {
  it('provides default wash-sale config', () => {
    const config = getDefaultWashSaleConfig()
    expect(config.daysBefore).toBe(30)
    expect(config.daysAfter).toBe(30)
    expect(config.enabled).toBe(true)
  })

  it('provides default transaction cost config', () => {
    const config = getDefaultTransactionCostConfig()
    expect(config.percentageFee).toBeGreaterThan(0)
    expect(config.minTransactionAmount).toBeGreaterThan(0)
  })
})
