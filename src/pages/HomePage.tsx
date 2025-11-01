import { useRef } from 'react'
import { HomePageLayout } from '../components/HomePageLayout'

import { SimulationProvider } from '../contexts/SimulationContext'
import { NavigationProvider } from '../contexts/NavigationContext'
import { useHomePageLogic } from '../hooks/useHomePageLogic'

const HomePageContent = () => {
  const overviewRef = useRef<HTMLDivElement>(null)

  const {
    sparplan,
    setSparplan,
    sparplanElemente,
    startEnd,
    simulationData,
    isLoading,
    steuerlast,
    teilfreistellungsquote,
    simulationAnnual,
    freibetragPerYear,
    steuerReduzierenEndkapitalSparphase,
    inflationAktivSparphase,
    inflationsrateSparphase,
    inflationAnwendungSparphase,
    handleApplyScenario,
    returnConfig,
    handleRecalculate,
    handleSpecialEventsDispatch,
    phaseDateRanges,
  } = useHomePageLogic()

  return (
    <HomePageLayout
      overviewRef={overviewRef}
      handleRecalculate={handleRecalculate}
      handleApplyScenario={handleApplyScenario}
      startOfIndependence={startEnd[0]}
      simulationData={simulationData}
      sparplan={sparplan}
      setSparplan={setSparplan}
      handleSpecialEventsDispatch={handleSpecialEventsDispatch}
      {...phaseDateRanges}
      sparplanElemente={sparplanElemente}
      startEnd={startEnd}
      steuerlast={steuerlast}
      teilfreistellungsquote={teilfreistellungsquote}
      simulationAnnual={simulationAnnual}
      freibetragPerYear={freibetragPerYear}
      steuerReduzierenEndkapitalSparphase={steuerReduzierenEndkapitalSparphase}
      inflationAktivSparphase={inflationAktivSparphase}
      inflationsrateSparphase={inflationsrateSparphase}
      inflationAnwendungSparphase={inflationAnwendungSparphase}
      returnConfig={returnConfig}
      isLoading={isLoading}
    />
  )
}

export default function HomePage() {
  return (
    <SimulationProvider>
      <NavigationProvider>
        <HomePageContent />
      </NavigationProvider>
    </SimulationProvider>
  )
}
