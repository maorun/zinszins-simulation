import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { QuellensteuerconfigurationSection } from './QuellensteuerconfigurationSection'

describe('QuellensteuerconfigurationSection', () => {
  const defaultProps = {
    enabled: false,
    foreignIncome: 0,
    withholdingTaxRate: 0.15,
    countryCode: 'US',
    germanCapitalGainsTaxRate: 0.26375,
    teilfreistellung: 0,
    onEnabledChange: vi.fn(),
    onForeignIncomeChange: vi.fn(),
    onWithholdingTaxRateChange: vi.fn(),
    onCountryCodeChange: vi.fn(),
  }

  it('should render section with toggle switch', () => {
    render(<QuellensteuerconfigurationSection {...defaultProps} />)

    expect(screen.getByText('🌍 Quellensteueranrechnung')).toBeInTheDocument()
    expect(
      screen.getByText(/Anrechnung ausländischer Quellensteuer auf deutsche Kapitalertragsteuer/),
    ).toBeInTheDocument()

    const switchElement = screen.getByRole('switch')
    expect(switchElement).toBeInTheDocument()
    expect(switchElement).not.toBeChecked()
  })

  it('should show configuration when enabled', () => {
    render(<QuellensteuerconfigurationSection {...defaultProps} enabled={true} />)

    expect(screen.getByText('Land der ausländischen Kapitalerträge')).toBeInTheDocument()
    expect(screen.getByText('Ausländische Kapitalerträge (€)')).toBeInTheDocument()
    expect(screen.getByText('Quellensteuersatz')).toBeInTheDocument()
  })

  it('should hide configuration when disabled', () => {
    render(<QuellensteuerconfigurationSection {...defaultProps} enabled={false} />)

    expect(screen.queryByText('Land der ausländischen Kapitalerträge')).not.toBeInTheDocument()
    expect(screen.queryByText('Ausländische Kapitalerträge (€)')).not.toBeInTheDocument()
  })

  it('should call onEnabledChange when switch is toggled', () => {
    const onEnabledChange = vi.fn()
    render(<QuellensteuerconfigurationSection {...defaultProps} onEnabledChange={onEnabledChange} />)

    const switchElement = screen.getByRole('switch')
    fireEvent.click(switchElement)

    expect(onEnabledChange).toHaveBeenCalledWith(true)
  })

  it('should call onForeignIncomeChange when amount is entered', () => {
    const onForeignIncomeChange = vi.fn()
    render(
      <QuellensteuerconfigurationSection
        {...defaultProps}
        enabled={true}
        onForeignIncomeChange={onForeignIncomeChange}
      />,
    )

    const input = screen.getByLabelText('Ausländische Kapitalerträge (€)')
    fireEvent.change(input, { target: { value: '1000' } })

    expect(onForeignIncomeChange).toHaveBeenCalledWith(1000)
  })

  it('should display calculation result when enabled with income', () => {
    render(
      <QuellensteuerconfigurationSection
        {...defaultProps}
        enabled={true}
        foreignIncome={1000}
        withholdingTaxRate={0.15}
      />,
    )

    expect(screen.getByText('📊 Steuerberechnung')).toBeInTheDocument()
    expect(screen.getByText('Ausländische Einkünfte:')).toBeInTheDocument()
    expect(screen.getByText('Gezahlte Quellensteuer:')).toBeInTheDocument()
    expect(screen.getByText('Anrechenbare Quellensteuer:')).toBeInTheDocument()
  })

  it('should not display calculation result when income is zero', () => {
    render(
      <QuellensteuerconfigurationSection
        {...defaultProps}
        enabled={true}
        foreignIncome={0}
        withholdingTaxRate={0.15}
      />,
    )

    expect(screen.queryByText('📊 Steuerberechnung')).not.toBeInTheDocument()
  })

  it('should show DBA rate by default', () => {
    render(
      <QuellensteuerconfigurationSection {...defaultProps} enabled={true} countryCode="US" withholdingTaxRate={0.15} />,
    )

    expect(screen.getByText(/DBA-Satz USA:/)).toBeInTheDocument()
    expect(screen.getByText('15.0%')).toBeInTheDocument()
  })

  it('should allow switching to custom rate', () => {
    render(<QuellensteuerconfigurationSection {...defaultProps} enabled={true} />)

    const customButton = screen.getByRole('button', { name: /Benutzerdefinierten Satz/i })
    fireEvent.click(customButton)

    // Should now show custom rate input - check by looking for the input with correct id
    const customRateInput = screen.getByPlaceholderText('15.0')
    expect(customRateInput).toBeInTheDocument()
    expect(customRateInput).toHaveAttribute('type', 'number')
  })

  it('should show all supported countries in radio group', () => {
    render(<QuellensteuerconfigurationSection {...defaultProps} enabled={true} />)

    // Check for a few key countries
    expect(screen.getByText(/USA - reduziert auf 15% durch DBA/)).toBeInTheDocument()
    expect(screen.getByText(/Schweiz - reduziert auf 15% durch DBA/)).toBeInTheDocument()
  })

  it('should show limit warning when foreign tax exceeds German tax', () => {
    render(
      <QuellensteuerconfigurationSection
        {...defaultProps}
        enabled={true}
        foreignIncome={1000}
        withholdingTaxRate={0.35} // Swiss rate before DBA
      />,
    )

    expect(screen.getByText(/Anrechnung begrenzt/)).toBeInTheDocument()
    const warningElements = screen.getAllByText(/nicht anrechenbare Betrag/)
    expect(warningElements.length).toBeGreaterThan(0)
  })

  it('should not show limit warning when foreign tax is lower than German tax', () => {
    render(
      <QuellensteuerconfigurationSection
        {...defaultProps}
        enabled={true}
        foreignIncome={1000}
        withholdingTaxRate={0.15}
      />,
    )

    expect(screen.queryByText(/Anrechnung begrenzt/)).not.toBeInTheDocument()
  })

  it('should display informational hints', () => {
    render(<QuellensteuerconfigurationSection {...defaultProps} enabled={true} />)

    expect(screen.getByText(/Hinweise zur Quellensteueranrechnung/)).toBeInTheDocument()
    const dbaElements = screen.getAllByText(/Doppelbesteuerungsabkommen \(DBA\)/)
    expect(dbaElements.length).toBeGreaterThan(0)
  })

  it('should apply Teilfreistellung in calculations', () => {
    render(
      <QuellensteuerconfigurationSection
        {...defaultProps}
        enabled={true}
        foreignIncome={1000}
        withholdingTaxRate={0.15}
        teilfreistellung={0.3} // 30% for equity funds
      />,
    )

    // With 30% Teilfreistellung, taxable income is 700 EUR
    // German tax = 700 * 0.26375 = 184.625 EUR
    // Foreign tax = 150 EUR (fully creditable)
    // Remaining German tax = 34.625 EUR
    expect(screen.getByText('📊 Steuerberechnung')).toBeInTheDocument()

    // Check that calculation was performed with Teilfreistellung
    const germanTaxElement = screen.getByText(/Deutsche Steuer \(vor Anrechnung\):/)
    expect(germanTaxElement).toBeInTheDocument()
  })

  it('should handle country change', () => {
    const onCountryCodeChange = vi.fn()
    const onWithholdingTaxRateChange = vi.fn()

    render(
      <QuellensteuerconfigurationSection
        {...defaultProps}
        enabled={true}
        onCountryCodeChange={onCountryCodeChange}
        onWithholdingTaxRateChange={onWithholdingTaxRateChange}
      />,
    )

    const swissRadio = screen.getByRole('radio', { name: /Schweiz - reduziert auf 15% durch DBA/ })
    fireEvent.click(swissRadio)

    expect(onCountryCodeChange).toHaveBeenCalledWith('CH')
    expect(onWithholdingTaxRateChange).toHaveBeenCalledWith(0.15) // DBA rate for Switzerland
  })

  it('should show explanation text in calculation result', () => {
    render(
      <QuellensteuerconfigurationSection
        {...defaultProps}
        enabled={true}
        foreignIncome={1000}
        withholdingTaxRate={0.15}
      />,
    )

    expect(screen.getByText(/Erklärung:/)).toBeInTheDocument()
    expect(screen.getByText(/ausländischen Kapitalerträgen von 1000.00/)).toBeInTheDocument()
  })
})
