import type { SimulationResult, SimulationResultElement } from "./simulate";
import type { SparplanElement } from "../utils/sparplan-utils";
import type { WithdrawalResult } from "./withdrawal";

export type Summary = {
    startkapital: number;
    zinsen: number;
    bezahlteSteuer: number;
    endkapital: number;
};

export type EnhancedSummary = Summary & {
    // Savings phase (Ansparphase) metrics
    renditeAnsparphase: number; // Return rate in savings phase as percentage
    
    // Withdrawal phase (Entsparphase) metrics - optional as they may not always be calculated
    endkapitalEntspharphase?: number; // End capital after withdrawal phase
    monatlicheAuszahlung?: number; // Monthly withdrawal amount in Euro
    renditeEntspharphase?: number; // Return rate in withdrawal phase as percentage
    jahreEntspharphase?: number; // Number of years in withdrawal phase
};

export function getSparplanSummary(element?: SimulationResult): Summary {
    const first: SimulationResultElement | undefined = element && Object.values(element).shift()
    const last: SimulationResultElement | undefined = element && Object.values(element).pop()

    return {
        startkapital: first?.startkapital || 0,
        zinsen: Number(last?.endkapital) - Number(first?.startkapital),
        bezahlteSteuer: element ? Object.values(element).reduce(
            (previousValue, currentValue) =>
                previousValue + currentValue.bezahlteSteuer,
            0
        ) : 0,
        endkapital: last?.endkapital || 0,
    };
}

export function fullSummary(elemente?: SparplanElement[]): Summary {
    return elemente ? elemente.map((element) => element.simulation)
        .map(getSparplanSummary)
        .reduce(
            (previousValue, currentValue) => ({
                startkapital: Number(previousValue.startkapital) + Number(currentValue.startkapital),
                zinsen: previousValue.zinsen + currentValue.zinsen,
                bezahlteSteuer: previousValue.bezahlteSteuer + currentValue.bezahlteSteuer,
                endkapital:
                    Number(previousValue.endkapital) + Number(currentValue.endkapital),
            }),
            {
                startkapital: 0,
                zinsen: 0,
                bezahlteSteuer: 0,
                endkapital: 0,
            }
        ) : {
        startkapital: 0,
        zinsen: 0,
        bezahlteSteuer: 0,
        endkapital: 0,
    };
}

/**
 * Extract withdrawal phase metrics from WithdrawalResult
 */
export function extractWithdrawalMetrics(withdrawalResult: WithdrawalResult): {
    totalYears: number;
    finalCapital: number;
    averageMonthlyWithdrawal: number;
    totalWithdrawn: number;
} {
    const years = Object.keys(withdrawalResult).map(Number).sort((a, b) => a - b);
    
    if (years.length === 0) {
        return {
            totalYears: 0,
            finalCapital: 0,
            averageMonthlyWithdrawal: 0,
            totalWithdrawn: 0,
        };
    }
    
    const firstYear = years[0];
    const lastYear = years[years.length - 1];
    const totalYears = lastYear - firstYear + 1;
    
    const finalCapital = withdrawalResult[lastYear].endkapital;
    
    // Calculate total withdrawn and average monthly withdrawal
    let totalWithdrawn = 0;
    let totalMonthlyWithdrawals = 0;
    let monthsWithData = 0;
    
    for (const year of years) {
        const yearData = withdrawalResult[year];
        totalWithdrawn += yearData.entnahme;
        
        if (yearData.monatlicheEntnahme !== undefined) {
            totalMonthlyWithdrawals += yearData.monatlicheEntnahme;
            monthsWithData += 1;
        }
    }
    
    // Calculate average monthly withdrawal
    let averageMonthlyWithdrawal = 0;
    if (monthsWithData > 0) {
        averageMonthlyWithdrawal = totalMonthlyWithdrawals / monthsWithData;
    } else if (totalWithdrawn > 0) {
        // Fallback: divide total annual withdrawals by 12
        averageMonthlyWithdrawal = totalWithdrawn / years.length / 12;
    }
    
    return {
        totalYears,
        finalCapital,
        averageMonthlyWithdrawal,
        totalWithdrawn,
    };
}

/**
 * Calculate enhanced summary including withdrawal phase metrics
 */
export function getEnhancedSummary(
    elemente?: SparplanElement[],
    startYear?: number,
    endYear?: number,
    withdrawalResult?: WithdrawalResult
): EnhancedSummary {
    const baseSummary = fullSummary(elemente);
    
    // Calculate savings phase return rate
    // Formula: ((endkapital / startkapital) ^ (1/years)) - 1
    const totalYearsSavings = endYear && startYear ? endYear - startYear : 0;
    let renditeAnsparphase = 0;
    
    if (baseSummary.startkapital > 0 && totalYearsSavings > 0) {
        // Calculate annualized return rate
        const totalReturn = baseSummary.endkapital / baseSummary.startkapital;
        renditeAnsparphase = (Math.pow(totalReturn, 1 / totalYearsSavings) - 1) * 100;
    }
    
    const enhancedSummary: EnhancedSummary = {
        ...baseSummary,
        renditeAnsparphase,
    };
    
    // Add withdrawal phase metrics if provided
    if (withdrawalResult) {
        const withdrawalData = extractWithdrawalMetrics(withdrawalResult);
        
        enhancedSummary.endkapitalEntspharphase = withdrawalData.finalCapital;
        enhancedSummary.monatlicheAuszahlung = withdrawalData.averageMonthlyWithdrawal;
        enhancedSummary.jahreEntspharphase = withdrawalData.totalYears;
        
        // Calculate withdrawal phase return rate
        if (withdrawalData.totalYears > 0 && baseSummary.endkapital > 0) {
            // Calculate the effective annual return during withdrawal phase
            // This considers both growth and withdrawals
            const initialCapital = baseSummary.endkapital;
            const finalCapital = withdrawalData.finalCapital;
            const totalWithdrawn = withdrawalData.totalWithdrawn;
            
            // If we have final capital + total withdrawn, we can estimate the return
            if (totalWithdrawn > 0) {
                const totalValue = finalCapital + totalWithdrawn;
                const annualizedReturn = Math.pow(totalValue / initialCapital, 1 / withdrawalData.totalYears) - 1;
                enhancedSummary.renditeEntspharphase = annualizedReturn * 100;
            }
        }
    }
    
    return enhancedSummary;
}