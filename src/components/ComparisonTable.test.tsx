import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComparisonTable } from './ComparisonTable'
import type { ComparisonStrategy } from '../utils/config-storage'

const mockComparisonResults = [
  {
    strategy: {
      id: '1',
      name: '3% Regel',
      strategie: '3prozent' as const,
      rendite: 4,
    } as ComparisonStrategy,
    finalCapital: 450000,
    totalWithdrawal: 375000,
    averageAnnualWithdrawal: 15000,
    duration: 30,
  },
  {
    strategy: {
      id: '2',
      name: 'Conservative Strategy',
      strategie: 'variabel_prozent' as const,
      rendite: 3,
    } as ComparisonStrategy,
    finalCapital: 480000,
    totalWithdrawal: 312500,
    averageAnnualWithdrawal: 12500,
    duration: 'unbegrenzt' as const,
  },
]

describe('ComparisonTable', () => {
  it('renders table with base strategy and comparison results', () => {
    render(
      <ComparisonTable
        baseStrategyName="4% Regel"
        baseStrategyRendite={5}
        baseStrategyEndkapital={498000}
        baseStrategyAverageWithdrawal={20400}
        baseStrategyDuration="25 Jahre"
        comparisonResults={mockComparisonResults}
      />,
    )

    // Check table title
    expect(screen.getByText('📋 Vergleichstabelle')).toBeInTheDocument()

    // Check table headers
    expect(screen.getByText('Strategie')).toBeInTheDocument()
    expect(screen.getByText('Rendite')).toBeInTheDocument()
    expect(screen.getByText('Endkapital')).toBeInTheDocument()
    expect(screen.getByText('Ø Jährliche Entnahme')).toBeInTheDocument()
    expect(screen.getByText('Vermögen reicht für')).toBeInTheDocument()

    // Check base strategy row
    expect(screen.getByText('📊 4% Regel (Basis)')).toBeInTheDocument()
    expect(screen.getByText('5%')).toBeInTheDocument()
    expect(screen.getByText('498.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('20.400,00 €')).toBeInTheDocument()
    expect(screen.getByText('25 Jahre')).toBeInTheDocument()

    // Check comparison strategy rows
    expect(screen.getByText('3% Regel')).toBeInTheDocument()
    expect(screen.getByText('4%')).toBeInTheDocument()
    expect(screen.getByText('450.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('15.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('30 Jahre')).toBeInTheDocument()

    expect(screen.getByText('Conservative Strategy')).toBeInTheDocument()
    expect(screen.getByText('3%')).toBeInTheDocument()
    expect(screen.getByText('480.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('12.500,00 €')).toBeInTheDocument()
    expect(screen.getByText('unbegrenzt')).toBeInTheDocument()
  })

  it('does not render when comparison results are empty', () => {
    const { container } = render(
      <ComparisonTable
        baseStrategyName="4% Regel"
        baseStrategyRendite={5}
        baseStrategyEndkapital={498000}
        baseStrategyAverageWithdrawal={20400}
        baseStrategyDuration="25 Jahre"
        comparisonResults={[]}
      />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('handles unlimited duration correctly', () => {
    render(
      <ComparisonTable
        baseStrategyName="3% Regel"
        baseStrategyRendite={4}
        baseStrategyEndkapital={520000}
        baseStrategyAverageWithdrawal={18000}
        baseStrategyDuration="unbegrenzt"
        comparisonResults={mockComparisonResults}
      />,
    )

    // Base strategy with unlimited duration
    expect(screen.getAllByText('unbegrenzt')).toHaveLength(2) // Base + one comparison
  })

  it('formats currency values correctly', () => {
    render(
      <ComparisonTable
        baseStrategyName="Test Strategy"
        baseStrategyRendite={6.5}
        baseStrategyEndkapital={1234567.89}
        baseStrategyAverageWithdrawal={45678.90}
        baseStrategyDuration="15 Jahre"
        comparisonResults={[
          {
            strategy: {
              id: 'test',
              name: 'Test Comparison',
              strategie: '4prozent' as const,
              rendite: 5.25,
            } as ComparisonStrategy,
            finalCapital: 987654.32,
            totalWithdrawal: 300000,
            averageAnnualWithdrawal: 23456.78,
            duration: 12,
          },
        ]}
      />,
    )

    // Check formatted currency values
    expect(screen.getByText('1.234.567,89 €')).toBeInTheDocument()
    expect(screen.getByText('45.678,90 €')).toBeInTheDocument()
    expect(screen.getByText('987.654,32 €')).toBeInTheDocument()
    expect(screen.getByText('23.456,78 €')).toBeInTheDocument()

    // Check formatted percentages
    expect(screen.getByText('6.5%', { exact: false })).toBeInTheDocument()
    expect(screen.getByText('5.25%', { exact: false })).toBeInTheDocument()
  })

  it('displays multiple comparison strategies correctly', () => {
    const multipleResults = [
      ...mockComparisonResults,
      {
        strategy: {
          id: '3',
          name: 'Aggressive Strategy',
          strategie: 'dynamisch' as const,
          rendite: 7,
        } as ComparisonStrategy,
        finalCapital: 600000,
        totalWithdrawal: 400000,
        averageAnnualWithdrawal: 18000,
        duration: 22,
      },
    ]

    render(
      <ComparisonTable
        baseStrategyName="4% Regel"
        baseStrategyRendite={5}
        baseStrategyEndkapital={498000}
        baseStrategyAverageWithdrawal={20400}
        baseStrategyDuration="25 Jahre"
        comparisonResults={multipleResults}
      />,
    )

    expect(screen.getByText('3% Regel')).toBeInTheDocument()
    expect(screen.getByText('Conservative Strategy')).toBeInTheDocument()
    expect(screen.getByText('Aggressive Strategy')).toBeInTheDocument()
    expect(screen.getByText('7%')).toBeInTheDocument()
    expect(screen.getByText('600.000,00 €')).toBeInTheDocument()
  })
})
