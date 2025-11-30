import { RefObject } from 'react'
import { HomePageHeaderSection } from './HomePageHeaderSection'
import { HomePageOverviewSection } from './HomePageOverviewSection'
import { HomePageSpecialEvents } from './HomePageSpecialEvents'
import { BehavioralFinanceInsights } from './BehavioralFinanceInsights'
import { TutorialManager } from './TutorialManager'
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

      {/* Interactive Tutorials - Collapsible Card */}
      <TutorialManager />

      <HomePageOverviewSection overviewRef={overviewRef} />

      {/* Special Events - Black Swan, Risk Events */}
      <HomePageSpecialEvents />

      {/* Main Navigation with Three Sections */}
      <MainNavigation
        handleApplyScenario={handleApplyScenario}
        startOfIndependence={phaseDateRanges.savingsStartYear}
        sensitivityConfig={sensitivityConfig}
        returnConfig={returnConfig}
        hasSimulationData={!!simulationData && !!sparplanElemente && sparplanElemente.length > 0}
      />

      {/* Behavioral Finance Insights - Educational Section */}
      <BehavioralFinanceInsights />
    </>
  )
}
