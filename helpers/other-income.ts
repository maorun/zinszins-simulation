/**
 * Types and utilities for other income sources (Andere Einkünfte)
 * This includes rental income, pension, side business income, etc.
 */

/**
 * Type of income source
 */
export type IncomeType = 'rental' | 'pension' | 'business' | 'investment' | 'other'

/**
 * Whether the income amount is gross or net
 */
export type IncomeAmountType = 'gross' | 'net'

/**
 * Configuration for a single other income source
 */
export interface OtherIncomeSource {
  /** Unique identifier for this income source */
  id: string

  /** Display name for this income source */
  name: string

  /** Type of income */
  type: IncomeType

  /** Whether the amount is gross or net */
  amountType: IncomeAmountType

  /** Monthly amount in EUR */
  monthlyAmount: number

  /** Starting year for this income */
  startYear: number

  /** Optional ending year for this income (null = permanent) */
  endYear: number | null

  /** Annual increase rate for inflation adjustment (default: 2% inflation) */
  inflationRate: number

  /** Tax rate applied to this income (for gross amounts) */
  taxRate: number

  /** Whether this income is enabled in calculations */
  enabled: boolean

  /** Optional notes/description */
  notes?: string
}

/**
 * Result of other income calculation for a specific year
 */
export interface OtherIncomeYearResult {
  /** Income source configuration */
  source: OtherIncomeSource

  /** Total annual amount (before taxes if gross) */
  grossAnnualAmount: number

  /** Monthly amount (before taxes if gross) */
  grossMonthlyAmount: number

  /** Tax amount (only for gross income) */
  taxAmount: number

  /** Net annual amount after taxes */
  netAnnualAmount: number

  /** Net monthly amount after taxes */
  netMonthlyAmount: number

  /** Inflation adjustment factor applied this year */
  inflationFactor: number
}

/**
 * Complete other income calculation result across years for all sources
 */
export interface OtherIncomeResult {
  [year: number]: {
    /** Results for each income source */
    sources: OtherIncomeYearResult[]
    /** Total net annual income from all sources */
    totalNetAnnualAmount: number
    /** Total tax amount from all sources */
    totalTaxAmount: number
  }
}

/**
 * Configuration for all other income sources
 */
export interface OtherIncomeConfiguration {
  /** Whether other income sources are enabled */
  enabled: boolean

  /** List of configured income sources */
  sources: OtherIncomeSource[]
}

/**
 * Calculate other income for a specific source and year
 */
export function calculateOtherIncomeForYear(
  source: OtherIncomeSource,
  year: number,
): OtherIncomeYearResult | null {
  // Check if this income source is active for this year
  if (!source.enabled || year < source.startYear || (source.endYear && year > source.endYear)) {
    return null
  }

  // Calculate inflation adjustment
  const yearsFromStart = year - source.startYear
  const inflationFactor = Math.pow(1 + source.inflationRate / 100, yearsFromStart)

  // Calculate gross amounts with inflation adjustment
  const grossMonthlyAmount = source.monthlyAmount * inflationFactor
  const grossAnnualAmount = grossMonthlyAmount * 12

  let taxAmount = 0
  let netAnnualAmount = grossAnnualAmount
  let netMonthlyAmount = grossMonthlyAmount

  // Apply taxes if this is gross income
  if (source.amountType === 'gross') {
    taxAmount = grossAnnualAmount * (source.taxRate / 100)
    netAnnualAmount = grossAnnualAmount - taxAmount
    netMonthlyAmount = netAnnualAmount / 12
  }

  return {
    source,
    grossAnnualAmount,
    grossMonthlyAmount,
    taxAmount,
    netAnnualAmount,
    netMonthlyAmount,
    inflationFactor,
  }
}

/**
 * Calculate other income across multiple years for all sources
 */
export function calculateOtherIncome(
  config: OtherIncomeConfiguration,
  startYear: number,
  endYear: number,
): OtherIncomeResult {
  const result: OtherIncomeResult = {}

  if (!config.enabled || !config.sources.length) {
    return result
  }

  for (let year = startYear; year <= endYear; year++) {
    const sources: OtherIncomeYearResult[] = []
    let totalNetAnnualAmount = 0
    let totalTaxAmount = 0

    // Calculate for each income source
    for (const source of config.sources) {
      const yearResult = calculateOtherIncomeForYear(source, year)
      if (yearResult) {
        sources.push(yearResult)
        totalNetAnnualAmount += yearResult.netAnnualAmount
        totalTaxAmount += yearResult.taxAmount
      }
    }

    result[year] = {
      sources,
      totalNetAnnualAmount,
      totalTaxAmount,
    }
  }

  return result
}

/**
 * Create a default other income source
 */
export function createDefaultOtherIncomeSource(): OtherIncomeSource {
  return {
    id: generateId(),
    name: 'Mieteinnahmen',
    type: 'rental',
    amountType: 'gross',
    monthlyAmount: 1000,
    startYear: new Date().getFullYear(),
    endYear: null, // Permanent by default
    inflationRate: 2.0, // 2% inflation adjustment
    taxRate: 30.0, // 30% tax rate for gross income
    enabled: true,
    notes: '',
  }
}

/**
 * Generate a unique ID for income sources
 */
function generateId(): string {
  return `income_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

/**
 * Get display name for income type
 */
export function getIncomeTypeDisplayName(type: IncomeType): string {
  const names = {
    rental: 'Mieteinnahmen',
    pension: 'Rente/Pension',
    business: 'Gewerbeeinkünfte',
    investment: 'Kapitalerträge',
    other: 'Sonstige Einkünfte',
  }
  return names[type] || type
}

/**
 * Get display name for amount type
 */
export function getAmountTypeDisplayName(amountType: IncomeAmountType): string {
  return amountType === 'gross' ? 'Brutto' : 'Netto'
}
