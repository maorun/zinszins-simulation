import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpenseTypeSelect } from './ExpenseTypeSelect'
import { createMockEventFormValues } from './test-utils'

describe('ExpenseTypeSelect', () => {
  const mockFormValues = createMockEventFormValues({
    eventType: 'expense',
    expenseAmount: '25000',
  })

  it('renders expense type select with label', () => {
    const onFormChange = () => {}
    render(<ExpenseTypeSelect formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Ausgabentyp')).toBeInTheDocument()
    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('car')
  })

  it('renders all expense type options', () => {
    const onFormChange = () => {}
    render(<ExpenseTypeSelect formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    const options = select.querySelectorAll('option')

    expect(options).toHaveLength(5)
    expect(options[0]).toHaveTextContent('Auto')
    expect(options[1]).toHaveTextContent('Haus/Wohnung')
    expect(options[2]).toHaveTextContent('Renovierung')
    expect(options[3]).toHaveTextContent('Urlaub')
    expect(options[4]).toHaveTextContent('Sonstiges')
  })

  it('calls onFormChange when expense type changes', () => {
    const updatedValues: Array<ReturnType<typeof createMockEventFormValues>> = []
    const onFormChange = (values: ReturnType<typeof createMockEventFormValues>) => {
      updatedValues.push(values)
    }
    render(<ExpenseTypeSelect formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'house' } })

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].expenseType).toBe('house')
  })
})
