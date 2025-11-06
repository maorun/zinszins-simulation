import type { SparplanElement } from '../utils/sparplan-utils'
import type { SimulationResult, SimulationResultElement, VorabpauschaleDetails } from '../utils/simulate'

/**
 * Accumulate an optional numeric field from data into result for a given year
 * Only works for numeric fields, not complex objects
 */
function accumulateOptionalField(
  result: SimulationResult,
  year: number,
  fieldName: 'startkapitalReal' | 'zinsenReal' | 'endkapitalReal' | 'terCosts' | 'transactionCosts' | 'totalCosts',
  value: number | undefined,
): void {
  if (value === undefined) return

  const currentValue = result[year][fieldName] as number | undefined
  result[year][fieldName] = (currentValue ?? 0) + value
}

/**
 * Initialize year data in result if it doesn't exist
 */
function initializeYearData(result: SimulationResult, year: number): void {
  if (!result[year]) {
    result[year] = {
      startkapital: 0,
      zinsen: 0,
      endkapital: 0,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
    }
  }
}

/**
 * Convert SparplanElement[] to SimulationResult format for use with InteractiveChart
 */
export function convertSparplanElementsToSimulationResult(elements?: SparplanElement[]): SimulationResult {
  if (!elements || elements.length === 0) {
    return {}
  }

  const result: SimulationResult = {}

  // Combine all simulation data from all elements
  elements.forEach(element => {
    Object.entries(element.simulation).forEach(([yearStr, data]) => {
      const year = parseInt(yearStr, 10)

      initializeYearData(result, year)

      // Accumulate values from all elements for this year
      result[year].startkapital += data.startkapital
      result[year].zinsen += data.zinsen
      result[year].endkapital += data.endkapital
      result[year].bezahlteSteuer += data.bezahlteSteuer
      result[year].genutzterFreibetrag += data.genutzterFreibetrag
      result[year].vorabpauschale += data.vorabpauschale
      result[year].vorabpauschaleAccumulated += data.vorabpauschaleAccumulated

      // Accumulate optional values if they exist
      accumulateOptionalField(result, year, 'startkapitalReal', data.startkapitalReal)
      accumulateOptionalField(result, year, 'zinsenReal', data.zinsenReal)
      accumulateOptionalField(result, year, 'endkapitalReal', data.endkapitalReal)
      accumulateOptionalField(result, year, 'terCosts', data.terCosts)
      accumulateOptionalField(result, year, 'transactionCosts', data.transactionCosts)
      accumulateOptionalField(result, year, 'totalCosts', data.totalCosts)

      // Copy over Vorabpauschale details (not accumulated, just copied)
      if (data.vorabpauschaleDetails) {
        result[year].vorabpauschaleDetails = data.vorabpauschaleDetails
      }
    })
  })

  return result
}

/**
 * Safely extract a numeric value from an object
 */
function safeNumericValue(obj: Record<string, unknown>, key: string): number {
  const value = obj[key]
  return typeof value === 'number' ? value : 0
}

/**
 * Convert a single year's withdrawal data to simulation result format
 */
function convertYearData(yearData: Record<string, unknown>): SimulationResultElement {
  const result: SimulationResultElement = {
    startkapital: safeNumericValue(yearData, 'startkapital'),
    zinsen: safeNumericValue(yearData, 'zinsen'),
    endkapital: safeNumericValue(yearData, 'endkapital'),
    bezahlteSteuer: safeNumericValue(yearData, 'bezahlteSteuer'),
    genutzterFreibetrag: safeNumericValue(yearData, 'genutzterFreibetrag'),
    vorabpauschale: safeNumericValue(yearData, 'vorabpauschale'),
    vorabpauschaleAccumulated: 0, // Not typically used in withdrawal phase
  }

  // Copy over optional vorabpauschale details if present
  if (yearData.vorabpauschaleDetails && typeof yearData.vorabpauschaleDetails === 'object') {
    result.vorabpauschaleDetails = yearData.vorabpauschaleDetails as VorabpauschaleDetails
  }

  return result
}

/**
 * Convert WithdrawalResult to SimulationResult format for use with InteractiveChart
 */
export function convertWithdrawalResultToSimulationResult(
  withdrawalResult: unknown, // WithdrawalResult type from helpers
): SimulationResult {
  if (!withdrawalResult || typeof withdrawalResult !== 'object') {
    return {}
  }

  const result: SimulationResult = {}

  Object.entries(withdrawalResult).forEach(([yearStr, data]) => {
    const year = parseInt(yearStr, 10)

    if (!data || typeof data !== 'object') return

    // Type assertion for data object properties
    const yearData = data as Record<string, unknown>
    result[year] = convertYearData(yearData)
  })

  return result
}

/**
 * Check if withdrawal result has inflation-adjusted values
 */
export function hasWithdrawalInflationAdjustedValues(_withdrawalResult: unknown): boolean {
  // Withdrawal phase typically doesn't store separate real values like savings phase
  // Instead, inflation adjustments are built into the withdrawal calculations
  return false
}

/**
 * Check if simulation result has real (inflation-adjusted) values
 */
export function hasInflationAdjustedValues(simulationResult: SimulationResult): boolean {
  return Object.values(simulationResult).some(
    data => data.startkapitalReal !== undefined || data.endkapitalReal !== undefined,
  )
}
