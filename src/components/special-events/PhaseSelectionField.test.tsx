import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PhaseSelectionField } from './PhaseSelectionField'
import { createMockEventFormValues } from './test-utils'

describe('PhaseSelectionField', () => {
  it('renders phase selection with correct label', () => {
    const formValues = createMockEventFormValues()
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
    const formValues = createMockEventFormValues()
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
    const formValues = createMockEventFormValues({ phase: 'entsparphase' })
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
    const formValues = createMockEventFormValues({ phase: 'sparphase' })
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
    const formValues = createMockEventFormValues()
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
