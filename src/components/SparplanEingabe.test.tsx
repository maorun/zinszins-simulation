import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { SparplanEingabe } from './SparplanEingabe'
import { SimulationAnnual } from '../utils/simulate'
import type { Sparplan } from '../utils/sparplan-utils'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}))

describe('SparplanEingabe localStorage sync', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with default sparplan when no currentSparplans provided', () => {
    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
      />,
    )

    // Should show the initial default sparplan
    expect(screen.getByText(/19\.800,00 €/)).toBeInTheDocument()
  })

  it('should initialize with provided currentSparplans', () => {
    const customSparplans: Sparplan[] = [
      {
        id: 100,
        start: new Date('2024-01-01'),
        end: new Date('2030-12-31'),
        einzahlung: 24000,
      },
      {
        id: 200,
        start: new Date('2025-01-01'),
        end: null,
        einzahlung: 12000,
      },
    ]

    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
        currentSparplans={customSparplans}
      />,
    )

    // Should show the custom sparplans, not the default one
    expect(screen.getByText(/24\.000,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/12\.000,00 €/)).toBeInTheDocument()
    expect(screen.queryByText(/19\.800,00 €/)).not.toBeInTheDocument()
  })

  it('should show empty state when empty sparplans array provided', () => {
    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
        currentSparplans={[]}
      />,
    )

    // Should show empty state message
    expect(screen.getByText(/Noch keine Sparpläne oder Einmalzahlungen erstellt/)).toBeInTheDocument()
  })

  it('should properly display monthly values when simulation is monthly', () => {
    const yearlySparplan: Sparplan[] = [
      {
        id: 300,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 24000, // 24,000€ yearly = 2,000€ monthly
      },
    ]

    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.monthly}
        currentSparplans={yearlySparplan}
      />,
    )

    // Should show monthly equivalent (24000 / 12 = 2000)
    expect(screen.getByText(/2\.000,00 €/)).toBeInTheDocument()
    expect(screen.getByText(/💰 Monatlich:/)).toBeInTheDocument()
  })
})

describe('SparplanEingabe edit functionality', () => {
  const mockDispatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should show edit buttons for existing savings plans and one-time payments', () => {
    const testSparplans: Sparplan[] = [
      {
        id: 1,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 24000,
      },
      {
        id: 2,
        start: new Date('2025-06-15'),
        end: new Date('2025-06-15'), // Same date = one-time payment
        einzahlung: 5000,
      },
    ]

    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
        currentSparplans={testSparplans}
      />,
    )

    // Should show edit buttons for both items
    expect(screen.getByRole('button', { name: 'Sparplan bearbeiten' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Einmalzahlung bearbeiten' })).toBeInTheDocument()
  })

  it('should disable edit/delete buttons when in edit mode', async () => {
    const user = userEvent.setup()
    const testSparplans: Sparplan[] = [
      {
        id: 1,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 24000,
      },
    ]

    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
        currentSparplans={testSparplans}
      />,
    )

    const editButton = screen.getByRole('button', { name: 'Sparplan bearbeiten' })
    const deleteButton = screen.getByRole('button', { name: 'Sparplan löschen' })

    // Click edit button
    await user.click(editButton)

    // Buttons should now be disabled
    expect(editButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })

  it('should disable buttons in edit mode indicating edit functionality works', async () => {
    const user = userEvent.setup()
    const testSparplans: Sparplan[] = [
      {
        id: 1,
        start: new Date('2024-01-01'),
        end: null,
        einzahlung: 24000,
      },
    ]

    render(
      <SparplanEingabe
        dispatch={mockDispatch}
        simulationAnnual={SimulationAnnual.yearly}
        currentSparplans={testSparplans}
      />,
    )

    const editButton = screen.getByRole('button', { name: 'Sparplan bearbeiten' })
    const deleteButton = screen.getByRole('button', { name: 'Sparplan löschen' })

    // Initially buttons should be enabled
    expect(editButton).not.toBeDisabled()
    expect(deleteButton).not.toBeDisabled()

    // Click edit button to enter edit mode
    await user.click(editButton)

    // Buttons should be disabled in edit mode (proving edit mode is active)
    expect(editButton).toBeDisabled()
    expect(deleteButton).toBeDisabled()
  })
})
