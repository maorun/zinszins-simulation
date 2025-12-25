/**
 * Stress Testing utilities for systematic portfolio testing under extreme scenarios
 * Tests portfolio resilience across multiple historical crisis scenarios
 */

import {
  BLACK_SWAN_EVENTS,
  calculateCumulativeImpact,
  type BlackSwanEvent,
  type BlackSwanEventId,
} from '../../helpers/black-swan-events'

export interface StressTestScenario {
  id: string
  name: string
  description: string
  event: BlackSwanEvent
  cumulativeImpact: number // Total cumulative return over the crisis period
}

export interface StressTestResult {
  scenario: StressTestScenario
  finalCapital: number
  capitalLoss: number // Absolute loss in EUR
  percentageLoss: number // Percentage loss from baseline
  recoveryYearsNeeded: number // Years to recover to baseline
}

export interface StressTestConfiguration {
  baselineCapital: number // Starting capital for stress tests
  annualContribution: number // Annual savings contribution
  normalReturn: number // Expected return in normal years (e.g., 0.07 for 7%)
  testDurationYears: number // How many years to run the stress test
}

/**
 * Get all predefined stress test scenarios based on historical Black Swan events
 */
export function getStressTestScenarios(): StressTestScenario[] {
  const eventIds: BlackSwanEventId[] = ['dotcom-crash-2000', 'financial-crisis-2008', 'covid-crash-2020']

  return eventIds.map(id => {
    const event = BLACK_SWAN_EVENTS[id]
    return {
      id,
      name: event.name,
      description: event.description,
      event,
      cumulativeImpact: calculateCumulativeImpact(event),
    }
  })
}

/**
 * Calculate baseline portfolio value (no crisis)
 */
function calculateBaselineValue(
  baselineCapital: number,
  annualContribution: number,
  normalReturn: number,
  years: number,
): number {
  let value = baselineCapital
  for (let year = 0; year < years; year++) {
    value = value * (1 + normalReturn) + annualContribution
  }
  return value
}

/**
 * Calculate portfolio value with crisis scenario
 */
function calculateCrisisValue(
  baselineCapital: number,
  annualContribution: number,
  normalReturn: number,
  years: number,
  event: BlackSwanEvent,
): number {
  let value = baselineCapital
  const crisisYears = new Set(Array.from({ length: event.duration }, (_, i) => i))

  for (let year = 0; year < years; year++) {
    const returnRate = crisisYears.has(year) ? event.yearlyReturns[year] ?? normalReturn : normalReturn
    value = value * (1 + returnRate) + annualContribution
  }
  return value
}

/**
 * Calculate recovery years needed after a crisis
 */
function calculateRecoveryYears(
  baselineCapital: number,
  annualContribution: number,
  normalReturn: number,
  event: BlackSwanEvent,
): number {
  const crisisEndYear = event.duration

  // Apply crisis
  let recoveryValue = calculateCrisisValue(baselineCapital, annualContribution, normalReturn, crisisEndYear, event)

  // Calculate target value (baseline at crisis end)
  let targetValue = calculateBaselineValue(baselineCapital, annualContribution, normalReturn, crisisEndYear)

  // Calculate how many years to recover
  let recoveryYears = 0
  while (recoveryValue < targetValue && recoveryYears < 20) {
    recoveryValue = recoveryValue * (1 + normalReturn) + annualContribution
    targetValue = targetValue * (1 + normalReturn) + annualContribution
    recoveryYears++
  }

  return recoveryYears + event.duration
}

/**
 * Calculate portfolio value under a stress test scenario
 * Simulates what happens if the crisis occurs at year 0
 */
export function calculateStressTestResult(
  scenario: StressTestScenario,
  config: StressTestConfiguration,
): StressTestResult {
  const { event } = scenario
  const { baselineCapital, annualContribution, normalReturn, testDurationYears } = config

  const baselineValue = calculateBaselineValue(baselineCapital, annualContribution, normalReturn, testDurationYears)
  const portfolioValue = calculateCrisisValue(
    baselineCapital,
    annualContribution,
    normalReturn,
    testDurationYears,
    event,
  )

  const capitalLoss = baselineValue - portfolioValue
  const percentageLoss = baselineValue > 0 ? (capitalLoss / baselineValue) * 100 : 0
  const recoveryYearsNeeded = calculateRecoveryYears(baselineCapital, annualContribution, normalReturn, event)

  return {
    scenario,
    finalCapital: portfolioValue,
    capitalLoss,
    percentageLoss,
    recoveryYearsNeeded,
  }
}

/**
 * Run stress tests across all scenarios and return results
 */
export function runStressTests(config: StressTestConfiguration): StressTestResult[] {
  const scenarios = getStressTestScenarios()
  return scenarios.map(scenario => calculateStressTestResult(scenario, config))
}

/**
 * Calculate summary statistics from stress test results
 */
export interface StressTestSummary {
  worstCaseScenario: StressTestResult
  averageCapitalLoss: number
  averagePercentageLoss: number
  averageRecoveryYears: number
  totalScenariosTestedCount: number
}

export function calculateStressTestSummary(results: StressTestResult[]): StressTestSummary {
  if (results.length === 0) {
    throw new Error('No stress test results to summarize')
  }

  const worstCaseScenario = results.reduce((worst, current) =>
    current.percentageLoss > worst.percentageLoss ? current : worst,
  )

  const averageCapitalLoss = results.reduce((sum, r) => sum + r.capitalLoss, 0) / results.length
  const averagePercentageLoss = results.reduce((sum, r) => sum + r.percentageLoss, 0) / results.length
  const averageRecoveryYears = results.reduce((sum, r) => sum + r.recoveryYearsNeeded, 0) / results.length

  return {
    worstCaseScenario,
    averageCapitalLoss,
    averagePercentageLoss,
    averageRecoveryYears,
    totalScenariosTestedCount: results.length,
  }
}
