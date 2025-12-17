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
