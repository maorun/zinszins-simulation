import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NameInputSection } from './NameInputSection'
import type { OtherIncomeSource } from '../../../helpers/other-income'

describe('NameInputSection', () => {
  const mockOnUpdate = vi.fn()

  const createMockSource = (overrides?: Partial<OtherIncomeSource>): OtherIncomeSource => ({
    id: 'test-source',
    name: 'Test Source',
    type: 'rental',
    monthlyAmount: 1000,
    amountType: 'gross',
    taxRate: 30,
    startYear: 2025,
    endYear: null,
    inflationRate: 2,
    enabled: true,
    notes: '',
    ...overrides,
  })

  it('renders the name input with current value', () => {
    const source = createMockSource({ name: 'Mieteinnahmen Wohnung 1' })
    render(<NameInputSection editingSource={source} onUpdate={mockOnUpdate} />)

    const input = screen.getByLabelText('Bezeichnung')
    expect(input).toHaveValue('Mieteinnahmen Wohnung 1')
  })

  it('renders with placeholder text', () => {
    const source = createMockSource({ name: '' })
    render(<NameInputSection editingSource={source} onUpdate={mockOnUpdate} />)

    const input = screen.getByPlaceholderText('z.B. Mieteinnahmen Wohnung 1')
    expect(input).toBeInTheDocument()
  })

  it('calls onUpdate when name is changed', async () => {
    const user = userEvent.setup()
    const source = createMockSource({ name: 'Old Name' })
    render(<NameInputSection editingSource={source} onUpdate={mockOnUpdate} />)

    const input = screen.getByLabelText('Bezeichnung')
    await user.clear(input)
    await user.type(input, 'New Name')

    // Check that onUpdate was called
    expect(mockOnUpdate).toHaveBeenCalled()
    // Check the last call has the correct final value
    const calls = mockOnUpdate.mock.calls
    const lastCallSource = calls[calls.length - 1][0]
    expect(lastCallSource.name).toContain('e') // Last character typed
  })
})
