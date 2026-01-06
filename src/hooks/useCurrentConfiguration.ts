/**
 * Hook to get current configuration for saving
 */

import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'
import { useSimulation } from '../contexts/useSimulation'

/**
 * Build configuration from simulation state
 */
function buildConfigurationFromState(simulation: ReturnType<typeof useSimulation>): ExtendedSavedConfiguration {
  return {
    rendite: simulation.rendite,
    steuerlast: simulation.steuerlast,
    teilfreistellungsquote: simulation.teilfreistellungsquote,
    freibetragPerYear: simulation.freibetragPerYear,
    basiszinsConfiguration: simulation.basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase: simulation.steuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase: simulation.steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv: simulation.grundfreibetragAktiv,
    grundfreibetragBetrag: simulation.grundfreibetragBetrag,
    personalTaxRate: simulation.personalTaxRate,
    guenstigerPruefungAktiv: simulation.guenstigerPruefungAktiv,
    kirchensteuerAktiv: simulation.kirchensteuerAktiv,
    kirchensteuersatz: simulation.kirchensteuersatz,
    assetClass: simulation.assetClass,
    customTeilfreistellungsquote: simulation.customTeilfreistellungsquote,
    freistellungsauftragAccounts: simulation.freistellungsauftragAccounts,
    returnMode: simulation.returnMode,
    averageReturn: simulation.averageReturn,
    standardDeviation: simulation.standardDeviation,
    randomSeed: simulation.randomSeed,
    variableReturns: simulation.variableReturns,
    historicalIndex: simulation.historicalIndex,
    multiAssetConfig: simulation.multiAssetConfig,
    withdrawalMultiAssetConfig: simulation.withdrawalMultiAssetConfig,
    inflationAktivSparphase: simulation.inflationAktivSparphase,
    inflationsrateSparphase: simulation.inflationsrateSparphase,
    inflationAnwendungSparphase: simulation.inflationAnwendungSparphase,
    startEnd: simulation.startEnd,
    sparplan: simulation.sparplan,
    simulationAnnual: simulation.simulationAnnual,
    endOfLife: simulation.endOfLife,
    lifeExpectancyTable: simulation.lifeExpectancyTable,
    customLifeExpectancy: simulation.customLifeExpectancy,
    planningMode: simulation.planningMode,
    gender: simulation.gender,
    spouse: simulation.spouse,
    birthYear: simulation.birthYear,
    expectedLifespan: simulation.expectedLifespan,
    useAutomaticCalculation: simulation.useAutomaticCalculation,
    withdrawal: simulation.withdrawalConfig ?? undefined,
    statutoryPensionConfig: simulation.statutoryPensionConfig ?? undefined,
    coupleStatutoryPensionConfig: simulation.coupleStatutoryPensionConfig ?? undefined,
    careCostConfiguration: simulation.careCostConfiguration,
    financialGoals: simulation.financialGoals,
    emergencyFundConfig: simulation.emergencyFundConfig,
    termLifeInsuranceConfig: simulation.termLifeInsuranceConfig ?? undefined,
    careInsuranceConfig: simulation.careInsuranceConfig ?? undefined,
    alimonyConfig: simulation.alimonyConfig ?? undefined,
    emRenteConfig: simulation.emRenteConfig ?? undefined,
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
