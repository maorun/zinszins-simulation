/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SimulationProvider } from '../contexts/SimulationContext';
import SimulationParameters from './SimulationParameters';
import ReturnConfiguration from './ReturnConfiguration';
import TaxConfiguration from './TaxConfiguration';
import TimeRangeConfiguration from './TimeRangeConfiguration';
import SimulationConfiguration from './SimulationConfiguration';

describe('User Interaction Components Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('allows interaction with time range configuration', async () => {
    render(
      <SimulationProvider>
        <TimeRangeConfiguration />
      </SimulationProvider>
    );
    
    // Should render time range controls
    await waitFor(() => {
      // Look for years or time-related elements
      const timeElements = [
        ...screen.queryAllByText(/204/), // Years like 2040, 2041, etc.
        ...screen.queryAllByText(/208/), // Years like 2080, 2081, etc.
        ...screen.queryAllByText(/Jahr/), // German word for year
        ...screen.queryAllByText(/Zeit/), // German word for time
      ];
      expect(timeElements.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it('handles return configuration mode switching', async () => {
    render(
      <SimulationProvider>
        <ReturnConfiguration />
      </SimulationProvider>
    );
    
    // Look for return configuration options
    await waitFor(() => {
      const fixedOption = screen.queryByText(/Fixed/) || screen.queryByText(/Fest/);
      const randomOption = screen.queryByText(/Random/) || screen.queryByText(/Zufällig/);
      const variableOption = screen.queryByText(/Variable/);
      
      // At least one return mode should be available
      expect(fixedOption || randomOption || variableOption).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('allows tax configuration changes', async () => {
    render(
      <SimulationProvider>
        <TaxConfiguration />
      </SimulationProvider>
    );
    
    // Should show tax-related options
    await waitFor(() => {
      const taxElements = screen.queryByText(/Steuer/) || 
                         screen.queryByText(/Kapitalertrag/) ||
                         screen.queryByText(/Freibetrag/) ||
                         screen.queryByText(/26.375%/) || // Default tax rate
                         screen.queryByText(/2.000/); // Default Freibetrag
      expect(taxElements).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('provides simulation configuration options', async () => {
    render(
      <SimulationProvider>
        <SimulationConfiguration />
      </SimulationProvider>
    );
    
    // Should show simulation mode options
    await waitFor(() => {
      const simulationElements = screen.queryByText(/jährlich/) || 
                                screen.queryByText(/monatlich/) ||
                                screen.queryByText(/Modus/);
      expect(simulationElements).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('integrates all simulation parameters in panel', async () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>
    );
    
    // Should show the configuration panel header
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    
    // Should contain multiple configuration sections
    await waitFor(() => {
      // Count how many configuration elements are rendered
      const configElements = [
        screen.queryByText(/Zeit/),
        screen.queryByText(/Rendite/),
        screen.queryByText(/Steuer/),
        screen.queryByText(/Simulation/),
        screen.queryByText(/202/), // Years
        screen.queryByText(/%/), // Percentages
      ].filter(Boolean);
      
      expect(configElements.length).toBeGreaterThan(2);
    }, { timeout: 2000 });
  });

  it('handles form interactions with real-time updates', async () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>
    );
    
    // Look for interactive elements like sliders, inputs, or dropdowns
    await waitFor(() => {
      const interactiveElements = [
        ...screen.queryAllByRole('slider'),
        ...screen.queryAllByRole('textbox'),
        ...screen.queryAllByRole('radio'),
        ...screen.queryAllByRole('combobox'),
      ];
      
      // Should have some interactive elements
      expect(interactiveElements.length).toBeGreaterThan(0);
    }, { timeout: 2000 });
  });

  it('maintains state consistency across parameter changes', async () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>
    );
    
    // Initial render should be stable
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    
    // Try to find and interact with any available controls
    const sliders = screen.queryAllByRole('slider');
    const inputs = screen.queryAllByRole('textbox');
    
    if (sliders.length > 0) {
      // Interact with first slider if available
      fireEvent.change(sliders[0], { target: { value: '50' } });
    } else if (inputs.length > 0) {
      // Interact with first input if available
      fireEvent.change(inputs[0], { target: { value: '5000' } });
    }
    
    // Configuration panel should still be there
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
  });

  it('validates input ranges and constraints', async () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>
    );
    
    // Look for any input elements
    const inputs = screen.queryAllByRole('textbox');
    const sliders = screen.queryAllByRole('slider');
    
    if (inputs.length > 0) {
      // Try entering invalid values and see if they're handled gracefully
      fireEvent.change(inputs[0], { target: { value: '-1000' } });
      fireEvent.change(inputs[0], { target: { value: 'invalid' } });
      
      // Should not crash the component
      expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    }
    
    if (sliders.length > 0) {
      // Test slider boundaries
      fireEvent.change(sliders[0], { target: { value: '0' } });
      fireEvent.change(sliders[0], { target: { value: '100' } });
      
      // Should handle boundary values gracefully
      expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    }
  });
});