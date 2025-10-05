import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { InteractiveChart } from './InteractiveChart'
import type { SimulationResult } from '../utils/simulate'

describe('InteractiveChart', () => {
  // Mock simulation data for testing
  const mockSimulationData: SimulationResult = {
    2025: {
      startkapital: 10000,
      zinsen: 500,
      endkapital: 10500,
      bezahlteSteuer: 50,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      startkapitalReal: 10000,
      zinsenReal: 500,
      endkapitalReal: 10500,
    },
    2026: {
      startkapital: 20500,
      zinsen: 1025,
      endkapital: 21525,
      bezahlteSteuer: 100,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      startkapitalReal: 20000,
      zinsenReal: 1000,
      endkapitalReal: 21000,
    },
    2027: {
      startkapital: 31525,
      zinsen: 1576,
      endkapital: 33101,
      bezahlteSteuer: 150,
      genutzterFreibetrag: 0,
      vorabpauschale: 0,
      vorabpauschaleAccumulated: 0,
      startkapitalReal: 30000,
      zinsenReal: 1500,
      endkapitalReal: 31500,
    },
  }

  it('renders chart component with title', () => {
    render(<InteractiveChart simulationData={mockSimulationData} />)

    expect(screen.getByText('📈 Kapitalentwicklung')).toBeInTheDocument()
  })

  it('renders chart component with real values when showRealValues is true', () => {
    render(<InteractiveChart simulationData={mockSimulationData} showRealValues={true} />)

    expect(screen.getByText('📈 Kapitalentwicklung')).toBeInTheDocument()
    expect(screen.getByText('(inflationsbereinigt)')).toBeInTheDocument()
  })

  it('renders interactive controls in collapsible section', async () => {
    const user = userEvent.setup()
    render(<InteractiveChart simulationData={mockSimulationData} />)

    // Controls should be hidden initially
    expect(screen.queryByLabelText('Real (inflationsbereinigt)')).not.toBeInTheDocument()
    // Click the collapsible trigger to reveal controls
    const settingsButton = screen.getByRole('button', { name: /Chart-Einstellungen/i })
    expect(settingsButton).toBeInTheDocument()
    await user.click(settingsButton)

    // Now controls should be visible
    expect(screen.getByLabelText('Real (inflationsbereinigt)')).toBeInTheDocument()
    expect(screen.getByLabelText('Steuern anzeigen')).toBeInTheDocument()
    expect(screen.getByText('Übersicht')).toBeInTheDocument()
    expect(screen.getByText('Detail')).toBeInTheDocument()
  })

  it('displays interpretation guide', () => {
    render(<InteractiveChart simulationData={mockSimulationData} />)

    expect(screen.getByText(/Chart-Interpretation:/)).toBeInTheDocument()
    expect(screen.getByText('Blaue Fläche:')).toBeInTheDocument()
    expect(screen.getByText('Grüne Fläche:')).toBeInTheDocument()
    expect(screen.getByText('Rote Linie:')).toBeInTheDocument()
    expect(screen.getByText('Gelbe gestrichelte Linie:')).toBeInTheDocument()
    expect(screen.getByText(/Interaktive Funktionen:/)).toBeInTheDocument()
  })

  it('applies custom className when provided', () => {
    const { container } = render(
      <InteractiveChart simulationData={mockSimulationData} className="test-class" />,
    )

    expect(container.firstChild).toHaveClass('test-class')
  })

  it('handles empty simulation data gracefully', () => {
    const emptyData: SimulationResult = {}

    render(<InteractiveChart simulationData={emptyData} />)

    expect(screen.getByText('📈 Kapitalentwicklung')).toBeInTheDocument()
  })

  it('renders responsive container for chart', () => {
    render(<InteractiveChart simulationData={mockSimulationData} />)

    // The ResponsiveContainer should create appropriate DOM structure
    const chartContainer = document.querySelector('.recharts-responsive-container')
    expect(chartContainer).toBeInTheDocument()
  })
})
