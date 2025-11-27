import type { BasiszinsConfiguration } from '../../services/bundesbank-api'
import type { ReturnMode } from '../../utils/random-returns'
import type { Sparplan, SparplanElement } from '../../utils/sparplan-utils'
import type { SimulationAnnualType } from '../../utils/simulate'
import type { StatutoryPensionConfig, CoupleStatutoryPensionConfig } from '../../../helpers/statutory-pension'
import type { CareCostConfiguration } from '../../../helpers/care-cost-simulation'
import type { FinancialGoal } from '../../../helpers/financial-goals'
import type { EmergencyFundConfig } from '../../../helpers/emergency-fund'
import type { WithdrawalConfiguration } from '../../utils/config-storage'
import type { MultiAssetPortfolioConfig } from '../../../helpers/multi-asset-portfolio'
import type { AssetClass } from '../../../helpers/asset-class'
import type { TermLifeInsuranceConfig } from '../../../helpers/term-life-insurance'
import type { AlimonyConfig } from '../../../helpers/alimony'

/**
 * Extended SparplanElement with additional fields for simulation results
 */
export type ExtendedSparplanElement = SparplanElement & {
  gesamtkapitalNachSteuern: number
}

/**
 * Simulation result data structure
 * Using flexible typing to maintain backward compatibility with existing code
 * that expects various additional fields on simulation elements
 */
export interface SimulationData {
  sparplanElements: SparplanElement[]
  data?: ExtendedSparplanElement[] // Legacy compatibility - some components expect this alias with additional fields
}

/**
 * Extended SavedConfiguration with optional fields properly typed
 */
export interface ExtendedSavedConfiguration {
  rendite: number
  steuerlast: number
  teilfreistellungsquote: number
  freibetragPerYear: { [year: number]: number }
  basiszinsConfiguration?: BasiszinsConfiguration
  steuerReduzierenEndkapitalSparphase?: boolean
  steuerReduzierenEndkapitalEntspharphase?: boolean
  grundfreibetragAktiv?: boolean
  grundfreibetragBetrag?: number
  personalTaxRate?: number
  guenstigerPruefungAktiv?: boolean
  kirchensteuerAktiv?: boolean
  kirchensteuersatz?: number
  assetClass?: AssetClass
  customTeilfreistellungsquote?: number
  returnMode: ReturnMode
  averageReturn: number
  standardDeviation: number
  randomSeed?: number
  variableReturns: Record<number, number>
  historicalIndex?: string
  multiAssetConfig?: MultiAssetPortfolioConfig
  withdrawalMultiAssetConfig?: MultiAssetPortfolioConfig
  inflationAktivSparphase?: boolean
  inflationsrateSparphase?: number
  inflationAnwendungSparphase?: 'sparplan' | 'gesamtmenge'
  startEnd: [number, number]
  sparplan: Sparplan[]
  simulationAnnual: SimulationAnnualType
  endOfLife?: number
  lifeExpectancyTable?: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  customLifeExpectancy?: number
  planningMode?: 'individual' | 'couple'
  gender?: 'male' | 'female'
  spouse?: { birthYear?: number; gender: 'male' | 'female' }
  birthYear?: number
  expectedLifespan?: number
  useAutomaticCalculation?: boolean
  withdrawal?: WithdrawalConfiguration
  statutoryPensionConfig?: StatutoryPensionConfig
  coupleStatutoryPensionConfig?: CoupleStatutoryPensionConfig
  careCostConfiguration?: CareCostConfiguration
  financialGoals?: FinancialGoal[]
  emergencyFundConfig?: EmergencyFundConfig
  termLifeInsuranceConfig?: TermLifeInsuranceConfig
  alimonyConfig?: AlimonyConfig
}

/**
 * Default configuration interface
 */
export interface DefaultConfiguration {
  basiszinsConfiguration: BasiszinsConfiguration
  personalTaxRate: number
  guenstigerPruefungAktiv: boolean
  historicalIndex: string
  inflationAktivSparphase: boolean
  inflationsrateSparphase: number
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  planningMode: 'individual' | 'couple'
  expectedLifespan: number
}

/**
 * State setters interface for configuration loading
 */
export interface ConfigurationSetters {
  setRendite: (value: number) => void
  setSteuerlast: (value: number) => void
  setTeilfreistellungsquote: (value: number) => void
  setFreibetragPerYear: (value: { [year: number]: number }) => void
  setBasiszinsConfiguration: (value: BasiszinsConfiguration) => void
  setSteuerReduzierenEndkapitalSparphase: (value: boolean) => void
  setSteuerReduzierenEndkapitalEntspharphase: (value: boolean) => void
  setGrundfreibetragAktiv: (value: boolean) => void
  setGrundfreibetragBetrag: (value: number) => void
  setPersonalTaxRate: (value: number) => void
  setGuenstigerPruefungAktiv: (value: boolean) => void
  setAssetClass: (value: AssetClass) => void
  setCustomTeilfreistellungsquote: (value: number) => void
  setReturnMode: (value: ReturnMode) => void
  setAverageReturn: (value: number) => void
  setStandardDeviation: (value: number) => void
  setRandomSeed: (value: number | undefined) => void
  setVariableReturns: (value: Record<number, number>) => void
  setHistoricalIndex: (value: string) => void
  setInflationAktivSparphase: (value: boolean) => void
  setInflationsrateSparphase: (value: number) => void
  setInflationAnwendungSparphase: (value: 'sparplan' | 'gesamtmenge') => void
  setStartEnd: (value: [number, number]) => void
  setSparplan: (value: Sparplan[]) => void
  setSimulationAnnual: (value: SimulationAnnualType) => void
  setSparplanElemente: (value: SparplanElement[]) => void
  setEndOfLife: (value: number) => void
  setLifeExpectancyTable: (value: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom') => void
  setCustomLifeExpectancy: (value: number | undefined) => void
  setPlanningMode: (value: 'individual' | 'couple') => void
  setGender: (value: 'male' | 'female' | undefined) => void
  setSpouse: (value: { birthYear?: number; gender: 'male' | 'female' } | undefined) => void
  setBirthYear: (value: number | undefined) => void
  setExpectedLifespan: (value: number | undefined) => void
  setUseAutomaticCalculation: (value: boolean) => void
  setWithdrawalConfig: (value: WithdrawalConfiguration | null) => void
  setStatutoryPensionConfig: (value: StatutoryPensionConfig | null) => void
  setCoupleStatutoryPensionConfig: (value: CoupleStatutoryPensionConfig | null) => void
  setCareCostConfiguration: (value: CareCostConfiguration) => void
  setFinancialGoals: (value: FinancialGoal[]) => void
  setEmergencyFundConfig: (value: EmergencyFundConfig) => void
  setAlimonyConfig: (value: AlimonyConfig) => void
}
