/**
 * Pension Comparison Calculator
 * 
 * Provides side-by-side comparison of different German pension insurance types:
 * - Statutory Pension (Gesetzliche Rente)
 * - Riester-Rente (state-subsidized private pension)
 * - Rürup-Rente (Basis-Rente for self-employed)
 * - Betriebsrente (bAV - company pension)
 * 
 * Helps users make informed decisions about retirement planning by comparing:
 * - Annual contributions during working years
 * - Tax benefits during contribution phase
 * - Net retirement income during payout phase
 * - Return on investment (ROI)
 */

import type { StatutoryPensionConfig } from './statutory-pension'
import { type RiesterRenteConfig, calculateRiesterTaxBenefit } from './riester-rente'
import { type RuerupRenteConfig, calculateRuerupTaxDeduction } from './ruerup-rente'
import {
  type BetriebsrenteConfig,
  type BetriebsrenteLifetimeBenefitResult,
  calculateBetriebsrenteTaxBenefit,
  calculateBetriebsrenteLifetimeBenefit,
} from './betriebsrente'

/**
 * Configuration for pension comparison
 */
export interface PensionComparisonConfig {
  /** Current year for contribution calculations */
  currentYear: number

  /** Starting year for pension payments (retirement year) */
  pensionStartYear: number

  /** End year for pension payments (expected end of life) */
  pensionEndYear: number

  /** Personal income tax rate during working years (0-1) */
  personalTaxRate: number

  /** Personal income tax rate during retirement (0-1, typically lower) */
  pensionTaxRate: number

  /** Annual gross income (for Riester Mindesteigenbeitrag calculation) */
  annualGrossIncome: number

  /** Social security rate during working years (0-1, typically 0.20) */
  socialSecurityRate: number

  /** Whether in statutory health insurance during retirement */
  inStatutoryHealthInsurance: boolean

  /** Whether retiree has children (affects care insurance rate) */
  hasChildren: boolean

  /** Statutory pension configuration (if enabled) */
  statutoryPension?: StatutoryPensionConfig

  /** Riester-Rente configuration (if enabled) */
  riesterRente?: RiesterRenteConfig

  /** Rürup-Rente configuration (if enabled) */
  ruerupRente?: RuerupRenteConfig

  /** Betriebsrente configuration (if enabled) */
  betriebsrente?: BetriebsrenteConfig
}

/**
 * Comparison result for a single pension type
 */
export interface PensionTypeComparison {
  /** Name of the pension type */
  type: 'statutory' | 'riester' | 'ruerup' | 'betriebsrente'

  /** Display name in German */
  displayName: string

  /** Whether this pension type is enabled */
  enabled: boolean

  /** Annual employee contribution during working years */
  annualContribution: number

  /** Annual employer contribution (only for Betriebsrente) */
  annualEmployerContribution: number

  /** Annual tax benefit during contribution phase */
  annualTaxBenefit: number

  /** Expected monthly pension amount (before taxes) */
  monthlyPensionGross: number

  /** Expected monthly pension amount (after taxes and social security) */
  monthlyPensionNet: number

  /** Estimated annual net pension */
  annualPensionNet: number

  /** Total contributions over working life */
  totalContributions: number

  /** Total tax benefits during contribution phase */
  totalTaxBenefits: number

  /** Total net pension received over retirement */
  totalNetPension: number

  /** Return on investment (ROI) */
  roi: number

  /** Net lifetime benefit (total pension - contributions + tax benefits) */
  netLifetimeBenefit: number
}

/**
 * Complete pension comparison result
 */
export interface PensionComparisonResult {
  /** Individual comparisons for each pension type */
  comparisons: PensionTypeComparison[]

  /** Summary statistics */
  summary: {
    /** Total annual contributions across all pension types */
    totalAnnualContributions: number

    /** Total annual tax benefits across all pension types */
    totalAnnualTaxBenefits: number

    /** Total monthly net pension from all sources */
    totalMonthlyPensionNet: number

    /** Total annual net pension from all sources */
    totalAnnualPensionNet: number

    /** Combined ROI across all pension types */
    combinedROI: number

    /** Combined net lifetime benefit */
    combinedNetLifetimeBenefit: number
  }

  /** Pension type with highest ROI */
  bestROI: PensionTypeComparison | null

  /** Pension type with highest net lifetime benefit */
  bestNetBenefit: PensionTypeComparison | null
}

/**
 * Calculate comparison for statutory pension
 */
function calculateStatutoryPensionComparison(
  config: StatutoryPensionConfig,
  pensionEndYear: number
): PensionTypeComparison {
  // Statutory pension is paid by the state, no direct employee contributions
  // (contributions are part of social security, not tracked separately here)
  const monthlyGross = config.monthlyAmount
  const monthlyNet = monthlyGross * (1 - config.taxablePercentage / 100) // Simplified

  return {
    type: 'statutory',
    displayName: 'Gesetzliche Rente',
    enabled: true,
    annualContribution: 0, // Paid through social security, not direct contribution
    annualEmployerContribution: 0,
    annualTaxBenefit: 0,
    monthlyPensionGross: monthlyGross,
    monthlyPensionNet: monthlyNet,
    annualPensionNet: monthlyNet * 12,
    totalContributions: 0,
    totalTaxBenefits: 0,
    totalNetPension: monthlyNet * 12 * (pensionEndYear - config.startYear + 1),
    roi: 0, // Cannot calculate ROI without contribution tracking
    netLifetimeBenefit: monthlyNet * 12 * (pensionEndYear - config.startYear + 1),
  }
}

/**
 * Calculate comparison for Riester-Rente
 */
function calculateRiesterRenteComparison(
  config: RiesterRenteConfig,
  currentYear: number,
  pensionEndYear: number,
  annualGrossIncome: number,
  personalTaxRate: number
): PensionTypeComparison {
  // Calculate tax benefit for current year
  const taxBenefit = calculateRiesterTaxBenefit(
    config.annualContribution,
    annualGrossIncome,
    config.numberOfChildren,
    config.childrenBirthYears,
    currentYear,
    personalTaxRate
  )

  const yearsOfContribution = config.pensionStartYear - currentYear
  const yearsOfPension = pensionEndYear - config.pensionStartYear + 1

  // Simplified net calculation (100% taxable for Riester)
  const monthlyNet = config.expectedMonthlyPension * (1 - personalTaxRate)

  return {
    type: 'riester',
    displayName: 'Riester-Rente',
    enabled: true,
    annualContribution: config.annualContribution,
    annualEmployerContribution: 0,
    annualTaxBenefit: taxBenefit.totalBenefit,
    monthlyPensionGross: config.expectedMonthlyPension,
    monthlyPensionNet: monthlyNet,
    annualPensionNet: monthlyNet * 12,
    totalContributions: config.annualContribution * yearsOfContribution,
    totalTaxBenefits: taxBenefit.totalBenefit * yearsOfContribution,
    totalNetPension: monthlyNet * 12 * yearsOfPension,
    roi:
      config.annualContribution > 0
        ? (monthlyNet * 12 * yearsOfPension + taxBenefit.totalBenefit * yearsOfContribution) /
            (config.annualContribution * yearsOfContribution) -
          1
        : 0,
    netLifetimeBenefit:
      monthlyNet * 12 * yearsOfPension -
      config.annualContribution * yearsOfContribution +
      taxBenefit.totalBenefit * yearsOfContribution,
  }
}

/**
 * Calculate comparison for Rürup-Rente
 */
function calculateRuerupRenteComparison(
  config: RuerupRenteConfig,
  currentYear: number,
  pensionEndYear: number,
  personalTaxRate: number,
  pensionTaxRate: number
): PensionTypeComparison {
  // Calculate tax deduction for current year
  const taxDeduction = calculateRuerupTaxDeduction(
    config.annualContribution,
    currentYear,
    config.civilStatus,
    personalTaxRate
  )

  const yearsOfContribution = config.pensionStartYear - currentYear
  const yearsOfPension = pensionEndYear - config.pensionStartYear + 1

  // Simplified net calculation (taxable based on pension start year)
  const monthlyNet = config.expectedMonthlyPension * (1 - pensionTaxRate)

  return {
    type: 'ruerup',
    displayName: 'Rürup-Rente',
    enabled: true,
    annualContribution: config.annualContribution,
    annualEmployerContribution: 0,
    annualTaxBenefit: taxDeduction.estimatedTaxSavings,
    monthlyPensionGross: config.expectedMonthlyPension,
    monthlyPensionNet: monthlyNet,
    annualPensionNet: monthlyNet * 12,
    totalContributions: config.annualContribution * yearsOfContribution,
    totalTaxBenefits: taxDeduction.estimatedTaxSavings * yearsOfContribution,
    totalNetPension: monthlyNet * 12 * yearsOfPension,
    roi:
      config.annualContribution > 0
        ? (monthlyNet * 12 * yearsOfPension + taxDeduction.estimatedTaxSavings * yearsOfContribution) /
            (config.annualContribution * yearsOfContribution) -
          1
        : 0,
    netLifetimeBenefit:
      monthlyNet * 12 * yearsOfPension -
      config.annualContribution * yearsOfContribution +
      taxDeduction.estimatedTaxSavings * yearsOfContribution,
  }
}

/**
 * Calculate comparison for Betriebsrente
 */
function calculateBetriebsrenteComparison(
  config: BetriebsrenteConfig,
  currentYear: number,
  pensionEndYear: number,
  personalTaxRate: number,
  pensionTaxRate: number,
  socialSecurityRate: number,
  inStatutoryHealthInsurance: boolean,
  hasChildren: boolean
): PensionTypeComparison {
  // Calculate tax benefit for current year
  const taxBenefit = calculateBetriebsrenteTaxBenefit(
    config.annualEmployeeContribution,
    config.annualEmployerContribution,
    currentYear,
    personalTaxRate,
    socialSecurityRate
  )

  // Calculate lifetime benefit
  const lifetimeBenefit: BetriebsrenteLifetimeBenefitResult = calculateBetriebsrenteLifetimeBenefit(
    config,
    currentYear,
    config.pensionStartYear - 1,
    pensionEndYear,
    personalTaxRate,
    pensionTaxRate,
    socialSecurityRate,
    inStatutoryHealthInsurance,
    hasChildren
  )

  const yearsOfPension = pensionEndYear - config.pensionStartYear + 1
  const monthlyNet = lifetimeBenefit.totalNetPension / yearsOfPension / 12

  return {
    type: 'betriebsrente',
    displayName: 'Betriebliche Altersvorsorge',
    enabled: true,
    annualContribution: config.annualEmployeeContribution,
    annualEmployerContribution: config.annualEmployerContribution,
    annualTaxBenefit: taxBenefit.totalBenefit,
    monthlyPensionGross: config.expectedMonthlyPension,
    monthlyPensionNet: monthlyNet,
    annualPensionNet: monthlyNet * 12,
    totalContributions: lifetimeBenefit.totalContributions,
    totalTaxBenefits: lifetimeBenefit.totalTaxBenefitsContribution,
    totalNetPension: lifetimeBenefit.totalNetPension,
    roi: lifetimeBenefit.roi,
    netLifetimeBenefit: lifetimeBenefit.netLifetimeBenefit,
  }
}

/**
 * Create empty comparison for disabled pension type
 */
function createEmptyComparison(
  type: 'statutory' | 'riester' | 'ruerup' | 'betriebsrente',
  displayName: string
): PensionTypeComparison {
  return {
    type,
    displayName,
    enabled: false,
    annualContribution: 0,
    annualEmployerContribution: 0,
    annualTaxBenefit: 0,
    monthlyPensionGross: 0,
    monthlyPensionNet: 0,
    annualPensionNet: 0,
    totalContributions: 0,
    totalTaxBenefits: 0,
    totalNetPension: 0,
    roi: 0,
    netLifetimeBenefit: 0,
  }
}

/**
 * Build all comparisons array
 */
function buildComparisons(config: PensionComparisonConfig): PensionTypeComparison[] {
  return [
    buildStatutoryComparison(config),
    buildRiesterComparison(config),
    buildRuerupComparison(config),
    buildBetriebsrenteComparison(config),
  ]
}

/**
 * Build statutory pension comparison
 */
function buildStatutoryComparison(config: PensionComparisonConfig): PensionTypeComparison {
  if (config.statutoryPension?.enabled) {
    return calculateStatutoryPensionComparison(config.statutoryPension, config.pensionEndYear)
  }
  return createEmptyComparison('statutory', 'Gesetzliche Rente')
}

/**
 * Build Riester comparison
 */
function buildRiesterComparison(config: PensionComparisonConfig): PensionTypeComparison {
  if (config.riesterRente?.enabled) {
    return calculateRiesterRenteComparison(
      config.riesterRente,
      config.currentYear,
      config.pensionEndYear,
      config.annualGrossIncome,
      config.personalTaxRate
    )
  }
  return createEmptyComparison('riester', 'Riester-Rente')
}

/**
 * Build Rürup comparison
 */
function buildRuerupComparison(config: PensionComparisonConfig): PensionTypeComparison {
  if (config.ruerupRente?.enabled) {
    return calculateRuerupRenteComparison(
      config.ruerupRente,
      config.currentYear,
      config.pensionEndYear,
      config.personalTaxRate,
      config.pensionTaxRate
    )
  }
  return createEmptyComparison('ruerup', 'Rürup-Rente')
}

/**
 * Build Betriebsrente comparison
 */
function buildBetriebsrenteComparison(config: PensionComparisonConfig): PensionTypeComparison {
  if (config.betriebsrente?.enabled) {
    return calculateBetriebsrenteComparison(
      config.betriebsrente,
      config.currentYear,
      config.pensionEndYear,
      config.personalTaxRate,
      config.pensionTaxRate,
      config.socialSecurityRate,
      config.inStatutoryHealthInsurance,
      config.hasChildren
    )
  }
  return createEmptyComparison('betriebsrente', 'Betriebliche Altersvorsorge')
}

/**
 * Calculate summary statistics
 */
function calculateSummary(comparisons: PensionTypeComparison[]) {
  const enabled = comparisons.filter((c) => c.enabled)
  const totalContributions = enabled.reduce((sum, c) => sum + c.totalContributions, 0)

  return {
    totalAnnualContributions: enabled.reduce((sum, c) => sum + c.annualContribution, 0),
    totalAnnualTaxBenefits: enabled.reduce((sum, c) => sum + c.annualTaxBenefit, 0),
    totalMonthlyPensionNet: enabled.reduce((sum, c) => sum + c.monthlyPensionNet, 0),
    totalAnnualPensionNet: enabled.reduce((sum, c) => sum + c.annualPensionNet, 0),
    combinedROI:
      totalContributions > 0
        ? (enabled.reduce((sum, c) => sum + c.totalNetPension, 0) +
            enabled.reduce((sum, c) => sum + c.totalTaxBenefits, 0)) /
            totalContributions -
          1
        : 0,
    combinedNetLifetimeBenefit: enabled.reduce((sum, c) => sum + c.netLifetimeBenefit, 0),
  }
}

/**
 * Find best options
 */
function findBestOptions(comparisons: PensionTypeComparison[]): {
  bestROI: PensionTypeComparison | null
  bestNetBenefit: PensionTypeComparison | null
} {
  const enabled = comparisons.filter((c) => c.enabled)

  const bestROI =
    enabled.length > 0 ? enabled.reduce((best, current) => (current.roi > best.roi ? current : best)) : null

  const bestNetBenefit =
    enabled.length > 0
      ? enabled.reduce((best, current) => (current.netLifetimeBenefit > best.netLifetimeBenefit ? current : best))
      : null

  return { bestROI, bestNetBenefit }
}

/**
 * Compare all pension types side-by-side
 * 
 * @param config - Pension comparison configuration
 * @returns Complete comparison result with summary and rankings
 */
export function comparePensionTypes(config: PensionComparisonConfig): PensionComparisonResult {
  const comparisons = buildComparisons(config)
  const summary = calculateSummary(comparisons)
  const { bestROI, bestNetBenefit } = findBestOptions(comparisons)

  return {
    comparisons,
    summary,
    bestROI,
    bestNetBenefit,
  }
}
