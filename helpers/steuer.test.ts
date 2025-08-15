import { zinszinsVorabpauschale } from './steuer';

describe('Steuer (Tax) Calculations', () => {
  describe('zinszinsVorabpauschale', () => {
    test('should calculate basic tax with default parameters', () => {
      const result = zinszinsVorabpauschale();
      
      expect(result).toHaveProperty('steuer');
      expect(result).toHaveProperty('verbleibenderFreibetrag');
      expect(typeof result.steuer).toBe('number');
      expect(typeof result.verbleibenderFreibetrag).toBe('number');
    });

    test('should apply tax exemption when tax is below allowance', () => {
      const result = zinszinsVorabpauschale(
        1000, // startwert (small amount)
        0.0255, // basiszins
        2000, // freibetrag (tax allowance)
        0.26375, // steuerlast
        0.7, // vorabpauschale_prozentsatz
        0.3, // freistellung
        12 // anteilImJahr
      );
      
      expect(result.steuer).toBe(0);
      expect(result.verbleibenderFreibetrag).toBeGreaterThan(0);
    });

    test('should calculate tax when amount exceeds allowance', () => {
      const result = zinszinsVorabpauschale(
        1000000, // startwert (very large amount)
        0.0255, // basiszins
        100, // freibetrag (small allowance)
        0.26375, // steuerlast
        0.7, // vorabpauschale_prozentsatz
        0.3, // freistellung
        12 // anteilImJahr
      );
      
      expect(result.steuer).toBeGreaterThan(0);
      expect(result.verbleibenderFreibetrag).toBe(0);
    });

    test('should handle partial year calculations correctly', () => {
      const fullYear = zinszinsVorabpauschale(1000000, 0.0255, 100, 0.26375, 0.7, 0.3, 12);
      const halfYear = zinszinsVorabpauschale(1000000, 0.0255, 100, 0.26375, 0.7, 0.3, 6);
      
      // Half year should have roughly half the tax impact
      expect(halfYear.steuer).toBeLessThan(fullYear.steuer);
      expect(halfYear.steuer).toBeGreaterThan(0);
    });

    test('should handle edge case: zero start value', () => {
      const result = zinszinsVorabpauschale(0);
      
      expect(result.steuer).toBe(0);
      expect(result.verbleibenderFreibetrag).toBeGreaterThan(0);
    });

    test('should handle edge case: zero tax allowance', () => {
      const result = zinszinsVorabpauschale(10000, 0.0255, 0);
      
      expect(result.steuer).toBeGreaterThan(0);
      expect(result.verbleibenderFreibetrag).toBe(0);
    });

    test('should validate German tax parameters', () => {
      // Test with realistic German tax parameters
      const result = zinszinsVorabpauschale(
        50000, // 50,000€ investment
        0.0255, // 2.55% base interest rate (German federal bond yield)
        2000, // 2,000€ tax allowance (Freibetrag)
        0.26375, // 26.375% capital gains tax (Kapitalertragsteuer)
        0.7, // 70% advance tax rate
        0.3, // 30% partial exemption for equity funds
        12 // full year
      );
      
      expect(result).toBeDefined();
      expect(result.steuer).toBeGreaterThanOrEqual(0);
      expect(result.verbleibenderFreibetrag).toBeGreaterThanOrEqual(0);
      
      // Tax + remaining allowance should not exceed original allowance
      const consumedAllowance = 2000 - result.verbleibenderFreibetrag;
      expect(consumedAllowance).toBeGreaterThanOrEqual(0);
      expect(consumedAllowance).toBeLessThanOrEqual(2000);
    });

    test('should be consistent with different input types', () => {
      const params = [25000, 0.0255, 1500, 0.26375, 0.7, 0.3, 12];
      
      const result1 = zinszinsVorabpauschale(...params);
      const result2 = zinszinsVorabpauschale(...params);
      
      expect(result1).toEqual(result2);
    });
  });
});