import { zinszinsVorabpauschale } from "./steuer";

export type WithdrawalStrategy = "4prozent" | "3prozent";

export type WithdrawalResultElement = {
    startkapital: number;
    entnahme: number;
    endkapital: number;
    bezahlteSteuer: number;
    genutzterFreibetrag: number;
    zinsen: number;
}

export type WithdrawalResult = {
    [year: number]: WithdrawalResultElement;
};

const basiszinsen: {
    [year: number]: number;
} = {
    2023: 0.0255,
};

const freibetrag: {
    [year: number]: number;
} = {
    2023: 2000,
};

// German basic tax allowance (Grundfreibetrag) for income tax during withdrawal
const grundfreibetrag: {
    [year: number]: number;
} = {
    2023: 10908, // € per year
};

/**
 * Calculate withdrawal phase projections based on 4% or 3% rule
 * @param startingCapital - Capital available at the start of withdrawal phase
 * @param startYear - First year of withdrawal 
 * @param endYear - Final year of withdrawal (end of life)
 * @param strategy - Withdrawal strategy (4% or 3% rule)
 * @param returnRate - Expected annual return during withdrawal phase
 * @param taxRate - Capital gains tax rate (default: 26.375%)
 * @param freibetragPerYear - Tax allowance per year (optional)
 * @returns Withdrawal projections year by year
 */
export function calculateWithdrawal(
    startingCapital: number,
    startYear: number,
    endYear: number,
    strategy: WithdrawalStrategy,
    returnRate: number,
    taxRate: number = 0.26375,
    freibetragPerYear?: {[year: number]: number}
): WithdrawalResult {
    // Helper function to get tax allowance for a specific year
    const getFreibetragForYear = (year: number): number => {
        if (freibetragPerYear && freibetragPerYear[year] !== undefined) {
            return freibetragPerYear[year];
        }
        // Fallback to default value for backwards compatibility
        return freibetrag[2023] || 2000;
    };

    const result: WithdrawalResult = {};
    
    // Calculate initial withdrawal rate
    const withdrawalRate = strategy === "4prozent" ? 0.04 : 0.03;
    
    // Calculate initial annual withdrawal amount based on starting capital
    const initialWithdrawal = startingCapital * withdrawalRate;
    
    let currentCapital = startingCapital;
    
    for (let year = startYear; year <= endYear; year++) {
        // Get year-specific tax allowance
        const yearlyFreibetrag = getFreibetragForYear(year);
        
        // Start of year capital
        const startkapital = currentCapital;
        
        // Calculate withdrawal amount (fixed amount based on initial calculation)
        const entnahme = Math.min(initialWithdrawal, currentCapital);
        
        // Apply withdrawal first, then investment returns to remaining capital
        const capitalAfterWithdrawal = Math.max(0, startkapital - entnahme);
        
        // Apply investment returns to remaining capital
        const capitalAfterGrowth = capitalAfterWithdrawal * (1 + returnRate);
        const zinsen = capitalAfterGrowth - capitalAfterWithdrawal;
        
        // Calculate capital gains tax on growth using Vorabpauschale
        const taxCalculation = zinszinsVorabpauschale(
            capitalAfterWithdrawal,
            basiszinsen[2023],
            yearlyFreibetrag,
            taxRate
        );
        
        // Capital after growth and taxes
        const endkapital = Math.max(0, capitalAfterGrowth - taxCalculation.steuer);
        
        result[year] = {
            startkapital,
            entnahme,
            endkapital,
            bezahlteSteuer: taxCalculation.steuer,
            genutzterFreibetrag: yearlyFreibetrag - taxCalculation.verbleibenderFreibetrag,
            zinsen
        };
        
        // Update capital for next year
        currentCapital = endkapital;
        
        // If capital is depleted, break early
        if (currentCapital <= 0) {
            break;
        }
    }
    
    return result;
}

/**
 * Calculate income tax on withdrawal amount considering German basic tax allowance
 * @param withdrawalAmount - Annual withdrawal amount
 * @param grundfreibetragYear - Basic tax allowance for the year
 * @param incomeTaxRate - Income tax rate (simplified, default: 25%)
 * @returns Tax owed on withdrawal
 */
export function calculateIncomeTax(
    withdrawalAmount: number,
    grundfreibetragYear: number = grundfreibetrag[2023],
    incomeTaxRate: number = 0.25
): number {
    const taxableIncome = Math.max(0, withdrawalAmount - grundfreibetragYear);
    return taxableIncome * incomeTaxRate;
}

/**
 * Get total accumulated capital from all savings plan elements at a specific year
 * @param elements - Array of SparplanElement with simulation results
 * @param year - Year to get capital for
 * @returns Total capital amount
 */
export function getTotalCapitalAtYear(elements: any[], year: number): number {
    return elements.reduce((total, element) => {
        const yearData = element.simulation?.[year];
        return total + (yearData?.endkapital || 0);
    }, 0);
}