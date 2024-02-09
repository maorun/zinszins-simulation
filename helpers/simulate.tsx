import type { SparplanElement } from "~/components/SparplanEingabe";
import { zinszinsVorabpauschale } from "./steuer";

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

export function simulate(
    startYear: number,
    endYear: number,
    elements: SparplanElement[],
    wachstumsrate: number,
    steuerlast: number,
    simulationAnnual: SimulationAnnualType
): SparplanElement[] {
    const years = [];
    for (let year = startYear; year <= endYear; year++) {
        for (const element of elements) {
            element.simulation = {}
        }
    }
    for (let year = startYear; year <= endYear; year++) {
        years.push(year);
        let freibetragInYear = freibetrag[year] || 0;
        if (
            simulationAnnual === SimulationAnnual.monthly
        ) {
            const wachstumsrateMonth = Math.pow(1 + wachstumsrate, 1 / 12) - 1;
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
                            basiszinsen[year] || 0,
                            freibetragInYear,
                            steuerlast
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
                    const month = new Date(element.start).getMonth() + 1;
                    const kapital = element.simulation?.[year]?.startkapital || element.einzahlung;
                    const vorabPauschaleZinzen = zinszinsVorabpauschale(
                        kapital,
                        basiszinsen[year] || 0,
                        freibetragInYear,
                        steuerlast,
                        0.7,
                        0.3,
                        month
                    );
                    element.simulation[year]['bezahlteSteuer'] = vorabPauschaleZinzen.steuer;
                    element.simulation[year]['endkapital'] -= vorabPauschaleZinzen.steuer;
                    element.simulation[year]['zinsen'] = element.simulation[year]['endkapital'] - element.simulation[year]['startkapital'];
                    element.simulation[year]['genutzterFreibetrag'] = freibetragInYear - vorabPauschaleZinzen.verbleibenderFreibetrag;
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
                        basiszinsen[year] || 0,
                        freibetragInYear,
                        steuerlast
                    );
                    element.simulation[year] = {
                        startkapital: kapital,
                        endkapital: kapital * (1 + wachstumsrate) - endKapital.steuer,
                        zinsen: kapital * (1 + wachstumsrate),
                        bezahlteSteuer: endKapital.steuer,
                        genutzterFreibetrag: 0,
                    };
                    element.simulation[year]['genutzterFreibetrag'] = freibetragInYear - endKapital.verbleibenderFreibetrag;
                    freibetragInYear = endKapital.verbleibenderFreibetrag;
                }
            }
        }
    }
    return elements;
}
