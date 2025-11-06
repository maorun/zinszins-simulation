import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSimulationExecution, type SimulationExecutionState } from './useSimulationExecution'
import { createDefaultMultiAssetConfig } from '../../../helpers/multi-asset-portfolio'
import * as buildSimulationParams from './execution/buildSimulationParams'
import * as runSimulation from './execution/runSimulation'

// Mock the execution modules
vi.mock('./execution/buildSimulationParams')
vi.mock('./execution/runSimulation')

describe('useSimulationExecution', () => {
  const mockSetIsLoading = vi.fn()
  const mockSetSimulationData = vi.fn()

  const mockState: SimulationExecutionState = {
    rendite: 5,
    returnMode: 'fixed',
    averageReturn: 7,
    standardDeviation: 15,
    randomSeed: undefined,
    variableReturns: {},
    historicalIndex: 'MSCI_WORLD',
    blackSwanReturns: null,
    inflationScenarioRates: null,
    inflationScenarioReturnModifiers: null,
    multiAssetConfig: createDefaultMultiAssetConfig(),
    simulationAnnual: 'yearly',
    sparplanElemente: [],
    startEnd: [2040, 2023],
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
  }

  const mockReturnConfig = { mode: 'fixed' as const, fixedRate: 0.05 }
  const mockVariableInflationRates = { 2024: 2.5 }
  const mockSimulationParams = {
    yearToday: 2024,
    endYear: 2040,
    elements: [],
    returnConfig: mockReturnConfig,
    simulationAnnual: 'yearly' as const,
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2024: 2000 },
    basiszinsConfiguration: { 2024: { year: 2024, rate: 2.5, source: 'manual' as const } },
    steuerReduzierenEndkapitalSparphase: false,
    inflationAktivSparphase: false,
    inflationsrateSparphase: 2,
    inflationAnwendungSparphase: 'sparplan' as const,
    variableInflationRates: mockVariableInflationRates,
    guenstigerPruefungAktiv: false,
    personalTaxRate: 0,
  }
  const mockSimulationResult = [{ year: 2024, value: 1000 }]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(buildSimulationParams.buildSimulationConfig).mockReturnValue({
      returnConfig: mockReturnConfig,
      variableInflationRates: mockVariableInflationRates,
    })
    vi.mocked(buildSimulationParams.buildRunSimulationParams).mockReturnValue(mockSimulationParams)
    vi.mocked(runSimulation.runSimulation).mockReturnValue(mockSimulationResult as any)
  })

  it('returns performSimulation function', () => {
    const { result } = renderHook(() => useSimulationExecution(mockState, mockSetIsLoading, mockSetSimulationData))

    expect(result.current.performSimulation).toBeDefined()
    expect(typeof result.current.performSimulation).toBe('function')
  })

  it('executes simulation with default parameters', async () => {
    const { result } = renderHook(() => useSimulationExecution(mockState, mockSetIsLoading, mockSetSimulationData))

    await result.current.performSimulation()

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true)
      expect(buildSimulationParams.buildSimulationConfig).toHaveBeenCalledWith(mockState, {}, expect.any(Number))
      expect(buildSimulationParams.buildRunSimulationParams).toHaveBeenCalledWith(
        mockState,
        expect.any(Number),
        mockReturnConfig,
        mockVariableInflationRates,
      )
      expect(runSimulation.runSimulation).toHaveBeenCalledWith(mockSimulationParams)
      expect(mockSetSimulationData).toHaveBeenCalledWith({
        sparplanElements: mockSimulationResult,
      })
      expect(mockSetIsLoading).toHaveBeenCalledWith(false)
    })
  })

  it('executes simulation with overridden rendite', async () => {
    const { result } = renderHook(() => useSimulationExecution(mockState, mockSetIsLoading, mockSetSimulationData))

    const overwrite = { rendite: 8 }
    await result.current.performSimulation(overwrite)

    await waitFor(() => {
      expect(buildSimulationParams.buildSimulationConfig).toHaveBeenCalledWith(mockState, overwrite, expect.any(Number))
    })
  })

  it('sets loading state correctly during simulation', async () => {
    const { result } = renderHook(() => useSimulationExecution(mockState, mockSetIsLoading, mockSetSimulationData))

    await result.current.performSimulation()

    await waitFor(() => {
      // Should call setIsLoading(true) first
      expect(mockSetIsLoading).toHaveBeenNthCalledWith(1, true)
      // Then setIsLoading(false) at the end
      expect(mockSetIsLoading).toHaveBeenNthCalledWith(2, false)
    })
  })

  it('handles simulation errors gracefully', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const error = new Error('Simulation failed')
    vi.mocked(runSimulation.runSimulation).mockImplementation(() => {
      throw error
    })

    const { result } = renderHook(() => useSimulationExecution(mockState, mockSetIsLoading, mockSetSimulationData))

    await result.current.performSimulation()

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Simulation error:', error)
      // Should still set loading to false after error
      expect(mockSetIsLoading).toHaveBeenCalledWith(false)
    })

    consoleErrorSpy.mockRestore()
  })

  it('does not recreate performSimulation when setters remain stable', () => {
    const { result, rerender } = renderHook(
      ({ state }) => useSimulationExecution(state, mockSetIsLoading, mockSetSimulationData),
      { initialProps: { state: mockState } },
    )

    const firstPerformSimulation = result.current.performSimulation

    // Rerender with the same state object - performSimulation should not change
    rerender({ state: mockState })

    expect(result.current.performSimulation).toBe(firstPerformSimulation)
  })

  it('recreates performSimulation when state changes', () => {
    const { result, rerender } = renderHook(
      ({ state }) => useSimulationExecution(state, mockSetIsLoading, mockSetSimulationData),
      { initialProps: { state: mockState } },
    )

    const firstPerformSimulation = result.current.performSimulation

    // Rerender with a different state object (e.g., changed rendite)
    const newState = { ...mockState, rendite: 10 }
    rerender({ state: newState })

    expect(result.current.performSimulation).not.toBe(firstPerformSimulation)
  })

  it('follows exhaustive-deps rule by including all dependencies', async () => {
    // This test verifies that the hook works correctly with all dependencies
    const updatedState = {
      ...mockState,
      rendite: 8,
      returnMode: 'random' as const,
      averageReturn: 9,
    }

    const { result } = renderHook(() => useSimulationExecution(updatedState, mockSetIsLoading, mockSetSimulationData))

    await result.current.performSimulation()

    await waitFor(() => {
      // Verify that the updated state is used in the simulation
      expect(buildSimulationParams.buildSimulationConfig).toHaveBeenCalledWith(
        expect.objectContaining({
          rendite: 8,
          returnMode: 'random',
          averageReturn: 9,
        }),
        {},
        expect.any(Number),
      )
    })
  })
})
