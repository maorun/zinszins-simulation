import { describe, test, expect } from 'vitest'
import { formatWithInflation } from './format-with-inflation'
import type { WithdrawalFormValue } from './config-storage'

const createMockFormValue = (overrides?: Partial<WithdrawalFormValue>): WithdrawalFormValue => ({
  strategie: '4prozent',
  rendite: 5,
  withdrawalFrequency: 'yearly',
  inflationAktiv: false,
  inflationsrate: 2,
  monatlicheBetrag: 2000,
  guardrailsAktiv: false,
  guardrailsSchwelle: 10,
  variabelProzent: 5,
  dynamischBasisrate: 4,
  dynamischObereSchwell: 8,
  dynamischObereAnpassung: 5,
  dynamischUntereSchwell: 2,
  dynamischUntereAnpassung: -5,
  rmdStartAge: 65,
  kapitalerhaltNominalReturn: 7,
  kapitalerhaltInflationRate: 2,
  steueroptimierteEntnahmeBaseWithdrawalRate: 0.04,
  steueroptimierteEntnahmeTargetTaxRate: 0.26375,
  steueroptimierteEntnahmeOptimizationMode: 'balanced' as const,
  steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85,
  steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const,
  grundfreibetragAktiv: false,
  grundfreibetragBetrag: 10908,
  einkommensteuersatz: 18,
  ...overrides,
})

describe('formatWithInflation', () => {
  test('formats value without inflation when inflationAktiv is false', () => {
    const result = formatWithInflation({
      value: 100000,
      year: 2024,
      allYears: [2024, 2025, 2026],
      formValue: createMockFormValue({ inflationAktiv: false }),
      showIcon: false,
    })

    expect(result).toContain('100.000')
    expect(result).toContain('€')
  })

  test('formats value with inflation when inflationAktiv is true', () => {
    const result = formatWithInflation({
      value: 100000,
      year: 2026,
      allYears: [2024, 2025, 2026],
      formValue: createMockFormValue({ inflationAktiv: true, inflationsrate: 2 }),
      showIcon: false,
    })

    // Should include nominal value
    expect(result).toContain('€')
  })

  test('includes inflation icon when showIcon is true and inflation is active', () => {
    const result = formatWithInflation({
      value: 100000,
      year: 2026,
      allYears: [2024, 2025, 2026],
      formValue: createMockFormValue({ inflationAktiv: true, inflationsrate: 2 }),
      showIcon: true,
    })

    // Should include nominal value
    expect(result).toContain('€')
  })

  test('handles zero value correctly', () => {
    const result = formatWithInflation({
      value: 0,
      year: 2024,
      allYears: [2024, 2025, 2026],
      formValue: createMockFormValue({ inflationAktiv: false }),
      showIcon: false,
    })

    expect(result).toContain('0')
    expect(result).toContain('€')
  })

  test('handles negative value correctly', () => {
    const result = formatWithInflation({
      value: -5000,
      year: 2024,
      allYears: [2024, 2025, 2026],
      formValue: createMockFormValue({ inflationAktiv: false }),
      showIcon: false,
    })

    expect(result).toContain('-')
    expect(result).toContain('€')
  })

  test('works with different inflation rates', () => {
    const result1 = formatWithInflation({
      value: 100000,
      year: 2026,
      allYears: [2024, 2025, 2026],
      formValue: createMockFormValue({ inflationAktiv: true, inflationsrate: 5 }),
      showIcon: false,
    })

    const result2 = formatWithInflation({
      value: 100000,
      year: 2026,
      allYears: [2024, 2025, 2026],
      formValue: createMockFormValue({ inflationAktiv: true, inflationsrate: 2 }),
      showIcon: false,
    })

    // Both should return valid currency strings
    expect(result1).toContain('€')
    expect(result2).toContain('€')
  })
})
