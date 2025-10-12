import { formatCurrency } from '../utils/currency'
import { formatInflationAdjustedValue } from '../utils/currency'

interface CalculateRealValueParams {
  nominalValue: number
  currentYear: number
  allYears: (number | null | undefined)[]
  inflationRate: number
}

/**
 * Calculate inflation-adjusted real value
 * Converts nominal value to base year purchasing power
 */
export function calculateRealValue(params: CalculateRealValueParams): number {
  const { nominalValue, currentYear, allYears, inflationRate } = params

  // Find the base year (earliest year in the data)
  const validYears = allYears.filter((year): year is number => year != null)
  const baseYear = validYears.length > 0 ? Math.min(...validYears) : currentYear

  const yearsFromBase = currentYear - baseYear

  // For base year (yearsFromBase = 0): nominal = real
  // For future years (yearsFromBase > 0): money is worth less due to inflation
  if (yearsFromBase === 0) {
    return nominalValue // Base year: nominal equals real
  }

  return nominalValue / Math.pow(1 + inflationRate, yearsFromBase)
}

interface FormatWithInflationParams {
  nominalValue: number
  currentYear: number
  allYears: (number | null | undefined)[]
  inflationActive: boolean
  inflationRatePercent: number | undefined
  showIcon?: boolean
}

/**
 * Format value with inflation adjustment if active
 */
export function formatValueWithInflation(params: FormatWithInflationParams): string {
  const {
    nominalValue,
    currentYear,
    allYears,
    inflationActive,
    inflationRatePercent,
    showIcon = false,
  } = params

  // If inflation is not active, just format the nominal value
  if (!inflationActive || !inflationRatePercent) {
    return formatCurrency(nominalValue)
  }

  const inflationRate = inflationRatePercent / 100
  const realValue = calculateRealValue({
    nominalValue,
    currentYear,
    allYears,
    inflationRate,
  })

  return formatInflationAdjustedValue(nominalValue, realValue, showIcon)
}
