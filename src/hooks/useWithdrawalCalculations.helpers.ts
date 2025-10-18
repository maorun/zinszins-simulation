/**
 * Helper functions for useWithdrawalCalculations hook
 */

import type { ReturnConfiguration } from '../../helpers/random-returns'
import type { StatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { ComparisonStrategy } from '../utils/config-storage'
import {
  calculateWithdrawal,
  calculateWithdrawalDuration,
  type WithdrawalResult,
} from '../../helpers/withdrawal'
import { createPlanningModeAwareFreibetragPerYear } from '../utils/freibetrag-calculation'
import type {
  BuildWithdrawalReturnConfigParams,
  CalculateComparisonStrategyParams,
  ComparisonStrategyResult,
  ConvertCoupleToLegacyConfigParams,
} from './useWithdrawalCalculations.types'

/**
 * Convert couple statutory pension config to legacy single config for backward compatibility
 * Combines both pensions into a single equivalent pension
 */
function getCombinedPensionConfig(
  person1: StatutoryPensionConfig,
  person2: StatutoryPensionConfig,
): StatutoryPensionConfig {
  const earlierStartYear = Math.min(person1.startYear, person2.startYear)

  return {
    enabled: true,
    startYear: earlierStartYear,
    monthlyAmount: person1.monthlyAmount + person2.monthlyAmount,
    annualIncreaseRate: (person1.annualIncreaseRate + person2.annualIncreaseRate) / 2,
    taxablePercentage: (person1.taxablePercentage + person2.taxablePercentage) / 2,
    retirementAge: Math.min(person1.retirementAge || 67, person2.retirementAge || 67),
  }
}

function getCouplePensionConfig(
  person1: StatutoryPensionConfig,
  person2: StatutoryPensionConfig,
): StatutoryPensionConfig | null {
  // If neither person has pension enabled, return null
  if (!person1.enabled && !person2.enabled) return null

  // If only one person has pension, return that config
  if (person1.enabled && !person2.enabled) return person1
  if (!person1.enabled && person2.enabled) return person2

  // If both have pensions, combine them
  if (person1.enabled && person2.enabled) {
    return getCombinedPensionConfig(person1, person2)
  }

  return null
}

export function convertCoupleToLegacyConfig(
  params: ConvertCoupleToLegacyConfigParams,
): StatutoryPensionConfig | null {
  const { coupleConfig, planningMode } = params

  if (!coupleConfig || !coupleConfig.enabled) return null

  if (planningMode === 'individual' && coupleConfig.individual) {
    return coupleConfig.individual
  }

  if (planningMode === 'couple' && coupleConfig.couple) {
    const { person1, person2 } = coupleConfig.couple
    return getCouplePensionConfig(person1, person2)
  }

  return null
}

/**
 * Build return configuration for withdrawal phase based on selected mode
 */
export function buildWithdrawalReturnConfig(
  params: BuildWithdrawalReturnConfigParams,
): ReturnConfiguration {
  const {
    withdrawalReturnMode,
    withdrawalVariableReturns,
    withdrawalAverageReturn,
    withdrawalStandardDeviation,
    withdrawalRandomSeed,
    withdrawalMultiAssetConfig,
    formValueRendite,
  } = params

  if (withdrawalReturnMode === 'random') {
    return {
      mode: 'random',
      randomConfig: {
        averageReturn: withdrawalAverageReturn / 100,
        standardDeviation: withdrawalStandardDeviation / 100,
        seed: withdrawalRandomSeed,
      },
    }
  }

  if (withdrawalReturnMode === 'variable') {
    return {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: Object.fromEntries(
          Object.entries(withdrawalVariableReturns).map(([year, rate]) => [
            parseInt(year),
            (rate as number) / 100,
          ]),
        ),
      },
    }
  }

  if (withdrawalReturnMode === 'multiasset' && withdrawalMultiAssetConfig) {
    return {
      mode: 'multiasset',
      multiAssetConfig: withdrawalMultiAssetConfig,
    }
  }

  return {
    mode: 'fixed',
    fixedRate: formValueRendite / 100,
  }
}

/**
 * Build grundfreibetrag per year object
 */
export function buildGrundfreibetragPerYear(
  startOfIndependence: number,
  endOfLife: number,
  grundfreibetragBetrag: number,
): { [year: number]: number } {
  const grundfreibetragPerYear: { [year: number]: number } = {}
  for (let year = startOfIndependence + 1; year <= endOfLife; year++) {
    grundfreibetragPerYear[year] = grundfreibetragBetrag
  }
  return grundfreibetragPerYear
}

/**
 * Build monthly config for a comparison strategy
 */
function buildMonthlyConfig(strategy: CalculateComparisonStrategyParams['strategy']) {
  return strategy.strategie === 'monatlich_fest'
    ? { monthlyAmount: strategy.monatlicheBetrag || 2000 }
    : undefined
}

/**
 * Build custom percentage for a comparison strategy
 */
function buildCustomPercentage(strategy: CalculateComparisonStrategyParams['strategy']) {
  return strategy.strategie === 'variabel_prozent'
    ? (strategy.variabelProzent || 5) / 100
    : undefined
}

/**
 * Build dynamic config for a comparison strategy
 */
function buildDynamicConfig(strategy: CalculateComparisonStrategyParams['strategy']) {
  return strategy.strategie === 'dynamisch'
    ? {
        baseWithdrawalRate: (strategy.dynamischBasisrate || 4) / 100,
        upperThresholdReturn: (strategy.dynamischObereSchwell || 8) / 100,
        upperThresholdAdjustment: (strategy.dynamischObereAnpassung || 5) / 100,
        lowerThresholdReturn: (strategy.dynamischUntereSchwell || 2) / 100,
        lowerThresholdAdjustment: (strategy.dynamischUntereAnpassung || -5) / 100,
      }
    : undefined
}

/**
 * Build bucket config for a comparison strategy
 */
function buildBucketConfig(strategy: CalculateComparisonStrategyParams['strategy']) {
  return strategy.strategie === 'bucket_strategie'
    ? {
        initialCashCushion: strategy.bucketInitialCash || 20000,
        refillThreshold: strategy.bucketRefillThreshold || 5000,
        refillPercentage: strategy.bucketRefillPercentage || 0.5,
        baseWithdrawalRate: (strategy.bucketBaseRate || 4) / 100,
      }
    : undefined
}

/**
 * Build RMD config for a comparison strategy
 */
function buildRMDConfig(
  strategy: CalculateComparisonStrategyParams['strategy'],
  getEffectiveLifeExpectancyTable: CalculateComparisonStrategyParams['getEffectiveLifeExpectancyTable'],
  customLifeExpectancy: number | undefined,
) {
  return strategy.strategie === 'rmd'
    ? {
        startAge: strategy.rmdStartAge || 65,
        lifeExpectancyTable: getEffectiveLifeExpectancyTable(),
        ...(customLifeExpectancy !== undefined && { customLifeExpectancy }),
      }
    : undefined
}

/**
 * Build kapitalerhalt config for a comparison strategy
 */
function buildKapitalerhaltConfig(strategy: CalculateComparisonStrategyParams['strategy']) {
  return strategy.strategie === 'kapitalerhalt'
    ? {
        nominalReturn: (strategy.kapitalerhaltNominalReturn || 7) / 100,
        inflationRate: (strategy.kapitalerhaltInflationRate || 2) / 100,
      }
    : undefined
}

/**
 * Build steueroptimierte entnahme config for a comparison strategy
 */
function buildSteueroptimierteEntnahmeConfig(strategy: CalculateComparisonStrategyParams['strategy']) {
  return strategy.strategie === 'steueroptimiert'
    ? {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'balanced' as const,
        freibetragUtilizationTarget: 0.85,
        rebalanceFrequency: 'yearly' as const,
      }
    : undefined
}

/**
 * Build withdrawal calculation parameters from comparison strategy
 */
function buildWithdrawalParams(
  params: CalculateComparisonStrategyParams,
  strategy: ComparisonStrategy,
  returnConfig: ReturnConfiguration,
): Parameters<typeof calculateWithdrawal>[0] {
  const {
    elements,
    startOfIndependence,
    endOfLife,
    steuerlast,
    teilfreistellungsquote,
    planningMode,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    einkommensteuersatz,
    steuerReduzierenEndkapitalEntspharphase,
    effectiveStatutoryPensionConfig,
    otherIncomeConfig,
    healthCareInsuranceConfig,
    birthYear,
    customLifeExpectancy,
    guenstigerPruefungAktiv,
    personalTaxRate,
    getEffectiveLifeExpectancyTable,
  } = params

  const grundfreibetragPerYear = grundfreibetragAktiv
    ? buildGrundfreibetragPerYear(startOfIndependence, endOfLife, grundfreibetragBetrag)
    : undefined

  const incomeTaxRate = grundfreibetragAktiv
    ? einkommensteuersatz / 100
    : (guenstigerPruefungAktiv ? personalTaxRate / 100 : undefined)

  const effectiveHealthCareInsuranceConfig = healthCareInsuranceConfig
    ? {
        ...healthCareInsuranceConfig,
        insuranceType: healthCareInsuranceConfig.insuranceType || 'statutory' as const,
      }
    : undefined

  return {
    elements,
    startYear: startOfIndependence + 1,
    endYear: endOfLife,
    strategy: strategy.strategie,
    returnConfig,
    taxRate: steuerlast,
    teilfreistellungsquote,
    freibetragPerYear: createPlanningModeAwareFreibetragPerYear(
      startOfIndependence + 1,
      endOfLife,
      planningMode,
    ),
    monthlyConfig: buildMonthlyConfig(strategy),
    customPercentage: buildCustomPercentage(strategy),
    dynamicConfig: buildDynamicConfig(strategy),
    bucketConfig: buildBucketConfig(strategy),
    rmdConfig: buildRMDConfig(strategy, getEffectiveLifeExpectancyTable, customLifeExpectancy),
    kapitalerhaltConfig: buildKapitalerhaltConfig(strategy),
    steueroptimierteEntnahmeConfig: buildSteueroptimierteEntnahmeConfig(strategy),
    enableGrundfreibetrag: grundfreibetragAktiv,
    grundfreibetragPerYear,
    incomeTaxRate,
    steuerReduzierenEndkapital: steuerReduzierenEndkapitalEntspharphase,
    statutoryPensionConfig: effectiveStatutoryPensionConfig || undefined,
    otherIncomeConfig,
    healthCareInsuranceConfig: effectiveHealthCareInsuranceConfig,
    birthYear,
    guenstigerPruefungAktiv,
  }
}

/**
 * Calculate metrics from withdrawal result
 */
function calculateWithdrawalMetrics(
  result: WithdrawalResult,
  startOfIndependence: number,
): {
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  duration: number | 'unbegrenzt'
} {
  const finalYear = Math.max(...Object.keys(result).map(Number))
  const finalCapital = result[finalYear]?.endkapital || 0

  const totalWithdrawal = Object.values(result).reduce(
    (sum, year) => sum + year.entnahme,
    0,
  )
  const totalYears = Object.keys(result).length
  const averageAnnualWithdrawal = totalWithdrawal / totalYears

  const calculatedDuration = calculateWithdrawalDuration(result, startOfIndependence + 1)
  const duration: number | 'unbegrenzt' = calculatedDuration ?? 'unbegrenzt'

  return {
    finalCapital,
    totalWithdrawal,
    averageAnnualWithdrawal,
    duration,
  }
}

/**
 * Calculate a single comparison strategy and return its results
 */
export function calculateComparisonStrategy(
  params: CalculateComparisonStrategyParams,
): ComparisonStrategyResult {
  const { strategy, startOfIndependence } = params

  // Build return configuration for this strategy
  const returnConfig: ReturnConfiguration = {
    mode: 'fixed',
    fixedRate: strategy.rendite / 100,
  }

  try {
    // Calculate withdrawal for this comparison strategy
    const withdrawalParams = buildWithdrawalParams(params, strategy, returnConfig)
    const { result } = calculateWithdrawal(withdrawalParams)

    // Calculate metrics from result
    const metrics = calculateWithdrawalMetrics(result, startOfIndependence)

    return {
      strategy,
      ...metrics,
    }
  }
  catch (error) {
    console.error(`Error calculating withdrawal for strategy ${strategy.name}:`, error)
    return {
      strategy,
      finalCapital: 0,
      totalWithdrawal: 0,
      averageAnnualWithdrawal: 0,
      duration: 'Fehler',
    }
  }
}
