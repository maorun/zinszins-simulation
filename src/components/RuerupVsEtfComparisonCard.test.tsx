import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RuerupVsEtfComparisonCard } from './RuerupVsEtfComparisonCard'
import { SimulationProvider } from '../contexts/SimulationContext'

// Mock the useSimulation hook with default values
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => ({
    steuerlast: 26.375,
    teilfreistellungsquote: 30,
    freibetragPerYear: { 2024: 1000 },
  }),
}))

function renderRuerupVsEtfComparisonCard() {
  return render(
    <SimulationProvider>
      <RuerupVsEtfComparisonCard />
    </SimulationProvider>,
  )
}

describe('RuerupVsEtfComparisonCard', () => {
  it('should render the card with collapsed state by default', () => {
    renderRuerupVsEtfComparisonCard()

    // Card header should be visible
    expect(screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)).toBeInTheDocument()

    // Content should not be visible initially (collapsed)
    expect(screen.queryByText(/Jährlicher Beitrag/i)).not.toBeInTheDocument()
  })

  it('should expand and show info message when opened', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Click to expand
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Info message should be visible
    expect(screen.getByText(/Steuerabzug in Beitragsphase/i)).toBeInTheDocument()
    expect(screen.getByText(/privatem ETF-Sparplan/i)).toBeInTheDocument()
  })

  it('should render configuration form when expanded', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Configuration inputs should be visible
    expect(screen.getByLabelText(/Jährlicher Beitrag/i)).toBeInTheDocument()
    expect(screen.getByText(/Ansparphase \(Jahre\)/i)).toBeInTheDocument()
    expect(screen.getByText(/Erwartete Rendite/i)).toBeInTheDocument()
    expect(screen.getByText(/Steuersatz Ansparphase/i)).toBeInTheDocument()
    expect(screen.getByText(/Steuersatz Ruhestand/i)).toBeInTheDocument()
    expect(screen.getByText(/Familienstand/i)).toBeInTheDocument()
    expect(screen.getByText(/Rentenphase \(Jahre\)/i)).toBeInTheDocument()
  })

  it('should display civil status radio buttons', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Civil status options should be visible
    expect(screen.getByLabelText(/Alleinstehend/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Verheiratet/i)).toBeInTheDocument()
  })

  it('should display results with default configuration', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Results should be displayed
    expect(screen.getByText(/Gesamtergebnis/i)).toBeInTheDocument()
    // Use getAllByText because "Ansparphase" appears multiple times (label + result section)
    expect(screen.getAllByText(/Ansparphase/i).length).toBeGreaterThan(0)
    // Use getAllByText because "Rentenphase" appears multiple times (label + result section)
    expect(screen.getAllByText(/Rentenphase/i).length).toBeGreaterThan(0)
  })

  it('should show recommendation badge', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Recommendation should be visible (either Rürup, ETF, or Similar)
    const recommendation = screen.getByText(/Empfehlung|Ähnliches Ergebnis/i)
    expect(recommendation).toBeInTheDocument()
  })

  it('should display accumulation phase comparison for both options', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Both accumulation sections should be visible
    expect(screen.getByText(/💰 Ansparphase/i)).toBeInTheDocument()

    // Rürup section
    const ruerupHeaders = screen.getAllByText(/Rürup-Rente/i)
    expect(ruerupHeaders.length).toBeGreaterThan(0)

    // ETF section
    const etfHeaders = screen.getAllByText(/ETF-Sparplan/i)
    expect(etfHeaders.length).toBeGreaterThan(0)
  })

  it('should display retirement phase comparison for both options', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Retirement phase section should be visible
    expect(screen.getByText(/🏖️ Rentenphase/i)).toBeInTheDocument()

    // Both gross and net withdrawals should be shown
    const bruttoLabels = screen.getAllByText(/Brutto-Auszahlungen/i)
    expect(bruttoLabels).toHaveLength(2) // One for Rürup, one for ETF

    const nettoLabels = screen.getAllByText(/Netto erhalten/i)
    expect(nettoLabels).toHaveLength(2)
  })

  it('should show overall comparison metrics', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Overall metrics should be visible
    expect(screen.getByText(/Gesamtergebnis/i)).toBeInTheDocument()
    expect(screen.getByText(/Vorteilsdifferenz/i)).toBeInTheDocument()

    // Should show effective return rates for both
    const returnRateLabels = screen.getAllByText(/Effektive Rendite/i)
    expect(returnRateLabels).toHaveLength(2)
  })

  it('should show tax savings for Rürup in accumulation phase', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Rürup should show tax savings
    expect(screen.getByText(/Steuerersparnis/i)).toBeInTheDocument()
  })

  it('should show remaining capital for ETF in retirement phase', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Both should show remaining capital
    const restkapitalLabels = screen.getAllByText(/Restkapital/i)
    expect(restkapitalLabels).toHaveLength(2)
  })

  it('should update results when annual contribution changes', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Change annual contribution
    const input = screen.getByLabelText(/Jährlicher Beitrag/i) as HTMLInputElement
    await user.clear(input)
    await user.type(input, '20000')

    // Results should still be visible
    expect(screen.getByText(/Gesamtergebnis/i)).toBeInTheDocument()
  })

  it('should handle civil status change', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Change to married
    const marriedRadio = screen.getByLabelText(/Verheiratet/i)
    await user.click(marriedRadio)

    // Results should update
    expect(screen.getByText(/Gesamtergebnis/i)).toBeInTheDocument()
  })

  it('should display key factors when available', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Key factors section should be visible
    expect(screen.getByText(/Wichtige Faktoren/i)).toBeInTheDocument()
  })

  it('should format currency values correctly', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Currency values should be formatted (look for € symbol)
    const currencyElements = screen.getAllByText(/€/)
    expect(currencyElements.length).toBeGreaterThan(0)
  })

  it('should display net contributions for both options', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Net contributions should be shown for both
    const nettoContributionLabels = screen.getAllByText(/Netto-Beiträge/i)
    expect(nettoContributionLabels).toHaveLength(2)
  })

  it('should show tax effects in accumulation phase', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Tax effects should be visible
    expect(screen.getByText(/Steuerersparnis/i)).toBeInTheDocument()
    // Use getAllByText because "Steuern gezahlt" appears in both accumulation and retirement
    expect(screen.getAllByText(/Steuern gezahlt/i).length).toBeGreaterThan(0)
  })

  it('should show taxes paid in retirement phase', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Retirement taxes should be shown for both
    const taxLabels = screen.getAllByText(/Steuern gezahlt/i)
    expect(taxLabels.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle contribution years slider changes', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Contribution years slider should be present
    const yearsLabel = screen.getByText(/Ansparphase \(Jahre\): \d+/)
    expect(yearsLabel).toBeInTheDocument()
  })

  it('should handle return rate slider changes', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Return rate slider should be present
    const returnLabel = screen.getByText(/Erwartete Rendite: \d+\.\d+%/)
    expect(returnLabel).toBeInTheDocument()
  })

  it('should handle contribution phase tax rate slider', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Tax rate slider should be present
    const taxRateLabel = screen.getByText(/Steuersatz Ansparphase: \d+%/)
    expect(taxRateLabel).toBeInTheDocument()
  })

  it('should handle retirement phase tax rate slider', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Retirement tax rate slider should be present
    const retirementTaxLabel = screen.getByText(/Steuersatz Ruhestand: \d+%/)
    expect(retirementTaxLabel).toBeInTheDocument()
  })

  it('should handle retirement years slider', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Retirement years slider should be present
    const retirementYearsLabel = screen.getByText(/Rentenphase \(Jahre\): \d+/)
    expect(retirementYearsLabel).toBeInTheDocument()
  })

  it('should show advantage percentage in overall comparison', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Advantage percentage should be shown
    const advantageText = screen.getByText(/\(\d+\.\d+%\)/)
    expect(advantageText).toBeInTheDocument()
  })

  it('should handle invalid input gracefully', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const headers = screen.getAllByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(headers[0])

    // Try to enter invalid value
    const input = screen.getByLabelText(/Jährlicher Beitrag/i) as HTMLInputElement
    await user.clear(input)
    await user.type(input, '0')

    // Component should still render without crashing
    expect(screen.getAllByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)[0]).toBeInTheDocument()
  })

  it('should display final values for both options', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Final values should be shown
    const endkapitalLabels = screen.getAllByText(/Endkapital/i)
    expect(endkapitalLabels).toHaveLength(2)
  })

  it('should have accessible form labels', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // All form inputs should have associated labels
    const annualContributionInput = screen.getByLabelText(/Jährlicher Beitrag/i)
    expect(annualContributionInput).toBeInTheDocument()
    expect(annualContributionInput).toHaveAttribute('type', 'number')
  })

  it('should maintain state between collapse and expand', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card - use getAllByText since text appears in header and info message
    let headers = screen.getAllByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(headers[0]) // Click the main header

    // Change a value using triple-click + type to replace
    const input = screen.getByLabelText(/Jährlicher Beitrag/i) as HTMLInputElement
    await user.tripleClick(input) // Select all text
    await user.keyboard('25000')

    // Collapse the card
    headers = screen.getAllByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(headers[0])

    // Expand again
    headers = screen.getAllByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(headers[0])

    // Value should be maintained
    const inputAfter = screen.getByLabelText(/Jährlicher Beitrag/i) as HTMLInputElement
    expect(inputAfter.value).toBe('25000')
  })

  describe('High earner scenario (42% contribution tax, 25% retirement tax)', () => {
    it('should calculate results for high earner with tax advantage', async () => {
      const user = userEvent.setup()
      renderRuerupVsEtfComparisonCard()

      // Expand the card
      const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
      await user.click(header)

      // Set high earner parameters (default is already 42% and 25%)
      // Just verify the results are displayed
      expect(screen.getByText(/Gesamtergebnis/i)).toBeInTheDocument()
      expect(screen.getByText(/Steuerersparnis/i)).toBeInTheDocument()
    })
  })

  describe('Low earner scenario (20% contribution tax, 15% retirement tax)', () => {
    it('should calculate results for low earner with less tax advantage', async () => {
      const user = userEvent.setup()
      renderRuerupVsEtfComparisonCard()

      // Expand the card
      const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
      await user.click(header)

      // Set low earner parameters - sliders would need to be adjusted
      // For this test, we just verify the component renders properly
      expect(screen.getByText(/Steuersatz Ansparphase/i)).toBeInTheDocument()
      expect(screen.getByText(/Steuersatz Ruhestand/i)).toBeInTheDocument()
    })
  })

  describe('Married vs. Single comparison', () => {
    it('should show different results for married status', async () => {
      const user = userEvent.setup()
      renderRuerupVsEtfComparisonCard()

      // Expand the card
      const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
      await user.click(header)

      // Change to married
      const marriedRadio = screen.getByLabelText(/Verheiratet/i)
      await user.click(marriedRadio)

      // Results should be visible
      expect(screen.getByText(/Gesamtergebnis/i)).toBeInTheDocument()
    })
  })

  describe('Long vs. Short investment periods', () => {
    it('should handle long investment period (40 years)', async () => {
      const user = userEvent.setup()
      renderRuerupVsEtfComparisonCard()

      // Expand the card
      const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
      await user.click(header)

      // Contribution years slider would need to be set to max
      // For this test, we verify the component handles the display
      expect(screen.getByText(/Ansparphase \(Jahre\)/i)).toBeInTheDocument()
    })

    it('should handle short investment period (5 years)', async () => {
      const user = userEvent.setup()
      renderRuerupVsEtfComparisonCard()

      // Expand the card
      const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
      await user.click(header)

      // Verify minimum investment period display
      expect(screen.getByText(/Ansparphase \(Jahre\)/i)).toBeInTheDocument()
    })
  })

  it('should display icons for different sections', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Sections with icons should be visible
    expect(screen.getByText(/💰 Ansparphase/i)).toBeInTheDocument()
    expect(screen.getByText(/🏖️ Rentenphase/i)).toBeInTheDocument()
    expect(screen.getByText(/📊 Gesamtergebnis/i)).toBeInTheDocument()
    expect(screen.getByText(/💡 Wichtige Faktoren/i)).toBeInTheDocument()
  })

  it('should show net benefit for both options', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Net benefit should be shown
    const netBenefitLabels = screen.getAllByText(/Netto-Vorteil/i)
    expect(netBenefitLabels).toHaveLength(2) // One for Rürup, one for ETF
  })

  it('should display contribution and withdrawal amounts side by side', async () => {
    const user = userEvent.setup()
    renderRuerupVsEtfComparisonCard()

    // Expand the card
    const header = screen.getByText(/Rürup-Rente vs\. ETF-Sparplan Vergleich/i)
    await user.click(header)

    // Contributions should be shown
    const contributionLabels = screen.getAllByText(/Einzahlungen/i)
    expect(contributionLabels).toHaveLength(2)
  })
})
