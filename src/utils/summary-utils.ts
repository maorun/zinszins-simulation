import type { SimulationResult, SimulationResultElement } from "./simulate";
import type { SparplanElement } from "../utils/sparplan-utils";
import type { WithdrawalResult } from "../../helpers/withdrawal";

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
        // For monthly withdrawals, prefer showing the first year's amount (base amount before inflation)
        // rather than the time-weighted average, as it's more intuitive for users
        const firstYear = Math.min(...years);
        const firstYearData = withdrawalResult[firstYear];
        
        if (firstYearData && firstYearData.monatlicheEntnahme !== undefined) {
            averageMonthlyWithdrawal = firstYearData.monatlicheEntnahme;
        } else {
            // Fall back to average if first year data is unavailable
            averageMonthlyWithdrawal = totalMonthlyWithdrawals / monthsWithData;
        }
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

/**
 * Calculate year-by-year portfolio progression (cumulative capital for each year)
 */
export function getYearlyPortfolioProgression(elemente?: SparplanElement[]): Array<{
    year: number;
    totalCapital: number;
    yearlyContribution: number;
    yearlyInterest: number;
    yearlyTax: number;
    cumulativeContributions: number;
    cumulativeInterest: number;
    cumulativeTax: number;
}> {
    if (!elemente || elemente.length === 0) {
        return [];
    }

    // Get all years from all simulation results
    const allYears = new Set<number>();
    elemente.forEach(element => {
        Object.keys(element.simulation).forEach(year => {
            allYears.add(parseInt(year));
        });
    });

    const sortedYears = Array.from(allYears).sort((a, b) => a - b);
    const progression: Array<{
        year: number;
        totalCapital: number;
        yearlyContribution: number;
        yearlyInterest: number;
        yearlyTax: number;
        cumulativeContributions: number;
        cumulativeInterest: number;
        cumulativeTax: number;
    }> = [];

    let cumulativeContributions = 0;
    let cumulativeInterest = 0;
    let cumulativeTax = 0;

    for (const year of sortedYears) {
        let yearlyContribution = 0;
        let yearlyInterest = 0;
        let yearlyTax = 0;
        let totalCapital = 0;

        // Calculate yearly contribution for this year
        // For savings plans: sum up all elements that represent contributions for this year
        const sparplanElementsThisYear = elemente.filter(el => 
            el.type === 'sparplan' && el.simulation[year]
        );
        
        if (sparplanElementsThisYear.length > 0) {
            // Check if we have monthly elements (multiple elements per year) or yearly elements (one element per year)
            const elementsWithSameStartYear = sparplanElementsThisYear.filter(el => 
                new Date(el.start).getFullYear() === year
            );
            
            if (elementsWithSameStartYear.length === 1) {
                // Single yearly element for this year
                yearlyContribution += elementsWithSameStartYear[0].einzahlung;
            } else if (elementsWithSameStartYear.length > 1) {
                // Multiple monthly elements for this year - calculate annual amount
                const monthlyAmount = elementsWithSameStartYear[0].einzahlung;
                yearlyContribution += monthlyAmount * 12;
            } else if (sparplanElementsThisYear.length > 0) {
                // This year has simulation data but no elements start this year
                // This means it's a continuation of a savings plan from a previous year
                // Use the annual amount (12 * monthly amount)
                const monthlyAmount = sparplanElementsThisYear[0].einzahlung;
                yearlyContribution += monthlyAmount * 12;
            }
        }

        // Handle one-time payments (Einmalzahlungen)
        elemente.forEach(element => {
            const yearData = element.simulation[year];
            if (yearData && element.type === 'einmalzahlung') {
                const elementStartYear = new Date(element.start).getFullYear();
                if (elementStartYear === year) {
                    yearlyContribution += element.einzahlung;
                }
            }
        });

        // Sum up all elements for this year (capital, interest, tax)
        elemente.forEach(element => {
            const yearData = element.simulation[year];
            if (yearData) {
                // Add the end capital from this element for this year
                totalCapital += yearData.endkapital;
                
                // Add the interest from this element for this year
                yearlyInterest += yearData.zinsen;
                
                // Add the tax paid by this element for this year
                yearlyTax += yearData.bezahlteSteuer;
            }
        });

        // Update cumulative totals
        cumulativeContributions += yearlyContribution;
        cumulativeInterest += yearlyInterest;
        cumulativeTax += yearlyTax;

        progression.push({
            year,
            totalCapital,
            yearlyContribution,
            yearlyInterest,
            yearlyTax,
            cumulativeContributions,
            cumulativeInterest,
            cumulativeTax
        });
    }

    return progression;
}