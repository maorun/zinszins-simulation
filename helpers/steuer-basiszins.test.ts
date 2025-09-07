import { describe, it, expect } from 'vitest';
import { getBasiszinsForYear } from './steuer';
import type { BasiszinsConfiguration } from '../src/services/bundesbank-api';

describe('Steuer Helper - Basiszins Configuration', () => {
  describe('getBasiszinsForYear', () => {
    it('should use configurable basiszins when provided', () => {
      const config: BasiszinsConfiguration = {
        2023: { year: 2023, rate: 0.035, source: 'api', lastUpdated: '2023-01-01' },
        2024: { year: 2024, rate: 0.04, source: 'manual', lastUpdated: '2024-01-01' },
      };

      expect(getBasiszinsForYear(2023, config)).toBe(0.035);
      expect(getBasiszinsForYear(2024, config)).toBe(0.04);
    });

    it('should fallback to hardcoded data when year not in config', () => {
      const config: BasiszinsConfiguration = {
        2025: { year: 2025, rate: 0.03, source: 'manual', lastUpdated: '2025-01-01' },
      };

      // 2023 is in hardcoded data
      expect(getBasiszinsForYear(2023, config)).toBe(0.0255);
      // 2025 is in config
      expect(getBasiszinsForYear(2025, config)).toBe(0.03);
    });

    it('should use most recent rate from config when year not found', () => {
      const config: BasiszinsConfiguration = {
        2020: { year: 2020, rate: 0.007, source: 'fallback', lastUpdated: '2020-01-01' },
        2023: { year: 2023, rate: 0.035, source: 'api', lastUpdated: '2023-01-01' },
        2021: { year: 2021, rate: 0.008, source: 'fallback', lastUpdated: '2021-01-01' },
      };

      // Request year 2030 - should get most recent from config (2023)
      expect(getBasiszinsForYear(2030, config)).toBe(0.035);
    });

    it('should fallback to hardcoded data when no config provided', () => {
      // Test historical years
      expect(getBasiszinsForYear(2023)).toBe(0.0255);
      expect(getBasiszinsForYear(2022)).toBe(0.018);
      expect(getBasiszinsForYear(2018)).toBe(0.0087);
    });

    it('should use ultimate fallback for unknown years without config', () => {
      // Test future year without config
      expect(getBasiszinsForYear(2030)).toBe(0.0255); // Latest hardcoded rate
    });

    it('should handle empty configuration gracefully', () => {
      const emptyConfig: BasiszinsConfiguration = {};
      
      // Should fallback to hardcoded data
      expect(getBasiszinsForYear(2023, emptyConfig)).toBe(0.0255);
      expect(getBasiszinsForYear(2030, emptyConfig)).toBe(0.0255);
    });

    it('should prioritize configuration over hardcoded data', () => {
      const config: BasiszinsConfiguration = {
        2023: { year: 2023, rate: 0.999, source: 'manual', lastUpdated: '2023-01-01' }, // Override hardcoded 0.0255
      };

      expect(getBasiszinsForYear(2023, config)).toBe(0.999);
      expect(getBasiszinsForYear(2023)).toBe(0.0255); // Without config, use hardcoded
    });
  });
});