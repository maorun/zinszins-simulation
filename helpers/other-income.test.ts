import { describe, it, expect } from 'vitest'
import {
  type OtherIncomeSource,
  type OtherIncomeConfiguration,
  calculateOtherIncomeForYear,
  calculateOtherIncome,
  createDefaultOtherIncomeSource,
  getIncomeTypeDisplayName,
  getAmountTypeDisplayName,
} from './other-income'

describe('Other Income Calculations', () => {
  describe('calculateOtherIncomeForYear', () => {
    it('should return null for disabled income source', () => {
      const source: OtherIncomeSource = {
        id: 'test-1',
        name: 'Test Income',
        type: 'rental',
        amountType: 'gross',
        monthlyAmount: 1000,
        startYear: 2025,
        endYear: null,
        inflationRate: 2.0,
        taxRate: 30.0,
        enabled: false,
      }

      const result = calculateOtherIncomeForYear(source, 2025)
      expect(result).toBe(null)
    })

    it('should return null for year before start year', () => {
      const source: OtherIncomeSource = {
        id: 'test-1',
        name: 'Test Income',
        type: 'rental',
        amountType: 'gross',
        monthlyAmount: 1000,
        startYear: 2025,
        endYear: null,
        inflationRate: 2.0,
        taxRate: 30.0,
        enabled: true,
      }

      const result = calculateOtherIncomeForYear(source, 2024)
      expect(result).toBe(null)
    })

    it('should return null for year after end year', () => {
      const source: OtherIncomeSource = {
        id: 'test-1',
        name: 'Test Income',
        type: 'rental',
        amountType: 'gross',
        monthlyAmount: 1000,
        startYear: 2025,
        endYear: 2030,
        inflationRate: 2.0,
        taxRate: 30.0,
        enabled: true,
      }

      const result = calculateOtherIncomeForYear(source, 2031)
      expect(result).toBe(null)
    })

    it('should calculate gross income with taxes correctly', () => {
      const source: OtherIncomeSource = {
        id: 'test-1',
        name: 'Rental Income',
        type: 'rental',
        amountType: 'gross',
        monthlyAmount: 1000,
        startYear: 2025,
        endYear: null,
        inflationRate: 2.0,
        taxRate: 30.0,
        enabled: true,
      }

      const result = calculateOtherIncomeForYear(source, 2025)
      expect(result).not.toBe(null)
      expect(result!.grossMonthlyAmount).toBe(1000)
      expect(result!.grossAnnualAmount).toBe(12000)
      expect(result!.taxAmount).toBe(3600) // 30% of 12000
      expect(result!.netAnnualAmount).toBe(8400) // 12000 - 3600
      expect(result!.netMonthlyAmount).toBe(700) // 8400 / 12
      expect(result!.inflationFactor).toBe(1)
    })

    it('should calculate net income without taxes correctly', () => {
      const source: OtherIncomeSource = {
        id: 'test-1',
        name: 'Net Income',
        type: 'other',
        amountType: 'net',
        monthlyAmount: 800,
        startYear: 2025,
        endYear: null,
        inflationRate: 2.0,
        taxRate: 30.0, // Should be ignored for net income
        enabled: true,
      }

      const result = calculateOtherIncomeForYear(source, 2025)
      expect(result).not.toBe(null)
      expect(result!.grossMonthlyAmount).toBe(800)
      expect(result!.grossAnnualAmount).toBe(9600)
      expect(result!.taxAmount).toBe(0) // No tax for net income
      expect(result!.netAnnualAmount).toBe(9600)
      expect(result!.netMonthlyAmount).toBe(800)
      expect(result!.inflationFactor).toBe(1)
    })

    it('should apply inflation adjustment correctly', () => {
      const source: OtherIncomeSource = {
        id: 'test-1',
        name: 'Rental Income',
        type: 'rental',
        amountType: 'gross',
        monthlyAmount: 1000,
        startYear: 2025,
        endYear: null,
        inflationRate: 2.0,
        taxRate: 30.0,
        enabled: true,
      }

      // Test year 2027 (2 years after start)
      const result = calculateOtherIncomeForYear(source, 2027)
      expect(result).not.toBe(null)

      // Inflation factor: (1.02)^2 = 1.0404
      const expectedInflationFactor = Math.pow(1.02, 2)
      expect(result!.inflationFactor).toBeCloseTo(expectedInflationFactor, 4)

      const expectedMonthlyAmount = 1000 * expectedInflationFactor
      expect(result!.grossMonthlyAmount).toBeCloseTo(expectedMonthlyAmount, 2)

      const expectedAnnualAmount = expectedMonthlyAmount * 12
      expect(result!.grossAnnualAmount).toBeCloseTo(expectedAnnualAmount, 2)

      const expectedTax = expectedAnnualAmount * 0.3
      expect(result!.taxAmount).toBeCloseTo(expectedTax, 2)

      const expectedNetAmount = expectedAnnualAmount - expectedTax
      expect(result!.netAnnualAmount).toBeCloseTo(expectedNetAmount, 2)
    })
  })

  describe('calculateOtherIncome', () => {
    it('should return empty result when disabled', () => {
      const config: OtherIncomeConfiguration = {
        enabled: false,
        sources: [createDefaultOtherIncomeSource()],
      }

      const result = calculateOtherIncome(config, 2025, 2027)
      expect(result).toEqual({})
    })

    it('should return empty result when no sources', () => {
      const config: OtherIncomeConfiguration = {
        enabled: true,
        sources: [],
      }

      const result = calculateOtherIncome(config, 2025, 2027)
      expect(result).toEqual({})
    })

    it('should calculate multiple income sources correctly', () => {
      const source1: OtherIncomeSource = {
        id: 'rental-1',
        name: 'Rental Income',
        type: 'rental',
        amountType: 'gross',
        monthlyAmount: 1000,
        startYear: 2025,
        endYear: null,
        inflationRate: 2.0,
        taxRate: 30.0,
        enabled: true,
      }

      const source2: OtherIncomeSource = {
        id: 'business-1',
        name: 'Side Business',
        type: 'business',
        amountType: 'net',
        monthlyAmount: 500,
        startYear: 2025,
        endYear: 2026, // Only 2 years
        inflationRate: 3.0,
        taxRate: 25.0, // Ignored for net income
        enabled: true,
      }

      const config: OtherIncomeConfiguration = {
        enabled: true,
        sources: [source1, source2],
      }

      const result = calculateOtherIncome(config, 2025, 2027)

      // Check 2025 - both sources active
      expect(result[2025]).toBeDefined()
      expect(result[2025].sources).toHaveLength(2)

      const rental2025 = result[2025].sources.find(s => s.source.id === 'rental-1')!
      expect(rental2025.netAnnualAmount).toBe(8400) // (1000*12) - (1000*12*0.3)

      const business2025 = result[2025].sources.find(s => s.source.id === 'business-1')!
      expect(business2025.netAnnualAmount).toBe(6000) // 500*12, no tax

      expect(result[2025].totalNetAnnualAmount).toBe(14400) // 8400 + 6000
      expect(result[2025].totalTaxAmount).toBe(3600) // Only rental has tax

      // Check 2026 - both sources still active
      expect(result[2026]).toBeDefined()
      expect(result[2026].sources).toHaveLength(2)

      // Check 2027 - only rental source active (business ended)
      expect(result[2027]).toBeDefined()
      expect(result[2027].sources).toHaveLength(1)
      expect(result[2027].sources[0].source.id).toBe('rental-1')
    })

    it('should handle sources with different time periods', () => {
      const earlySource: OtherIncomeSource = {
        id: 'early-1',
        name: 'Early Income',
        type: 'other',
        amountType: 'net',
        monthlyAmount: 300,
        startYear: 2025,
        endYear: 2026,
        inflationRate: 0, // No inflation for simplicity
        taxRate: 0,
        enabled: true,
      }

      const lateSource: OtherIncomeSource = {
        id: 'late-1',
        name: 'Late Income',
        type: 'other',
        amountType: 'net',
        monthlyAmount: 400,
        startYear: 2027,
        endYear: null,
        inflationRate: 0,
        taxRate: 0,
        enabled: true,
      }

      const config: OtherIncomeConfiguration = {
        enabled: true,
        sources: [earlySource, lateSource],
      }

      const result = calculateOtherIncome(config, 2024, 2028)

      // 2024: No sources active
      expect(result[2024].sources).toHaveLength(0)
      expect(result[2024].totalNetAnnualAmount).toBe(0)

      // 2025: Only early source
      expect(result[2025].sources).toHaveLength(1)
      expect(result[2025].sources[0].source.id).toBe('early-1')
      expect(result[2025].totalNetAnnualAmount).toBe(3600) // 300*12

      // 2026: Only early source
      expect(result[2026].sources).toHaveLength(1)
      expect(result[2026].sources[0].source.id).toBe('early-1')

      // 2027: Only late source
      expect(result[2027].sources).toHaveLength(1)
      expect(result[2027].sources[0].source.id).toBe('late-1')
      expect(result[2027].totalNetAnnualAmount).toBe(4800) // 400*12

      // 2028: Only late source
      expect(result[2028].sources).toHaveLength(1)
      expect(result[2028].sources[0].source.id).toBe('late-1')
    })
  })

  describe('createDefaultOtherIncomeSource', () => {
    it('should create a valid default income source', () => {
      const source = createDefaultOtherIncomeSource()

      expect(source.id).toBeTruthy()
      expect(source.name).toBe('Mieteinnahmen')
      expect(source.type).toBe('rental')
      expect(source.amountType).toBe('gross')
      expect(source.monthlyAmount).toBe(1000)
      expect(source.startYear).toBe(new Date().getFullYear())
      expect(source.endYear).toBe(null)
      expect(source.inflationRate).toBe(2.0)
      expect(source.taxRate).toBe(30.0)
      expect(source.enabled).toBe(true)
      expect(source.notes).toBe('')
    })

    it('should create unique IDs for multiple sources', () => {
      const source1 = createDefaultOtherIncomeSource()
      const source2 = createDefaultOtherIncomeSource()

      expect(source1.id).not.toBe(source2.id)
    })
  })

  describe('getIncomeTypeDisplayName', () => {
    it('should return correct display names for all income types', () => {
      expect(getIncomeTypeDisplayName('rental')).toBe('Mieteinnahmen')
      expect(getIncomeTypeDisplayName('pension')).toBe('Rente/Pension')
      expect(getIncomeTypeDisplayName('business')).toBe('Gewerbeeinkünfte')
      expect(getIncomeTypeDisplayName('investment')).toBe('Kapitalerträge')
      expect(getIncomeTypeDisplayName('other')).toBe('Sonstige Einkünfte')
    })
  })

  describe('getAmountTypeDisplayName', () => {
    it('should return correct display names for amount types', () => {
      expect(getAmountTypeDisplayName('gross')).toBe('Brutto')
      expect(getAmountTypeDisplayName('net')).toBe('Netto')
    })
  })
})
