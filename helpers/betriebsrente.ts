/**
 * Types and utilities for Betriebliche Altersvorsorge (bAV - company pension) integration
 *
 * Betriebliche Altersvorsorge is a company pension scheme in Germany with tax advantages
 * during the contribution phase and deferred taxation during the payout phase.
 */

/**
 * Configuration for Betriebsrente (bAV)
 */
export interface BetriebsrenteConfig {
  /** Whether Betriebsrente is enabled in the calculation */
  enabled: boolean

  /** Annual employee contribution amount in EUR (before tax) */
  annualEmployeeContribution: number

  /** Annual employer contribution amount in EUR */
  annualEmployerContribution: number

  /** Starting year for pension payments (retirement) */
  pensionStartYear: number

  /** Expected monthly pension amount in EUR (before taxes) */
  expectedMonthlyPension: number

  /** Annual increase rate for pension adjustments during payout (default: 1%) */
  pensionIncreaseRate: number

  /** Type of bAV implementation */
  implementationType: 'direktzusage' | 'unterstuetzungskasse' | 'direktversicherung' | 'pensionskasse' | 'pensionsfonds'
}

/**
 * Tax-free contribution limits for Betriebsrente (based on German tax law)
 * § 3 Nr. 63 EStG for employer contributions
 * § 3 Nr. 56 EStG and § 10a EStG for salary conversion
 */
export interface BetriebsrenteTaxLimits {
  /** Maximum tax-free employer contribution (§ 3 Nr. 63 EStG) - 8% of BBG West */
  maxTaxFreeEmployerContribution: number

  /** Maximum social security-free contribution limit (§ 3 Nr. 63 EStG) - 4% of BBG West */
  maxSocialSecurityFreeContribution: number

  /** Contribution assessment ceiling (Beitragsbemessungsgrenze) West for calculation */
  contributionAssessmentCeilingWest: number

  /** Year of the limit */
  year: number
}

/**
 * Result of bAV tax benefit calculation during contribution phase
 */
export interface BetriebsrenteTaxBenefitResult {
  /** Total annual contribution (employee + employer) */
  totalContribution: number

  /** Employee contribution amount */
  employeeContribution: number

  /** Employer contribution amount */
  employerContribution: number

  /** Tax-free portion of employer contribution */
  taxFreeEmployerContribution: number

  /** Social security-free portion of employee contribution */
  socialSecurityFreeEmployeeContribution: number

  /** Tax savings from employee contribution (salary conversion) */
  taxSavingsEmployee: number

  /** Social security savings from employee contribution */
  socialSecuritySavingsEmployee: number

  /** Total benefit (tax + social security savings) */
  totalBenefit: number

  /** Whether limits are exceeded */
  exceedsTaxLimits: boolean

  /** Whether social security limits are exceeded */
  exceedsSocialSecurityLimits: boolean
}

/**
 * Result of Betriebsrente pension payout taxation
 */
export interface BetriebsrentePensionTaxationResult {
  /** Gross annual pension amount */
  grossAnnualPension: number

  /** Gross monthly pension amount */
  grossMonthlyPension: number

  /** Full taxation (100% of bAV pension is taxable) */
  taxablePercentage: number

  /** Taxable amount (equals gross pension for bAV) */
  taxableAmount: number

  /** Income tax on pension */
  incomeTax: number

  /** Health insurance contribution on pension (approx. 7.3% for statutory) */
  healthInsuranceContribution: number

  /** Long-term care insurance contribution on pension (approx. 3.05% or 4.0%) */
  careInsuranceContribution: number

  /** Total social security contributions */
  totalSocialSecurityContributions: number

  /** Net annual pension after taxes and social security */
  netAnnualPension: number
}

/**
 * Get tax-free contribution limits for Betriebsrente for a specific year
 *
 * @param year - Contribution year
 * @returns Tax-free contribution limits
 *
 * @remarks
 * Limits are based on:
 * - § 3 Nr. 63 EStG: Tax-free employer contribution up to 8% of BBG West
 * - § 3 Nr. 63 EStG: Social security-free up to 4% of BBG West
 * - BBG (Beitragsbemessungsgrenze) West increases yearly
 *
 * Historical BBG West values:
 * - 2023: 87,600 EUR
 * - 2024: 90,600 EUR
 * - 2025+: Projected increases of ~3% per year
 */
export function getBetriebsrenteTaxLimits(year: number): BetriebsrenteTaxLimits {
  // BBG West values (historical and projected)
  const bbgWest: Record<number, number> = {
    2020: 82800,
    2021: 85200,
    2022: 84600,
    2023: 87600,
    2024: 90600,
    2025: 93300,
  }

  // For years after 2025, project 3% annual increase
  const contributionAssessmentCeilingWest = bbgWest[year] || bbgWest[2025] * Math.pow(1.03, year - 2025)

  // § 3 Nr. 63 EStG: 8% of BBG West is tax-free
  const maxTaxFreeEmployerContribution = contributionAssessmentCeilingWest * 0.08

  // § 3 Nr. 63 EStG: 4% of BBG West is social security-free
  const maxSocialSecurityFreeContribution = contributionAssessmentCeilingWest * 0.04

  return {
    maxTaxFreeEmployerContribution,
    maxSocialSecurityFreeContribution,
    contributionAssessmentCeilingWest,
    year,
  }
}

/**
 * Calculate Betriebsrente tax benefits during contribution phase
 *
 * @param employeeContribution - Annual employee contribution (salary conversion)
 * @param employerContribution - Annual employer contribution
 * @param year - Contribution year
 * @param personalTaxRate - Personal income tax rate (0-1)
 * @param socialSecurityRate - Social security contribution rate (0-1, typically ~0.20)
 * @returns Tax benefit calculation result
 *
 * @remarks
 * Tax benefits:
 * 1. Employer contributions up to 8% BBG are tax-free (§ 3 Nr. 63 EStG)
 * 2. Employee contributions (salary conversion) up to 4% BBG are tax and social security-free
 * 3. Additional employee contributions beyond 4% are tax-free but not social security-free
 *
 * Social security:
 * - During contribution: Savings on income tax and social security
 * - During payout: Full taxation + social security contributions on pension
 */
export function calculateBetriebsrenteTaxBenefit(
  employeeContribution: number,
  employerContribution: number,
  year: number,
  personalTaxRate: number,
  socialSecurityRate = 0.2,
): BetriebsrenteTaxBenefitResult {
  const limits = getBetriebsrenteTaxLimits(year)

  // Calculate tax-free employer contribution (up to 8% BBG limit)
  const taxFreeEmployerContribution = Math.min(employerContribution, limits.maxTaxFreeEmployerContribution)

  // Calculate social security-free employee contribution (up to 4% BBG limit)
  const socialSecurityFreeEmployeeContribution = Math.min(
    employeeContribution,
    limits.maxSocialSecurityFreeContribution,
  )

  // Employee contribution is always tax-free (salary conversion reduces taxable income)
  const taxSavingsEmployee = employeeContribution * personalTaxRate

  // Social security savings only on amount up to 4% BBG
  const socialSecuritySavingsEmployee = socialSecurityFreeEmployeeContribution * socialSecurityRate

  // Total benefit
  const totalBenefit = taxSavingsEmployee + socialSecuritySavingsEmployee

  // Check if limits are exceeded
  const exceedsTaxLimits =
    employerContribution > limits.maxTaxFreeEmployerContribution ||
    employeeContribution > limits.maxTaxFreeEmployerContribution

  const exceedsSocialSecurityLimits = employeeContribution > limits.maxSocialSecurityFreeContribution

  return {
    totalContribution: employeeContribution + employerContribution,
    employeeContribution,
    employerContribution,
    taxFreeEmployerContribution,
    socialSecurityFreeEmployeeContribution,
    taxSavingsEmployee,
    socialSecuritySavingsEmployee,
    totalBenefit,
    exceedsTaxLimits,
    exceedsSocialSecurityLimits,
  }
}

/**
 * Calculate Betriebsrente pension taxation during payout phase
 *
 * @param monthlyPension - Monthly pension amount (before taxes)
 * @param year - Payout year
 * @param pensionIncreaseRate - Annual pension increase rate (default: 0.01 for 1%)
 * @param personalTaxRate - Personal income tax rate (0-1)
 * @param inStatutoryHealthInsurance - Whether in statutory health insurance (affects contribution rate)
 * @returns Pension taxation result for the year
 *
 * @remarks
 * Taxation during payout:
 * - 100% of bAV pension is subject to income tax (nachgelagerte Besteuerung)
 * - Full social security contributions apply:
 *   - Health insurance: ~7.3% (statutory) or 0% (private)
 *   - Care insurance: ~3.05% (without children) or ~4.0% (with children, childless surcharge)
 * - This is different from statutory pension (Gesetzliche Rente) which has partial taxation
 */
export function calculateBetriebsrentePensionTaxation(
  monthlyPension: number,
  year: number,
  pensionStartYear: number,
  pensionIncreaseRate: number,
  personalTaxRate: number,
  inStatutoryHealthInsurance = true,
  hasChildren = true,
): BetriebsrentePensionTaxationResult {
  // Calculate adjusted pension amount based on years since start
  const yearsSinceStart = Math.max(0, year - pensionStartYear)
  const adjustmentFactor = Math.pow(1 + pensionIncreaseRate, yearsSinceStart)
  const adjustedMonthlyPension = monthlyPension * adjustmentFactor

  const grossAnnualPension = adjustedMonthlyPension * 12
  const grossMonthlyPension = adjustedMonthlyPension

  // 100% of bAV pension is taxable
  const taxablePercentage = 100
  const taxableAmount = grossAnnualPension

  // Calculate income tax (simplified - assumes this is the only income or marginal rate)
  const incomeTax = taxableAmount * personalTaxRate

  // Calculate social security contributions (only in statutory health insurance)
  let healthInsuranceContribution = 0
  let careInsuranceContribution = 0

  if (inStatutoryHealthInsurance) {
    // Health insurance contribution: ~7.3% (average for retirees in statutory system)
    healthInsuranceContribution = grossAnnualPension * 0.073

    // Care insurance contribution: ~3.05% (with children) or ~4.0% (without children)
    const careInsuranceRate = hasChildren ? 0.0305 : 0.04
    careInsuranceContribution = grossAnnualPension * careInsuranceRate
  }

  const totalSocialSecurityContributions = healthInsuranceContribution + careInsuranceContribution

  // Net pension after all deductions
  const netAnnualPension = grossAnnualPension - incomeTax - totalSocialSecurityContributions

  return {
    grossAnnualPension,
    grossMonthlyPension,
    taxablePercentage,
    taxableAmount,
    incomeTax,
    healthInsuranceContribution,
    careInsuranceContribution,
    totalSocialSecurityContributions,
    netAnnualPension,
  }
}

/**
 * Result of lifetime benefit calculation
 */
export interface BetriebsrenteLifetimeBenefitResult {
  totalContributions: number
  totalTaxBenefitsContribution: number
  totalGrossPension: number
  totalNetPension: number
  totalTaxesPaid: number
  totalSocialSecurityPaid: number
  netLifetimeBenefit: number
  roi: number
}

/**
 * Calculate contribution phase totals
 */
function calculateContributionPhaseTotals(
  config: BetriebsrenteConfig,
  contributionStartYear: number,
  contributionEndYear: number,
  personalTaxRate: number,
  socialSecurityRate: number,
): { totalContributions: number; totalTaxBenefitsContribution: number } {
  let totalContributions = 0
  let totalTaxBenefitsContribution = 0

  for (let year = contributionStartYear; year <= contributionEndYear; year++) {
    const benefit = calculateBetriebsrenteTaxBenefit(
      config.annualEmployeeContribution,
      config.annualEmployerContribution,
      year,
      personalTaxRate,
      socialSecurityRate,
    )
    totalContributions += benefit.totalContribution
    totalTaxBenefitsContribution += benefit.totalBenefit
  }

  return { totalContributions, totalTaxBenefitsContribution }
}

/**
 * Calculate payout phase totals
 */
function calculatePayoutPhaseTotals(
  config: BetriebsrenteConfig,
  payoutEndYear: number,
  pensionTaxRate: number,
  inStatutoryHealthInsurance: boolean,
  hasChildren: boolean,
): {
  totalGrossPension: number
  totalNetPension: number
  totalTaxesPaid: number
  totalSocialSecurityPaid: number
} {
  let totalGrossPension = 0
  let totalNetPension = 0
  let totalTaxesPaid = 0
  let totalSocialSecurityPaid = 0

  for (let year = config.pensionStartYear; year <= payoutEndYear; year++) {
    const taxation = calculateBetriebsrentePensionTaxation(
      config.expectedMonthlyPension,
      year,
      config.pensionStartYear,
      config.pensionIncreaseRate,
      pensionTaxRate,
      inStatutoryHealthInsurance,
      hasChildren,
    )
    totalGrossPension += taxation.grossAnnualPension
    totalNetPension += taxation.netAnnualPension
    totalTaxesPaid += taxation.incomeTax
    totalSocialSecurityPaid += taxation.totalSocialSecurityContributions
  }

  return { totalGrossPension, totalNetPension, totalTaxesPaid, totalSocialSecurityPaid }
}

/**
 * Calculate total lifetime benefit of Betriebsrente
 *
 * Calculates total contributions, tax benefits, pension received, and ROI
 *
 * @param config - Betriebsrente configuration
 * @param contributionStartYear - Year when contributions start
 * @param contributionEndYear - Year when contributions end (retirement)
 * @param payoutEndYear - Year when pension payments end (death)
 * @param personalTaxRate - Personal income tax rate during working years
 * @param pensionTaxRate - Personal income tax rate during retirement
 * @param socialSecurityRate - Social security rate during working years
 * @param inStatutoryHealthInsurance - Whether in statutory health insurance during retirement
 * @param hasChildren - Whether retiree has children (affects care insurance rate)
 * @returns Total lifetime benefit analysis
 */
export function calculateBetriebsrenteLifetimeBenefit(
  config: BetriebsrenteConfig,
  contributionStartYear: number,
  contributionEndYear: number,
  payoutEndYear: number,
  personalTaxRate: number,
  pensionTaxRate: number,
  socialSecurityRate = 0.2,
  inStatutoryHealthInsurance = true,
  hasChildren = true,
): BetriebsrenteLifetimeBenefitResult {
  // Calculate contribution phase
  const { totalContributions, totalTaxBenefitsContribution } = calculateContributionPhaseTotals(
    config,
    contributionStartYear,
    contributionEndYear,
    personalTaxRate,
    socialSecurityRate,
  )

  // Calculate payout phase
  const { totalGrossPension, totalNetPension, totalTaxesPaid, totalSocialSecurityPaid } = calculatePayoutPhaseTotals(
    config,
    payoutEndYear,
    pensionTaxRate,
    inStatutoryHealthInsurance,
    hasChildren,
  )

  // Net lifetime benefit = total pension received - employee contributions + tax benefits
  // (employer contributions are "free money" so they're a pure benefit)
  const netLifetimeBenefit =
    totalNetPension -
    config.annualEmployeeContribution * (contributionEndYear - contributionStartYear + 1) +
    totalTaxBenefitsContribution

  // ROI calculation: (total benefit / total employee contribution) - 1
  const totalEmployeeContribution =
    config.annualEmployeeContribution * (contributionEndYear - contributionStartYear + 1)
  const roi =
    totalEmployeeContribution > 0 ? (totalNetPension + totalTaxBenefitsContribution) / totalEmployeeContribution - 1 : 0

  return {
    totalContributions,
    totalTaxBenefitsContribution,
    totalGrossPension,
    totalNetPension,
    totalTaxesPaid,
    totalSocialSecurityPaid,
    netLifetimeBenefit,
    roi,
  }
}
