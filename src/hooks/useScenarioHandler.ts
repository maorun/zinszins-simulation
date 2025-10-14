import { useCallback } from 'react'
import type { Sparplan } from '../utils/sparplan-utils'
import type { FinancialScenario } from '../data/scenarios'
import type { ReturnMode } from '../utils/random-returns'

interface UseScenarioHandlerProps {
  setStartEnd: (range: [number, number]) => void
  setReturnMode: (mode: ReturnMode) => void
  setRendite: (rate: number) => void
  setAverageReturn: (rate: number) => void
  setStandardDeviation: (deviation: number) => void
  setSteuerlast: (rate: number) => void
  setTeilfreistellungsquote: (rate: number) => void
  setFreibetragPerYear: (freibetrag: Record<number, number>) => void
  setInflationAktivSparphase: (active: boolean) => void
  setInflationsrateSparphase: (rate: number) => void
  setSparplan: (sparplan: Sparplan[]) => void
  performSimulation: () => void
}

/**
 * Custom hook for handling scenario application
 */
export function useScenarioHandler({
  setStartEnd,
  setReturnMode,
  setRendite,
  setAverageReturn,
  setStandardDeviation,
  setSteuerlast,
  setTeilfreistellungsquote,
  setFreibetragPerYear,
  setInflationAktivSparphase,
  setInflationsrateSparphase,
  setSparplan,
  performSimulation,
}: UseScenarioHandlerProps) {
  const handleApplyScenario = useCallback((scenario: FinancialScenario) => {
    const config = scenario.config

    // Set time range
    setStartEnd([config.retirementYear, config.retirementYear + 30]) // Default 30 years withdrawal

    // Set return configuration
    setReturnMode(config.returnMode)
    if (config.returnMode === 'fixed') {
      setRendite(config.expectedReturn)
    }
    else if (config.returnMode === 'random' && config.volatility) {
      setAverageReturn(config.expectedReturn)
      setStandardDeviation(config.volatility)
    }

    // Set tax configuration
    if (config.steuerlast !== undefined) {
      setSteuerlast(config.steuerlast)
    }
    if (config.teilfreistellungsquote !== undefined) {
      setTeilfreistellungsquote(config.teilfreistellungsquote)
    }
    if (config.freibetrag !== undefined) {
      setFreibetragPerYear({ [config.startYear]: config.freibetrag })
    }

    // Set inflation
    if (config.inflationRate !== undefined) {
      setInflationAktivSparphase(true)
      setInflationsrateSparphase(config.inflationRate)
    }

    // Create savings plan
    const newSparplan: Sparplan[] = []

    // Add initial investment if specified
    if (config.initialInvestment && config.initialInvestment > 0) {
      newSparplan.push({
        id: Date.now(),
        start: new Date(config.startYear, 0, 1),
        end: new Date(config.startYear, 0, 1), // Same day for one-time payment
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
        einzahlung: config.monthlyContribution * 12, // Convert to annual
        ter: config.ter,
      })
    }

    setSparplan(newSparplan)

    // Trigger recalculation
    setTimeout(() => {
      performSimulation()
    }, 100)
  }, [
    setStartEnd,
    setReturnMode,
    setRendite,
    setAverageReturn,
    setStandardDeviation,
    setSteuerlast,
    setTeilfreistellungsquote,
    setFreibetragPerYear,
    setInflationAktivSparphase,
    setInflationsrateSparphase,
    setSparplan,
    performSimulation,
  ])

  return { handleApplyScenario }
}
