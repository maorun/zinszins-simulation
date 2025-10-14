import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useComparisonData, getStrategyDisplayName } from './useComparisonData'
import type { WithdrawalFormValue } from '../utils/config-storage'

const mockWithdrawalData = {
  startingCapital: 500000,
  withdrawalArray: [
    {
      year: 2024,
      startkapital: 500000,
      entnahme: 20000,
      zinsen: 24000,
      bezahlteSteuer: 6000,
      endkapital: 498000,
    },
    {
      year: 2025,
      startkapital: 498000,
      entnahme: 20800,
      zinsen: 23904,
      bezahlteSteuer: 5976,
      endkapital: 495128,
    },
  ],
  duration: 25,
}

const mockFormValue: WithdrawalFormValue = {
  strategie: '4prozent' as const,
  rendite: 5,
  withdrawalFrequency: 'yearly' as const,
  variabelProzent: 4,
  monatlicheBetrag: 1667,
  dynamischBasisrate: 4,
  dynamischObereSchwell: 7,
  dynamischObereAnpassung: 1,
  dynamischUntereSchwell: 2,
  dynamischUntereAnpassung: -1,
  inflationAktiv: true,
  inflationsrate: 2,
  guardrailsAktiv: false,
  guardrailsSchwelle: 80,
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
}

describe('getStrategyDisplayName', () => {
  it('returns correct display name for 4% rule', () => {
    expect(getStrategyDisplayName('4prozent')).toBe('4% Regel')
  })

  it('returns correct display name for 3% rule', () => {
    expect(getStrategyDisplayName('3prozent')).toBe('3% Regel')
  })

  it('returns correct display name for variable percent', () => {
    expect(getStrategyDisplayName('variabel_prozent')).toBe('Variable Prozent')
  })

  it('returns correct display name for monthly fixed', () => {
    expect(getStrategyDisplayName('monatlich_fest')).toBe('Monatlich fest')
  })

  it('returns correct display name for dynamic strategy', () => {
    expect(getStrategyDisplayName('dynamisch')).toBe('Dynamische Strategie')
  })

  it('returns original strategy name for unknown strategy', () => {
    expect(getStrategyDisplayName('unknown')).toBe('unknown')
  })
})

describe('useComparisonData', () => {
  it('calculates base strategy data correctly for 4% rule', () => {
    const { result } = renderHook(() =>
      useComparisonData({ withdrawalData: mockWithdrawalData, formValue: mockFormValue }),
    )

    expect(result.current.baseStrategyData.displayName).toBe('4% Regel')
    expect(result.current.baseStrategyData.rendite).toBe(5)
    expect(result.current.baseStrategyData.endkapital).toBe(498000)
    expect(result.current.baseStrategyData.duration).toBe('25 Jahre')
    expect(result.current.baseStrategyData.durationYears).toBe('25 Jahre')
    expect(result.current.baseStrategyData.averageAnnualWithdrawal).toBe(20400) // (20000 + 20800) / 2
    expect(result.current.baseStrategyData.withdrawalAmount).toBe(20000) // 4% of 500000
    expect(result.current.baseStrategyData.withdrawalLabel).toBe('Jährliche Entnahme:')
  })

  it('calculates base strategy data correctly for 3% rule', () => {
    const formValue = { ...mockFormValue, strategie: '3prozent' as const }
    const { result } = renderHook(() =>
      useComparisonData({ withdrawalData: mockWithdrawalData, formValue }),
    )

    expect(result.current.baseStrategyData.displayName).toBe('3% Regel')
    expect(result.current.baseStrategyData.withdrawalAmount).toBe(15000) // 3% of 500000
    expect(result.current.baseStrategyData.withdrawalLabel).toBe('Jährliche Entnahme:')
  })

  it('calculates base strategy data correctly for variable percent', () => {
    const formValue = { ...mockFormValue, strategie: 'variabel_prozent' as const, variabelProzent: 3.5 }
    const { result } = renderHook(() =>
      useComparisonData({ withdrawalData: mockWithdrawalData, formValue }),
    )

    expect(result.current.baseStrategyData.displayName).toBe('Variable Prozent')
    expect(result.current.baseStrategyData.withdrawalAmount).toBe(17500) // 3.5% of 500000
    expect(result.current.baseStrategyData.withdrawalLabel).toBe('Jährliche Entnahme:')
  })

  it('calculates base strategy data correctly for monthly fixed', () => {
    const formValue = { ...mockFormValue, strategie: 'monatlich_fest' as const, monatlicheBetrag: 2000 }
    const { result } = renderHook(() =>
      useComparisonData({ withdrawalData: mockWithdrawalData, formValue }),
    )

    expect(result.current.baseStrategyData.displayName).toBe('Monatlich fest')
    expect(result.current.baseStrategyData.withdrawalAmount).toBe(2000)
    expect(result.current.baseStrategyData.withdrawalLabel).toBe('Monatliche Entnahme:')
  })

  it('calculates base strategy data correctly for dynamic strategy', () => {
    const formValue = { ...mockFormValue, strategie: 'dynamisch' as const, dynamischBasisrate: 3.8 }
    const { result } = renderHook(() =>
      useComparisonData({ withdrawalData: mockWithdrawalData, formValue }),
    )

    expect(result.current.baseStrategyData.displayName).toBe('Dynamische Strategie')
    expect(result.current.baseStrategyData.withdrawalAmount).toBe(19000) // 3.8% of 500000
    expect(result.current.baseStrategyData.withdrawalLabel).toBe('Basis-Entnahme:')
  })

  it('handles unlimited duration correctly', () => {
    const unlimitedWithdrawalData = { ...mockWithdrawalData, duration: null }
    const { result } = renderHook(() =>
      useComparisonData({ withdrawalData: unlimitedWithdrawalData, formValue: mockFormValue }),
    )

    expect(result.current.baseStrategyData.duration).toBe('unbegrenzt')
    expect(result.current.baseStrategyData.durationYears).toBe('unbegrenzt')
  })

  it('handles single year duration correctly', () => {
    const singleYearData = { ...mockWithdrawalData, duration: 1 }
    const { result } = renderHook(() =>
      useComparisonData({ withdrawalData: singleYearData, formValue: mockFormValue }),
    )

    expect(result.current.baseStrategyData.duration).toBe('1 Jahr')
    expect(result.current.baseStrategyData.durationYears).toBe('1 Jahre')
  })

  it('handles empty withdrawal array correctly', () => {
    const emptyWithdrawalData = { ...mockWithdrawalData, withdrawalArray: [] }
    const { result } = renderHook(() =>
      useComparisonData({ withdrawalData: emptyWithdrawalData, formValue: mockFormValue }),
    )

    expect(result.current.baseStrategyData.endkapital).toBe(0)
    expect(isNaN(result.current.baseStrategyData.averageAnnualWithdrawal)).toBe(true)
  })
})
