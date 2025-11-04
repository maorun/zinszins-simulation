import { useCallback, useMemo } from 'react'
import { Target } from 'lucide-react'
import { useSimulation } from '../contexts/useSimulation'
import { createDefaultGoal, updateMilestoneAchievements } from '../../helpers/financial-goals'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { GoalForm } from './financial-goals/GoalForm'
import { GoalList } from './financial-goals/GoalList'
import { CurrentCapitalDisplay } from './financial-goals/CurrentCapitalDisplay'

/**
 * Financial Goals Configuration Component
 * Allows users to set and track financial goals with milestones
 */
export default function FinancialGoalsConfiguration() {
  const { financialGoals = [], setFinancialGoals, simulationData } = useSimulation()

  const currentCapital = useMemo(() => {
    if (!simulationData?.data || simulationData.data.length === 0) return 0
    const lastEntry = simulationData.data[simulationData.data.length - 1]
    return lastEntry?.gesamtkapitalNachSteuern || 0
  }, [simulationData])

  const handleAddGoal = useCallback((newGoal: ReturnType<typeof createDefaultGoal>) => {
    setFinancialGoals([...financialGoals, newGoal])
  }, [financialGoals, setFinancialGoals])

  const handleRemoveGoal = useCallback((goalId: string) => {
    setFinancialGoals(financialGoals.filter(g => g.id !== goalId))
  }, [financialGoals, setFinancialGoals])

  const handleToggleActive = useCallback((goalId: string) => {
    setFinancialGoals(financialGoals.map(g => (g.id === goalId ? { ...g, active: !g.active } : g)))
  }, [financialGoals, setFinancialGoals])

  const goalsWithUpdatedMilestones = useMemo(
    () => financialGoals.map(goal => updateMilestoneAchievements(currentCapital, goal)),
    [financialGoals, currentCapital],
  )

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>
        <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
          <Target className="w-5 h-5 sm:w-6 sm:h-6" />
          Finanzziele
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Setzen Sie SMART-Ziele und verfolgen Sie Ihren Fortschritt
        </p>
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <div className="space-y-6">
          <CurrentCapitalDisplay currentCapital={currentCapital} />
          <GoalForm onAddGoal={handleAddGoal} />
          <GoalList
            goals={goalsWithUpdatedMilestones}
            currentCapital={currentCapital}
            onToggleActive={handleToggleActive}
            onRemove={handleRemoveGoal}
          />
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
