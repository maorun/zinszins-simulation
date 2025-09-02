import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WithdrawalPhaseMonteCarloAnalysis from './WithdrawalPhaseMonteCarloAnalysis';
import { SimulationProvider } from '../contexts/SimulationContext';

// Mock the useSimulation hook
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => ({
    simulationData: {
      sparplanElements: []
    },
    randomSeed: 123
  })
}));

describe('WithdrawalPhaseMonteCarloAnalysis', () => {
  it('renders the withdrawal phase Monte Carlo analysis', () => {
    render(
      <SimulationProvider>
        <WithdrawalPhaseMonteCarloAnalysis />
      </SimulationProvider>
    );

    expect(screen.getByText('📊 Monte Carlo Analyse - Entnahmephase')).toBeInTheDocument();
    expect(screen.getByText(/Durchschnittliche Rendite 5.0%, Volatilität 12.0%/)).toBeInTheDocument();
    expect(screen.getAllByText(/Worst Case \(5% Perzentil\)/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Best Case \(95% Perzentil\)/).length).toBeGreaterThan(0);
  });
});