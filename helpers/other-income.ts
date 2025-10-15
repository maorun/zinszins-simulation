/**
 * Types and utilities for other income sources (Andere Einkünfte)
 * This includes rental income, pension, side business income, etc.
 */

/**
 * Type of income source
 */
export type IncomeType = 'rental' | 'pension' | 'business' | 'investment' | 'kindergeld' | 'other'

/**
 * Real estate-specific configuration for rental income
 */
export interface RealEstateConfig {
  /** Annual maintenance costs as percentage of rental income */
  maintenanceCostPercent: number

  /** Expected vacancy rate as percentage (0-100) */
  vacancyRatePercent: number

  /** Annual property value appreciation rate */
  propertyAppreciationRate: number

  /** Property purchase price (for appreciation calculation) */
  propertyValue: number

  /** Monthly mortgage payment (if financed) */
  monthlyMortgagePayment: number

  /** Whether to include property appreciation in calculations */
  includeAppreciation: boolean
}

/**
 * Kindergeld-specific configuration
 */
export interface KindergeldConfig {
  /** Number of children receiving Kindergeld */
  numberOfChildren: number

  /** Birth year of the child (used to calculate when Kindergeld ends) */
  childBirthYear: number

  /** Whether the child is in education/training (extends Kindergeld until age 25) */
  inEducation: boolean

  /** Child order number (1st, 2nd, 3rd, etc.) - affects the amount */
  childOrderNumber: number
}

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

  /** Real estate-specific configuration (only for rental income) */
  realEstateConfig?: RealEstateConfig

  /** Kindergeld-specific configuration (only for kindergeld income) */
  kindergeldConfig?: KindergeldConfig
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

  /** Real estate-specific calculations (only for rental income) */
  realEstateDetails?: {
    /** Annual maintenance costs */
    maintenanceCosts: number
    /** Lost income due to vacancy */
    vacancyLoss: number
    /** Property value this year (with appreciation) */
    propertyValue: number
    /** Property appreciation this year */
    annualAppreciation: number
    /** Net rental income after all real estate costs */
    netRentalIncome: number
  }

  /** Kindergeld-specific calculations (only for kindergeld income) */
  kindergeldDetails?: {
    /** Child's age this year */
    childAge: number
    /** Whether Kindergeld is still being paid */
    isActive: boolean
    /** Reason if Kindergeld ended */
    endReason?: string
  }
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
  let grossMonthlyAmount = source.monthlyAmount * inflationFactor
  let grossAnnualAmount = grossMonthlyAmount * 12

  let realEstateDetails: OtherIncomeYearResult['realEstateDetails']

  // Apply real estate-specific calculations for rental income
  if (source.type === 'rental' && source.realEstateConfig) {
    const config = source.realEstateConfig

    // Calculate vacancy loss
    const vacancyLoss = grossAnnualAmount * (config.vacancyRatePercent / 100)
    const incomeAfterVacancy = grossAnnualAmount - vacancyLoss

    // Calculate maintenance costs
    const maintenanceCosts = grossAnnualAmount * (config.maintenanceCostPercent / 100)

    // Calculate mortgage payment impact
    const annualMortgagePayment = config.monthlyMortgagePayment * 12

    // Net rental income after all real estate costs
    const netRentalIncome = incomeAfterVacancy - maintenanceCosts - annualMortgagePayment

    // Calculate property appreciation
    const appreciationFactor = Math.pow(1 + config.propertyAppreciationRate / 100, yearsFromStart)
    const currentPropertyValue = config.propertyValue * appreciationFactor
    const annualAppreciation = config.includeAppreciation
      ? currentPropertyValue - (yearsFromStart > 0
        ? config.propertyValue * Math.pow(1 + config.propertyAppreciationRate / 100, yearsFromStart - 1)
        : config.propertyValue)
      : 0

    // Update gross amounts to reflect real estate costs
    grossAnnualAmount = Math.max(0, netRentalIncome)
    grossMonthlyAmount = grossAnnualAmount / 12

    realEstateDetails = {
      maintenanceCosts,
      vacancyLoss,
      propertyValue: currentPropertyValue,
      annualAppreciation,
      netRentalIncome: Math.max(0, netRentalIncome),
    }
  }

  let kindergeldDetails: OtherIncomeYearResult['kindergeldDetails']

  // Apply Kindergeld-specific calculations
  if (source.type === 'kindergeld' && source.kindergeldConfig) {
    const config = source.kindergeldConfig
    const childAge = year - config.childBirthYear

    // Determine if Kindergeld is still being paid based on age
    let isActive = true
    let endReason: string | undefined

    if (childAge < 0) {
      // Child not yet born
      isActive = false
      endReason = 'Kind noch nicht geboren'
    }
    else if (childAge >= 18 && !config.inEducation) {
      // Child is 18 or older and not in education
      isActive = false
      endReason = 'Kind ist 18 oder älter (nicht in Ausbildung)'
    }
    else if (childAge >= 25) {
      // Child is 25 or older (even in education)
      isActive = false
      endReason = 'Kind ist 25 oder älter'
    }

    kindergeldDetails = {
      childAge,
      isActive,
      endReason,
    }

    // If Kindergeld ended, set amounts to zero
    if (!isActive) {
      grossAnnualAmount = 0
      grossMonthlyAmount = 0
    }
  }

  let taxAmount = 0
  let netAnnualAmount = grossAnnualAmount
  let netMonthlyAmount = grossMonthlyAmount

  // Apply taxes if this is gross income
  if (source.amountType === 'gross') {
    taxAmount = grossAnnualAmount * (source.taxRate / 100)
    netAnnualAmount = grossAnnualAmount - taxAmount
    netMonthlyAmount = netAnnualAmount / 12
  }

  const result: OtherIncomeYearResult = {
    source,
    grossAnnualAmount,
    grossMonthlyAmount,
    taxAmount,
    netAnnualAmount,
    netMonthlyAmount,
    inflationFactor,
  }

  if (realEstateDetails) {
    result.realEstateDetails = realEstateDetails
  }

  if (kindergeldDetails) {
    result.kindergeldDetails = kindergeldDetails
  }

  return result
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
 * Get default monthly amount for income type
 */
function getDefaultMonthlyAmount(type: IncomeType): number {
  if (type === 'rental') return 1000
  if (type === 'kindergeld') return 250
  return 800
}

/**
 * Get default amount type for income type
 */
function getDefaultAmountType(type: IncomeType): 'gross' | 'net' {
  return type === 'kindergeld' ? 'net' : 'gross'
}

/**
 * Get default inflation rate for income type
 */
function getDefaultInflationRate(type: IncomeType): number {
  return type === 'kindergeld' ? 0 : 2.0
}

/**
 * Get default tax rate for income type
 */
function getDefaultTaxRate(type: IncomeType): number {
  return type === 'kindergeld' ? 0 : 30.0
}

/**
 * Create a default other income source
 */
export function createDefaultOtherIncomeSource(type: IncomeType = 'rental'): OtherIncomeSource {
  const currentYear = new Date().getFullYear()

  const source: OtherIncomeSource = {
    id: generateId(),
    name: getDefaultNameForType(type),
    type,
    amountType: getDefaultAmountType(type),
    monthlyAmount: getDefaultMonthlyAmount(type),
    startYear: currentYear,
    endYear: null, // Permanent by default
    inflationRate: getDefaultInflationRate(type),
    taxRate: getDefaultTaxRate(type),
    enabled: true,
    notes: '',
  }

  // Add default real estate configuration for rental income
  if (type === 'rental') {
    source.realEstateConfig = createDefaultRealEstateConfig()
  }

  // Add default Kindergeld configuration
  if (type === 'kindergeld') {
    source.kindergeldConfig = createDefaultKindergeldConfig()
  }

  return source
}

/**
 * Create default real estate configuration
 */
export function createDefaultRealEstateConfig(): RealEstateConfig {
  return {
    maintenanceCostPercent: 15.0, // 15% for maintenance and repairs
    vacancyRatePercent: 5.0, // 5% vacancy rate
    propertyAppreciationRate: 2.5, // 2.5% annual appreciation
    propertyValue: 300000, // 300k property value
    monthlyMortgagePayment: 0, // No mortgage by default
    includeAppreciation: false, // Don't include appreciation by default
  }
}

/**
 * Create default Kindergeld configuration
 */
export function createDefaultKindergeldConfig(): KindergeldConfig {
  const currentYear = new Date().getFullYear()

  return {
    numberOfChildren: 1,
    childBirthYear: currentYear, // Newborn by default
    inEducation: false, // Not yet in education (but will be considered when child reaches 18)
    childOrderNumber: 1, // First child by default
  }
}

/**
 * Get the monthly Kindergeld amount based on German law (as of 2024)
 * @param _childOrderNumber - The order of the child (1st, 2nd, 3rd, etc.)
 * @returns Monthly Kindergeld amount in EUR
 */
export function getKindergeldAmount(_childOrderNumber: number): number {
  // As of 2024, all children receive 250€/month
  // This is a simplification - historically amounts varied by child order
  return 250
}

/**
 * Get default name for income type
 */
function getDefaultNameForType(type: IncomeType): string {
  const names = {
    rental: 'Mieteinnahmen',
    pension: 'Private Rente',
    business: 'Gewerbeeinkünfte',
    investment: 'Kapitalerträge',
    kindergeld: 'Kindergeld',
    other: 'Sonstige Einkünfte',
  }
  return names[type] || 'Einkommen'
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
    kindergeld: 'Kindergeld',
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
