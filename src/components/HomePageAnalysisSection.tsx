import DataExport from './DataExport'
import SimulationModeSelector from './SimulationModeSelector'
import SensitivityAnalysisDisplay from './SensitivityAnalysisDisplay'
import type { ReturnConfiguration } from '../utils/random-returns'
import type { SimulationAnnualType } from '../utils/simulate'
import type { SparplanElement } from '../utils/sparplan-utils'
import type { SimulationData } from '../contexts/helpers/config-types'

interface HomePageAnalysisSectionProps {
  simulationData: SimulationData | null
  sparplanElemente: SparplanElement[]
  startEnd: [number, number]
  steuerlast: number
  teilfreistellungsquote: number
  simulationAnnual: SimulationAnnualType
  freibetragPerYear: { [year: number]: number }
  steuerReduzierenEndkapitalSparphase: boolean
  inflationAktivSparphase: boolean
  inflationsrateSparphase: number
  inflationAnwendungSparphase: 'sparplan' | 'gesamtmenge'
  returnConfig: ReturnConfiguration
}

/**
 * Analysis and export section of the HomePage
 * Includes simulation mode selector, data export, and sensitivity analysis
 */
export function HomePageAnalysisSection({
  simulationData,
  sparplanElemente,
  startEnd,
  steuerlast,
  teilfreistellungsquote,
  simulationAnnual,
  freibetragPerYear,
  steuerReduzierenEndkapitalSparphase,
  inflationAktivSparphase,
  inflationsrateSparphase,
  inflationAnwendungSparphase,
  returnConfig,
}: HomePageAnalysisSectionProps) {
  return (
    <>
      <SimulationModeSelector />

      <DataExport />

      {/* Sensitivity Analysis */}
      {simulationData && sparplanElemente && sparplanElemente.length > 0 && (
        <SensitivityAnalysisDisplay
          config={{
            startYear: startEnd[0],
            endYear: startEnd[1],
            elements: sparplanElemente,
            steuerlast: steuerlast / 100,
            teilfreistellungsquote: teilfreistellungsquote / 100,
            simulationAnnual,
            freibetragPerYear,
            steuerReduzierenEndkapital: steuerReduzierenEndkapitalSparphase,
            inflationAktivSparphase,
            inflationsrateSparphase,
            inflationAnwendungSparphase,
          }}
          returnConfig={returnConfig}
        />
      )}
    </>
  )
}
