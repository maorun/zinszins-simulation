import { describe, it, expect } from 'vitest';
import {
  calculateSavingsRate,
  calculateWealthAccumulationRate,
  calculatePensionGap,
  calculateRequiredPortfolioForPensionGap,
  evaluateSavingsRate,
  getSavingsRateColor,
} from '../kpi-calculations';

describe('KPI Calculations', () => {
  describe('calculateSavingsRate', () => {
    it('should calculate correct savings rate for normal values', () => {
      expect(calculateSavingsRate(1000, 5000)).toBe(20);
      expect(calculateSavingsRate(500, 2000)).toBe(25);
      expect(calculateSavingsRate(1500, 3000)).toBe(50);
    });

    it('should handle zero income', () => {
      expect(calculateSavingsRate(1000, 0)).toBe(0);
    });

    it('should handle negative income', () => {
      expect(calculateSavingsRate(1000, -1000)).toBe(0);
    });

    it('should clamp savings rate at 100%', () => {
      expect(calculateSavingsRate(6000, 5000)).toBe(100);
    });

    it('should handle zero savings', () => {
      expect(calculateSavingsRate(0, 5000)).toBe(0);
    });

    it('should handle negative savings (not saving)', () => {
      expect(calculateSavingsRate(-500, 5000)).toBe(0);
    });

    it('should return precise decimal values', () => {
      expect(calculateSavingsRate(333, 1000)).toBeCloseTo(33.3, 1);
      expect(calculateSavingsRate(666, 1000)).toBeCloseTo(66.6, 1);
    });
  });

  describe('calculateWealthAccumulationRate', () => {
    it('should calculate correct wealth accumulation rate', () => {
      // Need to grow from 100k to 500k in 10 years = 40k/year = 10% of target
      const rate = calculateWealthAccumulationRate(100000, 500000, 10);
      expect(rate).toBeCloseTo(8, 0);
    });

    it('should handle already reached target', () => {
      expect(calculateWealthAccumulationRate(500000, 500000, 10)).toBe(0);
    });

    it('should handle exceeded target', () => {
      expect(calculateWealthAccumulationRate(600000, 500000, 10)).toBe(0);
    });

    it('should handle zero years to target', () => {
      expect(calculateWealthAccumulationRate(100000, 500000, 0)).toBe(0);
    });

    it('should handle negative years to target', () => {
      expect(calculateWealthAccumulationRate(100000, 500000, -5)).toBe(0);
    });

    it('should calculate for small wealth gaps', () => {
      const rate = calculateWealthAccumulationRate(95000, 100000, 1);
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(10);
    });

    it('should calculate for large wealth gaps', () => {
      const rate = calculateWealthAccumulationRate(0, 1000000, 20);
      expect(rate).toBeGreaterThan(0);
      expect(rate).toBeLessThan(100);
    });
  });

  describe('calculatePensionGap', () => {
    it('should calculate correct pension gap', () => {
      expect(calculatePensionGap(3000, 2000)).toBe(1000);
      expect(calculatePensionGap(4000, 1500)).toBe(2500);
    });

    it('should handle no pension gap', () => {
      expect(calculatePensionGap(2000, 2000)).toBe(0);
    });

    it('should handle surplus pension (no gap)', () => {
      expect(calculatePensionGap(2000, 3000)).toBe(0);
    });

    it('should handle zero desired income', () => {
      expect(calculatePensionGap(0, 1000)).toBe(0);
    });

    it('should handle zero expected pension', () => {
      expect(calculatePensionGap(3000, 0)).toBe(3000);
    });

    it('should handle negative values gracefully', () => {
      expect(calculatePensionGap(-1000, 2000)).toBe(0);
      expect(calculatePensionGap(2000, -1000)).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateRequiredPortfolioForPensionGap', () => {
    it('should calculate correct portfolio size using 4% rule', () => {
      // Monthly gap of 1000 € = 12000 €/year
      // With 4% withdrawal = 12000 / 0.04 = 300000 €
      expect(calculateRequiredPortfolioForPensionGap(1000)).toBe(300000);
    });

    it('should calculate for different gap amounts', () => {
      expect(calculateRequiredPortfolioForPensionGap(500)).toBe(150000);
      expect(calculateRequiredPortfolioForPensionGap(2000)).toBe(600000);
      expect(calculateRequiredPortfolioForPensionGap(3333)).toBe(999900);
    });

    it('should handle zero gap', () => {
      expect(calculateRequiredPortfolioForPensionGap(0)).toBe(0);
    });

    it('should handle small gaps', () => {
      expect(calculateRequiredPortfolioForPensionGap(100)).toBe(30000);
    });

    it('should handle large gaps', () => {
      expect(calculateRequiredPortfolioForPensionGap(10000)).toBe(3000000);
    });
  });

  describe('evaluateSavingsRate', () => {
    it('should classify excellent savings rates', () => {
      expect(evaluateSavingsRate(20)).toBe('excellent');
      expect(evaluateSavingsRate(25)).toBe('excellent');
      expect(evaluateSavingsRate(50)).toBe('excellent');
      expect(evaluateSavingsRate(100)).toBe('excellent');
    });

    it('should classify good savings rates', () => {
      expect(evaluateSavingsRate(15)).toBe('good');
      expect(evaluateSavingsRate(17)).toBe('good');
      expect(evaluateSavingsRate(19.9)).toBe('good');
    });

    it('should classify average savings rates', () => {
      expect(evaluateSavingsRate(10)).toBe('average');
      expect(evaluateSavingsRate(12)).toBe('average');
      expect(evaluateSavingsRate(14.9)).toBe('average');
    });

    it('should classify low savings rates', () => {
      expect(evaluateSavingsRate(0)).toBe('low');
      expect(evaluateSavingsRate(5)).toBe('low');
      expect(evaluateSavingsRate(9.9)).toBe('low');
    });

    it('should handle boundary values', () => {
      expect(evaluateSavingsRate(9.99)).toBe('low');
      expect(evaluateSavingsRate(10.0)).toBe('average');
      expect(evaluateSavingsRate(14.99)).toBe('average');
      expect(evaluateSavingsRate(15.0)).toBe('good');
      expect(evaluateSavingsRate(19.99)).toBe('good');
      expect(evaluateSavingsRate(20.0)).toBe('excellent');
    });
  });

  describe('getSavingsRateColor', () => {
    it('should return green for excellent rates', () => {
      expect(getSavingsRateColor(20)).toBe('text-green-600 dark:text-green-400');
      expect(getSavingsRateColor(50)).toBe('text-green-600 dark:text-green-400');
    });

    it('should return blue for good rates', () => {
      expect(getSavingsRateColor(15)).toBe('text-blue-600 dark:text-blue-400');
      expect(getSavingsRateColor(19)).toBe('text-blue-600 dark:text-blue-400');
    });

    it('should return yellow for average rates', () => {
      expect(getSavingsRateColor(10)).toBe('text-yellow-600 dark:text-yellow-400');
      expect(getSavingsRateColor(14)).toBe('text-yellow-600 dark:text-yellow-400');
    });

    it('should return red for low rates', () => {
      expect(getSavingsRateColor(0)).toBe('text-red-600 dark:text-red-400');
      expect(getSavingsRateColor(5)).toBe('text-red-600 dark:text-red-400');
      expect(getSavingsRateColor(9)).toBe('text-red-600 dark:text-red-400');
    });

    it('should handle boundary values correctly', () => {
      expect(getSavingsRateColor(9.99)).toBe('text-red-600 dark:text-red-400');
      expect(getSavingsRateColor(10)).toBe('text-yellow-600 dark:text-yellow-400');
      expect(getSavingsRateColor(14.99)).toBe('text-yellow-600 dark:text-yellow-400');
      expect(getSavingsRateColor(15)).toBe('text-blue-600 dark:text-blue-400');
      expect(getSavingsRateColor(19.99)).toBe('text-blue-600 dark:text-blue-400');
      expect(getSavingsRateColor(20)).toBe('text-green-600 dark:text-green-400');
    });
  });
});
