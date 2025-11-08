import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SensitivityAnalysisDisplay from './SensitivityAnalysisDisplay'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'

// Mock react-chartjs-2 to avoid rendering issues in tests
vi.mock('react-chartjs-2', () => ({
  Line: ({ data, options }: { data: unknown; options: unknown }) => (
    <div data-testid="chartjs-line" data-chart-data={JSON.stringify(data)} data-chart-options={JSON.stringify(options)}>
      Chart.js Line Mock
    </div>
  ),
}))

describe('SensitivityAnalysisDisplay', () => {
  const baseConfig: SensitivityAnalysisConfig = {
    startYear: 2025,
    endYear: 2040,
    elements: [
      {
        type: 'sparplan',
        start: '2025-01-01',
        einzahlung: 24000,
        simulation: {},
      },
    ],
    steuerlast: 0.26375,
    teilfreistellungsquote: 0.3,
    simulationAnnual: 'yearly',
    freibetragPerYear: { 2025: 2000 },
    steuerReduzierenEndkapital: true,
  }

  const returnConfig = {
    mode: 'fixed' as const,
    fixedRate: 0.05,
  }

  it('renders the component with default title', () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    expect(screen.getByText('📊 Sensitivitätsanalyse')).toBeInTheDocument()
  })

  it('renders with custom title', () => {
    render(
      <SensitivityAnalysisDisplay
        config={baseConfig}
        returnConfig={returnConfig}
        title="Custom Sensitivity Analysis"
      />,
    )

    expect(screen.getByText('Custom Sensitivity Analysis')).toBeInTheDocument()
  })

  it('is initially collapsed', () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Introduction text should not be visible when collapsed
    expect(screen.queryByText(/Was ist Sensitivitätsanalyse/)).not.toBeInTheDocument()
  })

  it('expands when clicked', () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Click to expand
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Content should now be visible
    expect(screen.getByText(/Was ist Sensitivitätsanalyse/)).toBeInTheDocument()
  })

  it('displays parameter ranking section when expanded', () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand the component
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    expect(screen.getByText('🎯 Einflussreichste Parameter')).toBeInTheDocument()
  })

  it('displays all parameter names in ranking', () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand the component
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Check for parameter names
    expect(screen.getByText('Rendite')).toBeInTheDocument()
    expect(screen.getByText('Jährliche Sparrate')).toBeInTheDocument()
    expect(screen.getByText('Steuerlast')).toBeInTheDocument()
    expect(screen.getByText('Inflationsrate')).toBeInTheDocument()
    expect(screen.getByText('Anlagedauer')).toBeInTheDocument()
  })

  it('displays charts for top parameters', () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand the component
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Should have at least one chart (top 3 parameters get charts)
    const charts = screen.getAllByTestId('chartjs-line')
    expect(charts.length).toBeGreaterThan(0)
    expect(charts.length).toBeLessThanOrEqual(3)
  })

  it('displays action items section', () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand the component
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    expect(screen.getByText('✅ Handlungsempfehlungen')).toBeInTheDocument()
    expect(screen.getByText(/Fokussieren Sie sich auf die einflussreichsten Parameter/)).toBeInTheDocument()
  })

  it('collapses when clicked again', () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Verify expanded
    expect(screen.getByText(/Was ist Sensitivitätsanalyse/)).toBeInTheDocument()

    // Collapse
    fireEvent.click(header)

    // Verify collapsed
    expect(screen.queryByText(/Was ist Sensitivitätsanalyse/)).not.toBeInTheDocument()
  })

  it('handles different return configurations', () => {
    const randomReturnConfig = {
      mode: 'random' as const,
      randomConfig: {
        averageReturn: 0.07,
        standardDeviation: 0.15,
      },
    }

    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={randomReturnConfig} />)

    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Should still render properly with random return config
    expect(screen.getByText('🎯 Einflussreichste Parameter')).toBeInTheDocument()
  })

  it('displays sensitivity scores for parameters', () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand the component
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Check that sensitivity label is displayed
    const sensitivityLabels = screen.getAllByText('Sensitivität')
    expect(sensitivityLabels.length).toBeGreaterThan(0)
  })
})
