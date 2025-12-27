import { describe, it, expect } from 'vitest'
import {
  getAfaRate,
  calculateAfa,
  calculateWerbungskosten,
  calculateRentalPropertyTax,
  calculateCumulativeAfa,
  estimateTypicalExpenses,
  validateRentalPropertyConfig,
  AfA_RATES,
  type RentalPropertyConfig,
} from './immobilien-steueroptimierung'

describe('Immobilien-Steueroptimierung', () => {
  describe('getAfaRate', () => {
    it('should return 2.5% for buildings before 1925', () => {
      expect(getAfaRate(1900)).toBe(AfA_RATES.VERY_OLD)
      expect(getAfaRate(1924)).toBe(AfA_RATES.VERY_OLD)
    })

    it('should return 2% for buildings between 1925 and 2022', () => {
      expect(getAfaRate(1925)).toBe(AfA_RATES.STANDARD_OLD)
      expect(getAfaRate(2000)).toBe(AfA_RATES.STANDARD_OLD)
      expect(getAfaRate(2022)).toBe(AfA_RATES.STANDARD_OLD)
    })

    it('should return 3% for buildings from 2023 onwards', () => {
      expect(getAfaRate(2023)).toBe(AfA_RATES.STANDARD_NEW)
      expect(getAfaRate(2024)).toBe(AfA_RATES.STANDARD_NEW)
      expect(getAfaRate(2025)).toBe(AfA_RATES.STANDARD_NEW)
    })
  })

  describe('calculateAfa', () => {
    it('should calculate correct AfA for old building (2% rate)', () => {
      const buildingValue = 300000
      const buildingYear = 2000
      const expectedAfa = 300000 * 0.02 // 6,000 EUR

      expect(calculateAfa(buildingValue, buildingYear)).toBe(expectedAfa)
    })

    it('should calculate correct AfA for new building (3% rate)', () => {
      const buildingValue = 400000
      const buildingYear = 2023
      const expectedAfa = 400000 * 0.03 // 12,000 EUR

      expect(calculateAfa(buildingValue, buildingYear)).toBe(expectedAfa)
    })

    it('should calculate correct AfA for very old building (2.5% rate)', () => {
      const buildingValue = 200000
      const buildingYear = 1920
      const expectedAfa = 200000 * 0.025 // 5,000 EUR

      expect(calculateAfa(buildingValue, buildingYear)).toBe(expectedAfa)
    })

    it('should return 0 for zero building value', () => {
      expect(calculateAfa(0, 2020)).toBe(0)
    })

    it('should return 0 for negative building value', () => {
      expect(calculateAfa(-100000, 2020)).toBe(0)
    })

    it('should use default building year if not provided', () => {
      const buildingValue = 300000
      const expectedAfa = 300000 * 0.02 // Uses 2020 as default -> 2% rate

      expect(calculateAfa(buildingValue)).toBe(expectedAfa)
    })
  })

  describe('calculateWerbungskosten', () => {
    it('should calculate total expenses with all components', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
        buildingYear: 2000,
        maintenanceCosts: 1800,
        managementCosts: 2700,
        otherExpenses: 500,
        mortgageInterest: 4000,
        propertyTax: 600,
        buildingInsurance: 400,
      }

      const afa = 300000 * 0.02 // 6,000 EUR
      const expected = afa + 1800 + 2700 + 500 + 4000 + 600 + 400 // 16,000 EUR

      expect(calculateWerbungskosten(config)).toBe(expected)
    })

    it('should handle missing optional expenses', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
        buildingYear: 2000,
      }

      const afa = 300000 * 0.02 // 6,000 EUR
      expect(calculateWerbungskosten(config)).toBe(afa)
    })

    it('should handle partial expenses', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
        buildingYear: 2000,
        maintenanceCosts: 2000,
        mortgageInterest: 5000,
      }

      const afa = 300000 * 0.02 // 6,000 EUR
      const expected = afa + 2000 + 5000 // 13,000 EUR

      expect(calculateWerbungskosten(config)).toBe(expected)
    })
  })

  describe('calculateRentalPropertyTax', () => {
    it('should calculate tax result with positive taxable income', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 200000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
        buildingYear: 2000,
        maintenanceCosts: 1000,
        managementCosts: 1500,
        mortgageInterest: 3000,
        propertyTax: 500,
        buildingInsurance: 300,
      }

      const result = calculateRentalPropertyTax(config, 0.42)

      expect(result.rentalIncome).toBe(18000)
      expect(result.afa).toBe(4000) // 200,000 * 0.02
      expect(result.expenseBreakdown.afa).toBe(4000)
      expect(result.expenseBreakdown.maintenanceCosts).toBe(1000)
      expect(result.expenseBreakdown.managementCosts).toBe(1500)
      expect(result.expenseBreakdown.mortgageInterest).toBe(3000)
      expect(result.expenseBreakdown.propertyTax).toBe(500)
      expect(result.expenseBreakdown.buildingInsurance).toBe(300)
      expect(result.totalExpenses).toBe(10300)
      expect(result.taxableIncome).toBe(7700) // 18,000 - 10,300
      expect(result.taxSavings).toBe(-3234) // -7,700 * 0.42 (negative because tax burden)
      expect(result.effectiveReturn).toBeCloseTo(0.01489, 4) // (18,000 - 10,300 - 3,234) / 300,000
    })

    it('should calculate tax savings with negative taxable income (loss)', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 12000,
        purchaseYear: 2020,
        buildingYear: 2023,
        maintenanceCosts: 2000,
        managementCosts: 2000,
        mortgageInterest: 8000,
        propertyTax: 800,
        buildingInsurance: 500,
      }

      const result = calculateRentalPropertyTax(config, 0.42)

      expect(result.rentalIncome).toBe(12000)
      expect(result.afa).toBe(9000) // 300,000 * 0.03
      expect(result.totalExpenses).toBe(22300)
      expect(result.taxableIncome).toBe(-10300) // 12,000 - 22,300 (loss)
      expect(result.taxSavings).toBe(4326) // 10,300 * 0.42 (positive tax savings)
      expect(result.effectiveReturn).toBeCloseTo(-0.014935, 4) // (12,000 - 22,300 + 4,326) / 400,000
    })

    it('should use default tax rate if not provided', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
        buildingYear: 2000,
        maintenanceCosts: 2000,
        mortgageInterest: 5000,
      }

      const result = calculateRentalPropertyTax(config) // Uses default 0.42

      expect(result.taxableIncome).toBe(5000) // 18,000 - 13,000
      expect(result.taxSavings).toBe(-2100) // -5,000 * 0.42
    })

    it('should handle zero expenses', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
      }

      const result = calculateRentalPropertyTax(config, 0.42)

      expect(result.rentalIncome).toBe(18000)
      expect(result.afa).toBe(6000) // Uses default building year 2020 -> 2% rate
      expect(result.totalExpenses).toBe(6000)
      expect(result.taxableIncome).toBe(12000)
      expect(result.taxSavings).toBe(-5040) // -12,000 * 0.42
    })

    it('should calculate effective return correctly', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
        buildingYear: 2000,
        maintenanceCosts: 2000,
        mortgageInterest: 4000,
      }

      const result = calculateRentalPropertyTax(config, 0.3)

      // Rent: 18,000, AfA: 6,000, Expenses: 2,000 + 4,000 = 6,000
      // Total expenses: 12,000, Taxable: 6,000, Tax impact: -1,800
      // Net cash flow: 18,000 - 12,000 - 1,800 = 4,200
      // Effective return: 4,200 / 400,000 = 1.05%
      expect(result.effectiveReturn).toBeCloseTo(0.0105, 4)
    })
  })

  describe('calculateCumulativeAfa', () => {
    it('should calculate correct AfA for each year', () => {
      const buildingValue = 300000
      const buildingYear = 2000 // 2% rate -> 50 years to fully depreciate
      const years = 5

      const result = calculateCumulativeAfa(buildingValue, buildingYear, years)

      expect(result).toHaveLength(5)
      expect(result[0]).toBe(6000) // Year 1: 300,000 * 0.02
      expect(result[1]).toBe(6000) // Year 2: 300,000 * 0.02
      expect(result[2]).toBe(6000) // Year 3: 300,000 * 0.02
      expect(result[3]).toBe(6000) // Year 4: 300,000 * 0.02
      expect(result[4]).toBe(6000) // Year 5: 300,000 * 0.02
    })

    it('should return zero after full depreciation', () => {
      const buildingValue = 100000
      const buildingYear = 2023 // 3% rate -> ~34 years to fully depreciate
      const years = 40

      const result = calculateCumulativeAfa(buildingValue, buildingYear, years)

      expect(result).toHaveLength(40)
      // First 33 years should have full AfA
      expect(result[0]).toBe(3000)
      expect(result[32]).toBe(3000)
      // Year 34 should have partial or zero
      expect(result[33]).toBeGreaterThanOrEqual(0)
      expect(result[33]).toBeLessThanOrEqual(3000)
      // After year 34, should be zero
      expect(result[34]).toBe(0)
      expect(result[39]).toBe(0)
    })

    it('should handle very old buildings (2.5% rate)', () => {
      const buildingValue = 100000
      const buildingYear = 1920 // 2.5% rate -> 40 years to fully depreciate
      const years = 5

      const result = calculateCumulativeAfa(buildingValue, buildingYear, years)

      expect(result).toHaveLength(5)
      expect(result[0]).toBe(2500) // Year 1: 100,000 * 0.025
      expect(result[1]).toBe(2500) // Year 2: 100,000 * 0.025
      expect(result[4]).toBe(2500) // Year 5: 100,000 * 0.025
    })
  })

  describe('estimateTypicalExpenses', () => {
    it('should calculate typical expense estimates', () => {
      const annualRent = 20000

      const result = estimateTypicalExpenses(annualRent)

      expect(result.maintenanceCosts).toBe(2000) // 10% of rent
      expect(result.managementCosts).toBe(3000) // 15% of rent
      expect(result.propertyTax).toBe(4000) // 20% of rent
      expect(result.buildingInsurance).toBe(1600) // 8% of rent
    })

    it('should scale proportionally with rent', () => {
      const annualRent = 10000

      const result = estimateTypicalExpenses(annualRent)

      expect(result.maintenanceCosts).toBe(1000)
      expect(result.managementCosts).toBe(1500)
      expect(result.propertyTax).toBe(2000)
      expect(result.buildingInsurance).toBe(800)
    })

    it('should handle zero rent', () => {
      const result = estimateTypicalExpenses(0)

      expect(result.maintenanceCosts).toBe(0)
      expect(result.managementCosts).toBe(0)
      expect(result.propertyTax).toBe(0)
      expect(result.buildingInsurance).toBe(0)
    })
  })

  describe('validateRentalPropertyConfig', () => {
    it('should return no errors for valid config', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
        buildingYear: 2000,
        maintenanceCosts: 2000,
        managementCosts: 2000,
        mortgageInterest: 5000,
      }

      const errors = validateRentalPropertyConfig(config)
      expect(errors).toHaveLength(0)
    })

    it('should detect invalid building value', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 0,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
      }

      const errors = validateRentalPropertyConfig(config)
      expect(errors).toContain('Gebäudewert muss größer als 0 sein')
    })

    it('should detect negative land value', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: -10000,
        annualRent: 18000,
        purchaseYear: 2020,
      }

      const errors = validateRentalPropertyConfig(config)
      expect(errors).toContain('Grundstückswert darf nicht negativ sein')
    })

    it('should detect invalid annual rent', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 0,
        purchaseYear: 2020,
      }

      const errors = validateRentalPropertyConfig(config)
      expect(errors).toContain('Jährliche Mieteinnahmen müssen größer als 0 sein')
    })

    it('should detect invalid purchase year', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 1800,
      }

      const errors = validateRentalPropertyConfig(config)
      expect(errors).toContain('Kaufjahr muss zwischen 1900 und nächstem Jahr liegen')
    })

    it('should detect invalid building year', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
        buildingYear: 1700,
      }

      const errors = validateRentalPropertyConfig(config)
      expect(errors).toContain('Baujahr muss zwischen 1800 und den nächsten 5 Jahren liegen')
    })

    it('should detect purchase year before building year', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2019,
        buildingYear: 2020,
      }

      const errors = validateRentalPropertyConfig(config)
      expect(errors).toContain('Kaufjahr kann nicht vor dem Baujahr liegen')
    })

    it('should detect negative maintenance costs', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
        maintenanceCosts: -1000,
      }

      const errors = validateRentalPropertyConfig(config)
      expect(errors).toContain('Instandhaltungskosten dürfen nicht negativ sein')
    })

    it('should detect negative management costs', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2020,
        managementCosts: -500,
      }

      const errors = validateRentalPropertyConfig(config)
      expect(errors).toContain('Verwaltungskosten dürfen nicht negativ sein')
    })

    it('should detect multiple validation errors', () => {
      const config: RentalPropertyConfig = {
        buildingValue: 0,
        landValue: -10000,
        annualRent: 0,
        purchaseYear: 1800,
        buildingYear: 1700,
      }

      const errors = validateRentalPropertyConfig(config)
      expect(errors.length).toBeGreaterThan(1)
    })
  })

  describe('Real-world scenarios', () => {
    it('should calculate realistic scenario: profitable rental property', () => {
      // Realistic example: €400,000 property (€300,000 building + €100,000 land)
      // Annual rent: €18,000 (4.5% gross yield)
      // Built in 2020, purchased in 2023
      const config: RentalPropertyConfig = {
        buildingValue: 300000,
        landValue: 100000,
        annualRent: 18000,
        purchaseYear: 2023,
        buildingYear: 2020,
        maintenanceCosts: 1800, // 10% of rent
        managementCosts: 2700, // 15% of rent
        mortgageInterest: 5000, // ~2.5% interest on €200,000 mortgage
        propertyTax: 800,
        buildingInsurance: 400,
      }

      const result = calculateRentalPropertyTax(config, 0.42)

      // AfA: 300,000 * 0.02 = 6,000
      // Total expenses: 6,000 + 1,800 + 2,700 + 5,000 + 800 + 400 = 16,700
      // Taxable income: 18,000 - 16,700 = 1,300
      // Tax burden: 1,300 * 0.42 = 546
      // Net cash flow: 18,000 - 16,700 - 546 = 754
      // Effective return: 754 / 400,000 = 0.1885%

      expect(result.taxableIncome).toBe(1300)
      expect(result.taxSavings).toBe(-546)
      expect(result.effectiveReturn).toBeCloseTo(0.001885, 5)
    })

    it('should calculate realistic scenario: loss-making property with tax benefit', () => {
      // New expensive property with high mortgage
      const config: RentalPropertyConfig = {
        buildingValue: 400000,
        landValue: 150000,
        annualRent: 20000,
        purchaseYear: 2023,
        buildingYear: 2023,
        maintenanceCosts: 2000,
        managementCosts: 3000,
        mortgageInterest: 15000, // High mortgage
        propertyTax: 1000,
        buildingInsurance: 600,
      }

      const result = calculateRentalPropertyTax(config, 0.42)

      // AfA: 400,000 * 0.03 = 12,000
      // Total expenses: 12,000 + 2,000 + 3,000 + 15,000 + 1,000 + 600 = 33,600
      // Taxable income: 20,000 - 33,600 = -13,600 (loss)
      // Tax savings: 13,600 * 0.42 = 5,712 (reduces other tax burden)
      // Net cash flow: 20,000 - 33,600 + 5,712 = -7,888
      // Effective return: -7,888 / 550,000 = -1.43% (negative but partially offset by tax)

      expect(result.taxableIncome).toBe(-13600)
      expect(result.taxSavings).toBe(5712)
      expect(result.effectiveReturn).toBeCloseTo(-0.01434, 4)
    })

    it('should calculate realistic scenario: old building with 2.5% AfA', () => {
      // Historic building from 1920
      const config: RentalPropertyConfig = {
        buildingValue: 250000,
        landValue: 80000,
        annualRent: 15000,
        purchaseYear: 2020,
        buildingYear: 1920,
        maintenanceCosts: 3000, // Higher maintenance for old building
        managementCosts: 2250,
        mortgageInterest: 4000,
        propertyTax: 900,
        buildingInsurance: 500,
      }

      const result = calculateRentalPropertyTax(config, 0.42)

      // AfA: 250,000 * 0.025 = 6,250
      // Total expenses: 6,250 + 3,000 + 2,250 + 4,000 + 900 + 500 = 16,900
      // Taxable income: 15,000 - 16,900 = -1,900 (small loss)
      // Tax savings: 1,900 * 0.42 = 798
      // Net cash flow: 15,000 - 16,900 + 798 = -1,102
      // Effective return: -1,102 / 330,000 = -0.334%

      expect(result.afa).toBe(6250)
      expect(result.taxableIncome).toBe(-1900)
      expect(result.taxSavings).toBe(798)
      expect(result.effectiveReturn).toBeCloseTo(-0.00334, 5)
    })
  })
})
