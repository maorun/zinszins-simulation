import { describe, test, expect } from 'vitest'
import { calculateWithdrawal } from './withdrawal'
import type { SparplanElement } from '../src/utils/sparplan-utils'
import type { ReturnConfiguration } from '../src/utils/random-returns'
import { getBasiszinsForYear, calculateVorabpauschale, calculateSteuerOnVorabpauschale } from './steuer'

// Helper to create mock SparplanElement data
const createMockElement = (
  startYear: number, // The year the investment was made
  einzahlung: number,
  finalValueBeforeWithdrawal: number, // The value at the end of the last simulation year
  vorabpauschaleAccumulated: number,
  lastSimYear: number, // The year for which to create the simulation data
): SparplanElement => ({
  start: new Date(`${startYear}-01-01`).toISOString(),
  type: 'sparplan',
  einzahlung: einzahlung,
  simulation: {
    [lastSimYear]: {
      startkapital: einzahlung,
      endkapital: finalValueBeforeWithdrawal,
      zinsen: 0,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: vorabpauschaleAccumulated, // For simplicity, assume last year's vorab = total accumulated
      vorabpauschaleAccumulated: vorabpauschaleAccumulated,
    },
  },
})

describe('Withdrawal Calculations with FIFO', () => {
  const taxRate = 0.26375
  const teilfreistellungsquote = 0.3
  const freibetrag = 1000
  const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 } // 5% return

  test('should correctly calculate taxes for a partial withdrawal from the oldest layer', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1

    const mockElements: SparplanElement[] = [
      createMockElement(2023, 10000, 12000, 100, lastSimYear),
      createMockElement(2024, 5000, 6000, 50, lastSimYear),
    ]

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear, // end year
      strategy: '4prozent', // This strategy results in a 720 withdrawal amount
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    const initialCapital = 12000 + 6000
    const entnahme = initialCapital * 0.04 // 18000 * 0.04 = 720
    expect(resultYear.entnahme).toBeCloseTo(entnahme)

    const proportionSold = entnahme / 12000
    const costBasisSold = 10000 * proportionSold
    // Fix: Use correct FIFO calculation - only subtract cost basis, not accumulated Vorabpauschale
    const expectedGain = entnahme - costBasisSold
    const expectedTaxableGain = expectedGain * (1 - teilfreistellungsquote)
    const expectedTaxOnGains = Math.max(0, expectedTaxableGain - freibetrag) * taxRate
    const freibetragUsedOnGains = Math.min(expectedTaxableGain, freibetrag)
    const remainingFreibetrag = freibetrag - freibetragUsedOnGains
    const basiszins = getBasiszinsForYear(withdrawalStartYear)
    // Calculate Vorabpauschale using values BEFORE withdrawal (corrected logic)
    const l1_val_before_withdrawal = 12000 // Full value at start of year
    const l1_val_after_growth_before_withdrawal = l1_val_before_withdrawal * (1 + returnConfig.fixedRate!)
    const l1_vorab = calculateVorabpauschale(l1_val_before_withdrawal, l1_val_after_growth_before_withdrawal, basiszins)
    const l1_tax_potential = calculateSteuerOnVorabpauschale(l1_vorab, taxRate, teilfreistellungsquote)
    const l2_val_before_withdrawal = 6000 // Full value at start of year
    const l2_val_after_growth_before_withdrawal = l2_val_before_withdrawal * (1 + returnConfig.fixedRate!)
    const l2_vorab = calculateVorabpauschale(l2_val_before_withdrawal, l2_val_after_growth_before_withdrawal, basiszins)
    const l2_tax_potential = calculateSteuerOnVorabpauschale(l2_vorab, taxRate, teilfreistellungsquote)
    const totalPotentialVorabTax = l1_tax_potential + l2_tax_potential
    const expectedTaxOnVorabpauschale = Math.max(0, totalPotentialVorabTax - remainingFreibetrag)
    const totalExpectedTax = expectedTaxOnGains + expectedTaxOnVorabpauschale
    expect(resultYear.bezahlteSteuer).toBeCloseTo(totalExpectedTax)
  })

  test('should calculate Vorabpauschale based on portfolio value BEFORE withdrawal, not after', () => {
    // This test specifically verifies the fix for the tax calculation timing issue
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1

    // Create a single layer with known values
    const mockElements: SparplanElement[] = [
      createMockElement(2023, 100000, 120000, 1000, lastSimYear), // 120k value, 100k cost basis, 1k accumulated vorab
    ]

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: '4prozent', // Will withdraw 4800 (4% of 120k)
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    const entnahme = 120000 * 0.04 // 4800
    expect(resultYear.entnahme).toBeCloseTo(entnahme)

    // VERIFY: Vorabpauschale should be calculated on FULL 120k value, not on 115.2k (120k - 4.8k)
    const basiszins = getBasiszinsForYear(withdrawalStartYear)
    const fullValueBeforeWithdrawal = 120000
    const fullValueAfterGrowthBeforeWithdrawal = fullValueBeforeWithdrawal * (1 + returnConfig.fixedRate!)
    const expectedVorabpauschale = calculateVorabpauschale(
      fullValueBeforeWithdrawal,
      fullValueAfterGrowthBeforeWithdrawal,
      basiszins,
    )
    const expectedVorabTax = calculateSteuerOnVorabpauschale(expectedVorabpauschale, taxRate, teilfreistellungsquote)

    // Calculate realized gain from withdrawal (FIFO)
    const costBasisSold = 100000 * (entnahme / 120000) // Proportional cost basis sold
    const accumVorabSold = 1000 * (entnahme / 120000) // Proportional accumulated vorab sold
    const realizedGain = entnahme - costBasisSold - accumVorabSold
    const taxableRealizedGain = realizedGain * (1 - teilfreistellungsquote)
    const taxOnRealizedGains = Math.max(0, taxableRealizedGain - freibetrag) * taxRate
    const freibetragUsedOnGains = Math.min(taxableRealizedGain, freibetrag)
    const remainingFreibetrag = freibetrag - freibetragUsedOnGains

    // Apply remaining freibetrag to vorab tax
    const finalVorabTax = Math.max(0, expectedVorabTax - remainingFreibetrag)
    const totalExpectedTax = taxOnRealizedGains + finalVorabTax

    expect(resultYear.bezahlteSteuer).toBeCloseTo(totalExpectedTax)

    // The key verification: if calculated correctly, this should produce a higher tax
    // than if calculated on post-withdrawal value (115.2k instead of 120k)
    const incorrectValueAfterWithdrawal = 120000 - entnahme // 115200
    const incorrectValueAfterGrowth = incorrectValueAfterWithdrawal * (1 + returnConfig.fixedRate!)
    const incorrectVorabpauschale = calculateVorabpauschale(
      incorrectValueAfterWithdrawal,
      incorrectValueAfterGrowth,
      basiszins,
    )

    // Vorabpauschale calculated on full portfolio should be higher than on reduced portfolio
    expect(expectedVorabpauschale).toBeGreaterThan(incorrectVorabpauschale)
  })

  test('should apply inflation to withdrawal amount', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 1, // 2 years
      strategy: '4prozent',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag, [withdrawalStartYear + 1]: freibetrag },
      inflationConfig: { inflationRate: 0.10 }, // 10% inflation for easy testing
    })

    const entnahme1 = result[withdrawalStartYear].entnahme
    const entnahme2 = result[withdrawalStartYear + 1].entnahme

    expect(entnahme2).toBeCloseTo(entnahme1 * 1.10)
  })

  test('should apply Grundfreibetrag and income tax', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]
    const incomeTaxRate = 0.25
    const yearlyGrundfreibetrag = 10000

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: '4prozent',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      enableGrundfreibetrag: true,
      grundfreibetragPerYear: { [withdrawalStartYear]: yearlyGrundfreibetrag },
      incomeTaxRate,
    })

    const resultYear = result[withdrawalStartYear]
    const entnahme = resultYear.entnahme

    const expectedEinkommensteuer = Math.max(0, (entnahme - yearlyGrundfreibetrag)) * incomeTaxRate
    const expectedGenutzterGrundfreibetrag = Math.min(entnahme, yearlyGrundfreibetrag)

    expect(resultYear.einkommensteuer).toBe(expectedEinkommensteuer)
    expect(resultYear.genutzterGrundfreibetrag).toBe(expectedGenutzterGrundfreibetrag)
    expect(resultYear.bezahlteSteuer).toBeGreaterThanOrEqual(expectedEinkommensteuer)
  })

  test('should return correct monthly withdrawal for "monatlich_fest" strategy', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 500000, 600000, 1000, lastSimYear)]
    const monthlyAmount = 2000

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear, // end year
      strategy: 'monatlich_fest',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      monthlyConfig: { monthlyAmount },
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()
    expect(resultYear.monatlicheEntnahme).toBe(monthlyAmount)
    expect(resultYear.entnahme).toBe(monthlyAmount * 12)
  })

  test('should adjust monthly withdrawal for inflation', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 500000, 600000, 1000, lastSimYear)]
    const monthlyAmount = 2000
    const inflationRate = 0.10 // 10%

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 1, // 2 years
      strategy: 'monatlich_fest',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag, [withdrawalStartYear + 1]: freibetrag },
      monthlyConfig: { monthlyAmount },
      inflationConfig: { inflationRate },
    })

    const resultYear1 = result[withdrawalStartYear]
    const resultYear2 = result[withdrawalStartYear + 1]
    expect(resultYear1.monatlicheEntnahme).toBe(monthlyAmount)
    expect(resultYear2.monatlicheEntnahme).toBeCloseTo(monthlyAmount * (1 + inflationRate))
  })
})

describe('Dynamic Withdrawal Strategy', () => {
  const taxRate = 0.26375
  const teilfreistellungsquote = 0.3
  const freibetrag = 1000

  test('should adjust withdrawal up when return exceeds upper threshold', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const dynamicConfig = {
      baseWithdrawalRate: 0.04, // 4% base rate
      upperThresholdReturn: 0.08, // 8% upper threshold
      upperThresholdAdjustment: 0.05, // 5% increase when exceeding
      lowerThresholdReturn: 0.02, // 2% lower threshold
      lowerThresholdAdjustment: -0.05, // 5% decrease when below
    }

    // Create return config with high return that exceeds upper threshold
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          [withdrawalStartYear - 1]: 0.10, // 10% return in previous year (exceeds 8% threshold)
          [withdrawalStartYear]: 0.05, // 5% return in current year
        },
      },
    }

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: 'dynamisch',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      dynamicConfig,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    const baseWithdrawal = 120000 * 0.04 // 4800
    const expectedAdjustment = baseWithdrawal * 0.05 // 240 (5% increase)
    const expectedEntnahme = baseWithdrawal + expectedAdjustment // 5040

    expect(resultYear.entnahme).toBeCloseTo(expectedEntnahme)
    expect(resultYear.dynamischeAnpassung).toBeCloseTo(expectedAdjustment)
    expect(resultYear.vorjahresRendite).toBe(0.10)
  })

  test('should adjust withdrawal down when return falls below lower threshold', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const dynamicConfig = {
      baseWithdrawalRate: 0.04, // 4% base rate
      upperThresholdReturn: 0.08, // 8% upper threshold
      upperThresholdAdjustment: 0.05, // 5% increase when exceeding
      lowerThresholdReturn: 0.02, // 2% lower threshold
      lowerThresholdAdjustment: -0.05, // 5% decrease when below
    }

    // Create return config with low return that falls below lower threshold
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          [withdrawalStartYear - 1]: 0.01, // 1% return in previous year (below 2% threshold)
          [withdrawalStartYear]: 0.05, // 5% return in current year
        },
      },
    }

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: 'dynamisch',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      dynamicConfig,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    const baseWithdrawal = 120000 * 0.04 // 4800
    const expectedAdjustment = baseWithdrawal * -0.05 // -240 (5% decrease)
    const expectedEntnahme = baseWithdrawal + expectedAdjustment // 4560

    expect(resultYear.entnahme).toBeCloseTo(expectedEntnahme)
    expect(resultYear.dynamischeAnpassung).toBeCloseTo(expectedAdjustment)
    expect(resultYear.vorjahresRendite).toBe(0.01)
  })

  test('should not adjust withdrawal when return is between thresholds', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const dynamicConfig = {
      baseWithdrawalRate: 0.04, // 4% base rate
      upperThresholdReturn: 0.08, // 8% upper threshold
      upperThresholdAdjustment: 0.05, // 5% increase when exceeding
      lowerThresholdReturn: 0.02, // 2% lower threshold
      lowerThresholdAdjustment: -0.05, // 5% decrease when below
    }

    // Create return config with return between thresholds
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          [withdrawalStartYear - 1]: 0.05, // 5% return in previous year (between 2% and 8%)
          [withdrawalStartYear]: 0.05, // 5% return in current year
        },
      },
    }

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: 'dynamisch',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      dynamicConfig,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    const baseWithdrawal = 120000 * 0.04 // 4800
    const expectedAdjustment = 0 // No adjustment between thresholds
    const expectedEntnahme = baseWithdrawal // 4800

    expect(resultYear.entnahme).toBeCloseTo(expectedEntnahme)
    expect(resultYear.dynamischeAnpassung).toBe(expectedAdjustment)
    expect(resultYear.vorjahresRendite).toBe(0.05)
  })

  test('should not apply dynamic adjustment in first year (no previous year data)', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const dynamicConfig = {
      baseWithdrawalRate: 0.04, // 4% base rate
      upperThresholdReturn: 0.08, // 8% upper threshold
      upperThresholdAdjustment: 0.05, // 5% increase when exceeding
      lowerThresholdReturn: 0.02, // 2% lower threshold
      lowerThresholdAdjustment: -0.05, // 5% decrease when below
    }

    const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear, // Only one year
      strategy: 'dynamisch',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      dynamicConfig,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    const baseWithdrawal = 120000 * 0.04 // 4800
    // Since previous year return (5%) is between thresholds (2% and 8%), no adjustment
    expect(resultYear.entnahme).toBeCloseTo(baseWithdrawal)
    expect(resultYear.dynamischeAnpassung).toBe(0) // No adjustment between thresholds
    expect(resultYear.vorjahresRendite).toBe(0.05) // Previous year return rate available with fixed rate
  })

  test('should combine dynamic adjustment with inflation', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const dynamicConfig = {
      baseWithdrawalRate: 0.04, // 4% base rate
      upperThresholdReturn: 0.08, // 8% upper threshold
      upperThresholdAdjustment: 0.05, // 5% increase when exceeding
      lowerThresholdReturn: 0.02, // 2% lower threshold
      lowerThresholdAdjustment: -0.05, // 5% decrease when below
    }

    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          [withdrawalStartYear - 1]: 0.10, // 10% return in previous year (exceeds threshold)
          [withdrawalStartYear]: 0.05, // 5% return in current year
          [withdrawalStartYear + 1]: 0.05, // 5% return in next year
        },
      },
    }

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 1, // Two years
      strategy: 'dynamisch',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: {
        [withdrawalStartYear]: freibetrag,
        [withdrawalStartYear + 1]: freibetrag,
      },
      dynamicConfig,
      inflationConfig: { inflationRate: 0.02 }, // 2% inflation
    })

    const resultYear1 = result[withdrawalStartYear]
    const resultYear2 = result[withdrawalStartYear + 1]

    // Year 1: Dynamic adjustment based on previous 10% return
    const baseWithdrawal = 120000 * 0.04 // 4800
    const dynamicAdjustment1 = baseWithdrawal * 0.05 // 240 (5% increase)
    const expectedEntnahme1 = baseWithdrawal + dynamicAdjustment1 // 5040

    expect(resultYear1.entnahme).toBeCloseTo(expectedEntnahme1)
    expect(resultYear1.dynamischeAnpassung).toBeCloseTo(dynamicAdjustment1)

    // Year 2: Should have both inflation adjustment and dynamic adjustment
    // Inflation: base = 4800, with 2% inflation after 1 year = 4800 * 0.02 = 96
    // Dynamic: previous year return = 5%, no adjustment (between thresholds)
    const inflationAdjustment = baseWithdrawal * 0.02 // 96
    const baseWithInflation = baseWithdrawal + inflationAdjustment // 4896
    const dynamicAdjustment2 = 0 // No adjustment for 5% return
    const expectedEntnahme2 = baseWithInflation + dynamicAdjustment2 // 4896

    expect(resultYear2.entnahme).toBeCloseTo(expectedEntnahme2)
    expect(resultYear2.dynamischeAnpassung).toBe(dynamicAdjustment2)
    expect(resultYear2.vorjahresRendite).toBe(0.05)
  })
})

describe('Withdrawal Frequency Tests', () => {
  const taxRate = 0.26375
  const teilfreistellungsquote = 0.3
  const freibetrag = 1000
  const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 } // 5% return

  test('should have realistic difference between yearly and monthly withdrawal frequencies', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 500000, 600000, 1000, lastSimYear)]

    // Test yearly withdrawal
    const { result: yearlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)), // Deep copy
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 10, // 10 years
      strategy: '4prozent',
      withdrawalFrequency: 'yearly',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: Array.from({ length: 11 }, (_, i) => ({
        [withdrawalStartYear + i]: freibetrag,
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    })

    // Test monthly withdrawal
    const { result: monthlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)), // Deep copy
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 10, // 10 years
      strategy: '4prozent',
      withdrawalFrequency: 'monthly',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: Array.from({ length: 11 }, (_, i) => ({
        [withdrawalStartYear + i]: freibetrag,
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {}),
    })

    const lastYear = withdrawalStartYear + 10
    const yearlyFinalCapital = yearlyResult[lastYear]?.endkapital || 0
    const monthlyFinalCapital = monthlyResult[lastYear]?.endkapital || 0

    // Monthly withdrawals should result in higher final capital, but not dramatically so
    expect(monthlyFinalCapital).toBeGreaterThan(yearlyFinalCapital)

    // The difference should be realistic - typically 1-5% advantage for monthly withdrawals
    const improvementRatio = monthlyFinalCapital / yearlyFinalCapital
    expect(improvementRatio).toBeGreaterThan(1.01) // At least 1% improvement
    expect(improvementRatio).toBeLessThan(1.08) // Less than 8% improvement
  })

  test('should calculate same annual withdrawal amounts for both frequencies', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 500000, 600000, 1000, lastSimYear)]

    const { result: yearlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)),
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: '4prozent',
      withdrawalFrequency: 'yearly',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
    })

    const { result: monthlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)),
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: '4prozent',
      withdrawalFrequency: 'monthly',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
    })

    // Annual withdrawal amounts should be the same regardless of frequency
    expect(yearlyResult[withdrawalStartYear].entnahme).toBe(monthlyResult[withdrawalStartYear].entnahme)
  })

  test('should show monthly amounts only for monthly frequency with non-fixed strategies', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 500000, 600000, 1000, lastSimYear)]

    const { result: yearlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)),
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: '4prozent',
      withdrawalFrequency: 'yearly',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
    })

    const { result: monthlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)),
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: '4prozent',
      withdrawalFrequency: 'monthly',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
    })

    // Yearly frequency should not show monthly amounts for non-fixed strategies
    expect(yearlyResult[withdrawalStartYear].monatlicheEntnahme).toBeUndefined()

    // Monthly frequency should show monthly amounts
    expect(monthlyResult[withdrawalStartYear].monatlicheEntnahme).toBeDefined()
    expect(monthlyResult[withdrawalStartYear].monatlicheEntnahme).toBeCloseTo(
      monthlyResult[withdrawalStartYear].entnahme / 12,
    )
  })
})

describe('Bucket Strategy Tests', () => {
  const taxRate = 0.26375
  const teilfreistellungsquote = 0.3
  const freibetrag = 1000

  test('should use portfolio for withdrawal in positive return years', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const bucketConfig = {
      initialCashCushion: 10000, // €10,000 initial cash
      refillThreshold: 1000, // Refill when gains exceed €1,000
      refillPercentage: 0.5, // Move 50% of excess gains to cash
      baseWithdrawalRate: 0.04, // 4% withdrawal rate
    }

    const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 } // 5% positive return

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: 'bucket_strategie',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      bucketConfig,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    // Should use portfolio for withdrawal in positive return year
    expect(resultYear.bucketUsed).toBe('portfolio')
    expect(resultYear.cashCushionStart).toBe(10000)
    expect(resultYear.entnahme).toBeCloseTo(120000 * 0.04) // 4% of initial capital = 4800
  })

  test('should use cash cushion for withdrawal in negative return years', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const bucketConfig = {
      initialCashCushion: 10000, // €10,000 initial cash (enough for withdrawal)
      refillThreshold: 1000,
      refillPercentage: 0.5,
      baseWithdrawalRate: 0.04, // 4% withdrawal rate = 4800
    }

    const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: -0.10 } // -10% negative return

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: 'bucket_strategie',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      bucketConfig,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    // Should use cash cushion for withdrawal in negative return year
    expect(resultYear.bucketUsed).toBe('cash')
    expect(resultYear.cashCushionStart).toBe(10000)
    expect(resultYear.cashCushionEnd).toBe(10000 - 4800) // Reduced by withdrawal amount
    expect(resultYear.entnahme).toBeCloseTo(4800)
  })

  test('should fall back to portfolio when cash cushion is insufficient', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const bucketConfig = {
      initialCashCushion: 2000, // €2,000 initial cash (not enough for 4800 withdrawal)
      refillThreshold: 1000,
      refillPercentage: 0.5,
      baseWithdrawalRate: 0.04, // 4% withdrawal rate = 4800
    }

    const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: -0.10 } // -10% negative return

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: 'bucket_strategie',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      bucketConfig,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    // Should fall back to portfolio when cash is insufficient
    expect(resultYear.bucketUsed).toBe('portfolio')
    expect(resultYear.cashCushionStart).toBe(2000)
    expect(resultYear.cashCushionEnd).toBe(2000) // Cash unchanged since portfolio was used
  })

  test('should refill cash cushion in good years with excess gains', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const bucketConfig = {
      initialCashCushion: 5000,
      refillThreshold: 2000, // Refill when gains exceed €2,000
      refillPercentage: 0.6, // Move 60% of excess gains to cash
      baseWithdrawalRate: 0.04,
    }

    const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.10 } // 10% return

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: 'bucket_strategie',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      bucketConfig,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    expect(resultYear.bucketUsed).toBe('portfolio')
    expect(resultYear.cashCushionStart).toBe(5000)

    // Calculate expected refill:
    // Portfolio after withdrawal and growth, minus taxes
    // Gain should be > 2000 threshold, so excess gets moved to cash
    expect(resultYear.refillAmount).toBeDefined()
    expect(resultYear.refillAmount).toBeGreaterThan(0)
    expect(resultYear.cashCushionEnd).toBeGreaterThan(5000)
  })

  test('should not refill cash cushion when gains are below threshold', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const bucketConfig = {
      initialCashCushion: 5000,
      refillThreshold: 10000, // Very high threshold - gains won't exceed this
      refillPercentage: 0.5,
      baseWithdrawalRate: 0.04,
    }

    const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.03 } // 3% return

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: 'bucket_strategie',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      bucketConfig,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()

    expect(resultYear.bucketUsed).toBe('portfolio')
    expect(resultYear.cashCushionStart).toBe(5000)
    expect(resultYear.refillAmount).toBeUndefined() // No refill due to low gains
    expect(resultYear.cashCushionEnd).toBe(5000) // Cash unchanged
  })

  test('should work correctly over multiple years with mixed returns', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 150000, 100, lastSimYear)]

    const bucketConfig = {
      initialCashCushion: 8000,
      refillThreshold: 1500,
      refillPercentage: 0.4, // Move 40% of excess gains
      baseWithdrawalRate: 0.04,
    }

    // Year 1: positive return, Year 2: negative return, Year 3: positive return
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          [withdrawalStartYear]: 0.08, // 8% positive
          [withdrawalStartYear + 1]: -0.15, // -15% negative
          [withdrawalStartYear + 2]: 0.12, // 12% positive
        },
      },
    }

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 2,
      strategy: 'bucket_strategie',
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: {
        [withdrawalStartYear]: freibetrag,
        [withdrawalStartYear + 1]: freibetrag,
        [withdrawalStartYear + 2]: freibetrag,
      },
      bucketConfig,
    })

    const year1 = result[withdrawalStartYear]
    const year2 = result[withdrawalStartYear + 1]
    const year3 = result[withdrawalStartYear + 2]

    // Year 1: Positive return, should use portfolio and possibly refill cash
    expect(year1.bucketUsed).toBe('portfolio')
    expect(year1.cashCushionStart).toBe(8000)

    // Year 2: Negative return, should try to use cash
    expect(year2.bucketUsed).toBe('cash')

    // Year 3: Positive return again, should use portfolio
    expect(year3.bucketUsed).toBe('portfolio')

    // Ensure portfolio depletion is realistic across years
    expect(year3.endkapital).toBeGreaterThan(0)
  })

  test('should require bucket config for bucket strategy', () => {
    const withdrawalStartYear = 2025
    const lastSimYear = withdrawalStartYear - 1
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

    const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

    expect(() => {
      calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'bucket_strategie',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        // Missing bucketConfig
      })
    }).toThrow('Bucket strategy config required')
  })

  // Test bucket strategy sub-strategies
  describe('Bucket Sub-Strategy Tests', () => {
    test('should use variable percentage sub-strategy within bucket strategy', () => {
      const withdrawalStartYear = 2025
      const lastSimYear = withdrawalStartYear - 1
      const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

      const bucketConfig = {
        initialCashCushion: 10000,
        refillThreshold: 5000,
        refillPercentage: 0.5,
        baseWithdrawalRate: 0.04, // This should be ignored
        subStrategy: 'variabel_prozent' as const,
        variabelProzent: 6, // 6% withdrawal rate instead of 4%
      }

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'bucket_strategie',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        bucketConfig,
      })

      const resultYear = result[withdrawalStartYear]
      expect(resultYear).toBeDefined()

      // Should use the variable percentage (6%) instead of base withdrawal rate (4%)
      expect(resultYear.entnahme).toBeCloseTo(120000 * 0.06) // 6% of initial capital = 7200
      expect(resultYear.bucketUsed).toBe('portfolio') // Positive return, should use portfolio
    })

    test('should use monthly fixed sub-strategy within bucket strategy', () => {
      const withdrawalStartYear = 2025
      const lastSimYear = withdrawalStartYear - 1
      const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

      const bucketConfig = {
        initialCashCushion: 10000,
        refillThreshold: 5000,
        refillPercentage: 0.5,
        baseWithdrawalRate: 0.04, // This should be ignored
        subStrategy: 'monatlich_fest' as const,
        monatlicheBetrag: 800, // €800 per month = €9600 per year
      }

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'bucket_strategie',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        bucketConfig,
      })

      const resultYear = result[withdrawalStartYear]
      expect(resultYear).toBeDefined()

      // Should use the monthly amount * 12
      expect(resultYear.entnahme).toBeCloseTo(800 * 12) // €9600 per year
      expect(resultYear.bucketUsed).toBe('portfolio')
    })

    test('should use dynamic sub-strategy within bucket strategy', () => {
      const withdrawalStartYear = 2025
      const lastSimYear = withdrawalStartYear - 1
      const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

      const bucketConfig = {
        initialCashCushion: 10000,
        refillThreshold: 5000,
        refillPercentage: 0.5,
        baseWithdrawalRate: 0.04, // This should be ignored for dynamic
        subStrategy: 'dynamisch' as const,
        dynamischBasisrate: 5, // 5% base rate
        dynamischObereSchwell: 8, // 8% upper threshold
        dynamischObereAnpassung: 10, // 10% increase when exceeded
        dynamischUntereSchwell: 2, // 2% lower threshold
        dynamischUntereAnpassung: -10, // 10% decrease when below
      }

      // Use variable returns to test dynamic adjustments
      const returnConfig: ReturnConfiguration = {
        mode: 'variable',
        variableConfig: {
          yearlyReturns: {
            [withdrawalStartYear - 1]: 0.12, // 12% return in previous year (above 8% threshold)
            [withdrawalStartYear]: 0.05,
          },
        },
      }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'bucket_strategie',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        bucketConfig,
      })

      const resultYear = result[withdrawalStartYear]
      expect(resultYear).toBeDefined()

      // Base withdrawal: 120000 * 0.05 = 6000
      // Dynamic adjustment: 6000 * 0.10 = 600 (10% increase due to 12% > 8%)
      // Total: 6000 + 600 = 6600
      expect(resultYear.entnahme).toBeCloseTo(6600)
      expect(resultYear.dynamischeAnpassung).toBeCloseTo(600)
      expect(resultYear.bucketUsed).toBe('portfolio')
    })

    test('should use 4% rule sub-strategy within bucket strategy', () => {
      const withdrawalStartYear = 2025
      const lastSimYear = withdrawalStartYear - 1
      const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

      const bucketConfig = {
        initialCashCushion: 10000,
        refillThreshold: 5000,
        refillPercentage: 0.5,
        baseWithdrawalRate: 0.08, // This should be ignored
        subStrategy: '4prozent' as const,
      }

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'bucket_strategie',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        bucketConfig,
      })

      const resultYear = result[withdrawalStartYear]
      expect(resultYear).toBeDefined()

      // Should use 4% rule regardless of baseWithdrawalRate
      expect(resultYear.entnahme).toBeCloseTo(120000 * 0.04) // 4% of initial capital = 4800
      expect(resultYear.bucketUsed).toBe('portfolio')
    })

    test('should fall back to baseWithdrawalRate when subStrategy is not defined', () => {
      const withdrawalStartYear = 2025
      const lastSimYear = withdrawalStartYear - 1
      const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)]

      const bucketConfig = {
        initialCashCushion: 10000,
        refillThreshold: 5000,
        refillPercentage: 0.5,
        baseWithdrawalRate: 0.035, // Should use this for backward compatibility
        // subStrategy is undefined
      }

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'bucket_strategie',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        bucketConfig,
      })

      const resultYear = result[withdrawalStartYear]
      expect(resultYear).toBeDefined()

      // Should fall back to baseWithdrawalRate for backward compatibility
      expect(resultYear.entnahme).toBeCloseTo(120000 * 0.035) // 3.5% of initial capital = 4200
      expect(resultYear.bucketUsed).toBe('portfolio')
    })
  })

  describe('RMD Strategy', () => {
    test('should calculate RMD withdrawal based on age and portfolio value', () => {
      const withdrawalStartYear = 2040
      const lastSimYear = withdrawalStartYear - 1
      const mockElements = [createMockElement(2023, 100000, 500000, 100, lastSimYear)]

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      const rmdConfig = {
        startAge: 65,
        lifeExpectancyTable: 'german_2020_22' as const,
      }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'rmd',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        rmdConfig,
      })

      const year1 = result[withdrawalStartYear]
      expect(year1).toBeDefined()

      // At age 65, German life expectancy is 19.4 years
      // Portfolio value: €500,000
      // Expected withdrawal: 500,000 / 19.4 ≈ €25,773
      const expectedWithdrawal = 500000 / 19.4
      expect(year1.entnahme).toBeCloseTo(expectedWithdrawal, 0)
    })

    test('should increase withdrawal percentage as age increases', () => {
      const withdrawalStartYear = 2040
      const lastSimYear = withdrawalStartYear - 1

      const rmdConfig = {
        startAge: 65,
        lifeExpectancyTable: 'german_2020_22' as const,
      }

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      // Test 3-year period to see increasing withdrawal rates
      const mockElements = [createMockElement(2023, 100000, 400000, 100, lastSimYear)]

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear + 2,
        strategy: 'rmd',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: {
          [withdrawalStartYear]: freibetrag,
          [withdrawalStartYear + 1]: freibetrag,
          [withdrawalStartYear + 2]: freibetrag,
        },
        rmdConfig,
      })

      const year1 = result[withdrawalStartYear] // Age 65
      const year2 = result[withdrawalStartYear + 1] // Age 66
      const year3 = result[withdrawalStartYear + 2] // Age 67

      expect(year1).toBeDefined()
      expect(year2).toBeDefined()
      expect(year3).toBeDefined()

      // Calculate expected withdrawal percentages
      // Age 65: 1/19.4 ≈ 5.15%
      // Age 66: 1/18.6 ≈ 5.38%
      // Age 67: 1/17.8 ≈ 5.62%

      const portfolioAtStart1 = 400000
      const expectedPercentage1 = 1 / 19.4
      const expectedWithdrawal1 = portfolioAtStart1 * expectedPercentage1

      expect(year1.entnahme).toBeCloseTo(expectedWithdrawal1, 0)

      // Portfolio value decreases each year, but withdrawal percentage increases
      // So we need to check that withdrawal percentage is increasing
      const withdrawalPercentage1 = year1.entnahme / year1.startkapital
      const withdrawalPercentage2 = year2.entnahme / year2.startkapital
      const withdrawalPercentage3 = year3.entnahme / year3.startkapital

      expect(withdrawalPercentage2).toBeGreaterThan(withdrawalPercentage1)
      expect(withdrawalPercentage3).toBeGreaterThan(withdrawalPercentage2)
    })

    test('should use custom life expectancy when specified', () => {
      const withdrawalStartYear = 2040
      const lastSimYear = withdrawalStartYear - 1
      const mockElements = [createMockElement(2023, 100000, 300000, 100, lastSimYear)]

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      const rmdConfig = {
        startAge: 70,
        lifeExpectancyTable: 'custom' as const,
        customLifeExpectancy: 20, // 20 years remaining
      }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'rmd',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        rmdConfig,
      })

      const year1 = result[withdrawalStartYear]
      expect(year1).toBeDefined()

      // Custom life expectancy of 20 years
      // Portfolio value: €300,000
      // Expected withdrawal: 300,000 / 20 = €15,000
      expect(year1.entnahme).toBeCloseTo(15000, 0)
    })

    test('should handle portfolio depletion scenarios', () => {
      const withdrawalStartYear = 2040
      const lastSimYear = withdrawalStartYear - 1
      const mockElements = [createMockElement(2023, 100000, 50000, 100, lastSimYear)]

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.02 } // Low return

      const rmdConfig = {
        startAge: 85, // Very old age, high withdrawal rate
        lifeExpectancyTable: 'german_2020_22' as const,
      }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear + 5,
        strategy: 'rmd',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: {
          [withdrawalStartYear]: freibetrag,
          [withdrawalStartYear + 1]: freibetrag,
          [withdrawalStartYear + 2]: freibetrag,
          [withdrawalStartYear + 3]: freibetrag,
          [withdrawalStartYear + 4]: freibetrag,
          [withdrawalStartYear + 5]: freibetrag,
        },
        rmdConfig,
      })

      // At age 85, life expectancy is 5.9 years, so withdrawal rate is ~16.9%
      // This should deplete the portfolio relatively quickly
      const year1 = result[withdrawalStartYear]
      expect(year1).toBeDefined()

      // Withdrawal should be significant portion of portfolio
      const withdrawalPercentage = year1.entnahme / year1.startkapital
      expect(withdrawalPercentage).toBeGreaterThan(0.15) // More than 15%
      expect(withdrawalPercentage).toBeLessThan(0.20) // Less than 20%
    })

    test('should require RMD config for RMD strategy', () => {
      const withdrawalStartYear = 2040
      const lastSimYear = withdrawalStartYear - 1
      const mockElements = [createMockElement(2023, 100000, 300000, 100, lastSimYear)]

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      expect(() => {
        calculateWithdrawal({
          elements: mockElements,
          startYear: withdrawalStartYear,
          endYear: withdrawalStartYear,
          strategy: 'rmd',
          returnConfig,
          taxRate,
          teilfreistellungsquote,
          freibetragPerYear: { [withdrawalStartYear]: freibetrag },
          // Missing rmdConfig
        })
      }).toThrow('RMD config required')
    })
  })

  describe('Kapitalerhalt Strategy Tests', () => {
    test('should calculate withdrawal based on real return (nominal - inflation)', () => {
      const withdrawalStartYear = 2040
      const lastSimYear = withdrawalStartYear - 1
      const initialCapital = 100000
      const mockElements = [createMockElement(2023, initialCapital, initialCapital, 0, lastSimYear)]

      const kapitalerhaltConfig = {
        nominalReturn: 0.07, // 7% nominal return
        inflationRate: 0.02, // 2% inflation
      }
      // Expected real return: 7% - 2% = 5%
      // Expected withdrawal: 100,000 * 0.05 = 5,000

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'kapitalerhalt',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        kapitalerhaltConfig,
      })

      const resultYear = result[withdrawalStartYear]
      expect(resultYear).toBeDefined()

      // The withdrawal should be based on real return rate
      const expectedWithdrawal = initialCapital * (
        kapitalerhaltConfig.nominalReturn - kapitalerhaltConfig.inflationRate
      )
      expect(resultYear.entnahme).toBeCloseTo(expectedWithdrawal)

      // Verify the withdrawal rate is 5%
      const withdrawalRate = resultYear.entnahme / resultYear.startkapital
      expect(withdrawalRate).toBeCloseTo(0.05)
    })

    test('should handle different nominal return and inflation combinations', () => {
      const withdrawalStartYear = 2040
      const lastSimYear = withdrawalStartYear - 1
      const initialCapital = 200000
      const mockElements = [createMockElement(2023, initialCapital, initialCapital, 0, lastSimYear)]

      const kapitalerhaltConfig = {
        nominalReturn: 0.08, // 8% nominal return
        inflationRate: 0.03, // 3% inflation
      }
      // Expected real return: 8% - 3% = 5%
      // Expected withdrawal: 200,000 * 0.05 = 10,000

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'kapitalerhalt',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        kapitalerhaltConfig,
      })

      const resultYear = result[withdrawalStartYear]
      expect(resultYear).toBeDefined()

      const expectedWithdrawal = initialCapital * (
        kapitalerhaltConfig.nominalReturn - kapitalerhaltConfig.inflationRate
      )
      expect(resultYear.entnahme).toBeCloseTo(expectedWithdrawal)
      expect(resultYear.entnahme).toBeCloseTo(10000)
    })

    test('should handle low real return scenarios', () => {
      const withdrawalStartYear = 2040
      const lastSimYear = withdrawalStartYear - 1
      const initialCapital = 150000
      const mockElements = [createMockElement(2023, initialCapital, initialCapital, 0, lastSimYear)]

      const kapitalerhaltConfig = {
        nominalReturn: 0.04, // 4% nominal return
        inflationRate: 0.025, // 2.5% inflation
      }
      // Expected real return: 4% - 2.5% = 1.5%
      // Expected withdrawal: 150,000 * 0.015 = 2,250

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalStartYear,
        strategy: 'kapitalerhalt',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: { [withdrawalStartYear]: freibetrag },
        kapitalerhaltConfig,
      })

      const resultYear = result[withdrawalStartYear]
      expect(resultYear).toBeDefined()

      const expectedWithdrawal = initialCapital * (
        kapitalerhaltConfig.nominalReturn - kapitalerhaltConfig.inflationRate
      )
      expect(resultYear.entnahme).toBeCloseTo(expectedWithdrawal)
      expect(resultYear.entnahme).toBeCloseTo(2250)
    })

    test('should require kapitalerhalt config for kapitalerhalt strategy', () => {
      const withdrawalStartYear = 2040
      const lastSimYear = withdrawalStartYear - 1
      const mockElements = [createMockElement(2023, 100000, 100000, 0, lastSimYear)]

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      expect(() => {
        calculateWithdrawal({
          elements: mockElements,
          startYear: withdrawalStartYear,
          endYear: withdrawalStartYear,
          strategy: 'kapitalerhalt',
          returnConfig,
          taxRate,
          teilfreistellungsquote,
          freibetragPerYear: { [withdrawalStartYear]: freibetrag },
          // Missing kapitalerhaltConfig
        })
      }).toThrow('Kapitalerhalt config required')
    })

    test('should work with multiple years', () => {
      const withdrawalStartYear = 2040
      const withdrawalEndYear = 2042
      const lastSimYear = withdrawalStartYear - 1
      const initialCapital = 100000
      const mockElements = [createMockElement(2023, initialCapital, initialCapital, 0, lastSimYear)]

      const kapitalerhaltConfig = {
        nominalReturn: 0.06, // 6% nominal return
        inflationRate: 0.02, // 2% inflation
      }
      // Expected real return: 6% - 2% = 4%

      const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }

      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: withdrawalStartYear,
        endYear: withdrawalEndYear,
        strategy: 'kapitalerhalt',
        returnConfig,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear: {
          [withdrawalStartYear]: freibetrag,
          [withdrawalStartYear + 1]: freibetrag,
          [withdrawalStartYear + 2]: freibetrag,
        },
        kapitalerhaltConfig,
      })

      // Check that all years have results
      expect(result[withdrawalStartYear]).toBeDefined()
      expect(result[withdrawalStartYear + 1]).toBeDefined()
      expect(result[withdrawalStartYear + 2]).toBeDefined()

      // For Kapitalerhalt strategy, the withdrawal amount should be based on the
      // starting capital of each year, maintaining the same percentage
      const year1 = result[withdrawalStartYear]
      const year2 = result[withdrawalStartYear + 1]
      const year3 = result[withdrawalStartYear + 2]

      // Each year should withdraw 4% of the starting capital for that year
      const expectedRate = kapitalerhaltConfig.nominalReturn - kapitalerhaltConfig.inflationRate
      expect(year1.entnahme / year1.startkapital).toBeCloseTo(expectedRate)
      expect(year2.entnahme / year2.startkapital).toBeCloseTo(expectedRate)
      expect(year3.entnahme / year3.startkapital).toBeCloseTo(expectedRate)
    })
  })
})
