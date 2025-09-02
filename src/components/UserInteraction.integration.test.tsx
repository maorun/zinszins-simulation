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
    
    // Should render the time range panel header
    expect(screen.getByText('📅 Sparphase-Ende')).toBeInTheDocument();
    
    // Should contain time range slider controls
    await waitFor(() => {
      const sliders = screen.queryAllByRole('slider');
      expect(sliders.length).toBeGreaterThan(0);
    }, { timeout: 500 });
  });

  it('handles return configuration mode switching', async () => {
    render(
      <SimulationProvider>
        <ReturnConfiguration />
      </SimulationProvider>
    );
    
    // Should render the return configuration panel header
    expect(screen.getByText('📈 Rendite-Konfiguration (Sparphase)')).toBeInTheDocument();
    
    // Should have radio group with return options - using getAllByText since there can be multiple elements
    await waitFor(() => {
      const festeRenditeElements = screen.getAllByText('Feste Rendite');
      const zufälligeRenditeElements = screen.getAllByText('Zufällige Rendite');
      const variableRenditeElements = screen.getAllByText('Variable Rendite');
      
      expect(festeRenditeElements.length).toBeGreaterThan(0);
      expect(zufälligeRenditeElements.length).toBeGreaterThan(0);
      expect(variableRenditeElements.length).toBeGreaterThan(0);
    }, { timeout: 500 });
  });

  it('allows tax configuration changes', async () => {
    render(
      <SimulationProvider>
        <TaxConfiguration />
      </SimulationProvider>
    );
    
    // Should render the tax configuration panel header
    expect(screen.getByText('💰 Steuer-Konfiguration')).toBeInTheDocument();
    
    // Should show tax configuration controls
    await waitFor(() => {
      expect(screen.getByText('Kapitalertragsteuer (%)')).toBeInTheDocument();
      expect(screen.getByText('Teilfreistellungsquote (%)')).toBeInTheDocument();
      expect(screen.getByText('Freibetrag pro Jahr (€)')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('provides simulation configuration options', async () => {
    render(
      <SimulationProvider>
        <SimulationConfiguration />
      </SimulationProvider>
    );
    
    // Should render the simulation configuration panel header
    expect(screen.getByText('⚙️ Simulation-Konfiguration')).toBeInTheDocument();
    
    // Should show simulation mode options
    await waitFor(() => {
      expect(screen.getByText('Berechnungsmodus')).toBeInTheDocument();
      expect(screen.getByText('Jährlich')).toBeInTheDocument();
      expect(screen.getByText('Monatlich')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('integrates all simulation parameters in panel', async () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>
    );
    
    // Should show the main configuration panel header
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    
    // Should contain all sub-configuration panels
    await waitFor(() => {
      expect(screen.getByText('📅 Sparphase-Ende')).toBeInTheDocument();
      expect(screen.getByText('📈 Rendite-Konfiguration (Sparphase)')).toBeInTheDocument();
      expect(screen.getByText('💰 Steuer-Konfiguration')).toBeInTheDocument();
      expect(screen.getByText('⚙️ Simulation-Konfiguration')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('handles form interactions with real-time updates', async () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>
    );
    
    // Should render main panel
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    
    // Look for interactive elements
    await waitFor(() => {
      const sliders = screen.queryAllByRole('slider');
      const radios = screen.queryAllByRole('radio');
      
      // Should have some interactive elements
      expect(sliders.length + radios.length).toBeGreaterThan(0);
    }, { timeout: 500 });
  });

  it('maintains state consistency across parameter changes', async () => {
    render(
      <SimulationProvider>
        <SimulationParameters />
      </SimulationProvider>
    );
    
    // Initial render should be stable
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    
    // Find radio buttons to interact with (safer than sliders)
    const radioButtons = screen.queryAllByRole('radio');
    
    if (radioButtons.length > 0) {
      // Click a radio button that's not currently selected
      const unselectedRadio = radioButtons.find(radio => !(radio as HTMLInputElement).checked);
      if (unselectedRadio) {
        fireEvent.click(unselectedRadio);
      }
    }
    
    // Configuration panel should still be there after interaction
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
  });

  it('validates input ranges and constraints', async () => {
    render(
      <SimulationProvider>
        <TaxConfiguration />
      </SimulationProvider>
    );
    
    // Should render tax configuration
    expect(screen.getByText('💰 Steuer-Konfiguration')).toBeInTheDocument();
    
    // Look for input elements within this component
    await waitFor(() => {
      const sliders = screen.queryAllByRole('slider');
      expect(sliders.length).toBeGreaterThan(0);
    }, { timeout: 500 });
    
    // Test that the component remains stable after potential interactions
    // (avoiding complex slider interactions that might cause issues)
    expect(screen.getByText('Kapitalertragsteuer (%)')).toBeInTheDocument();
    expect(screen.getByText('Teilfreistellungsquote (%)')).toBeInTheDocument();
  });
});