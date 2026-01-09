/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ReactElement } from 'react'
import HomePage from './HomePage'

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}))

// Mock expensive operations
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
}))

// Helper to render with router
function renderWithRouter(ui: ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>)
}

describe('Dashboard Customization Integration', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should render dashboard customization button in header', async () => {
    renderWithRouter(<HomePage />)

    // Wait for the button to appear
    const customizeButton = await screen.findByRole('button', { name: /dashboard anpassen/i })
    expect(customizeButton).toBeInTheDocument()
  })

  it('should open customization dialog when button is clicked', async () => {
    renderWithRouter(<HomePage />)

    const customizeButton = await screen.findByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(customizeButton)

    // Dialog should open
    expect(await screen.findByText('Dashboard-Ansicht anpassen')).toBeInTheDocument()
  })

  it('should show all sections in customization dialog', async () => {
    renderWithRouter(<HomePage />)

    const customizeButton = await screen.findByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(customizeButton)

    // Check for some key section labels
    expect(await screen.findByText('Einführung')).toBeInTheDocument()
    expect(screen.getByText('Zeitspanne')).toBeInTheDocument()
    expect(screen.getByText('Sparplan-Eingabe')).toBeInTheDocument()
  })

  it('should persist customization preferences', async () => {
    const { unmount } = renderWithRouter(<HomePage />)

    const customizeButton = await screen.findByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(customizeButton)

    // Toggle a section visibility
    const switches = screen.getAllByRole('switch')
    fireEvent.click(switches[0])

    // Close dialog
    const doneButton = screen.getByRole('button', { name: /fertig/i })
    fireEvent.click(doneButton)

    unmount()

    // Re-render and check if preferences persisted
    renderWithRouter(<HomePage />)

    const customizeButtonAgain = await screen.findByRole('button', { name: /dashboard anpassen/i })
    fireEvent.click(customizeButtonAgain)

    // Preferences should be loaded from localStorage
    expect(screen.getByText('Dashboard-Ansicht anpassen')).toBeInTheDocument()
  })

  it('should display recalculate button alongside customization button', async () => {
    renderWithRouter(<HomePage />)

    const recalculateButton = await screen.findByRole('button', { name: /neu berechnen/i })
    const customizeButton = await screen.findByRole('button', { name: /dashboard anpassen/i })

    expect(recalculateButton).toBeInTheDocument()
    expect(customizeButton).toBeInTheDocument()
  })
})
