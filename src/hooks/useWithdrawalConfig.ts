import { useCallback, useMemo } from 'react'
import { useSimulation } from '../contexts/useSimulation'
import { createDefaultWithdrawalSegment } from '../utils/segmented-withdrawal'
import type {
  WithdrawalReturnMode,
  WithdrawalFormValue,
  ComparisonStrategy,
  SegmentedComparisonStrategy,
  WithdrawalConfiguration,
} from '../utils/config-storage'
import { createDefaultHealthCareInsuranceConfig } from '../../helpers/health-care-insurance'

/**
 * Hook for basic config update operations
 */
function useConfigUpdateCallbacks(
  currentConfig: WithdrawalConfiguration,
  setWithdrawalConfig: (config: WithdrawalConfiguration) => void,
) {
  const updateConfig = useCallback(
    (updates: Partial<WithdrawalConfiguration>) => {
      const newConfig = { ...currentConfig, ...updates }
      setWithdrawalConfig(newConfig)
    },
    [currentConfig, setWithdrawalConfig],
  )

  const updateFormValue = useCallback(
    (updates: Partial<WithdrawalFormValue>) => {
      updateConfig({
        formValue: { ...currentConfig.formValue, ...updates },
      })
    },
    [currentConfig.formValue, updateConfig],
  )

  return { updateConfig, updateFormValue }
}

/**
 * Hook for comparison strategy update operations
 */
function useComparisonStrategyCallbacks(
  currentConfig: WithdrawalConfiguration,
  updateConfig: (updates: Partial<WithdrawalConfiguration>) => void,
) {
  const updateComparisonStrategy = useCallback(
    (strategyId: string, updates: Partial<ComparisonStrategy>) => {
      updateConfig({
        comparisonStrategies: currentConfig.comparisonStrategies.map((s: ComparisonStrategy) =>
          s.id === strategyId ? { ...s, ...updates } : s,
        ),
      })
    },
    [currentConfig.comparisonStrategies, updateConfig],
  )

  return { updateComparisonStrategy }
}

/**
 * Hook for segmented comparison strategy update operations
 */
function useSegmentedComparisonCallbacks(
  currentConfig: WithdrawalConfiguration,
  updateConfig: (updates: Partial<WithdrawalConfiguration>) => void,
) {
  const updateSegmentedComparisonStrategy = useCallback(
    (strategyId: string, updates: Partial<SegmentedComparisonStrategy>) => {
      updateConfig({
        segmentedComparisonStrategies: (currentConfig.segmentedComparisonStrategies || [])
          .map((s: SegmentedComparisonStrategy) =>
            s.id === strategyId ? { ...s, ...updates } : s,
          ),
      })
    },
    [currentConfig.segmentedComparisonStrategies, updateConfig],
  )

  const addSegmentedComparisonStrategy = useCallback(
    (strategy: SegmentedComparisonStrategy) => {
      updateConfig({
        segmentedComparisonStrategies: [...(currentConfig.segmentedComparisonStrategies || []), strategy],
      })
    },
    [currentConfig.segmentedComparisonStrategies, updateConfig],
  )

  const removeSegmentedComparisonStrategy = useCallback(
    (strategyId: string) => {
      updateConfig({
        segmentedComparisonStrategies: (currentConfig.segmentedComparisonStrategies || [])
          .filter((s: SegmentedComparisonStrategy) => s.id !== strategyId),
      })
    },
    [currentConfig.segmentedComparisonStrategies, updateConfig],
  )

  return {
    updateSegmentedComparisonStrategy,
    addSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy,
  }
}

/**
 * Creates update callbacks for withdrawal configuration
 */
function useWithdrawalConfigUpdaters(
  currentConfig: WithdrawalConfiguration,
  setWithdrawalConfig: (config: WithdrawalConfiguration) => void,
) {
  const { updateConfig, updateFormValue } = useConfigUpdateCallbacks(currentConfig, setWithdrawalConfig)
  const { updateComparisonStrategy } = useComparisonStrategyCallbacks(currentConfig, updateConfig)
  const {
    updateSegmentedComparisonStrategy,
    addSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy,
  } = useSegmentedComparisonCallbacks(currentConfig, updateConfig)

  return {
    updateConfig,
    updateFormValue,
    updateComparisonStrategy,
    updateSegmentedComparisonStrategy,
    addSegmentedComparisonStrategy,
    removeSegmentedComparisonStrategy,
  }
}

/**
 * Creates the default comparison strategies
 */
function createDefaultComparisonStrategies(): ComparisonStrategy[] {
  return [
    {
      id: 'strategy1',
      name: '3% Regel',
      strategie: '3prozent',
      rendite: 5,
    },
    {
      id: 'strategy2',
      name: 'Monatlich 1.500€',
      strategie: 'monatlich_fest',
      rendite: 5,
      monatlicheBetrag: 1500,
    },
    {
      id: 'strategy3',
      name: 'Drei-Eimer 15k€',
      strategie: 'bucket_strategie',
      rendite: 5,
      bucketInitialCash: 15000,
      bucketBaseRate: 4,
      bucketRefillThreshold: 3000,
      bucketRefillPercentage: 0.6,
    },
  ]
}

/**
 * Creates the default form value for withdrawal configuration
 */
function createDefaultFormValue(): WithdrawalFormValue {
  return {
    // endOfLife moved to global configuration
    strategie: '4prozent',
    rendite: 5,
    // Withdrawal frequency configuration
    withdrawalFrequency: 'yearly', // Default to yearly as specified in requirements
    // General inflation settings (for all strategies)
    inflationAktiv: true,
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
      subStrategy: '4prozent', // Default to 4% rule sub-strategy
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
    // rmdLifeExpectancyTable and rmdCustomLifeExpectancy moved to global configuration
    // Kapitalerhalt strategy specific settings
    kapitalerhaltNominalReturn: 7, // Default nominal return 7%
    kapitalerhaltInflationRate: 2, // Default inflation rate 2%
    // Steueroptimierte Entnahme strategy specific settings
    steueroptimierteEntnahmeBaseWithdrawalRate: 0.04, // Default base withdrawal rate 4%
    steueroptimierteEntnahmeTargetTaxRate: 0.26375, // Default target tax rate 26.375%
    steueroptimierteEntnahmeOptimizationMode: 'balanced' as const, // Default optimization mode
    steueroptimierteEntnahmeFreibetragUtilizationTarget: 0.85, // Default Freibetrag utilization 85%
    steueroptimierteEntnahmeRebalanceFrequency: 'yearly' as const, // Default rebalance frequency
    // Statutory pension settings - moved to global configuration
    // Health and care insurance settings
    healthCareInsuranceConfig: createDefaultHealthCareInsuranceConfig(),
    einkommensteuersatz: 18, // Default income tax rate 18%
  }
}

/**
 * Custom hook for managing withdrawal configuration state
 */
export function useWithdrawalConfig() {
  const { withdrawalConfig, setWithdrawalConfig } = useSimulation()

  // Initialize withdrawal config if not exists or update current form values
  const currentConfig = useMemo(() => {
    // Create default withdrawal configuration if none exists
    const defaultFormValue = createDefaultFormValue()
    const defaultComparisonStrategies = createDefaultComparisonStrategies()

    return withdrawalConfig || {
      formValue: defaultFormValue,
      withdrawalReturnMode: 'random' as WithdrawalReturnMode,
      withdrawalVariableReturns: {},
      withdrawalAverageReturn: 7,
      withdrawalStandardDeviation: 12,
      withdrawalRandomSeed: undefined,
      withdrawalMultiAssetConfig: undefined, // Will be initialized from context when needed
      useSegmentedWithdrawal: false,
      withdrawalSegments: [
        createDefaultWithdrawalSegment(
          'main',
          'Hauptphase',
          2041, // Use independent default year - not tied to startOfIndependence
          2080, // Use independent default end year
        ),
      ],
      useComparisonMode: false,
      comparisonStrategies: defaultComparisonStrategies,
      useSegmentedComparisonMode: false,
      segmentedComparisonStrategies: [],
    }
  }, [withdrawalConfig])

  const updaters = useWithdrawalConfigUpdaters(currentConfig, setWithdrawalConfig)

  return {
    currentConfig,
    ...updaters,
  }
}
