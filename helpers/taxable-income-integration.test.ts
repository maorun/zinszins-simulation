import { describe, it, expect } from 'vitest'
import { calculateWithdrawal } from './withdrawal'
import type { SparplanElement } from '../src/utils/sparplan-utils'
import { createDefaultStatutoryPensionConfig, type StatutoryPensionConfig } from './statutory-pension'
import type { OtherIncomeConfiguration, OtherIncomeSource } from './other-income'
import { createDefaultHealthCareInsuranceConfig, type HealthCareInsuranceConfig } from './health-care-insurance'

describe('Centralized Taxable Income Calculation', () => {
  // Helper function to create test elements
  const createTestElements = (): SparplanElement[] => baseElements

  const baseElements: SparplanElement[] = [
    {
      start: new Date('2020-01-01'),
      type: 'sparplan',
      einzahlung: 0,
      simulation: {
        2040: {
          endkapital: 100000,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          zinsen: 0,
          startkapital: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      },
    },
  ]

  const baseParams = {
    elements: baseElements,
    startYear: 2041,
    endYear: 2041,
    strategy: '4prozent' as const,
    returnConfig: { mode: 'fixed' as const, fixedRate: 0.05 },
    taxRate: 0.26375,
    teilfreistellungsquote: 0.3,
    enableGrundfreibetrag: true,
    grundfreibetragPerYear: {
      2041: 12000,
    },
    incomeTaxRate: 25, // 25% income tax rate
  }

  it('should calculate income tax only on portfolio withdrawal when no other income sources', () => {
    const { result } = calculateWithdrawal(baseParams)

    // Only portfolio withdrawal income tax
    const portfolioWithdrawal = result[2041].entnahme
    const expectedTaxableIncome = portfolioWithdrawal - 12000 // Grundfreibetrag
    const expectedTax = Math.max(0, expectedTaxableIncome) * 0.25

    expect(result[2041].einkommensteuer).toBe(expectedTax)
    expect(result[2041].statutoryPension).toBeUndefined()
    expect(result[2041].otherIncome).toBeUndefined()
  })

  it('should calculate combined income tax with statutory pension', () => {
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500, // €1500/month = €18000/year
      taxablePercentage: 80, // 80% taxable = €14400
    }

    const { result } = calculateWithdrawal({
      ...baseParams,
      statutoryPensionConfig,
    })

    const portfolioWithdrawal = result[2041].entnahme
    const pensionTaxableAmount = result[2041].statutoryPension!.taxableAmount
    const totalTaxableIncome = portfolioWithdrawal + pensionTaxableAmount
    const expectedTaxableAfterGrundfreibetrag = Math.max(0, totalTaxableIncome - 12000)
    const expectedTax = expectedTaxableAfterGrundfreibetrag * 0.25

    expect(result[2041].einkommensteuer).toBe(expectedTax)
    expect(result[2041].statutoryPension!.incomeTax).toBe(0) // No individual tax
    expect(result[2041].statutoryPension!.netAnnualAmount).toBe(18000) // Gross amount
    expect(pensionTaxableAmount).toBe(14400) // 18000 * 0.8
  })

  it('should calculate combined income tax with other income sources', () => {
    const otherIncomeConfig: OtherIncomeConfiguration = {
      enabled: true,
      sources: [
        {
          id: 'rental',
          name: 'Rental Income',
          type: 'rental',
          amountType: 'gross',
          monthlyAmount: 800, // €800/month = €9600/year
          startYear: 2041,
          endYear: null,
          inflationRate: 2,
          taxRate: 25, // This tax rate is not used in centralized calculation
          enabled: true,
        } as OtherIncomeSource,
      ],
    }

    const { result } = calculateWithdrawal({
      ...baseParams,
      otherIncomeConfig,
    })

    const portfolioWithdrawal = result[2041].entnahme
    const otherIncomeGrossAmount = 9600 // €800 * 12
    const totalTaxableIncome = portfolioWithdrawal + otherIncomeGrossAmount
    const expectedTaxableAfterGrundfreibetrag = Math.max(0, totalTaxableIncome - 12000)
    const expectedTax = expectedTaxableAfterGrundfreibetrag * 0.25

    expect(result[2041].einkommensteuer).toBe(expectedTax)
    expect(result[2041].otherIncome).toBeDefined()
    expect(result[2041].otherIncome!.sourceCount).toBe(1)
  })

  it('should calculate combined income tax with all income sources', () => {
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1200, // €1200/month = €14400/year
      taxablePercentage: 85, // 85% taxable = €12240
    }

    const otherIncomeConfig: OtherIncomeConfiguration = {
      enabled: true,
      sources: [
        {
          id: 'rental',
          name: 'Rental Income',
          type: 'rental',
          amountType: 'gross',
          monthlyAmount: 600, // €600/month = €7200/year
          startYear: 2041,
          endYear: null,
          inflationRate: 2,
          taxRate: 25,
          enabled: true,
        } as OtherIncomeSource,
        {
          id: 'business',
          name: 'Side Business',
          type: 'business',
          amountType: 'gross',
          monthlyAmount: 400, // €400/month = €4800/year
          startYear: 2041,
          endYear: null,
          inflationRate: 3,
          taxRate: 30,
          enabled: true,
        } as OtherIncomeSource,
      ],
    }

    const { result } = calculateWithdrawal({
      ...baseParams,
      statutoryPensionConfig,
      otherIncomeConfig,
    })

    const portfolioWithdrawal = result[2041].entnahme
    const pensionTaxableAmount = result[2041].statutoryPension!.taxableAmount
    const otherIncomeGrossAmount = 7200 + 4800 // Rental + Business
    const totalTaxableIncome = portfolioWithdrawal + pensionTaxableAmount + otherIncomeGrossAmount
    const expectedTaxableAfterGrundfreibetrag = Math.max(0, totalTaxableIncome - 12000)
    const expectedTax = expectedTaxableAfterGrundfreibetrag * 0.25

    expect(result[2041].einkommensteuer).toBe(expectedTax)
    expect(result[2041].statutoryPension!.incomeTax).toBe(0) // No individual tax
    expect(result[2041].otherIncome!.sourceCount).toBe(2)
    expect(pensionTaxableAmount).toBe(12240) // 14400 * 0.85
  })

  it('should apply Grundfreibetrag correctly when total income is below threshold', () => {
    // Use very small amounts to test Grundfreibetrag application
    const testElements: SparplanElement[] = [
      {
        start: new Date('2020-01-01'),
        type: 'sparplan',
        einzahlung: 0,
        simulation: {
          2040: {
            endkapital: 25000,
            bezahlteSteuer: 0,
            genutzterFreibetrag: 0,
            zinsen: 0,
            startkapital: 0,
            vorabpauschale: 0,
            vorabpauschaleAccumulated: 0,
          }, // 4% = 1000
        },
      },
    ]

    const smallStatutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2041,
      monthlyAmount: 600, // €600/month = €7200/year
      taxablePercentage: 80, // 80% taxable = €5760
    }

    const { result } = calculateWithdrawal({
      ...baseParams,
      elements: testElements,
      statutoryPensionConfig: smallStatutoryPensionConfig,
      grundfreibetragPerYear: {
        2041: 10000, // High Grundfreibetrag
      },
    })

    const portfolioWithdrawal = result[2041].entnahme // ~1000
    const pensionTaxableAmount = result[2041].statutoryPension!.taxableAmount // 5760
    const totalTaxableIncome = portfolioWithdrawal + pensionTaxableAmount // ~6760

    // Total income (~6760) is below Grundfreibetrag (10000), so no tax
    expect(totalTaxableIncome).toBeLessThan(10000)
    expect(result[2041].einkommensteuer).toBe(0)
    expect(result[2041].genutzterGrundfreibetrag).toBe(totalTaxableIncome)
  })

  it('should handle different Grundfreibetrag amounts correctly', () => {
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1000, // €1000/month = €12000/year
      taxablePercentage: 80, // 80% taxable = €9600
    }

    // Test with different Grundfreibetrag amounts
    const scenarios = [
      { grundfreibetrag: 5000, expectedMinTax: 2000 }, // Higher tax
      { grundfreibetrag: 15000, expectedMaxTax: 1000 }, // Lower tax
      { grundfreibetrag: 20000, expectedTax: 0 }, // No tax
    ]

    scenarios.forEach((scenario) => {
      const { result } = calculateWithdrawal({
        ...baseParams,
        statutoryPensionConfig,
        grundfreibetragPerYear: {
          2041: scenario.grundfreibetrag,
        },
      })

      const portfolioWithdrawal = result[2041].entnahme
      const pensionTaxableAmount = result[2041].statutoryPension!.taxableAmount
      const totalTaxableIncome = portfolioWithdrawal + pensionTaxableAmount
      const expectedTaxableAfterGrundfreibetrag = Math.max(0, totalTaxableIncome - scenario.grundfreibetrag)
      const expectedTax = expectedTaxableAfterGrundfreibetrag * 0.25

      expect(result[2041].einkommensteuer).toBe(expectedTax)

      if (scenario.expectedTax !== undefined) {
        expect(result[2041].einkommensteuer).toBe(scenario.expectedTax)
      } else if (scenario.expectedMinTax !== undefined) {
        expect(result[2041].einkommensteuer).toBeGreaterThan(scenario.expectedMinTax)
      } else if (scenario.expectedMaxTax !== undefined) {
        expect(result[2041].einkommensteuer).toBeLessThan(scenario.expectedMaxTax)
      }
    })
  })

  it('should deduct health care insurance contributions from taxable income', () => {
    const healthCareInsuranceConfig: HealthCareInsuranceConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      enabled: true,
      insuranceType: 'statutory',
      statutoryHealthInsuranceRate: 14.6,
      statutoryCareInsuranceRate: 3.05,
      statutoryMinimumIncomeBase: 12000,
      statutoryMaximumIncomeBase: 60000,
      retirementStartYear: 2041,
      includeEmployerContribution: false, // Only employee portion in retirement
    }

    const { result } = calculateWithdrawal({
      elements: createTestElements(),
      startYear: 2041,
      endYear: 2041,
      strategy: '4prozent',
      returnConfig: { mode: 'fixed', fixedRate: 0.05 },
      healthCareInsuranceConfig,
      enableGrundfreibetrag: true,
      grundfreibetragPerYear: { 2041: 12000 },
      incomeTaxRate: 25,
      birthYear: 1973,
    })

    const portfolioWithdrawal = result[2041].entnahme
    const healthCareTotal = result[2041].healthCareInsurance!.totalAnnual
    const expectedTaxableIncome = portfolioWithdrawal - healthCareTotal // Health insurance is deductible
    const expectedTaxableAfterGrundfreibetrag = Math.max(0, expectedTaxableIncome - 12000)
    const expectedTax = expectedTaxableAfterGrundfreibetrag * 0.25

    expect(result[2041].healthCareInsurance).toBeDefined()
    expect(result[2041].healthCareInsurance!.totalAnnual).toBeGreaterThan(0)
    expect(result[2041].einkommensteuer).toBe(expectedTax)
    expect(result[2041].taxableIncome).toBe(expectedTaxableAfterGrundfreibetrag)

    // Verify that health insurance contributions are properly deducted from taxable income
    // The actual taxable income should be lower due to health insurance deduction
    const taxableIncomeWithoutDeduction = Math.max(0, portfolioWithdrawal - 12000)
    const actualTaxableIncome = result[2041].taxableIncome || 0
    expect(actualTaxableIncome).toBeLessThanOrEqual(taxableIncomeWithoutDeduction)
  })
})
