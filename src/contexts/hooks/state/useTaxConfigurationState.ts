import { useState } from 'react'
import type { ExtendedSavedConfiguration } from '../../helpers/config-types'
import type { AssetClass } from '../../../../helpers/asset-class'
import type { BankAccount } from '../../../../helpers/freistellungsauftrag-optimization'

export interface TaxConfigurationStateConfig {
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultConfig: {
    personalTaxRate: number
    guenstigerPruefungAktiv: boolean
  }
}

/**
 * Get value with fallback to default
 */
function getValueOrDefault<T>(value: T | undefined, defaultValue: T): T {
  return value ?? defaultValue
}

/**
 * Get tax configuration default values
 */
function getTaxConfigDefaults(
  extendedInitialConfig: ExtendedSavedConfiguration,
  defaultConfig: TaxConfigurationStateConfig['defaultConfig'],
) {
  return {
    steuerReduzierenEndkapitalSparphase: getValueOrDefault(
      extendedInitialConfig.steuerReduzierenEndkapitalSparphase,
      true,
    ),
    steuerReduzierenEndkapitalEntspharphase: getValueOrDefault(
      extendedInitialConfig.steuerReduzierenEndkapitalEntspharphase,
      true,
    ),
    grundfreibetragAktiv: getValueOrDefault(extendedInitialConfig.grundfreibetragAktiv, true),
    grundfreibetragBetrag: getValueOrDefault(extendedInitialConfig.grundfreibetragBetrag, 23208),
    personalTaxRate: getValueOrDefault(extendedInitialConfig.personalTaxRate, defaultConfig.personalTaxRate),
    guenstigerPruefungAktiv: getValueOrDefault(
      extendedInitialConfig.guenstigerPruefungAktiv,
      defaultConfig.guenstigerPruefungAktiv,
    ),
    kirchensteuerAktiv: getValueOrDefault(extendedInitialConfig.kirchensteuerAktiv, false),
    kirchensteuersatz: getValueOrDefault(extendedInitialConfig.kirchensteuersatz, 9),
    assetClass: getValueOrDefault(extendedInitialConfig.assetClass, 'equity-fund' as AssetClass),
    customTeilfreistellungsquote: getValueOrDefault(extendedInitialConfig.customTeilfreistellungsquote, 0.3),
    freistellungsauftragAccounts: getValueOrDefault(extendedInitialConfig.freistellungsauftragAccounts, [] as BankAccount[]),
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
  const [grundfreibetragAktiv, setGrundfreibetragAktiv] = useState(defaults.grundfreibetragAktiv)
  const [grundfreibetragBetrag, setGrundfreibetragBetrag] = useState(defaults.grundfreibetragBetrag)
  const [personalTaxRate, setPersonalTaxRate] = useState(defaults.personalTaxRate)
  const [guenstigerPruefungAktiv, setGuenstigerPruefungAktiv] = useState(defaults.guenstigerPruefungAktiv)
  const [kirchensteuerAktiv, setKirchensteuerAktiv] = useState(defaults.kirchensteuerAktiv)
  const [kirchensteuersatz, setKirchensteuersatz] = useState(defaults.kirchensteuersatz)
  const [assetClass, setAssetClass] = useState<AssetClass>(defaults.assetClass)
  const [customTeilfreistellungsquote, setCustomTeilfreistellungsquote] = useState(
    defaults.customTeilfreistellungsquote,
  )
  const [freistellungsauftragAccounts, setFreistellungsauftragAccounts] = useState<BankAccount[]>(
    defaults.freistellungsauftragAccounts,
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
    assetClass,
    setAssetClass,
    customTeilfreistellungsquote,
    setCustomTeilfreistellungsquote,
    freistellungsauftragAccounts,
    setFreistellungsauftragAccounts,
  }
}
