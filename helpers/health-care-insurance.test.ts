import { describe, it, expect } from 'vitest'
import {
  calculateHealthCareInsuranceForYear,
  calculateHealthCareInsurance,
  createDefaultHealthCareInsuranceConfig,
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

      expect(config.enabled).toBe(false)
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
})
