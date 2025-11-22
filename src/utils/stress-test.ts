/**
 * Stress Testing functionality for portfolio risk management
 *
 * Stress tests evaluate how a portfolio performs under extreme market conditions
 * by applying specific shock scenarios to the portfolio value.
 *
 * Unlike VaR which uses statistical probabilities, stress tests examine
 * specific "what-if" scenarios based on historical crises or hypothetical events.
 */

/**
 * Predefined stress test scenario
 */
export interface StressScenario {
  /** Scenario name in German */
  name: string

  /** Detailed description in German */
  description: string

  /** Market shock as percentage (e.g., -0.40 for -40% crash) */
  marketShock: number

  /** Historical reference or basis for the scenario */
  historicalReference?: string

  /** Year or period when this occurred historically */
  historicalPeriod?: string

  /** Category of stress test */
  category: 'historical' | 'hypothetical'
}

/**
 * Result of a single stress test
 */
export interface StressTestResult {
  /** Scenario that was tested */
  scenario: StressScenario

  /** Original portfolio value before stress */
  originalValue: number

  /** Portfolio value after applying stress */
  stressedValue: number

  /** Absolute loss in EUR */
  absoluteLoss: number

  /** Loss as percentage */
  lossPercent: number
}

/**
 * Complete stress test analysis
 */
export interface StressTestAnalysis {
  /** Results for each scenario */
  results: StressTestResult[]

  /** Original portfolio value */
  portfolioValue: number

  /** Worst-case scenario */
  worstCase: StressTestResult

  /** Average loss across all scenarios */
  averageLoss: number
}

/**
 * Predefined historical stress test scenarios
 * Based on major market crashes and crises
 */
export const HISTORICAL_STRESS_SCENARIOS: StressScenario[] = [
  {
    name: 'Finanzkrise 2008',
    description: 'Globale Finanzkrise mit Zusammenbruch von Lehman Brothers',
    marketShock: -0.57, // ~57% drop in many indices
    historicalReference: 'S&P 500: -56.8% von Höchststand bis Tiefststand',
    historicalPeriod: 'Oktober 2007 - März 2009',
    category: 'historical',
  },
  {
    name: 'COVID-19 Crash',
    description: 'Pandemie-bedingter Markteinbruch',
    marketShock: -0.34, // ~34% rapid drop
    historicalReference: 'S&P 500: -33.9% in 33 Tagen',
    historicalPeriod: 'Februar - März 2020',
    category: 'historical',
  },
  {
    name: 'Dotcom-Blase',
    description: 'Platzen der Internet-Blase',
    marketShock: -0.49, // NASDAQ lost ~49%
    historicalReference: 'NASDAQ: -78% über 31 Monate',
    historicalPeriod: 'März 2000 - Oktober 2002',
    category: 'historical',
  },
  {
    name: 'Schwarzer Montag 1987',
    description: 'Größter Tagesverlust der Geschichte',
    marketShock: -0.23, // -22.6% in one day
    historicalReference: 'Dow Jones: -22.6% an einem Tag',
    historicalPeriod: '19. Oktober 1987',
    category: 'historical',
  },
  {
    name: 'Europäische Schuldenkrise',
    description: 'Staatsschuldenkrise in der Eurozone',
    marketShock: -0.37, // European indices
    historicalReference: 'Euro Stoxx 50: -37% über 18 Monate',
    historicalPeriod: '2011-2012',
    category: 'historical',
  },
]

/**
 * Hypothetical stress scenarios for "what-if" analysis
 */
export const HYPOTHETICAL_STRESS_SCENARIOS: StressScenario[] = [
  {
    name: 'Moderater Crash (-20%)',
    description: 'Typische Korrektur, wie sie alle paar Jahre vorkommt',
    marketShock: -0.20,
    category: 'hypothetical',
  },
  {
    name: 'Schwerer Crash (-40%)',
    description: 'Schwere Krise, vergleichbar mit 2008',
    marketShock: -0.40,
    category: 'hypothetical',
  },
  {
    name: 'Extremer Crash (-60%)',
    description: 'Worst-Case-Szenario, historisch sehr selten',
    marketShock: -0.60,
    category: 'hypothetical',
  },
  {
    name: 'Leichte Korrektur (-10%)',
    description: 'Häufige Marktschwankung',
    marketShock: -0.10,
    category: 'hypothetical',
  },
]

/**
 * Apply a stress test scenario to a portfolio
 *
 * @param portfolioValue - Current portfolio value in EUR
 * @param scenario - Stress scenario to apply
 * @returns Stress test result
 */
export function applyStressTest(portfolioValue: number, scenario: StressScenario): StressTestResult {
  // Calculate stressed value
  const stressedValue = portfolioValue * (1 + scenario.marketShock)

  // Calculate losses
  const absoluteLoss = portfolioValue - stressedValue
  const lossPercent = Math.abs(scenario.marketShock) * 100

  return {
    scenario,
    originalValue: portfolioValue,
    stressedValue: Math.max(0, stressedValue), // Cannot be negative
    absoluteLoss,
    lossPercent,
  }
}

/**
 * Run comprehensive stress test analysis with multiple scenarios
 *
 * @param portfolioValue - Current portfolio value in EUR
 * @param scenarios - Scenarios to test (defaults to all historical scenarios)
 * @returns Complete stress test analysis
 */
export function runStressTestAnalysis(
  portfolioValue: number,
  scenarios: StressScenario[] = HISTORICAL_STRESS_SCENARIOS,
): StressTestAnalysis {
  // Run all stress tests
  const results = scenarios.map(scenario => applyStressTest(portfolioValue, scenario))

  // Find worst case
  const worstCase = results.reduce((worst, current) => {
    return current.absoluteLoss > worst.absoluteLoss ? current : worst
  }, results[0])

  // Calculate average loss
  const averageLoss = results.reduce((sum, result) => sum + result.absoluteLoss, 0) / results.length

  return {
    results,
    portfolioValue,
    worstCase,
    averageLoss,
  }
}

/**
 * Create a custom stress test scenario
 *
 * @param name - Scenario name
 * @param description - Scenario description
 * @param marketShock - Market shock as decimal (e.g., -0.30 for -30%)
 * @returns Custom stress scenario
 */
export function createCustomStressScenario(
  name: string,
  description: string,
  marketShock: number,
): StressScenario {
  return {
    name,
    description,
    marketShock,
    category: 'hypothetical',
  }
}

/**
 * Get a human-readable description of a stress test result
 *
 * @param result - Stress test result to describe
 * @returns Human-readable description in German
 */
export function getStressTestDescription(result: StressTestResult): string {
  const { scenario, absoluteLoss, lossPercent, stressedValue } = result

  return `Im ${scenario.name}-Szenario würde Ihr Portfolio einen Verlust von ${absoluteLoss.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} (${lossPercent.toFixed(1).replace('.', ',')}%) erleiden und auf ${stressedValue.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} fallen.`
}

/**
 * Get severity classification for a stress test
 */
export function getStressSeverity(lossPercent: number): 'low' | 'medium' | 'high' | 'extreme' {
  if (lossPercent < 15) return 'low'
  if (lossPercent < 30) return 'medium'
  if (lossPercent < 50) return 'high'
  return 'extreme'
}

/**
 * Get color class for severity level
 */
export function getSeverityColorClass(severity: 'low' | 'medium' | 'high' | 'extreme'): string {
  switch (severity) {
    case 'low':
      return 'warning-row' // Yellow
    case 'medium':
      return 'info-row' // Blue
    case 'high':
      return 'danger-row' // Red
    case 'extreme':
      return 'danger-row' // Red (darker)
    default:
      return ''
  }
}
