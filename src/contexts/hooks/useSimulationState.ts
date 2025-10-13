import { useState } from 'react'
import type { ReturnMode } from '../../utils/random-returns'
import { convertSparplanToElements, type Sparplan, type SparplanElement } from '../../utils/sparplan-utils'
import type { WithdrawalResult } from '../../../helpers/withdrawal'
import type { SavedConfiguration, WithdrawalConfiguration } from '../../utils/config-storage'
import type { BasiszinsConfiguration } from '../../services/bundesbank-api'
import { convertLegacyToCoupleConfig, type StatutoryPensionConfig, type CoupleStatutoryPensionConfig } from '../../../helpers/statutory-pension'
import { createDefaultCareCostConfiguration, type CareCostConfiguration } from '../../../helpers/care-cost-simulation'
import type { FinancialGoal } from '../../../helpers/financial-goals'
import type { SimulationAnnualType } from '../../utils/simulate'
import type { ExtendedSavedConfiguration, SimulationData } from '../helpers/config-types'
import { createFallbackMultiAssetConfig, createFallbackWithdrawalConfig } from '../helpers/multi-asset-defaults'

export interface SimulationStateConfig {
  initialConfig: SavedConfiguration
  extendedInitialConfig: ExtendedSavedConfiguration
  defaultConfig: import('../helpers/default-config').DefaultConfigType
}

export function useSimulationState(config: SimulationStateConfig) {
  const { initialConfig, extendedInitialConfig, defaultConfig } = config

  // Basic financial configuration
  const [rendite, setRendite] = useState(initialConfig.rendite)
  const [steuerlast, setSteuerlast] = useState(initialConfig.steuerlast)
  const [teilfreistellungsquote, setTeilfreistellungsquote] = useState(initialConfig.teilfreistellungsquote)
  const [freibetragPerYear, setFreibetragPerYear] = useState<{ [year: number]: number }>(
    initialConfig.freibetragPerYear,
  )
  const [basiszinsConfiguration, setBasiszinsConfiguration] = useState<BasiszinsConfiguration>(
    extendedInitialConfig.basiszinsConfiguration || defaultConfig.basiszinsConfiguration,
  )

  // Tax configuration
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

  // Return configuration
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
      const { createDefaultMultiAssetConfig } = require('../../../helpers/multi-asset-portfolio')
      return extendedInitialConfig.multiAssetConfig || createDefaultMultiAssetConfig()
    }
    catch {
      return extendedInitialConfig.multiAssetConfig || createFallbackMultiAssetConfig()
    }
  })

  // Multi-asset portfolio state for withdrawal phase (more conservative defaults)
  const [withdrawalMultiAssetConfig, setWithdrawalMultiAssetConfig] = useState(() => {
    try {
      const { createDefaultMultiAssetConfig } = require('../../../helpers/multi-asset-portfolio')
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

  // Savings plan state
  const [startEnd, setStartEnd] = useState<[number, number]>(initialConfig.startEnd)
  const [sparplan, setSparplan] = useState<Sparplan[]>(initialConfig.sparplan)
  const [simulationAnnual, setSimulationAnnual] = useState<SimulationAnnualType>(initialConfig.simulationAnnual)
  const [sparplanElemente, setSparplanElemente] = useState<SparplanElement[]>(
    convertSparplanToElements(initialConfig.sparplan, initialConfig.startEnd, initialConfig.simulationAnnual),
  )

  // Life expectancy state
  const [endOfLife, setEndOfLife] = useState(
    extendedInitialConfig.endOfLife ?? initialConfig.startEnd[1],
  )
  const [lifeExpectancyTable, setLifeExpectancyTable] = useState<'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'>(
    extendedInitialConfig.lifeExpectancyTable ?? defaultConfig.lifeExpectancyTable,
  )
  const [customLifeExpectancy, setCustomLifeExpectancy] = useState<number | undefined>(
    extendedInitialConfig.customLifeExpectancy,
  )

  // Planning mode state
  const [planningMode, setPlanningMode] = useState<'individual' | 'couple'>(
    extendedInitialConfig.planningMode ?? defaultConfig.planningMode,
  )
  const [gender, setGender] = useState<'male' | 'female' | undefined>(
    extendedInitialConfig.gender,
  )
  const [spouse, setSpouse] = useState<{ birthYear?: number, gender: 'male' | 'female' } | undefined>(
    extendedInitialConfig.spouse,
  )
  const [birthYear, setBirthYear] = useState<number | undefined>(
    extendedInitialConfig.birthYear,
  )
  const [expectedLifespan, setExpectedLifespan] = useState<number | undefined>(
    extendedInitialConfig.expectedLifespan ?? defaultConfig.expectedLifespan,
  )
  const [useAutomaticCalculation, setUseAutomaticCalculation] = useState<boolean>(
    extendedInitialConfig.useAutomaticCalculation ?? true,
  )

  // Simulation data state
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

  // Couple statutory pension configuration state
  const [coupleStatutoryPensionConfig, setCoupleStatutoryPensionConfig]
    = useState<CoupleStatutoryPensionConfig | null>(() => {
      const legacyConfig = (initialConfig as SavedConfiguration).statutoryPensionConfig
      const currentPlanningMode = extendedInitialConfig.planningMode || defaultConfig.planningMode
      if (legacyConfig && !(initialConfig as SavedConfiguration).coupleStatutoryPensionConfig) {
        return convertLegacyToCoupleConfig(legacyConfig, currentPlanningMode)
      }
      return (initialConfig as SavedConfiguration).coupleStatutoryPensionConfig || null
    })

  // Care cost configuration state
  const [careCostConfiguration, setCareCostConfiguration] = useState<CareCostConfiguration>(() => {
    const savedConfig = (initialConfig as SavedConfiguration).careCostConfiguration
    if (savedConfig) {
      return savedConfig
    }
    return createDefaultCareCostConfiguration()
  })

  // Financial goals state
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>(
    (initialConfig as SavedConfiguration).financialGoals || [],
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
    returnMode,
    setReturnMode,
    averageReturn,
    setAverageReturn,
    standardDeviation,
    setStandardDeviation,
    randomSeed,
    setRandomSeed,
    variableReturns,
    setVariableReturns,
    historicalIndex,
    setHistoricalIndex,
    blackSwanReturns,
    setBlackSwanReturns,
    blackSwanEventName,
    setBlackSwanEventName,
    inflationScenarioRates,
    setInflationScenarioRates,
    inflationScenarioReturnModifiers,
    setInflationScenarioReturnModifiers,
    inflationScenarioName,
    setInflationScenarioName,
    multiAssetConfig,
    setMultiAssetConfig,
    withdrawalMultiAssetConfig,
    setWithdrawalMultiAssetConfig,
    inflationAktivSparphase,
    setInflationAktivSparphase,
    inflationsrateSparphase,
    setInflationsrateSparphase,
    inflationAnwendungSparphase,
    setInflationAnwendungSparphase,
    startEnd,
    setStartEnd,
    sparplan,
    setSparplan,
    simulationAnnual,
    setSimulationAnnual,
    sparplanElemente,
    setSparplanElemente,
    endOfLife,
    setEndOfLife,
    lifeExpectancyTable,
    setLifeExpectancyTable,
    customLifeExpectancy,
    setCustomLifeExpectancy,
    planningMode,
    setPlanningMode,
    gender,
    setGender,
    spouse,
    setSpouse,
    birthYear,
    setBirthYear,
    expectedLifespan,
    setExpectedLifespan,
    useAutomaticCalculation,
    setUseAutomaticCalculation,
    simulationData,
    setSimulationData,
    isLoading,
    setIsLoading,
    withdrawalResults,
    setWithdrawalResults,
    withdrawalConfig,
    setWithdrawalConfig,
    statutoryPensionConfig,
    setStatutoryPensionConfig,
    coupleStatutoryPensionConfig,
    setCoupleStatutoryPensionConfig,
    careCostConfiguration,
    setCareCostConfiguration,
    financialGoals,
    setFinancialGoals,
  }
}
