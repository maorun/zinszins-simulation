import type { DefaultConfigType } from '../helpers/default-config'
import { useConfigurationManagement } from './useConfigurationManagement'
import { useSimulationExecution } from './useSimulationExecution'
import { useSimulationEffects } from './useSimulationEffects'
import type { useSimulationState } from './useSimulationState'

/**
 * Custom hook to prepare state objects for configuration management, simulation execution, and effects
 * This reduces boilerplate in SimulationProvider by centralizing object construction
 */
// eslint-disable-next-line max-lines-per-function -- Large component function
export function useSimulationOrchestration(
  defaultConfig: DefaultConfigType,
  state: ReturnType<typeof useSimulationState>,
) {
  // Extract all state values needed for different purposes
  const {
    rendite, setRendite,
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
    returnMode, setReturnMode,
    averageReturn, setAverageReturn,
    standardDeviation, setStandardDeviation,
    randomSeed, setRandomSeed,
    variableReturns, setVariableReturns,
    historicalIndex, setHistoricalIndex,
    blackSwanReturns,
    inflationScenarioRates,
    inflationScenarioReturnModifiers,
    multiAssetConfig,
    inflationAktivSparphase, setInflationAktivSparphase,
    inflationsrateSparphase, setInflationsrateSparphase,
    inflationAnwendungSparphase, setInflationAnwendungSparphase,
    startEnd, setStartEnd,
    sparplan, setSparplan,
    simulationAnnual, setSimulationAnnual,
    sparplanElemente, setSparplanElemente,
    endOfLife, setEndOfLife,
    lifeExpectancyTable, setLifeExpectancyTable,
    customLifeExpectancy, setCustomLifeExpectancy,
    planningMode, setPlanningMode,
    gender, setGender,
    spouse, setSpouse,
    birthYear, setBirthYear,
    expectedLifespan, setExpectedLifespan,
    useAutomaticCalculation, setUseAutomaticCalculation,
    setIsLoading,
    setSimulationData,
    withdrawalConfig, setWithdrawalConfig,
    statutoryPensionConfig, setStatutoryPensionConfig,
    coupleStatutoryPensionConfig, setCoupleStatutoryPensionConfig,
    careCostConfiguration, setCareCostConfiguration,
    financialGoals, setFinancialGoals,
  } = state

  // Configuration management state and setters
  const configState = {
    rendite, steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, grundfreibetragBetrag, personalTaxRate, guenstigerPruefungAktiv,
    kirchensteuerAktiv, kirchensteuersatz, returnMode, averageReturn, standardDeviation,
    randomSeed, variableReturns, historicalIndex, inflationAktivSparphase, inflationsrateSparphase,
    inflationAnwendungSparphase, startEnd, sparplan, simulationAnnual, endOfLife, lifeExpectancyTable,
    customLifeExpectancy, planningMode, gender, spouse, birthYear, expectedLifespan,
    useAutomaticCalculation, withdrawalConfig, statutoryPensionConfig, coupleStatutoryPensionConfig,
    careCostConfiguration, financialGoals,
  }

  const configSetters = {
    setRendite, setSteuerlast, setTeilfreistellungsquote, setFreibetragPerYear,
    setBasiszinsConfiguration, setSteuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalEntspharphase, setGrundfreibetragAktiv,
    setGrundfreibetragBetrag, setPersonalTaxRate, setGuenstigerPruefungAktiv,
    setKirchensteuerAktiv, setKirchensteuersatz, setReturnMode, setAverageReturn,
    setStandardDeviation, setRandomSeed, setVariableReturns, setHistoricalIndex,
    setInflationAktivSparphase, setInflationsrateSparphase, setInflationAnwendungSparphase,
    setStartEnd, setSparplan, setSimulationAnnual, setSparplanElemente, setEndOfLife,
    setLifeExpectancyTable, setCustomLifeExpectancy, setPlanningMode, setGender,
    setSpouse, setBirthYear, setExpectedLifespan, setUseAutomaticCalculation,
    setWithdrawalConfig, setStatutoryPensionConfig, setCoupleStatutoryPensionConfig,
    setCareCostConfiguration, setFinancialGoals,
  }

  const configManagement = useConfigurationManagement(
    defaultConfig,
    configState,
    configSetters,
  )

  // Simulation execution state
  const simulationState = {
    rendite, returnMode, averageReturn, standardDeviation, randomSeed, variableReturns,
    historicalIndex, blackSwanReturns, inflationScenarioRates, inflationScenarioReturnModifiers,
    multiAssetConfig, simulationAnnual, sparplanElemente, startEnd, steuerlast,
    teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, inflationAktivSparphase, inflationsrateSparphase,
    inflationAnwendungSparphase, guenstigerPruefungAktiv, personalTaxRate,
  }

  const { performSimulation } = useSimulationExecution(simulationState, setIsLoading, setSimulationData)

  // Side effects state and setters
  const effectsState = {
    endOfLife, planningMode, freibetragPerYear, coupleStatutoryPensionConfig, careCostConfiguration,
  }

  const effectsSetters = {
    setStartEnd, setFreibetragPerYear, setCoupleStatutoryPensionConfig,
    setCareCostConfiguration, setEndOfLife,
  }

  const effects = useSimulationEffects(effectsState, effectsSetters, configManagement.saveCurrentConfiguration)

  return {
    configManagement,
    performSimulation,
    setEndOfLifeRounded: effects.setEndOfLifeRounded,
  }
}
