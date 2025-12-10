/**
 * Helper functions for insurance cost overview and optimization
 * 
 * Provides aggregation and analysis of all insurance costs across:
 * - Health care insurance (Kranken- und Pflegeversicherung)
 * - Term life insurance (Risikolebensversicherung)
 * - Disability insurance (BU-Rente)
 * - Long-term care insurance (Pflegezusatzversicherung)
 * - Capital life insurance (Kapitallebensversicherung)
 * 
 * This helps users understand their total insurance burden and identify
 * optimization opportunities.
 */

import type { HealthCareInsuranceConfig } from './health-care-insurance'
import type { TermLifeInsuranceConfig } from './term-life-insurance'
import type { OtherIncomeSource } from './other-income'

/**
 * Insurance type for categorization
 */
export type InsuranceCategory = 
  | 'health' 
  | 'life' 
  | 'disability' 
  | 'care' 
  | 'other'

/**
 * Individual insurance cost entry for a specific year
 */
export interface InsuranceCostEntry {
  /** Insurance category */
  category: InsuranceCategory
  
  /** Display name of the insurance */
  name: string
  
  /** Year for this cost */
  year: number
  
  /** Annual cost in EUR */
  annualCost: number
  
  /** Coverage/benefit amount in EUR */
  coverageAmount?: number
  
  /** Whether this insurance is active/enabled */
  enabled: boolean
}

/**
 * Aggregated insurance costs for a specific year
 */
export interface YearlyInsuranceCosts {
  /** Year */
  year: number
  
  /** Total cost across all insurances */
  totalCost: number
  
  /** Cost by category */
  costByCategory: Record<InsuranceCategory, number>
  
  /** Individual insurance entries */
  entries: InsuranceCostEntry[]
  
  /** Number of active insurances */
  activeInsuranceCount: number
}

/**
 * Overall insurance cost summary across all years
 */
export interface InsuranceCostSummary {
  /** Year-by-year costs */
  yearlyResults: YearlyInsuranceCosts[]
  
  /** Average annual cost across all years */
  averageAnnualCost: number
  
  /** Total cost across all years */
  totalCost: number
  
  /** Peak annual cost */
  peakAnnualCost: number
  
  /** Year with peak cost */
  peakCostYear: number
  
  /** Average costs by category */
  averageCostByCategory: Record<InsuranceCategory, number>
  
  /** List of all insurance types present */
  insuranceTypes: string[]
}

/**
 * Calculate private health insurance annual cost
 */
function calculatePrivateHealthInsuranceCost(config: HealthCareInsuranceConfig): number {
  let annualCost = (config.privateHealthInsuranceMonthly || 0) * 12
  
  if (config.privateCareInsuranceMonthly) {
    annualCost += config.privateCareInsuranceMonthly * 12
  }
  
  return annualCost
}

/**
 * Calculate statutory health insurance annual cost
 */
function calculateStatutoryHealthInsuranceCost(config: HealthCareInsuranceConfig): number {
  const estimatedBase = config.statutoryMinimumIncomeBase || 18000
  const healthRate = config.statutoryHealthInsuranceRate || 0.146
  const careRate = config.statutoryCareInsuranceRate || 0.0305
  
  return estimatedBase * (healthRate + careRate)
}

/**
 * Calculate health care insurance costs for a year
 */
export function calculateHealthCareInsuranceCost(
  config: HealthCareInsuranceConfig | undefined,
  year: number,
): InsuranceCostEntry | null {
  if (!config?.enabled) {
    return null
  }

  const annualCost = config.insuranceType === 'private' 
    ? calculatePrivateHealthInsuranceCost(config)
    : calculateStatutoryHealthInsuranceCost(config)

  return {
    category: 'health',
    name: config.insuranceType === 'private' ? 'Private Krankenversicherung' : 'Gesetzliche Krankenversicherung',
    year,
    annualCost,
    enabled: true,
  }
}

/**
 * Calculate base premium rate per 1000 EUR coverage based on age
 */
function getBasePremiumRateByAge(age: number): number {
  if (age < 30) return 0.3
  if (age < 40) return 0.5
  if (age < 50) return 1.0
  if (age < 60) return 2.5
  return 5.0
}

/**
 * Get adjustment factor for health status
 */
function getHealthStatusFactor(healthStatus: string): number {
  const factors: Record<string, number> = {
    excellent: 0.7,
    good: 0.9,
    average: 1.0,
    fair: 1.3,
    poor: 1.8,
  }
  return factors[healthStatus] || 1.0
}

/**
 * Get adjustment factor for smoking status
 */
function getSmokingStatusFactor(smokingStatus: string): number {
  const factors: Record<string, number> = {
    'non-smoker': 1.0,
    'former-smoker': 1.2,
    smoker: 1.8,
  }
  return factors[smokingStatus] || 1.0
}

/**
 * Calculate coverage amount for a given year
 */
function calculateCoverageForYear(
  config: TermLifeInsuranceConfig,
  year: number,
): number {
  if (config.coverageType === 'level') {
    return config.coverageAmount
  }
  
  const yearsIntoPolicy = year - config.startYear
  const decreaseFactor = Math.pow(1 - config.annualDecreasePercent / 100, yearsIntoPolicy)
  return config.coverageAmount * decreaseFactor
}

/**
 * Calculate term life insurance costs for a year
 */
export function calculateTermLifeInsuranceCost(
  config: TermLifeInsuranceConfig | undefined,
  year: number,
): InsuranceCostEntry | null {
  if (!config?.enabled || year < config.startYear || year > config.endYear) {
    return null
  }

  const age = year - config.birthYear
  const coverageAmount = calculateCoverageForYear(config, year)

  // Calculate base rate with all adjustment factors
  let baseRatePer1000 = getBasePremiumRateByAge(age)
  
  if (config.gender === 'female') {
    baseRatePer1000 *= 0.8
  }
  
  baseRatePer1000 *= getHealthStatusFactor(config.healthStatus)
  baseRatePer1000 *= getSmokingStatusFactor(config.smokingStatus)
  
  const annualPremium = (coverageAmount / 1000) * baseRatePer1000

  return {
    category: 'life',
    name: config.name || 'Risikolebensversicherung',
    year,
    annualCost: annualPremium,
    coverageAmount,
    enabled: true,
  }
}

/**
 * Extract insurance costs from other income sources
 * Note: In the current implementation, insurance costs from other income sources
 * are not directly available since OtherIncomeSource tracks benefits, not premiums.
 * This function is provided for future extensibility.
 */
export function extractInsuranceCostsFromOtherIncome(
  _otherIncomeSources: OtherIncomeSource[] | undefined,
  _year: number,
): InsuranceCostEntry[] {
  // Currently, OtherIncomeSource does not expose insurance premiums
  // This is a placeholder for future implementation when insurance costs
  // can be tracked through the other income system
  
  // Note: BU-Rente (disability insurance) is typically a benefit, not a cost
  // Kapitallebensversicherung premiums are also typically paid during savings phase
  // Pflegezusatzversicherung premiums would need to be added to the OtherIncomeSource config

  return []
}

/**
 * Calculate total insurance costs for a specific year
 */
export function calculateYearlyInsuranceCosts(
  year: number,
  healthCareConfig: HealthCareInsuranceConfig | undefined,
  termLifeConfig: TermLifeInsuranceConfig | undefined,
  otherIncomeSources: OtherIncomeSource[] | undefined,
): YearlyInsuranceCosts {
  const entries: InsuranceCostEntry[] = []

  // Add health care insurance
  const healthCost = calculateHealthCareInsuranceCost(healthCareConfig, year)
  if (healthCost) {
    entries.push(healthCost)
  }

  // Add term life insurance
  const termLifeCost = calculateTermLifeInsuranceCost(termLifeConfig, year)
  if (termLifeCost) {
    entries.push(termLifeCost)
  }

  // Add other insurance costs
  const otherCosts = extractInsuranceCostsFromOtherIncome(otherIncomeSources, year)
  entries.push(...otherCosts)

  // Calculate totals
  const totalCost = entries.reduce((sum, entry) => sum + entry.annualCost, 0)
  
  const costByCategory: Record<InsuranceCategory, number> = {
    health: 0,
    life: 0,
    disability: 0,
    care: 0,
    other: 0,
  }
  
  for (const entry of entries) {
    costByCategory[entry.category] += entry.annualCost
  }

  return {
    year,
    totalCost,
    costByCategory,
    entries,
    activeInsuranceCount: entries.filter(e => e.enabled).length,
  }
}

/**
 * Calculate summary totals from yearly results
 */
function calculateSummaryTotals(yearlyResults: YearlyInsuranceCosts[]) {
  const totalCost = yearlyResults.reduce((sum, yr) => sum + yr.totalCost, 0)
  const averageAnnualCost = yearlyResults.length > 0 ? totalCost / yearlyResults.length : 0
  
  let peakAnnualCost = 0
  let peakCostYear = yearlyResults[0]?.year || 0
  
  for (const yr of yearlyResults) {
    if (yr.totalCost > peakAnnualCost) {
      peakAnnualCost = yr.totalCost
      peakCostYear = yr.year
    }
  }
  
  return { totalCost, averageAnnualCost, peakAnnualCost, peakCostYear }
}

/**
 * Calculate average costs by category
 */
function calculateAverageCostsByCategory(
  yearlyResults: YearlyInsuranceCosts[],
): Record<InsuranceCategory, number> {
  const averageCostByCategory: Record<InsuranceCategory, number> = {
    health: 0,
    life: 0,
    disability: 0,
    care: 0,
    other: 0,
  }

  if (yearlyResults.length === 0) {
    return averageCostByCategory
  }

  for (const category of Object.keys(averageCostByCategory) as InsuranceCategory[]) {
    const total = yearlyResults.reduce((sum, yr) => sum + yr.costByCategory[category], 0)
    averageCostByCategory[category] = total / yearlyResults.length
  }

  return averageCostByCategory
}

/**
 * Collect all unique insurance types from yearly results
 */
function collectInsuranceTypes(yearlyResults: YearlyInsuranceCosts[]): string[] {
  const insuranceTypesSet = new Set<string>()
  for (const yr of yearlyResults) {
    for (const entry of yr.entries) {
      insuranceTypesSet.add(entry.name)
    }
  }
  return Array.from(insuranceTypesSet)
}

/**
 * Calculate insurance cost summary across a range of years
 */
export function calculateInsuranceCostSummary(
  startYear: number,
  endYear: number,
  healthCareConfig: HealthCareInsuranceConfig | undefined,
  termLifeConfig: TermLifeInsuranceConfig | undefined,
  otherIncomeSources: OtherIncomeSource[] | undefined,
): InsuranceCostSummary {
  const yearlyResults: YearlyInsuranceCosts[] = []
  
  for (let year = startYear; year <= endYear; year++) {
    yearlyResults.push(
      calculateYearlyInsuranceCosts(year, healthCareConfig, termLifeConfig, otherIncomeSources)
    )
  }

  const { totalCost, averageAnnualCost, peakAnnualCost, peakCostYear } = calculateSummaryTotals(yearlyResults)
  const averageCostByCategory = calculateAverageCostsByCategory(yearlyResults)
  const insuranceTypes = collectInsuranceTypes(yearlyResults)

  return {
    yearlyResults,
    averageAnnualCost,
    totalCost,
    peakAnnualCost,
    peakCostYear,
    averageCostByCategory,
    insuranceTypes,
  }
}

/**
 * Get optimization recommendations based on insurance costs
 */
export interface InsuranceOptimizationRecommendation {
  /** Severity level */
  level: 'info' | 'warning' | 'critical'
  
  /** Category this recommendation relates to */
  category: InsuranceCategory | 'general'
  
  /** Recommendation title */
  title: string
  
  /** Detailed recommendation text */
  message: string
}

/**
 * Generate optimization recommendations based on cost summary
 */
export function generateOptimizationRecommendations(
  summary: InsuranceCostSummary,
  withdrawalAmount?: number,
): InsuranceOptimizationRecommendation[] {
  const recommendations: InsuranceOptimizationRecommendation[] = []

  // Check if insurance costs are too high relative to withdrawal
  if (withdrawalAmount && summary.averageAnnualCost > withdrawalAmount * 0.3) {
    recommendations.push({
      level: 'warning',
      category: 'general',
      title: 'Hohe Versicherungskosten',
      message: `Ihre durchschnittlichen Versicherungskosten (${summary.averageAnnualCost.toFixed(0)} €/Jahr) machen mehr als 30% Ihrer geplanten Entnahmen aus. Prüfen Sie Optimierungsmöglichkeiten.`,
    })
  }

  // Check health insurance costs
  if (summary.averageCostByCategory.health > 8000) {
    recommendations.push({
      level: 'info',
      category: 'health',
      title: 'PKV-Kostenprüfung',
      message: 'Bei hohen PKV-Beiträgen im Alter kann ein Tarifwechsel innerhalb der PKV oder die Prüfung von Zusatzbausteinen sinnvoll sein.',
    })
  }

  // Check if term life insurance continues in retirement
  const retirementYears = summary.yearlyResults.filter(yr => yr.year >= 2040)
  const hasTermLifeInRetirement = retirementYears.some(yr => yr.costByCategory.life > 0)
  
  if (hasTermLifeInRetirement) {
    recommendations.push({
      level: 'info',
      category: 'life',
      title: 'Risikolebensversicherung im Ruhestand',
      message: 'Prüfen Sie, ob die Risikolebensversicherung im Ruhestand noch benötigt wird. Bei ausreichendem Vermögen kann auf Risikoabsicherung verzichtet werden.',
    })
  }

  // If no insurances configured, inform
  if (summary.insuranceTypes.length === 0) {
    recommendations.push({
      level: 'info',
      category: 'general',
      title: 'Keine Versicherungen konfiguriert',
      message: 'Sie haben noch keine Versicherungen in der Planung berücksichtigt. Krankenversicherung und ggf. Pflegeversicherung sollten in die Planung einbezogen werden.',
    })
  }

  return recommendations
}
