import { describe, it, expect } from 'vitest'
import { convertWithdrawalToPensionGapSources, calculatePensionGapFromWithdrawal } from './pension-gap-converter'
import type { WithdrawalResult } from '../../helpers/withdrawal'

describe('pension-gap-converter', () => {
  const mockWithdrawalResult: WithdrawalResult = {
    2024: {
      startkapital: 500000,
      endkapital: 480000,
      entnahme: 30000,
      zinsen: 20000,
      bezahlteSteuer: 5000,
      genutzterFreibetrag: 2000,
      statutoryPension: {
        grossAnnualAmount: 20000,
        netAnnualAmount: 18000,
        incomeTax: 2000,
        taxableAmount: 16000,
      },
      otherIncome: {
        totalNetAmount: 5000,
        totalTaxAmount: 1000,
        sourceCount: 1,
      },
      healthCareInsurance: {
        totalAnnual: 4000,
        healthInsuranceAnnual: 3000,
        careInsuranceAnnual: 1000,
        totalMonthly: 333,
        healthInsuranceMonthly: 250,
        careInsuranceMonthly: 83,
        usedFixedAmounts: false,
        isRetirementPhase: true,
        effectiveHealthInsuranceRate: 14.6,
        effectiveCareInsuranceRate: 3.05,
      },
    },
    2025: {
      startkapital: 480000,
      endkapital: 460000,
      entnahme: 28000,
      zinsen: 18000,
      bezahlteSteuer: 4500,
      genutzterFreibetrag: 2000,
      statutoryPension: {
        grossAnnualAmount: 20200,
        netAnnualAmount: 18180,
        incomeTax: 2020,
        taxableAmount: 16160,
      },
    },
  }

  describe('convertWithdrawalToPensionGapSources', () => {
    it('should convert withdrawal result to income sources', () => {
      const result = convertWithdrawalToPensionGapSources(mockWithdrawalResult)

      expect(result).toHaveLength(2)
      expect(result[0].year).toBe(2024)
      expect(result[1].year).toBe(2025)
    })

    it('should extract statutory pension correctly', () => {
      const result = convertWithdrawalToPensionGapSources(mockWithdrawalResult)

      expect(result[0].statutoryPensionNet).toBe(18000)
      expect(result[1].statutoryPensionNet).toBe(18180)
    })

    it('should extract portfolio withdrawal correctly', () => {
      const result = convertWithdrawalToPensionGapSources(mockWithdrawalResult)

      expect(result[0].portfolioWithdrawal).toBe(30000)
      expect(result[1].portfolioWithdrawal).toBe(28000)
    })

    it('should extract other income correctly', () => {
      const result = convertWithdrawalToPensionGapSources(mockWithdrawalResult)

      expect(result[0].otherIncome).toBe(5000)
      expect(result[1].otherIncome).toBe(0) // Not present in 2025
    })

    it('should extract health care insurance correctly', () => {
      const result = convertWithdrawalToPensionGapSources(mockWithdrawalResult)

      expect(result[0].healthCareInsurance).toBe(4000)
      expect(result[1].healthCareInsurance).toBe(0) // Not present in 2025
    })

    it('should calculate total available income correctly', () => {
      const result = convertWithdrawalToPensionGapSources(mockWithdrawalResult)

      // 2024: 18000 + 30000 + 5000 - 4000 = 49000
      expect(result[0].totalAvailableIncome).toBe(49000)

      // 2025: 18180 + 28000 + 0 - 0 = 46180
      expect(result[1].totalAvailableIncome).toBe(46180)
    })

    it('should handle missing statutory pension', () => {
      const withoutPension: WithdrawalResult = {
        2024: {
          startkapital: 500000,
          endkapital: 480000,
          entnahme: 30000,
          zinsen: 20000,
          bezahlteSteuer: 5000,
          genutzterFreibetrag: 2000,
        },
      }

      const result = convertWithdrawalToPensionGapSources(withoutPension)

      expect(result[0].statutoryPensionNet).toBe(0)
    })

    it('should sort years correctly', () => {
      const unsortedResult: WithdrawalResult = {
        2026: {
          startkapital: 460000,
          endkapital: 440000,
          entnahme: 26000,
          zinsen: 16000,
          bezahlteSteuer: 4000,
          genutzterFreibetrag: 2000,
        },
        2024: {
          startkapital: 500000,
          endkapital: 480000,
          entnahme: 30000,
          zinsen: 20000,
          bezahlteSteuer: 5000,
          genutzterFreibetrag: 2000,
        },
      }

      const result = convertWithdrawalToPensionGapSources(unsortedResult)

      expect(result[0].year).toBe(2024)
      expect(result[1].year).toBe(2026)
    })
  })

  describe('calculatePensionGapFromWithdrawal', () => {
    it('should calculate pension gap analysis', () => {
      const config = {
        desiredMonthlyIncome: 3000,
        applyInflationAdjustment: false,
        inflationRate: 2.0,
      }

      const result = calculatePensionGapFromWithdrawal(mockWithdrawalResult, config)

      expect(result).not.toBeNull()
      expect(result?.yearlyResults).toHaveLength(2)
      expect(result?.summary.totalYears).toBe(2)
    })

    it('should set base year to first year if not provided', () => {
      const config = {
        desiredMonthlyIncome: 3000,
        applyInflationAdjustment: false,
        inflationRate: 2.0,
      }

      const result = calculatePensionGapFromWithdrawal(mockWithdrawalResult, config)

      expect(result?.yearlyResults[0].year).toBe(2024)
      expect(result?.yearlyResults[0].inflationAdjustmentFactor).toBe(1.0)
    })

    it('should respect provided base year', () => {
      const config = {
        desiredMonthlyIncome: 3000,
        applyInflationAdjustment: true,
        inflationRate: 2.0,
        baseYear: 2024,
      }

      const result = calculatePensionGapFromWithdrawal(mockWithdrawalResult, config)

      expect(result?.yearlyResults[0].inflationAdjustmentFactor).toBe(1.0)
      expect(result?.yearlyResults[1].inflationAdjustmentFactor).toBeCloseTo(1.02, 4)
    })

    it('should return null for empty withdrawal result', () => {
      const config = {
        desiredMonthlyIncome: 3000,
        applyInflationAdjustment: false,
        inflationRate: 2.0,
      }

      const result = calculatePensionGapFromWithdrawal({}, config)

      expect(result).toBeNull()
    })

    it('should calculate gap correctly', () => {
      const config = {
        desiredMonthlyIncome: 4000, // 48,000 per year
        applyInflationAdjustment: false,
        inflationRate: 2.0,
      }

      const result = calculatePensionGapFromWithdrawal(mockWithdrawalResult, config)

      // 2024: Available = 49,000, Desired = 48,000, Gap = -1,000 (surplus)
      expect(result?.yearlyResults[0].gap).toBeCloseTo(-1000, 0)
      expect(result?.yearlyResults[0].isLifestyleCovered).toBe(true)

      // 2025: Available = 46,180, Desired = 48,000, Gap = 1,820 (shortfall)
      expect(result?.yearlyResults[1].gap).toBeCloseTo(1820, 0)
      expect(result?.yearlyResults[1].isLifestyleCovered).toBe(false)
    })
  })
})
