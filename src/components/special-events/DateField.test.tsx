import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DateField } from './DateField'
import { createMockEventFormValues } from './test-utils'

describe('DateField', () => {
  it('renders date field with correct label', () => {
    const formValues = createMockEventFormValues({ date: new Date('2025-01-15') })
    const onFormChange = vi.fn()

    render(
      <DateField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    expect(screen.getByText('Datum')).toBeInTheDocument()
  })

  it('displays current date value', () => {
    const formValues = createMockEventFormValues({ date: new Date('2025-06-15') })
    const onFormChange = vi.fn()

    render(
      <DateField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    const input = screen.getByPlaceholderText('Datum wählen') as HTMLInputElement
    expect(input.value).toBe('2025-06-15')
  })

  it('displays correct year range for sparphase', () => {
    const formValues = createMockEventFormValues({ phase: 'sparphase' })
    const onFormChange = vi.fn()

    render(
      <DateField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    expect(screen.getByText(/Datum zwischen 2023 und 2040/)).toBeInTheDocument()
  })

  it('displays correct year range for entsparphase', () => {
    const formValues = createMockEventFormValues({ phase: 'entsparphase' })
    const onFormChange = vi.fn()

    render(
      <DateField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    expect(screen.getByText(/Datum zwischen 2040 und 2070/)).toBeInTheDocument()
  })

  it('sets correct min and max attributes for sparphase', () => {
    const formValues = createMockEventFormValues({ phase: 'sparphase' })
    const onFormChange = vi.fn()

    render(
      <DateField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    const input = screen.getByPlaceholderText('Datum wählen') as HTMLInputElement
    expect(input.min).toBe('2023-01-01')
    expect(input.max).toBe('2040-12-31')
  })

  it('calls onFormChange when date is changed', async () => {
    const user = userEvent.setup()
    const formValues = createMockEventFormValues({ date: new Date('2025-01-15') })
    const onFormChange = vi.fn()

    render(
      <DateField
        formValues={formValues}
        onFormChange={onFormChange}
        savingsStartYear={2023}
        savingsEndYear={2040}
        withdrawalStartYear={2040}
        withdrawalEndYear={2070}
      />,
    )

    const input = screen.getByPlaceholderText('Datum wählen')
    await user.clear(input)
    await user.type(input, '2030-06-15')

    expect(onFormChange).toHaveBeenCalled()
    const lastCall = onFormChange.mock.calls[onFormChange.mock.calls.length - 1][0]
    expect(lastCall.date).toBeInstanceOf(Date)
  })
})
