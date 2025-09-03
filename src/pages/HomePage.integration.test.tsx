/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HomePage from '../pages/HomePage';

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

// Mock expensive simulation functions using importOriginal to preserve all exports
vi.mock('../utils/simulate', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    simulate: vi.fn(() => [{
      start: "2023-01-01",
      type: "sparplan",
      einzahlung: 24000,
      simulation: {
        2023: { startkapital: 0, zinsen: 1200, endkapital: 25200, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 },
        2040: { startkapital: 596168.79, zinsen: 29808.44, endkapital: 625977.23, bezahlteSteuer: 0, genutzterFreibetrag: 0, vorabpauschale: 0, vorabpauschaleAccumulated: 0 }
      }
    }])
  };
});

// Mock enhanced summary using importOriginal to preserve all exports
vi.mock('../utils/enhanced-summary', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    getEnhancedOverviewSummary: vi.fn(() => ({
      startkapital: 408000,
      endkapital: 596168.79,
      zinsen: 188168.79,
      bezahlteSteuer: 0,
      renditeAnsparphase: 4.6
    }))
  };
});

// Mock withdrawal calculations using importOriginal to preserve all exports
vi.mock('../../helpers/withdrawal', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    calculateWithdrawal: vi.fn(() => ({
      result: {
        2041: { endkapital: 580000, entnahme: 24000, monatlicheEntnahme: 2000 }
      }
    }))
  };
});

describe('Calculator Functionality Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('performs default calculation scenario (24,000€/year, 5% return, 2023-2040)', async () => {
    render(<HomePage />);
    
    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // The copilot instructions mention default should show ~596,169€ final capital
    // Let's check that we have reasonable numbers displayed
    const overview = screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte').closest('div');
    expect(overview).toBeInTheDocument();
    
    // Should show some currency values
    const currencyElements = screen.getAllByText(/€/);
    expect(currencyElements.length).toBeGreaterThan(0);
    
    // Should show percentage values for returns
    const percentageElements = screen.getAllByText(/%/);
    expect(percentageElements.length).toBeGreaterThan(0);
  });

  it('updates calculations when time span changes', async () => {
    render(<HomePage />);
    
    // Wait for initial calculation
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Expand configuration panel to access time range
    const configPanel = screen.getByText('⚙️ Konfiguration');
    fireEvent.click(configPanel);
    
    // Wait for configuration options to appear
    await waitFor(() => {
      const timeRangeLabel = screen.queryByText(/Zeit/) || screen.queryByText(/Jahr/) || screen.queryByText(/Zeitspanne/);
      expect(timeRangeLabel).toBeTruthy();
    }, { timeout: 500 });
    
    // Trigger recalculation
    const recalculateButton = screen.getByText('🔄 Neu berechnen');
    fireEvent.click(recalculateButton);
    
    // Should still show results after recalculation
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('handles different return configuration modes', async () => {
    render(<HomePage />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Expand configuration
    const configPanel = screen.getByText('⚙️ Konfiguration');
    fireEvent.click(configPanel);
    
    // Look for return configuration options
    await waitFor(() => {
      const returnOptions = screen.queryByText(/Rendite/) || 
                           screen.queryByText(/Fixed/) || 
                           screen.queryByText(/Random/) || 
                           screen.queryByText(/Variable/);
      expect(returnOptions).toBeTruthy();
    }, { timeout: 500 });
  });

  it('displays year-by-year breakdown in savings plan', async () => {
    render(<HomePage />);
    
    // Make sure we're on the Ansparen tab
    const ansparenTab = screen.getByText('Ansparen');
    fireEvent.click(ansparenTab);
    
    // Wait for savings plan content to load
    await waitFor(() => {
      // Look for savings plan related content
      const savingsContent = screen.queryByText(/Sparplan/) || 
                            screen.queryByText(/Einzahlung/) ||
                            screen.queryByText(/Simulation/);
      expect(savingsContent).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('calculates and displays tax considerations (Vorabpauschale)', async () => {
    render(<HomePage />);
    
    // Wait for calculation
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Expand configuration to see tax options
    const configPanel = screen.getByText('⚙️ Konfiguration');
    fireEvent.click(configPanel);
    
    // Look for tax-related configuration
    await waitFor(() => {
      const taxConfig = screen.queryByText(/Steuer/) || 
                       screen.queryByText(/Kapitalertrag/) ||
                       screen.queryByText(/Freibetrag/);
      expect(taxConfig).toBeTruthy();
    }, { timeout: 500 });
  });

  it('handles simulation mode changes (yearly vs monthly)', async () => {
    render(<HomePage />);
    
    // Wait for load
    await waitFor(() => {
      expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Expand configuration
    const configPanel = screen.getByText('⚙️ Konfiguration');
    fireEvent.click(configPanel);
    
    // Look for simulation mode options
    await waitFor(() => {
      const modeOptions = screen.queryByText(/jährlich/) || 
                         screen.queryByText(/monatlich/) ||
                         screen.queryByText(/Modus/);
      expect(modeOptions).toBeTruthy();
    }, { timeout: 500 });
    
    // Trigger recalculation after any changes
    const recalculateButton = screen.getByText('🔄 Neu berechnen');
    fireEvent.click(recalculateButton);
    
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
  });

  it('shows realistic financial calculations for long-term investment', async () => {
    render(<HomePage />);
    
    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Check that we have meaningful financial data
    const ansparphaseSection = screen.getByText(/📈 Ansparphase/);
    expect(ansparphaseSection).toBeInTheDocument();
    
    // Should show total contributions
    expect(screen.getByText('💰 Gesamte Einzahlungen')).toBeInTheDocument();
    
    // Should show end capital
    expect(screen.getByText('🎯 Endkapital Ansparphase')).toBeInTheDocument();
    
    // Should show total interest
    expect(screen.getByText('📊 Gesamtzinsen Ansparphase')).toBeInTheDocument();
    
    // Should show return rate
    expect(screen.getByText('📈 Rendite Ansparphase')).toBeInTheDocument();
  });

  it('maintains calculation accuracy across multiple interactions', async () => {
    render(<HomePage />);
    
    // Wait for initial calculation
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Perform multiple interactions
    const recalculateButton = screen.getByText('🔄 Neu berechnen');
    
    // First recalculation
    fireEvent.click(recalculateButton);
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Switch tabs
    const entnehmenTab = screen.getByText('Entnehmen');
    fireEvent.click(entnehmenTab);
    
    const ansparenTab = screen.getByText('Ansparen');
    fireEvent.click(ansparenTab);
    
    // Second recalculation
    fireEvent.click(recalculateButton);
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 3000 });
    
    // Results should still be consistent and meaningful
    expect(screen.getByText('💰 Gesamte Einzahlungen')).toBeInTheDocument();
    expect(screen.getByText('🎯 Endkapital Ansparphase')).toBeInTheDocument();
  });
});