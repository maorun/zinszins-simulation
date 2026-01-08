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

    // Wait for lazy-loaded components to render - use getAllByRole to find tabs
    await waitFor(
      () => {
        const tabs = screen.getAllByRole('tab')
        expect(tabs.length).toBeGreaterThanOrEqual(3)
        const tabTexts = tabs.map(tab => tab.textContent)
        expect(tabTexts.some(text => text?.includes('Sparen'))).toBe(true)
        expect(tabTexts.some(text => text?.includes('Entnahme'))).toBe(true)
        expect(tabTexts.some(text => text?.includes('Sonstiges'))).toBe(true)
      },
      { timeout: 5000 },
    )

    // Check that we have the enhanced overview section
    const finanzuebersicht = screen.queryByText(/Finanzübersicht/)
    expect(finanzuebersicht).toBeInTheDocument()
  })

  it('has working tab navigation between Sparen, Entnahme, and Sonstiges', async () => {
    renderWithRouter(<HomePage />)

    // Wait for lazy-loaded components - use getAllByRole to be safe
    await waitFor(
      () => {
        const tabs = screen.getAllByRole('tab')
        expect(tabs.length).toBeGreaterThanOrEqual(3)
      },
      { timeout: 5000 },
    )

    // Get tabs by role to find the navigation tabs specifically
    const tabs = screen.getAllByRole('tab')
    const sparenTab = tabs.find(tab => tab.textContent?.includes('💰 Sparen'))
    const entnahmeTab = tabs.find(tab => tab.textContent?.includes('🏦 Entnahme'))
    const sonstigesTab = tabs.find(tab => tab.textContent?.includes('⚙️ Sonstiges'))

    // Should have all three tabs
    expect(sparenTab).toBeDefined()
    expect(entnahmeTab).toBeDefined()
    expect(sonstigesTab).toBeDefined()

    // Click on Entnahme tab - should not crash
    fireEvent.click(entnahmeTab!)

    // Click on Sonstiges tab - should not crash
    fireEvent.click(sonstigesTab!)

    // Click back on Sparen tab - should not crash
    fireEvent.click(sparenTab!)
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

  it('shows collapsible configuration section', async () => {
    renderWithRouter(<HomePage />)

    // The Grundeinstellungen category should always be present in the Sonstiges tab
    await waitFor(
      () => {
        const configHeading = screen.getByText(/📊 Grundeinstellungen/)
        expect(configHeading).toBeInTheDocument()
      },
      { timeout: 1000 },
    )

    // Simply verify that the collapsible mechanism works by checking it has data-state
    const configSection = screen.getByText(/📊 Grundeinstellungen/).closest('[data-state]')
    expect(configSection).toBeInTheDocument()

    // The configuration should be collapsible (has a clickable parent element)
    const clickableParent = screen.getByText(/📊 Grundeinstellungen/).closest('button, [role="button"], [aria-expanded]')
    expect(clickableParent).toBeInTheDocument()
  })

  it('displays savings plan creation interface', async () => {
    const user = userEvent.setup()
    const { container } = renderWithRouter(<HomePage />)

    // First ensure we're on the correct tab (Sparen)
    await waitFor(
      () => {
        const sparenTab = screen.getByText(/💰 Sparen/)
        expect(sparenTab).toBeInTheDocument()
      },
      { timeout: 1000 },
    )

    // Click the Sparen tab to make sure it's active
    const sparenTab = screen.getByText(/💰 Sparen/)
    await user.click(sparenTab)
    await new Promise(resolve => setTimeout(resolve, 200))

    // Find and expand the outer "💼 Sparpläne erstellen" section
    await waitFor(
      () => {
        const sparplanHeading = screen.getByText(/💼 Sparpläne erstellen/)
        expect(sparplanHeading).toBeInTheDocument()
      },
      { timeout: 1000 },
    )

    const sparplanHeading = screen.getByText(/💼 Sparpläne erstellen/)
    await user.click(sparplanHeading)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Now find and expand the inner "💰 Sparpläne erstellen" section (the actual form)
    await waitFor(
      () => {
        const innerSparplanHeading = screen.getByText(/💰 Sparpläne erstellen/)
        expect(innerSparplanHeading).toBeInTheDocument()
      },
      { timeout: 1000 },
    )

    const innerSparplanHeading = screen.getByText(/💰 Sparpläne erstellen/)
    await user.click(innerSparplanHeading)
    await new Promise(resolve => setTimeout(resolve, 500))

    // Now the input elements should be visible
    await waitFor(
      () => {
        const inputElements = container.querySelectorAll('input')
        expect(inputElements.length).toBeGreaterThan(0)
      },
      { timeout: 2000 },
    )
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
