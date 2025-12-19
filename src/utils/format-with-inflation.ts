import { formatValueWithInflation } from '../components/inflation-helpers'
import type { WithdrawalFormValue } from './config-storage'

/**
 * Format a monetary value with inflation adjustment for display
 *
 * This is a convenience wrapper around formatValueWithInflation that adapts
 * the withdrawal form configuration to the inflation formatter's interface.
 *
 * When inflation is enabled, displays values in real terms (today's purchasing power)
 * with an inflation icon indicator. This helps users understand the actual value
 * of future money in terms of current purchasing power.
 *
 * @param params - Configuration object
 * @param params.value - Nominal value to format (in future euros)
 * @param params.year - Year the value represents
 * @param params.allYears - Array of all years in the simulation period
 * @param params.formValue - Withdrawal form configuration containing inflation settings
 * @param params.showIcon - Whether to show the inflation adjustment icon (default: depends on formatter)
 * @returns Formatted currency string, optionally with inflation adjustment and icon
 *
 * @example
 * ```typescript
 * // Format a future value with inflation adjustment
 * const formatted = formatWithInflation({
 *   value: 50000,
 *   year: 2050,
 *   allYears: [2024, 2025, ..., 2050],
 *   formValue: {
 *     inflationAktiv: true,
 *     inflationsrate: 2.0  // 2% annual inflation
 *   },
 *   showIcon: true
 * })
 * // Returns: "34,512.34 € 📉" (showing reduced purchasing power)
 * ```
 */
export function formatWithInflation(params: {
  value: number
  year: number
  allYears: Array<number | null | undefined>
  formValue: WithdrawalFormValue
  showIcon?: boolean
}): string {
  return formatValueWithInflation({
    nominalValue: params.value,
    currentYear: params.year,
    allYears: params.allYears,
    inflationActive: params.formValue.inflationAktiv || false,
    inflationRatePercent: params.formValue.inflationsrate,
    showIcon: params.showIcon,
  })
}
