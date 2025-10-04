import React, { useState, useCallback, useMemo, useEffect } from 'react'
import type { SimulationAnnualType } from '../utils/simulate'
import { SimulationAnnual, simulate } from '../utils/simulate'
import type { ReturnMode, ReturnConfiguration } from '../utils/random-returns'
import type { Sparplan, SparplanElement } from '../utils/sparplan-utils'
import { convertSparplanToElements, initialSparplan } from '../utils/sparplan-utils'
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
import type { StatutoryPensionConfig, CoupleStatutoryPensionConfig } from '../../helpers/statutory-pension'
import { convertLegacyToCoupleConfig } from '../../helpers/statutory-pension'
import { updateFreibetragForPlanningMode } from '../utils/freibetrag-calculation'

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
  simulationData: any
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
}

export const SimulationProvider = ({ children }: { children: React.ReactNode }) => {
  // Default configuration
  const defaultConfig = useMemo(() => ({
    rendite: 5,
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2023: 2000 },
    // Default Basiszins configuration with historical rates
    basiszinsConfiguration: {
      2018: { year: 2018, rate: 0.0087, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2019: { year: 2019, rate: 0.0087, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2020: { year: 2020, rate: 0.0070, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2021: { year: 2021, rate: 0.0070, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2022: { year: 2022, rate: 0.0180, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2023: { year: 2023, rate: 0.0255, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
      2024: { year: 2024, rate: 0.0255, source: 'fallback' as const, lastUpdated: new Date().toISOString() },
    } as BasiszinsConfiguration,
    // Default: taxes reduce capital for savings and withdrawal phases
    steuerReduzierenEndkapitalSparphase: true,
    steuerReduzierenEndkapitalEntspharphase: true,
    // Grundfreibetrag settings (German basic tax allowance for retirees)
    grundfreibetragAktiv: true,
    // Updated to 2024 German basic tax allowance, default when activated will be double (23208)
    grundfreibetragBetrag: 23208,
    returnMode: 'random' as ReturnMode,
    averageReturn: 7,
    standardDeviation: 15,
    randomSeed: undefined,
    variableReturns: {},
    historicalIndex: 'dax',
    // Inflation settings for savings phase (default: enabled with 2%)
    inflationAktivSparphase: true,
    inflationsrateSparphase: 2,
    inflationAnwendungSparphase: 'gesamtmenge' as 'sparplan' | 'gesamtmenge',
    startEnd: [2040, 2080] as [number, number],
    sparplan: [initialSparplan],
    simulationAnnual: SimulationAnnual.monthly,
    // Global End of Life and Life Expectancy settings
    endOfLife: 2080,
    lifeExpectancyTable: 'german_2020_22' as 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom',
    customLifeExpectancy: undefined,
    // Gender and couple planning configuration
    planningMode: 'couple' as 'individual' | 'couple',
    gender: 'male' as 'male' | 'female',
    spouse: { birthYear: 1986, gender: 'female' as 'male' | 'female' },
    // Birth year helper for end of life calculation
    birthYear: 1984,
    expectedLifespan: 85,
    useAutomaticCalculation: true,
  }), [])

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

  const [rendite, setRendite] = useState(initialConfig.rendite)
  const [steuerlast, setSteuerlast] = useState(initialConfig.steuerlast)
  const [teilfreistellungsquote, setTeilfreistellungsquote] = useState(initialConfig.teilfreistellungsquote)
  const [freibetragPerYear, setFreibetragPerYear] = useState<{ [year: number]: number }>(
    initialConfig.freibetragPerYear,
  )
  const [basiszinsConfiguration, setBasiszinsConfiguration] = useState<BasiszinsConfiguration>(
    (initialConfig as any).basiszinsConfiguration || defaultConfig.basiszinsConfiguration,
  )
  const [steuerReduzierenEndkapitalSparphase, setSteuerReduzierenEndkapitalSparphase] = useState(
    (initialConfig as any).steuerReduzierenEndkapitalSparphase ?? true,
  )
  const [steuerReduzierenEndkapitalEntspharphase, setSteuerReduzierenEndkapitalEntspharphase] = useState(
    (initialConfig as any).steuerReduzierenEndkapitalEntspharphase ?? true,
  )
  const [grundfreibetragAktiv, setGrundfreibetragAktiv] = useState(
    (initialConfig as any).grundfreibetragAktiv ?? true,
  )
  const [grundfreibetragBetrag, setGrundfreibetragBetrag] = useState(
    (initialConfig as any).grundfreibetragBetrag ?? 23208,
  )
  const [returnMode, setReturnMode] = useState<ReturnMode>(initialConfig.returnMode)
  const [averageReturn, setAverageReturn] = useState(initialConfig.averageReturn)
  const [standardDeviation, setStandardDeviation] = useState(initialConfig.standardDeviation)
  const [randomSeed, setRandomSeed] = useState<number | undefined>(initialConfig.randomSeed)
  const [variableReturns, setVariableReturns] = useState<Record<number, number>>(initialConfig.variableReturns)
  const [historicalIndex, setHistoricalIndex] = useState<string>(
    (initialConfig as any).historicalIndex || defaultConfig.historicalIndex,
  )
  // Inflation state for savings phase
  const [inflationAktivSparphase, setInflationAktivSparphase] = useState(
    (initialConfig as any).inflationAktivSparphase ?? defaultConfig.inflationAktivSparphase,
  )
  const [inflationsrateSparphase, setInflationsrateSparphase] = useState(
    (initialConfig as any).inflationsrateSparphase ?? defaultConfig.inflationsrateSparphase,
  )
  const [inflationAnwendungSparphase, setInflationAnwendungSparphase] = useState<'sparplan' | 'gesamtmenge'>(
    (initialConfig as any).inflationAnwendungSparphase ?? defaultConfig.inflationAnwendungSparphase,
  )
  const [startEnd, setStartEnd] = useState<[number, number]>(initialConfig.startEnd)
  const [sparplan, setSparplan] = useState<Sparplan[]>(initialConfig.sparplan)
  const [simulationAnnual, setSimulationAnnual] = useState<SimulationAnnualType>(initialConfig.simulationAnnual)
  const [sparplanElemente, setSparplanElemente] = useState<SparplanElement[]>(
    convertSparplanToElements(initialConfig.sparplan, initialConfig.startEnd, initialConfig.simulationAnnual),
  )
  // Global End of Life and Life Expectancy state
  const [endOfLife, setEndOfLife] = useState(
    (initialConfig as any).endOfLife ?? initialConfig.startEnd[1],
  )
  const [lifeExpectancyTable, setLifeExpectancyTable] = useState<'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'>(
    (initialConfig as any).lifeExpectancyTable ?? defaultConfig.lifeExpectancyTable,
  )
  const [customLifeExpectancy, setCustomLifeExpectancy] = useState<number | undefined>(
    (initialConfig as any).customLifeExpectancy,
  )
  // Gender and couple planning state
  const [planningMode, setPlanningMode] = useState<'individual' | 'couple'>(
    (initialConfig as any).planningMode ?? defaultConfig.planningMode,
  )
  const [gender, setGender] = useState<'male' | 'female' | undefined>(
    (initialConfig as any).gender,
  )
  const [spouse, setSpouse] = useState<{ birthYear?: number, gender: 'male' | 'female' } | undefined>(
    (initialConfig as any).spouse,
  )
  // Birth year helper for end of life calculation
  const [birthYear, setBirthYear] = useState<number | undefined>(
    (initialConfig as any).birthYear,
  )
  const [expectedLifespan, setExpectedLifespan] = useState<number | undefined>(
    (initialConfig as any).expectedLifespan ?? defaultConfig.expectedLifespan,
  )
  const [useAutomaticCalculation, setUseAutomaticCalculation] = useState<boolean>(
    (initialConfig as any).useAutomaticCalculation ?? true,
  )
  const [simulationData, setSimulationData] = useState<any>(null)
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
      const currentPlanningMode = (initialConfig as any).planningMode || 'couple'

      return legacyConfig
        ? convertLegacyToCoupleConfig(legacyConfig, currentPlanningMode)
        : null
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

  const loadSavedConfiguration = useCallback(() => {
    let savedConfig: SavedConfiguration | null = null

    // Try to load from active profile first
    if (hasProfiles()) {
      const activeProfile = getActiveProfile()
      if (activeProfile) {
        savedConfig = activeProfile.configuration
      }
    }

    // Fallback to legacy configuration if no profile config found
    if (!savedConfig) {
      savedConfig = loadConfiguration()
    }

    if (savedConfig) {
      setRendite(savedConfig.rendite)
      setSteuerlast(savedConfig.steuerlast)
      setTeilfreistellungsquote(savedConfig.teilfreistellungsquote)
      setFreibetragPerYear(savedConfig.freibetragPerYear)
      setBasiszinsConfiguration((savedConfig as any).basiszinsConfiguration || defaultConfig.basiszinsConfiguration)
      setSteuerReduzierenEndkapitalSparphase(savedConfig.steuerReduzierenEndkapitalSparphase ?? true)
      setSteuerReduzierenEndkapitalEntspharphase(savedConfig.steuerReduzierenEndkapitalEntspharphase ?? true)
      setGrundfreibetragAktiv((savedConfig as any).grundfreibetragAktiv ?? false)
      setGrundfreibetragBetrag((savedConfig as any).grundfreibetragBetrag ?? 11604)
      setReturnMode(savedConfig.returnMode)
      setAverageReturn(savedConfig.averageReturn)
      setStandardDeviation(savedConfig.standardDeviation)
      setRandomSeed(savedConfig.randomSeed)
      setVariableReturns(savedConfig.variableReturns)
      setHistoricalIndex((savedConfig as any).historicalIndex || defaultConfig.historicalIndex)
      // Load inflation settings for savings phase
      const inflationSettings = {
        inflationAktivSparphase: (savedConfig as any).inflationAktivSparphase ?? defaultConfig.inflationAktivSparphase,
        inflationsrateSparphase: (savedConfig as any).inflationsrateSparphase ?? defaultConfig.inflationsrateSparphase,
        inflationAnwendungSparphase: (savedConfig as any).inflationAnwendungSparphase
          ?? defaultConfig.inflationAnwendungSparphase,
      }
      setInflationAktivSparphase(inflationSettings.inflationAktivSparphase)
      setInflationsrateSparphase(inflationSettings.inflationsrateSparphase)
      setInflationAnwendungSparphase(inflationSettings.inflationAnwendungSparphase)
      setStartEnd(savedConfig.startEnd)
      setSparplan(savedConfig.sparplan)
      setSimulationAnnual(savedConfig.simulationAnnual)
      setSparplanElemente(
        convertSparplanToElements(savedConfig.sparplan, savedConfig.startEnd, savedConfig.simulationAnnual),
      )
      // Load global End of Life and Life Expectancy settings
      setEndOfLife((savedConfig as any).endOfLife ?? savedConfig.startEnd[1])
      setLifeExpectancyTable((savedConfig as any).lifeExpectancyTable ?? defaultConfig.lifeExpectancyTable)
      setCustomLifeExpectancy((savedConfig as any).customLifeExpectancy)
      // Load gender and couple planning settings
      setPlanningMode((savedConfig as any).planningMode ?? defaultConfig.planningMode)
      setGender((savedConfig as any).gender)
      setSpouse((savedConfig as any).spouse)
      // Load birth year helper settings
      setBirthYear((savedConfig as any).birthYear)
      setExpectedLifespan((savedConfig as any).expectedLifespan ?? defaultConfig.expectedLifespan)
      setUseAutomaticCalculation((savedConfig as any).useAutomaticCalculation ?? defaultConfig.useAutomaticCalculation)
      setWithdrawalConfig(savedConfig.withdrawal || null)
      setStatutoryPensionConfig(savedConfig.statutoryPensionConfig || null)

      // Load couple statutory pension config, with fallback to converting legacy config
      const coupleConfig = (savedConfig as any).coupleStatutoryPensionConfig
        || (savedConfig.statutoryPensionConfig
          ? convertLegacyToCoupleConfig(savedConfig.statutoryPensionConfig, (savedConfig as any).planningMode || 'couple')
          : null)
      setCoupleStatutoryPensionConfig(coupleConfig)
    }
  }, [defaultConfig])

  const resetToDefaults = useCallback(() => {
    setRendite(defaultConfig.rendite)
    setSteuerlast(defaultConfig.steuerlast)
    setTeilfreistellungsquote(defaultConfig.teilfreistellungsquote)
    setFreibetragPerYear(defaultConfig.freibetragPerYear)
    setBasiszinsConfiguration(defaultConfig.basiszinsConfiguration)
    setSteuerReduzierenEndkapitalSparphase(defaultConfig.steuerReduzierenEndkapitalSparphase)
    setSteuerReduzierenEndkapitalEntspharphase(defaultConfig.steuerReduzierenEndkapitalEntspharphase)
    setGrundfreibetragAktiv(defaultConfig.grundfreibetragAktiv)
    setGrundfreibetragBetrag(defaultConfig.grundfreibetragBetrag)
    setReturnMode(defaultConfig.returnMode)
    setAverageReturn(defaultConfig.averageReturn)
    setStandardDeviation(defaultConfig.standardDeviation)
    setRandomSeed(defaultConfig.randomSeed)
    setVariableReturns(defaultConfig.variableReturns)
    setHistoricalIndex(defaultConfig.historicalIndex)
    // Reset inflation settings for savings phase
    setInflationAktivSparphase(defaultConfig.inflationAktivSparphase)
    setInflationsrateSparphase(defaultConfig.inflationsrateSparphase)
    setInflationAnwendungSparphase(defaultConfig.inflationAnwendungSparphase)
    setStartEnd(defaultConfig.startEnd)
    setSparplan(defaultConfig.sparplan)
    setSimulationAnnual(defaultConfig.simulationAnnual)
    setSparplanElemente(
      convertSparplanToElements(defaultConfig.sparplan, defaultConfig.startEnd, defaultConfig.simulationAnnual),
    )
    // Reset global End of Life and Life Expectancy settings
    setEndOfLife(defaultConfig.endOfLife)
    setLifeExpectancyTable(defaultConfig.lifeExpectancyTable)
    setCustomLifeExpectancy(defaultConfig.customLifeExpectancy)
    // Reset gender and couple planning settings
    setPlanningMode(defaultConfig.planningMode)
    setGender(defaultConfig.gender)
    setSpouse(defaultConfig.spouse)
    // Reset birth year helper settings
    setBirthYear(defaultConfig.birthYear)
    setExpectedLifespan(defaultConfig.expectedLifespan)
    setUseAutomaticCalculation(defaultConfig.useAutomaticCalculation)
    setWithdrawalConfig(null) // Reset withdrawal config to null
    setStatutoryPensionConfig(null) // Reset statutory pension config to null
    setCoupleStatutoryPensionConfig(null) // Reset couple statutory pension config to null
  }, [defaultConfig, setSparplanElemente])

  // Auto-save configuration whenever any config value changes
  useEffect(() => {
    saveCurrentConfiguration()
  }, [saveCurrentConfiguration])

  const performSimulation = useCallback(async (overwrite: { rendite?: number } = {}) => {
    setIsLoading(true)
    try {
      let returnConfig: ReturnConfiguration
      if (overwrite.rendite !== undefined) {
        returnConfig = { mode: 'fixed', fixedRate: overwrite.rendite / 100 }
      }
      else {
        if (returnMode === 'random') {
          returnConfig = {
            mode: 'random',
            randomConfig: {
              averageReturn: averageReturn / 100 || 0.07,
              standardDeviation: standardDeviation / 100 || 0.15,
              seed: randomSeed,
            },
          }
        }
        else if (returnMode === 'variable') {
          returnConfig = {
            mode: 'variable',
            variableConfig: {
              yearlyReturns: Object.fromEntries(
                Object.entries(variableReturns).map(([year, rate]) => [parseInt(year), rate / 100]),
              ),
            },
          }
        }
        else if (returnMode === 'historical') {
          returnConfig = {
            mode: 'historical',
            historicalConfig: {
              indexId: historicalIndex,
            },
          }
        }
        else {
          returnConfig = {
            mode: 'fixed',
            fixedRate: rendite / 100 || 0.05,
          }
        }
      }

      const result = simulate({
        startYear: yearToday,
        endYear: startEnd[0],
        elements: sparplanElemente,
        returnConfig,
        steuerlast: steuerlast / 100,
        simulationAnnual,
        teilfreistellungsquote: teilfreistellungsquote / 100,
        freibetragPerYear,
        steuerReduzierenEndkapital: steuerReduzierenEndkapitalSparphase, // Use savings phase setting
        basiszinsConfiguration,
        // Inflation settings for savings phase
        inflationAktivSparphase,
        inflationsrateSparphase,
        inflationAnwendungSparphase,
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
    returnMode, setReturnMode,
    averageReturn, setAverageReturn,
    standardDeviation, setStandardDeviation,
    randomSeed, setRandomSeed,
    variableReturns, setVariableReturns,
    historicalIndex, setHistoricalIndex,
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
  }), [
    rendite, steuerlast, teilfreistellungsquote, freibetragPerYear, basiszinsConfiguration,
    steuerReduzierenEndkapitalSparphase, steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv, grundfreibetragBetrag,
    returnMode, averageReturn, standardDeviation, randomSeed, variableReturns, historicalIndex,
    inflationAktivSparphase, inflationsrateSparphase, inflationAnwendungSparphase,
    startEnd, sparplan, simulationAnnual, sparplanElemente,
    endOfLife, lifeExpectancyTable, customLifeExpectancy, planningMode, gender, spouse,
    birthYear, expectedLifespan, useAutomaticCalculation,
    simulationData, isLoading, withdrawalResults, performSimulation,
    getCurrentConfiguration, saveCurrentConfiguration, loadSavedConfiguration, resetToDefaults,
    withdrawalConfig, statutoryPensionConfig, coupleStatutoryPensionConfig, setEndOfLifeRounded,
  ])

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}
