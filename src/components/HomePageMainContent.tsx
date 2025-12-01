import { RefObject } from 'react'
import { HomePageHeaderSection } from './HomePageHeaderSection'
import { HomePageOverviewSection } from './HomePageOverviewSection'
import { MainNavigation } from './MainNavigation'
import { useHomePageLogic } from '../hooks/useHomePageLogic'
import { useAnalysisConfig } from '../hooks/useAnalysisConfig'

interface HomePageMainContentProps {
  overviewRef: RefObject<HTMLDivElement | null>
}

export function HomePageMainContent({ overviewRef }: HomePageMainContentProps) {
  const { handleApplyScenario, handleRecalculate, phaseDateRanges } = useHomePageLogic()
  const { sensitivityConfig, returnConfig, simulationData, sparplanElemente } = useAnalysisConfig()

  return (
    <>
      <HomePageHeaderSection handleRecalculate={handleRecalculate} />

      <HomePageOverviewSection overviewRef={overviewRef} />

      {/* Main Navigation with Three Sections */}
      <MainNavigation
        handleApplyScenario={handleApplyScenario}
        startOfIndependence={phaseDateRanges.savingsStartYear}
        sensitivityConfig={sensitivityConfig}
        returnConfig={returnConfig}
        hasSimulationData={!!simulationData && !!sparplanElemente && sparplanElemente.length > 0}
      />
    </>
  )
}
