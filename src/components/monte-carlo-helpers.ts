import type { RandomReturnConfig } from '../utils/random-returns'
import { formatPercent } from '../utils/currency'

export interface MonteCarloResult {
  scenario: string
  description: string
  probability: string
  isBlackSwan?: boolean
}

export const createScenarios = (config: RandomReturnConfig): MonteCarloResult[] => [
  {
    scenario: 'Worst Case (5% Perzentil)',
    description: `Bei sehr ungünstiger Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn - 1.645 * (config.standardDeviation || 0.15))}`,
    probability: '5% Wahrscheinlichkeit, dass das Ergebnis schlechter ausfällt',
  },
  {
    scenario: 'Pessimistisches Szenario (25% Perzentil)',
    description: `Bei unterdurchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn - 0.674 * (config.standardDeviation || 0.15))}`,
    probability: '25% Wahrscheinlichkeit, dass das Ergebnis schlechter ausfällt',
  },
  {
    scenario: 'Median-Szenario (50% Perzentil)',
    description: `Bei durchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn)}`,
    probability: '50% Wahrscheinlichkeit für bessere/schlechtere Ergebnisse',
  },
  {
    scenario: 'Optimistisches Szenario (75% Perzentil)',
    description: `Bei überdurchschnittlicher Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn + 0.674 * (config.standardDeviation || 0.15))}`,
    probability: '25% Wahrscheinlichkeit für bessere Ergebnisse',
  },
  {
    scenario: 'Best Case (95% Perzentil)',
    description: `Bei sehr günstiger Marktentwicklung. Erwartete Rendite: ${formatPercent(config.averageReturn + 1.645 * (config.standardDeviation || 0.15))}`,
    probability: '5% Wahrscheinlichkeit für bessere Ergebnisse',
  },
]

export const calculateBlackSwanScenario = (
  blackSwanReturns: Record<number, number> | null | undefined,
  blackSwanEventName: string | undefined,
): MonteCarloResult | null => {
  if (!blackSwanReturns || Object.keys(blackSwanReturns).length === 0) {
    return null
  }

  const returns = Object.values(blackSwanReturns)
  // Calculate cumulative return: (1 + r1) * (1 + r2) * ... - 1
  const cumulativeReturn = returns.reduce((acc, r) => acc * (1 + r), 1) - 1
  const years = Object.keys(blackSwanReturns).sort()
  const yearRange = years.length > 1 ? `${years[0]}-${years[years.length - 1]}` : years[0]

  return {
    scenario: `🦢 Black Swan: ${blackSwanEventName || 'Krisenszenario'}`,
    description: `Kumulativer Verlust über ${returns.length} Jahr${returns.length > 1 ? 'e' : ''} (${yearRange}): ${formatPercent(cumulativeReturn)}`,
    probability: 'Historisches Extremszenario zur Stresstestung',
    isBlackSwan: true,
  }
}
