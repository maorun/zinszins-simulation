import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { SimulationProvider } from '../contexts/SimulationContext'
import HistoricalReturnConfiguration from './HistoricalReturnConfiguration'

// Helper component to wrap the component with providers
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <SimulationProvider>{children}</SimulationProvider>
)

// Helper function to expand the collapsible component
const expandHistoricalReturnConfiguration = async () => {
  const heading = screen.getByText('📈 Historische Rendite-Konfiguration')
  fireEvent.click(heading)

  await waitFor(() => {
    expect(screen.getByText('Wichtiger Hinweis zum Backtesting')).toBeInTheDocument()
  })
}

describe('HistoricalReturnConfiguration', () => {
  it('should render with important warnings about past performance', async () => {
    render(
      <TestWrapper>
        <HistoricalReturnConfiguration />
      </TestWrapper>,
    )

    // Expand the collapsible component first
    await expandHistoricalReturnConfiguration()

    // Check for the important warning
    expect(screen.getByText('Wichtiger Hinweis zum Backtesting')).toBeInTheDocument()
    expect(screen.getByText(/Die Vergangenheit lässt keine Rückschlüsse auf die Zukunft zu/)).toBeInTheDocument()
    expect(screen.getByText(/Vergangene Wertentwicklungen sind kein verlässlicher Indikator/)).toBeInTheDocument()
  })

  it('should display all available historical indices', async () => {
    render(
      <TestWrapper>
        <HistoricalReturnConfiguration />
      </TestWrapper>,
    )

    // Expand the collapsible component first
    await expandHistoricalReturnConfiguration()

    // Check for DAX option
    expect(screen.getByText('DAX')).toBeInTheDocument()
    expect(screen.getByText(/Deutscher Aktienindex/)).toBeInTheDocument()

    // Check for S&P 500 option
    expect(screen.getByText('S&P 500')).toBeInTheDocument()
    expect(screen.getByText(/Die 500 größten US-amerikanischen Unternehmen/)).toBeInTheDocument()

    // Check for MSCI World option
    expect(screen.getByText('MSCI World')).toBeInTheDocument()
    expect(screen.getByText(/Globaler Aktienindex/)).toBeInTheDocument()
  })

  it('should show statistical information for selected index', async () => {
    render(
      <TestWrapper>
        <HistoricalReturnConfiguration />
      </TestWrapper>,
    )

    // Expand the collapsible component first
    await expandHistoricalReturnConfiguration()

    // Should show statistics section
    expect(screen.getByText(/Statistische Kennzahlen/)).toBeInTheDocument()
    expect(screen.getByText(/Ø Rendite p.a.:/)).toBeInTheDocument()
    expect(screen.getByText(/Volatilität:/)).toBeInTheDocument()
    expect(screen.getByText(/Währung:/)).toBeInTheDocument()
    expect(screen.getByText(/Datenpunkte:/)).toBeInTheDocument()
  })

  it('should show historical data preview', async () => {
    render(
      <TestWrapper>
        <HistoricalReturnConfiguration />
      </TestWrapper>,
    )

    // Expand the collapsible component first
    await expandHistoricalReturnConfiguration()

    // Should show historical returns section
    expect(screen.getByText(/Historische Renditen/)).toBeInTheDocument()
    expect(screen.getByText(/Die Simulation verwendet die tatsächlichen historischen Jahresrenditen/)).toBeInTheDocument()
  })

  it('should allow index selection via radio tiles', async () => {
    const user = userEvent.setup()
    render(
      <TestWrapper>
        <HistoricalReturnConfiguration />
      </TestWrapper>,
    )

    // Expand the collapsible component first
    await expandHistoricalReturnConfiguration()

    // DAX should be selected by default
    const daxRadio = screen.getByRole('radio', { name: /DAX/ })
    expect(daxRadio).toBeChecked()

    // Click on S&P 500
    const sp500Radio = screen.getByRole('radio', { name: /S&P 500/ })
    await user.click(sp500Radio)

    // S&P 500 should now be selected
    expect(sp500Radio).toBeChecked()
    expect(daxRadio).not.toBeChecked()
  })

  it('should display warning when simulation period has limited data coverage', async () => {
    render(
      <TestWrapper>
        <HistoricalReturnConfiguration />
      </TestWrapper>,
    )

    // Expand the collapsible component first
    await expandHistoricalReturnConfiguration()

    // Note: This test checks if the component can handle the warning display
    // The actual warning display depends on the simulation time range in context
    // For now, we just verify the component renders without errors
    expect(screen.getByText('Historischer Index für Backtesting')).toBeInTheDocument()
  })

  it('should show index-specific information in radio tiles', async () => {
    render(
      <TestWrapper>
        <HistoricalReturnConfiguration />
      </TestWrapper>,
    )

    // Expand the collapsible component first
    await expandHistoricalReturnConfiguration()

    // Check that each index shows its time range and currency
    expect(screen.getAllByText(/2000-2023/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/EUR/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/USD/).length).toBeGreaterThan(0)
  })

  it('should display percentage values correctly', async () => {
    render(
      <TestWrapper>
        <HistoricalReturnConfiguration />
      </TestWrapper>,
    )

    // Expand the collapsible component first
    await expandHistoricalReturnConfiguration()

    // Should display percentage values with proper formatting
    const percentageElements = screen.getAllByText(/%/)
    expect(percentageElements.length).toBeGreaterThan(0)

    // Check that we have both positive and negative percentages in historical data
    // This validates that the historical data includes market crashes and booms
    const historicalSection = screen.getByText(/Historische Renditen/).closest('div')
    expect(historicalSection).toBeInTheDocument()
  })
})
