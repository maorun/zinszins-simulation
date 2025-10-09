import { describe, it, expect } from 'vitest'
import {
  type OtherIncomeSource,
  type OtherIncomeConfiguration,

  calculateOtherIncomeForYear,
  calculateOtherIncome,
  createDefaultOtherIncomeSource,
  createDefaultRealEstateConfig,
  getIncomeTypeDisplayName,
  getAmountTypeDisplayName,
  getKindergeldAmount,
  createDefaultKindergeldConfig,
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

  describe('Real Estate Calculations', () => {
    it('should calculate rental income with real estate costs correctly', () => {
      const source: OtherIncomeSource = {
        id: 'test-rental',
        name: 'Test Rental Property',
        type: 'rental',
        amountType: 'gross',
        monthlyAmount: 1000,
        startYear: 2025,
        endYear: null,
        inflationRate: 2.0,
        taxRate: 30.0,
        enabled: true,
        realEstateConfig: {
          maintenanceCostPercent: 15.0, // 15% maintenance
          vacancyRatePercent: 5.0, // 5% vacancy
          propertyAppreciationRate: 2.5,
          propertyValue: 300000,
          monthlyMortgagePayment: 200, // 200€/month mortgage
          includeAppreciation: false,
        },
      }

      const result = calculateOtherIncomeForYear(source, 2025)
      expect(result).not.toBe(null)

      // Base rental income: 1000 * 12 = 12000€
      // Vacancy loss: 12000 * 0.05 = 600€
      // Income after vacancy: 12000 - 600 = 11400€
      // Maintenance costs: 12000 * 0.15 = 1800€
      // Mortgage payment: 200 * 12 = 2400€
      // Net rental income: 11400 - 1800 - 2400 = 7200€

      expect(result!.realEstateDetails).toBeDefined()
      expect(result!.realEstateDetails!.vacancyLoss).toBe(600)
      expect(result!.realEstateDetails!.maintenanceCosts).toBe(1800)
      expect(result!.realEstateDetails!.netRentalIncome).toBe(7200)
      expect(result!.grossAnnualAmount).toBe(7200)

      // Tax calculation: 7200 * 0.30 = 2160€
      expect(result!.taxAmount).toBe(2160)
      expect(result!.netAnnualAmount).toBe(5040) // 7200 - 2160
    })

    it('should handle property appreciation correctly', () => {
      const source: OtherIncomeSource = {
        id: 'test-appreciation',
        name: 'Appreciating Property',
        type: 'rental',
        amountType: 'gross',
        monthlyAmount: 1000,
        startYear: 2025,
        endYear: null,
        inflationRate: 0, // No inflation for simplicity
        taxRate: 0, // No tax for simplicity
        enabled: true,
        realEstateConfig: {
          maintenanceCostPercent: 0,
          vacancyRatePercent: 0,
          propertyAppreciationRate: 3.0, // 3% appreciation
          propertyValue: 200000,
          monthlyMortgagePayment: 0,
          includeAppreciation: true,
        },
      }

      // Test year 2027 (2 years after start)
      const result = calculateOtherIncomeForYear(source, 2027)
      expect(result).not.toBe(null)

      // Property value after 2 years: 200000 * (1.03)^2 = 212180
      const expectedPropertyValue = 200000 * Math.pow(1.03, 2)
      expect(result!.realEstateDetails!.propertyValue).toBeCloseTo(expectedPropertyValue, 2)

      // Annual appreciation for year 2027
      const previousYearValue = 200000 * Math.pow(1.03, 1)
      const expectedAppreciation = expectedPropertyValue - previousYearValue
      expect(result!.realEstateDetails!.annualAppreciation).toBeCloseTo(expectedAppreciation, 2)
    })

    it('should handle negative rental income gracefully', () => {
      const source: OtherIncomeSource = {
        id: 'test-negative',
        name: 'High Cost Property',
        type: 'rental',
        amountType: 'gross',
        monthlyAmount: 500, // Low rent
        startYear: 2025,
        endYear: null,
        inflationRate: 0,
        taxRate: 0,
        enabled: true,
        realEstateConfig: {
          maintenanceCostPercent: 20.0, // High maintenance
          vacancyRatePercent: 10.0, // High vacancy
          propertyAppreciationRate: 0,
          propertyValue: 100000,
          monthlyMortgagePayment: 600, // High mortgage
          includeAppreciation: false,
        },
      }

      const result = calculateOtherIncomeForYear(source, 2025)
      expect(result).not.toBe(null)

      // Base income: 500 * 12 = 6000€
      // Vacancy loss: 6000 * 0.10 = 600€
      // Income after vacancy: 6000 - 600 = 5400€
      // Maintenance: 6000 * 0.20 = 1200€
      // Mortgage: 600 * 12 = 7200€
      // Net rental income: 5400 - 1200 - 7200 = -3000€
      // Should be clamped to 0

      expect(result!.realEstateDetails!.netRentalIncome).toBe(0)
      expect(result!.grossAnnualAmount).toBe(0)
      expect(result!.netAnnualAmount).toBe(0)
    })

    it('should not apply real estate calculations to non-rental income', () => {
      const source: OtherIncomeSource = {
        id: 'test-pension',
        name: 'Pension Income',
        type: 'pension',
        amountType: 'gross',
        monthlyAmount: 1000,
        startYear: 2025,
        endYear: null,
        inflationRate: 2.0,
        taxRate: 25.0,
        enabled: true,
        // This should be ignored for non-rental income
        realEstateConfig: {
          maintenanceCostPercent: 10.0,
          vacancyRatePercent: 5.0,
          propertyAppreciationRate: 2.0,
          propertyValue: 100000,
          monthlyMortgagePayment: 100,
          includeAppreciation: false,
        },
      }

      const result = calculateOtherIncomeForYear(source, 2025)
      expect(result).not.toBe(null)
      expect(result!.realEstateDetails).toBeUndefined()
      expect(result!.grossAnnualAmount).toBe(12000) // No real estate deductions
      expect(result!.taxAmount).toBe(3000)
      expect(result!.netAnnualAmount).toBe(9000)
    })
  })

  describe('createDefaultOtherIncomeSource', () => {
    it('should create a valid default rental income source with real estate config', () => {
      const source = createDefaultOtherIncomeSource('rental')

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
      expect(source.realEstateConfig).toBeDefined()
      expect(source.realEstateConfig!.maintenanceCostPercent).toBe(15.0)
      expect(source.realEstateConfig!.vacancyRatePercent).toBe(5.0)
    })

    it('should create a valid default pension income source without real estate config', () => {
      const source = createDefaultOtherIncomeSource('pension')

      expect(source.name).toBe('Private Rente')
      expect(source.type).toBe('pension')
      expect(source.monthlyAmount).toBe(800)
      expect(source.realEstateConfig).toBeUndefined()
    })

    it('should create unique IDs for multiple sources', () => {
      const source1 = createDefaultOtherIncomeSource()
      const source2 = createDefaultOtherIncomeSource()

      expect(source1.id).not.toBe(source2.id)
    })
  })

  describe('createDefaultRealEstateConfig', () => {
    it('should create a valid default real estate configuration', () => {
      const config = createDefaultRealEstateConfig()

      expect(config.maintenanceCostPercent).toBe(15.0)
      expect(config.vacancyRatePercent).toBe(5.0)
      expect(config.propertyAppreciationRate).toBe(2.5)
      expect(config.propertyValue).toBe(300000)
      expect(config.monthlyMortgagePayment).toBe(0)
      expect(config.includeAppreciation).toBe(false)
    })
  })

  describe('getIncomeTypeDisplayName', () => {
    it('should return correct display names for all income types', () => {
      expect(getIncomeTypeDisplayName('rental')).toBe('Mieteinnahmen')
      expect(getIncomeTypeDisplayName('pension')).toBe('Rente/Pension')
      expect(getIncomeTypeDisplayName('business')).toBe('Gewerbeeinkünfte')
      expect(getIncomeTypeDisplayName('investment')).toBe('Kapitalerträge')
      expect(getIncomeTypeDisplayName('kindergeld')).toBe('Kindergeld')
      expect(getIncomeTypeDisplayName('other')).toBe('Sonstige Einkünfte')
    })
  })

  describe('getAmountTypeDisplayName', () => {
    it('should return correct display names for amount types', () => {
      expect(getAmountTypeDisplayName('gross')).toBe('Brutto')
      expect(getAmountTypeDisplayName('net')).toBe('Netto')
    })
  })

  describe('Kindergeld Calculations', () => {
    it('should calculate Kindergeld correctly for a newborn child', () => {
      const source: OtherIncomeSource = {
        id: 'kindergeld-1',
        name: 'Kindergeld Kind 1',
        type: 'kindergeld',
        amountType: 'net',
        monthlyAmount: 250,
        startYear: 2024,
        endYear: null,
        inflationRate: 0,
        taxRate: 0,
        enabled: true,
        kindergeldConfig: {
          numberOfChildren: 1,
          childBirthYear: 2024,
          inEducation: false,
          childOrderNumber: 1,
        },
      }

      const result = calculateOtherIncomeForYear(source, 2024)
      expect(result).not.toBe(null)
      expect(result!.grossMonthlyAmount).toBe(250)
      expect(result!.grossAnnualAmount).toBe(3000)
      expect(result!.taxAmount).toBe(0) // Kindergeld is tax-free
      expect(result!.netAnnualAmount).toBe(3000)
      expect(result!.kindergeldDetails?.childAge).toBe(0)
      expect(result!.kindergeldDetails?.isActive).toBe(true)
    })

    it('should stop Kindergeld at age 18 if not in education', () => {
      const source: OtherIncomeSource = {
        id: 'kindergeld-1',
        name: 'Kindergeld Kind 1',
        type: 'kindergeld',
        amountType: 'net',
        monthlyAmount: 250,
        startYear: 2024,
        endYear: null,
        inflationRate: 0,
        taxRate: 0,
        enabled: true,
        kindergeldConfig: {
          numberOfChildren: 1,
          childBirthYear: 2006, // Child born in 2006, will be 18 in 2024
          inEducation: false,
          childOrderNumber: 1,
        },
      }

      const result = calculateOtherIncomeForYear(source, 2024)
      expect(result).not.toBe(null)
      expect(result!.grossAnnualAmount).toBe(0)
      expect(result!.netAnnualAmount).toBe(0)
      expect(result!.kindergeldDetails?.childAge).toBe(18)
      expect(result!.kindergeldDetails?.isActive).toBe(false)
      expect(result!.kindergeldDetails?.endReason).toBe('Kind ist 18 oder älter (nicht in Ausbildung)')
    })

    it('should continue Kindergeld until age 25 if in education', () => {
      const source: OtherIncomeSource = {
        id: 'kindergeld-1',
        name: 'Kindergeld Kind 1',
        type: 'kindergeld',
        amountType: 'net',
        monthlyAmount: 250,
        startYear: 2024,
        endYear: null,
        inflationRate: 0,
        taxRate: 0,
        enabled: true,
        kindergeldConfig: {
          numberOfChildren: 1,
          childBirthYear: 2004, // Child born in 2004, will be 20 in 2024
          inEducation: true,
          childOrderNumber: 1,
        },
      }

      // At age 20, still in education - should receive Kindergeld
      const result2024 = calculateOtherIncomeForYear(source, 2024)
      expect(result2024).not.toBe(null)
      expect(result2024!.grossAnnualAmount).toBe(3000)
      expect(result2024!.kindergeldDetails?.childAge).toBe(20)
      expect(result2024!.kindergeldDetails?.isActive).toBe(true)

      // At age 24, still in education - should receive Kindergeld
      const result2028 = calculateOtherIncomeForYear(source, 2028)
      expect(result2028).not.toBe(null)
      expect(result2028!.grossAnnualAmount).toBe(3000)
      expect(result2028!.kindergeldDetails?.childAge).toBe(24)
      expect(result2028!.kindergeldDetails?.isActive).toBe(true)

      // At age 25, even in education - Kindergeld stops
      const result2029 = calculateOtherIncomeForYear(source, 2029)
      expect(result2029).not.toBe(null)
      expect(result2029!.grossAnnualAmount).toBe(0)
      expect(result2029!.kindergeldDetails?.childAge).toBe(25)
      expect(result2029!.kindergeldDetails?.isActive).toBe(false)
      expect(result2029!.kindergeldDetails?.endReason).toBe('Kind ist 25 oder älter')
    })

    it('should not pay Kindergeld before child is born', () => {
      const source: OtherIncomeSource = {
        id: 'kindergeld-1',
        name: 'Kindergeld Kind 1',
        type: 'kindergeld',
        amountType: 'net',
        monthlyAmount: 250,
        startYear: 2023,
        endYear: null,
        inflationRate: 0,
        taxRate: 0,
        enabled: true,
        kindergeldConfig: {
          numberOfChildren: 1,
          childBirthYear: 2025, // Child will be born in 2025
          inEducation: false,
          childOrderNumber: 1,
        },
      }

      const result = calculateOtherIncomeForYear(source, 2024)
      expect(result).not.toBe(null)
      expect(result!.grossAnnualAmount).toBe(0)
      expect(result!.netAnnualAmount).toBe(0)
      expect(result!.kindergeldDetails?.childAge).toBe(-1)
      expect(result!.kindergeldDetails?.isActive).toBe(false)
      expect(result!.kindergeldDetails?.endReason).toBe('Kind noch nicht geboren')
    })

    it('should create default Kindergeld source with correct settings', () => {
      const source = createDefaultOtherIncomeSource('kindergeld')

      expect(source.type).toBe('kindergeld')
      expect(source.amountType).toBe('net') // Kindergeld is tax-free
      expect(source.monthlyAmount).toBe(250)
      expect(source.inflationRate).toBe(0) // Kindergeld doesn't auto-adjust
      expect(source.taxRate).toBe(0) // Kindergeld is tax-free
      expect(source.kindergeldConfig).toBeDefined()
      expect(source.kindergeldConfig?.numberOfChildren).toBe(1)
      expect(source.kindergeldConfig?.childOrderNumber).toBe(1)
      expect(source.kindergeldConfig?.inEducation).toBe(false)
    })

    it('should calculate total Kindergeld for multiple children over years', () => {
      const config: OtherIncomeConfiguration = {
        enabled: true,
        sources: [
          {
            id: 'kindergeld-1',
            name: 'Kindergeld Kind 1',
            type: 'kindergeld',
            amountType: 'net',
            monthlyAmount: 250,
            startYear: 2024,
            endYear: null,
            inflationRate: 0,
            taxRate: 0,
            enabled: true,
            kindergeldConfig: {
              numberOfChildren: 1,
              childBirthYear: 2024,
              inEducation: false,
              childOrderNumber: 1,
            },
          },
          {
            id: 'kindergeld-2',
            name: 'Kindergeld Kind 2',
            type: 'kindergeld',
            amountType: 'net',
            monthlyAmount: 250,
            startYear: 2026,
            endYear: null,
            inflationRate: 0,
            taxRate: 0,
            enabled: true,
            kindergeldConfig: {
              numberOfChildren: 1,
              childBirthYear: 2026,
              inEducation: false,
              childOrderNumber: 2,
            },
          },
        ],
      }

      const result = calculateOtherIncome(config, 2024, 2028)

      // 2024: Only first child (newborn)
      expect(result[2024].totalNetAnnualAmount).toBe(3000)

      // 2026: Both children
      expect(result[2026].totalNetAnnualAmount).toBe(6000)

      // 2028: Both children (ages 4 and 2)
      expect(result[2028].totalNetAnnualAmount).toBe(6000)
    })

    it('should return correct Kindergeld amount', () => {
      expect(getKindergeldAmount(1)).toBe(250)
      expect(getKindergeldAmount(2)).toBe(250)
      expect(getKindergeldAmount(3)).toBe(250)
    })

    it('should create default Kindergeld config with correct values', () => {
      const config = createDefaultKindergeldConfig()
      expect(config.numberOfChildren).toBe(1)
      expect(config.childOrderNumber).toBe(1)
      expect(config.inEducation).toBe(false)
      expect(config.childBirthYear).toBe(new Date().getFullYear())
    })
  })
})
