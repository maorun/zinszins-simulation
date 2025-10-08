import { describe, it, expect } from 'vitest'
import {
  type FinancialGoal,
  calculateGoalProgress,
  updateMilestoneAchievements,
  getNextMilestone,
  isGoalAchieved,
  calculateAmountRemaining,
  generateGoalId,
  createDefaultMilestones,
  createDefaultGoal,
} from './financial-goals'

describe('financial-goals', () => {
  describe('calculateGoalProgress', () => {
    it('should calculate progress correctly', () => {
      const goal: FinancialGoal = {
        id: 'test-1',
        type: 'retirement',
        name: 'Rente',
        targetAmount: 500000,
        active: true,
      }

      expect(calculateGoalProgress(0, goal)).toBe(0)
      expect(calculateGoalProgress(125000, goal)).toBe(25)
      expect(calculateGoalProgress(250000, goal)).toBe(50)
      expect(calculateGoalProgress(500000, goal)).toBe(100)
      expect(calculateGoalProgress(600000, goal)).toBe(120)
    })

    it('should handle zero target amount', () => {
      const goal: FinancialGoal = {
        id: 'test-2',
        type: 'custom',
        name: 'Test',
        targetAmount: 0,
        active: true,
      }

      expect(calculateGoalProgress(100000, goal)).toBe(0)
    })

    it('should ensure non-negative progress', () => {
      const goal: FinancialGoal = {
        id: 'test-3',
        type: 'custom',
        name: 'Test',
        targetAmount: 100000,
        active: true,
      }

      expect(calculateGoalProgress(-50000, goal)).toBe(0)
    })
  })

  describe('updateMilestoneAchievements', () => {
    it('should update milestone achievement status', () => {
      const goal: FinancialGoal = {
        id: 'test-4',
        type: 'retirement',
        name: 'Rente',
        targetAmount: 500000,
        active: true,
        milestones: [
          { targetAmount: 125000, label: '25%', achieved: false },
          { targetAmount: 250000, label: '50%', achieved: false },
          { targetAmount: 375000, label: '75%', achieved: false },
        ],
      }

      const updated = updateMilestoneAchievements(200000, goal)

      expect(updated.milestones).toBeDefined()
      expect(updated.milestones![0].achieved).toBe(true) // 125k achieved
      expect(updated.milestones![1].achieved).toBe(false) // 250k not achieved
      expect(updated.milestones![2].achieved).toBe(false) // 375k not achieved
    })

    it('should handle goals without milestones', () => {
      const goal: FinancialGoal = {
        id: 'test-5',
        type: 'independence',
        name: 'FI',
        targetAmount: 1000000,
        active: true,
      }

      const updated = updateMilestoneAchievements(500000, goal)

      expect(updated.milestones).toBeUndefined()
      expect(updated).toEqual(goal)
    })

    it('should mark all milestones as achieved when amount exceeds all targets', () => {
      const goal: FinancialGoal = {
        id: 'test-6',
        type: 'custom',
        name: 'Test',
        targetAmount: 300000,
        active: true,
        milestones: [
          { targetAmount: 100000, label: '33%', achieved: false },
          { targetAmount: 200000, label: '66%', achieved: false },
        ],
      }

      const updated = updateMilestoneAchievements(500000, goal)

      expect(updated.milestones![0].achieved).toBe(true)
      expect(updated.milestones![1].achieved).toBe(true)
    })
  })

  describe('getNextMilestone', () => {
    it('should return the next unachieved milestone', () => {
      const goal: FinancialGoal = {
        id: 'test-7',
        type: 'retirement',
        name: 'Rente',
        targetAmount: 500000,
        active: true,
        milestones: [
          { targetAmount: 125000, label: '25%', achieved: false },
          { targetAmount: 250000, label: '50%', achieved: false },
          { targetAmount: 375000, label: '75%', achieved: false },
        ],
      }

      const next = getNextMilestone(200000, goal)

      expect(next).toBeDefined()
      expect(next!.targetAmount).toBe(250000)
      expect(next!.label).toBe('50%')
    })

    it('should return undefined if all milestones are achieved', () => {
      const goal: FinancialGoal = {
        id: 'test-8',
        type: 'custom',
        name: 'Test',
        targetAmount: 300000,
        active: true,
        milestones: [
          { targetAmount: 100000, label: '33%', achieved: false },
          { targetAmount: 200000, label: '66%', achieved: false },
        ],
      }

      const next = getNextMilestone(500000, goal)

      expect(next).toBeUndefined()
    })

    it('should return undefined if goal has no milestones', () => {
      const goal: FinancialGoal = {
        id: 'test-9',
        type: 'independence',
        name: 'FI',
        targetAmount: 1000000,
        active: true,
      }

      const next = getNextMilestone(500000, goal)

      expect(next).toBeUndefined()
    })

    it('should handle unsorted milestones correctly', () => {
      const goal: FinancialGoal = {
        id: 'test-10',
        type: 'custom',
        name: 'Test',
        targetAmount: 500000,
        active: true,
        milestones: [
          { targetAmount: 250000, label: '50%', achieved: false },
          { targetAmount: 125000, label: '25%', achieved: false },
          { targetAmount: 375000, label: '75%', achieved: false },
        ],
      }

      const next = getNextMilestone(150000, goal)

      expect(next).toBeDefined()
      expect(next!.targetAmount).toBe(250000) // Should find the next one, even with unsorted input
    })
  })

  describe('isGoalAchieved', () => {
    it('should return true when goal is achieved', () => {
      const goal: FinancialGoal = {
        id: 'test-11',
        type: 'retirement',
        name: 'Rente',
        targetAmount: 500000,
        active: true,
      }

      expect(isGoalAchieved(500000, goal)).toBe(true)
      expect(isGoalAchieved(600000, goal)).toBe(true)
    })

    it('should return false when goal is not achieved', () => {
      const goal: FinancialGoal = {
        id: 'test-12',
        type: 'retirement',
        name: 'Rente',
        targetAmount: 500000,
        active: true,
      }

      expect(isGoalAchieved(0, goal)).toBe(false)
      expect(isGoalAchieved(499999, goal)).toBe(false)
    })
  })

  describe('calculateAmountRemaining', () => {
    it('should calculate remaining amount correctly', () => {
      const goal: FinancialGoal = {
        id: 'test-13',
        type: 'independence',
        name: 'FI',
        targetAmount: 1000000,
        active: true,
      }

      expect(calculateAmountRemaining(0, goal)).toBe(1000000)
      expect(calculateAmountRemaining(300000, goal)).toBe(700000)
      expect(calculateAmountRemaining(999999, goal)).toBe(1)
    })

    it('should return 0 when goal is achieved', () => {
      const goal: FinancialGoal = {
        id: 'test-14',
        type: 'custom',
        name: 'Test',
        targetAmount: 500000,
        active: true,
      }

      expect(calculateAmountRemaining(500000, goal)).toBe(0)
      expect(calculateAmountRemaining(600000, goal)).toBe(0)
    })
  })

  describe('generateGoalId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateGoalId()
      const id2 = generateGoalId()

      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^goal-/)
      expect(id2).toMatch(/^goal-/)
    })
  })

  describe('createDefaultMilestones', () => {
    it('should create milestones at 25%, 50%, and 75%', () => {
      const milestones = createDefaultMilestones(400000)

      expect(milestones).toHaveLength(3)
      expect(milestones[0].targetAmount).toBe(100000)
      expect(milestones[0].label).toBe('25% des Ziels erreicht')
      expect(milestones[0].achieved).toBe(false)

      expect(milestones[1].targetAmount).toBe(200000)
      expect(milestones[1].label).toBe('50% des Ziels erreicht')
      expect(milestones[1].achieved).toBe(false)

      expect(milestones[2].targetAmount).toBe(300000)
      expect(milestones[2].label).toBe('75% des Ziels erreicht')
      expect(milestones[2].achieved).toBe(false)
    })
  })

  describe('createDefaultGoal', () => {
    it('should create a goal with default milestones', () => {
      const goal = createDefaultGoal('retirement', 'Meine Rente', 600000)

      expect(goal.id).toMatch(/^goal-/)
      expect(goal.type).toBe('retirement')
      expect(goal.name).toBe('Meine Rente')
      expect(goal.targetAmount).toBe(600000)
      expect(goal.active).toBe(true)
      expect(goal.milestones).toHaveLength(3)
      expect(goal.milestones![0].targetAmount).toBe(150000)
      expect(goal.milestones![1].targetAmount).toBe(300000)
      expect(goal.milestones![2].targetAmount).toBe(450000)
    })
  })
})
