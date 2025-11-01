import { RefObject } from 'react'
import { HomePageMainContent } from './HomePageMainContent'
import { HomePageStickyAndFooter } from './HomePageStickyAndFooter'
import type { SimulationData } from '../contexts/helpers/config-types'
import type { SimulationAnnualType } from '../utils/simulate'
import type { Sparplan, SparplanElement } from '../utils/sparplan-utils'
import type { ReturnConfiguration } from '../utils/random-returns'
import type { FinancialScenario } from '../data/scenarios'

interface HomePageLayoutProps {
  overviewRef: RefObject<HTMLDivElement | null>
  handleRecalculate: () => void
  handleApplyScenario: (scenario: FinancialScenario) => void
  startOfIndependence: number
  simulationData: SimulationData | null
  sparplan: Sparplan[]
  setSparplan: (sparplan: Sparplan[]) => void
  handleSpecialEventsDispatch: (sparplan: Sparplan[]) => void
  savingsStartYear: number
  savingsEndYear: number
  withdrawalStartYear: number
  withdrawalEndYear: number
  sparplanElemente: SparplanElement[]
  startEnd: [number, number]
  steuerlast: number
  teilfreistellungsquote: number
  simulationAnnual: SimulationAnnualType
  freibetragPerYear: { [key: number]: number }
  steuerReduzierenEndkapitalSparphase: boolean
  inflationAktivSparphase: boolean
  inflationsrateSparphase: number
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  returnConfig: ReturnConfiguration
  isLoading: boolean
}

export function HomePageLayout(props: HomePageLayoutProps) {
  return (
    <div className="px-2 sm:px-3 mx-auto max-w-full md:px-4 md:max-w-3xl lg:px-6 lg:max-w-5xl xl:max-w-7xl space-y-4">
      <HomePageMainContent
        overviewRef={props.overviewRef}
        handleRecalculate={props.handleRecalculate}
        handleApplyScenario={props.handleApplyScenario}
        startOfIndependence={props.startOfIndependence}
        simulationData={props.simulationData}
        sparplan={props.sparplan}
        setSparplan={props.setSparplan}
        handleSpecialEventsDispatch={props.handleSpecialEventsDispatch}
        savingsStartYear={props.savingsStartYear}
        savingsEndYear={props.savingsEndYear}
        withdrawalStartYear={props.withdrawalStartYear}
        withdrawalEndYear={props.withdrawalEndYear}
        sparplanElemente={props.sparplanElemente}
        startEnd={props.startEnd}
        steuerlast={props.steuerlast}
        teilfreistellungsquote={props.teilfreistellungsquote}
        simulationAnnual={props.simulationAnnual}
        freibetragPerYear={props.freibetragPerYear}
        steuerReduzierenEndkapitalSparphase={props.steuerReduzierenEndkapitalSparphase}
        inflationAktivSparphase={props.inflationAktivSparphase}
        inflationsrateSparphase={props.inflationsrateSparphase}
        inflationAnwendungSparphase={props.inflationAnwendungSparphase}
        returnConfig={props.returnConfig}
      />

      <HomePageStickyAndFooter overviewRef={props.overviewRef} isLoading={props.isLoading} />
    </div>
  )
}
