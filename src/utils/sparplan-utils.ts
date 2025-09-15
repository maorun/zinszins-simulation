import type { SimulationAnnualType, SimulationResult } from './simulate'
import { SimulationAnnual } from './simulate'

export type Sparplan = {
  id: number
  start: Date | string
  end?: Date | string | null
  einzahlung: number
  // Cost factors
  ter?: number // Total Expense Ratio (annual percentage, e.g., 0.75 for 0.75%)
  transactionCostPercent?: number // Transaction cost as percentage (e.g., 0.25 for 0.25%)
  transactionCostAbsolute?: number // Transaction cost as absolute amount (e.g., 1.5 for 1.50€)
}

export type SparplanElement = {
  start: Date | string
  type: 'sparplan'
  einzahlung: number
  simulation: SimulationResult
  // Cost factors
  ter?: number
  transactionCostPercent?: number
  transactionCostAbsolute?: number
} | {
  start: Date | string
  type: 'einmalzahlung'
  gewinn: number
  einzahlung: number
  simulation: SimulationResult
  // Cost factors
  ter?: number
  transactionCostPercent?: number
  transactionCostAbsolute?: number
}

export const initialSparplan: Sparplan = {
  id: 1,
  start: new Date(),
  end: null, // Make end date optional by default
  einzahlung: 19800,
}

export function convertSparplanToElements(
  val: Sparplan[],
  startEnd: [number, number],
  simulationAnnual: SimulationAnnualType,
): SparplanElement[] {
  const data: SparplanElement[] = val.flatMap((el) => {
    const sparplanElementsToSave: SparplanElement[] = []

    // Check if this is a one-time payment (start and end dates are the same)
    const isOneTimePayment = el.end && new Date(el.start).getTime() === new Date(el.end).getTime()

    if (isOneTimePayment) {
      // Handle one-time payment
      const paymentYear = new Date(el.start).getFullYear()
      if (paymentYear >= new Date().getFullYear() && paymentYear <= startEnd[0]) {
        sparplanElementsToSave.push({
          start: el.start,
          type: 'einmalzahlung',
          gewinn: 0, // Will be calculated during simulation
          einzahlung: el.einzahlung,
          simulation: {},
          ter: el.ter,
          transactionCostPercent: el.transactionCostPercent,
          transactionCostAbsolute: el.transactionCostAbsolute,
        })
      }
    }
    else {
      // Handle regular savings plan
      for (let i = new Date().getFullYear(); i <= startEnd[0]; i++) {
        if (new Date(el.start).getFullYear() <= i
          && (!el.end || new Date(el.end).getFullYear() >= i)
        ) {
          if (simulationAnnual === SimulationAnnual.yearly) {
            sparplanElementsToSave.push({
              start: new Date(i + '-01-01'),
              einzahlung: el.einzahlung,
              type: 'sparplan',
              simulation: {},
              ter: el.ter,
              transactionCostPercent: el.transactionCostPercent,
              transactionCostAbsolute: el.transactionCostAbsolute,
            })
          }
          else {
            for (let month = 0; month < 12; month++) {
              if (new Date(el.start).getFullYear() === i && new Date(el.start).getMonth() > month) {
                continue
              }
              else if (el.end && new Date(el.end).getFullYear() === i && new Date(el.end).getMonth() < month) {
                continue
              }
              else {
                sparplanElementsToSave.push({
                  start: new Date(i + '-' + (month + 1) + '-01'),
                  einzahlung: el.einzahlung / 12,
                  type: 'sparplan',
                  simulation: {},
                  ter: el.ter,
                  transactionCostPercent: el.transactionCostPercent,
                  transactionCostAbsolute: el.transactionCostAbsolute,
                })
              }
            }
          }
        }
      }
    }
    return sparplanElementsToSave
  })
  return data
}
