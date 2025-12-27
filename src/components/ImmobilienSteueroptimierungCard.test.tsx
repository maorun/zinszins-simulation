import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
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

  it('should render collapsed by default', () => {
    render(<ImmobilienSteueroptimierungCard />)
    const heading = screen.getByText(/Immobilien-Steueroptimierung/i)
    expect(heading).toBeInTheDocument()
    // Content should be hidden initially
    expect(screen.queryByText(/Gebäudewert \(ohne Grundstück\)/i)).not.toBeInTheDocument()
  })

  it('should expand and show form when clicked', () => {
    render(<ImmobilienSteueroptimierungCard />)
    const heading = screen.getByText(/Immobilien-Steueroptimierung/i)
    fireEvent.click(heading)
    
    // Now content should be visible
    expect(screen.getByText(/Gebäudewert \(ohne Grundstück\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Grundstückswert/i)).toBeInTheDocument()
  })

  it('should render info message when expanded', () => {
    render(<ImmobilienSteueroptimierungCard />)
    const heading = screen.getByText(/Immobilien-Steueroptimierung/i)
    fireEvent.click(heading)
    
    expect(screen.getByText(/Berechnung der steuerlichen Behandlung/i)).toBeInTheDocument()
    expect(screen.getByText(/§ 7 Abs. 4 EStG/i)).toBeInTheDocument()
    expect(screen.getByText(/§ 9 EStG/i)).toBeInTheDocument()
  })

  it('should have default values configured when expanded', () => {
    render(<ImmobilienSteueroptimierungCard />)
    const heading = screen.getByText(/Immobilien-Steueroptimierung/i)
    fireEvent.click(heading)

    const buildingValueInput = screen.getByLabelText(/Gebäudewert \(ohne Grundstück\)/i) as HTMLInputElement
    expect(buildingValueInput.value).toBe('300000')

    const landValueInput = screen.getByLabelText(/Grundstückswert/i) as HTMLInputElement
    expect(landValueInput.value).toBe('100000')

    const annualRentInput = screen.getByLabelText(/Jährliche Mieteinnahmen/i) as HTMLInputElement
    expect(annualRentInput.value).toBe('18000')
  })

  it('should show calculation results with default values when expanded', () => {
    render(<ImmobilienSteueroptimierungCard />)
    const heading = screen.getByText(/Immobilien-Steueroptimierung/i)
    fireEvent.click(heading)

    // Check for overview section
    expect(screen.getByText(/Übersicht/i)).toBeInTheDocument()
    expect(screen.getByText(/Gesamtinvestition/i)).toBeInTheDocument()
    expect(screen.getByText(/400.000,00 €/i)).toBeInTheDocument()

    // Check for Werbungskosten section
    expect(screen.getByText(/Werbungskosten \(Steuerlich absetzbar\)/i)).toBeInTheDocument()
    expect(screen.getByText(/AfA \(Gebäude-Abschreibung\)/i)).toBeInTheDocument()
  })

  it('should update calculations when input values change', () => {
    render(<ImmobilienSteueroptimierungCard />)
    const heading = screen.getByText(/Immobilien-Steueroptimierung/i)
    fireEvent.click(heading)

    const buildingValueInput = screen.getByLabelText(/Gebäudewert \(ohne Grundstück\)/i) as HTMLInputElement
    fireEvent.change(buildingValueInput, { target: { value: '500000' } })
    expect(buildingValueInput.value).toBe('500000')
  })

  it('should show günstigerprüfung hint when active', () => {
    mockUseSimulation.mockReturnValue({
      guenstigerPruefungAktiv: true,
    } as ReturnType<typeof useSimulation>)

    render(<ImmobilienSteueroptimierungCard />)
    const heading = screen.getByText(/Immobilien-Steueroptimierung/i)
    fireEvent.click(heading)

    expect(screen.getByText(/wird durch Günstigerprüfung ggf. verwendet/i)).toBeInTheDocument()
  })
})
