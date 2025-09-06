import { describe, it, expect } from 'vitest';
import { getYearlyPortfolioProgression } from '../src/utils/summary-utils';
import { convertSparplanToElements } from '../src/utils/sparplan-utils';
import type { Sparplan } from '../src/utils/sparplan-utils';

describe('Yearly Contribution Bug Investigation', () => {
  it('should correctly calculate yearly contributions for multi-year savings plan', () => {
    // Create a savings plan similar to the one in the app
    const sparplan: Sparplan = {
      id: 1,
      start: new Date('2025-09-06'),
      end: new Date('2040-10-01'),
      einzahlung: 19800
    };

    // Convert to elements (this simulates what happens in the app)
    const elements = convertSparplanToElements([sparplan], [2040, 2080], 'yearly');
    
    console.log('Created elements:');
    elements.forEach((el, i) => {
      console.log(`Element ${i}: start=${el.start}, einzahlung=${el.einzahlung}, type=${el.type}`);
    });

    // Add mock simulation data
    elements.forEach(element => {
      const startYear = new Date(element.start).getFullYear();
      element.simulation[startYear] = {
        startkapital: element.einzahlung,
        zinsen: element.einzahlung * 0.05,
        endkapital: element.einzahlung * 1.05,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0
      };
    });

    // Test the yearly progression calculation
    const progression = getYearlyPortfolioProgression(elements);
    
    console.log('\nYearly Progression:');
    progression.forEach(year => {
      console.log(`${year.year}: yearlyContribution = ${year.yearlyContribution}, should be 19800 for years 2025-2040`);
    });

    // Check that each year from 2025 to 2040 has the correct contribution
    const years2025to2040 = progression.filter(p => p.year >= 2025 && p.year <= 2040);
    
    expect(years2025to2040.length).toBe(16); // 2025 to 2040 inclusive = 16 years
    
    years2025to2040.forEach(yearData => {
      expect(yearData.yearlyContribution).toBe(19800);
    });
  });

  it('should handle savings plan with partial years correctly', () => {
    // Test edge case: savings plan that starts mid-year
    const sparplan: Sparplan = {
      id: 1,
      start: new Date('2025-06-15'), // Starts mid-year
      end: new Date('2027-03-20'),   // Ends mid-year
      einzahlung: 12000
    };

    const elements = convertSparplanToElements([sparplan], [2030, 2040], 'yearly');
    
    console.log('\nPartial year test - Created elements:');
    elements.forEach((el, i) => {
      console.log(`Element ${i}: start=${el.start}, einzahlung=${el.einzahlung}`);
    });

    // Add mock simulation data
    elements.forEach(element => {
      const startYear = new Date(element.start).getFullYear();
      element.simulation[startYear] = {
        startkapital: element.einzahlung,
        zinsen: 0,
        endkapital: element.einzahlung,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0
      };
    });

    const progression = getYearlyPortfolioProgression(elements);
    
    console.log('\nPartial year progression:');
    progression.forEach(year => {
      console.log(`${year.year}: yearlyContribution = ${year.yearlyContribution}`);
    });

    // Should have contributions for 2025, 2026, 2027
    const relevantYears = progression.filter(p => p.year >= 2025 && p.year <= 2027);
    expect(relevantYears.length).toBe(3);
    
    relevantYears.forEach(yearData => {
      expect(yearData.yearlyContribution).toBe(12000);
    });
  });
});