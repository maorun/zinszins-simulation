import {
  DEFAULT_LOCALE,
  DEFAULT_CURRENCY,
  CURRENCY_DECIMAL_PLACES,
  CURRENCY_WHOLE_DECIMAL_PLACES,
  CURRENCY_FORMAT_THRESHOLDS,
} from './locale-constants'

/**
 * Format currency for display in German format
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: CURRENCY_DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY_DECIMAL_PLACES,
  }).format(amount)
}

/**
 * Format currency without decimal places (for large round amounts)
 */
export function formatCurrencyWhole(amount: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    minimumFractionDigits: CURRENCY_WHOLE_DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY_WHOLE_DECIMAL_PLACES,
  }).format(amount)
}

/**
 * Format currency in compact form for mobile displays
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= CURRENCY_FORMAT_THRESHOLDS.MILLION) {
    return `${(amount / CURRENCY_FORMAT_THRESHOLDS.MILLION).toFixed(CURRENCY_FORMAT_THRESHOLDS.MILLION_DECIMAL_PLACES)}M €`
  } else if (amount >= CURRENCY_FORMAT_THRESHOLDS.THOUSAND) {
    return `${(amount / CURRENCY_FORMAT_THRESHOLDS.THOUSAND).toFixed(CURRENCY_FORMAT_THRESHOLDS.THOUSAND_DECIMAL_PLACES)}k €`
  }
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
  }).format(amount)
}

/**
 * Format a number as a percentage with optional sign
 */
export function formatPercent(value: number, options?: { showSign?: boolean }): string {
  const sign = options?.showSign && value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(1)}%`
}

/**
 * Format a percentage number with German decimal separator
 * @param value - Already in percentage form (e.g., 7.5 for 7.5%)
 */
export function formatPercentGerman(value: number): string {
  return `${value.toFixed(1).replace('.', ',')}%`
}

/**
 * Format a percentage value (already in percentage form) for display
 * Used for exporting data where values are already percentages (5 instead of 0.05)
 */
export function formatPercentage(value: number): string {
  return value != null ? `${value.toFixed(2)}%` : '0.00%'
}

/**
 * Format a number in German format without currency symbol (for CSV exports)
 * @param amount - The number to format
 * @returns Formatted string with German decimal separator
 */
export function formatNumberGerman(amount: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    minimumFractionDigits: CURRENCY_DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY_DECIMAL_PLACES,
  }).format(amount)
}

/**
 * Format a percentage value as German percentage string (for Excel exports)
 * @param value - Percentage value (e.g., 7.5 for 7.5%)
 * @returns Formatted percentage string
 */
export function formatPercentageGerman(value: number): string {
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: 'percent',
    minimumFractionDigits: CURRENCY_DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY_DECIMAL_PLACES,
  }).format(value / 100)
}
