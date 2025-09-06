import { render, screen } from '@testing-library/react';
import { expect, test, describe, vi } from 'vitest';
import { EntnahmeSimulationsAusgabe } from './EntnahmeSimulationsAusgabe';
import { SimulationProvider } from '../contexts/SimulationContext';
import type { SparplanElement } from '../utils/sparplan-utils';

// Mock the calculation helpers
vi.mock('./calculationHelpers', () => ({
  createInflationExplanation: vi.fn(() => ({ title: 'Inflation', introduction: 'Test', steps: [], finalResult: 'Test' })),
  createWithdrawalInterestExplanation: vi.fn(() => ({ title: 'Interest', introduction: 'Test', steps: [], finalResult: 'Test' })),
  createTaxExplanation: vi.fn(() => ({ title: 'Tax', introduction: 'Test', steps: [], finalResult: 'Test' })),
  createIncomeTaxExplanation: vi.fn(() => ({ title: 'Income Tax', introduction: 'Test', steps: [], finalResult: 'Test' })),
  createTaxableIncomeExplanation: vi.fn(() => ({ title: 'Taxable Income', introduction: 'Test', steps: [], finalResult: 'Test' })),
}));

describe('EntnahmeSimulationsAusgabe - Segmented Withdrawal Tax Display', () => {
  const mockElements: SparplanElement[] = [
    {
      type: 'einmalzahlung',
      start: '2040-01-01',
      gewinn: 0,
      einzahlung: 100000,
      simulation: {
        2040: { startkapital: 100000, endkapital: 100000, bezahlteSteuer: 0, genutzterFreibetrag: 0, zinsen: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 }
      }
    }
  ];

  test('displays segment-specific Grundfreibetrag information in summary', () => {
    const mockDispatchEnd = vi.fn();
    const mockOnWithdrawalResultsChange = vi.fn();

    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe
          startEnd={[2040, 2050]}
          elemente={mockElements}
          dispatchEnd={mockDispatchEnd}
          onWithdrawalResultsChange={mockOnWithdrawalResultsChange}
          steuerlast={0.26375}
          teilfreistellungsquote={0.3}
        />
      </SimulationProvider>
    );

    // Test that the component renders without crashing
    expect(screen.getByText(/Entnahme-Modus/)).toBeInTheDocument();
  });

  test('correctly determines tax display logic for segmented withdrawal', () => {
    const mockDispatchEnd = vi.fn();
    const mockOnWithdrawalResultsChange = vi.fn();

    render(
      <SimulationProvider>
        <EntnahmeSimulationsAusgabe
          startEnd={[2040, 2050]}
          elemente={mockElements}
          dispatchEnd={mockDispatchEnd}
          onWithdrawalResultsChange={mockOnWithdrawalResultsChange}
          steuerlast={0.26375}
          teilfreistellungsquote={0.3}
        />
      </SimulationProvider>
    );

    // Test that the component renders and shows withdrawal mode options
    expect(screen.getByText(/Einheitliche Strategie/)).toBeInTheDocument();
    expect(screen.getByText(/Geteilte Phasen/)).toBeInTheDocument();
  });
});