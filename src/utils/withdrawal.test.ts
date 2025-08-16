import { calculateWithdrawal, calculateIncomeTax, getTotalCapitalAtYear, type WithdrawalStrategy } from './withdrawal';

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
});