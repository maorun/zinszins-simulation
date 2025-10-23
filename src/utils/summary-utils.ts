import type { SimulationResult } from './simulate'
import type { SparplanElement } from '../utils/sparplan-utils'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'

export type Summary = {
  startkapital: number
  zinsen: number
  bezahlteSteuer: number
  endkapital: number
}

export type EnhancedSummary = Summary & {
  // Savings phase (Ansparphase) metrics
  renditeAnsparphase: number // Return rate in savings phase as percentage

  // Withdrawal phase (Entsparphase) metrics - optional as they may not always be calculated
  endkapitalEntspharphase?: number // End capital after withdrawal phase
  monatlicheAuszahlung?: number // Monthly withdrawal amount in Euro
  jahreEntspharphase?: number // Number of years in withdrawal phase

  // Segmented withdrawal phase information
  isSegmentedWithdrawal?: boolean // Whether withdrawal uses multiple segments
  withdrawalSegments?: WithdrawalSegmentSummary[] // Summary for each segment
}

export type WithdrawalSegmentSummary = {
  id: string
  name: string
  startYear: number
  endYear: number
  strategy: string
  startkapital: number
  endkapital: number
  totalWithdrawn: number
  averageMonthlyWithdrawal: number
}

export function getSparplanSummary(element?: SimulationResult): Summary {
  /**
   * Calculate total tax paid across all years
   */
  const calculateTotalTax = (element: SimulationResult | undefined): number => {
    if (!element) {
      return 0
    }
    return Object.values(element).reduce(
      (previousValue, currentValue) =>
        previousValue + currentValue.bezahlteSteuer,
      0,
    )
  }

  /**
   * Get first simulation element
   */
  const getFirstElement = (element: SimulationResult | undefined) => {
    return element && Object.values(element).shift()
  }

  /**
   * Get last simulation element
   */
  const getLastElement = (element: SimulationResult | undefined) => {
    return element && Object.values(element).pop()
  }

  const first = getFirstElement(element)
  const last = getLastElement(element)

  return {
    startkapital: first?.startkapital || 0,
    zinsen: Number(last?.endkapital) - Number(first?.startkapital),
    bezahlteSteuer: calculateTotalTax(element),
    endkapital: last?.endkapital || 0,
  }
}

export function fullSummary(elemente?: SparplanElement[]): Summary {
  return elemente
    ? elemente.map(element => element.simulation)
        .map(getSparplanSummary)
        .reduce(
          (previousValue, currentValue) => ({
            startkapital: Number(previousValue.startkapital) + Number(currentValue.startkapital),
            zinsen: previousValue.zinsen + currentValue.zinsen,
            bezahlteSteuer: previousValue.bezahlteSteuer + currentValue.bezahlteSteuer,
            endkapital:
                    Number(previousValue.endkapital) + Number(currentValue.endkapital),
          }),
          {
            startkapital: 0,
            zinsen: 0,
            bezahlteSteuer: 0,
            endkapital: 0,
          },
        )
    : {
        startkapital: 0,
        zinsen: 0,
        bezahlteSteuer: 0,
        endkapital: 0,
      }
}

/**
 * Calculate withdrawal totals from yearly data
 */
function calculateWithdrawalTotals(
  withdrawalResult: WithdrawalResult,
  years: number[],
): { totalWithdrawn: number, totalMonthlyWithdrawals: number, monthsWithData: number } {
  let totalWithdrawn = 0
  let totalMonthlyWithdrawals = 0
  let monthsWithData = 0

  for (const year of years) {
    const yearData = withdrawalResult[year]
    totalWithdrawn += yearData.entnahme

    if (yearData.monatlicheEntnahme !== undefined) {
      totalMonthlyWithdrawals += yearData.monatlicheEntnahme
      monthsWithData += 1
    }
  }

  return { totalWithdrawn, totalMonthlyWithdrawals, monthsWithData }
}

/**
 * Calculate average monthly withdrawal
 */
function calculateAverageMonthlyWithdrawal(
  totalMonthlyWithdrawals: number,
  monthsWithData: number,
  totalWithdrawn: number,
  yearCount: number,
): number {
  if (monthsWithData > 0) {
    return totalMonthlyWithdrawals / monthsWithData
  }
  else if (totalWithdrawn > 0) {
    return totalWithdrawn / yearCount / 12
  }
  return 0
}

/**
 * Extract withdrawal phase metrics from WithdrawalResult
 */
export function extractWithdrawalMetrics(withdrawalResult: WithdrawalResult): {
  totalYears: number
  finalCapital: number
  averageMonthlyWithdrawal: number
  totalWithdrawn: number
} {
  const years = Object.keys(withdrawalResult).map(Number).sort((a, b) => a - b)

  if (years.length === 0) {
    return {
      totalYears: 0,
      finalCapital: 0,
      averageMonthlyWithdrawal: 0,
      totalWithdrawn: 0,
    }
  }

  const firstYear = years[0]
  const lastYear = years[years.length - 1]
  const totalYears = lastYear - firstYear + 1
  const finalCapital = withdrawalResult[lastYear].endkapital

  const { totalWithdrawn, totalMonthlyWithdrawals, monthsWithData }
    = calculateWithdrawalTotals(withdrawalResult, years)

  const averageMonthlyWithdrawal = calculateAverageMonthlyWithdrawal(
    totalMonthlyWithdrawals,
    monthsWithData,
    totalWithdrawn,
    years.length,
  )

  return {
    totalYears,
    finalCapital,
    averageMonthlyWithdrawal,
    totalWithdrawn,
  }
}

/**
 * Calculate savings phase return rate
 */
function calculateSavingsPhaseReturn(
  startkapital: number,
  endkapital: number,
  totalYears: number,
): number {
  if (startkapital <= 0 || totalYears <= 0) {
    return 0
  }
  const totalReturn = endkapital / startkapital
  return (Math.pow(totalReturn, 1 / totalYears) - 1) * 100
}

/**
 * Add withdrawal metrics to summary
 */
function addWithdrawalMetrics(
  summary: EnhancedSummary,
  withdrawalResult: WithdrawalResult,
  isSegmentedWithdrawal: boolean | undefined,
  withdrawalSegments: WithdrawalSegment[] | undefined,
  savingsEndCapital: number,
): void {
  const withdrawalData = extractWithdrawalMetrics(withdrawalResult)

  summary.endkapitalEntspharphase = withdrawalData.finalCapital
  summary.monatlicheAuszahlung = withdrawalData.averageMonthlyWithdrawal
  summary.jahreEntspharphase = withdrawalData.totalYears

  // Handle segmented withdrawal summaries
  if (isSegmentedWithdrawal && withdrawalSegments && withdrawalSegments.length > 0) {
    summary.withdrawalSegments = createWithdrawalSegmentSummaries(
      withdrawalSegments,
      withdrawalResult,
      savingsEndCapital,
    )
  }
}

/**
 * Calculate enhanced summary including withdrawal phase metrics
 */
export function getEnhancedSummary(
  elemente?: SparplanElement[],
  startYear?: number,
  endYear?: number,
  withdrawalResult?: WithdrawalResult,
  isSegmentedWithdrawal?: boolean,
  withdrawalSegments?: WithdrawalSegment[],
): EnhancedSummary {
  const baseSummary = fullSummary(elemente)

  // Calculate savings phase return rate
  const totalYearsSavings = endYear && startYear ? endYear - startYear : 0
  const renditeAnsparphase = calculateSavingsPhaseReturn(
    baseSummary.startkapital,
    baseSummary.endkapital,
    totalYearsSavings,
  )

  const enhancedSummary: EnhancedSummary = {
    ...baseSummary,
    renditeAnsparphase,
    isSegmentedWithdrawal,
  }

  // Add withdrawal phase metrics if provided
  if (withdrawalResult) {
    addWithdrawalMetrics(
      enhancedSummary,
      withdrawalResult,
      isSegmentedWithdrawal,
      withdrawalSegments,
      baseSummary.endkapital,
    )
  }

  return enhancedSummary
}

/**
 * Calculate yearly contribution for a specific year
 */
function calculateYearlyContribution(
  year: number,
  elemente: SparplanElement[],
): number {
  // ONLY count contributions from elements that actually start in this year
  const elementsStartingThisYear = elemente.filter(el =>
    el.type === 'sparplan' && new Date(el.start).getFullYear() === year,
  )

  if (elementsStartingThisYear.length === 0) {
    // No new contributions this year - only compound growth of existing capital
    return 0
  }

  if (elementsStartingThisYear.length === 1) {
    // Single yearly element for this year
    return elementsStartingThisYear[0].einzahlung
  }

  // Multiple elements starting this year
  const firstAmount = elementsStartingThisYear[0].einzahlung
  const allSameAmount = elementsStartingThisYear.every(el => el.einzahlung === firstAmount)

  if (allSameAmount && elementsStartingThisYear.length === 12) {
    // 12 elements with same amount = monthly elements from one Sparplan
    return firstAmount * 12
  }

  // Multiple different Sparpläne starting in the same year - sum them up
  return elementsStartingThisYear.reduce((sum, el) => sum + el.einzahlung, 0)
}

/**
 * Calculate one-time payment contributions for a specific year
 */
function calculateEinmalzahlungContribution(
  year: number,
  elemente: SparplanElement[],
): number {
  let contribution = 0

  elemente.forEach((element) => {
    const yearData = element.simulation[year]
    if (yearData && element.type === 'einmalzahlung') {
      const elementStartYear = new Date(element.start).getFullYear()
      if (elementStartYear === year) {
        contribution += element.einzahlung
      }
    }
  })

  return contribution
}

/**
 * Aggregate simulation data for all elements in a specific year
 */
interface YearAggregateData {
  totalCapital: number
  yearlyInterest: number
  yearlyTax: number
  totalCapitalReal?: number
  yearlyInterestReal: number
  hasInflationData: boolean
}

function aggregateYearData(
  year: number,
  elemente: SparplanElement[],
): YearAggregateData {
  const data: YearAggregateData = {
    totalCapital: 0,
    yearlyInterest: 0,
    yearlyTax: 0,
    totalCapitalReal: undefined,
    yearlyInterestReal: 0,
    hasInflationData: false,
  }

  elemente.forEach((element) => {
    const yearData = element.simulation[year]
    if (yearData) {
      data.totalCapital += yearData.endkapital
      data.yearlyInterest += yearData.zinsen
      data.yearlyTax += yearData.bezahlteSteuer

      if (yearData.endkapitalReal !== undefined) {
        data.hasInflationData = true
        data.totalCapitalReal = (data.totalCapitalReal || 0) + yearData.endkapitalReal
        data.yearlyInterestReal += yearData.zinsenReal || 0
      }
    }
  })

  return data
}

/**
 * Calculate year-by-year portfolio progression (cumulative capital for each year)
 */
/**
 * Yearly portfolio progression entry with cumulative values
 */
export type PortfolioProgressionEntry = {
  year: number
  totalCapital: number
  yearlyContribution: number
  yearlyInterest: number
  yearlyTax: number
  cumulativeContributions: number
  cumulativeInterest: number
  cumulativeTax: number
  // Inflation-adjusted values (real purchasing power)
  totalCapitalReal?: number
  yearlyInterestReal?: number
  cumulativeInterestReal?: number
}

export function getYearlyPortfolioProgression(
  elemente?: SparplanElement[],
): PortfolioProgressionEntry[] {
  if (!elemente || elemente.length === 0) {
    return []
  }

  // Get all years from all simulation results
  const allYears = new Set<number>()
  elemente.forEach((element) => {
    Object.keys(element.simulation).forEach((year) => {
      allYears.add(parseInt(year))
    })
  })

  const sortedYears = Array.from(allYears).sort((a, b) => a - b)
  const progression: PortfolioProgressionEntry[] = []

  let cumulativeContributions = 0
  let cumulativeInterest = 0
  let cumulativeTax = 0
  let cumulativeInterestReal = 0

  for (const year of sortedYears) {
    // Calculate contributions for this year
    const sparplanContribution = calculateYearlyContribution(year, elemente)
    const einmalzahlungContribution = calculateEinmalzahlungContribution(year, elemente)
    const yearlyContribution = sparplanContribution + einmalzahlungContribution

    // Aggregate simulation data for this year
    const aggregated = aggregateYearData(year, elemente)

    // Update cumulative totals
    cumulativeContributions += yearlyContribution
    cumulativeInterest += aggregated.yearlyInterest
    cumulativeTax += aggregated.yearlyTax

    if (aggregated.hasInflationData) {
      cumulativeInterestReal += aggregated.yearlyInterestReal
    }

    const progressionEntry: PortfolioProgressionEntry = {
      year,
      totalCapital: aggregated.totalCapital,
      yearlyContribution,
      yearlyInterest: aggregated.yearlyInterest,
      yearlyTax: aggregated.yearlyTax,
      cumulativeContributions,
      cumulativeInterest,
      cumulativeTax,
    }

    // Add inflation-adjusted values only if available
    if (aggregated.hasInflationData) {
      progressionEntry.totalCapitalReal = aggregated.totalCapitalReal
      progressionEntry.yearlyInterestReal = aggregated.yearlyInterestReal
      progressionEntry.cumulativeInterestReal = cumulativeInterestReal
    }

    progression.push(progressionEntry)
  }

  return progression
}

/**
 * Create summaries for each withdrawal segment
 */
/**
 * Calculate metrics for a withdrawal segment
 */
function calculateSegmentMetrics(
  segment: WithdrawalSegment,
  withdrawalResult: WithdrawalResult,
  startCapital: number,
): {
  endCapital: number
  totalWithdrawn: number
  averageMonthlyWithdrawal: number
} {
  const segmentYears = Array.from(
    { length: segment.endYear - segment.startYear + 1 },
    (_, i) => segment.startYear + i,
  )

  let endCapital = startCapital
  let totalWithdrawn = 0
  let totalMonthlyWithdrawals = 0
  let monthsWithData = 0

  for (const year of segmentYears) {
    const yearData = withdrawalResult[year]
    if (yearData) {
      endCapital = yearData.endkapital
      totalWithdrawn += yearData.entnahme

      if (yearData.monatlicheEntnahme !== undefined) {
        totalMonthlyWithdrawals += yearData.monatlicheEntnahme
        monthsWithData += 1
      }
    }
  }

  // Calculate average monthly withdrawal
  let averageMonthlyWithdrawal = 0
  if (monthsWithData > 0) {
    averageMonthlyWithdrawal = totalMonthlyWithdrawals / monthsWithData
  }
  else if (totalWithdrawn > 0) {
    averageMonthlyWithdrawal = totalWithdrawn / segmentYears.length / 12
  }

  return { endCapital, totalWithdrawn, averageMonthlyWithdrawal }
}

function createWithdrawalSegmentSummaries(
  segments: WithdrawalSegment[],
  withdrawalResult: WithdrawalResult,
  initialCapital: number,
): WithdrawalSegmentSummary[] {
  const summaries: WithdrawalSegmentSummary[] = []
  let currentCapital = initialCapital

  // Sort segments by start year
  const sortedSegments = [...segments].sort((a, b) => a.startYear - b.startYear)

  for (const segment of sortedSegments) {
    const segmentStartCapital = currentCapital
    const metrics = calculateSegmentMetrics(segment, withdrawalResult, currentCapital)

    summaries.push({
      id: segment.id,
      name: segment.name,
      startYear: segment.startYear,
      endYear: segment.endYear,
      strategy: getStrategyDisplayName(segment.strategy),
      startkapital: segmentStartCapital,
      endkapital: metrics.endCapital,
      totalWithdrawn: metrics.totalWithdrawn,
      averageMonthlyWithdrawal: metrics.averageMonthlyWithdrawal,
    })

    // Update current capital for next segment
    currentCapital = metrics.endCapital
  }

  return summaries
}

/**
 * Get display name for withdrawal strategy
 */
/**
 * Strategy display name mapping
 */
const STRATEGY_DISPLAY_NAMES: Record<string, string> = {
  '4prozent': '4% Regel',
  '3prozent': '3% Regel',
  'variabel_prozent': 'Variable Prozent',
  'monatlich_fest': 'Monatlich fest',
  'dynamisch': 'Dynamische Strategie',
  'bucket_strategie': 'Drei-Eimer-Strategie',
  'rmd': 'RMD (Lebenserwartung)',
  'kapitalerhalt': 'Kapitalerhalt / Ewige Rente',
  'steueroptimiert': 'Steueroptimierte Entnahme',
}

function getStrategyDisplayName(strategy: string): string {
  return STRATEGY_DISPLAY_NAMES[strategy] || strategy
}
