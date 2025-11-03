import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { GrossAmountField } from './GrossAmountField'
import type { EventFormValues } from './EventFormFields'

describe('GrossAmountField', () => {
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

  it('renders gross amount label and input', () => {
    const onFormChange = () => {}
    render(<GrossAmountField formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Brutto-Erbschaft (€)')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('100000')).toBeInTheDocument()
  })

  it('displays the current gross amount value', () => {
    const onFormChange = () => {}
    render(<GrossAmountField formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('100000')
    expect(input).toHaveValue(100000)
  })

  it('displays the helper text', () => {
    const onFormChange = () => {}
    render(<GrossAmountField formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Bruttobetrag vor Erbschaftsteuer')).toBeInTheDocument()
  })

  it('calls onFormChange when gross amount changes', () => {
    const updatedValues: EventFormValues[] = []
    const onFormChange = (values: EventFormValues) => {
      updatedValues.push(values)
    }
    render(<GrossAmountField formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('100000')
    fireEvent.change(input, { target: { value: '200000' } })

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].grossAmount).toBe('200000')
  })

  it('preserves other form values when gross amount changes', () => {
    const updatedValues: EventFormValues[] = []
    const onFormChange = (values: EventFormValues) => {
      updatedValues.push(values)
    }
    render(<GrossAmountField formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('100000')
    fireEvent.change(input, { target: { value: '150000' } })

    expect(updatedValues[0].relationshipType).toBe('child')
    expect(updatedValues[0].eventType).toBe('inheritance')
  })

  it('handles empty gross amount', () => {
    const formValuesEmpty = { ...mockFormValues, grossAmount: '' }
    const onFormChange = () => {}
    render(<GrossAmountField formValues={formValuesEmpty} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('100000')
    expect(input).toHaveValue(null)
  })
})
