/**
 * German Life Expectancy Tables and RMD Divisor Calculations
 * Based on German Federal Statistical Office (Destatis) mortality tables
 */

/**
 * German life expectancy data (2020-2022 average)
 * Source: Destatis Sterbetafel 2020/22
 * Represents remaining life expectancy in years for each age
 */
export const GERMAN_LIFE_EXPECTANCY_2020_22: Record<number, number> = {
    // Ages 50-100+ with remaining life expectancy
    50: 32.8,
    51: 31.9,
    52: 30.9,
    53: 30.0,
    54: 29.1,
    55: 28.2,
    56: 27.3,
    57: 26.4,
    58: 25.5,
    59: 24.6,
    60: 23.7,
    61: 22.8,
    62: 22.0,
    63: 21.1,
    64: 20.3,
    65: 19.4,
    66: 18.6,
    67: 17.8,
    68: 17.0,
    69: 16.2,
    70: 15.4,
    71: 14.6,
    72: 13.9,
    73: 13.1,
    74: 12.4,
    75: 11.7,
    76: 11.0,
    77: 10.3,
    78: 9.7,
    79: 9.1,
    80: 8.5,
    81: 7.9,
    82: 7.4,
    83: 6.9,
    84: 6.4,
    85: 5.9,
    86: 5.5,
    87: 5.1,
    88: 4.7,
    89: 4.3,
    90: 4.0,
    91: 3.7,
    92: 3.4,
    93: 3.1,
    94: 2.9,
    95: 2.7,
    96: 2.5,
    97: 2.3,
    98: 2.1,
    99: 1.9,
    100: 1.8,
};

/**
 * Calculate RMD divisor based on age and life expectancy table
 * Similar to US IRS Uniform Lifetime Table but using German mortality data
 */
export function calculateRMDDivisor(
    age: number, 
    table: 'german_2020_22' | 'custom' = 'german_2020_22',
    customLifeExpectancy?: number
): number {
    if (table === 'custom' && customLifeExpectancy !== undefined) {
        return Math.max(1.0, customLifeExpectancy);
    }
    
    // Use German life expectancy table
    const lifeExpectancy = GERMAN_LIFE_EXPECTANCY_2020_22[age];
    
    if (lifeExpectancy === undefined) {
        // For ages outside our table, use conservative estimates
        if (age < 50) {
            // Young ages: use age 50 data
            return GERMAN_LIFE_EXPECTANCY_2020_22[50];
        } else {
            // Very old ages: use minimum divisor of 1.0
            return 1.0;
        }
    }
    
    return Math.max(1.0, lifeExpectancy);
}

/**
 * Calculate RMD withdrawal amount for a given portfolio value and age
 */
export function calculateRMDWithdrawal(
    portfolioValue: number,
    age: number,
    table: 'german_2020_22' | 'custom' = 'german_2020_22',
    customLifeExpectancy?: number
): number {
    const divisor = calculateRMDDivisor(age, table, customLifeExpectancy);
    return portfolioValue / divisor;
}

/**
 * Get user-friendly description of the RMD approach
 */
export function getRMDDescription(age: number): string {
    const divisor = calculateRMDDivisor(age);
    const percentage = ((1 / divisor) * 100).toFixed(1);
    
    return `Bei Alter ${age}: Entnahme von ${percentage}% des Portfoliowerts (Divisor: ${divisor.toFixed(1)})`;
}