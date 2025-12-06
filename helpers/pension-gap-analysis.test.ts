import { describe, it, expect } from 'vitest'
import {
  calculateInflationAdjustedIncome,
  calculateYearlyPensionGap,
  calculatePensionGapAnalysis,
  createDefaultRetirementLifestyleConfig,
  estimateDesiredRetirementIncome,
  type YearlyIncomeSources,
  type RetirementLifestyleConfig,
} from './pension-gap-analysis'

describe('pension-gap-analysis', () => {
  describe('calculateInflationAdjustedIncome', () => {
    it('should return base income when current year equals base year', () => {
      const result = calculateInflationAdjustedIncome(2500, 2024, 2024, 2.0)
      expect(result).toBe(2500)
    })

    it('should calculate inflation-adjusted income for future years', () => {
      const result = calculateInflationAdjustedIncome(2500, 2026, 2024, 2.0)
      // 2500 * (1.02)^2 = 2601
      expect(result).toBeCloseTo(2601, 0)
    })

    it('should calculate inflation-adjusted income for past years', () => {
      const result = calculateInflationAdjustedIncome(2500, 2022, 2024, 2.0)
      // 2500 * (1.02)^(-2) ≈ 2402.92
      expect(result).toBeCloseTo(2402.92, 1)
    })

    it('should handle zero inflation rate', () => {
      const result = calculateInflationAdjustedIncome(2500, 2030, 2024, 0)
      expect(result).toBe(2500)
    })

    it('should handle high inflation rates correctly', () => {
      const result = calculateInflationAdjustedIncome(2500, 2029, 2024, 5.0)
      // 2500 * (1.05)^5 = 3190.70
      expect(result).toBeCloseTo(3190.7, 0)
    })
  })

  describe('calculateYearlyPensionGap', () => {
    const baseConfig: RetirementLifestyleConfig = {
      desiredMonthlyIncome: 2500,
      applyInflationAdjustment: false,
      inflationRate: 2.0,
      baseYear: 2024,
    }

    const baseIncomeSources: YearlyIncomeSources = {
      year: 2024,
      statutoryPensionNet: 18000, // 1,500/month
      portfolioWithdrawal: 12000, // 1,000/month
      otherIncome: 0,
      healthCareInsurance: 3000,
      totalAvailableIncome: 27000,
      desiredAnnualIncome: 30000,
    }

    it('should calculate pension gap correctly without inflation adjustment', () => {
      const result = calculateYearlyPensionGap(2024, baseIncomeSources, baseConfig)

      expect(result.year).toBe(2024)
      expect(result.desiredAnnualIncome).toBe(30000) // 2500 * 12
      expect(result.desiredMonthlyIncome).toBe(2500)
      expect(result.statutoryPensionNet).toBe(18000)
      expect(result.portfolioWithdrawal).toBe(12000)
      expect(result.otherIncome).toBe(0)
      expect(result.healthCareInsurance).toBe(3000)
      expect(result.totalAvailableIncome).toBe(27000) // 18000 + 12000 + 0 - 3000
      expect(result.gap).toBe(3000) // 30000 - 27000
      expect(result.gapPercentage).toBeCloseTo(10, 1)
      expect(result.isLifestyleCovered).toBe(false)
      expect(result.inflationAdjustmentFactor).toBe(1.0)
    })

    it('should calculate pension gap with inflation adjustment', () => {
      const configWithInflation: RetirementLifestyleConfig = {
        ...baseConfig,
        applyInflationAdjustment: true,
        baseYear: 2024,
      }

      const futureIncomeSources: YearlyIncomeSources = {
        ...baseIncomeSources,
        year: 2026,
      }

      const result = calculateYearlyPensionGap(2026, futureIncomeSources, configWithInflation)

      // Desired income should be inflation-adjusted: 2500 * (1.02)^2 = 2601
      // Annual: 2601 * 12 = 31212
      expect(result.desiredAnnualIncome).toBeCloseTo(31212, 0)
      expect(result.desiredMonthlyIncome).toBeCloseTo(2601, 0)
      expect(result.inflationAdjustmentFactor).toBeCloseTo(1.0404, 4)
    })

    it('should identify when lifestyle is fully covered', () => {
      const adequateIncomeSources: YearlyIncomeSources = {
        year: 2024,
        statutoryPensionNet: 20000,
        portfolioWithdrawal: 15000,
        otherIncome: 0,
        healthCareInsurance: 3000,
        totalAvailableIncome: 32000,
        desiredAnnualIncome: 30000,
      }

      const result = calculateYearlyPensionGap(2024, adequateIncomeSources, baseConfig)

      expect(result.totalAvailableIncome).toBe(32000)
      expect(result.gap).toBe(-2000) // Surplus
      expect(result.isLifestyleCovered).toBe(true)
    })

    it('should calculate coverage percentages correctly', () => {
      const result = calculateYearlyPensionGap(2024, baseIncomeSources, baseConfig)

      // Pension: 18000 / 30000 = 60%
      expect(result.pensionCoveragePercentage).toBeCloseTo(60, 1)

      // Portfolio: 12000 / 30000 = 40%
      expect(result.portfolioWithdrawalPercentage).toBeCloseTo(40, 1)

      // Other income: 0 / 30000 = 0%
      expect(result.otherIncomePercentage).toBe(0)
    })

    it('should handle other income sources', () => {
      const incomeSources: YearlyIncomeSources = {
        year: 2024,
        statutoryPensionNet: 15000,
        portfolioWithdrawal: 10000,
        otherIncome: 5000, // Rental income, part-time work, etc.
        healthCareInsurance: 3000,
        totalAvailableIncome: 27000,
        desiredAnnualIncome: 30000,
      }

      const result = calculateYearlyPensionGap(2024, incomeSources, baseConfig)

      expect(result.otherIncome).toBe(5000)
      expect(result.otherIncomePercentage).toBeCloseTo(16.67, 1)
      expect(result.totalAvailableIncome).toBe(27000)
    })

    it('should handle zero desired income gracefully', () => {
      const zeroConfig: RetirementLifestyleConfig = {
        desiredMonthlyIncome: 0,
        applyInflationAdjustment: false,
      }

      const result = calculateYearlyPensionGap(2024, baseIncomeSources, zeroConfig)

      expect(result.desiredAnnualIncome).toBe(0)
      expect(result.pensionCoveragePercentage).toBe(0)
      expect(result.portfolioWithdrawalPercentage).toBe(0)
      expect(result.gapPercentage).toBe(0)
    })

    it('should handle high health care insurance costs', () => {
      const incomeSources: YearlyIncomeSources = {
        year: 2024,
        statutoryPensionNet: 18000,
        portfolioWithdrawal: 12000,
        otherIncome: 0,
        healthCareInsurance: 8000, // High insurance costs
        totalAvailableIncome: 22000,
        desiredAnnualIncome: 30000,
      }

      const result = calculateYearlyPensionGap(2024, incomeSources, baseConfig)

      expect(result.totalAvailableIncome).toBe(22000) // 18000 + 12000 - 8000
      expect(result.gap).toBe(8000) // Larger gap due to high insurance
    })
  })

  describe('calculatePensionGapAnalysis', () => {
    const config: RetirementLifestyleConfig = {
      desiredMonthlyIncome: 2500,
      applyInflationAdjustment: false,
      inflationRate: 2.0,
      baseYear: 2024,
    }

    it('should calculate analysis for multiple years', () => {
      const incomeSources: YearlyIncomeSources[] = [
        {
          year: 2024,
          statutoryPensionNet: 18000,
          portfolioWithdrawal: 12000,
          otherIncome: 0,
          healthCareInsurance: 3000,
          totalAvailableIncome: 27000,
          desiredAnnualIncome: 30000,
        },
        {
          year: 2025,
          statutoryPensionNet: 18180,
          portfolioWithdrawal: 11500,
          otherIncome: 0,
          healthCareInsurance: 3100,
          totalAvailableIncome: 26580,
          desiredAnnualIncome: 30000,
        },
        {
          year: 2026,
          statutoryPensionNet: 18362,
          portfolioWithdrawal: 11000,
          otherIncome: 0,
          healthCareInsurance: 3200,
          totalAvailableIncome: 26162,
          desiredAnnualIncome: 30000,
        },
      ]

      const result = calculatePensionGapAnalysis(incomeSources, config)

      expect(result.yearlyResults).toHaveLength(3)
      expect(result.summary.totalYears).toBe(3)
      expect(result.summary.yearsWithGap).toBe(3)
      expect(result.summary.yearsCovered).toBe(0)
    })

    it('should calculate summary statistics correctly', () => {
      const incomeSources: YearlyIncomeSources[] = [
        {
          year: 2024,
          statutoryPensionNet: 15000,
          portfolioWithdrawal: 15000,
          otherIncome: 0,
          healthCareInsurance: 3000,
          totalAvailableIncome: 27000,
          desiredAnnualIncome: 30000,
        },
        {
          year: 2025,
          statutoryPensionNet: 15000,
          portfolioWithdrawal: 18000,
          otherIncome: 0,
          healthCareInsurance: 3000,
          totalAvailableIncome: 30000,
          desiredAnnualIncome: 30000,
        },
      ]

      const result = calculatePensionGapAnalysis(incomeSources, config)

      // Average pension coverage: (50% + 50%) / 2 = 50%
      expect(result.summary.averagePensionCoverage).toBeCloseTo(50, 1)

      // Average portfolio withdrawal: (50% + 60%) / 2 = 55%
      expect(result.summary.averagePortfolioWithdrawal).toBeCloseTo(55, 1)

      // Years covered: 1 (2025)
      expect(result.summary.yearsCovered).toBe(1)

      // Years with gap: 1 (2024)
      expect(result.summary.yearsWithGap).toBe(1)

      // Max gap: 3000 in 2024
      expect(result.summary.maxGapAmount).toBe(3000)
      expect(result.summary.maxGapYear).toBe(2024)

      // Average gap amount: 3000 (only counting years with gap)
      expect(result.summary.averageGapAmount).toBe(3000)
    })

    it('should handle empty income sources array', () => {
      const result = calculatePensionGapAnalysis([], config)

      expect(result.yearlyResults).toHaveLength(0)
      expect(result.summary.totalYears).toBe(0)
      expect(result.summary.yearsCovered).toBe(0)
      expect(result.summary.yearsWithGap).toBe(0)
      expect(result.summary.averagePensionCoverage).toBe(0)
      expect(result.summary.averagePortfolioWithdrawal).toBe(0)
      expect(result.summary.maxGapAmount).toBe(0)
      expect(result.summary.maxGapYear).toBeNull()
    })

    it('should identify maximum gap year correctly', () => {
      const incomeSources: YearlyIncomeSources[] = [
        {
          year: 2024,
          statutoryPensionNet: 20000,
          portfolioWithdrawal: 8000,
          otherIncome: 0,
          healthCareInsurance: 3000,
          totalAvailableIncome: 25000,
          desiredAnnualIncome: 30000,
        },
        {
          year: 2025,
          statutoryPensionNet: 20000,
          portfolioWithdrawal: 5000,
          otherIncome: 0,
          healthCareInsurance: 3000,
          totalAvailableIncome: 22000,
          desiredAnnualIncome: 30000,
        },
        {
          year: 2026,
          statutoryPensionNet: 20000,
          portfolioWithdrawal: 9000,
          otherIncome: 0,
          healthCareInsurance: 3000,
          totalAvailableIncome: 26000,
          desiredAnnualIncome: 30000,
        },
      ]

      const result = calculatePensionGapAnalysis(incomeSources, config)

      // Maximum gap is in 2025: 30000 - 22000 = 8000
      expect(result.summary.maxGapAmount).toBe(8000)
      expect(result.summary.maxGapYear).toBe(2025)
    })

    it('should handle all years with surplus (no gap)', () => {
      const incomeSources: YearlyIncomeSources[] = [
        {
          year: 2024,
          statutoryPensionNet: 20000,
          portfolioWithdrawal: 15000,
          otherIncome: 0,
          healthCareInsurance: 3000,
          totalAvailableIncome: 32000,
          desiredAnnualIncome: 30000,
        },
        {
          year: 2025,
          statutoryPensionNet: 20000,
          portfolioWithdrawal: 15000,
          otherIncome: 0,
          healthCareInsurance: 3000,
          totalAvailableIncome: 32000,
          desiredAnnualIncome: 30000,
        },
      ]

      const result = calculatePensionGapAnalysis(incomeSources, config)

      expect(result.summary.yearsCovered).toBe(2)
      expect(result.summary.yearsWithGap).toBe(0)
      expect(result.summary.maxGapAmount).toBeLessThan(0) // Surplus
      expect(result.summary.maxGapYear).toBeNull()
      expect(result.summary.averageGapAmount).toBe(0)
    })
  })

  describe('createDefaultRetirementLifestyleConfig', () => {
    it('should create default config with sensible values', () => {
      const config = createDefaultRetirementLifestyleConfig()

      expect(config.desiredMonthlyIncome).toBe(2500)
      expect(config.applyInflationAdjustment).toBe(true)
      expect(config.inflationRate).toBe(2.0)
    })
  })

  describe('estimateDesiredRetirementIncome', () => {
    it('should estimate retirement income at 75% replacement rate', () => {
      const config = estimateDesiredRetirementIncome(4000)

      expect(config.desiredMonthlyIncome).toBe(3000) // 4000 * 0.75
      expect(config.applyInflationAdjustment).toBe(true)
      expect(config.inflationRate).toBe(2.0)
    })

    it('should allow custom replacement rate', () => {
      const config = estimateDesiredRetirementIncome(5000, 80)

      expect(config.desiredMonthlyIncome).toBe(4000) // 5000 * 0.80
    })

    it('should handle 100% replacement rate', () => {
      const config = estimateDesiredRetirementIncome(3000, 100)

      expect(config.desiredMonthlyIncome).toBe(3000)
    })

    it('should handle 60% replacement rate (frugal retirement)', () => {
      const config = estimateDesiredRetirementIncome(6000, 60)

      expect(config.desiredMonthlyIncome).toBe(3600)
    })
  })
})
