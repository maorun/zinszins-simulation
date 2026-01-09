/**
 * Milestone Tracker Card Component
 *
 * Displays financial milestones with progress tracking and time estimates.
 * Provides visual motivation for users working towards their savings goals.
 */

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { formatCurrency } from '../utils/currency'
import {
  calculateAllMilestones,
  getNextMilestone,
  getRelevantMilestones,
  MILESTONE_TEMPLATES,
  type FinancialMilestone,
  type MilestoneProgress,
} from '../utils/milestone-tracker'
import type { SimulationData } from '../contexts/helpers/config-types'

interface MilestoneTrackerCardProps {
  simulationData: SimulationData | null
  nestingLevel?: number
  customMilestones?: FinancialMilestone[]
  showOnlyRelevant?: boolean
}

/**
 * Individual milestone progress item
 */
function MilestoneItem({ progress }: { progress: MilestoneProgress }) {
  const { milestone, percentComplete, isComplete, estimatedYearToComplete, yearsRemaining } = progress

  // Get appropriate color based on completion status
  const progressColor = useMemo(() => {
    if (isComplete) return 'bg-green-600'
    if (percentComplete >= 75) return 'bg-blue-600'
    if (percentComplete >= 50) return 'bg-yellow-600'
    return 'bg-gray-500'
  }, [isComplete, percentComplete])

  return (
    <div className="space-y-2 py-3 border-b last:border-b-0">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {milestone.icon && <span className="text-2xl flex-shrink-0">{milestone.icon}</span>}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm sm:text-base truncate">{milestone.name}</h4>
            <p className="text-xs sm:text-sm text-muted-foreground">{milestone.description}</p>
          </div>
        </div>
        <Badge variant={isComplete ? 'default' : 'secondary'} className="flex-shrink-0">
          {isComplete ? 'Erreicht! ✓' : `${percentComplete.toFixed(0)}%`}
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <Progress value={percentComplete} className={`h-2 ${progressColor}`} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(progress.currentAmount)}</span>
          <span>Ziel: {formatCurrency(milestone.targetAmount)}</span>
        </div>
      </div>

      {/* Time estimate */}
      {!isComplete && estimatedYearToComplete && yearsRemaining !== undefined && (
        <TimeEstimate year={estimatedYearToComplete} yearsRemaining={yearsRemaining} />
      )}
    </div>
  )
}

/**
 * Time estimate display component
 */
function TimeEstimate({ year, yearsRemaining }: { year: number; yearsRemaining: number }) {
  const displayText = useMemo(() => {
    if (yearsRemaining === 0) {
      return <span className="text-green-600 font-medium">Dieses Jahr ({year})</span>
    }
    if (yearsRemaining === 1) {
      return <span className="text-blue-600 font-medium">Nächstes Jahr ({year})</span>
    }
    return (
      <span>
        In ca. {yearsRemaining} Jahren ({year})
      </span>
    )
  }, [year, yearsRemaining])

  return (
    <div className="text-xs text-muted-foreground">
      <span className="font-medium">Geschätzte Erreichung:</span> {displayText}
    </div>
  )
}

/**
 * Next milestone stats display
 */
function NextMilestoneStats({ progress }: { progress: MilestoneProgress }) {
  const remainingAmount = progress.targetAmount - progress.currentAmount

  return (
    <>
      <Progress value={progress.percentComplete} className="h-3 bg-blue-600" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
        <div>
          <p className="text-muted-foreground">Aktuell:</p>
          <p className="font-semibold">{formatCurrency(progress.currentAmount)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Noch benötigt:</p>
          <p className="font-semibold text-blue-700">{formatCurrency(remainingAmount)}</p>
        </div>
      </div>
      {progress.estimatedYearToComplete && progress.yearsRemaining !== undefined && (
        <div className="pt-2 border-t border-blue-200">
          <p className="text-sm text-muted-foreground">
            <TimeEstimate year={progress.estimatedYearToComplete} yearsRemaining={progress.yearsRemaining} />
          </p>
        </div>
      )}
    </>
  )
}

/**
 * Next milestone highlight section
 */
function NextMilestoneSection({
  nextMilestone,
  simulationData,
}: {
  nextMilestone: FinancialMilestone
  simulationData: SimulationData | null
}) {
  const progress = useMemo(() => {
    if (!simulationData) return null
    const allProgress = calculateAllMilestones([nextMilestone], simulationData)
    return allProgress[0]
  }, [nextMilestone, simulationData])

  if (!progress) return null

  return (
    <Card nestingLevel={2} className="bg-blue-50 border-blue-200">
      <CardHeader nestingLevel={2}>
        <div className="flex items-center gap-2">
          {nextMilestone.icon && <span className="text-3xl">{nextMilestone.icon}</span>}
          <div>
            <CardTitle className="text-base sm:text-lg">Nächster Meilenstein</CardTitle>
            <CardDescription className="font-semibold text-blue-700">{nextMilestone.name}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent nestingLevel={2}>
        <div className="space-y-3">
          <NextMilestoneStats progress={progress} />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Completion celebration message
 */
function CompletionMessage() {
  return (
    <Card nestingLevel={2} className="bg-green-50 border-green-200">
      <CardContent nestingLevel={2} className="pt-4">
        <div className="text-center py-4">
          <span className="text-5xl">🌟</span>
          <h4 className="mt-2 font-semibold text-lg text-green-700">Glückwunsch!</h4>
          <p className="text-sm text-muted-foreground mt-1">
            Sie haben alle Meilensteine erreicht! Setzen Sie sich neue, größere Ziele.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Empty state message
 */
function EmptyStateMessage() {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <p className="text-sm">
        Konfigurieren Sie Ihren Sparplan, um Ihre Meilensteine zu sehen und Ihren Fortschritt zu verfolgen.
      </p>
    </div>
  )
}

/**
 * Milestone list component
 */
function MilestoneList({
  allProgress,
  showOnlyRelevant,
}: {
  allProgress: MilestoneProgress[]
  showOnlyRelevant: boolean
}) {
  return (
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-muted-foreground mb-3">
        {showOnlyRelevant ? 'Relevante Meilensteine' : 'Alle Meilensteine'}
      </h4>
      {allProgress.map((progress) => (
        <MilestoneItem key={progress.milestone.id} progress={progress} />
      ))}
    </div>
  )
}

/**
 * Main content area for the milestone tracker
 */
function MilestoneTrackerContent({
  nextMilestone,
  allProgress,
  showOnlyRelevant,
  simulationData,
}: {
  nextMilestone: FinancialMilestone | null
  allProgress: MilestoneProgress[]
  showOnlyRelevant: boolean
  simulationData: SimulationData | null
}) {
  if (allProgress.length === 0) {
    return <EmptyStateMessage />
  }

  return (
    <>
      {nextMilestone && <NextMilestoneSection nextMilestone={nextMilestone} simulationData={simulationData} />}
      {!nextMilestone && <CompletionMessage />}
      <MilestoneList allProgress={allProgress} showOnlyRelevant={showOnlyRelevant} />
    </>
  )
}

/**
 * Main Milestone Tracker Card Component
 */
export function MilestoneTrackerCard({
  simulationData,
  nestingLevel = 0,
  customMilestones,
  showOnlyRelevant = true,
}: MilestoneTrackerCardProps) {
  // Use custom milestones if provided, otherwise use templates
  const milestones = customMilestones?.length ? customMilestones : MILESTONE_TEMPLATES

  // Get milestones to display
  const milestonesToDisplay = useMemo(
    () => (showOnlyRelevant ? getRelevantMilestones(milestones, simulationData) : milestones),
    [milestones, simulationData, showOnlyRelevant]
  )

  // Calculate progress for all displayed milestones
  const allProgress = useMemo(
    () => calculateAllMilestones(milestonesToDisplay, simulationData),
    [milestonesToDisplay, simulationData]
  )

  // Get next milestone
  const nextMilestone = useMemo(() => getNextMilestone(milestones, simulationData), [milestones, simulationData])

  // Calculate statistics
  const stats = useMemo(() => {
    const completed = allProgress.filter((p) => p.isComplete).length
    return { total: allProgress.length, completed }
  }, [allProgress])

  return (
    <Card nestingLevel={nestingLevel}>
      <CardHeader nestingLevel={nestingLevel}>
        <CardTitle className="flex items-center gap-2">
          <span>🎯</span>
          <span>Finanzielle Meilensteine</span>
        </CardTitle>
        <CardDescription>
          Verfolgen Sie Ihren Fortschritt zu wichtigen Sparzielen
          {stats.completed > 0 && (
            <span className="block mt-1 text-green-600 font-medium">
              {stats.completed} von {stats.total} Meilensteinen erreicht!
            </span>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent nestingLevel={nestingLevel}>
        <div className="space-y-4">
          <MilestoneTrackerContent
            nextMilestone={nextMilestone}
            allProgress={allProgress}
            showOnlyRelevant={showOnlyRelevant}
            simulationData={simulationData}
          />
        </div>
      </CardContent>
    </Card>
  )
}
