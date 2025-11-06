import { Check, Trash2, X } from 'lucide-react'
import { calculateGoalProgress, isGoalAchieved, updateMilestoneAchievements } from '../../../helpers/financial-goals'
import { Button } from '../ui/button'
import { GoalProgressBar } from './GoalProgressBar'
import { GoalMilestones } from './GoalMilestones'
import { formatEuro, getGoalTypeLabel } from './helpers'

interface GoalItemProps {
  goal: ReturnType<typeof updateMilestoneAchievements>
  currentCapital: number
  onToggleActive: (goalId: string) => void
  onRemove: (goalId: string) => void
}

/**
 * Component for displaying a single financial goal
 */
export function GoalItem({ goal, currentCapital, onToggleActive, onRemove }: GoalItemProps) {
  const progress = calculateGoalProgress(currentCapital, goal)
  const achieved = isGoalAchieved(currentCapital, goal)
  const borderClass = goal.active ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
  const achievedClass = achieved ? 'border-green-500 bg-green-50' : ''

  return (
    <div className={`border rounded-lg p-4 ${borderClass} ${achievedClass}`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h5 className="font-semibold text-lg">{goal.name}</h5>
            {achieved && <span className="text-green-600 text-xl">✅</span>}
          </div>
          <p className="text-sm text-gray-600">
            {getGoalTypeLabel(goal.type)} • Ziel:
            {formatEuro(goal.targetAmount)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onToggleActive(goal.id)}
            variant="outline"
            size="sm"
            title={goal.active ? 'Deaktivieren' : 'Aktivieren'}
          >
            {goal.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </Button>
          <Button onClick={() => onRemove(goal.id)} variant="outline" size="sm" title="Löschen">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <GoalProgressBar progress={progress} achieved={achieved} />
      <GoalMilestones goal={goal} currentCapital={currentCapital} />
    </div>
  )
}
