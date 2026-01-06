/**
 * Type definitions for Scenario Comparison feature
 * Allows users to save, load, and compare multiple financial planning scenarios
 */

import type { ExtendedSavedConfiguration } from '../contexts/helpers/config-types'
import type { SparplanElement } from '../utils/sparplan-utils'

/**
 * A saved user scenario with metadata
 */
export interface SavedScenario {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
  configuration: ExtendedSavedConfiguration
}

/**
 * Comparison data for a single scenario
 * Includes simulation results for display
 */
export interface ScenarioComparisonData {
  scenario: SavedScenario
  simulationResults: {
    endCapital: number
    totalContributions: number
    totalTaxes: number
    totalReturns: number
    annualizedReturn: number
    yearlyData: SparplanElement[]
  }
}

/**
 * Complete comparison state
 */
export interface ScenarioComparison {
  id: string
  name: string
  createdAt: string
  scenarios: SavedScenario[]
  comparisonData: ScenarioComparisonData[]
}

/**
 * Metrics for scenario comparison display
 */
export interface ComparisonMetrics {
  scenarioId: string
  scenarioName: string
  endCapital: number
  totalContributions: number
  totalTaxes: number
  totalReturns: number
  annualizedReturn: number
  returnOnInvestment: number
  taxEfficiency: number
  duration: number
}

/**
 * Storage key for scenarios in localStorage
 */
export const SCENARIOS_STORAGE_KEY = 'zinszins-saved-scenarios'

/**
 * Storage key for active comparisons
 */
export const COMPARISONS_STORAGE_KEY = 'zinszins-scenario-comparisons'

/**
 * Maximum number of scenarios that can be compared simultaneously
 */
export const MAX_COMPARISON_SCENARIOS = 4

/**
 * Minimum number of scenarios required for comparison
 */
export const MIN_COMPARISON_SCENARIOS = 2
