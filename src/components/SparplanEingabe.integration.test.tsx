import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SimulationProvider } from '../contexts/SimulationContext';
import SavingsPlan from './SavingsPlan';
import type { SavedConfiguration } from '../utils/config-storage';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe('SparplanEingabe localStorage integration', () => {
  let localStorageMock: { [key: string]: string } = {};

  beforeEach(() => {
    // Mock localStorage
    localStorageMock = {};
    global.Storage.prototype.getItem = vi.fn((key: string) => localStorageMock[key] || null);
    global.Storage.prototype.setItem = vi.fn((key: string, value: string) => {
      localStorageMock[key] = value;
    });
    global.Storage.prototype.removeItem = vi.fn((key: string) => {
      delete localStorageMock[key];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should load sparplans from localStorage on initialization', async () => {
    // Set up localStorage with saved sparplans
    const savedConfig: SavedConfiguration = {
      rendite: 5,
      steuerlast: 26.375,
      teilfreistellungsquote: 30,
      freibetragPerYear: { 2023: 2000 },
      returnMode: 'fixed',
      averageReturn: 7,
      standardDeviation: 15,
      variableReturns: {},
      startEnd: [2040, 2080],
      simulationAnnual: 'yearly',
      sparplan: [
        {
          id: 1,
          start: new Date('2024-01-01'),
          end: new Date('2035-12-31'),
          einzahlung: 30000,
        },
        {
          id: 2,
          start: new Date('2025-01-01'),
          end: null,
          einzahlung: 15000,
        }
      ]
    };

    localStorageMock['zinszins-simulation-config'] = JSON.stringify({
      version: 1,
      timestamp: new Date().toISOString(),
      config: savedConfig
    });

    render(
      <SimulationProvider>
        <SavingsPlan />
      </SimulationProvider>
    );

    // Expand the sparplan section
    const sparplanTrigger = screen.getByText('💼 Sparpläne erstellen');
    fireEvent.click(sparplanTrigger);

    await waitFor(() => {
      // Should show the saved sparplans, not the default one
      expect(screen.getByText(/30\.000,00 €/)).toBeInTheDocument();
      expect(screen.getByText(/15\.000,00 €/)).toBeInTheDocument();
      // Should NOT show the default sparplan amount
      expect(screen.queryByText(/19\.800,00 €/)).not.toBeInTheDocument();
    });
  });

  it('should start with default sparplan when no localStorage data exists', async () => {
    // Ensure localStorage is empty
    localStorageMock = {};

    render(
      <SimulationProvider>
        <SavingsPlan />
      </SimulationProvider>
    );

    // Expand the sparplan section
    const sparplanTrigger = screen.getByText('💼 Sparpläne erstellen');
    fireEvent.click(sparplanTrigger);

    await waitFor(() => {
      // Should show the default sparplan
      expect(screen.getByText(/19\.800,00 €/)).toBeInTheDocument();
    });
  });
});