/**
 * Business constants for the application
 * 
 * This module contains domain-specific constants for retirement planning,
 * tax calculations, and financial thresholds used throughout the application.
 */

/**
 * Retirement readiness income thresholds
 * These values are used to assess whether retirement income is adequate
 */
export const RETIREMENT_INCOME_THRESHOLDS = {
  /**
   * Minimum acceptable monthly income during retirement (in EUR)
   * Below this threshold, retirement income is considered inadequate
   */
  MIN_MONTHLY_INCOME: 2000,

  /**
   * Good monthly income during retirement (in EUR)
   * At or above this threshold, retirement income is considered good
   */
  GOOD_MONTHLY_INCOME: 3000,
} as const

/**
 * Safe withdrawal rule constants
 * Based on the 4% safe withdrawal rule for retirement planning
 */
export const SAFE_WITHDRAWAL_RULE = {
  /**
   * Capital multiplier for the 4% safe withdrawal rule
   * Capital should be at least 25x annual expenses (100% / 4% = 25)
   */
  CAPITAL_MULTIPLIER: 25,

  /**
   * Standard safe withdrawal rate (as a decimal)
   */
  SAFE_WITHDRAWAL_RATE: 0.04,
} as const

/**
 * Default German tax rates
 * These are commonly used defaults, but should be configurable in the application
 */
export const DEFAULT_TAX_RATES = {
  /**
   * Default Kapitalertragsteuer (capital gains tax) including solidarity surcharge
   * 25% + 5.5% solidarity surcharge = 26.375%
   */
  KAPITALERTRAGSTEUER: 0.26375,

  /**
   * Default Teilfreistellungsquote (partial exemption) for equity funds
   * 30% for stock funds (Aktienfonds)
   */
  TEILFREISTELLUNGSQUOTE_AKTIEN: 0.3,

  /**
   * Teilfreistellungsquote for mixed funds (Mischfonds)
   */
  TEILFREISTELLUNGSQUOTE_MISCH: 0.15,

  /**
   * Teilfreistellungsquote for real estate funds (Immobilienfonds)
   */
  TEILFREISTELLUNGSQUOTE_IMMOBILIEN: 0.6,
} as const

/**
 * Percentile constants for value-at-risk and confidence level calculations
 */
export const PERCENTILE_CONSTANTS = {
  /**
   * Base value for percentile calculations (100%)
   */
  BASE: 100,
} as const
