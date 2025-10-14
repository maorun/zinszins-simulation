import React, { useMemo } from 'react'
import { SimulationContext } from './SimulationContextValue'
import type { SimulationContextState } from './helpers/simulation-context-state'
import type { ExtendedSavedConfiguration } from './helpers/config-types'
import { createDefaultConfiguration } from './helpers/default-config'
import { loadInitialConfiguration } from './helpers/load-initial-config'
import { buildContextValue } from './helpers/build-context-value'
import { useSimulationState } from './hooks/useSimulationState'
import { useConfigurationManagement } from './hooks/useConfigurationManagement'
import { useSimulationExecution } from './hooks/useSimulationExecution'
import { useSimulationEffects } from './hooks/useSimulationEffects'

export type { SimulationContextState }

export const SimulationProvider = ({ children }: { children: React.ReactNode }) => {
  // Default configuration
  const defaultConfig = useMemo(() => createDefaultConfiguration(), [])

  // Load initial configuration
  const initialConfig = loadInitialConfiguration(defaultConfig)
  const extendedInitialConfig = initialConfig as ExtendedSavedConfiguration

  // Initialize all state using custom hook
  const state = useSimulationState({
    initialConfig,
    extendedInitialConfig,
    defaultConfig,
  })

  // Extract state and setters for easier access
  const {
    rendite, steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, grundfreibetragBetrag, personalTaxRate, guenstigerPruefungAktiv,
    kirchensteuerAktiv, kirchensteuersatz, returnMode, averageReturn, standardDeviation,
    randomSeed, variableReturns, historicalIndex, blackSwanReturns, blackSwanEventName,
    inflationScenarioRates, inflationScenarioReturnModifiers, inflationScenarioName,
    multiAssetConfig, withdrawalMultiAssetConfig, inflationAktivSparphase, inflationsrateSparphase,
    inflationAnwendungSparphase, startEnd, sparplan, simulationAnnual, sparplanElemente,
    endOfLife, lifeExpectancyTable, customLifeExpectancy, planningMode, gender, spouse,
    birthYear, expectedLifespan, useAutomaticCalculation, withdrawalConfig,
    statutoryPensionConfig, coupleStatutoryPensionConfig, careCostConfiguration, financialGoals,
    setRendite, setSteuerlast, setTeilfreistellungsquote, setFreibetragPerYear,
    setBasiszinsConfiguration, setSteuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalEntspharphase, setGrundfreibetragAktiv,
    setGrundfreibetragBetrag, setPersonalTaxRate, setGuenstigerPruefungAktiv,
    setKirchensteuerAktiv, setKirchensteuersatz, setReturnMode, setAverageReturn,
    setStandardDeviation, setRandomSeed, setVariableReturns, setHistoricalIndex,
    setBlackSwanReturns, setBlackSwanEventName, setInflationScenarioRates,
    setInflationScenarioReturnModifiers, setInflationScenarioName, setMultiAssetConfig,
    setWithdrawalMultiAssetConfig, setInflationAktivSparphase, setInflationsrateSparphase,
    setInflationAnwendungSparphase, setStartEnd, setSparplan, setSimulationAnnual,
    setSparplanElemente, setEndOfLife, setLifeExpectancyTable, setCustomLifeExpectancy,
    setPlanningMode, setGender, setSpouse, setBirthYear, setExpectedLifespan,
    setUseAutomaticCalculation, setWithdrawalConfig, setStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig, setCareCostConfiguration, setFinancialGoals,
  } = state

  // Configuration management using custom hook
  const configManagement = useConfigurationManagement(
    defaultConfig,
    {
      rendite, steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
      steuerReduzierenEndkapitalSparphase, steuerReduzierenEndkapitalEntspharphase,
      grundfreibetragAktiv, grundfreibetragBetrag, personalTaxRate, guenstigerPruefungAktiv,
      kirchensteuerAktiv, kirchensteuersatz, returnMode, averageReturn, standardDeviation,
      randomSeed, variableReturns, historicalIndex, inflationAktivSparphase, inflationsrateSparphase,
      inflationAnwendungSparphase, startEnd, sparplan, simulationAnnual, endOfLife, lifeExpectancyTable,
      customLifeExpectancy, planningMode, gender, spouse, birthYear, expectedLifespan,
      useAutomaticCalculation, withdrawalConfig, statutoryPensionConfig, coupleStatutoryPensionConfig,
      careCostConfiguration, financialGoals,
    },
    {
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
    },
  )

  // Simulation execution using custom hook
  const execution = useSimulationExecution(
    {
      rendite, returnMode, averageReturn, standardDeviation, randomSeed, variableReturns,
      historicalIndex, blackSwanReturns, inflationScenarioRates, inflationScenarioReturnModifiers,
      multiAssetConfig, simulationAnnual, sparplanElemente, startEnd, steuerlast,
      teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
      steuerReduzierenEndkapitalSparphase, inflationAktivSparphase, inflationsrateSparphase,
      inflationAnwendungSparphase, guenstigerPruefungAktiv, personalTaxRate,
    },
    state.setIsLoading,
    state.setSimulationData,
  )

  // Side effects using custom hook
  const effects = useSimulationEffects(
    {
      endOfLife, planningMode, freibetragPerYear, coupleStatutoryPensionConfig, careCostConfiguration,
    },
    {
      setStartEnd, setFreibetragPerYear, setCoupleStatutoryPensionConfig,
      setCareCostConfiguration, setEndOfLife,
    },
    configManagement.saveCurrentConfiguration,
  )

  // Build context value
  const value = useMemo(
    () => buildContextValue({ state, configManagement, execution, effects }),
    [state, configManagement, execution, effects],
  )

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}
