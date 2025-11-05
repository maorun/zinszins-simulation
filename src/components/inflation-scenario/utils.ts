import type { InflationScenario } from '../../../helpers/inflation-scenarios'

/**
 * Formats a number as a percentage with sign
 */
export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${(value * 100).toFixed(1)}%`
}

// Scenario color configuration
const SCENARIO_COLORS: Record<string, { bg: string, text: string }> = {
  hyperinflation: { bg: 'bg-red-50 border-red-200', text: 'text-red-900' },
  deflation: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-900' },
}
const DEFAULT_COLORS = { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-900' }

/**
 * Get the appropriate colors for a scenario
 */
export const getScenarioColors = (scenario: InflationScenario | null) => {
  if (!scenario)
    return DEFAULT_COLORS
  return SCENARIO_COLORS[scenario.id] || DEFAULT_COLORS
}
