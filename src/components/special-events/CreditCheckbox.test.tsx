import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { CreditCheckbox } from './CreditCheckbox'
import { createMockEventFormValues } from './test-utils'

describe('CreditCheckbox', () => {
  const mockFormValues = createMockEventFormValues({
    eventType: 'expense',
    expenseAmount: '25000',
  })

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
    const updatedValues: Array<ReturnType<typeof createMockEventFormValues>> = []
    const onFormChange = (values: ReturnType<typeof createMockEventFormValues>) => {
      updatedValues.push(values)
    }
    render(<CreditCheckbox formValues={mockFormValues} onFormChange={onFormChange} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].useCredit).toBe(true)
  })
})
