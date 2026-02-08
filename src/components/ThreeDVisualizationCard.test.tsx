import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ThreeDVisualizationCard } from './ThreeDVisualizationCard'
import type { SimulationResult, SimulationResultElement } from '../utils/simulate'

// Mock the ThreeDVisualization component
vi.mock('./ThreeDVisualization', () => ({
  ThreeDVisualization: ({ dataPoints }: { dataPoints: unknown[] }) => (
    <div data-testid="3d-visualization">3D Visualization with {dataPoints.length} points</div>
  ),
}))

describe('ThreeDVisualizationCard', () => {
  const mockSimulationResult: SimulationResult = {
    2023: {
      startkapital: 10000,
      zinsen: 500,
      endkapital: 10500,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
    } as SimulationResultElement,
    2024: {
      startkapital: 10500,
      zinsen: 525,
      endkapital: 11025,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
    } as SimulationResultElement,
    2025: {
      startkapital: 11025,
      zinsen: 551,
      endkapital: 11576,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
    } as SimulationResultElement,
  }

  it('should render card with title and description', () => {
    render(<ThreeDVisualizationCard simulationResult={mockSimulationResult} />)

    expect(screen.getByText('3D-Visualisierung: Zeit-Rendite-Kapital')).toBeInTheDocument()
    expect(
      screen.getByText('Interaktive dreidimensionale Darstellung der Kapitalentwicklung im Zeitverlauf')
    ).toBeInTheDocument()
  })

  it('should display info box with instructions', () => {
    render(<ThreeDVisualizationCard simulationResult={mockSimulationResult} />)

    expect(screen.getByText('Wie die 3D-Visualisierung funktioniert:')).toBeInTheDocument()
    expect(screen.getByText('X-Achse (horizontal):')).toBeInTheDocument()
    expect(screen.getByText('Zeitverlauf in Jahren')).toBeInTheDocument()
    expect(screen.getByText('Y-Achse (vertikal):')).toBeInTheDocument()
    expect(screen.getByText('Jährliche Rendite in Prozent')).toBeInTheDocument()
    expect(screen.getByText('Z-Achse (Tiefe):')).toBeInTheDocument()
    expect(screen.getByText('Kapitalwert in Euro')).toBeInTheDocument()
  })

  it('should render control switches', () => {
    render(<ThreeDVisualizationCard simulationResult={mockSimulationResult} />)

    expect(screen.getByText('Färbung nach Rendite')).toBeInTheDocument()
    expect(screen.getByText('Verbindungslinien')).toBeInTheDocument()
    expect(screen.getByText('Achsenbeschriftung')).toBeInTheDocument()
  })

  it('should render 3D visualization when data is available', () => {
    render(<ThreeDVisualizationCard simulationResult={mockSimulationResult} />)

    expect(screen.getByTestId('3d-visualization')).toBeInTheDocument()
  })

  it('should show message when no simulation data is available', () => {
    render(<ThreeDVisualizationCard />)

    expect(
      screen.getByText(/Keine Simulationsdaten verfügbar. Bitte führen Sie zuerst eine Simulation durch/)
    ).toBeInTheDocument()
  })

  it('should show message when simulation result is empty', () => {
    render(<ThreeDVisualizationCard simulationResult={{}} />)

    expect(
      screen.getByText(/Keine Simulationsdaten verfügbar. Bitte führen Sie zuerst eine Simulation durch/)
    ).toBeInTheDocument()
  })

  it('should display color legend when data is available and colorByReturn is enabled', () => {
    render(<ThreeDVisualizationCard simulationResult={mockSimulationResult} />)

    expect(screen.getByText('Farblegende (Rendite):')).toBeInTheDocument()
    expect(screen.getByText('< -5%')).toBeInTheDocument()
    expect(screen.getByText('-5% bis 0%')).toBeInTheDocument()
    expect(screen.getByText('0% bis 5%')).toBeInTheDocument()
    expect(screen.getByText('5% bis 10%')).toBeInTheDocument()
    expect(screen.getByText('> 10%')).toBeInTheDocument()
  })

  it('should render with box icon in title', () => {
    const { container } = render(<ThreeDVisualizationCard simulationResult={mockSimulationResult} />)

    // Check for the presence of the box icon (Lucide icon renders as SVG)
    const boxIcon = container.querySelector('svg.lucide-box')
    expect(boxIcon).toBeInTheDocument()
  })

  it('should render with info icon in info box', () => {
    const { container } = render(<ThreeDVisualizationCard simulationResult={mockSimulationResult} />)

    // Check for the presence of the info icon
    const infoIcon = container.querySelector('svg.lucide-info')
    expect(infoIcon).toBeInTheDocument()
  })

  it('should handle single year simulation', () => {
    const singleYearResult: SimulationResult = {
      2023: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      } as SimulationResultElement,
    }

    render(<ThreeDVisualizationCard simulationResult={singleYearResult} />)

    expect(screen.getByTestId('3d-visualization')).toBeInTheDocument()
  })

  it('should handle large simulation datasets', () => {
    const largeSimulation: SimulationResult = {}
    for (let year = 2023; year <= 2072; year++) {
      largeSimulation[year] = {
        startkapital: 10000 * Math.pow(1.05, year - 2023),
        zinsen: 500 * Math.pow(1.05, year - 2023),
        endkapital: 10500 * Math.pow(1.05, year - 2023),
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      } as SimulationResultElement
    }

    render(<ThreeDVisualizationCard simulationResult={largeSimulation} />)

    expect(screen.getByTestId('3d-visualization')).toBeInTheDocument()
  })
})
