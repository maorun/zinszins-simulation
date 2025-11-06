import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useWithdrawalData } from './useWithdrawalData'
import type { WithdrawalConfiguration } from '../utils/config-storage'
import type { SparplanElement } from '../utils/sparplan-utils'

// Mock the simulation context
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: vi.fn(() => ({
    steuerReduzierenEndkapitalEntspharphase: false,
    grundfreibetragAktiv: false,
    grundfreibetragBetrag: 11604,
    endOfLife: 2080,
    lifeExpectancyTable: 'german_2020_22' as const,
    customLifeExpectancy: undefined,
    planningMode: 'individual' as const,
    gender: undefined,
    birthYear: 1990,
    guenstigerPruefungAktiv: false,
    personalTaxRate: 0,
    withdrawalMultiAssetConfig: undefined,
  })),
}))

// Helper to create mock SparplanElement
const createMockElement = (
  startYear: number,
  einzahlung: number,
  finalValue: number,
  lastSimYear: number,
): SparplanElement => ({
  start: new Date(`${startYear}-01-01`).toISOString(),
  type: 'sparplan',
  einzahlung,
  simulation: {
    [lastSimYear]: {
      startkapital: einzahlung,
      endkapital: finalValue,
      zinsen: 0,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
    },
  },
})

describe('useWithdrawalData', () => {
  const mockConfig: WithdrawalConfiguration = {
    formValue: {
      strategie: '4prozent',
      rendite: 5,
      einkommensteuersatz: 30,
      monatlicheBetrag: 2000,
      variabelProzent: 4,
      dynamischBasisrate: 4,
      dynamischObereSchwell: 8,
      dynamischObereAnpassung: 5,
      dynamischUntereSchwell: 2,
      dynamischUntereAnpassung: -5,
      bucketConfig: undefined,
      rmdStartAge: 65,
      kapitalerhaltNominalReturn: 7,
      kapitalerhaltInflationRate: 2,
      steueroptimierteEntnahmeBaseWithdrawalRate: 0.04,
      steueroptimierteEntnahmeTargetTaxRate: 0.26375,
      steueroptimierteEntnahmeOptimizationMode: 'balanced' as const,
      steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85,
      steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const,
      inflationAktiv: false,
      inflationsrate: 2,
      withdrawalFrequency: 'yearly' as const,
      guardrailsAktiv: false,
      guardrailsSchwelle: 20,
      healthCareInsuranceConfig: undefined,
    },
    withdrawalReturnMode: 'fixed',
    withdrawalVariableReturns: {},
    withdrawalAverageReturn: 5,
    withdrawalStandardDeviation: 15,
    withdrawalRandomSeed: undefined,
    useSegmentedWithdrawal: false,
    withdrawalSegments: [],
    comparisonStrategies: [],
    segmentedComparisonStrategies: [],
    otherIncomeConfig: undefined,
    useComparisonMode: false,
    useSegmentedComparisonMode: false,
  }

  it('returns null when elements array is empty', () => {
    const { result } = renderHook(() => useWithdrawalData([], 2040, mockConfig, 0.26375, 0.3, null))

    expect(result.current).toBeNull()
  })

  it('returns null when starting capital is zero or negative', () => {
    const elementsWithZeroCapital: SparplanElement[] = [createMockElement(2050, 1000, 1000, 2049)]

    const { result } = renderHook(() =>
      useWithdrawalData(elementsWithZeroCapital, 2040, mockConfig, 0.26375, 0.3, null),
    )

    expect(result.current).toBeNull()
  })

  it('returns withdrawal data when elements are valid', () => {
    const mockElements: SparplanElement[] = [createMockElement(2023, 10000, 50000, 2040)]

    const { result } = renderHook(() => useWithdrawalData(mockElements, 2040, mockConfig, 0.26375, 0.3, null))

    expect(result.current).not.toBeNull()
    if (result.current) {
      expect(result.current).toHaveProperty('startingCapital')
      expect(result.current).toHaveProperty('withdrawalArray')
      expect(result.current).toHaveProperty('withdrawalResult')
      expect(result.current).toHaveProperty('duration')
      expect(result.current.startingCapital).toBeGreaterThan(0)
      expect(Array.isArray(result.current.withdrawalArray)).toBe(true)
    }
  })

  it('returns sorted withdrawal array in descending order by year', () => {
    const mockElements: SparplanElement[] = [createMockElement(2023, 10000, 50000, 2040)]

    const { result } = renderHook(() => useWithdrawalData(mockElements, 2040, mockConfig, 0.26375, 0.3, null))

    if (result.current && result.current.withdrawalArray.length > 1) {
      const years = result.current.withdrawalArray.map((item) => item.year)
      const sortedYears = [...years].sort((a, b) => b - a)
      expect(years).toEqual(sortedYears)
    }
  })

  it('recalculates when elements change', () => {
    const initialElements: SparplanElement[] = [createMockElement(2023, 10000, 50000, 2040)]

    const { result, rerender } = renderHook(
      ({ elements }) => useWithdrawalData(elements, 2040, mockConfig, 0.26375, 0.3, null),
      { initialProps: { elements: initialElements } },
    )

    const firstResult = result.current

    const newElements: SparplanElement[] = [createMockElement(2023, 20000, 100000, 2040)]

    rerender({ elements: newElements })

    // Results should be different when elements change
    expect(result.current).not.toBe(firstResult)
  })
})
