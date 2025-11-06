import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSimulationContextValue } from './useSimulationContextValue'

describe('useSimulationContextValue', () => {
  describe('useLifeValues integration', () => {
    it('should properly memoize and return life expectancy values', () => {
      const mockState = {
        endOfLife: 2050,
        lifeExpectancyTable: 'male',
        setLifeExpectancyTable: () => {},
        customLifeExpectancy: 85,
        setCustomLifeExpectancy: () => {},
        planningMode: 'retirement',
        setPlanningMode: () => {},
        gender: 'male',
        setGender: () => {},
        spouse: null,
        setSpouse: () => {},
        birthYear: 1980,
        setBirthYear: () => {},
        expectedLifespan: 85,
        setExpectedLifespan: () => {},
        useAutomaticCalculation: true,
        setUseAutomaticCalculation: () => {},
        // Add minimal required properties for other hooks
        steuerlast: 0.26375,
        setSteuerlast: () => {},
        teilfreistellungsquote: 0.3,
        setTeilfreistellungsquote: () => {},
        freibetragPerYear: {},
        setFreibetragPerYear: () => {},
        basiszinsConfiguration: {},
        setBasiszinsConfiguration: () => {},
        steuerReduzierenEndkapitalSparphase: false,
        setSteuerReduzierenEndkapitalSparphase: () => {},
        steuerReduzierenEndkapitalEntspharphase: false,
        setSteuerReduzierenEndkapitalEntspharphase: () => {},
        grundfreibetragAktiv: false,
        setGrundfreibetragAktiv: () => {},
        grundfreibetragBetrag: 0,
        setGrundfreibetragBetrag: () => {},
        personalTaxRate: 0,
        setPersonalTaxRate: () => {},
        guenstigerPruefungAktiv: false,
        setGuenstigerPruefungAktiv: () => {},
        kirchensteuerAktiv: false,
        setKirchensteuerAktiv: () => {},
        kirchensteuersatz: 0,
        setKirchensteuersatz: () => {},
        rendite: 0.05,
        setRendite: () => {},
        returnMode: 'fixed',
        setReturnMode: () => {},
        averageReturn: 0.05,
        setAverageReturn: () => {},
        standardDeviation: 0.15,
        setStandardDeviation: () => {},
        randomSeed: '',
        setRandomSeed: () => {},
        variableReturns: {},
        setVariableReturns: () => {},
        historicalIndex: 'SP500',
        setHistoricalIndex: () => {},
        blackSwanReturns: {},
        setBlackSwanReturns: () => {},
        blackSwanEventName: '',
        setBlackSwanEventName: () => {},
        multiAssetConfig: {},
        setMultiAssetConfig: () => {},
        withdrawalMultiAssetConfig: {},
        setWithdrawalMultiAssetConfig: () => {},
        inflationScenarioRates: {},
        setInflationScenarioRates: () => {},
        inflationScenarioReturnModifiers: {},
        setInflationScenarioReturnModifiers: () => {},
        inflationScenarioName: '',
        setInflationScenarioName: () => {},
        inflationAktivSparphase: false,
        setInflationAktivSparphase: () => {},
        inflationsrateSparphase: 0,
        setInflationsrateSparphase: () => {},
        inflationAnwendungSparphase: '',
        setInflationAnwendungSparphase: () => {},
        startEnd: [2024, 2050],
        setStartEnd: () => {},
        sparplan: {},
        setSparplan: () => {},
        simulationAnnual: true,
        setSimulationAnnual: () => {},
        sparplanElemente: [],
        setSparplanElemente: () => {},
        withdrawalResults: null,
        setWithdrawalResults: () => {},
        withdrawalConfig: {},
        setWithdrawalConfig: () => {},
        statutoryPensionConfig: {},
        setStatutoryPensionConfig: () => {},
        coupleStatutoryPensionConfig: {},
        setCoupleStatutoryPensionConfig: () => {},
        careCostConfiguration: {},
        setCareCostConfiguration: () => {},
        financialGoals: [],
        setFinancialGoals: () => {},
        simulationData: null,
        isLoading: false,
      }

      const mockSetEndOfLifeRounded = (value: number) => value
      const mockConfigManagement = {
        getCurrentConfiguration: () => ({}),
        saveCurrentConfiguration: () => {},
        loadSavedConfiguration: () => {},
        resetToDefaults: () => {},
      }
      const mockPerformSimulation = () => {}

      const { result } = renderHook(() =>
        useSimulationContextValue(mockState, mockConfigManagement, mockPerformSimulation, mockSetEndOfLifeRounded),
      )

      // Verify life values are present in the context
      expect(result.current.endOfLife).toBe(2050)
      expect(result.current.setEndOfLife).toBe(mockSetEndOfLifeRounded)
      expect(result.current.lifeExpectancyTable).toBe('male')
      expect(result.current.customLifeExpectancy).toBe(85)
      expect(result.current.planningMode).toBe('retirement')
      expect(result.current.gender).toBe('male')
      expect(result.current.spouse).toBe(null)
      expect(result.current.birthYear).toBe(1980)
      expect(result.current.expectedLifespan).toBe(85)
      expect(result.current.useAutomaticCalculation).toBe(true)
    })

    it('should use custom setEndOfLife handler instead of state setter', () => {
      const mockState = {
        endOfLife: 2050,
        setEndOfLife: () => {}, // This should NOT be used
        lifeExpectancyTable: 'male',
        setLifeExpectancyTable: () => {},
        customLifeExpectancy: 85,
        setCustomLifeExpectancy: () => {},
        planningMode: 'retirement',
        setPlanningMode: () => {},
        gender: 'male',
        setGender: () => {},
        spouse: null,
        setSpouse: () => {},
        birthYear: 1980,
        setBirthYear: () => {},
        expectedLifespan: 85,
        setExpectedLifespan: () => {},
        useAutomaticCalculation: true,
        setUseAutomaticCalculation: () => {},
        // Add minimal required properties
        steuerlast: 0.26375,
        setSteuerlast: () => {},
        teilfreistellungsquote: 0.3,
        setTeilfreistellungsquote: () => {},
        freibetragPerYear: {},
        setFreibetragPerYear: () => {},
        basiszinsConfiguration: {},
        setBasiszinsConfiguration: () => {},
        steuerReduzierenEndkapitalSparphase: false,
        setSteuerReduzierenEndkapitalSparphase: () => {},
        steuerReduzierenEndkapitalEntspharphase: false,
        setSteuerReduzierenEndkapitalEntspharphase: () => {},
        grundfreibetragAktiv: false,
        setGrundfreibetragAktiv: () => {},
        grundfreibetragBetrag: 0,
        setGrundfreibetragBetrag: () => {},
        personalTaxRate: 0,
        setPersonalTaxRate: () => {},
        guenstigerPruefungAktiv: false,
        setGuenstigerPruefungAktiv: () => {},
        kirchensteuerAktiv: false,
        setKirchensteuerAktiv: () => {},
        kirchensteuersatz: 0,
        setKirchensteuersatz: () => {},
        rendite: 0.05,
        setRendite: () => {},
        returnMode: 'fixed',
        setReturnMode: () => {},
        averageReturn: 0.05,
        setAverageReturn: () => {},
        standardDeviation: 0.15,
        setStandardDeviation: () => {},
        randomSeed: '',
        setRandomSeed: () => {},
        variableReturns: {},
        setVariableReturns: () => {},
        historicalIndex: 'SP500',
        setHistoricalIndex: () => {},
        blackSwanReturns: {},
        setBlackSwanReturns: () => {},
        blackSwanEventName: '',
        setBlackSwanEventName: () => {},
        multiAssetConfig: {},
        setMultiAssetConfig: () => {},
        withdrawalMultiAssetConfig: {},
        setWithdrawalMultiAssetConfig: () => {},
        inflationScenarioRates: {},
        setInflationScenarioRates: () => {},
        inflationScenarioReturnModifiers: {},
        setInflationScenarioReturnModifiers: () => {},
        inflationScenarioName: '',
        setInflationScenarioName: () => {},
        inflationAktivSparphase: false,
        setInflationAktivSparphase: () => {},
        inflationsrateSparphase: 0,
        setInflationsrateSparphase: () => {},
        inflationAnwendungSparphase: '',
        setInflationAnwendungSparphase: () => {},
        startEnd: [2024, 2050],
        setStartEnd: () => {},
        sparplan: {},
        setSparplan: () => {},
        simulationAnnual: true,
        setSimulationAnnual: () => {},
        sparplanElemente: [],
        setSparplanElemente: () => {},
        withdrawalResults: null,
        setWithdrawalResults: () => {},
        withdrawalConfig: {},
        setWithdrawalConfig: () => {},
        statutoryPensionConfig: {},
        setStatutoryPensionConfig: () => {},
        coupleStatutoryPensionConfig: {},
        setCoupleStatutoryPensionConfig: () => {},
        careCostConfiguration: {},
        setCareCostConfiguration: () => {},
        financialGoals: [],
        setFinancialGoals: () => {},
        simulationData: null,
        isLoading: false,
      }

      const mockSetEndOfLifeRounded = (value: number) => value
      const mockConfigManagement = {
        getCurrentConfiguration: () => ({}),
        saveCurrentConfiguration: () => {},
        loadSavedConfiguration: () => {},
        resetToDefaults: () => {},
      }
      const mockPerformSimulation = () => {}

      const { result } = renderHook(() =>
        useSimulationContextValue(mockState, mockConfigManagement, mockPerformSimulation, mockSetEndOfLifeRounded),
      )

      // The important assertion: setEndOfLife should be the custom handler, not the state setter
      expect(result.current.setEndOfLife).toBe(mockSetEndOfLifeRounded)
      expect(result.current.setEndOfLife).not.toBe(mockState.setEndOfLife)
    })
  })
})
