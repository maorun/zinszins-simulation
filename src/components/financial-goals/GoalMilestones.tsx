import { getNextMilestone, updateMilestoneAchievements } from '../../../helpers/financial-goals'
import { formatEuro } from './helpers'

/**
 * Goal milestones component
 */
export function GoalMilestones({
  goal,
  currentCapital,
}: {
  goal: ReturnType<typeof updateMilestoneAchievements>
  currentCapital: number
}) {
  const nextMilestone = getNextMilestone(currentCapital, goal)

  if (!goal.milestones || goal.milestones.length === 0) {
    return null
  }

  return (
    <div className="mt-3 pt-3 border-t border-gray-300">
      <h6 className="text-sm font-semibold text-gray-700 mb-2">Meilensteine</h6>
      <div className="space-y-1">
        {goal.milestones.map((milestone, idx) => (
          <div key={idx} className="flex justify-between items-center text-sm">
            <span className={milestone.achieved ? 'text-green-600 font-medium' : 'text-gray-600'}>
              {milestone.achieved && '✓ '}
              {milestone.label}
            </span>
            <span className={milestone.achieved ? 'text-green-600 font-medium' : 'text-gray-500'}>
              {formatEuro(milestone.targetAmount)}
            </span>
          </div>
        ))}
      </div>

      {nextMilestone && (
        <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
          <span className="font-semibold">Nächster Meilenstein: </span>
          <span>
            {nextMilestone.label} ({formatEuro(nextMilestone.targetAmount)})
          </span>
        </div>
      )}
    </div>
  )
}
