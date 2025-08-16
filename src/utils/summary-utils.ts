import type { SimulationResult, SimulationResultElement } from "./simulate";
import type { SparplanElement } from "../utils/sparplan-utils";

export type Summary = {
    startkapital: number;
    zinsen: number;
    bezahlteSteuer: number;
    endkapital: number;
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