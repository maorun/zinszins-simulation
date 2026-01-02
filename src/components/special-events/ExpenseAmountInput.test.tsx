import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpenseAmountInput } from './ExpenseAmountInput'
import { createMockEventFormValues } from './test-utils'

describe('ExpenseAmountInput', () => {
  const mockFormValues = createMockEventFormValues({
    eventType: 'expense',
    expenseAmount: '25000',
  })

  it('renders expense amount input with label', () => {
    const onFormChange = () => {}
    render(<ExpenseAmountInput formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Ausgabenbetrag (€)')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('25000')
    expect(input).toHaveValue(25000)
  })

  it('calls onFormChange when amount changes', () => {
    const updatedValues: Array<ReturnType<typeof createMockEventFormValues>> = []
    const onFormChange = (values: ReturnType<typeof createMockEventFormValues>) => {
      updatedValues.push(values)
    }
    render(<ExpenseAmountInput formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('25000')
    fireEvent.change(input, { target: { value: '50000' } })

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].expenseAmount).toBe('50000')
  })

  it('has correct input attributes', () => {
    const onFormChange = () => {}
    render(<ExpenseAmountInput formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('25000')
    expect(input).toHaveAttribute('type', 'number')
    expect(input).toHaveAttribute('min', '0')
    expect(input).toHaveAttribute('step', '1000')
  })
})
