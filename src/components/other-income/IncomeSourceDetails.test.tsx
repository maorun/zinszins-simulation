import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { IncomeSourceDetails } from './IncomeSourceDetails'
import type { OtherIncomeSource } from '../../../helpers/other-income'

describe('IncomeSourceDetails', () => {
  const createMockSource = (overrides?: Partial<OtherIncomeSource>): OtherIncomeSource => ({
    id: 'test-source',
    name: 'Test Source',
    type: 'rental',
    monthlyAmount: 1000,
    amountType: 'gross',
    taxRate: 30,
    startYear: 2025,
    endYear: 2030,
    inflationRate: 2,
    enabled: true,
    notes: '',
    ...overrides,
  })

  it('renders monthly and annual amounts correctly', () => {
    const source = createMockSource({ monthlyAmount: 1500 })
    render(<IncomeSourceDetails source={source} />)

    expect(screen.getByText(/1\.500.*€\/Monat/)).toBeInTheDocument()
    expect(screen.getByText(/18\.000.*€\/Jahr/)).toBeInTheDocument()
  })

  it('renders time period with start and end year', () => {
    const source = createMockSource({ startYear: 2025, endYear: 2030 })
    render(<IncomeSourceDetails source={source} />)

    expect(screen.getByText(/2025.*-.*2030/)).toBeInTheDocument()
  })

  it('renders unlimited when end year is null', () => {
    const source = createMockSource({ startYear: 2025, endYear: null })
    render(<IncomeSourceDetails source={source} />)

    expect(screen.getByText(/2025.*-.*Unbegrenzt/)).toBeInTheDocument()
  })

  it('renders inflation rate', () => {
    const source = createMockSource({ inflationRate: 3.5 })
    render(<IncomeSourceDetails source={source} />)

    expect(screen.getByText(/3\.5% Inflation/)).toBeInTheDocument()
  })

  it('renders tax rate for gross amounts', () => {
    const source = createMockSource({ amountType: 'gross', taxRate: 25 })
    render(<IncomeSourceDetails source={source} />)

    expect(screen.getByText(/25% Steuersatz/)).toBeInTheDocument()
  })

  it('does not render tax rate for net amounts', () => {
    const source = createMockSource({ amountType: 'net', taxRate: 25 })
    render(<IncomeSourceDetails source={source} />)

    expect(screen.queryByText(/Steuersatz/)).not.toBeInTheDocument()
  })

  it('renders notes when provided', () => {
    const source = createMockSource({ notes: 'Test note content' })
    render(<IncomeSourceDetails source={source} />)

    expect(screen.getByText(/Test note content/)).toBeInTheDocument()
  })

  it('does not render notes section when notes are empty', () => {
    const source = createMockSource({ notes: '' })
    render(<IncomeSourceDetails source={source} />)

    expect(screen.queryByText('📝')).not.toBeInTheDocument()
  })

  it('renders real estate details when type is rental and config exists', () => {
    const source = createMockSource({
      type: 'rental',
      realEstateConfig: {
        propertyValue: 500000,
        maintenanceCostPercent: 1.5,
        vacancyRatePercent: 5,
        monthlyMortgagePayment: 1500,
        propertyAppreciationRate: 2,
        includeAppreciation: true,
      },
    })

    render(<IncomeSourceDetails source={source} />)

    expect(screen.getByText(/🏠 Immobilien-Details:/)).toBeInTheDocument()
  })

  it('does not render real estate details when type is not rental', () => {
    const source = createMockSource({
      type: 'pension',
      realEstateConfig: undefined,
    })

    render(<IncomeSourceDetails source={source} />)

    expect(screen.queryByText(/🏠 Immobilien-Details:/)).not.toBeInTheDocument()
  })
})
