import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PhaseSelectionField } from './PhaseSelectionField'
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

describe('PhaseSelectionField', () => {
  it('renders phase selection with correct label', () => {
    const formValues = createMockFormValues()
    const onFormChange = vi.fn()

    render(
      <PhaseSelectionField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    expect(screen.getByText('Lebensphase')).toBeInTheDocument()
  })

  it('displays correct options with year ranges', () => {
    const formValues = createMockFormValues()
    const onFormChange = vi.fn()

    render(
      <PhaseSelectionField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    expect(screen.getByText(/💰 Sparphase \(2023 - 2040\)/)).toBeInTheDocument()
    expect(screen.getByText(/💸 Entsparphase \(2040 - 2070\)/)).toBeInTheDocument()
  })

  it('shows current phase value', () => {
    const formValues = createMockFormValues({ phase: 'entsparphase' })
    const onFormChange = vi.fn()

    render(
      <PhaseSelectionField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    const select = screen.getByRole('combobox')
    expect(select).toHaveValue('entsparphase')
  })

  it('calls onFormChange when phase is changed', async () => {
    const user = userEvent.setup()
    const formValues = createMockFormValues({ phase: 'sparphase' })
    const onFormChange = vi.fn()

    render(
      <PhaseSelectionField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    const select = screen.getByRole('combobox')
    await user.selectOptions(select, 'entsparphase')

    expect(onFormChange).toHaveBeenCalledWith({
      ...formValues,
      phase: 'entsparphase',
    })
  })

  it('displays helper text', () => {
    const formValues = createMockFormValues()
    const onFormChange = vi.fn()

    render(
      <PhaseSelectionField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    expect(screen.getByText('Wählen Sie die Lebensphase für das Ereignis')).toBeInTheDocument()
  })
})
