import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IncomeSourceBadges } from './IncomeSourceBadges'
import type { OtherIncomeSource } from '../../../helpers/other-income'

describe('IncomeSourceBadges', () => {
  const mockOnEnabledChange = vi.fn()

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

  it('renders type badge correctly for rental income', () => {
    const source = createMockSource({ type: 'rental' })
    render(<IncomeSourceBadges source={source} onEnabledChange={mockOnEnabledChange} />)

    expect(screen.getByText('Mieteinnahmen')).toBeInTheDocument()
  })

  it('renders gross amount type badge with correct styling', () => {
    const source = createMockSource({ amountType: 'gross' })
    render(<IncomeSourceBadges source={source} onEnabledChange={mockOnEnabledChange} />)

    const badge = screen.getByText('Brutto')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-blue-100', 'text-blue-800')
  })

  it('renders net amount type badge with correct styling', () => {
    const source = createMockSource({ amountType: 'net' })
    render(<IncomeSourceBadges source={source} onEnabledChange={mockOnEnabledChange} />)

    const badge = screen.getByText('Netto')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('renders switch in checked state when source is enabled', () => {
    const source = createMockSource({ enabled: true })
    render(<IncomeSourceBadges source={source} onEnabledChange={mockOnEnabledChange} />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeChecked()
  })

  it('renders switch in unchecked state when source is disabled', () => {
    const source = createMockSource({ enabled: false })
    render(<IncomeSourceBadges source={source} onEnabledChange={mockOnEnabledChange} />)

    const switchElement = screen.getByRole('switch')
    expect(switchElement).not.toBeChecked()
  })

  it('calls onEnabledChange when switch is toggled', () => {
    const source = createMockSource({ enabled: true })
    render(<IncomeSourceBadges source={source} onEnabledChange={mockOnEnabledChange} />)

    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)

    expect(mockOnEnabledChange).toHaveBeenCalledWith(false)
  })
})
