/**
 * Hook to handle loading saved scenarios from localStorage
 */

import { useCallback } from 'react'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'
import { useSimulation } from '../contexts/useSimulation'
import { loadAllConfigurations } from '../contexts/hooks/config/loadConfigurationHelpers'
import { createDefaultConfiguration } from '../contexts/helpers/default-config'
import type { ConfigurationSetters } from '../contexts/helpers/config-types'

/**
 * Build configuration setters from simulation state
 */
function buildSetters(simulation: ReturnType<typeof useSimulation>): ConfigurationSetters {
  return {
    setRendite: simulation.setRendite,
    setSteuerlast: simulation.setSteuerlast,
    setTeilfreistellungsquote: simulation.setTeilfreistellungsquote,
    setFreibetragPerYear: simulation.setFreibetragPerYear,
    setBasiszinsConfiguration: simulation.setBasiszinsConfiguration,
    setSteuerReduzierenEndkapitalSparphase: simulation.setSteuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalEntspharphase: simulation.setSteuerReduzierenEndkapitalEntspharphase,
    setGrundfreibetragAktiv: simulation.setGrundfreibetragAktiv,
    setGrundfreibetragBetrag: simulation.setGrundfreibetragBetrag,
    setPersonalTaxRate: simulation.setPersonalTaxRate,
    setGuenstigerPruefungAktiv: simulation.setGuenstigerPruefungAktiv,
    setAssetClass: simulation.setAssetClass,
    setCustomTeilfreistellungsquote: simulation.setCustomTeilfreistellungsquote,
    setReturnMode: simulation.setReturnMode,
    setAverageReturn: simulation.setAverageReturn,
    setStandardDeviation: simulation.setStandardDeviation,
    setRandomSeed: simulation.setRandomSeed,
    setVariableReturns: simulation.setVariableReturns,
    setHistoricalIndex: simulation.setHistoricalIndex,
    setInflationAktivSparphase: simulation.setInflationAktivSparphase,
    setInflationsrateSparphase: simulation.setInflationsrateSparphase,
    setInflationAnwendungSparphase: simulation.setInflationAnwendungSparphase,
    setStartEnd: simulation.setStartEnd,
    setSparplan: simulation.setSparplan,
    setSparplanElemente: simulation.setSparplanElemente,
    setSimulationAnnual: simulation.setSimulationAnnual,
    setMultiAssetConfig: simulation.setMultiAssetConfig,
    setWithdrawalMultiAssetConfig: simulation.setWithdrawalMultiAssetConfig,
    setEndOfLife: simulation.setEndOfLife,
    setLifeExpectancyTable: simulation.setLifeExpectancyTable,
    setCustomLifeExpectancy: simulation.setCustomLifeExpectancy,
    setPlanningMode: simulation.setPlanningMode,
    setGender: simulation.setGender,
    setSpouse: simulation.setSpouse,
    setBirthYear: simulation.setBirthYear,
    setExpectedLifespan: simulation.setExpectedLifespan,
    setUseAutomaticCalculation: simulation.setUseAutomaticCalculation,
    setWithdrawalConfig: simulation.setWithdrawalConfig,
    setStatutoryPensionConfig: simulation.setStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig: simulation.setCoupleStatutoryPensionConfig,
    setCareCostConfiguration: simulation.setCareCostConfiguration,
    setFinancialGoals: simulation.setFinancialGoals,
    setEmergencyFundConfig: simulation.setEmergencyFundConfig,
    setKirchensteuerAktiv: simulation.setKirchensteuerAktiv,
    setKirchensteuersatz: simulation.setKirchensteuersatz,
    setFreistellungsauftragAccounts: simulation.setFreistellungsauftragAccounts,
    setTermLifeInsuranceConfig: simulation.setTermLifeInsuranceConfig,
    setCareInsuranceConfig: simulation.setCareInsuranceConfig,
    setAlimonyConfig: simulation.setAlimonyConfig,
    setEMRenteConfig: simulation.setEMRenteConfig,
  }
}

/**
 * Hook to load saved scenario configurations
 * Uses existing configuration loading infrastructure
 */
export function useLoadSavedScenario() {
  const simulation = useSimulation()

  const handleLoadScenario = useCallback(
    (configuration: ExtendedSavedConfiguration) => {
      const defaultConfig = createDefaultConfiguration()
      const setters = buildSetters(simulation)
      loadAllConfigurations(configuration, defaultConfig, setters)
      setTimeout(() => simulation.performSimulation(), 100)
    },
    [simulation]
  )

  return { handleLoadScenario }
}
