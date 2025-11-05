import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DescriptionField } from './DescriptionField'
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

describe('DescriptionField', () => {
  it('renders description field with correct label', () => {
    const formValues = createMockFormValues()
    const onFormChange = vi.fn()

    render(<DescriptionField formValues={formValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Beschreibung (optional)')).toBeInTheDocument()
  })

  it('displays placeholder text', () => {
    const formValues = createMockFormValues()
    const onFormChange = vi.fn()

    render(<DescriptionField formValues={formValues} onFormChange={onFormChange} />)

    expect(screen.getByPlaceholderText('z.B. Erbschaft Großeltern, Neuwagenkauf')).toBeInTheDocument()
  })

  it('displays current description value', () => {
    const formValues = createMockFormValues({ description: 'Test description' })
    const onFormChange = vi.fn()

    render(<DescriptionField formValues={formValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('z.B. Erbschaft Großeltern, Neuwagenkauf') as HTMLInputElement
    expect(input.value).toBe('Test description')
  })

  it('displays empty value when description is empty', () => {
    const formValues = createMockFormValues({ description: '' })
    const onFormChange = vi.fn()

    render(<DescriptionField formValues={formValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('z.B. Erbschaft Großeltern, Neuwagenkauf') as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('calls onFormChange when description is changed', async () => {
    const user = userEvent.setup()
    const formValues = createMockFormValues({ description: '' })
    const onFormChange = vi.fn()

    render(<DescriptionField formValues={formValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('z.B. Erbschaft Großeltern, Neuwagenkauf')
    await user.type(input, 'Test')

    expect(onFormChange).toHaveBeenCalled()
    const firstCall = onFormChange.mock.calls[0][0]
    expect(firstCall.description).toBe('T')
  })

  it('calls onFormChange when description is cleared', async () => {
    const user = userEvent.setup()
    const formValues = createMockFormValues({ description: 'Old description' })
    const onFormChange = vi.fn()

    render(<DescriptionField formValues={formValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('z.B. Erbschaft Großeltern, Neuwagenkauf')
    await user.clear(input)

    expect(onFormChange).toHaveBeenCalledWith({
      ...formValues,
      description: '',
    })
  })
})
