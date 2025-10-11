import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { simulate, type SimulationAnnualType } from '../utils/simulate'
import type { ReturnMode, ReturnConfiguration } from '../utils/random-returns'
import { convertSparplanToElements, type Sparplan, type SparplanElement } from '../utils/sparplan-utils'
import type { WithdrawalResult } from '../../helpers/withdrawal'
import { SimulationContext } from './SimulationContextValue'
import { saveConfiguration, loadConfiguration, type SavedConfiguration, type WithdrawalConfiguration } from '../utils/config-storage'
import {
  initializeProfileStorage,
  getActiveProfile,
  updateProfile,
  hasProfiles,
} from '../utils/profile-storage'
import type { BasiszinsConfiguration } from '../services/bundesbank-api'
import { convertLegacyToCoupleConfig, type StatutoryPensionConfig, type CoupleStatutoryPensionConfig } from '../../helpers/statutory-pension'
import { updateFreibetragForPlanningMode } from '../utils/freibetrag-calculation'
import { createDefaultCareCostConfiguration, type CareCostConfiguration } from '../../helpers/care-cost-simulation'
import type { FinancialGoal } from '../../helpers/financial-goals'
import type { ExtendedSavedConfiguration, DefaultConfiguration, SimulationData } from './helpers/config-types'
import {
  loadBasicConfig,
  loadTaxConfig,
  loadReturnConfig,
  loadInflationConfig,
  loadSparplanConfig,
  loadLifeExpectancyConfig,
  loadPlanningModeConfig,
  loadWithdrawalConfig,
} from './helpers/config-loading'
import {
  buildReturnConfig,
  applyBlackSwanReturns,
  applyInflationScenarioModifiers,
  prepareVariableInflationRates,
} from './helpers/simulation-helpers'
import { createFallbackMultiAssetConfig, createFallbackWithdrawalConfig } from './helpers/multi-asset-defaults'
import { createDefaultConfiguration } from './helpers/default-config'
import { resetConfiguration } from './helpers/config-reset'

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

  const [rendite, setRendite] = useState(initialConfig.rendite)
  const [steuerlast, setSteuerlast] = useState(initialConfig.steuerlast)
  const [teilfreistellungsquote, setTeilfreistellungsquote] = useState(initialConfig.teilfreistellungsquote)
  const [freibetragPerYear, setFreibetragPerYear] = useState<{ [year: number]: number }>(
    initialConfig.freibetragPerYear,
  )
  const [basiszinsConfiguration, setBasiszinsConfiguration] = useState<BasiszinsConfiguration>(
    extendedInitialConfig.basiszinsConfiguration || defaultConfig.basiszinsConfiguration,
  )
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
  const [returnMode, setReturnMode] = useState<ReturnMode>(initialConfig.returnMode)
  const [averageReturn, setAverageReturn] = useState(initialConfig.averageReturn)
  const [standardDeviation, setStandardDeviation] = useState(initialConfig.standardDeviation)
  const [randomSeed, setRandomSeed] = useState<number | undefined>(initialConfig.randomSeed)
  const [variableReturns, setVariableReturns] = useState<Record<number, number>>(initialConfig.variableReturns)
  const [historicalIndex, setHistoricalIndex] = useState<string>(
    extendedInitialConfig.historicalIndex || defaultConfig.historicalIndex,
  )
  // Black Swan event state
  const [blackSwanReturns, setBlackSwanReturns] = useState<Record<number, number> | null>(null)
  const [blackSwanEventName, setBlackSwanEventName] = useState<string>('')
  // Inflation scenario state
  const [inflationScenarioRates, setInflationScenarioRates] = useState<Record<number, number> | null>(null)
  const [inflationScenarioReturnModifiers, setInflationScenarioReturnModifiers] = useState<
    Record<number, number> | null
  >(null)
  const [inflationScenarioName, setInflationScenarioName] = useState<string>('')
  // Multi-asset portfolio state
  const [multiAssetConfig, setMultiAssetConfig] = useState(() => {
    try {
      const { createDefaultMultiAssetConfig } = require('../../helpers/multi-asset-portfolio')
      return extendedInitialConfig.multiAssetConfig || createDefaultMultiAssetConfig()
    }
    catch {
      return extendedInitialConfig.multiAssetConfig || createFallbackMultiAssetConfig()
    }
  })

  // Multi-asset portfolio state for withdrawal phase (more conservative defaults)
  const [withdrawalMultiAssetConfig, setWithdrawalMultiAssetConfig] = useState(() => {
    try {
      const { createDefaultMultiAssetConfig } = require('../../helpers/multi-asset-portfolio')
      const defaultConfig = createDefaultMultiAssetConfig()
      // Make it more conservative for withdrawal phase
      const conservativeConfig = {
        ...defaultConfig,
        assetClasses: {
          ...defaultConfig.assetClasses,
          stocks_domestic: {
            ...defaultConfig.assetClasses.stocks_domestic,
            targetAllocation: 0.3,
            expectedReturn: 0.06,
            volatility: 0.18,
          },
          stocks_international: {
            ...defaultConfig.assetClasses.stocks_international,
            targetAllocation: 0.15,
            expectedReturn: 0.055,
            volatility: 0.16,
          },
          bonds_government: {
            ...defaultConfig.assetClasses.bonds_government,
            targetAllocation: 0.35,
            expectedReturn: 0.025,
            volatility: 0.04,
          },
          bonds_corporate: {
            ...defaultConfig.assetClasses.bonds_corporate,
            targetAllocation: 0.15,
            expectedReturn: 0.035,
            volatility: 0.06,
          },
        },
      }
      return extendedInitialConfig.withdrawalMultiAssetConfig || conservativeConfig
    }
    catch {
      return extendedInitialConfig.withdrawalMultiAssetConfig || createFallbackWithdrawalConfig()
    }
  })

  // Inflation state for savings phase
  const [inflationAktivSparphase, setInflationAktivSparphase] = useState(
    extendedInitialConfig.inflationAktivSparphase ?? defaultConfig.inflationAktivSparphase,
  )
  const [inflationsrateSparphase, setInflationsrateSparphase] = useState(
    extendedInitialConfig.inflationsrateSparphase ?? defaultConfig.inflationsrateSparphase,
  )
  const [inflationAnwendungSparphase, setInflationAnwendungSparphase] = useState<'sparplan' | 'gesamtmenge'>(
    extendedInitialConfig.inflationAnwendungSparphase ?? defaultConfig.inflationAnwendungSparphase,
  )
  const [startEnd, setStartEnd] = useState<[number, number]>(initialConfig.startEnd)
  const [sparplan, setSparplan] = useState<Sparplan[]>(initialConfig.sparplan)
  const [simulationAnnual, setSimulationAnnual] = useState<SimulationAnnualType>(initialConfig.simulationAnnual)
  const [sparplanElemente, setSparplanElemente] = useState<SparplanElement[]>(
    convertSparplanToElements(initialConfig.sparplan, initialConfig.startEnd, initialConfig.simulationAnnual),
  )
  // Global End of Life and Life Expectancy state
  const [endOfLife, setEndOfLife] = useState(
    extendedInitialConfig.endOfLife ?? initialConfig.startEnd[1],
  )
  const [lifeExpectancyTable, setLifeExpectancyTable] = useState<'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'>(
    extendedInitialConfig.lifeExpectancyTable ?? defaultConfig.lifeExpectancyTable,
  )
  const [customLifeExpectancy, setCustomLifeExpectancy] = useState<number | undefined>(
    extendedInitialConfig.customLifeExpectancy,
  )
  // Gender and couple planning state
  const [planningMode, setPlanningMode] = useState<'individual' | 'couple'>(
    extendedInitialConfig.planningMode ?? defaultConfig.planningMode,
  )
  const [gender, setGender] = useState<'male' | 'female' | undefined>(
    extendedInitialConfig.gender,
  )
  const [spouse, setSpouse] = useState<{ birthYear?: number, gender: 'male' | 'female' } | undefined>(
    extendedInitialConfig.spouse,
  )
  // Birth year helper for end of life calculation
  const [birthYear, setBirthYear] = useState<number | undefined>(
    extendedInitialConfig.birthYear,
  )
  const [expectedLifespan, setExpectedLifespan] = useState<number | undefined>(
    extendedInitialConfig.expectedLifespan ?? defaultConfig.expectedLifespan,
  )
  const [useAutomaticCalculation, setUseAutomaticCalculation] = useState<boolean>(
    extendedInitialConfig.useAutomaticCalculation ?? true,
  )
  const [simulationData, setSimulationData] = useState<SimulationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [withdrawalResults, setWithdrawalResults] = useState<WithdrawalResult | null>(null)

  // Withdrawal configuration state
  const [withdrawalConfig, setWithdrawalConfig] = useState<WithdrawalConfiguration | null>(
    (initialConfig as SavedConfiguration).withdrawal || null,
  )

  // Statutory pension configuration state
  const [statutoryPensionConfig, setStatutoryPensionConfig] = useState<StatutoryPensionConfig | null>(
    (initialConfig as SavedConfiguration).statutoryPensionConfig || null,
  )

  // Couple statutory pension configuration state (new enhanced version)
  const [coupleStatutoryPensionConfig, setCoupleStatutoryPensionConfig]
    = useState<CoupleStatutoryPensionConfig | null>(() => {
      // Convert legacy config to couple config if it exists
      const legacyConfig = (initialConfig as SavedConfiguration).statutoryPensionConfig
      const currentPlanningMode = extendedInitialConfig.planningMode || 'couple'

      return legacyConfig
        ? convertLegacyToCoupleConfig(legacyConfig, currentPlanningMode)
        : null
    })

  // Care cost configuration state
  const [careCostConfiguration, setCareCostConfiguration] = useState<CareCostConfiguration>(() => {
    const savedConfig = extendedInitialConfig.careCostConfiguration
    if (savedConfig) {
      // Ensure the planning mode matches the global planning mode
      return {
        ...savedConfig,
        planningMode: extendedInitialConfig.planningMode || 'individual',
      }
    }
    return {
      ...createDefaultCareCostConfiguration(),
      planningMode: extendedInitialConfig.planningMode || 'individual',
    }
  })

  // Financial goals configuration state
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(() => {
    const savedGoals = extendedInitialConfig.financialGoals
    return savedGoals || []
  })

  // Synchronize startEnd[1] (withdrawal end year) with endOfLife (life expectancy calculation)
  useEffect(() => {
    // Only update if endOfLife is different from current startEnd[1]
    // Use functional update to avoid stale closure on startEnd
    setStartEnd((currentStartEnd) => {
      if (endOfLife !== currentStartEnd[1]) {
        return [currentStartEnd[0], endOfLife]
      }
      return currentStartEnd
    })
  }, [endOfLife])

  // Update freibetragPerYear when planning mode changes
  useEffect(() => {
    const updatedFreibetrag = updateFreibetragForPlanningMode(
      freibetragPerYear,
      planningMode,
    )

    // Only update if there are actual changes to avoid infinite loops
    const hasChanges = Object.keys(updatedFreibetrag).some(
      year => updatedFreibetrag[parseInt(year)] !== freibetragPerYear[parseInt(year)],
    )

    if (hasChanges) {
      setFreibetragPerYear(updatedFreibetrag)
    }
  }, [planningMode, freibetragPerYear, setFreibetragPerYear])

  // Update couple statutory pension configuration when planning mode changes
  useEffect(() => {
    if (coupleStatutoryPensionConfig && coupleStatutoryPensionConfig.planningMode !== planningMode) {
      const updatedConfig = {
        ...coupleStatutoryPensionConfig,
        planningMode,
      }

      // If switching from individual to couple mode and only individual config exists
      if (planningMode === 'couple' && coupleStatutoryPensionConfig.individual && !coupleStatutoryPensionConfig.couple) {
        updatedConfig.couple = {
          person1: {
            ...coupleStatutoryPensionConfig.individual,
            personId: 1 as const,
            personName: 'Person 1',
          },
          person2: {
            ...coupleStatutoryPensionConfig.individual,
            personId: 2 as const,
            personName: 'Person 2',
          },
        }
      }

      setCoupleStatutoryPensionConfig(updatedConfig)
    }
  }, [planningMode, coupleStatutoryPensionConfig])

  // Update care cost configuration when planning mode changes
  useEffect(() => {
    if (careCostConfiguration.planningMode !== planningMode) {
      setCareCostConfiguration(prevConfig => ({
        ...prevConfig,
        planningMode,
        // Reset couple configuration when switching to individual mode
        coupleConfig: planningMode === 'individual' ? undefined : prevConfig.coupleConfig,
      }))
    }
  }, [planningMode, careCostConfiguration.planningMode])

  // Create a wrapper for setEndOfLife that ensures values are always rounded to whole numbers
  const setEndOfLifeRounded = useCallback((value: number) => {
    setEndOfLife(Math.round(value))
  }, [])

  const yearToday = new Date().getFullYear()

  // Configuration management functions
  const getCurrentConfiguration = useCallback((): SavedConfiguration => ({
    rendite,
    steuerlast,
    teilfreistellungsquote,
    freibetragPerYear,
    basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    // Personal income tax settings
    personalTaxRate,
    guenstigerPruefungAktiv,
    returnMode,
    averageReturn,
    standardDeviation,
    randomSeed,
    variableReturns,
    historicalIndex,
    // Inflation for savings phase
    inflationAktivSparphase,
    inflationsrateSparphase,
    inflationAnwendungSparphase,
    startEnd,
    sparplan,
    simulationAnnual,
    // Global End of Life and Life Expectancy settings
    endOfLife,
    lifeExpectancyTable,
    customLifeExpectancy,
    // Gender and couple planning settings
    planningMode,
    gender,
    spouse,
    // Birth year helper for end of life calculation
    birthYear,
    expectedLifespan,
    useAutomaticCalculation,
    withdrawal: withdrawalConfig || undefined,
    statutoryPensionConfig: statutoryPensionConfig || undefined,
    coupleStatutoryPensionConfig: coupleStatutoryPensionConfig || undefined,
    careCostConfiguration,
    financialGoals,
  }), [
    rendite,
    steuerlast,
    teilfreistellungsquote,
    freibetragPerYear,
    basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase,
    steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    personalTaxRate,
    guenstigerPruefungAktiv,
    returnMode,
    averageReturn,
    standardDeviation,
    randomSeed,
    variableReturns,
    historicalIndex,
    inflationAktivSparphase,
    inflationsrateSparphase,
    inflationAnwendungSparphase,
    startEnd,
    sparplan,
    simulationAnnual,
    endOfLife,
    lifeExpectancyTable,
    customLifeExpectancy,
    planningMode,
    gender,
    spouse,
    birthYear,
    expectedLifespan,
    useAutomaticCalculation,
    withdrawalConfig,
    statutoryPensionConfig,
    coupleStatutoryPensionConfig,
    careCostConfiguration,
    financialGoals,
  ])

  const saveCurrentConfiguration = useCallback(() => {
    const config = getCurrentConfiguration()

    // If profiles exist, save to active profile, otherwise use legacy storage
    if (hasProfiles()) {
      const activeProfile = getActiveProfile()
      if (activeProfile) {
        updateProfile(activeProfile.id, { configuration: config })
      }
      else {
        // Fallback to legacy storage if no active profile
        saveConfiguration(config)
      }
    }
    else {
      // Legacy storage for backward compatibility
      saveConfiguration(config)
    }
  }, [getCurrentConfiguration])

  const loadConfigFromProfileOrLegacy = (): SavedConfiguration | null => {
    // Try to load from active profile first
    if (hasProfiles()) {
      const activeProfile = getActiveProfile()
      if (activeProfile) {
        return activeProfile.configuration
      }
    }
    // Fallback to legacy configuration
    return loadConfiguration()
  }

  const loadSavedConfiguration = useCallback(() => {
    const savedConfig = loadConfigFromProfileOrLegacy()
    if (!savedConfig) return

    const extendedConfig = savedConfig as ExtendedSavedConfiguration
    const defConfig = defaultConfig as unknown as DefaultConfiguration

    loadBasicConfig(extendedConfig, defConfig, {
      setRendite, setSteuerlast, setTeilfreistellungsquote,
      setFreibetragPerYear, setBasiszinsConfiguration,
    })

    loadTaxConfig(extendedConfig, defConfig, {
      setSteuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalEntspharphase,
      setGrundfreibetragAktiv, setGrundfreibetragBetrag,
      setPersonalTaxRate, setGuenstigerPruefungAktiv,
    })

    loadReturnConfig(extendedConfig, defConfig, {
      setReturnMode, setAverageReturn, setStandardDeviation,
      setRandomSeed, setVariableReturns, setHistoricalIndex,
    })

    loadInflationConfig(extendedConfig, defConfig, {
      setInflationAktivSparphase, setInflationsrateSparphase, setInflationAnwendungSparphase,
    })

    loadSparplanConfig(extendedConfig, {
      setStartEnd, setSparplan, setSimulationAnnual, setSparplanElemente,
    })

    loadLifeExpectancyConfig(extendedConfig, defConfig, {
      setEndOfLife, setLifeExpectancyTable, setCustomLifeExpectancy,
    })

    loadPlanningModeConfig(extendedConfig, defConfig, {
      setPlanningMode, setGender, setSpouse,
      setBirthYear, setExpectedLifespan, setUseAutomaticCalculation,
    })

    loadWithdrawalConfig(extendedConfig, {
      setWithdrawalConfig, setStatutoryPensionConfig,
      setCoupleStatutoryPensionConfig, setCareCostConfiguration, setFinancialGoals,
    })
  }, [defaultConfig])

  const resetToDefaults = useCallback(() => {
    resetConfiguration(defaultConfig, {
      setRendite, setSteuerlast, setTeilfreistellungsquote, setFreibetragPerYear,
      setBasiszinsConfiguration, setSteuerReduzierenEndkapitalSparphase,
      setSteuerReduzierenEndkapitalEntspharphase, setGrundfreibetragAktiv,
      setGrundfreibetragBetrag, setPersonalTaxRate, setGuenstigerPruefungAktiv,
      setReturnMode, setAverageReturn, setStandardDeviation, setRandomSeed,
      setVariableReturns, setHistoricalIndex, setInflationAktivSparphase,
      setInflationsrateSparphase, setInflationAnwendungSparphase,
      setStartEnd, setSparplan, setSimulationAnnual, setSparplanElemente,
      setEndOfLife, setLifeExpectancyTable, setCustomLifeExpectancy,
      setPlanningMode, setGender, setSpouse, setBirthYear,
      setExpectedLifespan, setUseAutomaticCalculation,
    }, {
      setWithdrawalConfig, setStatutoryPensionConfig,
      setCoupleStatutoryPensionConfig, setCareCostConfiguration, setFinancialGoals,
    })
  }, [defaultConfig])

  // Auto-save configuration whenever any config value changes
  useEffect(() => {
    saveCurrentConfiguration()
  }, [saveCurrentConfiguration])

  const performSimulation = useCallback(async (overwrite: { rendite?: number } = {}) => {
    setIsLoading(true)
    try {
      let returnConfig: ReturnConfiguration

      // Build base return configuration
      if (overwrite.rendite !== undefined) {
        returnConfig = { mode: 'fixed', fixedRate: overwrite.rendite / 100 }
      }
      else {
        returnConfig = buildReturnConfig(
          returnMode, rendite, averageReturn, standardDeviation,
          randomSeed, variableReturns, historicalIndex, multiAssetConfig,
        )
      }

      // Apply Black Swan returns if active
      returnConfig = applyBlackSwanReturns(returnConfig, blackSwanReturns, returnMode)

      // Apply inflation scenario return modifiers
      returnConfig = applyInflationScenarioModifiers(
        returnConfig, inflationScenarioReturnModifiers, returnMode, rendite,
      )

      // Prepare variable inflation rates
      const variableInflationRates = prepareVariableInflationRates(
        inflationScenarioRates, inflationAktivSparphase,
        inflationsrateSparphase, yearToday, startEnd[0],
      )

      const result = simulate({
        startYear: yearToday,
        endYear: startEnd[0],
        elements: sparplanElemente,
        returnConfig,
        steuerlast: steuerlast / 100,
        simulationAnnual,
        teilfreistellungsquote: teilfreistellungsquote / 100,
        freibetragPerYear,
        steuerReduzierenEndkapital: steuerReduzierenEndkapitalSparphase,
        basiszinsConfiguration,
        inflationAktivSparphase,
        inflationsrateSparphase,
        inflationAnwendungSparphase,
        variableInflationRates,
        guenstigerPruefungAktiv,
        personalTaxRate,
      })

      setSimulationData({
        sparplanElements: result.map(element => ({
          ...element,
        })),
      })
    }
    catch (error) {
      console.error('Simulation error:', error)
    }
    finally {
      setIsLoading(false)
    }
  }, [
    rendite,
    returnMode,
    averageReturn,
    standardDeviation,
    randomSeed,
    variableReturns,
    historicalIndex,
    blackSwanReturns,
    inflationScenarioRates,
    inflationScenarioReturnModifiers,
    multiAssetConfig,
    simulationAnnual,
    sparplanElemente,
    startEnd,
    yearToday,
    steuerlast,
    teilfreistellungsquote,
    freibetragPerYear,
    basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase,
    inflationAktivSparphase,
    inflationsrateSparphase,
    inflationAnwendungSparphase,
    guenstigerPruefungAktiv,
    personalTaxRate,
  ])

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
