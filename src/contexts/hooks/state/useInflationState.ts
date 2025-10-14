import { useState } from 'react'
import type { ExtendedSavedConfiguration } from '../../helpers/config-types'

export interface InflationStateConfig {
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultConfig: {
    inflationAktivSparphase: boolean
    inflationsrateSparphase: number
    inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  }
}

export function useInflationState(config: InflationStateConfig) {
  const { extendedInitialConfig, defaultConfig } = config

  const [inflationAktivSparphase, setInflationAktivSparphase] = useState(
    extendedInitialConfig.inflationAktivSparphase ?? defaultConfig.inflationAktivSparphase,
  )
  const [inflationsrateSparphase, setInflationsrateSparphase] = useState(
    extendedInitialConfig.inflationsrateSparphase ?? defaultConfig.inflationsrateSparphase,
  )
  const [inflationAnwendungSparphase, setInflationAnwendungSparphase] = useState<
    'sparplan' | 'gesamtmenge'
  >(extendedInitialConfig.inflationAnwendungSparphase ?? defaultConfig.inflationAnwendungSparphase)

  return {
    inflationAktivSparphase,
    setInflationAktivSparphase,
    inflationsrateSparphase,
    setInflationsrateSparphase,
    inflationAnwendungSparphase,
    setInflationAnwendungSparphase,
  }
}
