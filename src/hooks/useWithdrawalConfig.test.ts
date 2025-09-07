import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useWithdrawalConfig } from './useWithdrawalConfig';
import { SimulationProvider } from '../contexts/SimulationContext';

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
    const { result } = renderHook(() => useWithdrawalConfig(2023, 2040), {
      wrapper: SimulationProvider,
    });

    expect(result.current.currentConfig).toBeDefined();
    expect(result.current.currentConfig.formValue.endOfLife).toBe(2040);
    expect(result.current.currentConfig.formValue.strategie).toBe("4prozent");
    expect(result.current.currentConfig.formValue.rendite).toBe(5);
  });

  it('provides update functions', () => {
    const { result } = renderHook(() => useWithdrawalConfig(2023, 2040), {
      wrapper: SimulationProvider,
    });

    expect(typeof result.current.updateConfig).toBe('function');
    expect(typeof result.current.updateFormValue).toBe('function');
    expect(typeof result.current.updateComparisonStrategy).toBe('function');
  });

  it('creates default comparison strategies', () => {
    const { result } = renderHook(() => useWithdrawalConfig(2023, 2040), {
      wrapper: SimulationProvider,
    });

    expect(result.current.currentConfig.comparisonStrategies).toHaveLength(2);
    expect(result.current.currentConfig.comparisonStrategies[0].name).toBe("3% Regel");
    expect(result.current.currentConfig.comparisonStrategies[1].name).toBe("Monatlich 1.500€");
  });

  it('creates default withdrawal segments', () => {
    const { result } = renderHook(() => useWithdrawalConfig(2023, 2040), {
      wrapper: SimulationProvider,
    });

    expect(result.current.currentConfig.withdrawalSegments).toHaveLength(1);
    expect(result.current.currentConfig.withdrawalSegments[0].name).toBe("Hauptphase");
  });

  it('sets default values correctly', () => {
    const { result } = renderHook(() => useWithdrawalConfig(2023, 2040), {
      wrapper: SimulationProvider,
    });

    const config = result.current.currentConfig;
    expect(config.withdrawalReturnMode).toBe("fixed");
    expect(config.withdrawalAverageReturn).toBe(5);
    expect(config.withdrawalStandardDeviation).toBe(12);
    expect(config.useSegmentedWithdrawal).toBe(false);
    expect(config.useComparisonMode).toBe(false);
  });
});