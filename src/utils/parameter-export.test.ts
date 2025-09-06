/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { formatParametersForExport, copyParametersToClipboard } from './parameter-export';
import type { SimulationContextState } from '../contexts/SimulationContext';

// Mock the navigator.clipboard API
const mockClipboard = {
  writeText: vi.fn(),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe('Parameter Export', () => {
  let mockContext: SimulationContextState;

  beforeEach(() => {
    mockClipboard.writeText.mockReset();
    
    // Create a minimal mock context with required properties
    mockContext = {
      rendite: 5.0,
      steuerlast: 26.375,
      teilfreistellungsquote: 30.0,
      freibetragPerYear: { 2023: 2000 },
      steuerReduzierenEndkapitalSparphase: true,
      steuerReduzierenEndkapitalEntspharphase: false,
      returnMode: 'fixed' as const,
      averageReturn: 7.0,
      standardDeviation: 15.0,
      variableReturns: {},
      startEnd: [2023, 2040] as [number, number],
      sparplan: [],
      simulationAnnual: 'yearly' as const,
      withdrawalConfig: null,
      // Mock functions (not used in formatting)
      setRendite: vi.fn(),
      setSteuerlast: vi.fn(),
      setTeilfreistellungsquote: vi.fn(),
      setFreibetragPerYear: vi.fn(),
      setSteuerReduzierenEndkapitalSparphase: vi.fn(),
      setSteuerReduzierenEndkapitalEntspharphase: vi.fn(),
      setReturnMode: vi.fn(),
      setAverageReturn: vi.fn(),
      setStandardDeviation: vi.fn(),
      setRandomSeed: vi.fn(),
      setVariableReturns: vi.fn(),
      setStartEnd: vi.fn(),
      setSparplan: vi.fn(),
      setSimulationAnnual: vi.fn(),
      setSparplanElemente: vi.fn(),
      setWithdrawalResults: vi.fn(),
      performSimulation: vi.fn(),
      saveCurrentConfiguration: vi.fn(),
      loadSavedConfiguration: vi.fn(),
      resetToDefaults: vi.fn(),
      setWithdrawalConfig: vi.fn(),
      sparplanElemente: [],
      simulationData: {},
      isLoading: false,
      withdrawalResults: null,
    } as any;
  });

  describe('formatParametersForExport', () => {
    it('should format basic financial parameters correctly', () => {
      const result = formatParametersForExport(mockContext);
      
      expect(result).toContain('Rendite: 5.00 %');
      expect(result).toContain('Kapitalertragsteuer: 26.38 %');
      expect(result).toContain('Teilfreistellungsquote: 30.00 %');
    });

    it('should format time range and simulation settings', () => {
      const result = formatParametersForExport(mockContext);
      
      expect(result).toContain('Zeitraum: 2023 - 2040');
      expect(result).toContain('Simulationsmodus: Jährlich');
      expect(result).toContain('Rendite-Modus: Fest');
    });

    it('should format tax allowances with Euro currency', () => {
      const result = formatParametersForExport(mockContext);
      
      expect(result).toContain('Freibeträge pro Jahr:');
      expect(result).toContain('  2023: 2.000,00 €');
    });

    it('should handle context without optional configurations', () => {
      mockContext.freibetragPerYear = {};
      mockContext.sparplan = [];
      mockContext.withdrawalConfig = null;
      
      const result = formatParametersForExport(mockContext);
      
      expect(result).toContain('Rendite: 5.00 %');
      expect(result).not.toContain('Freibeträge pro Jahr:');
      expect(result).not.toContain('Sparpläne:');
      expect(result).not.toContain('Entnahme-Konfiguration:');
    });
  });

  describe('copyParametersToClipboard', () => {
    it('should successfully copy parameters to clipboard', async () => {
      mockClipboard.writeText.mockResolvedValue(undefined);
      
      const result = await copyParametersToClipboard(mockContext);
      
      expect(result).toBe(true);
      expect(mockClipboard.writeText).toHaveBeenCalledOnce();
    });

    it('should handle clipboard errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockClipboard.writeText.mockRejectedValue(new Error('Clipboard access denied'));
      
      const result = await copyParametersToClipboard(mockContext);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to copy parameters to clipboard:',
        expect.any(Error)
      );
      
      consoleErrorSpy.mockRestore();
    });
  });
});