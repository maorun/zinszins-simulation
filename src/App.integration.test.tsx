/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';

// Mock Vercel Analytics to avoid network calls in tests
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
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
    }, { timeout: 5000 });
    
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
    }, { timeout: 1000 });
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
    }, { timeout: 5000 });
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
    }, { timeout: 2000 });
    
    // Click back on Ansparen tab
    fireEvent.click(ansparenTab);
    
    // Should show savings-related content again
    await waitFor(() => {
      const savingsContent = screen.queryByText(/Sparplan/) || screen.queryByText(/Einzahlung/);
      expect(savingsContent).toBeTruthy();
    }, { timeout: 2000 });
  });

  it('maintains consistent state across component interactions', async () => {
    render(<App />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Get initial overview values by checking if they're displayed
    const initialOverview = screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte');
    expect(initialOverview).toBeInTheDocument();
    
    // Switch tabs and come back
    const entnehmenTab = screen.getByText('Entnehmen');
    fireEvent.click(entnehmenTab);
    
    const ansparenTab = screen.getByText('Ansparen');
    fireEvent.click(ansparenTab);
    
    // Overview should still be there
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('handles configuration management functionality', async () => {
    render(<App />);
    
    // Expand configuration management section
    const configMgmtHeader = screen.getByText('💾 Konfiguration verwalten');
    fireEvent.click(configMgmtHeader);
    
    // Should show automatic saving message
    await waitFor(() => {
      expect(screen.getByText(/Automatisches Speichern/)).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Should show status message about configuration
    const statusMessage = screen.queryByText(/Gespeicherte Konfiguration/) || 
                         screen.queryByText(/Keine gespeicherte Konfiguration/);
    expect(statusMessage).toBeTruthy();
  });

  it('renders footer information correctly', async () => {
    render(<App />);
    
    // Check footer elements
    expect(screen.getByText('💼 Zinseszins-Simulation')).toBeInTheDocument();
    expect(screen.getByText('📧 by Marco')).toBeInTheDocument();
    expect(screen.getByText('🚀 Erstellt mit React, TypeScript & RSuite')).toBeInTheDocument();
  });
});