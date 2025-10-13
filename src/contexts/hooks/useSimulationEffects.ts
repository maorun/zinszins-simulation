import { useEffect, useCallback } from 'react'
import { updateFreibetragForPlanningMode } from '../../utils/freibetrag-calculation'
import type { CoupleStatutoryPensionConfig } from '../../../helpers/statutory-pension'
import type { CareCostConfiguration } from '../../../helpers/care-cost-simulation'

export interface SimulationEffectsState {
  endOfLife: number
  planningMode: 'individual' | 'couple'
  freibetragPerYear: { [year: number]: number }
  coupleStatutoryPensionConfig: CoupleStatutoryPensionConfig | null
  careCostConfiguration: CareCostConfiguration
}

export interface SimulationEffectsSetters {
  setStartEnd: (updater: (current: [number, number]) => [number, number]) => void
  setFreibetragPerYear: (freibetragPerYear: { [year: number]: number }) => void
  setCoupleStatutoryPensionConfig: (config: CoupleStatutoryPensionConfig | null) => void
  setCareCostConfiguration: (updater: (prevConfig: CareCostConfiguration) => CareCostConfiguration) => void
  setEndOfLife: (endOfLife: number) => void
}

export function useSimulationEffects(
  state: SimulationEffectsState,
  setters: SimulationEffectsSetters,
  saveCurrentConfiguration: () => void,
) {
  // Synchronize startEnd[1] (withdrawal end year) with endOfLife (life expectancy calculation)
  useEffect(() => {
    // Only update if endOfLife is different from current startEnd[1]
    // Use functional update to avoid stale closure on startEnd
    setters.setStartEnd((currentStartEnd) => {
      if (state.endOfLife !== currentStartEnd[1]) {
        return [currentStartEnd[0], state.endOfLife]
      }
      return currentStartEnd
    })
  }, [state.endOfLife, setters])

  // Update freibetragPerYear when planning mode changes
  useEffect(() => {
    const updatedFreibetrag = updateFreibetragForPlanningMode(
      state.freibetragPerYear,
      state.planningMode,
    )

    // Only update if there are actual changes to avoid infinite loops
    const hasChanges = Object.keys(updatedFreibetrag).some(
      year => updatedFreibetrag[parseInt(year)] !== state.freibetragPerYear[parseInt(year)],
    )

    if (hasChanges) {
      setters.setFreibetragPerYear(updatedFreibetrag)
    }
  }, [state.planningMode, state.freibetragPerYear, setters])

  // Update couple statutory pension configuration when planning mode changes
  useEffect(() => {
    if (state.coupleStatutoryPensionConfig && state.coupleStatutoryPensionConfig.planningMode !== state.planningMode) {
      const updatedConfig = {
        ...state.coupleStatutoryPensionConfig,
        planningMode: state.planningMode,
      }

      // If switching from individual to couple mode and only individual config exists
      if (state.planningMode === 'couple' && state.coupleStatutoryPensionConfig.individual && !state.coupleStatutoryPensionConfig.couple) {
        updatedConfig.couple = {
          person1: {
            ...state.coupleStatutoryPensionConfig.individual,
            personId: 1 as const,
            personName: 'Person 1',
          },
          person2: {
            ...state.coupleStatutoryPensionConfig.individual,
            personId: 2 as const,
            personName: 'Person 2',
          },
        }
      }

      setters.setCoupleStatutoryPensionConfig(updatedConfig)
    }
  }, [state.planningMode, state.coupleStatutoryPensionConfig, setters])

  // Update care cost configuration when planning mode changes
  useEffect(() => {
    if (state.careCostConfiguration.planningMode !== state.planningMode) {
      setters.setCareCostConfiguration(prevConfig => ({
        ...prevConfig,
        planningMode: state.planningMode,
        // Reset couple configuration when switching to individual mode
        coupleConfig: state.planningMode === 'individual' ? undefined : prevConfig.coupleConfig,
      }))
    }
  }, [state.planningMode, state.careCostConfiguration.planningMode, setters])

  // Auto-save configuration whenever any config value changes
  useEffect(() => {
    saveCurrentConfiguration()
  }, [saveCurrentConfiguration])

  // Create a wrapper for setEndOfLife that ensures values are always rounded to whole numbers
  const setEndOfLifeRounded = useCallback((value: number) => {
    setters.setEndOfLife(Math.round(value))
  }, [setters])

  return { setEndOfLifeRounded }
}
