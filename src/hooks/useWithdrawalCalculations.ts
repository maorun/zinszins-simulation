import { useMemo } from "react";
import type { SparplanElement } from "../utils/sparplan-utils";
import {
  calculateWithdrawal,
  calculateSegmentedWithdrawal,
  getTotalCapitalAtYear,
  calculateWithdrawalDuration,
} from "../../helpers/withdrawal";
import type { ReturnConfiguration } from "../../helpers/random-returns";
import type { SegmentedWithdrawalConfig } from "../utils/segmented-withdrawal";
import type { ComparisonStrategy } from "../utils/config-storage";
import { useSimulation } from "../contexts/useSimulation";

/**
 * Custom hook for withdrawal calculations
 */
export function useWithdrawalCalculations(
  elemente: SparplanElement[],
  startOfIndependence: number,
  currentConfig: any,
  steuerlast: number,
  teilfreistellungsquote: number,
) {
  const { 
    steuerReduzierenEndkapitalEntspharphase,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
  } = useSimulation();

  const {
    formValue,
    withdrawalReturnMode,
    withdrawalVariableReturns,
    withdrawalAverageReturn,
    withdrawalStandardDeviation,
    withdrawalRandomSeed,
    useSegmentedWithdrawal,
    withdrawalSegments,
    useComparisonMode,
    comparisonStrategies,
  } = currentConfig;

  // Calculate withdrawal projections
  const withdrawalData = useMemo(() => {
    if (!elemente || elemente.length === 0) {
      return null;
    }

    const startingCapital = getTotalCapitalAtYear(
      elemente,
      startOfIndependence,
    );
    if (startingCapital <= 0) {
      return null;
    }

    let withdrawalResult;

    if (useSegmentedWithdrawal) {
      // Use segmented withdrawal calculation
      const segmentedConfig: SegmentedWithdrawalConfig = {
        segments: withdrawalSegments,
        taxRate: 0.26375,
        freibetragPerYear: undefined, // Use default
      };

      withdrawalResult = calculateSegmentedWithdrawal(
        elemente,
        segmentedConfig,
      );
    } else {
      // Use single-strategy withdrawal calculation (backward compatibility)
      // Build return configuration for withdrawal phase
      let withdrawalReturnConfig: ReturnConfiguration;

      if (withdrawalReturnMode === "random") {
        withdrawalReturnConfig = {
          mode: "random",
          randomConfig: {
            averageReturn: withdrawalAverageReturn / 100, // Convert percentage to decimal
            standardDeviation: withdrawalStandardDeviation / 100, // Convert percentage to decimal
            seed: withdrawalRandomSeed,
          },
        };
      } else if (withdrawalReturnMode === "variable") {
        withdrawalReturnConfig = {
          mode: "variable",
          variableConfig: {
            yearlyReturns: Object.fromEntries(
              Object.entries(withdrawalVariableReturns).map(([year, rate]) => [
                parseInt(year),
                (rate as number) / 100,
              ]),
            ),
          },
        };
      } else {
        withdrawalReturnConfig = {
          mode: "fixed",
          fixedRate: formValue.rendite / 100, // Convert percentage to decimal
        };
      }

      // Calculate withdrawal projections
      const withdrawalCalculation = calculateWithdrawal({
        elements: elemente,
        startYear: startOfIndependence + 1, // Start withdrawals the year after accumulation ends
        endYear: formValue.endOfLife,
        strategy: formValue.strategie,
        withdrawalFrequency: formValue.withdrawalFrequency,
        returnConfig: withdrawalReturnConfig,
        taxRate: steuerlast,
        teilfreistellungsquote: teilfreistellungsquote,
        freibetragPerYear: undefined, // freibetragPerYear
        monthlyConfig:
          formValue.strategie === "monatlich_fest"
            ? {
                monthlyAmount: formValue.monatlicheBetrag,
                enableGuardrails: formValue.guardrailsAktiv,
                guardrailsThreshold: formValue.guardrailsSchwelle / 100,
              }
            : undefined,
        customPercentage:
          formValue.strategie === "variabel_prozent"
            ? formValue.variabelProzent / 100
            : undefined,
        dynamicConfig:
          formValue.strategie === "dynamisch"
            ? {
                baseWithdrawalRate: formValue.dynamischBasisrate / 100,
                upperThresholdReturn: formValue.dynamischObereSchwell / 100,
                upperThresholdAdjustment:
                  formValue.dynamischObereAnpassung / 100,
                lowerThresholdReturn: formValue.dynamischUntereSchwell / 100,
                lowerThresholdAdjustment:
                  formValue.dynamischUntereAnpassung / 100,
              }
            : undefined,
        bucketConfig:
          formValue.strategie === "bucket_strategie" && formValue.bucketConfig
            ? {
                initialCashCushion: formValue.bucketConfig.initialCashCushion,
                refillThreshold: formValue.bucketConfig.refillThreshold,
                refillPercentage: formValue.bucketConfig.refillPercentage,
                baseWithdrawalRate: formValue.bucketConfig.baseWithdrawalRate,
              }
            : undefined,
        enableGrundfreibetrag: grundfreibetragAktiv,
        grundfreibetragPerYear: grundfreibetragAktiv
          ? (() => {
              const grundfreibetragPerYear: { [year: number]: number } = {};
              for (
                let year = startOfIndependence + 1;
                year <= formValue.endOfLife;
                year++
              ) {
                grundfreibetragPerYear[year] = grundfreibetragBetrag;
              }
              return grundfreibetragPerYear;
            })()
          : undefined,
        incomeTaxRate: grundfreibetragAktiv
          ? formValue.einkommensteuersatz / 100
          : undefined,
        inflationConfig: formValue.inflationAktiv
          ? { inflationRate: formValue.inflationsrate / 100 }
          : undefined,
        steuerReduzierenEndkapital: steuerReduzierenEndkapitalEntspharphase,
      });
      withdrawalResult = withdrawalCalculation.result;
    }

    // Convert to array for table display, sorted by year descending
    const withdrawalArray = Object.entries(withdrawalResult)
      .map(([year, data]) => ({
        year: parseInt(year),
        ...data,
      }))
      .sort((a, b) => b.year - a.year);

    // Calculate withdrawal duration
    const duration = calculateWithdrawalDuration(
      withdrawalResult,
      startOfIndependence + 1,
    );

    return {
      startingCapital,
      withdrawalArray,
      withdrawalResult,
      duration,
    };
  }, [
    elemente,
    startOfIndependence,
    formValue.endOfLife,
    formValue.strategie,
    formValue.withdrawalFrequency,
    formValue.rendite,
    formValue.inflationAktiv,
    formValue.inflationsrate,
    formValue.monatlicheBetrag,
    formValue.guardrailsAktiv,
    formValue.guardrailsSchwelle,
    formValue.variabelProzent,
    formValue.dynamischBasisrate,
    formValue.dynamischObereSchwell,
    formValue.dynamischObereAnpassung,
    formValue.dynamischUntereSchwell,
    formValue.dynamischUntereAnpassung,
    formValue.bucketConfig,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    formValue.einkommensteuersatz,
    withdrawalReturnMode,
    withdrawalVariableReturns,
    withdrawalAverageReturn,
    withdrawalStandardDeviation,
    withdrawalRandomSeed,
    useSegmentedWithdrawal,
    withdrawalSegments,
    steuerlast,
    teilfreistellungsquote,
    steuerReduzierenEndkapitalEntspharphase,
  ]);

  // Calculate comparison results for each strategy
  const comparisonResults = useMemo(() => {
    if (!useComparisonMode || !withdrawalData) {
      return [];
    }

    const results = comparisonStrategies.map((strategy: ComparisonStrategy) => {
      // Build return configuration for this strategy
      const returnConfig: ReturnConfiguration = {
        mode: "fixed",
        fixedRate: strategy.rendite / 100,
      };

      try {
        // Calculate withdrawal for this comparison strategy
        const { result } = calculateWithdrawal({
          elements: elemente,
          startYear: startOfIndependence + 1,
          endYear: formValue.endOfLife,
          strategy: strategy.strategie,
          returnConfig,
          taxRate: steuerlast,
          teilfreistellungsquote,
          freibetragPerYear: (() => {
            const freibetragPerYear: { [year: number]: number } = {};
            for (
              let year = startOfIndependence + 1;
              year <= formValue.endOfLife;
              year++
            ) {
              freibetragPerYear[year] = 2000; // Default freibetrag
            }
            return freibetragPerYear;
          })(),
          monthlyConfig:
            strategy.strategie === "monatlich_fest"
              ? {
                  monthlyAmount: strategy.monatlicheBetrag || 2000,
                }
              : undefined,
          customPercentage:
            strategy.strategie === "variabel_prozent"
              ? (strategy.variabelProzent || 5) / 100
              : undefined,
          dynamicConfig:
            strategy.strategie === "dynamisch"
              ? {
                  baseWithdrawalRate: (strategy.dynamischBasisrate || 4) / 100,
                  upperThresholdReturn:
                    (strategy.dynamischObereSchwell || 8) / 100,
                  upperThresholdAdjustment:
                    (strategy.dynamischObereAnpassung || 5) / 100,
                  lowerThresholdReturn:
                    (strategy.dynamischUntereSchwell || 2) / 100,
                  lowerThresholdAdjustment:
                    (strategy.dynamischUntereAnpassung || -5) / 100,
                }
              : undefined,
          bucketConfig:
            strategy.strategie === "bucket_strategie"
              ? {
                  initialCashCushion: strategy.bucketInitialCash || 20000,
                  refillThreshold: strategy.bucketRefillThreshold || 5000,
                  refillPercentage: strategy.bucketRefillPercentage || 0.5,
                  baseWithdrawalRate: (strategy.bucketBaseRate || 4) / 100,
                }
              : undefined,
          enableGrundfreibetrag: grundfreibetragAktiv,
          grundfreibetragPerYear: grundfreibetragAktiv
            ? (() => {
                const grundfreibetragPerYear: { [year: number]: number } = {};
                for (
                  let year = startOfIndependence + 1;
                  year <= formValue.endOfLife;
                  year++
                ) {
                  grundfreibetragPerYear[year] = grundfreibetragBetrag;
                }
                return grundfreibetragPerYear;
              })()
            : undefined,
          incomeTaxRate: grundfreibetragAktiv
            ? formValue.einkommensteuersatz / 100
            : undefined,
          steuerReduzierenEndkapital: steuerReduzierenEndkapitalEntspharphase,
        });

        // Get final year capital and total withdrawal
        const finalYear = Math.max(...Object.keys(result).map(Number));
        const finalCapital = result[finalYear]?.endkapital || 0;

        // Calculate total withdrawal
        const totalWithdrawal = Object.values(result).reduce(
          (sum, year) => sum + year.entnahme,
          0,
        );
        const totalYears = Object.keys(result).length;
        const averageAnnualWithdrawal = totalWithdrawal / totalYears;

        // Calculate withdrawal duration
        const duration = calculateWithdrawalDuration(
          result,
          startOfIndependence + 1,
        );

        return {
          strategy,
          finalCapital,
          totalWithdrawal,
          averageAnnualWithdrawal,
          duration: duration ? duration : "unbegrenzt",
        };
      } catch (error) {
        console.error(
          `Error calculating withdrawal for strategy ${strategy.name}:`,
          error,
        );
        return {
          strategy,
          finalCapital: 0,
          totalWithdrawal: 0,
          averageAnnualWithdrawal: 0,
          duration: "Fehler",
        };
      }
    });

    return results;
  }, [
    useComparisonMode,
    withdrawalData,
    comparisonStrategies,
    elemente,
    startOfIndependence,
    formValue.endOfLife,
    steuerlast,
    teilfreistellungsquote,
    grundfreibetragAktiv,
    grundfreibetragBetrag,
    formValue.einkommensteuersatz,
    steuerReduzierenEndkapitalEntspharphase,
  ]);

  return {
    withdrawalData,
    comparisonResults,
  };
}