import type { SparplanElement } from "~/components/SparplanEingabe";
import { zinszinsVorabpauschale } from "./steuer";
import { type ReturnConfiguration, generateRandomReturns } from "./random-returns";

export type SimulationResultElement = {
    startkapital: number;
    zinsen: number;
    endkapital: number;
    bezahlteSteuer: number;
    genutzterFreibetrag: number;
}

export type SimulationResult = {
    [year: number]: SimulationResultElement;
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
    teilfreistellungsquote?: number
): SparplanElement[];

// New function signature with return configuration
export function simulate(
    startYear: number,
    endYear: number,
    elements: SparplanElement[],
    returnConfig: ReturnConfiguration,
    steuerlast: number,
    simulationAnnual: SimulationAnnualType,
    teilfreistellungsquote?: number
): SparplanElement[];

// Implementation
export function simulate(
    startYear: number,
    endYear: number,
    elements: SparplanElement[],
    wachstumsrateOrConfig: number | ReturnConfiguration,
    steuerlast: number,
    simulationAnnual: SimulationAnnualType,
    teilfreistellungsquote: number = 0.3
): SparplanElement[] {
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
            // Use user-defined yearly returns, fall back to 5% default for missing years
            for (const year of years) {
                yearlyGrowthRates[year] = returnConfig.variableConfig.yearlyReturns[year] || 0.05;
            }
        }
    }

    // Clear previous simulations
    for (let year = startYear; year <= endYear; year++) {
        for (const element of elements) {
            element.simulation = {}
        }
    }
    // Main simulation loop
    for (let year = startYear; year <= endYear; year++) {
        const wachstumsrate = yearlyGrowthRates[year];
        let freibetragInYear = freibetrag[2023];
        
        if (simulationAnnual === SimulationAnnual.monthly) {
            const wachstumsrateMonth = Math.pow(1 + wachstumsrate, 1 / 12) - 1

            for (const element of elements) {
                if (new Date(element.start).getFullYear() <= year) {
                    if (new Date(element.start).getFullYear() === year) {

                        //wertzuwachs unterjahr
                        for (let month = 1; month <= 12; month++) {
                            if (new Date(element.start).getMonth() + 1 <= month) {
                                if (!element.simulation?.[year]?.startkapital) {
                                    if (!element.simulation) {
                                        element.simulation = {}
                                    }
                                    element.simulation[year] = {
                                        startkapital: element.einzahlung,
                                        endkapital: element.einzahlung * (1 + wachstumsrateMonth),
                                        zinsen: 0,
                                        bezahlteSteuer: 0,
                                        genutzterFreibetrag: 0,
                                    }
                                } else {
                                    element.simulation[year] = {
                                        startkapital: (element.simulation[year]?.startkapital || 0),
                                        endkapital: ((element.simulation[year]?.endkapital || 0)) * (1 + wachstumsrateMonth),
                                        zinsen: 0,
                                        bezahlteSteuer: 0,
                                        genutzterFreibetrag: 0,
                                    };

                                }
                            }
                        }
                    } else {
                        let kapital =
                            element.simulation?.[year - 1]?.endkapital ||
                            element.einzahlung + (element.type === "einmalzahlung" ? element.gewinn : 0);

                        const endKapital = zinszinsVorabpauschale(
                            kapital,
                            basiszinsen[2023],
                            freibetragInYear,
                            steuerlast,
                            0.7,
                            teilfreistellungsquote,
                            12
                        );

                        if (!element.simulation) {
                            element.simulation = {}
                        }

                        element.simulation[year] = {
                            startkapital: kapital,
                            endkapital: kapital * (1 + wachstumsrate) - endKapital.steuer,
                            zinsen: kapital * (1 + wachstumsrate),
                            bezahlteSteuer: endKapital.steuer,
                            genutzterFreibetrag: 0,

                        };
                        element.simulation[year]['genutzterFreibetrag'] = freibetragInYear - endKapital.verbleibenderFreibetrag
                    }
                }
            }
            for (const element of elements) {
                if (new Date(element.start).getFullYear() <= year) {
                    const month = new Date(element.start).getMonth() + 1
                    const kapital = element.simulation?.[year]?.startkapital || element.einzahlung;

                    const vorabPauschaleZinzen = zinszinsVorabpauschale(
                        kapital,
                        basiszinsen[2023],
                        freibetragInYear,
                        steuerlast,
                        0.7,
                        teilfreistellungsquote,
                        month
                    );
                    element.simulation[year]['bezahlteSteuer'] = vorabPauschaleZinzen.steuer
                    element.simulation[year]['endkapital'] -= vorabPauschaleZinzen.steuer
                    element.simulation[year]['zinsen'] = element.simulation[year]['endkapital'] - element.simulation[year]['startkapital']
                    element.simulation[year]['genutzterFreibetrag'] = freibetragInYear - vorabPauschaleZinzen.verbleibenderFreibetrag
                    freibetragInYear = vorabPauschaleZinzen.verbleibenderFreibetrag;
                }
            }
        } else {
            for (const element of elements) {
                if (new Date(element.start).getFullYear() <= year) {
                    let kapital =
                        element.simulation[year - 1]?.endkapital ||
                        element.einzahlung + (element.type === "einmalzahlung" ? element.gewinn : 0);

                    const endKapital = zinszinsVorabpauschale(
                        kapital,
                        basiszinsen[2023],
                        freibetragInYear,
                        steuerlast,
                        0.7,
                        teilfreistellungsquote,
                        12
                    );

                    element.simulation[year] = {
                        startkapital: kapital,
                        endkapital: kapital * (1 + wachstumsrate) - endKapital.steuer,
                        zinsen: kapital * (1 + wachstumsrate),
                        bezahlteSteuer: endKapital.steuer,
                        genutzterFreibetrag: 0,

                    };
                    element.simulation[year]['genutzterFreibetrag'] = freibetragInYear - endKapital.verbleibenderFreibetrag
                    freibetragInYear = endKapital.verbleibenderFreibetrag;
                }
            }
        }
    }

    return elements;
}

