/**
 * Types and utilities for Riester-Rente integration
 * 
 * Riester-Rente is a German subsidized pension product with government allowances
 * and tax deductions, designed to encourage private retirement savings.
 */

/**
 * Configuration for Riester-Rente
 */
export interface RiesterRenteConfig {
  /** Whether Riester-Rente is enabled in the calculation */
  enabled: boolean

  /** Annual gross income in EUR (for Mindesteigenbeitrag calculation) */
  annualGrossIncome: number

  /** Actual annual contribution amount in EUR */
  annualContribution: number

  /** Number of children eligible for child allowance */
  numberOfChildren: number

  /** Year of birth for each child (for age-based allowance calculation) */
  childrenBirthYears: number[]

  /** Starting year for pension payments (retirement) */
  pensionStartYear: number

  /** Expected monthly pension amount in EUR (before taxes) */
  expectedMonthlyPension: number

  /** Annual increase rate for pension adjustments during payout (default: 1%) */
  pensionIncreaseRate: number

  /** Whether Wohn-Riester is used (home ownership option) */
  useWohnRiester: boolean
}

/**
 * Riester allowances (Zulagen) for a specific year
 */
export interface RiesterAllowances {
  /** Basic allowance (Grundzulage) */
  basicAllowance: number

  /** Total child allowances (Kinderzulagen) */
  childAllowances: number

  /** Total allowances (basic + children) */
  totalAllowances: number

  /** Breakdown of child allowances per child */
  childAllowanceDetails: Array<{
    birthYear: number
    age: number
    allowance: number
  }>
}

/**
 * Result of Riester-Rente tax benefit calculation (Günstigerprüfung)
 */
export interface RiesterTaxBenefitResult {
  /** Actual contribution amount */
  contribution: number

  /** Total allowances received */
  allowances: number

  /** Required minimum contribution (Mindesteigenbeitrag) */
  minimumContribution: number

  /** Maximum tax-deductible amount (Sonderausgabenabzug) */
  maxTaxDeductible: number

  /** Tax deduction amount (if applicable) */
  taxDeductionAmount: number

  /** Tax savings from deduction */
  taxSavingsFromDeduction: number

  /** Total benefit (allowances OR tax savings, whichever is higher) */
  totalBenefit: number

  /** Which method was chosen: 'allowances' or 'tax-deduction' */
  benefitMethod: 'allowances' | 'tax-deduction'

  /** Whether minimum contribution requirement is met */
  meetsMinimumContribution: boolean
}

/**
 * Result of Riester-Rente pension payout taxation
 */
export interface RiesterPensionTaxationResult {
  /** Gross annual pension amount */
  grossAnnualPension: number

  /** Gross monthly pension amount */
  grossMonthlyPension: number

  /** Full taxation (100% of Riester pension is taxable) */
  taxablePercentage: number

  /** Taxable amount (equals gross pension for Riester) */
  taxableAmount: number

  /** Income tax on pension */
  incomeTax: number

  /** Net annual pension after taxes */
  netAnnualPension: number
}

/**
 * Calculate Riester allowances for a specific year
 * 
 * @param numberOfChildren - Number of eligible children
 * @param childrenBirthYears - Birth years of children
 * @param calculationYear - Year for which to calculate allowances
 * @returns Allowances breakdown
 * 
 * @remarks
 * - Grundzulage: 175€ per year (since 2018)
 * - Kinderzulage: 185€ for children born before 2008, 300€ for children born 2008 or later
 * - Children must be eligible (under 25 and receiving Kindergeld)
 */
export function calculateRiesterAllowances(
  numberOfChildren: number,
  childrenBirthYears: number[],
  calculationYear: number
): RiesterAllowances {
  // Basic allowance (Grundzulage) - 175€ since 2018
  const basicAllowance = 175

  const childAllowanceDetails: Array<{
    birthYear: number
    age: number
    allowance: number
  }> = []

  let totalChildAllowances = 0

  // Calculate child allowances
  for (let i = 0; i < numberOfChildren && i < childrenBirthYears.length; i++) {
    const birthYear = childrenBirthYears[i]
    const age = calculationYear - birthYear

    // Child must be under 25 to be eligible
    if (age >= 25) {
      childAllowanceDetails.push({
        birthYear,
        age,
        allowance: 0,
      })
      continue
    }

    // Allowance depends on birth year
    // Born 2008 or later: 300€
    // Born before 2008: 185€
    const allowance = birthYear >= 2008 ? 300 : 185

    totalChildAllowances += allowance
    childAllowanceDetails.push({
      birthYear,
      age,
      allowance,
    })
  }

  return {
    basicAllowance,
    childAllowances: totalChildAllowances,
    totalAllowances: basicAllowance + totalChildAllowances,
    childAllowanceDetails,
  }
}

/**
 * Calculate required minimum contribution (Mindesteigenbeitrag)
 * 
 * @param annualGrossIncome - Annual gross income in EUR
 * @param totalAllowances - Total Riester allowances
 * @returns Required minimum contribution
 * 
 * @remarks
 * - Formula: 4% of previous year's gross income minus allowances
 * - Minimum absolute contribution: 60€ per year
 */
export function calculateMinimumContribution(
  annualGrossIncome: number,
  totalAllowances: number
): number {
  // 4% of gross income
  const fourPercent = annualGrossIncome * 0.04

  // Subtract allowances to get required own contribution
  const requiredContribution = fourPercent - totalAllowances

  // Minimum absolute contribution is 60€ per year
  return Math.max(60, requiredContribution)
}

/**
 * Calculate Riester tax benefits using Günstigerprüfung
 * 
 * @param contribution - Actual annual contribution
 * @param annualGrossIncome - Annual gross income
 * @param numberOfChildren - Number of eligible children
 * @param childrenBirthYears - Birth years of children
 * @param calculationYear - Year for calculation
 * @param personalTaxRate - Personal income tax rate (0-1)
 * @returns Tax benefit calculation result
 * 
 * @remarks
 * Günstigerprüfung (more favorable test):
 * - Option 1: Receive allowances (Zulagen)
 * - Option 2: Tax deduction up to 2,100€ minus allowances
 * - System automatically chooses the better option
 */
export function calculateRiesterTaxBenefit(
  contribution: number,
  annualGrossIncome: number,
  numberOfChildren: number,
  childrenBirthYears: number[],
  calculationYear: number,
  personalTaxRate: number
): RiesterTaxBenefitResult {
  // Calculate allowances
  const allowances = calculateRiesterAllowances(numberOfChildren, childrenBirthYears, calculationYear)
  
  // Calculate minimum required contribution
  const minimumContribution = calculateMinimumContribution(annualGrossIncome, allowances.totalAllowances)
  
  // Check if minimum contribution is met
  const meetsMinimumContribution = contribution >= minimumContribution

  // Maximum tax-deductible amount (Sonderausgabenabzug)
  const maxTaxDeductible = 2100

  // Calculate potential tax deduction
  // Tax deduction is: min(contribution, maxTaxDeductible)
  const potentialDeduction = Math.min(contribution, maxTaxDeductible)
  const taxSavingsFromDeduction = potentialDeduction * personalTaxRate

  // Günstigerprüfung: Compare allowances vs. tax deduction
  // Tax benefit from deduction = tax savings minus allowances (which must be returned if claiming deduction)
  const netTaxBenefit = taxSavingsFromDeduction - allowances.totalAllowances

  let totalBenefit: number
  let benefitMethod: 'allowances' | 'tax-deduction'
  let taxDeductionAmount: number

  if (!meetsMinimumContribution) {
    // If minimum contribution is not met, no benefits are granted
    totalBenefit = 0
    benefitMethod = 'allowances'
    taxDeductionAmount = 0
  } else if (netTaxBenefit > 0) {
    // Tax deduction is more favorable
    totalBenefit = taxSavingsFromDeduction
    benefitMethod = 'tax-deduction'
    taxDeductionAmount = potentialDeduction
  } else {
    // Allowances are more favorable (or equal)
    totalBenefit = allowances.totalAllowances
    benefitMethod = 'allowances'
    taxDeductionAmount = 0
  }

  return {
    contribution,
    allowances: allowances.totalAllowances,
    minimumContribution,
    maxTaxDeductible,
    taxDeductionAmount,
    taxSavingsFromDeduction: netTaxBenefit > 0 ? taxSavingsFromDeduction : 0,
    totalBenefit,
    benefitMethod,
    meetsMinimumContribution,
  }
}

/**
 * Calculate taxation of Riester pension payout
 * 
 * @param grossMonthlyPension - Gross monthly pension amount
 * @param retirementYear - Year when pension started
 * @param currentYear - Current year for calculation
 * @param pensionIncreaseRate - Annual increase rate for pension adjustments
 * @param personalTaxRate - Personal income tax rate (0-1)
 * @returns Pension taxation calculation result
 * 
 * @remarks
 * - Riester pensions are fully taxable (100%) during retirement
 * - This is nachgelagerte Besteuerung (deferred taxation)
 */
export function calculateRiesterPensionTaxation(
  grossMonthlyPension: number,
  retirementYear: number,
  currentYear: number,
  pensionIncreaseRate: number,
  personalTaxRate: number
): RiesterPensionTaxationResult {
  // Calculate adjusted pension based on years since retirement
  const yearsSinceRetirement = currentYear - retirementYear
  const adjustmentFactor = yearsSinceRetirement > 0 
    ? Math.pow(1 + pensionIncreaseRate, yearsSinceRetirement)
    : 1.0

  const adjustedMonthlyPension = grossMonthlyPension * adjustmentFactor
  const grossAnnualPension = adjustedMonthlyPension * 12

  // Riester pensions are 100% taxable (nachgelagerte Besteuerung)
  const taxablePercentage = 1.0
  const taxableAmount = grossAnnualPension

  // Calculate income tax (simplified - in reality depends on total income)
  const incomeTax = taxableAmount * personalTaxRate

  const netAnnualPension = grossAnnualPension - incomeTax

  return {
    grossAnnualPension,
    grossMonthlyPension: adjustedMonthlyPension,
    taxablePercentage,
    taxableAmount,
    incomeTax,
    netAnnualPension,
  }
}

/**
 * Create default Riester-Rente configuration
 * 
 * @returns Default configuration with disabled state
 */
export function createDefaultRiesterConfig(): RiesterRenteConfig {
  return {
    enabled: false,
    annualGrossIncome: 40000,
    annualContribution: 2100,
    numberOfChildren: 0,
    childrenBirthYears: [],
    pensionStartYear: 2040,
    expectedMonthlyPension: 800,
    pensionIncreaseRate: 0.01,
    useWohnRiester: false,
  }
}
