import { useCallback } from 'react'

interface UseRiskEventHandlersParams {
  setBlackSwanReturns: (returns: Record<number, number> | null) => void
  setBlackSwanEventName: (name: string) => void
  setInflationScenarioRates: (rates: Record<number, number> | null) => void
  setInflationScenarioReturnModifiers: (modifiers: Record<number, number> | null) => void
  setInflationScenarioName: (name: string) => void
  performSimulation: () => void
}

interface UseRiskEventHandlersReturn {
  handleBlackSwanChange: (eventReturns: Record<number, number> | null, eventName?: string) => void
  handleInflationScenarioChange: (
    inflationRates: Record<number, number> | null,
    returnModifiers: Record<number, number> | null,
    scenarioName?: string,
  ) => void
}

/**
 * Custom hook to manage risk event handlers (Black Swan and Inflation Scenarios)
 */
export function useRiskEventHandlers({
  setBlackSwanReturns,
  setBlackSwanEventName,
  setInflationScenarioRates,
  setInflationScenarioReturnModifiers,
  setInflationScenarioName,
  performSimulation,
}: UseRiskEventHandlersParams): UseRiskEventHandlersReturn {
  // Handle Black Swan event change
  const handleBlackSwanChange = useCallback(
    (eventReturns: Record<number, number> | null, eventName?: string) => {
      setBlackSwanReturns(eventReturns)
      setBlackSwanEventName(eventName || '')
      // Trigger simulation update
      performSimulation()
    },
    [setBlackSwanReturns, setBlackSwanEventName, performSimulation],
  )

  // Handle Inflation Scenario change
  const handleInflationScenarioChange = useCallback(
    (
      inflationRates: Record<number, number> | null,
      returnModifiers: Record<number, number> | null,
      scenarioName?: string,
    ) => {
      setInflationScenarioRates(inflationRates)
      setInflationScenarioReturnModifiers(returnModifiers)
      setInflationScenarioName(scenarioName || '')
      // Trigger simulation update
      performSimulation()
    },
    [setInflationScenarioRates, setInflationScenarioReturnModifiers, setInflationScenarioName, performSimulation],
  )

  return {
    handleBlackSwanChange,
    handleInflationScenarioChange,
  }
}
