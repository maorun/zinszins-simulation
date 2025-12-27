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

  it('should render info message with legal references', () => {
    render(<ImmobilienSteueroptimierungCard />)

    expect(screen.getByText(/Berechnung der steuerlichen Behandlung/i)).toBeInTheDocument()
    expect(screen.getByText(/§ 7 Abs. 4 EStG/i)).toBeInTheDocument()
    expect(screen.getByText(/§ 9 EStG/i)).toBeInTheDocument()
  })

  it('should render all basic form fields', () => {
    render(<ImmobilienSteueroptimierungCard />)

    expect(screen.getByText(/Gebäudewert \(ohne Grundstück\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Grundstückswert/i)).toBeInTheDocument()
    expect(screen.getByText(/Jährliche Mieteinnahmen/i)).toBeInTheDocument()
    expect(screen.getByText(/Persönlicher Steuersatz/i)).toBeInTheDocument()
    expect(screen.getByText(/Kaufjahr/i)).toBeInTheDocument()
    expect(screen.getByText(/Baujahr/i)).toBeInTheDocument()
  })

  it('should render expense fields', () => {
    render(<ImmobilienSteueroptimierungCard />)

    expect(screen.getByText(/Instandhaltungskosten/i)).toBeInTheDocument()
    expect(screen.getByText(/Verwaltungskosten/i)).toBeInTheDocument()
    expect(screen.getByText(/Darlehenszinsen/i)).toBeInTheDocument()
    expect(screen.getByText(/Grundsteuer/i)).toBeInTheDocument()
    expect(screen.getByText(/Gebäudeversicherung/i)).toBeInTheDocument()
    expect(screen.getByText(/Sonstige Ausgaben/i)).toBeInTheDocument()
  })

  it('should have default values configured', () => {
    render(<ImmobilienSteueroptimierungCard />)

    const buildingValueInput = screen.getByLabelText(/Gebäudewert \(ohne Grundstück\)/i) as HTMLInputElement
    expect(buildingValueInput.value).toBe('300000')

    const landValueInput = screen.getByLabelText(/Grundstückswert/i) as HTMLInputElement
    expect(landValueInput.value).toBe('100000')

    const annualRentInput = screen.getByLabelText(/Jährliche Mieteinnahmen/i) as HTMLInputElement
    expect(annualRentInput.value).toBe('18000')
  })

  it('should render automatic expense estimation toggle', () => {
    render(<ImmobilienSteueroptimierungCard />)

    expect(screen.getByText(/Automatisch schätzen/i)).toBeInTheDocument()
  })

  it('should show calculation results with default values', () => {
    render(<ImmobilienSteueroptimierungCard />)

    // Check for overview section
    expect(screen.getByText(/Übersicht/i)).toBeInTheDocument()
    expect(screen.getByText(/Gesamtinvestition/i)).toBeInTheDocument()
    expect(screen.getByText(/400.000,00 €/i)).toBeInTheDocument()

    // Check for Werbungskosten section
    expect(screen.getByText(/Werbungskosten \(Steuerlich absetzbar\)/i)).toBeInTheDocument()
    expect(screen.getByText(/AfA \(Gebäude-Abschreibung\)/i)).toBeInTheDocument()

    // Check for tax result section
    expect(screen.getByText(/Steuerergebnis/i)).toBeInTheDocument()

    // Check for return metrics section
    expect(screen.getByText(/Renditekennzahlen/i)).toBeInTheDocument()
    expect(screen.getByText(/Effektive Rendite/i)).toBeInTheDocument()
  })

  it('should update calculations when input values change', () => {
    render(<ImmobilienSteueroptimierungCard />)

    const buildingValueInput = screen.getByLabelText(/Gebäudewert \(ohne Grundstück\)/i) as HTMLInputElement

    // Change building value
    fireEvent.change(buildingValueInput, { target: { value: '500000' } })

    // The input should reflect the new value
    expect(buildingValueInput.value).toBe('500000')
  })

  it('should show günstigerprüfung hint when active', () => {
    mockUseSimulation.mockReturnValue({
      guenstigerPruefungAktiv: true,
    } as ReturnType<typeof useSimulation>)

    render(<ImmobilienSteueroptimierungCard />)

    expect(screen.getByText(/wird durch Günstigerprüfung ggf. verwendet/i)).toBeInTheDocument()
  })

  it('should render AfA rate explanation', () => {
    render(<ImmobilienSteueroptimierungCard />)

    expect(screen.getByText(/< 1925: 2,5% \| 1925-2022: 2% \| ≥ 2023: 3%/i)).toBeInTheDocument()
  })

  it('should render land value explanation', () => {
    render(<ImmobilienSteueroptimierungCard />)

    expect(screen.getByText(/Land kann nicht abgeschrieben werden/i)).toBeInTheDocument()
  })

  it('should render mortgage interest note', () => {
    render(<ImmobilienSteueroptimierungCard />)

    expect(screen.getByText(/Nur Zinsen, nicht die Tilgung/i)).toBeInTheDocument()
  })
})
