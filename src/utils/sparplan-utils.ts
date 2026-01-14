import { SimulationAnnual, type SimulationAnnualType, type SimulationResult } from './simulate'
import type { DynamicSavingsRateConfig } from '../../helpers/dynamic-savings-rate'

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

/**
 * Income pattern for self-employed individuals with fluctuating income
 * Allows modeling irregular income throughout the year
 */
export type IncomePattern = {
  enabled: boolean
  type: 'monthly' | 'quarterly' // Pattern frequency
  // Monthly adjustments: 12 values (one per month) as percentage multipliers
  // e.g., [1.2, 1.0, 0.8, ...] means +20%, normal, -20% for Jan, Feb, Mar
  monthlyMultipliers?: number[]
  // Quarterly adjustments: 4 values (one per quarter) as percentage multipliers
  quarterlyMultipliers?: number[]
  description?: string // User description of the pattern (e.g., "Seasonal business")
}

export type SpecialEventData = {
  // Inheritance-specific fields
  relationshipType?: RelationshipType
  grossInheritanceAmount?: number // Gross inheritance before tax

  // Expense-specific fields
  expenseType?: ExpenseType
  creditTerms?: CreditTerms

  // Care cost-specific fields
  careLevel?: 1 | 2 | 3 | 4 | 5 // German care level (Pflegegrad)
  customMonthlyCosts?: number // Custom monthly care costs
  careDurationYears?: number // Duration of care in years (0 = until end of life)
  careInflationRate?: number // Annual inflation rate for care costs

  // Business sale-specific fields
  businessSalePrice?: number // Sale price of the business
  businessBookValue?: number // Book value / acquisition costs
  sellerAge?: number // Age of seller at time of sale
  permanentlyDisabled?: boolean // Permanently disabled status
  businessSaleOtherIncome?: number // Other taxable income in sale year
  applyFifthRule?: boolean // Whether to apply Fünftelregelung

  // General event fields
  description?: string
  taxRelevant?: boolean // Whether this event affects tax calculations
  phase?: 'sparphase' | 'entsparphase' // Which life phase this event occurs in
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
  eventType?: 'normal' | 'inheritance' | 'expense' | 'care_costs' | 'business_sale' // Event type classification
  specialEventData?: SpecialEventData // Additional data for special events
  // Fluctuating income pattern for self-employed
  incomePattern?: IncomePattern // Optional income pattern for irregular contributions
  // Dynamic savings rate configuration
  dynamicSavingsConfig?: DynamicSavingsRateConfig // Optional dynamic savings rate adjustments
}

export type SparplanElement =
  | {
      start: Date | string
      type: 'sparplan'
      einzahlung: number
      simulation: SimulationResult
      // Cost factors
      ter?: number
      transactionCostPercent?: number
      transactionCostAbsolute?: number
      // Special events data
      eventType?: 'normal' | 'inheritance' | 'expense' | 'care_costs' | 'business_sale'
      specialEventData?: SpecialEventData
      // Dynamic savings rate configuration
      dynamicSavingsConfig?: DynamicSavingsRateConfig
    }
  | {
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
      eventType?: 'normal' | 'inheritance' | 'expense' | 'care_costs' | 'business_sale'
      specialEventData?: SpecialEventData
      // Dynamic savings rate configuration (not applicable for one-time payments)
      dynamicSavingsConfig?: DynamicSavingsRateConfig
    }

export const initialSparplan: Sparplan = {
  id: 1,
  start: new Date(),
  end: null, // Make end date optional by default
  einzahlung: 24000, // Updated to more realistic baseline (24,000€ annually = 2,000€ monthly)
}

/**
 * Get the multiplier from monthly pattern
 */
function getMonthlyMultiplier(monthlyMultipliers: number[] | undefined, month: number): number {
  return monthlyMultipliers?.[month] ?? 1.0
}

/**
 * Get the multiplier from quarterly pattern
 */
function getQuarterlyMultiplier(
  quarterlyMultipliers: number[] | undefined,
  month: number,
): number {
  const quarter = Math.floor(month / 3)
  return quarterlyMultipliers?.[quarter] ?? 1.0
}

/**
 * Calculate the income multiplier for a given month based on the income pattern
 * @param incomePattern - The income pattern configuration
 * @param month - Zero-based month index (0 = January, 11 = December)
 * @returns Multiplier to apply to the base amount (1.0 = no change)
 */
export function getIncomePatternMultiplier(
  incomePattern: IncomePattern | undefined,
  month: number,
): number {
  // Return default multiplier if pattern is not enabled
  if (!incomePattern?.enabled) {
    return 1.0
  }

  // Handle monthly pattern
  if (incomePattern.type === 'monthly') {
    return getMonthlyMultiplier(incomePattern.monthlyMultipliers, month)
  }

  // Handle quarterly pattern
  if (incomePattern.type === 'quarterly') {
    return getQuarterlyMultiplier(incomePattern.quarterlyMultipliers, month)
  }

  return 1.0
}

type CreateElementParams = {
  el: Sparplan
  year?: number
  month?: number
  yearlyAmount?: number
}

function createSparplanElement(params: CreateElementParams): SparplanElement {
  const { el, year, month, yearlyAmount } = params
  const monthlyPayment = month !== undefined

  // Calculate base amount
  let einzahlung = monthlyPayment ? el.einzahlung / 12 : (yearlyAmount ?? el.einzahlung)

  // Apply income pattern multiplier for monthly payments
  if (monthlyPayment && month !== undefined) {
    const multiplier = getIncomePatternMultiplier(el.incomePattern, month)
    einzahlung = einzahlung * multiplier
  }

  return {
    start: monthlyPayment ? new Date(year + '-' + (month + 1) + '-01') : new Date(year + '-01-01'),
    einzahlung,
    type: 'sparplan',
    simulation: {},
    ter: el.ter,
    transactionCostPercent: el.transactionCostPercent,
    transactionCostAbsolute: el.transactionCostAbsolute,
    eventType: el.eventType || 'normal',
    specialEventData: el.specialEventData,
  }
}

function shouldIncludeMonth(el: Sparplan, year: number, month: number): boolean {
  const startYear = new Date(el.start).getFullYear()
  const startMonth = new Date(el.start).getMonth()

  // Skip if month is before start month in start year
  if (startYear === year && startMonth > month) {
    return false
  }

  // Skip if month is after end month in end year
  if (el.end) {
    const endYear = new Date(el.end).getFullYear()
    const endMonth = new Date(el.end).getMonth()
    if (endYear === year && endMonth < month) {
      return false
    }
  }

  return true
}

function processMonthlyElements(el: Sparplan, year: number): SparplanElement[] {
  const elements: SparplanElement[] = []

  for (let month = 0; month < 12; month++) {
    if (shouldIncludeMonth(el, year, month)) {
      elements.push(createSparplanElement({ el, year, month }))
    }
  }

  return elements
}

function calculateYearlyAmount(el: Sparplan, year: number): number {
  let yearlyAmount = el.einzahlung

  // Handle partial years for start/end dates
  const isStartYear = new Date(el.start).getFullYear() === year
  const isEndYear = el.end && new Date(el.end).getFullYear() === year

  if (isStartYear || isEndYear) {
    const startMonth = isStartYear ? new Date(el.start).getMonth() : 0
    const endMonth = isEndYear ? new Date(el.end!).getMonth() : 11

    // Calculate the fraction of the year that this Sparplan is active
    const activeMonths = Math.max(0, endMonth - startMonth + 1)
    yearlyAmount = (el.einzahlung * activeMonths) / 12
  }

  return yearlyAmount
}

function processYearlyElement(el: Sparplan, year: number): SparplanElement | null {
  const yearlyAmount = calculateYearlyAmount(el, year)

  // Only add if there are active months in this year
  if (yearlyAmount <= 0) {
    return null
  }

  return createSparplanElement({ el, year, yearlyAmount })
}

function processRegularSavingsPlan(
  el: Sparplan,
  startEnd: [number, number],
  simulationAnnual: SimulationAnnualType,
): SparplanElement[] {
  const elements: SparplanElement[] = []
  const startYear = new Date(el.start).getFullYear()
  const endYear = el.end ? new Date(el.end).getFullYear() : Infinity

  for (let year = startYear; year <= startEnd[0]; year++) {
    // Skip years outside the savings plan range
    if (year > endYear) {
      break
    }

    if (simulationAnnual === SimulationAnnual.yearly) {
      const element = processYearlyElement(el, year)
      if (element) {
        elements.push(element)
      }
    } else {
      elements.push(...processMonthlyElements(el, year))
    }
  }

  return elements
}

function processOneTimePayment(el: Sparplan, startEnd: [number, number]): SparplanElement[] {
  const paymentYear = new Date(el.start).getFullYear()

  if (paymentYear > startEnd[0]) {
    return []
  }

  return [
    {
      start: el.start,
      type: 'einmalzahlung',
      gewinn: 0,
      einzahlung: el.einzahlung,
      simulation: {},
      ter: el.ter,
      transactionCostPercent: el.transactionCostPercent,
      transactionCostAbsolute: el.transactionCostAbsolute,
      eventType: el.eventType || 'normal',
      specialEventData: el.specialEventData,
    },
  ]
}

export function convertSparplanToElements(
  val: Sparplan[],
  startEnd: [number, number],
  simulationAnnual: SimulationAnnualType,
): SparplanElement[] {
  return val.flatMap(el => {
    const isOneTimePayment = el.end && new Date(el.start).getTime() === new Date(el.end).getTime()

    if (isOneTimePayment) {
      return processOneTimePayment(el, startEnd)
    }

    return processRegularSavingsPlan(el, startEnd, simulationAnnual)
  })
}
