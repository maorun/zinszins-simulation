import { useMemo } from 'react'
import { Target, TrendingUp, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { useSimulation } from '../contexts/useSimulation'
import {
  type FinancialGoal,
  calculateGoalProgress,
  isGoalAchieved,
  getNextMilestone,
  updateMilestoneAchievements,
  calculateAmountRemaining,
} from '../../helpers/financial-goals'
import { formatCurrency } from '../utils/currency'

/**
 * Progress bar component for goal progress visualization
 */
function KPIProgressBar({ progress }: { progress: number }) {
  const clampedProgress = Math.min(progress, 100)
  const isComplete = progress >= 100

  return (
    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-300 ${
          isComplete ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-blue-500 to-blue-600'
        }`}
        style={{ width: `${clampedProgress}%` }}
      />
    </div>
  )
}

/**
 * Header section of goal KPI card
 */
function GoalCardHeader({ goalName, achieved }: { goalName: string; achieved: boolean }) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-blue-600" />
        <h4 className="font-semibold text-gray-900">{goalName}</h4>
      </div>
      {achieved && (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
          <Award className="h-3 w-3" />
          Erreicht
        </div>
      )}
    </div>
  )
}

/**
 * Progress section of goal KPI card
 */
function GoalProgressSection({ progress }: { progress: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Fortschritt</span>
        <span className="font-semibold text-gray-900">{progress.toFixed(1)}%</span>
      </div>
      <KPIProgressBar progress={progress} />
    </div>
  )
}

/**
 * Amounts section of goal KPI card
 */
function GoalAmountsSection({ currentAmount, targetAmount }: { currentAmount: number; targetAmount: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 text-xs">
      <div>
        <div className="text-gray-500 mb-1">Aktuell</div>
        <div className="font-semibold text-gray-900">{formatCurrency(currentAmount)}</div>
      </div>
      <div>
        <div className="text-gray-500 mb-1">Ziel</div>
        <div className="font-semibold text-gray-900">{formatCurrency(targetAmount)}</div>
      </div>
    </div>
  )
}

/**
 * Individual KPI card for a single financial goal
 */
interface GoalKPICardProps {
  goalName: string
  currentAmount: number
  targetAmount: number
  progress: number
  achieved: boolean
  nextMilestone?: {
    targetAmount: number
    label: string
  }
  amountRemaining: number
}

function GoalKPICard({
  goalName,
  currentAmount,
  targetAmount,
  progress,
  achieved,
  nextMilestone,
  amountRemaining,
}: GoalKPICardProps) {
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <GoalCardHeader goalName={goalName} achieved={achieved} />
      <div className="space-y-3">
        <GoalProgressSection progress={progress} />
        <GoalAmountsSection currentAmount={currentAmount} targetAmount={targetAmount} />

        {!achieved && amountRemaining > 0 && (
          <div className="pt-2 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-1">Noch benötigt</div>
            <div className="text-sm font-semibold text-orange-600">{formatCurrency(amountRemaining)}</div>
          </div>
        )}

        {!achieved && nextMilestone && (
          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
              <TrendingUp className="h-3 w-3" />
              Nächster Meilenstein
            </div>
            <div className="text-sm font-medium text-blue-600">{nextMilestone.label}</div>
            <div className="text-xs text-gray-600">{formatCurrency(nextMilestone.targetAmount)}</div>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Hook to get current capital from simulation data
 */
function useCurrentCapital() {
  const { simulationData } = useSimulation()

  return useMemo(() => {
    if (!simulationData?.data || simulationData.data.length === 0) return 0
    const lastEntry = simulationData.data[simulationData.data.length - 1]
    return lastEntry?.gesamtkapitalNachSteuern || 0
  }, [simulationData])
}

/**
 * Hook to calculate goal metrics
 */
function useGoalMetrics(activeGoals: FinancialGoal[], currentCapital: number) {
  return useMemo(() => {
    return activeGoals.map(goal => {
      const updatedGoal = updateMilestoneAchievements(currentCapital, goal)
      const progress = calculateGoalProgress(currentCapital, goal)
      const achieved = isGoalAchieved(currentCapital, goal)
      const nextMilestone = getNextMilestone(currentCapital, updatedGoal)
      const amountRemaining = calculateAmountRemaining(currentCapital, goal)

      return {
        goal: updatedGoal,
        progress,
        achieved,
        nextMilestone,
        amountRemaining,
      }
    })
  }, [activeGoals, currentCapital])
}

/**
 * Financial Goals KPI Dashboard Component
 * Displays active financial goals with progress tracking
 */
export function FinancialGoalsKPIDashboard() {
  const { financialGoals = [] } = useSimulation()
  const currentCapital = useCurrentCapital()

  const activeGoals = useMemo(() => financialGoals.filter(goal => goal.active), [financialGoals])
  const goalsWithMetrics = useGoalMetrics(activeGoals, currentCapital)

  if (activeGoals.length === 0) {
    return null
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Target className="h-5 w-5" />
          Finanzziele - Fortschritt
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">Aktueller Stand: {formatCurrency(currentCapital)}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goalsWithMetrics.map(({ goal, progress, achieved, nextMilestone, amountRemaining }) => (
            <GoalKPICard
              key={goal.id}
              goalName={goal.name}
              currentAmount={currentCapital}
              targetAmount={goal.targetAmount}
              progress={progress}
              achieved={achieved}
              nextMilestone={nextMilestone}
              amountRemaining={amountRemaining}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
