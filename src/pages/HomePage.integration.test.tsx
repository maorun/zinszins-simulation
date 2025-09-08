/// <reference types="@testing-library/jest-dom" />
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import HomePage from '../pages/HomePage';

// Mock Vercel Analytics
vi.mock('@vercel/analytics/react', () => ({
  Analytics: () => null,
}));

// Mock all expensive operations to prevent hanging
vi.mock('../utils/simulate', () => ({
  SimulationAnnual: { yearly: 'yearly', monthly: 'monthly' },
  simulate: vi.fn(() => [])
}));

vi.mock('../utils/enhanced-summary', () => ({
  getEnhancedOverviewSummary: vi.fn(() => ({
    startkapital: 408000,
    endkapital: 596168.79,
    zinsen: 188168.79,
    bezahlteSteuer: 0,
    renditeAnsparphase: 4.6
  }))
}));

vi.mock('../../helpers/withdrawal', () => ({
  calculateWithdrawal: vi.fn(() => ({ result: {} })),
  getTotalCapitalAtYear: vi.fn(() => 596168.79),
  calculateWithdrawalDuration: vi.fn(() => 25)
}));

describe('HomePage Integration Tests - Optimized', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the main calculator interface', () => {
    render(<HomePage />);
    
    // Check main tabs
    expect(screen.getByText('Ansparen')).toBeInTheDocument();
    expect(screen.getByText('Entnehmen')).toBeInTheDocument();
    
    // Check that we have the enhanced overview section
    const finanzuebersicht = screen.queryByText(/Finanzübersicht/);
    expect(finanzuebersicht).toBeInTheDocument();
  });

  it('has working tab navigation between Ansparen and Entnehmen', () => {
    render(<HomePage />);
    
    const ansparenTab = screen.getByText('Ansparen');
    const entnehmenTab = screen.getByText('Entnehmen');
    
    // Should have both tabs
    expect(ansparenTab).toBeInTheDocument();
    expect(entnehmenTab).toBeInTheDocument();
    
    // Click on Entnehmen tab - should not crash
    fireEvent.click(entnehmenTab);
    
    // Click back on Ansparen tab - should not crash  
    fireEvent.click(ansparenTab);
  });

  it('displays financial overview when enhanced summary is available', () => {
    render(<HomePage />);
    
    // Should show financial metrics
    const overviewSection = screen.queryByText(/Finanzübersicht/);
    expect(overviewSection).toBeInTheDocument();
    
    // Should show currency formatting
    const currencyElements = screen.getAllByText(/€/);
    expect(currencyElements.length).toBeGreaterThan(0);
    
    // Should show percentage formatting
    const percentageElements = screen.getAllByText(/%/);
    expect(percentageElements.length).toBeGreaterThan(0);
  });

  it('handles simulation configuration without errors', () => {
    const { container } = render(<HomePage />);
    
    // Should render configuration sections without errors
    expect(container).toBeInTheDocument();
    
    // Should have some form elements
    const formElements = container.querySelectorAll('input, select, button');
    expect(formElements.length).toBeGreaterThan(0);
  });

  it('shows year-by-year breakdown simulation table', async () => {
    const user = userEvent.setup();
    const { container } = render(<HomePage />);
    
    // Expand the Sparplan-Verlauf section to see the table by clicking on the heading
    const sparplanVerlaufButton = screen.getByText(/📊 Sparplan-Verlauf/);
    await user.click(sparplanVerlaufButton);
    
    // Should have table or simulation display elements
    const tableElements = container.querySelectorAll('table, .rs-table, .simulation');
    expect(tableElements.length).toBeGreaterThan(0);
  });

  it('displays savings plan creation interface', async () => {
    const user = userEvent.setup();
    const { container } = render(<HomePage />);
    
    // Expand the Sparpläne erstellen section to see the form elements by clicking on the heading
    const sparplanButton = screen.getByText(/💼 Sparpläne erstellen/);
    await user.click(sparplanButton);
    
    // Should have form elements for sparplan configuration
    const inputElements = container.querySelectorAll('input');
    expect(inputElements.length).toBeGreaterThan(0);
  });

  it('renders without performance issues', () => {
    const startTime = Date.now();
    const { container } = render(<HomePage />);
    const endTime = Date.now();
    
    // Should render quickly (under 2 seconds in test environment)
    expect(endTime - startTime).toBeLessThan(2000);
    
    // Should not crash
    expect(container).toBeInTheDocument();
  });
});