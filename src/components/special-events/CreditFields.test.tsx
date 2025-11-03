import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CreditFields } from './CreditFields'
import type { EventFormValues } from './EventFormFields'

describe('CreditFields', () => {
  const mockFormValues: EventFormValues = {
    date: new Date('2024-01-01'),
    eventType: 'expense',
    phase: 'sparphase',
    relationshipType: 'child',
    grossAmount: '',
    expenseType: 'car',
    expenseAmount: '30000',
    useCredit: true,
    interestRate: '',
    termYears: '',
    description: '',
  }

  it('renders both interest rate and term years inputs', () => {
    const onFormChange = () => {}
    render(<CreditFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Zinssatz (%)')).toBeInTheDocument()
    expect(screen.getByText('Laufzeit (Jahre)')).toBeInTheDocument()
  })
})
