/**
 * Utility functions for calculating inflation-adjusted (real) values
 * This module provides functions to convert nominal values to real purchasing power
 */

/**
 * Calculate the real (inflation-adjusted) value of a nominal amount
 * @param nominalValue - The nominal value in current/future money
 * @param inflationRate - The annual inflation rate (as decimal, e.g., 0.02 for 2%)
 * @param years - Number of years from base year to the value's year
 * @returns The real value in base year purchasing power
 */
export function calculateRealValue(
  nominalValue: number,
  inflationRate: number,
  years: number,
): number {
  if (inflationRate <= 0 || years <= 0) {
    return nominalValue
  }
  return nominalValue / Math.pow(1 + inflationRate, years)
}

/**
 * Calculate inflation-adjusted values for a series of yearly data
 * @param yearlyData - Object with year as key and nominal value as value
 * @param baseYear - The base year for real value calculation
 * @param inflationRate - The annual inflation rate (as decimal)
 * @returns Object with year as key and object containing nominal and real values
 */
export function calculateYearlyInflationAdjustedValues(
  yearlyData: Record<number, number>,
  baseYear: number,
  inflationRate: number,
): Record<number, { nominal: number, real: number }> {
  const result: Record<number, { nominal: number, real: number }> = {}

  for (const [yearStr, nominalValue] of Object.entries(yearlyData)) {
    const year = parseInt(yearStr)
    const yearsFromBase = year - baseYear
    const realValue = calculateRealValue(nominalValue, inflationRate, yearsFromBase)

    result[year] = {
      nominal: nominalValue,
      real: realValue,
    }
  }

  return result
}

/**
 * Get cumulative inflation factor from base year to target year
 * @param inflationRate - The annual inflation rate (as decimal)
 * @param years - Number of years from base year
 * @returns The cumulative inflation factor (1.0 = no inflation)
 */
export function getCumulativeInflationFactor(
  inflationRate: number,
  years: number,
): number {
  if (inflationRate <= 0 || years <= 0) {
    return 1.0
  }
  return Math.pow(1 + inflationRate, years)
}

/**
 * Format inflation-adjusted values for display
 * @param nominal - The nominal value
 * @param real - The real (inflation-adjusted) value
 * @param showInflationAdjusted - Whether to show the real value
 * @returns Formatted string for display
 */
export function formatInflationAdjustedValue(
  nominal: number,
  real: number,
  showInflationAdjusted: boolean,
): string {
  const nominalFormatted = nominal.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  })

  if (!showInflationAdjusted) {
    return nominalFormatted
  }

  const realFormatted = real.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
  })

  return `${nominalFormatted} / ${realFormatted} real`
}
