import type { SimulationResult, SimulationResultElement } from './simulate'
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
  const first: SimulationResultElement | undefined = element && Object.values(element).shift()
  const last: SimulationResultElement | undefined = element && Object.values(element).pop()

  return {
    startkapital: first?.startkapital || 0,
    zinsen: Number(last?.endkapital) - Number(first?.startkapital),
    bezahlteSteuer: element
      ? Object.values(element).reduce(
          (previousValue, currentValue) =>
            previousValue + currentValue.bezahlteSteuer,
          0,
        )
      : 0,
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

  // Calculate total withdrawn and average monthly withdrawal
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

  // Calculate average monthly withdrawal
  let averageMonthlyWithdrawal = 0
  if (monthsWithData > 0) {
    // Calculate time-weighted average of monthly withdrawals across all years
    // This is more accurate for segmented withdrawal strategies with varying amounts
    averageMonthlyWithdrawal = totalMonthlyWithdrawals / monthsWithData
  }
  else if (totalWithdrawn > 0) {
    // Fallback: divide total annual withdrawals by 12
    averageMonthlyWithdrawal = totalWithdrawn / years.length / 12
  }

  return {
    totalYears,
    finalCapital,
    averageMonthlyWithdrawal,
    totalWithdrawn,
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
  // Formula: ((endkapital / startkapital) ^ (1/years)) - 1
  const totalYearsSavings = endYear && startYear ? endYear - startYear : 0
  let renditeAnsparphase = 0

  if (baseSummary.startkapital > 0 && totalYearsSavings > 0) {
    // Calculate annualized return rate
    const totalReturn = baseSummary.endkapital / baseSummary.startkapital
    renditeAnsparphase = (Math.pow(totalReturn, 1 / totalYearsSavings) - 1) * 100
  }

  const enhancedSummary: EnhancedSummary = {
    ...baseSummary,
    renditeAnsparphase,
    isSegmentedWithdrawal,
  }

  // Add withdrawal phase metrics if provided
  if (withdrawalResult) {
    const withdrawalData = extractWithdrawalMetrics(withdrawalResult)

    enhancedSummary.endkapitalEntspharphase = withdrawalData.finalCapital
    enhancedSummary.monatlicheAuszahlung = withdrawalData.averageMonthlyWithdrawal
    enhancedSummary.jahreEntspharphase = withdrawalData.totalYears

    // Handle segmented withdrawal summaries
    if (isSegmentedWithdrawal && withdrawalSegments && withdrawalSegments.length > 1) {
      enhancedSummary.withdrawalSegments = createWithdrawalSegmentSummaries(
        withdrawalSegments,
        withdrawalResult,
        baseSummary.endkapital,
      )
    }
  }

  return enhancedSummary
}

/**
 * Calculate year-by-year portfolio progression (cumulative capital for each year)
 */
export function getYearlyPortfolioProgression(elemente?: SparplanElement[]): Array<{
  year: number
  totalCapital: number
  yearlyContribution: number
  yearlyInterest: number
  yearlyTax: number
  cumulativeContributions: number
  cumulativeInterest: number
  cumulativeTax: number
}> {
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
  const progression: Array<{
    year: number
    totalCapital: number
    yearlyContribution: number
    yearlyInterest: number
    yearlyTax: number
    cumulativeContributions: number
    cumulativeInterest: number
    cumulativeTax: number
  }> = []

  let cumulativeContributions = 0
  let cumulativeInterest = 0
  let cumulativeTax = 0

  for (const year of sortedYears) {
    let yearlyContribution = 0
    let yearlyInterest = 0
    let yearlyTax = 0
    let totalCapital = 0

    // Calculate yearly contribution for this year
    // ONLY count contributions from elements that actually start in this year
    const elementsStartingThisYear = elemente.filter(el =>
      el.type === 'sparplan' && new Date(el.start).getFullYear() === year,
    )

    if (elementsStartingThisYear.length > 0) {
      // Check if we have monthly elements (multiple elements per year) or yearly elements (one element per year)
      if (elementsStartingThisYear.length === 1) {
        // Single yearly element for this year
        yearlyContribution += elementsStartingThisYear[0].einzahlung
      }
      else if (elementsStartingThisYear.length > 1) {
        // Multiple elements starting this year - could be multiple Sparpläne or monthly elements
        // Check if they have the same einzahlung amount (indicating monthly elements from same Sparplan)
        const firstAmount = elementsStartingThisYear[0].einzahlung
        const allSameAmount = elementsStartingThisYear.every(el => el.einzahlung === firstAmount)

        if (allSameAmount && elementsStartingThisYear.length === 12) {
          // 12 elements with same amount = monthly elements from one Sparplan
          yearlyContribution += firstAmount * 12
        }
        else {
          // Multiple different Sparpläne starting in the same year - sum them up
          yearlyContribution += elementsStartingThisYear.reduce((sum, el) => sum + el.einzahlung, 0)
        }
      }
    }

    // Note: We removed the problematic "else if" branch that incorrectly assumed
    // contributions from simulation data alone. If no elements start this year,
    // there are NO NEW CONTRIBUTIONS - only compound growth of existing capital.

    // Handle one-time payments (Einmalzahlungen)
    elemente.forEach((element) => {
      const yearData = element.simulation[year]
      if (yearData && element.type === 'einmalzahlung') {
        const elementStartYear = new Date(element.start).getFullYear()
        if (elementStartYear === year) {
          yearlyContribution += element.einzahlung
        }
      }
    })

    // Sum up all elements for this year (capital, interest, tax)
    elemente.forEach((element) => {
      const yearData = element.simulation[year]
      if (yearData) {
        // Add the end capital from this element for this year
        totalCapital += yearData.endkapital

        // Add the interest from this element for this year
        yearlyInterest += yearData.zinsen

        // Add the tax paid by this element for this year
        yearlyTax += yearData.bezahlteSteuer
      }
    })

    // Update cumulative totals
    cumulativeContributions += yearlyContribution
    cumulativeInterest += yearlyInterest
    cumulativeTax += yearlyTax

    progression.push({
      year,
      totalCapital,
      yearlyContribution,
      yearlyInterest,
      yearlyTax,
      cumulativeContributions,
      cumulativeInterest,
      cumulativeTax,
    })
  }

  return progression
}

/**
 * Create summaries for each withdrawal segment
 */
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
    const segmentYears = Array.from(
      { length: segment.endYear - segment.startYear + 1 },
      (_, i) => segment.startYear + i,
    )

    // Calculate metrics for this segment
    let segmentStartCapital = currentCapital
    let segmentEndCapital = currentCapital
    let totalWithdrawn = 0
    let totalMonthlyWithdrawals = 0
    let monthsWithData = 0

    for (const year of segmentYears) {
      const yearData = withdrawalResult[year]
      if (yearData) {
        segmentEndCapital = yearData.endkapital
        totalWithdrawn += yearData.entnahme

        if (yearData.monatlicheEntnahme !== undefined) {
          totalMonthlyWithdrawals += yearData.monatlicheEntnahme
          monthsWithData += 1
        }
      }
    }

    // Calculate average monthly withdrawal for this segment
    let averageMonthlyWithdrawal = 0
    if (monthsWithData > 0) {
      // Calculate time-weighted average of monthly withdrawals for this segment
      averageMonthlyWithdrawal = totalMonthlyWithdrawals / monthsWithData
    }
    else if (totalWithdrawn > 0) {
      // Fallback: divide total annual withdrawals by 12
      averageMonthlyWithdrawal = totalWithdrawn / segmentYears.length / 12
    }

    summaries.push({
      id: segment.id,
      name: segment.name,
      startYear: segment.startYear,
      endYear: segment.endYear,
      strategy: getStrategyDisplayName(segment.strategy),
      startkapital: segmentStartCapital,
      endkapital: segmentEndCapital,
      totalWithdrawn,
      averageMonthlyWithdrawal,
    })

    // Update current capital for next segment
    currentCapital = segmentEndCapital
  }

  return summaries
}

/**
 * Get display name for withdrawal strategy
 */
function getStrategyDisplayName(strategy: string): string {
  switch (strategy) {
    case '4prozent':
      return '4% Regel'
    case '3prozent':
      return '3% Regel'
    case 'variabel_prozent':
      return 'Variable Prozent'
    case 'monatlich_fest':
      return 'Monatlich fest'
    case 'dynamisch':
      return 'Dynamische Strategie'
    default:
      return strategy
  }
}
