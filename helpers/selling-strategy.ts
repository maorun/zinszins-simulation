/**
 * Selling Strategy Optimization (Intelligente Verkaufsstrategie mit Steuerstundung)
 *
 * This module implements intelligent selling strategies to minimize tax burden when liquidating investments.
 * It considers German tax law including FIFO/LIFO cost basis, tax allowances (Freibetrag),
 * and optimal timing for sales across multiple years.
 *
 * Key German tax concepts:
 * - FIFO (First In, First Out): Default method - oldest investments sold first
 * - LIFO (Last In, First Out): Newest investments sold first
 * - Steueroptimiert: Tax-optimized method considering cost basis and holding periods
 * - Freibetrag: Annual tax-free allowance (currently 2,000€)
 * - Spekulationsfrist: Holding period (not applicable for funds/stocks bought after 2009)
 */

/**
 * Cost basis tracking for an investment lot
 */
export interface InvestmentLot {
  /** Purchase date of the lot */
  purchaseDate: Date
  /** Original purchase amount in EUR */
  costBasis: number
  /** Current value of the lot in EUR */
  currentValue: number
  /** Identifier for the lot */
  id: string
  /** Accumulated Vorabpauschale already taxed */
  vorabpauschaleAccumulated: number
}

/**
 * Configuration for selling strategy
 */
export interface SellingStrategyConfig {
  /** Strategy to use: 'fifo', 'lifo', or 'tax-optimized' */
  method: 'fifo' | 'lifo' | 'tax-optimized'
  /** Whether to spread sales over multiple years */
  spreadOverYears: boolean
  /** Number of years to spread sales over (if spreadOverYears is true) */
  yearsToSpread: number
  /** Target amount to sell in EUR */
  targetAmount: number
  /** Start year for selling */
  startYear: number
  /** Annual tax allowance in EUR */
  freibetrag: number
  /** Capital gains tax rate (default: 0.26375 = 26.375%) */
  taxRate: number
  /** Partial exemption rate (Teilfreistellungsquote) */
  teilfreistellungsquote: number
}

/**
 * Result of a sale transaction
 */
export interface SaleTransaction {
  /** Year of the sale */
  year: number
  /** Investment lot being sold */
  lot: InvestmentLot
  /** Amount being sold from this lot in EUR */
  amountSold: number
  /** Cost basis of the amount sold */
  costBasisSold: number
  /** Taxable gain from this sale (after Teilfreistellung) */
  taxableGain: number
  /** Tax owed on this transaction */
  taxOwed: number
  /** Whether tax allowance was used */
  freibetragUsed: number
  /** Net proceeds after tax */
  netProceeds: number
}

/**
 * Result of selling strategy optimization
 */
export interface SellingStrategyResult {
  /** Array of sale transactions */
  transactions: SaleTransaction[]
  /** Total amount sold */
  totalAmountSold: number
  /** Total cost basis of sold investments */
  totalCostBasis: number
  /** Total taxable gains */
  totalTaxableGains: number
  /** Total tax owed */
  totalTaxOwed: number
  /** Total net proceeds after tax */
  totalNetProceeds: number
  /** Tax efficiency (net proceeds / amount sold) */
  taxEfficiency: number
  /** Summary by year */
  yearSummary: {
    [year: number]: {
      amountSold: number
      taxOwed: number
      netProceeds: number
      freibetragUsed: number
    }
  }
}

/**
 * Calculate taxable gain from a sale
 * Formula: (Sale Amount - Cost Basis) * (1 - Teilfreistellung)
 */
function calculateTaxableGain(
  saleAmount: number,
  costBasis: number,
  teilfreistellungsquote: number,
): number {
  const gain = Math.max(0, saleAmount - costBasis)
  return gain * (1 - teilfreistellungsquote)
}

/**
 * Calculate tax owed on a sale considering Freibetrag
 */
function calculateTaxOwed(
  taxableGain: number,
  freibetragRemaining: number,
  taxRate: number,
): { taxOwed: number; freibetragUsed: number } {
  const freibetragUsed = Math.min(taxableGain, freibetragRemaining)
  const taxableAfterFreibetrag = Math.max(0, taxableGain - freibetragUsed)
  const taxOwed = taxableAfterFreibetrag * taxRate

  return { taxOwed, freibetragUsed }
}

/**
 * Sort investment lots using FIFO method (oldest first)
 */
function sortFIFO(lots: InvestmentLot[]): InvestmentLot[] {
  return [...lots].sort((a, b) => a.purchaseDate.getTime() - b.purchaseDate.getTime())
}

/**
 * Sort investment lots using LIFO method (newest first)
 */
function sortLIFO(lots: InvestmentLot[]): InvestmentLot[] {
  return [...lots].sort((a, b) => b.purchaseDate.getTime() - a.purchaseDate.getTime())
}

/**
 * Sort investment lots using tax-optimized method
 * Prioritizes lots with:
 * 1. Losses (negative gain) first (tax loss harvesting)
 * 2. Smallest gains relative to cost basis (lowest tax impact)
 * 3. Oldest lots (to clear out long-held positions)
 */
function sortTaxOptimized(lots: InvestmentLot[]): InvestmentLot[] {
  return [...lots].sort((a, b) => {
    // Calculate gain percentage for each lot
    const gainPercentA = (a.currentValue - a.costBasis) / a.costBasis
    const gainPercentB = (b.currentValue - b.costBasis) / b.costBasis

    // Prioritize losses
    if (gainPercentA < 0 && gainPercentB >= 0) return -1
    if (gainPercentA >= 0 && gainPercentB < 0) return 1

    // If both have gains or both have losses, prefer smaller gain percentage
    if (Math.abs(gainPercentA - gainPercentB) > 0.001) {
      return gainPercentA - gainPercentB
    }

    // If gain percentages are similar, prefer older lots
    return a.purchaseDate.getTime() - b.purchaseDate.getTime()
  })
}

/**
 * Sort lots according to selected method
 */
function sortLotsByMethod(lots: InvestmentLot[], method: string): InvestmentLot[] {
  switch (method) {
    case 'fifo':
      return sortFIFO(lots)
    case 'lifo':
      return sortLIFO(lots)
    case 'tax-optimized':
      return sortTaxOptimized(lots)
    default:
      throw new Error(`Unbekannte Verkaufsmethode: ${method}`)
  }
}

/**
 * Initialize year summary structure
 */
function createYearSummary(): {
  amountSold: number
  taxOwed: number
  netProceeds: number
  freibetragUsed: number
} {
  return {
    amountSold: 0,
    taxOwed: 0,
    netProceeds: 0,
    freibetragUsed: 0,
  }
}

/**
 * Process sale of a lot within a year
 */
function processSaleLot(params: {
  lot: InvestmentLot
  yearAmount: number
  remainingInCurrentLot: number
  config: SellingStrategyConfig
  freibetragRemaining: number
  year: number
}): {
  transaction: SaleTransaction
  yearAmountReduction: number
  remainingReduction: number
  freibetragReduction: number
} {
  const { lot, yearAmount, remainingInCurrentLot, config, freibetragRemaining, year } = params

  const amountFromLot = Math.min(yearAmount, remainingInCurrentLot)
  const proportion = amountFromLot / lot.currentValue
  const costBasisSold = lot.costBasis * proportion

  const taxableGain = calculateTaxableGain(amountFromLot, costBasisSold, config.teilfreistellungsquote)
  const { taxOwed, freibetragUsed } = calculateTaxOwed(taxableGain, freibetragRemaining, config.taxRate)
  const netProceeds = amountFromLot - taxOwed

  const transaction: SaleTransaction = {
    year,
    lot,
    amountSold: amountFromLot,
    costBasisSold,
    taxableGain,
    taxOwed,
    freibetragUsed,
    netProceeds,
  }

  return {
    transaction,
    yearAmountReduction: amountFromLot,
    remainingReduction: amountFromLot,
    freibetragReduction: freibetragUsed,
  }
}

/**
 * Calculate result totals from transactions
 */
function calculateResultTotals(transactions: SaleTransaction[]): {
  totalAmountSold: number
  totalCostBasis: number
  totalTaxableGains: number
  totalTaxOwed: number
  totalNetProceeds: number
  taxEfficiency: number
} {
  const totalAmountSold = transactions.reduce((sum, t) => sum + t.amountSold, 0)
  const totalCostBasis = transactions.reduce((sum, t) => sum + t.costBasisSold, 0)
  const totalTaxableGains = transactions.reduce((sum, t) => sum + t.taxableGain, 0)
  const totalTaxOwed = transactions.reduce((sum, t) => sum + t.taxOwed, 0)
  const totalNetProceeds = transactions.reduce((sum, t) => sum + t.netProceeds, 0)
  const taxEfficiency = totalAmountSold > 0 ? totalNetProceeds / totalAmountSold : 0

  return {
    totalAmountSold,
    totalCostBasis,
    totalTaxableGains,
    totalTaxOwed,
    totalNetProceeds,
    taxEfficiency,
  }
}

/**
 * Process sales for a single year
 */
function processYearSales(params: {
  year: number
  yearAmount: number
  sortedLots: InvestmentLot[]
  currentLotIndex: number
  remainingInCurrentLot: number
  config: SellingStrategyConfig
  transactions: SaleTransaction[]
  yearSummary: SellingStrategyResult['yearSummary']
}): {
  remainingToSell: number
  currentLotIndex: number
  remainingInCurrentLot: number
} {
  const { year, sortedLots, config, transactions, yearSummary } = params
  let { yearAmount, currentLotIndex, remainingInCurrentLot } = params
  let freibetragRemaining = config.freibetrag
  let remainingToSell = 0

  yearSummary[year] = createYearSummary()

  while (yearAmount > 0 && currentLotIndex < sortedLots.length) {
    const lot = sortedLots[currentLotIndex]

    const result = processSaleLot({
      lot,
      yearAmount,
      remainingInCurrentLot,
      config,
      freibetragRemaining,
      year,
    })

    transactions.push(result.transaction)
    yearSummary[year].amountSold += result.transaction.amountSold
    yearSummary[year].taxOwed += result.transaction.taxOwed
    yearSummary[year].netProceeds += result.transaction.netProceeds
    yearSummary[year].freibetragUsed += result.transaction.freibetragUsed

    yearAmount -= result.yearAmountReduction
    remainingToSell += result.remainingReduction
    remainingInCurrentLot -= result.remainingReduction
    freibetragRemaining -= result.freibetragReduction

    if (remainingInCurrentLot < 0.01) {
      currentLotIndex++
      remainingInCurrentLot = sortedLots[currentLotIndex]?.currentValue || 0
    }
  }

  return { remainingToSell, currentLotIndex, remainingInCurrentLot }
}

/**
 * Validate selling strategy inputs
 */
function validateSellingInputs(lots: InvestmentLot[], config: SellingStrategyConfig): void {
  if (lots.length === 0) {
    throw new Error('Keine Investments zum Verkauf vorhanden')
  }
  if (config.targetAmount <= 0) {
    throw new Error('Verkaufsbetrag muss größer als 0 sein')
  }
}

/**
 * Calculate optimal selling strategy
 *
 * @param lots - Array of investment lots to potentially sell
 * @param config - Selling strategy configuration
 * @returns Optimized selling strategy result
 */
export function calculateSellingStrategy(
  lots: InvestmentLot[],
  config: SellingStrategyConfig,
): SellingStrategyResult {
  validateSellingInputs(lots, config)

  const sortedLots = sortLotsByMethod(lots, config.method)
  const yearsToSpread = config.spreadOverYears ? Math.max(1, config.yearsToSpread) : 1
  const amountPerYear = config.targetAmount / yearsToSpread

  const transactions: SaleTransaction[] = []
  const yearSummary: SellingStrategyResult['yearSummary'] = {}

  let remainingToSell = config.targetAmount
  let currentLotIndex = 0
  let remainingInCurrentLot = sortedLots[0]?.currentValue || 0

  for (let yearOffset = 0; yearOffset < yearsToSpread && remainingToSell > 0; yearOffset++) {
    const year = config.startYear + yearOffset
    const yearAmount = Math.min(amountPerYear, remainingToSell)

    const result = processYearSales({
      year,
      yearAmount,
      sortedLots,
      currentLotIndex,
      remainingInCurrentLot,
      config,
      transactions,
      yearSummary,
    })

    remainingToSell -= result.remainingToSell
    currentLotIndex = result.currentLotIndex
    remainingInCurrentLot = result.remainingInCurrentLot

    if (currentLotIndex >= sortedLots.length) {
      break
    }
  }

  const totals = calculateResultTotals(transactions)

  return {
    transactions,
    yearSummary,
    ...totals,
  }
}

/**
 * Compare multiple selling strategies and return the most tax-efficient
 *
 * @param lots - Investment lots to sell
 * @param baseConfig - Base configuration (will be used for all methods)
 * @returns Comparison of all three methods with recommendation
 */
export function compareSellingStrategies(
  lots: InvestmentLot[],
  baseConfig: SellingStrategyConfig,
): {
  fifo: SellingStrategyResult
  lifo: SellingStrategyResult
  taxOptimized: SellingStrategyResult
  bestMethod: 'fifo' | 'lifo' | 'tax-optimized'
  taxSavings: number
} {
  // Calculate results for each method
  const fifo = calculateSellingStrategy(lots, { ...baseConfig, method: 'fifo' })
  const lifo = calculateSellingStrategy(lots, { ...baseConfig, method: 'lifo' })
  const taxOptimized = calculateSellingStrategy(lots, { ...baseConfig, method: 'tax-optimized' })

  // Find the method with lowest total tax
  const methods = [
    { name: 'fifo' as const, result: fifo },
    { name: 'lifo' as const, result: lifo },
    { name: 'tax-optimized' as const, result: taxOptimized },
  ]

  const bestMethodObj = methods.reduce((best, current) =>
    current.result.totalTaxOwed < best.result.totalTaxOwed ? current : best,
  )

  const worstMethodObj = methods.reduce((worst, current) =>
    current.result.totalTaxOwed > worst.result.totalTaxOwed ? current : worst,
  )

  const taxSavings = worstMethodObj.result.totalTaxOwed - bestMethodObj.result.totalTaxOwed

  return {
    fifo,
    lifo,
    taxOptimized,
    bestMethod: bestMethodObj.name,
    taxSavings,
  }
}

/**
 * Generate default selling strategy configuration
 */
export function getDefaultSellingStrategyConfig(startYear?: number): SellingStrategyConfig {
  return {
    method: 'tax-optimized',
    spreadOverYears: false,
    yearsToSpread: 1,
    targetAmount: 10000,
    startYear: startYear || new Date().getFullYear(),
    freibetrag: 2000,
    taxRate: 0.26375,
    teilfreistellungsquote: 0.3,
  }
}

/**
 * Validate a numeric value within a range
 */
function validateRange(value: number, min: number, max: number, errorMessage: string): string | null {
  return value < min || value > max ? errorMessage : null
}

/**
 * Validate selling strategy configuration
 * @returns Array of validation error messages (empty if valid)
 */
export function validateSellingStrategyConfig(config: SellingStrategyConfig): string[] {
  const validations = [
    config.targetAmount <= 0 ? 'Verkaufsbetrag muss größer als 0 sein' : null,
    validateRange(config.yearsToSpread, 1, 50, 'Anzahl der Jahre muss zwischen 1 und 50 liegen'),
    config.freibetrag < 0 ? 'Freibetrag kann nicht negativ sein' : null,
    validateRange(config.taxRate, 0, 1, 'Steuersatz muss zwischen 0 und 1 liegen'),
    validateRange(config.teilfreistellungsquote, 0, 1, 'Teilfreistellungsquote muss zwischen 0 und 1 liegen'),
    validateRange(config.startYear, 2000, 2100, 'Jahr muss zwischen 2000 und 2100 liegen'),
  ]

  return validations.filter((error): error is string => error !== null)
}
