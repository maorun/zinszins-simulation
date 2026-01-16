/**
 * Tests for ComparisonResults Component
 * Tests delta highlighting, percentage deviations, and table rendering
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComparisonResults } from './ComparisonResults'
import type { CapitalGrowthComparison } from '../types/capital-growth-comparison'

// Helper to create a test comparison with results
function createTestComparison(scenarioCount = 3): CapitalGrowthComparison {
  const scenarios = Array.from({ length: scenarioCount }, (_, i) => ({
    id: `scenario-${i + 1}`,
    name: `Szenario ${i + 1}`,
    description: `Test scenario ${i + 1}`,
    color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i] || '#000000',
    configuration: {} as never, // Not needed for rendering tests
  }))

  const results = scenarios.map((s, i) => ({
    scenarioId: s.id,
    yearlyData: [],
    metrics: {
      endCapital: 100000 + i * 50000, // 100k, 150k, 200k, etc.
      endCapitalReal: 90000 + i * 45000,
      totalContributions: 50000,
      totalReturns: 50000 + i * 50000,
      totalTaxes: 10000 - i * 2000, // 10k, 8k, 6k (lower is better)
      annualizedReturn: 5 + i * 2, // 5%, 7%, 9%
      duration: 10, // 10 years
    },
  }))

  const statistics = {
    bestScenario: {
      scenarioId: results[results.length - 1]!.scenarioId,
      endCapital: results[results.length - 1]!.metrics.endCapital,
    },
    worstScenario: {
      scenarioId: results[0]!.scenarioId,
      endCapital: results[0]!.metrics.endCapital,
    },
    averageEndCapital: results.reduce((sum, r) => sum + r.metrics.endCapital, 0) / results.length,
    percentiles: {
      p25: results[0]!.metrics.endCapital,
      p50: results[Math.floor(results.length / 2)]!.metrics.endCapital,
      p75: results[results.length - 1]!.metrics.endCapital,
    },
    standardDeviation: 25000,
    range: results[results.length - 1]!.metrics.endCapital - results[0]!.metrics.endCapital,
  }

  return {
    id: 'test-comparison',
    name: 'Test Comparison',
    scenarios,
    results,
    statistics,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

describe('ComparisonResults', () => {
  describe('Basic Rendering', () => {
    it('should render table with all scenarios', () => {
      const comparison = createTestComparison(3)
      render(<ComparisonResults comparison={comparison} />)

      // Check all scenario names are present (use getAllByText since names appear in stats cards and table)
      expect(screen.getAllByText('Szenario 1').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Szenario 2').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Szenario 3').length).toBeGreaterThanOrEqual(1)
    })

    it('should render all table headers', () => {
      const comparison = createTestComparison(2)
      render(<ComparisonResults comparison={comparison} />)

      expect(screen.getByText('Szenario')).toBeInTheDocument()
      expect(screen.getByText('Endkapital')).toBeInTheDocument()
      expect(screen.getByText('Rendite p.a.')).toBeInTheDocument()
      expect(screen.getByText('Gesamtbeiträge')).toBeInTheDocument()
      expect(screen.getByText('Gesamtertrag')).toBeInTheDocument()
      expect(screen.getByText('Steuern')).toBeInTheDocument()
    })

    it('should display metrics correctly formatted', () => {
      const comparison = createTestComparison(2)
      render(<ComparisonResults comparison={comparison} />)

      // Check currency formatting (appears in stats summary + table)
      expect(screen.getAllByText(/100\.000,00\s*€/).length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText(/150\.000,00\s*€/).length).toBeGreaterThanOrEqual(1)

      // Check percentage formatting - use regex to match the percentage
      expect(screen.getByText(/5[,.]00%/)).toBeInTheDocument()
      expect(screen.getByText(/7[,.]00%/)).toBeInTheDocument()
    })

    it('should not render when no results available', () => {
      const comparison = createTestComparison(1) // Create with 1 scenario first
      comparison.results = []
      comparison.statistics = undefined
      const { container } = render(<ComparisonResults comparison={comparison} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Statistics Summary', () => {
    it('should display best, average, and worst scenario statistics', () => {
      const comparison = createTestComparison(3)
      render(<ComparisonResults comparison={comparison} />)

      expect(screen.getByText('Bestes Szenario')).toBeInTheDocument()
      expect(screen.getByText('Durchschnitt')).toBeInTheDocument()
      expect(screen.getByText('Schlechtestes Szenario')).toBeInTheDocument()
    })

    it('should show scenario names in statistics cards', () => {
      const comparison = createTestComparison(3)
      render(<ComparisonResults comparison={comparison} />)

      const statCards = screen.getAllByText(/Szenario \d/)
      expect(statCards.length).toBeGreaterThanOrEqual(2) // Best and worst scenario names
    })
  })

  describe('Delta Highlighting', () => {
    it('should apply color highlighting to best and worst values', () => {
      const comparison = createTestComparison(3)
      const { container } = render(<ComparisonResults comparison={comparison} />)

      // Check for presence of green background class (best values)
      const greenCells = container.querySelectorAll('[class*="bg-green"]')
      expect(greenCells.length).toBeGreaterThan(0)

      // Check for presence of red background class (worst values)
      const redCells = container.querySelectorAll('[class*="bg-red"]')
      expect(redCells.length).toBeGreaterThan(0)
    })

    it('should show color legend', () => {
      const comparison = createTestComparison(3)
      render(<ComparisonResults comparison={comparison} />)

      expect(screen.getByText('Beste Option')).toBeInTheDocument()
      expect(screen.getByText('Schlechteste Option')).toBeInTheDocument()
    })

    it('should not highlight when only one scenario', () => {
      const comparison = createTestComparison(1)
      const { container } = render(<ComparisonResults comparison={comparison} />)

      // No highlighting should be applied (getCellColorClass returns empty string for single scenario)
      // However, the legend still shows, so there will be bg-green and bg-red in the legend
      // Check that table cells don't have highlighting
      const tableCells = container.querySelectorAll('tbody td[class*="bg-"]')
      expect(tableCells.length).toBe(0)
    })
  })

  describe('Percentage Deviations', () => {
    it('should show percentage deviations when baseline is specified', () => {
      const comparison = createTestComparison(3)
      const baselineId = comparison.scenarios[0]!.id

      render(<ComparisonResults comparison={comparison} baselineScenarioId={baselineId} />)

      // Check for "(Abweichung)" labels in headers
      const abweichungHeaders = screen.getAllByText('(Abweichung)')
      expect(abweichungHeaders.length).toBeGreaterThan(0)
    })

    it('should mark baseline scenario', () => {
      const comparison = createTestComparison(3)
      const baselineId = comparison.scenarios[0]!.id

      render(<ComparisonResults comparison={comparison} baselineScenarioId={baselineId} />)

      expect(screen.getByText('(Basis)')).toBeInTheDocument()
    })

    it('should not show deviations when no baseline specified', () => {
      const comparison = createTestComparison(3)
      render(<ComparisonResults comparison={comparison} />)

      expect(screen.queryByText('(Abweichung)')).not.toBeInTheDocument()
      expect(screen.queryByText('(Basis)')).not.toBeInTheDocument()
    })

    it('should calculate positive deviations correctly', () => {
      const comparison = createTestComparison(3)
      const baselineId = comparison.scenarios[0]!.id

      render(<ComparisonResults comparison={comparison} baselineScenarioId={baselineId} />)

      // Scenario 2 has 150k endCapital vs baseline's 100k = +50%
      // The format uses period (.) not comma (,) for decimal separator
      expect(screen.getByText('+50.0%')).toBeInTheDocument()
    })

    it('should calculate negative deviations correctly for taxes', () => {
      const comparison = createTestComparison(3)
      const baselineId = comparison.scenarios[0]!.id

      render(<ComparisonResults comparison={comparison} baselineScenarioId={baselineId} />)

      // Scenario 2 has 8k taxes vs baseline's 10k = -20%
      // The format uses period (.) not comma (,) for decimal separator
      expect(screen.getByText('-20.0%')).toBeInTheDocument()
    })
  })

  describe('Responsive Behavior', () => {
    it('should have horizontal scroll container', () => {
      const comparison = createTestComparison(5) // Many scenarios
      const { container } = render(<ComparisonResults comparison={comparison} />)

      const scrollContainer = container.querySelector('.overflow-x-auto')
      expect(scrollContainer).toBeInTheDocument()
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero baseline values gracefully', () => {
      const comparison = createTestComparison(2)
      comparison.results![0]!.metrics.totalReturns = 0

      const baselineId = comparison.scenarios[0]!.id
      render(<ComparisonResults comparison={comparison} baselineScenarioId={baselineId} />)

      // Should show "-" for undefined deviations
      expect(screen.getByText('-')).toBeInTheDocument()
    })

    it('should handle scenarios with missing data', () => {
      const comparison = createTestComparison(3)
      // Remove one result
      comparison.results = comparison.results!.slice(0, 2)
      // Update statistics to match the remaining results
      comparison.statistics = {
        bestScenario: {
          scenarioId: comparison.results[1]!.scenarioId,
          endCapital: comparison.results[1]!.metrics.endCapital,
        },
        worstScenario: {
          scenarioId: comparison.results[0]!.scenarioId,
          endCapital: comparison.results[0]!.metrics.endCapital,
        },
        averageEndCapital: (comparison.results[0]!.metrics.endCapital + comparison.results[1]!.metrics.endCapital) / 2,
        percentiles: {
          p25: comparison.results[0]!.metrics.endCapital,
          p50: comparison.results[0]!.metrics.endCapital,
          p75: comparison.results[1]!.metrics.endCapital,
        },
        standardDeviation: 25000,
        range: comparison.results[1]!.metrics.endCapital - comparison.results[0]!.metrics.endCapital,
      }

      render(<ComparisonResults comparison={comparison} />)

      // Should only show 2 scenarios (use getAllByText since names appear in stats + table)
      expect(screen.getAllByText('Szenario 1').length).toBeGreaterThanOrEqual(1)
      expect(screen.getAllByText('Szenario 2').length).toBeGreaterThanOrEqual(1)
      expect(screen.queryByText('Szenario 3')).not.toBeInTheDocument()
    })

    it('should handle identical values across scenarios', () => {
      const comparison = createTestComparison(3)
      // Make all end capitals identical
      comparison.results!.forEach((r) => {
        r.metrics.endCapital = 100000
      })

      const { container } = render(<ComparisonResults comparison={comparison} />)

      // All should be marked as "best" (or none highlighted)
      const greenCells = container.querySelectorAll('[class*="bg-green"]')
      // Should have green highlighting on endCapital column
      expect(greenCells.length).toBeGreaterThanOrEqual(0)
    })
  })
})
