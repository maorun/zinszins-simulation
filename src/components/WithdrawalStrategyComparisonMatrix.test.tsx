/**
 * Tests for Withdrawal Strategy Comparison Matrix Component
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WithdrawalStrategyComparisonMatrix } from './WithdrawalStrategyComparisonMatrix'
import type { StrategyComparisonResult } from '../utils/withdrawal-strategy-ranking'

describe('WithdrawalStrategyComparisonMatrix', () => {
  const mockResults: StrategyComparisonResult[] = [
    {
      strategy: '4prozent',
      displayName: '4% Regel',
      returnRate: 5,
      finalCapital: 100000,
      totalWithdrawal: 400000,
      averageAnnualWithdrawal: 20000,
      portfolioLifeYears: 25,
      successRate: 1.0,
      downsideRisk: 5,
      overallScore: 75,
      rank: 1,
    },
    {
      strategy: '3prozent',
      displayName: '3% Regel',
      returnRate: 5,
      finalCapital: 200000,
      totalWithdrawal: 300000,
      averageAnnualWithdrawal: 15000,
      portfolioLifeYears: 'unlimited',
      successRate: 1.0,
      downsideRisk: 3,
      overallScore: 85,
      rank: 2,
    },
  ]

  describe('Rendering', () => {
    it('should render component title', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(screen.getByText('Strategien-Vergleichsmatrix')).toBeInTheDocument()
    })

    it('should show starting capital and planned duration', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(screen.getByText(/500\.000,00 €/)).toBeInTheDocument()
      expect(screen.getByText(/30 Jahre/)).toBeInTheDocument()
    })

    it('should render all strategy names', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      // Use getAllByText since strategy names appear in both recommendations and table
      expect(screen.getAllByText(/4% Regel/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/3% Regel/)[0]).toBeInTheDocument()
    })

    it('should display empty state when no results', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={[]}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(screen.getByText(/Keine Strategien zum Vergleich verfügbar/)).toBeInTheDocument()
    })
  })

  describe('Table Content', () => {
    it('should render table headers', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(screen.getByText('Strategie')).toBeInTheDocument()
      expect(screen.getByText('Gesamt-Score')).toBeInTheDocument()
      expect(screen.getByText('Endkapital')).toBeInTheDocument()
      expect(screen.getByText('Gesamt-Entnahme')).toBeInTheDocument()
      expect(screen.getByText(/Ø Jährlich/)).toBeInTheDocument()
      expect(screen.getByText('Portfolio-Lebensdauer')).toBeInTheDocument()
      expect(screen.getByText('Erfolgsrate')).toBeInTheDocument()
      expect(screen.getByText('Risiko')).toBeInTheDocument()
    })

    it('should display final capital values', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(screen.getByText(/100\.000,00 €/)).toBeInTheDocument()
      expect(screen.getByText(/200\.000,00 €/)).toBeInTheDocument()
    })

    it('should display total withdrawal values', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(screen.getByText(/400\.000,00 €/)).toBeInTheDocument()
      expect(screen.getByText(/300\.000,00 €/)).toBeInTheDocument()
    })

    it('should display average annual withdrawal', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(screen.getByText(/20\.000,00 €/)).toBeInTheDocument()
      expect(screen.getByText(/15\.000,00 €/)).toBeInTheDocument()
    })

    it('should show portfolio life years', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(screen.getByText(/25 Jahre/)).toBeInTheDocument()
      expect(screen.getByText(/Unbegrenzt/)).toBeInTheDocument()
    })

    it('should display success rates as percentages', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      const successRates = screen.getAllByText('100%')
      expect(successRates.length).toBeGreaterThan(0)
    })
  })

  describe('Risk Profiles', () => {
    it('should show balanced profile by default', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      // Use getAllByText since "Ausgewogen" appears in both recommendation title and description
      expect(screen.getAllByText(/Ausgewogen/)[0]).toBeInTheDocument()
    })

    it('should show conservative profile when specified', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
          riskProfile="conservative"
        />
      )
      
      expect(screen.getByText(/Konservativ/)).toBeInTheDocument()
    })

    it('should show aggressive profile when specified', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
          riskProfile="aggressive"
        />
      )
      
      expect(screen.getByText(/Aggressiv/)).toBeInTheDocument()
    })

    it('should display weighting information', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(screen.getByText(/Gewichtung der Bewertungskriterien/)).toBeInTheDocument()
      // Use getAllByText since these appear in both weighting info and table headers
      expect(screen.getAllByText(/Portfolio-Lebensdauer/)[0]).toBeInTheDocument()
      expect(screen.getAllByText(/Gesamtentnahme/)[0]).toBeInTheDocument()
      expect(screen.getByText(/Kapitalerhalt/)).toBeInTheDocument()
      expect(screen.getAllByText(/Stabilität/)[0]).toBeInTheDocument()
    })
  })

  describe('Recommendations', () => {
    it('should show top 3 recommended strategies', () => {
      const manyResults: StrategyComparisonResult[] = [
        ...mockResults,
        {
          strategy: 'monatlich_fest',
          displayName: 'Monatlich fest',
          returnRate: 5,
          finalCapital: 50000,
          totalWithdrawal: 450000,
          averageAnnualWithdrawal: 22500,
          portfolioLifeYears: 20,
          successRate: 0.8,
          downsideRisk: 2,
          overallScore: 65,
          rank: 3,
        },
        {
          strategy: 'dynamisch',
          displayName: 'Dynamische Strategie',
          returnRate: 5,
          finalCapital: 80000,
          totalWithdrawal: 380000,
          averageAnnualWithdrawal: 19000,
          portfolioLifeYears: 22,
          successRate: 0.9,
          downsideRisk: 8,
          overallScore: 70,
          rank: 4,
        },
      ]
      
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={manyResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      // Should show recommendations
      expect(screen.getByText(/1\. Wahl/)).toBeInTheDocument()
      expect(screen.getByText(/2\. Wahl/)).toBeInTheDocument()
      expect(screen.getByText(/3\. Wahl/)).toBeInTheDocument()
    })

    it('should show profile-specific recommendations description', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
          riskProfile="conservative"
        />
      )
      
      expect(
        screen.getByText(/Fokus auf Kapitalerhalt und Langlebigkeit des Portfolios/)
      ).toBeInTheDocument()
    })
  })

  describe('Rankings', () => {
    it('should display rank badges', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(screen.getByText(/#1/)).toBeInTheDocument()
      expect(screen.getByText(/#2/)).toBeInTheDocument()
    })

    it('should show overall scores', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      // The scores are displayed in both recommendations and table rows
      // Use getAllByText since scores appear multiple times
      const scoresElements = screen.getAllByText((content) => content.includes('/100'))
      expect(scoresElements.length).toBeGreaterThan(0)
    })
  })

  describe('Explanatory Text', () => {
    it('should display legend information', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      expect(
        screen.getByText(/Gewichtete Bewertung basierend auf allen Kriterien/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Wahrscheinlichkeit, dass das Portfolio die geplante Dauer überlebt/)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/Volatilität der jährlichen Entnahmen/)
      ).toBeInTheDocument()
    })
  })

  describe('Return Rates', () => {
    it('should display return rates for each strategy', () => {
      render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      const returnRates = screen.getAllByText(/5% Rendite/)
      expect(returnRates.length).toBe(2)
    })
  })

  describe('Accessibility', () => {
    it('should have proper table structure', () => {
      const { container } = render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      const table = container.querySelector('table')
      expect(table).toBeInTheDocument()
      
      const thead = container.querySelector('thead')
      expect(thead).toBeInTheDocument()
      
      const tbody = container.querySelector('tbody')
      expect(tbody).toBeInTheDocument()
    })

    it('should have scrollable container for responsive design', () => {
      const { container } = render(
        <WithdrawalStrategyComparisonMatrix
          comparisonResults={mockResults}
          startingCapital={500000}
          plannedDuration={30}
        />
      )
      
      const scrollContainer = container.querySelector('.overflow-x-auto')
      expect(scrollContainer).toBeInTheDocument()
    })
  })
})
