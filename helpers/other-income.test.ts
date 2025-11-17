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

  describe('BU-Rente (Disability Insurance)', () => {
    it('should calculate BU-Rente with Leibrenten-Besteuerung correctly', () => {
      const currentYear = new Date().getFullYear()
      const birthYear = currentYear - 40 // 40 years old
      const disabilityStartYear = currentYear
      const source: OtherIncomeSource = {
        id: 'bu-1',
        name: 'BU-Rente',
        type: 'bu_rente',
        amountType: 'gross',
        monthlyAmount: 1500,
        startYear: disabilityStartYear,
        endYear: null, // Permanent
        inflationRate: 0,
        taxRate: 25.0,
        enabled: true,
        buRenteConfig: {
          disabilityStartYear,
          disabilityEndYear: null,
          birthYear,
          disabilityDegree: 100,
          applyLeibrentenBesteuerung: true,
          ageAtDisabilityStart: 40,
        },
      }

      const result = calculateOtherIncomeForYear(source, currentYear)
      expect(result).not.toBe(null)
      expect(result!.grossMonthlyAmount).toBe(1500)
      expect(result!.grossAnnualAmount).toBe(18000)

      // At age 40, Ertragsanteil is 36%
      expect(result!.buRenteDetails).toBeDefined()
      expect(result!.buRenteDetails!.ertragsanteilPercent).toBe(36)
      expect(result!.buRenteDetails!.taxableAmount).toBe(6480) // 18000 * 36%
      expect(result!.buRenteDetails!.isActive).toBe(true)

      // Tax on taxable amount only
      expect(result!.taxAmount).toBe(1620) // 6480 * 25%
      expect(result!.netAnnualAmount).toBe(16380) // 18000 - 1620
      expect(result!.netMonthlyAmount).toBe(1365) // 16380 / 12
    })

    it('should calculate BU-Rente without Leibrenten-Besteuerung correctly', () => {
      const currentYear = new Date().getFullYear()
      const birthYear = currentYear - 40
      const disabilityStartYear = currentYear
      const source: OtherIncomeSource = {
        id: 'bu-1',
        name: 'BU-Rente',
        type: 'bu_rente',
        amountType: 'gross',
        monthlyAmount: 1500,
        startYear: disabilityStartYear,
        endYear: null,
        inflationRate: 0,
        taxRate: 25.0,
        enabled: true,
        buRenteConfig: {
          disabilityStartYear,
          disabilityEndYear: null,
          birthYear,
          disabilityDegree: 100,
          applyLeibrentenBesteuerung: false, // Full taxation
          ageAtDisabilityStart: 40,
        },
      }

      const result = calculateOtherIncomeForYear(source, currentYear)
      expect(result).not.toBe(null)
      expect(result!.grossAnnualAmount).toBe(18000)

      // Without Leibrenten-Besteuerung, full amount is taxable
      expect(result!.taxAmount).toBe(4500) // 18000 * 25%
      expect(result!.netAnnualAmount).toBe(13500) // 18000 - 4500
    })

    it('should return null for year before disability starts', () => {
      const currentYear = new Date().getFullYear()
      const birthYear = currentYear - 40
      const disabilityStartYear = currentYear + 5
      const source: OtherIncomeSource = {
        id: 'bu-1',
        name: 'BU-Rente',
        type: 'bu_rente',
        amountType: 'gross',
        monthlyAmount: 1500,
        startYear: disabilityStartYear,
        endYear: null,
        inflationRate: 0,
        taxRate: 25.0,
        enabled: true,
        buRenteConfig: {
          disabilityStartYear,
          disabilityEndYear: null,
          birthYear,
          disabilityDegree: 100,
          applyLeibrentenBesteuerung: true,
          ageAtDisabilityStart: 45,
        },
      }

      const result = calculateOtherIncomeForYear(source, currentYear)
      expect(result).toBe(null)
    })

    it('should return null for year after disability ends', () => {
      const currentYear = new Date().getFullYear()
      const birthYear = currentYear - 40
      const disabilityStartYear = currentYear - 5
      const disabilityEndYear = currentYear - 1
      const source: OtherIncomeSource = {
        id: 'bu-1',
        name: 'BU-Rente',
        type: 'bu_rente',
        amountType: 'gross',
        monthlyAmount: 1500,
        startYear: disabilityStartYear,
        endYear: disabilityEndYear,
        inflationRate: 0,
        taxRate: 25.0,
        enabled: true,
        buRenteConfig: {
          disabilityStartYear,
          disabilityEndYear,
          birthYear,
          disabilityDegree: 100,
          applyLeibrentenBesteuerung: true,
          ageAtDisabilityStart: 35,
        },
      }

      const result = calculateOtherIncomeForYear(source, currentYear)
      expect(result).toBe(null)
    })

    it('should calculate correct Ertragsanteil for different ages', () => {
      const currentYear = new Date().getFullYear()

      // Test age 30: should be 40%
      const source30: OtherIncomeSource = {
        id: 'bu-1',
        name: 'BU-Rente',
        type: 'bu_rente',
        amountType: 'gross',
        monthlyAmount: 1500,
        startYear: currentYear,
        endYear: null,
        inflationRate: 0,
        taxRate: 25.0,
        enabled: true,
        buRenteConfig: {
          disabilityStartYear: currentYear,
          disabilityEndYear: null,
          birthYear: currentYear - 30,
          disabilityDegree: 100,
          applyLeibrentenBesteuerung: true,
          ageAtDisabilityStart: 30,
        },
      }

      const result30 = calculateOtherIncomeForYear(source30, currentYear)
      expect(result30!.buRenteDetails!.ertragsanteilPercent).toBe(40)

      // Test age 50: should be 32%
      const source50: OtherIncomeSource = {
        id: 'bu-2',
        name: 'BU-Rente',
        type: 'bu_rente',
        amountType: 'gross',
        monthlyAmount: 1500,
        startYear: currentYear,
        endYear: null,
        inflationRate: 0,
        taxRate: 25.0,
        enabled: true,
        buRenteConfig: {
          disabilityStartYear: currentYear,
          disabilityEndYear: null,
          birthYear: currentYear - 50,
          disabilityDegree: 100,
          applyLeibrentenBesteuerung: true,
          ageAtDisabilityStart: 50,
        },
      }

      const result50 = calculateOtherIncomeForYear(source50, currentYear)
      expect(result50!.buRenteDetails!.ertragsanteilPercent).toBe(32)

      // Test age 65: should be 24%
      const source65: OtherIncomeSource = {
        id: 'bu-3',
        name: 'BU-Rente',
        type: 'bu_rente',
        amountType: 'gross',
        monthlyAmount: 1500,
        startYear: currentYear,
        endYear: null,
        inflationRate: 0,
        taxRate: 25.0,
        enabled: true,
        buRenteConfig: {
          disabilityStartYear: currentYear,
          disabilityEndYear: null,
          birthYear: currentYear - 65,
          disabilityDegree: 100,
          applyLeibrentenBesteuerung: true,
          ageAtDisabilityStart: 65,
        },
      }

      const result65 = calculateOtherIncomeForYear(source65, currentYear)
      expect(result65!.buRenteDetails!.ertragsanteilPercent).toBe(24)
    })

    it('should create default BU-Rente source with correct values', () => {
      const source = createDefaultOtherIncomeSource('bu_rente')
      expect(source.type).toBe('bu_rente')
      expect(source.amountType).toBe('gross')
      expect(source.taxRate).toBe(25.0)
      expect(source.inflationRate).toBe(0)
      expect(source.monthlyAmount).toBe(1500)
      expect(source.buRenteConfig).toBeDefined()
      expect(source.buRenteConfig!.disabilityDegree).toBe(100)
      expect(source.buRenteConfig!.applyLeibrentenBesteuerung).toBe(true)
    })

    it('should include BU-Rente in display name mapping', () => {
      expect(getIncomeTypeDisplayName('bu_rente')).toBe('BU-Rente')
    })

    it('should handle multiple income sources with BU-Rente in calculateOtherIncome', () => {
      const currentYear = new Date().getFullYear()
      const config: OtherIncomeConfiguration = {
        enabled: true,
        sources: [
          {
            id: 'rental-1',
            name: 'Mieteinnahmen',
            type: 'rental',
            amountType: 'gross',
            monthlyAmount: 1000,
            startYear: currentYear,
            endYear: null,
            inflationRate: 2.0,
            taxRate: 30.0,
            enabled: true,
          },
          {
            id: 'bu-1',
            name: 'BU-Rente',
            type: 'bu_rente',
            amountType: 'gross',
            monthlyAmount: 1500,
            startYear: currentYear,
            endYear: null,
            inflationRate: 0,
            taxRate: 25.0,
            enabled: true,
            buRenteConfig: {
              disabilityStartYear: currentYear,
              disabilityEndYear: null,
              birthYear: currentYear - 40,
              disabilityDegree: 100,
              applyLeibrentenBesteuerung: true,
              ageAtDisabilityStart: 40,
            },
          },
        ],
      }

      const result = calculateOtherIncome(config, currentYear, currentYear)

      expect(result[currentYear].sources).toHaveLength(2)
      expect(result[currentYear].sources[0].source.type).toBe('rental')
      expect(result[currentYear].sources[1].source.type).toBe('bu_rente')

      // Rental: 12000 gross, 3600 tax, 8400 net
      // BU-Rente: 18000 gross, 1620 tax (36% Ertragsanteil), 16380 net
      expect(result[currentYear].totalNetAnnualAmount).toBeCloseTo(24780, 0)
      expect(result[currentYear].totalTaxAmount).toBeCloseTo(5220, 0)
    })
  })

  describe('Kapitallebensversicherung calculations', () => {
    describe('Basic payout calculation', () => {
      it('should only pay out in maturity year', () => {
        const currentYear = new Date().getFullYear()
        const source: OtherIncomeSource = {
          id: 'test-klv-1',
          name: 'Kapitallebensversicherung',
          type: 'kapitallebensversicherung',
          amountType: 'gross',
          monthlyAmount: 0,
          startYear: currentYear - 1,
          endYear: currentYear + 5,
          inflationRate: 0,
          taxRate: 26.375,
          enabled: true,
          kapitallebensversicherungConfig: {
            policyStartYear: currentYear - 10,
            policyMaturityYear: currentYear + 5,
            totalPayoutAmount: 50000,
            totalPremiumsPaid: 40000,
            qualifiesForHalbeinkuenfte: false,
            birthYear: currentYear - 40,
            applyTaxFreePortionAfter12Years: false,
          },
        }

        // Should return null before maturity
        const resultBefore = calculateOtherIncomeForYear(source, currentYear)
        expect(resultBefore).toBe(null)

        // Should pay out in maturity year
        const resultMaturity = calculateOtherIncomeForYear(source, currentYear + 5)
        expect(resultMaturity).not.toBe(null)
        expect(resultMaturity!.grossAnnualAmount).toBe(50000)
      })

      it('should calculate investment gains correctly', () => {
        const currentYear = new Date().getFullYear()
        const maturityYear = currentYear + 5
        const source: OtherIncomeSource = {
          id: 'test-klv-2',
          name: 'Kapitallebensversicherung',
          type: 'kapitallebensversicherung',
          amountType: 'gross',
          monthlyAmount: 0,
          startYear: currentYear - 1,
          endYear: maturityYear,
          inflationRate: 0,
          taxRate: 26.375,
          enabled: true,
          kapitallebensversicherungConfig: {
            policyStartYear: currentYear - 10,
            policyMaturityYear: maturityYear,
            totalPayoutAmount: 50000,
            totalPremiumsPaid: 40000,
            qualifiesForHalbeinkuenfte: false,
            birthYear: currentYear - 40,
            applyTaxFreePortionAfter12Years: false,
          },
        }

        const result = calculateOtherIncomeForYear(source, maturityYear)
        expect(result).not.toBe(null)
        expect(result!.kapitallebensversicherungDetails).toBeDefined()
        expect(result!.kapitallebensversicherungDetails!.investmentGains).toBe(10000) // 50000 - 40000
      })
    })

    describe('Tax treatment scenarios', () => {
      it('should apply 100% tax exemption for policies held 12+ years with payout after age 60', () => {
        const currentYear = new Date().getFullYear()
        const maturityYear = currentYear + 5
        const birthYear = currentYear - 65 // 70 years old at payout
        const source: OtherIncomeSource = {
          id: 'test-klv-3',
          name: 'Kapitallebensversicherung',
          type: 'kapitallebensversicherung',
          amountType: 'gross',
          monthlyAmount: 0,
          startYear: currentYear - 1,
          endYear: maturityYear,
          inflationRate: 0,
          taxRate: 26.375,
          enabled: true,
          kapitallebensversicherungConfig: {
            policyStartYear: currentYear - 15, // 20 years total (15 + 5)
            policyMaturityYear: maturityYear,
            totalPayoutAmount: 50000,
            totalPremiumsPaid: 40000,
            qualifiesForHalbeinkuenfte: false,
            birthYear,
            applyTaxFreePortionAfter12Years: true,
          },
        }

        const result = calculateOtherIncomeForYear(source, maturityYear)
        expect(result).not.toBe(null)
        expect(result!.kapitallebensversicherungDetails).toBeDefined()
        expect(result!.kapitallebensversicherungDetails!.taxExemptionPercent).toBe(100)
        expect(result!.kapitallebensversicherungDetails!.taxableGains).toBe(0)
        expect(result!.taxAmount).toBe(0)
        expect(result!.netAnnualAmount).toBe(50000) // Full payout, no tax
      })

      it('should apply 50% tax exemption for Halbeinkünfteverfahren policies', () => {
        const currentYear = new Date().getFullYear()
        const maturityYear = currentYear + 5
        const source: OtherIncomeSource = {
          id: 'test-klv-4',
          name: 'Kapitallebensversicherung',
          type: 'kapitallebensversicherung',
          amountType: 'gross',
          monthlyAmount: 0,
          startYear: currentYear - 1,
          endYear: maturityYear,
          inflationRate: 0,
          taxRate: 26.375,
          enabled: true,
          kapitallebensversicherungConfig: {
            policyStartYear: currentYear - 10,
            policyMaturityYear: maturityYear,
            totalPayoutAmount: 50000,
            totalPremiumsPaid: 40000,
            qualifiesForHalbeinkuenfte: true, // Old policy with 50% exemption
            birthYear: currentYear - 40,
            applyTaxFreePortionAfter12Years: false,
          },
        }

        const result = calculateOtherIncomeForYear(source, maturityYear)
        expect(result).not.toBe(null)
        expect(result!.kapitallebensversicherungDetails).toBeDefined()
        expect(result!.kapitallebensversicherungDetails!.investmentGains).toBe(10000)
        expect(result!.kapitallebensversicherungDetails!.taxExemptionPercent).toBe(50)
        expect(result!.kapitallebensversicherungDetails!.taxableGains).toBe(5000) // 50% of 10000
        expect(result!.taxAmount).toBeCloseTo(1318.75, 2) // 26.375% of 5000
        expect(result!.netAnnualAmount).toBeCloseTo(48681.25, 2) // 50000 - 1318.75
      })

      it('should fully tax gains when no exemption applies', () => {
        const currentYear = new Date().getFullYear()
        const maturityYear = currentYear + 5
        const source: OtherIncomeSource = {
          id: 'test-klv-5',
          name: 'Kapitallebensversicherung',
          type: 'kapitallebensversicherung',
          amountType: 'gross',
          monthlyAmount: 0,
          startYear: currentYear - 1,
          endYear: maturityYear,
          inflationRate: 0,
          taxRate: 26.375,
          enabled: true,
          kapitallebensversicherungConfig: {
            policyStartYear: currentYear - 5, // Only 10 years total
            policyMaturityYear: maturityYear,
            totalPayoutAmount: 50000,
            totalPremiumsPaid: 40000,
            qualifiesForHalbeinkuenfte: false,
            birthYear: currentYear - 40, // Only 45 at payout
            applyTaxFreePortionAfter12Years: false,
          },
        }

        const result = calculateOtherIncomeForYear(source, maturityYear)
        expect(result).not.toBe(null)
        expect(result!.kapitallebensversicherungDetails).toBeDefined()
        expect(result!.kapitallebensversicherungDetails!.investmentGains).toBe(10000)
        expect(result!.kapitallebensversicherungDetails!.taxExemptionPercent).toBe(0)
        expect(result!.kapitallebensversicherungDetails!.taxableGains).toBe(10000) // Full gains taxable
        expect(result!.taxAmount).toBeCloseTo(2637.5, 2) // 26.375% of 10000
        expect(result!.netAnnualAmount).toBeCloseTo(47362.5, 2) // 50000 - 2637.5
      })

      it('should not apply tax exemption if policy duration is less than 12 years even if age criteria met', () => {
        const currentYear = new Date().getFullYear()
        const maturityYear = currentYear + 5
        const birthYear = currentYear - 65 // 70 years old
        const source: OtherIncomeSource = {
          id: 'test-klv-6',
          name: 'Kapitallebensversicherung',
          type: 'kapitallebensversicherung',
          amountType: 'gross',
          monthlyAmount: 0,
          startYear: currentYear - 1,
          endYear: maturityYear,
          inflationRate: 0,
          taxRate: 26.375,
          enabled: true,
          kapitallebensversicherungConfig: {
            policyStartYear: currentYear - 5, // Only 10 years total
            policyMaturityYear: maturityYear,
            totalPayoutAmount: 50000,
            totalPremiumsPaid: 40000,
            qualifiesForHalbeinkuenfte: false,
            birthYear,
            applyTaxFreePortionAfter12Years: true,
          },
        }

        const result = calculateOtherIncomeForYear(source, maturityYear)
        expect(result).not.toBe(null)
        expect(result!.kapitallebensversicherungDetails).toBeDefined()
        // Should not get full exemption due to < 12 years duration
        expect(result!.kapitallebensversicherungDetails!.taxExemptionPercent).toBe(0)
        expect(result!.taxAmount).toBeGreaterThan(0)
      })

      it('should not apply tax exemption if payout before age 60 even if duration is 12+ years', () => {
        const currentYear = new Date().getFullYear()
        const maturityYear = currentYear + 5
        const birthYear = currentYear - 50 // Only 55 years old at payout
        const source: OtherIncomeSource = {
          id: 'test-klv-7',
          name: 'Kapitallebensversicherung',
          type: 'kapitallebensversicherung',
          amountType: 'gross',
          monthlyAmount: 0,
          startYear: currentYear - 1,
          endYear: maturityYear,
          inflationRate: 0,
          taxRate: 26.375,
          enabled: true,
          kapitallebensversicherungConfig: {
            policyStartYear: currentYear - 15, // 20 years total
            policyMaturityYear: maturityYear,
            totalPayoutAmount: 50000,
            totalPremiumsPaid: 40000,
            qualifiesForHalbeinkuenfte: false,
            birthYear,
            applyTaxFreePortionAfter12Years: true,
          },
        }

        const result = calculateOtherIncomeForYear(source, maturityYear)
        expect(result).not.toBe(null)
        expect(result!.kapitallebensversicherungDetails).toBeDefined()
        // Should not get full exemption due to age < 60
        expect(result!.kapitallebensversicherungDetails!.taxExemptionPercent).toBe(0)
        expect(result!.taxAmount).toBeGreaterThan(0)
      })
    })

    describe('createDefaultOtherIncomeSource for kapitallebensversicherung', () => {
      it('should create default Kapitallebensversicherung source with correct configuration', () => {
        const source = createDefaultOtherIncomeSource('kapitallebensversicherung')

        expect(source.type).toBe('kapitallebensversicherung')
        expect(source.name).toBe('Kapitallebensversicherung')
        expect(source.amountType).toBe('gross')
        expect(source.monthlyAmount).toBe(0)
        expect(source.inflationRate).toBe(0)
        expect(source.taxRate).toBe(26.375) // Abgeltungsteuer
        expect(source.kapitallebensversicherungConfig).toBeDefined()
        expect(source.kapitallebensversicherungConfig!.totalPayoutAmount).toBe(50000)
        expect(source.kapitallebensversicherungConfig!.totalPremiumsPaid).toBe(40000)
        expect(source.kapitallebensversicherungConfig!.applyTaxFreePortionAfter12Years).toBe(true)
      })
    })

    describe('getIncomeTypeDisplayName', () => {
      it('should return correct display name for Kapitallebensversicherung', () => {
        expect(getIncomeTypeDisplayName('kapitallebensversicherung')).toBe('Kapitallebensversicherung')
      })
    })

    describe('Integration with calculateOtherIncome', () => {
      it('should calculate total income correctly with multiple sources including Kapitallebensversicherung', () => {
        const currentYear = new Date().getFullYear()
        const maturityYear = currentYear + 5

        const config: OtherIncomeConfiguration = {
          enabled: true,
          sources: [
            {
              id: 'rental-1',
              name: 'Rental Income',
              type: 'rental',
              amountType: 'gross',
              monthlyAmount: 1000,
              startYear: currentYear,
              endYear: null,
              inflationRate: 0,
              taxRate: 30.0,
              enabled: true,
            },
            {
              id: 'klv-1',
              name: 'Kapitallebensversicherung',
              type: 'kapitallebensversicherung',
              amountType: 'gross',
              monthlyAmount: 0,
              startYear: currentYear,
              endYear: maturityYear,
              inflationRate: 0,
              taxRate: 26.375,
              enabled: true,
              kapitallebensversicherungConfig: {
                policyStartYear: currentYear - 15,
                policyMaturityYear: maturityYear,
                totalPayoutAmount: 50000,
                totalPremiumsPaid: 40000,
                qualifiesForHalbeinkuenfte: false,
                birthYear: currentYear - 65,
                applyTaxFreePortionAfter12Years: true,
              },
            },
          ],
        }

        const result = calculateOtherIncome(config, currentYear, maturityYear)

        // Before maturity year: only rental income
        expect(result[currentYear].sources).toHaveLength(1)
        expect(result[currentYear].sources[0].source.type).toBe('rental')
        expect(result[currentYear].totalNetAnnualAmount).toBe(8400) // 12000 - 3600 tax

        // At maturity year: rental + Kapitallebensversicherung
        expect(result[maturityYear].sources).toHaveLength(2)
        expect(result[maturityYear].sources[0].source.type).toBe('rental')
        expect(result[maturityYear].sources[1].source.type).toBe('kapitallebensversicherung')

        // Rental: 8400 net
        // Kapitallebensversicherung: 50000 gross, 0 tax (100% exempt), 50000 net
        expect(result[maturityYear].totalNetAnnualAmount).toBe(58400)
        expect(result[maturityYear].totalTaxAmount).toBe(3600) // Only from rental
      })
    })
  })
})
