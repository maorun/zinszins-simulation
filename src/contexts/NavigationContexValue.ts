import { createContext } from 'react'
import { NavigationContextType } from './NavigationContext'

export const NavigationContext = createContext<NavigationContextType | undefined>(undefined)
