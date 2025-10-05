import type { SparplanElement } from '../utils/sparplan-utils'
import type { SimulationResult } from '../utils/simulate'

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
 * Check if simulation result has real (inflation-adjusted) values
 */
export function hasInflationAdjustedValues(simulationResult: SimulationResult): boolean {
  return Object.values(simulationResult).some(
    data => data.startkapitalReal !== undefined || data.endkapitalReal !== undefined,
  )
}
