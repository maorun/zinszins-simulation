/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

// Mock Vercel Analytics to avoid network calls in tests
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

// Mock all expensive operations to prevent hanging
vi.mock('./utils/simulate', () => ({
  SimulationAnnual: { yearly: 'yearly', monthly: 'monthly' },
  simulate: vi.fn(() => []),
}))

vi.mock('./utils/enhanced-summary', () => ({
  getEnhancedOverviewSummary: vi.fn(() => null),
}))

vi.mock('../helpers/withdrawal', () => ({
  calculateWithdrawal: vi.fn(() => ({ result: {} })),
  getTotalCapitalAtYear: vi.fn(() => 0),
  calculateWithdrawalDuration: vi.fn(() => 0),
}))

describe('App Integration Tests - Optimized', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loads the application with basic UI elements', async () => {
    render(<App />)

    // Wait for the page to load with all main elements
    await waitFor(
      () => {
        // Check for header
        expect(screen.getByText(/Zinseszins-Simulation/)).toBeInTheDocument()
        // Check for main button
        expect(screen.getByText(/Neu berechnen/)).toBeInTheDocument()
        // Check for navigation tabs - use getAllByRole since there are multiple role="tab" elements
        const tabs = screen.getAllByRole('tab')
        expect(tabs.length).toBeGreaterThanOrEqual(3)
        // Verify the tab names
        const tabTexts = tabs.map(tab => tab.textContent)
        expect(tabTexts.some(text => text?.includes('Sparen'))).toBe(true)
        expect(tabTexts.some(text => text?.includes('Entnahme'))).toBe(true)
        expect(tabTexts.some(text => text?.includes('Sonstiges'))).toBe(true)
      },
      { timeout: 10000 }, // Increased timeout for lazy loading
    )
  }, 15000) // Increase timeout for this entire test to 15 seconds

  it('renders the complete application structure without errors', () => {
    const { container } = render(<App />)

    // Should render without throwing
    expect(container).toBeInTheDocument()

    // Should have the main app structure
    const mainContent = container.querySelector('div') // Updated to check for main div element
    expect(mainContent).toBeInTheDocument()
  })

  it('has proper navigation and UI components', async () => {
    render(<App />)

    // Wait for lazy-loaded components to render
    await waitFor(
      () => {
        expect(screen.getByText('📧 by Marco')).toBeInTheDocument()
        expect(screen.getByText('🚀 Erstellt mit React, TypeScript & shadcn/ui')).toBeInTheDocument()
      },
      { timeout: 2500 }, // Reduced from 5000ms to fit within test timeout
    )

    // Check that configuration sections exist
    const configElements = screen.getAllByText(/Konfiguration/)
    expect(configElements.length).toBeGreaterThan(0)
  }, 10000) // Increase timeout for this entire test to 10 seconds
})
