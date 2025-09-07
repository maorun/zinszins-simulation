import { describe, it, expect, vi } from 'vitest';
import { 
  fetchBasiszinsFromBundesbank, 
  validateBasiszinsRate, 
  formatBasiszinsRate, 
  estimateFutureBasiszins,
  type BasiszinsConfiguration 
} from '../services/bundesbank-api';

describe('Deutsche Bundesbank API Service', () => {
  describe('fetchBasiszinsFromBundesbank', () => {
    it('should return fallback data when API is not implemented', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = await fetchBasiszinsFromBundesbank(2018, 2024);
      
      expect(result).toHaveLength(7); // 2018-2024
      expect(result[0]).toEqual({
        year: 2018,
        rate: 0.0087,
        source: 'fallback',
        lastUpdated: expect.any(String),
      });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Deutsche Bundesbank API integration not yet implemented. Using fallback data.'
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle custom year ranges', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const result = await fetchBasiszinsFromBundesbank(2022, 2023);
      
      expect(result).toHaveLength(2);
      expect(result[0].year).toBe(2022);
      expect(result[1].year).toBe(2023);
      
      consoleSpy.mockRestore();
    });
  });

  describe('validateBasiszinsRate', () => {
    it('should accept valid rates within bounds', () => {
      expect(validateBasiszinsRate(0.025)).toBe(true); // 2.5%
      expect(validateBasiszinsRate(0.0)).toBe(true); // 0%
      expect(validateBasiszinsRate(-0.01)).toBe(true); // -1%
      expect(validateBasiszinsRate(0.05)).toBe(true); // 5%
    });

    it('should reject rates outside bounds', () => {
      expect(validateBasiszinsRate(-0.025)).toBe(false); // -2.5% (too low)
      expect(validateBasiszinsRate(0.15)).toBe(false); // 15% (too high)
      expect(validateBasiszinsRate(0.11)).toBe(false); // 11% (too high)
    });

    it('should handle edge cases at boundaries', () => {
      expect(validateBasiszinsRate(-0.02)).toBe(true); // Exactly -2%
      expect(validateBasiszinsRate(0.10)).toBe(true); // Exactly 10%
      expect(validateBasiszinsRate(-0.020001)).toBe(false); // Just below -2%
      expect(validateBasiszinsRate(0.100001)).toBe(false); // Just above 10%
    });
  });

  describe('formatBasiszinsRate', () => {
    it('should format rates as percentages', () => {
      expect(formatBasiszinsRate(0.0255)).toBe('2.55%');
      expect(formatBasiszinsRate(0.0087)).toBe('0.87%');
      expect(formatBasiszinsRate(0.0)).toBe('0.00%');
      expect(formatBasiszinsRate(-0.005)).toBe('-0.50%');
    });

    it('should handle precision correctly', () => {
      expect(formatBasiszinsRate(0.025456)).toBe('2.55%');
      expect(formatBasiszinsRate(0.025444)).toBe('2.54%');
    });
  });

  describe('estimateFutureBasiszins', () => {
    it('should return most recent rate as estimate', () => {
      const config: BasiszinsConfiguration = {
        2020: { year: 2020, rate: 0.007, source: 'fallback', lastUpdated: '2020-01-01' },
        2023: { year: 2023, rate: 0.0255, source: 'api', lastUpdated: '2023-01-01' },
        2021: { year: 2021, rate: 0.007, source: 'fallback', lastUpdated: '2021-01-01' },
      };

      const estimate = estimateFutureBasiszins(config);
      expect(estimate).toBe(0.0255); // Most recent year (2023)
    });

    it('should return default when no historical rates available', () => {
      const emptyConfig: BasiszinsConfiguration = {};
      
      const estimate = estimateFutureBasiszins(emptyConfig);
      expect(estimate).toBe(0.0255); // Default fallback
    });

    it('should handle single year configuration', () => {
      const config: BasiszinsConfiguration = {
        2024: { year: 2024, rate: 0.03, source: 'manual', lastUpdated: '2024-01-01' },
      };

      const estimate = estimateFutureBasiszins(config);
      expect(estimate).toBe(0.03);
    });
  });
});