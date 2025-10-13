import { useState } from 'react'
import type { ExtendedSavedConfiguration } from '../../helpers/config-types'

export interface TaxConfigurationStateConfig {
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultConfig: {
    personalTaxRate: number
    guenstigerPruefungAktiv: boolean
  }
}

export function useTaxConfigurationState(config: TaxConfigurationStateConfig) {
  const { extendedInitialConfig, defaultConfig } = config

  const [steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase] = useState(
    extendedInitialConfig.steuerReduzierenEndkapitalSparphase ?? true,
  )
  const [steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase] = useState(
    extendedInitialConfig.steuerReduzierenEndkapitalEntspharphase ?? true,
  )
  const [grundfreibetragAktiv, setGrundfreibetragAktiv] = useState(
    extendedInitialConfig.grundfreibetragAktiv ?? true,
  )
  const [grundfreibetragBetrag, setGrundfreibetragBetrag] = useState(
    extendedInitialConfig.grundfreibetragBetrag ?? 23208,
  )
  const [personalTaxRate, setPersonalTaxRate] = useState(
    extendedInitialConfig.personalTaxRate ?? defaultConfig.personalTaxRate,
  )
  const [guenstigerPruefungAktiv, setGuenstigerPruefungAktiv] = useState(
    extendedInitialConfig.guenstigerPruefungAktiv ?? defaultConfig.guenstigerPruefungAktiv,
  )
  const [kirchensteuerAktiv, setKirchensteuerAktiv] = useState(
    extendedInitialConfig.kirchensteuerAktiv ?? false,
  )
  const [kirchensteuersatz, setKirchensteuersatz] = useState(
    extendedInitialConfig.kirchensteuersatz ?? 9,
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
