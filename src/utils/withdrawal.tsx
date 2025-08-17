import { zinszinsVorabpauschale, getBasiszinsForYear } from "./steuer";

export type WithdrawalStrategy = "4prozent" | "3prozent" | "monatlich_fest" | "variabel_prozent";

export type WithdrawalResultElement = {
    startkapital: number;
    entnahme: number;
    endkapital: number;
    bezahlteSteuer: number;
    genutzterFreibetrag: number;
    zinsen: number;
    // For monthly strategy
    monatlicheEntnahme?: number;
    inflationAnpassung?: number;
    portfolioAnpassung?: number;
    // For Grundfreibetrag (income tax)
    einkommensteuer?: number;
    genutzterGrundfreibetrag?: number;
}

export type WithdrawalResult = {
    [year: number]: WithdrawalResultElement;
};

export type MonthlyWithdrawalConfig = {
    monthlyAmount: number; // Fixed monthly withdrawal amount in €
    inflationRate?: number; // Annual inflation rate for adjustment (default: 2%)
    enableGuardrails?: boolean; // Enable dynamic adjustment based on portfolio performance
    guardrailsThreshold?: number; // Threshold for portfolio performance adjustment (default: 10%)
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
 * Calculate withdrawal phase projections based on different strategies
 * @param startingCapital - Capital available at the start of withdrawal phase
 * @param startYear - First year of withdrawal 
 * @param endYear - Final year of withdrawal (end of life)
 * @param strategy - Withdrawal strategy (4% rule, 3% rule, custom percentage, or monthly fixed)
 * @param returnRate - Expected annual return during withdrawal phase
 * @param taxRate - Capital gains tax rate (default: 26.375%)
 * @param freibetragPerYear - Tax allowance per year (optional)
 * @param monthlyConfig - Configuration for monthly withdrawal strategy (optional)
 * @param customPercentage - Custom withdrawal percentage for "variabel_prozent" strategy (e.g., 0.05 for 5%)
 * @param enableGrundfreibetrag - Whether to apply income tax with Grundfreibetrag (default: false)
 * @param grundfreibetragPerYear - Basic tax allowance per year for income tax (optional)
 * @param incomeTaxRate - Income tax rate for withdrawal amounts (default: 25%)
 * @returns Withdrawal projections year by year
 */
export function calculateWithdrawal(
    startingCapital: number,
    startYear: number,
    endYear: number,
    strategy: WithdrawalStrategy,
    returnRate: number,
    taxRate: number = 0.26375,
    freibetragPerYear?: {[year: number]: number},
    monthlyConfig?: MonthlyWithdrawalConfig,
    customPercentage?: number,
    enableGrundfreibetrag?: boolean,
    grundfreibetragPerYear?: {[year: number]: number},
    incomeTaxRate?: number
): WithdrawalResult {
    // Helper function to get tax allowance for a specific year
    const getFreibetragForYear = (year: number): number => {
        if (freibetragPerYear && freibetragPerYear[year] !== undefined) {
            return freibetragPerYear[year];
        }
        // Fallback to default value for backwards compatibility
        return freibetrag[2023] || 2000;
    };

    // Helper function to get Grundfreibetrag for a specific year
    const getGrundfreibetragForYear = (year: number): number => {
        if (grundfreibetragPerYear && grundfreibetragPerYear[year] !== undefined) {
            return grundfreibetragPerYear[year];
        }
        // Fallback to default value
        return grundfreibetrag[2023] || 10908;
    };

    const result: WithdrawalResult = {};
    let currentCapital = startingCapital;
    
    // Initialize withdrawal amount based on strategy
    let baseWithdrawalAmount: number;
    
    if (strategy === "monatlich_fest") {
        if (!monthlyConfig) {
            throw new Error("Monthly configuration is required for monatlich_fest strategy");
        }
        baseWithdrawalAmount = monthlyConfig.monthlyAmount * 12; // Convert monthly to annual
    } else if (strategy === "variabel_prozent") {
        if (customPercentage === undefined) {
            throw new Error("Custom percentage is required for variabel_prozent strategy");
        }
        baseWithdrawalAmount = startingCapital * customPercentage;
    } else {
        // Traditional percentage-based strategies (3% and 4%)
        const withdrawalRate = strategy === "4prozent" ? 0.04 : 0.03;
        baseWithdrawalAmount = startingCapital * withdrawalRate;
    }
    
    for (let year = startYear; year <= endYear; year++) {
        // Get year-specific tax allowance
        const yearlyFreibetrag = getFreibetragForYear(year);
        
        // Start of year capital
        const startkapital = currentCapital;
        
        // Calculate withdrawal amount for this year
        let annualWithdrawal = baseWithdrawalAmount;
        let inflationAnpassung = 0;
        let portfolioAnpassung = 0;
        
        if (strategy === "monatlich_fest" && monthlyConfig) {
            const yearsPassed = year - startYear;
            
            // Apply inflation adjustment
            const inflationRate = monthlyConfig.inflationRate || 0.02; // Default 2%
            inflationAnpassung = baseWithdrawalAmount * Math.pow(1 + inflationRate, yearsPassed) - baseWithdrawalAmount;
            annualWithdrawal += inflationAnpassung;
            
            // Apply guardrails if enabled
            if (monthlyConfig.enableGuardrails && yearsPassed > 0) {
                const threshold = monthlyConfig.guardrailsThreshold || 0.10; // Default 10%
                
                // Use a baseline return rate for comparison (assume 5% as expected long-term return)
                const baselineReturnRate = 0.05;
                
                // Calculate what the capital should be at baseline return rate considering withdrawals
                const avgAnnualWithdrawal = baseWithdrawalAmount; // Base amount before adjustments
                let expectedCapitalWithWithdrawals = startingCapital;
                for (let i = 0; i < yearsPassed; i++) {
                    expectedCapitalWithWithdrawals = (expectedCapitalWithWithdrawals - avgAnnualWithdrawal) * (1 + baselineReturnRate);
                }
                
                // Compare actual vs expected capital (both considering withdrawals)
                const actualVsExpected = (currentCapital - expectedCapitalWithWithdrawals) / Math.abs(expectedCapitalWithWithdrawals);
                
                if (actualVsExpected > threshold) {
                    // Portfolio performing better than expected, increase withdrawal by 5%
                    portfolioAnpassung = annualWithdrawal * 0.05;
                } else if (actualVsExpected < -threshold) {
                    // Portfolio performing worse than expected, decrease withdrawal by 5%
                    portfolioAnpassung = -annualWithdrawal * 0.05;
                }
                
                annualWithdrawal += portfolioAnpassung;
            }
        }
        
        // Ensure withdrawal doesn't exceed available capital
        const entnahme = Math.min(annualWithdrawal, currentCapital);
        
        // Apply withdrawal first, then investment returns to remaining capital
        const capitalAfterWithdrawal = Math.max(0, startkapital - entnahme);
        
        // Apply investment returns to remaining capital
        const capitalAfterGrowth = capitalAfterWithdrawal * (1 + returnRate);
        const zinsen = capitalAfterGrowth - capitalAfterWithdrawal;
        
        // Calculate capital gains tax on growth using Vorabpauschale
        const taxCalculation = zinszinsVorabpauschale(
            capitalAfterWithdrawal,
            getBasiszinsForYear(year),
            yearlyFreibetrag,
            taxRate
        );
        
        // Calculate optional income tax on withdrawal amount using Grundfreibetrag
        let einkommensteuer = 0;
        let genutzterGrundfreibetrag = 0;
        
        if (enableGrundfreibetrag) {
            const yearlyGrundfreibetrag = getGrundfreibetragForYear(year);
            const effectiveIncomeTaxRate = incomeTaxRate || 0.25; // Default 25%
            
            einkommensteuer = calculateIncomeTax(entnahme, yearlyGrundfreibetrag, effectiveIncomeTaxRate);
            genutzterGrundfreibetrag = Math.min(entnahme, yearlyGrundfreibetrag);
        }
        
        // Total tax burden: capital gains tax + income tax
        const totalTax = taxCalculation.steuer + einkommensteuer;
        
        // Capital after growth and taxes
        const endkapital = Math.max(0, capitalAfterGrowth - totalTax);
        
        result[year] = {
            startkapital,
            entnahme,
            endkapital,
            bezahlteSteuer: totalTax,
            genutzterFreibetrag: yearlyFreibetrag - taxCalculation.verbleibenderFreibetrag,
            zinsen,
            monatlicheEntnahme: strategy === "monatlich_fest" ? entnahme / 12 : undefined,
            inflationAnpassung: strategy === "monatlich_fest" ? inflationAnpassung : undefined,
            portfolioAnpassung: strategy === "monatlich_fest" ? portfolioAnpassung : undefined,
            einkommensteuer: enableGrundfreibetrag ? einkommensteuer : undefined,
            genutzterGrundfreibetrag: enableGrundfreibetrag ? genutzterGrundfreibetrag : undefined
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
 * Calculate how long the capital will last during withdrawal phase
 * @param withdrawalResult - Result from withdrawal calculation
 * @param startYear - First year of withdrawal
 * @returns Duration in years (null if capital never depletes within timeframe)
 */
export function calculateWithdrawalDuration(
    withdrawalResult: WithdrawalResult,
    startYear: number
): number | null {
    const years = Object.keys(withdrawalResult).map(Number).sort((a, b) => a - b);
    
    // Find the first year where capital is depleted (endkapital <= 0)
    for (const year of years) {
        if (withdrawalResult[year].endkapital <= 0) {
            return year - startYear + 1;
        }
    }
    
    // If no depletion found, check if we're in a declining scenario
    if (years.length >= 2) {
        const lastYear = years[years.length - 1];
        const firstYear = years[0];
        const lastCapital = withdrawalResult[lastYear].endkapital;
        const firstCapital = withdrawalResult[firstYear].startkapital;
        
        // If capital is declining significantly, estimate when it might run out
        if (lastCapital < firstCapital * 0.5) {
            // Capital is declining, but we don't have enough data to determine exact depletion
            return null;
        }
    }
    
    // Capital doesn't deplete within the simulation timeframe
    return null;
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