import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TypeSelectSection } from './TypeSelectSection'
import type { OtherIncomeSource } from '../../../helpers/other-income'

describe('TypeSelectSection', () => {
  const mockOnTypeChange = vi.fn()

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

  it('renders the type select with current value', () => {
    const source = createMockSource({ type: 'rental' })
    render(<TypeSelectSection editingSource={source} onTypeChange={mockOnTypeChange} />)

    const select = screen.getByLabelText('Art der Einkünfte')
    expect(select).toHaveValue('rental')
  })

  it('renders all income type options', () => {
    const source = createMockSource()
    render(<TypeSelectSection editingSource={source} onTypeChange={mockOnTypeChange} />)

    expect(screen.getByText('Mieteinnahmen')).toBeInTheDocument()
    expect(screen.getByText('Rente/Pension')).toBeInTheDocument()
    expect(screen.getByText('Gewerbeeinkünfte')).toBeInTheDocument()
    expect(screen.getByText('Kapitalerträge')).toBeInTheDocument()
    expect(screen.getByText('Kindergeld')).toBeInTheDocument()
    expect(screen.getByText('Sonstige Einkünfte')).toBeInTheDocument()
  })

  it('calls onTypeChange when selection changes', async () => {
    const user = userEvent.setup()
    const source = createMockSource({ type: 'rental' })
    render(<TypeSelectSection editingSource={source} onTypeChange={mockOnTypeChange} />)

    const select = screen.getByLabelText('Art der Einkünfte')
    await user.selectOptions(select, 'pension')

    expect(mockOnTypeChange).toHaveBeenCalled()
  })
})
