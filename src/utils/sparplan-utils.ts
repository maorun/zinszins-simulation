import type { SimulationAnnualType, SimulationResult } from "./simulate";
import { SimulationAnnual } from "./simulate";

export type Sparplan = {
    id: number;
    start: Date | string;
    end?: Date | string | null;
    einzahlung: number;
    ter?: number; // Optional: Total Expense Ratio as a percentage (e.g., 0.25)
    transactionCosts?: number; // Optional: Fixed transaction costs in Euro
};

export type SparplanElement = {
    start: Date | string;
    type: "sparplan"
    einzahlung: number;
    simulation: SimulationResult;
    ter?: number;
    transactionCosts?: number;
} | {
    start: Date | string;
    type: "einmalzahlung"
    gewinn: number;
    einzahlung: number;
    simulation: SimulationResult;
    ter?: number;
    transactionCosts?: number; // Transaction costs can also apply to lump sums
};

export const initialSparplan: Sparplan = {
    id: 1,
    start: new Date("2023-01-01"),
    end: new Date("2040-10-01"),
    einzahlung: 24000,
}

export function convertSparplanToElements(val: Sparplan[], startEnd: [number, number], simulationAnnual: SimulationAnnualType): SparplanElement[] {
    const data: SparplanElement[] = val.flatMap((el) => {
        const sparplanElementsToSave: SparplanElement[] = []
        
        // Check if this is a one-time payment (start and end dates are the same)
        const isOneTimePayment = el.end && new Date(el.start).getTime() === new Date(el.end).getTime();
        
        if (isOneTimePayment) {
            // Handle one-time payment
            const paymentYear = new Date(el.start).getFullYear();
            if (paymentYear >= new Date().getFullYear() && paymentYear <= startEnd[0]) {
                sparplanElementsToSave.push({
                    start: el.start,
                    type: "einmalzahlung",
                    gewinn: 0, // Will be calculated during simulation
                    einzahlung: el.einzahlung,
                    simulation: {},
                    ter: el.ter,
                    transactionCosts: el.transactionCosts,
                });
            }
        } else {
            // Handle regular savings plan
            for (let i = new Date().getFullYear(); i <= startEnd[0]; i++) {
                if (new Date(el.start).getFullYear() <= i
                    && (!el.end || new Date(el.end).getFullYear() >= i)
                ) {
                    if (simulationAnnual === SimulationAnnual.yearly) {
                        sparplanElementsToSave.push({
                            start: new Date(i + "-01-01"),
                            einzahlung: el.einzahlung,
                            type: "sparplan",
                            simulation: {},
                            ter: el.ter,
                            transactionCosts: el.transactionCosts,
                        })
                    } else {
                        for (let month = 0; month < 12; month++) {
                            if (new Date(el.start).getFullYear() === i && new Date(el.start).getMonth() > month) {
                                continue;
                            } else if (el.end && new Date(el.end).getFullYear() === i && new Date(el.end).getMonth() < month) {
                                continue;
                            } else {
                                sparplanElementsToSave.push({
                                    start: new Date(i + "-" + (month + 1) + "-01"),
                                    einzahlung: el.einzahlung / 12,
                                    type: "sparplan",
                                    simulation: {},
                                    ter: el.ter,
                                    // Monthly transaction costs would be complex, apply annually for now.
                                    // Let's assume transactionCosts on the Sparplan object are annual.
                                    transactionCosts: month === 0 ? el.transactionCosts : 0,
                                })
                            }
                        }
                    }
                }
            }
        }
        return sparplanElementsToSave
    })
    return data
}