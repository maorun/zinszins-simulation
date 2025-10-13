import { useState } from 'react'
import type { SavedConfiguration } from '../../../utils/config-storage'
import type { ExtendedSavedConfiguration } from '../../helpers/config-types'

export interface LifeExpectancyStateConfig {
  initialConfig: SavedConfiguration
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultConfig: {
    lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  }
}

export function useLifeExpectancyState(config: LifeExpectancyStateConfig) {
  const { initialConfig, extendedInitialConfig, defaultConfig } = config

  const [endOfLife, setEndOfLife] = useState(
    extendedInitialConfig.endOfLife ?? initialConfig.startEnd[1],
  )
  const [lifeExpectancyTable, setLifeExpectancyTable] = useState<
    'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  >(extendedInitialConfig.lifeExpectancyTable ?? defaultConfig.lifeExpectancyTable)
  const [customLifeExpectancy, setCustomLifeExpectancy] = useState<number | undefined>(
    extendedInitialConfig.customLifeExpectancy,
  )

  return {
    endOfLife,
    setEndOfLife,
    lifeExpectancyTable,
    setLifeExpectancyTable,
    customLifeExpectancy,
    setCustomLifeExpectancy,
  }
}
