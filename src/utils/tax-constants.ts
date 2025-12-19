/**
 * Centralized German tax constants for consistent usage across the application
 *
 * This module contains common tax-related constants used throughout the application.
 * All amounts are in euros (€).
 */

/**
 * Sparerpauschbetrag (Capital Gains Tax Allowance) constants for 2024
 *
 * The Sparerpauschbetrag is the annual tax-free allowance for investment income
 * (dividends, interest, capital gains) in Germany.
 *
 * As of 2024, each individual has an allowance of 2,000€ per year.
 */
export const FREIBETRAG_CONSTANTS = {
  /**
   * Individual Sparerpauschbetrag (per person)
   * @since 2024 (previously 1,000€ before 2023)
   */
  INDIVIDUAL: 2000,

  /**
   * Couple Sparerpauschbetrag (combined for married couples filing jointly)
   * This is exactly double the individual amount
   */
  COUPLE: 4000,

  /**
   * Legacy individual amount (before 2023 tax reform)
   * Kept for historical calculations and backwards compatibility
   * @deprecated Use INDIVIDUAL for current calculations
   */
  LEGACY_INDIVIDUAL: 1000,

  /**
   * Legacy couple amount (before 2023 tax reform)
   * @deprecated Use COUPLE for current calculations
   */
  LEGACY_COUPLE: 2000,
} as const

/**
 * Helper function to get the appropriate Freibetrag based on planning mode
 * @param planningMode - Whether planning for 'individual' or 'couple'
 * @returns The applicable Freibetrag amount in euros
 */
export function getFreibetragForPlanningMode(planningMode: 'individual' | 'couple'): number {
  return planningMode === 'couple' ? FREIBETRAG_CONSTANTS.COUPLE : FREIBETRAG_CONSTANTS.INDIVIDUAL
}

/**
 * Check if a given amount matches a standard Freibetrag value
 * Useful for determining if user has customized the value
 * @param amount - The amount to check
 * @returns true if the amount is a standard Freibetrag value
 */
export function isStandardFreibetragValue(amount: number): boolean {
  return (
    amount === FREIBETRAG_CONSTANTS.INDIVIDUAL ||
    amount === FREIBETRAG_CONSTANTS.COUPLE ||
    amount === FREIBETRAG_CONSTANTS.LEGACY_INDIVIDUAL ||
    amount === FREIBETRAG_CONSTANTS.LEGACY_COUPLE
  )
}
