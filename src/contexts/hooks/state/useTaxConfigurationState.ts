import { useState } from 'react'
import type { ExtendedSavedConfiguration } from '../../helpers/config-types'

export interface TaxConfigurationStateConfig {
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultConfig: {
    personalTaxRate: number
    guenstigerPruefungAktiv: boolean
  }
}

/**
 * Get tax configuration default values
 */
function getTaxConfigDefaults(
  extendedInitialConfig: ExtendedSavedConfiguration,
  defaultConfig: TaxConfigurationStateConfig['defaultConfig'],
) {
  return {
    steuerReduzierenEndkapitalSparphase: extendedInitialConfig.steuerReduzierenEndkapitalSparphase ?? true,
    steuerReduzierenEndkapitalEntspharphase: extendedInitialConfig.steuerReduzierenEndkapitalEntspharphase ?? true,
    grundfreibetragAktiv: extendedInitialConfig.grundfreibetragAktiv ?? true,
    grundfreibetragBetrag: extendedInitialConfig.grundfreibetragBetrag ?? 23208,
    personalTaxRate: extendedInitialConfig.personalTaxRate ?? defaultConfig.personalTaxRate,
    guenstigerPruefungAktiv: extendedInitialConfig.guenstigerPruefungAktiv ?? defaultConfig.guenstigerPruefungAktiv,
    kirchensteuerAktiv: extendedInitialConfig.kirchensteuerAktiv ?? false,
    kirchensteuersatz: extendedInitialConfig.kirchensteuersatz ?? 9,
  }
}

export function useTaxConfigurationState(config: TaxConfigurationStateConfig) {
  const { extendedInitialConfig, defaultConfig } = config
  const defaults = getTaxConfigDefaults(extendedInitialConfig, defaultConfig)

  const [steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase] = useState(
    defaults.steuerReduzierenEndkapitalSparphase,
  )
  const [steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase] = useState(
    defaults.steuerReduzierenEndkapitalEntspharphase,
  )
  const [grundfreibetragAktiv, setGrundfreibetragAktiv] = useState(
    defaults.grundfreibetragAktiv,
  )
  const [grundfreibetragBetrag, setGrundfreibetragBetrag] = useState(
    defaults.grundfreibetragBetrag,
  )
  const [personalTaxRate, setPersonalTaxRate] = useState(
    defaults.personalTaxRate,
  )
  const [guenstigerPruefungAktiv, setGuenstigerPruefungAktiv] = useState(
    defaults.guenstigerPruefungAktiv,
  )
  const [kirchensteuerAktiv, setKirchensteuerAktiv] = useState(
    defaults.kirchensteuerAktiv,
  )
  const [kirchensteuersatz, setKirchensteuersatz] = useState(
    defaults.kirchensteuersatz,
  )

  return {
    steuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase,
    setSteuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    setGrundfreibetragAktiv,
    grundfreibetragBetrag,
    setGrundfreibetragBetrag,
    personalTaxRate,
    setPersonalTaxRate,
    guenstigerPruefungAktiv,
    setGuenstigerPruefungAktiv,
    kirchensteuerAktiv,
    setKirchensteuerAktiv,
    kirchensteuersatz,
    setKirchensteuersatz,
  }
}
