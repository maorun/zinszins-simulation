import type { SavedConfiguration } from '../../../utils/config-storage'
import type { ConfigurationState } from '../useConfigurationManagement'

export function buildBasicConfig(state: ConfigurationState) {
  return {
    rendite: state.rendite,
    steuerlast: state.steuerlast,
    teilfreistellungsquote: state.teilfreistellungsquote,
    freibetragPerYear: state.freibetragPerYear,
    basiszinsConfiguration: state.basiszinsConfiguration,
  }
}

export function buildTaxConfig(state: ConfigurationState) {
  return {
    steuerReduzierenEndkapitalSparphase: state.steuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase: state.steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv: state.grundfreibetragAktiv,
    grundfreibetragBetrag: state.grundfreibetragBetrag,
    personalTaxRate: state.personalTaxRate,
    guenstigerPruefungAktiv: state.guenstigerPruefungAktiv,
    assetClass: state.assetClass,
    customTeilfreistellungsquote: state.customTeilfreistellungsquote,
  }
}

export function buildReturnConfig(state: ConfigurationState) {
  return {
    returnMode: state.returnMode,
    averageReturn: state.averageReturn,
    standardDeviation: state.standardDeviation,
    randomSeed: state.randomSeed,
    variableReturns: state.variableReturns,
    historicalIndex: state.historicalIndex,
  }
}

export function buildInflationConfig(state: ConfigurationState) {
  return {
    inflationAktivSparphase: state.inflationAktivSparphase,
    inflationsrateSparphase: state.inflationsrateSparphase,
    inflationAnwendungSparphase: state.inflationAnwendungSparphase,
  }
}

export function buildSavingsPlanConfig(state: ConfigurationState) {
  return {
    startEnd: state.startEnd,
    sparplan: state.sparplan,
    simulationAnnual: state.simulationAnnual,
  }
}

export function buildLifeConfig(state: ConfigurationState) {
  return {
    endOfLife: state.endOfLife,
    lifeExpectancyTable: state.lifeExpectancyTable,
    customLifeExpectancy: state.customLifeExpectancy,
    planningMode: state.planningMode,
    gender: state.gender,
    spouse: state.spouse,
    birthYear: state.birthYear,
    expectedLifespan: state.expectedLifespan,
    useAutomaticCalculation: state.useAutomaticCalculation,
  }
}

export function buildWithdrawalConfig(state: ConfigurationState) {
  return {
    withdrawal: state.withdrawalConfig || undefined,
    statutoryPensionConfig: state.statutoryPensionConfig || undefined,
    coupleStatutoryPensionConfig: state.coupleStatutoryPensionConfig || undefined,
    careCostConfiguration: state.careCostConfiguration,
    financialGoals: state.financialGoals,
    emergencyFundConfig: state.emergencyFundConfig,
  }
}

export function buildCompleteConfiguration(state: ConfigurationState): SavedConfiguration {
  return {
    ...buildBasicConfig(state),
    ...buildTaxConfig(state),
    ...buildReturnConfig(state),
    ...buildInflationConfig(state),
    ...buildSavingsPlanConfig(state),
    ...buildLifeConfig(state),
    ...buildWithdrawalConfig(state),
  }
}
