import { describe, it, expect } from 'vitest'
import {
  calculateHealthCareInsuranceForYear,
  calculateHealthCareInsurance,
  calculateCoupleHealthInsuranceForYear,
  calculateCoupleHealthCareInsurance,
  createDefaultHealthCareInsuranceConfig,
  createDefaultCoupleHealthInsuranceConfig,
  createDefaultFamilyInsuranceThresholds,
  getHealthCareInsuranceDisplayInfo,
  type HealthCareInsuranceConfig,
} from './health-care-insurance'

describe('Health Care Insurance Calculations', () => {
  describe('calculateHealthCareInsuranceForYear', () => {
    it('should return zero values when disabled', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: false,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2041, 50000, 0, 30)

      expect(result.healthInsuranceAnnual).toBe(0)
      expect(result.careInsuranceAnnual).toBe(0)
      expect(result.totalAnnual).toBe(0)
      expect(result.usedFixedAmounts).toBe(false)
      expect(result.isRetirementPhase).toBe(true) // 2041 is retirement start year
    })

    it('should calculate percentage-based contributions for pre-retirement phase', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        healthInsuranceRatePreRetirement: 14.6,
        careInsuranceRatePreRetirement: 3.05,
        retirementStartYear: 2041,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2040, 50000, 0, 30)

      expect(result.isRetirementPhase).toBe(false)
      expect(result.effectiveHealthInsuranceRate).toBe(14.6)
      expect(result.effectiveCareInsuranceRate).toBe(3.05)
      expect(result.healthInsuranceAnnual).toBe(50000 * 0.146)
      expect(result.careInsuranceAnnual).toBe(50000 * 0.0305)
      expect(result.totalAnnual).toBe(50000 * 0.146 + 50000 * 0.0305)
      expect(result.healthInsuranceMonthly).toBe((50000 * 0.146) / 12)
      expect(result.usedFixedAmounts).toBe(false)
    })

    it('should calculate percentage-based contributions for retirement phase', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        healthInsuranceRateRetirement: 7.3,
        careInsuranceRateRetirement: 3.05,
        retirementStartYear: 2041,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2041, 40000, 18000, 67)

      expect(result.isRetirementPhase).toBe(true)
      expect(result.effectiveHealthInsuranceRate).toBe(7.3)
      expect(result.effectiveCareInsuranceRate).toBe(3.05)
      expect(result.baseIncomeForCalculation).toBe(58000) // withdrawal + pension
      expect(result.healthInsuranceAnnual).toBe(58000 * 0.073)
      expect(result.careInsuranceAnnual).toBe(58000 * 0.0305)
      expect(result.totalAnnual).toBe(58000 * 0.073 + 58000 * 0.0305)
    })

    it('should use fixed amounts when configured', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        useFixedAmounts: true,
        fixedHealthInsuranceMonthly: 400,
        fixedCareInsuranceMonthly: 150,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2041, 50000, 0, 30)

      expect(result.usedFixedAmounts).toBe(true)
      expect(result.healthInsuranceMonthly).toBe(400)
      expect(result.careInsuranceMonthly).toBe(150)
      expect(result.healthInsuranceAnnual).toBe(400 * 12)
      expect(result.careInsuranceAnnual).toBe(150 * 12)
      expect(result.totalAnnual).toBe((400 + 150) * 12)
      expect(result.totalMonthly).toBe(550)
    })

    it('should apply additional care insurance for childless individuals', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        careInsuranceRatePreRetirement: 3.05,
        additionalCareInsuranceForChildless: true,
        additionalCareInsuranceAge: 23,
        retirementStartYear: 2041,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2040, 50000, 0, 25)

      expect(result.appliedAdditionalCareInsurance).toBe(true)
      expect(result.effectiveCareInsuranceRate).toBe(3.65) // 3.05 + 0.6
      expect(result.careInsuranceAnnual).toBe(50000 * 0.0365)
    })

    it('should not apply additional care insurance for young individuals', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        careInsuranceRatePreRetirement: 3.05,
        additionalCareInsuranceForChildless: true,
        additionalCareInsuranceAge: 23,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2040, 50000, 0, 22)

      expect(result.appliedAdditionalCareInsurance).toBe(false)
      expect(result.effectiveCareInsuranceRate).toBe(3.05)
      expect(result.careInsuranceAnnual).toBe(50000 * 0.0305)
    })

    it('should apply income thresholds correctly', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        healthInsuranceRatePreRetirement: 14.6,
        careInsuranceRatePreRetirement: 3.05,
        healthInsuranceIncomeThreshold: 60000,
        careInsuranceIncomeThreshold: 60000,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2040, 80000, 0, 30)

      expect(result.baseIncomeForCalculation).toBe(60000) // Capped at threshold
      // But calculations should be based on threshold
      expect(result.healthInsuranceAnnual).toBe(60000 * 0.146)
      expect(result.careInsuranceAnnual).toBe(60000 * 0.0305)
    })
  })

  describe('calculateHealthCareInsurance', () => {
    it('should calculate contributions across multiple years', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        healthInsuranceRatePreRetirement: 14.6,
        healthInsuranceRateRetirement: 7.3,
        careInsuranceRatePreRetirement: 3.05,
        careInsuranceRateRetirement: 3.05,
        retirementStartYear: 2041,
      }

      const withdrawalAmounts = {
        2040: 40000,
        2041: 45000,
        2042: 50000,
      }

      const pensionAmounts = {
        2040: 0,
        2041: 18000,
        2042: 18500,
      }

      const result = calculateHealthCareInsurance(
        config,
        2040,
        2042,
        withdrawalAmounts,
        pensionAmounts,
        1973, // Birth year for calculating age
      )

      // 2040: Pre-retirement (age 67)
      expect(result[2040].isRetirementPhase).toBe(false)
      expect(result[2040].effectiveHealthInsuranceRate).toBe(14.6)
      expect(result[2040].baseIncomeForCalculation).toBe(40000)

      // 2041: Retirement phase (age 68)
      expect(result[2041].isRetirementPhase).toBe(true)
      expect(result[2041].effectiveHealthInsuranceRate).toBe(7.3)
      expect(result[2041].baseIncomeForCalculation).toBe(62550) // Capped at statutory maximum

      // 2042: Retirement phase (age 69)
      expect(result[2042].isRetirementPhase).toBe(true)
      expect(result[2042].baseIncomeForCalculation).toBe(62550) // Capped at statutory maximum
    })

    it('should handle missing withdrawal amounts gracefully', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
      }

      const withdrawalAmounts = {
        2040: 40000,
        // 2041 missing
        2042: 50000,
      }

      const result = calculateHealthCareInsurance(
        config,
        2040,
        2042,
        withdrawalAmounts,
        {},
      )

      expect(result[2040].baseIncomeForCalculation).toBe(40000)
      expect(result[2041].baseIncomeForCalculation).toBe(13230) // Minimum income base applied when no withdrawal
      expect(result[2042].baseIncomeForCalculation).toBe(50000)
    })
  })

  describe('createDefaultHealthCareInsuranceConfig', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultHealthCareInsuranceConfig()

      expect(config.enabled).toBe(true)
      expect(config.healthInsuranceRatePreRetirement).toBe(14.6)
      expect(config.careInsuranceRatePreRetirement).toBe(3.05)
      expect(config.healthInsuranceRateRetirement).toBe(7.3)
      expect(config.careInsuranceRateRetirement).toBe(3.05)
      expect(config.useFixedAmounts).toBe(false)
      expect(config.additionalCareInsuranceForChildless).toBe(false)
      expect(config.additionalCareInsuranceAge).toBe(23)
      expect(config.healthInsuranceIncomeThreshold).toBe(62550)
      expect(config.careInsuranceIncomeThreshold).toBe(62550)
    })
  })

  describe('getHealthCareInsuranceDisplayInfo', () => {
    it('should return fixed type info when using fixed amounts', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        useFixedAmounts: true,
        fixedHealthInsuranceMonthly: 400,
        fixedCareInsuranceMonthly: 150,
      }

      const info = getHealthCareInsuranceDisplayInfo(config)

      expect(info.healthInsuranceType).toBe('fixed')
      expect(info.careInsuranceType).toBe('fixed')
      expect(info.displayText).toBe('Feste monatliche Beiträge')
    })

    it('should return percentage type info when using percentage calculation', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        useFixedAmounts: false,
      }

      const info = getHealthCareInsuranceDisplayInfo(config)

      expect(info.healthInsuranceType).toBe('percentage')
      expect(info.careInsuranceType).toBe('percentage')
      expect(info.displayText).toBe('Prozentuale Beiträge basierend auf Einkommen')
    })
  })

  describe('Edge cases and validation', () => {
    it('should handle zero withdrawal and pension amounts', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2041, 0, 0, 30)

      // When income is 0, minimum income base is applied for statutory insurance
      expect(result.healthInsuranceAnnual).toBe(13230 * 0.073) // Minimum base * retirement rate
      expect(result.careInsuranceAnnual).toBe(13230 * 0.0305)
      expect(result.totalAnnual).toBe(13230 * 0.073 + 13230 * 0.0305)
      expect(result.baseIncomeForCalculation).toBe(13230) // Minimum income base
    })

    it('should handle very high income amounts correctly', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        healthInsuranceRatePreRetirement: 14.6,
        healthInsuranceIncomeThreshold: 100000,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2040, 500000, 0, 30)

      expect(result.baseIncomeForCalculation).toBe(100000) // Capped at custom threshold
      expect(result.healthInsuranceAnnual).toBe(100000 * 0.146) // Capped at threshold
    })

    it('should handle partial fixed amount configuration', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        useFixedAmounts: true,
        fixedHealthInsuranceMonthly: 400,
        // fixedCareInsuranceMonthly missing
      }

      const result = calculateHealthCareInsuranceForYear(config, 2041, 50000, 0, 30)

      // Should fall back to percentage calculation
      expect(result.usedFixedAmounts).toBe(false)
      expect(result.healthInsuranceAnnual).toBe(50000 * 0.073) // Retirement rate
    })

    it('should return correct insurance type when configured as statutory', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        insuranceType: 'statutory',
      }

      const result = calculateHealthCareInsuranceForYear(config, 2041, 50000, 0, 30)
      expect(result.insuranceType).toBe('statutory')
    })

    it('should return correct insurance type when configured as private', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        insuranceType: 'private',
        privateHealthInsuranceMonthly: 450,
        privateCareInsuranceMonthly: 60,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2041, 50000, 0, 30)
      expect(result.insuranceType).toBe('private')
    })

    it('should return correct insurance type with fixed amounts - statutory', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        insuranceType: 'statutory',
        useFixedAmounts: true,
        fixedHealthInsuranceMonthly: 400,
        fixedCareInsuranceMonthly: 150,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2041, 50000, 0, 30)
      expect(result.insuranceType).toBe('statutory')
      expect(result.usedFixedAmounts).toBe(true)
    })

    it('should return correct insurance type with fixed amounts - private', () => {
      const config: HealthCareInsuranceConfig = {
        ...createDefaultHealthCareInsuranceConfig(),
        enabled: true,
        insuranceType: 'private',
        useFixedAmounts: true,
        fixedHealthInsuranceMonthly: 450,
        fixedCareInsuranceMonthly: 60,
      }

      const result = calculateHealthCareInsuranceForYear(config, 2041, 50000, 0, 30)
      expect(result.insuranceType).toBe('private')
      expect(result.usedFixedAmounts).toBe(true)
    })
  })

  describe('Couple Health Insurance Calculations', () => {
    describe('createDefaultFamilyInsuranceThresholds', () => {
      it('should create default thresholds for 2025', () => {
        const thresholds = createDefaultFamilyInsuranceThresholds()

        expect(thresholds.year).toBe(2025)
        expect(thresholds.regularEmploymentLimit).toBe(505)
        expect(thresholds.miniJobLimit).toBe(538)
      })

      it('should create thresholds for custom year', () => {
        const thresholds = createDefaultFamilyInsuranceThresholds(2026)

        expect(thresholds.year).toBe(2026)
        expect(thresholds.regularEmploymentLimit).toBe(505)
        expect(thresholds.miniJobLimit).toBe(538)
      })
    })

    describe('createDefaultCoupleHealthInsuranceConfig', () => {
      it('should create valid default couple configuration', () => {
        const config = createDefaultCoupleHealthInsuranceConfig()

        expect(config.strategy).toBe('optimize')
        expect(config.person1.name).toBe('Person 1')
        expect(config.person1.withdrawalShare).toBe(0.5)
        expect(config.person1.otherIncomeAnnual).toBe(0)
        expect(config.person1.additionalCareInsuranceForChildless).toBe(false)

        expect(config.person2.name).toBe('Person 2')
        expect(config.person2.withdrawalShare).toBe(0.5)
        expect(config.person2.otherIncomeAnnual).toBe(0)
        expect(config.person2.additionalCareInsuranceForChildless).toBe(false)

        expect(config.familyInsuranceThresholds.regularEmploymentLimit).toBe(505)
        expect(config.familyInsuranceThresholds.miniJobLimit).toBe(538)
        expect(config.familyInsuranceThresholds.year).toBe(2025)
      })
    })

    describe('calculateCoupleHealthInsuranceForYear', () => {
      const createTestConfig = (overrides: Partial<HealthCareInsuranceConfig> = {}): HealthCareInsuranceConfig => ({
        ...createDefaultHealthCareInsuranceConfig(),
        planningMode: 'couple',
        coupleConfig: {
          ...createDefaultCoupleHealthInsuranceConfig(),
          person1: {
            name: 'Alice',
            birthYear: 1980,
            withdrawalShare: 0.6,
            otherIncomeAnnual: 0,
            additionalCareInsuranceForChildless: false,
          },
          person2: {
            name: 'Bob',
            birthYear: 1985,
            withdrawalShare: 0.4,
            otherIncomeAnnual: 0,
            additionalCareInsuranceForChildless: false,
          },
        },
        ...overrides,
      })

      it('should throw error if not couple planning mode', () => {
        const config = createDefaultHealthCareInsuranceConfig()
        config.planningMode = 'individual'

        expect(() => {
          calculateCoupleHealthInsuranceForYear(config, 2041, 50000, 0)
        }).toThrow('Couple health insurance calculation requires couple planning mode and couple config')
      })

      it('should throw error if no couple config', () => {
        const config = createDefaultHealthCareInsuranceConfig()
        config.planningMode = 'couple'
        config.coupleConfig = undefined

        expect(() => {
          calculateCoupleHealthInsuranceForYear(config, 2041, 50000, 0)
        }).toThrow('Couple health insurance calculation requires couple planning mode and couple config')
      })

      it('should calculate individual strategy correctly', () => {
        const config = createTestConfig()
        config.coupleConfig!.strategy = 'individual'

        const result = calculateCoupleHealthInsuranceForYear(config, 2041, 50000, 0)

        expect(result.strategyUsed).toBe('individual')
        expect(result.person1.name).toBe('Alice')
        expect(result.person1.coveredByFamilyInsurance).toBe(false)
        expect(result.person1.allocatedIncome).toBe(30000) // 50000 * 0.6
        expect(result.person1.totalIncome).toBe(30000)

        expect(result.person2.name).toBe('Bob')
        expect(result.person2.coveredByFamilyInsurance).toBe(false)
        expect(result.person2.allocatedIncome).toBe(20000) // 50000 * 0.4
        expect(result.person2.totalIncome).toBe(20000)

        expect(result.totalAnnual).toBeGreaterThan(0)
        expect(result.totalMonthly).toBe(result.totalAnnual / 12)

        // Neither should qualify for family insurance (over 505€/month threshold)
        expect(result.familyInsuranceDetails.person1QualifiesForFamily).toBe(false) // 2500/month > 505
        expect(result.familyInsuranceDetails.person2QualifiesForFamily).toBe(false) // 1667/month > 505
      })

      it('should calculate family strategy when both qualify', () => {
        const config = createTestConfig()
        config.coupleConfig!.strategy = 'family'
        config.coupleConfig!.person1.withdrawalShare = 0.1 // Person 1: 5000 annual (417/month) - qualifies
        config.coupleConfig!.person2.withdrawalShare = 0.9 // Person 2: 45000 annual (3750/month) - doesn\'t qualify

        const result = calculateCoupleHealthInsuranceForYear(config, 2041, 50000, 0)

        expect(result.strategyUsed).toBe('family')
        expect(result.familyInsuranceDetails.person1QualifiesForFamily).toBe(true) // 417/month < 505
        expect(result.familyInsuranceDetails.person2QualifiesForFamily).toBe(false) // 3750/month > 505

        // Person 1 should be family insured (no cost), Person 2 pays full insurance
        expect(result.person1.coveredByFamilyInsurance).toBe(true)
        expect(result.person1.healthInsuranceResult.totalAnnual).toBe(0)
        expect(result.person2.coveredByFamilyInsurance).toBe(false)
        expect(result.person2.healthInsuranceResult.totalAnnual).toBeGreaterThan(0)

        // Total cost should be only Person 2's insurance
        expect(result.totalAnnual).toBe(result.person2.healthInsuranceResult.totalAnnual)
      })

      it('should optimize strategy and choose family insurance when cheaper', () => {
        const config = createTestConfig()
        config.coupleConfig!.strategy = 'optimize'
        config.coupleConfig!.person1.withdrawalShare = 0.1 // Person 1: 5000 annual - qualifies for family
        config.coupleConfig!.person2.withdrawalShare = 0.9 // Person 2: 45000 annual - doesn\'t qualify

        const result = calculateCoupleHealthInsuranceForYear(config, 2041, 50000, 0)

        expect(result.strategyUsed).toBe('family')
        expect(result.strategyComparison.optimized.recommendedStrategy).toBe('family')
        expect(result.strategyComparison.optimized.savings).toBeGreaterThan(0)

        // Family insurance should be cheaper than individual
        expect(result.strategyComparison.family.totalAnnual).toBeLessThan(
          result.strategyComparison.individual.totalAnnual,
        )
      })

      it('should optimize strategy and choose individual insurance when family not viable', () => {
        const config = createTestConfig()
        config.coupleConfig!.strategy = 'optimize'
        config.coupleConfig!.person1.withdrawalShare = 0.5 // Both over threshold
        config.coupleConfig!.person2.withdrawalShare = 0.5 // Both over threshold

        const result = calculateCoupleHealthInsuranceForYear(config, 2041, 50000, 0)

        expect(result.strategyUsed).toBe('individual')
        expect(result.strategyComparison.optimized.recommendedStrategy).toBe('individual')

        // Neither should qualify for family insurance
        expect(result.familyInsuranceDetails.person1QualifiesForFamily).toBe(false) // 2083/month > 505
        expect(result.familyInsuranceDetails.person2QualifiesForFamily).toBe(false) // 2083/month > 505

        // No viable family insurance arrangements
        expect(result.familyInsuranceDetails.possibleFamilyInsuranceArrangements).toHaveLength(0)
      })

      it('should handle other income correctly', () => {
        const config = createTestConfig()
        config.coupleConfig!.person1.otherIncomeAnnual = 3000 // 250/month additional
        config.coupleConfig!.person2.otherIncomeAnnual = 1200 // 100/month additional
        config.coupleConfig!.person1.withdrawalShare = 0.1 // 5000 withdrawal + 3000 other = 8000 total (667/month)
        config.coupleConfig!.person2.withdrawalShare = 0.9 // 45000 withdrawal + 1200 other = 46200 total (3850/month)

        const result = calculateCoupleHealthInsuranceForYear(config, 2041, 50000, 0)

        expect(result.person1.otherIncome).toBe(3000)
        expect(result.person1.totalIncome).toBe(8000) // 5000 + 3000
        expect(result.person2.otherIncome).toBe(1200)
        expect(result.person2.totalIncome).toBe(46200) // 45000 + 1200

        // Person 1 doesn't qualify due to other income (667/month > 505)
        expect(result.familyInsuranceDetails.person1QualifiesForFamily).toBe(false)
        expect(result.familyInsuranceDetails.person2QualifiesForFamily).toBe(false)
      })

      it('should handle different retirement years correctly', () => {
        const config = createTestConfig()
        config.retirementStartYear = 2050

        const result2040 = calculateCoupleHealthInsuranceForYear(config, 2040, 50000, 0) // Pre-retirement
        const result2050 = calculateCoupleHealthInsuranceForYear(config, 2050, 50000, 0) // Retirement

        // Check that insurance results reflect different phases
        expect(result2040.person1.healthInsuranceResult.isRetirementPhase).toBe(false)
        expect(result2040.person2.healthInsuranceResult.isRetirementPhase).toBe(false)

        expect(result2050.person1.healthInsuranceResult.isRetirementPhase).toBe(true)
        expect(result2050.person2.healthInsuranceResult.isRetirementPhase).toBe(true)

        // Retirement phase should typically have lower rates
        expect(result2050.totalAnnual).toBeLessThan(result2040.totalAnnual)
      })

      it('should handle childless additional care insurance', () => {
        const config = createTestConfig()
        config.coupleConfig!.person1.additionalCareInsuranceForChildless = true
        config.coupleConfig!.person2.additionalCareInsuranceForChildless = false

        const result = calculateCoupleHealthInsuranceForYear(config, 2041, 50000, 0)

        // Person 1 should have additional care insurance applied
        expect(result.person1.healthInsuranceResult.appliedAdditionalCareInsurance).toBe(true)
        expect(result.person2.healthInsuranceResult.appliedAdditionalCareInsurance).toBe(false)
      })

      it('should calculate strategy comparison correctly', () => {
        const config = createTestConfig()
        config.coupleConfig!.strategy = 'optimize'

        const result = calculateCoupleHealthInsuranceForYear(config, 2041, 50000, 0)

        // All comparison options should be calculated
        expect(result.strategyComparison.individual.totalAnnual).toBeGreaterThan(0)
        expect(result.strategyComparison.individual.totalMonthly).toBe(
          result.strategyComparison.individual.totalAnnual / 12,
        )

        expect(result.strategyComparison.family.totalAnnual).toBeGreaterThan(0)
        expect(result.strategyComparison.family.totalMonthly).toBe(
          result.strategyComparison.family.totalAnnual / 12,
        )

        expect(result.strategyComparison.optimized.totalAnnual).toBe(result.totalAnnual)
        expect(result.strategyComparison.optimized.totalMonthly).toBe(result.totalMonthly)
        expect(result.strategyComparison.optimized.recommendedStrategy).toBe(result.strategyUsed)

        // Savings should be calculated correctly
        const expectedSavings = Math.max(0,
          result.strategyComparison.individual.totalAnnual - result.totalAnnual,
        )
        expect(result.strategyComparison.optimized.savings).toBe(expectedSavings)
      })
    })

    describe('calculateCoupleHealthCareInsurance', () => {
      it('should calculate across multiple years', () => {
        const config = createDefaultHealthCareInsuranceConfig()
        config.planningMode = 'couple'
        config.coupleConfig = createDefaultCoupleHealthInsuranceConfig()

        const withdrawalAmounts = {
          2041: 50000,
          2042: 52000,
          2043: 54000,
        }

        const result = calculateCoupleHealthCareInsurance(config, 2041, 2043, withdrawalAmounts)

        expect(Object.keys(result)).toHaveLength(3)
        expect(result[2041]).toBeDefined()
        expect(result[2042]).toBeDefined()
        expect(result[2043]).toBeDefined()

        // Check that withdrawal amounts are reflected
        expect(result[2041].person1.allocatedIncome).toBe(25000) // 50000 * 0.5
        expect(result[2042].person1.allocatedIncome).toBe(26000) // 52000 * 0.5
        expect(result[2043].person1.allocatedIncome).toBe(27000) // 54000 * 0.5
      })

      it('should handle pension amounts', () => {
        const config = createDefaultHealthCareInsuranceConfig()
        config.planningMode = 'couple'
        config.coupleConfig = createDefaultCoupleHealthInsuranceConfig()

        const withdrawalAmounts = { 2041: 40000 }
        const pensionAmounts = { 2041: 10000 }

        const result = calculateCoupleHealthCareInsurance(config, 2041, 2041, withdrawalAmounts, pensionAmounts)

        // Total income should include both withdrawal and pension
        expect(result[2041].person1.allocatedIncome).toBe(25000) // (40000 + 10000) * 0.5
        expect(result[2041].person2.allocatedIncome).toBe(25000) // (40000 + 10000) * 0.5
      })

      it('should work with withdrawal calculation optimization example', () => {
        const config = createDefaultHealthCareInsuranceConfig()
        config.planningMode = 'couple'
        config.coupleConfig = {
          ...createDefaultCoupleHealthInsuranceConfig(),
          strategy: 'optimize',
          person1: {
            name: 'Alice',
            birthYear: 1980,
            withdrawalShare: 0.08, // Very low share: 4000 annual = 333/month (< 505, qualifies for family)
            otherIncomeAnnual: 0,
            additionalCareInsuranceForChildless: false,
          },
          person2: {
            name: 'Bob',
            birthYear: 1985,
            withdrawalShare: 0.92, // High share: 46000 annual = 3833/month (> 505, pays insurance)
            otherIncomeAnnual: 0,
            additionalCareInsuranceForChildless: false,
          },
        }

        const result = calculateCoupleHealthCareInsurance(config, 2041, 2041, { 2041: 50000 })

        expect(result[2041]).toBeDefined()
        expect(result[2041].strategyUsed).toBe('family') // Should choose family insurance
        expect(result[2041].person1.coveredByFamilyInsurance).toBe(true) // Alice is covered by family insurance
        expect(result[2041].person2.coveredByFamilyInsurance).toBe(false) // Bob pays insurance
        expect(result[2041].totalAnnual).toBeGreaterThan(0)
        expect(result[2041].totalAnnual).toBeLessThan(
          result[2041].strategyComparison.individual.totalAnnual,
        ) // Should be cheaper than individual
        
        // Verify family insurance eligibility
        expect(result[2041].familyInsuranceDetails.person1QualifiesForFamily).toBe(true) // 333/month < 505
        expect(result[2041].familyInsuranceDetails.person2QualifiesForFamily).toBe(false) // 3833/month > 505
      })
    })
  })
})
