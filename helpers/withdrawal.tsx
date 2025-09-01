import type { SparplanElement } from "../src/utils/sparplan-utils";
import { getBasiszinsForYear, calculateVorabpauschale, calculateSteuerOnVorabpauschale } from "./steuer";
import type { ReturnConfiguration } from "../src/utils/random-returns";
import { generateRandomReturns } from "../src/utils/random-returns";
import type { SegmentedWithdrawalConfig, WithdrawalSegment } from "../src/utils/segmented-withdrawal";


export type WithdrawalStrategy = "4prozent" | "3prozent" | "monatlich_fest" | "variabel_prozent" | "dynamisch" | "bucket";

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
    // Dynamic strategy specific fields
    dynamischeAnpassung?: number; // Amount of dynamic adjustment applied
    vorjahresRendite?: number; // Previous year's return rate (for dynamic strategy)
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

export type DynamicWithdrawalConfig = {
    baseWithdrawalRate: number; // Base withdrawal rate as percentage (e.g., 0.04 for 4%)
    upperThresholdReturn: number; // Upper threshold return rate as percentage (e.g., 0.08 for 8%)
    upperThresholdAdjustment: number; // Relative adjustment when return exceeds upper threshold (e.g., 0.05 for 5% increase)
    lowerThresholdReturn: number; // Lower threshold return rate as percentage (e.g., 0.02 for 2%)
    lowerThresholdAdjustment: number; // Relative adjustment when return falls below lower threshold (e.g., -0.05 for 5% decrease)
};

export type BucketConfig = {
    id: string; // Unique identifier for the bucket
    name: string; // Display name (e.g., "Aktien", "Anleihen", "Cash")
    allocation: number; // Percentage allocation (0-100, total should be 100)
    returnConfig: ReturnConfiguration; // Return configuration for this bucket
    description?: string; // Optional description of the bucket
};

export type BucketWithdrawalConfig = {
    buckets: BucketConfig[]; // Array of buckets
    baseWithdrawalRate: number; // Base withdrawal rate as percentage (e.g., 0.04 for 4%)
    rebalanceAnnually?: boolean; // Whether to rebalance buckets annually (default: true)
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

type MutableLayer = SparplanElement & {
    currentValue: number;
    costBasis: number;
    accumulatedVorabpauschale: number;
};

export type CalculateWithdrawalParams = {
    elements: SparplanElement[];
    startYear: number;
    endYear: number;
    strategy: WithdrawalStrategy;
    returnConfig: ReturnConfiguration;
    taxRate?: number;
    teilfreistellungsquote?: number;
    freibetragPerYear?: { [year: number]: number };
    monthlyConfig?: MonthlyWithdrawalConfig;
    customPercentage?: number;
    enableGrundfreibetrag?: boolean;
    grundfreibetragPerYear?: { [year: number]: number };
    incomeTaxRate?: number;
    inflationConfig?: InflationConfig;
    dynamicConfig?: DynamicWithdrawalConfig;
    bucketConfig?: BucketWithdrawalConfig;
};

export function calculateWithdrawal({
    elements,
    startYear,
    endYear,
    strategy,
    returnConfig,
    taxRate = 0.26375,
    teilfreistellungsquote = 0.3,
    freibetragPerYear,
    monthlyConfig,
    customPercentage,
    enableGrundfreibetrag,
    grundfreibetragPerYear,
    incomeTaxRate,
    inflationConfig,
    dynamicConfig,
    bucketConfig
}: CalculateWithdrawalParams): { result: WithdrawalResult; finalLayers: MutableLayer[] } {
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
    
    // For dynamic strategy, we also need the previous year's return rate
    const allYears = strategy === "dynamisch" ? 
        Array.from({ length: endYear - startYear + 2 }, (_, i) => startYear - 1 + i) : 
        years;
    
    const yearlyGrowthRates: Record<number, number> = {};
    if (returnConfig.mode === 'fixed') {
        const fixedRate = returnConfig.fixedRate || 0.05;
        for (const year of allYears) yearlyGrowthRates[year] = fixedRate;
    } else if (returnConfig.mode === 'random' && returnConfig.randomConfig) {
        Object.assign(yearlyGrowthRates, generateRandomReturns(allYears, returnConfig.randomConfig));
    } else if (returnConfig.mode === 'variable' && returnConfig.variableConfig) {
        for (const year of allYears) yearlyGrowthRates[year] = returnConfig.variableConfig.yearlyReturns[year] || 0.05;
    }

    const result: WithdrawalResult = {};
    const initialStartingCapital = elements.reduce((sum: number, el: SparplanElement) => {
        const simYear = el.simulation?.[startYear - 1];
        return sum + (simYear?.endkapital || 0);
    }, 0);

    const mutableLayers: MutableLayer[] = JSON.parse(JSON.stringify(elements)).map((el: SparplanElement) => {
        const lastSimData = el.simulation?.[startYear - 1];
        const initialCost = el.type === 'einmalzahlung' ? el.einzahlung + (el.gewinn || 0) : el.einzahlung;
        return {
            ...el,
            currentValue: lastSimData?.endkapital || 0,
            costBasis: initialCost,
            accumulatedVorabpauschale: lastSimData?.vorabpauschaleAccumulated || 0,
        };
    });
    mutableLayers.sort((a: MutableLayer, b: MutableLayer) => new Date(a.start).getTime() - new Date(b.start).getTime());

    let baseWithdrawalAmount: number;
    if (strategy === "monatlich_fest") {
        if (!monthlyConfig) throw new Error("Monthly config required");
        baseWithdrawalAmount = monthlyConfig.monthlyAmount * 12;
    } else if (strategy === "variabel_prozent") {
        if (customPercentage === undefined) throw new Error("Custom percentage required");
        baseWithdrawalAmount = initialStartingCapital * customPercentage;
    } else if (strategy === "dynamisch") {
        if (!dynamicConfig) throw new Error("Dynamic config required");
        baseWithdrawalAmount = initialStartingCapital * dynamicConfig.baseWithdrawalRate;
    } else if (strategy === "bucket") {
        if (!bucketConfig) throw new Error("Bucket config required");
        baseWithdrawalAmount = initialStartingCapital * bucketConfig.baseWithdrawalRate;
    } else {
        const withdrawalRate = strategy === "4prozent" ? 0.04 : 0.03;
        baseWithdrawalAmount = initialStartingCapital * withdrawalRate;
    }

    // Handle bucket strategy separately due to different calculation logic
    if (strategy === "bucket" && bucketConfig) {
        return calculateBucketWithdrawal({
            buckets: bucketConfig.buckets,
            baseWithdrawalRate: bucketConfig.baseWithdrawalRate,
            rebalanceAnnually: bucketConfig.rebalanceAnnually ?? true,
            mutableLayers,
            startYear,
            endYear,
            taxRate,
            teilfreistellungsquote,
            freibetragPerYear,
            enableGrundfreibetrag,
            grundfreibetragPerYear,
            incomeTaxRate,
            inflationConfig
        });
    }

    for (let year = startYear; year <= endYear; year++) {
        const capitalAtStartOfYear = mutableLayers.reduce((sum: number, l: MutableLayer) => sum + l.currentValue, 0);
        if (capitalAtStartOfYear <= 0) break;

        let annualWithdrawal = baseWithdrawalAmount;
        let inflationAnpassung = 0;
        if (inflationConfig?.inflationRate) {
            const yearsPassed = year - startYear;
            inflationAnpassung = baseWithdrawalAmount * (Math.pow(1 + inflationConfig.inflationRate, yearsPassed) - 1);
            annualWithdrawal += inflationAnpassung;
        }

        // Dynamic adjustment based on previous year's return
        let dynamischeAnpassung = 0;
        let vorjahresRendite: number | undefined;
        if (strategy === "dynamisch" && dynamicConfig) {
            // Get the previous year's return rate
            const previousYear = year - 1;
            vorjahresRendite = yearlyGrowthRates[previousYear];
            
            if (vorjahresRendite !== undefined) {
                // Calculate dynamic adjustment based on thresholds
                if (vorjahresRendite > dynamicConfig.upperThresholdReturn) {
                    // Return exceeded upper threshold - increase withdrawal
                    dynamischeAnpassung = annualWithdrawal * dynamicConfig.upperThresholdAdjustment;
                } else if (vorjahresRendite < dynamicConfig.lowerThresholdReturn) {
                    // Return fell below lower threshold - decrease withdrawal
                    dynamischeAnpassung = annualWithdrawal * dynamicConfig.lowerThresholdAdjustment;
                }
                annualWithdrawal += dynamischeAnpassung;
            }
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
        const vorabCalculations: { layer: MutableLayer; vorabpauschaleBetrag: number; potentialTax: number; valueAfterGrowth: number }[] = [];
        mutableLayers.forEach((layer: MutableLayer) => {
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

        const capitalAtEndOfYear = mutableLayers.reduce((sum: number, l: MutableLayer) => sum + l.currentValue, 0);
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
            dynamischeAnpassung: strategy === 'dynamisch' ? dynamischeAnpassung : undefined,
            vorjahresRendite: strategy === 'dynamisch' ? vorjahresRendite : undefined,
        };
    }

    const finalLayers = mutableLayers.map((l: MutableLayer) => {
        const lastYear = Object.keys(l.simulation || {}).map(Number).sort((a: number, b: number) => b-a)[0] || (startYear -1);
        l.simulation = l.simulation || {};
        l.simulation[lastYear] = {
            ...(l.simulation[lastYear] || {}),
            endkapital: l.currentValue,
            vorabpauschaleAccumulated: l.accumulatedVorabpauschale,
        };
        return l;
    });

    return { result, finalLayers };
}

export function calculateSegmentedWithdrawal(
    elements: SparplanElement[],
    segmentedConfig: SegmentedWithdrawalConfig
): WithdrawalResult {
    const result: WithdrawalResult = {};
    let currentLayers: SparplanElement[] = elements;

    const sortedSegments = [...segmentedConfig.segments].sort((a: WithdrawalSegment, b: WithdrawalSegment) => a.startYear - b.startYear);

    for (const segment of sortedSegments) {
        const { result: segmentResultData, finalLayers } = calculateWithdrawal({
            elements: currentLayers,
            startYear: segment.startYear,
            endYear: segment.endYear,
            strategy: segment.strategy,
            returnConfig: segment.returnConfig,
            taxRate: segmentedConfig.taxRate,
            teilfreistellungsquote: 0.3, // Assuming default, should be passed in config
            freibetragPerYear: segmentedConfig.freibetragPerYear,
            monthlyConfig: segment.monthlyConfig,
            customPercentage: segment.customPercentage,
            enableGrundfreibetrag: segment.enableGrundfreibetrag,
            grundfreibetragPerYear: segment.grundfreibetragPerYear,
            incomeTaxRate: segment.incomeTaxRate,
            inflationConfig: segment.inflationConfig,
            dynamicConfig: segment.dynamicConfig
        });

        Object.assign(result, segmentResultData);
        currentLayers = finalLayers;

        const lastYearOfSegment = Object.keys(segmentResultData).map(Number).sort((a, b) => b - a)[0];
        if (lastYearOfSegment && segmentResultData[lastYearOfSegment].endkapital <= 0) {
            break;
        }
    }

    return result;
}

type BucketCalculationParams = {
    buckets: BucketConfig[];
    baseWithdrawalRate: number;
    rebalanceAnnually: boolean;
    mutableLayers: MutableLayer[];
    startYear: number;
    endYear: number;
    taxRate: number;
    teilfreistellungsquote: number;
    freibetragPerYear?: { [year: number]: number };
    enableGrundfreibetrag?: boolean;
    grundfreibetragPerYear?: { [year: number]: number };
    incomeTaxRate?: number;
    inflationConfig?: InflationConfig;
};

function calculateBucketWithdrawal(params: BucketCalculationParams): { result: WithdrawalResult; finalLayers: MutableLayer[] } {
    const {
        buckets,
        baseWithdrawalRate,
        rebalanceAnnually,
        mutableLayers,
        startYear,
        endYear,
        taxRate,
        teilfreistellungsquote,
        freibetragPerYear,
        enableGrundfreibetrag,
        grundfreibetragPerYear,
        incomeTaxRate,
        inflationConfig
    } = params;

    // Validate bucket allocations
    const totalAllocation = buckets.reduce((sum, bucket) => sum + bucket.allocation, 0);
    if (Math.abs(totalAllocation - 100) > 0.01) {
        throw new Error(`Bucket allocations must sum to 100%. Current total: ${totalAllocation}%`);
    }

    // Helper functions
    const getFreibetragForYear = (year: number): number => {
        if (freibetragPerYear && freibetragPerYear[year] !== undefined) return freibetragPerYear[year];
        return freibetrag[2023] || 2000;
    };
    const getGrundfreibetragForYear = (year: number): number => {
        if (grundfreibetragPerYear && grundfreibetragPerYear[year] !== undefined) return grundfreibetragPerYear[year];
        return grundfreibetrag[2023] || 10908;
    };

    const result: WithdrawalResult = {};
    const initialStartingCapital = mutableLayers.reduce((sum: number, l: MutableLayer) => sum + l.currentValue, 0);
    const baseWithdrawalAmount = initialStartingCapital * baseWithdrawalRate;

    // Create bucket portfolios - distribute layers across buckets
    type BucketPortfolio = {
        bucket: BucketConfig;
        layers: MutableLayer[];
        value: number;
    };

    const bucketPortfolios: BucketPortfolio[] = buckets.map(bucket => ({
        bucket,
        layers: [],
        value: 0
    }));

    // Initial allocation of layers to buckets (simplified approach)
    const targetBucketValues = buckets.map(bucket => initialStartingCapital * (bucket.allocation / 100));
    let remainingLayers = [...mutableLayers];

    for (let i = 0; i < buckets.length && remainingLayers.length > 0; i++) {
        const targetValue = targetBucketValues[i];
        let currentBucketValue = 0;

        for (let j = remainingLayers.length - 1; j >= 0 && currentBucketValue < targetValue; j--) {
            const layer = remainingLayers[j];
            if (currentBucketValue + layer.currentValue <= targetValue * 1.1) { // Allow 10% tolerance
                bucketPortfolios[i].layers.push(layer);
                currentBucketValue += layer.currentValue;
                remainingLayers.splice(j, 1);
            }
        }
        bucketPortfolios[i].value = currentBucketValue;
    }

    // Add any remaining layers to the first bucket
    if (remainingLayers.length > 0) {
        bucketPortfolios[0].layers.push(...remainingLayers);
        bucketPortfolios[0].value += remainingLayers.reduce((sum, l) => sum + l.currentValue, 0);
    }

    for (let year = startYear; year <= endYear; year++) {
        const totalCapitalAtStartOfYear = bucketPortfolios.reduce((sum, bp) => sum + bp.value, 0);
        if (totalCapitalAtStartOfYear <= 0) break;

        let annualWithdrawal = baseWithdrawalAmount;
        let inflationAnpassung = 0;
        if (inflationConfig?.inflationRate) {
            const yearsPassed = year - startYear;
            inflationAnpassung = baseWithdrawalAmount * (Math.pow(1 + inflationConfig.inflationRate, yearsPassed) - 1);
            annualWithdrawal += inflationAnpassung;
        }

        const entnahme = Math.min(annualWithdrawal, totalCapitalAtStartOfYear);
        let totalRealizedGainThisYear = 0;
        let totalBezahlteSteuer = 0;
        let totalGenutzterFreibetrag = 0;
        let totalGenutzterGrundfreibetrag = 0;
        let totalEinkommensteuer = 0;

        // Withdraw proportionally from each bucket
        for (const bucketPortfolio of bucketPortfolios) {
            if (bucketPortfolio.value <= 0) continue;

            const bucketProportion = bucketPortfolio.value / totalCapitalAtStartOfYear;
            const bucketWithdrawal = entnahme * bucketProportion;
            let remainingBucketWithdrawal = bucketWithdrawal;

            // Generate bucket-specific growth rates
            const bucketYearlyGrowthRates: Record<number, number> = {};
            if (bucketPortfolio.bucket.returnConfig.mode === 'fixed') {
                bucketYearlyGrowthRates[year] = bucketPortfolio.bucket.returnConfig.fixedRate || 0.05;
            } else if (bucketPortfolio.bucket.returnConfig.mode === 'random' && bucketPortfolio.bucket.returnConfig.randomConfig) {
                Object.assign(bucketYearlyGrowthRates, generateRandomReturns([year], bucketPortfolio.bucket.returnConfig.randomConfig));
            } else if (bucketPortfolio.bucket.returnConfig.mode === 'variable' && bucketPortfolio.bucket.returnConfig.variableConfig) {
                bucketYearlyGrowthRates[year] = bucketPortfolio.bucket.returnConfig.variableConfig.yearlyReturns[year] || 0.05;
            }

            // Withdraw from bucket layers (LIFO)
            for (let i = bucketPortfolio.layers.length - 1; i >= 0 && remainingBucketWithdrawal > 0; i--) {
                const layer = bucketPortfolio.layers[i];
                if (layer.currentValue <= 0) continue;

                const withdrawalFromLayer = Math.min(remainingBucketWithdrawal, layer.currentValue);
                const proportionSold = withdrawalFromLayer / layer.currentValue;

                // Calculate realized gain
                const realizedCostBasis = layer.costBasis * proportionSold;
                const realizedGain = Math.max(0, withdrawalFromLayer - realizedCostBasis);
                totalRealizedGainThisYear += realizedGain;

                // Update layer values
                layer.currentValue -= withdrawalFromLayer;
                layer.costBasis -= realizedCostBasis;
                remainingBucketWithdrawal -= withdrawalFromLayer;
            }

            // Apply growth to remaining bucket value
            const growthRate = bucketYearlyGrowthRates[year] || 0.05;
            for (const layer of bucketPortfolio.layers) {
                if (layer.currentValue > 0) {
                    const yearlyGrowth = layer.currentValue * growthRate;
                    layer.currentValue += yearlyGrowth;
                }
            }

            // Update bucket value
            bucketPortfolio.value = bucketPortfolio.layers.reduce((sum, l) => sum + l.currentValue, 0);
        }

        // Calculate taxes on realized gains
        const teilfreistellungsAbzug = totalRealizedGainThisYear * teilfreistellungsquote;
        const taxableGain = Math.max(0, totalRealizedGainThisYear - teilfreistellungsAbzug);
        const freibetragYear = getFreibetragForYear(year);
        const netTaxableGain = Math.max(0, taxableGain - freibetragYear);
        totalBezahlteSteuer = netTaxableGain * taxRate;
        totalGenutzterFreibetrag = Math.min(freibetragYear, taxableGain);

        // Calculate income tax if enabled
        if (enableGrundfreibetrag && incomeTaxRate) {
            totalEinkommensteuer = calculateIncomeTax(entnahme, getGrundfreibetragForYear(year), incomeTaxRate);
            totalGenutzterGrundfreibetrag = Math.min(getGrundfreibetragForYear(year), entnahme);
        }

        const endCapital = bucketPortfolios.reduce((sum, bp) => sum + bp.value, 0);

        result[year] = {
            startkapital: totalCapitalAtStartOfYear,
            entnahme,
            endkapital: endCapital,
            bezahlteSteuer: totalBezahlteSteuer,
            genutzterFreibetrag: totalGenutzterFreibetrag,
            zinsen: endCapital + entnahme - totalCapitalAtStartOfYear,
            inflationAnpassung,
            einkommensteuer: totalEinkommensteuer,
            genutzterGrundfreibetrag: totalGenutzterGrundfreibetrag,
        };

        // Rebalance buckets annually if enabled
        if (rebalanceAnnually && year < endYear) {
            const totalValueAfterYear = bucketPortfolios.reduce((sum, bp) => sum + bp.value, 0);
            const targetValues = buckets.map(bucket => totalValueAfterYear * (bucket.allocation / 100));

            // Simplified rebalancing - adjust bucket values to target allocations
            for (let i = 0; i < bucketPortfolios.length; i++) {
                const currentValue = bucketPortfolios[i].value;
                const targetValue = targetValues[i];
                const rebalanceRatio = currentValue > 0 ? targetValue / currentValue : 1;

                // Adjust all layers in the bucket proportionally
                for (const layer of bucketPortfolios[i].layers) {
                    layer.currentValue *= rebalanceRatio;
                    layer.costBasis *= rebalanceRatio;
                }
                bucketPortfolios[i].value = targetValue;
            }
        }
    }

    // Flatten all layers for final result
    const finalLayers = bucketPortfolios.flatMap(bp => bp.layers);

    return { result, finalLayers };
}

export function calculateIncomeTax(
    withdrawalAmount: number,
    grundfreibetragYear: number = grundfreibetrag[2023],
    incomeTaxRate: number = 0.25
): number {
    const taxableIncome = Math.max(0, withdrawalAmount - grundfreibetragYear);
    return taxableIncome * incomeTaxRate;
}

export function getTotalCapitalAtYear(elements: SparplanElement[], year: number): number {
    return elements.reduce((total: number, element: SparplanElement) => {
        const yearData = element.simulation?.[year];
        return total + (yearData?.endkapital || 0);
    }, 0);
}

export function calculateWithdrawalDuration(
    withdrawalResult: WithdrawalResult,
    startYear: number
): number | null {
    const years = Object.keys(withdrawalResult).map(Number).sort((a: number, b: number) => a - b);

    for (const year of years) {
        if (withdrawalResult[year].endkapital <= 0) {
            return year - startYear + 1;
        }
    }

    return null;
}
