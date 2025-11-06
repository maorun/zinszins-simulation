import { useState } from 'react'
import type { ExtendedSavedConfiguration } from '../../helpers/config-types'

export interface PlanningModeStateConfig {
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultConfig: {
    planningMode: 'individual' | 'couple'
    expectedLifespan?: number
  }
}

export function usePlanningModeState(config: PlanningModeStateConfig) {
  const { extendedInitialConfig, defaultConfig } = config

  const [planningMode, setPlanningMode] = useState<'individual' | 'couple'>(
    extendedInitialConfig.planningMode ?? defaultConfig.planningMode,
  )
  const [gender, setGender] = useState<'male' | 'female' | undefined>(extendedInitialConfig.gender)
  const [spouse, setSpouse] = useState<{ birthYear?: number; gender: 'male' | 'female' } | undefined>(
    extendedInitialConfig.spouse,
  )
  const [birthYear, setBirthYear] = useState<number | undefined>(extendedInitialConfig.birthYear)
  const [expectedLifespan, setExpectedLifespan] = useState<number | undefined>(
    extendedInitialConfig.expectedLifespan ?? defaultConfig.expectedLifespan,
  )
  const [useAutomaticCalculation, setUseAutomaticCalculation] = useState<boolean>(
    extendedInitialConfig.useAutomaticCalculation ?? true,
  )

  return {
    planningMode,
    setPlanningMode,
    gender,
    setGender,
    spouse,
    setSpouse,
    birthYear,
    setBirthYear,
    expectedLifespan,
    setExpectedLifespan,
    useAutomaticCalculation,
    setUseAutomaticCalculation,
  }
}
