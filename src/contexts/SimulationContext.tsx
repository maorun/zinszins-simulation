import React, { useMemo } from 'react'
import type { ReturnMode } from '../utils/random-returns'
import type { Sparplan, SparplanElement } from '../utils/sparplan-utils'
import type { SimulationAnnualType } from '../utils/simulate'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import { SimulationContext } from './SimulationContextValue'
import { loadConfiguration, type SavedConfiguration, type WithdrawalConfiguration } from '../utils/config-storage'
import {
  initializeProfileStorage,
  getActiveProfile,
} from '../utils/profile-storage'
import type { BasiszinsConfiguration } from '../services/bundesbank-api'
import type { StatutoryPensionConfig, CoupleStatutoryPensionConfig } from '../../helpers/statutory-pension'
import type { CareCostConfiguration } from '../../helpers/care-cost-simulation'
import type { FinancialGoal } from '../../helpers/financial-goals'
import type { ExtendedSavedConfiguration, SimulationData } from './helpers/config-types'
import { createDefaultConfiguration } from './helpers/default-config'
import { useSimulationState } from './hooks/useSimulationState'
import { useConfigurationManagement } from './hooks/useConfigurationManagement'
import { useSimulationExecution } from './hooks/useSimulationExecution'
import { useSimulationEffects } from './hooks/useSimulationEffects'

export interface SimulationContextState {
  rendite: number
  setRendite: (rendite: number) => void
  steuerlast: number
  setSteuerlast: (steuerlast: number) => void
  teilfreistellungsquote: number
  setTeilfreistellungsquote: (teilfreistellungsquote: number) => void
  freibetragPerYear: { [year: number]: number }
  setFreibetragPerYear: (freibetragPerYear: { [year: number]: number }) => void
  // Basiszins configuration for Vorabpauschale calculation
  basiszinsConfiguration: BasiszinsConfiguration
  setBasiszinsConfiguration: (basiszinsConfiguration: BasiszinsConfiguration) => void
  // Phase-specific tax reduction settings
  steuerReduzierenEndkapitalSparphase: boolean
  setSteuerReduzierenEndkapitalSparphase: (steuerReduzierenEndkapitalSparphase: boolean) => void
  steuerReduzierenEndkapitalEntspharphase: boolean
  setSteuerReduzierenEndkapitalEntspharphase: (steuerReduzierenEndkapitalEntspharphase: boolean) => void
  // Grundfreibetrag settings
  grundfreibetragAktiv: boolean
  setGrundfreibetragAktiv: (grundfreibetragAktiv: boolean) => void
  grundfreibetragBetrag: number
  setGrundfreibetragBetrag: (grundfreibetragBetrag: number) => void
  // Personal income tax rate for Günstigerprüfung
  personalTaxRate: number
  setPersonalTaxRate: (personalTaxRate: number) => void
  // Enable/disable Günstigerprüfung (automatic tax optimization)
  guenstigerPruefungAktiv: boolean
  setGuenstigerPruefungAktiv: (guenstigerPruefungAktiv: boolean) => void
  // Church tax (Kirchensteuer) configuration
  kirchensteuerAktiv: boolean
  setKirchensteuerAktiv: (kirchensteuerAktiv: boolean) => void
  kirchensteuersatz: number
  setKirchensteuersatz: (kirchensteuersatz: number) => void
  returnMode: ReturnMode
  setReturnMode: (returnMode: ReturnMode) => void
  averageReturn: number
  setAverageReturn: (averageReturn: number) => void
  standardDeviation: number
  setStandardDeviation: (standardDeviation: number) => void
  randomSeed?: number
  setRandomSeed: (randomSeed?: number) => void
  variableReturns: Record<number, number>
  setVariableReturns: (variableReturns: Record<number, number>) => void
  historicalIndex: string
  setHistoricalIndex: (historicalIndex: string) => void
  // Black Swan event configuration
  blackSwanReturns: Record<number, number> | null
  setBlackSwanReturns: (blackSwanReturns: Record<number, number> | null) => void
  blackSwanEventName: string
  setBlackSwanEventName: (blackSwanEventName: string) => void
  // Inflation scenario configuration
  inflationScenarioRates: Record<number, number> | null
  setInflationScenarioRates: (inflationScenarioRates: Record<number, number> | null) => void
  inflationScenarioReturnModifiers: Record<number, number> | null
  setInflationScenarioReturnModifiers: (inflationScenarioReturnModifiers: Record<number, number> | null) => void
  inflationScenarioName: string
  setInflationScenarioName: (inflationScenarioName: string) => void
  // Multi-asset portfolio configuration
  multiAssetConfig: import('../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig
  setMultiAssetConfig: (config: import('../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig) => void
  // Multi-asset portfolio configuration for withdrawal phase
  withdrawalMultiAssetConfig: import('../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig
  setWithdrawalMultiAssetConfig: (config: import('../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig) => void
  // Inflation settings for savings phase
  inflationAktivSparphase: boolean
  setInflationAktivSparphase: (inflationAktivSparphase: boolean) => void
  inflationsrateSparphase: number
  setInflationsrateSparphase: (inflationsrateSparphase: number) => void
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  setInflationAnwendungSparphase: (inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge') => void
  startEnd: [number, number]
  setStartEnd: (startEnd: [number, number]) => void
  sparplan: Sparplan[]
  setSparplan: (sparplan: Sparplan[]) => void
  simulationAnnual: SimulationAnnualType
  setSimulationAnnual: (simulationAnnual: SimulationAnnualType) => void
  sparplanElemente: SparplanElement[]
  setSparplanElemente: (sparplanElemente: SparplanElement[]) => void
  // Global End of Life and Life Expectancy configuration
  endOfLife: number
  setEndOfLife: (endOfLife: number) => void
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  setLifeExpectancyTable: (table: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
  customLifeExpectancy?: number
  setCustomLifeExpectancy: (expectancy?: number) => void
  // Gender and couple planning configuration
  planningMode: 'individual' | 'couple'
  setPlanningMode: (mode: 'individual' | 'couple') => void
  gender?: 'male' | 'female'
  setGender: (gender?: 'male' | 'female') => void
  spouse?: { birthYear?: number, gender: 'male' | 'female' }
  setSpouse: (spouse?: { birthYear?: number, gender: 'male' | 'female' }) => void
  // Birth year helper for end of life calculation
  birthYear?: number
  setBirthYear: (birthYear?: number) => void
  expectedLifespan?: number
  setExpectedLifespan: (lifespan?: number) => void
  useAutomaticCalculation: boolean
  setUseAutomaticCalculation: (useAutomatic: boolean) => void
  simulationData: SimulationData | null
  isLoading: boolean
  withdrawalResults: WithdrawalResult | null
  setWithdrawalResults: (withdrawalResults: WithdrawalResult | null) => void
  performSimulation: (overwrite?: { rendite?: number }) => Promise<void>
  // Configuration management
  getCurrentConfiguration: () => SavedConfiguration
  saveCurrentConfiguration: () => void
  loadSavedConfiguration: () => void
  resetToDefaults: () => void
  // Withdrawal configuration
  withdrawalConfig: WithdrawalConfiguration | null
  setWithdrawalConfig: (config: WithdrawalConfiguration | null) => void
  // Statutory pension configuration
  statutoryPensionConfig: StatutoryPensionConfig | null
  setStatutoryPensionConfig: (config: StatutoryPensionConfig | null) => void
  // Couple statutory pension configuration (new)
  coupleStatutoryPensionConfig: CoupleStatutoryPensionConfig | null
  setCoupleStatutoryPensionConfig: (config: CoupleStatutoryPensionConfig | null) => void
  // Care cost configuration
  careCostConfiguration: CareCostConfiguration
  setCareCostConfiguration: (config: CareCostConfiguration) => void
  // Financial goals configuration
  financialGoals: FinancialGoal[]
  setFinancialGoals: (goals: FinancialGoal[]) => void
}

export const SimulationProvider = ({ children }: { children: React.ReactNode }) => {
  // Default configuration
  const defaultConfig = useMemo(() => createDefaultConfiguration(), [])

  // Try to load saved configuration, initialize profiles if needed
  const loadInitialConfig = () => {
    // Try legacy configuration first
    const legacyConfig = loadConfiguration()

    // Initialize profile storage with legacy config if it exists
    initializeProfileStorage(legacyConfig || undefined)

    // Get active profile config if available
    const activeProfile = getActiveProfile()
    if (activeProfile) {
      return activeProfile.configuration
    }

    // Fallback to legacy config or defaults
    return legacyConfig || defaultConfig
  }

  const initialConfig = loadInitialConfig()
  const extendedInitialConfig = initialConfig as ExtendedSavedConfiguration

  // Initialize all state using custom hook
  const state = useSimulationState({
    initialConfig,
    extendedInitialConfig,
    defaultConfig,
  })

  // Extract state and setters for easier access
  const {
    rendite, setRendite,
    steuerlast, setSteuerlast,
    teilfreistellungsquote, setTeilfreistellungsquote,
    freibetragPerYear, setFreibetragPerYear,
    basiszinsConfiguration, setBasiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, setGrundfreibetragAktiv,
    grundfreibetragBetrag, setGrundfreibetragBetrag,
    personalTaxRate, setPersonalTaxRate,
    guenstigerPruefungAktiv, setGuenstigerPruefungAktiv,
    kirchensteuerAktiv, setKirchensteuerAktiv,
    kirchensteuersatz, setKirchensteuersatz,
    returnMode, setReturnMode,
    averageReturn, setAverageReturn,
    standardDeviation, setStandardDeviation,
    randomSeed, setRandomSeed,
    variableReturns, setVariableReturns,
    historicalIndex, setHistoricalIndex,
    blackSwanReturns, setBlackSwanReturns,
    blackSwanEventName, setBlackSwanEventName,
    inflationScenarioRates, setInflationScenarioRates,
    inflationScenarioReturnModifiers, setInflationScenarioReturnModifiers,
    inflationScenarioName, setInflationScenarioName,
    multiAssetConfig, setMultiAssetConfig,
    withdrawalMultiAssetConfig, setWithdrawalMultiAssetConfig,
    inflationAktivSparphase, setInflationAktivSparphase,
    inflationsrateSparphase, setInflationsrateSparphase,
    inflationAnwendungSparphase, setInflationAnwendungSparphase,
    startEnd, setStartEnd,
    sparplan, setSparplan,
    simulationAnnual, setSimulationAnnual,
    sparplanElemente, setSparplanElemente,
    endOfLife, setEndOfLife,
    lifeExpectancyTable, setLifeExpectancyTable,
    customLifeExpectancy, setCustomLifeExpectancy,
    planningMode, setPlanningMode,
    gender, setGender,
    spouse, setSpouse,
    birthYear, setBirthYear,
    expectedLifespan, setExpectedLifespan,
    useAutomaticCalculation, setUseAutomaticCalculation,
    simulationData, setSimulationData,
    isLoading, setIsLoading,
    withdrawalResults, setWithdrawalResults,
    withdrawalConfig, setWithdrawalConfig,
    statutoryPensionConfig, setStatutoryPensionConfig,
    coupleStatutoryPensionConfig, setCoupleStatutoryPensionConfig,
    careCostConfiguration, setCareCostConfiguration,
    financialGoals, setFinancialGoals,
  } = state

  // Configuration management using custom hook
  const configState = {
    rendite, steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, grundfreibetragBetrag, personalTaxRate, guenstigerPruefungAktiv,
    kirchensteuerAktiv, kirchensteuersatz, returnMode, averageReturn, standardDeviation,
    randomSeed, variableReturns, historicalIndex, inflationAktivSparphase, inflationsrateSparphase,
    inflationAnwendungSparphase, startEnd, sparplan, simulationAnnual, endOfLife, lifeExpectancyTable,
    customLifeExpectancy, planningMode, gender, spouse, birthYear, expectedLifespan,
    useAutomaticCalculation, withdrawalConfig, statutoryPensionConfig, coupleStatutoryPensionConfig,
    careCostConfiguration, financialGoals,
  }

  const configSetters = {
    setRendite, setSteuerlast, setTeilfreistellungsquote, setFreibetragPerYear,
    setBasiszinsConfiguration, setSteuerReduzierenEndkapitalSparphase,
    setSteuerReduzierenEndkapitalEntspharphase, setGrundfreibetragAktiv,
    setGrundfreibetragBetrag, setPersonalTaxRate, setGuenstigerPruefungAktiv,
    setKirchensteuerAktiv, setKirchensteuersatz, setReturnMode, setAverageReturn,
    setStandardDeviation, setRandomSeed, setVariableReturns, setHistoricalIndex,
    setInflationAktivSparphase, setInflationsrateSparphase, setInflationAnwendungSparphase,
    setStartEnd, setSparplan, setSimulationAnnual, setSparplanElemente, setEndOfLife,
    setLifeExpectancyTable, setCustomLifeExpectancy, setPlanningMode, setGender,
    setSpouse, setBirthYear, setExpectedLifespan, setUseAutomaticCalculation,
    setWithdrawalConfig, setStatutoryPensionConfig, setCoupleStatutoryPensionConfig,
    setCareCostConfiguration, setFinancialGoals,
  }

  const {
    getCurrentConfiguration,
    saveCurrentConfiguration,
    loadSavedConfiguration,
    resetToDefaults,
  } = useConfigurationManagement(
    defaultConfig,
    configState,
    configSetters,
  )

  // Simulation execution using custom hook
  const simulationState = {
    rendite, returnMode, averageReturn, standardDeviation, randomSeed, variableReturns,
    historicalIndex, blackSwanReturns, inflationScenarioRates, inflationScenarioReturnModifiers,
    multiAssetConfig, simulationAnnual, sparplanElemente, startEnd, steuerlast,
    teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, inflationAktivSparphase, inflationsrateSparphase,
    inflationAnwendungSparphase, guenstigerPruefungAktiv, personalTaxRate,
  }

  const { performSimulation } = useSimulationExecution(simulationState, setIsLoading, setSimulationData)

  // Side effects using custom hook
  const effectsState = {
    endOfLife, planningMode, freibetragPerYear, coupleStatutoryPensionConfig, careCostConfiguration,
  }

  const effectsSetters = {
    setStartEnd, setFreibetragPerYear, setCoupleStatutoryPensionConfig,
    setCareCostConfiguration, setEndOfLife,
  }

  const { setEndOfLifeRounded } = useSimulationEffects(effectsState, effectsSetters, saveCurrentConfiguration)

  const value = useMemo(() => ({
    rendite, setRendite,
    steuerlast, setSteuerlast,
    teilfreistellungsquote, setTeilfreistellungsquote,
    freibetragPerYear, setFreibetragPerYear,
    basiszinsConfiguration, setBasiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, setGrundfreibetragAktiv,
    grundfreibetragBetrag, setGrundfreibetragBetrag,
    // Personal income tax settings
    personalTaxRate, setPersonalTaxRate,
    guenstigerPruefungAktiv, setGuenstigerPruefungAktiv,
    // Church tax (Kirchensteuer) settings
    kirchensteuerAktiv, setKirchensteuerAktiv,
    kirchensteuersatz, setKirchensteuersatz,
    returnMode, setReturnMode,
    averageReturn, setAverageReturn,
    standardDeviation, setStandardDeviation,
    randomSeed, setRandomSeed,
    variableReturns, setVariableReturns,
    historicalIndex, setHistoricalIndex,
    // Black Swan event configuration
    blackSwanReturns, setBlackSwanReturns,
    blackSwanEventName, setBlackSwanEventName,
    // Inflation scenario configuration
    inflationScenarioRates, setInflationScenarioRates,
    inflationScenarioReturnModifiers, setInflationScenarioReturnModifiers,
    inflationScenarioName, setInflationScenarioName,
    // Multi-asset portfolio configuration
    multiAssetConfig, setMultiAssetConfig,
    // Multi-asset portfolio configuration for withdrawal phase
    withdrawalMultiAssetConfig, setWithdrawalMultiAssetConfig,
    // Inflation for savings phase
    inflationAktivSparphase, setInflationAktivSparphase,
    inflationsrateSparphase, setInflationsrateSparphase,
    inflationAnwendungSparphase, setInflationAnwendungSparphase,
    startEnd, setStartEnd,
    sparplan, setSparplan,
    simulationAnnual, setSimulationAnnual,
    sparplanElemente, setSparplanElemente,
    // Global End of Life and Life Expectancy settings
    endOfLife, setEndOfLife: setEndOfLifeRounded,
    lifeExpectancyTable, setLifeExpectancyTable,
    customLifeExpectancy, setCustomLifeExpectancy,
    // Gender and couple planning settings
    planningMode, setPlanningMode,
    gender, setGender,
    spouse, setSpouse,
    // Birth year helper for end of life calculation
    birthYear, setBirthYear,
    expectedLifespan, setExpectedLifespan,
    useAutomaticCalculation, setUseAutomaticCalculation,
    simulationData,
    isLoading,
    withdrawalResults, setWithdrawalResults,
    performSimulation,
    // Configuration management
    getCurrentConfiguration,
    saveCurrentConfiguration,
    loadSavedConfiguration,
    resetToDefaults,
    // Withdrawal configuration
    withdrawalConfig, setWithdrawalConfig,
    // Statutory pension configuration
    statutoryPensionConfig, setStatutoryPensionConfig,
    // Couple statutory pension configuration (new)
    coupleStatutoryPensionConfig, setCoupleStatutoryPensionConfig,
    // Care cost configuration
    careCostConfiguration, setCareCostConfiguration,
    // Financial goals configuration
    financialGoals, setFinancialGoals,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- Setter functions are stable
  }), [
    rendite, steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, grundfreibetragBetrag,
    personalTaxRate, guenstigerPruefungAktiv,
    kirchensteuerAktiv, kirchensteuersatz,
    returnMode, averageReturn, standardDeviation, randomSeed, variableReturns, historicalIndex,
    blackSwanReturns, blackSwanEventName,
    inflationScenarioRates, inflationScenarioReturnModifiers, inflationScenarioName,
    multiAssetConfig, withdrawalMultiAssetConfig,
    inflationAktivSparphase, inflationsrateSparphase, inflationAnwendungSparphase,
    startEnd, sparplan, simulationAnnual, sparplanElemente,
    endOfLife, lifeExpectancyTable, customLifeExpectancy, planningMode, gender, spouse,
    birthYear, expectedLifespan, useAutomaticCalculation,
    simulationData, isLoading, withdrawalResults, performSimulation,
    getCurrentConfiguration, saveCurrentConfiguration, loadSavedConfiguration, resetToDefaults,
    withdrawalConfig, statutoryPensionConfig, coupleStatutoryPensionConfig, careCostConfiguration,
    financialGoals,
    setEndOfLifeRounded,
  ])

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}
