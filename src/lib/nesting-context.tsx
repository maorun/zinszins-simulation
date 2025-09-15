import React from 'react'
import { NestingContext } from './nesting-utils'

interface NestingProviderProps {
  children: React.ReactNode
  level?: number
}

/**
 * Provider that tracks nesting level for responsive card design
 * Each nested provider increments the level automatically
 */
export function NestingProvider({ children, level }: NestingProviderProps) {
  const currentLevel = React.useContext(NestingContext)
  const nextLevel = level !== undefined ? level : currentLevel + 1

  return (
    <NestingContext.Provider value={nextLevel}>
      {children}
    </NestingContext.Provider>
  )
}
