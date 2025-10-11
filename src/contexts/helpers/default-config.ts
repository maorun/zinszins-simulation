import { type BasiszinsConfiguration } from '../../services/bundesbank-api'
import { SimulationAnnual } from '../../utils/simulate'
import { initialSparplan } from '../../utils/sparplan-utils'
import type { ReturnMode } from '../../utils/random-returns'

export interface DefaultConfigType {
  rendite: number
  steuerlast: number
  teilfreistellungsquote: number
  freibetragPerYear: { [year: number]: number }
  basiszinsConfiguration: BasiszinsConfiguration
  steuerReduzierenEndkapitalSparphase: boolean
  steuerReduzierenEndkapitalEntspharphase: boolean
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
  personalTaxRate: number
  guenstigerPruefungAktiv: boolean
  returnMode: ReturnMode
  averageReturn: number
  standardDeviation: number
  randomSeed: undefined
  variableReturns: Record<number, number>
  historicalIndex: string
  inflationAktivSparphase: boolean
  inflationsrateSparphase: number
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  startEnd: [number, number]
  sparplan: typeof initialSparplan[]
  simulationAnnual: typeof SimulationAnnual.monthly
  endOfLife: number
  lifeExpectancyTable: 'german_2020_22' | 'german_male_2020_22' | 'german_female_2020_22' | 'custom'
  customLifeExpectancy: undefined
  planningMode: 'individual' | 'couple'
  gender: 'male' | 'female'
  spouse: { birthYear: number, gender: 'male' | 'female' }
  birthYear: number
  expectedLifespan: number
  useAutomaticCalculation: boolean
}

/**
 * Create default configuration with historical Basiszins rates
 */
export function createDefaultConfiguration(): DefaultConfigType {
  return {
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
    // Personal income tax rate for Günstigerprüfung (default: 25% - typical middle income tax rate)
    personalTaxRate: 25,
    // Günstigerprüfung settings (automatic tax optimization: Abgeltungssteuer vs personal income tax)
    guenstigerPruefungAktiv: true,
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
  }
}
