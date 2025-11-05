import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NotesSection } from './NotesSection'
import type { OtherIncomeSource } from '../../../helpers/other-income'

describe('NotesSection', () => {
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

  it('renders the notes textarea with current value', () => {
    const source = createMockSource({ notes: 'Test notes' })
    render(<NotesSection editingSource={source} onUpdate={mockOnUpdate} />)

    const textarea = screen.getByLabelText('Notizen (optional)')
    expect(textarea).toHaveValue('Test notes')
  })

  it('renders with empty value when notes is undefined', () => {
    const source = createMockSource({ notes: undefined })
    render(<NotesSection editingSource={source} onUpdate={mockOnUpdate} />)

    const textarea = screen.getByLabelText('Notizen (optional)')
    expect(textarea).toHaveValue('')
  })

  it('renders with placeholder text', () => {
    const source = createMockSource({ notes: '' })
    render(<NotesSection editingSource={source} onUpdate={mockOnUpdate} />)

    const textarea = screen.getByPlaceholderText('Zusätzliche Informationen zu dieser Einkommensquelle')
    expect(textarea).toBeInTheDocument()
  })

  it('calls onUpdate when notes are changed', async () => {
    const user = userEvent.setup()
    const source = createMockSource({ notes: '' })
    render(<NotesSection editingSource={source} onUpdate={mockOnUpdate} />)

    const textarea = screen.getByLabelText('Notizen (optional)')
    await user.type(textarea, 'New notes')

    // Check that onUpdate was called
    expect(mockOnUpdate).toHaveBeenCalled()
    // Check the last call has the correct final value
    const calls = mockOnUpdate.mock.calls
    const lastCallSource = calls[calls.length - 1][0]
    expect(lastCallSource.notes).toContain('s') // Last character typed
  })
})
