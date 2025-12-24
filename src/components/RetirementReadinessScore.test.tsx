import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RetirementReadinessScore } from './RetirementReadinessScore'
import type { EnhancedSummary } from '../utils/summary-utils'
import type { WithdrawalResult } from '../../helpers/withdrawal'

describe('RetirementReadinessScore', () => {
  const mockEnhancedSummary: EnhancedSummary = {
    startkapital: 100000,
    endkapital: 750000,
    zinsen: 650000,
    bezahlteSteuer: 50000,
    renditeAnsparphase: 5.5,
    monatlicheAuszahlung: 3000,
    jahreEntspharphase: 25,
    endkapitalEntspharphase: 500000,
  }

  const mockWithdrawalResult: WithdrawalResult = {
    2040: {
      startkapital: 750000,
      entnahme: 36000,
      endkapital: 730000,
      bezahlteSteuer: 5000,
      genutzterFreibetrag: 1000,
      zinsen: 20000,
    },
    2041: {
      startkapital: 730000,
      entnahme: 36000,
      endkapital: 710000,
      bezahlteSteuer: 5000,
      genutzterFreibetrag: 1000,
      zinsen: 20000,
    },
    2042: {
      startkapital: 710000,
      entnahme: 36000,
      endkapital: 690000,
      bezahlteSteuer: 5000,
      genutzterFreibetrag: 1000,
      zinsen: 20000,
    },
  }

  it('should render nothing when enhancedSummary is null', () => {
    const { container } = render(
      <RetirementReadinessScore enhancedSummary={null} withdrawalResult={mockWithdrawalResult} planningYears={25} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render nothing when withdrawalResult is null', () => {
    const { container } = render(
      <RetirementReadinessScore enhancedSummary={mockEnhancedSummary} withdrawalResult={null} planningYears={25} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('should render the component with title and description', () => {
    render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    expect(screen.getByText('🎯 Retirement-Readiness Score')).toBeInTheDocument()
    expect(screen.getByText('Bewertung Ihrer Altersvorsorge basierend auf deutscher Finanzplanung')).toBeInTheDocument()
  })

  it('should display overall score and label', () => {
    render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    // Score should be visible
    const scoreElements = screen.getAllByText(/\d+/)
    expect(scoreElements.length).toBeGreaterThan(0)

    // Label should be one of the German grade labels
    const possibleLabels = ['Ausgezeichnet', 'Gut', 'Befriedigend', 'Ausreichend', 'Verbesserungswürdig']
    const hasLabel = possibleLabels.some(label => {
      try {
        screen.getByText(label)
        return true
      } catch {
        return false
      }
    })
    expect(hasLabel).toBe(true)
  })

  it('should display detailed metrics section', () => {
    const { container } = render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    expect(screen.getByText('📊 Detaillierte Bewertung')).toBeInTheDocument()
    // Check that the metric cards are rendered
    expect(container.textContent).toContain('Kapitaldeckung')
    expect(container.textContent).toContain('Einkommensersatz')
    expect(container.textContent).toContain('Nachhaltigkeit')
  })

  it('should display financial details section', () => {
    render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    expect(screen.getByText('💼 Finanzielle Kennzahlen')).toBeInTheDocument()
    expect(screen.getByText('Gesamtkapital (Start Ruhestand):')).toBeInTheDocument()
    expect(screen.getByText('Monatliches Einkommen:')).toBeInTheDocument()
    expect(screen.getByText('Jährliche Ausgaben:')).toBeInTheDocument()
    expect(screen.getByText('Restkapital (Planungsende):')).toBeInTheDocument()
    expect(screen.getByText('Versorgungsdauer:')).toBeInTheDocument()
    expect(screen.getByText('Gesamt entnommen:')).toBeInTheDocument()
  })

  it('should display correct financial values', () => {
    render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    // Check for formatted currency values
    expect(screen.getByText(/750\.000,00 €/)).toBeInTheDocument() // Total capital
    expect(screen.getByText(/3\.000,00 €/)).toBeInTheDocument() // Monthly income
    expect(screen.getByText(/36\.000,00 €/)).toBeInTheDocument() // Annual expenses
    expect(screen.getByText(/500\.000,00 €/)).toBeInTheDocument() // Remaining capital
    expect(screen.getByText('25 Jahre')).toBeInTheDocument() // Sustainability years
  })

  it('should display recommendations section', () => {
    render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    expect(screen.getByText('💡 Empfehlungen')).toBeInTheDocument()

    // Should have at least one recommendation
    const recommendations = screen.getByText('💡 Empfehlungen').parentElement
    expect(recommendations?.querySelector('ul')).toBeInTheDocument()
  })

  it('should display methodology note', () => {
    render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    expect(screen.getByText(/Hinweis zur Berechnung:/)).toBeInTheDocument()
    expect(screen.getByText(/Kapitaldeckung \(40%\)/)).toBeInTheDocument()
    // "4%-Regel" appears in multiple places (metric description + methodology note)
    const regelElements = screen.getAllByText(/4%-Regel/)
    expect(regelElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should handle excellent score scenario', () => {
    const excellentSummary: EnhancedSummary = {
      ...mockEnhancedSummary,
      endkapital: 1000000,
      monatlicheAuszahlung: 3500,
      endkapitalEntspharphase: 800000,
    }

    render(
      <RetirementReadinessScore
        enhancedSummary={excellentSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    // Should show positive description
    expect(screen.getByText(/hervorragend/i)).toBeInTheDocument()
  })

  it('should handle poor score scenario', () => {
    const poorSummary: EnhancedSummary = {
      ...mockEnhancedSummary,
      endkapital: 200000,
      monatlicheAuszahlung: 1200,
      endkapitalEntspharphase: 10000,
    }

    render(
      <RetirementReadinessScore
        enhancedSummary={poorSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={15}
      />,
    )

    // Should show concerning description
    const description = screen.getByText(/nicht ausreichend|Handlungsbedarf|benötigt Aufmerksamkeit/i)
    expect(description).toBeInTheDocument()
  })

  it('should accept custom life expectancy', () => {
    render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={20}
        lifeExpectancy={30}
      />,
    )

    // Component should render without errors
    expect(screen.getByText('🎯 Retirement-Readiness Score')).toBeInTheDocument()
  })

  it('should accept custom nesting level for card styling', () => {
    const { container } = render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
        nestingLevel={1}
      />,
    )

    // Card should have nesting level attribute
    const card = container.querySelector('[data-nesting-level="1"]')
    expect(card).toBeInTheDocument()
  })

  it('should use default nesting level of 0 when not specified', () => {
    const { container } = render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    // Card should have nesting level 0
    const card = container.querySelector('[data-nesting-level="0"]')
    expect(card).toBeInTheDocument()
  })

  it('should display all metric percentages', () => {
    render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    // Should have percentage values for capital coverage, income replacement, and sustainability
    const percentages = screen.getAllByText(/%/)
    expect(percentages.length).toBeGreaterThanOrEqual(3) // At least 3 percentage values
  })

  it('should recalculate when props change', () => {
    const { rerender } = render(
      <RetirementReadinessScore
        enhancedSummary={mockEnhancedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    // Initial render
    expect(screen.getByText('750.000,00 €')).toBeInTheDocument()

    // Update with new summary
    const updatedSummary: EnhancedSummary = {
      ...mockEnhancedSummary,
      endkapital: 900000,
    }

    rerender(
      <RetirementReadinessScore
        enhancedSummary={updatedSummary}
        withdrawalResult={mockWithdrawalResult}
        planningYears={25}
      />,
    )

    // Should show updated value
    expect(screen.getByText('900.000,00 €')).toBeInTheDocument()
  })
})
