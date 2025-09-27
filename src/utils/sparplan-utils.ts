import type { SimulationAnnualType, SimulationResult } from './simulate'
import { SimulationAnnual } from './simulate'

export type RelationshipType = 
  | 'spouse' // Ehegatte - €500,000 exemption
  | 'child' // Kind/Stiefkind - €400,000 exemption  
  | 'grandchild' // Enkelkind - €200,000 exemption
  | 'parent_from_descendant' // Eltern bei Erbe von Nachkommen - €100,000 exemption
  | 'parent_other' // Eltern bei sonstigem Erbe - €20,000 exemption
  | 'sibling' // Geschwister - €20,000 exemption
  | 'other' // Sonstige - €20,000 exemption

export type ExpenseType = 
  | 'car' // Autokauf
  | 'real_estate' // Immobilienkauf
  | 'education' // Bildungsausgaben
  | 'medical' // Medizinische Ausgaben
  | 'other' // Sonstige Ausgaben

export type CreditTerms = {
  interestRate: number // Annual interest rate as decimal (e.g., 0.05 for 5%)
  termYears: number // Credit term in years
  monthlyPayment?: number // Optional: calculated monthly payment
}

export type SpecialEventData = {
  // Inheritance-specific fields
  relationshipType?: RelationshipType
  grossInheritanceAmount?: number // Gross inheritance before tax
  
  // Expense-specific fields  
  expenseType?: ExpenseType
  creditTerms?: CreditTerms
  
  // General event fields
  description?: string
  taxRelevant?: boolean // Whether this event affects tax calculations
}

export type Sparplan = {
  id: number
  start: Date | string
  end?: Date | string | null
  einzahlung: number
  // Cost factors
  ter?: number // Total Expense Ratio (annual percentage, e.g., 0.75 for 0.75%)
  transactionCostPercent?: number // Transaction cost as percentage (e.g., 0.25 for 0.25%)
  transactionCostAbsolute?: number // Transaction cost as absolute amount (e.g., 1.5 for 1.50€)
  // Special events data
  eventType?: 'normal' | 'inheritance' | 'expense' // Event type classification
  specialEventData?: SpecialEventData // Additional data for special events
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
  // Special events data
  eventType?: 'normal' | 'inheritance' | 'expense'
  specialEventData?: SpecialEventData
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
  // Special events data
  eventType?: 'normal' | 'inheritance' | 'expense'
  specialEventData?: SpecialEventData
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
          eventType: el.eventType || 'normal',
          specialEventData: el.specialEventData,
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
            let yearlyAmount = el.einzahlung

            // Handle partial years for start/end dates
            if (new Date(el.start).getFullYear() === i || (el.end && new Date(el.end).getFullYear() === i)) {
              const startMonth = new Date(el.start).getFullYear() === i ? new Date(el.start).getMonth() : 0
              const endMonth = el.end && new Date(el.end).getFullYear() === i ? new Date(el.end).getMonth() : 11

              // Calculate the fraction of the year that this Sparplan is active
              // +1 because months are 0-indexed but we want inclusive count
              const activeMonths = Math.max(0, endMonth - startMonth + 1)
              yearlyAmount = (el.einzahlung * activeMonths) / 12
            }

            // Only add if there are active months in this year
            if (yearlyAmount > 0) {
              sparplanElementsToSave.push({
                start: new Date(i + '-01-01'),
                einzahlung: yearlyAmount,
                type: 'sparplan',
                simulation: {},
                ter: el.ter,
                transactionCostPercent: el.transactionCostPercent,
                transactionCostAbsolute: el.transactionCostAbsolute,
                eventType: el.eventType || 'normal',
                specialEventData: el.specialEventData,
              })
            }
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
                  eventType: el.eventType || 'normal',
                  specialEventData: el.specialEventData,
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
