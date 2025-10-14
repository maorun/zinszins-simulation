import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { InheritanceFields } from './InheritanceFields'
import type { EventFormValues } from './EventFormFields'

describe('InheritanceFields', () => {
  const mockFormValues: EventFormValues = {
    date: new Date('2024-01-01'),
    eventType: 'inheritance',
    phase: 'sparphase',
    relationshipType: 'child',
    grossAmount: '100000',
    expenseType: 'car',
    expenseAmount: '',
    useCredit: false,
    interestRate: '',
    termYears: '',
    description: '',
  }

  it('renders relationship type select', () => {
    const onFormChange = () => {}
    render(<InheritanceFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Verwandtschaftsgrad')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toHaveValue('child')
  })

  it('renders gross amount input', () => {
    const onFormChange = () => {}
    render(<InheritanceFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Brutto-Erbschaft (€)')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('100000')
    expect(input).toHaveValue(100000)
  })

  it('displays tax calculation when gross amount is provided', () => {
    const onFormChange = () => {}
    render(<InheritanceFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('📊 Steuerberechnung:')).toBeInTheDocument()
    expect(screen.getByText(/Brutto-Erbschaft:/)).toBeInTheDocument()
    expect(screen.getByText(/Freibetrag:/)).toBeInTheDocument()
    expect(screen.getByText(/Netto-Erbschaft:/)).toBeInTheDocument()
  })

  it('does not display tax calculation when gross amount is empty', () => {
    const formValuesEmpty = { ...mockFormValues, grossAmount: '' }
    const onFormChange = () => {}
    render(<InheritanceFields formValues={formValuesEmpty} onFormChange={onFormChange} />)

    expect(screen.queryByText('📊 Steuerberechnung:')).not.toBeInTheDocument()
  })

  it('calls onFormChange when relationship type changes', () => {
    const updatedValues: EventFormValues[] = []
    const onFormChange = (values: EventFormValues) => {
      updatedValues.push(values)
    }
    render(<InheritanceFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'spouse' } })

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].relationshipType).toBe('spouse')
  })

  it('calls onFormChange when gross amount changes', () => {
    const updatedValues: EventFormValues[] = []
    const onFormChange = (values: EventFormValues) => {
      updatedValues.push(values)
    }
    render(<InheritanceFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('100000')
    fireEvent.change(input, { target: { value: '200000' } })

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].grossAmount).toBe('200000')
  })

  it('renders all relationship type options', () => {
    const onFormChange = () => {}
    render(<InheritanceFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    const options = select.querySelectorAll('option')

    expect(options).toHaveLength(5)
    expect(options[0]).toHaveTextContent('Kind')
    expect(options[1]).toHaveTextContent('Enkelkind')
    expect(options[2]).toHaveTextContent('Ehepartner')
    expect(options[3]).toHaveTextContent('Geschwister')
    expect(options[4]).toHaveTextContent('Sonstige')
  })
})
