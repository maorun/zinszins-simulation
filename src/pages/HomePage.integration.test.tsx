/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { ReactElement } from 'react'
import HomePage from '../pages/HomePage'

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

// Mock all expensive operations to prevent hanging
vi.mock('../utils/simulate', () => ({
  SimulationAnnual: { yearly: 'yearly', monthly: 'monthly' },
  simulate: vi.fn(() => []),
}))

vi.mock('../utils/enhanced-summary', () => ({
  getEnhancedOverviewSummary: vi.fn(() => ({
    startkapital: 408000,
    endkapital: 596168.79,
    zinsen: 188168.79,
    bezahlteSteuer: 0,
    renditeAnsparphase: 4.6,
  })),
}))

vi.mock('../../helpers/withdrawal', () => ({
  calculateWithdrawal: vi.fn(() => ({ result: {} })),
  getTotalCapitalAtYear: vi.fn(() => 596168.79),
  calculateWithdrawalDuration: vi.fn(() => 25),
}))

// Helper to render with router
function renderWithRouter(ui: ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('HomePage Integration Tests - Optimized', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the main calculator interface', async () => {
    renderWithRouter(<HomePage />)

    // Wait for wizard navigation to render
    await waitFor(
      () => {
        expect(screen.getByText(/Zeitspanne festlegen/i)).toBeInTheDocument()
        expect(screen.getByText(/Schritt 1 von 4/i)).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    // Check that we have the enhanced overview section
    const finanzuebersicht = screen.queryByText(/Finanzübersicht/)
    expect(finanzuebersicht).toBeInTheDocument()
  })

  it('has working wizard navigation between steps', async () => {
    renderWithRouter(<HomePage />)

    // Wait for wizard to load
    await waitFor(
      () => {
        expect(screen.getByText(/Zeitspanne festlegen/i)).toBeInTheDocument()
      },
      { timeout: 5000 },
    )

    // Advance to next step
    const nextButton = screen.getByRole('button', { name: /^Weiter$/ })
    fireEvent.click(nextButton)

    // Should now show step 2 (Sparplan)
    expect(screen.getByText(/Sparplan festlegen/i)).toBeInTheDocument()
  })

  it('displays financial overview when enhanced summary is available', () => {
    renderWithRouter(<HomePage />)

    // Should show financial metrics
    const overviewSection = screen.queryByText(/Finanzübersicht/)
    expect(overviewSection).toBeInTheDocument()

    // Should show currency formatting
    const currencyElements = screen.getAllByText(/€/)
    expect(currencyElements.length).toBeGreaterThan(0)

    // Should show percentage formatting
    const percentageElements = screen.getAllByText(/%/)
    expect(percentageElements.length).toBeGreaterThan(0)
  })

  it('handles simulation configuration without errors', () => {
    const { container } = renderWithRouter(<HomePage />)

    // Should render configuration sections without errors
    expect(container).toBeInTheDocument()

    // Should have some form elements
    const formElements = container.querySelectorAll('input, select, button')
    expect(formElements.length).toBeGreaterThan(0)
  })

  it('shows wizard navigation with step progress', async () => {
    renderWithRouter(<HomePage />)

    // The wizard navigation should be present with step indicators
    await waitFor(
      () => {
        expect(screen.getByText(/Zeitspanne festlegen/i)).toBeInTheDocument()
        expect(screen.getByText(/Schritt 1 von 4/i)).toBeInTheDocument()
      },
      { timeout: 1000 },
    )

    // The wizard should have navigation buttons
    expect(screen.getByRole('button', { name: /zurück/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /^Weiter$/ })).toBeInTheDocument()
  })

  it('displays savings plan configuration in wizard step 2', async () => {
    const user = userEvent.setup()
    const { container } = renderWithRouter(<HomePage />)

    // Wait for wizard to load
    await waitFor(
      () => {
        expect(screen.getByText(/Zeitspanne festlegen/i)).toBeInTheDocument()
      },
      { timeout: 1000 },
    )

    // Navigate to step 2 (Sparplan)
    const nextButton = screen.getByRole('button', { name: /^Weiter$/ })
    await user.click(nextButton)

    // Should now show sparplan configuration
    await waitFor(
      () => {
        expect(screen.getByText(/Sparplan festlegen/i)).toBeInTheDocument()
        // "Monatliche Sparrate" appears in both label and summary section
        expect(screen.getAllByText(/Monatliche Sparrate/i).length).toBeGreaterThanOrEqual(1)
      },
      { timeout: 2000 },
    )

    // Should have input elements
    const inputElements = container.querySelectorAll('input')
    expect(inputElements.length).toBeGreaterThan(0)
  })

  it('renders without performance issues', () => {
    const startTime = Date.now()
    const { container } = renderWithRouter(<HomePage />)
    const endTime = Date.now()

    // Should render quickly (under 2 seconds in test environment)
    expect(endTime - startTime).toBeLessThan(2000)

    // Should not crash
    expect(container).toBeInTheDocument()
  })
})
