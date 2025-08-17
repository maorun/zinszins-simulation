import { calculateWithdrawal } from './withdrawal';

describe('Grundfreibetrag Tests', () => {
    test('should not apply income tax when Grundfreibetrag is disabled', () => {
        const result = calculateWithdrawal(
            100000, // starting capital
            2025, // start year
            2026, // end year
            "4prozent", // 4% rule
            0.05, // 5% return
            0.26375, // capital gains tax
            undefined, // freibetrag
            undefined, // monthly config
            undefined, // custom percentage
            false // Grundfreibetrag disabled
        );

        const year2025 = result[2025];
        expect(year2025).toBeDefined();
        expect(year2025.einkommensteuer).toBeUndefined();
        expect(year2025.genutzterGrundfreibetrag).toBeUndefined();
    });

    test('should apply income tax with Grundfreibetrag when enabled', () => {
        const grundfreibetragPerYear = {
            2025: 10908, // German basic tax allowance
            2026: 10908
        };

        const result = calculateWithdrawal(
            100000, // starting capital
            2025, // start year
            2026, // end year
            "4prozent", // 4% rule
            0.05, // 5% return
            0.26375, // capital gains tax
            undefined, // freibetrag
            undefined, // monthly config
            undefined, // custom percentage
            true, // Grundfreibetrag enabled
            grundfreibetragPerYear,
            0.25 // 25% income tax rate
        );

        const year2025 = result[2025];
        expect(year2025).toBeDefined();
        expect(year2025.einkommensteuer).toBeDefined();
        expect(year2025.genutzterGrundfreibetrag).toBeDefined();
        
        // With 4% withdrawal (4000€) and Grundfreibetrag 10908€, there should be no income tax
        expect(year2025.einkommensteuer).toBe(0);
        expect(year2025.genutzterGrundfreibetrag).toBe(4000); // withdrawal amount
    });

    test('should calculate income tax when withdrawal exceeds Grundfreibetrag', () => {
        const grundfreibetragPerYear = {
            2025: 5000, // Lower basic tax allowance for testing
            2026: 5000
        };

        const result = calculateWithdrawal(
            200000, // higher starting capital
            2025, // start year
            2026, // end year
            "4prozent", // 4% rule (8000€ withdrawal)
            0.05, // 5% return
            0.26375, // capital gains tax
            undefined, // freibetrag
            undefined, // monthly config
            undefined, // custom percentage
            true, // Grundfreibetrag enabled
            grundfreibetragPerYear,
            0.25 // 25% income tax rate
        );

        const year2025 = result[2025];
        expect(year2025).toBeDefined();
        expect(year2025.einkommensteuer).toBeDefined();
        expect(year2025.genutzterGrundfreibetrag).toBeDefined();
        
        // With 4% withdrawal (8000€) and Grundfreibetrag 5000€
        expect(year2025.genutzterGrundfreibetrag).toBe(5000);
        // Income tax should be (8000 - 5000) * 0.25 = 750€
        expect(year2025.einkommensteuer).toBe(750);
        
        // Total tax should include both capital gains tax and income tax
        expect(year2025.bezahlteSteuer).toBeGreaterThanOrEqual(750);
    });

    test('should use different Grundfreibetrag amounts per year', () => {
        const grundfreibetragPerYear = {
            2025: 10000,
            2026: 12000 // Different amount for 2026
        };

        const result = calculateWithdrawal(
            300000, // High starting capital for larger withdrawals
            2025, // start year
            2026, // end year
            "4prozent", // 4% rule (12000€ withdrawal)
            0.05, // 5% return
            0.26375, // capital gains tax
            undefined, // freibetrag
            undefined, // monthly config
            undefined, // custom percentage
            true, // Grundfreibetrag enabled
            grundfreibetragPerYear,
            0.25 // 25% income tax rate
        );

        const year2025 = result[2025];
        const year2026 = result[2026];
        
        expect(year2025).toBeDefined();
        expect(year2026).toBeDefined();
        
        // 2025: withdrawal 12000€, Grundfreibetrag 10000€ -> income tax on 2000€
        expect(year2025.genutzterGrundfreibetrag).toBe(10000);
        expect(year2025.einkommensteuer).toBe(500); // 2000 * 0.25
        
        // 2026: withdrawal amount with growth, Grundfreibetrag 12000€
        expect(year2026.genutzterGrundfreibetrag).toBeGreaterThan(0);
        expect(year2026.einkommensteuer).toBeDefined();
    });

    test('should handle zero or negative withdrawal amounts correctly', () => {
        const grundfreibetragPerYear = {
            2025: 10908
        };

        const result = calculateWithdrawal(
            1000, // Very low starting capital
            2025, // start year
            2025, // end year (one year only)
            "4prozent", // 4% rule (only 40€ withdrawal)
            0.05, // 5% return
            0.26375, // capital gains tax
            undefined, // freibetrag
            undefined, // monthly config
            undefined, // custom percentage
            true, // Grundfreibetrag enabled
            grundfreibetragPerYear,
            0.25 // 25% income tax rate
        );

        const year2025 = result[2025];
        expect(year2025).toBeDefined();
        
        // Very small withdrawal should not trigger income tax
        expect(year2025.einkommensteuer).toBe(0);
        expect(year2025.genutzterGrundfreibetrag).toBe(40); // withdrawal amount
    });
});