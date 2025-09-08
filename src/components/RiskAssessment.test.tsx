import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import RiskAssessment from './RiskAssessment';

// Mock the useSimulation hook
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: vi.fn()
}));

// Mock the MonteCarloAnalysisDisplay component
vi.mock('./MonteCarloAnalysisDisplay', () => ({
  default: ({ title }: { title: string }) => <div data-testid="monte-carlo-display">{title}</div>
}));

const { useSimulation } = await import('../contexts/useSimulation');

const sampleSimulationData = {
  sparplanElements: [
    {
      simulation: {
        2020: { endkapital: 100000 },
        2021: { endkapital: 105000 },
        2022: { endkapital: 102000 },
        2023: { endkapital: 108000 },
        2024: { endkapital: 115000 }
      }
    },
    {
      simulation: {
        2020: { endkapital: 50000 },
        2021: { endkapital: 52500 },
        2022: { endkapital: 51000 },
        2023: { endkapital: 54000 },
        2024: { endkapital: 57500 }
      }
    }
  ]
};

describe('RiskAssessment', () => {
  beforeEach(() => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: sampleSimulationData,
      averageReturn: 7,
      standardDeviation: 15,
      randomSeed: 12345
    } as any);
  });

  test('renders risk assessment for savings phase', () => {
    render(<RiskAssessment phase="savings" />);
    
    expect(screen.getByText(/Risikobewertung - Ansparphase/)).toBeInTheDocument();
    expect(screen.getAllByText(/Value-at-Risk \(95%\)/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Maximum Drawdown/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Sharpe Ratio/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Volatilität/)[0]).toBeInTheDocument();
  });

  test('renders risk assessment for withdrawal phase', () => {
    render(<RiskAssessment phase="withdrawal" />);
    
    expect(screen.getByText(/Risikobewertung - Entnahmephase/)).toBeInTheDocument();
    expect(screen.getByText(/💸 Risikokennzahlen für Entnahmephase/)).toBeInTheDocument();
  });

  test('displays risk metrics cards', () => {
    render(<RiskAssessment phase="savings" />);
    
    // Check for risk metric cards using more specific queries
    expect(screen.getAllByText(/Value-at-Risk \(95%\)/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Maximum Drawdown/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Sharpe Ratio/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Volatilität/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Sortino Ratio/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Calmar Ratio/)[0]).toBeInTheDocument();
  });

  test('includes Monte Carlo analysis in collapsible panel', () => {
    render(<RiskAssessment phase="savings" />);
    
    expect(screen.getByText(/Monte Carlo Analyse/)).toBeInTheDocument();
    expect(screen.getByTestId('monte-carlo-display')).toBeInTheDocument();
  });

  test('shows risk explanation section', () => {
    render(<RiskAssessment phase="savings" />);
    
    expect(screen.getAllByText(/Risikokennzahlen für Ansparphase/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Value-at-Risk \(VaR\):/)).toBeInTheDocument();
    expect(screen.getByText(/Sharpe Ratio:/)).toBeInTheDocument();
    expect(screen.getByText(/Maximum Drawdown:/)).toBeInTheDocument();
  });

  test('returns null when no simulation data', () => {
    vi.mocked(useSimulation).mockReturnValue({
      simulationData: null,
      averageReturn: 7,
      standardDeviation: 15,
      randomSeed: 12345
    } as any);

    const { container } = render(<RiskAssessment phase="savings" />);
    expect(container.firstChild).toBeNull();
  });

  test('uses custom config when provided', () => {
    const customConfig = {
      averageReturn: 0.08,
      standardDeviation: 0.20,
      seed: 54321
    };

    render(<RiskAssessment phase="savings" config={customConfig} />);
    
    // Component should render with the custom configuration
    expect(screen.getByText(/Risikobewertung - Ansparphase/)).toBeInTheDocument();
  });

  test('calculates risk metrics from simulation data', () => {
    render(<RiskAssessment phase="savings" />);
    
    // Should display numerical risk values (even if we can't predict exact values)
    const valueAtRiskElements = screen.getAllByText(/%$/);
    expect(valueAtRiskElements.length).toBeGreaterThan(0);
  });

  test('shows drawdown analysis when sufficient data available', () => {
    render(<RiskAssessment phase="savings" />);
    
    // Should include drawdown analysis section
    expect(screen.getAllByText(/Drawdown-Analyse/)[0]).toBeInTheDocument();
  });

  test('adapts phase-specific configuration', () => {
    // Test savings phase
    const { rerender } = render(<RiskAssessment phase="savings" />);
    expect(screen.getAllByText(/Ansparphase/)[0]).toBeInTheDocument();
    
    // Test withdrawal phase
    rerender(<RiskAssessment phase="withdrawal" />);
    expect(screen.getAllByText(/Entnahmephase/)[0]).toBeInTheDocument();
  });

  test('handles edge case with minimal data', () => {
    const minimalData = {
      sparplanElements: [
        {
          simulation: {
            2020: { endkapital: 100000 }
          }
        }
      ]
    };

    vi.mocked(useSimulation).mockReturnValue({
      simulationData: minimalData,
      averageReturn: 7,
      standardDeviation: 15,
      randomSeed: 12345
    } as any);

    render(<RiskAssessment phase="savings" />);
    
    // Should still render the component structure
    expect(screen.getByText(/Risikobewertung - Ansparphase/)).toBeInTheDocument();
  });
});