/**
 * Constants for withdrawal strategy configuration
 * Defines default values, ranges, and step sizes for various withdrawal strategies
 */

/**
 * Variable percentage withdrawal strategy constants
 */
export const VARIABLE_PERCENTAGE = {
  DEFAULT: 4,
  MIN: 1,
  MAX: 10,
  STEP: 0.5,
} as const

/**
 * Monthly fixed withdrawal strategy constants
 */
export const MONTHLY_AMOUNT = {
  DEFAULT: 2000,
  MIN: 0,
  STEP: 100,
} as const

/**
 * Dynamic withdrawal strategy constants
 */
export const DYNAMIC_STRATEGY = {
  BASIS_RATE: {
    DEFAULT: 4,
    MIN: 1,
    MAX: 10,
    STEP: 0.5,
  },
  UPPER_THRESHOLD: {
    DEFAULT: 8,
    MIN: 0,
    MAX: 20,
    STEP: 0.5,
  },
  LOWER_THRESHOLD: {
    DEFAULT: -8,
    MIN: -20,
    MAX: 0,
    STEP: 0.5,
  },
} as const

/**
 * Bucket strategy constants
 */
export const BUCKET_STRATEGY = {
  CASH_CUSHION: {
    DEFAULT: 20000,
    MIN: 1000,
    STEP: 1000,
  },
  BASE_RATE: {
    DEFAULT: 4,
    MIN: 1,
    MAX: 10,
    STEP: 0.1,
  },
} as const

/**
 * Return rate configuration constants
 */
export const RETURN_RATE = {
  DEFAULT: 5,
  MIN: 0,
  MAX: 15,
  STEP: 0.5,
} as const
