import { describe, it, expect } from 'vitest'
import {
  type CareCostConfiguration,
  type CareLevel,
  DEFAULT_CARE_LEVELS,
  createDefaultCareCostConfiguration,
  calculateCareCostsForYear,
  calculateTotalCareCosts,
  getCareLevelDisplayName,
  getCareLevelDescription,
  validateCareCostConfiguration,
} from './care-cost-simulation'

describe('care-cost-simulation', () => {
  describe('DEFAULT_CARE_LEVELS', () => {
    it('should have correct structure for all care levels', () => {
      expect(Object.keys(DEFAULT_CARE_LEVELS)).toHaveLength(5)

      for (let level = 1; level <= 5; level++) {
        const careLevel = DEFAULT_CARE_LEVELS[level as CareLevel]
        expect(careLevel).toBeDefined()
        expect(careLevel.level).toBe(level)
        expect(careLevel.name).toBe(`Pflegegrad ${level}`)
        expect(careLevel.description).toBeTruthy()
        expect(careLevel.careAllowance).toBeGreaterThanOrEqual(0)
        expect(careLevel.careServiceBenefit).toBeGreaterThanOrEqual(0)
        expect(careLevel.typicalMonthlyCost).toBeGreaterThan(0)
        expect(typeof careLevel.requiresProfessionalCare).toBe('boolean')
      }
    })

    it('should have increasing costs and benefits for higher care levels', () => {
      for (let level = 2; level <= 5; level++) {
        const currentLevel = DEFAULT_CARE_LEVELS[level as CareLevel]
        const previousLevel = DEFAULT_CARE_LEVELS[(level - 1) as CareLevel]

        expect(currentLevel.careAllowance).toBeGreaterThanOrEqual(previousLevel.careAllowance)
        expect(currentLevel.careServiceBenefit).toBeGreaterThanOrEqual(previousLevel.careServiceBenefit)
        expect(currentLevel.typicalMonthlyCost).toBeGreaterThan(previousLevel.typicalMonthlyCost)
      }
    })
  })

  describe('createDefaultCareCostConfiguration', () => {
    it('should return valid default configuration', () => {
      const config = createDefaultCareCostConfiguration()

      expect(config.enabled).toBe(false)
      expect(config.startYear).toBeGreaterThan(new Date().getFullYear())
      expect(config.careLevel).toBe(2)
      expect(config.careInflationRate).toBe(3)
      expect(config.includeStatutoryBenefits).toBe(true)
      expect(config.privateCareInsuranceMonthlyBenefit).toBe(0)
      expect(config.careDurationYears).toBe(0)
      expect(config.planningMode).toBe('individual')
      expect(config.taxDeductible).toBe(true)
      expect(config.maxAnnualTaxDeduction).toBe(20000)
    })
  })

  describe('calculateCareCostsForYear', () => {
    const baseConfig: CareCostConfiguration = {
      enabled: true,
      startYear: 2030,
      careLevel: 2,
      careInflationRate: 3,
      includeStatutoryBenefits: true,
      privateCareInsuranceMonthlyBenefit: 0,
      careDurationYears: 0,
      planningMode: 'individual',
      taxDeductible: true,
      maxAnnualTaxDeduction: 20000,
    }

    it('should return no costs when care is not needed', () => {
      const result = calculateCareCostsForYear(baseConfig, 2025) // Before start year

      expect(result.careNeeded).toBe(false)
      expect(result.monthlyCostsGross).toBe(0)
      expect(result.monthlyCostsNet).toBe(0)
      expect(result.annualCostsNet).toBe(0)
    })

    it('should return no costs when disabled', () => {
      const disabledConfig = { ...baseConfig, enabled: false }
      const result = calculateCareCostsForYear(disabledConfig, 2030)

      expect(result.careNeeded).toBe(false)
      expect(result.monthlyCostsNet).toBe(0)
    })

    it('should calculate costs correctly for care level 2', () => {
      const result = calculateCareCostsForYear(baseConfig, 2030)

      expect(result.careNeeded).toBe(true)
      expect(result.careLevel).toBe(2)
      expect(result.monthlyCostsGross).toBe(800) // Typical cost for level 2
      expect(result.monthlyStatutoryBenefits).toBe(332) // Care allowance for level 2
      expect(result.monthlyCostsNet).toBe(800 - 332) // Gross minus benefits
      expect(result.annualCostsNet).toBe((800 - 332) * 12)
    })

    it('should apply inflation correctly', () => {
      const result2030 = calculateCareCostsForYear(baseConfig, 2030) // Start year
      const result2031 = calculateCareCostsForYear(baseConfig, 2031) // One year later

      expect(result2030.inflationAdjustmentFactor).toBe(1)
      expect(result2031.inflationAdjustmentFactor).toBe(1.03) // 3% inflation
      expect(result2031.monthlyCostsGross).toBe(800 * 1.03)
    })

    it('should handle custom monthly costs', () => {
      const configWithCustomCosts = { ...baseConfig, customMonthlyCosts: 1200 }
      const result = calculateCareCostsForYear(configWithCustomCosts, 2030)

      expect(result.monthlyCostsGross).toBe(1200)
      expect(result.monthlyCostsNet).toBe(1200 - 332) // Custom cost minus statutory benefits
    })

    it('should handle private care insurance benefits', () => {
      const configWithPrivateBenefits = { ...baseConfig, privateCareInsuranceMonthlyBenefit: 200 }
      const result = calculateCareCostsForYear(configWithPrivateBenefits, 2030)

      expect(result.monthlyPrivateBenefits).toBe(200)
      expect(result.monthlyCostsNet).toBe(800 - 332 - 200) // Gross minus all benefits
    })

    it('should not have negative net costs', () => {
      const configWithHighBenefits = {
        ...baseConfig,
        privateCareInsuranceMonthlyBenefit: 1000, // Higher than typical costs
      }
      const result = calculateCareCostsForYear(configWithHighBenefits, 2030)

      expect(result.monthlyCostsNet).toBe(0) // Should not be negative
    })

    it('should calculate tax deductions correctly', () => {
      const result = calculateCareCostsForYear(baseConfig, 2030)
      const expectedAnnualCosts = (800 - 332) * 12

      expect(result.taxDeductionAmount).toBe(Math.min(expectedAnnualCosts, 20000))
    })

    it('should handle care duration limits', () => {
      const configWithDuration = { ...baseConfig, careDurationYears: 2 }

      const result2030 = calculateCareCostsForYear(configWithDuration, 2030) // Start year
      const result2031 = calculateCareCostsForYear(configWithDuration, 2031) // Within duration
      const result2032 = calculateCareCostsForYear(configWithDuration, 2032) // End of duration
      const result2033 = calculateCareCostsForYear(configWithDuration, 2033) // After duration

      expect(result2030.careNeeded).toBe(true)
      expect(result2031.careNeeded).toBe(true)
      expect(result2032.careNeeded).toBe(false) // Duration ended
      expect(result2033.careNeeded).toBe(false)
    })

    it('should handle different care levels correctly', () => {
      type CareCostResult = ReturnType<typeof calculateCareCostsForYear>
      const results: Array<{ level: CareLevel; result: CareCostResult }> = []

      for (let level = 1; level <= 5; level++) {
        const config = { ...baseConfig, careLevel: level as CareLevel }
        const result = calculateCareCostsForYear(config, 2030)
        results.push({ level: level as CareLevel, result })
      }

      // Check that costs generally increase with care level
      for (let i = 1; i < results.length; i++) {
        expect(results[i].result.monthlyCostsGross).toBeGreaterThan(results[i - 1].result.monthlyCostsGross)
      }
    })
  })

  describe('couple care cost calculation', () => {
    const coupleConfig: CareCostConfiguration = {
      enabled: true,
      startYear: 2030,
      careLevel: 2,
      careInflationRate: 3,
      includeStatutoryBenefits: true,
      privateCareInsuranceMonthlyBenefit: 0,
      careDurationYears: 0,
      planningMode: 'couple',
      taxDeductible: true,
      maxAnnualTaxDeduction: 20000,
      coupleConfig: {
        person2NeedsCare: true,
        person2StartYear: 2032,
        person2CareLevel: 3,
        person2CareDurationYears: 0,
      },
    }

    it('should calculate costs for both persons correctly', () => {
      const result2030 = calculateCareCostsForYear(coupleConfig, 2030) // Only person 1 needs care
      const result2032 = calculateCareCostsForYear(coupleConfig, 2032) // Both need care

      // 2030: Only person 1
      expect(result2030.coupleResults?.person1.needsCare).toBe(true)
      expect(result2030.coupleResults?.person2.needsCare).toBe(false)
      expect(result2030.coupleResults?.person1.careLevel).toBe(2)

      // 2032: Both persons
      expect(result2032.coupleResults?.person1.needsCare).toBe(true)
      expect(result2032.coupleResults?.person2.needsCare).toBe(true)
      expect(result2032.coupleResults?.person1.careLevel).toBe(2)
      expect(result2032.coupleResults?.person2.careLevel).toBe(3)

      // Combined costs should be sum of individual costs
      const expectedCombinedMonthly =
        result2032.coupleResults!.person1.monthlyCostsNet + result2032.coupleResults!.person2.monthlyCostsNet
      expect(result2032.coupleResults?.combined.monthlyCostsNet).toBe(expectedCombinedMonthly)
    })

    it('should handle when only person 1 needs care', () => {
      const configOnlyPerson1 = {
        ...coupleConfig,
        coupleConfig: {
          person2NeedsCare: false,
        },
      }

      const result = calculateCareCostsForYear(configOnlyPerson1, 2030)

      expect(result.coupleResults?.person1.needsCare).toBe(true)
      expect(result.coupleResults?.person2.needsCare).toBe(false)
      expect(result.coupleResults?.person2.monthlyCostsNet).toBe(0)
    })
  })

  describe('calculateTotalCareCosts', () => {
    const config: CareCostConfiguration = {
      enabled: true,
      startYear: 2030,
      careLevel: 2,
      careInflationRate: 3,
      includeStatutoryBenefits: true,
      privateCareInsuranceMonthlyBenefit: 0,
      careDurationYears: 0,
      planningMode: 'individual',
      taxDeductible: true,
      maxAnnualTaxDeduction: 20000,
    }

    it('should calculate total costs over multiple years', () => {
      const result = calculateTotalCareCosts(config, 2030, 2034)

      expect(result.yearlyResults).toHaveLength(5) // 2030-2034
      expect(result.totalCosts).toBeGreaterThan(0)
      expect(result.totalTaxDeductions).toBeGreaterThan(0)

      // Check that costs increase due to inflation
      expect(result.yearlyResults[1].monthlyCostsGross).toBeGreaterThan(result.yearlyResults[0].monthlyCostsGross)
    })

    it('should handle periods before care starts', () => {
      const result = calculateTotalCareCosts(config, 2025, 2029) // Before care starts

      expect(result.totalCosts).toBe(0)
      expect(result.totalTaxDeductions).toBe(0)
      result.yearlyResults.forEach(yearResult => {
        expect(yearResult.careNeeded).toBe(false)
      })
    })
  })

  describe('utility functions', () => {
    it('should return correct display names', () => {
      expect(getCareLevelDisplayName(1)).toBe('Pflegegrad 1')
      expect(getCareLevelDisplayName(2)).toBe('Pflegegrad 2')
      expect(getCareLevelDisplayName(5)).toBe('Pflegegrad 5')
    })

    it('should return correct descriptions', () => {
      expect(getCareLevelDescription(1)).toBe('Geringe Beeinträchtigung der Selbständigkeit')
      expect(getCareLevelDescription(2)).toBe('Erhebliche Beeinträchtigung der Selbständigkeit')
      expect(getCareLevelDescription(5)).toBe('Schwerste Beeinträchtigung mit besonderen Anforderungen')
    })
  })

  describe('validateCareCostConfiguration', () => {
    const validConfig = createDefaultCareCostConfiguration()

    it('should return no errors for valid configuration', () => {
      const enabledConfig = { ...validConfig, enabled: true, startYear: new Date().getFullYear() + 1 }
      const errors = validateCareCostConfiguration(enabledConfig)
      expect(errors).toHaveLength(0)
    })

    it('should return no errors for disabled configuration', () => {
      const errors = validateCareCostConfiguration(validConfig)
      expect(errors).toHaveLength(0)
    })

    it('should validate start year', () => {
      const invalidConfig = { ...validConfig, enabled: true, startYear: 2020 }
      const errors = validateCareCostConfiguration(invalidConfig)
      expect(errors).toContain('Startjahr für Pflegebedürftigkeit kann nicht in der Vergangenheit liegen.')
    })

    it('should validate inflation rate', () => {
      const invalidConfig1 = { ...validConfig, enabled: true, careInflationRate: -1 }
      const invalidConfig2 = { ...validConfig, enabled: true, careInflationRate: 25 }

      expect(validateCareCostConfiguration(invalidConfig1)).toContain(
        'Inflationsrate für Pflegekosten muss zwischen 0% und 20% liegen.',
      )
      expect(validateCareCostConfiguration(invalidConfig2)).toContain(
        'Inflationsrate für Pflegekosten muss zwischen 0% und 20% liegen.',
      )
    })

    it('should validate private benefits', () => {
      const invalidConfig = { ...validConfig, enabled: true, privateCareInsuranceMonthlyBenefit: -100 }
      const errors = validateCareCostConfiguration(invalidConfig)
      expect(errors).toContain('Private Pflegeversicherungsleistung kann nicht negativ sein.')
    })

    it('should validate care duration', () => {
      const invalidConfig = { ...validConfig, enabled: true, careDurationYears: -1 }
      const errors = validateCareCostConfiguration(invalidConfig)
      expect(errors).toContain('Pflegedauer kann nicht negativ sein.')
    })

    it('should validate custom monthly costs', () => {
      const invalidConfig = { ...validConfig, enabled: true, customMonthlyCosts: -500 }
      const errors = validateCareCostConfiguration(invalidConfig)
      expect(errors).toContain('Monatliche Pflegekosten können nicht negativ sein.')
    })

    it('should validate couple configuration', () => {
      const invalidCoupleConfig = {
        ...validConfig,
        enabled: true,
        planningMode: 'couple' as const,
        coupleConfig: {
          person2NeedsCare: true,
          person2StartYear: undefined,
        },
      }
      const errors = validateCareCostConfiguration(invalidCoupleConfig)
      expect(errors).toContain('Startjahr für Person 2 muss angegeben werden.')
    })

    it('should validate person 2 start year', () => {
      const invalidCoupleConfig = {
        ...validConfig,
        enabled: true,
        planningMode: 'couple' as const,
        coupleConfig: {
          person2NeedsCare: true,
          person2StartYear: 2020,
        },
      }
      const errors = validateCareCostConfiguration(invalidCoupleConfig)
      expect(errors).toContain('Startjahr für Person 2 kann nicht in der Vergangenheit liegen.')
    })
  })

  describe('edge cases', () => {
    it('should handle zero care duration', () => {
      const config: CareCostConfiguration = {
        enabled: true,
        startYear: 2030,
        careLevel: 2,
        careInflationRate: 3,
        includeStatutoryBenefits: true,
        privateCareInsuranceMonthlyBenefit: 0,
        careDurationYears: 0, // Until end of life
        planningMode: 'individual',
        taxDeductible: true,
        maxAnnualTaxDeduction: 20000,
      }

      const result = calculateCareCostsForYear(config, 2050) // Far in the future
      expect(result.careNeeded).toBe(true) // Should still need care
    })

    it('should handle very high tax deduction limits', () => {
      const config: CareCostConfiguration = {
        enabled: true,
        startYear: 2030,
        careLevel: 2,
        careInflationRate: 3,
        includeStatutoryBenefits: true,
        privateCareInsuranceMonthlyBenefit: 0,
        careDurationYears: 0,
        planningMode: 'individual',
        taxDeductible: true,
        maxAnnualTaxDeduction: 100000, // Very high limit
      }

      const result = calculateCareCostsForYear(config, 2030)
      expect(result.taxDeductionAmount).toBe(result.annualCostsNet) // Full deduction
    })

    it('should handle care level 1 correctly', () => {
      const config: CareCostConfiguration = {
        enabled: true,
        startYear: 2030,
        careLevel: 1, // Level 1 has no cash benefits
        careInflationRate: 3,
        includeStatutoryBenefits: true,
        privateCareInsuranceMonthlyBenefit: 0,
        careDurationYears: 0,
        planningMode: 'individual',
        taxDeductible: true,
        maxAnnualTaxDeduction: 20000,
      }

      const result = calculateCareCostsForYear(config, 2030)

      expect(result.careLevel).toBe(1)
      expect(result.monthlyStatutoryBenefits).toBe(0) // No cash benefits for level 1
      expect(result.monthlyCostsNet).toBe(200) // Full typical cost for level 1
    })
  })
})
