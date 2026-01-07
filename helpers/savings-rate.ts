/**
 * Savings Rate (Sparquote) Calculation Module
 *
 * This module calculates the savings rate, which is the percentage of income
 * that is being saved towards investments. This is a key metric for financial planning.
 */

import type { SparplanElement } from '../src/utils/sparplan-utils'

/**
 * Configuration for savings rate calculation
 */
export interface SavingsRateConfig {
  /** Annual gross income (EUR) */
  annualGrossIncome: number

  /** Whether to consider only active savings plans */
  onlyActivePlans?: boolean

  /** Tax rate for income (default: 30% typical German effective rate) */
  incomeTaxRate?: number
}

/**
 * Savings rate calculation result
 */
export interface SavingsRateResult {
  /** Total annual savings amount (EUR) */
  annualSavings: number

  /** Annual net income after taxes (EUR) */
  annualNetIncome: number

  /** Savings rate as percentage (0-100) */
  savingsRatePercentage: number

  /** Monthly savings amount (EUR) */
  monthlySavings: number

  /** Monthly net income (EUR) */
  monthlyNetIncome: number

  /** Monthly savings rate as percentage (0-100) */
  monthlySavingsRatePercentage: number
}

/**
 * Calculate total annual savings from savings plans
 *
 * @param sparplanElements - Array of savings plan elements
 * @param onlyActive - Whether to only consider active plans (default: true)
 * @returns Total annual savings amount in EUR
 */
export function calculateAnnualSavings(sparplanElements: SparplanElement[], onlyActive = true): number {
  return sparplanElements.reduce((total, element) => {
    // Skip inactive elements if onlyActive is true
    if (onlyActive && !element.aktiv) {
      return total
    }

    // Calculate annual amount based on interval
    let annualAmount = 0
    if (element.interval === 'monatlich') {
      annualAmount = element.betrag * 12
    } else if (element.interval === 'jaehrlich') {
      annualAmount = element.betrag
    }

    return total + annualAmount
  }, 0)
}

/**
 * Calculate savings rate (Sparquote)
 *
 * The savings rate is the percentage of net income that is being saved.
 * This is a fundamental metric in personal finance planning.
 *
 * Formula:
 * - Savings Rate = (Annual Savings / Annual Net Income) × 100
 * - Net Income = Gross Income × (1 - Tax Rate)
 *
 * @param sparplanElements - Array of savings plan elements
 * @param config - Configuration for savings rate calculation
 * @returns Savings rate calculation result
 *
 * @example
 * ```typescript
 * const result = calculateSavingsRate(sparplanElements, {
 *   annualGrossIncome: 60000,
 *   incomeTaxRate: 0.30,
 *   onlyActivePlans: true
 * })
 * console.log(`Sparquote: ${result.savingsRatePercentage.toFixed(1)}%`)
 * ```
 */
export function calculateSavingsRate(
  sparplanElements: SparplanElement[],
  config: SavingsRateConfig,
): SavingsRateResult {
  const { annualGrossIncome, onlyActivePlans = true, incomeTaxRate = 0.3 } = config

  // Calculate total annual savings
  const annualSavings = calculateAnnualSavings(sparplanElements, onlyActivePlans)

  // Calculate net income after taxes
  const annualNetIncome = annualGrossIncome * (1 - incomeTaxRate)

  // Calculate savings rate percentage
  const savingsRatePercentage = annualNetIncome > 0 ? (annualSavings / annualNetIncome) * 100 : 0

  // Calculate monthly values
  const monthlySavings = annualSavings / 12
  const monthlyNetIncome = annualNetIncome / 12
  const monthlySavingsRatePercentage = savingsRatePercentage

  return {
    annualSavings,
    annualNetIncome,
    savingsRatePercentage,
    monthlySavings,
    monthlyNetIncome,
    monthlySavingsRatePercentage,
  }
}

/**
 * Classify savings rate according to common financial planning benchmarks
 *
 * @param savingsRatePercentage - Savings rate as percentage
 * @returns Classification level and description
 */
export function classifySavingsRate(savingsRatePercentage: number): {
  level: 'excellent' | 'good' | 'moderate' | 'low'
  label: string
  color: string
} {
  if (savingsRatePercentage >= 20) {
    return { level: 'excellent', label: 'Hervorragend', color: 'green' }
  } else if (savingsRatePercentage >= 15) {
    return { level: 'good', label: 'Gut', color: 'blue' }
  } else if (savingsRatePercentage >= 10) {
    return { level: 'moderate', label: 'Durchschnittlich', color: 'yellow' }
  } else {
    return { level: 'low', label: 'Niedrig', color: 'red' }
  }
}
