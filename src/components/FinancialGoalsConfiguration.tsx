import { useCallback, useMemo } from 'react'
import { Target } from 'lucide-react'
import { useSimulation } from '../contexts/useSimulation'
import { createDefaultGoal, updateMilestoneAchievements } from '../../helpers/financial-goals'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { CardDescription } from './ui/card'
import { GoalForm } from './financial-goals/GoalForm'
import { GoalList } from './financial-goals/GoalList'
import { CurrentCapitalDisplay } from './financial-goals/CurrentCapitalDisplay'

/**
 * Calculate average monthly savings from sparplan data
 */
function calculateMonthlySavings(sparplan: Array<{ einzahlung?: number }>) {
  if (sparplan.length === 0) return 0

  const totalAnnual = sparplan.reduce((total: number, plan) => {
    return total + (plan.einzahlung || 0)
  }, 0)

  return totalAnnual / 12
}

/**
 * Custom hook for financial goals logic
 */
function useFinancialGoals() {
  const { financialGoals = [], setFinancialGoals, simulationData, rendite, sparplan = [] } = useSimulation()

  const currentCapital = useMemo(() => {
    if (!simulationData?.data || simulationData.data.length === 0) return 0
    const lastEntry = simulationData.data[simulationData.data.length - 1]
    return lastEntry?.gesamtkapitalNachSteuern || 0
  }, [simulationData])

  const monthlySavingsRate = useMemo(() => calculateMonthlySavings(sparplan), [sparplan])
  const currentYear = useMemo(() => new Date().getFullYear(), [])

  const handleAddGoal = useCallback(
    (newGoal: ReturnType<typeof createDefaultGoal>) => {
      setFinancialGoals([...financialGoals, newGoal])
    },
    [financialGoals, setFinancialGoals],
  )

  const handleRemoveGoal = useCallback(
    (goalId: string) => {
      setFinancialGoals(financialGoals.filter(g => g.id !== goalId))
    },
    [financialGoals, setFinancialGoals],
  )

  const handleToggleActive = useCallback(
    (goalId: string) => {
      setFinancialGoals(financialGoals.map(g => (g.id === goalId ? { ...g, active: !g.active } : g)))
    },
    [financialGoals, setFinancialGoals],
  )

  const goalsWithUpdatedMilestones = useMemo(
    () => financialGoals.map(goal => updateMilestoneAchievements(currentCapital, goal)),
    [financialGoals, currentCapital],
  )

  return {
    currentCapital,
    monthlySavingsRate,
    expectedReturn: rendite,
    currentYear,
    handleAddGoal,
    handleRemoveGoal,
    handleToggleActive,
    goalsWithUpdatedMilestones,
  }
}

/**
 * Financial Goals Configuration Component
 * Allows users to set and track financial goals with milestones
 */
export default function FinancialGoalsConfiguration() {
  const {
    currentCapital,
    monthlySavingsRate,
    expectedReturn,
    currentYear,
    handleAddGoal,
    handleRemoveGoal,
    handleToggleActive,
    goalsWithUpdatedMilestones,
  } = useFinancialGoals()

  return (
    <CollapsibleCard>
      <CollapsibleCardHeader titleClassName="text-lg sm:text-xl font-bold flex items-center gap-2">
        <Target className="w-5 h-5 sm:w-6 sm:h-6" />
        Finanzziele
      </CollapsibleCardHeader>
      <CollapsibleCardContent>
        <div className="space-y-6">
          <CardDescription>Setzen Sie SMART-Ziele und verfolgen Sie Ihren Fortschritt</CardDescription>
          <CurrentCapitalDisplay currentCapital={currentCapital} />
          <GoalForm onAddGoal={handleAddGoal} />
          <GoalList
            goals={goalsWithUpdatedMilestones}
            currentCapital={currentCapital}
            onToggleActive={handleToggleActive}
            onRemove={handleRemoveGoal}
            monthlySavingsRate={monthlySavingsRate}
            expectedReturn={expectedReturn}
            currentYear={currentYear}
          />
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
