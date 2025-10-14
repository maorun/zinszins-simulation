import { useEffect, useCallback } from 'react'
import type { CoupleStatutoryPensionConfig } from '../../../helpers/statutory-pension'
import type { CareCostConfiguration } from '../../../helpers/care-cost-simulation'
import { useEndOfLifeSync } from './effects/useEndOfLifeSync'
import { useFreibetragSync } from './effects/useFreibetragSync'
import { usePensionConfigSync } from './effects/usePensionConfigSync'
import { useCareCostSync } from './effects/useCareCostSync'

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
  useEndOfLifeSync(state.endOfLife, setters.setStartEnd)
  useFreibetragSync(state.planningMode, state.freibetragPerYear, setters.setFreibetragPerYear)
  usePensionConfigSync(state.planningMode, state.coupleStatutoryPensionConfig, setters.setCoupleStatutoryPensionConfig)
  useCareCostSync(state.planningMode, state.careCostConfiguration, setters.setCareCostConfiguration)

  useEffect(() => {
    saveCurrentConfiguration()
  }, [saveCurrentConfiguration])

  const setEndOfLifeRounded = useCallback((value: number) => {
    setters.setEndOfLife(Math.round(value))
  }, [setters])

  return { setEndOfLifeRounded }
}
