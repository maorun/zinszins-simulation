import type { ConfigurationStateSetters } from '../useConfigurationManagement'

export function buildBasicConfigSetters(setters: ConfigurationStateSetters) {
  return {
    setRendite: setters.setRendite,
    setSteuerlast: setters.setSteuerlast,
    setTeilfreistellungsquote: setters.setTeilfreistellungsquote,
    setFreibetragPerYear: setters.setFreibetragPerYear,
    setBasiszinsConfiguration: setters.setBasiszinsConfiguration,
  }
}

export function buildTaxConfigSetters(setters: ConfigurationStateSetters) {
  return {
    setSteuerReduzierenEndkapitalSparphase: setters.setSteuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalEntspharphase: setters.setSteuerReduzierenEndkapitalEntspharphase,
    setGrundfreibetragAktiv: setters.setGrundfreibetragAktiv,
    setGrundfreibetragBetrag: setters.setGrundfreibetragBetrag,
    setPersonalTaxRate: setters.setPersonalTaxRate,
    setGuenstigerPruefungAktiv: setters.setGuenstigerPruefungAktiv,
  }
}

export function buildReturnConfigSetters(setters: ConfigurationStateSetters) {
  return {
    setReturnMode: setters.setReturnMode,
    setAverageReturn: setters.setAverageReturn,
    setStandardDeviation: setters.setStandardDeviation,
    setRandomSeed: setters.setRandomSeed,
    setVariableReturns: setters.setVariableReturns,
    setHistoricalIndex: setters.setHistoricalIndex,
  }
}

export function buildInflationConfigSetters(setters: ConfigurationStateSetters) {
  return {
    setInflationAktivSparphase: setters.setInflationAktivSparphase,
    setInflationsrateSparphase: setters.setInflationsrateSparphase,
    setInflationAnwendungSparphase: setters.setInflationAnwendungSparphase,
  }
}

export function buildSparplanConfigSetters(setters: ConfigurationStateSetters) {
  return {
    setStartEnd: setters.setStartEnd,
    setSparplan: setters.setSparplan,
    setSimulationAnnual: setters.setSimulationAnnual,
    setSparplanElemente: setters.setSparplanElemente,
  }
}

export function buildLifeExpectancyConfigSetters(setters: ConfigurationStateSetters) {
  return {
    setEndOfLife: setters.setEndOfLife,
    setLifeExpectancyTable: setters.setLifeExpectancyTable,
    setCustomLifeExpectancy: setters.setCustomLifeExpectancy,
  }
}

export function buildPlanningModeConfigSetters(setters: ConfigurationStateSetters) {
  return {
    setPlanningMode: setters.setPlanningMode,
    setGender: setters.setGender,
    setSpouse: setters.setSpouse,
    setBirthYear: setters.setBirthYear,
    setExpectedLifespan: setters.setExpectedLifespan,
    setUseAutomaticCalculation: setters.setUseAutomaticCalculation,
  }
}

export function buildWithdrawalConfigSetters(setters: ConfigurationStateSetters) {
  return {
    setWithdrawalConfig: setters.setWithdrawalConfig,
    setStatutoryPensionConfig: setters.setStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig: setters.setCoupleStatutoryPensionConfig,
    setCareCostConfiguration: setters.setCareCostConfiguration,
    setFinancialGoals: setters.setFinancialGoals,
  }
}
