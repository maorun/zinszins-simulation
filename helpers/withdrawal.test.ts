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
      createMockElement(2023, 10000, 12000, 100, lastSimYear),
      createMockElement(2024, 5000, 6000, 50, lastSimYear),
    ];

    const { result } = calculateWithdrawal(
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

    const proportionSold = entnahme / 12000;
    const costBasisSold = 10000 * proportionSold;
    const accumVorabSold = 100 * proportionSold;
    const expectedGain = entnahme - costBasisSold - accumVorabSold;
    const expectedTaxableGain = expectedGain * (1 - teilfreistellungsquote);
    const expectedTaxOnGains = Math.max(0, expectedTaxableGain - freibetrag) * taxRate;
    const freibetragUsedOnGains = Math.min(expectedTaxableGain, freibetrag);
    const remainingFreibetrag = freibetrag - freibetragUsedOnGains;
    const basiszins = getBasiszinsForYear(withdrawalStartYear);
    const l1_val_after_sale = 12000 - entnahme;
    const l1_val_after_growth = l1_val_after_sale * (1 + returnConfig.fixedRate!);
    const l1_vorab = calculateVorabpauschale(l1_val_after_sale, l1_val_after_growth, basiszins);
    const l1_tax_potential = calculateSteuerOnVorabpauschale(l1_vorab, taxRate, teilfreistellungsquote);
    const l2_val_after_sale = 6000;
    const l2_val_after_growth = l2_val_after_sale * (1 + returnConfig.fixedRate!);
    const l2_vorab = calculateVorabpauschale(l2_val_after_sale, l2_val_after_growth, basiszins);
    const l2_tax_potential = calculateSteuerOnVorabpauschale(l2_vorab, taxRate, teilfreistellungsquote);
    const totalPotentialVorabTax = l1_tax_potential + l2_tax_potential;
    const expectedTaxOnVorabpauschale = Math.max(0, totalPotentialVorabTax - remainingFreibetrag);
    const totalExpectedTax = expectedTaxOnGains + expectedTaxOnVorabpauschale;
    expect(resultYear.bezahlteSteuer).toBeCloseTo(totalExpectedTax);
  });

  test('should apply inflation to withdrawal amount', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)];

    const { result } = calculateWithdrawal(
      mockElements,
      withdrawalStartYear,
      withdrawalStartYear + 1, // 2 years
      "4prozent",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      { [withdrawalStartYear]: freibetrag, [withdrawalStartYear + 1]: freibetrag },
      undefined, // monthlyConfig
      undefined, // customPercentage
      false, // enableGrundfreibetrag
      undefined,
      undefined,
      { inflationRate: 0.10 } // 10% inflation for easy testing
    );

    const entnahme1 = result[withdrawalStartYear].entnahme;
    const entnahme2 = result[withdrawalStartYear + 1].entnahme;

    expect(entnahme2).toBeCloseTo(entnahme1 * 1.10);
  });

  test('should apply Grundfreibetrag and income tax', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)];
    const incomeTaxRate = 0.25;
    const yearlyGrundfreibetrag = 10000;

    const { result } = calculateWithdrawal(
      mockElements,
      withdrawalStartYear,
      withdrawalStartYear,
      "4prozent",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      { [withdrawalStartYear]: freibetrag },
      undefined,
      undefined,
      true, // enableGrundfreibetrag
      { [withdrawalStartYear]: yearlyGrundfreibetrag },
      incomeTaxRate
    );

    const resultYear = result[withdrawalStartYear];
    const entnahme = resultYear.entnahme;

    const expectedEinkommensteuer = Math.max(0, (entnahme - yearlyGrundfreibetrag)) * incomeTaxRate;
    const expectedGenutzterGrundfreibetrag = Math.min(entnahme, yearlyGrundfreibetrag);

    expect(resultYear.einkommensteuer).toBe(expectedEinkommensteuer);
    expect(resultYear.genutzterGrundfreibetrag).toBe(expectedGenutzterGrundfreibetrag);
    expect(resultYear.bezahlteSteuer).toBeGreaterThanOrEqual(expectedEinkommensteuer);
  });
});
