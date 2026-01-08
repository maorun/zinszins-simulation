/**
 * Type definitions for Capital Growth Scenario Comparison
 * (Kapitalwertentwicklungs-Szenario-Vergleich)
 *
 * Allows users to compare up to 5 different financial planning scenarios side-by-side
 * with parameter variations across savings rate, return, withdrawal strategy, and tax situation.
 */

import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'
import type { SparplanElement } from '../utils/sparplan-utils'

/**
 * A single scenario configuration for comparison
 */
export interface ComparisonScenario {
  /** Unique identifier for this scenario */
  id: string

  /** User-friendly name for display (e.g., "Konservativ", "Ausgewogen", "Aggressiv") */
  name: string

  /** Optional description explaining this scenario's characteristics */
  description?: string

  /** Color for visualization (hex code) */
  color: string

  /** Complete configuration for this scenario */
  configuration: ExtendedSavedConfiguration
}

/**
 * Results from simulating a single scenario
 */
export interface ScenarioSimulationResult {
  /** Reference to the scenario that was simulated */
  scenarioId: string

  /** Year-by-year simulation data */
  yearlyData: SparplanElement[]

  /** Summary metrics */
  metrics: {
    /** Final capital at end of simulation */
    endCapital: number

    /** Real (inflation-adjusted) final capital */
    endCapitalReal: number

    /** Total contributions made */
    totalContributions: number

    /** Total investment returns */
    totalReturns: number

    /** Total taxes paid */
    totalTaxes: number

    /** Annualized return rate (%) */
    annualizedReturn: number

    /** Duration in years */
    duration: number
  }
}

/**
 * Statistical analysis across all scenarios
 */
export interface ComparisonStatistics {
  /** Best performing scenario by end capital */
  bestScenario: {
    scenarioId: string
    endCapital: number
  }

  /** Worst performing scenario by end capital */
  worstScenario: {
    scenarioId: string
    endCapital: number
  }

  /** Percentile analysis (25th, 50th/median, 75th percentiles) */
  percentiles: {
    p25: number
    p50: number
    p75: number
  }

  /** Average end capital across all scenarios */
  averageEndCapital: number

  /** Standard deviation of end capitals */
  standardDeviation: number

  /** Range (difference between best and worst) */
  range: number
}

/**
 * Complete comparison state with all scenarios and results
 */
export interface CapitalGrowthComparison {
  /** Unique identifier for this comparison */
  id: string

  /** User-friendly name for this comparison */
  name: string

  /** Timestamp when comparison was created */
  createdAt: string

  /** Last update timestamp */
  updatedAt: string

  /** All scenarios being compared */
  scenarios: ComparisonScenario[]

  /** Simulation results for each scenario (computed) */
  results?: ScenarioSimulationResult[]

  /** Statistical analysis (computed) */
  statistics?: ComparisonStatistics
}

/**
 * Configuration for the comparison feature
 */
export interface ComparisonConfig {
  /** Maximum number of scenarios allowed in comparison */
  maxScenarios: number

  /** Default colors for scenarios */
  defaultColors: string[]

  /** Whether to show real (inflation-adjusted) values */
  showRealValues: boolean

  /** Whether to highlight best/worst scenarios */
  highlightExtremes: boolean
}

/**
 * Default configuration for comparisons
 */
export const DEFAULT_COMPARISON_CONFIG: ComparisonConfig = {
  maxScenarios: 5,
  defaultColors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], // blue, green, amber, red, purple
  showRealValues: true,
  highlightExtremes: true,
}

/**
 * Storage key for saved comparisons
 */
export const CAPITAL_GROWTH_COMPARISONS_STORAGE_KEY = 'zinszins-capital-growth-comparisons'
