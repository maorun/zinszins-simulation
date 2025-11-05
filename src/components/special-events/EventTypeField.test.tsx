import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EventTypeField } from './EventTypeField'
import type { EventFormValues } from './EventFormFields'

const createMockFormValues = (overrides?: Partial<EventFormValues>): EventFormValues => ({
  date: new Date('2025-01-01'),
  eventType: 'inheritance',
  phase: 'sparphase',
  relationshipType: 'child',
  grossAmount: '',
  expenseType: 'car',
  expenseAmount: '',
  useCredit: false,
  interestRate: '',
  termYears: '',
  description: '',
  ...overrides,
})

describe('EventTypeField', () => {
  it('renders event type field with correct label', () => {
    const formValues = createMockFormValues()
    const onFormChange = vi.fn()

    render(<EventTypeField formValues={formValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Ereignistyp')).toBeInTheDocument()
  })

  it('displays correct options', () => {
    const formValues = createMockFormValues()
    const onFormChange = vi.fn()

    render(<EventTypeField formValues={formValues} onFormChange={onFormChange} />)

    expect(screen.getByText('💰 Erbschaft')).toBeInTheDocument()
    expect(screen.getByText('💸 Ausgabe')).toBeInTheDocument()
  })

  it('shows current event type value (inheritance)', () => {
    const formValues = createMockFormValues({ eventType: 'inheritance' })
    const onFormChange = vi.fn()

    render(<EventTypeField formValues={formValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('inheritance')
  })

  it('shows current event type value (expense)', () => {
    const formValues = createMockFormValues({ eventType: 'expense' })
    const onFormChange = vi.fn()

    render(<EventTypeField formValues={formValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('expense')
  })

  it('calls onFormChange when event type is changed to expense', async () => {
    const user = userEvent.setup()
    const formValues = createMockFormValues({ eventType: 'inheritance' })
    const onFormChange = vi.fn()

    render(<EventTypeField formValues={formValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'expense')

    expect(onFormChange).toHaveBeenCalledWith({
      ...formValues,
      eventType: 'expense',
    })
  })

  it('calls onFormChange when event type is changed to inheritance', async () => {
    const user = userEvent.setup()
    const formValues = createMockFormValues({ eventType: 'expense' })
    const onFormChange = vi.fn()

    render(<EventTypeField formValues={formValues} onFormChange={onFormChange} />)

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'inheritance')

    expect(onFormChange).toHaveBeenCalledWith({
      ...formValues,
      eventType: 'inheritance',
    })
  })
})
