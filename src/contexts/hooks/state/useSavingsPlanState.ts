import { useState } from 'react'
import { convertSparplanToElements, type Sparplan, type SparplanElement } from '../../../utils/sparplan-utils'
import type { SimulationAnnualType } from '../../../utils/simulate'
import type { SavedConfiguration } from '../../../utils/config-storage'

export interface SavingsPlanStateConfig {
  initialConfig: SavedConfiguration
}

export function useSavingsPlanState(config: SavingsPlanStateConfig) {
  const { initialConfig } = config

  const [startEnd, setStartEnd] = useState<[number, number]>(initialConfig.startEnd)
  const [sparplan, setSparplan] = useState<Sparplan[]>(initialConfig.sparplan)
  const [simulationAnnual, setSimulationAnnual] = useState<SimulationAnnualType>(initialConfig.simulationAnnual)
  const [sparplanElemente, setSparplanElemente] = useState<SparplanElement[]>(
    convertSparplanToElements(initialConfig.sparplan, initialConfig.startEnd, initialConfig.simulationAnnual),
  )

  return {
    startEnd,
    setStartEnd,
    sparplan,
    setSparplan,
    simulationAnnual,
    setSimulationAnnual,
    sparplanElemente,
    setSparplanElemente,
  }
}
