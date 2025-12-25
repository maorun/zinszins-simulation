import { useState, useEffect, useCallback, useMemo } from 'react'
import type { SimulationResult } from '../../utils/simulate'

interface TimelineState {
  currentYear: number
  isPlaying: boolean
  startYear: number
  endYear: number
}

/**
 * Extract year range from simulation data
 */
function getYearRange(simulationData: SimulationResult): { startYear: number; endYear: number } {
  const years = Object.keys(simulationData).map(Number).sort((a, b) => a - b)
  const currentYear = new Date().getFullYear()
  
  // Ensure timeline starts from current year or earlier, not from a future year
  const dataStartYear = years[0] || currentYear
  const startYear = Math.min(dataStartYear, currentYear)
  
  return {
    startYear,
    endYear: years[years.length - 1] || currentYear,
  }
}

/**
 * Custom hook for managing timeline state and playback
 */
export function useTimelinePlayback(simulationData: SimulationResult, animationSpeed: number) {
  const { startYear, endYear } = useMemo(() => getYearRange(simulationData), [simulationData])

  const [state, setState] = useState<TimelineState>({ currentYear: startYear, isPlaying: false, startYear, endYear })

  const progress = useMemo(() => {
    const total = state.endYear - state.startYear
    return total > 0 ? ((state.currentYear - state.startYear) / total) * 100 : 0
  }, [state.currentYear, state.startYear, state.endYear])

  // Auto-advance when playing
  useEffect(() => {
    if (!state.isPlaying) return

    const timer = setTimeout(() => {
      setState(prev => ({
        ...prev,
        currentYear: prev.currentYear >= prev.endYear ? prev.currentYear : prev.currentYear + 1,
        isPlaying: prev.currentYear >= prev.endYear ? false : prev.isPlaying,
      }))
    }, animationSpeed)

    return () => clearTimeout(timer)
  }, [state.isPlaying, state.currentYear, state.endYear, animationSpeed])

  const handlePlayPause = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentYear: !prev.isPlaying && prev.currentYear >= prev.endYear ? prev.startYear : prev.currentYear,
      isPlaying: !prev.isPlaying,
    }))
  }, [])

  const handleReset = useCallback(() => setState(prev => ({ ...prev, currentYear: prev.startYear, isPlaying: false })), [])

  const handleStepForward = useCallback(() => {
    setState(prev => ({ ...prev, currentYear: Math.min(prev.currentYear + 1, prev.endYear), isPlaying: false }))
  }, [])

  const handleStepBackward = useCallback(() => {
    setState(prev => ({ ...prev, currentYear: Math.max(prev.currentYear - 1, prev.startYear), isPlaying: false }))
  }, [])

  const handleSliderChange = useCallback((value: number[]) => setState(prev => ({ ...prev, currentYear: value[0], isPlaying: false })), [])

  return { state, progress, handlePlayPause, handleReset, handleStepForward, handleStepBackward, handleSliderChange }
}
