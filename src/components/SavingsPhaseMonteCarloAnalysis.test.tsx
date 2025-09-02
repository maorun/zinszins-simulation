import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SavingsPhaseMonteCarloAnalysis from './SavingsPhaseMonteCarloAnalysis';
import { SimulationProvider } from '../contexts/SimulationContext';

// Mock the useSimulation hook
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => ({
    simulationData: {
      sparplanElements: []
    },
    averageReturn: 7,
    standardDeviation: 15,
    randomSeed: 123
  })
}));

describe('SavingsPhaseMonteCarloAnalysis', () => {
  it('renders the savings phase Monte Carlo analysis', () => {
    render(
      <SimulationProvider>
        <SavingsPhaseMonteCarloAnalysis />
      </SimulationProvider>
    );

    expect(screen.getByText('📊 Monte Carlo Analyse - Ansparphase')).toBeInTheDocument();
    expect(screen.getByText(/Durchschnittliche Rendite 7.0%, Volatilität 15.0%/)).toBeInTheDocument();
    expect(screen.getAllByText(/Worst Case \(5% Perzentil\)/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Best Case \(95% Perzentil\)/).length).toBeGreaterThan(0);
  });
});