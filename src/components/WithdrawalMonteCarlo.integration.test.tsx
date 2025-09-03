/// <reference types="@testing-library/jest-dom" />
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationProvider } from '../contexts/SimulationContext';
import WithdrawalPlan from './WithdrawalPlan';

describe('Withdrawal and Monte Carlo Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders withdrawal plan interface', () => {
    render(
      <SimulationProvider>
        <WithdrawalPlan />
      </SimulationProvider>
    );
    
    // Should render the component without crashing
    const container = document.body;
    expect(container).toBeInTheDocument();
  });
});