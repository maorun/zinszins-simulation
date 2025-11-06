/**
 * Inflation Scenario simulation utilities
 * Realistic inflation scenarios for stress testing portfolios
 * Supports Hyperinflation, Deflation, and Stagflation scenarios
 */

export type InflationScenarioId = 'hyperinflation' | 'deflation' | 'stagflation' | 'custom'

export interface InflationScenario {
  id: InflationScenarioId
  name: string
  description: string
  startYear: number
  duration: number // years
  yearlyInflationRates: Record<number, number> // Map of relative year offset to inflation rate
  yearlyReturnModifiers?: Record<number, number> // Optional: return rate modifications (for stagflation)
  recoveryYears?: number // Optional: years needed for recovery to normal inflation
}

/**
 * Predefined inflation scenarios
 * Based on historical inflation periods in Germany and other developed economies
 */
export const INFLATION_SCENARIOS: Record<InflationScenarioId, InflationScenario> = {
  hyperinflation: {
    id: 'hyperinflation',
    name: 'Hyperinflation (Hohes Inflationsszenario)',
    description: 'Anhaltend hohe Inflation ähnlich der 1970er Jahre mit 8-12% jährlich',
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
