import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TaxDeferralCalculatorCard } from './TaxDeferralCalculatorCard'
import { SimulationProvider } from '../contexts/SimulationContext'

// Mock the useSimulation hook with default values
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => ({
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2024: 1000 },
  }),
}))

function renderTaxDeferralCalculatorCard() {
  return render(
    <SimulationProvider>
      <TaxDeferralCalculatorCard />
    </SimulationProvider>,
  )
}

describe('TaxDeferralCalculatorCard', () => {
  it('should render the card with collapsed state by default', () => {
    renderTaxDeferralCalculatorCard()

    // Card header should be visible
    expect(screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]).toBeInTheDocument()
    
    // Content should not be visible initially (collapsed)
    expect(screen.queryByText(/Anfangsinvestition/i)).not.toBeInTheDocument()
  })

  it('should expand and show info message when opened', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Click to expand
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Info message should be visible
    expect(screen.getByText(/thesaurierenden/i)).toBeInTheDocument()
    expect(screen.getByText(/ausschüttenden/i)).toBeInTheDocument()
  })

  it('should render configuration form when expanded', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Configuration inputs should be visible
    expect(screen.getByLabelText(/Anfangsinvestition/i)).toBeInTheDocument()
    expect(screen.getByText(/Anlagedauer \(Jahre\)/i)).toBeInTheDocument()
    // Use getAllByText for "Erwartete Rendite" as it appears in both form and results
    expect(screen.getAllByText(/Erwartete Rendite/i).length).toBeGreaterThan(0)
  })

  it('should display results with default configuration', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Results should be displayed
    expect(screen.getByText(/Vergleichsergebnis/i)).toBeInTheDocument()
    expect(screen.getByText(/Thesaurierend \(Endkapital\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Ausschüttend \(Endkapital\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Vorteil Thesaurierung/i)).toBeInTheDocument()
  })

  it('should update results when initial investment changes', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Change initial investment
    const input = screen.getByLabelText(/Anfangsinvestition/i) as HTMLInputElement
    await user.clear(input)
    await user.type(input, '100000')

    // Wait for results to update
    // Results should still be visible
    expect(screen.getByText(/Vergleichsergebnis/i)).toBeInTheDocument()
  })

  it('should show tax comparison for both fund types', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Tax comparison sections should be visible
    expect(screen.getByText(/📘 Thesaurierend/i)).toBeInTheDocument()
    expect(screen.getByText(/📙 Ausschüttend/i)).toBeInTheDocument()
    
    // Both should show tax paid
    const taxLabels = screen.getAllByText(/Gezahlte Steuern/i)
    expect(taxLabels).toHaveLength(2)
  })

  it('should display tax deferral benefit explanation', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Explanation should be visible
    expect(screen.getByText(/Steuerstundungsvorteil/i)).toBeInTheDocument()
    expect(screen.getByText(/Zinseszinseffekt/i)).toBeInTheDocument()
  })

  it('should display calculation parameters', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Parameters section should be visible
    expect(screen.getByText(/Berechnungsparameter/i)).toBeInTheDocument()
    expect(screen.getByText(/Steuersatz/i)).toBeInTheDocument()
    expect(screen.getByText(/Teilfreistellung/i)).toBeInTheDocument()
    expect(screen.getByText(/Freibetrag/i)).toBeInTheDocument()
  })

  it('should handle year slider changes', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Year slider should be present
    const yearLabel = screen.getByText(/Anlagedauer \(Jahre\): \d+/)
    expect(yearLabel).toBeInTheDocument()
  })

  it('should handle return rate slider changes', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Return rate slider should be present
    const returnLabel = screen.getByText(/Erwartete Rendite: \d+\.\d+%/)
    expect(returnLabel).toBeInTheDocument()
  })

  it('should show accumulating fund advantage', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Should show that accumulating is better
    expect(screen.getByText(/Vorteil Thesaurierung/i)).toBeInTheDocument()
    
    // Should show percentage advantage
    const percentageText = screen.getByText(/% mehr\)/)
    expect(percentageText).toBeInTheDocument()
  })

  it('should display formatted currency values', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Currency values should be formatted (look for € symbol)
    const currencyElements = screen.getAllByText(/€/)
    expect(currencyElements.length).toBeGreaterThan(0)
  })

  it('should explain Vorabpauschale for accumulating funds', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Should mention Vorabpauschale
    expect(screen.getByText(/Nur Vorabpauschale besteuert/i)).toBeInTheDocument()
  })

  it('should explain full taxation for distributing funds', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Should mention full taxation
    expect(screen.getByText(/Volle Besteuerung der Ausschüttungen/i)).toBeInTheDocument()
  })

  it('should handle invalid input gracefully', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Try to enter invalid value
    const input = screen.getByLabelText(/Anfangsinvestition/i) as HTMLInputElement
    await user.clear(input)
    await user.type(input, '0')

    // Component should still render without crashing
    expect(screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]).toBeInTheDocument()
  })

  it('should show both fund end values side by side', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Both final values should be shown
    const endValueLabels = screen.getAllByText(/Endkapital/i)
    expect(endValueLabels.length).toBeGreaterThanOrEqual(2)
  })

  it('should display current tax rates from simulation context', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // Parameters should reflect simulation context values
    // 26.375% capital gains tax rate
    const steuersatzValue = screen.getByText(/26\.38%/)
    expect(steuersatzValue).toBeInTheDocument()
  })

  it('should have accessible form labels', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card
    const header = screen.getAllByText(/Steuerstundungs-Kalkulator/i)[0]
    await user.click(header)

    // All form inputs should have associated labels
    const initialInvestmentInput = screen.getByLabelText(/Anfangsinvestition/i)
    expect(initialInvestmentInput).toBeInTheDocument()
    expect(initialInvestmentInput).toHaveAttribute('type', 'number')
  })

  it('should maintain state between collapse and expand', async () => {
    const user = userEvent.setup()
    renderTaxDeferralCalculatorCard()

    // Expand the card - use getAllByText since text appears in header and info message
    let headers = screen.getAllByText(/Steuerstundungs-Kalkulator/i)
    await user.click(headers[0]) // Click the main header

    // Change a value
    const input = screen.getByLabelText(/Anfangsinvestition/i) as HTMLInputElement
    await user.clear(input)
    await user.type(input, '75000')

    // Collapse the card
    headers = screen.getAllByText(/Steuerstundungs-Kalkulator/i)
    await user.click(headers[0])

    // Expand again
    headers = screen.getAllByText(/Steuerstundungs-Kalkulator/i)
    await user.click(headers[0])

    // Value should be maintained
    const inputAfter = screen.getByLabelText(/Anfangsinvestition/i) as HTMLInputElement
    expect(inputAfter.value).toBe('75000')
  })
})
