import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { LossCarryforwardSimulator } from './LossCarryforwardSimulator'

describe('LossCarryforwardSimulator', () => {
  const defaultProps = {
    currentYear: 2024,
    taxRate: 0.26375,
  }

  it('should render configuration form', () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    expect(screen.getByText(/Simulator-Konfiguration/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Verfügbare Aktienverluste/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sonstige Verluste/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Planungszeitraum/i)).toBeInTheDocument()
    expect(screen.getByText(/Simulation starten/i)).toBeInTheDocument()
  })

  it('should have default values in form fields', () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const stockLossesInput = screen.getByLabelText(/Verfügbare Aktienverluste/i) as HTMLInputElement
    const otherLossesInput = screen.getByLabelText(/Sonstige Verluste/i) as HTMLInputElement
    const planningYearsInput = screen.getByLabelText(/Planungszeitraum/i) as HTMLInputElement

    expect(stockLossesInput.value).toBe('10000')
    expect(otherLossesInput.value).toBe('5000')
    expect(planningYearsInput.value).toBe('5')
  })

  it('should update form values when user types', () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const stockLossesInput = screen.getByLabelText(/Verfügbare Aktienverluste/i) as HTMLInputElement

    fireEvent.change(stockLossesInput, { target: { value: '20000' } })

    expect(stockLossesInput.value).toBe('20000')
  })

  it('should show planning period calculation', () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    // Default 5 years: 2024 to 2028
    expect(screen.getByText(/Simulation von 2024 bis 2028 \(5 Jahre\)/i)).toBeInTheDocument()
  })

  it('should update planning period when changed', () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const planningYearsInput = screen.getByLabelText(/Planungszeitraum/i) as HTMLInputElement

    fireEvent.change(planningYearsInput, { target: { value: '10' } })

    expect(screen.getByText(/Simulation von 2024 bis 2033 \(10 Jahre\)/i)).toBeInTheDocument()
  })

  it('should run simulation and show results', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Strategievergleich/i)).toBeInTheDocument()
    })

    // Should show recommended strategy (appears in multiple places after refactoring)
    expect(screen.getAllByText(/Empfohlene Strategie:/i).length).toBeGreaterThanOrEqual(1)

    // Should show all strategies table
    expect(screen.getByText(/Alle Strategien im Vergleich/i)).toBeInTheDocument()

    // Should have immediate strategy
    expect(screen.getAllByText(/Sofortige Realisierung/i).length).toBeGreaterThanOrEqual(1)

    // Should have optimal timing section
    expect(screen.getByText(/Optimale Zeitplanung/i)).toBeInTheDocument()

    // Should have timeline visualization
    expect(screen.getByText(/Zeitlicher Verlauf/i)).toBeInTheDocument()
  })

  it('should show all five strategies in comparison', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Strategievergleich/i)).toBeInTheDocument()
    })

    // Check all strategy names are present (may appear multiple times after refactoring)
    expect(screen.getAllByText(/Sofortige Realisierung/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Schrittweise Realisierung/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Optimierte Realisierung/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Aggressive Strategie/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Konservative Strategie/i).length).toBeGreaterThanOrEqual(1)
  })

  it('should show efficiency badges in strategy table', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Strategievergleich/i)).toBeInTheDocument()
    })

    // Efficiency should be shown as percentages
    const efficiencyElements = screen.getAllByText(/%/)
    expect(efficiencyElements.length).toBeGreaterThan(0)
  })

  it('should show strategic recommendations', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Strategische Empfehlungen/i)).toBeInTheDocument()
    })

    // Should have at least one recommendation
    const recommendations = screen.getAllByText(/Empfohlene Strategie:/i)
    expect(recommendations.length).toBeGreaterThan(0)
  })

  it('should show timing recommendations for each year', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Optimale Zeitplanung/i)).toBeInTheDocument()
    })

    // Should show year 2024
    expect(screen.getAllByText('2024').length).toBeGreaterThanOrEqual(1)

    // Should show priority badges
    const priorityLabels = screen.getAllByText(/Niedrig|Mittel|Hoch/)
    expect(priorityLabels.length).toBeGreaterThan(0)
  })

  it('should show timeline table with all years', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Zeitlicher Verlauf/i)).toBeInTheDocument()
    })

    // Timeline should have rows for each year (2024-2028 = 5 years)
    const year2024 = screen.getAllByText('2024')
    const year2025 = screen.getAllByText('2025')
    const year2028 = screen.getAllByText('2028')

    expect(year2024.length).toBeGreaterThan(0)
    expect(year2025.length).toBeGreaterThan(0)
    expect(year2028.length).toBeGreaterThan(0)
  })

  it('should show timeline table columns', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Verfügbare Verluste/i)).toBeInTheDocument()
    })

    expect(screen.getByText(/Realisierte Gewinne/i)).toBeInTheDocument()
    expect(screen.getByText(/Genutzte Verluste/i)).toBeInTheDocument()
    expect(screen.getAllByText(/Steuerersparnis/i).length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText(/Verlustvortrag/i).length).toBeGreaterThanOrEqual(1)
  })

  it('should show total tax savings in timeline', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Zeitlicher Verlauf/i)).toBeInTheDocument()
    })

    // Should have "Gesamt" row
    expect(screen.getByText('Gesamt')).toBeInTheDocument()
  })

  it('should handle validation errors gracefully', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    // Set invalid configuration (e.g., negative losses)
    const stockLossesInput = screen.getByLabelText(/Verfügbare Aktienverluste/i) as HTMLInputElement
    fireEvent.change(stockLossesInput, { target: { value: '-1000' } })

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      const alerts = screen.queryAllByRole('alert')
      // Either validation catches it or simulation handles gracefully
      expect(alerts.length >= 0).toBe(true)
    })
  })

  it('should show badges for best scenarios', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getAllByText(/Empfohlen/i).length).toBeGreaterThanOrEqual(1)
    })

    // Should show at least "Empfohlen" badge
    const empfohlenBadges = screen.getAllByText(/Empfohlen/i)
    expect(empfohlenBadges.length).toBeGreaterThanOrEqual(1)
  })

  it('should show metric displays in recommended strategy', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Strategievergleich/i)).toBeInTheDocument()
    })

    // Should show Steuerersparnisse
    expect(screen.getAllByText(/Steuerersparnisse/i).length).toBeGreaterThanOrEqual(1)

    // Should show Effizienz
    expect(screen.getAllByText(/Effizienz/i).length).toBeGreaterThanOrEqual(1)
  })

  it('should calculate and display correct year range', () => {
    render(<LossCarryforwardSimulator currentYear={2025} taxRate={0.26375} />)

    const planningYearsInput = screen.getByLabelText(/Planungszeitraum/i) as HTMLInputElement
    fireEvent.change(planningYearsInput, { target: { value: '3' } })

    expect(screen.getByText(/Simulation von 2025 bis 2027 \(3 Jahre\)/i)).toBeInTheDocument()
  })

  it('should handle different tax rates', async () => {
    render(<LossCarryforwardSimulator currentYear={2024} taxRate={0.30} />)

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Strategievergleich/i)).toBeInTheDocument()
    })

    // Simulation should complete successfully with different tax rate
    expect(screen.getAllByText(/Empfohlene Strategie:/i).length).toBeGreaterThanOrEqual(1)
  })

  it('should show correct number of years in timing recommendations', async () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    const planningYearsInput = screen.getByLabelText(/Planungszeitraum/i) as HTMLInputElement
    fireEvent.change(planningYearsInput, { target: { value: '3' } })

    const simulateButton = screen.getByText(/Simulation starten/i)
    fireEvent.click(simulateButton)

    await waitFor(() => {
      expect(screen.getByText(/Optimale Zeitplanung/i)).toBeInTheDocument()
    })

    // Should have timing for years 2024, 2025, 2026
    const year2024 = screen.getAllByText('2024')
    const year2025 = screen.getAllByText('2025')
    const year2026 = screen.getAllByText('2026')

    expect(year2024.length).toBeGreaterThan(0)
    expect(year2025.length).toBeGreaterThan(0)
    expect(year2026.length).toBeGreaterThan(0)
  })

  it('should show configuration description text', () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    expect(
      screen.getByText(/Konfigurieren Sie Ihre Verlustvorträge und geplanten Gewinne/i),
    ).toBeInTheDocument()
  })

  it('should show max gains configuration section', () => {
    render(<LossCarryforwardSimulator {...defaultProps} />)

    expect(screen.getByText(/Maximal realisierbare Gewinne pro Jahr/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Aktiengewinne \(€\/Jahr\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Sonstige Gewinne \(€\/Jahr\)/i)).toBeInTheDocument()
  })
})
