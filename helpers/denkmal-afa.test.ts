/**
 * Tests for Denkmal-AfA Helper Functions
 */

import { describe, it, expect } from 'vitest'
import {
  calculateDenkmalAfaForYear,
  analyzeDenkmalAfa,
  compareDenkmalWithStandardAfa,
  calculateDenkmalRoi,
  getDefaultDenkmalConfig,
  validateDenkmalConfig,
  formatDenkmalCurrency,
  formatDenkmalPercentage,
  DENKMAL_AFA_RATES,
  type DenkmalPropertyConfig,
} from './denkmal-afa'

describe('denkmal-afa', () => {
  describe('DENKMAL_AFA_RATES', () => {
    it('should have correct rates for rental properties', () => {
      expect(DENKMAL_AFA_RATES.PHASE_1_RATE).toBe(0.09)
      expect(DENKMAL_AFA_RATES.PHASE_1_YEARS).toBe(8)
      expect(DENKMAL_AFA_RATES.PHASE_2_RATE).toBe(0.07)
      expect(DENKMAL_AFA_RATES.PHASE_2_YEARS).toBe(4)
    })

    it('should have correct rates for owner-occupied properties', () => {
      expect(DENKMAL_AFA_RATES.OWNER_OCCUPIED_RATE).toBe(0.09)
      expect(DENKMAL_AFA_RATES.OWNER_OCCUPIED_YEARS).toBe(10)
    })
  })

  describe('calculateDenkmalAfaForYear', () => {
    const rentalConfig: DenkmalPropertyConfig = {
      useType: 'rental',
      buildingValue: 300000,
      landValue: 100000,
      renovationCosts: 150000,
      startYear: 2024,
      annualRent: 24000,
      purchasedAfterRenovation: false,
    }

    it('should calculate 9% AfA for first year (rental)', () => {
      const result = calculateDenkmalAfaForYear(rentalConfig, 0)

      expect(result.year).toBe(2024)
      expect(result.afaRate).toBe(9) // 9%
      expect(result.phase).toBe(1)
      expect(result.afaAcquisition).toBe(27000) // 300000 * 0.09
      expect(result.afaRenovation).toBe(13500) // 150000 * 0.09
      expect(result.totalAfa).toBe(40500)
      expect(result.afaPeriodEnded).toBe(false)
    })

    it('should calculate 9% AfA for year 8 (rental)', () => {
      const result = calculateDenkmalAfaForYear(rentalConfig, 7) // Year 8

      expect(result.year).toBe(2031)
      expect(result.afaRate).toBe(9)
      expect(result.phase).toBe(1)
      expect(result.totalAfa).toBe(40500)
    })

    it('should calculate 7% AfA for year 9 (rental)', () => {
      const result = calculateDenkmalAfaForYear(rentalConfig, 8) // Year 9

      expect(result.year).toBe(2032)
      expect(result.afaRate).toBeCloseTo(7, 5) // Use toBeCloseTo for floating point
      expect(result.phase).toBe(2)
      expect(result.afaAcquisition).toBeCloseTo(21000, 0) // 300000 * 0.07
      expect(result.afaRenovation).toBeCloseTo(10500, 0) // 150000 * 0.07
      expect(result.totalAfa).toBeCloseTo(31500, 0)
    })

    it('should calculate 7% AfA for year 12 (rental)', () => {
      const result = calculateDenkmalAfaForYear(rentalConfig, 11) // Year 12

      expect(result.year).toBe(2035)
      expect(result.afaRate).toBeCloseTo(7, 5)
      expect(result.phase).toBe(2)
      expect(result.totalAfa).toBeCloseTo(31500, 0)
      expect(result.afaPeriodEnded).toBe(false)
    })

    it('should end AfA after year 12 (rental)', () => {
      const result = calculateDenkmalAfaForYear(rentalConfig, 12) // Year 13

      expect(result.year).toBe(2036)
      expect(result.afaRate).toBe(0)
      expect(result.phase).toBe(2)
      expect(result.totalAfa).toBe(0)
      expect(result.afaPeriodEnded).toBe(true)
    })

    const ownerOccupiedConfig: DenkmalPropertyConfig = {
      useType: 'owner_occupied',
      buildingValue: 300000,
      landValue: 100000,
      renovationCosts: 150000,
      startYear: 2024,
      personalTaxRate: 0.35,
      purchasedAfterRenovation: false,
    }

    it('should calculate 9% AfA for first year (owner-occupied)', () => {
      const result = calculateDenkmalAfaForYear(ownerOccupiedConfig, 0)

      expect(result.year).toBe(2024)
      expect(result.afaRate).toBe(9)
      expect(result.phase).toBe(1)
      expect(result.totalAfa).toBe(40500)
    })

    it('should calculate 9% AfA for year 10 (owner-occupied)', () => {
      const result = calculateDenkmalAfaForYear(ownerOccupiedConfig, 9) // Year 10

      expect(result.year).toBe(2033)
      expect(result.afaRate).toBe(9)
      expect(result.totalAfa).toBe(40500)
      expect(result.afaPeriodEnded).toBe(false)
    })

    it('should end AfA after year 10 (owner-occupied)', () => {
      const result = calculateDenkmalAfaForYear(ownerOccupiedConfig, 10) // Year 11

      expect(result.year).toBe(2034)
      expect(result.afaRate).toBe(0)
      expect(result.totalAfa).toBe(0)
      expect(result.afaPeriodEnded).toBe(true)
    })
  })

  describe('analyzeDenkmalAfa', () => {
    const rentalConfig: DenkmalPropertyConfig = {
      useType: 'rental',
      buildingValue: 300000,
      landValue: 100000,
      renovationCosts: 150000,
      startYear: 2024,
      annualRent: 24000,
      purchasedAfterRenovation: false,
    }

    it('should analyze rental property over 12 years', () => {
      const result = analyzeDenkmalAfa(rentalConfig, 0.35)

      expect(result.depreciationPeriod).toBe(12)
      expect(result.yearlyBreakdown).toHaveLength(12)

      // Phase 1: 8 years × 40,500 = 324,000
      // Phase 2: 4 years × 31,500 = 126,000
      // Total: 450,000
      expect(result.totalAfaAcquisition).toBe(300000 * 0.09 * 8 + 300000 * 0.07 * 4)
      expect(result.totalAfaRenovation).toBe(150000 * 0.09 * 8 + 150000 * 0.07 * 4)
      expect(result.totalAfa).toBe(450000)

      expect(result.totalTaxSavings).toBe(450000 * 0.35)
      expect(result.averageAnnualAfa).toBe(450000 / 12)
    })

    it('should analyze owner-occupied property over 10 years', () => {
      const ownerConfig: DenkmalPropertyConfig = {
        useType: 'owner_occupied',
        buildingValue: 300000,
        landValue: 100000,
        renovationCosts: 150000,
        startYear: 2024,
        personalTaxRate: 0.42,
        purchasedAfterRenovation: false,
      }

      const result = analyzeDenkmalAfa(ownerConfig, 0.42)

      expect(result.depreciationPeriod).toBe(10)
      expect(result.yearlyBreakdown).toHaveLength(10)

      // 10 years × 40,500 = 405,000
      expect(result.totalAfa).toBe(405000)
      expect(result.totalTaxSavings).toBe(405000 * 0.42)
      expect(result.averageAnnualAfa).toBe(40500)
    })

    it('should include correct benefit description for rental', () => {
      const result = analyzeDenkmalAfa(rentalConfig, 0.35)

      expect(result.benefitDescription).toContain('§ 7i EStG')
      expect(result.benefitDescription).toContain('9%')
      expect(result.benefitDescription).toContain('7%')
    })

    it('should include correct benefit description for owner-occupied', () => {
      const ownerConfig: DenkmalPropertyConfig = {
        useType: 'owner_occupied',
        buildingValue: 300000,
        landValue: 100000,
        renovationCosts: 150000,
        startYear: 2024,
        personalTaxRate: 0.35,
        purchasedAfterRenovation: false,
      }

      const result = analyzeDenkmalAfa(ownerConfig, 0.35)

      expect(result.benefitDescription).toContain('§ 10f EStG')
      expect(result.benefitDescription).toContain('Sonderausgabenabzug')
    })
  })

  describe('compareDenkmalWithStandardAfa', () => {
    const rentalConfig: DenkmalPropertyConfig = {
      useType: 'rental',
      buildingValue: 300000,
      landValue: 100000,
      renovationCosts: 150000,
      startYear: 2024,
      annualRent: 24000,
      purchasedAfterRenovation: false,
    }

    it('should compare Denkmal-AfA with standard 2% AfA', () => {
      const result = compareDenkmalWithStandardAfa(rentalConfig, 0.35, 0.02)

      // Denkmal: 450,000 AfA
      expect(result.denkmalAfa.totalAfa).toBe(450000)

      // Standard: (300,000 + 150,000) × 0.02 × 12 years = 108,000
      expect(result.standardAfa.totalAfa).toBe(108000)
      expect(result.standardAfa.annualAfa).toBe(9000)

      // Additional benefit
      const denkmalTaxSavings = 450000 * 0.35
      const standardTaxSavings = 108000 * 0.35
      expect(result.additionalTaxBenefit).toBe(denkmalTaxSavings - standardTaxSavings)
      expect(result.additionalTaxBenefit).toBeGreaterThan(100000) // Significant benefit
    })

    it('should calculate additional benefit percentage', () => {
      const result = compareDenkmalWithStandardAfa(rentalConfig, 0.35, 0.02)

      // (450,000 - 108,000) / 108,000 × 100 = 316.67%
      expect(result.additionalBenefitPercentage).toBeCloseTo(316.67, 1)
    })

    it('should provide recommendation for high benefits', () => {
      const result = compareDenkmalWithStandardAfa(rentalConfig, 0.42, 0.02)

      expect(result.recommendation).toContain('Sehr attraktiv')
    })

    it('should provide recommendation for moderate benefits', () => {
      const smallConfig: DenkmalPropertyConfig = {
        ...rentalConfig,
        buildingValue: 100000,
        renovationCosts: 50000,
      }

      const result = compareDenkmalWithStandardAfa(smallConfig, 0.25, 0.02)

      expect(result.recommendation).toBeDefined()
      expect(result.recommendation.length).toBeGreaterThan(0)
    })

    it('should calculate break-even years', () => {
      const result = compareDenkmalWithStandardAfa(rentalConfig, 0.35, 0.02)

      expect(result.breakEvenYears).toBeGreaterThan(0)
      expect(result.breakEvenYears).toBeLessThan(20) // Should be reasonable
    })
  })

  describe('calculateDenkmalRoi', () => {
    const rentalConfig: DenkmalPropertyConfig = {
      useType: 'rental',
      buildingValue: 300000,
      landValue: 100000,
      renovationCosts: 150000,
      startYear: 2024,
      annualRent: 24000,
      purchasedAfterRenovation: false,
    }

    it('should calculate ROI for rental property over 15 years', () => {
      const result = calculateDenkmalRoi(rentalConfig, 0.35, 15, 0.25)

      // Total investment: 300,000 + 100,000 + 150,000 = 550,000
      expect(result.totalInvestment).toBe(550000)

      // Total rental income: 24,000 × 15 = 360,000
      expect(result.totalRentalIncome).toBe(360000)

      // Operating expenses: 360,000 × 0.25 = 90,000
      expect(result.totalOperatingExpenses).toBe(90000)

      // Tax savings: Denkmal AfA over 12 years
      expect(result.totalTaxSavings).toBe(450000 * 0.35) // 157,500

      // Net cash flow: 360,000 - 90,000 + 157,500 = 427,500
      expect(result.netCashFlow).toBeCloseTo(427500, 0)
    })

    it('should calculate ROI with and without tax benefits', () => {
      const result = calculateDenkmalRoi(rentalConfig, 0.35, 15, 0.25)

      // ROI without tax: (360,000 - 90,000) / 550,000 × 100 = 49.09%
      expect(result.roi).toBeCloseTo(49.09, 1)

      // ROI with tax: 427,500 / 550,000 × 100 = 77.73%
      expect(result.roiWithTaxBenefits).toBeCloseTo(77.73, 1)

      // Additional ROI from tax benefits
      expect(result.additionalRoiFromTaxBenefits).toBeCloseTo(28.64, 1)
    })

    it('should calculate annual cash-on-cash return', () => {
      const result = calculateDenkmalRoi(rentalConfig, 0.35, 15, 0.25)

      // Annual cash-on-cash: (24,000 - 6,000) / 550,000 × 100 = 3.27%
      expect(result.annualCashOnCashReturn).toBeCloseTo(3.27, 1)
    })

    it('should throw error for owner-occupied properties', () => {
      const ownerConfig: DenkmalPropertyConfig = {
        useType: 'owner_occupied',
        buildingValue: 300000,
        landValue: 100000,
        renovationCosts: 150000,
        startYear: 2024,
        personalTaxRate: 0.35,
        purchasedAfterRenovation: false,
      }

      expect(() => calculateDenkmalRoi(ownerConfig, 0.35, 15)).toThrow('ROI calculation is only applicable for rental properties')
    })

    it('should handle different operating expense rates', () => {
      const result1 = calculateDenkmalRoi(rentalConfig, 0.35, 15, 0.20) // 20%
      const result2 = calculateDenkmalRoi(rentalConfig, 0.35, 15, 0.30) // 30%

      expect(result1.totalOperatingExpenses).toBeLessThan(result2.totalOperatingExpenses)
      expect(result1.roi).toBeGreaterThan(result2.roi)
    })
  })

  describe('getDefaultDenkmalConfig', () => {
    it('should create default rental config', () => {
      const config = getDefaultDenkmalConfig('rental', 2024)

      expect(config.useType).toBe('rental')
      expect(config.buildingValue).toBe(300000)
      expect(config.landValue).toBe(100000)
      expect(config.renovationCosts).toBe(150000)
      expect(config.startYear).toBe(2024)
      expect(config.annualRent).toBe(24000)
      expect(config.personalTaxRate).toBeUndefined()
      expect(config.purchasedAfterRenovation).toBe(false)
    })

    it('should create default owner-occupied config', () => {
      const config = getDefaultDenkmalConfig('owner_occupied', 2024)

      expect(config.useType).toBe('owner_occupied')
      expect(config.annualRent).toBeUndefined()
      expect(config.personalTaxRate).toBe(0.35)
    })
  })

  describe('validateDenkmalConfig', () => {
    it('should validate correct rental config', () => {
      const config: DenkmalPropertyConfig = {
        useType: 'rental',
        buildingValue: 300000,
        landValue: 100000,
        renovationCosts: 150000,
        startYear: 2024,
        annualRent: 24000,
        purchasedAfterRenovation: false,
      }

      const errors = validateDenkmalConfig(config)
      expect(errors).toHaveLength(0)
    })

    it('should validate correct owner-occupied config', () => {
      const config: DenkmalPropertyConfig = {
        useType: 'owner_occupied',
        buildingValue: 300000,
        landValue: 100000,
        renovationCosts: 150000,
        startYear: 2024,
        personalTaxRate: 0.35,
        purchasedAfterRenovation: false,
      }

      const errors = validateDenkmalConfig(config)
      expect(errors).toHaveLength(0)
    })

    it('should reject negative building value', () => {
      const config = getDefaultDenkmalConfig('rental', 2024)
      config.buildingValue = -100000

      const errors = validateDenkmalConfig(config)
      expect(errors).toContain('Gebäudewert muss größer als 0 sein')
    })

    it('should reject negative land value', () => {
      const config = getDefaultDenkmalConfig('rental', 2024)
      config.landValue = -50000

      const errors = validateDenkmalConfig(config)
      expect(errors).toContain('Grundstückswert kann nicht negativ sein')
    })

    it('should reject negative renovation costs', () => {
      const config = getDefaultDenkmalConfig('rental', 2024)
      config.renovationCosts = -10000

      const errors = validateDenkmalConfig(config)
      expect(errors).toContain('Sanierungskosten können nicht negativ sein')
    })

    it('should reject invalid start year', () => {
      const config = getDefaultDenkmalConfig('rental', 1999)

      const errors = validateDenkmalConfig(config)
      expect(errors).toContain('Startjahr muss zwischen 2000 und 2100 liegen')
    })

    it('should require annual rent for rental properties', () => {
      const config = getDefaultDenkmalConfig('rental', 2024)
      config.annualRent = undefined

      const errors = validateDenkmalConfig(config)
      expect(errors).toContain('Bei Vermietung muss eine jährliche Miete angegeben werden')
    })

    it('should require positive annual rent for rental properties', () => {
      const config = getDefaultDenkmalConfig('rental', 2024)
      config.annualRent = -1000 // Negative rent

      const errors = validateDenkmalConfig(config)
      expect(errors).toContain('Jährliche Miete muss größer als 0 sein')
    })

    it('should require personal tax rate for owner-occupied', () => {
      const config = getDefaultDenkmalConfig('owner_occupied', 2024)
      config.personalTaxRate = undefined

      const errors = validateDenkmalConfig(config)
      expect(errors).toContain('Bei Eigennutzung muss ein persönlicher Steuersatz angegeben werden')
    })

    it('should require valid personal tax rate for owner-occupied', () => {
      const config = getDefaultDenkmalConfig('owner_occupied', 2024)
      config.personalTaxRate = 1.5

      const errors = validateDenkmalConfig(config)
      expect(errors).toContain('Persönlicher Steuersatz muss zwischen 0 und 1 (0% und 100%) liegen')
    })
  })

  describe('formatDenkmalCurrency', () => {
    it('should format currency with German locale', () => {
      const result1 = formatDenkmalCurrency(300000)
      const result2 = formatDenkmalCurrency(150000)
      const result3 = formatDenkmalCurrency(1500)
      
      // Check that it contains the expected number and currency symbol
      expect(result1).toMatch(/300[.\u00A0\s]000/)
      expect(result1).toContain('€')
      expect(result2).toMatch(/150[.\u00A0\s]000/)
      expect(result3).toMatch(/1[.\u00A0\s]500/)
    })

    it('should handle negative values', () => {
      const result = formatDenkmalCurrency(-50000)
      expect(result).toContain('-')
      expect(result).toMatch(/50[.\u00A0\s]000/)
      expect(result).toContain('€')
    })

    it('should format without decimals', () => {
      const result = formatDenkmalCurrency(12345.67)
      expect(result).toMatch(/12[.\u00A0\s]346/) // Rounds to 12,346
      expect(result).toContain('€')
    })
  })

  describe('formatDenkmalPercentage', () => {
    it('should format percentage with German locale', () => {
      const result1 = formatDenkmalPercentage(0.09)
      const result2 = formatDenkmalPercentage(0.07)
      const result3 = formatDenkmalPercentage(0.35)
      
      expect(result1).toMatch(/9[,.]0/)
      expect(result1).toContain('%')
      expect(result2).toMatch(/7[,.]0/)
      expect(result3).toMatch(/35[,.]0/)
    })

    it('should handle different decimal places', () => {
      const result1 = formatDenkmalPercentage(0.0925, 2)
      const result2 = formatDenkmalPercentage(0.0925, 0)
      
      expect(result1).toMatch(/9[,.]25/)
      expect(result2).toMatch(/9[^,.]/)
    })

    it('should handle zero', () => {
      const result = formatDenkmalPercentage(0)
      expect(result).toMatch(/0[,.]0/)
      expect(result).toContain('%')
    })
  })
})
