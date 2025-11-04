import { useState } from 'react'
import { useSimulation } from '../../contexts/useSimulation'

/**
 * Custom hook that manages basiszins state
 */
export function useBasiszinsState() {
  const {
    basiszinsConfiguration,
    setBasiszinsConfiguration,
    performSimulation,
  } = useSimulation()

  const [isLoading, setIsLoading] = useState(false)
  const [lastApiUpdate, setLastApiUpdate] = useState<string | null>(null)
  const [newYear, setNewYear] = useState('')
  const [newRate, setNewRate] = useState('')
  const [error, setError] = useState<string | null>(null)

  const currentYear = new Date().getFullYear()

  return {
    basiszinsConfiguration,
    setBasiszinsConfiguration,
    performSimulation,
    isLoading,
    setIsLoading,
    lastApiUpdate,
    setLastApiUpdate,
    newYear,
    setNewYear,
    newRate,
    setNewRate,
    error,
    setError,
    currentYear,
  }
}
