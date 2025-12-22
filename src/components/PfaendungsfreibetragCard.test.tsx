import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PfaendungsfreibetragCard } from './PfaendungsfreibetragCard'

describe('PfaendungsfreibetragCard', () => {
  it('should render the component with collapsed state', () => {
    render(<PfaendungsfreibetragCard />)

    // Card header should be visible
    expect(screen.getByText(/Pfändungsschutz-Rechner/i)).toBeInTheDocument()
  })

  it('should show enable switch when expanded', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    // Expand the card
    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    // Enable switch should be visible
    await waitFor(() => {
      expect(screen.getByText(/Pfändungsschutz-Analyse aktivieren/i)).toBeInTheDocument()
    })
  })

  it('should show info message when expanded', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    await waitFor(() => {
      expect(screen.getByText(/Bei Schuldensituationen relevant/i)).toBeInTheDocument()
    })
  })

  it('should show configuration fields when enabled', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    // Expand the card
    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    // Find and enable the switch
    await waitFor(() => {
      const enableSwitch = screen.getByRole('switch')
      expect(enableSwitch).toBeInTheDocument()
    })

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    // Configuration fields should appear - use getAllByText for label that appears multiple times
    await waitFor(() => {
      const labels = screen.getAllByText(/Monatliches Nettoeinkommen/i)
      expect(labels.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/Anzahl Unterhaltsberechtigter/i)).toBeInTheDocument()
    })
  })

  it('should show rules info box when enabled', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      expect(screen.getByText(/Pfändungsschutz in Deutschland:/i)).toBeInTheDocument()
      expect(screen.getByText(/Grundbetrag: 1.491,75 €/i)).toBeInTheDocument()
    })
  })

  it('should show asset configuration fields when enabled', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      const ruerupLabels = screen.getAllByText(/Rürup-Rente/i)
      expect(ruerupLabels.length).toBeGreaterThanOrEqual(1)
      const riesterLabels = screen.getAllByText(/Riester-Rente/i)
      expect(riesterLabels.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/Sonstige Altersvorsorge/i)).toBeInTheDocument()
    })
  })

  it('should calculate and display income protection', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    // Expand and enable
    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    // Enter income
    await waitFor(() => {
      const incomeInputs = screen.getAllByRole('spinbutton')
      expect(incomeInputs.length).toBeGreaterThan(0)
    })

    const incomeInputs = screen.getAllByRole('spinbutton')
    const incomeInput = incomeInputs[0] // First input should be income
    await user.clear(incomeInput)
    await user.type(incomeInput, '3000')

    // Wait for calculation to appear
    await waitFor(() => {
      expect(screen.getByText(/Einkommensschutz/i)).toBeInTheDocument()
    })
  })

  it('should display protected and garnishable amounts', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      const incomeInputs = screen.getAllByRole('spinbutton')
      expect(incomeInputs[0]).toBeInTheDocument()
    })

    const incomeInputs = screen.getAllByRole('spinbutton')
    await user.clear(incomeInputs[0])
    await user.type(incomeInputs[0], '2500')

    await waitFor(() => {
      expect(screen.getByText(/Geschützter Betrag:/i)).toBeInTheDocument()
      expect(screen.getByText(/Pfändbarer Betrag:/i)).toBeInTheDocument()
    })
  })

  it('should update protection when dependents are added', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(1)
    })

    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.type(inputs[0], '3000')
    await user.clear(inputs[1])
    await user.type(inputs[1], '2')

    await waitFor(() => {
      expect(screen.getByText(/Schutz erhöht durch 2 Unterhaltsberechtigte/i)).toBeInTheDocument()
    })
  })

  it('should show asset protection display when assets are entered', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(2)
    })

    const inputs = screen.getAllByRole('spinbutton')
    // Enter Rürup capital (should be 3rd input after income and dependents)
    await user.clear(inputs[2])
    await user.type(inputs[2], '200000')

    await waitFor(() => {
      expect(screen.getByText(/Vermögensschutz \(Altersvorsorge\)/i)).toBeInTheDocument()
    })
  })

  it('should show recommendations when calculation is complete', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(4)
    })

    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.type(inputs[0], '3000')
    await user.clear(inputs[4]) // Other pension capital
    await user.type(inputs[4], '50000')

    await waitFor(() => {
      expect(screen.getByText(/Empfehlungen zur Vermögensabsicherung/i)).toBeInTheDocument()
    })
  })

  it('should hide configuration when disabled', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      const labels = screen.getAllByText(/Monatliches Nettoeinkommen/i)
      expect(labels.length).toBeGreaterThanOrEqual(1)
    })

    // Disable again
    await user.click(enableSwitch)

    await waitFor(() => {
      // Check by role since text appears in results too
      const inputs = screen.queryAllByRole('spinbutton')
      expect(inputs.length).toBe(0)
    })
  })

  it('should show warning for fully garnishable income', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs[0]).toBeInTheDocument()
    })

    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[0])
    await user.type(inputs[0], '6000') // Above threshold

    await waitFor(() => {
      expect(screen.getByText(/gesamte Einkommen pfändbar/i)).toBeInTheDocument()
    })
  })

  it('should display Rürup protection information correctly', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(2)
    })

    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[2])
    await user.type(inputs[2], '150000')

    await waitFor(() => {
      expect(screen.getByText(/Rürup-Rente gesamt:/i)).toBeInTheDocument()
    })
  })

  it('should display Riester protection as fully protected', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(3)
    })

    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[3])
    await user.type(inputs[3], '80000')

    await waitFor(() => {
      const riesterLabels = screen.getAllByText(/Riester-Rente/i)
      expect(riesterLabels.length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText(/Vollständig geschützt in Ansparphase/i)).toBeInTheDocument()
    })
  })

  it('should warn about unprotected other pension capital', async () => {
    const user = userEvent.setup()
    render(<PfaendungsfreibetragCard />)

    const header = screen.getByText(/Pfändungsschutz-Rechner/i)
    await user.click(header)

    const enableSwitch = screen.getByRole('switch')
    await user.click(enableSwitch)

    await waitFor(() => {
      const inputs = screen.getAllByRole('spinbutton')
      expect(inputs.length).toBeGreaterThan(4)
    })

    const inputs = screen.getAllByRole('spinbutton')
    await user.clear(inputs[4])
    await user.type(inputs[4], '30000')

    await waitFor(() => {
      expect(screen.getByText(/Meist nicht geschützt bei Pfändung/i)).toBeInTheDocument()
    })
  })
})
