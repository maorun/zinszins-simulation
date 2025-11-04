import { updateMilestoneAchievements } from '../../../helpers/financial-goals'
import { Alert, AlertDescription } from '../ui/alert'
import { GoalItem } from './GoalItem'

interface GoalListProps {
  goals: Array<ReturnType<typeof updateMilestoneAchievements>>
  currentCapital: number
  onToggleActive: (goalId: string) => void
  onRemove: (goalId: string) => void
}

/**
 * Component for displaying a list of financial goals
 */
export function GoalList({ goals, currentCapital, onToggleActive, onRemove }: GoalListProps) {
  if (goals.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          <p className="text-gray-600 italic text-center py-4">
            Noch keine Finanzziele definiert. Fügen Sie oben ein Ziel hinzu.
          </p>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      {goals.map(goal => (
        <GoalItem
          key={goal.id}
          goal={goal}
          currentCapital={currentCapital}
          onToggleActive={onToggleActive}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}
