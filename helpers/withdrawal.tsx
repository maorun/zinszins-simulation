import type { SparplanElement } from '../src/utils/sparplan-utils'
import { getBasiszinsForYear, calculateVorabpauschale, calculateSteuerOnVorabpauschale, performGuenstigerPruefung } from './steuer'
import type { ReturnConfiguration } from '../src/utils/random-returns'
import { generateRandomReturns } from '../src/utils/random-returns'
import type { SegmentedWithdrawalConfig, WithdrawalSegment } from '../src/utils/segmented-withdrawal'
import type { WithdrawalFrequency } from '../src/utils/config-storage'
import type { BasiszinsConfiguration } from '../src/services/bundesbank-api'
import { calculateRMDWithdrawal } from './rmd-tables'
import type { StatutoryPensionConfig } from './statutory-pension'
import { calculateStatutoryPension } from './statutory-pension'
import type { OtherIncomeConfiguration } from './other-income'
import { calculateOtherIncome } from './other-income'
import type { HealthCareInsuranceConfig, CoupleHealthInsuranceYearResult } from './health-care-insurance'
import { calculateHealthCareInsuranceForYear, calculateCoupleHealthInsuranceForYear } from './health-care-insurance'

export type WithdrawalStrategy = '4prozent' | '3prozent' | 'monatlich_fest' | 'variabel_prozent' | 'dynamisch' | 'bucket_strategie' | 'rmd' | 'kapitalerhalt' | 'steueroptimiert'

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
  // Helper functions
  const getFreibetragForYear = (year: number): number => {
    if (freibetragPerYear && freibetragPerYear[year] !== undefined) return freibetragPerYear[year]
    return freibetrag[2023] || 2000
  }
  const getGrundfreibetragForYear = (year: number): number => {
    if (grundfreibetragPerYear && grundfreibetragPerYear[year] !== undefined) return grundfreibetragPerYear[year]
    return grundfreibetrag[2023] || 10908
  }

  // Generate year-specific growth rates
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i)

  // For dynamic strategy or bucket strategy with dynamic sub-strategy, we also need the previous year's return rate
  const allYears = (strategy === 'dynamisch' || (strategy === 'bucket_strategie' && bucketConfig?.subStrategy === 'dynamisch'))
    ? Array.from({ length: endYear - startYear + 2 }, (_, i) => startYear - 1 + i)
    : years

  const yearlyGrowthRates: Record<number, number> = {}
  if (returnConfig.mode === 'fixed') {
    const fixedRate = returnConfig.fixedRate || 0.05
    for (const year of allYears) yearlyGrowthRates[year] = fixedRate
  }
  else if (returnConfig.mode === 'random' && returnConfig.randomConfig) {
    Object.assign(yearlyGrowthRates, generateRandomReturns(allYears, returnConfig.randomConfig))
  }
  else if (returnConfig.mode === 'variable' && returnConfig.variableConfig) {
    for (const year of allYears) yearlyGrowthRates[year] = returnConfig.variableConfig.yearlyReturns[year] || 0.05
  }
  else if (returnConfig.mode === 'multiasset' && returnConfig.multiAssetConfig) {
    try {
      const { generateMultiAssetReturns } = require('./multi-asset-calculations')
      const multiAssetReturns = generateMultiAssetReturns(allYears, returnConfig.multiAssetConfig)
      Object.assign(yearlyGrowthRates, multiAssetReturns)
    }
    catch (error) {
      console.warn('Multi-asset calculations not available, falling back to 5% fixed return:', error)
      for (const year of allYears) yearlyGrowthRates[year] = 0.05
    }
  }

  const result: WithdrawalResult = {}

  // Calculate statutory pension for all years if configured
  // Note: We pass 0 for incomeTaxRate because income tax is now calculated centrally
  // combining all income sources (portfolio withdrawal + pension + other income)
  const statutoryPensionData = statutoryPensionConfig?.enabled
    ? calculateStatutoryPension(
        statutoryPensionConfig,
        startYear,
        endYear,
        0, // Income tax calculated centrally, not per source
        {}, // No Grundfreibetrag per source, applied centrally
      )
    : {}

  // Calculate other income for all years if configured
  const otherIncomeData = otherIncomeConfig?.enabled
    ? calculateOtherIncome(
        otherIncomeConfig,
        startYear,
        endYear,
      )
    : {}

  const initialStartingCapital = elements.reduce((sum: number, el: SparplanElement) => {
    const simYear = el.simulation?.[startYear - 1]
    return sum + (simYear?.endkapital || 0)
  }, 0)

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

  let baseWithdrawalAmount: number
  if (strategy === 'monatlich_fest') {
    if (!monthlyConfig) throw new Error('Monthly config required')
    baseWithdrawalAmount = monthlyConfig.monthlyAmount * 12
  }
  else if (strategy === 'variabel_prozent') {
    if (customPercentage === undefined) throw new Error('Custom percentage required')
    baseWithdrawalAmount = initialStartingCapital * customPercentage
  }
  else if (strategy === 'dynamisch') {
    if (!dynamicConfig) throw new Error('Dynamic config required')
    baseWithdrawalAmount = initialStartingCapital * dynamicConfig.baseWithdrawalRate
  }
  else if (strategy === 'bucket_strategie') {
    if (!bucketConfig) throw new Error('Bucket strategy config required')

    // Calculate base withdrawal amount based on sub-strategy
    switch (bucketConfig.subStrategy) {
      case '4prozent': {
        baseWithdrawalAmount = initialStartingCapital * 0.04
        break
      }
      case '3prozent': {
        baseWithdrawalAmount = initialStartingCapital * 0.03
        break
      }
      case 'variabel_prozent': {
        const variableRate = bucketConfig.variabelProzent ? bucketConfig.variabelProzent / 100 : 0.04
        baseWithdrawalAmount = initialStartingCapital * variableRate
        break
      }
      case 'monatlich_fest': {
        baseWithdrawalAmount = bucketConfig.monatlicheBetrag
          ? bucketConfig.monatlicheBetrag * 12
          : initialStartingCapital * 0.04
        break
      }
      case 'dynamisch': {
        const dynamicBaseRate = bucketConfig.dynamischBasisrate ? bucketConfig.dynamischBasisrate / 100 : 0.04
        baseWithdrawalAmount = initialStartingCapital * dynamicBaseRate
        break
      }
      default: {
        // Fallback to baseWithdrawalRate for backward compatibility (when subStrategy is not defined)
        baseWithdrawalAmount = initialStartingCapital * bucketConfig.baseWithdrawalRate
      }
    }
  }
  else if (strategy === 'rmd') {
    if (!rmdConfig) throw new Error('RMD config required')
    // For RMD, baseWithdrawalAmount will be calculated dynamically each year
    // Set initial value based on first year calculation
    const currentAge = rmdConfig.startAge
    baseWithdrawalAmount = calculateRMDWithdrawal(
      initialStartingCapital,
      currentAge,
      rmdConfig.lifeExpectancyTable,
      rmdConfig.customLifeExpectancy,
    )
  }
  else if (strategy === 'kapitalerhalt') {
    if (!kapitalerhaltConfig) throw new Error('Kapitalerhalt config required')
    // Calculate real return rate: nominal return - inflation rate
    const realReturnRate = kapitalerhaltConfig.nominalReturn - kapitalerhaltConfig.inflationRate
    baseWithdrawalAmount = initialStartingCapital * realReturnRate
  }
  else if (strategy === 'steueroptimiert') {
    if (!steueroptimierteEntnahmeConfig) throw new Error('Steueroptimierte Entnahme config required')
    // Start with base withdrawal rate, optimization happens year by year
    baseWithdrawalAmount = initialStartingCapital * steueroptimierteEntnahmeConfig.baseWithdrawalRate
  }
  else {
    const withdrawalRate = strategy === '4prozent' ? 0.04 : 0.03
    baseWithdrawalAmount = initialStartingCapital * withdrawalRate
  }

  // Initialize cash cushion for bucket strategy
  let cashCushion = strategy === 'bucket_strategie' && bucketConfig ? bucketConfig.initialCashCushion : 0

  for (let year = startYear; year <= endYear; year++) {
    const capitalAtStartOfYear = mutableLayers.reduce((sum: number, l: MutableLayer) => sum + l.currentValue, 0)
    if (capitalAtStartOfYear <= 0) break

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

    let inflationAnpassung = 0
    if (inflationConfig?.inflationRate) {
      const yearsPassed = year - startYear
      inflationAnpassung = baseWithdrawalAmount * (Math.pow(1 + inflationConfig.inflationRate, yearsPassed) - 1)
      annualWithdrawal += inflationAnpassung
    }

    // Dynamic adjustment based on previous year's return
    let dynamischeAnpassung = 0
    let vorjahresRendite: number | undefined
    if (strategy === 'dynamisch' && dynamicConfig) {
      // Get the previous year's return rate
      const previousYear = year - 1
      vorjahresRendite = yearlyGrowthRates[previousYear]

      if (vorjahresRendite !== undefined) {
        // Calculate dynamic adjustment based on thresholds
        if (vorjahresRendite > dynamicConfig.upperThresholdReturn) {
          // Return exceeded upper threshold - increase withdrawal
          dynamischeAnpassung = annualWithdrawal * dynamicConfig.upperThresholdAdjustment
        }
        else if (vorjahresRendite < dynamicConfig.lowerThresholdReturn) {
          // Return fell below lower threshold - decrease withdrawal
          dynamischeAnpassung = annualWithdrawal * dynamicConfig.lowerThresholdAdjustment
        }
        annualWithdrawal += dynamischeAnpassung
      }
    }
    else if (strategy === 'bucket_strategie' && bucketConfig && bucketConfig.subStrategy === 'dynamisch') {
      // Handle dynamic adjustments within bucket strategy
      const previousYear = year - 1
      vorjahresRendite = yearlyGrowthRates[previousYear]

      if (vorjahresRendite !== undefined
        && bucketConfig.dynamischObereSchwell !== undefined
        && bucketConfig.dynamischUntereSchwell !== undefined
        && bucketConfig.dynamischObereAnpassung !== undefined
        && bucketConfig.dynamischUntereAnpassung !== undefined) {
        const upperThreshold = bucketConfig.dynamischObereSchwell / 100
        const lowerThreshold = bucketConfig.dynamischUntereSchwell / 100
        const upperAdjustment = bucketConfig.dynamischObereAnpassung / 100
        const lowerAdjustment = bucketConfig.dynamischUntereAnpassung / 100

        if (vorjahresRendite > upperThreshold) {
          // Return exceeded upper threshold - increase withdrawal
          dynamischeAnpassung = annualWithdrawal * upperAdjustment
        }
        else if (vorjahresRendite < lowerThreshold) {
          // Return fell below lower threshold - decrease withdrawal
          dynamischeAnpassung = annualWithdrawal * lowerAdjustment
        }

        annualWithdrawal += dynamischeAnpassung
      }
    }

    // Tax-optimized withdrawal strategy: dynamically optimize withdrawal amount
    let steueroptimierungAnpassung = 0
    if (strategy === 'steueroptimiert' && steueroptimierteEntnahmeConfig) {
      // Calculate optimal withdrawal amount to minimize taxes
      const currentFreibetrag = getFreibetragForYear(year)
      const targetFreibetragUtilization = steueroptimierteEntnahmeConfig.freibetragUtilizationTarget || 0.85

      // Estimate tax-efficient withdrawal amount based on available Freibetrag
      // This is a simplified optimization - in reality this would involve more complex calculations
      const taxEfficientWithdrawal = calculateTaxOptimizedWithdrawal(
        capitalAtStartOfYear,
        annualWithdrawal,
        currentFreibetrag,
        targetFreibetragUtilization,
        taxRate || 0.26375,
        teilfreistellungsquote || 0.3,
        steueroptimierteEntnahmeConfig,
      )

      steueroptimierungAnpassung = taxEfficientWithdrawal - annualWithdrawal
      annualWithdrawal = taxEfficientWithdrawal
    }

    const entnahme = Math.min(annualWithdrawal, capitalAtStartOfYear)

    // Calculate health care insurance contributions for this year
    let healthCareInsuranceData
    let coupleHealthCareInsuranceData: CoupleHealthInsuranceYearResult | undefined
    // let _healthCareInsuranceTotal = 0
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
        healthCareInsuranceData = {
          healthInsuranceAnnual: coupleHealthCareInsuranceData.totalAnnual,
          careInsuranceAnnual: 0, // Included in total
          totalAnnual: coupleHealthCareInsuranceData.totalAnnual,
          healthInsuranceMonthly: coupleHealthCareInsuranceData.totalMonthly,
          careInsuranceMonthly: 0, // Included in total
          totalMonthly: coupleHealthCareInsuranceData.totalMonthly,
          insuranceType: healthCareInsuranceConfig.insuranceType,
          isRetirementPhase: year >= healthCareInsuranceConfig.retirementStartYear,
          appliedAdditionalCareInsurance: false,
          usedFixedAmounts: false,
        }
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
      // _healthCareInsuranceTotal = healthCareInsuranceData.totalAnnual
    }

    // The net withdrawal amount available to the user after health care insurance
    // const _netEntnahme = entnahme - healthCareInsuranceTotal

    // Get the return rate for this year (needed for monthly withdrawal calculations)
    const returnRate = yearlyGrowthRates[year] || 0

    // Bucket strategy logic: decide which bucket to use for withdrawal
    let bucketUsed: 'portfolio' | 'cash' | undefined
    let cashCushionAtStart = cashCushion
    let refillAmount = 0

    if (strategy === 'bucket_strategie' && bucketConfig) {
      // Decide which bucket to use based on return rate
      if (returnRate >= 0) {
        // Positive return: use portfolio for withdrawal
        bucketUsed = 'portfolio'
      }
      else {
        // Negative return: use cash cushion if available
        if (cashCushion >= entnahme) {
          bucketUsed = 'cash'
          cashCushion -= entnahme
        }
        else {
          // Not enough cash, need to use portfolio anyway
          bucketUsed = 'portfolio'
        }
      }
    }

    // Adjust withdrawal timing based on frequency
    // For yearly: withdrawal happens at beginning of year (current behavior)
    // For monthly: withdrawal happens throughout the year (portfolio grows more)
    let effectiveWithdrawal = entnahme
    let monthlyWithdrawalAmount = undefined

    // Calculate the actual monthly withdrawal amount for display purposes
    if (strategy === 'monatlich_fest' && monthlyConfig) {
      // For monthly fixed strategy, use the actual configured monthly amount (with inflation adjustment)
      let adjustedMonthlyAmount = monthlyConfig.monthlyAmount
      if (inflationConfig?.inflationRate) {
        const yearsPassed = year - startYear
        adjustedMonthlyAmount = monthlyConfig.monthlyAmount * Math.pow(1 + inflationConfig.inflationRate, yearsPassed)
      }
      monthlyWithdrawalAmount = adjustedMonthlyAmount
    }
    else if (withdrawalFrequency === 'monthly') {
      // For other strategies with monthly frequency, divide annual amount by 12
      monthlyWithdrawalAmount = entnahme / 12
    }

    if (withdrawalFrequency === 'monthly') {
      // For monthly frequency, we calculate a more accurate effective withdrawal.
      //
      // Mathematical model: Instead of withdrawing the full amount at the beginning,
      // monthly withdrawals are spread throughout the year. This can be modeled as:
      //
      // For yearly: All capital available for growth except the withdrawn amount
      // For monthly: Capital decreases gradually, with more average capital earning returns
      //
      // The effective impact can be calculated as the present value of monthly withdrawals
      // versus a lump sum at the beginning of the year.
      //
      // Using the return rate to discount monthly withdrawals back to beginning of year:
      const monthlyReturn = Math.pow(1 + returnRate, 1 / 12) - 1
      let monthlyPresentValue = 0
      for (let month = 1; month <= 12; month++) {
        // Each monthly withdrawal discounted back to beginning of year
        monthlyPresentValue += (entnahme / 12) / Math.pow(1 + monthlyReturn, month - 1)
      }
      effectiveWithdrawal = monthlyPresentValue
    }

    // FIRST: Calculate Vorabpauschale BEFORE any withdrawal, using full portfolio values at start of year
    const yearlyFreibetrag = getFreibetragForYear(year)
    const basiszins = getBasiszinsForYear(year, basiszinsConfiguration)
    let totalPotentialVorabTax = 0
    const vorabCalculations: {
      layer: MutableLayer
      vorabpauschaleBetrag: number
      potentialTax: number
      valueBeforeWithdrawal: number
    }[] = []

    mutableLayers.forEach((layer: MutableLayer) => {
      if (layer.currentValue > 0) {
        const valueBeforeWithdrawal = layer.currentValue // Full value at start of year
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

    // SECOND: Process withdrawal and calculate realized gains
    let amountToWithdraw = effectiveWithdrawal
    let totalRealizedGainThisYear = 0

    // For bucket strategy, only process portfolio withdrawal if using portfolio bucket
    if (strategy === 'bucket_strategie' && bucketUsed === 'cash') {
      // Withdrawal comes from cash cushion, no portfolio sale needed
      amountToWithdraw = 0
    }

    for (const layer of mutableLayers) {
      if (amountToWithdraw <= 0 || layer.currentValue <= 0) continue
      const amountToSellFromLayer = Math.min(amountToWithdraw, layer.currentValue)
      const proportionSold = amountToSellFromLayer / layer.currentValue
      const costBasisOfSoldPart = layer.costBasis * proportionSold
      const accumulatedVorabpauschaleOfSoldPart = layer.accumulatedVorabpauschale * proportionSold
      // Fix: Calculate gain using FIFO principle - only subtract cost basis (eingesetztes Kapital)
      // Do NOT subtract accumulated Vorabpauschale as it was already taxed in previous years
      const gain = amountToSellFromLayer - costBasisOfSoldPart
      totalRealizedGainThisYear += gain
      layer.currentValue -= amountToSellFromLayer
      layer.costBasis -= costBasisOfSoldPart
      layer.accumulatedVorabpauschale -= accumulatedVorabpauschaleOfSoldPart
      amountToWithdraw -= amountToSellFromLayer
    }

    // THIRD: Calculate taxes on realized gains and apply freibetrag
    const taxableGain = totalRealizedGainThisYear > 0 ? totalRealizedGainThisYear * (1 - teilfreistellungsquote) : 0

    let taxOnRealizedGains = 0
    let guenstigerPruefungResultRealizedGains = null

    if (taxableGain > 0) {
      const gainAfterFreibetrag = Math.max(0, taxableGain - yearlyFreibetrag)

      if (guenstigerPruefungAktiv && incomeTaxRate !== undefined && gainAfterFreibetrag > 0) {
        // Apply Günstigerprüfung to realized gains
        guenstigerPruefungResultRealizedGains = performGuenstigerPruefung(
          gainAfterFreibetrag,
          taxRate,
          incomeTaxRate, // Already in decimal format
          teilfreistellungsquote,
          0, // Grundfreibetrag not applicable to capital gains
          0,
          kirchensteuerAktiv,
          kirchensteuersatz,
        )

        // Use the more favorable tax amount
        if (guenstigerPruefungResultRealizedGains.isFavorable === 'personal') {
          taxOnRealizedGains = guenstigerPruefungResultRealizedGains.personalTaxAmount
        }
        else {
          taxOnRealizedGains = guenstigerPruefungResultRealizedGains.abgeltungssteuerAmount
        }
      }
      else {
        // Standard Abgeltungssteuer calculation
        taxOnRealizedGains = gainAfterFreibetrag * taxRate
      }
    }

    const freibetragUsedOnGains = Math.min(taxableGain, yearlyFreibetrag)
    let remainingFreibetrag = yearlyFreibetrag - freibetragUsedOnGains

    // FOURTH: Apply remaining freibetrag to Vorabpauschale and calculate final growth
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

    let einkommensteuer = 0
    let genutzterGrundfreibetrag = 0
    let taxableIncome = 0
    if (enableGrundfreibetrag) {
      const yearlyGrundfreibetrag = getGrundfreibetragForYear(year)

      // Calculate total taxable income from all sources
      let totalTaxableIncome = entnahme

      // Add taxable amount from statutory pension
      if (statutoryPensionData[year]?.taxableAmount) {
        totalTaxableIncome += statutoryPensionData[year].taxableAmount
      }

      // Add taxable amount from other income sources
      if (otherIncomeData[year]?.sources) {
        const otherIncomeGrossTotal = otherIncomeData[year].sources.reduce(
          (sum: number, source: any) => sum + (source.grossAnnualAmount || 0),
          0,
        )
        totalTaxableIncome += otherIncomeGrossTotal
      }

      // Deduct health care insurance contributions (tax-deductible in Germany)
      if (healthCareInsuranceData && healthCareInsuranceConfig?.enabled) {
        totalTaxableIncome -= healthCareInsuranceData.totalAnnual
      }

      einkommensteuer = calculateIncomeTax(
        totalTaxableIncome,
        yearlyGrundfreibetrag,
        (incomeTaxRate || 0) / 100,
        kirchensteuerAktiv,
        kirchensteuersatz,
      )
      genutzterGrundfreibetrag = Math.min(totalTaxableIncome, yearlyGrundfreibetrag)
      // Calculate the actual taxable income after applying Grundfreibetrag
      taxableIncome = Math.max(0, totalTaxableIncome - yearlyGrundfreibetrag)
    }

    const capitalAtEndOfYear = mutableLayers.reduce((sum: number, l: MutableLayer) => sum + l.currentValue, 0)

    // Bucket strategy refill logic: move gains to cash cushion if in positive return year
    if (strategy === 'bucket_strategie' && bucketConfig && returnRate > 0) {
      const capitalGain = capitalAtEndOfYear - (capitalAtStartOfYear - (bucketUsed === 'portfolio' ? entnahme : 0))
      if (capitalGain > bucketConfig.refillThreshold) {
        const excessGain = capitalGain - bucketConfig.refillThreshold
        refillAmount = excessGain * bucketConfig.refillPercentage

        // Move money from portfolio to cash cushion (by reducing portfolio value)
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
          cashCushion += refillAmount
        }
      }
    }

    // Recalculate capital at end of year after potential refill
    const finalCapitalAtEndOfYear = mutableLayers.reduce((sum: number, l: MutableLayer) => sum + l.currentValue, 0)

    const totalTaxForYear = taxOnRealizedGains + taxOnVorabpauschale + einkommensteuer

    // Calculate total Vorabpauschale amount for this year
    const totalVorabpauschale = vorabCalculations.reduce((sum, calc) => sum + calc.vorabpauschaleBetrag, 0)

    // Create detailed Vorabpauschale information for explanation
    const vorabpauschaleDetails = totalVorabpauschale > 0
      ? {
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
      : undefined

    result[year] = {
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
      // Include Günstigerprüfung information for realized gains
      guenstigerPruefungResultRealizedGains: guenstigerPruefungResultRealizedGains ? {
        abgeltungssteuerAmount: guenstigerPruefungResultRealizedGains.abgeltungssteuerAmount,
        personalTaxAmount: guenstigerPruefungResultRealizedGains.personalTaxAmount,
        usedTaxRate: guenstigerPruefungResultRealizedGains.usedTaxRate,
        isFavorable: guenstigerPruefungResultRealizedGains.isFavorable,
        explanation: guenstigerPruefungResultRealizedGains.explanation,
      } : undefined,
      dynamischeAnpassung: (strategy === 'dynamisch' || (strategy === 'bucket_strategie' && bucketConfig?.subStrategy === 'dynamisch')) ? dynamischeAnpassung : undefined,
      vorjahresRendite: (strategy === 'dynamisch' || (strategy === 'bucket_strategie' && bucketConfig?.subStrategy === 'dynamisch')) ? vorjahresRendite : undefined,
      // Tax optimization specific fields
      steueroptimierungAnpassung: strategy === 'steueroptimiert' ? steueroptimierungAnpassung : undefined,
      // Bucket strategy specific fields
      cashCushionStart: strategy === 'bucket_strategie' ? cashCushionAtStart : undefined,
      cashCushionEnd: strategy === 'bucket_strategie' ? cashCushion : undefined,
      bucketUsed: strategy === 'bucket_strategie' ? bucketUsed : undefined,
      refillAmount: strategy === 'bucket_strategie' && refillAmount > 0 ? refillAmount : undefined,
      vorabpauschale: totalVorabpauschale > 0 ? totalVorabpauschale : undefined,
      vorabpauschaleDetails: vorabpauschaleDetails,
      // Statutory pension data
      statutoryPension: statutoryPensionData[year] && statutoryPensionData[year].grossAnnualAmount > 0
        ? {
            grossAnnualAmount: statutoryPensionData[year].grossAnnualAmount,
            netAnnualAmount: statutoryPensionData[year].netAnnualAmount,
            incomeTax: statutoryPensionData[year].incomeTax,
            taxableAmount: statutoryPensionData[year].taxableAmount,
          }
        : undefined,
      // Other income data
      otherIncome: otherIncomeData[year] && otherIncomeData[year].totalNetAnnualAmount > 0
        ? {
            totalNetAmount: otherIncomeData[year].totalNetAnnualAmount,
            totalTaxAmount: otherIncomeData[year].totalTaxAmount,
            sourceCount: otherIncomeData[year].sources.length,
          }
        : undefined,
      // Health and care insurance data
      healthCareInsurance: healthCareInsuranceData && healthCareInsuranceConfig?.enabled
        ? {
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
            // Include couple details if in couple mode
            coupleDetails: coupleHealthCareInsuranceData,
          }
        : undefined,
    }
  }

  const finalLayers = mutableLayers.map((l: MutableLayer) => {
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
  incomeTaxRate: number = 0.18,
  kirchensteuerAktiv: boolean = false,
  kirchensteuersatz: number = 9,
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
  // Validate inputs to prevent NaN
  if (!capitalAtStartOfYear || capitalAtStartOfYear <= 0 || !baseWithdrawalAmount || baseWithdrawalAmount <= 0) {
    return baseWithdrawalAmount || 0
  }

  // Calculate target Freibetrag usage
  const targetFreibetragUsage = availableFreibetrag * targetFreibetragUtilization

  switch (config.optimizationMode) {
    case 'minimize_taxes': {
      // Try to use exactly the target amount of Freibetrag to minimize taxes
      // This is a simplified calculation - real optimization would consider Vorabpauschale
      const taxableRate = 1 - teilfreistellungsquote

      // Avoid division by zero
      if (taxableRate <= 0 || taxRate <= 0) {
        return Math.min(capitalAtStartOfYear, baseWithdrawalAmount)
      }

      const maxTaxFreeWithdrawal = targetFreibetragUsage / (taxableRate * taxRate)

      // Choose the minimum of base withdrawal and tax-optimized amount
      // but don't go below 80% of base withdrawal to maintain income consistency
      const minWithdrawal = baseWithdrawalAmount * 0.8
      const maxWithdrawal = Math.min(capitalAtStartOfYear, baseWithdrawalAmount * 1.2)

      // Ensure we return a valid number
      const result = Math.max(minWithdrawal, Math.min(maxWithdrawal, maxTaxFreeWithdrawal || baseWithdrawalAmount))
      return isNaN(result) ? baseWithdrawalAmount : result
    }

    case 'maximize_after_tax': {
      // Try to maximize after-tax income by finding optimal withdrawal amount
      // Consider that higher withdrawals might push into higher tax brackets
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

    case 'balanced':
    default: {
      // Balance between tax minimization and income consistency
      // Use base withdrawal as starting point and adjust slightly for tax efficiency
      const taxEfficientAdjustment = availableFreibetrag > 0
        ? (targetFreibetragUsage - availableFreibetrag * 0.5) / availableFreibetrag
        : 0
      const adjustmentFactor = 1 + (taxEfficientAdjustment * 0.1) // Max 10% adjustment

      const adjustedWithdrawal = baseWithdrawalAmount * Math.max(0.9, Math.min(1.1, adjustmentFactor))
      const result = Math.min(capitalAtStartOfYear, adjustedWithdrawal)
      return isNaN(result) ? baseWithdrawalAmount : result
    }
  }
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
  if (!baseWithdrawalAmount || baseWithdrawalAmount <= 0 || !capitalAtStartOfYear || capitalAtStartOfYear <= 0) {
    return baseWithdrawalAmount || 0
  }

  // Test different withdrawal amounts to find the one with highest after-tax value
  const testAmounts = [
    baseWithdrawalAmount * 0.8,
    baseWithdrawalAmount * 0.9,
    baseWithdrawalAmount,
    baseWithdrawalAmount * 1.1,
    baseWithdrawalAmount * 1.2,
  ].filter(amount => amount > 0 && amount <= capitalAtStartOfYear)

  if (testAmounts.length === 0) {
    return Math.min(capitalAtStartOfYear, baseWithdrawalAmount)
  }

  let bestAmount = baseWithdrawalAmount
  let bestAfterTax = 0

  for (const amount of testAmounts) {
    // Simplified tax calculation - real implementation would consider Vorabpauschale
    const taxableAmount = Math.max(0, amount * (1 - teilfreistellungsquote) - availableFreibetrag)
    const tax = taxableAmount * taxRate
    const afterTaxAmount = amount - tax

    if (afterTaxAmount > bestAfterTax) {
      bestAfterTax = afterTaxAmount
      bestAmount = amount
    }
  }

  return isNaN(bestAmount) ? baseWithdrawalAmount : bestAmount
}
