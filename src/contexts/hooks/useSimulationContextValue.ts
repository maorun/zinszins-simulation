import { useMemo } from 'react'
import type { SimulationContextState } from '../SimulationContext'

function useTaxValues(state: Record<string, unknown>) {
  const {
    steuerlast, setSteuerlast,
    teilfreistellungsquote, setTeilfreistellungsquote,
    freibetragPerYear, setFreibetragPerYear,
    basiszinsConfiguration, setBasiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, setGrundfreibetragAktiv,
    grundfreibetragBetrag, setGrundfreibetragBetrag,
    personalTaxRate, setPersonalTaxRate,
    guenstigerPruefungAktiv, setGuenstigerPruefungAktiv,
    kirchensteuerAktiv, setKirchensteuerAktiv,
    kirchensteuersatz, setKirchensteuersatz,
  } = state
  return useMemo(() => ({
    steuerlast, setSteuerlast,
    teilfreistellungsquote, setTeilfreistellungsquote,
    freibetragPerYear, setFreibetragPerYear,
    basiszinsConfiguration, setBasiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, setGrundfreibetragAktiv,
    grundfreibetragBetrag, setGrundfreibetragBetrag,
    personalTaxRate, setPersonalTaxRate,
    guenstigerPruefungAktiv, setGuenstigerPruefungAktiv,
    kirchensteuerAktiv, setKirchensteuerAktiv,
    kirchensteuersatz, setKirchensteuersatz,
  }), [
    steuerlast, setSteuerlast,
    teilfreistellungsquote, setTeilfreistellungsquote,
    freibetragPerYear, setFreibetragPerYear,
    basiszinsConfiguration, setBasiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, setGrundfreibetragAktiv,
    grundfreibetragBetrag, setGrundfreibetragBetrag,
    personalTaxRate, setPersonalTaxRate,
    guenstigerPruefungAktiv, setGuenstigerPruefungAktiv,
    kirchensteuerAktiv, setKirchensteuerAktiv,
    kirchensteuersatz, setKirchensteuersatz,
  ])
}

function useReturnValues(state: Record<string, unknown>) {
  const {
    rendite, setRendite,
    returnMode, setReturnMode,
    averageReturn, setAverageReturn,
    standardDeviation, setStandardDeviation,
    randomSeed, setRandomSeed,
    variableReturns, setVariableReturns,
    historicalIndex, setHistoricalIndex,
    blackSwanReturns, setBlackSwanReturns,
    blackSwanEventName, setBlackSwanEventName,
    multiAssetConfig, setMultiAssetConfig,
    withdrawalMultiAssetConfig, setWithdrawalMultiAssetConfig,
  } = state
  return useMemo(() => ({
    rendite, setRendite,
    returnMode, setReturnMode,
    averageReturn, setAverageReturn,
    standardDeviation, setStandardDeviation,
    randomSeed, setRandomSeed,
    variableReturns, setVariableReturns,
    historicalIndex, setHistoricalIndex,
    blackSwanReturns, setBlackSwanReturns,
    blackSwanEventName, setBlackSwanEventName,
    multiAssetConfig, setMultiAssetConfig,
    withdrawalMultiAssetConfig, setWithdrawalMultiAssetConfig,
  }), [
    rendite, setRendite,
    returnMode, setReturnMode,
    averageReturn, setAverageReturn,
    standardDeviation, setStandardDeviation,
    randomSeed, setRandomSeed,
    variableReturns, setVariableReturns,
    historicalIndex, setHistoricalIndex,
    blackSwanReturns, setBlackSwanReturns,
    blackSwanEventName, setBlackSwanEventName,
    multiAssetConfig, setMultiAssetConfig,
    withdrawalMultiAssetConfig, setWithdrawalMultiAssetConfig,
  ])
}

function useInflationValues(state: Record<string, unknown>) {
  const {
    inflationScenarioRates, setInflationScenarioRates,
    inflationScenarioReturnModifiers, setInflationScenarioReturnModifiers,
    inflationScenarioName, setInflationScenarioName,
    inflationAktivSparphase, setInflationAktivSparphase,
    inflationsrateSparphase, setInflationsrateSparphase,
    inflationAnwendungSparphase, setInflationAnwendungSparphase,
  } = state
  return useMemo(() => ({
    inflationScenarioRates, setInflationScenarioRates,
    inflationScenarioReturnModifiers, setInflationScenarioReturnModifiers,
    inflationScenarioName, setInflationScenarioName,
    inflationAktivSparphase, setInflationAktivSparphase,
    inflationsrateSparphase, setInflationsrateSparphase,
    inflationAnwendungSparphase, setInflationAnwendungSparphase,
  }), [
    inflationScenarioRates, setInflationScenarioRates,
    inflationScenarioReturnModifiers, setInflationScenarioReturnModifiers,
    inflationScenarioName, setInflationScenarioName,
    inflationAktivSparphase, setInflationAktivSparphase,
    inflationsrateSparphase, setInflationsrateSparphase,
    inflationAnwendungSparphase, setInflationAnwendungSparphase,
  ])
}

function useSparplanValues(state: Record<string, unknown>) {
  const {
    startEnd, setStartEnd,
    sparplan, setSparplan,
    simulationAnnual, setSimulationAnnual,
    sparplanElemente, setSparplanElemente,
  } = state
  return useMemo(() => ({
    startEnd, setStartEnd,
    sparplan, setSparplan,
    simulationAnnual, setSimulationAnnual,
    sparplanElemente, setSparplanElemente,
  }), [
    startEnd, setStartEnd,
    sparplan, setSparplan,
    simulationAnnual, setSimulationAnnual,
    sparplanElemente, setSparplanElemente,
  ])
}

function useLifeValues(
  state: Record<string, unknown>,
  setEndOfLifeRounded: (value: number) => void,
) {
  const {
    endOfLife,
    lifeExpectancyTable, setLifeExpectancyTable,
    customLifeExpectancy, setCustomLifeExpectancy,
    planningMode, setPlanningMode,
    gender, setGender,
    spouse, setSpouse,
    birthYear, setBirthYear,
    expectedLifespan, setExpectedLifespan,
    useAutomaticCalculation, setUseAutomaticCalculation,
  } = state
  return useMemo(() => ({
    endOfLife, setEndOfLife: setEndOfLifeRounded,
    lifeExpectancyTable, setLifeExpectancyTable,
    customLifeExpectancy, setCustomLifeExpectancy,
    planningMode, setPlanningMode,
    gender, setGender,
    spouse, setSpouse,
    birthYear, setBirthYear,
    expectedLifespan, setExpectedLifespan,
    useAutomaticCalculation, setUseAutomaticCalculation,
  }), [
    endOfLife, setEndOfLifeRounded,
    lifeExpectancyTable, setLifeExpectancyTable,
    customLifeExpectancy, setCustomLifeExpectancy,
    planningMode, setPlanningMode,
    gender, setGender,
    spouse, setSpouse,
    birthYear, setBirthYear,
    expectedLifespan, setExpectedLifespan,
    useAutomaticCalculation, setUseAutomaticCalculation,
  ])
}

function useWithdrawalValues(state: Record<string, unknown>) {
  const {
    withdrawalResults, setWithdrawalResults,
    withdrawalConfig, setWithdrawalConfig,
  } = state
  return useMemo(() => ({
    withdrawalResults, setWithdrawalResults,
    withdrawalConfig, setWithdrawalConfig,
  }), [
    withdrawalResults, setWithdrawalResults,
    withdrawalConfig, setWithdrawalConfig,
  ])
}

function useOtherConfigValues(state: Record<string, unknown>) {
  const {
    statutoryPensionConfig, setStatutoryPensionConfig,
    coupleStatutoryPensionConfig, setCoupleStatutoryPensionConfig,
    careCostConfiguration, setCareCostConfiguration,
    financialGoals, setFinancialGoals,
  } = state
  return useMemo(() => ({
    statutoryPensionConfig, setStatutoryPensionConfig,
    coupleStatutoryPensionConfig, setCoupleStatutoryPensionConfig,
    careCostConfiguration, setCareCostConfiguration,
    financialGoals, setFinancialGoals,
  }), [
    statutoryPensionConfig, setStatutoryPensionConfig,
    coupleStatutoryPensionConfig, setCoupleStatutoryPensionConfig,
    careCostConfiguration, setCareCostConfiguration,
    financialGoals, setFinancialGoals,
  ])
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

  return useMemo(() => ({
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
  }) as SimulationContextState, [
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
  ])
}
