import { describe, it, expect } from 'vitest'
import {
  calculateRiesterAllowances,
  calculateMinimumContribution,
  calculateRiesterTaxBenefit,
  calculateRiesterPensionTaxation,
  createDefaultRiesterConfig,
  calculateWohnfoerderkontoBalance,
  calculateWohnRiesterTaxation,
  compareWohnRiesterTaxationMethods,
  type WohnfoerderkontoConfig,
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
        900,    // contribution (must meet minimum: 40000*0.04 - 775 = 825€)
        40000,  // gross income
        2,      // 2 children
        [2010, 2015], // both eligible for 300€
        2024,   // calculation year
        0.25    // 25% tax rate
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
        3200,   // contribution (must meet minimum: 80000*0.04 - 175 = 3025€)
        80000,  // high gross income
        0,      // no children
        [],
        2024,
        0.42    // 42% tax rate
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
        50,     // too low contribution
        40000,
        0,
        [],
        2024,
        0.30
      )

      // Minimum contribution: 4% * 40000 - 175 = 1425€
      // Contribution of 50€ is insufficient
      
      expect(result.meetsMinimumContribution).toBe(false)
      expect(result.totalBenefit).toBe(0)
      expect(result.benefitMethod).toBe('allowances')
    })

    it('should cap tax deduction at 2100€', () => {
      const result = calculateRiesterTaxBenefit(
        4000,   // contribution above max (must meet minimum: 100000*0.04 - 175 = 3825€)
        100000,
        0,
        [],
        2024,
        0.42
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
      
      const result = calculateRiesterTaxBenefit(
        minContribution,
        grossIncome,
        0,
        [],
        2024,
        0.30
      )

      expect(result.meetsMinimumContribution).toBe(true)
      expect(result.minimumContribution).toBe(minContribution)
    })

    it('should correctly calculate for typical middle-income family scenario', () => {
      const result = calculateRiesterTaxBenefit(
        1200,   // contribution
        45000,  // gross income
        1,      // 1 child
        [2012], // child born 2012 (300€)
        2024,
        0.30    // 30% tax rate
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
      const result = calculateRiesterTaxBenefit(
        1000,
        40000,
        1,
        [1999],
        2024,
        0.30
      )

      // Child is 25, so no child allowance
      expect(result.allowances).toBe(175) // Only basic allowance
    })
  })

  describe('calculateRiesterPensionTaxation', () => {
    it('should calculate full taxation (100%) of Riester pension', () => {
      const result = calculateRiesterPensionTaxation(
        1000,  // gross monthly pension
        2040,  // retirement year
        2040,  // current year (first year)
        0.01,  // 1% increase rate
        0.25   // 25% tax rate
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
        1000,  // initial monthly pension
        2040,  // retirement year
        2050,  // 10 years later
        0.02,  // 2% increase rate
        0.30
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
        2040,  // Same year as retirement
        0.02,
        0.30
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
        0.42  // 42% tax rate
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
        0.00,  // No increases
        0.25
      )

      // With 0% increase, pension should stay the same
      expect(result.grossMonthlyPension).toBe(1500)
      expect(result.grossAnnualPension).toBe(18000)
    })

    it('should calculate correctly for typical retiree scenario', () => {
      const result = calculateRiesterPensionTaxation(
        800,   // €800/month
        2040,  // retire in 2040
        2041,  // year 2041
        0.01,  // 1% annual increase
        0.20   // 20% tax rate (lower in retirement)
      )

      const adjustedMonthly = 800 * 1.01
      const grossAnnual = adjustedMonthly * 12
      const tax = grossAnnual * 0.20

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
      const taxRate = 0.30

      const result = calculateRiesterTaxBenefit(
        contribution,
        grossIncome,
        0,
        [],
        2024,
        taxRate
      )

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
        taxRate
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
      const contributionResult = calculateRiesterTaxBenefit(
        2100,
        50000,
        1,
        [2010],
        2024,
        0.35
      )

      expect(contributionResult.totalBenefit).toBeGreaterThan(0)

      // Pension phase (2040-2041)
      const pensionResult = calculateRiesterPensionTaxation(
        800,
        2040,
        2041,
        0.01,
        0.25  // Lower tax rate in retirement
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
      const result = calculateRiesterTaxBenefit(
        minContribution,
        grossIncome,
        0,
        [],
        2024,
        0.20
      )

      expect(result.meetsMinimumContribution).toBe(true)
      // Low tax rate means allowances should be more favorable
      expect(result.benefitMethod).toBe('allowances')
    })
  })

  describe('Wohn-Riester: calculateWohnfoerderkontoBalance', () => {
    it('should calculate balance with 2% compound interest over time', () => {
      const config: WohnfoerderkontoConfig = {
        initialWithdrawal: 50000,
        withdrawalYear: 2024,
        annualInterestRate: 0.02,
        retirementYear: 2044,
        retirementAge: 67,
      }

      const result = calculateWohnfoerderkontoBalance(config)

      // 20 years compounding: 50000 * 1.02^20
      const expected = 50000 * Math.pow(1.02, 20)

      expect(result.compoundingYears).toBe(20)
      expect(result.balanceAtRetirement).toBeCloseTo(expected, 2)
      expect(result.canUseSinglePayment).toBe(true)
    })

    it('should handle no compounding when retirement is same year as withdrawal', () => {
      const config: WohnfoerderkontoConfig = {
        initialWithdrawal: 50000,
        withdrawalYear: 2044,
        annualInterestRate: 0.02,
        retirementYear: 2044,
        retirementAge: 67,
      }

      const result = calculateWohnfoerderkontoBalance(config)

      expect(result.compoundingYears).toBe(0)
      expect(result.balanceAtRetirement).toBe(50000)
      expect(result.canUseSinglePayment).toBe(true)
    })

    it('should handle invalid scenario where retirement is before withdrawal', () => {
      const config: WohnfoerderkontoConfig = {
        initialWithdrawal: 50000,
        withdrawalYear: 2044,
        annualInterestRate: 0.02,
        retirementYear: 2040,
        retirementAge: 67,
      }

      const result = calculateWohnfoerderkontoBalance(config)

      expect(result.compoundingYears).toBe(0)
      expect(result.balanceAtRetirement).toBe(0)
      expect(result.canUseSinglePayment).toBe(false)
    })

    it('should calculate realistic 30-year scenario', () => {
      const config: WohnfoerderkontoConfig = {
        initialWithdrawal: 30000,
        withdrawalYear: 2024,
        annualInterestRate: 0.02,
        retirementYear: 2054, // 30 years later
        retirementAge: 67,
      }

      const result = calculateWohnfoerderkontoBalance(config)

      // 30 years: 30000 * 1.02^30 ≈ 54365.53
      const expected = 30000 * Math.pow(1.02, 30)

      expect(result.compoundingYears).toBe(30)
      expect(result.balanceAtRetirement).toBeCloseTo(expected, 2)
      expect(result.balanceAtRetirement).toBeGreaterThan(50000)
    })

    it('should demonstrate compounding effect with large withdrawal', () => {
      const config: WohnfoerderkontoConfig = {
        initialWithdrawal: 100000,
        withdrawalYear: 2024,
        annualInterestRate: 0.02,
        retirementYear: 2064, // 40 years
        retirementAge: 67,
      }

      const result = calculateWohnfoerderkontoBalance(config)

      // 40 years: 100000 * 1.02^40 ≈ 220804.00
      const expected = 100000 * Math.pow(1.02, 40)

      expect(result.balanceAtRetirement).toBeCloseTo(expected, 2)
      expect(result.balanceAtRetirement).toBeGreaterThan(200000)
    })
  })

  describe('Wohn-Riester: calculateWohnRiesterTaxation', () => {
    it('should calculate installment taxation correctly', () => {
      const result = calculateWohnRiesterTaxation(
        60000,  // Wohnförderkonto balance
        65,     // Retirement age
        'installments',
        0.25    // 25% tax rate
      )

      // Taxation period: 85 - 65 = 20 years
      const expectedAnnual = 60000 / 20
      const expectedTax = expectedAnnual * 0.25

      expect(result.taxationMethod).toBe('installments')
      expect(result.taxationYears).toBe(20)
      expect(result.annualTaxableAmount).toBeCloseTo(expectedAnnual, 2)
      expect(result.annualIncomeTax).toBeCloseTo(expectedTax, 2)
      expect(result.totalTaxBurden).toBeCloseTo(expectedTax * 20, 2)
    })

    it('should calculate single payment taxation with 30% discount', () => {
      const result = calculateWohnRiesterTaxation(
        60000,  // Wohnförderkonto balance
        65,     // Retirement age
        'single-payment',
        0.25    // 25% tax rate
      )

      const expectedDiscount = 60000 * 0.30
      const expectedTaxable = 60000 * 0.70
      const expectedTax = expectedTaxable * 0.25

      expect(result.taxationMethod).toBe('single-payment')
      expect(result.singlePaymentDiscount).toBe(expectedDiscount)
      expect(result.singlePaymentTaxableAmount).toBe(expectedTaxable)
      expect(result.annualIncomeTax).toBe(expectedTax)
      expect(result.totalTaxBurden).toBe(expectedTax)
    })

    it('should handle early retirement (longer taxation period)', () => {
      const result = calculateWohnRiesterTaxation(
        50000,
        60,  // Early retirement at 60
        'installments',
        0.20
      )

      // Taxation period: 85 - 60 = 25 years
      expect(result.taxationYears).toBe(25)
      expect(result.annualTaxableAmount).toBeCloseTo(50000 / 25, 2)
    })

    it('should handle late retirement (shorter taxation period)', () => {
      const result = calculateWohnRiesterTaxation(
        50000,
        70,  // Late retirement at 70
        'installments',
        0.20
      )

      // Taxation period: 85 - 70 = 15 years
      expect(result.taxationYears).toBe(15)
      expect(result.annualTaxableAmount).toBeCloseTo(50000 / 15, 2)
    })

    it('should handle edge case of retirement at 85', () => {
      const result = calculateWohnRiesterTaxation(
        50000,
        85,  // Retirement at 85
        'installments',
        0.20
      )

      // Taxation period: minimum 1 year
      expect(result.taxationYears).toBe(1)
      expect(result.annualTaxableAmount).toBe(50000)
    })

    it('should calculate correctly for high tax rate scenario', () => {
      const result = calculateWohnRiesterTaxation(
        80000,
        65,
        'installments',
        0.42  // 42% top tax rate
      )

      const annualTaxable = 80000 / 20
      const expectedTax = annualTaxable * 0.42

      expect(result.annualIncomeTax).toBeCloseTo(expectedTax, 2)
    })

    it('should demonstrate benefit of 30% single payment discount', () => {
      const balance = 60000
      const taxRate = 0.30

      // Single payment: only 70% taxed
      const singlePaymentTax = (balance * 0.70) * taxRate

      // Installments: full amount taxed over 20 years
      const installmentsTax = balance * taxRate

      expect(singlePaymentTax).toBeLessThan(installmentsTax)
      expect(singlePaymentTax).toBeCloseTo(balance * 0.70 * taxRate, 2)
    })
  })

  describe('Wohn-Riester: compareWohnRiesterTaxationMethods', () => {
    it('should compare both methods and recommend the better one', () => {
      const comparison = compareWohnRiesterTaxationMethods(
        60000,  // Balance
        65,     // Retirement age
        0.25    // Tax rate
      )

      expect(comparison.installments).toBeDefined()
      expect(comparison.singlePayment).toBeDefined()
      expect(comparison.recommendation).toBeDefined()
      expect(comparison.savingsFromBetterMethod).toBeGreaterThanOrEqual(0)

      // Should recommend method with lower total tax burden
      if (comparison.recommendation === 'single-payment') {
        expect(comparison.singlePayment.totalTaxBurden).toBeLessThanOrEqual(
          comparison.installments.totalTaxBurden
        )
      } else {
        expect(comparison.installments.totalTaxBurden).toBeLessThanOrEqual(
          comparison.singlePayment.totalTaxBurden
        )
      }
    })

    it('should recommend single payment for low tax rates', () => {
      const comparison = compareWohnRiesterTaxationMethods(
        60000,
        65,
        0.15  // Low tax rate (e.g., low income in retirement)
      )

      // Single payment with 30% discount is usually better at low tax rates
      expect(comparison.recommendation).toBe('single-payment')
      expect(comparison.savingsFromBetterMethod).toBeGreaterThan(0)
    })

    it('should compare methods for high tax rate scenario', () => {
      const comparison = compareWohnRiesterTaxationMethods(
        80000,
        65,
        0.42  // High tax rate
      )

      // Calculate expected values
      const installmentsTax = (80000 / 20) * 0.42 * 20
      const singlePaymentTax = (80000 * 0.70) * 0.42

      expect(comparison.installments.totalTaxBurden).toBeCloseTo(installmentsTax, 2)
      expect(comparison.singlePayment.totalTaxBurden).toBeCloseTo(singlePaymentTax, 2)
    })

    it('should show significant savings for optimal method choice', () => {
      const comparison = compareWohnRiesterTaxationMethods(
        100000,
        65,
        0.20
      )

      // With €100k balance, the difference between methods should be substantial
      expect(comparison.savingsFromBetterMethod).toBeGreaterThan(1000)
    })

    it('should handle early retirement scenario (age 60)', () => {
      const comparison = compareWohnRiesterTaxationMethods(
        50000,
        60,  // Early retirement
        0.25
      )

      // With longer taxation period (25 years), installments spread more thinly
      expect(comparison.installments.taxationYears).toBe(25)
      expect(comparison.recommendation).toBeDefined()
    })

    it('should handle late retirement scenario (age 70)', () => {
      const comparison = compareWohnRiesterTaxationMethods(
        50000,
        70,  // Late retirement
        0.25
      )

      // With shorter taxation period (15 years), higher annual amounts
      expect(comparison.installments.taxationYears).toBe(15)
      expect(comparison.recommendation).toBeDefined()
    })

    it('should demonstrate that 30% discount makes single payment attractive', () => {
      const comparison = compareWohnRiesterTaxationMethods(
        60000,
        65,
        0.28  // Test with 28% rate
      )

      // Single payment: 60000 * 0.70 * 0.28 = 11,760€
      // Installments: 60000 * 0.28 = 16,800€
      const expectedSinglePayment = 60000 * 0.70 * 0.28
      const expectedInstallments = 60000 * 0.28

      expect(comparison.singlePayment.totalTaxBurden).toBeCloseTo(expectedSinglePayment, 2)
      expect(comparison.installments.totalTaxBurden).toBeCloseTo(expectedInstallments, 2)
      
      // Single payment should be recommended due to 30% discount
      expect(comparison.recommendation).toBe('single-payment')
    })
  })

  describe('Wohn-Riester: Integration Scenarios', () => {
    it('should calculate complete Wohn-Riester lifecycle', () => {
      // Step 1: Withdraw €50,000 for home purchase in 2024
      const wohnfoerderkontoConfig: WohnfoerderkontoConfig = {
        initialWithdrawal: 50000,
        withdrawalYear: 2024,
        annualInterestRate: 0.02,
        retirementYear: 2054,  // 30 years later
        retirementAge: 67,
      }

      // Step 2: Calculate balance at retirement
      const balanceResult = calculateWohnfoerderkontoBalance(wohnfoerderkontoConfig)
      expect(balanceResult.compoundingYears).toBe(30)
      expect(balanceResult.balanceAtRetirement).toBeGreaterThan(80000)

      // Step 3: Compare taxation methods
      const comparison = compareWohnRiesterTaxationMethods(
        balanceResult.balanceAtRetirement,
        67,
        0.25
      )

      expect(comparison.recommendation).toBeDefined()
      expect(comparison.savingsFromBetterMethod).toBeGreaterThan(0)
    })

    it('should demonstrate realistic first-time homebuyer scenario', () => {
      // Young couple uses €40,000 Riester savings for home purchase
      const config: WohnfoerderkontoConfig = {
        initialWithdrawal: 40000,
        withdrawalYear: 2024,
        annualInterestRate: 0.02,
        retirementYear: 2059,  // 35 years until retirement
        retirementAge: 67,
      }

      const balance = calculateWohnfoerderkontoBalance(config)
      
      // After 35 years of 2% compounding
      const expected = 40000 * Math.pow(1.02, 35)
      expect(balance.balanceAtRetirement).toBeCloseTo(expected, 2)

      // Compare taxation methods with typical retirement tax rate
      const comparison = compareWohnRiesterTaxationMethods(
        balance.balanceAtRetirement,
        67,
        0.20  // Lower tax rate in retirement
      )

      // Single payment should be attractive with 30% discount at low tax rate
      expect(comparison.recommendation).toBe('single-payment')
    })

    it('should handle large withdrawal for expensive property', () => {
      const config: WohnfoerderkontoConfig = {
        initialWithdrawal: 100000,  // Large withdrawal
        withdrawalYear: 2024,
        annualInterestRate: 0.02,
        retirementYear: 2049,  // 25 years
        retirementAge: 67,
      }

      const balance = calculateWohnfoerderkontoBalance(config)
      expect(balance.balanceAtRetirement).toBeGreaterThan(150000)

      const comparison = compareWohnRiesterTaxationMethods(
        balance.balanceAtRetirement,
        67,
        0.30  // Higher income in retirement
      )

      // Savings should be substantial with large amounts
      expect(comparison.savingsFromBetterMethod).toBeGreaterThan(5000)
    })

    it('should demonstrate compounding effect over different time periods', () => {
      const initialAmount = 50000

      // Scenario 1: Short period (10 years)
      const short = calculateWohnfoerderkontoBalance({
        initialWithdrawal: initialAmount,
        withdrawalYear: 2024,
        annualInterestRate: 0.02,
        retirementYear: 2034,
        retirementAge: 67,
      })

      // Scenario 2: Medium period (20 years)
      const medium = calculateWohnfoerderkontoBalance({
        initialWithdrawal: initialAmount,
        withdrawalYear: 2024,
        annualInterestRate: 0.02,
        retirementYear: 2044,
        retirementAge: 67,
      })

      // Scenario 3: Long period (40 years)
      const long = calculateWohnfoerderkontoBalance({
        initialWithdrawal: initialAmount,
        withdrawalYear: 2024,
        annualInterestRate: 0.02,
        retirementYear: 2064,
        retirementAge: 67,
      })

      // Balance should increase with longer periods
      expect(medium.balanceAtRetirement).toBeGreaterThan(short.balanceAtRetirement)
      expect(long.balanceAtRetirement).toBeGreaterThan(medium.balanceAtRetirement)

      // Long period should more than double the initial amount
      expect(long.balanceAtRetirement).toBeGreaterThan(initialAmount * 2)
    })

    it('should compare regular Riester vs Wohn-Riester tax implications', () => {
      // Regular Riester: Pension is 100% taxable annually
      const regularRiesterTax = calculateRiesterPensionTaxation(
        800,    // €800/month pension
        2040,
        2040,
        0.01,
        0.25
      )

      // Wohn-Riester: Wohnförderkonto taxation
      const wohnRiesterTax = calculateWohnRiesterTaxation(
        50000,  // Balance in Wohnförderkonto
        67,
        'single-payment',
        0.25
      )

      // Both should result in tax payments
      expect(regularRiesterTax.incomeTax).toBeGreaterThan(0)
      expect(wohnRiesterTax.annualIncomeTax).toBeGreaterThan(0)

      // Wohn-Riester single payment benefits from 30% discount
      expect(wohnRiesterTax.singlePaymentDiscount).toBe(50000 * 0.30)
    })
  })
})
