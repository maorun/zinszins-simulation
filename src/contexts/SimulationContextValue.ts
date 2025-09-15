import { createContext } from 'react'
import type { SimulationContextState } from './SimulationContext'

export const SimulationContext = createContext<SimulationContextState | undefined>(undefined)
