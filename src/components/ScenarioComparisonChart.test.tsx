/**
 * Tests for Scenario Comparison Chart Component
 */

import { render, screen } from '@testing-library/react'
import { vi, describe, it, expect, beforeAll } from 'vitest'
import { ScenarioComparisonChart } from './ScenarioComparisonChart'
import { createComparison, createScenario, simulateComparison } from '../utils/capital-growth-comparison'

// Mock Chart.js
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: { data: unknown; options: unknown }) => (
    <div data-testid="line-chart" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Chart Placeholder
    </div>
  ),
}))

describe('ScenarioComparisonChart', () => {
  let comparison: ReturnType<typeof createComparison>

  beforeAll(() => {
    // Create a comparison with 2 scenarios
    comparison = createComparison('Test Comparison')
    
    const scenario1 = createScenario('Scenario 1', '#3b82f6', {
      rendite: 0.05,
      steuerlast: 0.26375,
      teilfreistellungsquote: 0.3,
      freibetragPerYear: {},
      returnMode: 'fixed' as const,
      averageReturn: 0.05,
      standardDeviation: 0.1,
      variableReturns: {},
      startEnd: [2024, 2028] as [number, number],
      sparplan: [{ id: 1, start: new Date('2024-01-01'), einzahlung: 12000 }],
      simulationAnnual: 'yearly' as const,
    })

    const scenario2 = createScenario('Scenario 2', '#10b981', {
      rendite: 0.07,
      steuerlast: 0.26375,
      teilfreistellungsquote: 0.3,
      freibetragPerYear: {},
      returnMode: 'fixed' as const,
      averageReturn: 0.07,
      standardDeviation: 0.1,
      variableReturns: {},
      startEnd: [2024, 2028] as [number, number],
      sparplan: [{ id: 1, start: new Date('2024-01-01'), einzahlung: 12000 }],
      simulationAnnual: 'yearly' as const,
    })

    comparison.scenarios = [scenario1, scenario2]
    comparison = simulateComparison(comparison)
  })

  it('should render chart with comparison data', () => {
    render(<ScenarioComparisonChart comparison={comparison} />)

    expect(screen.getByTestId('line-chart')).toBeInTheDocument()
  })

  it('should show message when no results available', () => {
    const emptyComparison = createComparison('Empty')
    
    render(<ScenarioComparisonChart comparison={emptyComparison} />)

    expect(screen.getByText(/Keine Daten zur Visualisierung verfügbar/)).toBeInTheDocument()
  })

  it('should include all scenarios in chart data', () => {
    render(<ScenarioComparisonChart comparison={comparison} />)

    const chart = screen.getByTestId('line-chart')
    const chartDataStr = chart.getAttribute('data-chart-data')
    
    expect(chartDataStr).toBeTruthy()
    
    if (chartDataStr) {
      const chartData = JSON.parse(chartDataStr)
      expect(chartData.datasets).toHaveLength(2)
      expect(chartData.datasets[0].label).toBe('Scenario 1')
      expect(chartData.datasets[1].label).toBe('Scenario 2')
    }
  })

  it('should use scenario colors in chart', () => {
    render(<ScenarioComparisonChart comparison={comparison} />)

    const chart = screen.getByTestId('line-chart')
    const chartDataStr = chart.getAttribute('data-chart-data')
    
    if (chartDataStr) {
      const chartData = JSON.parse(chartDataStr)
      expect(chartData.datasets[0].borderColor).toBe('#3b82f6')
      expect(chartData.datasets[1].borderColor).toBe('#10b981')
    }
  })

  it('should handle showRealValues prop', () => {
    const { rerender } = render(<ScenarioComparisonChart comparison={comparison} showRealValues={false} />)

    let chart = screen.getByTestId('line-chart')
    let optionsStr = chart.getAttribute('data-chart-options')
    
    if (optionsStr) {
      const options = JSON.parse(optionsStr)
      expect(options.scales.y.title.text).toContain('nominal')
    }

    // Rerender with showRealValues=true
    rerender(<ScenarioComparisonChart comparison={comparison} showRealValues={true} />)

    chart = screen.getByTestId('line-chart')
    optionsStr = chart.getAttribute('data-chart-options')
    
    if (optionsStr) {
      const options = JSON.parse(optionsStr)
      expect(options.scales.y.title.text).toContain('real')
    }
  })

  it('should have proper chart configuration', () => {
    render(<ScenarioComparisonChart comparison={comparison} />)

    const chart = screen.getByTestId('line-chart')
    const optionsStr = chart.getAttribute('data-chart-options')
    
    if (optionsStr) {
      const options = JSON.parse(optionsStr)
      
      // Check that chart is responsive
      expect(options.responsive).toBe(true)
      
      // Check that legend is configured
      expect(options.plugins.legend.position).toBe('top')
      
      // Check that axes are configured
      expect(options.scales.x.title.text).toBe('Jahr')
      expect(options.scales.y.beginAtZero).toBe(true)
    }
  })
})
