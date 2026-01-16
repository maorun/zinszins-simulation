/**
 * Configuration Mapping Utilities
 *
 * Provides reusable functions to map simulation context to various configuration formats.
 * This centralizes the logic for converting between different configuration structures,
 * reducing code duplication and improving maintainability.
 */

import type { SimulationContextState } from '../contexts/SimulationContext'
import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'

/**
 * Extracts tax configuration from simulation context
 */
function extractTaxConfig(context: SimulationContextState) {
  return {
    rendite: context.rendite,
    steuerlast: context.steuerlast,
    teilfreistellungsquote: context.teilfreistellungsquote,
    freibetragPerYear: context.freibetragPerYear,
    basiszinsConfiguration: context.basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase: context.steuerReduzierenEndkapitalSparphase,
    grundfreibetragAktiv: context.grundfreibetragAktiv,
    grundfreibetragBetrag: context.grundfreibetragBetrag,
    personalTaxRate: context.personalTaxRate,
    guenstigerPruefungAktiv: context.guenstigerPruefungAktiv,
    kirchensteuerAktiv: context.kirchensteuerAktiv,
    kirchensteuersatz: context.kirchensteuersatz,
  }
}

/**
 * Extracts asset and return configuration from simulation context
 */
function extractAssetAndReturnConfig(context: SimulationContextState) {
  return {
    assetClass: context.assetClass,
    customTeilfreistellungsquote: context.customTeilfreistellungsquote,
    freistellungsauftragAccounts: context.freistellungsauftragAccounts,
    returnMode: context.returnMode,
    averageReturn: context.averageReturn,
    standardDeviation: context.standardDeviation,
    randomSeed: context.randomSeed,
    variableReturns: context.variableReturns,
    historicalIndex: context.historicalIndex,
    multiAssetConfig: context.multiAssetConfig,
  }
}

/**
 * Extracts time, savings, and inflation configuration from simulation context
 */
function extractTimeAndSavingsConfig(context: SimulationContextState) {
  return {
    inflationAktivSparphase: context.inflationAktivSparphase,
    inflationsrateSparphase: context.inflationsrateSparphase,
    inflationAnwendungSparphase: context.inflationAnwendungSparphase,
    startEnd: context.startEnd,
    sparplan: context.sparplan,
    simulationAnnual: context.simulationAnnual,
  }
}

/**
 * Extracts life planning configuration from simulation context
 */
function extractLifePlanningConfig(context: SimulationContextState) {
  return {
    endOfLife: context.endOfLife,
    lifeExpectancyTable: context.lifeExpectancyTable,
    customLifeExpectancy: context.customLifeExpectancy,
    planningMode: context.planningMode,
    gender: context.gender,
    spouse: context.spouse,
    birthYear: context.birthYear,
    expectedLifespan: context.expectedLifespan,
    useAutomaticCalculation: context.useAutomaticCalculation,
  }
}

/**
 * Extracts optional configurations from simulation context
 */
function extractOptionalConfigs(context: SimulationContextState) {
  return {
    withdrawal: context.withdrawalConfig || undefined,
    statutoryPensionConfig: context.statutoryPensionConfig || undefined,
    coupleStatutoryPensionConfig: context.coupleStatutoryPensionConfig || undefined,
    careCostConfiguration: context.careCostConfiguration,
    financialGoals: context.financialGoals,
    emergencyFundConfig: context.emergencyFundConfig,
    termLifeInsuranceConfig: context.termLifeInsuranceConfig || undefined,
    careInsuranceConfig: context.careInsuranceConfig || undefined,
    alimonyConfig: context.alimonyConfig,
    emRenteConfig: context.emRenteConfig || undefined,
  }
}

/**
 * Maps a SimulationContextState to ExtendedSavedConfiguration format
 *
 * This function extracts all relevant properties from the simulation context
 * and converts them into the ExtendedSavedConfiguration format used for
 * storing, comparing, and exporting simulation configurations.
 *
 * @param context - The simulation context to map
 * @returns A complete ExtendedSavedConfiguration object
 *
 * @example
 * ```typescript
 * const simulationContext = useSimulation()
 * const config = mapSimulationContextToConfig(simulationContext)
 * // config can now be used for storage, comparison, or export
 * ```
 */
export function mapSimulationContextToConfig(
  context: SimulationContextState
): ExtendedSavedConfiguration {
  return {
    ...extractTaxConfig(context),
    ...extractAssetAndReturnConfig(context),
    ...extractTimeAndSavingsConfig(context),
    ...extractLifePlanningConfig(context),
    ...extractOptionalConfigs(context),
  }
}
