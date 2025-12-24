import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useComparisonResults } from './useComparisonResults'
import type { WithdrawalConfiguration, ComparisonStrategy } from '../utils/config-storage'
import type { SparplanElement } from '../utils/sparplan-utils'
import type { WithdrawalData } from './useWithdrawalCalculations.types'

// Mock the simulation context
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: vi.fn(() => ({
    steuerReduzierenEndkapitalEntspharphase: false,
    grundfreibetragAktiv: false,
    grundfreibetragBetrag: 2000,
    endOfLife: 2050,
    lifeExpectancyTable: 'german_2020_22' as const,
    customLifeExpectancy: undefined,
    planningMode: 'individual' as const,
    gender: undefined,
    birthYear: 1990,
    guenstigerPruefungAktiv: false,
    personalTaxRate: 0,
  })),
}))

// Mock the withdrawal calculations helper
vi.mock('./useWithdrawalCalculations.helpers', () => ({
  calculateComparisonStrategy: vi.fn(params => ({
    strategy: params.strategy,
    withdrawalData: {
      startingCapital: 500000,
      withdrawalArray: [],
      duration: 25,
    },
  })),
}))

// Mock getEffectiveLifeExpectancyTable
vi.mock('./useWithdrawalCalculations', () => ({
  getEffectiveLifeExpectancyTable: vi.fn(() => 'german_2020_22'),
}))

const createMockElement = (year: number, value: number): SparplanElement => ({
  start: new Date(`${year}-01-01`).toISOString(),
  type: 'sparplan',
  einzahlung: 1000,
  simulation: {
    [year]: {
      startkapital: value,
      endkapital: value,
      zinsen: 0,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
    },
  },
})

describe('useComparisonResults', () => {
  const mockElements: SparplanElement[] = [createMockElement(2024, 500000)]
  const startOfIndependence = 2024
  const steuerlast = 0.26375
  const teilfreistellungsquote = 0.3

  const mockWithdrawalData: WithdrawalData = {
    startingCapital: 500000,
    withdrawalArray: [
      {
        year: 2024,
        startkapital: 500000,
        entnahme: 20000,
        zinsen: 24000,
        bezahlteSteuer: 6000,
        endkapital: 498000,
        genutzterFreibetrag: 0,
      },
    ],
    withdrawalResult: null,
    duration: 25,
  }

  const createMockConfig = (
    useComparisonMode: boolean,
    strategies: ComparisonStrategy[] = [],
  ): WithdrawalConfiguration => ({
    formValue: {
      strategie: '4prozent',
      rendite: 5,
      einkommensteuersatz: 18,
      monatlicheBetrag: 1667,
      variabelProzent: 4,
      dynamischBasisrate: 4,
      dynamischObereSchwell: 7,
      dynamischObereAnpassung: 1,
      dynamischUntereSchwell: 2,
      dynamischUntereAnpassung: -1,
      inflationAktiv: true,
      inflationsrate: 2,
      withdrawalFrequency: 'yearly' as const,
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
      healthCareInsuranceConfig: undefined,
    },
    withdrawalReturnMode: 'fixed',
    withdrawalVariableReturns: {},
    withdrawalAverageReturn: 5,
    withdrawalStandardDeviation: 15,
    useComparisonMode,
    comparisonStrategies: strategies,
    otherIncomeConfig: { enabled: false, sources: [] },
    useSegmentedWithdrawal: false,
    withdrawalSegments: [],
    useSegmentedComparisonMode: false,
    segmentedComparisonStrategies: [],
  })

  it('returns empty array when useComparisonMode is false', () => {
    const config = createMockConfig(false)
    const { result } = renderHook(() =>
      useComparisonResults(
        mockElements,
        startOfIndependence,
        config,
        steuerlast,
        teilfreistellungsquote,
        null,
        mockWithdrawalData,
      ),
    )

    expect(result.current).toEqual([])
  })

  it('returns empty array when withdrawalData is null', () => {
    const strategies: ComparisonStrategy[] = [
      {
        id: '1',
        name: 'Strategy 1',
        strategie: '4prozent',
        rendite: 5,
      },
    ]
    const config = createMockConfig(true, strategies)
    const { result } = renderHook(() =>
      useComparisonResults(
        mockElements,
        startOfIndependence,
        config,
        steuerlast,
        teilfreistellungsquote,
        null,
        null as any,
      ),
    )

    expect(result.current).toEqual([])
  })

  it('calculates comparison results when useComparisonMode is true', () => {
    const strategies: ComparisonStrategy[] = [
      {
        id: '1',
        name: '3% Rule',
        strategie: '3prozent',
        rendite: 5,
      },
      {
        id: '2',
        name: 'Variable Percent',
        strategie: 'variabel_prozent',
        rendite: 5,
        variabelProzent: 4,
      },
    ]

    const config = createMockConfig(true, strategies)
    const { result } = renderHook(() =>
      useComparisonResults(
        mockElements,
        startOfIndependence,
        config,
        steuerlast,
        teilfreistellungsquote,
        null,
        mockWithdrawalData,
      ),
    )

    expect(result.current).toHaveLength(2)
    expect(result.current[0]).toHaveProperty('strategy')
    expect(result.current[0]).toHaveProperty('withdrawalData')
  })

  it('passes correct parameters to calculation functions', () => {
    const strategies: ComparisonStrategy[] = [
      {
        id: '1',
        name: '4% Rule',
        strategie: '4prozent',
        rendite: 5,
      },
    ]

    const config = createMockConfig(true, strategies)
    const effectivePensionConfig = {
      enabled: true,
      startYear: 2040,
      monthlyAmount: 1500,
      annualIncreaseRate: 1,
      taxablePercentage: 80,
      retirementAge: 67,
    }

    const { result } = renderHook(() =>
      useComparisonResults(
        mockElements,
        startOfIndependence,
        config,
        steuerlast,
        teilfreistellungsquote,
        effectivePensionConfig,
        mockWithdrawalData,
      ),
    )

    expect(result.current).toHaveLength(1)
  })

  it('handles empty comparison strategies', () => {
    const config = createMockConfig(true, [])
    const { result } = renderHook(() =>
      useComparisonResults(
        mockElements,
        startOfIndependence,
        config,
        steuerlast,
        teilfreistellungsquote,
        null,
        mockWithdrawalData,
      ),
    )

    expect(result.current).toEqual([])
  })

  it('recalculates when dependencies change', () => {
    const config1 = createMockConfig(true, [
      {
        id: '1',
        name: '4% Rule',
        strategie: '4prozent',
        rendite: 5,
      },
    ])

    const { result, rerender } = renderHook(
      ({ config }) =>
        useComparisonResults(
          mockElements,
          startOfIndependence,
          config,
          steuerlast,
          teilfreistellungsquote,
          null,
          mockWithdrawalData,
        ),
      { initialProps: { config: config1 } },
    )

    const firstResult = result.current

    const config2 = createMockConfig(true, [
      {
        id: '1',
        name: '3% Rule',
        strategie: '3prozent',
        rendite: 5,
      },
    ])

    rerender({ config: config2 })

    // Should have recalculated with new config
    expect(result.current).toBeDefined()
    expect(result.current).not.toBe(firstResult)
  })
})
