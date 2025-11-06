import { useMemo } from 'react'
import type { SimulationContextState } from '../SimulationContext'

function useTaxValues(state: Record<string, unknown>) {
  const {
    steuerlast,
    setSteuerlast,
    teilfreistellungsquote,
    setTeilfreistellungsquote,
    freibetragPerYear,
    setFreibetragPerYear,
    basiszinsConfiguration,
    setBasiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase,
    setSteuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    setGrundfreibetragAktiv,
    grundfreibetragBetrag,
    setGrundfreibetragBetrag,
    personalTaxRate,
    setPersonalTaxRate,
    guenstigerPruefungAktiv,
    setGuenstigerPruefungAktiv,
    kirchensteuerAktiv,
    setKirchensteuerAktiv,
    kirchensteuersatz,
    setKirchensteuersatz,
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
      steuerReduzierenEndkapitalSparphase,
      setSteuerReduzierenEndkapitalSparphase,
      steuerReduzierenEndkapitalEntspharphase,
      setSteuerReduzierenEndkapitalEntspharphase,
      grundfreibetragAktiv,
      setGrundfreibetragAktiv,
      grundfreibetragBetrag,
      setGrundfreibetragBetrag,
      personalTaxRate,
      setPersonalTaxRate,
      guenstigerPruefungAktiv,
      setGuenstigerPruefungAktiv,
      kirchensteuerAktiv,
      setKirchensteuerAktiv,
      kirchensteuersatz,
      setKirchensteuersatz,
    }),
    [
      steuerlast,
      setSteuerlast,
      teilfreistellungsquote,
      setTeilfreistellungsquote,
      freibetragPerYear,
      setFreibetragPerYear,
      basiszinsConfiguration,
      setBasiszinsConfiguration,
      steuerReduzierenEndkapitalSparphase,
      setSteuerReduzierenEndkapitalSparphase,
      steuerReduzierenEndkapitalEntspharphase,
      setSteuerReduzierenEndkapitalEntspharphase,
      grundfreibetragAktiv,
      setGrundfreibetragAktiv,
      grundfreibetragBetrag,
      setGrundfreibetragBetrag,
      personalTaxRate,
      setPersonalTaxRate,
      guenstigerPruefungAktiv,
      setGuenstigerPruefungAktiv,
      kirchensteuerAktiv,
      setKirchensteuerAktiv,
      kirchensteuersatz,
      setKirchensteuersatz,
    ],
  )
}

function useReturnValues(state: Record<string, unknown>) {
  const {
    rendite,
    setRendite,
    returnMode,
    setReturnMode,
    averageReturn,
    setAverageReturn,
    standardDeviation,
    setStandardDeviation,
    randomSeed,
    setRandomSeed,
    variableReturns,
    setVariableReturns,
    historicalIndex,
    setHistoricalIndex,
    blackSwanReturns,
    setBlackSwanReturns,
    blackSwanEventName,
    setBlackSwanEventName,
    multiAssetConfig,
    setMultiAssetConfig,
    withdrawalMultiAssetConfig,
    setWithdrawalMultiAssetConfig,
  } = state
  return useMemo(
    () => ({
      rendite,
      setRendite,
      returnMode,
      setReturnMode,
      averageReturn,
      setAverageReturn,
      standardDeviation,
      setStandardDeviation,
      randomSeed,
      setRandomSeed,
      variableReturns,
      setVariableReturns,
      historicalIndex,
      setHistoricalIndex,
      blackSwanReturns,
      setBlackSwanReturns,
      blackSwanEventName,
      setBlackSwanEventName,
      multiAssetConfig,
      setMultiAssetConfig,
      withdrawalMultiAssetConfig,
      setWithdrawalMultiAssetConfig,
    }),
    [
      rendite,
      setRendite,
      returnMode,
      setReturnMode,
      averageReturn,
      setAverageReturn,
      standardDeviation,
      setStandardDeviation,
      randomSeed,
      setRandomSeed,
      variableReturns,
      setVariableReturns,
      historicalIndex,
      setHistoricalIndex,
      blackSwanReturns,
      setBlackSwanReturns,
      blackSwanEventName,
      setBlackSwanEventName,
      multiAssetConfig,
      setMultiAssetConfig,
      withdrawalMultiAssetConfig,
      setWithdrawalMultiAssetConfig,
    ],
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

/**
 * Helper to build life expectancy values for memoization
 */
function buildLifeValuesObject(
  values: Record<string, unknown>,
  setEndOfLifeRounded: (value: number) => void,
) {
  return {
    endOfLife: values.endOfLife,
    setEndOfLife: setEndOfLifeRounded,
    lifeExpectancyTable: values.lifeExpectancyTable,
    setLifeExpectancyTable: values.setLifeExpectancyTable,
    customLifeExpectancy: values.customLifeExpectancy,
    setCustomLifeExpectancy: values.setCustomLifeExpectancy,
    planningMode: values.planningMode,
    setPlanningMode: values.setPlanningMode,
    gender: values.gender,
    setGender: values.setGender,
    spouse: values.spouse,
    setSpouse: values.setSpouse,
    birthYear: values.birthYear,
    setBirthYear: values.setBirthYear,
    expectedLifespan: values.expectedLifespan,
    setExpectedLifespan: values.setExpectedLifespan,
    useAutomaticCalculation: values.useAutomaticCalculation,
    setUseAutomaticCalculation: values.setUseAutomaticCalculation,
  }
}

/**
 * Helper to build life expectancy dependency array for memoization
 */
function buildLifeValuesDeps(
  values: Record<string, unknown>,
  setEndOfLifeRounded: (value: number) => void,
) {
  return [
    values.endOfLife,
    setEndOfLifeRounded,
    values.lifeExpectancyTable,
    values.setLifeExpectancyTable,
    values.customLifeExpectancy,
    values.setCustomLifeExpectancy,
    values.planningMode,
    values.setPlanningMode,
    values.gender,
    values.setGender,
    values.spouse,
    values.setSpouse,
    values.birthYear,
    values.setBirthYear,
    values.expectedLifespan,
    values.setExpectedLifespan,
    values.useAutomaticCalculation,
    values.setUseAutomaticCalculation,
  ]
}

function useLifeValues(state: Record<string, unknown>, setEndOfLifeRounded: (value: number) => void) {
  return useMemo(
    () => buildLifeValuesObject(state, setEndOfLifeRounded),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    buildLifeValuesDeps(state, setEndOfLifeRounded),
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
