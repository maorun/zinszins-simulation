import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { SimulationProvider } from '../contexts/SimulationContext'
import { ReverseCalculatorCard } from './ReverseCalculatorCard'
import userEvent from '@testing-library/user-event'
import type { ReactElement } from 'react'

// Wrapper to provide simulation context
function renderWithContext(ui: ReactElement) {
  return render(<SimulationProvider>{ui}</SimulationProvider>)
}

describe('ReverseCalculatorCard', () => {
  it('should render the component', () => {
    renderWithContext(<ReverseCalculatorCard />)

    expect(screen.getByText(/Reverse-Rechner/i)).toBeInTheDocument()
  })

  it('should display info message', async () => {
    renderWithContext(<ReverseCalculatorCard />)

    // Click to expand the collapsible first
    const header = screen.getByText(/Reverse-Rechner/i)
    await userEvent.click(header)

    // Now the info message should be visible
    await waitFor(() => {
      expect(screen.getByText(/Dieser Rechner berechnet die erforderliche Sparrate/i)).toBeInTheDocument()
    })
  })

  it('should have input fields for configuration', async () => {
    renderWithContext(<ReverseCalculatorCard />)

    // Click to expand the collapsible
    const header = screen.getByText(/Reverse-Rechner/i)
    await userEvent.click(header)

    await waitFor(() => {
      expect(screen.getByLabelText(/Zielkapital/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Zeitraum/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Erwartete Rendite/i)).toBeInTheDocument()
    })
  })

  it('should have calculate button', async () => {
    renderWithContext(<ReverseCalculatorCard />)

    // Click to expand
    const header = screen.getByText(/Reverse-Rechner/i)
    await userEvent.click(header)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Erforderliche Sparrate berechnen/i })).toBeInTheDocument()
    })
  })

  it('should show results after calculation', async () => {
    renderWithContext(<ReverseCalculatorCard />)
    const user = userEvent.setup()

    // Click to expand
    const header = screen.getByText(/Reverse-Rechner/i)
    await user.click(header)

    // Wait for form to be visible
    await waitFor(() => {
      expect(screen.getByLabelText(/Zielkapital/i)).toBeInTheDocument()
    })

    // Click calculate with default values (they're already set)
    const calculateButton = screen.getByRole('button', { name: /Erforderliche Sparrate berechnen/i })
    await user.click(calculateButton)

    // Wait for results to appear with longer timeout
    await waitFor(
      () => {
        expect(screen.getByText(/Berechnete Sparrate/i)).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('should toggle between monthly and yearly modes', async () => {
    renderWithContext(<ReverseCalculatorCard />)
    const user = userEvent.setup()

    // Click to expand
    const header = screen.getByText(/Reverse-Rechner/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByText(/Monatlich/i)).toBeInTheDocument()
      expect(screen.getByText(/Jährlich/i)).toBeInTheDocument()
    })

    // Click yearly button
    const yearlyButton = screen.getByRole('button', { name: /Jährlich/i })
    await user.click(yearlyButton)

    // Verify it's in yearly mode (button should be selected)
    expect(yearlyButton).toHaveClass('bg-primary')
  })

  it('should display sensitivity analysis after calculation', async () => {
    renderWithContext(<ReverseCalculatorCard />)
    const user = userEvent.setup()

    // Click to expand
    const header = screen.getByText(/Reverse-Rechner/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByLabelText(/Zielkapital/i)).toBeInTheDocument()
    })

    // Enter values
    const targetCapitalInput = screen.getByLabelText(/Zielkapital/i)
    await user.clear(targetCapitalInput)
    await user.type(targetCapitalInput, '500000')

    // Click calculate
    const calculateButton = screen.getByRole('button', { name: /Erforderliche Sparrate berechnen/i })
    await user.click(calculateButton)

    // Wait for sensitivity analysis to appear
    await waitFor(() => {
      expect(screen.getByText(/Sensitivitätsanalyse/i)).toBeInTheDocument()
    })
  })

  it('should update configuration values', async () => {
    renderWithContext(<ReverseCalculatorCard />)
    const user = userEvent.setup()

    // Click to expand
    const header = screen.getByText(/Reverse-Rechner/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByLabelText(/Zielkapital/i)).toBeInTheDocument()
    })

    // Enter values
    const targetCapitalInput = screen.getByLabelText(/Zielkapital/i) as HTMLInputElement
    await user.clear(targetCapitalInput)
    await user.type(targetCapitalInput, '1000000')

    // Verify value is updated
    expect(targetCapitalInput.value).toBe('1000000')
  })

  it('should show total contributions and net gain in results', async () => {
    renderWithContext(<ReverseCalculatorCard />)
    const user = userEvent.setup()

    // Click to expand
    const header = screen.getByText(/Reverse-Rechner/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByLabelText(/Zielkapital/i)).toBeInTheDocument()
    })

    // Enter values and calculate
    const targetCapitalInput = screen.getByLabelText(/Zielkapital/i)
    await user.clear(targetCapitalInput)
    await user.type(targetCapitalInput, '500000')

    const calculateButton = screen.getByRole('button', { name: /Erforderliche Sparrate berechnen/i })
    await user.click(calculateButton)

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Gesamtbeiträge/i)).toBeInTheDocument()
      expect(screen.getByText(/Nettogewinn/i)).toBeInTheDocument()
      expect(screen.getByText(/Steuern gesamt/i)).toBeInTheDocument()
      expect(screen.getByText(/Kosten gesamt/i)).toBeInTheDocument()
    })
  })
})
