import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CreditCheckbox } from './CreditCheckbox'
import type { EventFormValues } from './EventFormFields'

describe('CreditCheckbox', () => {
  const mockFormValues: EventFormValues = {
    date: new Date('2024-01-01'),
    eventType: 'expense',
    phase: 'sparphase',
    relationshipType: 'child',
    grossAmount: '',
    expenseType: 'car',
    expenseAmount: '25000',
    useCredit: false,
    interestRate: '',
    termYears: '',
    description: '',
  }

  it('renders credit checkbox with label', () => {
    const onFormChange = () => {}
    render(<CreditCheckbox formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Finanzierung über Kredit')).toBeInTheDocument()
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('renders checked when useCredit is true', () => {
    const formValuesWithCredit = { ...mockFormValues, useCredit: true }
    const onFormChange = () => {}
    render(<CreditCheckbox formValues={formValuesWithCredit} onFormChange={onFormChange} />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toBeChecked()
  })

  it('calls onFormChange when checkbox is toggled', () => {
    const updatedValues: EventFormValues[] = []
    const onFormChange = (values: EventFormValues) => {
      updatedValues.push(values)
    }
    render(<CreditCheckbox formValues={mockFormValues} onFormChange={onFormChange} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].useCredit).toBe(true)
  })
})
