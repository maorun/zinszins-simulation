import type { SimulationAnnualType, SimulationResult } from "./simulate";
import { SimulationAnnual } from "./simulate";

export type Sparplan = {
    id: number;
    start: Date | string;
    end?: Date | string | null;
    einzahlung: number;
};

export type SparplanElement = {
    start: Date | string;
    type: "sparplan"
    einzahlung: number;
    simulation: SimulationResult;
} | {
    start: Date | string;
    type: "einmalzahlung"
    gewinn: number;
    einzahlung: number;
    simulation: SimulationResult;
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
                            })
                        }
                    }
                }
            }

        }
        return sparplanElementsToSave
    })
    return data
}