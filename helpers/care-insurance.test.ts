import { describe, it, expect } from 'vitest'
import {
  calculateCareInsurance,
  calculateRecommendedDailyBenefit,
  comparePolicyTypes,
  createDefaultCareInsuranceConfig,
  type CareInsuranceConfig,
  type CareInsurancePolicyType,
} from './care-insurance'

describe('care-insurance', () => {
  describe('createDefaultCareInsuranceConfig', () => {
    it('should create a valid default configuration', () => {
      const config = createDefaultCareInsuranceConfig()
      const currentYear = new Date().getFullYear()

      expect(config.name).toBe('Pflegezusatzversicherung')
      expect(config.startYear).toBe(currentYear)
      expect(config.endYear).toBe(currentYear + 40)
      expect(config.policyType).toBe('pflegetagegeld')
      expect(config.monthlyPremium).toBe(50)
      expect(config.dailyBenefitPflegegrad5).toBe(50)
      expect(config.birthYear).toBe(currentYear - 45)
      expect(config.gender).toBe('male')
      expect(config.isPflegeBahr).toBe(false)
      expect(config.enabled).toBe(false)
    })
  })

  describe('calculateCareInsurance', () => {
    it('should calculate basic care insurance correctly', () => {
      const config: CareInsuranceConfig = {
        name: 'Test Pflege',
        startYear: 2024,
        endYear: 2026,
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 50,
        birthYear: 1979, // Age 45 in 2024
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      expect(result.config).toEqual(config)
      expect(result.yearlyResults).toHaveLength(3)
      expect(result.benefitsTaxFree).toBe(true)
      
      // Check first year
      const firstYear = result.yearlyResults[0]
      expect(firstYear?.year).toBe(2024)
      expect(firstYear?.age).toBe(45)
      expect(firstYear?.annualPremium).toBe(600) // 50 * 12
      expect(firstYear?.stateSubsidy).toBe(0) // Not Pflege-Bahr
      expect(firstYear?.netAnnualPremium).toBe(600)
      expect(firstYear?.dailyBenefitByLevel[5]).toBe(50)
      expect(firstYear?.monthlyBenefitByLevel[5]).toBeCloseTo(1521, 0) // 50 * 30.42
    })

    it('should calculate benefits for all care levels correctly', () => {
      const config: CareInsuranceConfig = {
        name: 'Test Pflege',
        startYear: 2024,
        endYear: 2024,
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 100,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)
      const firstYear = result.yearlyResults[0]

      expect(firstYear?.dailyBenefitByLevel[1]).toBe(20) // 20% of 100
      expect(firstYear?.dailyBenefitByLevel[2]).toBe(40) // 40% of 100
      expect(firstYear?.dailyBenefitByLevel[3]).toBe(60) // 60% of 100
      expect(firstYear?.dailyBenefitByLevel[4]).toBe(80) // 80% of 100
      expect(firstYear?.dailyBenefitByLevel[5]).toBe(100) // 100% of 100

      // Monthly benefits should be daily * 30.42
      expect(firstYear?.monthlyBenefitByLevel[1]).toBeCloseTo(608.4, 1)
      expect(firstYear?.monthlyBenefitByLevel[2]).toBeCloseTo(1216.8, 1)
      expect(firstYear?.monthlyBenefitByLevel[3]).toBeCloseTo(1825.2, 1)
      expect(firstYear?.monthlyBenefitByLevel[4]).toBeCloseTo(2433.6, 1)
      expect(firstYear?.monthlyBenefitByLevel[5]).toBeCloseTo(3042, 1)
    })

    it('should handle Pflege-Bahr subsidy correctly', () => {
      const config: CareInsuranceConfig = {
        name: 'Pflege-Bahr',
        startYear: 2024,
        endYear: 2026,
        policyType: 'pflege-bahr',
        monthlyPremium: 60, // Must be at least 10 EUR for subsidy
        dailyBenefitPflegegrad5: 30,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: true,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      const firstYear = result.yearlyResults[0]
      expect(firstYear?.annualPremium).toBe(720) // 60 * 12
      expect(firstYear?.stateSubsidy).toBe(60) // 5 * 12
      expect(firstYear?.netAnnualPremium).toBe(660) // 720 - 60

      expect(result.totalStateSubsidies).toBe(180) // 60 * 3 years
      expect(result.totalNetPremiumsPaid).toBe(1980) // (720 - 60) * 3
    })

    it('should not apply Pflege-Bahr subsidy if premium is below minimum', () => {
      const config: CareInsuranceConfig = {
        name: 'Pflege-Bahr Low',
        startYear: 2024,
        endYear: 2024,
        policyType: 'pflege-bahr',
        monthlyPremium: 8, // Below 10 EUR minimum
        dailyBenefitPflegegrad5: 20,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: true,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      const firstYear = result.yearlyResults[0]
      expect(firstYear?.stateSubsidy).toBe(0) // No subsidy below minimum
      expect(firstYear?.netAnnualPremium).toBe(96) // 8 * 12
    })

    it('should calculate cumulative premiums correctly', () => {
      const config: CareInsuranceConfig = {
        name: 'Test Pflege',
        startYear: 2024,
        endYear: 2028,
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 50,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      expect(result.yearlyResults[0]?.totalNetPremiumsPaid).toBe(600)
      expect(result.yearlyResults[1]?.totalNetPremiumsPaid).toBe(1200)
      expect(result.yearlyResults[2]?.totalNetPremiumsPaid).toBe(1800)
      expect(result.yearlyResults[3]?.totalNetPremiumsPaid).toBe(2400)
      expect(result.yearlyResults[4]?.totalNetPremiumsPaid).toBe(3000)

      expect(result.totalNetPremiumsPaid).toBe(3000) // 600 * 5 years
      expect(result.averageAnnualNetPremium).toBe(600)
    })

    it('should calculate care need probability by age', () => {
      const config: CareInsuranceConfig = {
        name: 'Test Pflege',
        startYear: 2024,
        endYear: 2029,
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 50,
        birthYear: 1954, // Age 70 in 2024
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      // Care need probability should increase with age
      const year2024 = result.yearlyResults[0] // Age 70
      const year2029 = result.yearlyResults[5] // Age 75

      expect(year2024?.careNeedProbability).toBeGreaterThan(0)
      expect(year2029?.careNeedProbability).toBeGreaterThan(year2024?.careNeedProbability ?? 0)
    })

    it('should calculate maximum monthly benefit correctly', () => {
      const config: CareInsuranceConfig = {
        name: 'Test Pflege',
        startYear: 2024,
        endYear: 2024,
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 75,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      // Max monthly benefit = dailyBenefit * 30.42
      expect(result.maxMonthlyBenefit).toBeCloseTo(2281.5, 1) // 75 * 30.42
    })
  })

  describe('calculateRecommendedDailyBenefit', () => {
    it('should calculate recommended benefits for typical care costs', () => {
      const expectedMonthlyCosts = 3000 // 3,000 EUR/month care costs
      const statutoryMonthlyBenefit = 1500 // 1,500 EUR/month statutory benefit

      const result = calculateRecommendedDailyBenefit(
        expectedMonthlyCosts,
        statutoryMonthlyBenefit,
      )

      // Gap is 1,500 EUR/month = ~49.3 EUR/day
      expect(result.minimumDailyBenefit).toBe(25) // 50% of gap rounded
      expect(result.recommendedDailyBenefit).toBe(37) // 75% of gap rounded
      expect(result.comprehensiveDailyBenefit).toBe(49) // 100% of gap rounded
    })

    it('should handle case where statutory benefit covers all costs', () => {
      const expectedMonthlyCosts = 1000
      const statutoryMonthlyBenefit = 1500 // More than costs

      const result = calculateRecommendedDailyBenefit(
        expectedMonthlyCosts,
        statutoryMonthlyBenefit,
      )

      // No gap, so all recommendations should be 0
      expect(result.minimumDailyBenefit).toBe(0)
      expect(result.recommendedDailyBenefit).toBe(0)
      expect(result.comprehensiveDailyBenefit).toBe(0)
    })

    it('should handle high care costs', () => {
      const expectedMonthlyCosts = 5000 // High care costs (nursing home)
      const statutoryMonthlyBenefit = 2000

      const result = calculateRecommendedDailyBenefit(
        expectedMonthlyCosts,
        statutoryMonthlyBenefit,
      )

      // Gap is 3,000 EUR/month = ~98.6 EUR/day
      expect(result.minimumDailyBenefit).toBeGreaterThan(0)
      expect(result.recommendedDailyBenefit).toBeGreaterThan(result.minimumDailyBenefit)
      expect(result.comprehensiveDailyBenefit).toBeGreaterThan(result.recommendedDailyBenefit)
      expect(result.comprehensiveDailyBenefit).toBeCloseTo(99, 0)
    })
  })

  describe('comparePolicyTypes', () => {
    it('should compare different policy types', () => {
      const baseConfig: CareInsuranceConfig = {
        name: 'Test Pflege',
        startYear: 2024,
        endYear: 2029,
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 50,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const policyTypes: CareInsurancePolicyType[] = [
        'pflegetagegeld',
        'pflegekostenversicherung',
        'pflege-bahr',
      ]

      const comparisons = comparePolicyTypes(baseConfig, policyTypes)

      expect(comparisons).toHaveLength(3)
      
      // All should have same premiums (not Pflege-Bahr flagged)
      comparisons.forEach((comp) => {
        expect(comp.totalNetPremiumsPaid).toBe(3600) // 50 * 12 * 6 years (2024-2029)
        expect(comp.averageAnnualNetPremium).toBe(600)
        expect(comp.maxMonthlyBenefit).toBeCloseTo(1521, 0)
        expect(comp.totalStateSubsidies).toBe(0)
      })

      // Check policy types are correctly set
      expect(comparisons[0]?.policyType).toBe('pflegetagegeld')
      expect(comparisons[1]?.policyType).toBe('pflegekostenversicherung')
      expect(comparisons[2]?.policyType).toBe('pflege-bahr')
    })

    it('should show subsidy difference for Pflege-Bahr', () => {
      const baseConfig: CareInsuranceConfig = {
        name: 'Test Pflege',
        startYear: 2024,
        endYear: 2024,
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 50,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: true, // Enable subsidy
        enabled: true,
      }

      const policyTypes: CareInsurancePolicyType[] = [
        'pflegetagegeld',
        'pflege-bahr',
      ]

      const comparisons = comparePolicyTypes(baseConfig, policyTypes)

      // Both should have subsidy since isPflegeBahr is true
      comparisons.forEach((comp) => {
        expect(comp.totalNetPremiumsPaid).toBe(540) // 600 - 60 subsidy
        expect(comp.totalStateSubsidies).toBe(60) // 5 * 12
      })
    })
  })

  describe('edge cases', () => {
    it('should handle zero premium', () => {
      const config: CareInsuranceConfig = {
        name: 'Free Pflege',
        startYear: 2024,
        endYear: 2024,
        policyType: 'pflegetagegeld',
        monthlyPremium: 0,
        dailyBenefitPflegegrad5: 50,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      expect(result.totalNetPremiumsPaid).toBe(0)
      expect(result.averageAnnualNetPremium).toBe(0)
      expect(result.maxMonthlyBenefit).toBeGreaterThan(0) // Benefits still calculated
    })

    it('should handle zero daily benefit', () => {
      const config: CareInsuranceConfig = {
        name: 'No Benefit Pflege',
        startYear: 2024,
        endYear: 2024,
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 0,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)
      const firstYear = result.yearlyResults[0]

      expect(firstYear?.dailyBenefitByLevel[1]).toBe(0)
      expect(firstYear?.dailyBenefitByLevel[5]).toBe(0)
      expect(firstYear?.monthlyBenefitByLevel[5]).toBe(0)
      expect(result.maxMonthlyBenefit).toBe(0)
    })

    it('should handle single year policy', () => {
      const config: CareInsuranceConfig = {
        name: 'One Year',
        startYear: 2024,
        endYear: 2024,
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 50,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      expect(result.yearlyResults).toHaveLength(1)
      expect(result.totalNetPremiumsPaid).toBe(600)
      expect(result.averageAnnualNetPremium).toBe(600)
    })

    it('should handle long-term policy', () => {
      const config: CareInsuranceConfig = {
        name: 'Long Term',
        startYear: 2024,
        endYear: 2064, // 40 years
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 50,
        birthYear: 1979,
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      expect(result.yearlyResults).toHaveLength(41)
      expect(result.totalNetPremiumsPaid).toBe(24600) // 600 * 41 years
      
      // Care need probability should increase significantly over 40 years
      const firstYear = result.yearlyResults[0]
      const lastYear = result.yearlyResults[40]
      expect(lastYear?.careNeedProbability).toBeGreaterThan(
        (firstYear?.careNeedProbability ?? 0) * 5,
      )
    })

    it('should handle female gender', () => {
      const config: CareInsuranceConfig = {
        name: 'Female Pflege',
        startYear: 2024,
        endYear: 2024,
        policyType: 'pflegetagegeld',
        monthlyPremium: 50,
        dailyBenefitPflegegrad5: 50,
        birthYear: 1979,
        gender: 'female',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      // Should calculate successfully with female gender
      expect(result.config.gender).toBe('female')
      expect(result.yearlyResults).toHaveLength(1)
    })

    it('should handle very old entry age', () => {
      const config: CareInsuranceConfig = {
        name: 'Late Entry',
        startYear: 2024,
        endYear: 2029,
        policyType: 'pflegetagegeld',
        monthlyPremium: 150, // Higher premium for older entry
        dailyBenefitPflegegrad5: 50,
        birthYear: 1939, // Age 85 in 2024
        gender: 'male',
        isPflegeBahr: false,
        enabled: true,
      }

      const result = calculateCareInsurance(config)

      // Care need probability should be very high for 85+ year olds
      const firstYear = result.yearlyResults[0]
      expect(firstYear?.careNeedProbability).toBeGreaterThan(20)
      
      const lastYear = result.yearlyResults[5] // Age 90
      expect(lastYear?.careNeedProbability).toBeGreaterThan(40)
    })
  })
})
