import { describe, test, expect } from 'vitest';
import { calculateWithdrawal } from './withdrawal';
import type { SparplanElement } from '../src/utils/sparplan-utils';
import type { ReturnConfiguration } from '../src/utils/random-returns';
import { getBasiszinsForYear, calculateVorabpauschale, calculateSteuerOnVorabpauschale } from './steuer';

// Helper to create mock SparplanElement data
const createMockElement = (
  startYear: number, // The year the investment was made
  einzahlung: number,
  finalValueBeforeWithdrawal: number, // The value at the end of the last simulation year
  vorabpauschaleAccumulated: number,
  lastSimYear: number // The year for which to create the simulation data
): SparplanElement => ({
  start: new Date(`${startYear}-01-01`).toISOString(),
  type: 'sparplan',
  einzahlung: einzahlung,
  gewinn: 0,
  simulation: {
    [lastSimYear]: {
      startkapital: einzahlung,
      endkapital: finalValueBeforeWithdrawal,
      zinsen: 0,
      bezahlteSteuer: 0,
      genutzterFreibetrag: 0,
      vorabpauschale: vorabpauschaleAccumulated, // For simplicity, assume last year's vorab = total accumulated
      vorabpauschaleAccumulated: vorabpauschaleAccumulated,
    },
  },
});

describe('Withdrawal Calculations with FIFO', () => {
  const taxRate = 0.26375;
  const teilfreistellungsquote = 0.3;
  const freibetrag = 1000;
  const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }; // 5% return

  test('should correctly calculate taxes for a partial withdrawal from the oldest layer', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;

    const mockElements: SparplanElement[] = [
      // Oldest layer (should be sold first)
      createMockElement(2023, 10000, 12000, 100, lastSimYear),
      // Newest layer
      createMockElement(2024, 5000, 6000, 50, lastSimYear),
    ];

    const result = calculateWithdrawal(
      mockElements,
      withdrawalStartYear,
      withdrawalStartYear, // end year
      "4prozent", // This strategy results in a 720 withdrawal amount
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      { [withdrawalStartYear]: freibetrag }
    );

    const resultYear = result[withdrawalStartYear];
    expect(resultYear).toBeDefined();

    const initialCapital = 12000 + 6000;
    const entnahme = initialCapital * 0.04; // 18000 * 0.04 = 720
    expect(resultYear.entnahme).toBeCloseTo(entnahme);

    // --- Manual Tax Calculation for Assertion ---

    // 1. Tax on Realized Gains
    const proportionSold = entnahme / 12000; // 720 / 12000 = 0.06
    const costBasisSold = 10000 * proportionSold; // 10000 * 0.06 = 600
    const accumVorabSold = 100 * proportionSold; // 100 * 0.06 = 6

    const expectedGain = entnahme - costBasisSold - accumVorabSold; // 720 - 600 - 6 = 114
    const expectedTaxableGain = expectedGain * (1 - teilfreistellungsquote); // 114 * 0.7 = 79.8
    const expectedTaxOnGains = Math.max(0, expectedTaxableGain - freibetrag) * taxRate; // max(0, 79.8 - 1000) * tax_rate = 0

    expect(expectedTaxOnGains).toBe(0);

    const freibetragUsedOnGains = Math.min(expectedTaxableGain, freibetrag); // min(79.8, 1000) = 79.8
    const remainingFreibetrag = freibetrag - freibetragUsedOnGains; // 1000 - 79.8 = 920.2

    // 2. Tax on Vorabpauschale for remaining assets
    const basiszins = getBasiszinsForYear(withdrawalStartYear);
    let totalPotentialVorabTax = 0;

    // Layer 1 (remaining)
    const l1_val_after_sale = 12000 - entnahme; // 11280
    const l1_val_after_growth = l1_val_after_sale * (1 + returnConfig.fixedRate!); // 11280 * 1.05 = 11844
    const l1_vorab = calculateVorabpauschale(l1_val_after_sale, l1_val_after_growth, basiszins);
    totalPotentialVorabTax += calculateSteuerOnVorabpauschale(l1_vorab, taxRate, teilfreistellungsquote);

    // Layer 2 (untouched)
    const l2_val_after_sale = 6000;
    const l2_val_after_growth = l2_val_after_sale * (1 + returnConfig.fixedRate!); // 6000 * 1.05 = 6300
    const l2_vorab = calculateVorabpauschale(l2_val_after_sale, l2_val_after_growth, basiszins);
    totalPotentialVorabTax += calculateSteuerOnVorabpauschale(l2_vorab, taxRate, teilfreistellungsquote);

    const expectedTaxOnVorabpauschale = Math.max(0, totalPotentialVorabTax - remainingFreibetrag); // max(0, tax - 920.2) should be 0

    // 3. Final Assertions
    const totalExpectedTax = expectedTaxOnGains + expectedTaxOnVorabpauschale;
    expect(resultYear.bezahlteSteuer).toBeCloseTo(totalExpectedTax);
  });
});
