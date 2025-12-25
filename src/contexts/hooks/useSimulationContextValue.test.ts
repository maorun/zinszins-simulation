import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useSimulationContextValue } from './useSimulationContextValue'

describe('useSimulationContextValue', () => {
  const mockState = {
    // Tax values
    steuerlast: 26.375,
    setSteuerlast: vi.fn(),
    teilfreistellungsquote: 30,
    setTeilfreistellungsquote: vi.fn(),
    freibetragPerYear: { 2024: 2000 },
    setFreibetragPerYear: vi.fn(),
    basiszinsConfiguration: { 2024: { year: 2024, rate: 2.5, source: 'manual' } },
    setBasiszinsConfiguration: vi.fn(),
    steuerReduzierenEndkapitalSparphase: false,
    setSteuerReduzierenEndkapitalSparphase: vi.fn(),
    steuerReduzierenEndkapitalEntspharphase: false,
    setSteuerReduzierenEndkapitalEntspharphase: vi.fn(),
    grundfreibetragAktiv: false,
    setGrundfreibetragAktiv: vi.fn(),
    grundfreibetragBetrag: 11784,
    setGrundfreibetragBetrag: vi.fn(),
    personalTaxRate: 0,
    setPersonalTaxRate: vi.fn(),
    guenstigerPruefungAktiv: false,
    setGuenstigerPruefungAktiv: vi.fn(),
    kirchensteuerAktiv: false,
    setKirchensteuerAktiv: vi.fn(),
    kirchensteuersatz: 9,
    setKirchensteuersatz: vi.fn(),
    
    // Return values
    rendite: 5,
    setRendite: vi.fn(),
    returnMode: 'fixed',
    setReturnMode: vi.fn(),
    averageReturn: 7,
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
    setBlackSwanReturns: vi.fn(),
    blackSwanEventName: '',
    setBlackSwanEventName: vi.fn(),
    multiAssetConfig: null,
    setMultiAssetConfig: vi.fn(),
    withdrawalMultiAssetConfig: null,
    setWithdrawalMultiAssetConfig: vi.fn(),
    
    // Inflation values
    inflationScenarioRates: null,
    setInflationScenarioRates: vi.fn(),
    inflationScenarioReturnModifiers: null,
    setInflationScenarioReturnModifiers: vi.fn(),
    inflationScenarioName: '',
    setInflationScenarioName: vi.fn(),
    inflationAktivSparphase: false,
    setInflationAktivSparphase: vi.fn(),
    inflationsrateSparphase: 2,
    setInflationsrateSparphase: vi.fn(),
    inflationAnwendungSparphase: 'sparplan',
    setInflationAnwendungSparphase: vi.fn(),
    
    // Sparplan values
    startEnd: [2040, 2023],
    setStartEnd: vi.fn(),
    sparplan: 1000,
    setSparplan: vi.fn(),
    simulationAnnual: 'yearly',
    setSimulationAnnual: vi.fn(),
    sparplanElemente: [],
    setSparplanElemente: vi.fn(),
    
    // Life values
    endOfLife: 2080,
    lifeExpectancyTable: 'destatis2023',
    setLifeExpectancyTable: vi.fn(),
    customLifeExpectancy: null,
    setCustomLifeExpectancy: vi.fn(),
    planningMode: 'retirement',
    setPlanningMode: vi.fn(),
    gender: 'male',
    setGender: vi.fn(),
    spouse: null,
    setSpouse: vi.fn(),
    birthYear: 1980,
    setBirthYear: vi.fn(),
    expectedLifespan: 85,
    setExpectedLifespan: vi.fn(),
    useAutomaticCalculation: true,
    setUseAutomaticCalculation: vi.fn(),
    
    // Withdrawal values
    withdrawalResults: null,
    setWithdrawalResults: vi.fn(),
    withdrawalConfig: null,
    setWithdrawalConfig: vi.fn(),
    
    // Other config values
    statutoryPensionConfig: null,
    setStatutoryPensionConfig: vi.fn(),
    coupleStatutoryPensionConfig: null,
    setCoupleStatutoryPensionConfig: vi.fn(),
    careCostConfiguration: null,
    setCareCostConfiguration: vi.fn(),
    financialGoals: [],
    setFinancialGoals: vi.fn(),
    
    // Simulation data
    simulationData: null,
    isLoading: false,
  }

  const mockConfigManagement = {
    getCurrentConfiguration: vi.fn(),
    saveCurrentConfiguration: vi.fn(),
    loadSavedConfiguration: vi.fn(),
    resetToDefaults: vi.fn(),
  }

  const mockPerformSimulation = vi.fn()
  const mockSetEndOfLifeRounded = vi.fn()

  it('returns context value with all required properties', () => {
    const { result } = renderHook(() =>
      useSimulationContextValue(mockState, mockConfigManagement, mockPerformSimulation, mockSetEndOfLifeRounded),
    )

    // Check return values are present
    expect(result.current.rendite).toBe(5)
    expect(result.current.setRendite).toBeDefined()
    expect(result.current.returnMode).toBe('fixed')
    expect(result.current.setReturnMode).toBeDefined()
    expect(result.current.averageReturn).toBe(7)
    expect(result.current.setAverageReturn).toBeDefined()
    expect(result.current.standardDeviation).toBe(15)
    expect(result.current.setStandardDeviation).toBeDefined()
    expect(result.current.randomSeed).toBeUndefined()
    expect(result.current.setRandomSeed).toBeDefined()
    expect(result.current.variableReturns).toEqual({})
    expect(result.current.setVariableReturns).toBeDefined()
    expect(result.current.historicalIndex).toBe('MSCI_WORLD')
    expect(result.current.setHistoricalIndex).toBeDefined()
    expect(result.current.blackSwanReturns).toBeNull()
    expect(result.current.setBlackSwanReturns).toBeDefined()
    expect(result.current.blackSwanEventName).toBe('')
    expect(result.current.setBlackSwanEventName).toBeDefined()
    expect(result.current.multiAssetConfig).toBeNull()
    expect(result.current.setMultiAssetConfig).toBeDefined()
    expect(result.current.withdrawalMultiAssetConfig).toBeNull()
    expect(result.current.setWithdrawalMultiAssetConfig).toBeDefined()
  })

  it('returns context value with tax properties', () => {
    const { result } = renderHook(() =>
      useSimulationContextValue(mockState, mockConfigManagement, mockPerformSimulation, mockSetEndOfLifeRounded),
    )

    expect(result.current.steuerlast).toBe(26.375)
    expect(result.current.setSteuerlast).toBeDefined()
    expect(result.current.teilfreistellungsquote).toBe(30)
    expect(result.current.setTeilfreistellungsquote).toBeDefined()
  })

  it('returns context value with simulation properties', () => {
    const { result } = renderHook(() =>
      useSimulationContextValue(mockState, mockConfigManagement, mockPerformSimulation, mockSetEndOfLifeRounded),
    )

    expect(result.current.simulationData).toBeNull()
    expect(result.current.isLoading).toBe(false)
    expect(result.current.performSimulation).toBe(mockPerformSimulation)
  })

  it('returns context value with config management functions', () => {
    const { result } = renderHook(() =>
      useSimulationContextValue(mockState, mockConfigManagement, mockPerformSimulation, mockSetEndOfLifeRounded),
    )

    expect(result.current.getCurrentConfiguration).toBe(mockConfigManagement.getCurrentConfiguration)
    expect(result.current.saveCurrentConfiguration).toBe(mockConfigManagement.saveCurrentConfiguration)
    expect(result.current.loadSavedConfiguration).toBe(mockConfigManagement.loadSavedConfiguration)
    expect(result.current.resetToDefaults).toBe(mockConfigManagement.resetToDefaults)
  })

  it('memoizes context value correctly', () => {
    const { result, rerender } = renderHook(() =>
      useSimulationContextValue(mockState, mockConfigManagement, mockPerformSimulation, mockSetEndOfLifeRounded),
    )

    const firstResult = result.current

    // Rerender without changing props - should return same reference
    rerender()

    expect(result.current).toBe(firstResult)
  })

  it('updates context value when state changes', () => {
    const { result, rerender } = renderHook(
      ({ state }) => useSimulationContextValue(state, mockConfigManagement, mockPerformSimulation, mockSetEndOfLifeRounded),
      { initialProps: { state: mockState } },
    )

    const firstRendite = result.current.rendite

    // Update state with new rendite value
    const newState = { ...mockState, rendite: 8 }
    rerender({ state: newState })

    expect(result.current.rendite).toBe(8)
    expect(result.current.rendite).not.toBe(firstRendite)
  })

  it('includes all return mode related values', () => {
    const { result } = renderHook(() =>
      useSimulationContextValue(mockState, mockConfigManagement, mockPerformSimulation, mockSetEndOfLifeRounded),
    )

    // Basic return
    expect(result.current).toHaveProperty('rendite')
    expect(result.current).toHaveProperty('setRendite')
    expect(result.current).toHaveProperty('returnMode')
    expect(result.current).toHaveProperty('setReturnMode')

    // Random return
    expect(result.current).toHaveProperty('averageReturn')
    expect(result.current).toHaveProperty('setAverageReturn')
    expect(result.current).toHaveProperty('standardDeviation')
    expect(result.current).toHaveProperty('setStandardDeviation')
    expect(result.current).toHaveProperty('randomSeed')
    expect(result.current).toHaveProperty('setRandomSeed')

    // Variable return
    expect(result.current).toHaveProperty('variableReturns')
    expect(result.current).toHaveProperty('setVariableReturns')

    // Historical return
    expect(result.current).toHaveProperty('historicalIndex')
    expect(result.current).toHaveProperty('setHistoricalIndex')

    // Black swan
    expect(result.current).toHaveProperty('blackSwanReturns')
    expect(result.current).toHaveProperty('setBlackSwanReturns')
    expect(result.current).toHaveProperty('blackSwanEventName')
    expect(result.current).toHaveProperty('setBlackSwanEventName')

    // Multi-asset
    expect(result.current).toHaveProperty('multiAssetConfig')
    expect(result.current).toHaveProperty('setMultiAssetConfig')
    expect(result.current).toHaveProperty('withdrawalMultiAssetConfig')
    expect(result.current).toHaveProperty('setWithdrawalMultiAssetConfig')
  })

  describe('useLifeValues integration', () => {
    it('should use custom setEndOfLife handler instead of state setter', () => {
      const customSetEndOfLife = vi.fn()

      const { result } = renderHook(() =>
        useSimulationContextValue(mockState, mockConfigManagement, mockPerformSimulation, customSetEndOfLife),
      )

      // The important assertion: setEndOfLife should be the custom handler, not the state setter
      expect(result.current.setEndOfLife).toBe(customSetEndOfLife)
    })

    it('should properly memoize and return all life expectancy values', () => {
      const customSetEndOfLife = vi.fn()

      const { result } = renderHook(() =>
        useSimulationContextValue(mockState, mockConfigManagement, mockPerformSimulation, customSetEndOfLife),
      )

      // Verify life values are present in the context
      expect(result.current.endOfLife).toBe(2080)
      expect(result.current.setEndOfLife).toBe(customSetEndOfLife)
      expect(result.current.lifeExpectancyTable).toBe('destatis2023')
      expect(result.current.setLifeExpectancyTable).toBeDefined()
      expect(result.current.customLifeExpectancy).toBeNull()
      expect(result.current.setCustomLifeExpectancy).toBeDefined()
      expect(result.current.planningMode).toBe('retirement')
      expect(result.current.setPlanningMode).toBeDefined()
      expect(result.current.gender).toBe('male')
      expect(result.current.setGender).toBeDefined()
      expect(result.current.spouse).toBeNull()
      expect(result.current.setSpouse).toBeDefined()
      expect(result.current.birthYear).toBe(1980)
      expect(result.current.setBirthYear).toBeDefined()
      expect(result.current.expectedLifespan).toBe(85)
      expect(result.current.setExpectedLifespan).toBeDefined()
      expect(result.current.useAutomaticCalculation).toBe(true)
      expect(result.current.setUseAutomaticCalculation).toBeDefined()
    })
  })
})
