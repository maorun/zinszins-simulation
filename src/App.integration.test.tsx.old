/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

// Mock Vercel Analytics to avoid network calls in tests
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

// Mock expensive simulation functions to prevent hanging
vi.mock('./utils/simulate', () => ({
  SimulationAnnual: {
    yearly: 'yearly',
    monthly: 'monthly',
  },
  simulate: vi.fn(() => [{
    start: "2023-01-01",
    type: "sparplan",
    einzahlung: 24000,
    simulation: {
      2023: {
        startkapital: 0,
        zinsen: 1200,
        endkapital: 25200,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
        terCosts: 0,
        transactionCosts: 0,
        totalCosts: 0
      },
      2040: {
        startkapital: 596168.79,
        zinsen: 29808.44,
        endkapital: 625977.23,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
        terCosts: 0,
        transactionCosts: 0,
        totalCosts: 0
      }
    }
  }])
}));

// Mock enhanced summary to prevent expensive calculations
vi.mock('./utils/enhanced-summary', () => ({
  getEnhancedOverviewSummary: vi.fn(() => ({
    startkapital: 408000,
    endkapital: 596168.79,
    zinsen: 188168.79,
    bezahlteSteuer: 0,
    renditeAnsparphase: 4.6,
    endkapitalEntspharphase: undefined,
    monatlicheAuszahlung: undefined,
    renditeEntspharphase: undefined,
    jahreEntspharphase: undefined
  }))
}));

describe('App Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('loads the application with default values and basic functionality', async () => {
    render(<App />);
    
    // Check that the main page loads
    expect(screen.getByText('💼 Zinseszins-Simulation')).toBeInTheDocument();
    expect(screen.getByText('🔄 Neu berechnen')).toBeInTheDocument();
    
    // Check that main sections are present
    expect(screen.getByText('⚙️ Konfiguration')).toBeInTheDocument();
    expect(screen.getByText('💾 Konfiguration verwalten')).toBeInTheDocument();
    
    // Check tabs are present
    expect(screen.getByText('Ansparen')).toBeInTheDocument();
    expect(screen.getByText('Entnehmen')).toBeInTheDocument();
  });

  it('displays the enhanced overview with default calculation results', async () => {
    render(<App />);
    
    // Wait for simulation to complete and results to be displayed
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Check that financial overview sections are displayed
    expect(screen.getByText(/📈 Ansparphase/)).toBeInTheDocument();
    expect(screen.getByText('💰 Gesamte Einzahlungen')).toBeInTheDocument();
    expect(screen.getByText('🎯 Endkapital Ansparphase')).toBeInTheDocument();
    expect(screen.getByText('📊 Gesamtzinsen Ansparphase')).toBeInTheDocument();
    expect(screen.getByText('📈 Rendite Ansparphase')).toBeInTheDocument();
  });

  it('allows expanding and collapsing configuration sections', async () => {
    render(<App />);
    
    // Find and click the configuration panel
    const configPanel = screen.getByText('⚙️ Konfiguration');
    expect(configPanel).toBeInTheDocument();
    
    // The panel should be collapsible - check if we can interact with it
    fireEvent.click(configPanel);
    
    // Wait a bit for any animations
    await waitFor(() => {
      // Check if configuration subsections are visible or hidden
      const timeRange = screen.queryByText('Zeitspanne');
      const returnConfig = screen.queryByText('Rendite-Konfiguration');
      
      // At least one of these should be present when expanded
      expect(timeRange || returnConfig).toBeTruthy();
    }, { timeout: 500 });
  });

  it('handles the "Neu berechnen" button correctly', async () => {
    render(<App />);
    
    const recalculateButton = screen.getByText('🔄 Neu berechnen');
    expect(recalculateButton).toBeInTheDocument();
    
    // Click the recalculate button
    fireEvent.click(recalculateButton);
    
    // Should still show the financial overview after recalculation
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 500 });
  });

  it('switches between Ansparen and Entnehmen tabs', async () => {
    render(<App />);
    
    // Initially should be on Ansparen tab
    const ansparenTab = screen.getByText('Ansparen');
    const entnehmenTab = screen.getByText('Entnehmen');
    
    expect(ansparenTab).toBeInTheDocument();
    expect(entnehmenTab).toBeInTheDocument();
    
    // Click on Entnehmen tab
    fireEvent.click(entnehmenTab);
    
    // Should now show withdrawal-related content
    await waitFor(() => {
      // Look for withdrawal-specific content
      const withdrawalContent = screen.queryByText(/Entnahme/) || screen.queryByText(/Auszahlung/);
      expect(withdrawalContent).toBeTruthy();
    }, { timeout: 500 });
    
    // Click back on Ansparen tab
    fireEvent.click(ansparenTab);
    
    // Should show savings-related content again
    await waitFor(() => {
      const savingsContent = screen.queryByText(/Sparplan/) || screen.queryByText(/Einzahlung/);
      expect(savingsContent).toBeTruthy();
    }, { timeout: 500 });
  });
});