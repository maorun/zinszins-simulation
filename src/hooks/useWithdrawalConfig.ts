import { useCallback, useMemo } from "react";
import { useSimulation } from "../contexts/useSimulation";
import { createDefaultWithdrawalSegment } from "../utils/segmented-withdrawal";
import type {
  WithdrawalReturnMode,
  WithdrawalFormValue,
  ComparisonStrategy,
} from "../utils/config-storage";

/**
 * Custom hook for managing withdrawal configuration state
 */
export function useWithdrawalConfig(startOfIndependence: number, endOfLife: number) {
  const { withdrawalConfig, setWithdrawalConfig } = useSimulation();

  // Initialize withdrawal config if not exists or update current form values
  const currentConfig = useMemo(() => {
    // Create default withdrawal configuration if none exists
    const defaultFormValue: WithdrawalFormValue = {
      endOfLife,
      strategie: "4prozent",
      rendite: 5,
      // Withdrawal frequency configuration
      withdrawalFrequency: "yearly", // Default to yearly as specified in requirements
      // General inflation settings (for all strategies)
      inflationAktiv: false,
      inflationsrate: 2,
      // Monthly strategy specific settings
      monatlicheBetrag: 2000,
      guardrailsAktiv: false,
      guardrailsSchwelle: 10,
      // Custom percentage strategy specific settings
      variabelProzent: 5, // Default to 5%
      // Dynamic strategy specific settings
      dynamischBasisrate: 4, // Base withdrawal rate 4%
      dynamischObereSchwell: 8, // Upper threshold return 8%
      dynamischObereAnpassung: 5, // Upper adjustment 5%
      dynamischUntereSchwell: 2, // Lower threshold return 2%
      dynamischUntereAnpassung: -5, // Lower adjustment -5%
      // Grundfreibetrag settings
      grundfreibetragAktiv: false,
      grundfreibetragBetrag: 10908, // Default German basic tax allowance for 2023
      einkommensteuersatz: 18, // Default income tax rate 18%
    };

    const defaultComparisonStrategies: ComparisonStrategy[] = [
      {
        id: "strategy1",
        name: "3% Regel",
        strategie: "3prozent",
        rendite: 5,
      },
      {
        id: "strategy2",
        name: "Monatlich 1.500€",
        strategie: "monatlich_fest",
        rendite: 5,
        monatlicheBetrag: 1500,
      },
    ];

    return withdrawalConfig || {
      formValue: defaultFormValue,
      withdrawalReturnMode: "fixed" as WithdrawalReturnMode,
      withdrawalVariableReturns: {},
      withdrawalAverageReturn: 5,
      withdrawalStandardDeviation: 12,
      withdrawalRandomSeed: undefined,
      useSegmentedWithdrawal: false,
      withdrawalSegments: [
        createDefaultWithdrawalSegment(
          "main",
          "Hauptphase",
          startOfIndependence + 1,
          endOfLife,
        ),
      ],
      useComparisonMode: false,
      comparisonStrategies: defaultComparisonStrategies,
    };
  }, [withdrawalConfig, startOfIndependence, endOfLife]);

  // Helper function to update config
  const updateConfig = useCallback(
    (updates: Partial<typeof currentConfig>) => {
      const newConfig = { ...currentConfig, ...updates };
      setWithdrawalConfig(newConfig);
    },
    [currentConfig, setWithdrawalConfig],
  );

  // Helper function to update form value
  const updateFormValue = useCallback(
    (updates: Partial<WithdrawalFormValue>) => {
      updateConfig({
        formValue: { ...currentConfig.formValue, ...updates },
      });
    },
    [currentConfig.formValue, updateConfig],
  );

  // Helper function to update a comparison strategy
  const updateComparisonStrategy = useCallback(
    (strategyId: string, updates: Partial<ComparisonStrategy>) => {
      updateConfig({
        comparisonStrategies: currentConfig.comparisonStrategies.map((s: ComparisonStrategy) =>
          s.id === strategyId ? { ...s, ...updates } : s,
        ),
      });
    },
    [currentConfig.comparisonStrategies, updateConfig],
  );

  return {
    currentConfig,
    updateConfig,
    updateFormValue,
    updateComparisonStrategy,
  };
}