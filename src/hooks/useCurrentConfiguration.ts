/**
 * Hook to get current configuration for saving
 */

import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'
import { useSimulation } from '../contexts/useSimulation'

type SimulationState = ReturnType<typeof useSimulation>

/** Extract basic financial configuration */
function getBasicConfig(s: SimulationState) {
  return {
    rendite: s.rendite,
    steuerlast: s.steuerlast,
    teilfreistellungsquote: s.teilfreistellungsquote,
    freibetragPerYear: s.freibetragPerYear,
    basiszinsConfiguration: s.basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase: s.steuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase: s.steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv: s.grundfreibetragAktiv,
    grundfreibetragBetrag: s.grundfreibetragBetrag,
    personalTaxRate: s.personalTaxRate,
    guenstigerPruefungAktiv: s.guenstigerPruefungAktiv,
    kirchensteuerAktiv: s.kirchensteuerAktiv,
    kirchensteuersatz: s.kirchensteuersatz,
    assetClass: s.assetClass,
    customTeilfreistellungsquote: s.customTeilfreistellungsquote,
    freistellungsauftragAccounts: s.freistellungsauftragAccounts,
  }
}

/** Extract return and investment configuration */
function getReturnConfig(s: SimulationState) {
  return {
    returnMode: s.returnMode,
    averageReturn: s.averageReturn,
    standardDeviation: s.standardDeviation,
    randomSeed: s.randomSeed,
    variableReturns: s.variableReturns,
    historicalIndex: s.historicalIndex,
    multiAssetConfig: s.multiAssetConfig,
    withdrawalMultiAssetConfig: s.withdrawalMultiAssetConfig,
    inflationAktivSparphase: s.inflationAktivSparphase,
    inflationsrateSparphase: s.inflationsrateSparphase,
    inflationAnwendungSparphase: s.inflationAnwendungSparphase,
    startEnd: s.startEnd,
    sparplan: s.sparplan,
    simulationAnnual: s.simulationAnnual,
  }
}

/** Extract life planning and advanced configuration */
function getAdvancedConfig(s: SimulationState) {
  return {
    endOfLife: s.endOfLife,
    lifeExpectancyTable: s.lifeExpectancyTable,
    customLifeExpectancy: s.customLifeExpectancy,
    planningMode: s.planningMode,
    gender: s.gender,
    spouse: s.spouse,
    birthYear: s.birthYear,
    expectedLifespan: s.expectedLifespan,
    useAutomaticCalculation: s.useAutomaticCalculation,
    withdrawal: s.withdrawalConfig ?? undefined,
    statutoryPensionConfig: s.statutoryPensionConfig ?? undefined,
    coupleStatutoryPensionConfig: s.coupleStatutoryPensionConfig ?? undefined,
    careCostConfiguration: s.careCostConfiguration,
    financialGoals: s.financialGoals,
    emergencyFundConfig: s.emergencyFundConfig,
    termLifeInsuranceConfig: s.termLifeInsuranceConfig ?? undefined,
    careInsuranceConfig: s.careInsuranceConfig ?? undefined,
    alimonyConfig: s.alimonyConfig ?? undefined,
    emRenteConfig: s.emRenteConfig ?? undefined,
  }
}

/**
 * Build complete configuration from simulation state
 */
function buildConfigurationFromState(simulation: SimulationState): ExtendedSavedConfiguration {
  return {
    ...getBasicConfig(simulation),
    ...getReturnConfig(simulation),
    ...getAdvancedConfig(simulation),
  }
}

/**
 * Hook to build current configuration from simulation context
 * Returns a function to get the configuration on demand to avoid unnecessary re-renders
 */
export function useCurrentConfiguration(): () => ExtendedSavedConfiguration {
  const simulation = useSimulation()
  return () => buildConfigurationFromState(simulation)
}
