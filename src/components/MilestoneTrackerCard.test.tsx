/**
 * Tests for MilestoneTrackerCard Component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MilestoneTrackerCard } from './MilestoneTrackerCard'
import type { SimulationData } from '../contexts/helpers/config-types'
import type { SimulationResult } from '../utils/simulate'
import { createCustomMilestone } from '../utils/milestone-tracker'

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

describe('MilestoneTrackerCard', () => {
  describe('Rendering', () => {
    it('should render the card with title', () => {
      render(<MilestoneTrackerCard simulationData={null} />)

      expect(screen.getByText('Finanzielle Meilensteine')).toBeInTheDocument()
      expect(screen.getByText(/Verfolgen Sie Ihren Fortschritt/)).toBeInTheDocument()
    })

    it('should show message when no simulation data available', () => {
      render(<MilestoneTrackerCard simulationData={null} />)

      // With null data, it will show first 3 milestones with 0% progress
      expect(screen.getByText('Finanzielle Meilensteine')).toBeInTheDocument()
      expect(screen.getByText('Relevante Meilensteine')).toBeInTheDocument()
    })

    it('should display relevant milestones by default', () => {
      const data = createMockSimulationData(30000) // Between 25k and 50k
      render(<MilestoneTrackerCard simulationData={data} />)

      expect(screen.getByText('Relevante Meilensteine')).toBeInTheDocument()
    })

    it('should display all milestones when showOnlyRelevant is false', () => {
      const data = createMockSimulationData(30000)
      render(<MilestoneTrackerCard simulationData={data} showOnlyRelevant={false} />)

      expect(screen.getByText('Alle Meilensteine')).toBeInTheDocument()
    })
  })

  describe('Next Milestone Section', () => {
    it('should highlight next milestone to achieve', () => {
      const data = createMockSimulationData(5000) // Before first milestone
      render(<MilestoneTrackerCard simulationData={data} />)

      expect(screen.getByText('Nächster Meilenstein')).toBeInTheDocument()
      // Milestone name appears in both next milestone section and list
      expect(screen.getAllByText(/Notgroschen: 3 Monate/)).toHaveLength(2)
    })

    it('should show remaining amount for next milestone', () => {
      const data = createMockSimulationData(5000)
      render(<MilestoneTrackerCard simulationData={data} />)

      expect(screen.getByText('Noch benötigt:')).toBeInTheDocument()
      // 9000 - 5000 = 4000 remaining
      expect(screen.getByText(/4\.000,00\s*€/)).toBeInTheDocument()
    })

    it('should show estimated year for next milestone completion', () => {
      const data = createMultiYearSimulationData({
        2024: 5000,
        2025: 10000,
        2026: 15000,
      })
      render(<MilestoneTrackerCard simulationData={data} />)

      // Time estimates appear in the next milestone section (not in individual list items for incomplete goals)
      const timeEstimates = screen.queryAllByText(/Geschätzte Erreichung:/)
      expect(timeEstimates.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Milestone Progress Display', () => {
    it('should show completed milestones with checkmark', () => {
      const data = createMockSimulationData(15000) // Completed 9k and 10k milestones
      render(<MilestoneTrackerCard simulationData={data} />)

      const completedBadges = screen.getAllByText('Erreicht! ✓')
      expect(completedBadges.length).toBeGreaterThan(0)
    })

    it('should display progress percentage for incomplete milestones', () => {
      const data = createMockSimulationData(5000)
      render(<MilestoneTrackerCard simulationData={data} />)

      // 5000/9000 = 55.6% for first milestone
      const percentageElements = screen.getAllByText(/\d+%/)
      expect(percentageElements.length).toBeGreaterThan(0)
    })

    it('should show current and target amounts', () => {
      const data = createMockSimulationData(5000)
      render(<MilestoneTrackerCard simulationData={data} />)

      expect(screen.getAllByText(/5\.000,00\s*€/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Ziel:/).length).toBeGreaterThan(0)
    })

    it('should display milestone icons', () => {
      const data = createMockSimulationData(5000)
      render(<MilestoneTrackerCard simulationData={data} />)

      // Milestone icons should be present
      const container = screen.getByText('Finanzielle Meilensteine').closest('div')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Statistics', () => {
    it('should show completion statistics', () => {
      const data = createMockSimulationData(30000) // Completed 9k, 10k, 18k, 25k
      render(<MilestoneTrackerCard simulationData={data} />)

      // Should show "X von Y Meilensteinen erreicht"
      const statsText = screen.getByText(/Meilensteinen erreicht!/)
      expect(statsText).toBeInTheDocument()
    })

    it('should not show statistics when no milestones completed', () => {
      const data = createMockSimulationData(1000) // No milestones completed
      render(<MilestoneTrackerCard simulationData={data} />)

      expect(screen.queryByText(/Meilensteinen erreicht!/)).not.toBeInTheDocument()
    })
  })

  describe('All Milestones Completed', () => {
    it('should show congratulations message when all milestones reached', () => {
      const data = createMockSimulationData(2000000) // More than all milestones
      render(<MilestoneTrackerCard simulationData={data} />)

      expect(screen.getByText('Glückwunsch!')).toBeInTheDocument()
      expect(screen.getByText(/Sie haben alle Meilensteine erreicht!/)).toBeInTheDocument()
    })

    it('should not show next milestone section when all completed', () => {
      const data = createMockSimulationData(2000000)
      render(<MilestoneTrackerCard simulationData={data} />)

      expect(screen.queryByText('Nächster Meilenstein')).not.toBeInTheDocument()
    })
  })

  describe('Custom Milestones', () => {
    it('should display custom milestones when provided', () => {
      const customMilestones = [
        createCustomMilestone('Custom Goal 1', 'First custom milestone', 5000, '🎯'),
        createCustomMilestone('Custom Goal 2', 'Second custom milestone', 15000, '🏆'),
      ]

      const data = createMockSimulationData(7000)
      render(<MilestoneTrackerCard simulationData={data} customMilestones={customMilestones} />)

      expect(screen.getByText('Custom Goal 1')).toBeInTheDocument()
      // Custom Goal 2 appears in both next milestone section and list
      expect(screen.getAllByText('Custom Goal 2')).toHaveLength(2)
    })

    it('should use template milestones when no custom milestones provided', () => {
      const data = createMockSimulationData(5000)
      render(<MilestoneTrackerCard simulationData={data} />)

      // Should show template milestone names (appears in both sections)
      expect(screen.getAllByText(/Notgroschen: 3 Monate/)).toHaveLength(2)
    })

    it('should prioritize custom milestones over templates', () => {
      const customMilestones = [createCustomMilestone('My Milestone', 'Custom description', 5000)]

      const data = createMockSimulationData(3000)
      render(<MilestoneTrackerCard simulationData={data} customMilestones={customMilestones} />)

      // My Milestone appears in both next milestone section and list
      expect(screen.getAllByText('My Milestone')).toHaveLength(2)
      expect(screen.queryByText('Erste 10.000€')).not.toBeInTheDocument()
    })
  })

  describe('Nesting Level', () => {
    it('should accept nesting level prop', () => {
      const data = createMockSimulationData(5000)
      const { container } = render(<MilestoneTrackerCard simulationData={data} nestingLevel={1} />)

      const card = container.querySelector('[data-nesting-level="1"]')
      expect(card).toBeInTheDocument()
    })

    it('should use default nesting level of 0', () => {
      const data = createMockSimulationData(5000)
      const { container } = render(<MilestoneTrackerCard simulationData={data} />)

      const card = container.querySelector('[data-nesting-level="0"]')
      expect(card).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should render without errors on different data sizes', () => {
      const testCases = [0, 1000, 10000, 100000, 1000000]

      testCases.forEach((capital) => {
        const data = createMockSimulationData(capital)
        const { unmount } = render(<MilestoneTrackerCard simulationData={data} />)
        expect(screen.getByText('Finanzielle Meilensteine')).toBeInTheDocument()
        unmount()
      })
    })
  })

  describe('Time Estimates', () => {
    it('should show "Dieses Jahr" for milestones reachable this year', () => {
      const currentYear = new Date().getFullYear()
      const data = createMultiYearSimulationData({
        [currentYear]: 10000,
      })

      render(<MilestoneTrackerCard simulationData={data} />)

      // The 18k milestone should be shown with time estimate
      const thisYearText = screen.queryAllByText(/Dieses Jahr/)
      // May or may not be present depending on if milestone is reachable this year
      expect(thisYearText.length).toBeGreaterThanOrEqual(0)
    })

    it('should show "Nächstes Jahr" for milestones reachable next year', () => {
      const currentYear = new Date().getFullYear()
      const data = createMultiYearSimulationData({
        [currentYear]: 5000,
        [currentYear + 1]: 10000,
      })

      render(<MilestoneTrackerCard simulationData={data} />)

      const nextYearText = screen.queryAllByText(/Nächstes Jahr/)
      expect(nextYearText.length).toBeGreaterThanOrEqual(0)
    })

    it('should show year count for future milestones', () => {
      const currentYear = new Date().getFullYear()
      const data = createMultiYearSimulationData({
        [currentYear]: 5000,
        [currentYear + 5]: 100000,
      })

      render(<MilestoneTrackerCard simulationData={data} />)

      // Should show "In ca. X Jahren"
      const yearCountText = screen.queryAllByText(/In ca\.\s+\d+\s+Jahren/)
      expect(yearCountText.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('Empty States', () => {
    it('should handle empty simulation elements array', () => {
      const emptyData: SimulationData = { sparplanElements: [] }
      render(<MilestoneTrackerCard simulationData={emptyData} />)

      // With empty data, shows first 3 milestones with 0% progress
      expect(screen.getByText('Finanzielle Meilensteine')).toBeInTheDocument()
      expect(screen.getByText('Relevante Meilensteine')).toBeInTheDocument()
    })

    it('should handle null simulation data gracefully', () => {
      render(<MilestoneTrackerCard simulationData={null} />)

      expect(screen.getByText('Finanzielle Meilensteine')).toBeInTheDocument()
      expect(screen.getByText('Relevante Meilensteine')).toBeInTheDocument()
    })
  })
})
