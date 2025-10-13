import { prepareVariableInflationRates } from '../../helpers/simulation-helpers'

export interface InflationParams {
  inflationScenarioRates: Record<number, number> | null
  inflationAktivSparphase: boolean
  inflationsrateSparphase: number
  yearToday: number
  endYear: number
}

export function prepareInflationRates(params: InflationParams): Record<number, number> | undefined {
  return prepareVariableInflationRates(
    params.inflationScenarioRates,
    params.inflationAktivSparphase,
    params.inflationsrateSparphase,
    params.yearToday,
    params.endYear,
  )
}
