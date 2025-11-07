/**
 * Format currency for display in German format
 * 
 * @param amount - Amount to format in EUR
 * @returns Formatted currency string (e.g., "1.234,56 €")
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Format currency in compact form for mobile displays
 * 
 * @param amount - Amount to format in EUR
 * @returns Compact currency string (e.g., "1.2M €" or "5k €")
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M €`
  } else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k €`
  }
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Format a number as a percentage with optional sign
 * 
 * @param value - Value to format as decimal (e.g., 0.05 for 5%)
 * @param options - Optional formatting options
 * @param options.showSign - Whether to show '+' sign for positive values
 * @returns Formatted percentage string (e.g., "5.0%" or "+5.0%")
 */
export function formatPercent(value: number, options?: { showSign?: boolean }): string {
  const sign = options?.showSign && value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(1)}%`
}
