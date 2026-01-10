/**
 * Multi-Year Tax Allowance Optimization (Erweiterte Multi-Jahres Freibetrags-Optimierung)
 *
 * This module implements strategic distribution of capital gains realization and withdrawals
 * over multiple years to maximize tax efficiency by optimally utilizing the annual
 * Sparerpauschbetrag (tax allowance) according to German tax law.
 *
 * Key Features:
 * - Optimal timing of capital gains realization over 5/10/20 year horizons
 * - Maximization of annual Freibetrag utilization (Sparerpauschbetrag)
 * - Consideration of Vorabpauschale and other mandatory taxable income
 * - Concrete action recommendations: "Sell X€ in year Y to save Z€ in taxes"
 * - Integration with existing tax calculation infrastructure
 */

import { calculateVorabpauschale, getBasiszinsForYear } from './steuer'
import type { BasiszinsConfiguration } from '../src/services/bundesbank-api'

/**
 * Configuration for multi-year tax allowance optimization
 */
export interface MultiYearFreibetragOptimizationConfig {
  /** Total capital gains to be realized over the optimization period */
  totalCapitalGains: number

  /** Current portfolio value (Startwert für Vorabpauschale) */
  currentPortfolioValue: number

  /** Annual portfolio return rate (for Vorabpauschale calculation)
   * Set to 0 for retirement/withdrawal scenarios where portfolio is not growing
   */
  annualReturnRate: number

  /** Planning horizon in years (5, 10, or 20 typically) */
  optimizationHorizonYears: number

  /** Starting year for optimization */
  startYear: number

  /** Annual tax allowance per year (Sparerpauschbetrag) */
  freibetragPerYear: { [year: number]: number }

  /** German capital gains tax rate (typically 26.375% including Soli) */
  capitalGainsTaxRate: number

  /** Teilfreistellungsquote for funds (typically 30% for stock funds) */
  teilfreistellung: number

  /** Optional Basiszins configuration for accurate Vorabpauschale calculation */
  basiszinsConfiguration?: BasiszinsConfiguration

  /** Expected annual distributions/dividends (reduces available Freibetrag) */
  expectedAnnualDistributions?: number
}

/**
 * Entry in the optimization schedule
 */
export interface OptimizationScheduleEntry {
  year: number
  recommendedRealization: number
  availableFreibetrag: number
  vorabpauschale: number
  taxSavings: number
  cumulativeTaxSavings: number
}

/**
 * Result of multi-year optimization analysis
 */
export interface MultiYearOptimizationResult {
  /** Optimized capital gains realization schedule by year */
  optimalRealizationSchedule: OptimizationScheduleEntry[]

  /** Total tax savings compared to naive strategy (realizing everything immediately) */
  totalTaxSavings: number

  /** Percentage of tax savings relative to naive strategy */
  taxSavingsPercentage: number

  /** Summary of the optimization */
  summary: {
    naiveStrategyTax: number
    optimizedStrategyTax: number
    totalFreibetragUtilization: number
    averageFreibetragUtilizationRate: number
  }

  /** Concrete actionable recommendations */
  recommendations: string[]
}

/**
 * Calculate the naive strategy tax burden (realizing all gains immediately)
 */
function calculateNaiveStrategyTax(
  totalCapitalGains: number,
  freibetrag: number,
  capitalGainsTaxRate: number,
  teilfreistellung: number,
): number {
  // Apply Teilfreistellung
  const taxableGains = totalCapitalGains * (1 - teilfreistellung)

  // Subtract single-year Freibetrag
  const gainsAfterFreibetrag = Math.max(0, taxableGains - freibetrag)

  // Calculate tax
  return gainsAfterFreibetrag * capitalGainsTaxRate
}

/**
 * Calculate available Freibetrag for a year after accounting for Vorabpauschale and distributions
 */
function calculateAvailableFreibetrag(
  baseFreibetrag: number,
  vorabpauschale: number,
  distributions: number,
  teilfreistellung: number,
): number {
  // Vorabpauschale and distributions both reduce available Freibetrag
  const vorabpauschaleAfterTeilfreistellung = vorabpauschale * (1 - teilfreistellung)
  const distributionsAfterTeilfreistellung = distributions * (1 - teilfreistellung)

  const consumed = vorabpauschaleAfterTeilfreistellung + distributionsAfterTeilfreistellung
  return Math.max(0, baseFreibetrag - consumed)
}

/**
 * Build optimization schedule for a single year
 */
function buildYearScheduleEntry(
  year: number,
  baseFreibetrag: number,
  currentPortfolioValue: number,
  annualReturnRate: number,
  expectedAnnualDistributions: number,
  teilfreistellung: number,
  capitalGainsTaxRate: number,
  remainingGains: number,
  cumulativeTaxSavings: number,
  basiszinsConfiguration?: BasiszinsConfiguration,
): { entry: OptimizationScheduleEntry; newRemainingGains: number; newCumulativeTaxSavings: number } {
  // Calculate Vorabpauschale for this year
  const basiszins = getBasiszinsForYear(year, basiszinsConfiguration)
  const endValue = currentPortfolioValue * (1 + annualReturnRate)
  const vorabpauschale = calculateVorabpauschale(currentPortfolioValue, endValue, basiszins, 12)

  // Calculate available Freibetrag after mandatory deductions
  const availableFreibetrag = calculateAvailableFreibetrag(
    baseFreibetrag,
    vorabpauschale,
    expectedAnnualDistributions,
    teilfreistellung,
  )

  // Determine optimal realization for this year
  const grossGainsNeededForFreibetrag = availableFreibetrag / (1 - teilfreistellung)
  const recommendedRealization = Math.min(grossGainsNeededForFreibetrag, remainingGains)

  // Calculate tax savings for this year's realization
  const taxableRealization = recommendedRealization * (1 - teilfreistellung)
  const taxableAfterFreibetrag = Math.max(0, taxableRealization - availableFreibetrag)
  const taxPaid = taxableAfterFreibetrag * capitalGainsTaxRate

  // Compare to naive approach
  const naiveTaxForThisAmount = taxableRealization * capitalGainsTaxRate
  const taxSavings = naiveTaxForThisAmount - taxPaid
  const updatedCumulativeTaxSavings = cumulativeTaxSavings + taxSavings

  const entry: OptimizationScheduleEntry = {
    year,
    recommendedRealization,
    availableFreibetrag,
    vorabpauschale,
    taxSavings,
    cumulativeTaxSavings: updatedCumulativeTaxSavings,
  }

  return {
    entry,
    newRemainingGains: remainingGains - recommendedRealization,
    newCumulativeTaxSavings: updatedCumulativeTaxSavings,
  }
}

/**
 * Calculate optimization summary statistics
 */
function calculateOptimizationSummary(
  schedule: OptimizationScheduleEntry[],
  naiveStrategyTax: number,
  cumulativeTaxSavings: number,
  teilfreistellung: number,
): MultiYearOptimizationResult['summary'] {
  const optimizedStrategyTax = naiveStrategyTax - cumulativeTaxSavings

  const totalFreibetragUtilized = schedule.reduce((sum, entry) => {
    const utilized = Math.min(entry.recommendedRealization * (1 - teilfreistellung), entry.availableFreibetrag)
    return sum + utilized
  }, 0)

  const totalAvailableFreibetrag = schedule.reduce((sum, entry) => sum + entry.availableFreibetrag, 0)
  const averageFreibetragUtilizationRate =
    totalAvailableFreibetrag > 0 ? totalFreibetragUtilized / totalAvailableFreibetrag : 0

  return {
    naiveStrategyTax,
    optimizedStrategyTax,
    totalFreibetragUtilization: totalFreibetragUtilized,
    averageFreibetragUtilizationRate,
  }
}

/**
 * Build full optimization schedule
 */
function buildOptimizationSchedule(
  config: MultiYearFreibetragOptimizationConfig,
  firstYearFreibetrag: number,
): { schedule: OptimizationScheduleEntry[]; cumulativeTaxSavings: number; remainingGains: number } {
  const {
    totalCapitalGains,
    currentPortfolioValue,
    annualReturnRate,
    optimizationHorizonYears,
    startYear,
    freibetragPerYear,
    capitalGainsTaxRate,
    teilfreistellung,
    basiszinsConfiguration,
    expectedAnnualDistributions = 0,
  } = config

  let remainingGains = totalCapitalGains
  let cumulativeTaxSavings = 0
  const schedule: OptimizationScheduleEntry[] = []

  for (let yearOffset = 0; yearOffset < optimizationHorizonYears && remainingGains > 0; yearOffset++) {
    const year = startYear + yearOffset
    const baseFreibetrag = freibetragPerYear[year] || firstYearFreibetrag

    const result = buildYearScheduleEntry(
      year,
      baseFreibetrag,
      currentPortfolioValue,
      annualReturnRate,
      expectedAnnualDistributions,
      teilfreistellung,
      capitalGainsTaxRate,
      remainingGains,
      cumulativeTaxSavings,
      basiszinsConfiguration,
    )

    schedule.push(result.entry)
    remainingGains = result.newRemainingGains
    cumulativeTaxSavings = result.newCumulativeTaxSavings
  }

  return { schedule, cumulativeTaxSavings, remainingGains }
}

/**
 * Optimize capital gains realization over multiple years
 *
 * The algorithm uses a greedy approach that prioritizes:
 * 1. Full utilization of available Freibetrag each year
 * 2. Distribution of gains to avoid exceeding Freibetrag in any single year
 * 3. Earlier realization when Freibetrag is available (time value of money)
 *
 * @param config - Optimization configuration
 * @returns Detailed optimization results with recommendations
 */
export function optimizeMultiYearFreibetrag(
  config: MultiYearFreibetragOptimizationConfig,
): MultiYearOptimizationResult {
  const { totalCapitalGains, startYear, freibetragPerYear, capitalGainsTaxRate, teilfreistellung } = config

  // Calculate naive strategy tax (baseline for comparison)
  const firstYearFreibetrag = freibetragPerYear[startYear] || 2000
  const naiveStrategyTax = calculateNaiveStrategyTax(
    totalCapitalGains,
    firstYearFreibetrag,
    capitalGainsTaxRate,
    teilfreistellung,
  )

  // Build optimization schedule
  const { schedule, cumulativeTaxSavings, remainingGains } = buildOptimizationSchedule(config, firstYearFreibetrag)

  // Calculate summary statistics
  const summary = calculateOptimizationSummary(schedule, naiveStrategyTax, cumulativeTaxSavings, teilfreistellung)

  // Generate actionable recommendations
  const recommendations = generateRecommendations(schedule, remainingGains)

  return {
    optimalRealizationSchedule: schedule,
    totalTaxSavings: cumulativeTaxSavings,
    taxSavingsPercentage: naiveStrategyTax > 0 ? (cumulativeTaxSavings / naiveStrategyTax) * 100 : 0,
    summary,
    recommendations,
  }
}

/**
 * Generate concrete actionable recommendations from optimization results
 */
function generateRecommendations(schedule: OptimizationScheduleEntry[], remainingGains: number): string[] {
  const recommendations: string[] = []

  // Add year-by-year recommendations
  schedule.forEach(entry => {
    if (entry.recommendedRealization > 0) {
      const formattedAmount = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(entry.recommendedRealization)

      const formattedSavings = new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: 'EUR',
        maximumFractionDigits: 0,
      }).format(entry.taxSavings)

      if (entry.taxSavings > 0) {
        recommendations.push(
          `${entry.year}: Realisieren Sie ${formattedAmount} an Kapitalgewinnen, um ${formattedSavings} Steuern zu sparen`,
        )
      } else {
        recommendations.push(`${entry.year}: Realisieren Sie ${formattedAmount} an Kapitalgewinnen (Freibetrag-optimiert)`)
      }
    }
  })

  // Warn if not all gains can be optimally distributed
  if (remainingGains > 1) {
    const formattedRemaining = new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(remainingGains)

    recommendations.push(
      `⚠️ Warnung: ${formattedRemaining} an Gewinnen können nicht optimal über den gewählten Zeitraum verteilt werden. Erwägen Sie einen längeren Optimierungszeitraum.`,
    )
  }

  return recommendations
}

/**
 * Horizon comparison entry
 */
export interface HorizonComparisonEntry {
  years: number
  taxSavings: number
  utilizationRate: number
}

/**
 * Calculate potential tax savings for different optimization horizons
 * Useful for comparing 5-year vs 10-year vs 20-year strategies
 */
export function compareFreibetragOptimizationHorizons(
  baseConfig: Omit<MultiYearFreibetragOptimizationConfig, 'optimizationHorizonYears'>,
): {
  horizons: HorizonComparisonEntry[]
  recommendedHorizon: number
} {
  const horizons = [5, 10, 20]

  const results = horizons.map(years => {
    const result = optimizeMultiYearFreibetrag({
      ...baseConfig,
      optimizationHorizonYears: years,
    })

    return {
      years,
      taxSavings: result.totalTaxSavings,
      utilizationRate: result.summary.averageFreibetragUtilizationRate,
    }
  })

  // Recommend the horizon with best tax savings per year
  const bestHorizon = results.reduce((best, current) => {
    const currentSavingsPerYear = current.taxSavings / current.years
    const bestSavingsPerYear = best.taxSavings / best.years
    return currentSavingsPerYear > bestSavingsPerYear ? current : best
  })

  return {
    horizons: results,
    recommendedHorizon: bestHorizon.years,
  }
}
