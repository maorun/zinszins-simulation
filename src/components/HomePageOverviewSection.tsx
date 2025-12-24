import { RefObject } from 'react'
import { EnhancedOverview } from './EnhancedOverview'
import { RetirementReadinessScore } from './RetirementReadinessScore'
import { CollapsibleCardHeader, CollapsibleCardContent } from './ui/collapsible-card'
import { Card } from './ui/card'
import { Collapsible } from './ui/collapsible'
import { useSimulation } from '../contexts/useSimulation'
import { useOverviewYearRanges } from '../hooks/useOverviewYearRanges'

interface HomePageOverviewSectionProps {
  overviewRef: RefObject<HTMLDivElement | null>
}

export function HomePageOverviewSection({ overviewRef }: HomePageOverviewSectionProps) {
  const {
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    withdrawalConfig,
    endOfLife,
  } = useSimulation()

  const { enhancedSummary, withdrawalEndYear } = useOverviewYearRanges(
    simulationData,
    startEnd,
    withdrawalResults,
    rendite,
    steuerlast,
    teilfreistellungsquote,
    withdrawalConfig,
    endOfLife,
  )

  if (!simulationData) return null

  const planningYears = withdrawalEndYear - (startEnd[0] + 1)

  return (
    <div ref={overviewRef} data-section="overview" className="my-3 sm:my-4 space-y-4">
      <EnhancedOverview />

      {/* Retirement-Readiness Score - shown when withdrawal phase is active */}
      {enhancedSummary && withdrawalResults && planningYears > 0 && (
        <Collapsible defaultOpen={false}>
          <Card>
            <CollapsibleCardHeader>🎯 Retirement-Readiness Score</CollapsibleCardHeader>
            <CollapsibleCardContent>
              <RetirementReadinessScore
                enhancedSummary={enhancedSummary}
                withdrawalResult={withdrawalResults}
                planningYears={planningYears}
                lifeExpectancy={25}
                nestingLevel={1}
              />
            </CollapsibleCardContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
}
