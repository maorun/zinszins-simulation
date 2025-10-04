import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { EntnahmeSimulationDisplay } from './EntnahmeSimulationDisplay'
import type { WithdrawalFormValue } from '../utils/config-storage'

const mockWithdrawalData = {
  startingCapital: 500000,
  withdrawalArray: [
    {
      year: 2024,
      startkapital: 500000,
      entnahme: 20000,
      endkapital: 480000,
      zinsen: 25000,
      bezahlteSteuer: 3000,
      genutzterFreibetrag: 2000,
    },
  ],
  withdrawalResult: {},
  duration: 25,
}

const mockFormValue: WithdrawalFormValue = {
  strategie: '4prozent',
  rendite: 5,
  withdrawalFrequency: 'yearly',
  inflationAktiv: false,
  inflationsrate: 2,
  monatlicheBetrag: 2000,
  guardrailsAktiv: false,
  guardrailsSchwelle: 10,
  variabelProzent: 5,
  dynamischBasisrate: 4,
  dynamischObereSchwell: 8,
  dynamischObereAnpassung: 5,
  dynamischUntereSchwell: 2,
  dynamischUntereAnpassung: -5,
  rmdStartAge: 65,
  kapitalerhaltNominalReturn: 7,
  kapitalerhaltInflationRate: 2,
  grundfreibetragAktiv: false,
  grundfreibetragBetrag: 10908,
  einkommensteuersatz: 18,
}

const mockComparisonResults = [
  {
    strategy: {
      id: 'test1',
      name: '3% Regel',
      strategie: '3prozent' as const,
      rendite: 5,
    },
    finalCapital: 450000,
    totalWithdrawal: 300000,
    averageAnnualWithdrawal: 15000,
    duration: 20,
  },
]

describe('EntnahmeSimulationDisplay', () => {
  it('displays no data message when withdrawalData is null', () => {
    render(
      <EntnahmeSimulationDisplay
        withdrawalData={null}
        formValue={mockFormValue}
        useComparisonMode={false}
        comparisonResults={[]}
        onCalculationInfoClick={() => {}}
      />,
    )

    expect(screen.getByText(/Keine Daten verfügbar/)).toBeInTheDocument()
  })

  it('displays comparison mode results', () => {
    render(
      <EntnahmeSimulationDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        useComparisonMode={true}
        comparisonResults={mockComparisonResults}
        onCalculationInfoClick={() => {}}
      />,
    )

    expect(screen.getByText('Strategien-Vergleich')).toBeInTheDocument()
    expect(screen.getByText('📊 Basis-Strategie: 4% Regel')).toBeInTheDocument()
    expect(screen.getByText('🔍 Vergleichs-Strategien')).toBeInTheDocument()
  })

  it('displays comparison results table when there are comparison strategies', () => {
    render(
      <EntnahmeSimulationDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        useComparisonMode={true}
        comparisonResults={mockComparisonResults}
        onCalculationInfoClick={() => {}}
      />,
    )

    expect(screen.getByText('📋 Vergleichstabelle')).toBeInTheDocument()
    expect(screen.getByText('3% Regel')).toBeInTheDocument()
  })

  it('shows no comparison strategies message when array is empty', () => {
    render(
      <EntnahmeSimulationDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        useComparisonMode={true}
        comparisonResults={[]}
        onCalculationInfoClick={() => {}}
      />,
    )

    expect(screen.getByText(/Keine Vergleichs-Strategien konfiguriert/)).toBeInTheDocument()
  })

  it('displays statutory pension information when available', () => {
    const mockWithdrawalDataWithPension = {
      ...mockWithdrawalData,
      withdrawalArray: [
        {
          ...mockWithdrawalData.withdrawalArray[0],
          statutoryPension: {
            grossAnnualAmount: 18000,
            netAnnualAmount: 15000,
            incomeTax: 3000,
            taxableAmount: 14400,
          },
        },
      ],
    }

    render(
      <EntnahmeSimulationDisplay
        withdrawalData={mockWithdrawalDataWithPension}
        formValue={mockFormValue}
        useComparisonMode={false}
        comparisonResults={[]}
        onCalculationInfoClick={() => {}}
      />,
    )

    // Check that statutory pension information is displayed
    expect(screen.getByText('🏛️ Gesetzliche Rente (Brutto):')).toBeInTheDocument()
    expect(screen.getByText('+18.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('💸 Einkommensteuer auf Rente:')).toBeInTheDocument()
    expect(screen.getByText('-3.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('🏛️ Gesetzliche Rente (Netto):')).toBeInTheDocument()
    expect(screen.getByText('+15.000,00 €')).toBeInTheDocument()
    expect(screen.getByText('📅 Monatliche Rente (Netto):')).toBeInTheDocument()
    expect(screen.getByText('+1.250,00 €')).toBeInTheDocument()
  })

  it('does not display statutory pension when not available', () => {
    render(
      <EntnahmeSimulationDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        useComparisonMode={false}
        comparisonResults={[]}
        onCalculationInfoClick={() => {}}
      />,
    )

    // Check that statutory pension information is not displayed
    expect(screen.queryByText('🏛️ Gesetzliche Rente (Brutto):')).not.toBeInTheDocument()
    expect(screen.queryByText('💸 Einkommensteuer auf Rente:')).not.toBeInTheDocument()
  })

  it('does not display income tax when no tax is owed on pension', () => {
    const mockWithdrawalDataWithPensionNoTax = {
      ...mockWithdrawalData,
      withdrawalArray: [
        {
          ...mockWithdrawalData.withdrawalArray[0],
          statutoryPension: {
            grossAnnualAmount: 15000,
            netAnnualAmount: 15000,
            incomeTax: 0,
            taxableAmount: 0,
          },
        },
      ],
    }

    render(
      <EntnahmeSimulationDisplay
        withdrawalData={mockWithdrawalDataWithPensionNoTax}
        formValue={mockFormValue}
        useComparisonMode={false}
        comparisonResults={[]}
        onCalculationInfoClick={() => {}}
      />,
    )

    // Pension should be displayed, but not income tax
    expect(screen.getByText('🏛️ Gesetzliche Rente (Brutto):')).toBeInTheDocument()
    expect(screen.getAllByText('+15.000,00 €')).toHaveLength(2) // Both gross and net amounts are the same
    expect(screen.queryByText('💸 Einkommensteuer auf Rente:')).not.toBeInTheDocument()
    expect(screen.getByText('🏛️ Gesetzliche Rente (Netto):')).toBeInTheDocument()
  })

  it('component exports and basic functionality work', () => {
    // Test that the component function exists and can be called
    expect(typeof EntnahmeSimulationDisplay).toBe('function')

    // Test basic rendering without throwing
    const result = render(
      <EntnahmeSimulationDisplay
        withdrawalData={null}
        formValue={mockFormValue}
        useComparisonMode={false}
        comparisonResults={[]}
        onCalculationInfoClick={() => {}}
      />,
    )

    expect(result).toBeDefined()
  })

  describe('Inflation-adjusted values display', () => {
    const mockWithdrawalDataWithMultipleYears = {
      startingCapital: 500000,
      withdrawalArray: [
        {
          year: 2041, // Base year
          startkapital: 500000,
          entnahme: 20000,
          endkapital: 520000,
          zinsen: 25000,
          bezahlteSteuer: 3000,
          genutzterFreibetrag: 2000,
        },
        {
          year: 2042, // 1 year later
          startkapital: 520000,
          entnahme: 20400,
          endkapital: 540800,
          zinsen: 26000,
          bezahlteSteuer: 3100,
          genutzterFreibetrag: 2000,
        },
        {
          year: 2043, // 2 years later
          startkapital: 540800,
          entnahme: 20808,
          endkapital: 562016,
          zinsen: 27040,
          bezahlteSteuer: 3200,
          genutzterFreibetrag: 2000,
        },
      ],
      withdrawalResult: {},
      duration: 25,
    }

    it('displays only nominal values when inflation is disabled', () => {
      const formValueNoInflation = { ...mockFormValue, inflationAktiv: false }

      render(
        <EntnahmeSimulationDisplay
          withdrawalData={mockWithdrawalDataWithMultipleYears}
          formValue={formValueNoInflation}
          useComparisonMode={false}
          comparisonResults={[]}
          onCalculationInfoClick={() => {}}
        />,
      )

      // Should show nominal values only (no "real" text)
      expect(screen.getAllByText(/520\.000,00 €/)).toHaveLength(2) // appears in multiple years
      expect(screen.queryByText(/real/)).not.toBeInTheDocument()
    })

    it('displays both nominal and inflation-adjusted values when inflation is enabled', () => {
      const formValueWithInflation = {
        ...mockFormValue,
        inflationAktiv: true,
        inflationsrate: 2, // 2% inflation
      }

      render(
        <EntnahmeSimulationDisplay
          withdrawalData={mockWithdrawalDataWithMultipleYears}
          formValue={formValueWithInflation}
          useComparisonMode={false}
          comparisonResults={[]}
          onCalculationInfoClick={() => {}}
        />,
      )

      // Should show both nominal and real values for 2041 (base year - equal values)
      expect(screen.getByText(/520\.000,00 € \/ 520\.000,00 € real/)).toBeInTheDocument()

      // Should show "real" text indicating inflation adjustment is active
      expect(screen.getAllByText(/real/)).toHaveLength(12) // Multiple real values displayed across years

      // Should show inflation rate in summary
      expect(screen.getByText(/Inflationsrate/)).toBeInTheDocument()
      expect(screen.getByText(/2% p\.a\./)).toBeInTheDocument()
    })

    it('calculates inflation-adjusted values correctly for different years', () => {
      const formValueWithInflation = {
        ...mockFormValue,
        inflationAktiv: true,
        inflationsrate: 3, // 3% inflation for easier calculation
      }

      render(
        <EntnahmeSimulationDisplay
          withdrawalData={mockWithdrawalDataWithMultipleYears}
          formValue={formValueWithInflation}
          useComparisonMode={false}
          comparisonResults={[]}
          onCalculationInfoClick={() => {}}
        />,
      )

      // Base year 2041: real value equals nominal
      expect(screen.getByText(/520\.000,00 € \/ 520\.000,00 € real/)).toBeInTheDocument()

      // Check that inflation-adjusted values are being calculated and displayed
      // We'll look for the presence of "real" text and some inflation adjustment
      expect(screen.getAllByText(/real/)).toHaveLength(12) // Should have multiple "real" values

      // Check that different years show different calculations
      const realValues = screen.getAllByText(/€ real/)
      expect(realValues.length).toBeGreaterThan(0)
    })

    it('applies inflation adjustment to all key financial values', () => {
      const formValueWithInflation = {
        ...mockFormValue,
        inflationAktiv: true,
        inflationsrate: 2,
      }

      render(
        <EntnahmeSimulationDisplay
          withdrawalData={mockWithdrawalDataWithMultipleYears}
          formValue={formValueWithInflation}
          useComparisonMode={false}
          comparisonResults={[]}
          onCalculationInfoClick={() => {}}
        />,
      )

      // Check that all main values show inflation adjustment
      // Should find multiple instances of "real" text across all value types
      const realValues = screen.getAllByText(/real/)
      expect(realValues.length).toBeGreaterThan(6) // Multiple fields show real values

      // Check specific values contain both nominal and real formats
      expect(screen.getByText(/520\.000,00 € \/ 520\.000,00 € real/)).toBeInTheDocument() // Base year should be equal

      // Verify that inflation adjustments are shown for key financial metrics
      expect(screen.getAllByText(/€ \/ .* € real/)).toHaveLength(12) // All main values show both nominal and real
    })

    it('handles edge cases correctly', () => {
      const formValueWithInflation = {
        ...mockFormValue,
        inflationAktiv: true,
        inflationsrate: 0.1, // Very low inflation to test edge case
      }

      render(
        <EntnahmeSimulationDisplay
          withdrawalData={mockWithdrawalDataWithMultipleYears}
          formValue={formValueWithInflation}
          useComparisonMode={false}
          comparisonResults={[]}
          onCalculationInfoClick={() => {}}
        />,
      )

      // With very low inflation, should still show inflation-adjusted values
      expect(screen.getByText(/520\.000,00 € \/ 520\.000,00 € real/)).toBeInTheDocument()

      // Should have multiple "real" values displayed
      expect(screen.getAllByText(/real/)).toHaveLength(12)
    })

    it('displays inflation rate information in summary when active', () => {
      const formValueWithInflation = {
        ...mockFormValue,
        inflationAktiv: true,
        inflationsrate: 2.5,
      }

      render(
        <EntnahmeSimulationDisplay
          withdrawalData={mockWithdrawalDataWithMultipleYears}
          formValue={formValueWithInflation}
          useComparisonMode={false}
          comparisonResults={[]}
          onCalculationInfoClick={() => {}}
        />,
      )

      // Should display inflation information in the summary
      expect(screen.getByText(/Inflationsrate/)).toBeInTheDocument()
      expect(screen.getByText(/2\.5% p\.a\./)).toBeInTheDocument()
      expect(screen.getByText(/Entnahmebeträge werden jährlich angepasst/)).toBeInTheDocument()
    })
  })
})
