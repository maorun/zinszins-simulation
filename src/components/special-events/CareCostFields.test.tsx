import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CareCostFields } from './CareCostFields'
import { createMockEventFormValues } from './test-utils'

describe('CareCostFields', () => {
  const mockFormValues = createMockEventFormValues({
    eventType: 'care_costs',
    careLevel: 2,
    customMonthlyCosts: '',
    careDurationYears: '',
    careInflationRate: '3',
  })

  it('renders all care cost form fields', () => {
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('🏥 Pflegekosten-Details')).toBeInTheDocument()
    expect(screen.getByText('Pflegegrad *')).toBeInTheDocument()
    expect(screen.getByText('Individuelle monatliche Kosten (optional)')).toBeInTheDocument()
    expect(screen.getByText('Pflegedauer (Jahre)')).toBeInTheDocument()
    expect(screen.getByText('Inflationsrate für Pflegekosten (%)')).toBeInTheDocument()
  })

  it('displays correct care level in select', () => {
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getByLabelText('Pflegegrad *')
    expect(select).toHaveValue('2')
  })

  it('calls onFormChange when care level changes', () => {
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getByLabelText('Pflegegrad *')
    fireEvent.change(select, { target: { value: '3' } })

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        careLevel: 3,
      }),
    )
  })

  it('calls onFormChange when custom costs change', () => {
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Individuelle monatliche Kosten (optional)')
    fireEvent.change(input, { target: { value: '2000' } })

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        customMonthlyCosts: '2000',
      }),
    )
  })

  it('calls onFormChange when duration changes', () => {
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Pflegedauer (Jahre)')
    fireEvent.change(input, { target: { value: '5' } })

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        careDurationYears: '5',
      }),
    )
  })

  it('calls onFormChange when inflation rate changes', () => {
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Inflationsrate für Pflegekosten (%)')
    fireEvent.change(input, { target: { value: '4' } })

    expect(onFormChange).toHaveBeenCalledWith(
      expect.objectContaining({
        careInflationRate: '4',
      }),
    )
  })

  it('displays typical costs for selected care level', () => {
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={mockFormValues} onFormChange={onFormChange} />)

    // Pflegegrad 2 has typical costs of 800€
    expect(screen.getByText(/Typische monatliche Kosten: 800 €/)).toBeInTheDocument()
    expect(screen.getByText(/Pflegegeld: 332 €/)).toBeInTheDocument()
  })

  it('updates typical costs display when care level changes', () => {
    const onFormChange = vi.fn()
    const { rerender } = render(<CareCostFields formValues={mockFormValues} onFormChange={onFormChange} />)

    // Change to Pflegegrad 3 (1500€ typical costs, 573€ care allowance)
    const updatedFormValues = createMockEventFormValues({
      eventType: 'care_costs',
      careLevel: 3,
      customMonthlyCosts: '',
      careDurationYears: '',
      careInflationRate: '3',
    })
    rerender(<CareCostFields formValues={updatedFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText(/Typische monatliche Kosten: 1.500 €/)).toBeInTheDocument()
    expect(screen.getByText(/Pflegegeld: 573 €/)).toBeInTheDocument()
  })

  it('renders all care level options', () => {
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getByLabelText('Pflegegrad *')
    const options = select.querySelectorAll('option')

    expect(options).toHaveLength(5)
    expect(options[0]).toHaveTextContent('Pflegegrad 1')
    expect(options[1]).toHaveTextContent('Pflegegrad 2')
    expect(options[2]).toHaveTextContent('Pflegegrad 3')
    expect(options[3]).toHaveTextContent('Pflegegrad 4')
    expect(options[4]).toHaveTextContent('Pflegegrad 5')
  })

  it('displays information box with key points', () => {
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('ℹ️ Berücksichtigt werden:')).toBeInTheDocument()
    expect(screen.getByText(/Gesetzliche Pflegeversicherungsleistungen/)).toBeInTheDocument()
    expect(screen.getByText(/Jährliche Inflation der Pflegekosten/)).toBeInTheDocument()
    expect(screen.getByText(/Steuerliche Absetzbarkeit/)).toBeInTheDocument()
    expect(screen.getByText(/Integration in die Gesamtfinanzplanung/)).toBeInTheDocument()
  })

  it('handles custom monthly costs input correctly', () => {
    const customCostsFormValues = createMockEventFormValues({
      eventType: 'care_costs',
      careLevel: 2,
      customMonthlyCosts: '1500',
      careDurationYears: '',
      careInflationRate: '3',
    })
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={customCostsFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Individuelle monatliche Kosten (optional)')
    expect(input).toHaveValue(1500)
  })

  it('handles care duration input correctly', () => {
    const durationFormValues = createMockEventFormValues({
      eventType: 'care_costs',
      careLevel: 2,
      customMonthlyCosts: '',
      careDurationYears: '10',
      careInflationRate: '3',
    })
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={durationFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Pflegedauer (Jahre)')
    expect(input).toHaveValue(10)
  })

  it('handles inflation rate input correctly', () => {
    const inflationFormValues = createMockEventFormValues({
      eventType: 'care_costs',
      careLevel: 2,
      customMonthlyCosts: '',
      careDurationYears: '',
      careInflationRate: '5',
    })
    const onFormChange = vi.fn()
    render(<CareCostFields formValues={inflationFormValues} onFormChange={onFormChange} />)

    const input = screen.getByLabelText('Inflationsrate für Pflegekosten (%)')
    expect(input).toHaveValue(5)
  })
})
