import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { EntnahmeSimulationDisplay } from './EntnahmeSimulationDisplay';
import type { WithdrawalFormValue } from '../utils/config-storage';

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
};

const mockFormValue: WithdrawalFormValue = {
  endOfLife: 2050,
  strategie: "4prozent",
  rendite: 5,
  withdrawalFrequency: "yearly",
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
  rmdLifeExpectancyTable: 'german_2020_22',
  kapitalerhaltNominalReturn: 7,
  kapitalerhaltInflationRate: 2,
  grundfreibetragAktiv: false,
  grundfreibetragBetrag: 10908,
  einkommensteuersatz: 18,
};

const mockComparisonResults = [
  {
    strategy: {
      id: "test1",
      name: "3% Regel",
      strategie: "3prozent" as const,
      rendite: 5,
    },
    finalCapital: 450000,
    totalWithdrawal: 300000,
    averageAnnualWithdrawal: 15000,
    duration: 20,
  },
];

describe('EntnahmeSimulationDisplay', () => {
  it('displays no data message when withdrawalData is null', () => {
    render(
      <EntnahmeSimulationDisplay
        withdrawalData={null}
        formValue={mockFormValue}
        useComparisonMode={false}
        comparisonResults={[]}
        useSegmentedWithdrawal={false}
        withdrawalSegments={[]}
        onCalculationInfoClick={() => {}}
      />
    );

    expect(screen.getByText(/Keine Daten verfügbar/)).toBeInTheDocument();
  });

  it('displays comparison mode results', () => {
    render(
      <EntnahmeSimulationDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        useComparisonMode={true}
        comparisonResults={mockComparisonResults}
        useSegmentedWithdrawal={false}
        withdrawalSegments={[]}
        onCalculationInfoClick={() => {}}
      />
    );

    expect(screen.getByText('Strategien-Vergleich')).toBeInTheDocument();
    expect(screen.getByText('📊 Basis-Strategie: 4% Regel')).toBeInTheDocument();
    expect(screen.getByText('🔍 Vergleichs-Strategien')).toBeInTheDocument();
  });

  it('displays comparison results table when there are comparison strategies', () => {
    render(
      <EntnahmeSimulationDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        useComparisonMode={true}
        comparisonResults={mockComparisonResults}
        useSegmentedWithdrawal={false}
        withdrawalSegments={[]}
        onCalculationInfoClick={() => {}}
      />
    );

    expect(screen.getByText('📋 Vergleichstabelle')).toBeInTheDocument();
    expect(screen.getByText('3% Regel')).toBeInTheDocument();
  });

  it('shows no comparison strategies message when array is empty', () => {
    render(
      <EntnahmeSimulationDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        useComparisonMode={true}
        comparisonResults={[]}
        useSegmentedWithdrawal={false}
        withdrawalSegments={[]}
        onCalculationInfoClick={() => {}}
      />
    );

    expect(screen.getByText(/Keine Vergleichs-Strategien konfiguriert/)).toBeInTheDocument();
  });

  it('component exports and basic functionality work', () => {
    // Test that the component function exists and can be called
    expect(typeof EntnahmeSimulationDisplay).toBe('function');

    // Test basic rendering without throwing
    const result = render(
      <EntnahmeSimulationDisplay
        withdrawalData={null}
        formValue={mockFormValue}
        useComparisonMode={false}
        comparisonResults={[]}
        useSegmentedWithdrawal={false}
        withdrawalSegments={[]}
        onCalculationInfoClick={() => {}}
      />
    );

    expect(result).toBeDefined();
  });
});