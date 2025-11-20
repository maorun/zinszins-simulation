import type { useSimulationState } from '../useSimulationState'
import type { ConfigurationState } from '../useConfigurationManagement'

/**
 * Builds configuration state object from simulation state
 * Extracts only the state values needed for configuration management
 */
export function buildConfigState(state: ReturnType<typeof useSimulationState>): ConfigurationState {
  return {
    rendite: state.rendite,
    steuerlast: state.steuerlast,
    teilfreistellungsquote: state.teilfreistellungsquote,
    freibetragPerYear: state.freibetragPerYear,
    basiszinsConfiguration: state.basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase: state.steuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase: state.steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv: state.grundfreibetragAktiv,
    grundfreibetragBetrag: state.grundfreibetragBetrag,
    personalTaxRate: state.personalTaxRate,
    guenstigerPruefungAktiv: state.guenstigerPruefungAktiv,
    kirchensteuerAktiv: state.kirchensteuerAktiv,
    kirchensteuersatz: state.kirchensteuersatz,
    assetClass: state.assetClass,
    customTeilfreistellungsquote: state.customTeilfreistellungsquote,
    returnMode: state.returnMode,
    averageReturn: state.averageReturn,
    standardDeviation: state.standardDeviation,
    randomSeed: state.randomSeed,
    variableReturns: state.variableReturns,
    historicalIndex: state.historicalIndex,
    inflationAktivSparphase: state.inflationAktivSparphase,
    inflationsrateSparphase: state.inflationsrateSparphase,
    inflationAnwendungSparphase: state.inflationAnwendungSparphase,
    startEnd: state.startEnd,
    sparplan: state.sparplan,
    simulationAnnual: state.simulationAnnual,
    endOfLife: state.endOfLife,
    lifeExpectancyTable: state.lifeExpectancyTable,
    customLifeExpectancy: state.customLifeExpectancy,
    planningMode: state.planningMode,
    gender: state.gender,
    spouse: state.spouse,
    birthYear: state.birthYear,
    expectedLifespan: state.expectedLifespan,
    useAutomaticCalculation: state.useAutomaticCalculation,
    withdrawalConfig: state.withdrawalConfig,
    statutoryPensionConfig: state.statutoryPensionConfig,
    coupleStatutoryPensionConfig: state.coupleStatutoryPensionConfig,
    careCostConfiguration: state.careCostConfiguration,
    financialGoals: state.financialGoals,
    emergencyFundConfig: state.emergencyFundConfig,
  }
}
