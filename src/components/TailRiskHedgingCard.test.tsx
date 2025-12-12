import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TailRiskHedgingCard } from './TailRiskHedgingCard'

describe('TailRiskHedgingCard', () => {
  async function openCard() {
    const user = userEvent.setup()
    // The header is clickable but not a button role - find by text content
    const header = screen.getByText(/Tail-Risk Hedging Rechner/)
    await user.click(header)
  }

  it('should render the component', () => {
    render(<TailRiskHedgingCard />)

    expect(screen.getByText('🛡️ Tail-Risk Hedging Rechner')).toBeInTheDocument()
  })

  it('should show info message when opened', async () => {
    render(<TailRiskHedgingCard />)
    await openCard()

    expect(screen.getByText('📊 Informations-Tool')).toBeInTheDocument()
    expect(
      screen.getByText(/Dieser Rechner zeigt die Kosten und Nutzen von Tail-Risk Hedging Strategien/),
    ).toBeInTheDocument()
  })

  it('should have hedging disabled by default', async () => {
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    expect(enableSwitch).not.toBeChecked()
  })

  it('should not show results when hedging is disabled', async () => {
    render(<TailRiskHedgingCard />)
    await openCard()

    expect(screen.queryByText(/Hedging-Ergebnis/)).not.toBeInTheDocument()
  })

  it('should show configuration options when enabled', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    expect(screen.getByText('Absicherungsstrategie')).toBeInTheDocument()
    expect(screen.getAllByText(/Protective Put/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/CPPI/)[0]).toBeInTheDocument()
  })

  it('should show results when enabled', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    expect(screen.getByText(/Hedging-Ergebnis/)).toBeInTheDocument()
    expect(screen.getByText(/Gesamtkosten:/)).toBeInTheDocument()
    expect(screen.getByText(/Verhinderte Verluste:/)).toBeInTheDocument()
    expect(screen.getByText(/Nettovorteil:/)).toBeInTheDocument()
  })

  it('should show portfolio comparison', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    expect(screen.getByText('📈 Portfolio-Vergleich')).toBeInTheDocument()
    expect(screen.getByText(/Endkapital ohne Hedging:/)).toBeInTheDocument()
    expect(screen.getByText(/Endkapital mit Hedging:/)).toBeInTheDocument()
  })

  it('should allow changing protection level', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    const protectionLevelSlider = screen.getByLabelText(/Schutzniveau:/)
    expect(protectionLevelSlider).toBeInTheDocument()
    expect(protectionLevelSlider).toHaveValue('85')
  })

  it('should allow changing hedge ratio', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    const hedgeRatioSlider = screen.getByLabelText(/Absicherungsquote:/)
    expect(hedgeRatioSlider).toBeInTheDocument()
    expect(hedgeRatioSlider).toHaveValue('50')
  })

  it('should allow changing annual cost', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    const annualCostInput = screen.getByLabelText(/Jährliche Kosten:/)
    expect(annualCostInput).toBeInTheDocument()
    expect(annualCostInput).toHaveValue(2.00) // Number, not string
  })

  it('should allow changing rebalancing frequency', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    const rebalancingSelect = screen.getByLabelText(/Rebalancing-Frequenz/)
    expect(rebalancingSelect).toBeInTheDocument()
    expect(rebalancingSelect).toHaveValue('12')
  })

  it('should allow selecting different strategies', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    // Default should be protective-put
    const protectivePutRadio = screen.getByLabelText(/Protective Put/)
    expect(protectivePutRadio).toBeChecked()

    // Change to CPPI
    const cppiRadio = screen.getByLabelText(/CPPI/)
    await user.click(cppiRadio)
    expect(cppiRadio).toBeChecked()
  })

  it('should show interpretation message', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    expect(screen.getByText('💡 Interpretation:')).toBeInTheDocument()
  })

  it('should show all hedging strategies', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    expect(screen.getAllByText(/Protective Put/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/CPPI/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/Tail-Risk Fonds/)[0]).toBeInTheDocument()
    expect(screen.getByText(/Systematisches Rebalancing/)).toBeInTheDocument()
  })

  it('should show cost range hint', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    expect(screen.getByText(/Typischer Bereich:/)).toBeInTheDocument()
  })

  it('should show hedge triggered count', async () => {
    const user = userEvent.setup()
    render(<TailRiskHedgingCard />)
    await openCard()

    const enableSwitch = screen.getByRole('switch', { name: /Tail-Risk Hedging aktivieren/i })
    await user.click(enableSwitch)

    expect(screen.getByText(/Hedge ausgelöst/)).toBeInTheDocument()
  })
})
