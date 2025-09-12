import { useCallback, useMemo } from "react";
import { useSimulation } from "../contexts/useSimulation";
import { createDefaultWithdrawalSegment } from "../utils/segmented-withdrawal";
import type {
  WithdrawalReturnMode,
  WithdrawalFormValue,
  ComparisonStrategy,
  SegmentedComparisonStrategy,
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
      // Bucket strategy specific settings
      bucketConfig: {
        initialCashCushion: 20000, // €20,000 initial cash cushion
        refillThreshold: 5000, // Refill when gains exceed €5,000
        refillPercentage: 0.5, // Move 50% of excess gains to cash
        baseWithdrawalRate: 0.04, // 4% base withdrawal rate (fallback)
        subStrategy: "4prozent", // Default to 4% rule sub-strategy
        variabelProzent: 4, // Default variable percentage
        monatlicheBetrag: 2000, // Default monthly amount €2,000
        dynamischBasisrate: 4, // Default dynamic base rate 4%
        dynamischObereSchwell: 8, // Default upper threshold 8%
        dynamischObereAnpassung: 5, // Default upper adjustment 5%
        dynamischUntereSchwell: 2, // Default lower threshold 2%
        dynamischUntereAnpassung: -5, // Default lower adjustment -5%
      },
      // RMD strategy specific settings
      rmdStartAge: 65, // Default retirement age
      rmdLifeExpectancyTable: 'german_2020_22', // Use German mortality tables
      rmdCustomLifeExpectancy: 20, // Default custom life expectancy
      // Kapitalerhalt strategy specific settings
      kapitalerhaltNominalReturn: 7, // Default nominal return 7%
      kapitalerhaltInflationRate: 2, // Default inflation rate 2%
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
      {
        id: "strategy3",
        name: "Drei-Eimer 15k€",
        strategie: "bucket_strategie",
        rendite: 5,
        bucketInitialCash: 15000,
        bucketBaseRate: 4,
        bucketRefillThreshold: 3000,
        bucketRefillPercentage: 0.6,
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
      useSegmentedComparisonMode: false,
      segmentedComparisonStrategies: [],
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

  // Helper function to update a segmented comparison strategy
  const updateSegmentedComparisonStrategy = useCallback(
    (strategyId: string, updates: Partial<SegmentedComparisonStrategy>) => {
      updateConfig({
        segmentedComparisonStrategies: (currentConfig.segmentedComparisonStrategies || []).map((s: SegmentedComparisonStrategy) =>
          s.id === strategyId ? { ...s, ...updates } : s,
        ),
      });
    },
    [currentConfig.segmentedComparisonStrategies, updateConfig],
  );

  // Helper function to add a new segmented comparison strategy
  const addSegmentedComparisonStrategy = useCallback(
    (strategy: SegmentedComparisonStrategy) => {
      updateConfig({
        segmentedComparisonStrategies: [...(currentConfig.segmentedComparisonStrategies || []), strategy],
      });
    },
    [currentConfig.segmentedComparisonStrategies, updateConfig],
  );

  // Helper function to remove a segmented comparison strategy
  const removeSegmentedComparisonStrategy = useCallback(
    (strategyId: string) => {
      updateConfig({
        segmentedComparisonStrategies: (currentConfig.segmentedComparisonStrategies || []).filter((s: SegmentedComparisonStrategy) => s.id !== strategyId),
      });
    },
    [currentConfig.segmentedComparisonStrategies, updateConfig],
  );

  return {
    currentConfig,
    updateConfig,
    updateFormValue,
    updateComparisonStrategy,
    updateSegmentedComparisonStrategy,
    addSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy,
  };
}