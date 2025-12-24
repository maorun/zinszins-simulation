import { describe, it, expect } from 'vitest'
import {
  calculateRiesterAllowances,
  calculateMinimumContribution,
  calculateRiesterTaxBenefit,
  calculateRiesterPensionTaxation,
  createDefaultRiesterConfig,
} from './riester-rente'

describe('Riester-Rente Helper Functions', () => {
  describe('calculateRiesterAllowances', () => {
    it('should return basic allowance of 175€ with no children', () => {
      const allowances = calculateRiesterAllowances(0, [], 2024)

      expect(allowances.basicAllowance).toBe(175)
      expect(allowances.childAllowances).toBe(0)
      expect(allowances.totalAllowances).toBe(175)
      expect(allowances.childAllowanceDetails).toHaveLength(0)
    })

    it('should calculate correct allowance for child born in 2010 (300€)', () => {
      const allowances = calculateRiesterAllowances(1, [2010], 2024)

      expect(allowances.basicAllowance).toBe(175)
      expect(allowances.childAllowances).toBe(300) // Born 2008 or later
      expect(allowances.totalAllowances).toBe(475)
      expect(allowances.childAllowanceDetails).toHaveLength(1)
      expect(allowances.childAllowanceDetails[0].allowance).toBe(300)
      expect(allowances.childAllowanceDetails[0].age).toBe(14)
    })

    it('should calculate correct allowance for child born in 2005 (185€)', () => {
      const allowances = calculateRiesterAllowances(1, [2005], 2024)

      expect(allowances.basicAllowance).toBe(175)
      expect(allowances.childAllowances).toBe(185) // Born before 2008
      expect(allowances.totalAllowances).toBe(360)
      expect(allowances.childAllowanceDetails[0].allowance).toBe(185)
      expect(allowances.childAllowanceDetails[0].age).toBe(19)
    })

    it('should calculate allowances for multiple children', () => {
      const allowances = calculateRiesterAllowances(3, [2005, 2010, 2015], 2024)

      expect(allowances.basicAllowance).toBe(175)
      // 2005: 185€, 2010: 300€, 2015: 300€
      expect(allowances.childAllowances).toBe(785)
      expect(allowances.totalAllowances).toBe(960)
      expect(allowances.childAllowanceDetails).toHaveLength(3)
    })

    it('should not grant allowance for children 25 or older', () => {
      const allowances = calculateRiesterAllowances(2, [1995, 2010], 2024)

      expect(allowances.basicAllowance).toBe(175)
      // 1995: 0€ (29 years old), 2010: 300€
      expect(allowances.childAllowances).toBe(300)
      expect(allowances.totalAllowances).toBe(475)
      expect(allowances.childAllowanceDetails[0].allowance).toBe(0)
      expect(allowances.childAllowanceDetails[0].age).toBe(29)
      expect(allowances.childAllowanceDetails[1].allowance).toBe(300)
    })

    it('should handle edge case of child turning 25', () => {
      const allowances2023 = calculateRiesterAllowances(1, [1999], 2023)
      expect(allowances2023.childAllowances).toBe(185) // 24 years old, eligible

      const allowances2024 = calculateRiesterAllowances(1, [1999], 2024)
      expect(allowances2024.childAllowances).toBe(0) // 25 years old, not eligible
    })

    it('should correctly identify birth year threshold for 300€ vs 185€', () => {
      const allowances2007 = calculateRiesterAllowances(1, [2007], 2024)
      expect(allowances2007.childAllowances).toBe(185) // Born before 2008

      const allowances2008 = calculateRiesterAllowances(1, [2008], 2024)
      expect(allowances2008.childAllowances).toBe(300) // Born 2008 or later
    })
  })

  describe('calculateMinimumContribution', () => {
    it('should calculate 4% of income minus allowances', () => {
      const grossIncome = 40000
      const allowances = 175 // Basic allowance only

      // 4% of 40000 = 1600
      // 1600 - 175 = 1425
      const minContribution = calculateMinimumContribution(grossIncome, allowances)
      expect(minContribution).toBe(1425)
    })

    it('should return minimum of 60€ when calculation results in lower value', () => {
      const grossIncome = 10000
      const allowances = 500 // High allowances

      // 4% of 10000 = 400
      // 400 - 500 = -100 (but minimum is 60€)
      const minContribution = calculateMinimumContribution(grossIncome, allowances)
      expect(minContribution).toBe(60)
    })

    it('should handle high income scenario', () => {
      const grossIncome = 100000
      const allowances = 175

      // 4% of 100000 = 4000
      // 4000 - 175 = 3825
      const minContribution = calculateMinimumContribution(grossIncome, allowances)
      expect(minContribution).toBe(3825)
    })

    it('should handle scenario with multiple children allowances', () => {
      const grossIncome = 50000
      const allowances = 960 // Basic + 3 children

      // 4% of 50000 = 2000
      // 2000 - 960 = 1040
      const minContribution = calculateMinimumContribution(grossIncome, allowances)
      expect(minContribution).toBe(1040)
    })

    it('should return exactly 60€ when result equals minimum', () => {
      const grossIncome = 5875
      const allowances = 175

      // 4% of 5875 = 235
      // 235 - 175 = 60 (exactly minimum)
      const minContribution = calculateMinimumContribution(grossIncome, allowances)
      expect(minContribution).toBe(60)
    })
  })

  describe('calculateRiesterTaxBenefit', () => {
    it('should choose allowances when more favorable (low income, low tax rate)', () => {
      const result = calculateRiesterTaxBenefit(
        900, // contribution (must meet minimum: 40000*0.04 - 775 = 825€)
        40000, // gross income
        2, // 2 children
        [2010, 2015], // both eligible for 300€
        2024, // calculation year
        0.25, // 25% tax rate
      )

      // Allowances: 175 + 300 + 300 = 775€
      // Min contribution: 40000 * 0.04 - 775 = 825€
      // Tax deduction: 900 * 0.25 = 225€ tax savings
      // Net benefit from deduction: 225 - 775 = -550€ (negative)
      // So allowances are more favorable

      expect(result.allowances).toBe(775)
      expect(result.meetsMinimumContribution).toBe(true)
      expect(result.benefitMethod).toBe('allowances')
      expect(result.totalBenefit).toBe(775)
      expect(result.taxDeductionAmount).toBe(0)
    })

    it('should choose tax deduction when more favorable (high income, high tax rate, no children)', () => {
      const result = calculateRiesterTaxBenefit(
        3200, // contribution (must meet minimum: 80000*0.04 - 175 = 3025€)
        80000, // high gross income
        0, // no children
        [],
        2024,
        0.42, // 42% tax rate
      )

      // Allowances: 175€
      // Min contribution: 80000 * 0.04 - 175 = 3025€
      // Tax deduction: min(3200, 2100) * 0.42 = 2100 * 0.42 = 882€
      // Net benefit from deduction: 882 - 175 = 707€
      // So tax deduction is more favorable

      expect(result.allowances).toBe(175)
      expect(result.meetsMinimumContribution).toBe(true)
      expect(result.benefitMethod).toBe('tax-deduction')
      expect(result.totalBenefit).toBe(882)
      expect(result.taxDeductionAmount).toBe(2100)
      expect(result.taxSavingsFromDeduction).toBe(882)
    })

    it('should grant no benefits if minimum contribution is not met', () => {
      const result = calculateRiesterTaxBenefit(
        50, // too low contribution
        40000,
        0,
        [],
        2024,
        0.3,
      )

      // Minimum contribution: 4% * 40000 - 175 = 1425€
      // Contribution of 50€ is insufficient

      expect(result.meetsMinimumContribution).toBe(false)
      expect(result.totalBenefit).toBe(0)
      expect(result.benefitMethod).toBe('allowances')
    })

    it('should cap tax deduction at 2100€', () => {
      const result = calculateRiesterTaxBenefit(
        4000, // contribution above max (must meet minimum: 100000*0.04 - 175 = 3825€)
        100000,
        0,
        [],
        2024,
        0.42,
      )

      // Min contribution: 100000 * 0.04 - 175 = 3825€
      // Contribution is 4000€, which meets minimum
      // Max deductible is 2100€
      expect(result.maxTaxDeductible).toBe(2100)
      expect(result.meetsMinimumContribution).toBe(true)
      expect(result.taxDeductionAmount).toBe(2100)
      expect(result.taxSavingsFromDeduction).toBe(2100 * 0.42)
    })

    it('should handle edge case: exactly minimum contribution', () => {
      const grossIncome = 40000
      const allowances = 175
      const minContribution = grossIncome * 0.04 - allowances // 1425€

      const result = calculateRiesterTaxBenefit(minContribution, grossIncome, 0, [], 2024, 0.3)

      expect(result.meetsMinimumContribution).toBe(true)
      expect(result.minimumContribution).toBe(minContribution)
    })

    it('should correctly calculate for typical middle-income family scenario', () => {
      const result = calculateRiesterTaxBenefit(
        1200, // contribution
        45000, // gross income
        1, // 1 child
        [2012], // child born 2012 (300€)
        2024,
        0.3, // 30% tax rate
      )

      // Allowances: 175 + 300 = 475€
      // Min contribution: 45000 * 0.04 - 475 = 1325€
      // Contribution is 1200€, which is less than minimum

      expect(result.allowances).toBe(475)
      expect(result.minimumContribution).toBe(1325)
      expect(result.meetsMinimumContribution).toBe(false)
      expect(result.totalBenefit).toBe(0)
    })

    it('should handle scenario with child aging out', () => {
      // Child born 1999, now 25 years old
      const result = calculateRiesterTaxBenefit(1000, 40000, 1, [1999], 2024, 0.3)

      // Child is 25, so no child allowance
      expect(result.allowances).toBe(175) // Only basic allowance
    })
  })

  describe('calculateRiesterPensionTaxation', () => {
    it('should calculate full taxation (100%) of Riester pension', () => {
      const result = calculateRiesterPensionTaxation(
        1000, // gross monthly pension
        2040, // retirement year
        2040, // current year (first year)
        0.01, // 1% increase rate
        0.25, // 25% tax rate
      )

      const expectedGrossAnnual = 1000 * 12

      expect(result.grossMonthlyPension).toBe(1000)
      expect(result.grossAnnualPension).toBe(expectedGrossAnnual)
      expect(result.taxablePercentage).toBe(1.0) // 100% taxable
      expect(result.taxableAmount).toBe(expectedGrossAnnual)
      expect(result.incomeTax).toBe(expectedGrossAnnual * 0.25)
      expect(result.netAnnualPension).toBe(expectedGrossAnnual * 0.75)
    })

    it('should apply pension increases over time', () => {
      const result = calculateRiesterPensionTaxation(
        1000, // initial monthly pension
        2040, // retirement year
        2050, // 10 years later
        0.02, // 2% increase rate
        0.3,
      )

      // After 10 years with 2% increase: 1000 * 1.02^10 ≈ 1218.99
      const expectedMonthly = 1000 * Math.pow(1.02, 10)
      const expectedAnnual = expectedMonthly * 12

      expect(result.grossMonthlyPension).toBeCloseTo(expectedMonthly, 2)
      expect(result.grossAnnualPension).toBeCloseTo(expectedAnnual, 2)
      expect(result.taxableAmount).toBeCloseTo(expectedAnnual, 2)
    })

    it('should not apply increases in the first year', () => {
      const result = calculateRiesterPensionTaxation(
        1000,
        2040,
        2040, // Same year as retirement
        0.02,
        0.3,
      )

      expect(result.grossMonthlyPension).toBe(1000)
      expect(result.grossAnnualPension).toBe(12000)
    })

    it('should handle high tax rate scenario', () => {
      const result = calculateRiesterPensionTaxation(
        2000,
        2040,
        2040,
        0.01,
        0.42, // 42% tax rate
      )

      const grossAnnual = 24000
      const expectedTax = grossAnnual * 0.42

      expect(result.incomeTax).toBe(expectedTax)
      expect(result.netAnnualPension).toBe(grossAnnual - expectedTax)
    })

    it('should handle zero pension increase rate', () => {
      const result = calculateRiesterPensionTaxation(
        1500,
        2040,
        2050,
        0.0, // No increases
        0.25,
      )

      // With 0% increase, pension should stay the same
      expect(result.grossMonthlyPension).toBe(1500)
      expect(result.grossAnnualPension).toBe(18000)
    })

    it('should calculate correctly for typical retiree scenario', () => {
      const result = calculateRiesterPensionTaxation(
        800, // €800/month
        2040, // retire in 2040
        2041, // year 2041
        0.01, // 1% annual increase
        0.2, // 20% tax rate (lower in retirement)
      )

      const adjustedMonthly = 800 * 1.01
      const grossAnnual = adjustedMonthly * 12
      const tax = grossAnnual * 0.2

      expect(result.grossMonthlyPension).toBeCloseTo(adjustedMonthly, 2)
      expect(result.taxablePercentage).toBe(1.0)
      expect(result.incomeTax).toBeCloseTo(tax, 2)
    })
  })

  describe('createDefaultRiesterConfig', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultRiesterConfig()

      expect(config.enabled).toBe(false)
      expect(config.annualGrossIncome).toBe(40000)
      expect(config.annualContribution).toBe(2100)
      expect(config.numberOfChildren).toBe(0)
      expect(config.childrenBirthYears).toEqual([])
      expect(config.pensionStartYear).toBe(2040)
      expect(config.expectedMonthlyPension).toBe(800)
      expect(config.pensionIncreaseRate).toBe(0.01)
      expect(config.useWohnRiester).toBe(false)
    })

    it('should have reasonable defaults for typical user', () => {
      const config = createDefaultRiesterConfig()

      // Annual contribution should be at reasonable max
      expect(config.annualContribution).toBe(2100)

      // Income should be typical middle class
      expect(config.annualGrossIncome).toBeGreaterThan(0)
      expect(config.annualGrossIncome).toBeLessThan(100000)

      // Pension increase should be reasonable (around inflation)
      expect(config.pensionIncreaseRate).toBeGreaterThanOrEqual(0)
      expect(config.pensionIncreaseRate).toBeLessThanOrEqual(0.05)
    })
  })

  describe('Integration Scenarios', () => {
    it('should calculate realistic scenario for young professional without children', () => {
      const grossIncome = 45000
      const contribution = 1800
      const taxRate = 0.3

      const result = calculateRiesterTaxBenefit(contribution, grossIncome, 0, [], 2024, taxRate)

      // Should meet minimum contribution requirement
      expect(result.meetsMinimumContribution).toBe(true)

      // Total benefit should be positive
      expect(result.totalBenefit).toBeGreaterThan(0)
    })

    it('should calculate realistic scenario for family with two young children', () => {
      const grossIncome = 55000
      const contribution = 1500 // Contribution that meets minimum
      const taxRate = 0.35

      const result = calculateRiesterTaxBenefit(
        contribution,
        grossIncome,
        2,
        [2015, 2018], // Two young children
        2024,
        taxRate,
      )

      // Allowances: 175 + 300 + 300 = 775€
      expect(result.allowances).toBe(775)

      // Min contribution: 55000 * 0.04 - 775 = 1425€
      // Should meet minimum contribution with 1500€
      expect(result.meetsMinimumContribution).toBe(true)

      // For this scenario: tax savings = 1500 * 0.35 = 525€
      // Net benefit from deduction: 525 - 775 = -250€ (negative)
      // So allowances are more favorable
      expect(result.benefitMethod).toBe('allowances')
      expect(result.totalBenefit).toBe(result.allowances)
    })

    it('should calculate complete lifecycle: contribution phase to pension phase', () => {
      // Contribution phase (2024)
      const contributionResult = calculateRiesterTaxBenefit(2100, 50000, 1, [2010], 2024, 0.35)

      expect(contributionResult.totalBenefit).toBeGreaterThan(0)

      // Pension phase (2040-2041)
      const pensionResult = calculateRiesterPensionTaxation(
        800,
        2040,
        2041,
        0.01,
        0.25, // Lower tax rate in retirement
      )

      // Verify pension is fully taxable
      expect(pensionResult.taxablePercentage).toBe(1.0)
      expect(pensionResult.netAnnualPension).toBeLessThan(pensionResult.grossAnnualPension)
    })

    it('should handle edge case: low-income earner reaching maximum benefit', () => {
      const grossIncome = 20000
      const allowances = calculateRiesterAllowances(0, [], 2024)
      const minContribution = calculateMinimumContribution(grossIncome, allowances.totalAllowances)

      // Min contribution: 20000 * 0.04 - 175 = 625€
      const result = calculateRiesterTaxBenefit(minContribution, grossIncome, 0, [], 2024, 0.2)

      expect(result.meetsMinimumContribution).toBe(true)
      // Low tax rate means allowances should be more favorable
      expect(result.benefitMethod).toBe('allowances')
    })
  })
})
