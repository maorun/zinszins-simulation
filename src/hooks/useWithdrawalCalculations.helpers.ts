/**
 * Helper functions for useWithdrawalCalculations hook
 */

import type { ReturnConfiguration } from '../utils/random-returns'
import type { StatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { ComparisonStrategy, SegmentedComparisonStrategy, WithdrawalConfiguration } from '../utils/config-storage'
import {
  calculateSegmentedWithdrawal,
  calculateWithdrawal,
  calculateWithdrawalDuration,
  type WithdrawalResult,
  type WithdrawalResultElement,
} from '../../helpers/withdrawal'
import { createPlanningModeAwareFreibetragPerYear } from '../utils/freibetrag-calculation'
import type {
  BuildWithdrawalReturnConfigParams,
  CalculateComparisonStrategyParams,
  ComparisonStrategyResult,
  ConvertCoupleToLegacyConfigParams,
} from './useWithdrawalCalculations.types'
import type { SparplanElement } from '../utils/sparplan-utils'
import type { SegmentedWithdrawalConfig, WithdrawalSegment } from '../utils/segmented-withdrawal'
import type { HealthCareInsuranceConfig } from '../../helpers/health-care-insurance'
import type { OtherIncomeConfiguration } from '../../helpers/other-income'
import type { MultiAssetPortfolioConfig } from '../../helpers/multi-asset-portfolio'

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

/**
 * Determine which person's pension config to use
 */
function selectSinglePensionConfig(
  person1: StatutoryPensionConfig,
  person2: StatutoryPensionConfig,
): StatutoryPensionConfig | null {
  if (person1.enabled && !person2.enabled) return person1
  if (!person1.enabled && person2.enabled) return person2
  return null
}

function getCouplePensionConfig(
  person1: StatutoryPensionConfig,
  person2: StatutoryPensionConfig,
): StatutoryPensionConfig | null {
  // If neither person has pension enabled, return null
  if (!person1.enabled && !person2.enabled) return null

  // If only one person has pension, return that config
  const singleConfig = selectSinglePensionConfig(person1, person2)
  if (singleConfig) return singleConfig

  // If both have pensions, combine them
  return getCombinedPensionConfig(person1, person2)
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
 * Calculate segmented withdrawal for a single comparison strategy
 */
export function calculateSegmentedStrategyResult(
  strategy: SegmentedComparisonStrategy,
  elemente: SparplanElement[],
  steuerlast: number,
  startOfIndependence: number,
  endOfLife: number,
  planningMode: 'individual' | 'couple',
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined,
) {
  // Create segmented configuration for this comparison strategy
  const segmentedConfig: SegmentedWithdrawalConfig = {
    segments: strategy.segments,
    taxRate: steuerlast,
    freibetragPerYear: createPlanningModeAwareFreibetragPerYear(
      startOfIndependence + 1,
      endOfLife,
      planningMode || 'individual',
    ),
    statutoryPensionConfig: (effectiveStatutoryPensionConfig as StatutoryPensionConfig) || undefined,
  }

  // Calculate segmented withdrawal for this comparison strategy
  const result = calculateSegmentedWithdrawal(
    elemente,
    segmentedConfig,
  )

  // Get final year capital and total withdrawal
  const finalYear = Math.max(...Object.keys(result).map(Number))
  const finalCapital = result[finalYear]?.endkapital || 0

  // Calculate total withdrawal
  const totalWithdrawal = Object.values(result).reduce(
    (sum: number, year: WithdrawalResultElement) => sum + year.entnahme,
    0,
  )
  const totalYears = Object.keys(result).length
  const averageAnnualWithdrawal = totalWithdrawal / totalYears

  // Calculate withdrawal duration
  const duration = calculateWithdrawalDuration(
    result,
    startOfIndependence + 1,
  )

  return {
    strategy,
    finalCapital,
    totalWithdrawal,
    averageAnnualWithdrawal,
    duration: duration ? duration : 'unbegrenzt',
    result, // Include full result for detailed analysis
  }
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
function buildTaxConfig(params: CalculateComparisonStrategyParams) {
  const {
    startOfIndependence,
    endOfLife,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    einkommensteuersatz,
    guenstigerPruefungAktiv,
    personalTaxRate,
  } = params

  const grundfreibetragPerYear = grundfreibetragAktiv
    ? buildGrundfreibetragPerYear(startOfIndependence, endOfLife, grundfreibetragBetrag)
    : undefined

  const incomeTaxRate = grundfreibetragAktiv
    ? einkommensteuersatz / 100
    : (guenstigerPruefungAktiv ? personalTaxRate / 100 : undefined)

  return { grundfreibetragPerYear, incomeTaxRate }
}

function buildStrategyConfigs(
  strategy: ComparisonStrategy,
  getEffectiveLifeExpectancyTable: () => 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom',
  customLifeExpectancy?: number,
) {
  return {
    monthlyConfig: buildMonthlyConfig(strategy),
    customPercentage: buildCustomPercentage(strategy),
    dynamicConfig: buildDynamicConfig(strategy),
    bucketConfig: buildBucketConfig(strategy),
    rmdConfig: buildRMDConfig(strategy, getEffectiveLifeExpectancyTable, customLifeExpectancy),
    kapitalerhaltConfig: buildKapitalerhaltConfig(strategy),
    steueroptimierteEntnahmeConfig: buildSteueroptimierteEntnahmeConfig(strategy),
  }
}

function buildEffectiveHealthCareInsuranceConfig(healthCareInsuranceConfig: HealthCareInsuranceConfig | undefined) {
  return healthCareInsuranceConfig
    ? {
        ...healthCareInsuranceConfig,
        insuranceType: healthCareInsuranceConfig.insuranceType || 'statutory' as const,
      }
    : undefined
}

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
    steuerReduzierenEndkapitalEntspharphase,
    effectiveStatutoryPensionConfig,
    otherIncomeConfig,
    healthCareInsuranceConfig,
    birthYear,
    customLifeExpectancy,
    guenstigerPruefungAktiv,
    getEffectiveLifeExpectancyTable,
  } = params

  const { grundfreibetragPerYear, incomeTaxRate } = buildTaxConfig(params)
  const strategyConfigs = buildStrategyConfigs(strategy, getEffectiveLifeExpectancyTable, customLifeExpectancy)
  const effectiveHealthCareInsuranceConfig = buildEffectiveHealthCareInsuranceConfig(healthCareInsuranceConfig)

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
    ...strategyConfigs,
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

/**
 * Build segmented withdrawal result
 */
export function buildSegmentedWithdrawalResult(params: {
  elemente: SparplanElement[]
  withdrawalSegments: WithdrawalSegment[]
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined
}): WithdrawalResult {
  const { elemente, withdrawalSegments, effectiveStatutoryPensionConfig } = params

  const { calculateSegmentedWithdrawal } = require('../../helpers/withdrawal')

  const segmentedConfig = {
    segments: withdrawalSegments,
    taxRate: 0.26375,
    freibetragPerYear: undefined,
    statutoryPensionConfig: effectiveStatutoryPensionConfig || undefined,
  }

  return calculateSegmentedWithdrawal(elemente, segmentedConfig)
}

/**
 * Build tax-related parameters for withdrawal calculation
 */
function buildWithdrawalTaxParams(params: {
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
  startOfIndependence: number
  endOfLife: number
  formValue: WithdrawalConfiguration['formValue']
  guenstigerPruefungAktiv: boolean
  personalTaxRate: number
}) {
  const { grundfreibetragAktiv, grundfreibetragBetrag, startOfIndependence, endOfLife } = params
  const { formValue, guenstigerPruefungAktiv, personalTaxRate } = params

  return {
    enableGrundfreibetrag: grundfreibetragAktiv,
    grundfreibetragPerYear: grundfreibetragAktiv
      ? buildGrundfreibetragPerYear(startOfIndependence, endOfLife, grundfreibetragBetrag)
      : undefined,
    incomeTaxRate: grundfreibetragAktiv
      ? formValue.einkommensteuersatz / 100
      : (guenstigerPruefungAktiv ? personalTaxRate / 100 : undefined),
    guenstigerPruefungAktiv,
  }
}

/**
 * Build all strategy-specific configurations from form value
 */
function buildAllStrategyConfigs(
  formValue: WithdrawalConfiguration['formValue'],
  getEffectiveLifeExpectancyTable: () => 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom',
  customLifeExpectancy: number | undefined,
) {
  return {
    monthlyConfig: buildMonthlyConfigFromFormValue(formValue),
    customPercentage: buildCustomPercentageFromFormValue(formValue),
    dynamicConfig: buildDynamicConfigFromFormValue(formValue),
    bucketConfig: buildBucketConfigFromFormValue(formValue),
    rmdConfig: buildRMDConfigFromFormValue(formValue, getEffectiveLifeExpectancyTable, customLifeExpectancy),
    kapitalerhaltConfig: buildKapitalerhaltConfigFromFormValue(formValue),
    steueroptimierteEntnahmeConfig: buildSteueroptimierteEntnahmeConfigFromFormValue(formValue),
  }
}

/**
 * Build single strategy withdrawal result
 */
/**
 * Build withdrawal calculation parameters from form value and context
 */
function buildWithdrawalCalculationParams(params: {
  elemente: SparplanElement[]
  startOfIndependence: number
  endOfLife: number
  formValue: WithdrawalConfiguration['formValue']
  withdrawalReturnConfig: ReturnConfiguration
  steuerlast: number
  teilfreistellungsquote: number
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
  guenstigerPruefungAktiv: boolean
  personalTaxRate: number
  steuerReduzierenEndkapitalEntspharphase: boolean
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined
  otherIncomeConfig: OtherIncomeConfiguration | undefined
  birthYear: number
  getEffectiveLifeExpectancyTable: () => 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  customLifeExpectancy: number | undefined
}) {
  const taxParams = buildWithdrawalTaxParams(params)
  const strategyConfigs = buildAllStrategyConfigs(
    params.formValue,
    params.getEffectiveLifeExpectancyTable,
    params.customLifeExpectancy,
  )

  return {
    elements: params.elemente,
    startYear: params.startOfIndependence + 1,
    endYear: params.endOfLife,
    strategy: params.formValue.strategie,
    withdrawalFrequency: params.formValue.withdrawalFrequency,
    returnConfig: params.withdrawalReturnConfig,
    taxRate: params.steuerlast,
    teilfreistellungsquote: params.teilfreistellungsquote,
    freibetragPerYear: undefined,
    ...strategyConfigs,
    ...taxParams,
    inflationConfig: params.formValue.inflationAktiv
      ? { inflationRate: params.formValue.inflationsrate / 100 }
      : undefined,
    steuerReduzierenEndkapital: params.steuerReduzierenEndkapitalEntspharphase,
    statutoryPensionConfig: params.effectiveStatutoryPensionConfig || undefined,
    otherIncomeConfig: params.otherIncomeConfig,
    healthCareInsuranceConfig: buildHealthCareInsuranceConfig(params.formValue),
    birthYear: params.birthYear,
  }
}

export function buildSingleStrategyWithdrawalResult(params: {
  elemente: SparplanElement[]
  startOfIndependence: number
  endOfLife: number
  formValue: WithdrawalConfiguration['formValue']
  withdrawalReturnMode: WithdrawalConfiguration['withdrawalReturnMode']
  withdrawalVariableReturns: WithdrawalConfiguration['withdrawalVariableReturns']
  withdrawalAverageReturn: number
  withdrawalStandardDeviation: number
  withdrawalRandomSeed: number | undefined
  withdrawalMultiAssetConfig: MultiAssetPortfolioConfig | undefined
  steuerlast: number
  teilfreistellungsquote: number
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
  guenstigerPruefungAktiv: boolean
  personalTaxRate: number
  steuerReduzierenEndkapitalEntspharphase: boolean
  effectiveStatutoryPensionConfig: StatutoryPensionConfig | null | undefined
  otherIncomeConfig: OtherIncomeConfiguration | undefined
  birthYear: number
  getEffectiveLifeExpectancyTable: () => 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  customLifeExpectancy: number | undefined
}): WithdrawalResult {
  const withdrawalReturnConfig = buildWithdrawalReturnConfig({
    withdrawalReturnMode: params.withdrawalReturnMode,
    withdrawalVariableReturns: params.withdrawalVariableReturns,
    withdrawalAverageReturn: params.withdrawalAverageReturn,
    withdrawalStandardDeviation: params.withdrawalStandardDeviation,
    withdrawalRandomSeed: params.withdrawalRandomSeed,
    withdrawalMultiAssetConfig: params.withdrawalMultiAssetConfig,
    formValueRendite: params.formValue.rendite,
  })

  const calculationParams = buildWithdrawalCalculationParams({
    ...params,
    withdrawalReturnConfig,
  })

  const withdrawalCalculation = calculateWithdrawal(calculationParams)

  return withdrawalCalculation.result
}

/**
 * Build monthly config from form value
 */
function buildMonthlyConfigFromFormValue(formValue: WithdrawalConfiguration['formValue']) {
  return formValue.strategie === 'monatlich_fest'
    ? {
        monthlyAmount: formValue.monatlicheBetrag,
        enableGuardrails: formValue.guardrailsAktiv,
        guardrailsThreshold: formValue.guardrailsSchwelle / 100,
      }
    : undefined
}

/**
 * Build custom percentage from form value
 */
function buildCustomPercentageFromFormValue(formValue: WithdrawalConfiguration['formValue']) {
  return formValue.strategie === 'variabel_prozent'
    ? formValue.variabelProzent / 100
    : undefined
}

/**
 * Build dynamic config from form value
 */
function buildDynamicConfigFromFormValue(formValue: WithdrawalConfiguration['formValue']) {
  return formValue.strategie === 'dynamisch'
    ? {
        baseWithdrawalRate: formValue.dynamischBasisrate / 100,
        upperThresholdReturn: formValue.dynamischObereSchwell / 100,
        upperThresholdAdjustment: formValue.dynamischObereAnpassung / 100,
        lowerThresholdReturn: formValue.dynamischUntereSchwell / 100,
        lowerThresholdAdjustment: formValue.dynamischUntereAnpassung / 100,
      }
    : undefined
}

/**
 * Build bucket config from form value
 */
function buildBucketConfigFromFormValue(formValue: WithdrawalConfiguration['formValue']) {
  return formValue.strategie === 'bucket_strategie' && formValue.bucketConfig
    ? {
        initialCashCushion: formValue.bucketConfig.initialCashCushion,
        refillThreshold: formValue.bucketConfig.refillThreshold,
        refillPercentage: formValue.bucketConfig.refillPercentage,
        baseWithdrawalRate: formValue.bucketConfig.baseWithdrawalRate,
      }
    : undefined
}

/**
 * Build RMD config for single strategy from form value
 */
function buildRMDConfigFromFormValue(
  formValue: WithdrawalConfiguration['formValue'],
  getEffectiveLifeExpectancyTable: () => 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom',
  customLifeExpectancy: number | undefined,
) {
  return formValue.strategie === 'rmd'
    ? {
        startAge: formValue.rmdStartAge,
        lifeExpectancyTable: getEffectiveLifeExpectancyTable(),
        ...(customLifeExpectancy !== undefined && { customLifeExpectancy }),
      }
    : undefined
}

/**
 * Build kapitalerhalt config for single strategy from form value
 */
function buildKapitalerhaltConfigFromFormValue(formValue: WithdrawalConfiguration['formValue']) {
  return formValue.strategie === 'kapitalerhalt'
    ? {
        nominalReturn: formValue.kapitalerhaltNominalReturn / 100,
        inflationRate: formValue.kapitalerhaltInflationRate / 100,
      }
    : undefined
}

/**
 * Build steueroptimierte entnahme config for single strategy from form value
 */
function buildSteueroptimierteEntnahmeConfigFromFormValue(formValue: WithdrawalConfiguration['formValue']) {
  return formValue.strategie === 'steueroptimiert'
    ? {
        baseWithdrawalRate: formValue.steueroptimierteEntnahmeBaseWithdrawalRate,
        targetTaxRate: formValue.steueroptimierteEntnahmeTargetTaxRate,
        optimizationMode: formValue.steueroptimierteEntnahmeOptimizationMode,
        freibetragUtilizationTarget: formValue.steueroptimierteEntnahmeFreibetragUtilizationTarget,
        rebalanceFrequency: formValue.steueroptimierteEntnahmeRebalanceFrequency,
      }
    : undefined
}

/**
 * Build health care insurance config from form value
 */
function buildHealthCareInsuranceConfig(formValue: WithdrawalConfiguration['formValue']) {
  return formValue.healthCareInsuranceConfig
    ? {
        ...formValue.healthCareInsuranceConfig,
        insuranceType: formValue.healthCareInsuranceConfig.insuranceType || 'statutory',
      }
    : undefined
}
