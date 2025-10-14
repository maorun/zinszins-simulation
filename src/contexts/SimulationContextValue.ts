import { createContext } from 'react'
import type { SimulationContextState } from './helpers/simulation-context-state'

export const SimulationContext = createContext<SimulationContextState | undefined>(undefined)
export type { SimulationContextState }
