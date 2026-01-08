import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TaxBurdenAnalysisCard } from './TaxBurdenAnalysisCard'
import type { SimulationResult } from '../utils/simulate'
import userEvent from '@testing-library/user-event'

describe('TaxBurdenAnalysisCard', () => {
  it('should not render when simulation result is undefined', () => {
    const { container } = render(<TaxBurdenAnalysisCard simulationResult={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('should not render when simulation result is empty', () => {
    const { container } = render(<TaxBurdenAnalysisCard simulationResult={{}} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render with minimal simulation data', () => {
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
    }

    render(<TaxBurdenAnalysisCard simulationResult={simulationResult} />)

    // Check title is rendered
    expect(screen.getByText('📊 Steuerbelastungs-Verlaufsanalyse')).toBeInTheDocument()
  })

  it('should display correct summary metrics', async () => {
    const user = userEvent.setup()
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
      2025: {
        startkapital: 10500,
        zinsen: 600,
        endkapital: 11100,
        bezahlteSteuer: 120,
        genutzterFreibetrag: 600,
        vorabpauschale: 60,
        vorabpauschaleAccumulated: 110,
      },
    }

    render(<TaxBurdenAnalysisCard simulationResult={simulationResult} />)

    // Expand the card
    const trigger = screen.getByRole('button', { name: /Steuerbelastungs-Verlaufsanalyse/i })
    await user.click(trigger)

    // Check total tax paid
    expect(screen.getByText('220,00 €')).toBeInTheDocument() // Total tax: 100 + 120

    // Check average tax rate (220 / 1100 * 100 = 20%)
    expect(screen.getByText('20.00%')).toBeInTheDocument()

    // Check total allowance used
    expect(screen.getByText('1.100,00 €')).toBeInTheDocument() // 500 + 600

    // Check total vorabpauschale
    expect(screen.getByText('110,00 €')).toBeInTheDocument() // 50 + 60
  })

  it('should identify and highlight peak tax year', async () => {
    const user = userEvent.setup()
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
      2025: {
        startkapital: 10500,
        zinsen: 600,
        endkapital: 11100,
        bezahlteSteuer: 200, // Peak year
        genutzterFreibetrag: 600,
        vorabpauschale: 60,
        vorabpauschaleAccumulated: 110,
      },
      2026: {
        startkapital: 11100,
        zinsen: 700,
        endkapital: 11800,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 700,
        vorabpauschale: 70,
        vorabpauschaleAccumulated: 180,
      },
    }

    render(<TaxBurdenAnalysisCard simulationResult={simulationResult} />)

    // Expand the card
    const trigger = screen.getByRole('button', { name: /Steuerbelastungs-Verlaufsanalyse/i })
    await user.click(trigger)

    // Check peak year alert
    expect(screen.getByText(/Höchste Steuerbelastung/i)).toBeInTheDocument()
    expect(screen.getByText(/2025/)).toBeInTheDocument()
    expect(screen.getByText(/200,00 €/)).toBeInTheDocument()
  })

  it('should show optimization opportunities for high tax years', async () => {
    const user = userEvent.setup()
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
      2025: {
        startkapital: 10500,
        zinsen: 600,
        endkapital: 11100,
        bezahlteSteuer: 150, // Above threshold
        genutzterFreibetrag: 600,
        vorabpauschale: 60,
        vorabpauschaleAccumulated: 110,
      },
      2026: {
        startkapital: 11100,
        zinsen: 700,
        endkapital: 11800,
        bezahlteSteuer: 100, // Below threshold
        genutzterFreibetrag: 700,
        vorabpauschale: 70,
        vorabpauschaleAccumulated: 180,
      },
    }

    render(<TaxBurdenAnalysisCard simulationResult={simulationResult} />)

    // Expand the card
    const trigger = screen.getByRole('button', { name: /Steuerbelastungs-Verlaufsanalyse/i })
    await user.click(trigger)

    // Check optimization alert
    expect(screen.getByText(/Optimierungsmöglichkeiten/i)).toBeInTheDocument()
  })

  it('should display yearly breakdown table with correct data', async () => {
    const user = userEvent.setup()
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
      2025: {
        startkapital: 10500,
        zinsen: 600,
        endkapital: 11100,
        bezahlteSteuer: 120,
        genutzterFreibetrag: 600,
        vorabpauschale: 60,
        vorabpauschaleAccumulated: 110,
      },
    }

    render(<TaxBurdenAnalysisCard simulationResult={simulationResult} />)

    // Expand the card
    const trigger = screen.getByRole('button', { name: /Steuerbelastungs-Verlaufsanalyse/i })
    await user.click(trigger)

    // Check table headers
    expect(screen.getByText('Jahr')).toBeInTheDocument()
    expect(screen.getByText('Gewinne')).toBeInTheDocument()
    expect(screen.getByText('Steuern')).toBeInTheDocument()
    expect(screen.getByText('Steuersatz')).toBeInTheDocument()
    expect(screen.getByText('Vorabpauschale')).toBeInTheDocument()
    expect(screen.getByText('Freibetrag')).toBeInTheDocument()

    // Check year data - use getAllByText for values that appear multiple times
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('2025')).toBeInTheDocument()

    // Check totals row exists
    expect(screen.getByText('Gesamt')).toBeInTheDocument()
  })

  it('should expand and collapse when clicking trigger', async () => {
    const user = userEvent.setup()
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
    }

    render(<TaxBurdenAnalysisCard simulationResult={simulationResult} />)

    // Initially collapsed - details not visible
    expect(screen.queryByText('Jährliche Aufschlüsselung')).not.toBeInTheDocument()

    // Click to expand
    const trigger = screen.getByRole('button', { name: /Steuerbelastungs-Verlaufsanalyse/i })
    await user.click(trigger)

    // Now details should be visible
    expect(screen.getByText('Jährliche Aufschlüsselung')).toBeInTheDocument()

    // Click to collapse
    await user.click(trigger)

    // Details should be hidden again
    expect(screen.queryByText('Jährliche Aufschlüsselung')).not.toBeInTheDocument()
  })

  it('should display legend with explanations', async () => {
    const user = userEvent.setup()
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
    }

    render(<TaxBurdenAnalysisCard simulationResult={simulationResult} />)

    // Expand the card
    const trigger = screen.getByRole('button', { name: /Steuerbelastungs-Verlaufsanalyse/i })
    await user.click(trigger)

    // Check legend exists
    expect(screen.getByText('Legende:')).toBeInTheDocument()
    expect(screen.getByText(/Jahr mit höchster Steuerbelastung/i)).toBeInTheDocument()
    expect(screen.getByText(/Überdurchschnittliche Steuerbelastung/i)).toBeInTheDocument()
  })

  it('should apply correct CSS classes for highlighting', async () => {
    const user = userEvent.setup()
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
      2025: {
        startkapital: 10500,
        zinsen: 600,
        endkapital: 11100,
        bezahlteSteuer: 200, // Peak year
        genutzterFreibetrag: 600,
        vorabpauschale: 60,
        vorabpauschaleAccumulated: 110,
      },
    }

    const { container } = render(<TaxBurdenAnalysisCard simulationResult={simulationResult} />)

    // Expand the card
    const trigger = screen.getByRole('button', { name: /Steuerbelastungs-Verlaufsanalyse/i })
    await user.click(trigger)

    // Check that peak year row has bg-red-50 class
    const peakYearRow = container.querySelector('.bg-red-50')
    expect(peakYearRow).toBeInTheDocument()
  })

  it('should handle years with zero gains', async () => {
    const user = userEvent.setup()
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 0, // Zero gains
        endkapital: 10000,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
      2025: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
    }

    render(<TaxBurdenAnalysisCard simulationResult={simulationResult} />)

    // Expand the card
    const trigger = screen.getByRole('button', { name: /Steuerbelastungs-Verlaufsanalyse/i })
    await user.click(trigger)

    // Should render without errors
    expect(screen.getByText('2024')).toBeInTheDocument()
    expect(screen.getByText('2025')).toBeInTheDocument()

    // Year 2024 should show 0.00% tax rate
    expect(screen.getByText('0.00%')).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
    }

    const { container } = render(<TaxBurdenAnalysisCard simulationResult={simulationResult} className="custom-class" />)

    // Check that custom class is applied to the Card
    const card = container.querySelector('.custom-class')
    expect(card).toBeInTheDocument()
  })

  it('should format currency values correctly', async () => {
    const user = userEvent.setup()
    const simulationResult: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 1234.56,
        endkapital: 11234.56,
        bezahlteSteuer: 123.45,
        genutzterFreibetrag: 500,
        vorabpauschale: 50.5,
        vorabpauschaleAccumulated: 50.5,
      },
    }

    render(<TaxBurdenAnalysisCard simulationResult={simulationResult} />)

    // Expand the card
    const trigger = screen.getByRole('button', { name: /Steuerbelastungs-Verlaufsanalyse/i })
    await user.click(trigger)

    // Check formatted values (German format with comma as decimal separator)
    expect(screen.getByText('123,45 €')).toBeInTheDocument()
    expect(screen.getByText('50,50 €')).toBeInTheDocument()
  })
})
