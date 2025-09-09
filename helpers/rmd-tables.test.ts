import { describe, it, expect } from "vitest";
import {
    calculateRMDDivisor,
    calculateRMDWithdrawal,
    getRMDDescription,
    GERMAN_LIFE_EXPECTANCY_2020_22
} from "./rmd-tables";

describe("RMD Tables and Calculations", () => {
    describe("calculateRMDDivisor", () => {
        it("should return correct divisor for age within table", () => {
            expect(calculateRMDDivisor(65)).toBe(19.4);
            expect(calculateRMDDivisor(70)).toBe(15.4);
            expect(calculateRMDDivisor(75)).toBe(11.7);
            expect(calculateRMDDivisor(80)).toBe(8.5);
        });

        it("should handle ages below 50 by using age 50 data", () => {
            expect(calculateRMDDivisor(45)).toBe(GERMAN_LIFE_EXPECTANCY_2020_22[50]);
            expect(calculateRMDDivisor(30)).toBe(32.8); // Should use age 50 value
        });

        it("should handle very old ages with minimum divisor", () => {
            expect(calculateRMDDivisor(105)).toBe(1.0);
            expect(calculateRMDDivisor(120)).toBe(1.0);
        });

        it("should use custom life expectancy when specified", () => {
            expect(calculateRMDDivisor(65, 'custom', 25)).toBe(25);
            expect(calculateRMDDivisor(70, 'custom', 20.5)).toBe(20.5);
        });

        it("should enforce minimum divisor of 1.0 for custom values", () => {
            expect(calculateRMDDivisor(95, 'custom', 0.5)).toBe(1.0);
            expect(calculateRMDDivisor(90, 'custom', -5)).toBe(1.0);
        });
    });

    describe("calculateRMDWithdrawal", () => {
        it("should calculate correct withdrawal amount", () => {
            const portfolioValue = 500000; // €500,000
            
            // At age 65: divisor 19.4, withdrawal should be 500000 / 19.4 ≈ €25,773
            const withdrawal65 = calculateRMDWithdrawal(portfolioValue, 65);
            expect(withdrawal65).toBeCloseTo(500000 / 19.4, 2);
            
            // At age 80: divisor 8.5, withdrawal should be 500000 / 8.5 ≈ €58,824
            const withdrawal80 = calculateRMDWithdrawal(portfolioValue, 80);
            expect(withdrawal80).toBeCloseTo(500000 / 8.5, 2);
        });

        it("should work with custom life expectancy", () => {
            const portfolioValue = 600000;
            const customLifeExpectancy = 20;
            
            const withdrawal = calculateRMDWithdrawal(portfolioValue, 70, 'custom', customLifeExpectancy);
            expect(withdrawal).toBeCloseTo(600000 / 20, 2); // €30,000
        });

        it("should handle edge cases", () => {
            // Zero portfolio value
            expect(calculateRMDWithdrawal(0, 65)).toBe(0);
            
            // Very small portfolio
            expect(calculateRMDWithdrawal(100, 65)).toBeCloseTo(100 / 19.4, 2);
            
            // Very old age (should use minimum divisor of 1.0)
            expect(calculateRMDWithdrawal(100000, 110)).toBe(100000);
        });
    });

    describe("getRMDDescription", () => {
        it("should provide user-friendly description", () => {
            const description65 = getRMDDescription(65);
            expect(description65).toContain("Alter 65");
            expect(description65).toContain("5.2%"); // 1/19.4 ≈ 5.2%
            expect(description65).toContain("19.4");
            
            const description80 = getRMDDescription(80);
            expect(description80).toContain("Alter 80");
            expect(description80).toContain("11.8%"); // 1/8.5 ≈ 11.8%
            expect(description80).toContain("8.5");
        });
    });

    describe("GERMAN_LIFE_EXPECTANCY_2020_22", () => {
        it("should have decreasing life expectancy with increasing age", () => {
            for (let age = 50; age < 99; age++) {
                const currentLE = GERMAN_LIFE_EXPECTANCY_2020_22[age];
                const nextLE = GERMAN_LIFE_EXPECTANCY_2020_22[age + 1];
                
                if (currentLE !== undefined && nextLE !== undefined) {
                    expect(currentLE).toBeGreaterThan(nextLE);
                }
            }
        });

        it("should have reasonable values", () => {
            // Life expectancy at 65 should be reasonable
            expect(GERMAN_LIFE_EXPECTANCY_2020_22[65]).toBeGreaterThan(15);
            expect(GERMAN_LIFE_EXPECTANCY_2020_22[65]).toBeLessThan(25);
            
            // Life expectancy at 85 should be lower
            expect(GERMAN_LIFE_EXPECTANCY_2020_22[85]).toBeGreaterThan(3);
            expect(GERMAN_LIFE_EXPECTANCY_2020_22[85]).toBeLessThan(10);
        });
    });
});