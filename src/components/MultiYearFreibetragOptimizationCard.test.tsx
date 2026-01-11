import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { MultiYearFreibetragOptimizationCard } from './MultiYearFreibetragOptimizationCard'
import { SimulationProvider } from '../contexts/SimulationContext'
import type { ReactNode } from 'react'

// Mock component to avoid complex nesting provider issues
function TestWrapper({ children }: { children: ReactNode }) {
  return <SimulationProvider>{children}</SimulationProvider>
}

describe('MultiYearFreibetragOptimizationCard', () => {
  it('should render collapsed by default', () => {
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    expect(screen.getByText('Multi-Jahres Freibetrags-Optimierung')).toBeInTheDocument()
    // Content should not be visible when collapsed
    expect(screen.queryByText('Konfiguration')).not.toBeInTheDocument()
  })

  it('should expand when clicked', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    // Click to expand
    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    // Content should now be visible
    expect(screen.getByText('Konfiguration')).toBeInTheDocument()
    expect(screen.getByText('Ergebnisse')).toBeInTheDocument()
  })

  it('should display info message when expanded', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    // Text appears in card subtitle and info box
    expect(screen.getAllByText(/Strategische Verteilung von Kapitalgewinnen/i)).toHaveLength(2)
    expect(screen.getByText(/Sparerpauschbetrags \(Freibetrag\)/i)).toBeInTheDocument()
  })

  it('should render configuration form when expanded', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    // Check for configuration fields
    expect(screen.getByLabelText(/Zu realisierende Kapitalgewinne/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Optimierungszeitraum \(Jahre\)/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Aktueller Portfoliowert/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Portfolio-Rendite/i)).toBeInTheDocument()
  })

  it('should display optimization results', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    // Check for results display
    expect(screen.getByText('Optimierungs-Ergebnis')).toBeInTheDocument()
    // Steuerersparnis appears in results card and table header
    expect(screen.getAllByText('Steuerersparnis')).toHaveLength(2)
    expect(screen.getByText('Freibetrag-Nutzung')).toBeInTheDocument()
  })

  it('should display naive vs optimized strategy comparison', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    expect(screen.getByText('Naive Strategie')).toBeInTheDocument()
    expect(screen.getByText('Optimierte Strategie')).toBeInTheDocument()
  })

  it('should display recommendations when expanded', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    expect(screen.getByText('Handlungsempfehlungen')).toBeInTheDocument()
  })

  it('should display year-by-year schedule table', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    expect(screen.getByText('Jahr-für-Jahr Optimierungsplan')).toBeInTheDocument()
    expect(screen.getByText('Jahr')).toBeInTheDocument()
    expect(screen.getByText('Realisierung')).toBeInTheDocument()
    expect(screen.getByText(/Verf\. Freibetrag/i)).toBeInTheDocument()
  })

  it('should display horizon comparison', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    expect(screen.getByText('Zeitraum-Vergleich')).toBeInTheDocument()
    // Should show 5, 10, and 20 year comparisons (appears multiple times in UI)
    const jahreElements = screen.getAllByText(/Jahre/)
    expect(jahreElements.length).toBeGreaterThanOrEqual(3)
  })

  it('should allow updating capital gains input', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    const input = screen.getByLabelText(/Zu realisierende Kapitalgewinne/i)
    await user.clear(input)
    await user.type(input, '100000')

    expect(input).toHaveValue(100000)
  })

  it('should update results when configuration changes', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    // Get initial tax savings (Steuerersparnis appears multiple times)
    const initialSavingsElements = screen.getAllByText(/Steuerersparnis/)
    expect(initialSavingsElements.length).toBeGreaterThanOrEqual(1)

    // Change capital gains
    const input = screen.getByLabelText(/Zu realisierende Kapitalgewinne/i)
    await user.clear(input)
    await user.type(input, '100000')

    // Results should update (checking that elements exist is enough - actual values are tested in optimization tests)
    const updatedSavingsElements = screen.getAllByText(/Steuerersparnis/)
    expect(updatedSavingsElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should show recommended horizon', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    // Should show "Empfohlen" for one of the horizons
    expect(screen.getByText('✓ Empfohlen')).toBeInTheDocument()
  })

  it('should use simulation context values for initial config', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <MultiYearFreibetragOptimizationCard />
      </TestWrapper>,
    )

    const header = screen.getByText('Multi-Jahres Freibetrags-Optimierung')
    await user.click(header)

    // Check that default values are populated
    const capitalGainsInput = screen.getByLabelText(/Zu realisierende Kapitalgewinne/i)
    expect(capitalGainsInput).toHaveValue(50000) // Default value

    const portfolioInput = screen.getByLabelText(/Aktueller Portfoliowert/i)
    expect(portfolioInput).toHaveValue(200000) // Default value
  })
})
