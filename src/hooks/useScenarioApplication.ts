import { useCallback } from 'react'
import type { FinancialScenario } from '../data/scenarios'
import type { Sparplan } from '../utils/sparplan-utils'
import type { ReturnMode } from '../utils/random-returns'

interface ScenarioApplicationHandlers {
  setStartEnd: (value: [number, number]) => void
  setReturnMode: (mode: ReturnMode) => void
  setRendite: (value: number) => void
  setAverageReturn: (value: number) => void
  setStandardDeviation: (value: number) => void
  setSteuerlast: (value: number) => void
  setTeilfreistellungsquote: (value: number) => void
  setFreibetragPerYear: (value: Record<number, number>) => void
  setInflationAktivSparphase: (value: boolean) => void
  setInflationsrateSparphase: (value: number) => void
  setSparplan: (value: Sparplan[]) => void
  performSimulation: () => void
}

/**
 * Create savings plan from scenario configuration
 */
function createSavingsPlans(config: FinancialScenario['config']): Sparplan[] {
  const newSparplan: Sparplan[] = []

  // Add initial investment if specified
  if (config.initialInvestment && config.initialInvestment > 0) {
    newSparplan.push({
      id: Date.now(),
      start: new Date(config.startYear, 0, 1),
      end: new Date(config.startYear, 0, 1),
      einzahlung: config.initialInvestment,
      ter: config.ter,
    })
  }

  // Add monthly contribution if specified
  if (config.monthlyContribution && config.monthlyContribution > 0) {
    newSparplan.push({
      id: Date.now() + 1,
      start: new Date(config.startYear, 0, 1),
      end: new Date(config.retirementYear - 1, 11, 31),
      einzahlung: config.monthlyContribution * 12,
      ter: config.ter,
    })
  }

  return newSparplan
}

/**
 * Hook to handle financial scenario application
 * Extracted from HomePageContent to reduce complexity
 */
export function useScenarioApplication(handlers: ScenarioApplicationHandlers) {
  const handleApplyScenario = useCallback((scenario: FinancialScenario) => {
    const config = scenario.config

    // Set time range
    handlers.setStartEnd([config.retirementYear, config.retirementYear + 30])

    // Set return configuration
    handlers.setReturnMode(config.returnMode)
    if (config.returnMode === 'fixed') {
      handlers.setRendite(config.expectedReturn)
    }
    else if (config.returnMode === 'random' && config.volatility) {
      handlers.setAverageReturn(config.expectedReturn)
      handlers.setStandardDeviation(config.volatility)
    }

    // Set tax configuration
    if (config.steuerlast !== undefined) handlers.setSteuerlast(config.steuerlast)
    if (config.teilfreistellungsquote !== undefined) handlers.setTeilfreistellungsquote(config.teilfreistellungsquote)
    if (config.freibetrag !== undefined) handlers.setFreibetragPerYear({ [config.startYear]: config.freibetrag })

    // Set inflation
    if (config.inflationRate !== undefined) {
      handlers.setInflationAktivSparphase(true)
      handlers.setInflationsrateSparphase(config.inflationRate)
    }

    // Create and set savings plans
    handlers.setSparplan(createSavingsPlans(config))

    // Trigger recalculation
    setTimeout(() => handlers.performSimulation(), 100)
  }, [handlers])

  return { handleApplyScenario }
}
