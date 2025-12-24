/**
 * Inflation Scenario simulation utilities
 * Supports both realistic scenarios for retirement planning and stress-test scenarios
 * Realistic: Optimistic, Moderate, Pessimistic, Historical
 * Stress-Test: Hyperinflation, Deflation, Stagflation
 */

export type InflationScenarioId =
  | 'optimistic'
  | 'moderate'
  | 'pessimistic'
  | 'historical'
  | 'hyperinflation'
  | 'deflation'
  | 'stagflation'
  | 'custom'

export type InflationScenarioCategory = 'realistic' | 'stress-test'

export interface InflationScenario {
  id: InflationScenarioId
  name: string
  description: string
  category: InflationScenarioCategory // Whether this is a realistic or stress-test scenario
  startYear: number
  duration: number // years
  yearlyInflationRates: Record<number, number> // Map of relative year offset to inflation rate
  yearlyReturnModifiers?: Record<number, number> // Optional: return rate modifications (for stagflation)
  recoveryYears?: number // Optional: years needed for recovery to normal inflation
}

/**
 * Predefined inflation scenarios
 * Includes both realistic scenarios for retirement planning and stress-test scenarios
 */
export const INFLATION_SCENARIOS: Record<InflationScenarioId, InflationScenario> = {
  // ===== REALISTIC SCENARIOS FOR RETIREMENT PLANNING =====
  optimistic: {
    id: 'optimistic',
    name: 'Optimistisch (Niedrige Inflation)',
    description: 'Niedrige Inflation unter dem EZB-Ziel von 2% - konstant 1,5% jährlich',
    category: 'realistic',
    startYear: 2024,
    duration: 30, // Long-term realistic scenario
    yearlyInflationRates: Array.from({ length: 30 }, (_, i) => [i, 0.015]).reduce(
      (acc, [i, rate]) => ({ ...acc, [i]: rate }),
      {},
    ),
  },
  moderate: {
    id: 'moderate',
    name: 'Moderat (EZB-Ziel)',
    description: 'Stabile Inflation am EZB-Ziel - konstant 2,0% jährlich',
    category: 'realistic',
    startYear: 2024,
    duration: 30, // Long-term realistic scenario
    yearlyInflationRates: Array.from({ length: 30 }, (_, i) => [i, 0.02]).reduce(
      (acc, [i, rate]) => ({ ...acc, [i]: rate }),
      {},
    ),
  },
  pessimistic: {
    id: 'pessimistic',
    name: 'Pessimistisch (Erhöhte Inflation)',
    description: 'Anhaltend erhöhte Inflation über dem EZB-Ziel - konstant 3,5% jährlich',
    category: 'realistic',
    startYear: 2024,
    duration: 30, // Long-term realistic scenario
    yearlyInflationRates: Array.from({ length: 30 }, (_, i) => [i, 0.035]).reduce(
      (acc, [i, rate]) => ({ ...acc, [i]: rate }),
      {},
    ),
  },
  historical: {
    id: 'historical',
    name: 'Historisch (Deutschland 2000-2023)',
    description: 'Basierend auf tatsächlichen deutschen Inflationsraten 2000-2023 (Durchschnitt ~1,7%)',
    category: 'realistic',
    startYear: 2024,
    duration: 24, // 2000-2023 historical data
    // Historical German inflation rates (source: Statistisches Bundesamt)
    yearlyInflationRates: {
      0: 0.014, // 2000: 1,4%
      1: 0.019, // 2001: 1,9%
      2: 0.014, // 2002: 1,4%
      3: 0.01, // 2003: 1,0%
      4: 0.018, // 2004: 1,8%
      5: 0.019, // 2005: 1,9%
      6: 0.016, // 2006: 1,6%
      7: 0.023, // 2007: 2,3%
      8: 0.026, // 2008: 2,6%
      9: 0.002, // 2009: 0,2%
      10: 0.011, // 2010: 1,1%
      11: 0.021, // 2011: 2,1%
      12: 0.02, // 2012: 2,0%
      13: 0.015, // 2013: 1,5%
      14: 0.009, // 2014: 0,9%
      15: 0.002, // 2015: 0,2%
      16: 0.004, // 2016: 0,4%
      17: 0.017, // 2017: 1,7%
      18: 0.019, // 2018: 1,9%
      19: 0.014, // 2019: 1,4%
      20: 0.005, // 2020: 0,5%
      21: 0.032, // 2021: 3,2%
      22: 0.079, // 2022: 7,9%
      23: 0.059, // 2023: 5,9%
    },
  },
  // ===== STRESS-TEST SCENARIOS =====
  hyperinflation: {
    id: 'hyperinflation',
    name: 'Hyperinflation (Hohes Inflationsszenario)',
    description: 'Anhaltend hohe Inflation ähnlich der 1970er Jahre mit 8-12% jährlich',
    category: 'stress-test',
    startYear: 2024,
    duration: 5,
    yearlyInflationRates: {
      0: 0.08, // Jahr 1: 8%
      1: 0.1, // Jahr 2: 10%
      2: 0.12, // Jahr 3: 12%
      3: 0.1, // Jahr 4: 10%
      4: 0.08, // Jahr 5: 8%
    },
    recoveryYears: 3,
  },
  deflation: {
    id: 'deflation',
    name: 'Deflation (Negatives Inflationsszenario)',
    description: 'Deflationäre Phase mit fallenden Preisen (-2% bis 0%) ähnlich Japan 1990er',
    category: 'stress-test',
    startYear: 2024,
    duration: 4,
    yearlyInflationRates: {
      0: -0.01, // Jahr 1: -1%
      1: -0.02, // Jahr 2: -2%
      2: -0.01, // Jahr 3: -1%
      3: 0.0, // Jahr 4: 0%
    },
    recoveryYears: 2,
  },
  stagflation: {
    id: 'stagflation',
    name: 'Stagflation (Inflation + niedrige Renditen)',
    description: 'Kombination aus hoher Inflation (6-8%) und schwachem Wirtschaftswachstum mit reduzierten Renditen',
    category: 'stress-test',
    startYear: 2024,
    duration: 4,
    yearlyInflationRates: {
      0: 0.06, // Jahr 1: 6%
      1: 0.08, // Jahr 2: 8%
      2: 0.07, // Jahr 3: 7%
      3: 0.06, // Jahr 4: 6%
    },
    yearlyReturnModifiers: {
      0: -0.03, // Jahr 1: -3 Prozentpunkte Rendite
      1: -0.04, // Jahr 2: -4 Prozentpunkte Rendite
      2: -0.03, // Jahr 3: -3 Prozentpunkte Rendite
      3: -0.02, // Jahr 4: -2 Prozentpunkte Rendite
    },
    recoveryYears: 3,
  },
  custom: {
    id: 'custom',
    name: 'Benutzerdefiniertes Szenario',
    description: 'Erstellen Sie Ihr eigenes Inflationsszenario',
    category: 'realistic',
    startYear: 2024,
    duration: 3,
    yearlyInflationRates: {
      0: 0.05, // Default: 5%
      1: 0.05,
      2: 0.05,
    },
  },
}

/**
 * Apply an inflation scenario to a specific year in the simulation
 * @param baseYear - The year in the simulation when the scenario should start
 * @param scenario - The inflation scenario to apply
 * @returns Map of year to inflation rate for the scenario period
 */
export function applyInflationScenario(baseYear: number, scenario: InflationScenario): Record<number, number> {
  const inflationRates: Record<number, number> = {}

  for (let offset = 0; offset < scenario.duration; offset++) {
    const year = baseYear + offset
    inflationRates[year] = scenario.yearlyInflationRates[offset] ?? 0.02 // Fallback to 2% if not defined
  }

  return inflationRates
}

/**
 * Apply return modifiers from an inflation scenario (e.g., for stagflation)
 * @param baseYear - The year in the simulation when the scenario should start
 * @param scenario - The inflation scenario to apply
 * @returns Map of year to return rate modifier (to be subtracted from base return)
 */
export function applyReturnModifiers(baseYear: number, scenario: InflationScenario): Record<number, number> {
  if (!scenario.yearlyReturnModifiers) {
    return {}
  }

  const returnModifiers: Record<number, number> = {}

  for (let offset = 0; offset < scenario.duration; offset++) {
    const year = baseYear + offset
    const modifier = scenario.yearlyReturnModifiers[offset]
    if (modifier !== undefined) {
      returnModifiers[year] = modifier
    }
  }

  return returnModifiers
}

/**
 * Calculate the cumulative inflation impact of a scenario
 * @param scenario - The inflation scenario
 * @returns Cumulative inflation over the scenario period (e.g., 0.5 for 50% total inflation)
 */
export function calculateCumulativeInflation(scenario: InflationScenario): number {
  let cumulativeInflation = 1.0

  for (let offset = 0; offset < scenario.duration; offset++) {
    const yearInflation = scenario.yearlyInflationRates[offset] ?? 0
    cumulativeInflation *= 1 + yearInflation
  }

  return cumulativeInflation - 1 // Convert back to inflation rate
}

/**
 * Calculate average annual inflation rate of a scenario
 * @param scenario - The inflation scenario
 * @returns Average annual inflation rate
 */
export function calculateAverageInflation(scenario: InflationScenario): number {
  const cumulativeInflation = calculateCumulativeInflation(scenario)
  // Convert cumulative to average annual using geometric mean
  return Math.pow(1 + cumulativeInflation, 1 / scenario.duration) - 1
}

/**
 * Merge inflation scenario rates with existing inflation configuration
 * @param existingInflation - Existing yearly inflation rates
 * @param scenarioInflation - Inflation scenario rates to overlay
 * @returns Merged inflation rates with scenario applied
 */
export function mergeInflationScenario(
  existingInflation: Record<number, number>,
  scenarioInflation: Record<number, number>,
): Record<number, number> {
  return {
    ...existingInflation,
    ...scenarioInflation, // Scenario rates override existing rates
  }
}

/**
 * Merge inflation scenario rates with a base inflation rate
 * Creates a record with the base rate for all years, then overlays the scenario
 * @param baseRate - Base inflation rate (as decimal, e.g., 0.02 for 2%)
 * @param scenarioInflation - Inflation scenario rates to overlay
 * @param startYear - Start year of simulation
 * @param endYear - End year of simulation
 * @returns Merged inflation rates with scenario applied
 */
export function mergeInflationWithBaseRate(
  baseRate: number,
  scenarioInflation: Record<number, number>,
  startYear: number,
  endYear: number,
): Record<number, number> {
  const baseInflation: Record<number, number> = {}
  for (let year = startYear; year <= endYear; year++) {
    baseInflation[year] = baseRate
  }
  return mergeInflationScenario(baseInflation, scenarioInflation)
}

/**
 * Get all available inflation scenarios (excluding custom)
 */
export function getAvailableInflationScenarios(): InflationScenario[] {
  return Object.values(INFLATION_SCENARIOS).filter(scenario => scenario.id !== 'custom')
}

/**
 * Get inflation scenarios by category
 * @param category - 'realistic' for retirement planning scenarios, 'stress-test' for extreme scenarios
 */
export function getScenariosByCategory(category: InflationScenarioCategory): InflationScenario[] {
  return Object.values(INFLATION_SCENARIOS).filter(
    scenario => scenario.category === category && scenario.id !== 'custom',
  )
}

/**
 * Get realistic scenarios for retirement planning
 */
export function getRealisticScenarios(): InflationScenario[] {
  return getScenariosByCategory('realistic')
}

/**
 * Get stress-test scenarios for portfolio stress testing
 */
export function getStressTestScenarios(): InflationScenario[] {
  return getScenariosByCategory('stress-test')
}

/**
 * Get an inflation scenario by ID
 */
export function getInflationScenario(id: InflationScenarioId): InflationScenario | undefined {
  return INFLATION_SCENARIOS[id]
}

/**
 * Calculate purchasing power loss/gain from an inflation scenario
 * @param scenario - The inflation scenario
 * @param initialAmount - Initial amount in euros
 * @returns Final purchasing power relative to initial amount
 */
export function calculatePurchasingPowerImpact(scenario: InflationScenario, initialAmount: number): number {
  let purchasingPower = initialAmount

  for (let offset = 0; offset < scenario.duration; offset++) {
    const yearInflation = scenario.yearlyInflationRates[offset] ?? 0
    purchasingPower /= 1 + yearInflation
  }

  return purchasingPower
}
