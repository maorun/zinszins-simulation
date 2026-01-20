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
 * Goal header with icon, name, and badges
 */
function GoalHeader({ goal, isComplete, percentComplete, priorityColor }: {
  goal: CustomGoal
  isComplete: boolean
  percentComplete: number
  priorityColor: string
}) {
  return (
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
  )
}

/**
 * Progress details for incomplete goals
 */
function GoalProgressDetails({ progress }: { progress: CustomGoalProgress }) {
  const { goal, remainingAmount, estimatedYearToComplete, yearsRemaining, requiredMonthlySavings, requiredYearlySavings } = progress

  return (
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
  )
}

/**
 * Basic goal form fields (name and amount)
 */
function GoalBasicFields({ formData, onFormChange }: { formData: GoalFormData; onFormChange: (data: GoalFormData) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="goal-name">Zielname *</Label>
        <Input
          id="goal-name"
          value={formData.name}
          onChange={(e) => onFormChange({ ...formData, name: e.target.value })}
          placeholder="z.B. Eigenheim-Anzahlung"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-amount">Zielbetrag (€) *</Label>
        <Input
          id="goal-amount"
          type="number"
          value={formData.targetAmount}
          onChange={(e) => onFormChange({ ...formData, targetAmount: e.target.value })}
          placeholder="50000"
        />
      </div>
    </>
  )
}

/**
 * Category and priority selects
 */
function GoalCategoryPriorityFields({ formData, onFormChange }: { formData: GoalFormData; onFormChange: (data: GoalFormData) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="goal-category">Kategorie</Label>
        <select
          id="goal-category"
          value={formData.category}
          onChange={(e) => onFormChange({ ...formData, category: e.target.value as GoalCategory })}
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
          onChange={(e) => onFormChange({ ...formData, priority: e.target.value as GoalPriority })}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {Object.entries(PRIORITY_NAMES).map(([key, name]) => (
            <option key={key} value={key}>
              {name}
            </option>
          ))}
        </select>
      </div>
    </>
  )
}

/**
 * Date and description fields
 */
function GoalDateDescriptionFields({ formData, onFormChange }: { formData: GoalFormData; onFormChange: (data: GoalFormData) => void }) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="goal-date">Zieldatum (optional)</Label>
        <Input
          id="goal-date"
          type="date"
          value={formData.targetDate}
          onChange={(e) => onFormChange({ ...formData, targetDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal-description">Beschreibung (optional)</Label>
        <Input
          id="goal-description"
          value={formData.description}
          onChange={(e) => onFormChange({ ...formData, description: e.target.value })}
          placeholder="Optionale Beschreibung"
        />
      </div>
    </>
  )
}

/**
 * Goal form input fields
 */
function GoalFormFields({ formData, onFormChange }: { formData: GoalFormData; onFormChange: (data: GoalFormData) => void }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <GoalBasicFields formData={formData} onFormChange={onFormChange} />
      <GoalCategoryPriorityFields formData={formData} onFormChange={onFormChange} />
      <GoalDateDescriptionFields formData={formData} onFormChange={onFormChange} />
    </div>
  )
}

/**
 * Goal creation/edit form
 */
function GoalForm({
  formData,
  isEditing,
  onFormChange,
  onSubmit,
  onCancel,
}: {
  formData: GoalFormData
  isEditing: boolean
  onFormChange: (data: GoalFormData) => void
  onSubmit: () => void
  onCancel: () => void
}) {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
      <GoalFormFields formData={formData} onFormChange={onFormChange} />
      <div className="flex gap-2">
        <Button onClick={onSubmit} className="flex-1">
          <Check className="h-4 w-4 mr-1" />
          {isEditing ? 'Aktualisieren' : 'Erstellen'}
        </Button>
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="h-4 w-4 mr-1" />
          Abbrechen
        </Button>
      </div>
    </div>
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
  const { goal, percentComplete, isComplete } = progress
  const progressColor = getProgressColor(isComplete, percentComplete)
  const priorityColor = getPriorityColor(goal.priority)

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <GoalHeader goal={goal} isComplete={isComplete} percentComplete={percentComplete} priorityColor={priorityColor} />

      {/* Progress bar */}
      <div className="space-y-1">
        <Progress value={percentComplete} className={`h-2 ${progressColor}`} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(progress.currentAmount)}</span>
          <span>Ziel: {formatCurrency(goal.targetAmount)}</span>
        </div>
      </div>

      {!isComplete && <GoalProgressDetails progress={progress} />}

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
 * Delete confirmation dialog
 */
function DeleteConfirmDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm mx-4 space-y-4">
        <h3 className="font-semibold text-lg">Ziel löschen?</h3>
        <p className="text-sm text-muted-foreground">Möchten Sie dieses Ziel wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
        <div className="flex gap-2">
          <Button onClick={onConfirm} variant="destructive" className="flex-1">
            Löschen
          </Button>
          <Button onClick={onCancel} variant="outline" className="flex-1">
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Goals summary stats
 */
function GoalsSummary({ goals, completedCount, inProgressCount }: {
  goals: CustomGoal[]
  completedCount: number
  inProgressCount: number
}) {
  return (
    <div className="pt-4 border-t text-sm text-muted-foreground">
      <div className="flex justify-between">
        <span>Gesamt: {goals.length} Ziel{goals.length !== 1 ? 'e' : ''}</span>
        <span>
          {completedCount} erreicht • {inProgressCount} in Arbeit
        </span>
      </div>
    </div>
  )
}

/**
 * Validate goal form data
 */
function validateGoalForm(formData: GoalFormData): boolean {
  if (!formData.name || !formData.targetAmount) return false
  const targetAmount = parseFloat(formData.targetAmount)
  return !isNaN(targetAmount) && targetAmount > 0
}

/**
 * Create goal data from form
 */
function getGoalDataFromForm(formData: GoalFormData) {
  return {
    targetAmount: parseFloat(formData.targetAmount),
    targetDate: formData.targetDate ? new Date(formData.targetDate) : undefined,
    name: formData.name,
    priority: formData.priority,
    category: formData.category,
    description: formData.description || undefined,
  }
}

/**
 * Create form data from goal
 */
function getFormDataFromGoal(goal: CustomGoal): GoalFormData {
  return {
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    targetDate: goal.targetDate ? goal.targetDate.toISOString().split('T')[0] : '',
    priority: goal.priority,
    category: goal.category,
    description: goal.description || '',
  }
}

/**
 * Hook for goal form management
 */
function useGoalForm(setGoals: (goals: CustomGoal[]) => void) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingGoal, setEditingGoal] = useState<CustomGoal | null>(null)
  const [formData, setFormData] = useState<GoalFormData>(emptyForm)

  const handleSubmit = () => {
    if (!validateGoalForm(formData)) return

    const goalData = getGoalDataFromForm(formData)

    if (editingGoal) {
      const updated = updateCustomGoalInStorage(editingGoal.id, goalData)
      setGoals(updated)
      setEditingGoal(null)
    } else {
      const newGoal = createCustomGoal(goalData.name, goalData.targetAmount, {
        description: goalData.description,
        targetDate: goalData.targetDate,
        priority: goalData.priority,
        category: goalData.category,
      })
      const updated = addCustomGoal(newGoal)
      setGoals(updated)
      setIsCreating(false)
    }
    setFormData(emptyForm)
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingGoal(null)
    setFormData(emptyForm)
  }

  const handleEdit = (goal: CustomGoal) => {
    setEditingGoal(goal)
    setFormData(getFormDataFromGoal(goal))
  }

  return { isCreating, setIsCreating, editingGoal, formData, setFormData, handleSubmit, handleCancel, handleEdit }
}

/**
 * Hook for goal deletion
 */
function useGoalDelete(setGoals: (goals: CustomGoal[]) => void) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDelete = (goalId: string) => setDeleteConfirm(goalId)

  const confirmDelete = () => {
    if (deleteConfirm) {
      const updated = deleteCustomGoal(deleteConfirm)
      setGoals(updated)
      setDeleteConfirm(null)
    }
  }

  const cancelDelete = () => setDeleteConfirm(null)

  return { deleteConfirm, handleDelete, confirmDelete, cancelDelete }
}

/**
 * Custom hook for goal management logic
 */
function useGoalManagement(initialGoals: CustomGoal[]) {
  const [goals, setGoals] = useState<CustomGoal[]>(initialGoals)
  const formHandlers = useGoalForm(setGoals)
  const deleteHandlers = useGoalDelete(setGoals)

  return { goals, ...formHandlers, ...deleteHandlers }
}

/**
 * Goals list or empty state
 */
function GoalsList({
  goals,
  isCreating,
  editingGoal,
  allProgress,
  onEdit,
  onDelete,
}: {
  goals: CustomGoal[]
  isCreating: boolean
  editingGoal: CustomGoal | null
  allProgress: CustomGoalProgress[]
  onEdit: (goal: CustomGoal) => void
  onDelete: (goalId: string) => void
}) {
  if (goals.length === 0 && !isCreating && !editingGoal) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="mb-2">Noch keine benutzerdefinierten Ziele erstellt.</p>
        <p className="text-sm">Klicken Sie auf "Neues Ziel", um Ihr erstes Sparziel zu erstellen.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {allProgress.map((progress) => (
        <GoalItem key={progress.goal.id} progress={progress} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}

/**
 * Get header components based on nesting level
 */
function getHeaderComponents(nestingLevel: number) {
  if (nestingLevel === 0) {
    return { Header: CardHeader, Title: CardTitle, Description: CardDescription, isNested: false }
  }
  return { Header: 'div' as const, Title: 'h3' as const, Description: 'p' as const, isNested: true }
}

/**
 * Card header with conditional styling
 */
function GoalCardHeader({
  nestingLevel,
  isCreating,
  editingGoal,
  onNewGoal,
}: {
  nestingLevel: number
  isCreating: boolean
  editingGoal: CustomGoal | null
  onNewGoal: () => void
}) {
  const { Header, Title, Description, isNested } = getHeaderComponents(nestingLevel)
  const showNewButton = !isCreating && !editingGoal

  return (
    <Header className={isNested ? 'px-6 py-4' : ''}>
      <div className="flex items-center justify-between">
        <div>
          <Title className={isNested ? 'text-lg font-semibold' : ''}>🎯 Benutzerdefinierte Sparziele</Title>
          <Description className={isNested ? 'text-sm text-muted-foreground' : ''}>
            Erstellen und verfolgen Sie Ihre persönlichen Finanzziele
          </Description>
        </div>
        {showNewButton && (
          <Button onClick={onNewGoal} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Neues Ziel
          </Button>
        )}
      </div>
    </Header>
  )
}

/**
 * Main custom goal tracker card component
 */
export function CustomGoalTrackerCard({ simulationData, nestingLevel = 0, expectedAnnualReturn = 0.05 }: CustomGoalTrackerCardProps) {
  const {
    goals,
    isCreating,
    setIsCreating,
    editingGoal,
    formData,
    setFormData,
    deleteConfirm,
    handleSubmit,
    handleCancel,
    handleEdit,
    handleDelete,
    confirmDelete,
    cancelDelete,
  } = useGoalManagement(loadCustomGoals())

  const allProgress = useMemo(() => {
    return calculateAllCustomGoalProgress(goals, simulationData, expectedAnnualReturn)
  }, [goals, simulationData, expectedAnnualReturn])

  const completedCount = allProgress.filter((p) => p.isComplete).length
  const inProgressCount = allProgress.filter((p) => !p.isComplete).length

  return (
    <Card>
      <GoalCardHeader nestingLevel={nestingLevel} isCreating={isCreating} editingGoal={editingGoal} onNewGoal={() => setIsCreating(true)} />

      <CardContent className="space-y-4">
        {(isCreating || editingGoal) && (
          <GoalForm formData={formData} isEditing={!!editingGoal} onFormChange={setFormData} onSubmit={handleSubmit} onCancel={handleCancel} />
        )}

        <GoalsList goals={goals} isCreating={isCreating} editingGoal={editingGoal} allProgress={allProgress} onEdit={handleEdit} onDelete={handleDelete} />

        {goals.length > 0 && <GoalsSummary goals={goals} completedCount={completedCount} inProgressCount={inProgressCount} />}

        {deleteConfirm && <DeleteConfirmDialog onConfirm={confirmDelete} onCancel={cancelDelete} />}
      </CardContent>
    </Card>
  )
}
