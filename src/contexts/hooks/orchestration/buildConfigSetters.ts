import type { useSimulationState } from '../useSimulationState'
import type { ConfigurationStateSetters } from '../useConfigurationManagement'

/**
 * Builds configuration setters object from simulation state
 * Extracts only the setter functions needed for configuration management
 */
export function buildConfigSetters(state: ReturnType<typeof useSimulationState>): ConfigurationStateSetters {
  return {
    setRendite: state.setRendite,
    setSteuerlast: state.setSteuerlast,
    setTeilfreistellungsquote: state.setTeilfreistellungsquote,
    setFreibetragPerYear: state.setFreibetragPerYear,
    setBasiszinsConfiguration: state.setBasiszinsConfiguration,
    setSteuerReduzierenEndkapitalSparphase: state.setSteuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalEntspharphase: state.setSteuerReduzierenEndkapitalEntspharphase,
    setGrundfreibetragAktiv: state.setGrundfreibetragAktiv,
    setGrundfreibetragBetrag: state.setGrundfreibetragBetrag,
    setPersonalTaxRate: state.setPersonalTaxRate,
    setGuenstigerPruefungAktiv: state.setGuenstigerPruefungAktiv,
    setKirchensteuerAktiv: state.setKirchensteuerAktiv,
    setKirchensteuersatz: state.setKirchensteuersatz,
    setReturnMode: state.setReturnMode,
    setAverageReturn: state.setAverageReturn,
    setStandardDeviation: state.setStandardDeviation,
    setRandomSeed: state.setRandomSeed,
    setVariableReturns: state.setVariableReturns,
    setHistoricalIndex: state.setHistoricalIndex,
    setInflationAktivSparphase: state.setInflationAktivSparphase,
    setInflationsrateSparphase: state.setInflationsrateSparphase,
    setInflationAnwendungSparphase: state.setInflationAnwendungSparphase,
    setStartEnd: state.setStartEnd,
    setSparplan: state.setSparplan,
    setSimulationAnnual: state.setSimulationAnnual,
    setSparplanElemente: state.setSparplanElemente,
    setEndOfLife: state.setEndOfLife,
    setLifeExpectancyTable: state.setLifeExpectancyTable,
    setCustomLifeExpectancy: state.setCustomLifeExpectancy,
    setPlanningMode: state.setPlanningMode,
    setGender: state.setGender,
    setSpouse: state.setSpouse,
    setBirthYear: state.setBirthYear,
    setExpectedLifespan: state.setExpectedLifespan,
    setUseAutomaticCalculation: state.setUseAutomaticCalculation,
    setWithdrawalConfig: state.setWithdrawalConfig,
    setStatutoryPensionConfig: state.setStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig: state.setCoupleStatutoryPensionConfig,
    setCareCostConfiguration: state.setCareCostConfiguration,
    setFinancialGoals: state.setFinancialGoals,
    setEmergencyFundConfig: state.setEmergencyFundConfig,
  }
}
