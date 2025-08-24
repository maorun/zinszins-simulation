import { zinszinsVorabpauschale, getBasiszinsForYear } from "./steuer";
import type { ReturnConfiguration } from "../../helpers/random-returns";
import { generateRandomReturns } from "../../helpers/random-returns";
import type { SegmentedWithdrawalConfig, WithdrawalSegment } from "./segmented-withdrawal";

export type WithdrawalStrategy = "4prozent" | "3prozent" | "monatlich_fest" | "variabel_prozent" | "dynamisch_prozent";

export type WithdrawalResultElement = {
    startkapital: number;
    entnahme: number;
    endkapital: number;
    bezahlteSteuer: number;
    genutzterFreibetrag: number;
    zinsen: number;
    monatlicheEntnahme?: number;
    inflationAnpassung?: number;
    portfolioAnpassung?: number;
    dynamicAnpassung?: number;
    einkommensteuer?: number;
    genutzterGrundfreibetrag?: number;
}

export type WithdrawalResult = {
    [year: number]: WithdrawalResultElement;
};

export type InflationConfig = {
    inflationRate?: number;
};

export type MonthlyWithdrawalConfig = {
    monthlyAmount: number;
    inflationRate?: number;
    enableGuardrails?: boolean;
    guardrailsThreshold?: number;
};

export type DynamicWithdrawalConfig = {
    upperThreshold: number;
    upperAdjustment: number;
    lowerThreshold: number;
    lowerAdjustment: number;
};

const freibetrag: { [year: number]: number; } = { 2023: 2000 };
const grundfreibetrag: { [year: number]: number; } = { 2023: 10908 };

export function calculateWithdrawal(
    startingCapital: number,
    startYear: number,
    endYear: number,
    strategy: WithdrawalStrategy,
    returnConfig: ReturnConfiguration | number,
    taxRate: number = 0.26375,
    freibetragPerYear?: { [year: number]: number },
    monthlyConfig?: MonthlyWithdrawalConfig,
    customPercentage?: number,
    enableGrundfreibetrag?: boolean,
    grundfreibetragPerYear?: { [year: number]: number },
    incomeTaxRate?: number,
    variableReturns?: { [year: number]: number },
    inflationConfig?: InflationConfig,
    dynamicConfig?: DynamicWithdrawalConfig
): WithdrawalResult {
    const getFreibetragForYear = (year: number): number => {
        if (freibetragPerYear && freibetragPerYear[year] !== undefined) return freibetragPerYear[year];
        return freibetrag[2023] || 2000;
    };

    const getGrundfreibetragForYear = (year: number): number => {
        if (grundfreibetragPerYear && grundfreibetragPerYear[year] !== undefined) return grundfreibetragPerYear[year];
        return grundfreibetrag[2023] || 10908;
    };

    const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
    let yearlyReturns: { [year: number]: number } = {};

    if (variableReturns) {
        const defaultRate = typeof returnConfig === 'number' ? returnConfig : 0.05;
        yearlyReturns = Object.fromEntries(years.map(year => [year, defaultRate]));
        Object.entries(variableReturns).forEach(([year, rate]) => {
            const yearNum = parseInt(year);
            if (yearNum >= startYear && yearNum <= endYear) yearlyReturns[yearNum] = rate;
        });
    } else if (typeof returnConfig === 'number') {
        yearlyReturns = Object.fromEntries(years.map(year => [year, returnConfig]));
    } else {
        if (returnConfig.mode === 'fixed') {
            const fixedRate = returnConfig.fixedRate || 0.05;
            yearlyReturns = Object.fromEntries(years.map(year => [year, fixedRate]));
        } else if (returnConfig.mode === 'random') {
            if (!returnConfig.randomConfig) throw new Error("Random configuration is required");
            yearlyReturns = generateRandomReturns(years, returnConfig.randomConfig);
        } else if (returnConfig.mode === 'variable') {
            if (!returnConfig.variableConfig) throw new Error("Variable configuration is required");
            const defaultRate = 0.05;
            yearlyReturns = Object.fromEntries(years.map(year => [year, defaultRate]));
            Object.entries(returnConfig.variableConfig.yearlyReturns).forEach(([year, rate]) => {
                const yearNum = parseInt(year);
                if (yearNum >= startYear && yearNum <= endYear) yearlyReturns[yearNum] = rate;
            });
        }
    }

    const getReturnRateForYear = (year: number): number => yearlyReturns[year] !== undefined ? yearlyReturns[year] : 0.05;

    const result: WithdrawalResult = {};
    let currentCapital = startingCapital;
    let baseWithdrawalAmount: number;

    if (strategy === "monatlich_fest") {
        if (!monthlyConfig) throw new Error("Monthly configuration is required for monatlich_fest strategy");
        baseWithdrawalAmount = monthlyConfig.monthlyAmount * 12;
    } else if (strategy === "variabel_prozent" || strategy === "dynamisch_prozent") {
        if (customPercentage === undefined) throw new Error("Custom percentage is required for variabel_prozent and dynamisch_prozent strategies");
        baseWithdrawalAmount = startingCapital * customPercentage;
    } else {
        const withdrawalRate = strategy === "4prozent" ? 0.04 : 0.03;
        baseWithdrawalAmount = startingCapital * withdrawalRate;
    }

    for (let year = startYear; year <= endYear; year++) {
        const yearlyFreibetrag = getFreibetragForYear(year);
        const startkapital = currentCapital;
        let annualWithdrawal = baseWithdrawalAmount;
        let inflationAnpassung = 0;
        let portfolioAnpassung = 0;
        let dynamicAnpassung = 0;
        const yearsPassed = year - startYear;

        if (inflationConfig?.inflationRate) {
            inflationAnpassung = baseWithdrawalAmount * (Math.pow(1 + inflationConfig.inflationRate, yearsPassed) - 1);
            annualWithdrawal += inflationAnpassung;
        }

        if (strategy === "monatlich_fest" && monthlyConfig) {
            if (!inflationConfig && monthlyConfig.inflationRate) {
                inflationAnpassung = baseWithdrawalAmount * (Math.pow(1 + monthlyConfig.inflationRate, yearsPassed) - 1);
                annualWithdrawal += inflationAnpassung;
            } else if (!inflationConfig && !monthlyConfig.inflationRate) {
                inflationAnpassung = baseWithdrawalAmount * (Math.pow(1.02, yearsPassed) - 1);
                annualWithdrawal += inflationAnpassung;
            }
            if (monthlyConfig.enableGuardrails && yearsPassed > 0) {
                const threshold = monthlyConfig.guardrailsThreshold || 0.10;
                const baselineReturnRate = 0.05;
                let expectedCapitalWithWithdrawals = startingCapital;
                for (let i = 0; i < yearsPassed; i++) {
                    expectedCapitalWithWithdrawals = (expectedCapitalWithWithdrawals - baseWithdrawalAmount) * (1 + baselineReturnRate);
                }
                const actualVsExpected = (currentCapital - expectedCapitalWithWithdrawals) / Math.abs(expectedCapitalWithWithdrawals);
                if (actualVsExpected > threshold) portfolioAnpassung = annualWithdrawal * 0.05;
                else if (actualVsExpected < -threshold) portfolioAnpassung = -annualWithdrawal * 0.05;
                annualWithdrawal += portfolioAnpassung;
            }
        }

        if (strategy === "dynamisch_prozent" && dynamicConfig && yearsPassed > 0) {
            const yearlyReturnRate = getReturnRateForYear(year);
            if (yearlyReturnRate > dynamicConfig.upperThreshold) {
                dynamicAnpassung = annualWithdrawal * dynamicConfig.upperAdjustment;
            } else if (yearlyReturnRate < dynamicConfig.lowerThreshold) {
                dynamicAnpassung = annualWithdrawal * dynamicConfig.lowerAdjustment;
            }
            annualWithdrawal += dynamicAnpassung;
        }

        const entnahme = Math.min(annualWithdrawal, currentCapital);
        const capitalAfterWithdrawal = Math.max(0, startkapital - entnahme);
        const yearlyReturnRate = getReturnRateForYear(year);
        const capitalAfterGrowth = capitalAfterWithdrawal * (1 + yearlyReturnRate);
        const zinsen = capitalAfterGrowth - capitalAfterWithdrawal;
        const taxCalculation = zinszinsVorabpauschale(capitalAfterWithdrawal, getBasiszinsForYear(year), yearlyFreibetrag, taxRate);
        let einkommensteuer = 0;
        let genutzterGrundfreibetrag = 0;

        if (enableGrundfreibetrag) {
            const yearlyGrundfreibetrag = getGrundfreibetragForYear(year);
            const effectiveIncomeTaxRate = incomeTaxRate || 0.25;
            einkommensteuer = calculateIncomeTax(entnahme, yearlyGrundfreibetrag, effectiveIncomeTaxRate);
            genutzterGrundfreibetrag = Math.min(entnahme, yearlyGrundfreibetrag);
        }

        const totalTax = taxCalculation.steuer + einkommensteuer;
        const endkapital = Math.max(0, capitalAfterGrowth - totalTax);

        result[year] = {
            startkapital, entnahme, endkapital, zinsen,
            bezahlteSteuer: totalTax,
            genutzterFreibetrag: yearlyFreibetrag - taxCalculation.verbleibenderFreibetrag,
            monatlicheEntnahme: strategy === "monatlich_fest" ? entnahme / 12 : undefined,
            inflationAnpassung: (inflationConfig?.inflationRate || (strategy === "monatlich_fest" && monthlyConfig)) ? inflationAnpassung : undefined,
            portfolioAnpassung: strategy === "monatlich_fest" ? portfolioAnpassung : undefined,
            dynamicAnpassung: strategy === "dynamisch_prozent" ? dynamicAnpassung : undefined,
            einkommensteuer: enableGrundfreibetrag ? einkommensteuer : undefined,
            genutzterGrundfreibetrag: enableGrundfreibetrag ? genutzterGrundfreibetrag : undefined
        };
        currentCapital = endkapital;
        if (currentCapital <= 0) break;
    }
    return result;
}

export function calculateIncomeTax(withdrawalAmount: number, grundfreibetragYear: number = grundfreibetrag[2023], incomeTaxRate: number = 0.25): number {
    const taxableIncome = Math.max(0, withdrawalAmount - grundfreibetragYear);
    return taxableIncome * incomeTaxRate;
}

export function calculateWithdrawalDuration(withdrawalResult: WithdrawalResult, startYear: number): number | null {
    const years = Object.keys(withdrawalResult).map(Number).sort((a, b) => a - b);
    for (const year of years) {
        if (withdrawalResult[year].endkapital <= 0) return year - startYear + 1;
    }
    if (years.length >= 2) {
        const lastYear = years[years.length - 1];
        const firstYear = years[0];
        if (withdrawalResult[lastYear].endkapital < withdrawalResult[firstYear].startkapital * 0.5) return null;
    }
    return null;
}

export function calculateSegmentedWithdrawal(startingCapital: number, segmentedConfig: SegmentedWithdrawalConfig): WithdrawalResult {
    const result: WithdrawalResult = {};
    let currentCapital = startingCapital;
    const sortedSegments = [...segmentedConfig.segments].sort((a, b) => a.startYear - b.startYear);
    for (const segment of sortedSegments) {
        const segmentResult = calculateWithdrawalForSegment(currentCapital, segment, segmentedConfig.taxRate, segmentedConfig.freibetragPerYear);
        Object.assign(result, segmentResult);
        const segmentYears = Object.keys(segmentResult).map(Number).sort((a, b) => b - a);
        if (segmentYears.length > 0) {
            currentCapital = segmentResult[segmentYears[0]].endkapital;
            if (currentCapital <= 0) break;
        }
    }
    return result;
}

export function calculateWithdrawalForSegment(startingCapital: number, segment: WithdrawalSegment, globalTaxRate: number, globalFreibetragPerYear?: { [year: number]: number }): WithdrawalResult {
    return calculateWithdrawal(
        startingCapital,
        segment.startYear,
        segment.endYear,
        segment.strategy,
        segment.returnConfig,
        globalTaxRate,
        globalFreibetragPerYear,
        segment.monthlyConfig,
        segment.customPercentage,
        segment.enableGrundfreibetrag,
        segment.grundfreibetragPerYear,
        segment.incomeTaxRate,
        undefined,
        segment.inflationConfig,
        segment.dynamicConfig
    );
}

export function getTotalCapitalAtYear(elements: any[], year: number): number {
    return elements.reduce((total, element) => {
        const yearData = element.simulation?.[year];
        return total + (yearData?.endkapital || 0);
    }, 0);
}