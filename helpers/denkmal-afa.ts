/**
 * Denkmal-AfA (Monument Protection Tax Benefits)
 *
 * This module implements tax calculations for listed buildings (denkmalgeschützte Immobilien)
 * according to § 7i EStG, providing enhanced depreciation rates and special deductions
 * for monument-compliant renovation costs.
 *
 * Legal Framework:
 * - § 7i EStG: Enhanced depreciation for listed buildings
 * - § 10f EStG: Special expenses for owner-occupied listed buildings (Eigennutzung)
 * - § 11a EStG: Monument protection certification requirements
 *
 * Key Benefits:
 * - Rental properties: 9% AfA for 8 years, then 7% AfA for 4 years (instead of 2-3%)
 * - Owner-occupied: Up to 90% of renovation costs deductible over 10 years
 * - Applies to acquisition and renovation of listed buildings
 */

/**
 * Type of use for the listed building
 */
export type BuildingUseType = 'rental' | 'owner_occupied'

/**
 * Configuration for a listed building (denkmalgeschütztes Gebäude)
 */
export interface DenkmalPropertyConfig {
  /** Type of use: rental or owner-occupied */
  useType: BuildingUseType
  /** Purchase price of the building (excluding land) in EUR */
  buildingValue: number
  /** Purchase price of the land in EUR */
  landValue: number
  /** Monument-compliant renovation costs in EUR */
  renovationCosts: number
  /** Year of purchase/start of renovation */
  startYear: number
  /** Annual rental income in EUR (only for rental properties) */
  annualRent?: number
  /** Owner's personal income tax rate (for owner-occupied) */
  personalTaxRate?: number
  /** Whether the building was purchased before or after renovation */
  purchasedAfterRenovation: boolean
}

/**
 * Denkmal-AfA rates according to § 7i EStG
 */
export const DENKMAL_AFA_RATES = {
  /** Years 1-8: 9% per year for acquisition costs */
  PHASE_1_RATE: 0.09,
  /** Years 1-8 duration */
  PHASE_1_YEARS: 8,
  /** Years 9-12: 7% per year for acquisition costs */
  PHASE_2_RATE: 0.07,
  /** Years 9-12 duration */
  PHASE_2_YEARS: 4,
  /** Years 1-8: 9% per year for renovation costs */
  RENOVATION_PHASE_1_RATE: 0.09,
  /** Years 1-8 duration for renovation */
  RENOVATION_PHASE_1_YEARS: 8,
  /** Years 9-12: 7% per year for renovation costs (if not fully depreciated) */
  RENOVATION_PHASE_2_RATE: 0.07,
  /** Years 9-12 duration for renovation */
  RENOVATION_PHASE_2_YEARS: 4,
  /** Owner-occupied: 9% for 10 years (§ 10f EStG) */
  OWNER_OCCUPIED_RATE: 0.09,
  /** Owner-occupied duration */
  OWNER_OCCUPIED_YEARS: 10,
} as const

/**
 * Result of Denkmal-AfA calculation for a single year
 */
export interface DenkmalAfaYearResult {
  /** Year number */
  year: number
  /** AfA for acquisition costs (building value) */
  afaAcquisition: number
  /** AfA for renovation costs */
  afaRenovation: number
  /** Total AfA for the year */
  totalAfa: number
  /** AfA rate applied (as percentage) */
  afaRate: number
  /** Phase (1 = years 1-8, 2 = years 9-12) */
  phase: 1 | 2
  /** Whether AfA period has ended */
  afaPeriodEnded: boolean
}

/**
 * Complete Denkmal-AfA analysis result
 */
export interface DenkmalAfaAnalysisResult {
  /** Year-by-year breakdown */
  yearlyBreakdown: DenkmalAfaYearResult[]
  /** Total AfA over all years */
  totalAfaAcquisition: number
  /** Total renovation AfA */
  totalAfaRenovation: number
  /** Combined total AfA */
  totalAfa: number
  /** Total tax savings over depreciation period */
  totalTaxSavings: number
  /** Average annual AfA */
  averageAnnualAfa: number
  /** Depreciation period in years */
  depreciationPeriod: number
  /** Tax benefit description */
  benefitDescription: string
}

/**
 * Comparison between Denkmal-AfA and standard AfA
 */
export interface DenkmalVsStandardComparison {
  /** Denkmal-AfA results */
  denkmalAfa: DenkmalAfaAnalysisResult
  /** Standard AfA results (2% or 3% linear) */
  standardAfa: {
    totalAfa: number
    annualAfa: number
    totalTaxSavings: number
  }
  /** Tax benefit advantage of Denkmal-AfA */
  additionalTaxBenefit: number
  /** Additional benefit as percentage */
  additionalBenefitPercentage: number
  /** Years until break-even with higher acquisition costs */
  breakEvenYears: number
  /** Recommendation text */
  recommendation: string
}

/**
 * Calculate Denkmal-AfA for a specific year
 *
 * @param config - Denkmal property configuration
 * @param yearsSinceStart - Number of years since start (0 = first year)
 * @returns AfA result for the year
 */
export function calculateDenkmalAfaForYear(
  config: DenkmalPropertyConfig,
  yearsSinceStart: number,
): DenkmalAfaYearResult {
  const yearNumber = yearsSinceStart + 1

  // Determine phase and rate
  let afaRate: number
  let phase: 1 | 2
  let afaPeriodEnded = false

  if (config.useType === 'rental') {
    if (yearNumber <= DENKMAL_AFA_RATES.PHASE_1_YEARS) {
      afaRate = DENKMAL_AFA_RATES.PHASE_1_RATE
      phase = 1
    } else if (yearNumber <= DENKMAL_AFA_RATES.PHASE_1_YEARS + DENKMAL_AFA_RATES.PHASE_2_YEARS) {
      afaRate = DENKMAL_AFA_RATES.PHASE_2_RATE
      phase = 2
    } else {
      // After 12 years, Denkmal-AfA ends, standard AfA applies
      afaRate = 0
      phase = 2
      afaPeriodEnded = true
    }
  } else {
    // Owner-occupied: § 10f EStG
    if (yearNumber <= DENKMAL_AFA_RATES.OWNER_OCCUPIED_YEARS) {
      afaRate = DENKMAL_AFA_RATES.OWNER_OCCUPIED_RATE
      phase = 1
    } else {
      afaRate = 0
      phase = 1
      afaPeriodEnded = true
    }
  }

  // Calculate AfA amounts
  const afaAcquisition = afaPeriodEnded ? 0 : config.buildingValue * afaRate
  const afaRenovation = afaPeriodEnded ? 0 : config.renovationCosts * afaRate
  const totalAfa = afaAcquisition + afaRenovation

  return {
    year: config.startYear + yearsSinceStart,
    afaAcquisition,
    afaRenovation,
    totalAfa,
    afaRate: afaRate * 100, // Convert to percentage
    phase,
    afaPeriodEnded,
  }
}

/**
 * Calculate complete Denkmal-AfA analysis over the depreciation period
 *
 * @param config - Denkmal property configuration
 * @param taxRate - Effective tax rate for calculating savings (0.0 to 1.0)
 * @returns Complete analysis with yearly breakdown and totals
 */
export function analyzeDenkmalAfa(
  config: DenkmalPropertyConfig,
  taxRate: number,
): DenkmalAfaAnalysisResult {
  const depreciationPeriod =
    config.useType === 'rental'
      ? DENKMAL_AFA_RATES.PHASE_1_YEARS + DENKMAL_AFA_RATES.PHASE_2_YEARS
      : DENKMAL_AFA_RATES.OWNER_OCCUPIED_YEARS

  // Calculate year-by-year breakdown
  const yearlyBreakdown: DenkmalAfaYearResult[] = []
  let totalAfaAcquisition = 0
  let totalAfaRenovation = 0

  for (let year = 0; year < depreciationPeriod; year++) {
    const yearResult = calculateDenkmalAfaForYear(config, year)
    yearlyBreakdown.push(yearResult)
    totalAfaAcquisition += yearResult.afaAcquisition
    totalAfaRenovation += yearResult.afaRenovation
  }

  const totalAfa = totalAfaAcquisition + totalAfaRenovation
  const totalTaxSavings = totalAfa * taxRate
  const averageAnnualAfa = totalAfa / depreciationPeriod

  // Generate benefit description
  const benefitDescription =
    config.useType === 'rental'
      ? `Erhöhte AfA nach § 7i EStG: 9% für ${DENKMAL_AFA_RATES.PHASE_1_YEARS} Jahre, dann 7% für ${DENKMAL_AFA_RATES.PHASE_2_YEARS} Jahre (statt 2-3% bei normalen Immobilien)`
      : `Sonderausgabenabzug nach § 10f EStG: 9% der Sanierungskosten über ${DENKMAL_AFA_RATES.OWNER_OCCUPIED_YEARS} Jahre`

  return {
    yearlyBreakdown,
    totalAfaAcquisition,
    totalAfaRenovation,
    totalAfa,
    totalTaxSavings,
    averageAnnualAfa,
    depreciationPeriod,
    benefitDescription,
  }
}

/**
 * Compare Denkmal-AfA with standard AfA
 *
 * @param config - Denkmal property configuration
 * @param taxRate - Effective tax rate (0.0 to 1.0)
 * @param standardAfaRate - Standard AfA rate for comparison (default: 0.02)
 * @returns Comparison analysis
 */
export function compareDenkmalWithStandardAfa(
  config: DenkmalPropertyConfig,
  taxRate: number,
  standardAfaRate = 0.02,
): DenkmalVsStandardComparison {
  // Calculate Denkmal-AfA
  const denkmalAfa = analyzeDenkmalAfa(config, taxRate)

  // Calculate standard AfA for same period
  const totalInvestment = config.buildingValue + config.renovationCosts
  const annualStandardAfa = totalInvestment * standardAfaRate
  const standardAfaPeriod = denkmalAfa.depreciationPeriod
  const totalStandardAfa = annualStandardAfa * standardAfaPeriod
  const totalStandardTaxSavings = totalStandardAfa * taxRate

  // Calculate additional benefit
  const additionalTaxBenefit = denkmalAfa.totalTaxSavings - totalStandardTaxSavings
  const additionalBenefitPercentage = (additionalTaxBenefit / totalStandardTaxSavings) * 100

  // Calculate break-even
  // Assumption: Denkmal properties might cost 10-20% more than standard properties
  const typicalPremium = totalInvestment * 0.15 // 15% premium assumption
  const breakEvenYears = Math.ceil(typicalPremium / (denkmalAfa.averageAnnualAfa * taxRate))

  // Generate recommendation
  let recommendation = ''
  if (additionalTaxBenefit > 50000) {
    recommendation =
      'Sehr attraktiv: Die erhöhte Denkmal-AfA bietet erhebliche Steuervorteile. Bei entsprechendem Einkommen kann sich der Mehraufwand schnell amortisieren.'
  } else if (additionalTaxBenefit > 20000) {
    recommendation =
      'Attraktiv: Die Denkmal-AfA bietet deutliche Steuervorteile. Eine Investition lohnt sich bei passendem Objekt und ausreichendem zu versteuernden Einkommen.'
  } else if (additionalTaxBenefit > 5000) {
    recommendation =
      'Bedingt attraktiv: Moderate Steuervorteile. Die Investition sollte auch ohne Steuervorteil wirtschaftlich sinnvoll sein.'
  } else {
    recommendation =
      'Geringe Steuervorteile: Bei niedrigem Steuersatz oder geringen Sanierungskosten sind die Vorteile begrenzt. Fokus auf die Immobilie selbst legen.'
  }

  return {
    denkmalAfa,
    standardAfa: {
      totalAfa: totalStandardAfa,
      annualAfa: annualStandardAfa,
      totalTaxSavings: totalStandardTaxSavings,
    },
    additionalTaxBenefit,
    additionalBenefitPercentage,
    breakEvenYears,
    recommendation,
  }
}

/**
 * Calculate ROI for a Denkmal property including tax benefits
 *
 * @param config - Denkmal property configuration
 * @param taxRate - Effective tax rate
 * @param holdingPeriod - Expected holding period in years
 * @returns ROI analysis
 */
export interface DenkmalRoiAnalysis {
  /** Total investment (building + land + renovation) */
  totalInvestment: number
  /** Total rental income over holding period */
  totalRentalIncome: number
  /** Total tax savings from Denkmal-AfA */
  totalTaxSavings: number
  /** Total operating expenses */
  totalOperatingExpenses: number
  /** Net cash flow after tax */
  netCashFlow: number
  /** ROI as percentage */
  roi: number
  /** ROI with tax benefits */
  roiWithTaxBenefits: number
  /** Additional ROI from tax benefits */
  additionalRoiFromTaxBenefits: number
  /** Annual cash-on-cash return */
  annualCashOnCashReturn: number
}

/**
 * Calculate comprehensive ROI analysis for Denkmal property
 *
 * @param config - Denkmal property configuration
 * @param taxRate - Effective tax rate
 * @param holdingPeriod - Expected holding period in years
 * @param operatingExpenseRate - Operating expenses as % of rental income (default: 0.25)
 * @returns ROI analysis
 */
export function calculateDenkmalRoi(
  config: DenkmalPropertyConfig,
  taxRate: number,
  holdingPeriod: number,
  operatingExpenseRate = 0.25,
): DenkmalRoiAnalysis {
  // Only applicable for rental properties
  if (config.useType !== 'rental' || !config.annualRent) {
    throw new Error('ROI calculation is only applicable for rental properties')
  }

  // Calculate totals
  const totalInvestment = config.buildingValue + config.landValue + config.renovationCosts
  const totalRentalIncome = config.annualRent * holdingPeriod

  // Get tax savings (limited to depreciation period)
  const denkmalAnalysis = analyzeDenkmalAfa(config, taxRate)
  const totalTaxSavings = denkmalAnalysis.totalTaxSavings

  // Operating expenses
  const totalOperatingExpenses = totalRentalIncome * operatingExpenseRate

  // Net cash flow
  const netCashFlowWithoutTaxBenefit = totalRentalIncome - totalOperatingExpenses
  const netCashFlow = netCashFlowWithoutTaxBenefit + totalTaxSavings

  // ROI calculations
  const roi = (netCashFlowWithoutTaxBenefit / totalInvestment) * 100
  const roiWithTaxBenefits = (netCashFlow / totalInvestment) * 100
  const additionalRoiFromTaxBenefits = roiWithTaxBenefits - roi

  // Annual cash-on-cash return
  const annualCashOnCashReturn = ((config.annualRent - config.annualRent * operatingExpenseRate) / totalInvestment) * 100

  return {
    totalInvestment,
    totalRentalIncome,
    totalTaxSavings,
    totalOperatingExpenses,
    netCashFlow,
    roi,
    roiWithTaxBenefits,
    additionalRoiFromTaxBenefits,
    annualCashOnCashReturn,
  }
}

/**
 * Get default Denkmal property configuration
 *
 * @param useType - Type of use (rental or owner-occupied)
 * @param startYear - Start year
 * @returns Default configuration
 */
export function getDefaultDenkmalConfig(useType: BuildingUseType, startYear: number): DenkmalPropertyConfig {
  return {
    useType,
    buildingValue: 300000,
    landValue: 100000,
    renovationCosts: 150000,
    startYear,
    annualRent: useType === 'rental' ? 24000 : undefined,
    personalTaxRate: useType === 'owner_occupied' ? 0.35 : undefined,
    purchasedAfterRenovation: false,
  }
}

/**
 * Validate basic property values
 */
function validateBasicValues(config: DenkmalPropertyConfig, errors: string[]): void {
  if (config.buildingValue <= 0) {
    errors.push('Gebäudewert muss größer als 0 sein')
  }

  if (config.landValue < 0) {
    errors.push('Grundstückswert kann nicht negativ sein')
  }

  if (config.renovationCosts < 0) {
    errors.push('Sanierungskosten können nicht negativ sein')
  }

  if (config.startYear < 2000 || config.startYear > 2100) {
    errors.push('Startjahr muss zwischen 2000 und 2100 liegen')
  }
}

/**
 * Validate rental-specific values
 */
function validateRentalValues(config: DenkmalPropertyConfig, errors: string[]): void {
  if (!config.annualRent) {
    errors.push('Bei Vermietung muss eine jährliche Miete angegeben werden')
  }
  
  if (config.annualRent !== undefined && config.annualRent <= 0) {
    errors.push('Jährliche Miete muss größer als 0 sein')
  }
}

/**
 * Validate owner-occupied specific values
 */
function validateOwnerOccupiedValues(config: DenkmalPropertyConfig, errors: string[]): void {
  if (!config.personalTaxRate) {
    errors.push('Bei Eigennutzung muss ein persönlicher Steuersatz angegeben werden')
  } else if (config.personalTaxRate < 0 || config.personalTaxRate > 1) {
    errors.push('Persönlicher Steuersatz muss zwischen 0 und 1 (0% und 100%) liegen')
  }
}

/**
 * Validate Denkmal property configuration
 *
 * @param config - Configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateDenkmalConfig(config: DenkmalPropertyConfig): string[] {
  const errors: string[] = []

  validateBasicValues(config, errors)

  if (config.useType === 'rental') {
    validateRentalValues(config, errors)
  }

  if (config.useType === 'owner_occupied') {
    validateOwnerOccupiedValues(config, errors)
  }

  return errors
}

/**
 * Format currency for German display
 *
 * @param amount - Amount in EUR
 * @returns Formatted string
 */
export function formatDenkmalCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage for German display
 *
 * @param value - Value as decimal (e.g., 0.09 for 9%)
 * @param decimals - Number of decimal places (default: 1)
 * @returns Formatted string
 */
export function formatDenkmalPercentage(value: number, decimals = 1): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}
