import { describe, it, expect } from 'vitest'
import {
  type HealthInsuranceConfig,
  type HealthInsuranceYearResult,
  defaultHealthInsuranceConfig,
  calculateHealthInsurance,
  calculateNetWithdrawalAmount,
  getHealthInsuranceCalculationMethodName,
  getInsurancePhaseName,
} from './health-insurance'

describe('health-insurance', () => {
  describe('calculateHealthInsurance', () => {
    const testConfig: HealthInsuranceConfig = {
      enabled: true,
      retirementStartYear: 2040,
      preRetirement: {
        health: {
          usePercentage: true,
          percentage: 14.6,
        },
        care: {
          usePercentage: true,
          percentage: 3.05,
          childlessSupplement: 0.6,
        },
      },
      retirement: {
        health: {
          usePercentage: true,
          percentage: 7.3,
        },
        care: {
          usePercentage: true,
          percentage: 3.05,
          childlessSupplement: 0.6,
        },
      },
    }

    it('should calculate pre-retirement insurance contributions with percentage', () => {
      const result = calculateHealthInsurance(2035, testConfig, 30000, false)

      expect(result.phase).toBe('pre-retirement')
      expect(result.health.calculationMethod).toBe('percentage')
      expect(result.health.percentage).toBe(14.6)
      expect(result.health.baseAmount).toBe(30000)
      expect(result.health.annualAmount).toBe(4380) // 30000 * 14.6%
      expect(result.health.monthlyAmount).toBe(365) // 4380 / 12

      expect(result.care.calculationMethod).toBe('percentage')
      expect(result.care.percentage).toBe(3.05)
      expect(result.care.baseAmount).toBe(30000)
      expect(result.care.annualAmount).toBe(915) // 30000 * 3.05%
      expect(result.care.monthlyAmount).toBe(76.25) // 915 / 12
      expect(result.care.childlessSupplementAmount).toBeUndefined()

      expect(result.totalAnnualAmount).toBe(5295) // 4380 + 915
      expect(result.totalMonthlyAmount).toBe(441.25) // 5295 / 12
    })

    it('should calculate pre-retirement insurance contributions with childless supplement', () => {
      const result = calculateHealthInsurance(2035, testConfig, 30000, true)

      expect(result.phase).toBe('pre-retirement')
      expect(result.care.annualAmount).toBe(1095) // 30000 * (3.05% + 0.6%)
      expect(result.care.childlessSupplementAmount).toBe(180) // 30000 * 0.6%
      expect(result.totalAnnualAmount).toBe(5475) // 4380 + 1095
    })

    it('should calculate retirement insurance contributions with percentage', () => {
      const result = calculateHealthInsurance(2045, testConfig, 40000, false)

      expect(result.phase).toBe('retirement')
      expect(result.health.calculationMethod).toBe('percentage')
      expect(result.health.percentage).toBe(7.3)
      expect(result.health.annualAmount).toBe(2920) // 40000 * 7.3%

      expect(result.care.calculationMethod).toBe('percentage')
      expect(result.care.percentage).toBe(3.05)
      expect(result.care.annualAmount).toBe(1220) // 40000 * 3.05%

      expect(result.totalAnnualAmount).toBe(4140) // 2920 + 1220
    })

    it('should handle fixed amount contributions', () => {
      const fixedConfig: HealthInsuranceConfig = {
        enabled: true,
        retirementStartYear: 2040,
        preRetirement: {
          health: {
            usePercentage: false,
            fixedAmount: 300,
          },
          care: {
            usePercentage: false,
            fixedAmount: 100,
          },
        },
        retirement: {
          health: {
            usePercentage: false,
            fixedAmount: 250,
          },
          care: {
            usePercentage: false,
            fixedAmount: 90,
            childlessSupplement: 20, // Fixed supplement for childless
          },
        },
      }

      const preRetirementResult = calculateHealthInsurance(2035, fixedConfig, 30000, false)
      expect(preRetirementResult.health.calculationMethod).toBe('fixed')
      expect(preRetirementResult.health.annualAmount).toBe(3600) // 300 * 12
      expect(preRetirementResult.care.calculationMethod).toBe('fixed')
      expect(preRetirementResult.care.annualAmount).toBe(1200) // 100 * 12
      expect(preRetirementResult.totalAnnualAmount).toBe(4800)

      const retirementResult = calculateHealthInsurance(2045, fixedConfig, 40000, true)
      expect(retirementResult.health.annualAmount).toBe(3000) // 250 * 12
      expect(retirementResult.care.annualAmount).toBe(1320) // (90 + 20) * 12
      expect(retirementResult.care.childlessSupplementAmount).toBe(240) // 20 * 12
    })

    it('should return zero contributions when disabled', () => {
      const disabledConfig: HealthInsuranceConfig = {
        ...testConfig,
        enabled: false,
      }

      const result = calculateHealthInsurance(2035, disabledConfig, 30000, false)

      expect(result.health.annualAmount).toBe(0)
      expect(result.care.annualAmount).toBe(0)
      expect(result.totalAnnualAmount).toBe(0)
    })

    it('should handle missing configuration values gracefully', () => {
      const incompleteConfig: HealthInsuranceConfig = {
        enabled: true,
        retirementStartYear: 2040,
        preRetirement: {
          health: {
            usePercentage: true,
            // percentage is missing
          },
          care: {
            usePercentage: false,
            // fixedAmount is missing
          },
        },
        retirement: {
          health: {
            usePercentage: false,
            // fixedAmount is missing
          },
          care: {
            usePercentage: true,
            // percentage is missing
          },
        },
      }

      const result = calculateHealthInsurance(2035, incompleteConfig, 30000, false)

      expect(result.health.annualAmount).toBe(0)
      expect(result.care.annualAmount).toBe(0)
      expect(result.totalAnnualAmount).toBe(0)
    })

    it('should correctly determine retirement phase based on year', () => {
      const preRetirementResult = calculateHealthInsurance(2039, testConfig, 30000, false)
      expect(preRetirementResult.phase).toBe('pre-retirement')

      const retirementResult = calculateHealthInsurance(2040, testConfig, 30000, false)
      expect(retirementResult.phase).toBe('retirement')

      const laterRetirementResult = calculateHealthInsurance(2045, testConfig, 30000, false)
      expect(laterRetirementResult.phase).toBe('retirement')
    })
  })

  describe('calculateNetWithdrawalAmount', () => {
    it('should calculate net withdrawal amount correctly', () => {
      const healthInsuranceResult: HealthInsuranceYearResult = {
        phase: 'pre-retirement',
        health: {
          annualAmount: 4380,
          monthlyAmount: 365,
          calculationMethod: 'percentage',
          percentage: 14.6,
          baseAmount: 30000,
        },
        care: {
          annualAmount: 915,
          monthlyAmount: 76.25,
          calculationMethod: 'percentage',
          percentage: 3.05,
          baseAmount: 30000,
        },
        totalAnnualAmount: 5295,
        totalMonthlyAmount: 441.25,
      }

      const netAmount = calculateNetWithdrawalAmount(30000, healthInsuranceResult)
      expect(netAmount).toBe(24705) // 30000 - 5295
    })

    it('should not return negative net amounts', () => {
      const healthInsuranceResult: HealthInsuranceYearResult = {
        phase: 'retirement',
        health: {
          annualAmount: 15000,
          monthlyAmount: 1250,
          calculationMethod: 'fixed',
        },
        care: {
          annualAmount: 5000,
          monthlyAmount: 416.67,
          calculationMethod: 'fixed',
        },
        totalAnnualAmount: 20000,
        totalMonthlyAmount: 1666.67,
      }

      const netAmount = calculateNetWithdrawalAmount(10000, healthInsuranceResult)
      expect(netAmount).toBe(0) // Should not be negative
    })
  })

  describe('defaultHealthInsuranceConfig', () => {
    it('should have reasonable default values', () => {
      expect(defaultHealthInsuranceConfig.enabled).toBe(false)
      expect(defaultHealthInsuranceConfig.retirementStartYear).toBe(2040)

      expect(defaultHealthInsuranceConfig.preRetirement.health.usePercentage).toBe(true)
      expect(defaultHealthInsuranceConfig.preRetirement.health.percentage).toBe(14.6)

      expect(defaultHealthInsuranceConfig.preRetirement.care.usePercentage).toBe(true)
      expect(defaultHealthInsuranceConfig.preRetirement.care.percentage).toBe(3.05)
      expect(defaultHealthInsuranceConfig.preRetirement.care.childlessSupplement).toBe(0.6)

      expect(defaultHealthInsuranceConfig.retirement.health.percentage).toBe(7.3)
      expect(defaultHealthInsuranceConfig.retirement.care.percentage).toBe(3.05)
    })
  })

  describe('helper functions', () => {
    it('should return correct calculation method names', () => {
      expect(getHealthInsuranceCalculationMethodName('percentage')).toBe('Prozentual')
      expect(getHealthInsuranceCalculationMethodName('fixed')).toBe('Festbetrag')
    })

    it('should return correct phase names', () => {
      expect(getInsurancePhaseName('pre-retirement')).toBe('Vorrente')
      expect(getInsurancePhaseName('retirement')).toBe('Rente')
    })
  })

  describe('edge cases', () => {
    it('should handle zero withdrawal amounts', () => {
      const enabledConfig = { ...defaultHealthInsuranceConfig, enabled: true }
      const result = calculateHealthInsurance(2035, enabledConfig, 0, false)

      expect(result.health.annualAmount).toBe(0)
      expect(result.care.annualAmount).toBe(0)
      expect(result.totalAnnualAmount).toBe(0)
    })

    it('should handle very large withdrawal amounts', () => {
      const largeAmount = 1000000
      const enabledConfig = { ...defaultHealthInsuranceConfig, enabled: true }
      const result = calculateHealthInsurance(2035, enabledConfig, largeAmount, true)

      expect(result.health.annualAmount).toBe(146000) // 1000000 * 14.6%
      expect(result.care.annualAmount).toBe(36500) // 1000000 * (3.05% + 0.6%)
      expect(result.totalAnnualAmount).toBe(182500)
    })

    it('should handle boundary year (retirement start year)', () => {
      const enabledConfig = { ...defaultHealthInsuranceConfig, enabled: true }
      const boundaryResult = calculateHealthInsurance(2040, enabledConfig, 30000, false)
      expect(boundaryResult.phase).toBe('retirement')
    })
  })
})
