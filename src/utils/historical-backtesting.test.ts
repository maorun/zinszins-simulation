import { describe, it, expect } from 'vitest';
import { simulate } from './simulate';
import type { ReturnConfiguration } from './random-returns';
import type { SparplanElement } from './sparplan-utils';
import { SimulationAnnual } from './simulate';

describe('Historical Backtesting Integration', () => {
  // Helper function to create test SparplanElement (same as in simulate.test.ts)
  const createSparplanElement = (
    start: string, 
    einzahlung: number, 
    type: 'sparplan' | 'einmalzahlung' = 'sparplan',
    gewinn?: number
  ): SparplanElement => {
    if (type === 'einmalzahlung') {
      return {
        start: new Date(start),
        type: 'einmalzahlung',
        einzahlung,
        gewinn: gewinn || 0,
        simulation: {}
      };
    }
    return {
      start: new Date(start),
      type: 'sparplan',
      einzahlung,
      simulation: {}
    };
  };

  describe('Historical return mode simulation', () => {
    it('should use DAX historical data for simulation', () => {
      const elements = [createSparplanElement('2020-01-01', 1000)];
      
      const returnConfig: ReturnConfiguration = {
        mode: 'historical',
        historicalConfig: {
          indexId: 'dax',
        },
      };

      const result = simulate({
        startYear: 2020,
        endYear: 2023,
        elements,
        returnConfig,
        steuerlast: 0.26375,
        simulationAnnual: SimulationAnnual.yearly,
      });

      // Should return simulation results
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      
      // Check that simulation was executed
      const element = result[0];
      expect(element.simulation).toBeDefined();
      
      // The simulation should have entries for the years simulated
      const simulationEntries = Object.keys(element.simulation);
      expect(simulationEntries.length).toBeGreaterThan(0);
      expect(simulationEntries).toContain('2020');
      expect(simulationEntries).toContain('2021');
      expect(simulationEntries).toContain('2022');
      expect(simulationEntries).toContain('2023');
    });

    it('should use S&P 500 historical data for simulation', () => {
      const elements = [createSparplanElement('2020-01-01', 1000)];
      
      const returnConfig: ReturnConfiguration = {
        mode: 'historical',
        historicalConfig: {
          indexId: 'sp500',
        },
      };

      const result = simulate({
        startYear: 2020,
        endYear: 2023,
        elements,
        returnConfig,
        steuerlast: 0.26375,
        simulationAnnual: SimulationAnnual.yearly,
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      
      // Verify simulation was executed  
      const element = result[0];
      expect(element.simulation).toBeDefined();
      expect(Object.keys(element.simulation).length).toBeGreaterThan(0);
    });

    it('should use MSCI World historical data for simulation', () => {
      const elements = [createSparplanElement('2020-01-01', 1000)];
      
      const returnConfig: ReturnConfiguration = {
        mode: 'historical',
        historicalConfig: {
          indexId: 'msci-world',
        },
      };

      const result = simulate({
        startYear: 2020,
        endYear: 2023,
        elements,
        returnConfig,
        steuerlast: 0.26375,
        simulationAnnual: SimulationAnnual.yearly,
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      
      // Verify simulation was executed
      const element = result[0];
      expect(element.simulation).toBeDefined();
      expect(Object.keys(element.simulation).length).toBeGreaterThan(0);
    });

    it('should fallback to 5% return for invalid historical index', () => {
      const elements = [createSparplanElement('2020-01-01', 1000)];
      
      const returnConfig: ReturnConfiguration = {
        mode: 'historical',
        historicalConfig: {
          indexId: 'invalid-index',
        },
      };

      const result = simulate({
        startYear: 2020,
        endYear: 2023,
        elements,
        returnConfig,
        steuerlast: 0.26375,
        simulationAnnual: SimulationAnnual.yearly,
      });

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      
      // Should still produce simulation results with fallback returns
      const element = result[0];
      expect(element.simulation).toBeDefined();
      expect(Object.keys(element.simulation).length).toBeGreaterThan(0);
    });

    it('should produce different results for different historical indices', () => {
      const elements1 = [createSparplanElement('2020-01-01', 1000)];
      const elements2 = [createSparplanElement('2020-01-01', 1000)];
      
      const daxConfig: ReturnConfiguration = {
        mode: 'historical',
        historicalConfig: { indexId: 'dax' },
      };

      const sp500Config: ReturnConfiguration = {
        mode: 'historical',
        historicalConfig: { indexId: 'sp500' },
      };

      const daxResult = simulate({
        startYear: 2020,
        endYear: 2023,
        elements: elements1,
        returnConfig: daxConfig,
        steuerlast: 0.26375,
        simulationAnnual: SimulationAnnual.yearly,
      });

      const sp500Result = simulate({
        startYear: 2020,
        endYear: 2023,
        elements: elements2,
        returnConfig: sp500Config,
        steuerlast: 0.26375,
        simulationAnnual: SimulationAnnual.yearly,
      });

      // Results should be different due to different historical returns
      const daxEndCapital = daxResult[0].simulation[2023]?.endkapital || 0;
      const sp500EndCapital = sp500Result[0].simulation[2023]?.endkapital || 0;
      
      // Allow for small differences due to rounding, but they should not be identical
      expect(Math.abs(daxEndCapital - sp500EndCapital)).toBeGreaterThan(0.01);
    });
  });

  describe('Historical vs other return modes comparison', () => {
    it('should produce different results than fixed return mode', () => {
      const elements1 = [createSparplanElement('2020-01-01', 1000)];
      const elements2 = [createSparplanElement('2020-01-01', 1000)];
      
      const historicalConfig: ReturnConfiguration = {
        mode: 'historical',
        historicalConfig: { indexId: 'dax' },
      };

      const fixedConfig: ReturnConfiguration = {
        mode: 'fixed',
        fixedRate: 0.05,
      };

      const historicalResult = simulate({
        startYear: 2020,
        endYear: 2023,
        elements: elements1,
        returnConfig: historicalConfig,
        steuerlast: 0.26375,
        simulationAnnual: SimulationAnnual.yearly,
      });

      const fixedResult = simulate({
        startYear: 2020,
        endYear: 2023,
        elements: elements2,
        returnConfig: fixedConfig,
        steuerlast: 0.26375,
        simulationAnnual: SimulationAnnual.yearly,
      });

      // Results should be different
      const historicalEndCapital = historicalResult[0].simulation[2023]?.endkapital || 0;
      const fixedEndCapital = fixedResult[0].simulation[2023]?.endkapital || 0;
      
      expect(historicalEndCapital).not.toBe(fixedEndCapital);
    });

    it('should produce reproducible results for same historical index', () => {
      const elements1 = [createSparplanElement('2020-01-01', 1000)];
      const elements2 = [createSparplanElement('2020-01-01', 1000)];
      
      const returnConfig: ReturnConfiguration = {
        mode: 'historical',
        historicalConfig: {
          indexId: 'dax',
        },
      };

      const result1 = simulate({
        startYear: 2020,
        endYear: 2023,
        elements: elements1,
        returnConfig,
        steuerlast: 0.26375,
        simulationAnnual: SimulationAnnual.yearly,
      });

      const result2 = simulate({
        startYear: 2020,
        endYear: 2023,
        elements: elements2,
        returnConfig,
        steuerlast: 0.26375,
        simulationAnnual: SimulationAnnual.yearly,
      });

      // Results should be identical (deterministic)
      expect(result1.length).toBe(result2.length);
      
      const sim1 = result1[0].simulation;
      const sim2 = result2[0].simulation;
      
      expect(Object.keys(sim1)).toEqual(Object.keys(sim2));
      
      Object.keys(sim1).forEach(yearKey => {
        const year = parseInt(yearKey);
        expect(sim1[year].endkapital).toBeCloseTo(sim2[year].endkapital, 2);
        expect(sim1[year].bezahlteSteuer).toBeCloseTo(sim2[year].bezahlteSteuer, 2);
      });
    });
  });
});