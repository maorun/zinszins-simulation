import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'
import SensitivityAnalysisDisplay from './SensitivityAnalysisDisplay'
import type { SensitivityAnalysisConfig } from '../utils/sensitivity-analysis'

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  LineChart: ({ children }: { children: React.ReactNode }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
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

  it('expands when clicked', async () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Click to expand
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Content should now be visible
    await waitFor(() => expect(screen.getByText(/Was ist Sensitivitätsanalyse/)).toBeInTheDocument(), {
      timeout: 5000,
    })
  })

  it('displays parameter ranking section when expanded', async () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand the component
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    await waitFor(() => expect(screen.getByText('🎯 Einflussreichste Parameter')).toBeInTheDocument(), {
      timeout: 5000,
    })
  })

  it('displays all parameter names in ranking', async () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand the component
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Check for parameter names
    await waitFor(
      () => {
        expect(screen.getByText('Rendite')).toBeInTheDocument()
        expect(screen.getByText('Jährliche Sparrate')).toBeInTheDocument()
        expect(screen.getByText('Steuerlast')).toBeInTheDocument()
        expect(screen.getByText('Inflationsrate')).toBeInTheDocument()
        expect(screen.getByText('Anlagedauer')).toBeInTheDocument()
      },
      { timeout: 5000 },
    )
  })

  it('displays charts for top parameters', async () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand the component
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Should have at least one chart (top 3 parameters get charts)
    const charts = await screen.findAllByTestId('line-chart')
    expect(charts.length).toBeGreaterThan(0)
    expect(charts.length).toBeLessThanOrEqual(3)
  })

  it('displays action items section', async () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand the component
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    await waitFor(() => expect(screen.getByText('✅ Handlungsempfehlungen')).toBeInTheDocument(), {
      timeout: 5000,
    })
    await waitFor(
      () => expect(screen.getByText(/Fokussieren Sie sich auf die einflussreichsten Parameter/)).toBeInTheDocument(),
      { timeout: 5000 },
    )
  })

  it('collapses when clicked again', async () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Verify expanded
    await waitFor(() => expect(screen.getByText(/Was ist Sensitivitätsanalyse/)).toBeInTheDocument(), {
      timeout: 5000,
    })

    // Collapse
    fireEvent.click(header)

    // Verify collapsed
    await waitFor(() => expect(screen.queryByText(/Was ist Sensitivitätsanalyse/)).not.toBeInTheDocument(), {
      timeout: 5000,
    })
  })

  it('handles different return configurations', async () => {
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
    await waitFor(() => expect(screen.getByText('🎯 Einflussreichste Parameter')).toBeInTheDocument(), {
      timeout: 5000,
    })
  })

  it('displays sensitivity scores for parameters', async () => {
    render(<SensitivityAnalysisDisplay config={baseConfig} returnConfig={returnConfig} />)

    // Expand the component
    const header = screen.getByText('📊 Sensitivitätsanalyse')
    fireEvent.click(header)

    // Check that sensitivity label is displayed
    const sensitivityLabels = await screen.findAllByText('Sensitivität')
    expect(sensitivityLabels.length).toBeGreaterThan(0)
  })
})
