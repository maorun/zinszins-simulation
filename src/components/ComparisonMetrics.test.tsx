import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComparisonMetrics } from './ComparisonMetrics'

describe('ComparisonMetrics', () => {
  it('renders base strategy metrics correctly', () => {
    render(
      <ComparisonMetrics
        displayName="4% Regel"
        rendite={5}
        endkapital={498000}
        duration="25 Jahre"
        withdrawalAmount={20000}
        withdrawalLabel="Jährliche Entnahme:"
      />,
    )

    expect(screen.getByText(/📊 Basis-Strategie: 4% Regel/)).toBeInTheDocument()
    expect(screen.getByText('Rendite:')).toBeInTheDocument()
    expect(screen.getByText('5%', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('Endkapital:')).toBeInTheDocument()
    expect(screen.getByText('498.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('Vermögen reicht für:')).toBeInTheDocument()
    expect(screen.getByText('25 Jahre')).toBeInTheDocument()
    expect(screen.getByText('Jährliche Entnahme:')).toBeInTheDocument()
    expect(screen.getByText('20.000,00 €')).toBeInTheDocument()
  })

  it('renders without withdrawal amount when null', () => {
    render(
      <ComparisonMetrics
        displayName="Custom Strategy"
        rendite={6}
        endkapital={520000}
        duration="30 Jahre"
        withdrawalAmount={null}
        withdrawalLabel="Jährliche Entnahme:"
      />,
    )

    expect(screen.getByText(/📊 Basis-Strategie: Custom Strategy/)).toBeInTheDocument()
    expect(screen.getByText('6%', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('520.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('30 Jahre')).toBeInTheDocument()
    expect(screen.queryByText('Jährliche Entnahme:')).not.toBeInTheDocument()
  })

  it('handles unlimited duration correctly', () => {
    render(
      <ComparisonMetrics
        displayName="3% Regel"
        rendite={4}
        endkapital={550000}
        duration="unbegrenzt"
        withdrawalAmount={15000}
        withdrawalLabel="Jährliche Entnahme:"
      />,
    )

    expect(screen.getByText('unbegrenzt')).toBeInTheDocument()
  })

  it('renders monthly withdrawal label correctly', () => {
    render(
      <ComparisonMetrics
        displayName="Monatlich fest"
        rendite={5}
        endkapital={480000}
        duration="20 Jahre"
        withdrawalAmount={2000}
        withdrawalLabel="Monatliche Entnahme:"
      />,
    )

    expect(screen.getByText('Monatliche Entnahme:')).toBeInTheDocument()
    expect(screen.getByText('2.000,00 €')).toBeInTheDocument()
  })

  it('renders dynamic strategy label correctly', () => {
    render(
      <ComparisonMetrics
        displayName="Dynamische Strategie"
        rendite={5}
        endkapital={490000}
        duration="22 Jahre"
        withdrawalAmount={19000}
        withdrawalLabel="Basis-Entnahme:"
      />,
    )

    expect(screen.getByText('Basis-Entnahme:')).toBeInTheDocument()
    expect(screen.getByText('19.000,00 €')).toBeInTheDocument()
  })

  it('renders variable percent strategy correctly', () => {
    render(
      <ComparisonMetrics
        displayName="Variable Prozent"
        rendite={4.5}
        endkapital={475000}
        duration="18 Jahre"
        withdrawalAmount={17500}
        withdrawalLabel="Jährliche Entnahme:"
      />,
    )

    expect(screen.getByText(/📊 Basis-Strategie: Variable Prozent/)).toBeInTheDocument()
    expect(screen.getByText('4.5%', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('475.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('17.500,00 €')).toBeInTheDocument()
  })

  it('handles single year duration correctly', () => {
    render(
      <ComparisonMetrics
        displayName="Test Strategy"
        rendite={3}
        endkapital={100000}
        duration="1 Jahr"
        withdrawalAmount={5000}
        withdrawalLabel="Jährliche Entnahme:"
      />,
    )

    expect(screen.getByText('1 Jahr')).toBeInTheDocument()
  })
})
