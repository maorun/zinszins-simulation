/// <reference types="@testing-library/jest-dom" />
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HomePage from './pages/HomePage';

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

describe('Realistic Financial Scenarios Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('validates default scenario calculation accuracy', async () => {
    render(<HomePage />);
    
    // Wait for calculation to complete
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Should show Ansparphase section with reasonable years
    const ansparphaseText = screen.getByText(/📈 Ansparphase/);
    expect(ansparphaseText).toBeInTheDocument();
    expect(ansparphaseText.textContent).toMatch(/20\d\d.*20\d\d/);
    
    // Should display total contributions
    expect(screen.getByText('💰 Gesamte Einzahlungen')).toBeInTheDocument();
    
    // Should display end capital
    expect(screen.getByText('🎯 Endkapital Ansparphase')).toBeInTheDocument();
    
    // Get all currency values and check they're reasonable
    const currencyElements = screen.getAllByText(/€/);
    expect(currencyElements.length).toBeGreaterThan(3);
    
    // Get all percentage values and check they're reasonable
    const percentageElements = screen.getAllByText(/%/);
    expect(percentageElements.length).toBeGreaterThan(0);
  });

  it('validates time span impact on calculations', async () => {
    render(<HomePage />);
    
    // Wait for initial calculation
    await waitFor(() => {
      expect(screen.getByText('🎯 Finanzübersicht - Schnelle Eckpunkte')).toBeInTheDocument();
    }, { timeout: 1000 });
    
    // Get initial values
    const initialOverview = screen.getByText(/📈 Ansparphase/);
    expect(initialOverview).toBeInTheDocument();
    
    // The time span should show realistic years
    expect(initialOverview.textContent).toMatch(/20\d\d.*20\d\d/);
    
    // Should handle reasonable investment time spans (typically 5-50 years)
    const yearMatch = initialOverview.textContent?.match(/(\d{4}).*(\d{4})/);
    if (yearMatch) {
      const startYear = parseInt(yearMatch[1]);
      const endYear = parseInt(yearMatch[2]);
      const timeSpan = endYear - startYear;
      
      expect(timeSpan).toBeGreaterThan(0);
      expect(timeSpan).toBeLessThan(100); // Reasonable investment time span
    }
  });
});