import type { SparplanElement } from "../src/utils/sparplan-utils";
import { getBasiszinsForYear, calculateVorabpauschale, calculateSteuerOnVorabpauschale } from "./steuer";
import type { ReturnConfiguration } from "../src/utils/random-returns";
import { generateRandomReturns } from "../src/utils/random-returns";
import type { SegmentedWithdrawalConfig } from "../src/utils/segmented-withdrawal";


export type WithdrawalStrategy = "4prozent" | "3prozent" | "monatlich_fest" | "variabel_prozent";

export type InflationConfig = {
    inflationRate?: number; // Annual inflation rate for adjustment (default: 2%)
};

export type WithdrawalResultElement = {
    startkapital: number;
    entnahme: number;
    endkapital: number;
    bezahlteSteuer: number;
    genutzterFreibetrag: number;
    zinsen: number;
    // Optional fields for detailed view
    monatlicheEntnahme?: number;
    inflationAnpassung?: number;
    portfolioAnpassung?: number;
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

export function calculateWithdrawal(
    elements: SparplanElement[],
    startYear: number,
    endYear: number,
    strategy: WithdrawalStrategy,
    returnConfig: ReturnConfiguration,
    taxRate: number = 0.26375,
    teilfreistellungsquote: number = 0.3,
    freibetragPerYear?: { [year: number]: number },
    monthlyConfig?: MonthlyWithdrawalConfig,
    customPercentage?: number,
    enableGrundfreibetrag?: boolean,
    grundfreibetragPerYear?: {[year: number]: number},
    incomeTaxRate?: number,
    inflationConfig?: InflationConfig
): { result: WithdrawalResult, finalLayers: any[] } { // Changed finalLayers to any[] to satisfy downstream consumers
    // Helper functions
    const getFreibetragForYear = (year: number): number => {
        if (freibetragPerYear && freibetragPerYear[year] !== undefined) return freibetragPerYear[year];
        return freibetrag[2023] || 2000;
    };
    const getGrundfreibetragForYear = (year: number): number => {
        if (grundfreibetragPerYear && grundfreibetragPerYear[year] !== undefined) return grundfreibetragPerYear[year];
        return grundfreibetrag[2023] || 10908;
    };

    // Generate year-specific growth rates
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

    let mutableLayers = JSON.parse(JSON.stringify(elements)).map((el: any) => {
        const lastSimData = el.simulation?.[startYear - 1];
        let initialCost = el.type === 'einmalzahlung' ? el.einzahlung + el.gewinn : el.einzahlung;
        return {
            ...el,
            currentValue: lastSimData?.endkapital || 0,
            costBasis: initialCost,
            accumulatedVorabpauschale: lastSimData?.vorabpauschaleAccumulated || 0,
        };
    });
    mutableLayers.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    let baseWithdrawalAmount: number;
    if (strategy === "monatlich_fest") {
        if (!monthlyConfig) throw new Error("Monthly config required");
        baseWithdrawalAmount = monthlyConfig.monthlyAmount * 12;
    } else if (strategy === "variabel_prozent") {
        if (customPercentage === undefined) throw new Error("Custom percentage required");
        baseWithdrawalAmount = initialStartingCapital * customPercentage;
    } else {
        const withdrawalRate = strategy === "4prozent" ? 0.04 : 0.03;
        baseWithdrawalAmount = initialStartingCapital * withdrawalRate;
    }

    for (let year = startYear; year <= endYear; year++) {
        const capitalAtStartOfYear = mutableLayers.reduce((sum, l) => sum + l.currentValue, 0);
        if (capitalAtStartOfYear <= 0) break;

        let annualWithdrawal = baseWithdrawalAmount;
        let inflationAnpassung = 0;
        if (inflationConfig?.inflationRate) {
            const yearsPassed = year - startYear;
            inflationAnpassung = baseWithdrawalAmount * (Math.pow(1 + inflationConfig.inflationRate, yearsPassed) - 1);
            annualWithdrawal += inflationAnpassung;
        }

        const entnahme = Math.min(annualWithdrawal, capitalAtStartOfYear);
        let amountToWithdraw = entnahme;
        let totalRealizedGainThisYear = 0;

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

        const yearlyFreibetrag = getFreibetragForYear(year);
        const taxableGain = totalRealizedGainThisYear > 0 ? totalRealizedGainThisYear * (1 - teilfreistellungsquote) : 0;
        const taxOnRealizedGains = Math.max(0, taxableGain - yearlyFreibetrag) * taxRate;
        const freibetragUsedOnGains = Math.min(taxableGain, yearlyFreibetrag);
        let remainingFreibetrag = yearlyFreibetrag - freibetragUsedOnGains;

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
        vorabCalculations.forEach(calc => {
            const taxForLayer = totalPotentialVorabTax > 0 ? (calc.potentialTax / totalPotentialVorabTax) * taxOnVorabpauschale : 0;
            calc.layer.currentValue = calc.valueAfterGrowth - taxForLayer;
            calc.layer.accumulatedVorabpauschale += calc.vorabpauschaleBetrag;
        });

        let einkommensteuer = 0;
        let genutzterGrundfreibetrag = 0;
        if (enableGrundfreibetrag) {
            const yearlyGrundfreibetrag = getGrundfreibetragForYear(year);
            einkommensteuer = calculateIncomeTax(entnahme, yearlyGrundfreibetrag, incomeTaxRate);
            genutzterGrundfreibetrag = Math.min(entnahme, yearlyGrundfreibetrag);
        }

        const capitalAtEndOfYear = mutableLayers.reduce((sum, l) => sum + l.currentValue, 0);
        const totalTaxForYear = taxOnRealizedGains + taxOnVorabpauschale + einkommensteuer;

        result[year] = {
            startkapital: capitalAtStartOfYear,
            entnahme,
            endkapital: capitalAtEndOfYear,
            bezahlteSteuer: totalTaxForYear,
            genutzterFreibetrag: freibetragUsedOnGains + freibetragUsedOnVorab,
            zinsen: capitalAtEndOfYear - (capitalAtStartOfYear - entnahme),
            monatlicheEntnahme: strategy === 'monatlich_fest' ? annualWithdrawal / 12 : undefined,
            inflationAnpassung: inflationConfig?.inflationRate ? inflationAnpassung : undefined,
            einkommensteuer: enableGrundfreibetrag ? einkommensteuer : undefined,
            genutzterGrundfreibetrag: enableGrundfreibetrag ? genutzterGrundfreibetrag : undefined,
        };
    }

    const finalLayers = mutableLayers.map(l => {
        const lastYear = Object.keys(l.simulation).map(Number).sort((a,b) => b-a)[0] || (startYear -1);
        l.simulation[lastYear] = {
            ...l.simulation[lastYear],
            endkapital: l.currentValue,
            vorabpauschaleAccumulated: l.accumulatedVorabpauschale
        }
        return l;
    })

    return { result, finalLayers };
}

export function calculateSegmentedWithdrawal(
    elements: SparplanElement[],
    segmentedConfig: SegmentedWithdrawalConfig
): WithdrawalResult {
    const result: WithdrawalResult = {};
    let currentLayers: any[] = elements;

    const sortedSegments = [...segmentedConfig.segments].sort((a, b) => a.startYear - b.startYear);

    for (const segment of sortedSegments) {
        const segmentResult = calculateWithdrawal(
            currentLayers,
            segment.startYear,
            segment.endYear,
            segment.strategy,
            segment.returnConfig,
            segmentedConfig.taxRate,
            0.3, // Assuming default, should be passed in config
            segmentedConfig.freibetragPerYear,
            segment.monthlyConfig,
            segment.customPercentage,
            segment.enableGrundfreibetrag,
            segment.grundfreibetragPerYear,
            segment.incomeTaxRate,
            segment.inflationConfig
        );

        Object.assign(result, segmentResult.result);
        currentLayers = segmentResult.finalLayers;

        const lastYearOfSegment = Object.keys(segmentResult.result).map(Number).sort((a, b) => b - a)[0];
        if (lastYearOfSegment && segmentResult.result[lastYearOfSegment].endkapital <= 0) {
            break;
        }
    }

    return result;
}

export function calculateIncomeTax(
    withdrawalAmount: number,
    grundfreibetragYear: number = grundfreibetrag[2023],
    incomeTaxRate: number = 0.25
): number {
    const taxableIncome = Math.max(0, withdrawalAmount - grundfreibetragYear);
    return taxableIncome * incomeTaxRate;
}

export function getTotalCapitalAtYear(elements: any[], year: number): number {
    return elements.reduce((total, element) => {
        const yearData = element.simulation?.[year];
        return total + (yearData?.endkapital || 0);
    }, 0);
}

export function calculateWithdrawalDuration(
    withdrawalResult: WithdrawalResult,
    startYear: number
): number | null {
    const years = Object.keys(withdrawalResult).map(Number).sort((a, b) => a - b);

    for (const year of years) {
        if (withdrawalResult[year].endkapital <= 0) {
            return year - startYear + 1;
        }
    }

    return null;
}
