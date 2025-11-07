import type { useSimulationState } from '../useSimulationState'

/**
 * Extracts return configuration properties from simulation state
 */
export function extractReturnConfig(state: ReturnType<typeof useSimulationState>) {
  return {
    rendite: state.rendite,
    returnMode: state.returnMode,
    averageReturn: state.averageReturn,
    standardDeviation: state.standardDeviation,
    randomSeed: state.randomSeed,
    variableReturns: state.variableReturns,
    historicalIndex: state.historicalIndex,
    blackSwanReturns: state.blackSwanReturns,
    inflationScenarioRates: state.inflationScenarioRates,
    inflationScenarioReturnModifiers: state.inflationScenarioReturnModifiers,
    multiAssetConfig: state.multiAssetConfig,
  }
}

/**
 * Extracts tax configuration properties from simulation state
 */
export function extractTaxConfig(state: ReturnType<typeof useSimulationState>) {
  return {
    steuerlast: state.steuerlast,
    teilfreistellungsquote: state.teilfreistellungsquote,
    freibetragPerYear: state.freibetragPerYear,
    basiszinsConfiguration: state.basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase: state.steuerReduzierenEndkapitalSparphase,
    guenstigerPruefungAktiv: state.guenstigerPruefungAktiv,
    personalTaxRate: state.personalTaxRate,
  }
}

/**
 * Extracts inflation configuration properties from simulation state
 */
export function extractInflationConfig(state: ReturnType<typeof useSimulationState>) {
  return {
    inflationAktivSparphase: state.inflationAktivSparphase,
    inflationsrateSparphase: state.inflationsrateSparphase,
    inflationAnwendungSparphase: state.inflationAnwendungSparphase,
  }
}

/**
 * Extracts basic simulation properties from simulation state
 */
export function extractSimulationBasics(state: ReturnType<typeof useSimulationState>) {
  return {
    simulationAnnual: state.simulationAnnual,
    sparplanElemente: state.sparplanElemente,
    startEnd: state.startEnd,
  }
}
