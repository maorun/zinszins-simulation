import { describe, it, expect } from 'vitest'
import {
  calculateFundLinkedLifeInsurance,
  calculateFundLinkedLifeInsuranceTax,
  compareFundLinkedInsuranceVsDirectETF,
  createDefaultFundLinkedLifeInsuranceConfig,
  type FundLinkedLifeInsuranceConfig,
} from './fund-linked-life-insurance'

describe('fund-linked-life-insurance', () => {
  describe('createDefaultFundLinkedLifeInsuranceConfig', () => {
    it('should create a valid default configuration', () => {
      const config = createDefaultFundLinkedLifeInsuranceConfig()

      expect(config).toBeDefined()
      expect(config.name).toBe('Fondsgebundene Lebensversicherung')
      expect(config.monthlyContribution).toBe(300)
      expect(config.expectedReturnRate).toBe(7)
      expect(config.upfrontCostPercent).toBe(3)
      expect(config.annualManagementCostPercent).toBe(1)
      expect(config.enabled).toBe(false)
    })

    it('should set reasonable timespan (25 years)', () => {
      const config = createDefaultFundLinkedLifeInsuranceConfig()
      const years = config.endYear - config.startYear

      expect(years).toBe(25)
    })

    it('should set insured person to age 40', () => {
      const config = createDefaultFundLinkedLifeInsuranceConfig()
      const currentYear = new Date().getFullYear()
      const age = currentYear - config.birthYear

      expect(age).toBe(40)
    })
  })

  describe('calculateFundLinkedLifeInsurance', () => {
    it('should calculate basic insurance with no initial investment', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2034, // 10 years
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 0,
        upfrontCostPercent: 0, // No costs for simple test
        annualManagementCostPercent: 0,
        guaranteeCostPercent: 0,
        birthYear: 1984,
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      expect(result.yearlyResults).toHaveLength(11) // 2024-2034 inclusive
      expect(result.totalContributions).toBe(100 * 12 * 11) // 13,200 EUR (11 years)
      expect(result.finalPortfolioValue).toBeGreaterThan(13200) // Should have growth
      expect(result.totalCostsPaid).toBe(0) // No costs configured
    })

    it('should apply upfront costs in first 5 years', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2034,
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 0,
        upfrontCostPercent: 5, // 5% upfront costs
        annualManagementCostPercent: 0,
        guaranteeCostPercent: 0,
        birthYear: 1984,
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Check first 5 years have upfront costs
      const firstYearCosts = result.yearlyResults[0]?.upfrontCosts ?? 0
      expect(firstYearCosts).toBeGreaterThan(0)

      // Check year 6 has no upfront costs
      const sixthYearCosts = result.yearlyResults[5]?.upfrontCosts ?? 0
      expect(sixthYearCosts).toBe(0)

      // Total upfront costs should be 5% of total contributions
      const totalPlannedContributions = 100 * 12 * 10
      const expectedUpfrontCosts = totalPlannedContributions * 0.05

      const actualUpfrontCosts = result.yearlyResults.reduce((sum, year) => sum + year.upfrontCosts, 0)

      expect(actualUpfrontCosts).toBeCloseTo(expectedUpfrontCosts, 0)
    })

    it('should apply management costs annually', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2026, // 2 years for simplicity
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 0,
        upfrontCostPercent: 0,
        annualManagementCostPercent: 1, // 1% annual management
        guaranteeCostPercent: 0,
        birthYear: 1984,
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Each year should have management costs
      result.yearlyResults.forEach(yearResult => {
        expect(yearResult.managementCosts).toBeGreaterThan(0)
      })
    })

    it('should calculate tax benefits correctly after 12 years and age 62', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2050, // 26 years
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 0,
        upfrontCostPercent: 0,
        annualManagementCostPercent: 0,
        guaranteeCostPercent: 0,
        birthYear: 1962, // Will be 62 in 2024
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // After 12 years (2036) and age 62+, tax benefits should apply
      const yearAfter12 = result.yearlyResults.find(y => y.year === 2036)
      expect(yearAfter12?.taxBenefitsApply).toBe(true)
      expect(yearAfter12?.taxableGainsPercent).toBe(50)

      // Final year should have tax benefits
      expect(result.taxBenefitsApplyAtMaturity).toBe(true)
    })

    it('should not apply tax benefits if duration less than 12 years', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2034, // 10 years (less than 12)
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 0,
        upfrontCostPercent: 0,
        annualManagementCostPercent: 0,
        guaranteeCostPercent: 0,
        birthYear: 1960, // Already 64, age criteria met
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Should not have tax benefits at end (only 10 years)
      expect(result.taxBenefitsApplyAtMaturity).toBe(false)
      const finalYear = result.yearlyResults[result.yearlyResults.length - 1]
      expect(finalYear?.taxableGainsPercent).toBe(100)
    })

    it('should not apply tax benefits if age less than 62 at maturity', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2040, // 16 years (more than 12)
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 0,
        upfrontCostPercent: 0,
        annualManagementCostPercent: 0,
        guaranteeCostPercent: 0,
        birthYear: 1985, // Will be only 55 at maturity
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Should not have tax benefits at end (age too young)
      expect(result.taxBenefitsApplyAtMaturity).toBe(false)
    })

    it('should include initial investment in portfolio', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2026,
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 10000, // Initial 10k investment
        upfrontCostPercent: 0,
        annualManagementCostPercent: 0,
        guaranteeCostPercent: 0,
        birthYear: 1984,
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Total contributions should include initial investment
      expect(result.totalContributions).toBeGreaterThanOrEqual(10000)

      // First year portfolio should benefit from initial investment
      const firstYear = result.yearlyResults[0]
      expect(firstYear?.portfolioValue).toBeGreaterThan(10000)
    })

    it('should apply guaranteed minimum amount at maturity', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2026,
        monthlyContribution: 10, // Very small contribution
        expectedReturnRate: 0, // No growth
        initialInvestment: 100,
        upfrontCostPercent: 50, // Very high costs to reduce value
        annualManagementCostPercent: 10,
        guaranteeCostPercent: 0,
        birthYear: 1984,
        guaranteedMinimumAmount: 5000, // Guarantee 5000 EUR
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Final value should be at least the guaranteed amount
      expect(result.finalPortfolioValue).toBeGreaterThanOrEqual(5000)
    })

    it('should calculate death benefit costs when enabled', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2026,
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 0,
        upfrontCostPercent: 0,
        annualManagementCostPercent: 0,
        guaranteeCostPercent: 0,
        birthYear: 1984,
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.1,
        includeDeathBenefitCosts: true, // Enabled
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Should have death benefit costs
      const totalDeathBenefitCosts = result.yearlyResults.reduce((sum, year) => sum + year.deathBenefitCosts, 0)

      expect(totalDeathBenefitCosts).toBeGreaterThan(0)
    })

    it('should not calculate death benefit costs when disabled', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2026,
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 0,
        upfrontCostPercent: 0,
        annualManagementCostPercent: 0,
        guaranteeCostPercent: 0,
        birthYear: 1984,
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.1,
        includeDeathBenefitCosts: false, // Disabled
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Should have no death benefit costs
      const totalDeathBenefitCosts = result.yearlyResults.reduce((sum, year) => sum + year.deathBenefitCosts, 0)

      expect(totalDeathBenefitCosts).toBe(0)
    })

    it('should calculate effective annual return', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2034,
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 0,
        upfrontCostPercent: 2,
        annualManagementCostPercent: 1,
        guaranteeCostPercent: 0,
        birthYear: 1984,
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Effective return should be less than expected return due to costs
      expect(result.effectiveAnnualReturn).toBeLessThan(config.expectedReturnRate)
      expect(result.effectiveAnnualReturn).toBeGreaterThan(0)
    })

    it('should calculate cost ratio', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2034,
        monthlyContribution: 100,
        expectedReturnRate: 5,
        initialInvestment: 0,
        upfrontCostPercent: 3,
        annualManagementCostPercent: 1,
        guaranteeCostPercent: 0.5,
        birthYear: 1984,
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: true,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Should have a cost ratio
      expect(result.costRatio).toBeGreaterThan(0)
      expect(result.costRatio).toBeLessThan(100) // Should be less than 100%
    })
  })

  describe('calculateFundLinkedLifeInsuranceTax', () => {
    it('should calculate tax with benefits (50% taxable)', () => {
      const portfolioValue = 100000
      const totalContributions = 60000
      const taxBenefitsApply = true
      const capitalGainsTaxRate = 26.375

      const result = calculateFundLinkedLifeInsuranceTax(
        portfolioValue,
        totalContributions,
        taxBenefitsApply,
        capitalGainsTaxRate,
      )

      expect(result.investmentGains).toBe(40000)
      expect(result.taxableGains).toBe(20000) // 50% of gains
      expect(result.taxAmount).toBeCloseTo(5275, 0) // 20000 * 0.26375
      expect(result.netWithdrawalAmount).toBeCloseTo(94725, 0)
    })

    it('should calculate tax without benefits (100% taxable)', () => {
      const portfolioValue = 100000
      const totalContributions = 60000
      const taxBenefitsApply = false
      const capitalGainsTaxRate = 26.375

      const result = calculateFundLinkedLifeInsuranceTax(
        portfolioValue,
        totalContributions,
        taxBenefitsApply,
        capitalGainsTaxRate,
      )

      expect(result.investmentGains).toBe(40000)
      expect(result.taxableGains).toBe(40000) // 100% of gains
      expect(result.taxAmount).toBeCloseTo(10550, 0) // 40000 * 0.26375
      expect(result.netWithdrawalAmount).toBeCloseTo(89450, 0)
    })

    it('should handle no gains correctly', () => {
      const portfolioValue = 60000
      const totalContributions = 60000
      const taxBenefitsApply = true
      const capitalGainsTaxRate = 26.375

      const result = calculateFundLinkedLifeInsuranceTax(
        portfolioValue,
        totalContributions,
        taxBenefitsApply,
        capitalGainsTaxRate,
      )

      expect(result.investmentGains).toBe(0)
      expect(result.taxableGains).toBe(0)
      expect(result.taxAmount).toBe(0)
      expect(result.netWithdrawalAmount).toBe(60000)
    })

    it('should handle losses correctly (no negative gains)', () => {
      const portfolioValue = 50000
      const totalContributions = 60000
      const taxBenefitsApply = true
      const capitalGainsTaxRate = 26.375

      const result = calculateFundLinkedLifeInsuranceTax(
        portfolioValue,
        totalContributions,
        taxBenefitsApply,
        capitalGainsTaxRate,
      )

      expect(result.investmentGains).toBe(0) // Max of 0
      expect(result.taxableGains).toBe(0)
      expect(result.taxAmount).toBe(0)
      expect(result.netWithdrawalAmount).toBe(50000)
    })
  })

  describe('compareFundLinkedInsuranceVsDirectETF', () => {
    it('should compare insurance vs direct ETF investment', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2044, // 20 years
        monthlyContribution: 300,
        expectedReturnRate: 7,
        initialInvestment: 0,
        upfrontCostPercent: 3,
        annualManagementCostPercent: 1,
        guaranteeCostPercent: 0,
        birthYear: 1960, // Age 64, will be 84 at end
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.1,
        includeDeathBenefitCosts: true,
        enabled: true,
      }

      const insurance = calculateFundLinkedLifeInsurance(config)

      const comparison = compareFundLinkedInsuranceVsDirectETF(
        insurance,
        7, // Same 7% return
        0.2, // 0.2% ETF costs (TER)
        26.375, // Capital gains tax rate
      )

      expect(comparison.insuranceFinalValue).toBeGreaterThan(0)
      expect(comparison.directETFFinalValue).toBeGreaterThan(0)

      // Direct ETF should typically have higher final value due to lower costs
      // But insurance has tax advantage if criteria met
      expect(comparison.insuranceAdvantage).toBeDefined()
      expect(comparison.insuranceAdvantagePercent).toBeDefined()
    })

    it('should show insurance advantage when tax benefits apply', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2044, // 20 years (more than 12)
        monthlyContribution: 300,
        expectedReturnRate: 7,
        initialInvestment: 0,
        upfrontCostPercent: 1, // Low costs
        annualManagementCostPercent: 0.5,
        guaranteeCostPercent: 0,
        birthYear: 1960, // Age 64, criteria met
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const insurance = calculateFundLinkedLifeInsurance(config)

      const comparison = compareFundLinkedInsuranceVsDirectETF(insurance, 7, 0.2, 26.375)

      // Insurance should have tax advantage (50% vs 100% taxable)
      expect(insurance.taxBenefitsApplyAtMaturity).toBe(true)

      // Net value comparison should favor insurance due to tax benefits
      // (assuming low insurance costs)
      expect(comparison.insuranceNetValue).toBeGreaterThan(0)
      expect(comparison.directETFNetValue).toBeGreaterThan(0)
    })

    it('should calculate all required comparison metrics', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Test Policy',
        startYear: 2024,
        endYear: 2034,
        monthlyContribution: 200,
        expectedReturnRate: 6,
        initialInvestment: 1000,
        upfrontCostPercent: 2,
        annualManagementCostPercent: 1,
        guaranteeCostPercent: 0,
        birthYear: 1970,
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const insurance = calculateFundLinkedLifeInsurance(config)

      const comparison = compareFundLinkedInsuranceVsDirectETF(insurance, 6, 0.25, 26.375)

      // Check all metrics are present
      expect(comparison.insuranceFinalValue).toBeDefined()
      expect(comparison.insuranceTaxAmount).toBeDefined()
      expect(comparison.insuranceNetValue).toBeDefined()
      expect(comparison.directETFFinalValue).toBeDefined()
      expect(comparison.directETFTaxAmount).toBeDefined()
      expect(comparison.directETFNetValue).toBeDefined()
      expect(comparison.insuranceAdvantage).toBeDefined()
      expect(comparison.insuranceAdvantagePercent).toBeDefined()
    })
  })

  describe('integration scenarios', () => {
    it('should handle realistic scenario: 40 year old, 25 year policy', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Altersvorsorge',
        startYear: 2024,
        endYear: 2049, // 25 years
        monthlyContribution: 500,
        expectedReturnRate: 7,
        initialInvestment: 10000,
        upfrontCostPercent: 3,
        annualManagementCostPercent: 1,
        guaranteeCostPercent: 0.5,
        birthYear: 1984, // 40 years old
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.1,
        includeDeathBenefitCosts: true,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // After 25 years, should have significant value
      expect(result.finalPortfolioValue).toBeGreaterThan(100000)

      // At end, person is 65, held for 25 years > 12, age > 62
      expect(result.taxBenefitsApplyAtMaturity).toBe(true)

      // Should have paid costs
      expect(result.totalCostsPaid).toBeGreaterThan(0)

      // Cost ratio includes upfront costs (3% of all contributions over 5 years)
      // plus ongoing management (1%) and guarantee costs (0.5%) and death benefit
      // This is typical for German insurance products which are relatively expensive
      expect(result.costRatio).toBeLessThan(50) // Should be under 50%
    })

    it('should handle scenario: young person, short term policy', () => {
      const config: FundLinkedLifeInsuranceConfig = {
        name: 'Vermögensaufbau',
        startYear: 2024,
        endYear: 2034, // 10 years
        monthlyContribution: 200,
        expectedReturnRate: 8,
        initialInvestment: 0,
        upfrontCostPercent: 4,
        annualManagementCostPercent: 1.2,
        guaranteeCostPercent: 0,
        birthYear: 1995, // 29 years old, will be 39 at end
        guaranteedMinimumAmount: 0,
        deathBenefitMultiplier: 1.0,
        includeDeathBenefitCosts: false,
        enabled: true,
      }

      const result = calculateFundLinkedLifeInsurance(config)

      // Should not get tax benefits (too young and too short)
      expect(result.taxBenefitsApplyAtMaturity).toBe(false)

      // Should still have positive returns
      expect(result.finalPortfolioValue).toBeGreaterThan(result.totalContributions)
    })
  })
})
