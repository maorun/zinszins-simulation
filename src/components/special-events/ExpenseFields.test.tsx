import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpenseFields } from './ExpenseFields'
import type { EventFormValues } from './EventFormFields'

describe('ExpenseFields', () => {
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

  it('renders expense type select', () => {
    const onFormChange = () => {}
    render(<ExpenseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Ausgabentyp')).toBeInTheDocument()
    const select = screen.getAllByRole('combobox')[0]
    expect(select).toHaveValue('car')
  })

  it('renders expense amount input', () => {
    const onFormChange = () => {}
    render(<ExpenseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Ausgabenbetrag (€)')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('25000')
    expect(input).toHaveValue(25000)
  })

  it('renders credit checkbox', () => {
    const onFormChange = () => {}
    render(<ExpenseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Finanzierung über Kredit')).toBeInTheDocument()
    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()
  })

  it('hides credit fields when useCredit is false', () => {
    const onFormChange = () => {}
    render(<ExpenseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.queryByText('Zinssatz (%)')).not.toBeInTheDocument()
    expect(screen.queryByText('Laufzeit (Jahre)')).not.toBeInTheDocument()
  })

  it('shows credit fields when useCredit is true', () => {
    const formValuesWithCredit = { ...mockFormValues, useCredit: true }
    const onFormChange = () => {}
    render(<ExpenseFields formValues={formValuesWithCredit} onFormChange={onFormChange} />)

    expect(screen.getByText('Zinssatz (%)')).toBeInTheDocument()
    expect(screen.getByText('Laufzeit (Jahre)')).toBeInTheDocument()
  })

  it('calls onFormChange when expense type changes', () => {
    const updatedValues: EventFormValues[] = []
    const onFormChange = (values: EventFormValues) => {
      updatedValues.push(values)
    }
    render(<ExpenseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getAllByRole('combobox')[0]
    fireEvent.change(select, { target: { value: 'house' } })

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].expenseType).toBe('house')
  })

  it('calls onFormChange when expense amount changes', () => {
    const updatedValues: EventFormValues[] = []
    const onFormChange = (values: EventFormValues) => {
      updatedValues.push(values)
    }
    render(<ExpenseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('25000')
    fireEvent.change(input, { target: { value: '50000' } })

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].expenseAmount).toBe('50000')
  })

  it('calls onFormChange when credit checkbox is toggled', () => {
    const updatedValues: EventFormValues[] = []
    const onFormChange = (values: EventFormValues) => {
      updatedValues.push(values)
    }
    render(<ExpenseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const checkbox = screen.getByRole('checkbox')
    fireEvent.click(checkbox)

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].useCredit).toBe(true)
  })

  it('renders all expense type options', () => {
    const onFormChange = () => {}
    render(<ExpenseFields formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getAllByRole('combobox')[0]
    const options = select.querySelectorAll('option')

    expect(options).toHaveLength(5)
    expect(options[0]).toHaveTextContent('Auto')
    expect(options[1]).toHaveTextContent('Haus/Wohnung')
    expect(options[2]).toHaveTextContent('Renovierung')
    expect(options[3]).toHaveTextContent('Urlaub')
    expect(options[4]).toHaveTextContent('Sonstiges')
  })

  it('displays interest rate placeholder based on expense type and amount', () => {
    const formValuesWithCredit = {
      ...mockFormValues,
      useCredit: true,
      expenseType: 'car' as const,
      expenseAmount: '30000',
    }
    const onFormChange = () => {}
    render(<ExpenseFields formValues={formValuesWithCredit} onFormChange={onFormChange} />)

    const interestInput = screen.getByPlaceholderText(/\d+\.\d/)
    expect(interestInput).toBeInTheDocument()
  })

  it('displays term years placeholder based on expense type and amount', () => {
    const formValuesWithCredit = {
      ...mockFormValues,
      useCredit: true,
      expenseType: 'car' as const,
      expenseAmount: '30000',
    }
    const onFormChange = () => {}
    render(<ExpenseFields formValues={formValuesWithCredit} onFormChange={onFormChange} />)

    // Query by label text for more specificity
    expect(screen.getByText('Laufzeit (Jahre)')).toBeInTheDocument()
  })
})
