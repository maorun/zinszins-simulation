import { describe, expect, it } from 'vitest'
import {
  calculateSellingStrategy,
  compareSellingStrategies,
  getDefaultSellingStrategyConfig,
  validateSellingStrategyConfig,
  type InvestmentLot,
  type SellingStrategyConfig,
} from './selling-strategy'

describe('selling-strategy', () => {
  // Helper to create test investment lots
  const createLot = (
    id: string,
    purchaseDate: string,
    costBasis: number,
    currentValue: number,
  ): InvestmentLot => ({
    id,
    purchaseDate: new Date(purchaseDate),
    costBasis,
    currentValue,
    vorabpauschaleAccumulated: 0,
  })

  describe('getDefaultSellingStrategyConfig', () => {
    it('should return default configuration', () => {
      const config = getDefaultSellingStrategyConfig(2024)

      expect(config).toEqual({
        method: 'tax-optimized',
        spreadOverYears: false,
        yearsToSpread: 1,
        targetAmount: 10000,
        startYear: 2024,
        freibetrag: 2000,
        taxRate: 0.26375,
        teilfreistellungsquote: 0.3,
      })
    })

    it('should use current year if no year provided', () => {
      const config = getDefaultSellingStrategyConfig()
      const currentYear = new Date().getFullYear()

      expect(config.startYear).toBe(currentYear)
    })
  })

  describe('validateSellingStrategyConfig', () => {
    it('should validate correct configuration', () => {
      const config = getDefaultSellingStrategyConfig(2024)
      const errors = validateSellingStrategyConfig(config)

      expect(errors).toEqual([])
    })

    it('should reject negative target amount', () => {
      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        targetAmount: -1000,
      }

      const errors = validateSellingStrategyConfig(config)
      expect(errors).toContain('Verkaufsbetrag muss größer als 0 sein')
    })

    it('should reject zero target amount', () => {
      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        targetAmount: 0,
      }

      const errors = validateSellingStrategyConfig(config)
      expect(errors).toContain('Verkaufsbetrag muss größer als 0 sein')
    })

    it('should reject invalid years to spread', () => {
      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        yearsToSpread: 0,
      }

      const errors = validateSellingStrategyConfig(config)
      expect(errors).toContain('Anzahl der Jahre muss zwischen 1 und 50 liegen')
    })

    it('should reject negative freibetrag', () => {
      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        freibetrag: -100,
      }

      const errors = validateSellingStrategyConfig(config)
      expect(errors).toContain('Freibetrag kann nicht negativ sein')
    })

    it('should reject invalid tax rate', () => {
      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        taxRate: 1.5,
      }

      const errors = validateSellingStrategyConfig(config)
      expect(errors).toContain('Steuersatz muss zwischen 0 und 1 liegen')
    })

    it('should reject invalid teilfreistellungsquote', () => {
      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        teilfreistellungsquote: -0.1,
      }

      const errors = validateSellingStrategyConfig(config)
      expect(errors).toContain('Teilfreistellungsquote muss zwischen 0 und 1 liegen')
    })

    it('should reject invalid start year', () => {
      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        startYear: 1999,
      }

      const errors = validateSellingStrategyConfig(config)
      expect(errors).toContain('Jahr muss zwischen 2000 und 2100 liegen')
    })
  })

  describe('calculateSellingStrategy - FIFO', () => {
    it('should sell oldest lots first with FIFO', () => {
      const lots: InvestmentLot[] = [
        createLot('lot1', '2020-01-01', 10000, 12000), // Oldest
        createLot('lot2', '2021-01-01', 10000, 11000),
        createLot('lot3', '2022-01-01', 10000, 10500), // Newest
      ]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'fifo',
        targetAmount: 12000, // Sell exactly one lot
        freibetrag: 0, // No allowance for simpler testing
      }

      const result = calculateSellingStrategy(lots, config)

      // Should sell the oldest lot first (lot1)
      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0].lot.id).toBe('lot1')
      expect(result.transactions[0].amountSold).toBe(12000)
      expect(result.totalAmountSold).toBe(12000)
    })

    it('should calculate correct tax with FIFO', () => {
      const lots: InvestmentLot[] = [createLot('lot1', '2020-01-01', 10000, 15000)]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'fifo',
        targetAmount: 15000,
        freibetrag: 0,
        taxRate: 0.26375,
        teilfreistellungsquote: 0.3,
      }

      const result = calculateSellingStrategy(lots, config)

      // Gain = 15,000 - 10,000 = 5,000
      // Taxable gain = 5,000 * (1 - 0.3) = 3,500
      // Tax = 3,500 * 0.26375 = 923.125
      expect(result.totalTaxableGains).toBeCloseTo(3500)
      expect(result.totalTaxOwed).toBeCloseTo(923.125)
      expect(result.totalNetProceeds).toBeCloseTo(15000 - 923.125)
    })

    it('should handle partial lot sales correctly', () => {
      const lots: InvestmentLot[] = [createLot('lot1', '2020-01-01', 10000, 15000)]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'fifo',
        targetAmount: 7500, // Sell half the lot
        freibetrag: 0,
        taxRate: 0.26375,
        teilfreistellungsquote: 0.3,
      }

      const result = calculateSellingStrategy(lots, config)

      // Proportion = 7,500 / 15,000 = 0.5
      // Cost basis sold = 10,000 * 0.5 = 5,000
      // Gain = 7,500 - 5,000 = 2,500
      // Taxable gain = 2,500 * 0.7 = 1,750
      // Tax = 1,750 * 0.26375 = 461.5625
      expect(result.totalCostBasis).toBeCloseTo(5000)
      expect(result.totalTaxableGains).toBeCloseTo(1750)
      expect(result.totalTaxOwed).toBeCloseTo(461.5625)
    })

    it('should use Freibetrag to reduce taxes', () => {
      const lots: InvestmentLot[] = [createLot('lot1', '2020-01-01', 10000, 15000)]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'fifo',
        targetAmount: 15000,
        freibetrag: 2000, // Use standard Freibetrag
        taxRate: 0.26375,
        teilfreistellungsquote: 0.3,
      }

      const result = calculateSellingStrategy(lots, config)

      // Taxable gain = 3,500 (as calculated above)
      // After Freibetrag = 3,500 - 2,000 = 1,500
      // Tax = 1,500 * 0.26375 = 395.625
      expect(result.totalTaxOwed).toBeCloseTo(395.625)
      expect(result.yearSummary[2024].freibetragUsed).toBe(2000)
    })
  })

  describe('calculateSellingStrategy - LIFO', () => {
    it('should sell newest lots first with LIFO', () => {
      const lots: InvestmentLot[] = [
        createLot('lot1', '2020-01-01', 10000, 12000), // Oldest
        createLot('lot2', '2021-01-01', 10000, 11000),
        createLot('lot3', '2022-01-01', 10000, 10500), // Newest
      ]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'lifo',
        targetAmount: 10500, // Sell exactly one lot
        freibetrag: 0,
      }

      const result = calculateSellingStrategy(lots, config)

      // Should sell the newest lot first (lot3)
      expect(result.transactions).toHaveLength(1)
      expect(result.transactions[0].lot.id).toBe('lot3')
      expect(result.transactions[0].amountSold).toBe(10500)
    })
  })

  describe('calculateSellingStrategy - Tax-Optimized', () => {
    it('should prioritize selling loss positions first', () => {
      const lots: InvestmentLot[] = [
        createLot('lot1', '2020-01-01', 10000, 12000), // Gain
        createLot('lot2', '2021-01-01', 10000, 8000), // Loss
        createLot('lot3', '2022-01-01', 10000, 11000), // Gain
      ]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'tax-optimized',
        targetAmount: 8000,
        freibetrag: 0,
      }

      const result = calculateSellingStrategy(lots, config)

      // Should sell the loss position first (lot2)
      expect(result.transactions[0].lot.id).toBe('lot2')
    })

    it('should prefer smaller gains after selling losses', () => {
      const lots: InvestmentLot[] = [
        createLot('lot1', '2020-01-01', 10000, 15000), // 50% gain
        createLot('lot2', '2021-01-01', 10000, 11000), // 10% gain
        createLot('lot3', '2022-01-01', 10000, 12000), // 20% gain
      ]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'tax-optimized',
        targetAmount: 23000, // Sell two lots
        freibetrag: 0,
      }

      const result = calculateSellingStrategy(lots, config)

      // Should sell lot2 (10% gain) first, then lot3 (20% gain)
      expect(result.transactions[0].lot.id).toBe('lot2')
      expect(result.transactions[1].lot.id).toBe('lot3')
    })

    it('should result in lower taxes than FIFO for typical scenarios', () => {
      const lots: InvestmentLot[] = [
        createLot('lot1', '2020-01-01', 10000, 15000), // Old, high gain
        createLot('lot2', '2023-01-01', 10000, 10500), // Recent, small gain
      ]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'tax-optimized',
        targetAmount: 10500,
        freibetrag: 0,
        taxRate: 0.26375,
        teilfreistellungsquote: 0.3,
      }

      const taxOptimized = calculateSellingStrategy(lots, config)
      const fifo = calculateSellingStrategy(lots, { ...config, method: 'fifo' })

      // Tax-optimized should choose lot2 (small gain), FIFO chooses lot1 (high gain)
      expect(taxOptimized.totalTaxOwed).toBeLessThan(fifo.totalTaxOwed)
    })
  })

  describe('calculateSellingStrategy - Multi-Year Spreading', () => {
    it('should spread sales over multiple years', () => {
      const lots: InvestmentLot[] = [createLot('lot1', '2020-01-01', 30000, 40000)]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'fifo',
        targetAmount: 30000,
        spreadOverYears: true,
        yearsToSpread: 3,
        freibetrag: 2000,
        taxRate: 0.26375,
        teilfreistellungsquote: 0.3,
      }

      const result = calculateSellingStrategy(lots, config)

      // Should create transactions for 3 years
      const years = [...new Set(result.transactions.map((t) => t.year))]
      expect(years).toHaveLength(3)
      expect(years).toEqual([2024, 2025, 2026])

      // Each year should sell approximately 10,000
      expect(result.yearSummary[2024].amountSold).toBeCloseTo(10000)
      expect(result.yearSummary[2025].amountSold).toBeCloseTo(10000)
      expect(result.yearSummary[2026].amountSold).toBeCloseTo(10000)
    })

    it('should use Freibetrag each year when spreading', () => {
      const lots: InvestmentLot[] = [createLot('lot1', '2020-01-01', 20000, 30000)]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'fifo',
        targetAmount: 30000,
        spreadOverYears: true,
        yearsToSpread: 3,
        freibetrag: 2000, // 2,000 EUR per year
        taxRate: 0.26375,
        teilfreistellungsquote: 0.3,
      }

      const result = calculateSellingStrategy(lots, config)

      // Each year should use Freibetrag
      expect(result.yearSummary[2024].freibetragUsed).toBeGreaterThan(0)
      expect(result.yearSummary[2025].freibetragUsed).toBeGreaterThan(0)
      expect(result.yearSummary[2026].freibetragUsed).toBeGreaterThan(0)

      // Total Freibetrag used should be close to 6,000 (3 years × 2,000)
      const totalFreibetrag = Object.values(result.yearSummary).reduce(
        (sum, year) => sum + year.freibetragUsed,
        0,
      )
      expect(totalFreibetrag).toBeCloseTo(6000, 0)
    })

    it('should reduce total tax by spreading over years', () => {
      const lots: InvestmentLot[] = [createLot('lot1', '2020-01-01', 20000, 30000)]

      const baseConfig: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        method: 'fifo',
        targetAmount: 30000,
        freibetrag: 2000,
        taxRate: 0.26375,
        teilfreistellungsquote: 0.3,
      }

      // Single year
      const singleYear = calculateSellingStrategy(lots, {
        ...baseConfig,
        spreadOverYears: false,
        yearsToSpread: 1,
      })

      // Three years
      const threeYears = calculateSellingStrategy(lots, {
        ...baseConfig,
        spreadOverYears: true,
        yearsToSpread: 3,
      })

      // Spreading should result in lower total tax (more Freibetrag usage)
      expect(threeYears.totalTaxOwed).toBeLessThan(singleYear.totalTaxOwed)

      // Difference should be approximately 2 years × 2,000 Freibetrag × tax rate
      const expectedSavings = 2 * 2000 * baseConfig.taxRate
      const actualSavings = singleYear.totalTaxOwed - threeYears.totalTaxOwed
      expect(actualSavings).toBeCloseTo(expectedSavings, 0)
    })
  })

  describe('compareSellingStrategies', () => {
    it('should compare all three methods', () => {
      const lots: InvestmentLot[] = [
        createLot('lot1', '2020-01-01', 10000, 15000), // Old, high gain
        createLot('lot2', '2023-01-01', 10000, 10500), // Recent, small gain
      ]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        targetAmount: 15000,
        freibetrag: 0,
      }

      const comparison = compareSellingStrategies(lots, config)

      // Should return results for all methods
      expect(comparison.fifo).toBeDefined()
      expect(comparison.lifo).toBeDefined()
      expect(comparison.taxOptimized).toBeDefined()

      // Should identify best method
      expect(comparison.bestMethod).toBeDefined()
      expect(['fifo', 'lifo', 'tax-optimized']).toContain(comparison.bestMethod)

      // Tax savings should be non-negative
      expect(comparison.taxSavings).toBeGreaterThanOrEqual(0)
    })

    it('should recommend tax-optimized or LIFO for scenarios with different gains', () => {
      const lots: InvestmentLot[] = [
        createLot('lot1', '2020-01-01', 10000, 15000), // High gain (old)
        createLot('lot2', '2023-01-01', 10000, 10200), // Small gain (new)
      ]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        targetAmount: 10200,
        freibetrag: 0,
      }

      const comparison = compareSellingStrategies(lots, config)

      // Tax-optimized and LIFO should both choose lot2 (smaller gain/newer)
      // So best method should be either tax-optimized or lifo
      expect(['tax-optimized', 'lifo']).toContain(comparison.bestMethod)
      expect(comparison.taxOptimized.totalTaxOwed).toBeLessThanOrEqual(comparison.fifo.totalTaxOwed)
      expect(comparison.taxOptimized.totalTaxOwed).toBe(comparison.lifo.totalTaxOwed)
    })

    it('should calculate tax savings correctly', () => {
      const lots: InvestmentLot[] = [
        createLot('lot1', '2020-01-01', 10000, 15000), // 50% gain
        createLot('lot2', '2023-01-01', 10000, 10100), // 1% gain
      ]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        targetAmount: 10100,
        freibetrag: 0,
        taxRate: 0.26375,
        teilfreistellungsquote: 0.3,
      }

      const comparison = compareSellingStrategies(lots, config)

      // FIFO would sell lot1 (high gain)
      // Tax-optimized would sell lot2 (low gain)
      const expectedSavings =
        comparison.fifo.totalTaxOwed - comparison.taxOptimized.totalTaxOwed
      expect(comparison.taxSavings).toBeCloseTo(expectedSavings)
      expect(comparison.taxSavings).toBeGreaterThan(0)
    })
  })

  describe('Edge cases', () => {
    it('should throw error when no lots available', () => {
      const lots: InvestmentLot[] = []
      const config = getDefaultSellingStrategyConfig(2024)

      expect(() => calculateSellingStrategy(lots, config)).toThrow(
        'Keine Investments zum Verkauf vorhanden',
      )
    })

    it('should throw error for zero target amount', () => {
      const lots: InvestmentLot[] = [createLot('lot1', '2020-01-01', 10000, 15000)]
      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        targetAmount: 0,
      }

      expect(() => calculateSellingStrategy(lots, config)).toThrow(
        'Verkaufsbetrag muss größer als 0 sein',
      )
    })

    it('should handle selling more than available', () => {
      const lots: InvestmentLot[] = [createLot('lot1', '2020-01-01', 10000, 15000)]

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        targetAmount: 50000, // More than available
        freibetrag: 0,
      }

      const result = calculateSellingStrategy(lots, config)

      // Should sell all available
      expect(result.totalAmountSold).toBe(15000)
    })

    it('should handle loss positions correctly', () => {
      const lots: InvestmentLot[] = [createLot('lot1', '2020-01-01', 10000, 8000)] // Loss position

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        targetAmount: 8000,
        freibetrag: 0,
        taxRate: 0.26375,
        teilfreistellungsquote: 0.3,
      }

      const result = calculateSellingStrategy(lots, config)

      // No tax should be owed on a loss
      expect(result.totalTaxOwed).toBe(0)
      expect(result.totalNetProceeds).toBe(8000)
    })

    it('should handle zero gain positions', () => {
      const lots: InvestmentLot[] = [createLot('lot1', '2020-01-01', 10000, 10000)] // No gain/loss

      const config: SellingStrategyConfig = {
        ...getDefaultSellingStrategyConfig(2024),
        targetAmount: 10000,
        freibetrag: 0,
      }

      const result = calculateSellingStrategy(lots, config)

      // No tax should be owed with zero gain
      expect(result.totalTaxOwed).toBe(0)
      expect(result.totalNetProceeds).toBe(10000)
    })
  })
})
