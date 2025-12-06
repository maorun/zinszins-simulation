import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PensionGapAnalysis } from './PensionGapAnalysis'
import type { PensionGapAnalysisResult } from '../../helpers/pension-gap-analysis'

describe('PensionGapAnalysis', () => {
  const mockAnalysisResultWithGap: PensionGapAnalysisResult = {
    yearlyResults: [
      {
        year: 2024,
        desiredAnnualIncome: 30000,
        desiredMonthlyIncome: 2500,
        statutoryPensionNet: 18000,
        pensionCoveragePercentage: 60,
        portfolioWithdrawal: 9000,
        portfolioWithdrawalPercentage: 30,
        otherIncome: 0,
        otherIncomePercentage: 0,
        healthCareInsurance: 3000,
        totalAvailableIncome: 24000,
        gap: 6000,
        gapPercentage: 20,
        isLifestyleCovered: false,
        inflationAdjustmentFactor: 1.0,
      },
      {
        year: 2025,
        desiredAnnualIncome: 30600,
        desiredMonthlyIncome: 2550,
        statutoryPensionNet: 18180,
        pensionCoveragePercentage: 59.4,
        portfolioWithdrawal: 8500,
        portfolioWithdrawalPercentage: 27.8,
        otherIncome: 0,
        otherIncomePercentage: 0,
        healthCareInsurance: 3100,
        totalAvailableIncome: 23580,
        gap: 7020,
        gapPercentage: 22.9,
        isLifestyleCovered: false,
        inflationAdjustmentFactor: 1.02,
      },
    ],
    summary: {
      averagePensionCoverage: 59.7,
      averagePortfolioWithdrawal: 28.9,
      yearsCovered: 0,
      yearsWithGap: 2,
      totalYears: 2,
      averageGapAmount: 6510,
      maxGapAmount: 7020,
      maxGapYear: 2025,
    },
  }

  const mockAnalysisResultCovered: PensionGapAnalysisResult = {
    yearlyResults: [
      {
        year: 2024,
        desiredAnnualIncome: 30000,
        desiredMonthlyIncome: 2500,
        statutoryPensionNet: 20000,
        pensionCoveragePercentage: 66.7,
        portfolioWithdrawal: 15000,
        portfolioWithdrawalPercentage: 50,
        otherIncome: 0,
        otherIncomePercentage: 0,
        healthCareInsurance: 3000,
        totalAvailableIncome: 32000,
        gap: -2000,
        gapPercentage: -6.7,
        isLifestyleCovered: true,
        inflationAdjustmentFactor: 1.0,
      },
    ],
    summary: {
      averagePensionCoverage: 66.7,
      averagePortfolioWithdrawal: 50,
      yearsCovered: 1,
      yearsWithGap: 0,
      totalYears: 1,
      averageGapAmount: 0,
      maxGapAmount: -2000,
      maxGapYear: null,
    },
  }

  it('should render the component with pension gap data', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} />)

    expect(screen.getByText('Rentenlücken-Analyse')).toBeInTheDocument()
    expect(screen.getByText('Was ist die Rentenlücke?')).toBeInTheDocument()
  })

  it('should display summary statistics', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} />)

    // Check years covered/with gap
    expect(screen.getByText('Jahre mit voller Deckung:')).toBeInTheDocument()
    expect(screen.getByText('0 / 2')).toBeInTheDocument()

    expect(screen.getByText('Jahre mit Rentenlücke:')).toBeInTheDocument()
    expect(screen.getByText('2 / 2')).toBeInTheDocument()

    // Check average coverage percentages
    expect(screen.getByText('Ø Rentendeckung:')).toBeInTheDocument()
    expect(screen.getByText('59.7%')).toBeInTheDocument()

    expect(screen.getByText('Ø Portfolio-Entnahme:')).toBeInTheDocument()
    expect(screen.getByText('28.9%')).toBeInTheDocument()
  })

  it('should display gap statistics when there is a gap', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} />)

    expect(screen.getByText('Größte Rentenlücke:')).toBeInTheDocument()
    expect(screen.getByText('7.020,00 €')).toBeInTheDocument()
    expect(screen.getByText('(2025)')).toBeInTheDocument()

    expect(screen.getByText('Ø Rentenlücke:')).toBeInTheDocument()
    expect(screen.getByText('6.510,00 €')).toBeInTheDocument()
  })

  it('should not display gap statistics when lifestyle is fully covered', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultCovered} />)

    expect(screen.queryByText('Größte Rentenlücke:')).not.toBeInTheDocument()
    expect(screen.queryByText('Ø Rentenlücke:')).not.toBeInTheDocument()
  })

  it('should display detailed year-by-year breakdown when enabled', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} showDetailedBreakdown={true} />)

    expect(screen.getByText('Jahr-für-Jahr Aufschlüsselung')).toBeInTheDocument()
    expect(screen.getByText('Jahr 2024')).toBeInTheDocument()
    expect(screen.getByText('Jahr 2025')).toBeInTheDocument()
  })

  it('should not display detailed breakdown when disabled', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} showDetailedBreakdown={false} />)

    expect(screen.queryByText('Jahr-für-Jahr Aufschlüsselung')).not.toBeInTheDocument()
    expect(screen.queryByText('Jahr 2024')).not.toBeInTheDocument()
  })

  it('should limit number of years shown in detailed breakdown', () => {
    const manyYearsResult: PensionGapAnalysisResult = {
      yearlyResults: Array.from({ length: 15 }, (_, i) => ({
        year: 2024 + i,
        desiredAnnualIncome: 30000,
        desiredMonthlyIncome: 2500,
        statutoryPensionNet: 18000,
        pensionCoveragePercentage: 60,
        portfolioWithdrawal: 9000,
        portfolioWithdrawalPercentage: 30,
        otherIncome: 0,
        otherIncomePercentage: 0,
        healthCareInsurance: 3000,
        totalAvailableIncome: 24000,
        gap: 6000,
        gapPercentage: 20,
        isLifestyleCovered: false,
        inflationAdjustmentFactor: 1.0,
      })),
      summary: mockAnalysisResultWithGap.summary,
    }

    render(<PensionGapAnalysis analysisResult={manyYearsResult} showDetailedBreakdown={true} maxYearsToShow={5} />)

    // Should show first 5 years
    expect(screen.getByText('Jahr 2024')).toBeInTheDocument()
    expect(screen.getByText('Jahr 2028')).toBeInTheDocument()

    // Should not show later years
    expect(screen.queryByText('Jahr 2029')).not.toBeInTheDocument()

    // Should show "more years" message
    expect(screen.getByText('... und 10 weitere Jahre')).toBeInTheDocument()
  })

  it('should display desired vs available income for each year', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} showDetailedBreakdown={true} />)

    // Year 2024
    expect(screen.getAllByText('Gewünschtes Einkommen')).toHaveLength(2)
    expect(screen.getByText('30.000,00 €', { selector: '.font-bold' })).toBeInTheDocument()

    expect(screen.getAllByText('Verfügbares Einkommen')).toHaveLength(2)
    expect(screen.getByText('24.000,00 €', { selector: '.font-bold' })).toBeInTheDocument()
  })

  it('should show pension gap status for years with gap', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} showDetailedBreakdown={true} />)

    const gapLabels = screen.getAllByText(/Rentenlücke:/)
    expect(gapLabels.length).toBeGreaterThan(0)
  })

  it('should show covered status for years without gap', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultCovered} showDetailedBreakdown={true} />)

    expect(screen.getByText('Vollständig gedeckt')).toBeInTheDocument()
  })

  it('should display income breakdown with statutory pension', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} showDetailedBreakdown={true} />)

    // Check for statutory pension display
    const pensionLabels = screen.getAllByText(/🏛️ Gesetzliche Rente/)
    expect(pensionLabels).toHaveLength(2) // Once for each year

    // Check for portfolio withdrawal display
    const portfolioLabels = screen.getAllByText(/💰 Portfolio-Entnahme/)
    expect(portfolioLabels).toHaveLength(2)
  })

  it('should display health care insurance costs when present', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} showDetailedBreakdown={true} />)

    const insuranceLabels = screen.getAllByText(/🏥 Kranken-\/Pflegeversicherung/)
    expect(insuranceLabels).toHaveLength(2)
  })

  it('should display other income when present', () => {
    const resultWithOtherIncome: PensionGapAnalysisResult = {
      yearlyResults: [
        {
          ...mockAnalysisResultWithGap.yearlyResults[0],
          otherIncome: 5000,
          otherIncomePercentage: 16.7,
        },
      ],
      summary: mockAnalysisResultWithGap.summary,
    }

    render(<PensionGapAnalysis analysisResult={resultWithOtherIncome} showDetailedBreakdown={true} />)

    expect(screen.getByText(/💼 Andere Einkünfte:/)).toBeInTheDocument()
  })

  it('should display inflation adjustment note when applicable', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} showDetailedBreakdown={true} />)

    // Year 2025 has inflation adjustment factor of 1.02
    expect(screen.getByText(/Inflationsanpassung: 2.0%/)).toBeInTheDocument()
  })

  it('should display income breakdown bars with correct percentages', () => {
    render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} showDetailedBreakdown={true} />)

    // Check for legend with percentages
    expect(screen.getAllByText(/Rente \(60.0%\)/)).toHaveLength(1)
    expect(screen.getAllByText(/Portfolio \(30.0%\)/)).toHaveLength(1)
    expect(screen.getAllByText(/Lücke \(20.0%\)/)).toHaveLength(1)
  })

  it('should handle empty results gracefully', () => {
    const emptyResult: PensionGapAnalysisResult = {
      yearlyResults: [],
      summary: {
        averagePensionCoverage: 0,
        averagePortfolioWithdrawal: 0,
        yearsCovered: 0,
        yearsWithGap: 0,
        totalYears: 0,
        averageGapAmount: 0,
        maxGapAmount: 0,
        maxGapYear: null,
      },
    }

    render(<PensionGapAnalysis analysisResult={emptyResult} />)

    expect(screen.getByText('Rentenlücken-Analyse')).toBeInTheDocument()
    // Check for years covered/with gap - both should show 0 / 0
    expect(screen.getByText('Jahre mit voller Deckung:')).toBeInTheDocument()
    expect(screen.getByText('Jahre mit Rentenlücke:')).toBeInTheDocument()
  })

  it('should display correct status color based on gap coverage', () => {
    const { rerender } = render(<PensionGapAnalysis analysisResult={mockAnalysisResultWithGap} />)

    // With gap - should show red/orange status
    expect(screen.getByText('Rentenlücken-Zusammenfassung')).toHaveClass('text-red-600')

    // Fully covered - should show green status
    rerender(<PensionGapAnalysis analysisResult={mockAnalysisResultCovered} />)
    expect(screen.getByText('Rentenlücken-Zusammenfassung')).toHaveClass('text-green-600')
  })
})
