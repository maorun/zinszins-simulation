import { useMemo } from 'react'
import type { SimulationContextState } from '../SimulationContext'

/**
 * Hook for capital gains tax related values
 */
function useCapitalGainsTaxValues(state: Record<string, unknown>) {
  const {
    steuerlast,
    setSteuerlast,
    teilfreistellungsquote,
    setTeilfreistellungsquote,
    freibetragPerYear,
    setFreibetragPerYear,
    basiszinsConfiguration,
    setBasiszinsConfiguration,
  } = state
  return useMemo(
    () => ({
      steuerlast,
      setSteuerlast,
      teilfreistellungsquote,
      setTeilfreistellungsquote,
      freibetragPerYear,
      setFreibetragPerYear,
      basiszinsConfiguration,
      setBasiszinsConfiguration,
    }),
    [steuerlast, setSteuerlast, teilfreistellungsquote, setTeilfreistellungsquote, freibetragPerYear, setFreibetragPerYear, basiszinsConfiguration, setBasiszinsConfiguration],
  )
}

/**
 * Hook for tax reduction settings in accumulation and withdrawal phases
 */
function useTaxReductionValues(state: Record<string, unknown>) {
  const {
    steuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase,
    setSteuerReduzierenEndkapitalEntspharphase,
  } = state
  return useMemo(
    () => ({
      steuerReduzierenEndkapitalSparphase,
      setSteuerReduzierenEndkapitalSparphase,
      steuerReduzierenEndkapitalEntspharphase,
      setSteuerReduzierenEndkapitalEntspharphase,
    }),
    [steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase, steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase],
  )
}

/**
 * Hook for personal income tax related values
 */
function usePersonalTaxValues(state: Record<string, unknown>) {
  const {
    grundfreibetragAktiv,
    setGrundfreibetragAktiv,
    grundfreibetragBetrag,
    setGrundfreibetragBetrag,
    personalTaxRate,
    setPersonalTaxRate,
    guenstigerPruefungAktiv,
    setGuenstigerPruefungAktiv,
  } = state
  return useMemo(
    () => ({
      grundfreibetragAktiv,
      setGrundfreibetragAktiv,
      grundfreibetragBetrag,
      setGrundfreibetragBetrag,
      personalTaxRate,
      setPersonalTaxRate,
      guenstigerPruefungAktiv,
      setGuenstigerPruefungAktiv,
    }),
    [grundfreibetragAktiv, setGrundfreibetragAktiv, grundfreibetragBetrag, setGrundfreibetragBetrag, personalTaxRate, setPersonalTaxRate, guenstigerPruefungAktiv, setGuenstigerPruefungAktiv],
  )
}

/**
 * Hook for church tax related values
 */
function useChurchTaxValues(state: Record<string, unknown>) {
  const { kirchensteuerAktiv, setKirchensteuerAktiv, kirchensteuersatz, setKirchensteuersatz } = state
  return useMemo(
    () => ({
      kirchensteuerAktiv,
      setKirchensteuerAktiv,
      kirchensteuersatz,
      setKirchensteuersatz,
    }),
    [kirchensteuerAktiv, setKirchensteuerAktiv, kirchensteuersatz, setKirchensteuersatz],
  )
}

/**
 * Main hook that combines all tax-related values
 */
function useTaxValues(state: Record<string, unknown>) {
  const capitalGainsTax = useCapitalGainsTaxValues(state)
  const taxReduction = useTaxReductionValues(state)
  const personalTax = usePersonalTaxValues(state)
  const churchTax = useChurchTaxValues(state)

  return useMemo(
    () => ({
      ...capitalGainsTax,
      ...taxReduction,
      ...personalTax,
      ...churchTax,
    }),
    [capitalGainsTax, taxReduction, personalTax, churchTax],
  )
}

/**
 * Hook for basic return values (fixed return rate and return mode)
 */
function useBasicReturnValues(state: Record<string, unknown>) {
  const { rendite, setRendite, returnMode, setReturnMode } = state
  return useMemo(
    () => ({
      rendite,
      setRendite,
      returnMode,
      setReturnMode,
    }),
    [rendite, setRendite, returnMode, setReturnMode],
  )
}

/**
 * Hook for random return configuration values
 */
function useRandomReturnValues(state: Record<string, unknown>) {
  const {
    averageReturn,
    setAverageReturn,
    standardDeviation,
    setStandardDeviation,
    randomSeed,
    setRandomSeed,
  } = state
  return useMemo(
    () => ({
      averageReturn,
      setAverageReturn,
      standardDeviation,
      setStandardDeviation,
      randomSeed,
      setRandomSeed,
    }),
    [averageReturn, setAverageReturn, standardDeviation, setStandardDeviation, randomSeed, setRandomSeed],
  )
}

/**
 * Hook for advanced return configuration values (variable, historical, black swan)
 */
function useAdvancedReturnValues(state: Record<string, unknown>) {
  const {
    variableReturns,
    setVariableReturns,
    historicalIndex,
    setHistoricalIndex,
    blackSwanReturns,
    setBlackSwanReturns,
    blackSwanEventName,
    setBlackSwanEventName,
  } = state
  return useMemo(
    () => ({
      variableReturns,
      setVariableReturns,
      historicalIndex,
      setHistoricalIndex,
      blackSwanReturns,
      setBlackSwanReturns,
      blackSwanEventName,
      setBlackSwanEventName,
    }),
    [
      variableReturns,
      setVariableReturns,
      historicalIndex,
      setHistoricalIndex,
      blackSwanReturns,
      setBlackSwanReturns,
      blackSwanEventName,
      setBlackSwanEventName,
    ],
  )
}

/**
 * Hook for multi-asset portfolio configuration values
 */
function useMultiAssetValues(state: Record<string, unknown>) {
  const { multiAssetConfig, setMultiAssetConfig, withdrawalMultiAssetConfig, setWithdrawalMultiAssetConfig } = state
  return useMemo(
    () => ({
      multiAssetConfig,
      setMultiAssetConfig,
      withdrawalMultiAssetConfig,
      setWithdrawalMultiAssetConfig,
    }),
    [multiAssetConfig, setMultiAssetConfig, withdrawalMultiAssetConfig, setWithdrawalMultiAssetConfig],
  )
}

/**
 * Hook for all return-related values, composing the various return value hooks
 */
function useReturnValues(state: Record<string, unknown>) {
  const basicReturnValues = useBasicReturnValues(state)
  const randomReturnValues = useRandomReturnValues(state)
  const advancedReturnValues = useAdvancedReturnValues(state)
  const multiAssetValues = useMultiAssetValues(state)

  return useMemo(
    () => ({
      ...basicReturnValues,
      ...randomReturnValues,
      ...advancedReturnValues,
      ...multiAssetValues,
    }),
    [basicReturnValues, randomReturnValues, advancedReturnValues, multiAssetValues],
  )
}

function useInflationValues(state: Record<string, unknown>) {
  const {
    inflationScenarioRates,
    setInflationScenarioRates,
    inflationScenarioReturnModifiers,
    setInflationScenarioReturnModifiers,
    inflationScenarioName,
    setInflationScenarioName,
    inflationAktivSparphase,
    setInflationAktivSparphase,
    inflationsrateSparphase,
    setInflationsrateSparphase,
    inflationAnwendungSparphase,
    setInflationAnwendungSparphase,
  } = state
  return useMemo(
    () => ({
      inflationScenarioRates,
      setInflationScenarioRates,
      inflationScenarioReturnModifiers,
      setInflationScenarioReturnModifiers,
      inflationScenarioName,
      setInflationScenarioName,
      inflationAktivSparphase,
      setInflationAktivSparphase,
      inflationsrateSparphase,
      setInflationsrateSparphase,
      inflationAnwendungSparphase,
      setInflationAnwendungSparphase,
    }),
    [
      inflationScenarioRates,
      setInflationScenarioRates,
      inflationScenarioReturnModifiers,
      setInflationScenarioReturnModifiers,
      inflationScenarioName,
      setInflationScenarioName,
      inflationAktivSparphase,
      setInflationAktivSparphase,
      inflationsrateSparphase,
      setInflationsrateSparphase,
      inflationAnwendungSparphase,
      setInflationAnwendungSparphase,
    ],
  )
}

function useSparplanValues(state: Record<string, unknown>) {
  const {
    startEnd,
    setStartEnd,
    sparplan,
    setSparplan,
    simulationAnnual,
    setSimulationAnnual,
    sparplanElemente,
    setSparplanElemente,
  } = state
  return useMemo(
    () => ({
      startEnd,
      setStartEnd,
      sparplan,
      setSparplan,
      simulationAnnual,
      setSimulationAnnual,
      sparplanElemente,
      setSparplanElemente,
    }),
    [
      startEnd,
      setStartEnd,
      sparplan,
      setSparplan,
      simulationAnnual,
      setSimulationAnnual,
      sparplanElemente,
      setSparplanElemente,
    ],
  )
}

function useLifeValues(state: Record<string, unknown>, setEndOfLifeRounded: (value: number) => void) {
  const {
    endOfLife, lifeExpectancyTable, setLifeExpectancyTable,
    customLifeExpectancy, setCustomLifeExpectancy, planningMode, setPlanningMode,
    gender, setGender, spouse, setSpouse, birthYear, setBirthYear,
    expectedLifespan, setExpectedLifespan, useAutomaticCalculation, setUseAutomaticCalculation,
  } = state as {
    endOfLife: unknown; lifeExpectancyTable: unknown; setLifeExpectancyTable: unknown
    customLifeExpectancy: unknown; setCustomLifeExpectancy: unknown; planningMode: unknown
    setPlanningMode: unknown; gender: unknown; setGender: unknown; spouse: unknown
    setSpouse: unknown; birthYear: unknown; setBirthYear: unknown
    expectedLifespan: unknown; setExpectedLifespan: unknown
    useAutomaticCalculation: unknown; setUseAutomaticCalculation: unknown
  }
   
  return useMemo(
    () => ({
      endOfLife, setEndOfLife: setEndOfLifeRounded,
      lifeExpectancyTable, setLifeExpectancyTable,
      customLifeExpectancy, setCustomLifeExpectancy,
      planningMode, setPlanningMode,
      gender, setGender,
      spouse, setSpouse,
      birthYear, setBirthYear,
      expectedLifespan, setExpectedLifespan,
      useAutomaticCalculation, setUseAutomaticCalculation,
    }),
    [
      endOfLife, setEndOfLifeRounded, lifeExpectancyTable, setLifeExpectancyTable,
      customLifeExpectancy, setCustomLifeExpectancy, planningMode, setPlanningMode,
      gender, setGender, spouse, setSpouse, birthYear, setBirthYear,
      expectedLifespan, setExpectedLifespan, useAutomaticCalculation, setUseAutomaticCalculation,
    ],
  )
}

function useWithdrawalValues(state: Record<string, unknown>) {
  const { withdrawalResults, setWithdrawalResults, withdrawalConfig, setWithdrawalConfig } = state
  return useMemo(
    () => ({
      withdrawalResults,
      setWithdrawalResults,
      withdrawalConfig,
      setWithdrawalConfig,
    }),
    [withdrawalResults, setWithdrawalResults, withdrawalConfig, setWithdrawalConfig],
  )
}

function useOtherConfigValues(state: Record<string, unknown>) {
  const {
    statutoryPensionConfig,
    setStatutoryPensionConfig,
    coupleStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig,
    careCostConfiguration,
    setCareCostConfiguration,
    financialGoals,
    setFinancialGoals,
    emergencyFundConfig,
    setEmergencyFundConfig,
    termLifeInsuranceConfig,
    setTermLifeInsuranceConfig,
  } = state
  return useMemo(
    () => ({
      statutoryPensionConfig,
      setStatutoryPensionConfig,
      coupleStatutoryPensionConfig,
      setCoupleStatutoryPensionConfig,
      careCostConfiguration,
      setCareCostConfiguration,
      financialGoals,
      setFinancialGoals,
      emergencyFundConfig,
      setEmergencyFundConfig,
      termLifeInsuranceConfig,
      setTermLifeInsuranceConfig,
    }),
    [
      statutoryPensionConfig,
      setStatutoryPensionConfig,
      coupleStatutoryPensionConfig,
      setCoupleStatutoryPensionConfig,
      careCostConfiguration,
      setCareCostConfiguration,
      financialGoals,
      setFinancialGoals,
      emergencyFundConfig,
      setEmergencyFundConfig,
      termLifeInsuranceConfig,
      setTermLifeInsuranceConfig,
    ],
  )
}

/**
 * Custom hook to build the SimulationContext value object
 * Extracted from SimulationProvider to reduce complexity
 */
export function useSimulationContextValue(
  state: Record<string, unknown>,
  configManagement: {
    getCurrentConfiguration: () => unknown
    saveCurrentConfiguration: (name: string) => void
    loadSavedConfiguration: (config: unknown) => void
    resetToDefaults: () => void
  },
  performSimulation: () => void,
  setEndOfLifeRounded: (value: number) => void,
): SimulationContextState {
  const taxValues = useTaxValues(state)
  const returnValues = useReturnValues(state)
  const inflationValues = useInflationValues(state)
  const sparplanValues = useSparplanValues(state)
  const lifeValues = useLifeValues(state, setEndOfLifeRounded)
  const withdrawalValues = useWithdrawalValues(state)
  const otherConfigValues = useOtherConfigValues(state)

  const { simulationData, isLoading } = state

  return useMemo(
    () =>
      ({
        ...taxValues,
        ...returnValues,
        ...inflationValues,
        ...sparplanValues,
        ...lifeValues,
        ...withdrawalValues,
        ...otherConfigValues,
        simulationData,
        isLoading,
        performSimulation,
        ...configManagement,
      }) as SimulationContextState,
    [
      taxValues,
      returnValues,
      inflationValues,
      sparplanValues,
      lifeValues,
      withdrawalValues,
      otherConfigValues,
      simulationData,
      isLoading,
      performSimulation,
      configManagement,
    ],
  )
}
