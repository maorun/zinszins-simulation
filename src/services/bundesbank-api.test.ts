import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  fetchBasiszinsFromBundesbank, 
  refreshBasiszinsFromAPI,
  validateBasiszinsRate, 
  formatBasiszinsRate, 
  estimateFutureBasiszins,
  type BasiszinsConfiguration 
} from '../services/bundesbank-api';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Deutsche Bundesbank API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods to reduce test noise
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchBasiszinsFromBundesbank', () => {
    it('should try real APIs and fall back to historical data', async () => {
      // Mock all API calls to fail so we test the fallback
      mockFetch.mockRejectedValue(new Error('API not available'));
      
      const result = await fetchBasiszinsFromBundesbank(2018, 2024);
      
      expect(result).toHaveLength(7); // 2018-2024
      expect(result[0]).toEqual({
        year: 2018,
        rate: 0.0087,
        source: 'fallback',
        lastUpdated: expect.any(String),
      });
      
      // Should have tried the real API endpoints
      expect(mockFetch).toHaveBeenCalledTimes(2); // Bundesbank, ECB (no longer BMF theoretical endpoint)
    });

    it('should attempt to call real APIs before falling back', async () => {
      // Mock API responses that return insufficient data, forcing fallback
      mockFetch.mockResolvedValue({
        ok: true,
        text: () => Promise.resolve('TIME_PERIOD,OBS_VALUE\n'), // Empty data
      });
      
      const result = await fetchBasiszinsFromBundesbank(2023, 2024);
      
      expect(result).toHaveLength(2);
      expect(result[0].source).toBe('fallback'); // Falls back when APIs return insufficient data
      
      // Should have attempted multiple API calls
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('api.bundesbank.de'),
        expect.any(Object)
      );
    });

    it('should handle custom year ranges', async () => {
      // Mock API failure to test fallback
      mockFetch.mockRejectedValue(new Error('API not available'));
      
      const result = await fetchBasiszinsFromBundesbank(2022, 2023);
      
      expect(result).toHaveLength(2);
      expect(result[0].year).toBe(2022);
      expect(result[1].year).toBe(2023);
    });

    it('should handle invalid API responses gracefully', async () => {
      // Mock invalid CSV data
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });
      
      // Should fallback to next API and eventually historical data
      const result = await fetchBasiszinsFromBundesbank(2022, 2023);
      
      expect(result).toHaveLength(2);
      expect(result[0].source).toBe('fallback');
    });
  });

  describe('refreshBasiszinsFromAPI', () => {
    it('should merge API data with existing configuration', async () => {
      const existingConfig: BasiszinsConfiguration = {
        2025: { year: 2025, rate: 0.03, source: 'manual', lastUpdated: '2024-01-01' },
      };
      
      // Mock API to fail and use fallback data
      mockFetch.mockRejectedValue(new Error('API not available')); 
      
      const result = await refreshBasiszinsFromAPI(existingConfig);
      
      // Should preserve manual entry
      expect(result[2025]).toEqual(existingConfig[2025]);
      
      // Should have added historical data from the fallback
      expect(Object.keys(result).length).toBeGreaterThan(1);
      
      // Should have historical years in the result (now that we fixed the range)
      expect(result[2023]).toBeDefined();
      expect(result[2023]?.source).toBe('fallback');
    });

    it('should preserve manual entries for future years', async () => {
      const manualEntry = { year: 2026, rate: 0.035, source: 'manual' as const, lastUpdated: '2024-01-01' };
      const existingConfig: BasiszinsConfiguration = {
        2026: manualEntry,
      };
      
      mockFetch.mockRejectedValue(new Error('API not available'));
      
      const result = await refreshBasiszinsFromAPI(existingConfig);
      
      expect(result[2026]).toEqual(manualEntry);
    });

    it('should handle empty configuration correctly', async () => {
      const emptyConfig: BasiszinsConfiguration = {};
      
      mockFetch.mockRejectedValue(new Error('API not available'));
      
      const result = await refreshBasiszinsFromAPI(emptyConfig);
      
      // Should return historical data from 2018 onwards
      expect(Object.keys(result).length).toBeGreaterThan(0);
      expect(result[2023]).toBeDefined();
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