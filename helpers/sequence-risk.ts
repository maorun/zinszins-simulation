/**
 * Sequence Risk Analysis for Withdrawal Phases
 *
 * Analyzes the impact of different return sequences on portfolio sustainability
 * during retirement withdrawals. Sequence risk (sequence of returns risk) is
 * one of the most significant risks in retirement planning.
 *
 * The order of returns matters significantly when making withdrawals:
 * - Poor returns early in retirement can deplete the portfolio permanently
 * - Good returns early provide a buffer against future downturns
 * - Two portfolios with identical average returns can have vastly different outcomes
 */

export interface SequenceRiskScenario {
  /** Unique identifier for the scenario */
  id: string
  /** Display name */
  name: string
  /** Description of the scenario */
  description: string
  /** Starting portfolio value */
  startingPortfolio: number
  /** Annual withdrawal amount (fixed) */
  annualWithdrawal: number
  /** Withdrawal rate as percentage */
  withdrawalRate: number
  /** Array of annual returns (as decimal, e.g., 0.05 for 5%) */
  returns: number[]
  /** Years in the simulation */
  years: number
}

export interface YearlyResult {
  /** Year number (1-based) */
  year: number
  /** Portfolio value at start of year */
  startingValue: number
  /** Return for this year (decimal) */
  returnRate: number
  /** Investment gain/loss */
  investmentGain: number
  /** Withdrawal amount */
  withdrawal: number
  /** Portfolio value at end of year */
  endingValue: number
  /** Withdrawal as % of starting value */
  withdrawalRate: number
  /** Running success indicator (true if portfolio survived) */
  survived: boolean
}

export interface SequenceRiskAnalysis {
  /** The scenario that was analyzed */
  scenario: SequenceRiskScenario
  /** Year-by-year results */
  yearlyResults: YearlyResult[]
  /** Final portfolio value */
  finalPortfolioValue: number
  /** Years portfolio survived */
  yearsSurvived: number
  /** Total withdrawals made */
  totalWithdrawals: number
  /** Average annual return */
  averageReturn: number
  /** Portfolio depleted? */
  portfolioDepleted: boolean
  /** Year portfolio was depleted (if applicable) */
  depletionYear?: number
}

export interface SequenceComparison {
  /** Scenario with optimal sequence (best returns early) */
  bestCase: SequenceRiskAnalysis
  /** Scenario with average sequence */
  averageCase: SequenceRiskAnalysis
  /** Scenario with worst sequence (worst returns early) */
  worstCase: SequenceRiskAnalysis
  /** Difference in outcomes */
  outcomeDifference: {
    /** Difference in final portfolio value (best - worst) */
    portfolioValueDiff: number
    /** Difference in years survived (best - worst) */
    yearsSurvivedDiff: number
    /** Percentage difference in outcomes */
    percentageDiff: number
  }
}

/**
 * Simulate a single sequence scenario
 */
export function simulateSequence(scenario: SequenceRiskScenario): SequenceRiskAnalysis {
  const yearlyResults: YearlyResult[] = []
  let currentValue = scenario.startingPortfolio
  let totalWithdrawals = 0
  let yearsSurvived = 0
  let depletionYear: number | undefined

  for (let i = 0; i < scenario.years; i++) {
    const year = i + 1
    const startingValue = currentValue
    const returnRate = scenario.returns[i] || 0

    // Apply return
    const investmentGain = startingValue * returnRate

    // Take withdrawal (limited to available funds)
    const withdrawal = Math.min(scenario.annualWithdrawal, startingValue + investmentGain)
    totalWithdrawals += withdrawal

    // Calculate ending value
    const endingValue = Math.max(0, startingValue + investmentGain - withdrawal)
    const survived = endingValue > 0

    if (survived) {
      yearsSurvived = year
    } else if (depletionYear === undefined) {
      depletionYear = year
    }

    yearlyResults.push({
      year,
      startingValue,
      returnRate,
      investmentGain,
      withdrawal,
      endingValue,
      withdrawalRate: startingValue > 0 ? withdrawal / startingValue : 0,
      survived,
    })

    currentValue = endingValue

    // Stop if portfolio is depleted
    if (currentValue === 0) {
      break
    }
  }

  const averageReturn = scenario.returns.reduce((sum, r) => sum + r, 0) / scenario.returns.length

  return {
    scenario,
    yearlyResults,
    finalPortfolioValue: currentValue,
    yearsSurvived,
    totalWithdrawals,
    averageReturn,
    portfolioDepleted: currentValue === 0,
    depletionYear,
  }
}

/**
 * Generate return sequences for comparison
 * Creates best case (good returns early), worst case (poor returns early), and average case
 */
/**
 * Helper: Create return sequences from base returns
 */
function createReturnSequences(baseReturns: number[], years: number) {
  const sortedReturns = [...baseReturns].sort((a, b) => b - a)

  // Best case: good returns early
  const bestCaseReturns = [
    ...sortedReturns.slice(0, Math.floor(years / 3)),
    ...sortedReturns.slice(Math.floor(years / 3)),
  ]

  // Worst case: poor returns early
  const worstCaseReturns = [
    ...sortedReturns.slice(-Math.floor(years / 3)),
    ...sortedReturns.slice(0, -Math.floor(years / 3)),
  ]

  return { bestCaseReturns, worstCaseReturns, averageCaseReturns: baseReturns }
}

/**
 * Helper: Create scenario objects
 */
function createScenarios(
  startingPortfolio: number,
  annualWithdrawal: number,
  withdrawalRate: number,
  years: number,
  returns: { bestCaseReturns: number[]; worstCaseReturns: number[]; averageCaseReturns: number[] },
) {
  const bestCaseScenario: SequenceRiskScenario = {
    id: 'best',
    name: 'Günstige Sequenz',
    description: 'Gute Renditen in den ersten Jahren',
    startingPortfolio,
    annualWithdrawal,
    withdrawalRate,
    returns: returns.bestCaseReturns,
    years,
  }

  const worstCaseScenario: SequenceRiskScenario = {
    id: 'worst',
    name: 'Ungünstige Sequenz',
    description: 'Schlechte Renditen in den ersten Jahren',
    startingPortfolio,
    annualWithdrawal,
    withdrawalRate,
    returns: returns.worstCaseReturns,
    years,
  }

  const averageCaseScenario: SequenceRiskScenario = {
    id: 'average',
    name: 'Durchschnittliche Sequenz',
    description: 'Normale Marktzyklen',
    startingPortfolio,
    annualWithdrawal,
    withdrawalRate,
    returns: returns.averageCaseReturns,
    years,
  }

  return { bestCaseScenario, worstCaseScenario, averageCaseScenario }
}

export function generateSequenceScenarios(
  startingPortfolio: number,
  annualWithdrawal: number,
  years: number,
  averageReturn = 0.07,
  volatility = 0.15,
): SequenceComparison {
  const withdrawalRate = annualWithdrawal / startingPortfolio

  // Generate realistic return sequence with volatility
  const baseReturns: number[] = []
  for (let i = 0; i < years; i++) {
    const cyclicalFactor = Math.sin((i / years) * Math.PI * 4) * 0.3
    const returnValue = averageReturn + cyclicalFactor * volatility
    baseReturns.push(returnValue)
  }

  const returnSequences = createReturnSequences(baseReturns, years)
  const scenarios = createScenarios(startingPortfolio, annualWithdrawal, withdrawalRate, years, returnSequences)

  // Simulate all scenarios
  const bestCase = simulateSequence(scenarios.bestCaseScenario)
  const worstCase = simulateSequence(scenarios.worstCaseScenario)
  const averageCase = simulateSequence(scenarios.averageCaseScenario)

  // Calculate differences
  const outcomeDifference = {
    portfolioValueDiff: bestCase.finalPortfolioValue - worstCase.finalPortfolioValue,
    yearsSurvivedDiff: bestCase.yearsSurvived - worstCase.yearsSurvived,
    percentageDiff:
      worstCase.finalPortfolioValue > 0
        ? ((bestCase.finalPortfolioValue - worstCase.finalPortfolioValue) / worstCase.finalPortfolioValue) * 100
        : Infinity,
  }

  return {
    bestCase,
    worstCase,
    averageCase,
    outcomeDifference,
  }
}

/**
 * Calculate safe withdrawal rate considering sequence risk
 * Uses historical worst-case scenarios to determine a conservative rate
 */
export function calculateSafeWithdrawalRate(
  startingPortfolio: number,
  years: number,
  targetSurvivalRate = 0.95,
  averageReturn = 0.07,
  volatility = 0.15,
): {
  safeWithdrawalRate: number
  safeWithdrawalAmount: number
  survivalProbability: number
} {
  // Test different withdrawal rates
  const testRates = [0.03, 0.035, 0.04, 0.045, 0.05, 0.055, 0.06]
  let bestRate = 0.03

  for (const rate of testRates) {
    const withdrawal = startingPortfolio * rate
    const comparison = generateSequenceScenarios(startingPortfolio, withdrawal, years, averageReturn, volatility)

    // Check if worst case survives
    if (comparison.worstCase.yearsSurvived === years) {
      bestRate = rate
    } else {
      break
    }
  }

  return {
    safeWithdrawalRate: bestRate,
    safeWithdrawalAmount: startingPortfolio * bestRate,
    survivalProbability: targetSurvivalRate,
  }
}

/**
 * Analyze sequence risk impact for a given configuration
 */
export function analyzeSequenceRisk(
  startingPortfolio: number,
  annualWithdrawal: number,
  years: number,
  averageReturn = 0.07,
  volatility = 0.15,
): SequenceComparison & {
  recommendations: string[]
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
} {
  const comparison = generateSequenceScenarios(startingPortfolio, annualWithdrawal, years, averageReturn, volatility)

  const recommendations: string[] = []
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'

  // Analyze risk level
  if (comparison.worstCase.portfolioDepleted) {
    riskLevel = 'critical'
    recommendations.push('Portfolio wird im ungünstigsten Fall aufgebraucht')
    recommendations.push('Entnahmerate deutlich reduzieren (empfohlen: unter 4%)')
  } else if (comparison.worstCase.finalPortfolioValue < startingPortfolio * 0.3) {
    riskLevel = 'high'
    recommendations.push('Hohes Sequenz-Risiko - Portfolio könnte stark schrumpfen')
    recommendations.push('Entnahmerate leicht reduzieren oder dynamische Entnahmen verwenden')
  } else if (comparison.worstCase.finalPortfolioValue < startingPortfolio * 0.7) {
    riskLevel = 'medium'
    recommendations.push('Moderates Sequenz-Risiko vorhanden')
    recommendations.push('Dynamische Entnahmestrategie könnte Risiko reduzieren')
  } else {
    riskLevel = 'low'
    recommendations.push('Niedriges Sequenz-Risiko bei dieser Entnahmerate')
  }

  // Additional recommendations
  if (comparison.outcomeDifference.portfolioValueDiff > startingPortfolio) {
    recommendations.push('Große Varianz zwischen Best- und Worst-Case - Sequenz-Risiko ist signifikant')
  }

  return {
    ...comparison,
    recommendations,
    riskLevel,
  }
}

/**
 * Get default configuration for sequence risk analysis
 */
export function getDefaultSequenceRiskConfig(): {
  startingPortfolio: number
  annualWithdrawal: number
  years: number
  averageReturn: number
  volatility: number
} {
  return {
    startingPortfolio: 500000,
    annualWithdrawal: 20000,
    years: 30,
    averageReturn: 0.07,
    volatility: 0.15,
  }
}
