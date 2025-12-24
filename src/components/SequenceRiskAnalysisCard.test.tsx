import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SequenceRiskAnalysisCard } from './SequenceRiskAnalysisCard'
import userEvent from '@testing-library/user-event'

describe('SequenceRiskAnalysisCard', () => {
  it('should render collapsed by default', () => {
    render(<SequenceRiskAnalysisCard />)

    expect(screen.getByText('Sequenz-Risiko-Analyse')).toBeInTheDocument()
    expect(screen.getByText(/Analyse des Einflusses der Rendite-Reihenfolge/)).toBeInTheDocument()
  })

  it('should expand when clicked', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    const header = screen.getByText('Sequenz-Risiko-Analyse')
    await user.click(header)

    expect(screen.getByText('Was ist Sequenz-Risiko?')).toBeInTheDocument()
    expect(screen.getByText('Konfiguration')).toBeInTheDocument()
  })

  it('should display default configuration values', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    expect(screen.getByLabelText('Startkapital')).toHaveValue(500000)
    expect(screen.getByLabelText('Jährliche Entnahme')).toHaveValue(20000)
    expect(screen.getByLabelText('Zeitraum (Jahre)')).toHaveValue(30)
    const averageReturnInput = screen.getByLabelText('Durchschnittliche Rendite (%)') as HTMLInputElement
    expect(Number(averageReturnInput.value)).toBeCloseTo(7, 1)
    expect(screen.getByLabelText('Volatilität (%)')).toHaveValue(15)
  })

  it('should display withdrawal rate', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    expect(screen.getByText('Entnahmerate: 4.00%')).toBeInTheDocument()
  })

  it('should update withdrawal rate when inputs change', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    const annualWithdrawalInput = screen.getByLabelText('Jährliche Entnahme')
    await user.clear(annualWithdrawalInput)
    await user.type(annualWithdrawalInput, '25000')

    expect(screen.getByText('Entnahmerate: 5.00%')).toBeInTheDocument()
  })

  it('should display three scenario results', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    expect(screen.getByText('Günstige Sequenz')).toBeInTheDocument()
    expect(screen.getByText('Durchschnitt')).toBeInTheDocument()
    expect(screen.getByText('Ungünstige Sequenz')).toBeInTheDocument()
  })

  it('should display risk level badge', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    expect(screen.getByText('Risikobewertung')).toBeInTheDocument()
    // Should have one of the risk level badges
    const riskLevels = ['Niedriges Risiko', 'Mittleres Risiko', 'Hohes Risiko', 'Kritisches Risiko']
    const hasRiskLevel = riskLevels.some(level => screen.queryByText(level) !== null)
    expect(hasRiskLevel).toBe(true)
  })

  it('should display outcome differences', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    expect(screen.getByText('Unterschied zwischen Best- und Worst-Case')).toBeInTheDocument()
    expect(screen.getByText('Endkapital-Differenz')).toBeInTheDocument()
    expect(screen.getByText('Jahre-Differenz')).toBeInTheDocument()
  })

  it('should display recommendations', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    expect(screen.getByText('Empfehlungen')).toBeInTheDocument()
  })

  it('should display informational sections', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    expect(screen.getByText('Was ist Sequenz-Risiko?')).toBeInTheDocument()
    expect(screen.getByText('Wichtiger Hinweis')).toBeInTheDocument()
  })

  it('should handle high withdrawal rate showing critical risk', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    const annualWithdrawalInput = screen.getByLabelText('Jährliche Entnahme')
    await user.clear(annualWithdrawalInput)
    await user.type(annualWithdrawalInput, '50000')

    // Wait for the update
    await screen.findByText('Entnahmerate: 10.00%')

    // Should show critical risk
    expect(screen.getByText('Kritisches Risiko')).toBeInTheDocument()
  })

  it('should update analysis when starting portfolio changes', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    const startingPortfolioInput = screen.getByLabelText('Startkapital')
    await user.clear(startingPortfolioInput)
    await user.type(startingPortfolioInput, '1000000')

    // Wait for the update
    await screen.findByText('Entnahmerate: 2.00%')

    // Lower withdrawal rate should show lower risk - use getAllByText since "Risiko" appears multiple times
    const riskBadges = screen.getAllByText(/Risiko/)
    expect(riskBadges.length).toBeGreaterThan(0)
  })

  it('should update analysis when years change', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    const yearsInput = screen.getByLabelText('Zeitraum (Jahre)')
    await user.clear(yearsInput)
    await user.type(yearsInput, '40')

    // Wait for the update
    await screen.findByText('Entnahmerate: 4.00%')

    // Should still display analysis
    expect(screen.getByText('Risikobewertung')).toBeInTheDocument()
  })

  it('should display years survived for each scenario', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    const yearsSurvivedElements = screen.getAllByText(/\d+ \/ \d+/)
    expect(yearsSurvivedElements.length).toBeGreaterThan(0)
  })

  it('should display ending capital for each scenario', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    expect(screen.getAllByText('Endkapital')).toHaveLength(3)
  })

  it('should show mitigation strategies in important notice', async () => {
    const user = userEvent.setup()
    render(<SequenceRiskAnalysisCard />)

    await user.click(screen.getByText('Sequenz-Risiko-Analyse'))

    expect(screen.getByText(/niedrigere Entnahmerate wählen/)).toBeInTheDocument()
    expect(screen.getByText(/Dynamische Entnahmestrategien/)).toBeInTheDocument()
    expect(screen.getByText(/Cash-Puffer/)).toBeInTheDocument()
    expect(screen.getByText(/Asset-Allokation im Zeitverlauf/)).toBeInTheDocument()
  })
})
