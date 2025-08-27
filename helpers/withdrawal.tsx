import type { SparplanElement } from "../src/utils/sparplan-utils";
import { getBasiszinsForYear, calculateVorabpauschale, calculateSteuerOnVorabpauschale } from "./steuer";
import type { ReturnConfiguration } from "../src/utils/random-returns";
import { generateRandomReturns } from "../src/utils/random-returns";


export type WithdrawalStrategy = "4prozent" | "3prozent" | "monatlich_fest" | "variabel_prozent";

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
 * @param elements - Array of SparplanElement with simulation results
 * @param startYear - First year of withdrawal 
 * @param endYear - Final year of withdrawal (end of life)
 * @param strategy - Withdrawal strategy (4% rule, 3% rule, or monthly fixed)
 * @param returnConfig - Configuration for investment returns during withdrawal.
 * @param taxRate - Capital gains tax rate (default: 26.375%)
 * @param teilfreistellungsquote - The partial exemption quote for the fund type.
 * @param freibetragPerYear - Tax allowance per year (optional)
 * @param monthlyConfig - Configuration for monthly withdrawal strategy (optional)
 * @returns Withdrawal projections year by year
 */
export function calculateWithdrawal(
    elements: SparplanElement[],
    startYear: number,
    endYear: number,
    strategy: WithdrawalStrategy,
    returnConfig: ReturnConfiguration,
    taxRate: number = 0.26375,
    teilfreistellungsquote: number = 0.3,
    freibetragPerYear?: { [year: number]: number },
    monthlyConfig?: MonthlyWithdrawalConfig
): WithdrawalResult {
    // Helper function to get tax allowance for a specific year
    const getFreibetragForYear = (year: number): number => {
        if (freibetragPerYear && freibetragPerYear[year] !== undefined) {
            return freibetragPerYear[year];
        }
        // Fallback to default value for backwards compatibility
        return freibetrag[2023] || 2000;
    };

    // Generate year-specific growth rates for the withdrawal phase
    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    const yearlyGrowthRates: Record<number, number> = {};
    if (returnConfig.mode === 'fixed') {
        const fixedRate = returnConfig.fixedRate || 0.05;
        for (const year of years) yearlyGrowthRates[year] = fixedRate;
    } else if (returnConfig.mode === 'random' && returnConfig.randomConfig) {
        Object.assign(yearlyGrowthRates, generateRandomReturns(years, returnConfig.randomConfig));
    } else if (returnConfig.mode === 'variable' && returnConfig.variableConfig) {
        for (const year of years) yearlyGrowthRates[year] = returnConfig.variableConfig.yearlyReturns[year] || 0.05;
    }

    const result: WithdrawalResult = {};
    const initialStartingCapital = elements.reduce((sum, el) => {
        const simYear = el.simulation?.[startYear - 1];
        return sum + (simYear?.endkapital || 0);
    }, 0);

    // Create a mutable copy of the layers for the withdrawal simulation
    let mutableLayers = JSON.parse(JSON.stringify(elements)).map((el: SparplanElement) => {
        const lastSimYear = startYear - 1;
        const lastSimData = el.simulation?.[lastSimYear];

        let initialCost = el.einzahlung;
        if (el.type === 'einmalzahlung') {
            initialCost += el.gewinn;
        }

        return {
            ...el,
            currentValue: lastSimData?.endkapital || 0,
            costBasis: initialCost,
            accumulatedVorabpauschale: lastSimData?.vorabpauschaleAccumulated || 0,
        };
    });

    // Sort layers by start date for FIFO
    mutableLayers.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    let baseWithdrawalAmount: number;
    if (strategy === "monatlich_fest") {
        if (!monthlyConfig) throw new Error("Monthly configuration is required for monatlich_fest strategy");
        baseWithdrawalAmount = monthlyConfig.monthlyAmount * 12;
    } else {
        const withdrawalRate = strategy === "4prozent" ? 0.04 : 0.03;
        baseWithdrawalAmount = initialStartingCapital * withdrawalRate;
    }

    for (let year = startYear; year <= endYear; year++) {
        const capitalAtStartOfYear = mutableLayers.reduce((sum, l) => sum + l.currentValue, 0);
        if (capitalAtStartOfYear <= 0) {
            break;
        }

        let annualWithdrawal = baseWithdrawalAmount; // Simplified withdrawal logic for now
        const entnahme = Math.min(annualWithdrawal, capitalAtStartOfYear);

        let amountToWithdraw = entnahme;
        let totalRealizedGainThisYear = 0;

        // --- FIFO Sale Logic ---
        for (const layer of mutableLayers) {
            if (amountToWithdraw <= 0 || layer.currentValue <= 0) continue;

            const amountToSellFromLayer = Math.min(amountToWithdraw, layer.currentValue);
            const proportionSold = amountToSellFromLayer / layer.currentValue;

            const costBasisOfSoldPart = layer.costBasis * proportionSold;
            const accumulatedVorabpauschaleOfSoldPart = layer.accumulatedVorabpauschale * proportionSold;

            const gain = amountToSellFromLayer - costBasisOfSoldPart - accumulatedVorabpauschaleOfSoldPart;
            totalRealizedGainThisYear += gain;

            layer.currentValue -= amountToSellFromLayer;
            layer.costBasis -= costBasisOfSoldPart;
            layer.accumulatedVorabpauschale -= accumulatedVorabpauschaleOfSoldPart;
            amountToWithdraw -= amountToSellFromLayer;
        }

        // --- Tax on Realized Gains ---
        const yearlyFreibetrag = getFreibetragForYear(year);
        const taxableGain = totalRealizedGainThisYear > 0 ? totalRealizedGainThisYear * (1 - teilfreistellungsquote) : 0;
        const taxOnRealizedGains = Math.max(0, taxableGain - yearlyFreibetrag) * taxRate;
        const freibetragUsedOnGains = Math.min(taxableGain, yearlyFreibetrag);
        let remainingFreibetrag = yearlyFreibetrag - freibetragUsedOnGains;

        // --- Growth and Vorabpauschale on Remaining Capital ---
        const returnRate = yearlyGrowthRates[year] || 0;
        const basiszins = getBasiszinsForYear(year);
        let totalPotentialVorabTax = 0;
        const vorabCalculations: any[] = [];

        mutableLayers.forEach(layer => {
            if (layer.currentValue > 0) {
                const valueAfterSale = layer.currentValue;
                const valueAfterGrowth = valueAfterSale * (1 + returnRate);

                const vorabpauschaleBetrag = calculateVorabpauschale(valueAfterSale, valueAfterGrowth, basiszins);
                const potentialTax = calculateSteuerOnVorabpauschale(vorabpauschaleBetrag, taxRate, teilfreistellungsquote);

                totalPotentialVorabTax += potentialTax;
                vorabCalculations.push({ layer, vorabpauschaleBetrag, potentialTax, valueAfterGrowth });
            }
        });
        
        const taxOnVorabpauschale = Math.max(0, totalPotentialVorabTax - remainingFreibetrag);
        const freibetragUsedOnVorab = Math.min(totalPotentialVorabTax, remainingFreibetrag);

        // Update layer values after growth and Vorabpauschale tax
        vorabCalculations.forEach(calc => {
            const taxForLayer = totalPotentialVorabTax > 0 ? (calc.potentialTax / totalPotentialVorabTax) * taxOnVorabpauschale : 0;
            calc.layer.currentValue = calc.valueAfterGrowth - taxForLayer;
            calc.layer.accumulatedVorabpauschale += calc.vorabpauschaleBetrag;
        });

        const capitalAtEndOfYear = mutableLayers.reduce((sum, l) => sum + l.currentValue, 0);
        const totalTaxForYear = taxOnRealizedGains + taxOnVorabpauschale;

        result[year] = {
            startkapital: capitalAtStartOfYear,
            entnahme,
            endkapital: capitalAtEndOfYear,
            bezahlteSteuer: totalTaxForYear,
            genutzterFreibetrag: freibetragUsedOnGains + freibetragUsedOnVorab,
            zinsen: capitalAtEndOfYear - (capitalAtStartOfYear - entnahme),
        };
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