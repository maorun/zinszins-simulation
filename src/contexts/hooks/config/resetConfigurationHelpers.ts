import type { ConfigurationStateSetters } from '../useConfigurationManagement'
import { resetConfiguration } from '../../helpers/config-reset'
import { buildWithdrawalConfigSetters } from './buildConfigSetters'

export function resetAllConfigurations(
  defaultConfig: import('../../helpers/default-config').DefaultConfigType,
  setters: ConfigurationStateSetters,
) {
  const basicSetters = {
    setRendite: setters.setRendite,
    setSteuerlast: setters.setSteuerlast,
    setTeilfreistellungsquote: setters.setTeilfreistellungsquote,
    setFreibetragPerYear: setters.setFreibetragPerYear,
    setBasiszinsConfiguration: setters.setBasiszinsConfiguration,
    setSteuerReduzierenEndkapitalSparphase: setters.setSteuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalEntspharphase: setters.setSteuerReduzierenEndkapitalEntspharphase,
    setGrundfreibetragAktiv: setters.setGrundfreibetragAktiv,
    setGrundfreibetragBetrag: setters.setGrundfreibetragBetrag,
    setPersonalTaxRate: setters.setPersonalTaxRate,
    setGuenstigerPruefungAktiv: setters.setGuenstigerPruefungAktiv,
    setAssetClass: setters.setAssetClass,
    setCustomTeilfreistellungsquote: setters.setCustomTeilfreistellungsquote,
    setReturnMode: setters.setReturnMode,
    setAverageReturn: setters.setAverageReturn,
    setStandardDeviation: setters.setStandardDeviation,
    setRandomSeed: setters.setRandomSeed,
    setVariableReturns: setters.setVariableReturns,
    setHistoricalIndex: setters.setHistoricalIndex,
    setInflationAktivSparphase: setters.setInflationAktivSparphase,
    setInflationsrateSparphase: setters.setInflationsrateSparphase,
    setInflationAnwendungSparphase: setters.setInflationAnwendungSparphase,
    setStartEnd: setters.setStartEnd,
    setSparplan: setters.setSparplan,
    setSimulationAnnual: setters.setSimulationAnnual,
    setSparplanElemente: setters.setSparplanElemente,
    setEndOfLife: setters.setEndOfLife,
    setLifeExpectancyTable: setters.setLifeExpectancyTable,
    setCustomLifeExpectancy: setters.setCustomLifeExpectancy,
    setPlanningMode: setters.setPlanningMode,
    setGender: setters.setGender,
    setSpouse: setters.setSpouse,
    setBirthYear: setters.setBirthYear,
    setExpectedLifespan: setters.setExpectedLifespan,
    setUseAutomaticCalculation: setters.setUseAutomaticCalculation,
  }

  resetConfiguration(defaultConfig, basicSetters, buildWithdrawalConfigSetters(setters))
}
