import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RelationshipTypeField } from './RelationshipTypeField'
import type { EventFormValues } from './EventFormFields'

describe('RelationshipTypeField', () => {
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

  it('renders relationship type label and select', () => {
    const onFormChange = () => {}
    render(<RelationshipTypeField formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Verwandtschaftsgrad')).toBeInTheDocument()
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays the current relationship type value', () => {
    const onFormChange = () => {}
    render(<RelationshipTypeField formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByRole('combobox')).toHaveValue('child')
  })

  it('renders all relationship type options', () => {
    const onFormChange = () => {}
    render(<RelationshipTypeField formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    const options = select.querySelectorAll('option')

    expect(options).toHaveLength(5)
    expect(options[0]).toHaveTextContent('Kind')
    expect(options[1]).toHaveTextContent('Enkelkind')
    expect(options[2]).toHaveTextContent('Ehepartner')
    expect(options[3]).toHaveTextContent('Geschwister')
    expect(options[4]).toHaveTextContent('Sonstige')
  })

  it('calls onFormChange when relationship type changes', () => {
    const updatedValues: EventFormValues[] = []
    const onFormChange = (values: EventFormValues) => {
      updatedValues.push(values)
    }
    render(<RelationshipTypeField formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'spouse' } })

    expect(updatedValues.length).toBe(1)
    expect(updatedValues[0].relationshipType).toBe('spouse')
  })

  it('preserves other form values when relationship type changes', () => {
    const updatedValues: EventFormValues[] = []
    const onFormChange = (values: EventFormValues) => {
      updatedValues.push(values)
    }
    render(<RelationshipTypeField formValues={mockFormValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    fireEvent.change(select, { target: { value: 'grandchild' } })

    expect(updatedValues[0].grossAmount).toBe('100000')
    expect(updatedValues[0].eventType).toBe('inheritance')
  })
})
