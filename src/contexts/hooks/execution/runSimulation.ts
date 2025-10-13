import { simulate, type SimulationAnnualType } from '../../../utils/simulate'
import type { ReturnConfiguration } from '../../../utils/random-returns'
import type { SparplanElement } from '../../../utils/sparplan-utils'
import type { BasiszinsConfiguration } from '../../../services/bundesbank-api'

export interface SimulationParams {
  yearToday: number
  endYear: number
  elements: SparplanElement[]
  returnConfig: ReturnConfiguration
  simulationAnnual: SimulationAnnualType
  steuerlast: number
  teilfreistellungsquote: number
  freibetragPerYear: { [year: number]: number }
  basiszinsConfiguration: BasiszinsConfiguration
  steuerReduzierenEndkapitalSparphase: boolean
  inflationAktivSparphase: boolean
  inflationsrateSparphase: number
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  variableInflationRates: Record<number, number>
  guenstigerPruefungAktiv: boolean
  personalTaxRate: number
}

export function runSimulation(params: SimulationParams) {
  return simulate({
    startYear: params.yearToday,
    endYear: params.endYear,
    elements: params.elements,
    returnConfig: params.returnConfig,
    steuerlast: params.steuerlast / 100,
    simulationAnnual: params.simulationAnnual,
    teilfreistellungsquote: params.teilfreistellungsquote / 100,
    freibetragPerYear: params.freibetragPerYear,
    steuerReduzierenEndkapital: params.steuerReduzierenEndkapitalSparphase,
    basiszinsConfiguration: params.basiszinsConfiguration,
    inflationAktivSparphase: params.inflationAktivSparphase,
    inflationsrateSparphase: params.inflationsrateSparphase,
    inflationAnwendungSparphase: params.inflationAnwendungSparphase,
    variableInflationRates: params.variableInflationRates,
    guenstigerPruefungAktiv: params.guenstigerPruefungAktiv,
    personalTaxRate: params.personalTaxRate,
  })
}
