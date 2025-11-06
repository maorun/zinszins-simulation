/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
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

describe('HomePage Integration Tests - Optimized', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders the main calculator interface', () => {
    render(<HomePage />)

    // Check main tabs
    expect(screen.getByText('Ansparen')).toBeInTheDocument()
    expect(screen.getByText('Entnehmen')).toBeInTheDocument()

    // Check that we have the enhanced overview section
    const finanzuebersicht = screen.queryByText(/Finanzübersicht/)
    expect(finanzuebersicht).toBeInTheDocument()
  })

  it('has working tab navigation between Ansparen and Entnehmen', () => {
    render(<HomePage />)

    const ansparenTab = screen.getByText('Ansparen')
    const entnehmenTab = screen.getByText('Entnehmen')

    // Should have both tabs
    expect(ansparenTab).toBeInTheDocument()
    expect(entnehmenTab).toBeInTheDocument()

    // Click on Entnehmen tab - should not crash
    fireEvent.click(entnehmenTab)

    // Click back on Ansparen tab - should not crash
    fireEvent.click(ansparenTab)
  })

  it('displays financial overview when enhanced summary is available', () => {
    render(<HomePage />)

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
    const { container } = render(<HomePage />)

    // Should render configuration sections without errors
    expect(container).toBeInTheDocument()

    // Should have some form elements
    const formElements = container.querySelectorAll('input, select, button')
    expect(formElements.length).toBeGreaterThan(0)
  })

  it('shows collapsible configuration section', async () => {
    render(<HomePage />)

    // The configuration section should always be present
    await waitFor(
      () => {
        const configHeading = screen.getByText(/⚙️ Konfiguration/)
        expect(configHeading).toBeInTheDocument()
      },
      { timeout: 1000 },
    )

    // Simply verify that the collapsible mechanism works by checking it has data-state
    const configSection = screen.getByText(/⚙️ Konfiguration/).closest('[data-state]')
    expect(configSection).toBeInTheDocument()

    // The configuration should be collapsible (has a clickable parent element)
    const clickableParent = screen.getByText(/⚙️ Konfiguration/).closest('button, [role="button"], [aria-expanded]')
    expect(clickableParent).toBeInTheDocument()
  })

  it('displays savings plan creation interface', async () => {
    const user = userEvent.setup()
    const { container } = render(<HomePage />)

    // First ensure we're on the correct tab (Ansparen)
    await waitFor(
      () => {
        const ansparenTab = screen.getByText('Ansparen')
        expect(ansparenTab).toBeInTheDocument()
      },
      { timeout: 1000 },
    )

    // Click the Ansparen tab to make sure it's active
    const ansparenTab = screen.getByText('Ansparen')
    await user.click(ansparenTab)
    await new Promise((resolve) => setTimeout(resolve, 200))

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
    await new Promise((resolve) => setTimeout(resolve, 500))

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
    await new Promise((resolve) => setTimeout(resolve, 500))

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
    const { container } = render(<HomePage />)
    const endTime = Date.now()

    // Should render quickly (under 2 seconds in test environment)
    expect(endTime - startTime).toBeLessThan(2000)

    // Should not crash
    expect(container).toBeInTheDocument()
  })
})
