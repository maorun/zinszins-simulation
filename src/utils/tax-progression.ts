/**
 * Tax Progression Visualization Utilities
 *
 * This module provides functions to calculate and visualize the German progressive income tax system.
 * It shows how tax rates and amounts change across different income levels.
 */

import { calculateGermanIncomeTax } from '../../helpers/progressionsvorbehalt'

export interface TaxProgressionDataPoint {
  /** Income amount in euros */
  income: number
  /** Total tax amount in euros */
  taxAmount: number
  /** Average tax rate (Durchschnittssteuersatz) as percentage (0-100) */
  averageTaxRate: number
  /** Marginal tax rate (Grenzsteuersatz) as percentage (0-100) */
  marginalTaxRate: number
  /** Tax zone indicator */
  zone: 'grundfreibetrag' | 'zone1' | 'zone2' | 'zone3' | 'reichensteuer'
}

/**
 * Determine which tax zone an income falls into
 */
export function getTaxZone(
  income: number,
  grundfreibetrag = 11604,
): 'grundfreibetrag' | 'zone1' | 'zone2' | 'zone3' | 'reichensteuer' {
  if (income <= grundfreibetrag) {
    return 'grundfreibetrag'
  } else if (income <= 62809) {
    return 'zone1' // 14% - 24%
  } else if (income <= 277825) {
    return 'zone2' // 24% - 42%
  } else if (income <= 277826) {
    return 'zone3' // 42%
  } else {
    return 'reichensteuer' // 45%
  }
}

/**
 * Get user-friendly label for a tax zone
 */
export function getTaxZoneLabel(zone: TaxProgressionDataPoint['zone']): string {
  switch (zone) {
    case 'grundfreibetrag':
      return 'Grundfreibetrag (0%)'
    case 'zone1':
      return 'Lineare Zone (14%-24%)'
    case 'zone2':
      return 'Progressionszone (24%-42%)'
    case 'zone3':
      return 'Spitzensteuersatz (42%)'
    case 'reichensteuer':
      return 'Reichensteuer (45%)'
  }
}

/**
 * Calculate marginal tax rate at a specific income level
 * This is the tax rate on the next euro earned
 */
export function calculateMarginalTaxRate(income: number, grundfreibetrag = 11604, delta = 100): number {
  if (income <= 0) return 0

  const taxAtIncome = calculateGermanIncomeTax(income, grundfreibetrag)
  const taxAtIncomeWithDelta = calculateGermanIncomeTax(income + delta, grundfreibetrag)
  const marginalTax = taxAtIncomeWithDelta - taxAtIncome

  return (marginalTax / delta) * 100 // Return as percentage
}

/**
 * Generate tax progression data points for visualization
 * @param minIncome - Minimum income to visualize (default: 0)
 * @param maxIncome - Maximum income to visualize (default: 300000)
 * @param steps - Number of data points to generate (default: 100)
 * @param grundfreibetrag - Basic tax allowance (default: 11604)
 */
export function generateTaxProgressionData(
  minIncome = 0,
  maxIncome = 300000,
  steps = 100,
  grundfreibetrag = 11604,
): TaxProgressionDataPoint[] {
  const stepSize = (maxIncome - minIncome) / (steps - 1)
  const dataPoints: TaxProgressionDataPoint[] = []

  for (let i = 0; i < steps; i++) {
    const income = minIncome + stepSize * i
    const taxAmount = calculateGermanIncomeTax(income, grundfreibetrag)
    const averageTaxRate = income > 0 ? (taxAmount / income) * 100 : 0
    const marginalTaxRate = calculateMarginalTaxRate(income, grundfreibetrag)
    const zone = getTaxZone(income, grundfreibetrag)

    dataPoints.push({
      income,
      taxAmount,
      averageTaxRate,
      marginalTaxRate,
      zone,
    })
  }

  return dataPoints
}

/**
 * Find the data point for a specific income amount
 * Uses the closest data point if exact match is not available
 */
export function findDataPointForIncome(
  data: TaxProgressionDataPoint[],
  targetIncome: number,
): TaxProgressionDataPoint | null {
  if (data.length === 0) return null

  // Find the closest data point
  return data.reduce((closest, current) => {
    const closestDiff = Math.abs(closest.income - targetIncome)
    const currentDiff = Math.abs(current.income - targetIncome)
    return currentDiff < closestDiff ? current : closest
  })
}

/**
 * Get color for a specific tax zone
 */
export function getTaxZoneColor(zone: TaxProgressionDataPoint['zone']): string {
  switch (zone) {
    case 'grundfreibetrag':
      return '#10b981' // Green
    case 'zone1':
      return '#3b82f6' // Blue
    case 'zone2':
      return '#f59e0b' // Amber
    case 'zone3':
      return '#ef4444' // Red
    case 'reichensteuer':
      return '#dc2626' // Dark red
  }
}
