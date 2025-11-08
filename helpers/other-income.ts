/**
 * Types and utilities for other income sources (Andere Einkünfte)
 * This includes rental income, pension, side business income, etc.
 */

/**
 * Type of income source
 */
export type IncomeType = 'rental' | 'pension' | 'business' | 'investment' | 'kindergeld' | 'bu_rente' | 'other'

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
 * BU-Rente (Disability Insurance) specific configuration
 */
export interface BURenteConfig {
  /** Year when disability starts */
  disabilityStartYear: number

  /** Year when disability ends (null = permanent disability until retirement) */
  disabilityEndYear: number | null

  /** Birth year of the insured person (for age-based taxation) */
  birthYear: number

  /** Disability degree in percent (0-100%, for documentation purposes) */
  disabilityDegree: number

  /** Whether to apply special tax treatment for disability pensions (Leibrenten-Besteuerung) */
  applyLeibrentenBesteuerung: boolean

  /** Age when BU benefits started (used for Ertragsanteil calculation) */
  ageAtDisabilityStart: number
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

  /** BU-Rente-specific configuration (only for bu_rente income) */
  buRenteConfig?: BURenteConfig
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

  /** BU-Rente-specific calculations (only for bu_rente income) */
  buRenteDetails?: {
    /** Person's age this year */
    age: number
    /** Whether BU benefits are active */
    isActive: boolean
    /** Tax-free portion (Ertragsanteil) percentage */
    ertragsanteilPercent: number
    /** Taxable amount based on Leibrenten-Besteuerung */
    taxableAmount: number
    /** Reason if BU benefits ended */
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
// Helper: Check if income source is active for year
function isIncomeActiveForYear(source: OtherIncomeSource, year: number): boolean {
  return source.enabled && year >= source.startYear && (!source.endYear || year <= source.endYear)
}

// Helper: Calculate rental income details
function calculateRealEstateIncome(
  config: RealEstateConfig,
  grossAnnualAmount: number,
  yearsFromStart: number,
): { netIncome: number; details: OtherIncomeYearResult['realEstateDetails'] } {
  const vacancyLoss = grossAnnualAmount * (config.vacancyRatePercent / 100)
  const incomeAfterVacancy = grossAnnualAmount - vacancyLoss
  const maintenanceCosts = grossAnnualAmount * (config.maintenanceCostPercent / 100)
  const annualMortgagePayment = config.monthlyMortgagePayment * 12
  const netRentalIncome = incomeAfterVacancy - maintenanceCosts - annualMortgagePayment

  const appreciationFactor = Math.pow(1 + config.propertyAppreciationRate / 100, yearsFromStart)
  const currentPropertyValue = config.propertyValue * appreciationFactor
  const previousValue =
    yearsFromStart > 0
      ? config.propertyValue * Math.pow(1 + config.propertyAppreciationRate / 100, yearsFromStart - 1)
      : config.propertyValue
  const annualAppreciation = config.includeAppreciation ? currentPropertyValue - previousValue : 0

  return {
    netIncome: Math.max(0, netRentalIncome),
    details: {
      maintenanceCosts,
      vacancyLoss,
      propertyValue: currentPropertyValue,
      annualAppreciation,
      netRentalIncome: Math.max(0, netRentalIncome),
    },
  }
}

// Helper: Calculate Kindergeld status
function calculateKindergeldStatus(
  config: KindergeldConfig,
  year: number,
): { isActive: boolean; childAge: number; endReason?: string } {
  const childAge = year - config.childBirthYear
  let isActive = true
  let endReason: string | undefined

  if (childAge < 0) {
    isActive = false
    endReason = 'Kind noch nicht geboren'
  } else if (childAge >= 18 && !config.inEducation) {
    isActive = false
    endReason = 'Kind ist 18 oder älter (nicht in Ausbildung)'
  } else if (childAge >= 25) {
    isActive = false
    endReason = 'Kind ist 25 oder älter'
  }

  return { isActive, childAge, endReason }
}

// Helper: Get Ertragsanteil (taxable portion) for BU-Rente based on age at disability start
// Based on § 22 EStG - Leibrenten-Besteuerung
// eslint-disable-next-line complexity
function getErtragsanteil(ageAtDisabilityStart: number): number {
  // Ertragsanteil table according to § 22 Nr. 1 Satz 3 Buchstabe a Doppelbuchstabe bb EStG
  // Returns the percentage of the pension that is subject to taxation
  if (ageAtDisabilityStart <= 0) return 59 // Age 0-1
  if (ageAtDisabilityStart <= 1) return 59
  if (ageAtDisabilityStart <= 2) return 58
  if (ageAtDisabilityStart <= 3) return 57
  if (ageAtDisabilityStart <= 4) return 56
  if (ageAtDisabilityStart <= 5) return 55
  if (ageAtDisabilityStart <= 6) return 54
  if (ageAtDisabilityStart <= 7) return 53
  if (ageAtDisabilityStart <= 8) return 52
  if (ageAtDisabilityStart <= 9) return 51
  if (ageAtDisabilityStart <= 10) return 50
  if (ageAtDisabilityStart <= 11) return 49
  if (ageAtDisabilityStart <= 12) return 48
  if (ageAtDisabilityStart <= 13) return 47
  if (ageAtDisabilityStart <= 14) return 46
  if (ageAtDisabilityStart <= 15) return 45
  if (ageAtDisabilityStart <= 16) return 44
  if (ageAtDisabilityStart <= 17) return 43
  if (ageAtDisabilityStart <= 27) return 42 // Ages 18-27
  if (ageAtDisabilityStart <= 31) return 40 // Ages 28-31
  if (ageAtDisabilityStart <= 36) return 38 // Ages 32-36
  if (ageAtDisabilityStart <= 41) return 36 // Ages 37-41
  if (ageAtDisabilityStart <= 46) return 34 // Ages 42-46
  if (ageAtDisabilityStart <= 51) return 32 // Ages 47-51
  if (ageAtDisabilityStart <= 56) return 30 // Ages 52-56
  if (ageAtDisabilityStart <= 61) return 28 // Ages 57-61
  if (ageAtDisabilityStart <= 63) return 26 // Ages 62-63
  if (ageAtDisabilityStart <= 64) return 25 // Age 64
  if (ageAtDisabilityStart <= 65) return 24 // Age 65
  if (ageAtDisabilityStart <= 66) return 23 // Age 66
  if (ageAtDisabilityStart <= 67) return 22 // Age 67
  return 21 // Age 68+
}

// Helper: Calculate BU-Rente status
function calculateBURenteStatus(
  config: BURenteConfig,
  year: number,
  grossAnnualAmount: number,
): {
  isActive: boolean
  age: number
  ertragsanteilPercent: number
  taxableAmount: number
  endReason?: string
} {
  const age = year - config.birthYear
  let isActive = true
  let endReason: string | undefined

  // Check if BU benefits have started
  if (year < config.disabilityStartYear) {
    isActive = false
    endReason = 'BU-Leistungen noch nicht begonnen'
  }
  // Check if BU benefits have ended
  else if (config.disabilityEndYear !== null && year > config.disabilityEndYear) {
    isActive = false
    endReason = 'BU-Leistungen beendet'
  }

  // Calculate taxable amount based on Leibrenten-Besteuerung
  const ertragsanteilPercent = config.applyLeibrentenBesteuerung ? getErtragsanteil(config.ageAtDisabilityStart) : 100

  // Only the Ertragsanteil is taxable, the rest is tax-free
  const taxableAmount = (grossAnnualAmount * ertragsanteilPercent) / 100

  return {
    isActive,
    age,
    ertragsanteilPercent,
    taxableAmount,
    endReason,
  }
}

function calculateGrossAmounts(
  source: OtherIncomeSource,
  yearsFromStart: number,
  inflationFactor: number,
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  realEstateDetails?: OtherIncomeYearResult['realEstateDetails']
  kindergeldDetails?: OtherIncomeYearResult['kindergeldDetails']
  buRenteDetails?: OtherIncomeYearResult['buRenteDetails']
} {
  let grossMonthlyAmount = source.monthlyAmount * inflationFactor
  let grossAnnualAmount = grossMonthlyAmount * 12
  let realEstateDetails: OtherIncomeYearResult['realEstateDetails']
  let kindergeldDetails: OtherIncomeYearResult['kindergeldDetails']
  let buRenteDetails: OtherIncomeYearResult['buRenteDetails']

  if (source.type === 'rental' && source.realEstateConfig) {
    const result = calculateRealEstateIncome(source.realEstateConfig, grossAnnualAmount, yearsFromStart)
    grossAnnualAmount = result.netIncome
    grossMonthlyAmount = grossAnnualAmount / 12
    realEstateDetails = result.details
  }

  return { grossMonthlyAmount, grossAnnualAmount, realEstateDetails, kindergeldDetails, buRenteDetails }
}

function applyKindergeldLogic(
  source: OtherIncomeSource,
  year: number,
  amounts: { grossMonthlyAmount: number; grossAnnualAmount: number },
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  kindergeldDetails?: OtherIncomeYearResult['kindergeldDetails']
} {
  if (source.type !== 'kindergeld' || !source.kindergeldConfig) {
    return amounts
  }

  const status = calculateKindergeldStatus(source.kindergeldConfig, year)
  if (!status.isActive) {
    return {
      grossMonthlyAmount: 0,
      grossAnnualAmount: 0,
      kindergeldDetails: status,
    }
  }

  return {
    ...amounts,
    kindergeldDetails: status,
  }
}

function applyBURenteLogic(
  source: OtherIncomeSource,
  year: number,
  amounts: { grossMonthlyAmount: number; grossAnnualAmount: number },
): {
  grossMonthlyAmount: number
  grossAnnualAmount: number
  buRenteDetails?: OtherIncomeYearResult['buRenteDetails']
} {
  if (source.type !== 'bu_rente' || !source.buRenteConfig) {
    return amounts
  }

  const status = calculateBURenteStatus(source.buRenteConfig, year, amounts.grossAnnualAmount)
  if (!status.isActive) {
    return {
      grossMonthlyAmount: 0,
      grossAnnualAmount: 0,
      buRenteDetails: status,
    }
  }

  return {
    ...amounts,
    buRenteDetails: status,
  }
}

function calculateTaxAndNet(
  source: OtherIncomeSource,
  grossAnnualAmount: number,
  buRenteDetails?: OtherIncomeYearResult['buRenteDetails'],
): { taxAmount: number; netAnnualAmount: number; netMonthlyAmount: number } {
  if (source.amountType !== 'gross') {
    return {
      taxAmount: 0,
      netAnnualAmount: grossAnnualAmount,
      netMonthlyAmount: grossAnnualAmount / 12,
    }
  }

  // For BU-Rente with Leibrenten-Besteuerung, only tax the Ertragsanteil
  let taxableAmount = grossAnnualAmount
  if (source.type === 'bu_rente' && buRenteDetails && source.buRenteConfig?.applyLeibrentenBesteuerung) {
    taxableAmount = buRenteDetails.taxableAmount
  }

  const taxAmount = taxableAmount * (source.taxRate / 100)
  const netAnnualAmount = grossAnnualAmount - taxAmount
  return {
    taxAmount,
    netAnnualAmount,
    netMonthlyAmount: netAnnualAmount / 12,
  }
}

export function calculateOtherIncomeForYear(source: OtherIncomeSource, year: number): OtherIncomeYearResult | null {
  if (!isIncomeActiveForYear(source, year)) {
    return null
  }

  const yearsFromStart = year - source.startYear
  const inflationFactor = Math.pow(1 + source.inflationRate / 100, yearsFromStart)

  const {
    grossMonthlyAmount: initialGrossMonthly,
    grossAnnualAmount: initialGrossAnnual,
    realEstateDetails,
  } = calculateGrossAmounts(source, yearsFromStart, inflationFactor)

  const kindergeldResult = applyKindergeldLogic(source, year, {
    grossMonthlyAmount: initialGrossMonthly,
    grossAnnualAmount: initialGrossAnnual,
  })

  const buRenteResult = applyBURenteLogic(source, year, {
    grossMonthlyAmount: kindergeldResult.grossMonthlyAmount,
    grossAnnualAmount: kindergeldResult.grossAnnualAmount,
  })

  const grossMonthlyAmount = buRenteResult.grossMonthlyAmount
  const grossAnnualAmount = buRenteResult.grossAnnualAmount
  const kindergeldDetails = kindergeldResult.kindergeldDetails
  const buRenteDetails = buRenteResult.buRenteDetails

  const { taxAmount, netAnnualAmount, netMonthlyAmount } = calculateTaxAndNet(source, grossAnnualAmount, buRenteDetails)

  const result: OtherIncomeYearResult = {
    source,
    grossAnnualAmount,
    grossMonthlyAmount,
    taxAmount,
    netAnnualAmount,
    netMonthlyAmount,
    inflationFactor,
  }

  if (realEstateDetails) result.realEstateDetails = realEstateDetails
  if (kindergeldDetails) result.kindergeldDetails = kindergeldDetails
  if (buRenteDetails) result.buRenteDetails = buRenteDetails

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
  if (type === 'bu_rente') return 1500
  return 800
}

/**
 * Get default amount type for income type
 */
function getDefaultAmountType(type: IncomeType): 'gross' | 'net' {
  if (type === 'kindergeld') return 'net'
  return 'gross'
}

/**
 * Get default inflation rate for income type
 */
function getDefaultInflationRate(type: IncomeType): number {
  if (type === 'kindergeld') return 0
  if (type === 'bu_rente') return 0 // BU-Rente typically has fixed amounts
  return 2.0
}

/**
 * Get default tax rate for income type
 */
function getDefaultTaxRate(type: IncomeType): number {
  if (type === 'kindergeld') return 0
  if (type === 'bu_rente') return 25.0 // Individual income tax rate (typical for disability pensions)
  return 30.0
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

  // Add default BU-Rente configuration
  if (type === 'bu_rente') {
    source.buRenteConfig = createDefaultBURenteConfig()
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
 * Create default BU-Rente configuration
 */
export function createDefaultBURenteConfig(): BURenteConfig {
  const currentYear = new Date().getFullYear()
  const defaultBirthYear = currentYear - 40 // 40 years old by default
  const disabilityStartYear = currentYear
  const ageAtDisabilityStart = disabilityStartYear - defaultBirthYear

  return {
    disabilityStartYear,
    disabilityEndYear: null, // Permanent disability by default
    birthYear: defaultBirthYear,
    disabilityDegree: 100, // 100% disability by default
    applyLeibrentenBesteuerung: true, // Apply special tax treatment by default
    ageAtDisabilityStart,
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
    bu_rente: 'BU-Rente',
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
    bu_rente: 'BU-Rente',
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
