import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { IncomeSourceCard } from './IncomeSourceCard'
import type { OtherIncomeSource } from '../../../helpers/other-income'

describe('IncomeSourceCard', () => {
  const mockSource: OtherIncomeSource = {
    id: 'test-source-1',
    name: 'Test Income Source',
    type: 'rental',
    monthlyAmount: 1000,
    amountType: 'gross',
    taxRate: 30,
    startYear: 2025,
    endYear: 2030,
    inflationRate: 2,
    enabled: true,
    notes: 'Test notes',
  }

  const mockOnSourceChange = vi.fn()
  const mockOnEditSource = vi.fn()
  const mockOnDeleteSource = vi.fn()

  it('renders income source with all basic information', () => {
    render(
      <IncomeSourceCard
        source={mockSource}
        onSourceChange={mockOnSourceChange}
        onEditSource={mockOnEditSource}
        onDeleteSource={mockOnDeleteSource}
        editingSource={null}
      />,
    )

    expect(screen.getByText('Test Income Source')).toBeInTheDocument()
    expect(screen.getByText('Mieteinnahmen')).toBeInTheDocument()
    expect(screen.getByText('Brutto')).toBeInTheDocument()
    expect(screen.getByText(/1\.000.*€\/Monat/)).toBeInTheDocument()
    expect(screen.getByText(/2025.*-.*2030/)).toBeInTheDocument()
    expect(screen.getByText(/2% Inflation/)).toBeInTheDocument()
    expect(screen.getByText(/Test notes/)).toBeInTheDocument()
  })

  it('calls onEditSource when edit button is clicked', () => {
    render(
      <IncomeSourceCard
        source={mockSource}
        onSourceChange={mockOnSourceChange}
        onEditSource={mockOnEditSource}
        onDeleteSource={mockOnDeleteSource}
        editingSource={null}
      />,
    )

    fireEvent.click(screen.getByRole('button', { name: /bearbeiten/i }))
    expect(mockOnEditSource).toHaveBeenCalledWith(mockSource)
  })

  it('calls onDeleteSource when delete button is clicked', () => {
    render(
      <IncomeSourceCard
        source={mockSource}
        onSourceChange={mockOnSourceChange}
        onEditSource={mockOnEditSource}
        onDeleteSource={mockOnDeleteSource}
        editingSource={null}
      />,
    )

    const deleteButtons = screen.getAllByRole('button')
    const deleteButton = deleteButtons.find(btn => btn.querySelector('svg'))
    fireEvent.click(deleteButton!)
    expect(mockOnDeleteSource).toHaveBeenCalledWith('test-source-1')
  })

  it('disables edit button when another source is being edited', () => {
    const otherSource: OtherIncomeSource = { ...mockSource, id: 'other-source' }

    render(
      <IncomeSourceCard
        source={mockSource}
        onSourceChange={mockOnSourceChange}
        onEditSource={mockOnEditSource}
        onDeleteSource={mockOnDeleteSource}
        editingSource={otherSource}
      />,
    )

    expect(screen.getByRole('button', { name: /bearbeiten/i })).toBeDisabled()
  })

  it('calls onSourceChange when switch is toggled', () => {
    render(
      <IncomeSourceCard
        source={mockSource}
        onSourceChange={mockOnSourceChange}
        onEditSource={mockOnEditSource}
        onDeleteSource={mockOnDeleteSource}
        editingSource={null}
      />,
    )

    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)
    expect(mockOnSourceChange).toHaveBeenCalledWith('test-source-1', { enabled: false })
  })

  it('displays unlimited end year correctly', () => {
    const sourceWithUnlimitedEnd = { ...mockSource, endYear: null }

    render(
      <IncomeSourceCard
        source={sourceWithUnlimitedEnd}
        onSourceChange={mockOnSourceChange}
        onEditSource={mockOnEditSource}
        onDeleteSource={mockOnDeleteSource}
        editingSource={null}
      />,
    )

    expect(screen.getByText(/2025.*-.*Unbegrenzt/)).toBeInTheDocument()
  })

  it('displays real estate details when type is rental and config exists', () => {
    const rentalSource: OtherIncomeSource = {
      ...mockSource,
      type: 'rental',
      realEstateConfig: {
        propertyValue: 500000,
        maintenanceCostPercent: 1.5,
        vacancyRatePercent: 5,
        monthlyMortgagePayment: 1500,
        propertyAppreciationRate: 2,
        includeAppreciation: true,
      },
    }

    render(
      <IncomeSourceCard
        source={rentalSource}
        onSourceChange={mockOnSourceChange}
        onEditSource={mockOnEditSource}
        onDeleteSource={mockOnDeleteSource}
        editingSource={null}
      />,
    )

    expect(screen.getByText(/🏠 Immobilien-Details:/)).toBeInTheDocument()
    expect(screen.getByText(/500\.000.*€/)).toBeInTheDocument()
    expect(screen.getByText(/1\.5%/)).toBeInTheDocument()
  })
})
