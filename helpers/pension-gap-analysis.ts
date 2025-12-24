/**
 * Pension Gap Analysis (Rentenlücken-Analyse)
 *
 * This module provides calculations and types for analyzing the gap between
 * desired retirement income and available income sources (statutory pension,
 * portfolio withdrawals, other income).
 */

/**
 * Configuration for desired retirement lifestyle
 */
export interface RetirementLifestyleConfig {
  /** Desired monthly net income in retirement (EUR) */
  desiredMonthlyIncome: number

  /** Whether to apply inflation adjustment to desired income */
  applyInflationAdjustment?: boolean

  /** Annual inflation rate (default: 2.0%) */
  inflationRate?: number

  /** Base year for inflation calculation (typically retirement start year) */
  baseYear?: number
}

/**
 * Income sources for a specific year
 */
export interface YearlyIncomeSources {
  /** Year */
  year: number

  /** Statutory pension income (net, annual) */
  statutoryPensionNet: number

  /** Portfolio withdrawal amount (annual) */
  portfolioWithdrawal: number

  /** Other income sources (net, annual) */
  otherIncome: number

  /** Health care insurance costs (annual) */
  healthCareInsurance: number

  /** Total available income after all deductions */
  totalAvailableIncome: number

  /** Desired income for this year (inflation-adjusted if configured) */
  desiredAnnualIncome: number
}

/**
 * Pension gap analysis result for a single year
 */
export interface YearlyPensionGapResult {
  /** Year */
  year: number

  /** Desired annual income (inflation-adjusted) */
  desiredAnnualIncome: number

  /** Desired monthly income (inflation-adjusted) */
  desiredMonthlyIncome: number

  /** Statutory pension (net, annual) */
  statutoryPensionNet: number

  /** Statutory pension as % of desired income */
  pensionCoveragePercentage: number

  /** Portfolio withdrawal amount (annual) */
  portfolioWithdrawal: number

  /** Portfolio withdrawal as % of desired income */
  portfolioWithdrawalPercentage: number

  /** Other income (net, annual) */
  otherIncome: number

  /** Other income as % of desired income */
  otherIncomePercentage: number

  /** Health care insurance costs (annual) */
  healthCareInsurance: number

  /** Total available income (pension + portfolio + other - insurance) */
  totalAvailableIncome: number

  /** Pension gap (desired - available), positive = shortfall, negative = surplus */
  gap: number

  /** Gap as % of desired income */
  gapPercentage: number

  /** Whether income covers desired lifestyle (gap <= 0) */
  isLifestyleCovered: boolean

  /** Inflation adjustment factor applied to desired income */
  inflationAdjustmentFactor: number
}

/**
 * Complete pension gap analysis result across all years
 */
export interface PensionGapAnalysisResult {
  /** Year-by-year breakdown */
  yearlyResults: YearlyPensionGapResult[]

  /** Summary statistics */
  summary: {
    /** Average pension coverage % across all years */
    averagePensionCoverage: number

    /** Average portfolio withdrawal % across all years */
    averagePortfolioWithdrawal: number

    /** Years where lifestyle is fully covered */
    yearsCovered: number

    /** Years with income shortfall */
    yearsWithGap: number

    /** Total years analyzed */
    totalYears: number

    /** Average gap amount (only for years with gap > 0) */
    averageGapAmount: number

    /** Maximum gap amount across all years */
    maxGapAmount: number

    /** Year with maximum gap */
    maxGapYear: number | null
  }
}

/**
 * Calculate inflation-adjusted desired income for a specific year
 */
export function calculateInflationAdjustedIncome(
  baseIncome: number,
  currentYear: number,
  baseYear: number,
  inflationRate: number,
): number {
  const yearsDifference = currentYear - baseYear
  const adjustmentFactor = Math.pow(1 + inflationRate / 100, yearsDifference)
  return baseIncome * adjustmentFactor
}

/**
 * Calculate pension gap for a single year
 */
export function calculateYearlyPensionGap(
  year: number,
  incomeSources: YearlyIncomeSources,
  config: RetirementLifestyleConfig,
): YearlyPensionGapResult {
  // Calculate inflation adjustment factor
  const baseYear = config.baseYear || year
  const inflationRate = config.inflationRate || 2.0
  const inflationAdjustmentFactor =
    config.applyInflationAdjustment && baseYear !== year ? Math.pow(1 + inflationRate / 100, year - baseYear) : 1.0

  // Calculate desired income (inflation-adjusted)
  const desiredAnnualIncome = config.desiredMonthlyIncome * 12 * inflationAdjustmentFactor
  const desiredMonthlyIncome = config.desiredMonthlyIncome * inflationAdjustmentFactor

  // Calculate income components
  const statutoryPensionNet = incomeSources.statutoryPensionNet
  const portfolioWithdrawal = incomeSources.portfolioWithdrawal
  const otherIncome = incomeSources.otherIncome
  const healthCareInsurance = incomeSources.healthCareInsurance

  // Total available income = pension + portfolio + other - insurance
  const totalAvailableIncome = statutoryPensionNet + portfolioWithdrawal + otherIncome - healthCareInsurance

  // Calculate gap
  const gap = desiredAnnualIncome - totalAvailableIncome

  // Calculate percentages (avoid division by zero)
  const calculatePercentage = (value: number) => (desiredAnnualIncome > 0 ? (value / desiredAnnualIncome) * 100 : 0)

  const pensionCoveragePercentage = calculatePercentage(statutoryPensionNet)
  const portfolioWithdrawalPercentage = calculatePercentage(portfolioWithdrawal)
  const otherIncomePercentage = calculatePercentage(otherIncome)
  const gapPercentage = calculatePercentage(gap)

  return {
    year,
    desiredAnnualIncome,
    desiredMonthlyIncome,
    statutoryPensionNet,
    pensionCoveragePercentage,
    portfolioWithdrawal,
    portfolioWithdrawalPercentage,
    otherIncome,
    otherIncomePercentage,
    healthCareInsurance,
    totalAvailableIncome,
    gap,
    gapPercentage,
    isLifestyleCovered: gap <= 0,
    inflationAdjustmentFactor,
  }
}

/**
 * Calculate pension gap analysis across multiple years
 */
export function calculatePensionGapAnalysis(
  incomeSources: YearlyIncomeSources[],
  config: RetirementLifestyleConfig,
): PensionGapAnalysisResult {
  // Calculate yearly results
  const yearlyResults = incomeSources.map(sources => calculateYearlyPensionGap(sources.year, sources, config))

  // Calculate summary statistics
  const totalYears = yearlyResults.length

  if (totalYears === 0) {
    return {
      yearlyResults: [],
      summary: {
        averagePensionCoverage: 0,
        averagePortfolioWithdrawal: 0,
        yearsCovered: 0,
        yearsWithGap: 0,
        totalYears: 0,
        averageGapAmount: 0,
        maxGapAmount: 0,
        maxGapYear: null,
      },
    }
  }

  // Sum coverage percentages
  const totalPensionCoverage = yearlyResults.reduce((sum, result) => sum + result.pensionCoveragePercentage, 0)
  const totalPortfolioWithdrawal = yearlyResults.reduce((sum, result) => sum + result.portfolioWithdrawalPercentage, 0)

  // Count years
  const yearsCovered = yearlyResults.filter(result => result.isLifestyleCovered).length
  const yearsWithGap = yearlyResults.filter(result => result.gap > 0).length

  // Calculate gap statistics
  const gapAmounts = yearlyResults.filter(result => result.gap > 0).map(result => result.gap)
  const averageGapAmount = gapAmounts.length > 0 ? gapAmounts.reduce((sum, gap) => sum + gap, 0) / gapAmounts.length : 0

  // Find maximum gap
  const maxGapResult = yearlyResults.reduce((max, result) => (result.gap > max.gap ? result : max), yearlyResults[0])

  return {
    yearlyResults,
    summary: {
      averagePensionCoverage: totalPensionCoverage / totalYears,
      averagePortfolioWithdrawal: totalPortfolioWithdrawal / totalYears,
      yearsCovered,
      yearsWithGap,
      totalYears,
      averageGapAmount,
      maxGapAmount: maxGapResult.gap,
      maxGapYear: maxGapResult.gap > 0 ? maxGapResult.year : null,
    },
  }
}

/**
 * Create default retirement lifestyle configuration
 */
export function createDefaultRetirementLifestyleConfig(): RetirementLifestyleConfig {
  return {
    desiredMonthlyIncome: 2500, // 2,500 EUR per month
    applyInflationAdjustment: true,
    inflationRate: 2.0, // 2% annual inflation
  }
}

/**
 * Estimate desired retirement income based on current income
 * Typically 70-80% of pre-retirement income
 */
export function estimateDesiredRetirementIncome(
  currentMonthlyIncome: number,
  replacementRate = 75,
): RetirementLifestyleConfig {
  return {
    desiredMonthlyIncome: currentMonthlyIncome * (replacementRate / 100),
    applyInflationAdjustment: true,
    inflationRate: 2.0,
  }
}
