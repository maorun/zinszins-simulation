import { useCallback } from 'react'
import { saveConfiguration, loadConfiguration, type SavedConfiguration } from '../../utils/config-storage'
import {
  getActiveProfile,
  updateProfile,
  hasProfiles,
} from '../../utils/profile-storage'
import type { ExtendedSavedConfiguration, DefaultConfiguration } from '../helpers/config-types'
import {
  loadBasicConfig,
  loadTaxConfig,
  loadReturnConfig,
  loadInflationConfig,
  loadSparplanConfig,
  loadLifeExpectancyConfig,
  loadPlanningModeConfig,
  loadWithdrawalConfig,
} from '../helpers/config-loading'
import { resetConfiguration } from '../helpers/config-reset'

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
  const getCurrentConfiguration = useCallback((): SavedConfiguration => ({
    rendite: state.rendite,
    steuerlast: state.steuerlast,
    teilfreistellungsquote: state.teilfreistellungsquote,
    freibetragPerYear: state.freibetragPerYear,
    basiszinsConfiguration: state.basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase: state.steuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase: state.steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv: state.grundfreibetragAktiv,
    grundfreibetragBetrag: state.grundfreibetragBetrag,
    personalTaxRate: state.personalTaxRate,
    guenstigerPruefungAktiv: state.guenstigerPruefungAktiv,
    returnMode: state.returnMode,
    averageReturn: state.averageReturn,
    standardDeviation: state.standardDeviation,
    randomSeed: state.randomSeed,
    variableReturns: state.variableReturns,
    historicalIndex: state.historicalIndex,
    inflationAktivSparphase: state.inflationAktivSparphase,
    inflationsrateSparphase: state.inflationsrateSparphase,
    inflationAnwendungSparphase: state.inflationAnwendungSparphase,
    startEnd: state.startEnd,
    sparplan: state.sparplan,
    simulationAnnual: state.simulationAnnual,
    endOfLife: state.endOfLife,
    lifeExpectancyTable: state.lifeExpectancyTable,
    customLifeExpectancy: state.customLifeExpectancy,
    planningMode: state.planningMode,
    gender: state.gender,
    spouse: state.spouse,
    birthYear: state.birthYear,
    expectedLifespan: state.expectedLifespan,
    useAutomaticCalculation: state.useAutomaticCalculation,
    withdrawal: state.withdrawalConfig || undefined,
    statutoryPensionConfig: state.statutoryPensionConfig || undefined,
    coupleStatutoryPensionConfig: state.coupleStatutoryPensionConfig || undefined,
    careCostConfiguration: state.careCostConfiguration,
    financialGoals: state.financialGoals,
  }), [
    state.rendite,
    state.steuerlast,
    state.teilfreistellungsquote,
    state.freibetragPerYear,
    state.basiszinsConfiguration,
    state.steuerReduzierenEndkapitalSparphase,
    state.steuerReduzierenEndkapitalEntspharphase,
    state.grundfreibetragAktiv,
    state.grundfreibetragBetrag,
    state.personalTaxRate,
    state.guenstigerPruefungAktiv,
    state.returnMode,
    state.averageReturn,
    state.standardDeviation,
    state.randomSeed,
    state.variableReturns,
    state.historicalIndex,
    state.inflationAktivSparphase,
    state.inflationsrateSparphase,
    state.inflationAnwendungSparphase,
    state.startEnd,
    state.sparplan,
    state.simulationAnnual,
    state.endOfLife,
    state.lifeExpectancyTable,
    state.customLifeExpectancy,
    state.planningMode,
    state.gender,
    state.spouse,
    state.birthYear,
    state.expectedLifespan,
    state.useAutomaticCalculation,
    state.withdrawalConfig,
    state.statutoryPensionConfig,
    state.coupleStatutoryPensionConfig,
    state.careCostConfiguration,
    state.financialGoals,
  ])

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

    loadBasicConfig(extendedConfig, defConfig, {
      setRendite: setters.setRendite,
      setSteuerlast: setters.setSteuerlast,
      setTeilfreistellungsquote: setters.setTeilfreistellungsquote,
      setFreibetragPerYear: setters.setFreibetragPerYear,
      setBasiszinsConfiguration: setters.setBasiszinsConfiguration,
    })

    loadTaxConfig(extendedConfig, defConfig, {
      setSteuerReduzierenEndkapitalSparphase: setters.setSteuerReduzierenEndkapitalSparphase,
      setSteuerReduzierenEndkapitalEntspharphase: setters.setSteuerReduzierenEndkapitalEntspharphase,
      setGrundfreibetragAktiv: setters.setGrundfreibetragAktiv,
      setGrundfreibetragBetrag: setters.setGrundfreibetragBetrag,
      setPersonalTaxRate: setters.setPersonalTaxRate,
      setGuenstigerPruefungAktiv: setters.setGuenstigerPruefungAktiv,
    })

    loadReturnConfig(extendedConfig, defConfig, {
      setReturnMode: setters.setReturnMode,
      setAverageReturn: setters.setAverageReturn,
      setStandardDeviation: setters.setStandardDeviation,
      setRandomSeed: setters.setRandomSeed,
      setVariableReturns: setters.setVariableReturns,
      setHistoricalIndex: setters.setHistoricalIndex,
    })

    loadInflationConfig(extendedConfig, defConfig, {
      setInflationAktivSparphase: setters.setInflationAktivSparphase,
      setInflationsrateSparphase: setters.setInflationsrateSparphase,
      setInflationAnwendungSparphase: setters.setInflationAnwendungSparphase,
    })

    loadSparplanConfig(extendedConfig, {
      setStartEnd: setters.setStartEnd,
      setSparplan: setters.setSparplan,
      setSimulationAnnual: setters.setSimulationAnnual,
      setSparplanElemente: setters.setSparplanElemente,
    })

    loadLifeExpectancyConfig(extendedConfig, defConfig, {
      setEndOfLife: setters.setEndOfLife,
      setLifeExpectancyTable: setters.setLifeExpectancyTable,
      setCustomLifeExpectancy: setters.setCustomLifeExpectancy,
    })

    loadPlanningModeConfig(extendedConfig, defConfig, {
      setPlanningMode: setters.setPlanningMode,
      setGender: setters.setGender,
      setSpouse: setters.setSpouse,
      setBirthYear: setters.setBirthYear,
      setExpectedLifespan: setters.setExpectedLifespan,
      setUseAutomaticCalculation: setters.setUseAutomaticCalculation,
    })

    loadWithdrawalConfig(extendedConfig, {
      setWithdrawalConfig: setters.setWithdrawalConfig,
      setStatutoryPensionConfig: setters.setStatutoryPensionConfig,
      setCoupleStatutoryPensionConfig: setters.setCoupleStatutoryPensionConfig,
      setCareCostConfiguration: setters.setCareCostConfiguration,
      setFinancialGoals: setters.setFinancialGoals,
    })
  }, [defaultConfig, setters])

  const resetToDefaults = useCallback(() => {
    resetConfiguration(defaultConfig, {
      setRendite: setters.setRendite,
      setSteuerlast: setters.setSteuerlast,
      setTeilfreistellungsquote: setters.setTeilfreistellungsquote,
      setFreibetragPerYear: setters.setFreibetragPerYear,
      setBasiszinsConfiguration: setters.setBasiszinsConfiguration,
      setSteuerReduzierenEndkapitalSparphase: setters.setSteuerReduzierenEndkapitalSparphase,
      setSteuerReduzierenEndkapitalEntspharphase: setters.setSteuerReduzierenEndkapitalEntspharphase,
      setGrundfreibetragAktiv: setters.setGrundfreibetragAktiv,
      setGrundfreibetragBetrag: setters.setGrundfreibetragBetrag,
      setPersonalTaxRate: setters.setPersonalTaxRate,
      setGuenstigerPruefungAktiv: setters.setGuenstigerPruefungAktiv,
      setReturnMode: setters.setReturnMode,
      setAverageReturn: setters.setAverageReturn,
      setStandardDeviation: setters.setStandardDeviation,
      setRandomSeed: setters.setRandomSeed,
      setVariableReturns: setters.setVariableReturns,
      setHistoricalIndex: setters.setHistoricalIndex,
      setInflationAktivSparphase: setters.setInflationAktivSparphase,
      setInflationsrateSparphase: setters.setInflationsrateSparphase,
      setInflationAnwendungSparphase: setters.setInflationAnwendungSparphase,
      setStartEnd: setters.setStartEnd,
      setSparplan: setters.setSparplan,
      setSimulationAnnual: setters.setSimulationAnnual,
      setSparplanElemente: setters.setSparplanElemente,
      setEndOfLife: setters.setEndOfLife,
      setLifeExpectancyTable: setters.setLifeExpectancyTable,
      setCustomLifeExpectancy: setters.setCustomLifeExpectancy,
      setPlanningMode: setters.setPlanningMode,
      setGender: setters.setGender,
      setSpouse: setters.setSpouse,
      setBirthYear: setters.setBirthYear,
      setExpectedLifespan: setters.setExpectedLifespan,
      setUseAutomaticCalculation: setters.setUseAutomaticCalculation,
    }, {
      setWithdrawalConfig: setters.setWithdrawalConfig,
      setStatutoryPensionConfig: setters.setStatutoryPensionConfig,
      setCoupleStatutoryPensionConfig: setters.setCoupleStatutoryPensionConfig,
      setCareCostConfiguration: setters.setCareCostConfiguration,
      setFinancialGoals: setters.setFinancialGoals,
    })
  }, [defaultConfig, setters])

  return {
    getCurrentConfiguration,
    saveCurrentConfiguration,
    loadSavedConfiguration,
    resetToDefaults,
  }
}
