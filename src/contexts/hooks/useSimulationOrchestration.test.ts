import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSimulationOrchestration } from './useSimulationOrchestration'
import * as configManagement from './useConfigurationManagement'
import * as simulationExecution from './useSimulationExecution'
import * as simulationEffects from './useSimulationEffects'

// Mock the hooks
vi.mock('./useConfigurationManagement')
vi.mock('./useSimulationExecution')
vi.mock('./useSimulationEffects')

describe('useSimulationOrchestration', () => {
  const mockDefaultConfig = {
    rendite: 5,
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    startEnd: [2023, 2040] as [number, number],
    planningMode: 'individual' as const,
  }

  const mockState = {
    rendite: 5,
    setRendite: vi.fn(),
    steuerlast: 26.375,
    setSteuerlast: vi.fn(),
    teilfreistellungsquote: 30,
    setTeilfreistellungsquote: vi.fn(),
    freibetragPerYear: {},
    setFreibetragPerYear: vi.fn(),
    basiszinsConfiguration: { baseRate: 2.5, source: 'bundesbank' as const },
    setBasiszinsConfiguration: vi.fn(),
    steuerReduzierenEndkapitalSparphase: false,
    setSteuerReduzierenEndkapitalSparphase: vi.fn(),
    steuerReduzierenEndkapitalEntspharphase: false,
    setSteuerReduzierenEndkapitalEntspharphase: vi.fn(),
    grundfreibetragAktiv: false,
    setGrundfreibetragAktiv: vi.fn(),
    grundfreibetragBetrag: 11604,
    setGrundfreibetragBetrag: vi.fn(),
    personalTaxRate: 0,
    setPersonalTaxRate: vi.fn(),
    guenstigerPruefungAktiv: false,
    setGuenstigerPruefungAktiv: vi.fn(),
    kirchensteuerAktiv: false,
    setKirchensteuerAktiv: vi.fn(),
    kirchensteuersatz: 9,
    setKirchensteuersatz: vi.fn(),
    returnMode: 'fixed' as const,
    setReturnMode: vi.fn(),
    averageReturn: 5,
    setAverageReturn: vi.fn(),
    standardDeviation: 15,
    setStandardDeviation: vi.fn(),
    randomSeed: undefined,
    setRandomSeed: vi.fn(),
    variableReturns: {},
    setVariableReturns: vi.fn(),
    historicalIndex: 'MSCI_WORLD',
    setHistoricalIndex: vi.fn(),
    blackSwanReturns: null,
    inflationScenarioRates: null,
    inflationScenarioReturnModifiers: null,
    multiAssetConfig: { enabled: false, assetClasses: [] },
    inflationAktivSparphase: false,
    setInflationAktivSparphase: vi.fn(),
    inflationsrateSparphase: 2,
    setInflationsrateSparphase: vi.fn(),
    inflationAnwendungSparphase: 'sparplan' as const,
    setInflationAnwendungSparphase: vi.fn(),
    startEnd: [2023, 2040] as [number, number],
    setStartEnd: vi.fn(),
    sparplan: [],
    setSparplan: vi.fn(),
    simulationAnnual: 'yearly' as const,
    setSimulationAnnual: vi.fn(),
    sparplanElemente: [],
    setSparplanElemente: vi.fn(),
    endOfLife: 2070,
    setEndOfLife: vi.fn(),
    lifeExpectancyTable: 'german_2020_22' as const,
    setLifeExpectancyTable: vi.fn(),
    customLifeExpectancy: undefined,
    setCustomLifeExpectancy: vi.fn(),
    planningMode: 'individual' as const,
    setPlanningMode: vi.fn(),
    gender: undefined,
    setGender: vi.fn(),
    spouse: undefined,
    setSpouse: vi.fn(),
    birthYear: undefined,
    setBirthYear: vi.fn(),
    expectedLifespan: undefined,
    setExpectedLifespan: vi.fn(),
    useAutomaticCalculation: true,
    setUseAutomaticCalculation: vi.fn(),
    setIsLoading: vi.fn(),
    setSimulationData: vi.fn(),
    withdrawalConfig: null,
    setWithdrawalConfig: vi.fn(),
    statutoryPensionConfig: null,
    setStatutoryPensionConfig: vi.fn(),
    coupleStatutoryPensionConfig: null,
    setCoupleStatutoryPensionConfig: vi.fn(),
    careCostConfiguration: { enabled: false },
    setCareCostConfiguration: vi.fn(),
    financialGoals: [],
    setFinancialGoals: vi.fn(),
  }

  const mockConfigManagement = {
    getCurrentConfiguration: vi.fn(),
    saveCurrentConfiguration: vi.fn(),
    loadSavedConfiguration: vi.fn(),
    resetToDefaults: vi.fn(),
  }

  const mockPerformSimulation = vi.fn()
  const mockSetEndOfLifeRounded = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(configManagement.useConfigurationManagement).mockReturnValue(mockConfigManagement)
    vi.mocked(simulationExecution.useSimulationExecution).mockReturnValue({
      performSimulation: mockPerformSimulation,
    })
    vi.mocked(simulationEffects.useSimulationEffects).mockReturnValue({
      setEndOfLifeRounded: mockSetEndOfLifeRounded,
    })
  })

  it('returns configuration management methods', () => {
    const { result } = renderHook(() =>
      useSimulationOrchestration(mockDefaultConfig as any, mockState as any),
    )

    expect(result.current.configManagement).toBe(mockConfigManagement)
    expect(result.current.configManagement.getCurrentConfiguration).toBe(mockConfigManagement.getCurrentConfiguration)
    expect(result.current.configManagement.saveCurrentConfiguration).toBe(mockConfigManagement.saveCurrentConfiguration)
    expect(result.current.configManagement.loadSavedConfiguration).toBe(mockConfigManagement.loadSavedConfiguration)
    expect(result.current.configManagement.resetToDefaults).toBe(mockConfigManagement.resetToDefaults)
  })

  it('returns performSimulation method', () => {
    const { result } = renderHook(() =>
      useSimulationOrchestration(mockDefaultConfig as any, mockState as any),
    )

    expect(result.current.performSimulation).toBe(mockPerformSimulation)
  })

  it('returns setEndOfLifeRounded method', () => {
    const { result } = renderHook(() =>
      useSimulationOrchestration(mockDefaultConfig as any, mockState as any),
    )

    expect(result.current.setEndOfLifeRounded).toBe(mockSetEndOfLifeRounded)
  })

  it('calls useConfigurationManagement with correct state and setters', () => {
    renderHook(() =>
      useSimulationOrchestration(mockDefaultConfig as any, mockState as any),
    )

    expect(configManagement.useConfigurationManagement).toHaveBeenCalledWith(
      mockDefaultConfig,
      expect.objectContaining({
        rendite: 5,
        steuerlast: 26.375,
        teilfreistellungsquote: 30,
        startEnd: [2023, 2040],
      }),
      expect.objectContaining({
        setRendite: expect.any(Function),
        setSteuerlast: expect.any(Function),
        setTeilfreistellungsquote: expect.any(Function),
      }),
    )
  })

  it('calls useSimulationExecution with correct simulation state', () => {
    renderHook(() =>
      useSimulationOrchestration(mockDefaultConfig as any, mockState as any),
    )

    expect(simulationExecution.useSimulationExecution).toHaveBeenCalledWith(
      expect.objectContaining({
        rendite: 5,
        returnMode: 'fixed',
        averageReturn: 5,
        standardDeviation: 15,
      }),
      mockState.setIsLoading,
      mockState.setSimulationData,
    )
  })

  it('calls useSimulationEffects with correct effects state and setters', () => {
    renderHook(() =>
      useSimulationOrchestration(mockDefaultConfig as any, mockState as any),
    )

    expect(simulationEffects.useSimulationEffects).toHaveBeenCalledWith(
      expect.objectContaining({
        endOfLife: 2070,
        planningMode: 'individual',
      }),
      expect.objectContaining({
        setStartEnd: expect.any(Function),
        setFreibetragPerYear: expect.any(Function),
      }),
      mockConfigManagement.saveCurrentConfiguration,
    )
  })
})
