import { describe, it, expect } from 'vitest';
import { getYearlyPortfolioProgression } from '../src/utils/summary-utils';
import { convertSparplanToElements } from '../src/utils/sparplan-utils';
import type { Sparplan } from '../src/utils/sparplan-utils';

describe('Monthly Mode Bug Investigation', () => {
  it('should correctly calculate yearly contributions for monthly savings plan', () => {
    // Create a savings plan similar to the one in the app (Sept 2025 to Oct 2040)
    const sparplan: Sparplan = {
      id: 1,
      start: new Date('2025-09-06'),
      end: new Date('2040-10-01'),
      einzahlung: 19800 // Annual amount
    };

    // Convert to elements in MONTHLY mode (this simulates what happens in the app)
    const elements = convertSparplanToElements([sparplan], [2040, 2080], 'monthly');
    
    console.log('Created monthly elements (first few):');
    elements.slice(0, 5).forEach((el, i) => {
      console.log(`Element ${i}: start=${el.start}, einzahlung=${el.einzahlung}, type=${el.type}`);
    });

    // Add mock simulation data for all elements
    elements.forEach(element => {
      const startYear = new Date(element.start).getFullYear();
      if (!element.simulation[startYear]) {
        element.simulation[startYear] = {
          startkapital: element.einzahlung,
          zinsen: element.einzahlung * 0.05,
          endkapital: element.einzahlung * 1.05,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0
        };
      }
    });

    // Test the yearly progression calculation
    const progression = getYearlyPortfolioProgression(elements);
    
    console.log('\nMonthly mode yearly progression:');
    progression.slice(0, 5).forEach(year => {
      console.log(`${year.year}: yearlyContribution = ${year.yearlyContribution}, should be ~19800 for full years`);
    });

    // Check specific years
    const year2025 = progression.find(p => p.year === 2025);
    const year2026 = progression.find(p => p.year === 2026);
    const year2039 = progression.find(p => p.year === 2039);
    const year2040 = progression.find(p => p.year === 2040);
    
    console.log(`\n2025: yearlyContribution = ${year2025?.yearlyContribution} (partial year, Sept-Dec)`);
    console.log(`2026: yearlyContribution = ${year2026?.yearlyContribution} (should be 19800)`);
    console.log(`2039: yearlyContribution = ${year2039?.yearlyContribution} (should be 19800)`);
    console.log(`2040: yearlyContribution = ${year2040?.yearlyContribution} (partial year, Jan-Sept)`);

    // For full years (not first/last), contribution should be 19800
    if (year2026) {
      expect(year2026.yearlyContribution).toBe(19800);
    }
    if (year2039) {
      expect(year2039.yearlyContribution).toBe(19800);
    }
    
    // For partial years, check the expected amounts
    if (year2025) {
      expect(year2025.yearlyContribution).toBe(6600); // 4 months × 1650
    }
    if (year2040) {
      expect(year2040.yearlyContribution).toBe(16500); // 10 months × 1650 (Jan-Oct, but savings plan ends Oct 1)
    }
  });
});