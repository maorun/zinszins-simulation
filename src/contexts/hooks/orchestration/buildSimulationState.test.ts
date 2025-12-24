import { renderHook } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useBuildSimulationState } from './buildSimulationState'
import type { useSimulationState } from '../useSimulationState'
import { createDefaultMultiAssetConfig } from '../../../../helpers/multi-asset-portfolio'

// Mock state with all required properties
const createMockState = (): ReturnType<typeof useSimulationState> =>
  ({
    rendite: 5,
    returnMode: 'fixed' as const,
    averageReturn: 7,
    standardDeviation: 15,
    randomSeed: 12345,
    variableReturns: { 2024: 5.5 },
    historicalIndex: 'MSCI_WORLD',
    blackSwanReturns: null,
    inflationScenarioRates: null,
    inflationScenarioReturnModifiers: null,
    multiAssetConfig: createDefaultMultiAssetConfig(),
    simulationAnnual: 'yearly' as const,
    sparplanElemente: [],
    startEnd: [2023, 2040] as [number, number],
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2024: 2000 },
    basiszinsConfiguration: {
      2024: { year: 2024, rate: 2.5, source: 'manual' as const },
    },
    steuerReduzierenEndkapitalSparphase: false,
    inflationAktivSparphase: false,
    inflationsrateSparphase: 2,
    inflationAnwendungSparphase: 'sparplan' as const,
    guenstigerPruefungAktiv: false,
    personalTaxRate: 0,
  }) as any

describe('useBuildSimulationState', () => {
  it('returns a SimulationExecutionState object', () => {
    const mockState = createMockState()
    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current).toEqual({
      rendite: 5,
      returnMode: 'fixed',
      averageReturn: 7,
      standardDeviation: 15,
      randomSeed: 12345,
      variableReturns: { 2024: 5.5 },
      historicalIndex: 'MSCI_WORLD',
      blackSwanReturns: null,
      inflationScenarioRates: null,
      inflationScenarioReturnModifiers: null,
      multiAssetConfig: expect.any(Object),
      simulationAnnual: 'yearly',
      sparplanElemente: [],
      startEnd: [2023, 2040],
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetragPerYear: { 2024: 2000 },
      basiszinsConfiguration: {
        2024: { year: 2024, rate: 2.5, source: 'manual' },
      },
      steuerReduzierenEndkapitalSparphase: false,
      inflationAktivSparphase: false,
      inflationsrateSparphase: 2,
      inflationAnwendungSparphase: 'sparplan',
      guenstigerPruefungAktiv: false,
      personalTaxRate: 0,
    })
  })

  it('includes all required properties', () => {
    const mockState = createMockState()
    const { result } = renderHook(() => useBuildSimulationState(mockState))

    // Verify all 24 properties are present
    expect(Object.keys(result.current)).toHaveLength(24)

    // Check presence of key properties from each category
    expect(result.current).toHaveProperty('rendite')
    expect(result.current).toHaveProperty('returnMode')
    expect(result.current).toHaveProperty('steuerlast')
    expect(result.current).toHaveProperty('teilfreistellungsquote')
    expect(result.current).toHaveProperty('inflationAktivSparphase')
    expect(result.current).toHaveProperty('simulationAnnual')
  })

  it('memoizes result when state properties remain unchanged', () => {
    const mockState = createMockState()
    const { result, rerender } = renderHook(() => useBuildSimulationState(mockState))

    const firstResult = result.current

    // Rerender with same state
    rerender()

    expect(result.current).toBe(firstResult)
  })

  it('updates result when state property changes', () => {
    const mockState = createMockState()
    const { result, rerender } = renderHook(({ state }) => useBuildSimulationState(state), {
      initialProps: { state: mockState },
    })

    const firstResult = result.current
    expect(firstResult.rendite).toBe(5)

    // Change a property
    const updatedState = { ...mockState, rendite: 10 }
    rerender({ state: updatedState })

    expect(result.current).not.toBe(firstResult)
    expect(result.current.rendite).toBe(10)
  })

  it('handles random return mode', () => {
    const mockState = createMockState()
    mockState.returnMode = 'random'
    mockState.averageReturn = 8
    mockState.standardDeviation = 20

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.returnMode).toBe('random')
    expect(result.current.averageReturn).toBe(8)
    expect(result.current.standardDeviation).toBe(20)
  })

  it('handles variable return mode', () => {
    const mockState = createMockState()
    mockState.returnMode = 'variable'
    mockState.variableReturns = { 2024: 5, 2025: 6, 2026: 7 }

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.returnMode).toBe('variable')
    expect(result.current.variableReturns).toEqual({ 2024: 5, 2025: 6, 2026: 7 })
  })

  it('handles historical return mode', () => {
    const mockState = createMockState()
    mockState.returnMode = 'historical'
    mockState.historicalIndex = 'S&P_500'

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.returnMode).toBe('historical')
    expect(result.current.historicalIndex).toBe('S&P_500')
  })

  it('handles black swan returns', () => {
    const mockState = createMockState()
    mockState.blackSwanReturns = { 2030: -40, 2035: -50 }

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.blackSwanReturns).toEqual({ 2030: -40, 2035: -50 })
  })

  it('handles inflation scenarios', () => {
    const mockState = createMockState()
    mockState.inflationScenarioRates = { 2024: 3.5, 2025: 4.0 }
    mockState.inflationScenarioReturnModifiers = { 2024: 1.0, 2025: 1.5 }

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.inflationScenarioRates).toEqual({ 2024: 3.5, 2025: 4.0 })
    expect(result.current.inflationScenarioReturnModifiers).toEqual({ 2024: 1.0, 2025: 1.5 })
  })

  it('handles monthly simulation mode', () => {
    const mockState = createMockState()
    mockState.simulationAnnual = 'monthly'

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.simulationAnnual).toBe('monthly')
  })

  it('handles sparplan elements', () => {
    const mockState = createMockState()
    mockState.sparplanElemente = [
      { typ: 'sparplan', jahr: 2024, monat: 1, betrag: 1000 },
      { typ: 'einmalzahlung', jahr: 2025, monat: 6, betrag: 5000 },
    ] as any

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.sparplanElemente).toHaveLength(2)
  })

  it('handles active inflation configuration', () => {
    const mockState = createMockState()
    mockState.inflationAktivSparphase = true
    mockState.inflationsrateSparphase = 3.5
    mockState.inflationAnwendungSparphase = 'gesamtmenge'

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.inflationAktivSparphase).toBe(true)
    expect(result.current.inflationsrateSparphase).toBe(3.5)
    expect(result.current.inflationAnwendungSparphase).toBe('gesamtmenge')
  })

  it('handles guenstigerPruefung active', () => {
    const mockState = createMockState()
    mockState.guenstigerPruefungAktiv = true
    mockState.personalTaxRate = 35

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.guenstigerPruefungAktiv).toBe(true)
    expect(result.current.personalTaxRate).toBe(35)
  })

  it('handles tax reduction settings', () => {
    const mockState = createMockState()
    mockState.steuerReduzierenEndkapitalSparphase = true

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.steuerReduzierenEndkapitalSparphase).toBe(true)
  })

  it('handles multiple freibetrag years', () => {
    const mockState = createMockState()
    mockState.freibetragPerYear = {
      2024: 2000,
      2025: 2100,
      2026: 2200,
    }

    const { result } = renderHook(() => useBuildSimulationState(mockState))

    expect(result.current.freibetragPerYear).toEqual({
      2024: 2000,
      2025: 2100,
      2026: 2200,
    })
  })

  it('maintains stable reference when unrelated properties change', () => {
    const mockState = createMockState()
    const { result, rerender } = renderHook(({ state }) => useBuildSimulationState(state), {
      initialProps: { state: mockState },
    })

    const firstResult = result.current

    // Add a property that's not used in SimulationExecutionState
    const stateWithExtra = { ...mockState, extraProperty: 'test' } as any
    rerender({ state: stateWithExtra })

    // Result should remain the same (same reference) since tracked properties didn't change
    expect(result.current).toBe(firstResult)
  })

  it('recreates object when any tracked property changes', () => {
    const mockState = createMockState()
    const { result, rerender } = renderHook(({ state }) => useBuildSimulationState(state), {
      initialProps: { state: mockState },
    })

    const testPropertyChanges = [
      { rendite: 10 },
      { returnMode: 'random' as const },
      { steuerlast: 30 },
      { teilfreistellungsquote: 40 },
      { inflationAktivSparphase: true },
      { simulationAnnual: 'monthly' as const },
    ]

    testPropertyChanges.forEach(change => {
      const firstResult = result.current
      const updatedState = { ...mockState, ...change }
      rerender({ state: updatedState })

      expect(result.current).not.toBe(firstResult)
    })
  })
})
