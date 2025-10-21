import { useCallback, useMemo, useState } from 'react'
import { Plus, Target, Trash2, Check, X } from 'lucide-react'
import { useSimulation } from '../contexts/useSimulation'
import {
  type FinancialGoalType,
  createDefaultGoal,
  calculateGoalProgress,
  updateMilestoneAchievements,
  getNextMilestone,
  isGoalAchieved,
} from '../../helpers/financial-goals'
import { Alert, AlertDescription } from './ui/alert'
import { Button } from './ui/button'
import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from './ui/collapsible-card'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { generateFormId } from '../utils/unique-id'

// Helper to format currency
function formatEuro(amount: number): string {
  return amount.toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

// Get goal type label
function getGoalTypeLabel(type: FinancialGoalType): string {
  const labels = {
    retirement: 'Altersvorsorge',
    independence: 'Finanzielle Unabhängigkeit',
    custom: 'Benutzerdefiniert',
  }
  return labels[type]
}

// Goal progress bar component
function GoalProgressBar({ progress, achieved }: { progress: number, achieved: boolean }) {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">Fortschritt</span>
        <span className="text-sm font-bold text-blue-600">
          {progress.toFixed(1)}
          %
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${achieved ? 'bg-green-500' : 'bg-blue-500'}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  )
}

// Goal milestones component
function GoalMilestones({
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
          <div
            key={idx}
            className="flex justify-between items-center text-sm"
          >
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
            {nextMilestone.label}
            {' '}
            (
            {formatEuro(nextMilestone.targetAmount)}
            )
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Financial Goals Configuration Component
 * Allows users to set and track financial goals with milestones
 */
export default function FinancialGoalsConfiguration() {
  const {
    financialGoals = [],
    setFinancialGoals,
    simulationData,
  } = useSimulation()

  const [newGoalName, setNewGoalName] = useState('')
  const [newGoalAmount, setNewGoalAmount] = useState('')
  const [newGoalType, setNewGoalType] = useState<FinancialGoalType>('retirement')

  // Get current capital from simulation data
  const currentCapital = useMemo(() => {
    if (!simulationData?.data || simulationData.data.length === 0) return 0
    // Get the capital from the last year in the savings phase
    const lastEntry = simulationData.data[simulationData.data.length - 1]
    return lastEntry?.gesamtkapitalNachSteuern || 0
  }, [simulationData])

  // Generate stable IDs for form elements
  const goalNameInputId = useMemo(() => generateFormId('financial-goals', 'goal-name'), [])
  const goalAmountInputId = useMemo(() => generateFormId('financial-goals', 'goal-amount'), [])
  const goalTypeSelectId = useMemo(() => generateFormId('financial-goals', 'goal-type'), [])

  /**
   * Add a new financial goal
   */
  const handleAddGoal = useCallback(() => {
    const amount = parseFloat(newGoalAmount)

    if (!newGoalName.trim()) {
      return
    }

    if (isNaN(amount) || amount <= 0) {
      return
    }

    const newGoal = createDefaultGoal(newGoalType, newGoalName, amount)

    setFinancialGoals([...financialGoals, newGoal])
    setNewGoalName('')
    setNewGoalAmount('')
    setNewGoalType('retirement')
  }, [newGoalName, newGoalAmount, newGoalType, financialGoals, setFinancialGoals])

  /**
   * Remove a goal
   */
  const handleRemoveGoal = useCallback((goalId: string) => {
    setFinancialGoals(financialGoals.filter(g => g.id !== goalId))
  }, [financialGoals, setFinancialGoals])

  /**
   * Toggle goal active status
   */
  const handleToggleActive = useCallback((goalId: string) => {
    setFinancialGoals(
      financialGoals.map(g =>
        (g.id === goalId ? { ...g, active: !g.active } : g)),
    )
  }, [financialGoals, setFinancialGoals])

  /**
   * Update goals with current milestone achievements
   */
  const goalsWithUpdatedMilestones = useMemo(() => {
    return financialGoals.map(goal =>
      updateMilestoneAchievements(currentCapital, goal),
    )
  }, [financialGoals, currentCapital])

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
          {/* Current capital display */}
          <Alert>
            <AlertDescription>
              <div className="flex justify-between items-center">
                <span className="font-semibold">Aktuelles Endkapital (Ansparphase):</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatEuro(currentCapital)}
                </span>
              </div>
            </AlertDescription>
          </Alert>

          {/* Add new goal form */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="font-semibold mb-3 text-gray-700">Neues Ziel hinzufügen</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor={goalTypeSelectId}>Zieltyp</Label>
                <select
                  id={goalTypeSelectId}
                  value={newGoalType}
                  onChange={e => setNewGoalType(e.target.value as FinancialGoalType)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="retirement">Altersvorsorge</option>
                  <option value="independence">Finanzielle Unabhängigkeit</option>
                  <option value="custom">Benutzerdefiniert</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor={goalNameInputId}>Zielname</Label>
                <Input
                  id={goalNameInputId}
                  type="text"
                  value={newGoalName}
                  onChange={e => setNewGoalName(e.target.value)}
                  placeholder="z.B. Früher Ruhestand"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={goalAmountInputId}>Zielbetrag (€)</Label>
                <Input
                  id={goalAmountInputId}
                  type="number"
                  value={newGoalAmount}
                  onChange={e => setNewGoalAmount(e.target.value)}
                  placeholder="500000"
                  min="0"
                  step="1000"
                />
              </div>
            </div>

            <Button
              onClick={handleAddGoal}
              className="mt-4 w-full md:w-auto"
              disabled={!newGoalName.trim() || !newGoalAmount}
            >
              <Plus className="w-4 h-4 mr-2" />
              Ziel hinzufügen
            </Button>
          </div>

          {/* Display existing goals */}
          {goalsWithUpdatedMilestones.length === 0 ? (
            <Alert>
              <AlertDescription>
                <p className="text-gray-600 italic text-center py-4">
                  Noch keine Finanzziele definiert. Fügen Sie oben ein Ziel hinzu.
                </p>
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {goalsWithUpdatedMilestones.map((goal) => {
                const progress = calculateGoalProgress(currentCapital, goal)
                const achieved = isGoalAchieved(currentCapital, goal)
                const borderClass = goal.active ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'
                const achievedClass = achieved ? 'border-green-500 bg-green-50' : ''

                return (
                  <div key={goal.id} className={`border rounded-lg p-4 ${borderClass} ${achievedClass}`}>
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
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleToggleActive(goal.id)}
                          variant="outline"
                          size="sm"
                          title={goal.active ? 'Deaktivieren' : 'Aktivieren'}
                        >
                          {goal.active ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </Button>
                        <Button onClick={() => handleRemoveGoal(goal.id)} variant="outline" size="sm" title="Löschen">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <GoalProgressBar progress={progress} achieved={achieved} />
                    <GoalMilestones goal={goal} currentCapital={currentCapital} />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
