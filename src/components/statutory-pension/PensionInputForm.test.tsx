import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PensionInputForm } from './PensionInputForm'

const mockOnChange = {
  onMonthlyAmountChange: vi.fn(),
  onAnnualIncreaseRateChange: vi.fn(),
  onTaxablePercentageChange: vi.fn(),
  onRetirementAgeChange: vi.fn(),
  onTaxReturnDataChange: vi.fn(),
}

const mockOnImportFromTaxReturn = vi.fn()

const defaultValues = {
  monthlyAmount: 1500,
  annualIncreaseRate: 1.0,
  taxablePercentage: 80,
  retirementAge: 67,
  startYear: 2041,
  hasTaxReturnData: false,
  taxYear: 2023,
  annualPensionReceived: 0,
  taxablePortion: 0,
}

describe('PensionInputForm', () => {
  it('renders all input fields correctly', () => {
    render(
      <PensionInputForm
        values={defaultValues}
        onChange={mockOnChange}
        nestingLevel={0}
        birthYear={1974}
        currentYear={2024}
        planningMode="individual"
        onImportFromTaxReturn={mockOnImportFromTaxReturn}
      />,
    )

    expect(screen.getByText('Daten aus Rentenbescheid importieren')).toBeInTheDocument()
    expect(screen.getByLabelText('Monatliche Rente (brutto) €')).toBeInTheDocument()
    expect(screen.getByText('Jährliche Rentenanpassung (%)')).toBeInTheDocument()
    expect(screen.getByText('Steuerpflichtiger Anteil (%)')).toBeInTheDocument()
  })

  it('displays automatic retirement calculation for individual mode', () => {
    render(
      <PensionInputForm
        values={defaultValues}
        onChange={mockOnChange}
        nestingLevel={0}
        birthYear={1974}
        currentYear={2024}
        planningMode="individual"
        onImportFromTaxReturn={mockOnImportFromTaxReturn}
      />,
    )

    expect(screen.getByText('Automatischer Rentenbeginn')).toBeInTheDocument()
    expect(screen.getByText('1974')).toBeInTheDocument()
    expect(screen.getByText('2041')).toBeInTheDocument()
  })

  it('displays automatic retirement calculation for couple mode', () => {
    render(
      <PensionInputForm
        values={defaultValues}
        onChange={mockOnChange}
        nestingLevel={0}
        birthYear={1974}
        spouseBirthYear={1976}
        currentYear={2024}
        planningMode="couple"
        onImportFromTaxReturn={mockOnImportFromTaxReturn}
      />,
    )

    expect(screen.getByText('Automatischer Rentenbeginn')).toBeInTheDocument()
    expect(screen.getByText('1974')).toBeInTheDocument()
    expect(screen.getByText('1976')).toBeInTheDocument()
  })

  it('shows warning when birth year is not provided', () => {
    render(
      <PensionInputForm
        values={defaultValues}
        onChange={mockOnChange}
        nestingLevel={0}
        currentYear={2024}
        planningMode="individual"
        onImportFromTaxReturn={mockOnImportFromTaxReturn}
      />,
    )

    expect(screen.getByText('Nicht festgelegt')).toBeInTheDocument()
    expect(screen.getByText('Bitte Geburtsjahr(e) in der Globalen Planung festlegen')).toBeInTheDocument()
  })

  it('handles monthly amount change', () => {
    render(
      <PensionInputForm
        values={defaultValues}
        onChange={mockOnChange}
        nestingLevel={0}
        birthYear={1974}
        currentYear={2024}
        planningMode="individual"
        onImportFromTaxReturn={mockOnImportFromTaxReturn}
      />,
    )

    const monthlyInput = screen.getByLabelText('Monatliche Rente (brutto) €')
    fireEvent.change(monthlyInput, { target: { value: '1600' } })

    expect(mockOnChange.onMonthlyAmountChange).toHaveBeenCalledWith(1600)
  })

  it('handles retirement age change', () => {
    render(
      <PensionInputForm
        values={defaultValues}
        onChange={mockOnChange}
        nestingLevel={0}
        birthYear={1974}
        currentYear={2024}
        planningMode="individual"
        onImportFromTaxReturn={mockOnImportFromTaxReturn}
      />,
    )

    const retirementAgeInput = screen.getByLabelText('Renteneintrittsalter')
    fireEvent.change(retirementAgeInput, { target: { value: '65' } })

    expect(mockOnChange.onRetirementAgeChange).toHaveBeenCalledWith(65)
  })

  it('shows tax return fields when enabled', () => {
    const valuesWithTaxReturn = { ...defaultValues, hasTaxReturnData: true }
    render(
      <PensionInputForm
        values={valuesWithTaxReturn}
        onChange={mockOnChange}
        nestingLevel={0}
        birthYear={1974}
        currentYear={2024}
        planningMode="individual"
        onImportFromTaxReturn={mockOnImportFromTaxReturn}
      />,
    )

    expect(screen.getByLabelText('Steuerjahr')).toBeInTheDocument()
    expect(screen.getByLabelText('Jahresrente (brutto) €')).toBeInTheDocument()
    expect(screen.getByLabelText('Steuerpflichtiger Anteil €')).toBeInTheDocument()
  })

  it('calls onImportFromTaxReturn when import button is clicked', () => {
    const valuesWithTaxReturn = {
      ...defaultValues,
      hasTaxReturnData: true,
      annualPensionReceived: 18000,
    }
    render(
      <PensionInputForm
        values={valuesWithTaxReturn}
        onChange={mockOnChange}
        nestingLevel={0}
        birthYear={1974}
        currentYear={2024}
        planningMode="individual"
        onImportFromTaxReturn={mockOnImportFromTaxReturn}
      />,
    )

    const importButton = screen.getByRole('button', { name: /Werte automatisch berechnen/ })
    fireEvent.click(importButton)

    expect(mockOnImportFromTaxReturn).toHaveBeenCalled()
  })

  it('disables import button when no annual pension data', () => {
    const valuesWithTaxReturn = {
      ...defaultValues,
      hasTaxReturnData: true,
      annualPensionReceived: 0,
    }
    render(
      <PensionInputForm
        values={valuesWithTaxReturn}
        onChange={mockOnChange}
        nestingLevel={0}
        birthYear={1974}
        currentYear={2024}
        planningMode="individual"
        onImportFromTaxReturn={mockOnImportFromTaxReturn}
      />,
    )

    const importButton = screen.getByRole('button', { name: /Werte automatisch berechnen/ })
    expect(importButton).toBeDisabled()
  })

  it('displays annual pension calculated from monthly amount', () => {
    render(
      <PensionInputForm
        values={defaultValues}
        onChange={mockOnChange}
        nestingLevel={0}
        birthYear={1974}
        currentYear={2024}
        planningMode="individual"
        onImportFromTaxReturn={mockOnImportFromTaxReturn}
      />,
    )

    // 1500 * 12 = 18000
    expect(screen.getByText(/Jährliche Rente:/)).toBeInTheDocument()
    expect(screen.getByText(/18\.000/)).toBeInTheDocument()
  })
})
