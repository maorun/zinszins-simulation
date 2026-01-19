/**
 * Custom Goal Tracker Card Component
 *
 * Allows users to create, manage, and track custom financial goals with:
 * - User-defined target amounts and dates
 * - Priority levels and categories
 * - Progress visualization
 * - Required savings calculations
 * - localStorage persistence
 */

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Progress } from './ui/progress'
import { Badge } from './ui/badge'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'
import { formatCurrency } from '../utils/currency'
import {
  loadCustomGoals,
  addCustomGoal,
  updateCustomGoalInStorage,
  deleteCustomGoal,
  calculateAllCustomGoalProgress,
  createCustomGoal,
  GOAL_CATEGORY_ICONS,
  GOAL_CATEGORY_NAMES,
  PRIORITY_NAMES,
  type CustomGoal,
  type GoalCategory,
  type GoalPriority,
  type CustomGoalProgress,
} from '../utils/custom-goals'
import type { SimulationData } from '../contexts/helpers/config-types'

interface CustomGoalTrackerCardProps {
  simulationData: SimulationData | null
  nestingLevel?: number
  expectedAnnualReturn?: number
}

/**
 * Goal form for creating/editing goals
 */
interface GoalFormData {
  name: string
  targetAmount: string
  targetDate: string
  priority: GoalPriority
  category: GoalCategory
  description: string
}

const emptyForm: GoalFormData = {
  name: '',
  targetAmount: '',
  targetDate: '',
  priority: 'medium',
  category: 'custom',
  description: '',
}

/**
 * Helper to get progress color based on completion
 */
function getProgressColor(isComplete: boolean, percentComplete: number): string {
  if (isComplete) return 'bg-green-600'
  if (percentComplete >= 75) return 'bg-blue-600'
  if (percentComplete >= 50) return 'bg-yellow-600'
  return 'bg-gray-500'
}

/**
 * Helper to get priority color classes
 */
function getPriorityColor(priority: GoalPriority): string {
  const colorMap: Record<GoalPriority, string> = {
    high: 'bg-red-100 text-red-800 border-red-200',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    low: 'bg-gray-100 text-gray-800 border-gray-200',
  }
  return colorMap[priority]
}

/**
 * Helper to format estimated completion year
 */
function formatEstimatedYear(year: number, yearsRemaining: number) {
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
}

/**
 * Individual goal progress item
 */
function GoalItem({
  progress,
  onEdit,
  onDelete,
}: {
  progress: CustomGoalProgress
  onEdit: (goal: CustomGoal) => void
  onDelete: (goalId: string) => void
}) {
  const { goal, percentComplete, isComplete, remainingAmount, estimatedYearToComplete, yearsRemaining, requiredMonthlySavings, requiredYearlySavings } = progress

  const progressColor = getProgressColor(isComplete, percentComplete)
  const priorityColor = getPriorityColor(goal.priority)

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-2xl flex-shrink-0">{GOAL_CATEGORY_ICONS[goal.category]}</span>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm sm:text-base truncate">{goal.name}</h4>
            {goal.description && <p className="text-xs sm:text-sm text-muted-foreground">{goal.description}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              {GOAL_CATEGORY_NAMES[goal.category]} • {PRIORITY_NAMES[goal.priority]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Badge variant={isComplete ? 'default' : 'secondary'}>{isComplete ? 'Erreicht! ✓' : `${percentComplete.toFixed(0)}%`}</Badge>
          <Badge variant="outline" className={priorityColor}>
            {PRIORITY_NAMES[goal.priority]}
          </Badge>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <Progress value={percentComplete} className={`h-2 ${progressColor}`} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(progress.currentAmount)}</span>
          <span>Ziel: {formatCurrency(goal.targetAmount)}</span>
        </div>
      </div>

      {/* Additional info */}
      {!isComplete && (
        <div className="space-y-1 text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Noch benötigt:</span> {formatCurrency(remainingAmount)}
          </div>

          {goal.targetDate && requiredMonthlySavings !== undefined && requiredYearlySavings !== undefined && (
            <div>
              <span className="font-medium">Erforderliche Sparrate:</span> {formatCurrency(requiredMonthlySavings)}/Monat oder{' '}
              {formatCurrency(requiredYearlySavings)}/Jahr
            </div>
          )}

          {goal.targetDate && (
            <div>
              <span className="font-medium">Zieldatum:</span> {new Date(goal.targetDate).toLocaleDateString('de-DE')}
            </div>
          )}

          {estimatedYearToComplete && yearsRemaining !== undefined && (
            <div>
              <span className="font-medium">Geschätzte Erreichung:</span> {formatEstimatedYear(estimatedYearToComplete, yearsRemaining)}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => onEdit(goal)} className="flex-1">
          <Edit2 className="h-3 w-3 mr-1" />
          Bearbeiten
        </Button>
        <Button variant="outline" size="sm" onClick={() => onDelete(goal.id)} className="text-red-600 hover:bg-red-50">
          <Trash2 className="h-3 w-3 mr-1" />
          Löschen
        </Button>
      </div>
    </div>
  )
}

/**
 * Main custom goal tracker card component
 */
export function CustomGoalTrackerCard({ simulationData, nestingLevel = 0, expectedAnnualReturn = 0.05 }: CustomGoalTrackerCardProps) {
  const [goals, setGoals] = useState<CustomGoal[]>(() => loadCustomGoals())
  const [isCreating, setIsCreating] = useState(false)
  const [editingGoal, setEditingGoal] = useState<CustomGoal | null>(null)
  const [formData, setFormData] = useState<GoalFormData>(emptyForm)

  // Calculate progress for all goals
  const allProgress = useMemo(() => {
    return calculateAllCustomGoalProgress(goals, simulationData, expectedAnnualReturn)
  }, [goals, simulationData, expectedAnnualReturn])

  // Handle form submission
  const handleSubmit = () => {
    const validation = validateForm()
    if (validation.error) {
      return
    }

    if (editingGoal) {
      updateExistingGoal()
    } else {
      createNewGoal()
    }

    resetForm()
  }

  const validateForm = (): { error: boolean } => {
    if (!formData.name || !formData.targetAmount) {
      // TODO: Replace with toast notification in future
      return { error: true }
    }

    const targetAmount = parseFloat(formData.targetAmount)
    if (isNaN(targetAmount) || targetAmount <= 0) {
      // TODO: Replace with toast notification in future
      return { error: true }
    }

    return { error: false }
  }

  const updateExistingGoal = () => {
    if (!editingGoal) return

    const targetAmount = parseFloat(formData.targetAmount)
    const targetDate = formData.targetDate ? new Date(formData.targetDate) : undefined

    const updated = updateCustomGoalInStorage(editingGoal.id, {
      name: formData.name,
      targetAmount,
      targetDate,
      priority: formData.priority,
      category: formData.category,
      description: formData.description || undefined,
    })
    setGoals(updated)
    setEditingGoal(null)
  }

  const createNewGoal = () => {
    const targetAmount = parseFloat(formData.targetAmount)
    const targetDate = formData.targetDate ? new Date(formData.targetDate) : undefined

    const newGoal = createCustomGoal(formData.name, targetAmount, {
      description: formData.description || undefined,
      targetDate,
      priority: formData.priority,
      category: formData.category,
    })
    const updated = addCustomGoal(newGoal)
    setGoals(updated)
    setIsCreating(false)
  }

  const resetForm = () => {
    setFormData(emptyForm)
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingGoal(null)
    setFormData(emptyForm)
  }

  const handleEdit = (goal: CustomGoal) => {
    setEditingGoal(goal)
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      targetDate: goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : '',
      priority: goal.priority,
      category: goal.category,
      description: goal.description || '',
    })
  }

  const handleDelete = (goalId: string) => {
    // TODO: Replace with proper modal confirmation in future
    // Using a simple approach for now to avoid additional dependencies
    const shouldDelete = window.confirm('Möchten Sie dieses Ziel wirklich löschen?')
    if (shouldDelete) {
      const updated = deleteCustomGoal(goalId)
      setGoals(updated)
    }
  }

  const Header = nestingLevel === 0 ? CardHeader : 'div'
  const Title = nestingLevel === 0 ? CardTitle : 'h3'
  const Description = nestingLevel === 0 ? CardDescription : 'p'

  return (
    <Card>
      <Header className={nestingLevel > 0 ? 'px-6 py-4' : ''}>
        <div className="flex items-center justify-between">
          <div>
            <Title className={nestingLevel > 0 ? 'text-lg font-semibold' : ''}>🎯 Benutzerdefinierte Sparziele</Title>
            <Description className={nestingLevel > 0 ? 'text-sm text-muted-foreground' : ''}>
              Erstellen und verfolgen Sie Ihre persönlichen Finanzziele
            </Description>
          </div>
          {!isCreating && !editingGoal && (
            <Button onClick={() => setIsCreating(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Neues Ziel
            </Button>
          )}
        </div>
      </Header>

      <CardContent className="space-y-4">
        {/* Goal form */}
        {(isCreating || editingGoal) && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-name">Zielname *</Label>
                <Input
                  id="goal-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Eigenheim-Anzahlung"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-amount">Zielbetrag (€) *</Label>
                <Input
                  id="goal-amount"
                  type="number"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  placeholder="50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-category">Kategorie</Label>
                <select
                  id="goal-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as GoalCategory })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.entries(GOAL_CATEGORY_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>
                      {GOAL_CATEGORY_ICONS[key as GoalCategory]} {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-priority">Priorität</Label>
                <select
                  id="goal-priority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as GoalPriority })}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  {Object.entries(PRIORITY_NAMES).map(([key, name]) => (
                    <option key={key} value={key}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-date">Zieldatum (optional)</Label>
                <Input
                  id="goal-date"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goal-description">Beschreibung (optional)</Label>
                <Input
                  id="goal-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optionale Beschreibung"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex-1">
                <Check className="h-4 w-4 mr-1" />
                {editingGoal ? 'Aktualisieren' : 'Erstellen'}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="flex-1">
                <X className="h-4 w-4 mr-1" />
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {/* Goals list */}
        {goals.length === 0 && !isCreating && !editingGoal ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-2">Noch keine benutzerdefinierten Ziele erstellt.</p>
            <p className="text-sm">Klicken Sie auf "Neues Ziel", um Ihr erstes Sparziel zu erstellen.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allProgress.map((progress) => (
              <GoalItem key={progress.goal.id} progress={progress} onEdit={handleEdit} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Summary */}
        {goals.length > 0 && (
          <div className="pt-4 border-t text-sm text-muted-foreground">
            <div className="flex justify-between">
              <span>Gesamt: {goals.length} Ziel{goals.length !== 1 ? 'e' : ''}</span>
              <span>
                {allProgress.filter((p) => p.isComplete).length} erreicht • {allProgress.filter((p) => !p.isComplete).length} in Arbeit
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
