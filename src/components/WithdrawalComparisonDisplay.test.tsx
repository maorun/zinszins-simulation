import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WithdrawalComparisonDisplay } from './WithdrawalComparisonDisplay';
import type { WithdrawalFormValue, ComparisonStrategy } from '../utils/config-storage';
import type { WithdrawalResult } from '../../helpers/withdrawal';

// Mock data for testing
const mockWithdrawalData = {
  startingCapital: 500000,
  withdrawalArray: [
    {
      year: 2024,
      startkapital: 500000,
      entnahme: 20000,
      zinsen: 24000,
      bezahlteSteuer: 6000,
      endkapital: 498000,
    },
    {
      year: 2025,
      startkapital: 498000,
      entnahme: 20800,
      zinsen: 23904,
      bezahlteSteuer: 5976,
      endkapital: 495128,
    },
  ],
  withdrawalResult: {} as WithdrawalResult,
  duration: 25,
};

const mockFormValue: WithdrawalFormValue = {
  endOfLife: 2050,
  strategie: '4prozent' as const,
  rendite: 5,
  withdrawalFrequency: 'yearly' as const,
  variabelProzent: 4,
  monatlicheBetrag: 1667,
  dynamischBasisrate: 4,
  dynamischObereSchwell: 7,
  dynamischObereAnpassung: 1,
  dynamischUntereSchwell: 2,
  dynamischUntereAnpassung: -1,
  inflationAktiv: true,
  inflationsrate: 2,
  guardrailsAktiv: false,
  guardrailsSchwelle: 80,
  grundfreibetragAktiv: false,
  grundfreibetragBetrag: 10908,
  einkommensteuersatz: 18,
};

const mockComparisonResults = [
  {
    strategy: {
      id: '1',
      name: '3% Regel',
      endOfLife: 2050,
      strategie: '3prozent' as const,
      rendite: 4,
      withdrawalFrequency: 'yearly' as const,
      variabelProzent: 3,
      monatlicheBetrag: 1250,
      dynamischBasisrate: 3,
      dynamischObereSchwell: 6,
      dynamischObereAnpassung: 0.5,
      dynamischUntereSchwell: 1,
      dynamischUntereAnpassung: -0.5,
      inflationAktiv: false,
      inflationsrate: 0,
      guardrailsAktiv: false,
      guardrailsSchwelle: 80,
      grundfreibetragAktiv: false,
      grundfreibetragBetrag: 10908,
      einkommensteuersatz: 18,
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
      endOfLife: 2050,
      strategie: 'variabel_prozent' as const,
      rendite: 3,
      withdrawalFrequency: 'yearly' as const,
      variabelProzent: 2.5,
      monatlicheBetrag: 1042,
      dynamischBasisrate: 2.5,
      dynamischObereSchwell: 5,
      dynamischObereAnpassung: 0.3,
      dynamischUntereSchwell: 0.5,
      dynamischUntereAnpassung: -0.3,
      inflationAktiv: false,
      inflationsrate: 0,
      guardrailsAktiv: false,
      guardrailsSchwelle: 80,
      grundfreibetragAktiv: false,
      grundfreibetragBetrag: 10908,
      einkommensteuersatz: 18,
    } as ComparisonStrategy,
    finalCapital: 480000,
    totalWithdrawal: 312500,
    averageAnnualWithdrawal: 12500,
    duration: 'unbegrenzt' as const,
  },
];

describe('WithdrawalComparisonDisplay', () => {
  it('renders comparison title and starting capital', () => {
    render(
      <WithdrawalComparisonDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        comparisonResults={mockComparisonResults}
      />
    );

    expect(screen.getByText('Strategien-Vergleich')).toBeInTheDocument();
    expect(screen.getByText('Startkapital bei Entnahme:')).toBeInTheDocument();
    expect(screen.getByText('500.000,00 €')).toBeInTheDocument();
  });

  it('renders base strategy summary correctly for 4% rule', () => {
    render(
      <WithdrawalComparisonDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        comparisonResults={mockComparisonResults}
      />
    );

    expect(screen.getByText(/📊 Basis-Strategie: 4% Regel/)).toBeInTheDocument();
    expect(screen.getByText('Rendite:')).toBeInTheDocument();
    // Use getAllByText since 5% appears multiple times (base strategy + table)
    expect(screen.getAllByText('5%')).toHaveLength(2);
    // 498.000,00 € appears in both base strategy and table
    expect(screen.getAllByText(/498.000,00 €/)).toHaveLength(2);
    // 25 Jahre appears in both base strategy and table
    expect(screen.getAllByText('25 Jahre')).toHaveLength(2);
    expect(screen.getByText('20.000,00 €')).toBeInTheDocument(); // Annual withdrawal (4% of 500k)
  });

  it('renders base strategy summary correctly for monthly fixed strategy', () => {
    const monthlyFormValue = {
      ...mockFormValue,
      strategie: 'monatlich_fest' as const,
    };

    render(
      <WithdrawalComparisonDisplay
        withdrawalData={mockWithdrawalData}
        formValue={monthlyFormValue}
        comparisonResults={mockComparisonResults}
      />
    );

    expect(screen.getByText(/📊 Basis-Strategie: Monatlich fest/)).toBeInTheDocument();
    expect(screen.getByText('Monatliche Entnahme:')).toBeInTheDocument();
    expect(screen.getByText('1.667,00 €')).toBeInTheDocument();
  });

  it('renders base strategy summary correctly for variable percentage strategy', () => {
    const variableFormValue = {
      ...mockFormValue,
      strategie: 'variabel_prozent' as const,
    };

    render(
      <WithdrawalComparisonDisplay
        withdrawalData={mockWithdrawalData}
        formValue={variableFormValue}
        comparisonResults={mockComparisonResults}
      />
    );

    expect(screen.getByText(/📊 Basis-Strategie: Variable Prozent/)).toBeInTheDocument();
    expect(screen.getByText('Jährliche Entnahme:')).toBeInTheDocument();
    expect(screen.getByText('20.000,00 €')).toBeInTheDocument(); // 4% of 500k
  });

  it('renders base strategy summary correctly for dynamic strategy', () => {
    const dynamicFormValue = {
      ...mockFormValue,
      strategie: 'dynamisch' as const,
    };

    render(
      <WithdrawalComparisonDisplay
        withdrawalData={mockWithdrawalData}
        formValue={dynamicFormValue}
        comparisonResults={mockComparisonResults}
      />
    );

    expect(screen.getByText(/📊 Basis-Strategie: Dynamische Strategie/)).toBeInTheDocument();
    expect(screen.getByText('Basis-Entnahme:')).toBeInTheDocument();
    expect(screen.getByText('20.000,00 €')).toBeInTheDocument(); // 4% of 500k
  });

  it('renders comparison strategies section', () => {
    render(
      <WithdrawalComparisonDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        comparisonResults={mockComparisonResults}
      />
    );

    expect(screen.getByText('🔍 Vergleichs-Strategien')).toBeInTheDocument();
    expect(screen.getByText('3% Regel (4% Rendite)')).toBeInTheDocument();
    expect(screen.getByText('Conservative Strategy (3% Rendite)')).toBeInTheDocument();
    
    // Check comparison strategy details - use getAllByText for amounts that appear in table too
    expect(screen.getAllByText('450.000,00 €')).toHaveLength(2); // First strategy final capital (card + table)
    expect(screen.getByText('375.000,00 €')).toBeInTheDocument(); // First strategy total withdrawal
    expect(screen.getAllByText('15.000,00 €')).toHaveLength(2); // First strategy average annual (card + table)
    expect(screen.getAllByText('30 Jahre')).toHaveLength(2); // First strategy duration (card + table)
    
    expect(screen.getAllByText('480.000,00 €')).toHaveLength(2); // Second strategy final capital (card + table)
    expect(screen.getByText('312.500,00 €')).toBeInTheDocument(); // Second strategy total withdrawal
    expect(screen.getAllByText('12.500,00 €')).toHaveLength(2); // Second strategy average annual (card + table)
    expect(screen.getAllByText('unbegrenzt')).toHaveLength(2); // Second strategy duration (card + table)
  });

  it('renders empty state when no comparison results', () => {
    render(
      <WithdrawalComparisonDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        comparisonResults={[]}
      />
    );

    expect(
      screen.getByText(/Keine Vergleichs-Strategien konfiguriert/)
    ).toBeInTheDocument();
  });

  it('renders comparison summary table when there are results', () => {
    render(
      <WithdrawalComparisonDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        comparisonResults={mockComparisonResults}
      />
    );

    expect(screen.getByText('📋 Vergleichstabelle')).toBeInTheDocument();
    
    // Check table headers
    expect(screen.getByText('Strategie')).toBeInTheDocument();
    expect(screen.getByText('Rendite')).toBeInTheDocument();
    expect(screen.getByText('Endkapital')).toBeInTheDocument();
    expect(screen.getByText('Ø Jährliche Entnahme')).toBeInTheDocument();
    expect(screen.getByText('Vermögen reicht für')).toBeInTheDocument();
    
    // Check base strategy row in table
    expect(screen.getByText('📊 4% Regel (Basis)')).toBeInTheDocument();
    
    // Check comparison strategy rows in table
    expect(screen.getByText('3% Regel')).toBeInTheDocument();
    expect(screen.getByText('Conservative Strategy')).toBeInTheDocument();
  });

  it('does not render comparison table when no comparison results', () => {
    render(
      <WithdrawalComparisonDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        comparisonResults={[]}
      />
    );

    expect(screen.queryByText('📋 Vergleichstabelle')).not.toBeInTheDocument();
  });

  it('handles unlimited duration correctly in base strategy', () => {
    const unlimitedWithdrawalData = {
      ...mockWithdrawalData,
      duration: null,
    };

    render(
      <WithdrawalComparisonDisplay
        withdrawalData={unlimitedWithdrawalData}
        formValue={mockFormValue}
        comparisonResults={mockComparisonResults}
      />
    );

    // "unbegrenzt" appears multiple times (base strategy + comparison table)
    expect(screen.getAllByText('unbegrenzt')).toHaveLength(4);
  });

  it('calculates average annual withdrawal correctly for base strategy in table', () => {
    render(
      <WithdrawalComparisonDisplay
        withdrawalData={mockWithdrawalData}
        formValue={mockFormValue}
        comparisonResults={mockComparisonResults}
      />
    );

    // Total withdrawal from mockWithdrawalData: 20000 + 20800 = 40800
    // Average: 40800 / 2 = 20400
    expect(screen.getByText('20.400,00 €')).toBeInTheDocument();
  });
});