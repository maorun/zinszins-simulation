import type { ReturnMode } from '../../utils/random-returns'
import type { Sparplan, SparplanElement } from '../../utils/sparplan-utils'
import type { SimulationAnnualType } from '../../utils/simulate'
import type { WithdrawalResult } from '../../../helpers/withdrawal'
import type { SavedConfiguration, WithdrawalConfiguration } from '../../utils/config-storage'
import type { BasiszinsConfiguration } from '../../services/bundesbank-api'
import type { StatutoryPensionConfig, CoupleStatutoryPensionConfig } from '../../../helpers/statutory-pension'
import type { CareCostConfiguration } from '../../../helpers/care-cost-simulation'
import type { FinancialGoal } from '../../../helpers/financial-goals'
import type { SimulationData } from './config-types'

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
  multiAssetConfig: import('../../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig
  setMultiAssetConfig: (config: import('../../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig) => void
  // Multi-asset portfolio configuration for withdrawal phase
  withdrawalMultiAssetConfig: import('../../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig
  setWithdrawalMultiAssetConfig: (config: import('../../../helpers/multi-asset-portfolio').MultiAssetPortfolioConfig) => void
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
