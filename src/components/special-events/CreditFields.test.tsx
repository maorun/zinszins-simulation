import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CreditFields } from './CreditFields'
import { createMockEventFormValues } from './test-utils'

describe('CreditFields', () => {
  const mockFormValues = createMockEventFormValues({
    eventType: 'expense',
    expenseAmount: '30000',
    useCredit: true,
  })

  it('renders both interest rate and term years inputs', () => {
    const onFormChange = () => {}
    render(<CreditFields formValues={mockFormValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Zinssatz (%)')).toBeInTheDocument()
    expect(screen.getByText('Laufzeit (Jahre)')).toBeInTheDocument()
  })
})
