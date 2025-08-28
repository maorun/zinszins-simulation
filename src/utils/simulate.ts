import type { SparplanElement } from "../utils/sparplan-utils";
import { getBasiszinsForYear, calculateVorabpauschale, calculateSteuerOnVorabpauschale } from "../../helpers/steuer.tsx";
import { type ReturnConfiguration, generateRandomReturns } from "./random-returns";

export type SimulationResultElement = {
    startkapital: number;
    zinsen: number;
    endkapital: number;
    bezahlteSteuer: number;
    genutzterFreibetrag: number;
    vorabpauschale: number; // The Vorabpauschale amount for this year
    vorabpauschaleAccumulated: number; // The accumulated Vorabpauschale over all years
}

export type SimulationResult = {
    [year: number]: SimulationResultElement;
};

const freibetrag: {
    [year: number]: number;
} = {
    2023: 2000,
};

export const SimulationAnnual: {
    [key in SimulationAnnualType]: SimulationAnnualType
} = {
    yearly: 'yearly',
    monthly: 'monthly',
} as const

export type SimulationAnnualType = 'yearly' | 'monthly'

// Legacy function signature for backward compatibility
export function simulate(
    startYear: number,
    endYear: number,
    elements: SparplanElement[],
    wachstumsrate: number,
    steuerlast: number,
    simulationAnnual: SimulationAnnualType,
    teilfreistellungsquote?: number,
    freibetragPerYear?: {[year: number]: number}
): SparplanElement[];

// New function signature with return configuration
export function simulate(
    startYear: number,
    endYear: number,
    elements: SparplanElement[],
    returnConfig: ReturnConfiguration,
    steuerlast: number,
    simulationAnnual: SimulationAnnualType,
    teilfreistellungsquote?: number,
    freibetragPerYear?: {[year: number]: number}
): SparplanElement[];

// Implementation
export function simulate(
    startYear: number,
    endYear: number,
    elements: SparplanElement[],
    wachstumsrateOrConfig: number | ReturnConfiguration,
    steuerlast: number,
    simulationAnnual: SimulationAnnualType,
    teilfreistellungsquote: number = 0.3,
    freibetragPerYear?: {[year: number]: number}
): SparplanElement[] {
    // Helper function to get tax allowance for a specific year
    const getFreibetragForYear = (year: number): number => {
        if (freibetragPerYear && freibetragPerYear[year] !== undefined) {
            return freibetragPerYear[year];
        }
        // Fallback to default value for backwards compatibility
        return freibetrag[2023] || 2000;
    };

    // Determine if we're using legacy or new API
    const isLegacyAPI = typeof wachstumsrateOrConfig === 'number';
    
    // Generate year-specific growth rates
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
        years.push(year);
    }
    
    const yearlyGrowthRates: Record<number, number> = {};
    
    if (isLegacyAPI) {
        // Legacy API: use fixed rate for all years
        const fixedRate = wachstumsrateOrConfig as number;
        for (const year of years) {
            yearlyGrowthRates[year] = fixedRate;
        }
    } else {
        // New API: use return configuration
        const returnConfig = wachstumsrateOrConfig as ReturnConfiguration;
        
        if (returnConfig.mode === 'fixed') {
            const fixedRate = returnConfig.fixedRate || 0.05;
            for (const year of years) {
                yearlyGrowthRates[year] = fixedRate;
            }
        } else if (returnConfig.mode === 'random' && returnConfig.randomConfig) {
            const randomReturns = generateRandomReturns(years, returnConfig.randomConfig);
            Object.assign(yearlyGrowthRates, randomReturns);
        } else if (returnConfig.mode === 'variable' && returnConfig.variableConfig) {
            // Use variable returns: get rate for each year from the configuration
            for (const year of years) {
                yearlyGrowthRates[year] = returnConfig.variableConfig.yearlyReturns[year] || 0.05;
            }
        }
    }

    // Clear previous simulations and ensure simulation objects exist
    for (const element of elements) {
        element.simulation = {};
    }

    // Main simulation loop
    for (let year = startYear; year <= endYear; year++) {
        const wachstumsrate = yearlyGrowthRates[year];
        const basiszins = getBasiszinsForYear(year);

        const yearlyCalculations: any[] = [];
        let totalPotentialTaxThisYear = 0;

        // --- Pass 1: Calculate growth and potential tax for each element ---
        for (const element of elements) {
            if (new Date(element.start).getFullYear() > year) continue;

            const startkapital = element.simulation?.[year - 1]?.endkapital || element.einzahlung + (element.type === "einmalzahlung" ? element.gewinn : 0);

            let endkapitalVorSteuer: number;
            let anteilImJahr = 12;

            if (simulationAnnual === 'monthly' && new Date(element.start).getFullYear() === year) {
                const wachstumsrateMonth = Math.pow(1 + wachstumsrate, 1 / 12) - 1;
                const startMonth = new Date(element.start).getMonth(); // 0-11
                anteilImJahr = 12 - startMonth;
                endkapitalVorSteuer = startkapital * Math.pow(1 + wachstumsrateMonth, anteilImJahr);
            } else {
                endkapitalVorSteuer = startkapital * (1 + wachstumsrate);
            }

            const jahresgewinn = endkapitalVorSteuer - startkapital;

            const vorabpauschaleBetrag = calculateVorabpauschale(
                startkapital,
                endkapitalVorSteuer,
                basiszins,
                anteilImJahr
            );

            const potentialTax = calculateSteuerOnVorabpauschale(
                vorabpauschaleBetrag,
                steuerlast,
                teilfreistellungsquote
            );

            totalPotentialTaxThisYear += potentialTax;
            yearlyCalculations.push({
                element,
                startkapital,
                endkapitalVorSteuer,
                jahresgewinn,
                vorabpauschaleBetrag,
                potentialTax,
            });
        }

        // --- Pass 2: Determine total tax paid and assign results back to elements ---
        const freibetragInYear = getFreibetragForYear(year);
        const totalTaxPaid = Math.max(0, totalPotentialTaxThisYear - freibetragInYear);
        const genutzterFreibetragTotal = Math.min(totalPotentialTaxThisYear, freibetragInYear);

        for (const calc of yearlyCalculations) {
            const taxForElement =
                totalPotentialTaxThisYear > 0
                    ? (calc.potentialTax / totalPotentialTaxThisYear) * totalTaxPaid
                    : 0;

            const genutzterFreibetragForElement =
                totalPotentialTaxThisYear > 0
                    ? (calc.potentialTax / totalPotentialTaxThisYear) * genutzterFreibetragTotal
                    : 0;

            const endkapital = calc.endkapitalVorSteuer - taxForElement;
            const vorabpauschaleAccumulated =
                (calc.element.simulation[year - 1]?.vorabpauschaleAccumulated || 0) +
                calc.vorabpauschaleBetrag;

            calc.element.simulation[year] = {
                startkapital: calc.startkapital,
                endkapital: endkapital,
                zinsen: calc.jahresgewinn,
                bezahlteSteuer: taxForElement,
                genutzterFreibetrag: genutzterFreibetragForElement,
                vorabpauschale: calc.vorabpauschaleBetrag,
                vorabpauschaleAccumulated: vorabpauschaleAccumulated,
            };
        }
    }

    return elements;
}

