import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EnhancedVisualizationSection } from './EnhancedVisualizationSection'
import type { SimulationResult } from '../../utils/simulate'

// Mock child components
vi.mock('./CapitalCompositionAreaChart', () => ({
  CapitalCompositionAreaChart: vi.fn(({ showRealValues }) => (
    <div data-testid="area-chart">Area Chart {showRealValues ? '(real)' : '(nominal)'}</div>
  )),
}))

vi.mock('./YearOverYearBarChart', () => ({
  YearOverYearBarChart: vi.fn(({ showRealValues }) => (
    <div data-testid="bar-chart">Bar Chart {showRealValues ? '(real)' : '(nominal)'}</div>
  )),
}))

describe('EnhancedVisualizationSection', () => {
  const mockSimulationData: SimulationResult = {
    2023: {
      startkapital: 10000,
      endkapital: 10500,
      zinsen: 500,
      bezahlteSteuer: 150,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      genutzterFreibetrag: 150,
    },
    2024: {
      startkapital: 22500,
      endkapital: 23700,
      zinsen: 1200,
      bezahlteSteuer: 360,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      genutzterFreibetrag: 360,
    },
  }

  it('renders title', () => {
    render(<EnhancedVisualizationSection simulationData={mockSimulationData} />)

    expect(screen.getByText(/Erweiterte Visualisierungen/i)).toBeInTheDocument()
  })

  it('shows area chart by default', () => {
    render(<EnhancedVisualizationSection simulationData={mockSimulationData} />)

    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
  })

  it('renders chart type toggle buttons', () => {
    render(<EnhancedVisualizationSection simulationData={mockSimulationData} />)

    expect(screen.getByRole('button', { name: /Kapitalzusammensetzung/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Jahr-zu-Jahr/i })).toBeInTheDocument()
  })

  it('switches to bar chart when button clicked', () => {
    render(<EnhancedVisualizationSection simulationData={mockSimulationData} />)

    // Initially shows area chart
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()

    // Click bar chart button
    const barChartButton = screen.getByRole('button', { name: /Jahr-zu-Jahr/i })
    fireEvent.click(barChartButton)

    // Now shows bar chart
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
  })

  it('switches back to area chart when button clicked', () => {
    render(<EnhancedVisualizationSection simulationData={mockSimulationData} />)

    // Switch to bar chart
    const barChartButton = screen.getByRole('button', { name: /Jahr-zu-Jahr/i })
    fireEvent.click(barChartButton)
    expect(screen.getByTestId('bar-chart')).toBeInTheDocument()

    // Switch back to area chart
    const areaChartButton = screen.getByRole('button', { name: /Kapitalzusammensetzung/i })
    fireEvent.click(areaChartButton)
    expect(screen.getByTestId('area-chart')).toBeInTheDocument()
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
  })

  it('renders real values toggle', () => {
    render(<EnhancedVisualizationSection simulationData={mockSimulationData} />)

    expect(screen.getByRole('switch')).toBeInTheDocument()
    expect(screen.getByLabelText(/Real \(inflationsbereinigt\)/i)).toBeInTheDocument()
  })

  it('toggles real values when switch clicked', () => {
    render(<EnhancedVisualizationSection simulationData={mockSimulationData} />)

    const toggle = screen.getByRole('switch')

    // Initially shows nominal values
    expect(screen.getByText(/Area Chart \(nominal\)/i)).toBeInTheDocument()

    // Toggle to real values
    fireEvent.click(toggle)
    expect(screen.getByText(/Area Chart \(real\)/i)).toBeInTheDocument()

    // Toggle back to nominal
    fireEvent.click(toggle)
    expect(screen.getByText(/Area Chart \(nominal\)/i)).toBeInTheDocument()
  })

  it('applies showRealValues prop as initial state', () => {
    render(<EnhancedVisualizationSection simulationData={mockSimulationData} showRealValues />)

    expect(screen.getByText(/Area Chart \(real\)/i)).toBeInTheDocument()
    // Check for inflation text in title specifically
    expect(screen.getAllByText(/inflationsbereinigt/i)).toHaveLength(2) // Title + label
  })

  it('renders usage hints', () => {
    render(<EnhancedVisualizationSection simulationData={mockSimulationData} />)

    expect(screen.getByText(/Verwendungshinweise/i)).toBeInTheDocument()
    expect(screen.getByText(/Kapitalzusammensetzung:/i)).toBeInTheDocument()
    expect(screen.getByText(/Jahr-zu-Jahr:/i)).toBeInTheDocument()
    expect(screen.getByText(/PNG Export:/i)).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <EnhancedVisualizationSection simulationData={mockSimulationData} className="custom-class" />
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('shows "no data" message when simulation data is empty', () => {
    render(<EnhancedVisualizationSection simulationData={{}} />)

    expect(
      screen.getByText(/Keine Daten verfügbar. Führen Sie zuerst eine Simulation durch./i)
    ).toBeInTheDocument()
    expect(screen.queryByTestId('area-chart')).not.toBeInTheDocument()
    expect(screen.queryByTestId('bar-chart')).not.toBeInTheDocument()
  })

  it('updates chart when real values toggle changes', () => {
    render(<EnhancedVisualizationSection simulationData={mockSimulationData} />)

    // Initially nominal for area chart
    expect(screen.getByText(/Area Chart \(nominal\)/i)).toBeInTheDocument()

    // Switch to bar chart
    const barChartButton = screen.getByRole('button', { name: /Jahr-zu-Jahr/i })
    fireEvent.click(barChartButton)
    expect(screen.getByText(/Bar Chart \(nominal\)/i)).toBeInTheDocument()

    // Toggle real values
    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)

    // Bar chart should show real values
    expect(screen.getByText(/Bar Chart \(real\)/i)).toBeInTheDocument()

    // Switch back to area chart - should also show real values
    const areaChartButton = screen.getByRole('button', { name: /Kapitalzusammensetzung/i })
    fireEvent.click(areaChartButton)
    expect(screen.getByText(/Area Chart \(real\)/i)).toBeInTheDocument()
  })
})
