import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ImmobilienSteueroptimierungCard } from './ImmobilienSteueroptimierungCard'
import { useSimulation } from '../contexts/useSimulation'

// Mock the useSimulation hook
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: vi.fn(),
}))

describe('ImmobilienSteueroptimierungCard', () => {
  const mockUseSimulation = vi.mocked(useSimulation)

  beforeEach(() => {
    mockUseSimulation.mockReturnValue({
      guenstigerPruefungAktiv: false,
    } as ReturnType<typeof useSimulation>)
  })

  it('should render the card with correct title', () => {
    render(<ImmobilienSteueroptimierungCard />)

    expect(screen.getByText(/Immobilien-Steueroptimierung/i)).toBeInTheDocument()
  })

  it('should render info message', () => {
    render(<ImmobilienSteueroptimierungCard />)

    expect(screen.getByText(/Berechnung der steuerlichen Behandlung/i)).toBeInTheDocument()
    expect(screen.getByText(/AfA \(Absetzung für Abnutzung\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Werbungskosten/i)).toBeInTheDocument()
  })

  it('should render form fields', () => {
    render(<ImmobilienSteueroptimierungCard />)

    // Check for key form field labels
    expect(screen.getByText(/Gebäudewert \(ohne Grundstück\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Grundstückswert/i)).toBeInTheDocument()
    expect(screen.getByText(/Jährliche Mieteinnahmen/i)).toBeInTheDocument()
  })

  it('should have default values', () => {
    render(<ImmobilienSteueroptimierungCard />)

    // Find input by label
    const buildingValueInput = screen.getByLabelText(/Gebäudewert \(ohne Grundstück\)/i) as HTMLInputElement
    expect(buildingValueInput.value).toBe('300000')

    const landValueInput = screen.getByLabelText(/Grundstückswert/i) as HTMLInputElement
    expect(landValueInput.value).toBe('100000')

    const annualRentInput = screen.getByLabelText(/Jährliche Mieteinnahmen/i) as HTMLInputElement
    expect(annualRentInput.value).toBe('18000')
  })
})
