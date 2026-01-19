/**
 * Custom Goal Tracking Utility
 *
 * Provides functionality for user-defined financial goals with localStorage persistence.
 * Extends the predefined milestone tracker with custom, user-configurable goals.
 *
 * Features:
 * - User-defined custom goals with names, target amounts, and dates
 * - Priority levels (High/Medium/Low)
 * - Goal categories with icons (Home, Car, Retirement, Travel, Emergency, etc.)
 * - Progress calculation based on simulation data
 * - Required additional savings rate calculation
 * - Multiple goals management
 * - localStorage persistence (privacy-first)
 * - Integration with existing milestone tracker
 */

import type { SimulationData } from '../contexts/helpers/config-types'
import { getCurrentCapital } from './milestone-tracker'

/**
 * Goal priority levels
 */
export type GoalPriority = 'high' | 'medium' | 'low'

/**
 * Goal categories with semantic meaning
 */
export type GoalCategory = 'home' | 'car' | 'retirement' | 'travel' | 'emergency' | 'education' | 'custom'

/**
 * Icon mapping for goal categories
 */
export const GOAL_CATEGORY_ICONS: Record<GoalCategory, string> = {
  home: '🏠',
  car: '🚗',
  retirement: '🏖️',
  travel: '✈️',
  emergency: '🛡️',
  education: '🎓',
  custom: '🎯',
}

/**
 * German display names for goal categories
 */
export const GOAL_CATEGORY_NAMES: Record<GoalCategory, string> = {
  home: 'Eigenheim',
  car: 'Auto',
  retirement: 'Ruhestand',
  travel: 'Reise',
  emergency: 'Notfallfonds',
  education: 'Bildung',
  custom: 'Sonstiges',
}

/**
 * German display names for priorities
 */
export const PRIORITY_NAMES: Record<GoalPriority, string> = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Niedrig',
}

/**
 * Custom goal definition
 */
export interface CustomGoal {
  id: string
  name: string
  description?: string
  targetAmount: number
  targetDate?: Date
  priority: GoalPriority
  category: GoalCategory
  createdAt: Date
  updatedAt: Date
}

/**
 * Goal progress with additional calculations
 */
export interface CustomGoalProgress {
  goal: CustomGoal
  currentAmount: number
  targetAmount: number
  remainingAmount: number
  percentComplete: number
  isComplete: boolean
  estimatedYearToComplete?: number
  yearsRemaining?: number
  monthsRemaining?: number
  requiredMonthlySavings?: number
  requiredYearlySavings?: number
}

/**
 * Create a new custom goal
 */
export function createCustomGoal(
  name: string,
  targetAmount: number,
  options: {
    description?: string
    targetDate?: Date
    priority?: GoalPriority
    category?: GoalCategory
  } = {}
): CustomGoal {
  const now = new Date()
  return {
    id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    name,
    description: options.description,
    targetAmount,
    targetDate: options.targetDate,
    priority: options.priority || 'medium',
    category: options.category || 'custom',
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Update an existing custom goal
 */
export function updateCustomGoal(
  goal: CustomGoal,
  updates: Partial<Omit<CustomGoal, 'id' | 'createdAt' | 'updatedAt'>>
): CustomGoal {
  return {
    ...goal,
    ...updates,
    updatedAt: new Date(),
  }
}

/**
 * Calculate required additional savings to reach goal by target date
 */
export function calculateRequiredSavings(
  currentAmount: number,
  targetAmount: number,
  targetDate: Date | undefined,
  currentYear: number,
  annualReturn: number = 0.05 // Default 5% annual return
): { monthly?: number; yearly?: number } {
  if (!targetDate) {
    return {}
  }

  const remainingAmount = targetAmount - currentAmount
  if (remainingAmount <= 0) {
    return { monthly: 0, yearly: 0 }
  }

  const targetYear = targetDate.getFullYear()
  const yearsRemaining = targetYear - currentYear

  if (yearsRemaining <= 0) {
    // Target date is in the past or this year
    return { monthly: remainingAmount / 12, yearly: remainingAmount }
  }

  // Calculate required monthly/yearly savings using future value of annuity formula
  // FV = PMT × [(1 + r)^n - 1] / r
  // Solving for PMT: PMT = FV × r / [(1 + r)^n - 1]

  const monthlyReturn = Math.pow(1 + annualReturn, 1 / 12) - 1
  const monthsRemaining = yearsRemaining * 12

  let requiredMonthlySavings = 0
  if (monthsRemaining > 0) {
    if (monthlyReturn > 0.0001) {
      // Use formula for non-zero interest
      requiredMonthlySavings = (remainingAmount * monthlyReturn) / (Math.pow(1 + monthlyReturn, monthsRemaining) - 1)
    } else {
      // Simple division for near-zero interest
      requiredMonthlySavings = remainingAmount / monthsRemaining
    }
  }

  let requiredYearlySavings = 0
  if (yearsRemaining > 0) {
    if (annualReturn > 0.0001) {
      // Use formula for non-zero interest
      requiredYearlySavings = (remainingAmount * annualReturn) / (Math.pow(1 + annualReturn, yearsRemaining) - 1)
    } else {
      // Simple division for near-zero interest
      requiredYearlySavings = remainingAmount / yearsRemaining
    }
  }

  return {
    monthly: requiredMonthlySavings,
    yearly: requiredYearlySavings,
  }
}

/**
 * Calculate progress for a custom goal
 */
export function calculateCustomGoalProgress(
  goal: CustomGoal,
  simulationData: SimulationData | null,
  annualReturn: number = 0.05
): CustomGoalProgress {
  const currentAmount = getCurrentCapital(simulationData)
  const remainingAmount = Math.max(0, goal.targetAmount - currentAmount)
  const percentComplete = Math.min((currentAmount / goal.targetAmount) * 100, 100)
  const isComplete = currentAmount >= goal.targetAmount

  let estimatedYearToComplete: number | undefined
  let yearsRemaining: number | undefined
  let monthsRemaining: number | undefined

  // Calculate time to completion based on simulation data
  if (!isComplete && simulationData && simulationData.sparplanElements && simulationData.sparplanElements.length > 0) {
    // Find the year when target will be reached
    const allYears = new Set<number>()
    simulationData.sparplanElements.forEach((element) => {
      Object.keys(element.simulation).forEach((year) => allYears.add(Number(year)))
    })

    const sortedYears = Array.from(allYears).sort((a, b) => a - b)
    const currentYear = new Date().getFullYear()

    for (const year of sortedYears) {
      const totalCapitalInYear = simulationData.sparplanElements.reduce((sum, element) => {
        return sum + (element.simulation[year]?.endkapital || 0)
      }, 0)

      if (totalCapitalInYear >= goal.targetAmount) {
        estimatedYearToComplete = year
        yearsRemaining = year - currentYear
        monthsRemaining = yearsRemaining * 12
        break
      }
    }
  }

  // Calculate required savings based on target date
  const currentYear = new Date().getFullYear()
  const requiredSavings = calculateRequiredSavings(currentAmount, goal.targetAmount, goal.targetDate, currentYear, annualReturn)

  return {
    goal,
    currentAmount,
    targetAmount: goal.targetAmount,
    remainingAmount,
    percentComplete,
    isComplete,
    estimatedYearToComplete,
    yearsRemaining,
    monthsRemaining,
    requiredMonthlySavings: requiredSavings.monthly,
    requiredYearlySavings: requiredSavings.yearly,
  }
}

/**
 * Calculate progress for all custom goals
 */
export function calculateAllCustomGoalProgress(
  goals: CustomGoal[],
  simulationData: SimulationData | null,
  annualReturn: number = 0.05
): CustomGoalProgress[] {
  return goals
    .map((goal) => calculateCustomGoalProgress(goal, simulationData, annualReturn))
    .sort((a, b) => {
      // Sort by priority first (high -> medium -> low)
      const priorityOrder = { high: 0, medium: 1, low: 2 }
      if (a.goal.priority !== b.goal.priority) {
        return priorityOrder[a.goal.priority] - priorityOrder[b.goal.priority]
      }
      // Then by target amount (ascending)
      return a.targetAmount - b.targetAmount
    })
}

/**
 * localStorage key for custom goals
 */
const STORAGE_KEY = 'zinszins-custom-goals'

/**
 * Helper to serialize dates for localStorage
 */
function serializeGoal(goal: CustomGoal): Record<string, unknown> {
  return {
    ...goal,
    targetDate: goal.targetDate?.toISOString(),
    createdAt: goal.createdAt.toISOString(),
    updatedAt: goal.updatedAt.toISOString(),
  }
}

/**
 * Helper to deserialize dates from localStorage
 */
function deserializeGoal(data: Record<string, unknown>): CustomGoal {
  return {
    ...data,
    targetDate: data.targetDate ? new Date(data.targetDate as string) : undefined,
    createdAt: new Date(data.createdAt as string),
    updatedAt: new Date(data.updatedAt as string),
  } as CustomGoal
}

/**
 * Save custom goals to localStorage
 */
export function saveCustomGoals(goals: CustomGoal[]): void {
  try {
    const serialized = goals.map(serializeGoal)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized))
  } catch (error) {
    console.error('Failed to save custom goals to localStorage:', error)
  }
}

/**
 * Load custom goals from localStorage
 */
export function loadCustomGoals(): CustomGoal[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return []
    }

    const parsed = JSON.parse(stored) as Record<string, unknown>[]
    return parsed.map(deserializeGoal)
  } catch (error) {
    console.error('Failed to load custom goals from localStorage:', error)
    return []
  }
}

/**
 * Add a new custom goal and save to localStorage
 */
export function addCustomGoal(goal: CustomGoal): CustomGoal[] {
  const existing = loadCustomGoals()
  const updated = [...existing, goal]
  saveCustomGoals(updated)
  return updated
}

/**
 * Update a custom goal and save to localStorage
 */
export function updateCustomGoalInStorage(goalId: string, updates: Partial<CustomGoal>): CustomGoal[] {
  const existing = loadCustomGoals()
  const updated = existing.map((g) => (g.id === goalId ? updateCustomGoal(g, updates) : g))
  saveCustomGoals(updated)
  return updated
}

/**
 * Delete a custom goal and save to localStorage
 */
export function deleteCustomGoal(goalId: string): CustomGoal[] {
  const existing = loadCustomGoals()
  const updated = existing.filter((g) => g.id !== goalId)
  saveCustomGoals(updated)
  return updated
}

/**
 * Get a single goal by ID
 */
export function getCustomGoalById(goalId: string): CustomGoal | undefined {
  const goals = loadCustomGoals()
  return goals.find((g) => g.id === goalId)
}

/**
 * Get goals by category
 */
export function getCustomGoalsByCategory(category: GoalCategory): CustomGoal[] {
  const goals = loadCustomGoals()
  return goals.filter((g) => g.category === category)
}

/**
 * Get goals by priority
 */
export function getCustomGoalsByPriority(priority: GoalPriority): CustomGoal[] {
  const goals = loadCustomGoals()
  return goals.filter((g) => g.priority === priority)
}

/**
 * Clear all custom goals from localStorage
 */
export function clearAllCustomGoals(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear custom goals from localStorage:', error)
  }
}
