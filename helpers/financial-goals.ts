/**
 * Financial Goals Module
 *
 * Implements SMART-Goals Integration with Milestone-Tracking for the Zinseszins-Simulation.
 * This module provides types and utilities for setting and tracking financial goals.
 */

/**
 * Type of financial goal
 */
export type FinancialGoalType =
  | 'retirement' // Altersvorsorge
  | 'independence' // Finanzielle Unabhängigkeit
  | 'custom' // Benutzerdefiniertes Ziel

/**
 * Individual milestone within a financial goal
 */
export interface GoalMilestone {
  /** Target amount for this milestone in EUR */
  targetAmount: number
  /** Label/description for the milestone */
  label: string
  /** Whether this milestone has been achieved */
  achieved: boolean
}

/**
 * Financial goal configuration
 */
export interface FinancialGoal {
  /** Unique identifier for the goal */
  id: string
  /** Type of the goal */
  type: FinancialGoalType
  /** Name/label of the goal */
  name: string
  /** Target amount in EUR */
  targetAmount: number
  /** Optional target year */
  targetYear?: number
  /** Whether the goal is currently active */
  active: boolean
  /** Optional milestones for the goal */
  milestones?: GoalMilestone[]
}

/**
 * Calculate progress toward a financial goal
 *
 * @param currentAmount - Current capital amount in EUR
 * @param goal - The financial goal to calculate progress for
 * @returns Progress as a percentage (0-100+)
 */
export function calculateGoalProgress(currentAmount: number, goal: FinancialGoal): number {
  if (goal.targetAmount <= 0) return 0
  const progress = (currentAmount / goal.targetAmount) * 100
  return Math.max(0, progress) // Ensure non-negative
}

/**
 * Check which milestones have been achieved
 *
 * @param currentAmount - Current capital amount in EUR
 * @param goal - The financial goal with milestones
 * @returns Updated goal with milestone achievement status
 */
export function updateMilestoneAchievements(currentAmount: number, goal: FinancialGoal): FinancialGoal {
  if (!goal.milestones) return goal

  const updatedMilestones = goal.milestones.map((milestone) => ({
    ...milestone,
    achieved: currentAmount >= milestone.targetAmount,
  }))

  return {
    ...goal,
    milestones: updatedMilestones,
  }
}

/**
 * Get the next unachieved milestone for a goal
 *
 * @param currentAmount - Current capital amount in EUR
 * @param goal - The financial goal with milestones
 * @returns The next milestone to achieve, or undefined if all achieved or no milestones
 */
export function getNextMilestone(currentAmount: number, goal: FinancialGoal): GoalMilestone | undefined {
  if (!goal.milestones || goal.milestones.length === 0) return undefined

  // Sort milestones by target amount
  const sortedMilestones = [...goal.milestones].sort((a, b) => a.targetAmount - b.targetAmount)

  // Find first unachieved milestone
  return sortedMilestones.find((m) => currentAmount < m.targetAmount)
}

/**
 * Check if a goal has been achieved
 *
 * @param currentAmount - Current capital amount in EUR
 * @param goal - The financial goal
 * @returns True if the goal has been achieved
 */
export function isGoalAchieved(currentAmount: number, goal: FinancialGoal): boolean {
  return currentAmount >= goal.targetAmount
}

/**
 * Calculate amount remaining to achieve a goal
 *
 * @param currentAmount - Current capital amount in EUR
 * @param goal - The financial goal
 * @returns Amount remaining in EUR (0 if already achieved)
 */
export function calculateAmountRemaining(currentAmount: number, goal: FinancialGoal): number {
  const remaining = goal.targetAmount - currentAmount
  return Math.max(0, remaining)
}

/**
 * Generate a unique ID for a new goal
 */
export function generateGoalId(): string {
  return `goal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create default milestones for a goal (25%, 50%, 75% of target)
 *
 * @param targetAmount - The goal target amount in EUR
 * @returns Array of default milestones
 */
export function createDefaultMilestones(targetAmount: number): GoalMilestone[] {
  return [
    {
      targetAmount: targetAmount * 0.25,
      label: '25% des Ziels erreicht',
      achieved: false,
    },
    {
      targetAmount: targetAmount * 0.5,
      label: '50% des Ziels erreicht',
      achieved: false,
    },
    {
      targetAmount: targetAmount * 0.75,
      label: '75% des Ziels erreicht',
      achieved: false,
    },
  ]
}

/**
 * Create a default financial goal
 *
 * @param type - Type of the goal
 * @param name - Name of the goal
 * @param targetAmount - Target amount in EUR
 * @returns A new financial goal with default settings
 */
export function createDefaultGoal(type: FinancialGoalType, name: string, targetAmount: number): FinancialGoal {
  return {
    id: generateGoalId(),
    type,
    name,
    targetAmount,
    active: true,
    milestones: createDefaultMilestones(targetAmount),
  }
}
