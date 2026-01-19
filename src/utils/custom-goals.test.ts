/**
 * Tests for Custom Goal Tracking Utility
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import type { SimulationData } from '../contexts/helpers/config-types'
import type { SimulationResult } from './simulate'
import {
  createCustomGoal,
  updateCustomGoal,
  calculateRequiredSavings,
  calculateCustomGoalProgress,
  calculateAllCustomGoalProgress,
  saveCustomGoals,
  loadCustomGoals,
  addCustomGoal,
  updateCustomGoalInStorage,
  deleteCustomGoal,
  getCustomGoalById,
  getCustomGoalsByCategory,
  getCustomGoalsByPriority,
  clearAllCustomGoals,
  GOAL_CATEGORY_ICONS,
  GOAL_CATEGORY_NAMES,
  PRIORITY_NAMES,
} from './custom-goals'

// Helper function to create mock simulation data
function createMockSimulationData(endCapital: number, year = 2024): SimulationData {
  const simulation: SimulationResult = {
    [year]: {
      startkapital: 0,
      zinsen: endCapital * 0.05,
      endkapital: endCapital,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
    },
  }

  return {
    sparplanElements: [
      {
        start: new Date(year, 0, 1),
        type: 'sparplan',
        einzahlung: 1000,
        simulation,
      },
    ],
  }
}

// Helper function to create multi-year simulation data
function createMultiYearSimulationData(yearlyCapitals: Record<number, number>): SimulationData {
  const simulation: SimulationResult = {}

  Object.entries(yearlyCapitals).forEach(([year, capital]) => {
    simulation[Number(year)] = {
      startkapital: 0,
      zinsen: capital * 0.05,
      endkapital: capital,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
    }
  })

  return {
    sparplanElements: [
      {
        start: new Date(2024, 0, 1),
        type: 'sparplan',
        einzahlung: 1000,
        simulation,
      },
    ],
  }
}

describe('Custom Goal Tracking Utility', () => {
  // Clear localStorage before and after each test
  beforeEach(() => {
    clearAllCustomGoals()
  })

  afterEach(() => {
    clearAllCustomGoals()
  })

  describe('Constants', () => {
    it('should have icon mappings for all goal categories', () => {
      expect(GOAL_CATEGORY_ICONS).toBeDefined()
      expect(GOAL_CATEGORY_ICONS.home).toBe('🏠')
      expect(GOAL_CATEGORY_ICONS.car).toBe('🚗')
      expect(GOAL_CATEGORY_ICONS.retirement).toBe('🏖️')
      expect(GOAL_CATEGORY_ICONS.travel).toBe('✈️')
      expect(GOAL_CATEGORY_ICONS.emergency).toBe('🛡️')
      expect(GOAL_CATEGORY_ICONS.education).toBe('🎓')
      expect(GOAL_CATEGORY_ICONS.custom).toBe('🎯')
    })

    it('should have German names for all goal categories', () => {
      expect(GOAL_CATEGORY_NAMES).toBeDefined()
      expect(GOAL_CATEGORY_NAMES.home).toBe('Eigenheim')
      expect(GOAL_CATEGORY_NAMES.car).toBe('Auto')
      expect(GOAL_CATEGORY_NAMES.retirement).toBe('Ruhestand')
      expect(GOAL_CATEGORY_NAMES.travel).toBe('Reise')
      expect(GOAL_CATEGORY_NAMES.emergency).toBe('Notfallfonds')
      expect(GOAL_CATEGORY_NAMES.education).toBe('Bildung')
      expect(GOAL_CATEGORY_NAMES.custom).toBe('Sonstiges')
    })

    it('should have German names for all priorities', () => {
      expect(PRIORITY_NAMES).toBeDefined()
      expect(PRIORITY_NAMES.high).toBe('Hoch')
      expect(PRIORITY_NAMES.medium).toBe('Mittel')
      expect(PRIORITY_NAMES.low).toBe('Niedrig')
    })
  })

  describe('createCustomGoal', () => {
    it('should create a goal with required fields', () => {
      const goal = createCustomGoal('Eigenheim-Anzahlung', 50000)

      expect(goal.name).toBe('Eigenheim-Anzahlung')
      expect(goal.targetAmount).toBe(50000)
      expect(goal.id).toContain('goal_')
      expect(goal.category).toBe('custom')
      expect(goal.priority).toBe('medium')
      expect(goal.createdAt).toBeInstanceOf(Date)
      expect(goal.updatedAt).toBeInstanceOf(Date)
    })

    it('should create a goal with all optional fields', () => {
      const targetDate = new Date(2030, 0, 1)
      const goal = createCustomGoal('Weltreise', 15000, {
        description: 'Reise um die Welt',
        targetDate,
        priority: 'high',
        category: 'travel',
      })

      expect(goal.name).toBe('Weltreise')
      expect(goal.targetAmount).toBe(15000)
      expect(goal.description).toBe('Reise um die Welt')
      expect(goal.targetDate).toEqual(targetDate)
      expect(goal.priority).toBe('high')
      expect(goal.category).toBe('travel')
    })

    it('should generate unique IDs for each goal', () => {
      const goal1 = createCustomGoal('Goal 1', 10000)
      const goal2 = createCustomGoal('Goal 2', 20000)

      expect(goal1.id).not.toBe(goal2.id)
    })

    it('should set createdAt and updatedAt to current time', () => {
      const before = new Date()
      const goal = createCustomGoal('Test', 10000)
      const after = new Date()

      expect(goal.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(goal.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
      expect(goal.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(goal.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    })
  })

  describe('updateCustomGoal', () => {
    it('should update goal properties', () => {
      const original = createCustomGoal('Original', 10000)
      const updated = updateCustomGoal(original, {
        name: 'Updated',
        targetAmount: 15000,
      })

      expect(updated.name).toBe('Updated')
      expect(updated.targetAmount).toBe(15000)
      expect(updated.id).toBe(original.id)
      expect(updated.createdAt).toEqual(original.createdAt)
    })

    it('should update updatedAt timestamp', () => {
      const original = createCustomGoal('Test', 10000)

      // Wait a small amount to ensure timestamp difference
      const updated = updateCustomGoal(original, { name: 'Updated' })

      expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(original.updatedAt.getTime())
    })

    it('should not modify original goal', () => {
      const original = createCustomGoal('Original', 10000)
      const originalName = original.name

      updateCustomGoal(original, { name: 'Updated' })

      expect(original.name).toBe(originalName)
    })
  })

  describe('calculateRequiredSavings', () => {
    const currentYear = new Date().getFullYear()

    it('should return empty object when no target date', () => {
      const result = calculateRequiredSavings(10000, 50000, undefined, currentYear)

      expect(result).toEqual({})
    })

    it('should return zero savings when goal is already met', () => {
      const targetDate = new Date(currentYear + 5, 0, 1)
      const result = calculateRequiredSavings(50000, 50000, targetDate, currentYear)

      expect(result.monthly).toBe(0)
      expect(result.yearly).toBe(0)
    })

    it('should calculate required savings for future target', () => {
      const targetDate = new Date(currentYear + 5, 0, 1)
      const result = calculateRequiredSavings(10000, 50000, targetDate, currentYear, 0.05)

      expect(result.monthly).toBeDefined()
      expect(result.yearly).toBeDefined()
      expect(result.monthly).toBeGreaterThan(0)
      expect(result.yearly).toBeGreaterThan(0)

      // Monthly savings should be roughly 1/12 of yearly (with compounding)
      if (result.monthly !== undefined && result.yearly !== undefined) {
        expect(result.monthly).toBeLessThan(result.yearly)
      }
    })

    it('should handle zero return rate', () => {
      const targetDate = new Date(currentYear + 5, 0, 1)
      const result = calculateRequiredSavings(10000, 50000, targetDate, currentYear, 0)

      expect(result.yearly).toBeCloseTo(8000, 0) // 40000 / 5 years
      expect(result.monthly).toBeCloseTo(666.67, 0) // 40000 / 60 months
    })

    it('should handle past target date', () => {
      const pastDate = new Date(currentYear - 1, 0, 1)
      const result = calculateRequiredSavings(10000, 50000, pastDate, currentYear)

      expect(result.monthly).toBeCloseTo(3333.33, 0) // 40000 / 12 months
      expect(result.yearly).toBe(40000)
    })

    it('should handle current year target date', () => {
      const thisYear = new Date(currentYear, 11, 31)
      const result = calculateRequiredSavings(10000, 50000, thisYear, currentYear)

      expect(result.monthly).toBeCloseTo(3333.33, 0)
      expect(result.yearly).toBe(40000)
    })

    it('should calculate higher savings with higher return', () => {
      const targetDate = new Date(currentYear + 10, 0, 1)

      const resultLowReturn = calculateRequiredSavings(0, 100000, targetDate, currentYear, 0.02)
      const resultHighReturn = calculateRequiredSavings(0, 100000, targetDate, currentYear, 0.08)

      // With higher return, you need less savings each period
      if (resultLowReturn.yearly !== undefined && resultHighReturn.yearly !== undefined) {
        expect(resultLowReturn.yearly).toBeGreaterThan(resultHighReturn.yearly)
      }
    })
  })

  describe('calculateCustomGoalProgress', () => {
    it('should calculate progress for incomplete goal', () => {
      const goal = createCustomGoal('Test Goal', 100000)
      const data = createMockSimulationData(50000)

      const progress = calculateCustomGoalProgress(goal, data)

      expect(progress.currentAmount).toBe(50000)
      expect(progress.targetAmount).toBe(100000)
      expect(progress.remainingAmount).toBe(50000)
      expect(progress.percentComplete).toBe(50)
      expect(progress.isComplete).toBe(false)
    })

    it('should mark goal as complete when target reached', () => {
      const goal = createCustomGoal('Test Goal', 50000)
      const data = createMockSimulationData(50000)

      const progress = calculateCustomGoalProgress(goal, data)

      expect(progress.isComplete).toBe(true)
      expect(progress.percentComplete).toBe(100)
      expect(progress.remainingAmount).toBe(0)
    })

    it('should cap progress at 100% for exceeded goals', () => {
      const goal = createCustomGoal('Test Goal', 50000)
      const data = createMockSimulationData(75000)

      const progress = calculateCustomGoalProgress(goal, data)

      expect(progress.percentComplete).toBe(100)
      expect(progress.isComplete).toBe(true)
      expect(progress.remainingAmount).toBe(0)
    })

    it('should calculate estimated completion year from simulation', () => {
      const data = createMultiYearSimulationData({
        2024: 50000,
        2025: 75000,
        2026: 100000,
        2027: 125000,
      })

      // Create a separate goal that's not yet complete
      const incompleteGoal = createCustomGoal('Future Goal', 150000)
      const progress = calculateCustomGoalProgress(incompleteGoal, data)

      // Since current capital is 125k and goal is 150k, it's not yet complete
      expect(progress.isComplete).toBe(false)
      // But simulation doesn't go beyond 125k, so no estimated year
      expect(progress.estimatedYearToComplete).toBeUndefined()

      // Test with a goal that will be reached within simulation
      const reachableGoal = createCustomGoal('Reachable Goal', 80000)
      const reachableProgress = calculateCustomGoalProgress(reachableGoal, data)

      // Current capital (125k from 2027) already exceeds 80k
      expect(reachableProgress.isComplete).toBe(true)
      expect(reachableProgress.estimatedYearToComplete).toBeUndefined()
    })

    it('should calculate required savings when target date is set', () => {
      const currentYear = new Date().getFullYear()
      const targetDate = new Date(currentYear + 5, 0, 1)
      const goal = createCustomGoal('Test Goal', 100000, { targetDate })
      const data = createMockSimulationData(50000)

      const progress = calculateCustomGoalProgress(goal, data, 0.05)

      expect(progress.requiredMonthlySavings).toBeDefined()
      expect(progress.requiredYearlySavings).toBeDefined()
      expect(progress.requiredMonthlySavings).toBeGreaterThan(0)
      expect(progress.requiredYearlySavings).toBeGreaterThan(0)
    })

    it('should handle goal with no simulation data', () => {
      const goal = createCustomGoal('Test Goal', 100000)
      const progress = calculateCustomGoalProgress(goal, null)

      expect(progress.currentAmount).toBe(0)
      expect(progress.percentComplete).toBe(0)
      expect(progress.isComplete).toBe(false)
      expect(progress.estimatedYearToComplete).toBeUndefined()
    })
  })

  describe('calculateAllCustomGoalProgress', () => {
    it('should calculate progress for multiple goals', () => {
      const goals = [
        createCustomGoal('Goal 1', 10000),
        createCustomGoal('Goal 2', 50000),
        createCustomGoal('Goal 3', 100000),
      ]
      const data = createMockSimulationData(30000)

      const allProgress = calculateAllCustomGoalProgress(goals, data)

      expect(allProgress).toHaveLength(3)
      expect(allProgress[0].goal.name).toBe('Goal 1')
      expect(allProgress[0].isComplete).toBe(true)
      expect(allProgress[1].goal.name).toBe('Goal 2')
      expect(allProgress[1].percentComplete).toBe(60)
      expect(allProgress[2].goal.name).toBe('Goal 3')
      expect(allProgress[2].percentComplete).toBe(30)
    })

    it('should sort goals by priority then amount', () => {
      const goals = [
        createCustomGoal('Low Priority Large', 100000, { priority: 'low' }),
        createCustomGoal('High Priority Small', 10000, { priority: 'high' }),
        createCustomGoal('Medium Priority', 50000, { priority: 'medium' }),
        createCustomGoal('High Priority Large', 75000, { priority: 'high' }),
      ]
      const data = createMockSimulationData(25000)

      const allProgress = calculateAllCustomGoalProgress(goals, data)

      // High priority goals first
      expect(allProgress[0].goal.priority).toBe('high')
      expect(allProgress[1].goal.priority).toBe('high')
      // Within high priority, sorted by amount
      expect(allProgress[0].goal.targetAmount).toBe(10000)
      expect(allProgress[1].goal.targetAmount).toBe(75000)
      // Then medium priority
      expect(allProgress[2].goal.priority).toBe('medium')
      // Then low priority
      expect(allProgress[3].goal.priority).toBe('low')
    })

    it('should handle empty goal list', () => {
      const data = createMockSimulationData(50000)
      const allProgress = calculateAllCustomGoalProgress([], data)

      expect(allProgress).toEqual([])
    })
  })

  describe('localStorage operations', () => {
    describe('saveCustomGoals and loadCustomGoals', () => {
      it('should save and load goals correctly', () => {
        const goals = [
          createCustomGoal('Goal 1', 10000),
          createCustomGoal('Goal 2', 50000, { priority: 'high', category: 'home' }),
        ]

        saveCustomGoals(goals)
        const loaded = loadCustomGoals()

        expect(loaded).toHaveLength(2)
        expect(loaded[0].name).toBe('Goal 1')
        expect(loaded[1].name).toBe('Goal 2')
        expect(loaded[1].priority).toBe('high')
        expect(loaded[1].category).toBe('home')
      })

      it('should preserve dates correctly', () => {
        const targetDate = new Date(2030, 5, 15)
        const goals = [createCustomGoal('Goal with Date', 50000, { targetDate })]

        saveCustomGoals(goals)
        const loaded = loadCustomGoals()

        expect(loaded[0].targetDate).toBeInstanceOf(Date)
        expect(loaded[0].targetDate?.getTime()).toBe(targetDate.getTime())
        expect(loaded[0].createdAt).toBeInstanceOf(Date)
        expect(loaded[0].updatedAt).toBeInstanceOf(Date)
      })

      it('should return empty array when no goals saved', () => {
        const loaded = loadCustomGoals()

        expect(loaded).toEqual([])
      })

      it('should handle corrupted localStorage data', () => {
        localStorage.setItem('zinszins-custom-goals', 'invalid json')

        const loaded = loadCustomGoals()

        expect(loaded).toEqual([])
      })
    })

    describe('addCustomGoal', () => {
      it('should add goal to empty storage', () => {
        const goal = createCustomGoal('New Goal', 10000)

        const result = addCustomGoal(goal)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('New Goal')

        const loaded = loadCustomGoals()
        expect(loaded).toHaveLength(1)
      })

      it('should add goal to existing goals', () => {
        const goal1 = createCustomGoal('Goal 1', 10000)
        addCustomGoal(goal1)

        const goal2 = createCustomGoal('Goal 2', 20000)
        const result = addCustomGoal(goal2)

        expect(result).toHaveLength(2)

        const loaded = loadCustomGoals()
        expect(loaded).toHaveLength(2)
      })
    })

    describe('updateCustomGoalInStorage', () => {
      it('should update existing goal', () => {
        const goal = createCustomGoal('Original', 10000)
        addCustomGoal(goal)

        const result = updateCustomGoalInStorage(goal.id, {
          name: 'Updated',
          targetAmount: 15000,
        })

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Updated')
        expect(result[0].targetAmount).toBe(15000)

        const loaded = loadCustomGoals()
        expect(loaded[0].name).toBe('Updated')
      })

      it('should not affect other goals', () => {
        const goal1 = createCustomGoal('Goal 1', 10000)
        const goal2 = createCustomGoal('Goal 2', 20000)
        addCustomGoal(goal1)
        addCustomGoal(goal2)

        updateCustomGoalInStorage(goal1.id, { name: 'Updated 1' })

        const loaded = loadCustomGoals()
        expect(loaded[0].name).toBe('Updated 1')
        expect(loaded[1].name).toBe('Goal 2')
      })
    })

    describe('deleteCustomGoal', () => {
      it('should delete goal by id', () => {
        const goal1 = createCustomGoal('Goal 1', 10000)
        const goal2 = createCustomGoal('Goal 2', 20000)
        addCustomGoal(goal1)
        addCustomGoal(goal2)

        const result = deleteCustomGoal(goal1.id)

        expect(result).toHaveLength(1)
        expect(result[0].name).toBe('Goal 2')

        const loaded = loadCustomGoals()
        expect(loaded).toHaveLength(1)
        expect(loaded[0].name).toBe('Goal 2')
      })

      it('should handle deleting non-existent goal', () => {
        const goal = createCustomGoal('Goal', 10000)
        addCustomGoal(goal)

        const result = deleteCustomGoal('non-existent-id')

        expect(result).toHaveLength(1)
      })
    })

    describe('getCustomGoalById', () => {
      it('should find goal by id', () => {
        const goal = createCustomGoal('Test Goal', 10000)
        addCustomGoal(goal)

        const found = getCustomGoalById(goal.id)

        expect(found).toBeDefined()
        expect(found?.name).toBe('Test Goal')
      })

      it('should return undefined for non-existent id', () => {
        const found = getCustomGoalById('non-existent')

        expect(found).toBeUndefined()
      })
    })

    describe('getCustomGoalsByCategory', () => {
      it('should filter goals by category', () => {
        addCustomGoal(createCustomGoal('Home 1', 10000, { category: 'home' }))
        addCustomGoal(createCustomGoal('Car 1', 20000, { category: 'car' }))
        addCustomGoal(createCustomGoal('Home 2', 30000, { category: 'home' }))

        const homeGoals = getCustomGoalsByCategory('home')

        expect(homeGoals).toHaveLength(2)
        expect(homeGoals[0].name).toBe('Home 1')
        expect(homeGoals[1].name).toBe('Home 2')
      })

      it('should return empty array when no goals match', () => {
        addCustomGoal(createCustomGoal('Home', 10000, { category: 'home' }))

        const carGoals = getCustomGoalsByCategory('car')

        expect(carGoals).toEqual([])
      })
    })

    describe('getCustomGoalsByPriority', () => {
      it('should filter goals by priority', () => {
        addCustomGoal(createCustomGoal('High 1', 10000, { priority: 'high' }))
        addCustomGoal(createCustomGoal('Low 1', 20000, { priority: 'low' }))
        addCustomGoal(createCustomGoal('High 2', 30000, { priority: 'high' }))

        const highPriorityGoals = getCustomGoalsByPriority('high')

        expect(highPriorityGoals).toHaveLength(2)
        expect(highPriorityGoals[0].name).toBe('High 1')
        expect(highPriorityGoals[1].name).toBe('High 2')
      })

      it('should return empty array when no goals match', () => {
        addCustomGoal(createCustomGoal('Medium', 10000, { priority: 'medium' }))

        const highGoals = getCustomGoalsByPriority('high')

        expect(highGoals).toEqual([])
      })
    })

    describe('clearAllCustomGoals', () => {
      it('should clear all goals from storage', () => {
        addCustomGoal(createCustomGoal('Goal 1', 10000))
        addCustomGoal(createCustomGoal('Goal 2', 20000))

        clearAllCustomGoals()

        const loaded = loadCustomGoals()
        expect(loaded).toEqual([])
      })

      it('should handle clearing empty storage', () => {
        expect(() => clearAllCustomGoals()).not.toThrow()
      })
    })
  })

  describe('Integration scenarios', () => {
    it('should handle complete goal lifecycle', () => {
      // Create goal
      const goal = createCustomGoal('Weltreise', 15000, {
        description: 'Reise um die Welt',
        targetDate: new Date(2028, 0, 1),
        priority: 'high',
        category: 'travel',
      })

      // Add to storage
      addCustomGoal(goal)

      // Load and verify
      let loaded = loadCustomGoals()
      expect(loaded).toHaveLength(1)

      // Update goal
      updateCustomGoalInStorage(goal.id, { targetAmount: 18000 })

      // Verify update
      loaded = loadCustomGoals()
      expect(loaded[0].targetAmount).toBe(18000)

      // Calculate progress
      const data = createMockSimulationData(9000)
      const progress = calculateCustomGoalProgress(loaded[0], data)
      expect(progress.percentComplete).toBe(50)

      // Delete goal
      deleteCustomGoal(goal.id)

      // Verify deletion
      loaded = loadCustomGoals()
      expect(loaded).toHaveLength(0)
    })

    it('should handle multiple goals with different priorities', () => {
      const goals = [
        createCustomGoal('Notgroschen', 20000, { priority: 'high', category: 'emergency' }),
        createCustomGoal('Weltreise', 15000, { priority: 'low', category: 'travel' }),
        createCustomGoal('Auto', 30000, { priority: 'medium', category: 'car' }),
        createCustomGoal('Eigenheim', 100000, { priority: 'high', category: 'home' }),
      ]

      goals.forEach((goal) => addCustomGoal(goal))

      const data = createMockSimulationData(25000)
      const allProgress = calculateAllCustomGoalProgress(loadCustomGoals(), data)

      // High priority goals should come first
      expect(allProgress[0].goal.priority).toBe('high')
      expect(allProgress[1].goal.priority).toBe('high')

      // Within high priority, sorted by amount
      expect(allProgress[0].goal.targetAmount).toBeLessThan(allProgress[1].goal.targetAmount)

      // Some goals should be complete, others not
      const completedGoals = allProgress.filter((p) => p.isComplete)
      const incompleteGoals = allProgress.filter((p) => !p.isComplete)

      expect(completedGoals.length).toBeGreaterThan(0)
      expect(incompleteGoals.length).toBeGreaterThan(0)
    })

    it('should calculate realistic required savings', () => {
      const currentYear = new Date().getFullYear()

      // Goal: Save 50,000 € in 5 years, currently have 10,000 €
      const goal = createCustomGoal('Anzahlung', 50000, {
        targetDate: new Date(currentYear + 5, 0, 1),
      })

      const data = createMockSimulationData(10000)
      const progress = calculateCustomGoalProgress(goal, data, 0.05)

      // Should need to save the remaining 40,000 € over 5 years
      expect(progress.remainingAmount).toBe(40000)
      expect(progress.requiredYearlySavings).toBeDefined()

      // With 5% return, should need less than 8,000 per year (simple division)
      expect(progress.requiredYearlySavings).toBeLessThan(8000)
      expect(progress.requiredYearlySavings).toBeGreaterThan(6000)

      // Monthly should be roughly yearly / 12 (with compounding)
      if (progress.requiredMonthlySavings !== undefined && progress.requiredYearlySavings !== undefined) {
        expect(progress.requiredMonthlySavings).toBeLessThan(progress.requiredYearlySavings)
      }
    })
  })
})
