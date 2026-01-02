import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DescriptionField } from './DescriptionField'
import { createMockEventFormValues } from './test-utils'

describe('DescriptionField', () => {
  it('renders description field with correct label', () => {
    const formValues = createMockEventFormValues()
    const onFormChange = vi.fn()

    render(<DescriptionField formValues={formValues} onFormChange={onFormChange} />)

    expect(screen.getByText('Beschreibung (optional)')).toBeInTheDocument()
  })

  it('displays placeholder text', () => {
    const formValues = createMockEventFormValues()
    const onFormChange = vi.fn()

    render(<DescriptionField formValues={formValues} onFormChange={onFormChange} />)

    expect(screen.getByPlaceholderText('z.B. Erbschaft Großeltern, Neuwagenkauf')).toBeInTheDocument()
  })

  it('displays current description value', () => {
    const formValues = createMockEventFormValues({ description: 'Test description' })
    const onFormChange = vi.fn()

    render(<DescriptionField formValues={formValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('z.B. Erbschaft Großeltern, Neuwagenkauf') as HTMLInputElement
    expect(input.value).toBe('Test description')
  })

  it('displays empty value when description is empty', () => {
    const formValues = createMockEventFormValues({ description: '' })
    const onFormChange = vi.fn()

    render(<DescriptionField formValues={formValues} onFormChange={onFormChange} />)

    const input = screen.getByPlaceholderText('z.B. Erbschaft Großeltern, Neuwagenkauf') as HTMLInputElement
    expect(input.value).toBe('')
  })

  it('calls onFormChange when description is changed', async () => {
    const user = userEvent.setup()
    const formValues = createMockEventFormValues({ description: '' })
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
    const formValues = createMockEventFormValues({ description: 'Old description' })
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
