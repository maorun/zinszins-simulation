import { describe, test, expect } from 'vitest';
import { getBasiszinsForYear } from './steuer';
import { simulate } from './simulate';
import { calculateWithdrawal } from './withdrawal';

function createSparplanElement(start: string, einzahlung: number) {
    return {
        id: "test-element",
        start,
        end: "",
        einzahlung,
        gewinn: 0,
        type: 'einmalzahlung' as const,
        simulation: {}
    };
}

describe('Year-specific Basiszins for Vorabpauschale', () => {
    test('getBasiszinsForYear should return correct historical rates', () => {
        expect(getBasiszinsForYear(2020)).toBe(0.0070); // 0.70%
        expect(getBasiszinsForYear(2021)).toBe(0.0070); // 0.70%
        expect(getBasiszinsForYear(2022)).toBe(0.0180); // 1.80%
        expect(getBasiszinsForYear(2023)).toBe(0.0255); // 2.55%
    });

    test('getBasiszinsForYear should fallback to latest for unknown years', () => {
        // Test future year not in table
        expect(getBasiszinsForYear(2030)).toBe(0.0255); // Should use 2025 (latest)
        
        // Test very old year not in table
        expect(getBasiszinsForYear(2010)).toBe(0.0255); // Should use latest available
    });

    test('simulation should use different basiszins for different years', () => {
        const elements = [createSparplanElement('2020-01-01', 50000)];
        
        const result = simulate(
            2020,
            2023,
            elements,
            0.05, // 5% return
            0.26375,
            'yearly'
        );

        expect(result).toHaveLength(1);
        
        // Each year should have simulation data
        expect(result[0].simulation[2020]).toBeDefined();
        expect(result[0].simulation[2021]).toBeDefined();
        expect(result[0].simulation[2022]).toBeDefined();
        expect(result[0].simulation[2023]).toBeDefined();
        
        // Get used freibetrag values (which reflect the Vorabpauschale calculation)
        const used2020 = result[0].simulation[2020].genutzterFreibetrag;
        const used2022 = result[0].simulation[2022].genutzterFreibetrag;
        const used2023 = result[0].simulation[2023].genutzterFreibetrag;
        
        // All should be positive (some freibetrag used)
        expect(used2020).toBeGreaterThan(0);
        expect(used2022).toBeGreaterThan(0);
        expect(used2023).toBeGreaterThan(0);
        
        // 2022 should use more freibetrag than 2020 due to higher basiszins (1.8% vs 0.7%)
        expect(used2022).toBeGreaterThan(used2020);
        
        // 2023 should use more freibetrag than 2022 due to higher basiszins (2.55% vs 1.8%)
        expect(used2023).toBeGreaterThan(used2022);
    });

    test('simulation should handle mixed year ranges with varying basiszins', () => {
        const elements = [createSparplanElement('2021-01-01', 200000)]; // Larger amount
        
        const result = simulate(
            2021,
            2024,
            elements,
            0.08, // 8% return to generate more significant tax
            0.26375,
            'yearly'
        );

        expect(result).toHaveLength(1);
        
        // All years should have simulation data
        for (let year = 2021; year <= 2024; year++) {
            expect(result[0].simulation[year]).toBeDefined();
            expect(result[0].simulation[year].bezahlteSteuer).toBeGreaterThanOrEqual(0);
            expect(result[0].simulation[year].genutzterFreibetrag).toBeGreaterThan(0);
        }
        
        // Verify that different years use different amounts of freibetrag
        // This proves that different basiszins values are being used
        const used2021 = result[0].simulation[2021].genutzterFreibetrag;
        const used2022 = result[0].simulation[2022].genutzterFreibetrag;
        const used2023 = result[0].simulation[2023].genutzterFreibetrag;
        
        // Each year should use increasing amounts of freibetrag due to higher basiszins rates
        expect(used2022).toBeGreaterThan(used2021); // 1.8% vs 0.7%
        expect(used2023).toBeGreaterThan(used2022); // 2.55% vs 1.8%
    });

    test('withdrawal calculations should use year-specific basiszins', () => {
        const startingCapital = 500000;
        
        const withdrawal2021 = calculateWithdrawal(
            startingCapital,
            2021,
            2021,
            '4prozent',
            0.05,
            0.26375
        );
        
        const withdrawal2023 = calculateWithdrawal(
            startingCapital,
            2023,
            2023,
            '4prozent',
            0.05,
            0.26375
        );
        
        expect(withdrawal2021[2021]).toBeDefined();
        expect(withdrawal2023[2023]).toBeDefined();
        
        // Both should use some freibetrag
        expect(withdrawal2021[2021].genutzterFreibetrag).toBeGreaterThan(0);
        expect(withdrawal2023[2023].genutzterFreibetrag).toBeGreaterThan(0);
        
        // 2023 should use more freibetrag than 2021 due to higher basiszins (2.55% vs 0.7%)
        expect(withdrawal2023[2023].genutzterFreibetrag).toBeGreaterThan(withdrawal2021[2021].genutzterFreibetrag);
    });
});