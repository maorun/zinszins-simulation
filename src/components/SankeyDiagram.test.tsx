import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SankeyDiagram } from './SankeyDiagram'
import type { SimulationResult } from '../utils/simulate'

// Mock Chart component from react-chartjs-2
vi.mock('react-chartjs-2', () => ({
  Chart: ({ data, options, type }: { data: unknown; options: unknown; type: string }) => (
    <div data-testid="sankey-chart" data-chart-type={type}>
      {JSON.stringify({ data, options })}
    </div>
  ),
}))

// Mock chartjs-chart-sankey
vi.mock('chartjs-chart-sankey', () => ({
  SankeyController: class {
    static id = 'sankey'
  },
  Flow: class {
    static id = 'flow'
  },
}))

describe('SankeyDiagram', () => {
  const mockSimulationData: SimulationResult = {
    2024: {
      startkapital: 10000,
      zinsen: 500,
      endkapital: 10300,
      bezahlteSteuer: 200,
      genutzterFreibetrag: 200,
      vorabpauschale: 200,
      vorabpauschaleAccumulated: 200,
    },
    2025: {
      startkapital: 10300,
      zinsen: 515,
      endkapital: 10615,
      bezahlteSteuer: 200,
      genutzterFreibetrag: 200,
      vorabpauschale: 200,
      vorabpauschaleAccumulated: 400,
    },
    2026: {
      startkapital: 10615,
      zinsen: 530.75,
      endkapital: 10945.75,
      bezahlteSteuer: 200,
      genutzterFreibetrag: 200,
      vorabpauschale: 200,
      vorabpauschaleAccumulated: 600,
    },
  }

  it('renders Sankey diagram with title', () => {
    render(<SankeyDiagram simulationData={mockSimulationData} title="Test Sankey" />)
    expect(screen.getByText(/Test Sankey/)).toBeInTheDocument()
  })

  it('renders default title when no title provided', () => {
    render(<SankeyDiagram simulationData={mockSimulationData} />)
    expect(screen.getByText(/Geldfluss-Visualisierung/)).toBeInTheDocument()
  })

  it('renders year slider with correct range', () => {
    render(<SankeyDiagram simulationData={mockSimulationData} />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
    expect(slider).toHaveAttribute('min', '2024')
    expect(slider).toHaveAttribute('max', '2026')
  })

  it('displays selected year', () => {
    render(<SankeyDiagram simulationData={mockSimulationData} />)
    expect(screen.getByText('2024')).toBeInTheDocument()
  })

  it('renders Sankey chart when data is available', () => {
    render(<SankeyDiagram simulationData={mockSimulationData} />)
    const chart = screen.getByTestId('sankey-chart')
    expect(chart).toBeInTheDocument()
    expect(chart).toHaveAttribute('data-chart-type', 'sankey')
  })

  it('renders legend with flow categories', () => {
    render(<SankeyDiagram simulationData={mockSimulationData} />)
    expect(screen.getByText('Beiträge')).toBeInTheDocument()
    expect(screen.getByText('Kapital')).toBeInTheDocument()
    expect(screen.getByText('Gewinne')).toBeInTheDocument()
    expect(screen.getByText('Steuern')).toBeInTheDocument()
    expect(screen.getByText('Endkapital')).toBeInTheDocument()
  })

  it('handles empty simulation data', () => {
    render(<SankeyDiagram simulationData={{}} />)
    // Should not crash and should not render anything
    expect(screen.queryByText(/Geldfluss-Visualisierung/)).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <SankeyDiagram simulationData={mockSimulationData} className="custom-class" />
    )
    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })

  it('renders in savings mode by default', () => {
    render(<SankeyDiagram simulationData={mockSimulationData} />)
    // Should show savings phase nodes
    expect(screen.getByText('Beiträge')).toBeInTheDocument()
    expect(screen.getByText('Gewinne')).toBeInTheDocument()
  })

  it('renders correctly with single year data', () => {
    const singleYearData: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10300,
        bezahlteSteuer: 200,
        genutzterFreibetrag: 200,
        vorabpauschale: 200,
        vorabpauschaleAccumulated: 200,
      },
    }
    render(<SankeyDiagram simulationData={singleYearData} />)
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByTestId('sankey-chart')).toBeInTheDocument()
  })

  it('handles year with zero values gracefully', () => {
    const zeroValueData: SimulationResult = {
      2024: {
        startkapital: 0,
        zinsen: 0,
        endkapital: 0,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
    }
    render(<SankeyDiagram simulationData={zeroValueData} />)
    // With zero values, no flows are created, so empty state should be shown
    expect(screen.getByText(/Keine Daten für das Jahr 2024 verfügbar/)).toBeInTheDocument()
  })

  it('renders with German labels', () => {
    render(<SankeyDiagram simulationData={mockSimulationData} />)
    // Check for German language labels
    expect(screen.getByText('Jahr:')).toBeInTheDocument()
    expect(screen.getByText('Beiträge')).toBeInTheDocument()
    expect(screen.getByText('Steuern')).toBeInTheDocument()
  })
})
