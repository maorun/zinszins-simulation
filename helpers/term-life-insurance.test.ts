import { describe, it, expect } from 'vitest'
import {
  calculateTermLifeInsurance,
  compareCoverageAmounts,
  calculateOptimalCoverage,
  createDefaultTermLifeInsuranceConfig,
  type TermLifeInsuranceConfig,
} from './term-life-insurance'

describe('term-life-insurance', () => {
  describe('createDefaultTermLifeInsuranceConfig', () => {
    it('should create a valid default configuration', () => {
      const config = createDefaultTermLifeInsuranceConfig()

      expect(config).toBeDefined()
      expect(config.name).toBe('Risikolebensversicherung')
      expect(config.coverageAmount).toBe(250000)
      expect(config.coverageType).toBe('level')
      expect(config.healthStatus).toBe('good')
      expect(config.smokingStatus).toBe('non-smoker')
      expect(config.enabled).toBe(false)
    })

    it('should set reasonable timespan (20 years)', () => {
      const config = createDefaultTermLifeInsuranceConfig()
      const years = config.endYear - config.startYear

      expect(years).toBe(20)
    })

    it('should set insured person to age 35', () => {
      const config = createDefaultTermLifeInsuranceConfig()
      const currentYear = new Date().getFullYear()
      const age = currentYear - config.birthYear

      expect(age).toBe(35)
    })
  })

  describe('calculateTermLifeInsurance', () => {
    it('should calculate basic level coverage insurance', () => {
      const config: TermLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2034, // 10 years
        coverageAmount: 200000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984, // 40 years old in 2024
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const result = calculateTermLifeInsurance(config)

      expect(result.yearlyResults).toHaveLength(11) // 2024-2034 inclusive
      expect(result.initialCoverageAmount).toBe(200000)
      expect(result.finalCoverageAmount).toBe(200000) // Level coverage stays constant
      expect(result.deathBenefitTaxFree).toBe(true)
      expect(result.totalPremiumsPaid).toBeGreaterThan(0)
      expect(result.averageAnnualPremium).toBeGreaterThan(0)
    })

    it('should maintain constant coverage for level coverage type', () => {
      const config: TermLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2029,
        coverageAmount: 100000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const result = calculateTermLifeInsurance(config)

      // All years should have same coverage
      result.yearlyResults.forEach((year) => {
        expect(year.coverageAmount).toBe(100000)
        expect(year.deathBenefitAmount).toBe(100000)
      })
    })

    it('should decrease coverage for decreasing coverage type', () => {
      const config: TermLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2029,
        coverageAmount: 100000,
        coverageType: 'decreasing',
        annualDecreasePercent: 10, // 10% decrease per year
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const result = calculateTermLifeInsurance(config)

      expect(result.initialCoverageAmount).toBe(100000)
      expect(result.finalCoverageAmount).toBeLessThan(100000)

      // Coverage should decrease each year
      for (let i = 1; i < result.yearlyResults.length; i++) {
        const prevCoverage = result.yearlyResults[i - 1]?.coverageAmount ?? 0
        const currentCoverage = result.yearlyResults[i]?.coverageAmount ?? 0
        expect(currentCoverage).toBeLessThan(prevCoverage)
      }
    })

    it('should calculate higher premiums for smokers', () => {
      const nonSmokerConfig: TermLifeInsuranceConfig = {
        name: 'Non-Smoker Policy',
        startYear: 2024,
        endYear: 2029,
        coverageAmount: 200000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const smokerConfig: TermLifeInsuranceConfig = {
        ...nonSmokerConfig,
        name: 'Smoker Policy',
        smokingStatus: 'smoker',
      }

      const nonSmokerResult = calculateTermLifeInsurance(nonSmokerConfig)
      const smokerResult = calculateTermLifeInsurance(smokerConfig)

      expect(smokerResult.totalPremiumsPaid).toBeGreaterThan(nonSmokerResult.totalPremiumsPaid)
      expect(smokerResult.averageAnnualPremium).toBeGreaterThan(
        nonSmokerResult.averageAnnualPremium,
      )
    })

    it('should calculate higher premiums for older insured persons', () => {
      const youngerConfig: TermLifeInsuranceConfig = {
        name: 'Younger Policy',
        startYear: 2024,
        endYear: 2029,
        coverageAmount: 200000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1994, // 30 years old
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const olderConfig: TermLifeInsuranceConfig = {
        ...youngerConfig,
        name: 'Older Policy',
        birthYear: 1974, // 50 years old
      }

      const youngerResult = calculateTermLifeInsurance(youngerConfig)
      const olderResult = calculateTermLifeInsurance(olderConfig)

      expect(olderResult.totalPremiumsPaid).toBeGreaterThan(youngerResult.totalPremiumsPaid)
    })

    it('should calculate lower premiums for females', () => {
      const maleConfig: TermLifeInsuranceConfig = {
        name: 'Male Policy',
        startYear: 2024,
        endYear: 2029,
        coverageAmount: 200000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const femaleConfig: TermLifeInsuranceConfig = {
        ...maleConfig,
        name: 'Female Policy',
        gender: 'female',
      }

      const maleResult = calculateTermLifeInsurance(maleConfig)
      const femaleResult = calculateTermLifeInsurance(femaleConfig)

      expect(femaleResult.totalPremiumsPaid).toBeLessThan(maleResult.totalPremiumsPaid)
    })

    it('should calculate different premiums based on health status', () => {
      const excellentHealthConfig: TermLifeInsuranceConfig = {
        name: 'Excellent Health',
        startYear: 2024,
        endYear: 2029,
        coverageAmount: 200000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'excellent',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const poorHealthConfig: TermLifeInsuranceConfig = {
        ...excellentHealthConfig,
        name: 'Poor Health',
        healthStatus: 'poor',
      }

      const excellentResult = calculateTermLifeInsurance(excellentHealthConfig)
      const poorResult = calculateTermLifeInsurance(poorHealthConfig)

      expect(poorResult.totalPremiumsPaid).toBeGreaterThan(excellentResult.totalPremiumsPaid)
    })

    it('should track cumulative premiums correctly', () => {
      const config: TermLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2028,
        coverageAmount: 100000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const result = calculateTermLifeInsurance(config)

      // Verify cumulative premiums increase each year
      for (let i = 1; i < result.yearlyResults.length; i++) {
        const prevTotal = result.yearlyResults[i - 1]?.totalPremiumsPaid ?? 0
        const currentTotal = result.yearlyResults[i]?.totalPremiumsPaid ?? 0
        expect(currentTotal).toBeGreaterThan(prevTotal)
      }

      // Last year's cumulative should equal total
      const lastYear = result.yearlyResults[result.yearlyResults.length - 1]
      expect(lastYear?.totalPremiumsPaid).toBe(result.totalPremiumsPaid)
    })

    it('should calculate age correctly for each year', () => {
      const config: TermLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2028,
        coverageAmount: 100000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const result = calculateTermLifeInsurance(config)

      result.yearlyResults.forEach((yearResult) => {
        const expectedAge = yearResult.year - config.birthYear
        expect(yearResult.age).toBe(expectedAge)
      })
    })

    it('should always mark death benefits as tax-free', () => {
      const config: TermLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2029,
        coverageAmount: 200000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const result = calculateTermLifeInsurance(config)

      expect(result.deathBenefitTaxFree).toBe(true)
      result.yearlyResults.forEach((year) => {
        expect(year.deathBenefitAmount).toBe(year.coverageAmount)
      })
    })

    it('should handle single year policy', () => {
      const config: TermLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2024, // Single year
        coverageAmount: 100000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const result = calculateTermLifeInsurance(config)

      expect(result.yearlyResults).toHaveLength(1)
      expect(result.totalPremiumsPaid).toBe(result.averageAnnualPremium)
    })
  })

  describe('compareCoverageAmounts', () => {
    it('should compare different coverage amounts', () => {
      const baseConfig: TermLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2029,
        coverageAmount: 100000, // Will be overridden
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const coverageAmounts = [100000, 200000, 300000]
      const comparison = compareCoverageAmounts(baseConfig, coverageAmounts)

      expect(comparison).toHaveLength(3)

      // Higher coverage should cost more in total
      expect(comparison[1]?.totalPremiumsPaid ?? 0).toBeGreaterThan(
        comparison[0]?.totalPremiumsPaid ?? 0,
      )
      expect(comparison[2]?.totalPremiumsPaid ?? 0).toBeGreaterThan(
        comparison[1]?.totalPremiumsPaid ?? 0,
      )

      // All should have positive costs
      comparison.forEach((item) => {
        expect(item.totalPremiumsPaid).toBeGreaterThan(0)
        expect(item.averageAnnualPremium).toBeGreaterThan(0)
        expect(item.costPerThousandEUR).toBeGreaterThan(0)
      })
    })

    it('should calculate cost per thousand EUR correctly', () => {
      const baseConfig: TermLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2029,
        coverageAmount: 100000,
        coverageType: 'level',
        annualDecreasePercent: 0,
        birthYear: 1984,
        gender: 'male',
        healthStatus: 'good',
        smokingStatus: 'non-smoker',
        enabled: true,
      }

      const comparison = compareCoverageAmounts(baseConfig, [100000, 200000])

      comparison.forEach((item) => {
        const expectedCostPer1000 = (item.totalPremiumsPaid / item.coverageAmount) * 1000
        expect(item.costPerThousandEUR).toBeCloseTo(expectedCostPer1000, 2)
      })
    })
  })

  describe('calculateOptimalCoverage', () => {
    it('should calculate minimum coverage based on debts', () => {
      const result = calculateOptimalCoverage(
        200000, // Outstanding mortgage
        50000, // Annual living expenses
        15, // Years to support
        50000, // Existing savings
      )

      expect(result.minimumCoverage).toBe(150000) // 200k - 50k
    })

    it('should calculate recommended coverage including living expenses', () => {
      const result = calculateOptimalCoverage(
        200000, // Outstanding mortgage
        50000, // Annual living expenses
        15, // Years to support
        50000, // Existing savings
      )

      // 200k + (50k * 5) - 50k = 400k
      expect(result.recommendedCoverage).toBe(400000)
    })

    it('should calculate comprehensive coverage for full support period', () => {
      const result = calculateOptimalCoverage(
        200000, // Outstanding mortgage
        50000, // Annual living expenses
        15, // Years to support
        50000, // Existing savings
      )

      // 200k + (50k * 15) - 50k = 900k
      expect(result.comprehensiveCoverage).toBe(900000)
    })

    it('should handle case with no debt', () => {
      const result = calculateOptimalCoverage(
        0, // No mortgage
        40000, // Annual living expenses
        10, // Years to support
        20000, // Existing savings
      )

      expect(result.minimumCoverage).toBe(0)
      expect(result.recommendedCoverage).toBe(180000) // 40k * 5 - 20k
      expect(result.comprehensiveCoverage).toBe(380000) // 40k * 10 - 20k
    })

    it('should handle case where savings exceed debts', () => {
      const result = calculateOptimalCoverage(
        100000, // Mortgage
        30000, // Annual living expenses
        10, // Years to support
        150000, // Savings exceed debts
      )

      expect(result.minimumCoverage).toBe(0) // Savings cover debt (100k - 150k = 0)
      expect(result.recommendedCoverage).toBe(100000) // 100k + 150k - 150k = 100k
      expect(result.comprehensiveCoverage).toBe(250000) // 100k + 300k - 150k
    })

    it('should never return negative coverage amounts', () => {
      const result = calculateOptimalCoverage(
        50000, // Small mortgage
        20000, // Annual living expenses
        5, // Years to support
        200000, // Large savings
      )

      expect(result.minimumCoverage).toBeGreaterThanOrEqual(0)
      expect(result.recommendedCoverage).toBeGreaterThanOrEqual(0)
      expect(result.comprehensiveCoverage).toBeGreaterThanOrEqual(0)
    })
  })
})
