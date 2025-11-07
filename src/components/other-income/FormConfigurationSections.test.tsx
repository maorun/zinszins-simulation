import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormConfigurationSections } from './FormConfigurationSections'
import type { OtherIncomeSource } from '../../../helpers/other-income'

describe('FormConfigurationSections', () => {
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

  it('renders AmountTypeSection when not Kindergeld', () => {
    const source = createMockSource({ type: 'rental' })
    render(
      <FormConfigurationSections
        editingSource={source}
        monthlyAmountId="test-id"
        currentYear={2025}
        isKindergeld={false}
        isBURente={false}
        isRental={true}
        isGrossIncome={true}
        onUpdate={mockOnUpdate}
      />,
    )

    expect(screen.getByText('Brutto')).toBeInTheDocument()
  })

  it('hides AmountTypeSection for Kindergeld', () => {
    const source = createMockSource({ type: 'kindergeld', amountType: 'net' })
    render(
      <FormConfigurationSections
        editingSource={source}
        monthlyAmountId="test-id"
        currentYear={2025}
        isKindergeld={true}
        isBURente={false}
        isRental={false}
        isGrossIncome={false}
        onUpdate={mockOnUpdate}
      />,
    )

    expect(screen.queryByText('Brutto')).not.toBeInTheDocument()
  })

  it('renders TaxRateSection when gross income', () => {
    const source = createMockSource({ amountType: 'gross', taxRate: 30 })
    render(
      <FormConfigurationSections
        editingSource={source}
        monthlyAmountId="test-id"
        currentYear={2025}
        isKindergeld={false}
        isBURente={false}
        isRental={false}
        isGrossIncome={true}
        onUpdate={mockOnUpdate}
      />,
    )

    expect(screen.getByText(/Steuersatz/)).toBeInTheDocument()
  })

  it('hides TaxRateSection for net income', () => {
    const source = createMockSource({ amountType: 'net', taxRate: 0 })
    render(
      <FormConfigurationSections
        editingSource={source}
        monthlyAmountId="test-id"
        currentYear={2025}
        isKindergeld={false}
        isBURente={false}
        isRental={false}
        isGrossIncome={false}
        onUpdate={mockOnUpdate}
      />,
    )

    expect(screen.queryByText(/Steuersatz/)).not.toBeInTheDocument()
  })

  it('renders RealEstateConfigSection for rental income', () => {
    const source = createMockSource({
      type: 'rental',
      realEstateConfig: {
        maintenanceCostPercent: 10,
        vacancyRatePercent: 5,
        propertyAppreciationRate: 2,
        propertyValue: 200000,
        monthlyMortgagePayment: 1000,
        includeAppreciation: true,
      },
    })
    render(
      <FormConfigurationSections
        editingSource={source}
        monthlyAmountId="test-id"
        currentYear={2025}
        isKindergeld={false}
        isBURente={false}
        isRental={true}
        isGrossIncome={true}
        onUpdate={mockOnUpdate}
      />,
    )

    expect(screen.getByText(/Immobilien-spezifische Einstellungen/)).toBeInTheDocument()
  })

  it('hides RealEstateConfigSection for non-rental income', () => {
    const source = createMockSource({ type: 'pension' })
    render(
      <FormConfigurationSections
        editingSource={source}
        monthlyAmountId="test-id"
        currentYear={2025}
        isKindergeld={false}
        isBURente={false}
        isRental={false}
        isGrossIncome={true}
        onUpdate={mockOnUpdate}
      />,
    )

    expect(screen.queryByText(/Immobilien-spezifische Einstellungen/)).not.toBeInTheDocument()
  })

  it('renders KindergeldConfigSection for Kindergeld income', () => {
    const source = createMockSource({
      type: 'kindergeld',
      kindergeldConfig: {
        numberOfChildren: 2,
        childBirthYear: 2018,
        inEducation: false,
        childOrderNumber: 1,
      },
    })
    render(
      <FormConfigurationSections
        editingSource={source}
        monthlyAmountId="test-id"
        currentYear={2025}
        isKindergeld={true}
        isBURente={false}
        isRental={false}
        isGrossIncome={false}
        onUpdate={mockOnUpdate}
      />,
    )

    expect(screen.getByText(/Kindergeld-spezifische Einstellungen/)).toBeInTheDocument()
  })

  it('hides KindergeldConfigSection for non-Kindergeld income', () => {
    const source = createMockSource({ type: 'rental' })
    render(
      <FormConfigurationSections
        editingSource={source}
        monthlyAmountId="test-id"
        currentYear={2025}
        isKindergeld={false}
        isBURente={false}
        isRental={true}
        isGrossIncome={true}
        onUpdate={mockOnUpdate}
      />,
    )

    expect(screen.queryByText(/Kindergeld-spezifische Einstellungen/)).not.toBeInTheDocument()
  })
})
