import type { SparplanElement } from '../src/utils/sparplan-utils'
import { getBasiszinsForYear, calculateVorabpauschale, calculateSteuerOnVorabpauschale, performGuenstigerPruefung } from './steuer'
import { generateRandomReturns, type ReturnConfiguration } from '../src/utils/random-returns'
import type { SegmentedWithdrawalConfig, WithdrawalSegment } from '../src/utils/segmented-withdrawal'
import type { WithdrawalFrequency } from '../src/utils/config-storage'
import type { BasiszinsConfiguration } from '../src/services/bundesbank-api'
import { calculateRMDWithdrawal } from './rmd-tables'
import { calculateStatutoryPension, type StatutoryPensionConfig, type StatutoryPensionResult } from './statutory-pension'
import { calculateOtherIncome, type OtherIncomeConfiguration, type OtherIncomeResult, type OtherIncomeYearResult } from './other-income'
import { calculateHealthCareInsuranceForYear, calculateCoupleHealthInsuranceForYear, type HealthCareInsuranceConfig, type CoupleHealthInsuranceYearResult, type HealthCareInsuranceYearResult } from './health-care-insurance'

export type WithdrawalStrategy = '4prozent' | '3prozent' | 'monatlich_fest' | 'variabel_prozent' | 'dynamisch' | 'bucket_strategie' | 'rmd' | 'kapitalerhalt' | 'steueroptimiert'

/**
 * Generate fixed rate growth for all years
 */
function generateFixedGrowthRates(
  allYears: number[],
  fixedRate: number,
): Record<number, number> {
  const yearlyGrowthRates: Record<number, number> = {}
  for (const year of allYears) {
    yearlyGrowthRates[year] = fixedRate
  }
  return yearlyGrowthRates
}

/**
 * Generate variable growth rates from config
 */
function generateVariableGrowthRates(
  allYears: number[],
  variableConfig: { yearlyReturns: Record<number, number> },
): Record<number, number> {
  const yearlyGrowthRates: Record<number, number> = {}
  for (const year of allYears) {
    yearlyGrowthRates[year] = variableConfig.yearlyReturns[year] || 0.05
  }
  return yearlyGrowthRates
}

/**
 * Generate multi-asset growth rates with fallback
 */
function generateMultiAssetGrowthRates(
  allYears: number[],
  multiAssetConfig: unknown,
): Record<number, number> {
  try {
    const { generateMultiAssetReturns } = require('./multi-asset-calculations')
    return generateMultiAssetReturns(allYears, multiAssetConfig)
  }
  catch (error) {
    console.warn('Multi-asset calculations not available, falling back to 5% fixed return:', error)
    return generateFixedGrowthRates(allYears, 0.05)
  }
}

/**
 * Generate growth rates for each return mode
 */
const GROWTH_RATE_GENERATORS: Record<
  string,
  (allYears: number[], returnConfig: ReturnConfiguration) => Record<number, number>
> = {
  fixed: (allYears, config) => generateFixedGrowthRates(allYears, config.fixedRate || 0.05),
  random: (allYears, config) => config.randomConfig
    ? generateRandomReturns(allYears, config.randomConfig)
    : {},
  variable: (allYears, config) => config.variableConfig
    ? generateVariableGrowthRates(allYears, config.variableConfig)
    : {},
  multiasset: (allYears, config) => config.multiAssetConfig
    ? generateMultiAssetGrowthRates(allYears, config.multiAssetConfig)
    : {},
}

/**
 * Helper function: Generate yearly growth rates based on return configuration
 */
function generateYearlyGrowthRates(
  allYears: number[],
  returnConfig: ReturnConfiguration,
): Record<number, number> {
  const generator = GROWTH_RATE_GENERATORS[returnConfig.mode]
  return generator ? generator(allYears, returnConfig) : {}
}

/**
 * Helper function: Determine years for growth rate generation
 */
function determineYearsForGrowthRates(
  startYear: number,
  endYear: number,
  strategy: WithdrawalStrategy,
  bucketConfig?: BucketStrategyConfig,
): number[] {
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)

  // For dynamic strategy or bucket strategy with dynamic sub-strategy, include previous year
  const needsPreviousYear = strategy === 'dynamisch'
    || (strategy === 'bucket_strategie' && bucketConfig?.subStrategy === 'dynamisch')

  return needsPreviousYear
    ? Array.from({ length: endYear - startYear + 2 }, (_, i) => startYear - 1 + i)
    : years
}

/**
 * Helper function: Initialize statutory pension data if configured
 */
function initializeStatutoryPensionData(
  statutoryPensionConfig: StatutoryPensionConfig | undefined,
  startYear: number,
  endYear: number,
): StatutoryPensionResult {
  return statutoryPensionConfig?.enabled
    ? calculateStatutoryPension(
        statutoryPensionConfig,
        startYear,
        endYear,
        0, // Income tax calculated centrally, not per source
        {}, // No Grundfreibetrag per source, applied centrally
      )
    : {}
}

/**
 * Helper function: Initialize other income data if configured
 */
function initializeOtherIncomeData(
  otherIncomeConfig: OtherIncomeConfiguration | undefined,
  startYear: number,
  endYear: number,
): OtherIncomeResult {
  return otherIncomeConfig?.enabled
    ? calculateOtherIncome(otherIncomeConfig, startYear, endYear)
    : {}
}

/**
 * Helper function: Create Freibetrag accessor function
 */
function createFreibetragAccessor(
  freibetragPerYear?: { [year: number]: number },
): (year: number) => number {
  return (year: number): number => {
    if (freibetragPerYear && freibetragPerYear[year] !== undefined) {
      return freibetragPerYear[year]
    }
    return freibetrag[2023] || 2000
  }
}

/**
 * Helper function: Create Grundfreibetrag accessor function
 */
function createGrundfreibetragAccessor(
  grundfreibetragPerYear?: { [year: number]: number },
): (year: number) => number {
  return (year: number): number => {
    if (grundfreibetragPerYear && grundfreibetragPerYear[year] !== undefined) {
      return grundfreibetragPerYear[year]
    }
    return grundfreibetrag[2023] || 10908
  }
}

/**
 * Helper function: Calculate initial starting capital
 */
function calculateInitialStartingCapital(
  elements: SparplanElement[],
  startYear: number,
): number {
  return elements.reduce((sum: number, el: SparplanElement) => {
    const simYear = el.simulation?.[startYear - 1]
    return sum + (simYear?.endkapital || 0)
  }, 0)
}

/**
 * Helper function: Initialize cash cushion for bucket strategy
 */
function initializeCashCushion(
  strategy: WithdrawalStrategy,
  bucketConfig?: BucketStrategyConfig,
): number {
  return strategy === 'bucket_strategie' && bucketConfig ? bucketConfig.initialCashCushion : 0
}

/**
 * Helper function: Initialize mutable layers from elements
 */
function initializeMutableLayers(
  elements: SparplanElement[],
  startYear: number,
): MutableLayer[] {
  const mutableLayers: MutableLayer[] = JSON.parse(JSON.stringify(elements)).map((el: SparplanElement) => {
    const lastSimData = el.simulation?.[startYear - 1]
    const initialCost = el.type === 'einmalzahlung' ? el.einzahlung + (el.gewinn || 0) : el.einzahlung
    return {
      ...el,
      currentValue: lastSimData?.endkapital || 0,
      costBasis: initialCost,
      accumulatedVorabpauschale: lastSimData?.vorabpauschaleAccumulated || 0,
    }
  })
  mutableLayers.sort((a: MutableLayer, b: MutableLayer) => new Date(a.start).getTime() - new Date(b.start).getTime())
  return mutableLayers
}

/**
 * Helper function: Create Vorabpauschale details object
 */
function createVorabpauschaleDetails(
  totalVorabpauschale: number,
  vorabCalculations: Array<{
    layer: MutableLayer
    vorabpauschaleBetrag: number
    potentialTax: number
    valueBeforeWithdrawal: number
  }>,
  basiszins: number,
  totalPotentialVorabTax: number,
  returnRate: number,
  capitalAtStartOfYear: number,
) {
  if (totalVorabpauschale <= 0) return undefined

  return {
    basiszins,
    basisertrag: vorabCalculations.reduce((sum, calc) => {
      const valueBeforeWithdrawal = calc.valueBeforeWithdrawal
      return sum + (valueBeforeWithdrawal * basiszins * 0.7)
    }, 0),
    vorabpauschaleAmount: totalVorabpauschale,
    steuerVorFreibetrag: totalPotentialVorabTax,
    jahresgewinn: vorabCalculations.reduce((sum, calc) => {
      const valueBeforeWithdrawal = calc.valueBeforeWithdrawal
      const valueAfterGrowthBeforeWithdrawal = valueBeforeWithdrawal * (1 + returnRate)
      return sum + (valueAfterGrowthBeforeWithdrawal - valueBeforeWithdrawal)
    }, 0),
    anteilImJahr: 12,
    startkapital: capitalAtStartOfYear,
  }
}

/**
 * Helper function: Update final layers with simulation data
 */
function updateFinalLayers(
  mutableLayers: MutableLayer[],
  endYear: number,
): MutableLayer[] {
  return mutableLayers.map((l: MutableLayer) => {
    // For finalLayers, we should set the simulation data at endYear, not the last existing year
    // This ensures proper handoff between segments
    l.simulation = l.simulation || {}
    l.simulation[endYear] = {
      ...(l.simulation[endYear] || {}),
      endkapital: l.currentValue,
      vorabpauschaleAccumulated: l.accumulatedVorabpauschale,
    }
    return l
  })
}

/**
 * Helper function: Calculate bucket strategy withdrawal amount
 */
/**
 * Calculate withdrawal rate for bucket strategy
 */
function getBucketStrategyRate(bucketConfig: BucketStrategyConfig): number {
  switch (bucketConfig.subStrategy) {
    case '4prozent':
      return 0.04
    case '3prozent':
      return 0.03
    case 'variabel_prozent':
      return bucketConfig.variabelProzent ? bucketConfig.variabelProzent / 100 : 0.04
    case 'dynamisch':
      return bucketConfig.dynamischBasisrate ? bucketConfig.dynamischBasisrate / 100 : 0.04
    default:
      return bucketConfig.baseWithdrawalRate
  }
}

function calculateBucketStrategyAmount(
  initialStartingCapital: number,
  bucketConfig: BucketStrategyConfig,
): number {
  if (bucketConfig.subStrategy === 'monatlich_fest') {
    return bucketConfig.monatlicheBetrag
      ? bucketConfig.monatlicheBetrag * 12
      : initialStartingCapital * 0.04
  }

  const rate = getBucketStrategyRate(bucketConfig)
  return initialStartingCapital * rate
}

/**
 * Helper function: Calculate RMD withdrawal amount
 */
function calculateRMDAmount(
  initialStartingCapital: number,
  rmdConfig: RMDConfig,
): number {
  return calculateRMDWithdrawal(
    initialStartingCapital,
    rmdConfig.startAge,
    rmdConfig.lifeExpectancyTable,
    rmdConfig.customLifeExpectancy,
  )
}

/**
 * Helper function: Calculate capital preservation withdrawal amount
 */
function calculateKapitalerhaltAmount(
  initialStartingCapital: number,
  kapitalerhaltConfig: KapitalerhaltConfig,
): number {
  const realReturnRate = kapitalerhaltConfig.nominalReturn - kapitalerhaltConfig.inflationRate
  return initialStartingCapital * realReturnRate
}

/**
 * Parameters for calculating base withdrawal amount
 */
type BaseWithdrawalParams = {
  strategy: WithdrawalStrategy
  initialStartingCapital: number
  monthlyConfig?: MonthlyWithdrawalConfig
  customPercentage?: number
  dynamicConfig?: DynamicWithdrawalConfig
  bucketConfig?: BucketStrategyConfig
  rmdConfig?: RMDConfig
  kapitalerhaltConfig?: KapitalerhaltConfig
  steueroptimierteEntnahmeConfig?: SteueroptimierteEntnahmeConfig
}

/**
 * Helper function: Calculate base withdrawal amount based on strategy
 */
/**
 * Calculate monthly fixed withdrawal amount (helper for base calculation)
 */
function calculateMonthlyFixedAmount(
  strategy: WithdrawalStrategy,
  monthlyConfig?: MonthlyWithdrawalConfig,
): number {
  if (strategy === 'monatlich_fest' && monthlyConfig) {
    return monthlyConfig.monthlyAmount * 12
  }
  return 0
}

/**
 * Calculate percentage-based withdrawal amount
 */
function calculatePercentageWithdrawal(
  initialStartingCapital: number,
  customPercentage?: number,
): number {
  if (customPercentage === undefined) throw new Error('Custom percentage required')
  return initialStartingCapital * customPercentage
}

/**
 * Calculate dynamic withdrawal amount
 */
function calculateDynamicWithdrawal(
  initialStartingCapital: number,
  dynamicConfig?: DynamicWithdrawalConfig,
): number {
  if (!dynamicConfig) throw new Error('Dynamic config required')
  return initialStartingCapital * dynamicConfig.baseWithdrawalRate
}

/**
 * Get default steueroptimiert config
 */
function getDefaultSteueroptimierteConfig(): SteueroptimierteEntnahmeConfig {
  return {
    baseWithdrawalRate: 0.04,
    targetTaxRate: 0.26375,
    optimizationMode: 'balanced' as const,
    freibetragUtilizationTarget: 0.85,
    rebalanceFrequency: 'yearly' as const,
  }
}

/**
 * Calculate steueroptimiert withdrawal amount
 */
function calculateSteueroptimierteWithdrawal(
  initialStartingCapital: number,
  steueroptimierteEntnahmeConfig?: SteueroptimierteEntnahmeConfig,
): number {
  const config = steueroptimierteEntnahmeConfig || getDefaultSteueroptimierteConfig()
  return initialStartingCapital * config.baseWithdrawalRate
}

/**
 * Calculate standard 3% or 4% rule withdrawal
 */
function calculateStandardRuleWithdrawal(
  strategy: WithdrawalStrategy,
  initialStartingCapital: number,
): number {
  const withdrawalRate = strategy === '4prozent' ? 0.04 : 0.03
  return initialStartingCapital * withdrawalRate
}

function getWithdrawalCalculator(strategy: WithdrawalStrategy, params: BaseWithdrawalParams) {
  const strategies = {
    monatlich_fest: () => {
      if (!params.monthlyConfig) throw new Error('Monthly config required')
      return calculateMonthlyFixedAmount(strategy, params.monthlyConfig)
    },
    variabel_prozent: () => calculatePercentageWithdrawal(params.initialStartingCapital, params.customPercentage),
    dynamisch: () => calculateDynamicWithdrawal(params.initialStartingCapital, params.dynamicConfig),
    bucket_strategie: () => {
      if (!params.bucketConfig) throw new Error('Bucket strategy config required')
      return calculateBucketStrategyAmount(params.initialStartingCapital, params.bucketConfig)
    },
    rmd: () => {
      if (!params.rmdConfig) throw new Error('RMD config required')
      return calculateRMDAmount(params.initialStartingCapital, params.rmdConfig)
    },
    kapitalerhalt: () => {
      if (!params.kapitalerhaltConfig) throw new Error('Kapitalerhalt config required')
      return calculateKapitalerhaltAmount(params.initialStartingCapital, params.kapitalerhaltConfig)
    },
    steueroptimiert: () => calculateSteueroptimierteWithdrawal(
      params.initialStartingCapital,
      params.steueroptimierteEntnahmeConfig,
    ),
  }

  return strategies[strategy as keyof typeof strategies]
    || (() => calculateStandardRuleWithdrawal(strategy, params.initialStartingCapital))
}

function calculateBaseWithdrawalAmount(params: BaseWithdrawalParams): number {
  const calculator = getWithdrawalCalculator(params.strategy, params)
  return calculator()
}

/**
 * Calculate dynamic strategy adjustment
 */
function calculateDynamicStrategyAdjustment(
  annualWithdrawal: number,
  previousReturn: number,
  dynamicConfig: DynamicWithdrawalConfig,
): number {
  if (previousReturn > dynamicConfig.upperThresholdReturn) {
    return annualWithdrawal * dynamicConfig.upperThresholdAdjustment
  }
  if (previousReturn < dynamicConfig.lowerThresholdReturn) {
    return annualWithdrawal * dynamicConfig.lowerThresholdAdjustment
  }
  return 0
}

/**
 * Check if bucket dynamic config is valid
 */
function hasBucketDynamicConfig(bucketConfig: BucketStrategyConfig): boolean {
  return bucketConfig.dynamischObereSchwell !== undefined
    && bucketConfig.dynamischUntereSchwell !== undefined
    && bucketConfig.dynamischObereAnpassung !== undefined
    && bucketConfig.dynamischUntereAnpassung !== undefined
}

/**
 * Calculate bucket dynamic adjustment
 */
function calculateBucketDynamicAdjustment(
  annualWithdrawal: number,
  previousReturn: number,
  bucketConfig: BucketStrategyConfig,
): number {
  if (!hasBucketDynamicConfig(bucketConfig)) {
    return 0
  }

  const upperThreshold = bucketConfig.dynamischObereSchwell! / 100
  const lowerThreshold = bucketConfig.dynamischUntereSchwell! / 100
  const upperAdjustment = bucketConfig.dynamischObereAnpassung! / 100
  const lowerAdjustment = bucketConfig.dynamischUntereAnpassung! / 100

  if (previousReturn > upperThreshold) {
    return annualWithdrawal * upperAdjustment
  }
  if (previousReturn < lowerThreshold) {
    return annualWithdrawal * lowerAdjustment
  }
  return 0
}

/**
 * Helper function: Calculate dynamic withdrawal adjustments
 */
function calculateDynamicAdjustment(
  strategy: WithdrawalStrategy,
  annualWithdrawal: number,
  year: number,
  yearlyGrowthRates: Record<number, number>,
  dynamicConfig?: DynamicWithdrawalConfig,
  bucketConfig?: BucketStrategyConfig,
): { adjustment: number, previousReturn: number | undefined } {
  const previousYear = year - 1
  const previousReturn = yearlyGrowthRates[previousYear]

  if (previousReturn === undefined) {
    return { adjustment: 0, previousReturn: undefined }
  }

  if (strategy === 'dynamisch' && dynamicConfig) {
    const adjustment = calculateDynamicStrategyAdjustment(annualWithdrawal, previousReturn, dynamicConfig)
    return { adjustment, previousReturn }
  }

  if (strategy === 'bucket_strategie' && bucketConfig && bucketConfig.subStrategy === 'dynamisch') {
    const adjustment = calculateBucketDynamicAdjustment(annualWithdrawal, previousReturn, bucketConfig)
    return { adjustment, previousReturn }
  }

  return { adjustment: 0, previousReturn }
}

/**
 * Helper function: Handle bucket strategy withdrawal decision
 */
function processBucketStrategyWithdrawal(
  strategy: WithdrawalStrategy,
  bucketConfig: BucketStrategyConfig | undefined,
  cashCushion: number,
  entnahme: number,
  returnRate: number,
): { bucketUsed: 'portfolio' | 'cash' | undefined, updatedCashCushion: number } {
  let bucketUsed: 'portfolio' | 'cash' | undefined
  let updatedCashCushion = cashCushion

  if (strategy === 'bucket_strategie' && bucketConfig) {
    if (returnRate >= 0) {
      bucketUsed = 'portfolio'
    }
    else {
      if (cashCushion >= entnahme) {
        bucketUsed = 'cash'
        updatedCashCushion -= entnahme
      }
      else {
        bucketUsed = 'portfolio'
      }
    }
  }

  return { bucketUsed, updatedCashCushion }
}

/**
 * Helper function: Calculate monthly withdrawal amounts and effective withdrawal
 */
/**
 * Calculate adjusted monthly amount with inflation
 */
function calculateAdjustedMonthlyAmount(
  monthlyConfig: MonthlyWithdrawalConfig,
  inflationConfig: InflationConfig | undefined,
  year: number | undefined,
  startYear: number | undefined,
): number {
  if (!inflationConfig?.inflationRate || year === undefined || startYear === undefined) {
    return monthlyConfig.monthlyAmount
  }
  const yearsPassed = year - startYear
  return monthlyConfig.monthlyAmount * Math.pow(1 + inflationConfig.inflationRate, yearsPassed)
}

/**
 * Calculate monthly withdrawal amount
 */
function getMonthlyAmount(
  strategy: WithdrawalStrategy,
  withdrawalFrequency: WithdrawalFrequency,
  entnahme: number,
  monthlyConfig: MonthlyWithdrawalConfig | undefined,
  inflationConfig: InflationConfig | undefined,
  year: number | undefined,
  startYear: number | undefined,
): number | undefined {
  if (strategy === 'monatlich_fest' && monthlyConfig) {
    return calculateAdjustedMonthlyAmount(monthlyConfig, inflationConfig, year, startYear)
  }
  if (withdrawalFrequency === 'monthly') {
    return entnahme / 12
  }
  return undefined
}

/**
 * Calculate effective withdrawal for monthly frequency
 */
function calculateMonthlyEffectiveWithdrawal(entnahme: number, returnRate: number): number {
  const monthlyReturn = Math.pow(1 + returnRate, 1 / 12) - 1
  let monthlyPresentValue = 0
  for (let month = 1; month <= 12; month++) {
    monthlyPresentValue += (entnahme / 12) / Math.pow(1 + monthlyReturn, month - 1)
  }
  return monthlyPresentValue
}

function calculateMonthlyWithdrawal(
  strategy: WithdrawalStrategy,
  withdrawalFrequency: WithdrawalFrequency,
  entnahme: number,
  returnRate: number,
  monthlyConfig?: MonthlyWithdrawalConfig,
  inflationConfig?: InflationConfig,
  year?: number,
  startYear?: number,
): { effectiveWithdrawal: number, monthlyAmount: number | undefined } {
  const monthlyAmount = getMonthlyAmount(
    strategy,
    withdrawalFrequency,
    entnahme,
    monthlyConfig,
    inflationConfig,
    year,
    startYear,
  )

  const effectiveWithdrawal = withdrawalFrequency === 'monthly'
    ? calculateMonthlyEffectiveWithdrawal(entnahme, returnRate)
    : entnahme

  return { effectiveWithdrawal, monthlyAmount }
}

/**
 * Helper function: Process withdrawal from portfolio layers
 */
function processLayerWithdrawal(
  mutableLayers: MutableLayer[],
  effectiveWithdrawal: number,
  strategy: WithdrawalStrategy,
  bucketUsed: 'portfolio' | 'cash' | undefined,
): number {
  let amountToWithdraw = effectiveWithdrawal
  let totalRealizedGain = 0

  // For bucket strategy, only process portfolio withdrawal if using portfolio bucket
  if (strategy === 'bucket_strategie' && bucketUsed === 'cash') {
    return 0
  }

  for (const layer of mutableLayers) {
    if (amountToWithdraw <= 0 || layer.currentValue <= 0) continue

    const amountToSellFromLayer = Math.min(amountToWithdraw, layer.currentValue)
    const proportionSold = amountToSellFromLayer / layer.currentValue
    const costBasisOfSoldPart = layer.costBasis * proportionSold
    const accumulatedVorabpauschaleOfSoldPart = layer.accumulatedVorabpauschale * proportionSold

    // Calculate gain using FIFO principle - only subtract cost basis
    const gain = amountToSellFromLayer - costBasisOfSoldPart
    totalRealizedGain += gain

    // Update layer values
    layer.currentValue -= amountToSellFromLayer
    layer.costBasis -= costBasisOfSoldPart
    layer.accumulatedVorabpauschale -= accumulatedVorabpauschaleOfSoldPart
    amountToWithdraw -= amountToSellFromLayer
  }

  return totalRealizedGain
}

/**
 * Helper function: Process bucket strategy cash cushion refill
 */
function processCashCushionRefill(
  strategy: WithdrawalStrategy,
  bucketConfig: BucketStrategyConfig | undefined,
  returnRate: number,
  capitalAtStartOfYear: number,
  capitalAtEndOfYear: number,
  bucketUsed: 'portfolio' | 'cash' | undefined,
  entnahme: number,
  cashCushion: number,
  mutableLayers: MutableLayer[],
): { refillAmount: number, updatedCashCushion: number } {
  let refillAmount = 0
  let updatedCashCushion = cashCushion

  if (strategy === 'bucket_strategie' && bucketConfig && returnRate > 0) {
    const capitalGain = capitalAtEndOfYear - (capitalAtStartOfYear - (bucketUsed === 'portfolio' ? entnahme : 0))

    if (capitalGain > bucketConfig.refillThreshold) {
      const excessGain = capitalGain - bucketConfig.refillThreshold
      refillAmount = excessGain * bucketConfig.refillPercentage

      if (refillAmount > 0 && capitalAtEndOfYear > refillAmount) {
        // Proportionally reduce each layer's value
        const totalPortfolioValue = capitalAtEndOfYear
        mutableLayers.forEach((layer) => {
          if (layer.currentValue > 0 && totalPortfolioValue > 0) {
            const layerProportion = layer.currentValue / totalPortfolioValue
            const layerReduction = refillAmount * layerProportion
            layer.currentValue -= layerReduction
          }
        })
        updatedCashCushion += refillAmount
      }
    }
  }

  return { refillAmount, updatedCashCushion }
}

/**
 * Helper function: Apply inflation adjustment to withdrawal
 */
function applyInflationAdjustment(
  baseWithdrawalAmount: number,
  year: number,
  startYear: number,
  inflationConfig: InflationConfig | undefined,
): { adjustedWithdrawal: number, inflationAnpassung: number } {
  if (!inflationConfig?.inflationRate) {
    return { adjustedWithdrawal: baseWithdrawalAmount, inflationAnpassung: 0 }
  }

  const yearsPassed = year - startYear
  const inflationAnpassung = baseWithdrawalAmount * (Math.pow(1 + inflationConfig.inflationRate, yearsPassed) - 1)
  return { adjustedWithdrawal: baseWithdrawalAmount + inflationAnpassung, inflationAnpassung }
}

/**
 * Helper function: Apply tax optimization to withdrawal
 */
function applyTaxOptimization(params: {
  strategy: WithdrawalStrategy
  capitalAtStartOfYear: number
  annualWithdrawal: number
  steueroptimierteEntnahmeConfig: SteueroptimierteEntnahmeConfig | undefined
  getFreibetragForYear: (year: number) => number
  year: number
  taxRate: number
  teilfreistellungsquote: number
}): { optimizedWithdrawal: number, steueroptimierungAnpassung: number } {
  const {
    strategy,
    capitalAtStartOfYear,
    annualWithdrawal,
    steueroptimierteEntnahmeConfig,
    getFreibetragForYear,
    year,
    taxRate,
    teilfreistellungsquote,
  } = params

  if (strategy !== 'steueroptimiert' || !steueroptimierteEntnahmeConfig) {
    return { optimizedWithdrawal: annualWithdrawal, steueroptimierungAnpassung: 0 }
  }

  const currentFreibetrag = getFreibetragForYear(year)
  const targetFreibetragUtilization = steueroptimierteEntnahmeConfig.freibetragUtilizationTarget || 0.85

  const taxEfficientWithdrawal = calculateTaxOptimizedWithdrawal(
    capitalAtStartOfYear,
    annualWithdrawal,
    currentFreibetrag,
    targetFreibetragUtilization,
    taxRate,
    teilfreistellungsquote,
    steueroptimierteEntnahmeConfig,
  )

  const steueroptimierungAnpassung = taxEfficientWithdrawal - annualWithdrawal
  return { optimizedWithdrawal: taxEfficientWithdrawal, steueroptimierungAnpassung }
}

/**
 * Helper function: Calculate adjusted withdrawal amount for the year
 */
function calculateAdjustedWithdrawal(params: {
  strategy: WithdrawalStrategy
  baseWithdrawalAmount: number
  capitalAtStartOfYear: number
  year: number
  startYear: number
  yearlyGrowthRates: Record<number, number>
  rmdConfig: RMDConfig | undefined
  inflationConfig: InflationConfig | undefined
  dynamicConfig: DynamicWithdrawalConfig | undefined
  bucketConfig: BucketStrategyConfig | undefined
  steueroptimierteEntnahmeConfig: SteueroptimierteEntnahmeConfig | undefined
  getFreibetragForYear: (year: number) => number
  taxRate: number
  teilfreistellungsquote: number
}): {
  annualWithdrawal: number
  inflationAnpassung: number
  dynamischeAnpassung: number
  vorjahresRendite: number | undefined
  steueroptimierungAnpassung: number
} {
  const {
    strategy,
    baseWithdrawalAmount,
    capitalAtStartOfYear,
    year,
    startYear,
    yearlyGrowthRates,
    rmdConfig,
    inflationConfig,
    dynamicConfig,
    bucketConfig,
    steueroptimierteEntnahmeConfig,
    getFreibetragForYear,
    taxRate,
    teilfreistellungsquote,
  } = params

  let annualWithdrawal = baseWithdrawalAmount

  // RMD strategy: recalculate withdrawal based on current portfolio value and age
  if (strategy === 'rmd' && rmdConfig) {
    const yearsSinceStart = year - startYear
    const currentAge = rmdConfig.startAge + yearsSinceStart
    annualWithdrawal = calculateRMDWithdrawal(
      capitalAtStartOfYear,
      currentAge,
      rmdConfig.lifeExpectancyTable,
      rmdConfig.customLifeExpectancy,
    )
  }

  const { adjustedWithdrawal: withdrawalAfterInflation, inflationAnpassung } = applyInflationAdjustment(
    baseWithdrawalAmount,
    year,
    startYear,
    inflationConfig,
  )
  annualWithdrawal = strategy === 'rmd' && rmdConfig ? annualWithdrawal : withdrawalAfterInflation

  // Dynamic adjustment based on previous year's return
  const { adjustment: dynamischeAnpassung, previousReturn: vorjahresRendite } = calculateDynamicAdjustment(
    strategy,
    annualWithdrawal,
    year,
    yearlyGrowthRates,
    dynamicConfig,
    bucketConfig,
  )
  annualWithdrawal += dynamischeAnpassung

  // Tax-optimized withdrawal strategy
  const { optimizedWithdrawal, steueroptimierungAnpassung } = applyTaxOptimization({
    strategy,
    capitalAtStartOfYear,
    annualWithdrawal,
    steueroptimierteEntnahmeConfig,
    getFreibetragForYear,
    year,
    taxRate,
    teilfreistellungsquote,
  })
  annualWithdrawal = optimizedWithdrawal

  return {
    annualWithdrawal,
    inflationAnpassung,
    dynamischeAnpassung,
    vorjahresRendite,
    steueroptimierungAnpassung,
  }
}

/**
 * Helper function: Build strategy-specific fields for result
 */
// Helper: Check if strategy needs dynamic fields
function needsDynamicFields(strategy: WithdrawalStrategy, bucketConfig?: BucketStrategyConfig): boolean {
  return strategy === 'dynamisch' || (strategy === 'bucket_strategie' && bucketConfig?.subStrategy === 'dynamisch')
}

function buildDynamicFields(
  hasDynamicFields: boolean,
  dynamischeAnpassung: number,
  vorjahresRendite: number | undefined,
) {
  if (!hasDynamicFields) return {}

  return {
    dynamischeAnpassung,
    vorjahresRendite,
  }
}

function buildBucketFields(
  strategy: WithdrawalStrategy,
  cashCushionAtStart: number,
  cashCushion: number,
  bucketUsed: 'portfolio' | 'cash' | undefined,
  refillAmount: number,
) {
  if (strategy !== 'bucket_strategie') return {}

  return {
    cashCushionStart: cashCushionAtStart,
    cashCushionEnd: cashCushion,
    bucketUsed,
    refillAmount: refillAmount > 0 ? refillAmount : undefined,
  }
}

function buildStrategySpecificFields(params: {
  strategy: WithdrawalStrategy
  dynamischeAnpassung: number
  vorjahresRendite: number | undefined
  bucketConfig: BucketStrategyConfig | undefined
  steueroptimierungAnpassung: number
  cashCushionAtStart: number
  cashCushion: number
  bucketUsed: 'portfolio' | 'cash' | undefined
  refillAmount: number
}): {
  dynamischeAnpassung?: number
  vorjahresRendite?: number
  steueroptimierungAnpassung?: number
  cashCushionStart?: number
  cashCushionEnd?: number
  bucketUsed?: 'portfolio' | 'cash'
  refillAmount?: number
} {
  const {
    strategy,
    dynamischeAnpassung,
    vorjahresRendite,
    bucketConfig,
    steueroptimierungAnpassung,
    cashCushionAtStart,
    cashCushion,
    bucketUsed,
    refillAmount,
  } = params

  const hasDynamicFields = needsDynamicFields(strategy, bucketConfig)

  return {
    ...buildDynamicFields(hasDynamicFields, dynamischeAnpassung, vorjahresRendite),
    steueroptimierungAnpassung: strategy === 'steueroptimiert' ? steueroptimierungAnpassung : undefined,
    ...buildBucketFields(strategy, cashCushionAtStart, cashCushion, bucketUsed, refillAmount),
  }
}

/**
 * Helper function: Build statutory pension field if applicable
 */
function buildStatutoryPensionField(
  year: number,
  statutoryPensionData: StatutoryPensionResult,
) {
  if (!statutoryPensionData[year] || statutoryPensionData[year].grossAnnualAmount <= 0) {
    return undefined
  }

  return {
    grossAnnualAmount: statutoryPensionData[year].grossAnnualAmount,
    netAnnualAmount: statutoryPensionData[year].netAnnualAmount,
    incomeTax: statutoryPensionData[year].incomeTax,
    taxableAmount: statutoryPensionData[year].taxableAmount,
  }
}

/**
 * Helper function: Build other income field if applicable
 */
function buildOtherIncomeField(
  year: number,
  otherIncomeData: OtherIncomeResult,
) {
  if (!otherIncomeData[year] || otherIncomeData[year].totalNetAnnualAmount <= 0) {
    return undefined
  }

  return {
    totalNetAmount: otherIncomeData[year].totalNetAnnualAmount,
    totalTaxAmount: otherIncomeData[year].totalTaxAmount,
    sourceCount: otherIncomeData[year].sources.length,
  }
}

/**
 * Helper function: Build health care insurance field if applicable
 */
function buildHealthCareInsuranceField(
  healthCareInsuranceData: HealthCareInsuranceYearResult | undefined,
  healthCareInsuranceConfig: HealthCareInsuranceConfig | undefined,
  coupleHealthCareInsuranceData: CoupleHealthInsuranceYearResult | undefined,
) {
  if (!healthCareInsuranceData || !healthCareInsuranceConfig?.enabled) {
    return undefined
  }

  return {
    healthInsuranceAnnual: healthCareInsuranceData.healthInsuranceAnnual,
    careInsuranceAnnual: healthCareInsuranceData.careInsuranceAnnual,
    totalAnnual: healthCareInsuranceData.totalAnnual,
    healthInsuranceMonthly: healthCareInsuranceData.healthInsuranceMonthly,
    careInsuranceMonthly: healthCareInsuranceData.careInsuranceMonthly,
    totalMonthly: healthCareInsuranceData.totalMonthly,
    usedFixedAmounts: healthCareInsuranceData.usedFixedAmounts || false,
    isRetirementPhase: healthCareInsuranceData.isRetirementPhase,
    effectiveHealthInsuranceRate: healthCareInsuranceData.effectiveHealthInsuranceRate || 0,
    effectiveCareInsuranceRate: healthCareInsuranceData.effectiveCareInsuranceRate || 0,
    coupleDetails: coupleHealthCareInsuranceData,
  }
}

/**
 * Income source fields result type
 */
interface IncomeSourceFields {
  statutoryPension?: {
    grossAnnualAmount: number
    netAnnualAmount: number
    incomeTax: number
    taxableAmount: number
  }
  otherIncome?: {
    totalNetAmount: number
    totalTaxAmount: number
    sourceCount: number
  }
  healthCareInsurance?: {
    healthInsuranceAnnual: number
    careInsuranceAnnual: number
    totalAnnual: number
    healthInsuranceMonthly: number
    careInsuranceMonthly: number
    totalMonthly: number
    usedFixedAmounts: boolean
    isRetirementPhase: boolean
    effectiveHealthInsuranceRate: number
    effectiveCareInsuranceRate: number
    coupleDetails?: CoupleHealthInsuranceYearResult
  }
}

/**
 * Helper function: Build income source fields for result
 */
function buildIncomeSourceFields(params: {
  year: number
  statutoryPensionData: StatutoryPensionResult
  otherIncomeData: OtherIncomeResult
  healthCareInsuranceData: HealthCareInsuranceYearResult | undefined
  healthCareInsuranceConfig: HealthCareInsuranceConfig | undefined
  coupleHealthCareInsuranceData: CoupleHealthInsuranceYearResult | undefined
}): IncomeSourceFields {
  const {
    year,
    statutoryPensionData,
    otherIncomeData,
    healthCareInsuranceData,
    healthCareInsuranceConfig,
    coupleHealthCareInsuranceData,
  } = params

  return {
    statutoryPension: buildStatutoryPensionField(year, statutoryPensionData),
    otherIncome: buildOtherIncomeField(year, otherIncomeData),
    healthCareInsurance: buildHealthCareInsuranceField(
      healthCareInsuranceData,
      healthCareInsuranceConfig,
      coupleHealthCareInsuranceData,
    ),
  }
}

/**
 * Process all years of withdrawal using the yearly processor
 */
function processAllWithdrawalYears(
  startYear: number,
  endYear: number,
  mutableLayers: MutableLayer[],
  yearlyGrowthRates: Record<number, number>,
  baseWithdrawalAmount: number,
  initialCashCushion: number,
  strategy: WithdrawalStrategy,
  withdrawalFrequency: WithdrawalFrequency,
  monthlyConfig: MonthlyWithdrawalConfig | undefined,
  inflationConfig: InflationConfig | undefined,
  dynamicConfig: DynamicWithdrawalConfig | undefined,
  bucketConfig: BucketStrategyConfig | undefined,
  rmdConfig: RMDConfig | undefined,
  steueroptimierteEntnahmeConfig: SteueroptimierteEntnahmeConfig | undefined,
  basiszinsConfiguration: BasiszinsConfiguration | undefined,
  healthCareInsuranceConfig: HealthCareInsuranceConfig | undefined,
  taxRate: number,
  teilfreistellungsquote: number,
  steuerReduzierenEndkapital: boolean,
  enableGrundfreibetrag: boolean | undefined,
  guenstigerPruefungAktiv: boolean,
  incomeTaxRate: number | undefined,
  kirchensteuerAktiv: boolean,
  kirchensteuersatz: number,
  freibetragPerYear: { [year: number]: number } | undefined,
  statutoryPensionData: StatutoryPensionResult,
  otherIncomeData: OtherIncomeResult,
  birthYear: number | undefined,
  getFreibetragForYear: (year: number) => number,
  getGrundfreibetragForYear: (year: number) => number,
): WithdrawalResult {
  const result: WithdrawalResult = {}
  let cashCushion = initialCashCushion

  for (let year = startYear; year <= endYear; year++) {
    const { yearResult, updatedCashCushion, shouldContinue } = processYearlyWithdrawal({
      year,
      startYear,
      mutableLayers,
      yearlyGrowthRates,
      baseWithdrawalAmount,
      cashCushion,
      strategy,
      withdrawalFrequency,
      monthlyConfig,
      inflationConfig,
      dynamicConfig,
      bucketConfig,
      rmdConfig,
      steueroptimierteEntnahmeConfig,
      basiszinsConfiguration,
      healthCareInsuranceConfig,
      taxRate,
      teilfreistellungsquote,
      steuerReduzierenEndkapital,
      enableGrundfreibetrag,
      guenstigerPruefungAktiv,
      incomeTaxRate,
      kirchensteuerAktiv,
      kirchensteuersatz,
      freibetragPerYear,
      statutoryPensionData,
      otherIncomeData,
      birthYear,
      getFreibetragForYear,
      getGrundfreibetragForYear,
    })

    if (!shouldContinue) break

    cashCushion = updatedCashCushion
    if (yearResult) {
      result[year] = yearResult
    }
  }

  return result
}

/**
 * Process a single year of withdrawal calculation
 * This is the main orchestrator for yearly withdrawal logic
 */
function processYearlyWithdrawal(params: {
  year: number
  startYear: number
  mutableLayers: MutableLayer[]
  yearlyGrowthRates: Record<number, number>
  baseWithdrawalAmount: number
  cashCushion: number
  strategy: WithdrawalStrategy
  withdrawalFrequency: WithdrawalFrequency
  monthlyConfig?: MonthlyWithdrawalConfig
  inflationConfig?: InflationConfig
  dynamicConfig?: DynamicWithdrawalConfig
  bucketConfig?: BucketStrategyConfig
  rmdConfig?: RMDConfig
  steueroptimierteEntnahmeConfig?: SteueroptimierteEntnahmeConfig
  basiszinsConfiguration?: BasiszinsConfiguration
  healthCareInsuranceConfig?: HealthCareInsuranceConfig
  taxRate: number
  teilfreistellungsquote: number
  steuerReduzierenEndkapital: boolean
  enableGrundfreibetrag?: boolean
  guenstigerPruefungAktiv: boolean
  incomeTaxRate?: number
  kirchensteuerAktiv: boolean
  kirchensteuersatz: number
  freibetragPerYear?: { [year: number]: number }
  statutoryPensionData: StatutoryPensionResult
  otherIncomeData: OtherIncomeResult
  birthYear?: number
  getFreibetragForYear: (year: number) => number
  getGrundfreibetragForYear: (year: number) => number
}): {
  yearResult: WithdrawalResultElement | null
  updatedCashCushion: number
  shouldContinue: boolean
} {
  const {
    year,
    startYear,
    mutableLayers,
    yearlyGrowthRates,
    baseWithdrawalAmount,
    cashCushion,
    strategy,
    withdrawalFrequency,
    monthlyConfig,
    inflationConfig,
    dynamicConfig,
    bucketConfig,
    rmdConfig,
    steueroptimierteEntnahmeConfig,
    basiszinsConfiguration,
    healthCareInsuranceConfig,
    taxRate,
    teilfreistellungsquote,
    steuerReduzierenEndkapital,
    enableGrundfreibetrag,
    guenstigerPruefungAktiv,
    incomeTaxRate,
    kirchensteuerAktiv,
    kirchensteuersatz,
    freibetragPerYear,
    statutoryPensionData,
    otherIncomeData,
    birthYear,
    getFreibetragForYear,
    getGrundfreibetragForYear,
  } = params

  const capitalAtStartOfYear = mutableLayers.reduce((sum: number, l: MutableLayer) => sum + l.currentValue, 0)
  if (capitalAtStartOfYear <= 0) {
    return { yearResult: null, updatedCashCushion: cashCushion, shouldContinue: false }
  }

  const {
    annualWithdrawal,
    inflationAnpassung,
    dynamischeAnpassung,
    vorjahresRendite,
    steueroptimierungAnpassung,
  } = calculateAdjustedWithdrawal({
    strategy,
    baseWithdrawalAmount,
    capitalAtStartOfYear,
    year,
    startYear,
    yearlyGrowthRates,
    rmdConfig,
    inflationConfig,
    dynamicConfig,
    bucketConfig,
    steueroptimierteEntnahmeConfig,
    getFreibetragForYear,
    taxRate,
    teilfreistellungsquote,
  })

  const entnahme = Math.min(annualWithdrawal, capitalAtStartOfYear)

  const { healthCareInsuranceData, coupleHealthCareInsuranceData } = calculateYearHealthCareInsurance({
    healthCareInsuranceConfig,
    year,
    entnahme,
    statutoryPensionData,
    birthYear,
  })

  const returnRate = yearlyGrowthRates[year] || 0

  const cashCushionAtStart = cashCushion
  const { bucketUsed, updatedCashCushion } = processBucketStrategyWithdrawal(
    strategy,
    bucketConfig,
    cashCushion,
    entnahme,
    returnRate,
  )
  let currentCashCushion = updatedCashCushion
  let refillAmount = 0

  const { effectiveWithdrawal, monthlyAmount: monthlyWithdrawalAmount } = calculateMonthlyWithdrawal(
    strategy,
    withdrawalFrequency,
    entnahme,
    returnRate,
    monthlyConfig,
    inflationConfig,
    year,
    startYear,
  )

  const {
    totalPotentialVorabTax,
    vorabCalculations,
    yearlyFreibetrag,
    basiszins,
  } = calculateVorabpauschaleForLayers({
    mutableLayers,
    returnRate,
    year,
    basiszinsConfiguration,
    taxRate,
    teilfreistellungsquote,
    freibetragPerYear,
  })

  const totalRealizedGainThisYear = processLayerWithdrawal(
    mutableLayers,
    effectiveWithdrawal,
    strategy,
    bucketUsed,
  )

  const {
    taxOnRealizedGains,
    freibetragUsedOnGains,
    remainingFreibetrag,
    guenstigerPruefungResult: guenstigerPruefungResultRealizedGains,
  } = calculateRealizedGainsTax(
    totalRealizedGainThisYear,
    yearlyFreibetrag,
    teilfreistellungsquote,
    taxRate,
    guenstigerPruefungAktiv,
    incomeTaxRate,
    kirchensteuerAktiv,
    kirchensteuersatz,
  )

  const { taxOnVorabpauschale, freibetragUsedOnVorab } = applyPortfolioGrowthAndVorabTax(
    vorabCalculations,
    totalPotentialVorabTax,
    remainingFreibetrag,
    returnRate,
    steuerReduzierenEndkapital,
  )

  const { einkommensteuer, genutzterGrundfreibetrag, taxableIncome } = calculateYearIncomeTax({
    enableGrundfreibetrag,
    entnahme,
    year,
    getGrundfreibetragForYear,
    statutoryPensionData,
    otherIncomeData,
    healthCareInsuranceData,
    healthCareInsuranceConfig,
    incomeTaxRate,
    kirchensteuerAktiv,
    kirchensteuersatz,
  })

  const capitalAtEndOfYear = mutableLayers.reduce((sum: number, l: MutableLayer) => sum + l.currentValue, 0)

  const refillResult = processCashCushionRefill(
    strategy,
    bucketConfig,
    returnRate,
    capitalAtStartOfYear,
    capitalAtEndOfYear,
    bucketUsed,
    entnahme,
    currentCashCushion,
    mutableLayers,
  )
  refillAmount = refillResult.refillAmount
  currentCashCushion = refillResult.updatedCashCushion

  const finalCapitalAtEndOfYear = mutableLayers.reduce((sum: number, l: MutableLayer) => sum + l.currentValue, 0)

  const totalTaxForYear = taxOnRealizedGains + taxOnVorabpauschale + einkommensteuer

  const totalVorabpauschale = vorabCalculations.reduce((sum, calc) => sum + calc.vorabpauschaleBetrag, 0)

  const vorabpauschaleDetails = createVorabpauschaleDetails(
    totalVorabpauschale,
    vorabCalculations,
    basiszins,
    totalPotentialVorabTax,
    returnRate,
    capitalAtStartOfYear,
  )

  const yearResult = buildYearlyResult({
    year,
    capitalAtStartOfYear,
    entnahme,
    finalCapitalAtEndOfYear,
    totalTaxForYear,
    freibetragUsedOnGains,
    freibetragUsedOnVorab,
    monthlyWithdrawalAmount,
    inflationConfig,
    inflationAnpassung,
    enableGrundfreibetrag,
    einkommensteuer,
    genutzterGrundfreibetrag,
    taxableIncome,
    guenstigerPruefungResultRealizedGains,
    strategy,
    dynamischeAnpassung,
    vorjahresRendite,
    bucketConfig,
    steueroptimierungAnpassung,
    cashCushionAtStart,
    cashCushion: currentCashCushion,
    bucketUsed,
    refillAmount,
    totalVorabpauschale,
    vorabpauschaleDetails,
    statutoryPensionData,
    otherIncomeData,
    healthCareInsuranceData,
    healthCareInsuranceConfig,
    coupleHealthCareInsuranceData,
  })

  return { yearResult, updatedCashCushion: currentCashCushion, shouldContinue: true }
}

/**
 * Helper function: Build yearly result object
 */
function buildYearlyResult(params: {
  year: number
  capitalAtStartOfYear: number
  entnahme: number
  finalCapitalAtEndOfYear: number
  totalTaxForYear: number
  freibetragUsedOnGains: number
  freibetragUsedOnVorab: number
  monthlyWithdrawalAmount: number | undefined
  inflationConfig: InflationConfig | undefined
  inflationAnpassung: number
  enableGrundfreibetrag: boolean | undefined
  einkommensteuer: number
  genutzterGrundfreibetrag: number
  taxableIncome: number
  guenstigerPruefungResultRealizedGains: {
    abgeltungssteuerAmount: number
    personalTaxAmount: number
    usedTaxRate: number
    isFavorable: 'abgeltungssteuer' | 'personal' | 'equal'
    availableGrundfreibetrag: number
    usedGrundfreibetrag: number
    explanation: string
  } | undefined | null
  strategy: WithdrawalStrategy
  dynamischeAnpassung: number
  vorjahresRendite: number | undefined
  bucketConfig: BucketStrategyConfig | undefined
  steueroptimierungAnpassung: number
  cashCushionAtStart: number
  cashCushion: number
  bucketUsed: 'portfolio' | 'cash' | undefined
  refillAmount: number
  totalVorabpauschale: number
  vorabpauschaleDetails: {
    basiszins: number
    basisertrag: number
    vorabpauschaleAmount: number
    steuerVorFreibetrag: number
    jahresgewinn: number
    anteilImJahr: number
    startkapital: number
  } | undefined
  statutoryPensionData: StatutoryPensionResult
  otherIncomeData: OtherIncomeResult
  healthCareInsuranceData: HealthCareInsuranceYearResult | undefined
  healthCareInsuranceConfig: HealthCareInsuranceConfig | undefined
  coupleHealthCareInsuranceData: CoupleHealthInsuranceYearResult | undefined
}): WithdrawalResultElement {
  const {
    year,
    capitalAtStartOfYear,
    entnahme,
    finalCapitalAtEndOfYear,
    totalTaxForYear,
    freibetragUsedOnGains,
    freibetragUsedOnVorab,
    monthlyWithdrawalAmount,
    inflationConfig,
    inflationAnpassung,
    enableGrundfreibetrag,
    einkommensteuer,
    genutzterGrundfreibetrag,
    taxableIncome,
    guenstigerPruefungResultRealizedGains,
    strategy,
    dynamischeAnpassung,
    vorjahresRendite,
    bucketConfig,
    steueroptimierungAnpassung,
    cashCushionAtStart,
    cashCushion,
    bucketUsed,
    refillAmount,
    totalVorabpauschale,
    vorabpauschaleDetails,
    statutoryPensionData,
    otherIncomeData,
    healthCareInsuranceData,
    healthCareInsuranceConfig,
    coupleHealthCareInsuranceData,
  } = params

  const strategyFields = buildStrategySpecificFields({
    strategy,
    dynamischeAnpassung,
    vorjahresRendite,
    bucketConfig,
    steueroptimierungAnpassung,
    cashCushionAtStart,
    cashCushion,
    bucketUsed,
    refillAmount,
  })

  const incomeSourceFields = buildIncomeSourceFields({
    year,
    statutoryPensionData,
    otherIncomeData,
    healthCareInsuranceData,
    healthCareInsuranceConfig,
    coupleHealthCareInsuranceData,
  })

  return {
    startkapital: capitalAtStartOfYear,
    entnahme,
    endkapital: finalCapitalAtEndOfYear,
    bezahlteSteuer: totalTaxForYear,
    genutzterFreibetrag: freibetragUsedOnGains + freibetragUsedOnVorab,
    zinsen: finalCapitalAtEndOfYear - (capitalAtStartOfYear - entnahme),
    monatlicheEntnahme: monthlyWithdrawalAmount,
    inflationAnpassung: inflationConfig?.inflationRate ? inflationAnpassung : undefined,
    einkommensteuer: enableGrundfreibetrag ? einkommensteuer : undefined,
    genutzterGrundfreibetrag: enableGrundfreibetrag ? genutzterGrundfreibetrag : undefined,
    taxableIncome: enableGrundfreibetrag ? taxableIncome : undefined,
    guenstigerPruefungResultRealizedGains: guenstigerPruefungResultRealizedGains ? {
      abgeltungssteuerAmount: guenstigerPruefungResultRealizedGains.abgeltungssteuerAmount,
      personalTaxAmount: guenstigerPruefungResultRealizedGains.personalTaxAmount,
      usedTaxRate: guenstigerPruefungResultRealizedGains.usedTaxRate,
      isFavorable: guenstigerPruefungResultRealizedGains.isFavorable,
      explanation: guenstigerPruefungResultRealizedGains.explanation,
    } : undefined,
    vorabpauschale: totalVorabpauschale > 0 ? totalVorabpauschale : undefined,
    vorabpauschaleDetails: vorabpauschaleDetails,
    ...strategyFields,
    ...incomeSourceFields,
  }
}

/**
 * Helper function: Apply portfolio growth and Vorabpauschale tax
 */
function applyPortfolioGrowthAndVorabTax(
  vorabCalculations: Array<{
    layer: MutableLayer
    vorabpauschaleBetrag: number
    potentialTax: number
    valueBeforeWithdrawal: number
  }>,
  totalPotentialVorabTax: number,
  remainingFreibetrag: number,
  returnRate: number,
  steuerReduzierenEndkapital: boolean,
): {
  taxOnVorabpauschale: number
  freibetragUsedOnVorab: number
} {
  const taxOnVorabpauschale = Math.max(0, totalPotentialVorabTax - remainingFreibetrag)
  const freibetragUsedOnVorab = Math.min(totalPotentialVorabTax, remainingFreibetrag)

  vorabCalculations.forEach((calc) => {
    const taxForLayer = totalPotentialVorabTax > 0
      ? (calc.potentialTax / totalPotentialVorabTax) * taxOnVorabpauschale
      : 0
    // Apply growth to remaining value after withdrawal, then subtract vorab tax
    const valueAfterWithdrawal = calc.layer.currentValue
    const valueAfterGrowth = valueAfterWithdrawal * (1 + returnRate)
    calc.layer.currentValue = steuerReduzierenEndkapital
      ? valueAfterGrowth - taxForLayer
      : valueAfterGrowth
    calc.layer.accumulatedVorabpauschale += calc.vorabpauschaleBetrag
  })

  return { taxOnVorabpauschale, freibetragUsedOnVorab }
}

/**
 * Helper function: Calculate total taxable income from all sources
 */
function calculateTotalTaxableIncome(params: {
  entnahme: number
  year: number
  statutoryPensionData: StatutoryPensionResult
  otherIncomeData: OtherIncomeResult
  healthCareInsuranceData: HealthCareInsuranceYearResult | undefined
  healthCareInsuranceConfig: HealthCareInsuranceConfig | undefined
}): number {
  const {
    entnahme,
    year,
    statutoryPensionData,
    otherIncomeData,
    healthCareInsuranceData,
    healthCareInsuranceConfig,
  } = params

  let totalTaxableIncome = entnahme

  // Add taxable amount from statutory pension
  if (statutoryPensionData[year]?.taxableAmount) {
    totalTaxableIncome += statutoryPensionData[year].taxableAmount
  }

  // Add taxable amount from other income sources
  if (otherIncomeData[year]?.sources) {
    const otherIncomeGrossTotal = otherIncomeData[year].sources.reduce(
      (sum: number, source: OtherIncomeYearResult) => sum + (source.grossAnnualAmount || 0),
      0,
    )
    totalTaxableIncome += otherIncomeGrossTotal
  }

  // Deduct health care insurance contributions (tax-deductible in Germany)
  if (healthCareInsuranceData && healthCareInsuranceConfig?.enabled) {
    totalTaxableIncome -= healthCareInsuranceData.totalAnnual
  }

  return totalTaxableIncome
}

/**
 * Helper function: Calculate income tax with Grundfreibetrag
 */
/**
 * Parameters for calculating year income tax
 */
interface YearIncomeTaxParams {
  enableGrundfreibetrag: boolean | undefined
  entnahme: number
  year: number
  getGrundfreibetragForYear: (year: number) => number
  statutoryPensionData: StatutoryPensionResult
  otherIncomeData: OtherIncomeResult
  healthCareInsuranceData: HealthCareInsuranceYearResult | undefined
  healthCareInsuranceConfig: HealthCareInsuranceConfig | undefined
  incomeTaxRate: number | undefined
  kirchensteuerAktiv: boolean
  kirchensteuersatz: number
}

/**
 * Year income tax result
 */
interface YearIncomeTaxResult {
  einkommensteuer: number
  genutzterGrundfreibetrag: number
  taxableIncome: number
}

function calculateYearIncomeTax(params: YearIncomeTaxParams): YearIncomeTaxResult {
  const {
    enableGrundfreibetrag,
    entnahme,
    year,
    getGrundfreibetragForYear,
    statutoryPensionData,
    otherIncomeData,
    healthCareInsuranceData,
    healthCareInsuranceConfig,
    incomeTaxRate,
    kirchensteuerAktiv,
    kirchensteuersatz,
  } = params

  let einkommensteuer = 0
  let genutzterGrundfreibetrag = 0
  let taxableIncome = 0

  if (enableGrundfreibetrag) {
    const yearlyGrundfreibetrag = getGrundfreibetragForYear(year)

    const totalTaxableIncome = calculateTotalTaxableIncome({
      entnahme,
      year,
      statutoryPensionData,
      otherIncomeData,
      healthCareInsuranceData,
      healthCareInsuranceConfig,
    })

    einkommensteuer = calculateIncomeTax(
      totalTaxableIncome,
      yearlyGrundfreibetrag,
      (incomeTaxRate || 0) / 100,
      kirchensteuerAktiv,
      kirchensteuersatz,
    )
    genutzterGrundfreibetrag = Math.min(totalTaxableIncome, yearlyGrundfreibetrag)
    taxableIncome = Math.max(0, totalTaxableIncome - yearlyGrundfreibetrag)
  }

  return { einkommensteuer, genutzterGrundfreibetrag, taxableIncome }
}

/**
 * Health care insurance calculation result
 */
interface YearHealthCareInsuranceResult {
  healthCareInsuranceData: HealthCareInsuranceYearResult | undefined
  coupleHealthCareInsuranceData: CoupleHealthInsuranceYearResult | undefined
}

/**
 * Build health care insurance data for couple mode
 */
function buildCoupleHealthCareData(
  coupleData: CoupleHealthInsuranceYearResult,
  config: HealthCareInsuranceConfig,
  year: number,
): HealthCareInsuranceYearResult {
  return {
    healthInsuranceAnnual: coupleData.totalAnnual,
    careInsuranceAnnual: 0,
    totalAnnual: coupleData.totalAnnual,
    healthInsuranceMonthly: coupleData.totalMonthly,
    careInsuranceMonthly: 0,
    totalMonthly: coupleData.totalMonthly,
    insuranceType: config.insuranceType,
    isRetirementPhase: year >= config.retirementStartYear,
    appliedAdditionalCareInsurance: false,
    usedFixedAmounts: false,
  }
}

/**
 * Helper function: Calculate health care insurance for a year
 */
function calculateYearHealthCareInsurance(params: {
  healthCareInsuranceConfig: HealthCareInsuranceConfig | undefined
  year: number
  entnahme: number
  statutoryPensionData: StatutoryPensionResult
  birthYear: number | undefined
}): YearHealthCareInsuranceResult {
  const {
    healthCareInsuranceConfig,
    year,
    entnahme,
    statutoryPensionData,
    birthYear,
  } = params
  let healthCareInsuranceData
  let coupleHealthCareInsuranceData: CoupleHealthInsuranceYearResult | undefined

  if (healthCareInsuranceConfig?.enabled) {
    const pensionAmount = statutoryPensionData[year]?.grossAnnualAmount || 0
    const currentAge = birthYear ? year - birthYear : 30

    if (healthCareInsuranceConfig.planningMode === 'couple') {
      // Use couple health insurance calculation
      coupleHealthCareInsuranceData = calculateCoupleHealthInsuranceForYear(
        healthCareInsuranceConfig,
        year,
        entnahme,
        pensionAmount,
      )
      // For compatibility with existing logic, use the total from couple calculation
      healthCareInsuranceData = buildCoupleHealthCareData(
        coupleHealthCareInsuranceData,
        healthCareInsuranceConfig,
        year,
      )
    }
    else {
      // Use individual health insurance calculation
      healthCareInsuranceData = calculateHealthCareInsuranceForYear(
        healthCareInsuranceConfig,
        year,
        entnahme,
        pensionAmount,
        currentAge,
      )
    }
  }

  return { healthCareInsuranceData, coupleHealthCareInsuranceData }
}

/**
 * Parameters for calculating Vorabpauschale for layers
 */
type VorabpauschaleLayersParams = {
  mutableLayers: MutableLayer[]
  returnRate: number
  year: number
  basiszinsConfiguration: BasiszinsConfiguration | undefined
  taxRate: number
  teilfreistellungsquote: number
  freibetragPerYear: Record<number, number> | undefined
}

/**
 * Vorabpauschale calculation result for layers
 */
interface VorabpauschaleLayersResult {
  totalPotentialVorabTax: number
  vorabCalculations: Array<{
    layer: MutableLayer
    vorabpauschaleBetrag: number
    potentialTax: number
    valueBeforeWithdrawal: number
  }>
  yearlyFreibetrag: number
  basiszins: number
}

/**
 * Helper function: Calculate Vorabpauschale for all layers before withdrawal
 */
function calculateVorabpauschaleForLayers(params: VorabpauschaleLayersParams): VorabpauschaleLayersResult {
  const {
    mutableLayers,
    returnRate,
    year,
    basiszinsConfiguration,
    taxRate,
    teilfreistellungsquote,
    freibetragPerYear,
  } = params

  const getFreibetrag = (yr: number): number => {
    if (freibetragPerYear && freibetragPerYear[yr] !== undefined) return freibetragPerYear[yr]
    return freibetrag[2023] || 2000
  }

  const yearlyFreibetrag = getFreibetrag(year)
  const basiszins = getBasiszinsForYear(year, basiszinsConfiguration)
  let totalPotentialVorabTax = 0
  const vorabCalculations: Array<{
    layer: MutableLayer
    vorabpauschaleBetrag: number
    potentialTax: number
    valueBeforeWithdrawal: number
  }> = []

  mutableLayers.forEach((layer: MutableLayer) => {
    if (layer.currentValue > 0) {
      const valueBeforeWithdrawal = layer.currentValue
      const valueAfterGrowthBeforeWithdrawal = valueBeforeWithdrawal * (1 + returnRate)
      const vorabpauschaleBetrag = calculateVorabpauschale(
        valueBeforeWithdrawal,
        valueAfterGrowthBeforeWithdrawal,
        basiszins,
      )
      const potentialTax = calculateSteuerOnVorabpauschale(
        vorabpauschaleBetrag,
        taxRate,
        teilfreistellungsquote,
      )
      totalPotentialVorabTax += potentialTax
      vorabCalculations.push({ layer, vorabpauschaleBetrag, potentialTax, valueBeforeWithdrawal })
    }
  })

  return { totalPotentialVorabTax, vorabCalculations, yearlyFreibetrag, basiszins }
}

/**
 * Result of realized gains tax calculation
 */
interface RealizedGainsTaxResult {
  taxOnRealizedGains: number
  freibetragUsedOnGains: number
  remainingFreibetrag: number
  guenstigerPruefungResult: {
    abgeltungssteuerAmount: number
    personalTaxAmount: number
    usedTaxRate: number
    isFavorable: 'abgeltungssteuer' | 'personal' | 'equal'
    availableGrundfreibetrag: number
    usedGrundfreibetrag: number
    explanation: string
  } | null
}

/**
 * Helper function: Calculate tax on realized gains
 */
function calculateRealizedGainsTax(
  totalRealizedGain: number,
  yearlyFreibetrag: number,
  teilfreistellungsquote: number,
  taxRate: number,
  guenstigerPruefungAktiv: boolean,
  incomeTaxRate: number | undefined,
  kirchensteuerAktiv: boolean,
  kirchensteuersatz: number,
): RealizedGainsTaxResult {
  const taxableGain = totalRealizedGain > 0 ? totalRealizedGain * (1 - teilfreistellungsquote) : 0
  let taxOnRealizedGains = 0
  let guenstigerPruefungResult = null

  if (taxableGain > 0) {
    const gainAfterFreibetrag = Math.max(0, taxableGain - yearlyFreibetrag)

    if (guenstigerPruefungAktiv && incomeTaxRate !== undefined && gainAfterFreibetrag > 0) {
      guenstigerPruefungResult = performGuenstigerPruefung(
        gainAfterFreibetrag,
        taxRate,
        incomeTaxRate,
        teilfreistellungsquote,
        0,
        0,
        kirchensteuerAktiv,
        kirchensteuersatz,
      )

      if (guenstigerPruefungResult.isFavorable === 'personal') {
        taxOnRealizedGains = guenstigerPruefungResult.personalTaxAmount
      }
      else {
        taxOnRealizedGains = guenstigerPruefungResult.abgeltungssteuerAmount
      }
    }
    else {
      taxOnRealizedGains = gainAfterFreibetrag * taxRate
    }
  }

  const freibetragUsedOnGains = Math.min(taxableGain, yearlyFreibetrag)
  const remainingFreibetrag = yearlyFreibetrag - freibetragUsedOnGains

  return {
    taxOnRealizedGains,
    freibetragUsedOnGains,
    remainingFreibetrag,
    guenstigerPruefungResult,
  }
}

export type InflationConfig = {
  inflationRate?: number // Annual inflation rate for adjustment (default: 2%)
}

export type WithdrawalResultElement = {
  startkapital: number
  entnahme: number
  endkapital: number
  bezahlteSteuer: number
  genutzterFreibetrag: number
  zinsen: number
  // Optional fields for detailed view
  monatlicheEntnahme?: number
  inflationAnpassung?: number
  portfolioAnpassung?: number
  einkommensteuer?: number
  genutzterGrundfreibetrag?: number
  taxableIncome?: number // Actual taxable income after applying Grundfreibetrag
  // Günstigerprüfung information for realized gains
  guenstigerPruefungResultRealizedGains?: {
    abgeltungssteuerAmount: number
    personalTaxAmount: number
    usedTaxRate: number
    isFavorable: 'abgeltungssteuer' | 'personal' | 'equal'
    explanation: string
  }
  // Dynamic strategy specific fields
  dynamischeAnpassung?: number // Amount of dynamic adjustment applied
  vorjahresRendite?: number // Previous year's return rate (for dynamic strategy)
  // Tax optimization specific fields
  steueroptimierungAnpassung?: number // Amount of tax optimization adjustment applied
  // Bucket strategy specific fields
  cashCushionStart?: number // Cash cushion amount at start of year
  cashCushionEnd?: number // Cash cushion amount at end of year
  bucketUsed?: 'portfolio' | 'cash' // Which bucket was used for withdrawal
  refillAmount?: number // Amount moved from portfolio to cash cushion
  // Vorabpauschale fields for transparency
  vorabpauschale?: number // Total Vorabpauschale amount for the year
  vorabpauschaleDetails?: {
    basiszins: number
    basisertrag: number
    vorabpauschaleAmount: number
    steuerVorFreibetrag: number
    jahresgewinn: number
    anteilImJahr: number
    startkapital: number // For explanation calculations
  }
  // Statutory pension fields
  statutoryPension?: {
    grossAnnualAmount: number
    netAnnualAmount: number
    incomeTax: number
    taxableAmount: number
  }
  // Other income sources fields
  otherIncome?: {
    totalNetAmount: number
    totalTaxAmount: number
    sourceCount: number
  }
  // Health and care insurance fields
  healthCareInsurance?: {
    healthInsuranceAnnual: number
    careInsuranceAnnual: number
    totalAnnual: number
    healthInsuranceMonthly: number
    careInsuranceMonthly: number
    totalMonthly: number
    usedFixedAmounts: boolean
    isRetirementPhase: boolean
    effectiveHealthInsuranceRate: number
    effectiveCareInsuranceRate: number
    // Couple health insurance details (only present when in couple mode)
    coupleDetails?: CoupleHealthInsuranceYearResult
  }
}

export type WithdrawalResult = {
  [year: number]: WithdrawalResultElement
}

export type MonthlyWithdrawalConfig = {
  monthlyAmount: number // Fixed monthly withdrawal amount in €
  inflationRate?: number // Annual inflation rate for adjustment (default: 2%)
  enableGuardrails?: boolean // Enable dynamic adjustment based on portfolio performance
  guardrailsThreshold?: number // Threshold for portfolio performance adjustment (default: 10%)
}

export type DynamicWithdrawalConfig = {
  baseWithdrawalRate: number // Base withdrawal rate as percentage (e.g., 0.04 for 4%)
  upperThresholdReturn: number // Upper threshold return rate as percentage (e.g., 0.08 for 8%)
  // Relative adjustment when return exceeds upper threshold (e.g., 0.05 for 5% increase)
  upperThresholdAdjustment: number
  lowerThresholdReturn: number // Lower threshold return rate as percentage (e.g., 0.02 for 2%)
  // Relative adjustment when return falls below lower threshold (e.g., -0.05 for 5% decrease)
  lowerThresholdAdjustment: number
}

export type BucketSubStrategy = '4prozent' | '3prozent' | 'variabel_prozent' | 'monatlich_fest' | 'dynamisch'

export type BucketStrategyConfig = {
  initialCashCushion: number // Initial cash cushion amount in €
  refillThreshold: number // Threshold for moving gains to cash cushion in €
  refillPercentage: number // Percentage of gains above threshold to move to cash (e.g., 0.5 for 50%)
  // Base withdrawal rate as percentage (e.g., 0.04 for 4%)
  // - only used when subStrategy is not "variabel_prozent" or "monatlich_fest"
  baseWithdrawalRate: number
  // Sub-strategy configuration
  // Which withdrawal strategy to use within bucket strategy (optional for backward compatibility)
  subStrategy?: BucketSubStrategy
  variabelProzent?: number // Variable percentage for variabel_prozent sub-strategy
  monatlicheBetrag?: number // Monthly amount for monatlich_fest sub-strategy
  // Dynamic strategy sub-configuration
  dynamischBasisrate?: number
  dynamischObereSchwell?: number
  dynamischObereAnpassung?: number
  dynamischUntereSchwell?: number
  dynamischUntereAnpassung?: number
}

export type RMDConfig = {
  startAge: number // Age at start of withdrawal phase (required)
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom' // Which mortality table to use
  customLifeExpectancy?: number // Custom life expectancy override (years)
}

export type KapitalerhaltConfig = {
  nominalReturn: number // Expected nominal return rate as percentage (e.g., 0.07 for 7%)
  inflationRate: number // Expected inflation rate as percentage (e.g., 0.02 for 2%)
}

export type SteueroptimierteEntnahmeConfig = {
  baseWithdrawalRate: number // Base withdrawal rate as percentage (e.g., 0.04 for 4%)
  targetTaxRate: number // Target tax rate to optimize towards (default: current tax rate)
  optimizationMode: 'minimize_taxes' | 'maximize_after_tax' | 'balanced' // Optimization strategy
  freibetragUtilizationTarget: number // Target Freibetrag utilization (0.8 = use 80% of available Freibetrag)
  rebalanceFrequency: 'yearly' | 'quarterly' | 'as_needed' // How often to rebalance the strategy
}

const freibetrag: {
  [year: number]: number
} = {
  2023: 2000,
}

// German basic tax allowance (Grundfreibetrag) for income tax during withdrawal
const grundfreibetrag: {
  [year: number]: number
} = {
  2023: 10908, // € per year
}

type MutableLayer = SparplanElement & {
  currentValue: number
  costBasis: number
  accumulatedVorabpauschale: number
}

export type CalculateWithdrawalParams = {
  elements: SparplanElement[]
  startYear: number
  endYear: number
  strategy: WithdrawalStrategy
  withdrawalFrequency?: WithdrawalFrequency
  returnConfig: ReturnConfiguration
  taxRate?: number
  teilfreistellungsquote?: number
  freibetragPerYear?: { [year: number]: number }
  steuerReduzierenEndkapital?: boolean
  monthlyConfig?: MonthlyWithdrawalConfig
  customPercentage?: number
  enableGrundfreibetrag?: boolean
  grundfreibetragPerYear?: { [year: number]: number }
  incomeTaxRate?: number
  // Günstigerprüfung settings
  guenstigerPruefungAktiv?: boolean
  // Church tax (Kirchensteuer) settings
  kirchensteuerAktiv?: boolean
  kirchensteuersatz?: number
  inflationConfig?: InflationConfig
  dynamicConfig?: DynamicWithdrawalConfig
  bucketConfig?: BucketStrategyConfig
  rmdConfig?: RMDConfig
  kapitalerhaltConfig?: KapitalerhaltConfig
  steueroptimierteEntnahmeConfig?: SteueroptimierteEntnahmeConfig
  basiszinsConfiguration?: BasiszinsConfiguration
  statutoryPensionConfig?: StatutoryPensionConfig
  otherIncomeConfig?: OtherIncomeConfiguration
  healthCareInsuranceConfig?: HealthCareInsuranceConfig
  birthYear?: number // For health care insurance age calculation
}

export function calculateWithdrawal({
  elements,
  startYear,
  endYear,
  strategy,
  withdrawalFrequency = 'yearly',
  returnConfig,
  taxRate = 0.26375,
  teilfreistellungsquote = 0.3,
  freibetragPerYear,
  steuerReduzierenEndkapital = true,
  monthlyConfig,
  customPercentage,
  enableGrundfreibetrag,
  grundfreibetragPerYear,
  incomeTaxRate,
  guenstigerPruefungAktiv,
  kirchensteuerAktiv = false,
  kirchensteuersatz = 9,
  inflationConfig,
  dynamicConfig,
  bucketConfig,
  rmdConfig,
  kapitalerhaltConfig,
  steueroptimierteEntnahmeConfig,
  basiszinsConfiguration,
  statutoryPensionConfig,
  otherIncomeConfig,
  healthCareInsuranceConfig,
  birthYear,
}: CalculateWithdrawalParams): { result: WithdrawalResult, finalLayers: MutableLayer[] } {
  // Create accessor functions
  const getFreibetragForYear = createFreibetragAccessor(freibetragPerYear)
  const getGrundfreibetragForYear = createGrundfreibetragAccessor(grundfreibetragPerYear)

  // Generate year-specific growth rates
  const allYears = determineYearsForGrowthRates(startYear, endYear, strategy, bucketConfig)
  const yearlyGrowthRates = generateYearlyGrowthRates(allYears, returnConfig)

  // Initialize data sources
  const statutoryPensionData = initializeStatutoryPensionData(statutoryPensionConfig, startYear, endYear)
  const otherIncomeData = initializeOtherIncomeData(otherIncomeConfig, startYear, endYear)

  const initialStartingCapital = calculateInitialStartingCapital(elements, startYear)
  const mutableLayers = initializeMutableLayers(elements, startYear)

  const baseWithdrawalAmount = calculateBaseWithdrawalAmount({
    strategy,
    initialStartingCapital,
    monthlyConfig,
    customPercentage,
    dynamicConfig,
    bucketConfig,
    rmdConfig,
    kapitalerhaltConfig,
    steueroptimierteEntnahmeConfig,
  })

  // Initialize cash cushion for bucket strategy
  const initialCashCushion = initializeCashCushion(strategy, bucketConfig)

  // Process all withdrawal years
  const result = processAllWithdrawalYears(
    startYear,
    endYear,
    mutableLayers,
    yearlyGrowthRates,
    baseWithdrawalAmount,
    initialCashCushion,
    strategy,
    withdrawalFrequency,
    monthlyConfig,
    inflationConfig,
    dynamicConfig,
    bucketConfig,
    rmdConfig,
    steueroptimierteEntnahmeConfig,
    basiszinsConfiguration,
    healthCareInsuranceConfig,
    taxRate,
    teilfreistellungsquote,
    steuerReduzierenEndkapital,
    enableGrundfreibetrag,
    guenstigerPruefungAktiv || false,
    incomeTaxRate,
    kirchensteuerAktiv,
    kirchensteuersatz,
    freibetragPerYear,
    statutoryPensionData,
    otherIncomeData,
    birthYear,
    getFreibetragForYear,
    getGrundfreibetragForYear,
  )

  const finalLayers = updateFinalLayers(mutableLayers, endYear)

  return { result, finalLayers }
}

export function calculateSegmentedWithdrawal(
  elements: SparplanElement[],
  segmentedConfig: SegmentedWithdrawalConfig,
): WithdrawalResult {
  const result: WithdrawalResult = {}
  let currentLayers: SparplanElement[] = elements

  const sortedSegments = [...segmentedConfig.segments].sort(
    (a: WithdrawalSegment, b: WithdrawalSegment) => a.startYear - b.startYear,
  )

  for (const segment of sortedSegments) {
    const { result: segmentResultData, finalLayers } = calculateWithdrawal({
      elements: currentLayers,
      startYear: segment.startYear,
      endYear: segment.endYear,
      strategy: segment.strategy,
      withdrawalFrequency: segment.withdrawalFrequency,
      returnConfig: segment.returnConfig,
      taxRate: segmentedConfig.taxRate,
      teilfreistellungsquote: 0.3, // Assuming default, should be passed in config
      freibetragPerYear: segmentedConfig.freibetragPerYear,
      steuerReduzierenEndkapital: segment.steuerReduzierenEndkapital ?? true,
      monthlyConfig: segment.monthlyConfig,
      customPercentage: segment.customPercentage,

      incomeTaxRate: segment.incomeTaxRate,
      kirchensteuerAktiv: segmentedConfig.kirchensteuerAktiv ?? false,
      kirchensteuersatz: segmentedConfig.kirchensteuersatz ?? 9,
      inflationConfig: segment.inflationConfig,
      dynamicConfig: segment.dynamicConfig,
      bucketConfig: segment.bucketConfig,
      rmdConfig: segment.rmdConfig,
      steueroptimierteEntnahmeConfig: segment.steuerOptimierteConfig,
      statutoryPensionConfig: segmentedConfig.statutoryPensionConfig,
    })

    Object.assign(result, segmentResultData)
    currentLayers = finalLayers

    const lastYearOfSegment = Object.keys(segmentResultData).map(Number).sort((a, b) => b - a)[0]
    if (lastYearOfSegment && segmentResultData[lastYearOfSegment].endkapital <= 0) {
      break
    }
  }

  return result
}

export function calculateIncomeTax(
  withdrawalAmount: number,
  grundfreibetragYear: number = grundfreibetrag[2023],
  incomeTaxRate = 0.18,
  kirchensteuerAktiv = false,
  kirchensteuersatz = 9,
): number {
  const taxableIncome = Math.max(0, withdrawalAmount - grundfreibetragYear)
  const baseIncomeTax = taxableIncome * incomeTaxRate

  // Calculate Kirchensteuer as percentage of income tax
  const kirchensteuer = kirchensteuerAktiv ? baseIncomeTax * (kirchensteuersatz / 100) : 0

  return baseIncomeTax + kirchensteuer
}

export function getTotalCapitalAtYear(elements: SparplanElement[], year: number): number {
  return elements.reduce((total: number, element: SparplanElement) => {
    const yearData = element.simulation?.[year]
    return total + (yearData?.endkapital || 0)
  }, 0)
}

export function calculateWithdrawalDuration(
  withdrawalResult: WithdrawalResult,
  startYear: number,
): number | null {
  const years = Object.keys(withdrawalResult).map(Number).sort((a: number, b: number) => a - b)

  for (const year of years) {
    if (withdrawalResult[year].endkapital <= 0) {
      return year - startYear + 1
    }
  }

  return null
}

// Helper: Validate tax optimization inputs
function areOptimizationInputsValid(capitalAtStartOfYear: number, baseWithdrawalAmount: number): boolean {
  return capitalAtStartOfYear > 0 && baseWithdrawalAmount > 0
}

// Helper: Calculate withdrawal for minimize_taxes mode
function calculateMinimizeTaxesWithdrawal(
  capitalAtStartOfYear: number,
  baseWithdrawalAmount: number,
  targetFreibetragUsage: number,
  taxRate: number,
  teilfreistellungsquote: number,
): number {
  const taxableRate = 1 - teilfreistellungsquote

  if (taxableRate <= 0 || taxRate <= 0) {
    return Math.min(capitalAtStartOfYear, baseWithdrawalAmount)
  }

  const maxTaxFreeWithdrawal = targetFreibetragUsage / (taxableRate * taxRate)
  const minWithdrawal = baseWithdrawalAmount * 0.8
  const maxWithdrawal = Math.min(capitalAtStartOfYear, baseWithdrawalAmount * 1.2)

  const result = Math.max(minWithdrawal, Math.min(maxWithdrawal, maxTaxFreeWithdrawal || baseWithdrawalAmount))
  return isNaN(result) ? baseWithdrawalAmount : result
}

// Helper: Calculate withdrawal for maximize_after_tax mode
function calculateMaximizeAfterTaxWithdrawal(
  capitalAtStartOfYear: number,
  baseWithdrawalAmount: number,
  availableFreibetrag: number,
  taxRate: number,
  teilfreistellungsquote: number,
): number {
  const optimalWithdrawal = findOptimalAfterTaxWithdrawal(
    capitalAtStartOfYear,
    baseWithdrawalAmount,
    availableFreibetrag,
    taxRate,
    teilfreistellungsquote,
  )

  const result = Math.max(baseWithdrawalAmount * 0.8, Math.min(capitalAtStartOfYear, optimalWithdrawal))
  return isNaN(result) ? baseWithdrawalAmount : result
}

// Helper: Calculate withdrawal for balanced mode
function calculateBalancedWithdrawal(
  capitalAtStartOfYear: number,
  baseWithdrawalAmount: number,
  availableFreibetrag: number,
  targetFreibetragUsage: number,
): number {
  const taxEfficientAdjustment = availableFreibetrag > 0
    ? (targetFreibetragUsage - availableFreibetrag * 0.5) / availableFreibetrag
    : 0
  const adjustmentFactor = 1 + (taxEfficientAdjustment * 0.1)

  const adjustedWithdrawal = baseWithdrawalAmount * Math.max(0.9, Math.min(1.1, adjustmentFactor))
  const result = Math.min(capitalAtStartOfYear, adjustedWithdrawal)
  return isNaN(result) ? baseWithdrawalAmount : result
}

/**
 * Calculate tax-optimized withdrawal amount for a given year
 * This function attempts to minimize taxes by optimizing the withdrawal amount
 * considering German tax rules like Freibetrag and Vorabpauschale
 */
function calculateTaxOptimizedWithdrawal(
  capitalAtStartOfYear: number,
  baseWithdrawalAmount: number,
  availableFreibetrag: number,
  targetFreibetragUtilization: number,
  taxRate: number,
  teilfreistellungsquote: number,
  config: SteueroptimierteEntnahmeConfig,
): number {
  if (!areOptimizationInputsValid(capitalAtStartOfYear, baseWithdrawalAmount)) {
    return baseWithdrawalAmount || 0
  }

  const targetFreibetragUsage = availableFreibetrag * targetFreibetragUtilization

  switch (config.optimizationMode) {
    case 'minimize_taxes':
      return calculateMinimizeTaxesWithdrawal(
        capitalAtStartOfYear,
        baseWithdrawalAmount,
        targetFreibetragUsage,
        taxRate,
        teilfreistellungsquote,
      )

    case 'maximize_after_tax':
      return calculateMaximizeAfterTaxWithdrawal(
        capitalAtStartOfYear,
        baseWithdrawalAmount,
        availableFreibetrag,
        taxRate,
        teilfreistellungsquote,
      )

    case 'balanced':
    default:
      return calculateBalancedWithdrawal(
        capitalAtStartOfYear,
        baseWithdrawalAmount,
        availableFreibetrag,
        targetFreibetragUsage,
      )
  }
}

/**
 * Calculate after-tax amount for a given withdrawal
 */
function calculateAfterTaxAmount(
  amount: number,
  taxRate: number,
  teilfreistellungsquote: number,
  availableFreibetrag: number,
): number {
  const taxableAmount = Math.max(0, amount * (1 - teilfreistellungsquote) - availableFreibetrag)
  const tax = taxableAmount * taxRate
  return amount - tax
}

/**
 * Generate test withdrawal amounts
 */
function generateTestWithdrawalAmounts(
  baseWithdrawalAmount: number,
  capitalAtStartOfYear: number,
): number[] {
  return [
    baseWithdrawalAmount * 0.8,
    baseWithdrawalAmount * 0.9,
    baseWithdrawalAmount,
    baseWithdrawalAmount * 1.1,
    baseWithdrawalAmount * 1.2,
  ].filter(amount => amount > 0 && amount <= capitalAtStartOfYear)
}

/**
 * Validate withdrawal optimization inputs
 */
function areWithdrawalInputsValid(
  capitalAtStartOfYear: number,
  baseWithdrawalAmount: number,
): boolean {
  return baseWithdrawalAmount > 0 && capitalAtStartOfYear > 0
}

/**
 * Find best amount from test amounts
 */
function findBestWithdrawalAmount(
  testAmounts: number[],
  baseWithdrawalAmount: number,
  taxRate: number,
  teilfreistellungsquote: number,
  availableFreibetrag: number,
): number {
  let bestAmount = baseWithdrawalAmount
  let bestAfterTax = 0

  for (const amount of testAmounts) {
    const afterTaxAmount = calculateAfterTaxAmount(amount, taxRate, teilfreistellungsquote, availableFreibetrag)

    if (afterTaxAmount > bestAfterTax) {
      bestAfterTax = afterTaxAmount
      bestAmount = amount
    }
  }

  return bestAmount
}

/**
 * Find optimal withdrawal amount that maximizes after-tax income
 * This is a simplified implementation - real optimization would use more sophisticated algorithms
 */
function findOptimalAfterTaxWithdrawal(
  capitalAtStartOfYear: number,
  baseWithdrawalAmount: number,
  availableFreibetrag: number,
  taxRate: number,
  teilfreistellungsquote: number,
): number {
  // Validate inputs
  if (!areWithdrawalInputsValid(capitalAtStartOfYear, baseWithdrawalAmount)) {
    return baseWithdrawalAmount || 0
  }

  const testAmounts = generateTestWithdrawalAmounts(baseWithdrawalAmount, capitalAtStartOfYear)

  if (testAmounts.length === 0) {
    return Math.min(capitalAtStartOfYear, baseWithdrawalAmount)
  }

  const bestAmount = findBestWithdrawalAmount(
    testAmounts,
    baseWithdrawalAmount,
    taxRate,
    teilfreistellungsquote,
    availableFreibetrag,
  )

  return isNaN(bestAmount) ? baseWithdrawalAmount : bestAmount
}
