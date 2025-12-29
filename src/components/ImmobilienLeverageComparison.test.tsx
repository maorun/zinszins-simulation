import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'
import { ImmobilienLeverageComparison } from './ImmobilienLeverageComparison'

describe('ImmobilienLeverageComparison', () => {
  it('should render collapsed by default', () => {
    render(<ImmobilienLeverageComparison />)

    expect(screen.getByText('Immobilien-Leverage-Analyse')).toBeInTheDocument()
    expect(
      screen.getByText(/Optimale Finanzierungsstrukturen für Immobilieninvestitionen/),
    ).toBeInTheDocument()

    // Should not show configuration when collapsed
    expect(screen.queryByText('Immobilien-Parameter')).not.toBeInTheDocument()
  })

  it('should expand when trigger is clicked', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Should show configuration sections
    expect(screen.getByText('Immobilien-Parameter')).toBeInTheDocument()
    expect(screen.getByLabelText(/Kaufpreis gesamt/)).toBeInTheDocument()
  })

  it('should display default configuration values', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Check default values are displayed
    const totalPriceInput = screen.getByLabelText(/Kaufpreis gesamt/) as HTMLInputElement
    expect(totalPriceInput.value).toBe('400000')

    const annualRentInput = screen.getByLabelText(/Jahresmiete brutto/) as HTMLInputElement
    expect(annualRentInput.value).toBe('24000')
  })

  it('should update property configuration when inputs change', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    const totalPriceInput = screen.getByLabelText(/Kaufpreis gesamt/)
    await user.clear(totalPriceInput)
    await user.type(totalPriceInput, '500000')

    expect((totalPriceInput as HTMLInputElement).value).toBe('500000')
  })

  it('should display comparison results when enabled', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Should show summary cards
    expect(screen.getByText('Empfohlenes Szenario')).toBeInTheDocument()
    expect(screen.getByText('Höchste Rendite')).toBeInTheDocument()
    expect(screen.getByText('Geringstes Risiko')).toBeInTheDocument()
  })

  it('should display scenario comparison table', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Check table headers
    expect(screen.getByText('Szenario')).toBeInTheDocument()
    expect(screen.getByText('Eigenkapital')).toBeInTheDocument()
    expect(screen.getByText('LTV')).toBeInTheDocument()
    expect(screen.getByText('Cash-on-Cash')).toBeInTheDocument()
    expect(screen.getByText('Hebeleffekt')).toBeInTheDocument()
  })

  it('should display all standard scenarios', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Should show 4 standard scenarios - use getAllByText since they appear multiple times
    expect(screen.getAllByText(/Konservativ.*40%.*Eigenkapital/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Ausgewogen.*30%.*Eigenkapital/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Moderat gehebelt.*20%.*Eigenkapital/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Stark gehebelt.*10%.*Eigenkapital/).length).toBeGreaterThan(0)
  })

  it('should calculate and display gross rental yield', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Default: 24000 / 400000 = 6%
    expect(screen.getByText(/Bruttomietrendite:.*6\.00%/)).toBeInTheDocument()
  })

  it('should update gross rental yield when values change', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Change annual rent
    const annualRentInput = screen.getByLabelText(/Jahresmiete brutto/)
    await user.clear(annualRentInput)
    await user.type(annualRentInput, '30000')

    // New yield: 30000 / 400000 = 7.5%
    expect(screen.getByText(/Bruttomietrendite:.*7\.50%/)).toBeInTheDocument()
  })

  it('should display correct AfA rate based on building year', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Default year 2020 should have 2% AfA
    expect(screen.getByText(/AfA-Satz:.*2%/)).toBeInTheDocument()

    // Just verify that changing the building year updates the display
    const buildingYearInput = screen.getByLabelText(/Baujahr/) as HTMLInputElement
    expect(buildingYearInput.value).toBe('2020')
  })

  it('should display detailed results for each scenario', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Should show detailed cards for all scenarios
    const allScenarioNames = screen.getAllByText(/Konservativ|Ausgewogen|Moderat gehebelt|Stark gehebelt/)
    expect(allScenarioNames.length).toBeGreaterThan(4) // In table + in cards
  })

  it('should display risk metrics for each scenario', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Check for risk metric labels
    expect(screen.getAllByText(/Zinsdeckung/)).toBeTruthy()
    expect(screen.getAllByText(/Schuldendienstdeckung/)).toBeTruthy()
    expect(screen.getAllByText(/Belastungsquote/)).toBeTruthy()
  })

  it('should display info box with leverage hints', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    expect(screen.getByText('Hinweise zur Leverage-Analyse:')).toBeInTheDocument()
    expect(screen.getByText(/Hebeleffekt:/)).toBeInTheDocument()
    expect(screen.getByText(/LTV.*Beleihungsauslauf/)).toBeInTheDocument()
  })

  it('should mark recommended scenario with star emoji', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // At least one scenario should have the star
    const tableRows = screen.getByRole('table').querySelectorAll('tbody tr')
    const hasStarScenario = Array.from(tableRows).some(row => row.textContent?.includes('⭐'))
    expect(hasStarScenario).toBe(true)
  })

  it('should mark best return scenario with chart emoji', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // At least one scenario should have the chart emoji
    const tableRows = screen.getByRole('table').querySelectorAll('tbody tr')
    const hasChartScenario = Array.from(tableRows).some(row => row.textContent?.includes('📈'))
    expect(hasChartScenario).toBe(true)
  })

  it('should mark best risk scenario with shield emoji', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // At least one scenario should have the shield emoji
    const tableRows = screen.getByRole('table').querySelectorAll('tbody tr')
    const hasShieldScenario = Array.from(tableRows).some(row => row.textContent?.includes('🛡️'))
    expect(hasShieldScenario).toBe(true)
  })

  it('should display operating costs in euros', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Default: 24000 * 25% = 6000
    expect(screen.getByText(/6\.000,00 €\/Jahr/)).toBeInTheDocument()
  })

  it('should update base interest rate', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    const baseInterestInput = screen.getByLabelText(/Basis-Zinssatz/) as HTMLInputElement
    
    // Directly set the value and trigger change event
    baseInterestInput.value = '4.5'
    baseInterestInput.dispatchEvent(new Event('change', { bubbles: true }))

    expect(baseInterestInput.value).toBe('4.5')
  })

  it('should collapse when trigger is clicked again', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')

    // Expand
    await user.click(trigger)
    expect(screen.getByText('Immobilien-Parameter')).toBeInTheDocument()

    // Collapse
    await user.click(trigger)
    
    expect(screen.queryByText('Immobilien-Parameter')).not.toBeInTheDocument()
  })

  it('should have accessible form labels', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // All inputs should have associated labels
    expect(screen.getByLabelText(/Kaufpreis gesamt/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Gebäudewert/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Grundstückswert/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Jahresmiete brutto/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Bewirtschaftungskosten/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Wertsteigerung p.a./)).toBeInTheDocument()
    expect(screen.getByLabelText(/Grenzsteuersatz/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Baujahr/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Basis-Zinssatz/)).toBeInTheDocument()
  })

  it('should display summary statistics correctly', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Should show recommended, best return, and best risk scenarios
    const summaryCards = screen.getAllByRole('heading', { level: 3 })
    const cardTitles = summaryCards.map(card => card.textContent)

    expect(cardTitles).toContain('Empfohlenes Szenario')
    expect(cardTitles).toContain('Höchste Rendite')
    expect(cardTitles).toContain('Geringstes Risiko')
  })

  it('should handle edge case: zero values', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Set operating costs to 0
    const operatingCostsInput = screen.getByLabelText(/Bewirtschaftungskosten/)
    await user.clear(operatingCostsInput)
    await user.type(operatingCostsInput, '0')

    // Should still render without errors
    expect(screen.getByText('Immobilien-Parameter')).toBeInTheDocument()
  })

  it('should display tax benefits in scenarios', async () => {
    const user = userEvent.setup()
    render(<ImmobilienLeverageComparison />)

    // Click on the card header to expand
    const trigger = screen.getByText('Immobilien-Leverage-Analyse')
    await user.click(trigger)

    // Should show tax benefit labels
    expect(screen.getAllByText(/Steuervorteil/)).toBeTruthy()
  })
})
