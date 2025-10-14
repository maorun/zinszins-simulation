import type { SparplanElement } from '../utils/sparplan-utils'
import type { SimulationResult, VorabpauschaleDetails } from '../utils/simulate'

/**
 * Convert SparplanElement[] to SimulationResult format for use with InteractiveChart
 */
export function convertSparplanElementsToSimulationResult(
  elements?: SparplanElement[],
): SimulationResult {
  if (!elements || elements.length === 0) {
    return {}
  }

  const result: SimulationResult = {}

  // Combine all simulation data from all elements
  elements.forEach((element) => {
    Object.entries(element.simulation).forEach(([yearStr, data]) => {
      const year = parseInt(yearStr, 10)

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

      // Accumulate values from all elements for this year
      result[year].startkapital += data.startkapital
      result[year].zinsen += data.zinsen
      result[year].endkapital += data.endkapital
      result[year].bezahlteSteuer += data.bezahlteSteuer
      result[year].genutzterFreibetrag += data.genutzterFreibetrag
      result[year].vorabpauschale += data.vorabpauschale
      result[year].vorabpauschaleAccumulated += data.vorabpauschaleAccumulated

      // Copy over optional values if they exist
      if (data.startkapitalReal !== undefined) {
        if (result[year].startkapitalReal === undefined) {
          result[year].startkapitalReal = 0
        }
        result[year].startkapitalReal! += data.startkapitalReal
      }

      if (data.zinsenReal !== undefined) {
        if (result[year].zinsenReal === undefined) {
          result[year].zinsenReal = 0
        }
        result[year].zinsenReal! += data.zinsenReal
      }

      if (data.endkapitalReal !== undefined) {
        if (result[year].endkapitalReal === undefined) {
          result[year].endkapitalReal = 0
        }
        result[year].endkapitalReal! += data.endkapitalReal
      }

      // Copy over other optional fields
      if (data.vorabpauschaleDetails) {
        result[year].vorabpauschaleDetails = data.vorabpauschaleDetails
      }

      if (data.terCosts !== undefined) {
        if (result[year].terCosts === undefined) {
          result[year].terCosts = 0
        }
        result[year].terCosts! += data.terCosts
      }

      if (data.transactionCosts !== undefined) {
        if (result[year].transactionCosts === undefined) {
          result[year].transactionCosts = 0
        }
        result[year].transactionCosts! += data.transactionCosts
      }

      if (data.totalCosts !== undefined) {
        if (result[year].totalCosts === undefined) {
          result[year].totalCosts = 0
        }
        result[year].totalCosts! += data.totalCosts
      }
    })
  })

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

    result[year] = {
      startkapital: (typeof yearData.startkapital === 'number' ? yearData.startkapital : 0),
      zinsen: (typeof yearData.zinsen === 'number' ? yearData.zinsen : 0),
      endkapital: (typeof yearData.endkapital === 'number' ? yearData.endkapital : 0),
      bezahlteSteuer: (typeof yearData.bezahlteSteuer === 'number' ? yearData.bezahlteSteuer : 0),
      genutzterFreibetrag: (typeof yearData.genutzterFreibetrag === 'number' ? yearData.genutzterFreibetrag : 0),
      vorabpauschale: (typeof yearData.vorabpauschale === 'number' ? yearData.vorabpauschale : 0),
      vorabpauschaleAccumulated: 0, // Not typically used in withdrawal phase
    }

    // Copy over optional fields that might exist in withdrawal data
    if (yearData.vorabpauschaleDetails && typeof yearData.vorabpauschaleDetails === 'object') {
      result[year].vorabpauschaleDetails = yearData.vorabpauschaleDetails as VorabpauschaleDetails
    }

    // Note: einkommensteuer and genutzterGrundfreibetrag are specific to withdrawal phase
    // and don't exist in SimulationResultElement, so we don't copy them
    // The chart will display the standard fields: capital, interest, taxes, etc.

    // Note: Withdrawal phase typically doesn't have real values like savings phase
    // since inflation adjustments are handled differently in withdrawal calculations
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
