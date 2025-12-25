import { useMemo } from 'react'
import { Check, Trash2, X } from 'lucide-react'
import { calculateGoalProgress, isGoalAchieved, updateMilestoneAchievements } from '../../../helpers/financial-goals'
import { analyzeGoalAdjustments } from '../../../helpers/goal-adjustments'
import { Button } from '../ui/button'
import { GoalProgressBar } from './GoalProgressBar'
import { GoalMilestones } from './GoalMilestones'
import { GoalAdjustmentRecommendations } from './GoalAdjustmentRecommendations'
import { formatEuro, getGoalTypeLabel } from './helpers'

interface GoalItemProps {
  goal: ReturnType<typeof updateMilestoneAchievements>
  currentCapital: number
  onToggleActive: (goalId: string) => void
  onRemove: (goalId: string) => void
  monthlySavingsRate?: number
  expectedReturn?: number
  currentYear?: number
}

/**
 * Hook to analyze goal and generate recommendations
 */
function useGoalAnalysis(
  goal: ReturnType<typeof updateMilestoneAchievements>,
  currentCapital: number,
  monthlySavingsRate: number,
  expectedReturn: number,
  currentYear: number,
) {
  return useMemo(() => {
    if (!goal.active) return null
    
    return analyzeGoalAdjustments({
      goal,
      currentAmount: currentCapital,
      monthlySavingsRate,
      expectedReturn,
      currentYear,
    })
  }, [goal, currentCapital, monthlySavingsRate, expectedReturn, currentYear])
}

/**
 * Get border styling classes for goal card
 */
function getGoalCardClasses(active: boolean, achieved: boolean) {
  const borderClass = active ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
  const achievedClass = achieved ? 'border-green-500 bg-green-50' : ''
  return `border rounded-lg p-4 ${borderClass} ${achievedClass}`
}

/**
 * Action buttons for goal item
 */
function GoalActions({ 
  goalId, 
  isActive, 
  onToggleActive, 
  onRemove 
}: { 
  goalId: string
  isActive: boolean
  onToggleActive: (id: string) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="flex gap-2">
      <Button
        onClick={() => onToggleActive(goalId)}
        variant="outline"
        size="sm"
        title={isActive ? 'Deaktivieren' : 'Aktivieren'}
      >
        {isActive ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      </Button>
      <Button onClick={() => onRemove(goalId)} variant="outline" size="sm" title="Löschen">
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  )
}

/**
 * Component for displaying a single financial goal
 */
export function GoalItem({ 
  goal, 
  currentCapital, 
  onToggleActive, 
  onRemove,
  monthlySavingsRate = 0,
  expectedReturn = 0.05,
  currentYear = new Date().getFullYear(),
}: GoalItemProps) {
  const progress = calculateGoalProgress(currentCapital, goal)
  const achieved = isGoalAchieved(currentCapital, goal)
  const cardClasses = getGoalCardClasses(goal.active, achieved)
  const analysis = useGoalAnalysis(goal, currentCapital, monthlySavingsRate, expectedReturn, currentYear)

  return (
    <div className={cardClasses}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h5 className="font-semibold text-lg">{goal.name}</h5>
            {achieved && <span className="text-green-600 text-xl">✅</span>}
          </div>
          <p className="text-sm text-gray-600">
            {getGoalTypeLabel(goal.type)} • Ziel: {formatEuro(goal.targetAmount)}
          </p>
        </div>
        <GoalActions 
          goalId={goal.id} 
          isActive={goal.active} 
          onToggleActive={onToggleActive} 
          onRemove={onRemove} 
        />
      </div>
      <GoalProgressBar progress={progress} achieved={achieved} />
      <GoalMilestones goal={goal} currentCapital={currentCapital} />
      
      {analysis && (
        <GoalAdjustmentRecommendations
          recommendations={analysis.recommendations}
          goalName={goal.name}
          onTrack={analysis.onTrack}
        />
      )}
    </div>
  )
}
