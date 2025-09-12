import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useWithdrawalConfig } from './useWithdrawalConfig';
import { SimulationProvider } from '../contexts/SimulationContext';
import type { SegmentedComparisonStrategy } from '../utils/config-storage';

// Mock the simulation context
const mockSetWithdrawalConfig = vi.fn();
vi.mock('../contexts/useSimulation', () => ({
  useSimulation: () => ({
    withdrawalConfig: null,
    setWithdrawalConfig: mockSetWithdrawalConfig,
  }),
}));

describe('useWithdrawalConfig', () => {
  beforeEach(() => {
    mockSetWithdrawalConfig.mockClear();
  });

  it('creates default configuration when none exists', () => {
    const { result } = renderHook(() => useWithdrawalConfig(2023), {
      wrapper: SimulationProvider,
    });

    expect(result.current.currentConfig).toBeDefined();
    // endOfLife is now managed globally, not in formValue
    expect(result.current.currentConfig.formValue.strategie).toBe("4prozent");
    expect(result.current.currentConfig.formValue.rendite).toBe(5);
  });

  it('provides update functions', () => {
    const { result } = renderHook(() => useWithdrawalConfig(2023), {
      wrapper: SimulationProvider,
    });

    expect(typeof result.current.updateConfig).toBe('function');
    expect(typeof result.current.updateFormValue).toBe('function');
    expect(typeof result.current.updateComparisonStrategy).toBe('function');
    expect(typeof result.current.updateSegmentedComparisonStrategy).toBe('function');
    expect(typeof result.current.addSegmentedComparisonStrategy).toBe('function');
    expect(typeof result.current.removeSegmentedComparisonStrategy).toBe('function');
  });

  it('creates default comparison strategies', () => {
    const { result } = renderHook(() => useWithdrawalConfig(2023), {
      wrapper: SimulationProvider,
    });

    expect(result.current.currentConfig.comparisonStrategies).toHaveLength(3);
    expect(result.current.currentConfig.comparisonStrategies[0].name).toBe("3% Regel");
    expect(result.current.currentConfig.comparisonStrategies[1].name).toBe("Monatlich 1.500€");
    expect(result.current.currentConfig.comparisonStrategies[2].name).toBe("Drei-Eimer 15k€");
  });

  it('creates default withdrawal segments', () => {
    const { result } = renderHook(() => useWithdrawalConfig(2023), {
      wrapper: SimulationProvider,
    });

    expect(result.current.currentConfig.withdrawalSegments).toHaveLength(1);
    expect(result.current.currentConfig.withdrawalSegments[0].name).toBe("Hauptphase");
  });

  it('sets default values correctly', () => {
    const { result } = renderHook(() => useWithdrawalConfig(2023), {
      wrapper: SimulationProvider,
    });

    const config = result.current.currentConfig;
    expect(config.withdrawalReturnMode).toBe("fixed");
    expect(config.withdrawalAverageReturn).toBe(5);
    expect(config.withdrawalStandardDeviation).toBe(12);
    expect(config.useSegmentedWithdrawal).toBe(false);
    expect(config.useComparisonMode).toBe(false);
    expect(config.useSegmentedComparisonMode).toBe(false);
    expect(config.segmentedComparisonStrategies).toEqual([]);
  });

  describe('segmented comparison strategies', () => {
    it('can add a segmented comparison strategy', () => {
      const { result } = renderHook(() => useWithdrawalConfig(2023), {
        wrapper: SimulationProvider,
      });

      const testStrategy: SegmentedComparisonStrategy = {
        id: 'test-strategy',
        name: 'Test Strategy',
        segments: [
          {
            id: 'segment-1',
            name: 'Test Segment',
            startYear: 2024,
            endYear: 2040,
            strategy: '4prozent',
            withdrawalFrequency: 'yearly',
            returnConfig: {
              mode: 'fixed',
              fixedRate: 0.05,
            },
            inflationConfig: {
              inflationRate: 0.02,
            },
            enableGrundfreibetrag: false,
            incomeTaxRate: 0.18,
            steuerReduzierenEndkapital: true,
          },
        ],
      };

      act(() => {
        result.current.addSegmentedComparisonStrategy(testStrategy);
      });

      // Check that the function was called (since we're mocking the context)
      expect(mockSetWithdrawalConfig).toHaveBeenCalled();
      const lastCall = mockSetWithdrawalConfig.mock.calls[mockSetWithdrawalConfig.mock.calls.length - 1];
      expect(lastCall[0]).toEqual(
        expect.objectContaining({
          segmentedComparisonStrategies: [testStrategy],
        }),
      );
    });

    it('can update a segmented comparison strategy', () => {
      const { result } = renderHook(() => useWithdrawalConfig(2023), {
        wrapper: SimulationProvider,
      });

      // Mock that we have an existing strategy
      mockSetWithdrawalConfig.mockImplementation((_newConfig) => {
        // For testing purposes, we don't actually update the state
        // but we can verify the call was made correctly
      });

      act(() => {
        result.current.updateSegmentedComparisonStrategy('test-strategy', {
          name: 'Updated Name',
        });
      });

      expect(mockSetWithdrawalConfig).toHaveBeenCalled();
    });

    it('can remove a segmented comparison strategy', () => {
      const { result } = renderHook(() => useWithdrawalConfig(2023), {
        wrapper: SimulationProvider,
      });

      act(() => {
        result.current.removeSegmentedComparisonStrategy('test-strategy');
      });

      expect(mockSetWithdrawalConfig).toHaveBeenCalled();
    });

    it('handles undefined segmentedComparisonStrategies gracefully', () => {
      const { result } = renderHook(() => useWithdrawalConfig(2023), {
        wrapper: SimulationProvider,
      });

      // These operations should not throw even if the array is undefined
      expect(() => {
        act(() => {
          result.current.updateSegmentedComparisonStrategy('non-existent', { name: 'Updated' });
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.removeSegmentedComparisonStrategy('non-existent');
        });
      }).not.toThrow();

      // Both calls should have been made
      expect(mockSetWithdrawalConfig).toHaveBeenCalledTimes(2);
    });

    it('helper functions exist and are callable', () => {
      const { result } = renderHook(() => useWithdrawalConfig(2023), {
        wrapper: SimulationProvider,
      });

      // Test that all helper functions exist
      expect(typeof result.current.addSegmentedComparisonStrategy).toBe('function');
      expect(typeof result.current.updateSegmentedComparisonStrategy).toBe('function');
      expect(typeof result.current.removeSegmentedComparisonStrategy).toBe('function');

      // Test that they can be called without errors
      expect(() => {
        act(() => {
          result.current.addSegmentedComparisonStrategy({
            id: 'test',
            name: 'Test',
            segments: [],
          });
        });
      }).not.toThrow();
    });
  });
});