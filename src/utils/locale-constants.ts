/**
 * Centralized locale and currency constants for consistent formatting across the application.
 *
 * These constants ensure that all number and currency formatting uses the same locale
 * and currency settings, making it easier to maintain and potentially internationalize
 * the application in the future.
 */

/**
 * Default locale for number and currency formatting
 * Using German locale (de-DE) as the application is targeted at German users
 */
export const DEFAULT_LOCALE = 'de-DE' as const

/**
 * Default currency code for the application
 * Using EUR as the primary currency for all financial calculations
 */
export const DEFAULT_CURRENCY = 'EUR' as const

/**
 * Standard number of decimal places for currency formatting
 */
export const CURRENCY_DECIMAL_PLACES = 2 as const

/**
 * Number of decimal places for whole currency amounts (no cents)
 */
export const CURRENCY_WHOLE_DECIMAL_PLACES = 0 as const

/**
 * Standard number of decimal places for percentage formatting
 */
export const PERCENTAGE_DECIMAL_PLACES = 2 as const

/**
 * Number of decimal places for compact percentage display (e.g., "7.5%")
 */
export const PERCENTAGE_COMPACT_DECIMAL_PLACES = 1 as const

/**
 * Currency formatting thresholds for compact display
 * Used to determine when to show amounts as "M €" (millions) or "k €" (thousands)
 */
export const CURRENCY_FORMAT_THRESHOLDS = {
  /**
   * Threshold for showing millions (1,000,000)
   * Amounts >= this value are formatted as "X.XM €"
   */
  MILLION: 1_000_000,

  /**
   * Threshold for showing thousands (1,000)
   * Amounts >= this value (but < MILLION) are formatted as "Xk €"
   */
  THOUSAND: 1_000,

  /**
   * Decimal places for million display (e.g., "1.5M €")
   */
  MILLION_DECIMAL_PLACES: 1,

  /**
   * Decimal places for thousand display (e.g., "150k €")
   */
  THOUSAND_DECIMAL_PLACES: 0,
} as const
