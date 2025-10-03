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
})
