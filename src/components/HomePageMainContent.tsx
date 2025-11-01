import { RefObject } from 'react'
import { HomePageHeaderSection } from './HomePageHeaderSection'
import { HomePageAnalysisSection } from './HomePageAnalysisSection'
import { HomePageOverviewSection } from './HomePageOverviewSection'
import { HomePageSpecialEvents } from './HomePageSpecialEvents'
import type { SimulationData } from '../contexts/helpers/config-types'
import type { SimulationAnnualType } from '../utils/simulate'
import type { Sparplan, SparplanElement } from '../utils/sparplan-utils'
import type { ReturnConfiguration } from '../utils/random-returns'
import type { FinancialScenario } from '../data/scenarios'

interface HomePageMainContentProps {
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
}

export function HomePageMainContent(props: HomePageMainContentProps) {
  return (
    <>
      <HomePageHeaderSection
        handleRecalculate={props.handleRecalculate}
        handleApplyScenario={props.handleApplyScenario}
        startOfIndependence={props.startOfIndependence}
      />

      <HomePageOverviewSection
        simulationData={props.simulationData}
        overviewRef={props.overviewRef}
      />

      <HomePageSpecialEvents
        sparplan={props.sparplan}
        setSparplan={props.setSparplan}
        handleSpecialEventsDispatch={props.handleSpecialEventsDispatch}
        savingsStartYear={props.savingsStartYear}
        savingsEndYear={props.savingsEndYear}
        withdrawalStartYear={props.withdrawalStartYear}
        withdrawalEndYear={props.withdrawalEndYear}
      />

      <HomePageAnalysisSection
        simulationData={props.simulationData}
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
    </>
  )
}
