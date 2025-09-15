import { describe, it, expect } from 'vitest'
import { calculateWithdrawal, type CalculateWithdrawalParams } from './withdrawal'
import type { SparplanElement } from '../src/utils/sparplan-utils'
import type { StatutoryPensionConfig } from './statutory-pension'
import { createDefaultStatutoryPensionConfig } from './statutory-pension'

// Helper function to create test elements
function createTestElement(endkapital: number): SparplanElement {
  return {
    type: 'sparplan',
    start: '2023-01-01',
    einzahlung: 1000,
    simulation: {
      2040: { // Last year before withdrawal
        startkapital: endkapital,
        endkapital,
        zinsen: 0,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
    },
  }
}

describe('withdrawal-statutory-pension integration', () => {
  const baseParams: CalculateWithdrawalParams = {
    elements: [createTestElement(100000)],
    startYear: 2041,
    endYear: 2043,
    strategy: '4prozent',
    returnConfig: { mode: 'fixed', fixedRate: 0.05 },
    taxRate: 0.26375,
    teilfreistellungsquote: 0.3,
    enableGrundfreibetrag: true,
    grundfreibetragPerYear: {
      2041: 12000,
      2042: 12500,
      2043: 13000,
    },
    incomeTaxRate: 25, // 25% income tax rate
  }

  it('should work without statutory pension (baseline)', () => {
    const { result } = calculateWithdrawal(baseParams)

    expect(Object.keys(result)).toHaveLength(3)
    expect(result[2041].statutoryPension).toBeUndefined()
    expect(result[2042].statutoryPension).toBeUndefined()
    expect(result[2043].statutoryPension).toBeUndefined()

    // Should have regular withdrawal calculations
    expect(result[2041].entnahme).toBeCloseTo(4000, 0) // 4% of 100000
    expect(result[2041].startkapital).toBe(100000)
  })

  it('should include statutory pension data when configured', () => {
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500, // €1500/month = €18000/year
      taxablePercentage: 80, // 80% taxable
    }

    const { result } = calculateWithdrawal({
      ...baseParams,
      statutoryPensionConfig,
    })

    // Should have statutory pension data for all years
    expect(result[2041].statutoryPension).toBeDefined()
    expect(result[2042].statutoryPension).toBeDefined()
    expect(result[2043].statutoryPension).toBeDefined()

    // Check 2041 statutory pension data
    const pension2041 = result[2041].statutoryPension!
    expect(pension2041.grossAnnualAmount).toBe(18000) // 1500 * 12
    expect(pension2041.taxableAmount).toBe(14400) // 18000 * 0.8

    // Income tax calculation: taxableAmount (14400) - grundfreibetrag (12000) = 2400 taxable
    // Tax: 2400 * 0.25 = 600
    expect(pension2041.incomeTax).toBe(600)
    expect(pension2041.netAnnualAmount).toBe(17400) // 18000 - 600
  })

  it('should apply annual increases to statutory pension', () => {
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500,
      annualIncreaseRate: 2.0, // 2% annual increase
      taxablePercentage: 80,
    }

    const { result } = calculateWithdrawal({
      ...baseParams,
      statutoryPensionConfig,
    })

    // 2041: Base amount
    expect(result[2041].statutoryPension!.grossAnnualAmount).toBe(18000)

    // 2042: 2% increase
    const expected2042 = 18000 * 1.02
    expect(result[2042].statutoryPension!.grossAnnualAmount).toBeCloseTo(expected2042, 2)

    // 2043: 4.04% total increase (1.02^2)
    const expected2043 = 18000 * Math.pow(1.02, 2)
    expect(result[2043].statutoryPension!.grossAnnualAmount).toBeCloseTo(expected2043, 2)
  })

  it('should handle different grundfreibetrag per year', () => {
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500, // €18000/year gross
      taxablePercentage: 80, // €14400/year taxable
    }

    const { result } = calculateWithdrawal({
      ...baseParams,
      statutoryPensionConfig,
      grundfreibetragPerYear: {
        2041: 10000, // More taxable income
        2042: 12000, // Less taxable income
        2043: 15000, // No tax (allowance > taxable amount)
      },
    })

    // 2041: 14400 - 10000 = 4400 taxable, tax = 4400 * 0.25 = 1100
    expect(result[2041].statutoryPension!.incomeTax).toBe(1100)

    // 2042: 14544 - 12000 = 2544 taxable, tax = 2544 * 0.25 = 636
    expect(result[2042].statutoryPension!.incomeTax).toBeCloseTo(636, 0)

    // 2043: 14690 - 15000 = 0 taxable (negative capped at 0)
    expect(result[2043].statutoryPension!.incomeTax).toBe(0)
  })

  it('should not include pension data before start year', () => {
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2042, // Starts in 2042, not 2041
      monthlyAmount: 1500,
    }

    const { result } = calculateWithdrawal({
      ...baseParams,
      statutoryPensionConfig,
    })

    // 2041: No pension yet
    expect(result[2041].statutoryPension).toBeUndefined()

    // 2042 & 2043: Pension available
    expect(result[2042].statutoryPension).toBeDefined()
    expect(result[2043].statutoryPension).toBeDefined()
    expect(result[2042].statutoryPension!.grossAnnualAmount).toBe(18000)
  })

  it('should handle disabled statutory pension', () => {
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: false, // Disabled
      startYear: 2041,
      monthlyAmount: 1500,
    }

    const { result } = calculateWithdrawal({
      ...baseParams,
      statutoryPensionConfig,
    })

    // No pension data should be included
    expect(result[2041].statutoryPension).toBeUndefined()
    expect(result[2042].statutoryPension).toBeUndefined()
    expect(result[2043].statutoryPension).toBeUndefined()
  })

  it('should work with zero income tax rate', () => {
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500,
      taxablePercentage: 80,
    }

    const { result } = calculateWithdrawal({
      ...baseParams,
      statutoryPensionConfig,
      incomeTaxRate: 0, // No income tax
    })

    // Should have zero income tax
    expect(result[2041].statutoryPension!.incomeTax).toBe(0)
    expect(result[2041].statutoryPension!.netAnnualAmount).toBe(18000) // Same as gross
  })

  it('should maintain withdrawal calculation integrity', () => {
    // Test that adding statutory pension doesn't break existing withdrawal calculations
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500,
    }

    const resultWithPension = calculateWithdrawal({
      ...baseParams,
      statutoryPensionConfig,
    })

    const resultWithoutPension = calculateWithdrawal(baseParams)

    // Core withdrawal calculations should be identical
    expect(resultWithPension.result[2041].entnahme).toBe(resultWithoutPension.result[2041].entnahme)
    expect(resultWithPension.result[2041].startkapital).toBe(resultWithoutPension.result[2041].startkapital)
    expect(resultWithPension.result[2041].endkapital).toBe(resultWithoutPension.result[2041].endkapital)
    expect(resultWithPension.result[2041].bezahlteSteuer).toBe(resultWithoutPension.result[2041].bezahlteSteuer)

    // Only difference should be the statutory pension data
    expect(resultWithPension.result[2041].statutoryPension).toBeDefined()
    expect(resultWithoutPension.result[2041].statutoryPension).toBeUndefined()
  })

  it('should work with different withdrawal strategies', () => {
    const statutoryPensionConfig: StatutoryPensionConfig = {
      ...createDefaultStatutoryPensionConfig(),
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500,
    }

    // Test with 3% rule
    const result3Percent = calculateWithdrawal({
      ...baseParams,
      strategy: '3prozent',
      statutoryPensionConfig,
    })

    // Test with variable percentage
    const resultVariable = calculateWithdrawal({
      ...baseParams,
      strategy: 'variabel_prozent',
      customPercentage: 0.035, // 3.5%
      statutoryPensionConfig,
    })

    // Both should have statutory pension data
    expect(result3Percent.result[2041].statutoryPension).toBeDefined()
    expect(resultVariable.result[2041].statutoryPension).toBeDefined()

    // Pension amounts should be identical regardless of withdrawal strategy
    expect(result3Percent.result[2041].statutoryPension!.grossAnnualAmount)
      .toBe(resultVariable.result[2041].statutoryPension!.grossAnnualAmount)
  })
})
