/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react'
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

  it('loads the application with basic UI elements', () => {
    render(<App />)

    // Check that the main page structure loads
    expect(screen.getByText('💼 Zinseszins-Simulation')).toBeInTheDocument()
    expect(screen.getByText('🔄 Neu berechnen')).toBeInTheDocument()

    // Check that main sections are present
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument()
    expect(screen.getByText('💾 Konfiguration verwalten')).toBeInTheDocument()

    // Check tabs are present
    expect(screen.getByText('Ansparen')).toBeInTheDocument()
    expect(screen.getByText('Entnehmen')).toBeInTheDocument()
  })

  it('renders the complete application structure without errors', () => {
    const { container } = render(<App />)

    // Should render without throwing
    expect(container).toBeInTheDocument()

    // Should have the main app structure
    const mainContent = container.querySelector('div') // Updated to check for main div element
    expect(mainContent).toBeInTheDocument()
  })

  it('has proper navigation and UI components', () => {
    render(<App />)

    // Check footer elements exist
    expect(screen.getByText('📧 by Marco')).toBeInTheDocument()
    expect(screen.getByText('🚀 Erstellt mit React, TypeScript & RSuite')).toBeInTheDocument()

    // Check that configuration sections exist
    const configElements = screen.getAllByText(/Konfiguration/)
    expect(configElements.length).toBeGreaterThan(0)
  })
})
