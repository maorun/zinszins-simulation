/// <reference types="@testing-library/jest-dom" />
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SimulationProvider } from '../contexts/SimulationContext';
import { useSimulation } from '../contexts/useSimulation';

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

// Simple test component to access simulation context
const TestContextComponent = () => {
  const simulationContext = useSimulation();
  
  return (
    <div data-testid="test-context">
      <div data-testid="start-year">{simulationContext.startEnd[0]}</div>
      <div data-testid="end-year">{simulationContext.startEnd[1]}</div>
    </div>
  );
};

describe('Simulation Context Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides simulation context', () => {
    render(
      <SimulationProvider>
        <TestContextComponent />
      </SimulationProvider>
    );
    
    // Check that context data is provided
    expect(screen.getByTestId('test-context')).toBeInTheDocument();
    expect(screen.getByTestId('start-year')).toBeInTheDocument();
    expect(screen.getByTestId('end-year')).toBeInTheDocument();
  });
});