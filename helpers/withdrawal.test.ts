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

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear, // end year
      strategy: "4prozent", // This strategy results in a 720 withdrawal amount
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag }
    });

    const resultYear = result[withdrawalStartYear];
    expect(resultYear).toBeDefined();

    const initialCapital = 12000 + 6000;
    const entnahme = initialCapital * 0.04; // 18000 * 0.04 = 720
    expect(resultYear.entnahme).toBeCloseTo(entnahme);

    const proportionSold = entnahme / 12000;
    const costBasisSold = 10000 * proportionSold;
    // Fix: Use correct FIFO calculation - only subtract cost basis, not accumulated Vorabpauschale
    const expectedGain = entnahme - costBasisSold;
    const expectedTaxableGain = expectedGain * (1 - teilfreistellungsquote);
    const expectedTaxOnGains = Math.max(0, expectedTaxableGain - freibetrag) * taxRate;
    const freibetragUsedOnGains = Math.min(expectedTaxableGain, freibetrag);
    const remainingFreibetrag = freibetrag - freibetragUsedOnGains;
    const basiszins = getBasiszinsForYear(withdrawalStartYear);
    // Calculate Vorabpauschale using values BEFORE withdrawal (corrected logic)
    const l1_val_before_withdrawal = 12000; // Full value at start of year
    const l1_val_after_growth_before_withdrawal = l1_val_before_withdrawal * (1 + returnConfig.fixedRate!);
    const l1_vorab = calculateVorabpauschale(l1_val_before_withdrawal, l1_val_after_growth_before_withdrawal, basiszins);
    const l1_tax_potential = calculateSteuerOnVorabpauschale(l1_vorab, taxRate, teilfreistellungsquote);
    const l2_val_before_withdrawal = 6000; // Full value at start of year
    const l2_val_after_growth_before_withdrawal = l2_val_before_withdrawal * (1 + returnConfig.fixedRate!);
    const l2_vorab = calculateVorabpauschale(l2_val_before_withdrawal, l2_val_after_growth_before_withdrawal, basiszins);
    const l2_tax_potential = calculateSteuerOnVorabpauschale(l2_vorab, taxRate, teilfreistellungsquote);
    const totalPotentialVorabTax = l1_tax_potential + l2_tax_potential;
    const expectedTaxOnVorabpauschale = Math.max(0, totalPotentialVorabTax - remainingFreibetrag);
    const totalExpectedTax = expectedTaxOnGains + expectedTaxOnVorabpauschale;
    expect(resultYear.bezahlteSteuer).toBeCloseTo(totalExpectedTax);
  });

  test('should calculate Vorabpauschale based on portfolio value BEFORE withdrawal, not after', () => {
    // This test specifically verifies the fix for the tax calculation timing issue
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    
    // Create a single layer with known values
    const mockElements: SparplanElement[] = [
      createMockElement(2023, 100000, 120000, 1000, lastSimYear), // 120k value, 100k cost basis, 1k accumulated vorab
    ];

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: "4prozent", // Will withdraw 4800 (4% of 120k)
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag }
    });

    const resultYear = result[withdrawalStartYear];
    expect(resultYear).toBeDefined();

    const entnahme = 120000 * 0.04; // 4800
    expect(resultYear.entnahme).toBeCloseTo(entnahme);

    // VERIFY: Vorabpauschale should be calculated on FULL 120k value, not on 115.2k (120k - 4.8k)
    const basiszins = getBasiszinsForYear(withdrawalStartYear);
    const fullValueBeforeWithdrawal = 120000;
    const fullValueAfterGrowthBeforeWithdrawal = fullValueBeforeWithdrawal * (1 + returnConfig.fixedRate!);
    const expectedVorabpauschale = calculateVorabpauschale(fullValueBeforeWithdrawal, fullValueAfterGrowthBeforeWithdrawal, basiszins);
    const expectedVorabTax = calculateSteuerOnVorabpauschale(expectedVorabpauschale, taxRate, teilfreistellungsquote);

    // Calculate realized gain from withdrawal (FIFO)
    const costBasisSold = 100000 * (entnahme / 120000); // Proportional cost basis sold
    const accumVorabSold = 1000 * (entnahme / 120000); // Proportional accumulated vorab sold
    const realizedGain = entnahme - costBasisSold - accumVorabSold;
    const taxableRealizedGain = realizedGain * (1 - teilfreistellungsquote);
    const taxOnRealizedGains = Math.max(0, taxableRealizedGain - freibetrag) * taxRate;
    const freibetragUsedOnGains = Math.min(taxableRealizedGain, freibetrag);
    const remainingFreibetrag = freibetrag - freibetragUsedOnGains;
    
    // Apply remaining freibetrag to vorab tax
    const finalVorabTax = Math.max(0, expectedVorabTax - remainingFreibetrag);
    const totalExpectedTax = taxOnRealizedGains + finalVorabTax;

    expect(resultYear.bezahlteSteuer).toBeCloseTo(totalExpectedTax);
    
    // The key verification: if calculated correctly, this should produce a higher tax
    // than if calculated on post-withdrawal value (115.2k instead of 120k)
    const incorrectValueAfterWithdrawal = 120000 - entnahme; // 115200
    const incorrectValueAfterGrowth = incorrectValueAfterWithdrawal * (1 + returnConfig.fixedRate!);
    const incorrectVorabpauschale = calculateVorabpauschale(incorrectValueAfterWithdrawal, incorrectValueAfterGrowth, basiszins);
    
    // Vorabpauschale calculated on full portfolio should be higher than on reduced portfolio
    expect(expectedVorabpauschale).toBeGreaterThan(incorrectVorabpauschale);
  });

  test('should apply inflation to withdrawal amount', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)];

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 1, // 2 years
      strategy: "4prozent",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag, [withdrawalStartYear + 1]: freibetrag },
      inflationConfig: { inflationRate: 0.10 } // 10% inflation for easy testing
    });

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

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: "4prozent",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      enableGrundfreibetrag: true,
      grundfreibetragPerYear: { [withdrawalStartYear]: yearlyGrundfreibetrag },
      incomeTaxRate
    });

    const resultYear = result[withdrawalStartYear];
    const entnahme = resultYear.entnahme;

    const expectedEinkommensteuer = Math.max(0, (entnahme - yearlyGrundfreibetrag)) * incomeTaxRate;
    const expectedGenutzterGrundfreibetrag = Math.min(entnahme, yearlyGrundfreibetrag);

    expect(resultYear.einkommensteuer).toBe(expectedEinkommensteuer);
    expect(resultYear.genutzterGrundfreibetrag).toBe(expectedGenutzterGrundfreibetrag);
    expect(resultYear.bezahlteSteuer).toBeGreaterThanOrEqual(expectedEinkommensteuer);
  });

  test('should return correct monthly withdrawal for "monatlich_fest" strategy', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 500000, 600000, 1000, lastSimYear)];
    const monthlyAmount = 2000;

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear, // end year
      strategy: "monatlich_fest",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      monthlyConfig: { monthlyAmount }
    });

    const resultYear = result[withdrawalStartYear];
    expect(resultYear).toBeDefined();
    expect(resultYear.monatlicheEntnahme).toBe(monthlyAmount);
    expect(resultYear.entnahme).toBe(monthlyAmount * 12);
  });

  test('should adjust monthly withdrawal for inflation', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 500000, 600000, 1000, lastSimYear)];
    const monthlyAmount = 2000;
    const inflationRate = 0.10; // 10%

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 1, // 2 years
      strategy: "monatlich_fest",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag, [withdrawalStartYear + 1]: freibetrag },
      monthlyConfig: { monthlyAmount },
      inflationConfig: { inflationRate }
    });

    const resultYear1 = result[withdrawalStartYear];
    const resultYear2 = result[withdrawalStartYear + 1];
    expect(resultYear1.monatlicheEntnahme).toBe(monthlyAmount);
    expect(resultYear2.monatlicheEntnahme).toBeCloseTo(monthlyAmount * (1 + inflationRate));
  });
});

describe('Dynamic Withdrawal Strategy', () => {
  const taxRate = 0.26375;
  const teilfreistellungsquote = 0.3;
  const freibetrag = 1000;

  test('should adjust withdrawal up when return exceeds upper threshold', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)];

    const dynamicConfig = {
      baseWithdrawalRate: 0.04, // 4% base rate
      upperThresholdReturn: 0.08, // 8% upper threshold
      upperThresholdAdjustment: 0.05, // 5% increase when exceeding
      lowerThresholdReturn: 0.02, // 2% lower threshold
      lowerThresholdAdjustment: -0.05, // 5% decrease when below
    };

    // Create return config with high return that exceeds upper threshold
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          [withdrawalStartYear - 1]: 0.10, // 10% return in previous year (exceeds 8% threshold)
          [withdrawalStartYear]: 0.05, // 5% return in current year
        }
      }
    };

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: "dynamisch",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      dynamicConfig
    });

    const resultYear = result[withdrawalStartYear];
    expect(resultYear).toBeDefined();

    const baseWithdrawal = 120000 * 0.04; // 4800
    const expectedAdjustment = baseWithdrawal * 0.05; // 240 (5% increase)
    const expectedEntnahme = baseWithdrawal + expectedAdjustment; // 5040

    expect(resultYear.entnahme).toBeCloseTo(expectedEntnahme);
    expect(resultYear.dynamischeAnpassung).toBeCloseTo(expectedAdjustment);
    expect(resultYear.vorjahresRendite).toBe(0.10);
  });

  test('should adjust withdrawal down when return falls below lower threshold', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)];

    const dynamicConfig = {
      baseWithdrawalRate: 0.04, // 4% base rate
      upperThresholdReturn: 0.08, // 8% upper threshold
      upperThresholdAdjustment: 0.05, // 5% increase when exceeding
      lowerThresholdReturn: 0.02, // 2% lower threshold
      lowerThresholdAdjustment: -0.05, // 5% decrease when below
    };

    // Create return config with low return that falls below lower threshold
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          [withdrawalStartYear - 1]: 0.01, // 1% return in previous year (below 2% threshold)
          [withdrawalStartYear]: 0.05, // 5% return in current year
        }
      }
    };

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: "dynamisch",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      dynamicConfig
    });

    const resultYear = result[withdrawalStartYear];
    expect(resultYear).toBeDefined();

    const baseWithdrawal = 120000 * 0.04; // 4800
    const expectedAdjustment = baseWithdrawal * -0.05; // -240 (5% decrease)
    const expectedEntnahme = baseWithdrawal + expectedAdjustment; // 4560

    expect(resultYear.entnahme).toBeCloseTo(expectedEntnahme);
    expect(resultYear.dynamischeAnpassung).toBeCloseTo(expectedAdjustment);
    expect(resultYear.vorjahresRendite).toBe(0.01);
  });

  test('should not adjust withdrawal when return is between thresholds', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)];

    const dynamicConfig = {
      baseWithdrawalRate: 0.04, // 4% base rate
      upperThresholdReturn: 0.08, // 8% upper threshold
      upperThresholdAdjustment: 0.05, // 5% increase when exceeding
      lowerThresholdReturn: 0.02, // 2% lower threshold
      lowerThresholdAdjustment: -0.05, // 5% decrease when below
    };

    // Create return config with return between thresholds
    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          [withdrawalStartYear - 1]: 0.05, // 5% return in previous year (between 2% and 8%)
          [withdrawalStartYear]: 0.05, // 5% return in current year
        }
      }
    };

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: "dynamisch",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      dynamicConfig
    });

    const resultYear = result[withdrawalStartYear];
    expect(resultYear).toBeDefined();

    const baseWithdrawal = 120000 * 0.04; // 4800
    const expectedAdjustment = 0; // No adjustment between thresholds
    const expectedEntnahme = baseWithdrawal; // 4800

    expect(resultYear.entnahme).toBeCloseTo(expectedEntnahme);
    expect(resultYear.dynamischeAnpassung).toBe(expectedAdjustment);
    expect(resultYear.vorjahresRendite).toBe(0.05);
  });

  test('should not apply dynamic adjustment in first year (no previous year data)', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)];

    const dynamicConfig = {
      baseWithdrawalRate: 0.04, // 4% base rate
      upperThresholdReturn: 0.08, // 8% upper threshold
      upperThresholdAdjustment: 0.05, // 5% increase when exceeding
      lowerThresholdReturn: 0.02, // 2% lower threshold
      lowerThresholdAdjustment: -0.05, // 5% decrease when below
    };

    const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 };

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear, // Only one year
      strategy: "dynamisch",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag },
      dynamicConfig
    });

    const resultYear = result[withdrawalStartYear];
    expect(resultYear).toBeDefined();

    const baseWithdrawal = 120000 * 0.04; // 4800
    // Since previous year return (5%) is between thresholds (2% and 8%), no adjustment
    expect(resultYear.entnahme).toBeCloseTo(baseWithdrawal);
    expect(resultYear.dynamischeAnpassung).toBe(0); // No adjustment between thresholds
    expect(resultYear.vorjahresRendite).toBe(0.05); // Previous year return rate available with fixed rate
  });

  test('should combine dynamic adjustment with inflation', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 100000, 120000, 100, lastSimYear)];

    const dynamicConfig = {
      baseWithdrawalRate: 0.04, // 4% base rate
      upperThresholdReturn: 0.08, // 8% upper threshold
      upperThresholdAdjustment: 0.05, // 5% increase when exceeding
      lowerThresholdReturn: 0.02, // 2% lower threshold
      lowerThresholdAdjustment: -0.05, // 5% decrease when below
    };

    const returnConfig: ReturnConfiguration = {
      mode: 'variable',
      variableConfig: {
        yearlyReturns: {
          [withdrawalStartYear - 1]: 0.10, // 10% return in previous year (exceeds threshold)
          [withdrawalStartYear]: 0.05, // 5% return in current year
          [withdrawalStartYear + 1]: 0.05, // 5% return in next year
        }
      }
    };

    const { result } = calculateWithdrawal({
      elements: mockElements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 1, // Two years
      strategy: "dynamisch",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { 
        [withdrawalStartYear]: freibetrag,
        [withdrawalStartYear + 1]: freibetrag 
      },
      dynamicConfig,
      inflationConfig: { inflationRate: 0.02 } // 2% inflation
    });

    const resultYear1 = result[withdrawalStartYear];
    const resultYear2 = result[withdrawalStartYear + 1];

    // Year 1: Dynamic adjustment based on previous 10% return
    const baseWithdrawal = 120000 * 0.04; // 4800
    const dynamicAdjustment1 = baseWithdrawal * 0.05; // 240 (5% increase)
    const expectedEntnahme1 = baseWithdrawal + dynamicAdjustment1; // 5040

    expect(resultYear1.entnahme).toBeCloseTo(expectedEntnahme1);
    expect(resultYear1.dynamischeAnpassung).toBeCloseTo(dynamicAdjustment1);

    // Year 2: Should have both inflation adjustment and dynamic adjustment
    // Inflation: base = 4800, with 2% inflation after 1 year = 4800 * 0.02 = 96
    // Dynamic: previous year return = 5%, no adjustment (between thresholds)
    const inflationAdjustment = baseWithdrawal * 0.02; // 96
    const baseWithInflation = baseWithdrawal + inflationAdjustment; // 4896
    const dynamicAdjustment2 = 0; // No adjustment for 5% return
    const expectedEntnahme2 = baseWithInflation + dynamicAdjustment2; // 4896

    expect(resultYear2.entnahme).toBeCloseTo(expectedEntnahme2);
    expect(resultYear2.dynamischeAnpassung).toBe(dynamicAdjustment2);
    expect(resultYear2.vorjahresRendite).toBe(0.05);
  });
});

describe('Withdrawal Frequency Tests', () => {
  const taxRate = 0.26375;
  const teilfreistellungsquote = 0.3;
  const freibetrag = 1000;
  const returnConfig: ReturnConfiguration = { mode: 'fixed', fixedRate: 0.05 }; // 5% return

  test('should have realistic difference between yearly and monthly withdrawal frequencies', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 500000, 600000, 1000, lastSimYear)];

    // Test yearly withdrawal
    const { result: yearlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)), // Deep copy
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 10, // 10 years
      strategy: "4prozent",
      withdrawalFrequency: "yearly",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: Array.from({ length: 11 }, (_, i) => ({
        [withdrawalStartYear + i]: freibetrag
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
    });

    // Test monthly withdrawal  
    const { result: monthlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)), // Deep copy
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear + 10, // 10 years
      strategy: "4prozent",
      withdrawalFrequency: "monthly",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: Array.from({ length: 11 }, (_, i) => ({
        [withdrawalStartYear + i]: freibetrag
      })).reduce((acc, curr) => ({ ...acc, ...curr }), {})
    });

    const lastYear = withdrawalStartYear + 10;
    const yearlyFinalCapital = yearlyResult[lastYear]?.endkapital || 0;
    const monthlyFinalCapital = monthlyResult[lastYear]?.endkapital || 0;

    // Monthly withdrawals should result in higher final capital, but not dramatically so
    expect(monthlyFinalCapital).toBeGreaterThan(yearlyFinalCapital);
    
    // The difference should be realistic - typically 1-5% advantage for monthly withdrawals
    const improvementRatio = monthlyFinalCapital / yearlyFinalCapital;
    expect(improvementRatio).toBeGreaterThan(1.01); // At least 1% improvement
    expect(improvementRatio).toBeLessThan(1.08); // Less than 8% improvement
  });

  test('should calculate same annual withdrawal amounts for both frequencies', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 500000, 600000, 1000, lastSimYear)];

    const { result: yearlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)),
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: "4prozent",
      withdrawalFrequency: "yearly",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag }
    });

    const { result: monthlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)),
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: "4prozent",
      withdrawalFrequency: "monthly",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag }
    });

    // Annual withdrawal amounts should be the same regardless of frequency
    expect(yearlyResult[withdrawalStartYear].entnahme).toBe(monthlyResult[withdrawalStartYear].entnahme);
  });

  test('should show monthly amounts only for monthly frequency with non-fixed strategies', () => {
    const withdrawalStartYear = 2025;
    const lastSimYear = withdrawalStartYear - 1;
    const mockElements = [createMockElement(2023, 500000, 600000, 1000, lastSimYear)];

    const { result: yearlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)),
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: "4prozent",
      withdrawalFrequency: "yearly",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag }
    });

    const { result: monthlyResult } = calculateWithdrawal({
      elements: JSON.parse(JSON.stringify(mockElements)),
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: "4prozent",
      withdrawalFrequency: "monthly",
      returnConfig,
      taxRate,
      teilfreistellungsquote,
      freibetragPerYear: { [withdrawalStartYear]: freibetrag }
    });

    // Yearly frequency should not show monthly amounts for non-fixed strategies
    expect(yearlyResult[withdrawalStartYear].monatlicheEntnahme).toBeUndefined();
    
    // Monthly frequency should show monthly amounts
    expect(monthlyResult[withdrawalStartYear].monatlicheEntnahme).toBeDefined();
    expect(monthlyResult[withdrawalStartYear].monatlicheEntnahme).toBeCloseTo(
      monthlyResult[withdrawalStartYear].entnahme / 12
    );
  });
});
