import { useState } from 'react'

export function useScenarioState() {
  // Black Swan event state
  const [blackSwanReturns, setBlackSwanReturns] = useState<Record<number, number> | null>(null)
  const [blackSwanEventName, setBlackSwanEventName] = useState<string>('')

  // Inflation scenario state
  const [inflationScenarioRates, setInflationScenarioRates] = useState<Record<number, number> | null>(null)
  const [inflationScenarioReturnModifiers, setInflationScenarioReturnModifiers] = useState<Record<
    number,
    number
  > | null>(null)
  const [inflationScenarioName, setInflationScenarioName] = useState<string>('')

  return {
    blackSwanReturns,
    setBlackSwanReturns,
    blackSwanEventName,
    setBlackSwanEventName,
    inflationScenarioRates,
    setInflationScenarioRates,
    inflationScenarioReturnModifiers,
    setInflationScenarioReturnModifiers,
    inflationScenarioName,
    setInflationScenarioName,
  }
}
