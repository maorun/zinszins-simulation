/**
 * Immobilien-Steueroptimierung (Real Estate Tax Optimization)
 *
 * This module provides calculations for German real estate investment taxation,
 * including AfA (Absetzung für Abnutzung / Depreciation) and Werbungskosten (Deductible Expenses).
 *
 * Legal Framework:
 * - § 7 EStG: AfA (Depreciation for wear and tear)
 * - § 9 EStG: Werbungskosten (Income-related expenses)
 * - § 21 EStG: Income from rental and leasing
 */

/**
 * Configuration for a rental property
 */
export interface RentalPropertyConfig {
  /** Purchase price of the building (excluding land) in EUR */
  buildingValue: number
  /** Purchase price of the land in EUR */
  landValue: number
  /** Annual rental income in EUR */
  annualRent: number
  /** Year of purchase */
  purchaseYear: number
  /** Annual maintenance costs in EUR */
  maintenanceCosts?: number
  /** Annual management costs in EUR */
  managementCosts?: number
  /** Annual other deductible expenses in EUR */
  otherExpenses?: number
  /** Mortgage interest for the year in EUR */
  mortgageInterest?: number
  /** Building year (for determining depreciation rate) */
  buildingYear?: number
  /** Property tax (Grundsteuer) in EUR */
  propertyTax?: number
  /** Building insurance in EUR */
  buildingInsurance?: number
}

/**
 * Result of rental property tax calculation
 */
export interface RentalPropertyTaxResult {
  /** Annual rental income */
  rentalIncome: number
  /** Annual AfA (depreciation) amount */
  afa: number
  /** Total annual deductible expenses (Werbungskosten) */
  totalExpenses: number
  /** Breakdown of deductible expenses */
  expenseBreakdown: {
    afa: number
    maintenanceCosts: number
    managementCosts: number
    mortgageInterest: number
    propertyTax: number
    buildingInsurance: number
    otherExpenses: number
  }
  /** Taxable rental income (can be negative = loss) */
  taxableIncome: number
  /** Tax savings at given tax rate (negative taxableIncome creates savings) */
  taxSavings: number
  /** Effective return after tax considerations */
  effectiveReturn: number
}

/**
 * Standard AfA rates according to § 7 Abs. 4 EStG
 */
export const AfA_RATES = {
  /** Buildings completed after 31.12.2022: 3% per year (linear) */
  STANDARD_NEW: 0.03,
  /** Buildings completed before 01.01.2023: 2% per year (linear) */
  STANDARD_OLD: 0.02,
  /** Buildings completed before 01.01.1925: 2.5% per year (linear) */
  VERY_OLD: 0.025,
} as const

/**
 * Get the applicable AfA rate based on building year
 * According to § 7 Abs. 4 EStG
 *
 * @param buildingYear - Year when the building was completed
 * @returns AfA rate as decimal (e.g., 0.02 for 2%)
 */
export function getAfaRate(buildingYear: number): number {
  if (buildingYear < 1925) {
    return AfA_RATES.VERY_OLD
  } else if (buildingYear >= 2023) {
    return AfA_RATES.STANDARD_NEW
  } else {
    return AfA_RATES.STANDARD_OLD
  }
}

/**
 * Calculate annual AfA (Absetzung für Abnutzung / Depreciation)
 * Linear depreciation according to § 7 Abs. 4 EStG
 *
 * Important: Only the building value can be depreciated, not the land value!
 *
 * @param buildingValue - Purchase price of the building (excluding land) in EUR
 * @param buildingYear - Year when the building was completed
 * @returns Annual AfA amount in EUR
 */
export function calculateAfa(buildingValue: number, buildingYear = 2020): number {
  if (buildingValue <= 0) {
    return 0
  }

  const afaRate = getAfaRate(buildingYear)
  return buildingValue * afaRate
}

/**
 * Calculate total annual deductible expenses (Werbungskosten)
 * According to § 9 EStG in combination with § 21 EStG
 *
 * @param config - Rental property configuration
 * @returns Total annual deductible expenses in EUR
 */
export function calculateWerbungskosten(config: RentalPropertyConfig): number {
  const afa = calculateAfa(config.buildingValue, config.buildingYear)
  const maintenanceCosts = config.maintenanceCosts || 0
  const managementCosts = config.managementCosts || 0
  const otherExpenses = config.otherExpenses || 0
  const mortgageInterest = config.mortgageInterest || 0
  const propertyTax = config.propertyTax || 0
  const buildingInsurance = config.buildingInsurance || 0

  return afa + maintenanceCosts + managementCosts + otherExpenses + mortgageInterest + propertyTax + buildingInsurance
}

/**
 * Calculate detailed rental property tax result
 *
 * @param config - Rental property configuration
 * @param personalTaxRate - Personal income tax rate (as decimal, e.g., 0.42 for 42%)
 * @returns Detailed tax calculation result
 */
export function calculateRentalPropertyTax(
  config: RentalPropertyConfig,
  personalTaxRate = 0.42
): RentalPropertyTaxResult {
  const afa = calculateAfa(config.buildingValue, config.buildingYear)
  const maintenanceCosts = config.maintenanceCosts || 0
  const managementCosts = config.managementCosts || 0
  const otherExpenses = config.otherExpenses || 0
  const mortgageInterest = config.mortgageInterest || 0
  const propertyTax = config.propertyTax || 0
  const buildingInsurance = config.buildingInsurance || 0

  const expenseBreakdown = {
    afa,
    maintenanceCosts,
    managementCosts,
    mortgageInterest,
    propertyTax,
    buildingInsurance,
    otherExpenses,
  }

  const totalExpenses = calculateExpenseTotal(expenseBreakdown)
  const rentalIncome = config.annualRent
  const taxableIncome = rentalIncome - totalExpenses

  const taxSavings = calculateTaxImpact(taxableIncome, personalTaxRate)
  const totalInvestment = config.buildingValue + config.landValue
  const effectiveReturn = calculateEffectiveReturn(rentalIncome, totalExpenses, taxSavings, totalInvestment)

  return {
    rentalIncome,
    afa,
    totalExpenses,
    expenseBreakdown,
    taxableIncome,
    taxSavings,
    effectiveReturn,
  }
}

/**
 * Calculate total expenses from breakdown
 */
function calculateExpenseTotal(expenseBreakdown: {
  afa: number
  maintenanceCosts: number
  managementCosts: number
  mortgageInterest: number
  propertyTax: number
  buildingInsurance: number
  otherExpenses: number
}): number {
  return Object.values(expenseBreakdown).reduce((sum, val) => sum + val, 0)
}

/**
 * Calculate tax impact (savings or burden)
 * Negative taxable income creates tax savings, positive creates tax burden
 */
function calculateTaxImpact(taxableIncome: number, personalTaxRate: number): number {
  return -taxableIncome * personalTaxRate
}

/**
 * Calculate effective return on investment
 */
function calculateEffectiveReturn(
  rentalIncome: number,
  totalExpenses: number,
  taxSavings: number,
  totalInvestment: number
): number {
  if (totalInvestment <= 0) {
    return 0
  }
  const netCashFlow = rentalIncome - totalExpenses + taxSavings
  return netCashFlow / totalInvestment
}

/**
 * Calculate cumulative depreciation over multiple years
 *
 * @param buildingValue - Purchase price of the building in EUR
 * @param buildingYear - Year when the building was completed
 * @param yearsOfDepreciation - Number of years to calculate
 * @returns Array of annual depreciation amounts
 */
export function calculateCumulativeAfa(
  buildingValue: number,
  buildingYear: number,
  yearsOfDepreciation: number
): number[] {
  const annualAfa = calculateAfa(buildingValue, buildingYear)
  const afaRate = getAfaRate(buildingYear)
  const totalDepreciationYears = Math.ceil(1 / afaRate) // Years until fully depreciated

  return Array.from({ length: yearsOfDepreciation }, (_, index) => {
    // After total depreciation period, no more AfA
    if (index >= totalDepreciationYears) {
      return 0
    }

    // Last year might be partial
    if (index === totalDepreciationYears - 1) {
      const remainingValue = buildingValue - annualAfa * index
      return Math.max(0, remainingValue)
    }

    return annualAfa
  })
}

/**
 * Calculate typical expense ratios for rental properties
 * Based on common benchmarks in German real estate market
 *
 * @param annualRent - Annual rental income in EUR
 * @returns Estimated annual expense amounts
 */
export function estimateTypicalExpenses(annualRent: number): {
  maintenanceCosts: number
  managementCosts: number
  propertyTax: number
  buildingInsurance: number
} {
  return {
    // Maintenance: typically 1-2% of property value, approximated as 10-15% of annual rent
    maintenanceCosts: annualRent * 0.1,
    // Management: typically 2-3% of property value or 15-25% of monthly rent
    managementCosts: annualRent * 0.15,
    // Property tax: typically 1.5-3 months of rent per year
    propertyTax: annualRent * 0.2,
    // Building insurance: typically 0.5-1 month of rent per year
    buildingInsurance: annualRent * 0.08,
  }
}

/**
 * Validate rental property configuration
 *
 * @param config - Rental property configuration to validate
 * @returns Array of validation error messages (empty if valid)
 */
export function validateRentalPropertyConfig(config: RentalPropertyConfig): string[] {
  const errors: string[] = []

  validateBasicValues(config, errors)
  validateYears(config, errors)
  validateExpenses(config, errors)

  return errors
}

/**
 * Validate basic property values
 */
function validateBasicValues(config: RentalPropertyConfig, errors: string[]): void {
  if (config.buildingValue <= 0) {
    errors.push('Gebäudewert muss größer als 0 sein')
  }

  if (config.landValue < 0) {
    errors.push('Grundstückswert darf nicht negativ sein')
  }

  if (config.annualRent <= 0) {
    errors.push('Jährliche Mieteinnahmen müssen größer als 0 sein')
  }
}

/**
 * Validate year values
 */
function validateYears(config: RentalPropertyConfig, errors: string[]): void {
  const currentYear = new Date().getFullYear()

  if (config.purchaseYear < 1900 || config.purchaseYear > currentYear + 1) {
    errors.push('Kaufjahr muss zwischen 1900 und nächstem Jahr liegen')
  }

  if (config.buildingYear && (config.buildingYear < 1800 || config.buildingYear > currentYear + 5)) {
    errors.push('Baujahr muss zwischen 1800 und den nächsten 5 Jahren liegen')
  }

  if (config.buildingYear && config.purchaseYear < config.buildingYear) {
    errors.push('Kaufjahr kann nicht vor dem Baujahr liegen')
  }
}

/**
 * Validate expense values
 */
function validateExpenses(config: RentalPropertyConfig, errors: string[]): void {
  const expenseChecks = [
    { value: config.maintenanceCosts, name: 'Instandhaltungskosten' },
    { value: config.managementCosts, name: 'Verwaltungskosten' },
    { value: config.otherExpenses, name: 'Sonstige Ausgaben' },
    { value: config.mortgageInterest, name: 'Darlehenszinsen' },
    { value: config.propertyTax, name: 'Grundsteuer' },
    { value: config.buildingInsurance, name: 'Gebäudeversicherung' },
  ]

  for (const check of expenseChecks) {
    if (check.value !== undefined && check.value < 0) {
      errors.push(`${check.name} dürfen nicht negativ sein`)
    }
  }
}
