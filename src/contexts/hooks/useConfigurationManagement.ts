import { useCallback } from 'react'
import { saveConfiguration, loadConfiguration, type SavedConfiguration } from '../../utils/config-storage'
import {
  getActiveProfile,
  updateProfile,
  hasProfiles,
} from '../../utils/profile-storage'
import type { ExtendedSavedConfiguration, DefaultConfiguration } from '../helpers/config-types'
import { loadAllConfigurations } from './config/loadConfigurationHelpers'
import { resetAllConfigurations } from './config/resetConfigurationHelpers'
import { buildCompleteConfiguration } from './config/buildCurrentConfig'

export interface ConfigurationStateSetters {
  // Basic config setters
  setRendite: (value: number) => void
  setSteuerlast: (value: number) => void
  setTeilfreistellungsquote: (value: number) => void
  setFreibetragPerYear: (value: { [year: number]: number }) => void
  setBasiszinsConfiguration: (value: import('../../services/bundesbank-api').BasiszinsConfiguration) => void
  // Tax config setters
  setSteuerReduzierenEndkapitalSparphase: (value: boolean) => void
  setSteuerReduzierenEndkapitalEntspharphase: (value: boolean) => void
  setGrundfreibetragAktiv: (value: boolean) => void
  setGrundfreibetragBetrag: (value: number) => void
  setPersonalTaxRate: (value: number) => void
  setGuenstigerPruefungAktiv: (value: boolean) => void
  setKirchensteuerAktiv: (value: boolean) => void
  setKirchensteuersatz: (value: number) => void
  // Return config setters
  setReturnMode: (value: import('../../utils/random-returns').ReturnMode) => void
  setAverageReturn: (value: number) => void
  setStandardDeviation: (value: number) => void
  setRandomSeed: (value: number | undefined) => void
  setVariableReturns: (value: Record<number, number>) => void
  setHistoricalIndex: (value: string) => void
  // Inflation config setters
  setInflationAktivSparphase: (value: boolean) => void
  setInflationsrateSparphase: (value: number) => void
  setInflationAnwendungSparphase: (value: 'sparplan' | 'gesamtmenge') => void
  // Sparplan config setters
  setStartEnd: (value: [number, number]) => void
  setSparplan: (value: Array<import('../../utils/sparplan-utils').Sparplan>) => void
  setSimulationAnnual: (value: import('../../utils/simulate').SimulationAnnualType) => void
  setSparplanElemente: (value: Array<import('../../utils/sparplan-utils').SparplanElement>) => void
  // Life expectancy config setters
  setEndOfLife: (value: number) => void
  setLifeExpectancyTable: (value: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
  setCustomLifeExpectancy: (value: number | undefined) => void
  // Planning mode config setters
  setPlanningMode: (value: 'individual' | 'couple') => void
  setGender: (value: 'male' | 'female' | undefined) => void
  setSpouse: (value: { birthYear?: number, gender: 'male' | 'female' } | undefined) => void
  setBirthYear: (value: number | undefined) => void
  setExpectedLifespan: (value: number | undefined) => void
  setUseAutomaticCalculation: (value: boolean) => void
  // Withdrawal config setters
  setWithdrawalConfig: (value: import('../../utils/config-storage').WithdrawalConfiguration | null) => void
  setStatutoryPensionConfig: (value: import('../../../helpers/statutory-pension').StatutoryPensionConfig | null) => void
  setCoupleStatutoryPensionConfig: (value: import('../../../helpers/statutory-pension').CoupleStatutoryPensionConfig | null) => void
  setCareCostConfiguration: (value: import('../../../helpers/care-cost-simulation').CareCostConfiguration) => void
  setFinancialGoals: (value: Array<import('../../../helpers/financial-goals').FinancialGoal>) => void
}

export interface ConfigurationState {
  // All state values needed for configuration
  rendite: number
  steuerlast: number
  teilfreistellungsquote: number
  freibetragPerYear: { [year: number]: number }
  basiszinsConfiguration: import('../../services/bundesbank-api').BasiszinsConfiguration
  steuerReduzierenEndkapitalSparphase: boolean
  steuerReduzierenEndkapitalEntspharphase: boolean
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
  personalTaxRate: number
  guenstigerPruefungAktiv: boolean
  kirchensteuerAktiv: boolean
  kirchensteuersatz: number
  returnMode: import('../../utils/random-returns').ReturnMode
  averageReturn: number
  standardDeviation: number
  randomSeed: number | undefined
  variableReturns: Record<number, number>
  historicalIndex: string
  inflationAktivSparphase: boolean
  inflationsrateSparphase: number
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  startEnd: [number, number]
  sparplan: Array<import('../../utils/sparplan-utils').Sparplan>
  simulationAnnual: import('../../utils/simulate').SimulationAnnualType
  endOfLife: number
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  customLifeExpectancy: number | undefined
  planningMode: 'individual' | 'couple'
  gender: 'male' | 'female' | undefined
  spouse: { birthYear?: number, gender: 'male' | 'female' } | undefined
  birthYear: number | undefined
  expectedLifespan: number | undefined
  useAutomaticCalculation: boolean
  withdrawalConfig: import('../../utils/config-storage').WithdrawalConfiguration | null
  statutoryPensionConfig: import('../../../helpers/statutory-pension').StatutoryPensionConfig | null
  coupleStatutoryPensionConfig: import('../../../helpers/statutory-pension').CoupleStatutoryPensionConfig | null
  careCostConfiguration: import('../../../helpers/care-cost-simulation').CareCostConfiguration
  financialGoals: Array<import('../../../helpers/financial-goals').FinancialGoal>
}

export function useConfigurationManagement(
  defaultConfig: import('../helpers/default-config').DefaultConfigType,
  state: ConfigurationState,
  setters: ConfigurationStateSetters,
) {
  const getCurrentConfiguration = useCallback(
    (): SavedConfiguration => buildCompleteConfiguration(state),
    [state],
  )

  const saveCurrentConfiguration = useCallback(() => {
    const config = getCurrentConfiguration()

    if (hasProfiles()) {
      const activeProfile = getActiveProfile()
      if (activeProfile) {
        updateProfile(activeProfile.id, { configuration: config })
      }
      else {
        saveConfiguration(config)
      }
    }
    else {
      saveConfiguration(config)
    }
  }, [getCurrentConfiguration])

  const loadConfigFromProfileOrLegacy = (): SavedConfiguration | null => {
    if (hasProfiles()) {
      const activeProfile = getActiveProfile()
      if (activeProfile) {
        return activeProfile.configuration
      }
    }
    return loadConfiguration()
  }

  const loadSavedConfiguration = useCallback(() => {
    const savedConfig = loadConfigFromProfileOrLegacy()
    if (!savedConfig) return

    const extendedConfig = savedConfig as ExtendedSavedConfiguration
    const defConfig = defaultConfig as unknown as DefaultConfiguration

    loadAllConfigurations(extendedConfig, defConfig, setters)
  }, [defaultConfig, setters])

  const resetToDefaults = useCallback(() => {
    resetAllConfigurations(defaultConfig, setters)
  }, [defaultConfig, setters])

  return {
    getCurrentConfiguration,
    saveCurrentConfiguration,
    loadSavedConfiguration,
    resetToDefaults,
  }
}
