/**
 * Tests for Milestone Tracker Utility
 */

import { describe, it, expect } from 'vitest'
import type { SimulationData } from '../contexts/helpers/config-types'
import type { SimulationResult } from './simulate'
import {
  MILESTONE_TEMPLATES,
  getCurrentCapital,
  calculateMilestoneProgress,
  calculateAllMilestones,
  getRelevantMilestones,
  getNextMilestone,
  createCustomMilestone,
  type FinancialMilestone,
} from './milestone-tracker'

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

describe('Milestone Tracker Utility', () => {
  describe('MILESTONE_TEMPLATES', () => {
    it('should have predefined milestones', () => {
      expect(MILESTONE_TEMPLATES).toBeDefined()
      expect(MILESTONE_TEMPLATES.length).toBeGreaterThan(0)
    })

    it('should include standard savings milestones', () => {
      const milestoneAmounts = MILESTONE_TEMPLATES.map((m) => m.targetAmount)
      expect(milestoneAmounts).toContain(10000) // First 10k
      expect(milestoneAmounts).toContain(100000) // First 100k
      expect(milestoneAmounts).toContain(1000000) // First million
    })

    it('should have proper structure for each milestone', () => {
      MILESTONE_TEMPLATES.forEach((milestone) => {
        expect(milestone).toHaveProperty('id')
        expect(milestone).toHaveProperty('name')
        expect(milestone).toHaveProperty('description')
        expect(milestone).toHaveProperty('targetAmount')
        expect(milestone).toHaveProperty('category')
        expect(milestone.targetAmount).toBeGreaterThan(0)
        expect(['savings', 'emergency', 'retirement', 'custom']).toContain(milestone.category)
      })
    })

    it('should be sorted by target amount', () => {
      const amounts = MILESTONE_TEMPLATES.map((m) => m.targetAmount)
      const sortedAmounts = [...amounts].sort((a, b) => a - b)
      expect(amounts).toEqual(sortedAmounts)
    })
  })

  describe('getCurrentCapital', () => {
    it('should return 0 for null simulation data', () => {
      expect(getCurrentCapital(null)).toBe(0)
    })

    it('should return 0 for empty simulation data', () => {
      const emptyData: SimulationData = { sparplanElements: [] }
      expect(getCurrentCapital(emptyData)).toBe(0)
    })

    it('should return capital from single element', () => {
      const data = createMockSimulationData(50000)
      expect(getCurrentCapital(data)).toBe(50000)
    })

    it('should sum capital from multiple elements', () => {
      const simulation1: SimulationResult = {
        2024: {
          startkapital: 0,
          zinsen: 2500,
          endkapital: 50000,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      }

      const simulation2: SimulationResult = {
        2024: {
          startkapital: 0,
          zinsen: 1500,
          endkapital: 30000,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      }

      const data: SimulationData = {
        sparplanElements: [
          { start: new Date(2024, 0, 1), type: 'sparplan', einzahlung: 1000, simulation: simulation1 },
          { start: new Date(2024, 0, 1), type: 'einmalzahlung', gewinn: 0, einzahlung: 30000, simulation: simulation2 },
        ],
      }

      expect(getCurrentCapital(data)).toBe(80000)
    })

    it('should use the latest year from simulation', () => {
      const data = createMultiYearSimulationData({
        2024: 50000,
        2025: 75000,
        2026: 100000,
      })

      expect(getCurrentCapital(data)).toBe(100000)
    })
  })

  describe('calculateMilestoneProgress', () => {
    const testMilestone: FinancialMilestone = {
      id: 'test',
      name: 'Test Milestone',
      description: 'Test description',
      targetAmount: 100000,
      category: 'savings',
    }

    it('should calculate progress correctly for incomplete milestone', () => {
      const data = createMockSimulationData(50000)
      const progress = calculateMilestoneProgress(testMilestone, 50000, data)

      expect(progress.currentAmount).toBe(50000)
      expect(progress.targetAmount).toBe(100000)
      expect(progress.percentComplete).toBe(50)
      expect(progress.isComplete).toBe(false)
    })

    it('should mark milestone as complete when target reached', () => {
      const data = createMockSimulationData(100000)
      const progress = calculateMilestoneProgress(testMilestone, 100000, data)

      expect(progress.isComplete).toBe(true)
      expect(progress.percentComplete).toBe(100)
    })

    it('should cap progress at 100% for exceeded milestones', () => {
      const data = createMockSimulationData(150000)
      const progress = calculateMilestoneProgress(testMilestone, 150000, data)

      expect(progress.percentComplete).toBe(100)
      expect(progress.isComplete).toBe(true)
    })

    it('should calculate estimated year to complete', () => {
      const data = createMultiYearSimulationData({
        2024: 50000,
        2025: 75000,
        2026: 100000,
        2027: 125000,
      })

      const progress = calculateMilestoneProgress(testMilestone, 50000, data)

      expect(progress.estimatedYearToComplete).toBe(2026)
      expect(progress.yearsRemaining).toBeGreaterThanOrEqual(0)
    })

    it('should handle milestones that will never be reached', () => {
      const data = createMultiYearSimulationData({
        2024: 10000,
        2025: 15000,
        2026: 20000,
      })

      const progress = calculateMilestoneProgress(testMilestone, 10000, data)

      expect(progress.estimatedYearToComplete).toBeUndefined()
      expect(progress.yearsRemaining).toBeUndefined()
    })
  })

  describe('calculateAllMilestones', () => {
    it('should calculate progress for all milestones', () => {
      const data = createMockSimulationData(50000)
      const milestones = MILESTONE_TEMPLATES.slice(0, 5)

      const allProgress = calculateAllMilestones(milestones, data)

      expect(allProgress).toHaveLength(5)
      allProgress.forEach((progress) => {
        expect(progress).toHaveProperty('currentAmount')
        expect(progress).toHaveProperty('percentComplete')
        expect(progress).toHaveProperty('isComplete')
      })
    })

    it('should sort milestones by target amount', () => {
      const data = createMockSimulationData(50000)
      const milestones = [
        createCustomMilestone('Large', 'Large milestone', 200000),
        createCustomMilestone('Small', 'Small milestone', 10000),
        createCustomMilestone('Medium', 'Medium milestone', 50000),
      ]

      const allProgress = calculateAllMilestones(milestones, data)

      expect(allProgress[0].targetAmount).toBe(10000)
      expect(allProgress[1].targetAmount).toBe(50000)
      expect(allProgress[2].targetAmount).toBe(200000)
    })

    it('should handle empty simulation data', () => {
      const milestones = MILESTONE_TEMPLATES.slice(0, 3)
      const allProgress = calculateAllMilestones(milestones, null)

      expect(allProgress).toHaveLength(3)
      allProgress.forEach((progress) => {
        expect(progress.currentAmount).toBe(0)
        expect(progress.percentComplete).toBe(0)
        expect(progress.isComplete).toBe(false)
      })
    })
  })

  describe('getRelevantMilestones', () => {
    it('should return first 3 milestones when starting from zero', () => {
      const relevant = getRelevantMilestones(MILESTONE_TEMPLATES, null)

      expect(relevant).toHaveLength(3)
      expect(relevant[0].targetAmount).toBe(MILESTONE_TEMPLATES[0].targetAmount)
    })

    it('should return milestones around current progress', () => {
      const data = createMockSimulationData(30000) // Between 25k and 50k
      const relevant = getRelevantMilestones(MILESTONE_TEMPLATES, data)

      expect(relevant.length).toBeGreaterThan(0)
      expect(relevant.length).toBeLessThanOrEqual(4)

      // Should include completed 25k milestone
      const has25k = relevant.some((m) => m.targetAmount === 25000)
      expect(has25k).toBe(true)

      // Should include next milestone (50k)
      const has50k = relevant.some((m) => m.targetAmount === 50000)
      expect(has50k).toBe(true)
    })

    it('should return last 3 milestones when all are complete', () => {
      const data = createMockSimulationData(2000000) // More than highest milestone
      const relevant = getRelevantMilestones(MILESTONE_TEMPLATES, data)

      expect(relevant).toHaveLength(3)
      expect(relevant[relevant.length - 1].targetAmount).toBe(
        MILESTONE_TEMPLATES[MILESTONE_TEMPLATES.length - 1].targetAmount
      )
    })
  })

  describe('getNextMilestone', () => {
    it('should return first milestone when starting from zero', () => {
      const next = getNextMilestone(MILESTONE_TEMPLATES, null)

      expect(next).not.toBeNull()
      expect(next?.targetAmount).toBe(MILESTONE_TEMPLATES[0].targetAmount)
    })

    it('should return next uncompleted milestone', () => {
      const data = createMockSimulationData(30000)
      const next = getNextMilestone(MILESTONE_TEMPLATES, data)

      expect(next).not.toBeNull()
      expect(next?.targetAmount).toBeGreaterThan(30000)
      expect(next?.targetAmount).toBe(50000) // Next milestone after 25k
    })

    it('should return null when all milestones are complete', () => {
      const data = createMockSimulationData(2000000)
      const next = getNextMilestone(MILESTONE_TEMPLATES, data)

      expect(next).toBeNull()
    })

    it('should handle custom milestone order', () => {
      const customMilestones = [
        createCustomMilestone('First', 'First goal', 5000),
        createCustomMilestone('Second', 'Second goal', 15000),
        createCustomMilestone('Third', 'Third goal', 30000),
      ]

      const data = createMockSimulationData(10000)
      const next = getNextMilestone(customMilestones, data)

      expect(next?.targetAmount).toBe(15000)
    })
  })

  describe('createCustomMilestone', () => {
    it('should create a custom milestone with all required fields', () => {
      const milestone = createCustomMilestone('My Goal', 'Custom goal description', 75000)

      expect(milestone.name).toBe('My Goal')
      expect(milestone.description).toBe('Custom goal description')
      expect(milestone.targetAmount).toBe(75000)
      expect(milestone.category).toBe('custom')
      expect(milestone.id).toContain('custom_')
    })

    it('should create unique IDs for each custom milestone', () => {
      const milestone1 = createCustomMilestone('Goal 1', 'First goal', 50000)
      const milestone2 = createCustomMilestone('Goal 2', 'Second goal', 60000)

      expect(milestone1.id).not.toBe(milestone2.id)
    })

    it('should use default icon if not provided', () => {
      const milestone = createCustomMilestone('My Goal', 'Description', 50000)

      expect(milestone.icon).toBe('🎯')
    })

    it('should use custom icon if provided', () => {
      const milestone = createCustomMilestone('My Goal', 'Description', 50000, '🏆')

      expect(milestone.icon).toBe('🏆')
    })
  })

  describe('Integration scenarios', () => {
    it('should handle realistic savings progression', () => {
      const data = createMultiYearSimulationData({
        2024: 10000,
        2025: 25000,
        2026: 50000,
        2027: 80000,
        2028: 120000,
      })

      const milestones = MILESTONE_TEMPLATES.slice(0, 6) // First 6 milestones

      const allProgress = calculateAllMilestones(milestones, data)

      // Emergency fund 3m (9k) and 10k should be complete
      expect(allProgress.find((p) => p.targetAmount === 9000)?.isComplete).toBe(true)
      expect(allProgress.find((p) => p.targetAmount === 10000)?.isComplete).toBe(true)

      // Emergency fund 6m (18k) should be complete
      const milestone18k = allProgress.find((p) => p.targetAmount === 18000)
      expect(milestone18k?.isComplete).toBe(true)

      // 250k should have estimated completion year if there's simulation data beyond 120k
      const milestone250k = allProgress.find((p) => p.targetAmount === 250000)
      // Since our simulation only goes to 120k, 250k won't have estimated year
      expect(milestone250k?.estimatedYearToComplete).toBeUndefined()
    })

    it('should provide accurate next milestone recommendations', () => {
      const testCases = [
        { capital: 5000, expectedNext: 9000 }, // First milestone is emergency fund 3m
        { capital: 15000, expectedNext: 18000 }, // Next is emergency fund 6m
        { capital: 20000, expectedNext: 25000 }, // Next is 25k
        { capital: 120000, expectedNext: 250000 }, // Next is quarter million
      ]

      testCases.forEach(({ capital, expectedNext }) => {
        const data = createMockSimulationData(capital)
        const next = getNextMilestone(MILESTONE_TEMPLATES, data)

        expect(next?.targetAmount).toBe(expectedNext)
      })
    })
  })
})
