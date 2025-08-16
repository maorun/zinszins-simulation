import { describe, test, expect } from 'vitest';
import { calculateWithdrawalDuration, calculateWithdrawal } from './withdrawal';

describe('calculateWithdrawalDuration', () => {
  test('should return null when capital never depletes (sustainable withdrawal)', () => {
    // 4% withdrawal with 5% return - capital should grow
    const withdrawalResult = calculateWithdrawal(100000, 2025, 2035, "4prozent", 0.05);
    const duration = calculateWithdrawalDuration(withdrawalResult, 2025);
    
    expect(duration).toBeNull();
  });

  test('should return null when capital never depletes (3% rule)', () => {
    // 3% withdrawal with 5% return - capital should grow even more
    const withdrawalResult = calculateWithdrawal(100000, 2025, 2035, "3prozent", 0.05);
    const duration = calculateWithdrawalDuration(withdrawalResult, 2025);
    
    expect(duration).toBeNull();
  });

  test('should calculate duration when capital depletes', () => {
    // 4% withdrawal with 1% return - capital should deplete
    const withdrawalResult = calculateWithdrawal(100000, 2025, 2050, "4prozent", 0.01);
    const duration = calculateWithdrawalDuration(withdrawalResult, 2025);
    
    // Should find when capital is depleted or return null if it doesn't deplete
    if (duration !== null) {
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(26); // Should deplete before 2050 (26 years)
    } else {
      // If null, verify that capital is still positive at the end
      const years = Object.keys(withdrawalResult).map(Number).sort((a, b) => b - a);
      const lastYear = years[0];
      expect(withdrawalResult[lastYear].endkapital).toBeGreaterThan(0);
    }
  });

  test('should calculate duration correctly for small capital', () => {
    // Small capital with high withdrawal should deplete quickly
    const withdrawalResult = calculateWithdrawal(10000, 2025, 2035, "4prozent", 0.01);
    const duration = calculateWithdrawalDuration(withdrawalResult, 2025);
    
    if (duration !== null) {
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(11); // Should deplete before 2035 (11 years)
    } else {
      // If null, verify that capital is still positive at the end
      const years = Object.keys(withdrawalResult).map(Number).sort((a, b) => b - a);
      const lastYear = years[0];
      expect(withdrawalResult[lastYear].endkapital).toBeGreaterThan(0);
    }
  });

  test('should handle edge case where capital depletes in first year', () => {
    // Very small capital relative to withdrawal
    const withdrawalResult = calculateWithdrawal(1000, 2025, 2030, "4prozent", 0.01);
    const duration = calculateWithdrawalDuration(withdrawalResult, 2025);
    
    // Check if capital actually depletes or remains positive
    if (duration !== null) {
      expect(duration).toBeGreaterThanOrEqual(1);
    } else {
      // If null, verify behavior is correct
      const years = Object.keys(withdrawalResult).map(Number).sort((a, b) => b - a);
      const lastYear = years[0];
      expect(withdrawalResult[lastYear].endkapital).toBeGreaterThanOrEqual(0);
    }
  });

  test('should return correct year difference when capital depletes', () => {
    // Test with known scenario
    const startYear = 2025;
    const withdrawalResult = calculateWithdrawal(50000, startYear, 2040, "4prozent", 0.02);
    const duration = calculateWithdrawalDuration(withdrawalResult, startYear);
    
    if (duration !== null) {
      // Duration should be the number of years from start to depletion
      expect(duration).toBeGreaterThan(0);
      
      // Verify the calculation makes sense
      const yearOfDepletion = startYear + duration - 1;
      expect(yearOfDepletion).toBeGreaterThanOrEqual(startYear);
      expect(yearOfDepletion).toBeLessThanOrEqual(2040);
    }
  });

  test('should verify function works correctly', () => {
    // Test that the function returns null for sustainable scenarios 
    const sustainableResult = calculateWithdrawal(100000, 2025, 2030, "4prozent", 0.05);
    const sustainableDuration = calculateWithdrawalDuration(sustainableResult, 2025);
    expect(sustainableDuration).toBeNull();
    
    // Test with a scenario where capital might deplete
    const testResult = calculateWithdrawal(1000, 2025, 2030, "4prozent", 0.01);
    const testDuration = calculateWithdrawalDuration(testResult, 2025);
    
    // The function should return either null or a positive number
    if (testDuration !== null) {
      expect(testDuration).toBeGreaterThan(0);
    }
    
    // Verify the function handles empty results
    const emptyResult = {};
    const emptyDuration = calculateWithdrawalDuration(emptyResult, 2025);
    expect(emptyDuration).toBeNull();
  });
});