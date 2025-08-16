import { calculateWithdrawal, calculateIncomeTax, getTotalCapitalAtYear, type WithdrawalStrategy, type MonthlyWithdrawalConfig } from './withdrawal';

describe('Withdrawal Calculations', () => {
  describe('calculateWithdrawal function', () => {
    test('should calculate 4% rule withdrawal correctly', () => {
      const startingCapital = 100000;
      const startYear = 2025;
      const endYear = 2027;
      const strategy: WithdrawalStrategy = "4prozent";
      const returnRate = 0.05; // 5%
      
      const result = calculateWithdrawal(startingCapital, startYear, endYear, strategy, returnRate);
      
      // Initial withdrawal should be 4% of starting capital
      const expectedWithdrawal = 4000;
      
      expect(result[2025]).toBeDefined();
      expect(result[2025].startkapital).toBe(100000);
      expect(result[2025].entnahme).toBe(expectedWithdrawal);
      expect(result[2025].endkapital).toBeGreaterThan(0);
      expect(result[2025].zinsen).toBeGreaterThan(0);
    });

    test('should calculate 3% rule withdrawal correctly', () => {
      const startingCapital = 100000;
      const startYear = 2025;
      const endYear = 2027;
      const strategy: WithdrawalStrategy = "3prozent";
      const returnRate = 0.05; // 5%
      
      const result = calculateWithdrawal(startingCapital, startYear, endYear, strategy, returnRate);
      
      // Initial withdrawal should be 3% of starting capital
      const expectedWithdrawal = 3000;
      
      expect(result[2025].startkapital).toBe(100000);
      expect(result[2025].entnahme).toBe(expectedWithdrawal);
      expect(result[2025].endkapital).toBeGreaterThan(0);
    });

    test('should handle multiple years of withdrawal', () => {
      const result = calculateWithdrawal(200000, 2025, 2027, "4prozent", 0.02); // Lower return rate
      
      expect(Object.keys(result)).toHaveLength(3); // 2025, 2026, 2027
      expect(result[2025]).toBeDefined();
      expect(result[2026]).toBeDefined();
      expect(result[2027]).toBeDefined();
      
      // With 4% withdrawal and only 2% return, capital should decrease over time
      expect(result[2026].startkapital).toBeLessThan(result[2025].startkapital);
      expect(result[2027].startkapital).toBeLessThan(result[2026].startkapital);
    });

    test('should apply consistent withdrawal amounts each year', () => {
      const result = calculateWithdrawal(150000, 2025, 2028, "4prozent", 0.05);
      
      const expectedWithdrawal = 6000; // 4% of 150,000
      
      // All years should have the same withdrawal amount (fixed dollar amount strategy)
      expect(result[2025].entnahme).toBe(expectedWithdrawal);
      expect(result[2026].entnahme).toBe(expectedWithdrawal);
      expect(result[2027].entnahme).toBe(expectedWithdrawal);
      expect(result[2028].entnahme).toBe(expectedWithdrawal);
    });

    test('should handle capital depletion', () => {
      // Small capital with high withdrawal rate relative to returns
      const result = calculateWithdrawal(20000, 2025, 2035, "4prozent", 0.01); // 1% return, 4% withdrawal
      
      // 4% withdrawal = 800/year, 1% growth is much less, so should decline over time
      const years = Object.keys(result).map(Number).sort((a, b) => a - b);
      const firstYear = years[0];
      const lastYear = years[years.length - 1];
      
      // Capital should be significantly reduced over the decade
      expect(result[lastYear].endkapital).toBeLessThan(result[firstYear].startkapital * 0.8);
    });

    test('should apply German tax calculations', () => {
      const result = calculateWithdrawal(500000, 2025, 2026, "4prozent", 0.08);
      
      // With large capital and good returns, should have some tax burden
      expect(result[2025].bezahlteSteuer).toBeGreaterThanOrEqual(0);
      expect(result[2025].genutzterFreibetrag).toBeGreaterThanOrEqual(0);
    });

    test('should handle zero return rate', () => {
      const result = calculateWithdrawal(100000, 2025, 2027, "3prozent", 0);
      
      expect(result[2025].zinsen).toBe(0);
      expect(result[2025].endkapital).toBe(97000); // 100,000 - 3,000 withdrawal (no growth, no taxes)
    });
  });

  describe('calculateIncomeTax function', () => {
    test('should apply basic tax allowance correctly', () => {
      const grundfreibetrag = 10908;
      
      // Withdrawal below allowance should have no income tax
      const lowWithdrawal = calculateIncomeTax(8000, grundfreibetrag);
      expect(lowWithdrawal).toBe(0);
      
      // Withdrawal above allowance should have tax on excess
      const highWithdrawal = calculateIncomeTax(15000, grundfreibetrag);
      const expectedTax = (15000 - grundfreibetrag) * 0.25;
      expect(highWithdrawal).toBe(expectedTax);
    });

    test('should handle edge cases', () => {
      // Zero withdrawal
      expect(calculateIncomeTax(0)).toBe(0);
      
      // Withdrawal exactly equal to allowance
      expect(calculateIncomeTax(10908, 10908)).toBe(0);
    });
  });

  describe('getTotalCapitalAtYear function', () => {
    test('should sum capital from multiple elements', () => {
      const mockElements = [
        {
          simulation: {
            2025: { endkapital: 50000 },
            2026: { endkapital: 55000 }
          }
        },
        {
          simulation: {
            2025: { endkapital: 30000 },
            2026: { endkapital: 32000 }
          }
        }
      ];

      const total2025 = getTotalCapitalAtYear(mockElements, 2025);
      const total2026 = getTotalCapitalAtYear(mockElements, 2026);

      expect(total2025).toBe(80000); // 50,000 + 30,000
      expect(total2026).toBe(87000); // 55,000 + 32,000
    });

    test('should handle missing simulation data', () => {
      const mockElements = [
        { simulation: {} },
        { simulation: { 2025: { endkapital: 25000 } } }
      ];

      const total = getTotalCapitalAtYear(mockElements, 2025);
      expect(total).toBe(25000);
    });

    test('should handle empty elements array', () => {
      const total = getTotalCapitalAtYear([], 2025);
      expect(total).toBe(0);
    });
  });

  describe('Monthly fixed withdrawal strategy', () => {
    test('should calculate monthly fixed withdrawal correctly', () => {
      const startingCapital = 600000; // 600k starting capital
      const monthlyConfig: MonthlyWithdrawalConfig = {
        monthlyAmount: 2000, // 2000€ per month
        inflationRate: 0.02, // 2% inflation
        enableGuardrails: false
      };
      
      const result = calculateWithdrawal(
        startingCapital, 
        2025, 
        2027, 
        "monatlich_fest", 
        0.05, // 5% return
        0.26375,
        undefined,
        monthlyConfig
      );
      
      // First year should withdraw exactly 24,000€ (2000 * 12)
      expect(result[2025].entnahme).toBe(24000);
      expect(result[2025].monatlicheEntnahme).toBe(2000);
      expect(result[2025].inflationAnpassung).toBe(0); // No inflation adjustment in first year
      
      // Second year should have inflation adjustment
      expect(result[2026].entnahme).toBeGreaterThan(24000);
      expect(result[2026].inflationAnpassung).toBeGreaterThan(0);
      expect(result[2026].monatlicheEntnahme).toBeCloseTo(result[2026].entnahme / 12, 2);
    });

    test('should apply inflation adjustment correctly', () => {
      const monthlyConfig: MonthlyWithdrawalConfig = {
        monthlyAmount: 2000,
        inflationRate: 0.03, // 3% inflation
        enableGuardrails: false
      };
      
      const result = calculateWithdrawal(
        500000, 
        2025, 
        2027, 
        "monatlich_fest", 
        0.06,
        0.26375,
        undefined,
        monthlyConfig
      );
      
      // Year 1: no inflation adjustment
      expect(result[2025].inflationAnpassung).toBe(0);
      
      // Year 2: 3% increase
      const expectedInflationYear2 = 24000 * 0.03; // 3% of base amount
      expect(result[2026].inflationAnpassung).toBeCloseTo(expectedInflationYear2, 2);
      
      // Year 3: compound inflation (3% for 2 years)
      const expectedInflationYear3 = 24000 * (Math.pow(1.03, 2) - 1);
      expect(result[2027].inflationAnpassung).toBeCloseTo(expectedInflationYear3, 2);
    });

    test('should apply guardrails correctly when portfolio outperforms', () => {
      const monthlyConfig: MonthlyWithdrawalConfig = {
        monthlyAmount: 2000,
        inflationRate: 0.02,
        enableGuardrails: true,
        guardrailsThreshold: 0.10 // 10% threshold
      };
      
      // High return scenario where portfolio outperforms
      const result = calculateWithdrawal(
        500000, 
        2025, 
        2027, 
        "monatlich_fest", 
        0.12, // 12% return - much higher than expected
        0.26375,
        undefined,
        monthlyConfig
      );
      
      // First year should have no portfolio adjustment
      expect(result[2025].portfolioAnpassung).toBe(0);
      
      // Later years should have positive portfolio adjustment due to good performance
      expect(result[2026].portfolioAnpassung).toBeGreaterThan(0);
    });

    test('should apply guardrails correctly when portfolio underperforms', () => {
      const monthlyConfig: MonthlyWithdrawalConfig = {
        monthlyAmount: 2000,
        inflationRate: 0.02,
        enableGuardrails: true,
        guardrailsThreshold: 0.10
      };
      
      // Low return scenario where portfolio underperforms
      const result = calculateWithdrawal(
        500000, 
        2025, 
        2027, 
        "monatlich_fest", 
        0.01, // 1% return - much lower than expected
        0.26375,
        undefined,
        monthlyConfig
      );
      
      // First year should have no portfolio adjustment
      expect(result[2025].portfolioAnpassung).toBe(0);
      
      // Later years should have negative portfolio adjustment due to poor performance
      expect(result[2026].portfolioAnpassung).toBeLessThan(0);
    });

    test('should require monthly config for monatlich_fest strategy', () => {
      expect(() => {
        calculateWithdrawal(500000, 2025, 2027, "monatlich_fest", 0.05);
      }).toThrow("Monthly configuration is required for monatlich_fest strategy");
    });

    test('should handle capital depletion in monthly strategy', () => {
      const monthlyConfig: MonthlyWithdrawalConfig = {
        monthlyAmount: 5000, // Very high withdrawal relative to capital
        inflationRate: 0.02,
        enableGuardrails: false
      };
      
      const result = calculateWithdrawal(
        100000, // Small capital
        2025, 
        2035, 
        "monatlich_fest", 
        0.02, // Low return
        0.26375,
        undefined,
        monthlyConfig
      );
      
      // Should stop calculating when capital is depleted
      const years = Object.keys(result).map(Number);
      expect(years.length).toBeLessThan(11); // Should not last all 10 years
      
      // Last year should have very low or zero capital
      const lastYear = Math.max(...years);
      expect(result[lastYear].endkapital).toBeLessThanOrEqual(0);
    });

    test('should work with default inflation rate when not specified', () => {
      const monthlyConfig: MonthlyWithdrawalConfig = {
        monthlyAmount: 2000,
        // inflationRate not specified, should default to 2%
        enableGuardrails: false
      };
      
      const result = calculateWithdrawal(
        500000, 
        2025, 
        2026, 
        "monatlich_fest", 
        0.05,
        0.26375,
        undefined,
        monthlyConfig
      );
      
      // Should use default 2% inflation rate
      const expectedInflation = 24000 * 0.02;
      expect(result[2026].inflationAnpassung).toBeCloseTo(expectedInflation, 2);
    });
  });
});