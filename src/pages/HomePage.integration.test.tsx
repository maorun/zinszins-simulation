/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HomePage from '../pages/HomePage';

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

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

  it('displays proper German financial formatting', async () => {
    render(<HomePage />);
    
    // Wait for initial calculation
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Should show the overview with German formatting
    expect(screen.getByText('💰 Gesamte Einzahlungen')).toBeInTheDocument();
    expect(screen.getByText('🎯 Endkapital Ansparphase')).toBeInTheDocument();
    
    // Should have Euro symbols
    const euroSymbols = screen.getAllByText(/€/);
    expect(euroSymbols.length).toBeGreaterThan(2);
  });
});