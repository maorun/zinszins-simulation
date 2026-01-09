/**
 * Milestone Tracker Utility
 *
 * Provides functionality for tracking financial milestones and calculating
 * progress towards user-defined savings goals.
 *
 * Features:
 * - Predefined milestone templates
 * - Custom milestone definitions
 * - Progress calculation
 * - Time estimation for milestone achievement
 * - Visual progress indicators
 */

import type { SimulationData } from '../contexts/helpers/config-types'

/**
 * Milestone type definition
 */
export interface FinancialMilestone {
  id: string
  name: string
  description: string
  targetAmount: number
  category: 'savings' | 'emergency' | 'retirement' | 'custom'
  icon?: string
}

/**
 * Milestone progress information
 */
export interface MilestoneProgress {
  milestone: FinancialMilestone
  currentAmount: number
  targetAmount: number
  percentComplete: number
  isComplete: boolean
  estimatedYearToComplete?: number
  yearsRemaining?: number
}

/**
 * Predefined milestone templates for German financial planning
 */
export const MILESTONE_TEMPLATES: FinancialMilestone[] = [
  {
    id: 'emergency_3m',
    name: 'Notgroschen: 3 Monate',
    description: 'Notfallfonds für 3 Monate Lebenshaltungskosten',
    targetAmount: 9000,
    category: 'emergency',
    icon: '🛡️',
  },
  {
    id: 'first_10k',
    name: 'Erste 10.000€',
    description: 'Der erste wichtige Meilenstein auf dem Weg zum Vermögensaufbau',
    targetAmount: 10000,
    category: 'savings',
    icon: '🎯',
  },
  {
    id: 'emergency_6m',
    name: 'Notgroschen: 6 Monate',
    description: 'Sicherer Notfallfonds für 6 Monate Lebenshaltungskosten',
    targetAmount: 18000,
    category: 'emergency',
    icon: '🏦',
  },
  {
    id: 'first_25k',
    name: 'Erste 25.000€',
    description: 'Ein Viertel des Weges zur ersten großen Summe',
    targetAmount: 25000,
    category: 'savings',
    icon: '📈',
  },
  {
    id: 'first_50k',
    name: 'Erste 50.000€',
    description: 'Die Hälfte auf dem Weg zur ersten großen Summe',
    targetAmount: 50000,
    category: 'savings',
    icon: '🚀',
  },
  {
    id: 'first_100k',
    name: 'Erste 100.000€',
    description: 'Ein bedeutender Meilenstein im Vermögensaufbau',
    targetAmount: 100000,
    category: 'savings',
    icon: '💎',
  },
  {
    id: 'quarter_million',
    name: 'Erste 250.000€',
    description: 'Ein Viertelmillion - erhebliches Vermögen',
    targetAmount: 250000,
    category: 'retirement',
    icon: '🏆',
  },
  {
    id: 'half_million',
    name: 'Erste 500.000€',
    description: 'Eine halbe Million - bedeutsames Vermögen',
    targetAmount: 500000,
    category: 'retirement',
    icon: '👑',
  },
  {
    id: 'million',
    name: 'Erste Million',
    description: 'Das große Ziel - eine Million Euro',
    targetAmount: 1000000,
    category: 'retirement',
    icon: '🌟',
  },
]

/**
 * Get the current capital from simulation data
 */
export function getCurrentCapital(simulationData: SimulationData | null): number {
  if (!simulationData || !simulationData.sparplanElements || simulationData.sparplanElements.length === 0) {
    return 0
  }

  // Get the latest year from all simulation data
  let latestYear = 0

  simulationData.sparplanElements.forEach((element) => {
    const years = Object.keys(element.simulation).map(Number)
    const maxYear = Math.max(...years)

    if (maxYear > latestYear) {
      latestYear = maxYear
    }
  })

  // Sum up all elements for the latest year
  const totalCapital = simulationData.sparplanElements.reduce((sum, element) => {
    const elementCapital = element.simulation[latestYear]?.endkapital || 0
    return sum + elementCapital
  }, 0)

  return totalCapital
}

/**
 * Calculate progress for a single milestone
 */
export function calculateMilestoneProgress(
  milestone: FinancialMilestone,
  currentAmount: number,
  simulationData: SimulationData | null
): MilestoneProgress {
  const percentComplete = Math.min((currentAmount / milestone.targetAmount) * 100, 100)
  const isComplete = currentAmount >= milestone.targetAmount

  let estimatedYearToComplete: number | undefined
  let yearsRemaining: number | undefined

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

      if (totalCapitalInYear >= milestone.targetAmount) {
        estimatedYearToComplete = year
        yearsRemaining = year - currentYear
        break
      }
    }
  }

  return {
    milestone,
    currentAmount,
    targetAmount: milestone.targetAmount,
    percentComplete,
    isComplete,
    estimatedYearToComplete,
    yearsRemaining,
  }
}

/**
 * Calculate progress for all milestones
 */
export function calculateAllMilestones(
  milestones: FinancialMilestone[],
  simulationData: SimulationData | null
): MilestoneProgress[] {
  const currentAmount = getCurrentCapital(simulationData)

  return milestones
    .map((milestone) => calculateMilestoneProgress(milestone, currentAmount, simulationData))
    .sort((a, b) => a.targetAmount - b.targetAmount) // Sort by target amount
}

/**
 * Get relevant milestones based on current capital
 * Returns the last completed milestone, current in-progress milestone, and next 2-3 upcoming milestones
 */
export function getRelevantMilestones(
  allMilestones: FinancialMilestone[],
  simulationData: SimulationData | null
): FinancialMilestone[] {
  const currentAmount = getCurrentCapital(simulationData)

  // Sort milestones by target amount
  const sortedMilestones = [...allMilestones].sort((a, b) => a.targetAmount - b.targetAmount)

  // Find the current position in the milestone list
  const currentIndex = sortedMilestones.findIndex((m) => m.targetAmount > currentAmount)

  if (currentIndex === -1) {
    // All milestones are complete, return last 3
    return sortedMilestones.slice(-3)
  }

  if (currentIndex === 0) {
    // Haven't reached first milestone yet, return first 3
    return sortedMilestones.slice(0, 3)
  }

  // Return last completed, current, and next 2
  const startIndex = Math.max(0, currentIndex - 1)
  const endIndex = Math.min(sortedMilestones.length, currentIndex + 3)
  return sortedMilestones.slice(startIndex, endIndex)
}

/**
 * Get the next milestone to achieve
 */
export function getNextMilestone(
  milestones: FinancialMilestone[],
  simulationData: SimulationData | null
): FinancialMilestone | null {
  const currentAmount = getCurrentCapital(simulationData)

  const sortedMilestones = [...milestones].sort((a, b) => a.targetAmount - b.targetAmount)

  return sortedMilestones.find((m) => m.targetAmount > currentAmount) || null
}

/**
 * Create a custom milestone
 */
let customMilestoneCounter = 0

export function createCustomMilestone(
  name: string,
  description: string,
  targetAmount: number,
  icon?: string
): FinancialMilestone {
  customMilestoneCounter += 1
  return {
    id: `custom_${Date.now()}_${customMilestoneCounter}`,
    name,
    description,
    targetAmount,
    category: 'custom',
    icon: icon || '🎯',
  }
}
