import { describe, it, expect } from 'vitest';
import { extractWithdrawalMetrics } from './summary-utils';
import type { WithdrawalResult } from '../../helpers/withdrawal';

describe('extractWithdrawalMetrics - Segmented Withdrawal', () => {
  it('should fix the specific issue scenario with 3 segments (4k monthly + 4k monthly + variable percentage)', () => {
    // This test replicates the exact scenario from the issue:
    // Segment 1 (2040-2045): Monthly withdrawal strategy with 4,000€/month
    // Segment 2 (2046-2049): Monthly withdrawal strategy with 4,000€/month  
    // Segment 3 (2050-2080): Variable percentage strategy with 0.05%
    const mockWithdrawalResult: WithdrawalResult = {};
    
    // Segment 1: 2040-2045 (6 years) - Fixed monthly 4,000€
    for (let year = 2040; year <= 2045; year++) {
      mockWithdrawalResult[year] = {
        startkapital: 1000000,
        entnahme: 48000, // 4,000€ * 12 months
        endkapital: 980000,
        bezahlteSteuer: 5000,
        genutzterFreibetrag: 2000,
        zinsen: 28000,
        monatlicheEntnahme: 4000, // Fixed monthly amount
      };
    }
    
    // Segment 2: 2046-2049 (4 years) - Fixed monthly 4,000€ with inflation
    for (let year = 2046; year <= 2049; year++) {
      const inflationFactor = Math.pow(1.02, year - 2040); // 2% inflation
      const adjustedMonthly = 4000 * inflationFactor;
      mockWithdrawalResult[year] = {
        startkapital: 900000,
        entnahme: adjustedMonthly * 12,
        endkapital: 870000,
        bezahlteSteuer: 5000,
        genutzterFreibetrag: 2000,
        zinsen: 25000,
        monatlicheEntnahme: adjustedMonthly,
      };
    }
    
    // Segment 3: 2050-2080 (31 years) - Variable percentage strategy with 0.05%
    // This should result in much higher monthly amounts as the portfolio is large
    for (let year = 2050; year <= 2080; year++) {
      const portfolioValue = 800000 + (year - 2050) * 15000; // Growing portfolio
      const annualWithdrawal = portfolioValue * 0.05; // 5% withdrawal rate
      const monthlyAmount = annualWithdrawal / 12;
      
      mockWithdrawalResult[year] = {
        startkapital: portfolioValue,
        entnahme: annualWithdrawal,
        endkapital: portfolioValue * 0.95,
        bezahlteSteuer: 8000,
        genutzterFreibetrag: 2000,
        zinsen: 35000,
        monatlicheEntnahme: monthlyAmount, // Should be much higher than 4,000€
      };
    }
    
    const result = extractWithdrawalMetrics(mockWithdrawalResult);
    
    // Before the fix, this would show ~4,000€ (first year only)
    // After the fix, this should show a proper weighted average across all segments
    
    // Verify the average is higher than the base 4,000€ from the first segments
    expect(result.averageMonthlyWithdrawal).toBeGreaterThan(4000);
    
    // The result should be a weighted average considering:
    // - 10 years of ~4,000€ monthly (segments 1&2)
    // - 31 years of ~3,333€+ monthly (segment 3 with 5% strategy)
    
    // Calculate expected: For the 31 years of 5% strategy on 800k+ portfolio,
    // monthly amounts start at 800k*0.05/12 = 3,333€ and grow to higher amounts
    
    // Since segment 3 has 31 out of 41 years and higher amounts, 
    // the average should be significantly influenced by segment 3
    expect(result.averageMonthlyWithdrawal).toBeGreaterThan(4200);
    
    expect(result.totalYears).toBe(41); // 2040-2080
  });

  it('should calculate correct average monthly withdrawal for segmented withdrawal with mixed strategies', () => {
    // Create a mock withdrawal result representing the issue scenario:
    // Segment 1 (2040-2045): 6 years with 4,000€/month fixed
    // Segment 2 (2046-2049): 4 years with 4,000€/month fixed  
    // Segment 3 (2050-2080): 31 years with variable percentage (higher amounts)
    const mockWithdrawalResult: WithdrawalResult = {};
    
    // Segment 1: 2040-2045 (6 years) - Fixed monthly 4,000€
    for (let year = 2040; year <= 2045; year++) {
      mockWithdrawalResult[year] = {
        startkapital: 500000,
        entnahme: 48000, // 4,000€ * 12 months
        endkapital: 480000,
        bezahlteSteuer: 5000,
        genutzterFreibetrag: 2000,
        zinsen: 25000,
        monatlicheEntnahme: 4000, // Fixed monthly amount
      };
    }
    
    // Segment 2: 2046-2049 (4 years) - Fixed monthly 4,000€ with slight inflation
    for (let year = 2046; year <= 2049; year++) {
      const inflationFactor = Math.pow(1.02, year - 2040); // 2% inflation
      const adjustedMonthly = 4000 * inflationFactor;
      mockWithdrawalResult[year] = {
        startkapital: 450000,
        entnahme: adjustedMonthly * 12,
        endkapital: 430000,
        bezahlteSteuer: 5000,
        genutzterFreibetrag: 2000,
        zinsen: 22000,
        monatlicheEntnahme: adjustedMonthly,
      };
    }
    
    // Segment 3: 2050-2080 (31 years) - Variable percentage strategy with much higher amounts
    for (let year = 2050; year <= 2080; year++) {
      const portfolioValue = 800000 + (year - 2050) * 20000; // Growing portfolio starting higher
      const annualWithdrawal = portfolioValue * 0.05; // 5% withdrawal rate
      const monthlyAmount = annualWithdrawal / 12;
      
      mockWithdrawalResult[year] = {
        startkapital: portfolioValue,
        entnahme: annualWithdrawal,
        endkapital: portfolioValue * 0.95,
        bezahlteSteuer: 8000,
        genutzterFreibetrag: 2000,
        zinsen: 30000,
        monatlicheEntnahme: monthlyAmount, // Much higher than 4,000€
      };
    }
    
    const result = extractWithdrawalMetrics(mockWithdrawalResult);
    
    // Calculate expected weighted average
    const allYears = Object.keys(mockWithdrawalResult).map(Number);
    const totalMonthlySum = allYears.reduce((sum, year) => {
      return sum + (mockWithdrawalResult[year].monatlicheEntnahme || 0);
    }, 0);
    const expectedAverage = totalMonthlySum / allYears.length;
    
    // The fix should calculate a proper weighted average, not just use the first year's 4,000€
    expect(result.averageMonthlyWithdrawal).toBeCloseTo(expectedAverage, 2);
    
    // Verify it's significantly higher than the first year's amount (4,000€)
    // With the test data: 10 years of ~4,000€ + 31 years of 3,333€+ = average should be higher than 4,000€
    expect(result.averageMonthlyWithdrawal).toBeGreaterThan(4000);
    
    // Verify total years calculation
    expect(result.totalYears).toBe(41); // 2040-2080 = 41 years
    
    // Verify total withdrawn is sum of all annual withdrawals
    const expectedTotalWithdrawn = allYears.reduce((sum, year) => {
      return sum + mockWithdrawalResult[year].entnahme;
    }, 0);
    expect(result.totalWithdrawn).toBeCloseTo(expectedTotalWithdrawn, 2);
  });

  it('should handle withdrawal result with missing monthly data gracefully', () => {
    const mockWithdrawalResult: WithdrawalResult = {
      2040: {
        startkapital: 500000,
        entnahme: 48000,
        endkapital: 480000,
        bezahlteSteuer: 5000,
        genutzterFreibetrag: 2000,
        zinsen: 25000,
        // No monatlicheEntnahme field
      },
      2041: {
        startkapital: 480000,
        entnahme: 50000,
        endkapital: 460000,
        bezahlteSteuer: 5000,
        genutzterFreibetrag: 2000,
        zinsen: 25000,
        // No monatlicheEntnahme field
      },
    };
    
    const result = extractWithdrawalMetrics(mockWithdrawalResult);
    
    // Should fall back to annual withdrawal / 12
    const expectedFallbackAverage = (48000 + 50000) / 2 / 12;
    expect(result.averageMonthlyWithdrawal).toBeCloseTo(expectedFallbackAverage, 2);
  });

  it('should handle single year withdrawal correctly', () => {
    const mockWithdrawalResult: WithdrawalResult = {
      2040: {
        startkapital: 500000,
        entnahme: 48000,
        endkapital: 480000,
        bezahlteSteuer: 5000,
        genutzterFreibetrag: 2000,
        zinsen: 25000,
        monatlicheEntnahme: 4000,
      },
    };
    
    const result = extractWithdrawalMetrics(mockWithdrawalResult);
    
    expect(result.averageMonthlyWithdrawal).toBe(4000);
    expect(result.totalYears).toBe(1);
    expect(result.totalWithdrawn).toBe(48000);
  });

  it('should handle empty withdrawal result', () => {
    const mockWithdrawalResult: WithdrawalResult = {};
    
    const result = extractWithdrawalMetrics(mockWithdrawalResult);
    
    expect(result.averageMonthlyWithdrawal).toBe(0);
    expect(result.totalYears).toBe(0);
    expect(result.totalWithdrawn).toBe(0);
    expect(result.finalCapital).toBe(0);
  });

  it('should calculate correct average for mixed monthly and non-monthly data', () => {
    const mockWithdrawalResult: WithdrawalResult = {
      2040: {
        startkapital: 500000,
        entnahme: 48000,
        endkapital: 480000,
        bezahlteSteuer: 5000,
        genutzterFreibetrag: 2000,
        zinsen: 25000,
        monatlicheEntnahme: 4000, // Has monthly data
      },
      2041: {
        startkapital: 480000,
        entnahme: 50000,
        endkapital: 460000,
        bezahlteSteuer: 5000,
        genutzterFreibetrag: 2000,
        zinsen: 25000,
        // No monthly data - will be excluded from monthly average calculation
      },
      2042: {
        startkapital: 460000,
        entnahme: 60000,
        endkapital: 440000,
        bezahlteSteuer: 5000,
        genutzterFreibetrag: 2000,
        zinsen: 25000,
        monatlicheEntnahme: 5000, // Has monthly data
      },
    };
    
    const result = extractWithdrawalMetrics(mockWithdrawalResult);
    
    // Should average only the years with monthly data: (4000 + 5000) / 2 = 4500
    expect(result.averageMonthlyWithdrawal).toBe(4500);
    expect(result.totalYears).toBe(3);
    expect(result.totalWithdrawn).toBe(158000); // 48000 + 50000 + 60000
  });
});