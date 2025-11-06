/**
 * Format currency for display in German format
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
 */
export function formatCompactCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M €`
  }
  else if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}k €`
  }
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}

/**
 * Format a number as a percentage with optional sign
 */
export function formatPercent(value: number, options?: { showSign?: boolean }): string {
  const sign = options?.showSign && value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(1)}%`
}
