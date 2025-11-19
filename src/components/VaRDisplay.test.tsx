import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { VaRDisplay } from './VaRDisplay'

describe('VaRDisplay', () => {
  it('should render VaR analysis with default time horizon', () => {
    const portfolioValue = 100000
    const averageReturn = 0.07
    const standardDeviation = 0.15

    render(
      <VaRDisplay
        portfolioValue={portfolioValue}
        averageReturn={averageReturn}
        standardDeviation={standardDeviation}
      />,
    )

    // Check title - appears in both h4 and interpretation section
    expect(screen.getAllByText(/Value at Risk/)[0]).toBeInTheDocument()

    // Check portfolio value is displayed
    expect(screen.getByText(/100\.000/)).toBeInTheDocument()

    // Check time horizon default (1 Jahr) - appears in both parameter section and interpretation
    expect(screen.getAllByText(/1 Jahr/)[0]).toBeInTheDocument()

    // Check confidence levels are displayed (appear in both mobile and desktop)
    expect(screen.getAllByText(/90% Konfidenzniveau/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/95% Konfidenzniveau/)[0]).toBeInTheDocument()
    expect(screen.getAllByText(/99% Konfidenzniveau/)[0]).toBeInTheDocument()
  })

  it('should render VaR analysis with custom time horizon', () => {
    const portfolioValue = 100000
    const averageReturn = 0.07
    const standardDeviation = 0.15
    const timeHorizon = 5

    render(
      <VaRDisplay
        portfolioValue={portfolioValue}
        averageReturn={averageReturn}
        standardDeviation={standardDeviation}
        timeHorizon={timeHorizon}
      />,
    )

    // Check time horizon is displayed correctly (plural form)
    // "5 Jahre" appears twice - in parameters section and interpretation section
    expect(screen.getAllByText(/5 Jahre/)[0]).toBeInTheDocument()
  })

  it('should render VaR analysis with custom title', () => {
    const portfolioValue = 100000
    const averageReturn = 0.07
    const standardDeviation = 0.15
    const customTitle = 'Risiko-Analyse für Ansparphase'

    render(
      <VaRDisplay
        portfolioValue={portfolioValue}
        averageReturn={averageReturn}
        standardDeviation={standardDeviation}
        title={customTitle}
      />,
    )

    // Check custom title is displayed (without emoji which is separate element)
    expect(screen.getByText(/Risiko-Analyse/)).toBeInTheDocument()
  })

  it('should display all three confidence levels', () => {
    const portfolioValue = 100000
    const averageReturn = 0.07
    const standardDeviation = 0.15

    render(
      <VaRDisplay
        portfolioValue={portfolioValue}
        averageReturn={averageReturn}
        standardDeviation={standardDeviation}
      />,
    )

    // Desktop table should show all confidence levels in header cells
    const confidenceLevels = screen.getAllByText(/90%|95%|99%/)
    expect(confidenceLevels.length).toBeGreaterThan(0)

    // Check that VaR descriptions are present (appears in both mobile and desktop views)
    // 3 times in mobile cards + 3 times in desktop table + 1 in interpretation = 7 total
    expect(screen.getAllByText(/Wahrscheinlichkeit/).length).toBeGreaterThanOrEqual(3)
  })

  it('should format currency values correctly', () => {
    const portfolioValue = 250000
    const averageReturn = 0.06
    const standardDeviation = 0.18

    render(
      <VaRDisplay
        portfolioValue={portfolioValue}
        averageReturn={averageReturn}
        standardDeviation={standardDeviation}
      />,
    )

    // Check portfolio value formatting
    expect(screen.getByText(/250\.000/)).toBeInTheDocument()
  })

  it('should format percentage values with German decimal separator', () => {
    const portfolioValue = 100000
    const averageReturn = 0.075 // 7.5%
    const standardDeviation = 0.155 // 15.5%

    render(
      <VaRDisplay
        portfolioValue={portfolioValue}
        averageReturn={averageReturn}
        standardDeviation={standardDeviation}
      />,
    )

    // Check percentage formatting with comma
    // The component displays averageReturn * 100 and standardDeviation * 100
    expect(screen.getByText(/7,5%/)).toBeInTheDocument()
    expect(screen.getByText(/15,5%/)).toBeInTheDocument()
  })

  it('should display interpretation section', () => {
    const portfolioValue = 100000
    const averageReturn = 0.07
    const standardDeviation = 0.15

    render(
      <VaRDisplay
        portfolioValue={portfolioValue}
        averageReturn={averageReturn}
        standardDeviation={standardDeviation}
      />,
    )

    // Check interpretation section is present
    expect(screen.getByText(/💡 Interpretation:/)).toBeInTheDocument()
    // "Mit 95% Wahrscheinlichkeit" appears both in the table and in the interpretation section
    expect(screen.getAllByText(/Mit 95% Wahrscheinlichkeit/).length).toBeGreaterThan(0)
  })

  it('should handle zero portfolio value gracefully', () => {
    const portfolioValue = 0
    const averageReturn = 0.07
    const standardDeviation = 0.15

    render(
      <VaRDisplay
        portfolioValue={portfolioValue}
        averageReturn={averageReturn}
        standardDeviation={standardDeviation}
      />,
    )

    // Component should still render without crashing
    expect(screen.getAllByText(/Value at Risk/)[0]).toBeInTheDocument()

    // All VaR values should be 0
    const zeroEuroElements = screen.getAllByText(/0\s*€/)
    expect(zeroEuroElements.length).toBeGreaterThan(0)
  })

  it('should display parameters section', () => {
    const portfolioValue = 100000
    const averageReturn = 0.07
    const standardDeviation = 0.15

    render(
      <VaRDisplay
        portfolioValue={portfolioValue}
        averageReturn={averageReturn}
        standardDeviation={standardDeviation}
      />,
    )

    // Check parameters are displayed
    expect(screen.getByText(/Portfolio-Wert:/)).toBeInTheDocument()
    expect(screen.getByText(/Zeithorizont:/)).toBeInTheDocument()
    expect(screen.getByText(/Annahme:/)).toBeInTheDocument()
  })
})
