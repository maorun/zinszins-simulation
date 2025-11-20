import { RefObject } from 'react'
import { HomePageHeaderSection } from './HomePageHeaderSection'
import { HomePageConfigurationSection } from './HomePageConfigurationSection'
import { HomePageAnalysisSection } from './HomePageAnalysisSection'
import { HomePageOverviewSection } from './HomePageOverviewSection'
import { HomePageSpecialEvents } from './HomePageSpecialEvents'
import { BehavioralFinanceInsights } from './BehavioralFinanceInsights'
import { TutorialManager } from './TutorialManager'
import { useHomePageLogic } from '../hooks/useHomePageLogic'

interface HomePageMainContentProps {
  overviewRef: RefObject<HTMLDivElement | null>
}

export function HomePageMainContent({ overviewRef }: HomePageMainContentProps) {
  const { handleApplyScenario, handleRecalculate, phaseDateRanges } = useHomePageLogic()

  return (
    <>
      <HomePageHeaderSection handleRecalculate={handleRecalculate} />

      {/* Interactive Tutorials - Collapsible Card */}
      <TutorialManager />

      <HomePageOverviewSection overviewRef={overviewRef} />

      <HomePageConfigurationSection
        handleApplyScenario={handleApplyScenario}
        startOfIndependence={phaseDateRanges.savingsStartYear}
      />

      <HomePageSpecialEvents />

      <HomePageAnalysisSection />

      {/* Behavioral Finance Insights - Educational Section */}
      <BehavioralFinanceInsights />
    </>
  )
}
