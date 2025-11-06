import { useState } from 'react'
import type { BasiszinsConfiguration } from '../../../services/bundesbank-api'
import type { SavedConfiguration } from '../../../utils/config-storage'
import type { ExtendedSavedConfiguration } from '../../helpers/config-types'

export interface BasicFinancialStateConfig {
  initialConfig: SavedConfiguration
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultConfig: { basiszinsConfiguration: BasiszinsConfiguration }
}

export function useBasicFinancialState(config: BasicFinancialStateConfig) {
  const { initialConfig, extendedInitialConfig, defaultConfig } = config

  const [rendite, setRendite] = useState(initialConfig.rendite)
  const [steuerlast, setSteuerlast] = useState(initialConfig.steuerlast)
  const [teilfreistellungsquote, setTeilfreistellungsquote] = useState(initialConfig.teilfreistellungsquote)
  const [freibetragPerYear, setFreibetragPerYear] = useState<{ [year: number]: number }>(
    initialConfig.freibetragPerYear,
  )
  const [basiszinsConfiguration, setBasiszinsConfiguration] = useState<BasiszinsConfiguration>(
    extendedInitialConfig.basiszinsConfiguration || defaultConfig.basiszinsConfiguration,
  )

  return {
    rendite,
    setRendite,
    steuerlast,
    setSteuerlast,
    teilfreistellungsquote,
    setTeilfreistellungsquote,
    freibetragPerYear,
    setFreibetragPerYear,
    basiszinsConfiguration,
    setBasiszinsConfiguration,
  }
}
