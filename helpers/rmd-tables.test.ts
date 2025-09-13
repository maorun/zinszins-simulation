import { describe, it, expect } from "vitest";
import {
    calculateRMDDivisor,
    calculateRMDWithdrawal,
    getRMDDescription,
    GERMAN_LIFE_EXPECTANCY_2020_22,
    GERMAN_LIFE_EXPECTANCY_MALE_2020_22,
    GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22,
    calculateJointLifeExpectancy
} from "./rmd-tables";

describe("German Life Expectancy Tables", () => {
    describe("GERMAN_LIFE_EXPECTANCY_2020_22 (Gender-neutral)", () => {
        it("should have expected values for common ages", () => {
            expect(GERMAN_LIFE_EXPECTANCY_2020_22[65]).toBe(19.4);
            expect(GERMAN_LIFE_EXPECTANCY_2020_22[70]).toBe(15.4);
            expect(GERMAN_LIFE_EXPECTANCY_2020_22[75]).toBe(11.7);
            expect(GERMAN_LIFE_EXPECTANCY_2020_22[80]).toBe(8.5);
        });

        it("should have decreasing life expectancy with increasing age", () => {
            for (let age = 50; age < 99; age++) {
                const currentLE = GERMAN_LIFE_EXPECTANCY_2020_22[age];
                const nextLE = GERMAN_LIFE_EXPECTANCY_2020_22[age + 1];
                
                if (currentLE !== undefined && nextLE !== undefined) {
                    expect(currentLE).toBeGreaterThan(nextLE);
                }
            }
        });
    });

    describe("GERMAN_LIFE_EXPECTANCY_MALE_2020_22", () => {
        it("should have expected values for common ages", () => {
            expect(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[65]).toBe(17.2);
            expect(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[70]).toBe(13.4);
            expect(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[75]).toBe(10.0);
            expect(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[80]).toBe(7.1);
        });

        it("should have lower life expectancy than female tables", () => {
            // Males generally have lower life expectancy than females
            expect(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[65]).toBeLessThan(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[65]);
            expect(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[70]).toBeLessThan(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[70]);
            expect(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[75]).toBeLessThan(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[75]);
        });

        it("should have decreasing life expectancy with increasing age", () => {
            for (let age = 50; age < 99; age++) {
                const currentLE = GERMAN_LIFE_EXPECTANCY_MALE_2020_22[age];
                const nextLE = GERMAN_LIFE_EXPECTANCY_MALE_2020_22[age + 1];
                
                if (currentLE !== undefined && nextLE !== undefined) {
                    expect(currentLE).toBeGreaterThan(nextLE);
                }
            }
        });
    });

    describe("GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22", () => {
        it("should have expected values for common ages", () => {
            expect(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[65]).toBe(21.3);
            expect(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[70]).toBe(17.0);
            expect(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[75]).toBe(13.0);
            expect(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[80]).toBe(9.4);
        });

        it("should have higher life expectancy than male tables", () => {
            // Females generally have higher life expectancy than males
            expect(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[65]).toBeGreaterThan(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[65]);
            expect(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[70]).toBeGreaterThan(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[70]);
            expect(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[75]).toBeGreaterThan(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[75]);
        });

        it("should have decreasing life expectancy with increasing age", () => {
            for (let age = 50; age < 99; age++) {
                const currentLE = GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[age];
                const nextLE = GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[age + 1];
                
                if (currentLE !== undefined && nextLE !== undefined) {
                    expect(currentLE).toBeGreaterThan(nextLE);
                }
            }
        });
    });
});

describe("calculateRMDDivisor", () => {
    describe("Gender-neutral table (german_2020_22)", () => {
        it("should calculate correct divisor for known ages", () => {
            expect(calculateRMDDivisor(65, 'german_2020_22')).toBe(19.4);
            expect(calculateRMDDivisor(70, 'german_2020_22')).toBe(15.4);
            expect(calculateRMDDivisor(75, 'german_2020_22')).toBe(11.7);
        });

        it("should handle ages below 50 by using age 50 data", () => {
            expect(calculateRMDDivisor(45, 'german_2020_22')).toBe(GERMAN_LIFE_EXPECTANCY_2020_22[50]);
            expect(calculateRMDDivisor(30, 'german_2020_22')).toBe(32.8);
        });

        it("should handle very old ages with minimum divisor", () => {
            expect(calculateRMDDivisor(105, 'german_2020_22')).toBe(1.0);
            expect(calculateRMDDivisor(120, 'german_2020_22')).toBe(1.0);
        });
    });

    describe("Male-specific table (german_male_2020_22)", () => {
        it("should calculate correct divisor for male life expectancy", () => {
            expect(calculateRMDDivisor(65, 'german_male_2020_22')).toBe(17.2);
            expect(calculateRMDDivisor(70, 'german_male_2020_22')).toBe(13.4);
            expect(calculateRMDDivisor(75, 'german_male_2020_22')).toBe(10.0);
        });

        it("should give lower divisors (higher withdrawal rates) than female table", () => {
            const maleDivisor = calculateRMDDivisor(70, 'german_male_2020_22');
            const femaleDivisor = calculateRMDDivisor(70, 'german_female_2020_22');
            expect(maleDivisor).toBeLessThan(femaleDivisor);
        });

        it("should handle edge cases for male table", () => {
            expect(calculateRMDDivisor(30, 'german_male_2020_22')).toBe(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[50]);
            expect(calculateRMDDivisor(110, 'german_male_2020_22')).toBe(1.0);
        });
    });

    describe("Female-specific table (german_female_2020_22)", () => {
        it("should calculate correct divisor for female life expectancy", () => {
            expect(calculateRMDDivisor(65, 'german_female_2020_22')).toBe(21.3);
            expect(calculateRMDDivisor(70, 'german_female_2020_22')).toBe(17.0);
            expect(calculateRMDDivisor(75, 'german_female_2020_22')).toBe(13.0);
        });

        it("should give higher divisors (lower withdrawal rates) than male table", () => {
            const maleDivisor = calculateRMDDivisor(70, 'german_male_2020_22');
            const femaleDivisor = calculateRMDDivisor(70, 'german_female_2020_22');
            expect(femaleDivisor).toBeGreaterThan(maleDivisor);
        });

        it("should handle edge cases for female table", () => {
            expect(calculateRMDDivisor(30, 'german_female_2020_22')).toBe(GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[50]);
            expect(calculateRMDDivisor(110, 'german_female_2020_22')).toBe(1.0);
        });
    });

    describe("Custom life expectancy", () => {
        it("should use custom value when provided", () => {
            expect(calculateRMDDivisor(65, 'custom', 20)).toBe(20);
            expect(calculateRMDDivisor(70, 'custom', 15.5)).toBe(15.5);
        });

        it("should enforce minimum divisor of 1.0 for custom values", () => {
            expect(calculateRMDDivisor(95, 'custom', 0.5)).toBe(1.0);
            expect(calculateRMDDivisor(90, 'custom', -5)).toBe(1.0);
        });
    });
});

describe("calculateRMDWithdrawal", () => {
    const portfolioValue = 100000;

    describe("Gender-specific withdrawal calculations", () => {
        it("should calculate different withdrawal amounts for male vs female", () => {
            const maleWithdrawal = calculateRMDWithdrawal(portfolioValue, 70, 'german_male_2020_22');
            const femaleWithdrawal = calculateRMDWithdrawal(portfolioValue, 70, 'german_female_2020_22');
            
            // Male should have higher withdrawal rate (shorter life expectancy)
            expect(maleWithdrawal).toBeGreaterThan(femaleWithdrawal);
            
            // Specific values based on life expectancy tables
            expect(maleWithdrawal).toBeCloseTo(portfolioValue / 13.4, 2);
            expect(femaleWithdrawal).toBeCloseTo(portfolioValue / 17.0, 2);
        });

        it("should calculate correct withdrawal amount for gender-neutral table", () => {
            const withdrawal = calculateRMDWithdrawal(portfolioValue, 70, 'german_2020_22');
            const expectedWithdrawal = portfolioValue / 15.4;
            expect(withdrawal).toBeCloseTo(expectedWithdrawal, 2);
        });
    });

    describe("Edge cases", () => {
        it("should handle zero portfolio value", () => {
            expect(calculateRMDWithdrawal(0, 65, 'german_2020_22')).toBe(0);
            expect(calculateRMDWithdrawal(0, 65, 'german_male_2020_22')).toBe(0);
            expect(calculateRMDWithdrawal(0, 65, 'german_female_2020_22')).toBe(0);
        });

        it("should handle very old ages with minimum divisor", () => {
            expect(calculateRMDWithdrawal(portfolioValue, 110, 'german_2020_22')).toBe(portfolioValue);
            expect(calculateRMDWithdrawal(portfolioValue, 110, 'german_male_2020_22')).toBe(portfolioValue);
            expect(calculateRMDWithdrawal(portfolioValue, 110, 'german_female_2020_22')).toBe(portfolioValue);
        });
    });
});

describe("calculateJointLifeExpectancy", () => {
    describe("Basic joint life expectancy calculations", () => {
        it("should calculate joint life expectancy for same-age couple", () => {
            const jointLife = calculateJointLifeExpectancy(65, 65, 'male', 'female');
            
            // Joint life expectancy should be higher than individual male expectancy
            expect(jointLife).toBeGreaterThan(GERMAN_LIFE_EXPECTANCY_MALE_2020_22[65]);
            expect(jointLife).toBeGreaterThan(0);
        });

        it("should handle age differences in couples", () => {
            // Older male, younger female (common scenario)
            const jointLife1 = calculateJointLifeExpectancy(70, 65, 'male', 'female');
            // Same age couple
            const jointLife2 = calculateJointLifeExpectancy(67, 67, 'male', 'female');
            
            expect(jointLife1).toBeGreaterThan(0);
            expect(jointLife2).toBeGreaterThan(0);
        });

        it("should account for the longer-lived spouse", () => {
            // Test with significant age difference
            const jointLife = calculateJointLifeExpectancy(70, 60, 'male', 'female');
            
            // Should be closer to the younger spouse's expectancy
            const youngerFemaleExpectancy = GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[60];
            const olderMaleExpectancy = GERMAN_LIFE_EXPECTANCY_MALE_2020_22[70];
            
            expect(jointLife).toBeGreaterThan(olderMaleExpectancy);
            expect(jointLife).toBeLessThanOrEqual(youngerFemaleExpectancy + 5); // Some buffer for joint calculation
        });

        it("should handle same-gender couples", () => {
            const maleCouple = calculateJointLifeExpectancy(65, 65, 'male', 'male');
            const femaleCouple = calculateJointLifeExpectancy(65, 65, 'female', 'female');
            
            expect(maleCouple).toBeGreaterThan(0);
            expect(femaleCouple).toBeGreaterThan(0);
            expect(femaleCouple).toBeGreaterThan(maleCouple); // Female couples should have higher joint life expectancy
        });
    });

    describe("Edge cases", () => {
        it("should handle very young ages (outside table)", () => {
            const jointLife = calculateJointLifeExpectancy(30, 35, 'male', 'female');
            expect(jointLife).toBeGreaterThan(0);
            expect(jointLife).toBeLessThan(100); // Reasonable upper bound
        });

        it("should handle very old ages", () => {
            const jointLife = calculateJointLifeExpectancy(95, 90, 'male', 'female');
            expect(jointLife).toBeGreaterThan(0);
            expect(jointLife).toBeLessThan(20); // Should be relatively low for very old ages
        });

        it("should return reasonable values within expected ranges", () => {
            const jointLife = calculateJointLifeExpectancy(65, 65, 'male', 'female');
            expect(jointLife).toBeGreaterThan(15); // Should be at least 15 years
            expect(jointLife).toBeLessThan(40); // Should be less than 40 years
        });
    });

    describe("Actuarial accuracy", () => {
        it("should give results that make actuarial sense", () => {
            // Test realistic retirement planning scenario
            const husband = { age: 67, gender: 'male' as const };
            const wife = { age: 64, gender: 'female' as const };
            
            const jointLife = calculateJointLifeExpectancy(husband.age, wife.age, husband.gender, wife.gender);
            const husbandIndividual = GERMAN_LIFE_EXPECTANCY_MALE_2020_22[husband.age];
            const wifeIndividual = GERMAN_LIFE_EXPECTANCY_FEMALE_2020_22[wife.age];
            
            // Joint life expectancy should be higher than the higher of the two individual expectancies
            const higherIndividual = Math.max(husbandIndividual, wifeIndividual);
            expect(jointLife).toBeGreaterThan(higherIndividual);
            
            // But not unreasonably high
            expect(jointLife).toBeLessThan(higherIndividual + 10);
        });

        it("should be consistent with joint survival probability", () => {
            const jointLife1 = calculateJointLifeExpectancy(65, 65, 'male', 'female');
            const jointLife2 = calculateJointLifeExpectancy(65, 65, 'female', 'male'); // Reverse order
            
            // Should be identical regardless of parameter order
            expect(jointLife1).toBe(jointLife2);
        });
    });
});

describe("getRMDDescription", () => {
    it("should provide user-friendly description for gender-neutral table", () => {
        const description = getRMDDescription(70);
        expect(description).toContain('Bei Alter 70');
        expect(description).toContain('%');
        expect(description).toContain('Divisor');
        expect(description).toContain('6.5%'); // 1/15.4 ≈ 6.5%
        expect(description).toContain('15.4');
    });

    it("should provide correct percentages for different ages", () => {
        const description65 = getRMDDescription(65);
        expect(description65).toContain("5.2%"); // 1/19.4 ≈ 5.2%
        
        const description80 = getRMDDescription(80);
        expect(description80).toContain("11.8%"); // 1/8.5 ≈ 11.8%
    });
});