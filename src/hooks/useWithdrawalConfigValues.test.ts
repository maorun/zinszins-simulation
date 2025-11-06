import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useWithdrawalConfigValues } from './useWithdrawalConfigValues'
import type { WithdrawalConfiguration } from '../utils/config-storage'
import { createDefaultWithdrawalSegment } from '../utils/segmented-withdrawal'

describe('useWithdrawalConfigValues', () => {
  const createMockConfig = (overrides: Partial<WithdrawalConfiguration> = {}): WithdrawalConfiguration => ({
    formValue: {
      strategie: '4prozent',
      rendite: 5,
      withdrawalFrequency: 'yearly',
      inflationAktiv: true,
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
      einkommensteuersatz: 18,
    },
    withdrawalReturnMode: 'fixed',
    withdrawalVariableReturns: {},
    withdrawalAverageReturn: 5,
    withdrawalStandardDeviation: 15,
    withdrawalRandomSeed: 42,
    useSegmentedWithdrawal: false,
    withdrawalSegments: [],
    useComparisonMode: false,
    comparisonStrategies: [],
    useSegmentedComparisonMode: false,
    segmentedComparisonStrategies: [],
    otherIncomeConfig: { enabled: false, sources: [] },
    ...overrides,
  })

  it('should extract all config values correctly', () => {
    const mockConfig = createMockConfig()
    const { result } = renderHook(() => useWithdrawalConfigValues(mockConfig))

    expect(result.current.formValue).toEqual(mockConfig.formValue)
    expect(result.current.withdrawalReturnMode).toBe('fixed')
    expect(result.current.withdrawalAverageReturn).toBe(5)
    expect(result.current.withdrawalStandardDeviation).toBe(15)
    expect(result.current.withdrawalRandomSeed).toBe(42)
    expect(result.current.useSegmentedWithdrawal).toBe(false)
    expect(result.current.withdrawalSegments).toEqual([])
    expect(result.current.useComparisonMode).toBe(false)
    expect(result.current.comparisonStrategies).toEqual([])
    expect(result.current.useSegmentedComparisonMode).toBe(false)
    expect(result.current.segmentedComparisonStrategies).toEqual([])
  })

  it('should handle segmented withdrawal configuration', () => {
    const mockSegments = [createDefaultWithdrawalSegment('1', 'Test Segment', 2040, 2050)]
    const mockConfig = createMockConfig({
      useSegmentedWithdrawal: true,
      withdrawalSegments: mockSegments,
    })

    const { result } = renderHook(() => useWithdrawalConfigValues(mockConfig))

    expect(result.current.useSegmentedWithdrawal).toBe(true)
    expect(result.current.withdrawalSegments).toEqual(mockSegments)
  })

  it('should handle comparison mode configuration', () => {
    const mockStrategies = [{ id: '1', name: 'Strategy 1', strategie: '4prozent' as const, rendite: 5 }]
    const mockConfig = createMockConfig({
      useComparisonMode: true,
      comparisonStrategies: mockStrategies,
    })

    const { result } = renderHook(() => useWithdrawalConfigValues(mockConfig))

    expect(result.current.useComparisonMode).toBe(true)
    expect(result.current.comparisonStrategies).toEqual(mockStrategies)
  })

  it('should handle variable return configuration', () => {
    const mockVariableReturns = { 2040: 5, 2041: 6, 2042: 4 }
    const mockConfig = createMockConfig({
      withdrawalReturnMode: 'variable',
      withdrawalVariableReturns: mockVariableReturns,
    })

    const { result } = renderHook(() => useWithdrawalConfigValues(mockConfig))

    expect(result.current.withdrawalReturnMode).toBe('variable')
    expect(result.current.withdrawalVariableReturns).toEqual(mockVariableReturns)
  })

  it('should memoize values correctly', () => {
    const mockConfig = createMockConfig()
    const { result, rerender } = renderHook(() => useWithdrawalConfigValues(mockConfig))

    const firstResult = result.current

    // Rerender with same config
    rerender()

    // Should return same object reference
    expect(result.current).toBe(firstResult)
  })

  it('should update when config changes', () => {
    const mockConfig = createMockConfig({ withdrawalAverageReturn: 5 })
    const { result, rerender } = renderHook(({ config }) => useWithdrawalConfigValues(config), {
      initialProps: { config: mockConfig },
    })

    expect(result.current.withdrawalAverageReturn).toBe(5)

    // Update config
    const updatedConfig = createMockConfig({ withdrawalAverageReturn: 7 })
    rerender({ config: updatedConfig })

    expect(result.current.withdrawalAverageReturn).toBe(7)
  })
})
