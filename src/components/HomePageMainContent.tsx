import { RefObject, useState } from 'react'
import { HomePageHeaderSection } from './HomePageHeaderSection'
import { HomePageOverviewSection } from './HomePageOverviewSection'
import { MainNavigation } from './MainNavigation'
import { WizardNavigation } from './WizardNavigation'
import { useHomePageLogic } from '../hooks/useHomePageLogic'
import { useAnalysisConfig } from '../hooks/useAnalysisConfig'
import { Button } from './ui/button'
import { ChevronLeft } from 'lucide-react'

interface HomePageMainContentProps {
  overviewRef: RefObject<HTMLDivElement | null>
}

export function HomePageMainContent({ overviewRef }: HomePageMainContentProps) {
  const { handleApplyScenario, handleRecalculate, phaseDateRanges } = useHomePageLogic()
  const { sensitivityConfig, returnConfig, simulationData, sparplanElemente } = useAnalysisConfig()
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <>
      <HomePageHeaderSection handleRecalculate={handleRecalculate} />

      <HomePageOverviewSection overviewRef={overviewRef} />

      {showAdvanced ? (
        <div className="space-y-2">
          {/* Back to wizard button */}
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(false)}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" />
              Zur einfachen Ansicht
            </Button>
          </div>
          <MainNavigation
            handleApplyScenario={handleApplyScenario}
            startOfIndependence={phaseDateRanges.savingsStartYear}
            sensitivityConfig={sensitivityConfig}
            returnConfig={returnConfig}
            hasSimulationData={!!simulationData && !!sparplanElemente && sparplanElemente.length > 0}
          />
        </div>
      ) : (
        <WizardNavigation onSwitchToAdvanced={() => setShowAdvanced(true)} />
      )}
    </>
  )
}
