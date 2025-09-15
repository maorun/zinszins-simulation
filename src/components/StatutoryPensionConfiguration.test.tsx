import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StatutoryPensionConfiguration } from './StatutoryPensionConfiguration'

const mockOnChange = {
  onEnabledChange: vi.fn(),
  onStartYearChange: vi.fn(),
  onMonthlyAmountChange: vi.fn(),
  onAnnualIncreaseRateChange: vi.fn(),
  onTaxablePercentageChange: vi.fn(),
  onRetirementAgeChange: vi.fn(),
  onBirthYearChange: vi.fn(),
  onTaxReturnDataChange: vi.fn(),
}

const defaultValues = {
  enabled: true,
  startYear: 2041,
  monthlyAmount: 1500,
  annualIncreaseRate: 1.0,
  taxablePercentage: 80,
  retirementAge: 67,
  birthYear: 1974,
  hasTaxReturnData: false,
  taxYear: 2023,
  annualPensionReceived: 0,
  taxablePortion: 0,
}

describe('StatutoryPensionConfiguration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Helper function to expand collapsible
  const expandCollapsible = () => {
    // Find the collapsible trigger by its button type and content
    const trigger = screen.getByText(/🏛️ Gesetzliche Renten-Konfiguration/).closest('button')
    if (trigger) {
      fireEvent.click(trigger)
    }
    else {
      // Fallback to find by heading and click its parent
      const heading = screen.getByText(/🏛️ Gesetzliche Renten-Konfiguration/)
      const button = heading.closest('[type="button"]')
      if (button) fireEvent.click(button)
    }
  }

  it('renders disabled state correctly', () => {
    const disabledValues = { ...defaultValues, enabled: false }
    render(
      <StatutoryPensionConfiguration
        values={disabledValues}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    expect(screen.getByLabelText('Gesetzliche Rente berücksichtigen')).not.toBeChecked()
    expect(screen.getByText(/Aktivieren Sie diese Option/)).toBeInTheDocument()

    // Should not show configuration options when disabled
    expect(screen.queryByText('Daten aus Rentenbescheid importieren')).not.toBeInTheDocument()
  })

  it('renders enabled state with all configuration options', () => {
    render(
      <StatutoryPensionConfiguration
        values={defaultValues}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    expect(screen.getByLabelText('Gesetzliche Rente berücksichtigen')).toBeChecked()
    expect(screen.getByText('Daten aus Rentenbescheid importieren')).toBeInTheDocument()
    expect(screen.getByLabelText('Rentenbeginn (Jahr)')).toBeInTheDocument()
    expect(screen.getByLabelText('Monatliche Rente (brutto) €')).toBeInTheDocument()
    expect(screen.getByText('Jährliche Rentenanpassung (%)')).toBeInTheDocument()
    expect(screen.getByText('Steuerpflichtiger Anteil (%)')).toBeInTheDocument()
    expect(screen.getByText('Zusammenfassung')).toBeInTheDocument()
  })

  it('toggles enabled state correctly', () => {
    const disabledValues = { ...defaultValues, enabled: false }
    render(
      <StatutoryPensionConfiguration
        values={disabledValues}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    const toggle = screen.getByRole('switch')
    fireEvent.click(toggle)

    expect(mockOnChange.onEnabledChange).toHaveBeenCalledWith(true)
  })

  it('handles monthly amount input correctly', () => {
    render(
      <StatutoryPensionConfiguration
        values={defaultValues}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    const monthlyInput = screen.getByLabelText('Monatliche Rente (brutto) €')
    fireEvent.change(monthlyInput, { target: { value: '1600' } })

    expect(mockOnChange.onMonthlyAmountChange).toHaveBeenCalledWith(1600)
  })

  it('handles start year input correctly', () => {
    render(
      <StatutoryPensionConfiguration
        values={defaultValues}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    const startYearInput = screen.getByLabelText('Rentenbeginn (Jahr)')
    fireEvent.change(startYearInput, { target: { value: '2042' } })

    expect(mockOnChange.onStartYearChange).toHaveBeenCalledWith(2042)
  })

  it('shows tax return data fields when enabled', () => {
    const valuesWithTaxReturn = { ...defaultValues, hasTaxReturnData: true }
    render(
      <StatutoryPensionConfiguration
        values={valuesWithTaxReturn}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    expect(screen.getByLabelText('Steuerjahr')).toBeInTheDocument()
    expect(screen.getByLabelText('Jahresrente (brutto) €')).toBeInTheDocument()
    expect(screen.getByLabelText('Steuerpflichtiger Anteil €')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Werte automatisch berechnen/ })).toBeInTheDocument()
  })

  it('handles tax return data toggle correctly', () => {
    render(
      <StatutoryPensionConfiguration
        values={defaultValues}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    const taxReturnToggle = screen.getByLabelText('Daten aus Rentenbescheid verfügbar')
    fireEvent.click(taxReturnToggle)

    expect(mockOnChange.onTaxReturnDataChange).toHaveBeenCalledWith({
      hasTaxReturnData: true,
      taxYear: 2023,
      annualPensionReceived: 0,
      taxablePortion: 0,
    })
  })

  it('handles tax return data input correctly', () => {
    const valuesWithTaxReturn = {
      ...defaultValues,
      hasTaxReturnData: true,
      annualPensionReceived: 18000,
      taxablePortion: 14400,
    }
    render(
      <StatutoryPensionConfiguration
        values={valuesWithTaxReturn}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    const annualPensionInput = screen.getByLabelText('Jahresrente (brutto) €')
    fireEvent.change(annualPensionInput, { target: { value: '19200' } })

    expect(mockOnChange.onTaxReturnDataChange).toHaveBeenCalledWith({
      hasTaxReturnData: true,
      taxYear: 2023,
      annualPensionReceived: 19200,
      taxablePortion: 14400,
    })
  })

  it('calculates start year from birth year and retirement age', () => {
    const valuesWithBirthYear = { ...defaultValues, birthYear: 1975, retirementAge: 65 }
    render(
      <StatutoryPensionConfiguration
        values={valuesWithBirthYear}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    const calculateButton = screen.getByRole('button', { name: 'Berechnen' })
    fireEvent.click(calculateButton)

    expect(mockOnChange.onStartYearChange).toHaveBeenCalledWith(2040) // 1975 + 65
  })

  it('handles birth year and retirement age input changes', () => {
    render(
      <StatutoryPensionConfiguration
        values={defaultValues}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    const birthYearInput = screen.getByLabelText('Geburtsjahr')
    fireEvent.change(birthYearInput, { target: { value: '1975' } })

    const retirementAgeInput = screen.getByLabelText('Renteneintrittsalter')
    fireEvent.change(retirementAgeInput, { target: { value: '65' } })

    expect(mockOnChange.onBirthYearChange).toHaveBeenCalledWith(1975)
    expect(mockOnChange.onRetirementAgeChange).toHaveBeenCalledWith(65)
  })

  it('imports values from tax return data correctly', () => {
    const valuesWithTaxReturn = {
      ...defaultValues,
      hasTaxReturnData: true,
      annualPensionReceived: 19200,
      taxablePortion: 15360,
    }
    render(
      <StatutoryPensionConfiguration
        values={valuesWithTaxReturn}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    const importButton = screen.getByRole('button', { name: /Werte automatisch berechnen/ })
    fireEvent.click(importButton)

    expect(mockOnChange.onMonthlyAmountChange).toHaveBeenCalledWith(1600) // 19200 / 12
    expect(mockOnChange.onTaxablePercentageChange).toHaveBeenCalledWith(80) // 15360 / 19200 * 100
  })

  it('disables import button when no annual pension data', () => {
    const valuesWithTaxReturn = {
      ...defaultValues,
      hasTaxReturnData: true,
      annualPensionReceived: 0,
    }
    render(
      <StatutoryPensionConfiguration
        values={valuesWithTaxReturn}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    const importButton = screen.getByRole('button', { name: /Werte automatisch berechnen/ })
    expect(importButton).toBeDisabled()
  })

  it('disables calculate button when birth year or retirement age missing', () => {
    const valuesWithoutBirthYear = { ...defaultValues, birthYear: undefined }
    render(
      <StatutoryPensionConfiguration
        values={valuesWithoutBirthYear}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    const calculateButton = screen.getByRole('button', { name: 'Berechnen' })
    expect(calculateButton).toBeDisabled()
  })

  it('displays correct summary information', () => {
    render(
      <StatutoryPensionConfiguration
        values={defaultValues}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    expect(screen.getByText('Rentenbeginn:')).toBeInTheDocument()
    expect(screen.getByText('2041')).toBeInTheDocument()
    expect(screen.getByText('Monatliche Rente:')).toBeInTheDocument()
    expect(screen.getByText('1.500 €')).toBeInTheDocument()
    expect(screen.getByText('Jährliche Rente:')).toBeInTheDocument()
    expect(screen.getByText('18.000 €')).toBeInTheDocument()
    expect(screen.getByText('Steuerpflichtiger Betrag:')).toBeInTheDocument()
    expect(screen.getByText('14.400 €/Jahr')).toBeInTheDocument() // 18000 * 0.8
  })

  it('updates annual pension display when monthly amount changes', () => {
    const { rerender } = render(
      <StatutoryPensionConfiguration
        values={defaultValues}
        onChange={mockOnChange}
      />,
    )

    // First expand to access content
    expandCollapsible()

    expect(screen.getByText('18.000 €')).toBeInTheDocument()

    const updatedValues = { ...defaultValues, monthlyAmount: 1600 }
    rerender(
      <StatutoryPensionConfiguration
        values={updatedValues}
        onChange={mockOnChange}
      />,
    )

    expect(screen.getByText('19.200 €')).toBeInTheDocument()
  })
})
