/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TaxConfiguration from './TaxConfiguration'

// Mock useSimulation hook
const mockUseSimulation = {
  performSimulation: vi.fn(),
  steuerlast: 26.375,
  setSteuerlast: vi.fn(),
  teilfreistellungsquote: 30,
  setTeilfreistellungsquote: vi.fn(),
  freibetragPerYear: { 2023: 2000 },
  setFreibetragPerYear: vi.fn(),
  steuerReduzierenEndkapitalSparphase: true,
  setSteuerReduzierenEndkapitalSparphase: vi.fn(),
  steuerReduzierenEndkapitalEntspharphase: true,
  setSteuerReduzierenEndkapitalEntspharphase: vi.fn(),
  grundfreibetragAktiv: true,
  setGrundfreibetragAktiv: vi.fn(),
  grundfreibetragBetrag: 11604,
  setGrundfreibetragBetrag: vi.fn(),
}

vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => mockUseSimulation,
}))

// Mock BasiszinsConfiguration to avoid complex dependencies
vi.mock('./BasiszinsConfiguration', () => ({
  default: () => <div data-testid="basiszins-configuration">BasiszinsConfiguration</div>,
}))

// Helper function to expand the Grundfreibetrag section
const expandGrundfreibetragSection = async () => {
  const grundfreibetragTrigger = screen.getByText('🏠 Grundfreibetrag-Konfiguration')
  fireEvent.click(grundfreibetragTrigger)
}

describe('TaxConfiguration - Planning Mode Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays individual planning mode values correctly', async () => {
    render(<TaxConfiguration planningMode="individual" />)

    await expandGrundfreibetragSection()

    // Should show individual-specific values (text may be split across elements)
    expect(screen.getByText('Einzelpersonen')).toBeInTheDocument()
    expect(screen.getByText('11,604')).toBeInTheDocument()
  })

  it('displays couple planning mode values correctly', async () => {
    render(<TaxConfiguration planningMode="couple" />)

    await expandGrundfreibetragSection()

    // Should show couple-specific values (text may be split across elements)
    expect(screen.getByText('Paare')).toBeInTheDocument()
    expect(screen.getByText('23,208')).toBeInTheDocument()
  })

  it('sets correct Grundfreibetrag when activating for individual', async () => {
    // Reset the mock state to simulate the switch being off initially
    vi.mocked(mockUseSimulation).grundfreibetragAktiv = false

    render(<TaxConfiguration planningMode="individual" />)

    await expandGrundfreibetragSection()

    // Click on the Grundfreibetrag switch
    const grundfreibetragSwitch = screen.getByRole('switch')
    fireEvent.click(grundfreibetragSwitch)

    // Should set to individual value (11604)
    expect(mockUseSimulation.setGrundfreibetragBetrag).toHaveBeenCalledWith(11604)
  })

  it('sets correct Grundfreibetrag when activating for couple', async () => {
    // Reset the mock state to simulate the switch being off initially
    vi.mocked(mockUseSimulation).grundfreibetragAktiv = false

    render(<TaxConfiguration planningMode="couple" />)

    await expandGrundfreibetragSection()

    // Click on the Grundfreibetrag switch
    const grundfreibetragSwitch = screen.getByRole('switch')
    fireEvent.click(grundfreibetragSwitch)

    // Should set to couple value (23208)
    expect(mockUseSimulation.setGrundfreibetragBetrag).toHaveBeenCalledWith(23208)
  })

  it('shows correct reset button text for individual', async () => {
    render(<TaxConfiguration planningMode="individual" />)

    await expandGrundfreibetragSection()

    // Should show "Reset (Einzelpersonen)" button
    expect(screen.getByText(/Reset \(/)).toBeInTheDocument()
    expect(screen.getByText('Einzelpersonen')).toBeInTheDocument()
  })

  it('shows correct reset button text for couple', async () => {
    render(<TaxConfiguration planningMode="couple" />)

    await expandGrundfreibetragSection()

    // Should show "Reset (Paare)" button
    expect(screen.getByText(/Reset \(/)).toBeInTheDocument()
    expect(screen.getByText('Paare')).toBeInTheDocument()
  })

  it('resets to correct value when reset button is clicked for individual', async () => {
    render(<TaxConfiguration planningMode="individual" />)

    await expandGrundfreibetragSection()

    // Click reset button
    const resetButton = screen.getByText(/Reset \(/)
    fireEvent.click(resetButton)

    // Should reset to individual value (11604)
    expect(mockUseSimulation.setGrundfreibetragBetrag).toHaveBeenCalledWith(11604)
    expect(mockUseSimulation.performSimulation).toHaveBeenCalled()
  })

  it('resets to correct value when reset button is clicked for couple', async () => {
    render(<TaxConfiguration planningMode="couple" />)

    await expandGrundfreibetragSection()

    // Click reset button
    const resetButton = screen.getByText(/Reset \(/)
    fireEvent.click(resetButton)

    // Should reset to couple value (23208)
    expect(mockUseSimulation.setGrundfreibetragBetrag).toHaveBeenCalledWith(23208)
    expect(mockUseSimulation.performSimulation).toHaveBeenCalled()
  })

  it('defaults to individual planning mode when no prop is provided', async () => {
    render(<TaxConfiguration />)

    await expandGrundfreibetragSection()

    // Should default to individual values
    expect(screen.getByText('Einzelpersonen')).toBeInTheDocument()
    expect(screen.getByText('11,604')).toBeInTheDocument()
  })

  it('displays planning mode explanation text', async () => {
    render(<TaxConfiguration planningMode="couple" />)

    await expandGrundfreibetragSection()

    // Should show explanation about automatic planning mode setting
    expect(screen.getByText(/Der Grundfreibetrag wird automatisch basierend auf dem Planungsmodus/)).toBeInTheDocument()
  })
})
