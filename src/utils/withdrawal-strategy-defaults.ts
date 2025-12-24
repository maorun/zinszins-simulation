/**
 * Default configuration values for withdrawal strategies
 *
 * This module provides sensible defaults for each withdrawal strategy type,
 * ensuring new segments start with reasonable values that can be customized.
 */

import type { WithdrawalSegment } from '../utils/segmented-withdrawal'
import type { WithdrawalStrategy, BucketSubStrategy, RMDConfig } from '../../helpers/withdrawal'

/**
 * Parameters for initializing a withdrawal strategy with defaults
 */
interface StrategyInitParams {
  /** The withdrawal strategy type to initialize */
  strategy: WithdrawalStrategy
  /** The withdrawal segment that may already have configuration values */
  currentSegment: WithdrawalSegment
}

/**
 * Result containing default configuration values for a withdrawal strategy
 * Only includes defaults for values not already present in the segment
 */
interface StrategyDefaultsResult {
  /** Configuration for fixed monthly withdrawal strategy */
  monthlyConfig?: {
    /** Fixed monthly withdrawal amount in euros */
    monthlyAmount: number
    /** Whether portfolio guardrails are enabled (prevent excessive withdrawals) */
    enableGuardrails: boolean
    /** Guardrail threshold as decimal (e.g., 0.1 for 10% portfolio decline) */
    guardrailsThreshold: number
  }
  /** Custom withdrawal percentage for variable percentage strategy (as decimal) */
  customPercentage?: number
  /** Configuration for dynamic withdrawal strategy */
  dynamicConfig?: {
    /** Base withdrawal rate as decimal (e.g., 0.04 for 4%) */
    baseWithdrawalRate: number
    /** Upper threshold return for increasing withdrawals (as decimal) */
    upperThresholdReturn: number
    /** Adjustment percentage when upper threshold is met (as decimal) */
    upperThresholdAdjustment: number
    /** Lower threshold return for decreasing withdrawals (as decimal) */
    lowerThresholdReturn: number
    /** Adjustment percentage when lower threshold is met (as decimal) */
    lowerThresholdAdjustment: number
  }
  /** Configuration for bucket strategy (three-bucket approach) */
  bucketConfig?: {
    /** Initial cash cushion amount in euros */
    initialCashCushion: number
    /** Threshold below which cash bucket should be refilled (in euros) */
    refillThreshold: number
    /** Percentage of portfolio to use for refilling (as decimal) */
    refillPercentage: number
    /** Base withdrawal rate as decimal (e.g., 0.04 for 4%) */
    baseWithdrawalRate: number
    /** Sub-strategy to use for calculating withdrawals */
    subStrategy: BucketSubStrategy
    /** Variable percentage for variable sub-strategy */
    variabelProzent: number
    /** Monthly amount for fixed monthly sub-strategy */
    monatlicheBetrag: number
    /** Base rate for dynamic sub-strategy */
    dynamischBasisrate: number
    /** Upper threshold for dynamic sub-strategy */
    dynamischObereSchwell: number
    /** Upper adjustment for dynamic sub-strategy */
    dynamischObereAnpassung: number
    /** Lower threshold for dynamic sub-strategy */
    dynamischUntereSchwell: number
    /** Lower adjustment for dynamic sub-strategy */
    dynamischUntereAnpassung: number
  }
  /** Configuration for RMD (Required Minimum Distribution) strategy */
  rmdConfig?: RMDConfig
}

/**
 * Function type that provides default configuration for a specific strategy
 * Returns defaults only for values not already configured in the segment
 */
type StrategyDefaultGetter = (segment: WithdrawalSegment) => Partial<StrategyDefaultsResult>

/**
 * Registry of default configuration providers for each withdrawal strategy
 * Each function checks if configuration already exists and only returns defaults for missing values
 */
const strategyDefaultGetters: Record<WithdrawalStrategy, StrategyDefaultGetter> = {
  /** Fixed monthly withdrawal with optional portfolio guardrails */
  monatlich_fest: segment => {
    if (segment.monthlyConfig) return {}
    return {
      monthlyConfig: {
        monthlyAmount: 2000, // €2,000 per month (typical minimum income need)
        enableGuardrails: false, // Guardrails disabled by default
        guardrailsThreshold: 0.1, // 10% portfolio decline triggers guardrail if enabled
      },
    }
  },
  /** Variable percentage withdrawal (user-defined annual percentage) */
  variabel_prozent: segment => {
    if (segment.customPercentage !== undefined) return {}
    return { customPercentage: 0.05 } // 5% annual withdrawal rate
  },
  /** Dynamic withdrawal that adjusts based on portfolio performance */
  dynamisch: segment => {
    if (segment.dynamicConfig) return {}
    return {
      dynamicConfig: {
        baseWithdrawalRate: 0.04, // 4% base withdrawal rate
        upperThresholdReturn: 0.08, // Increase withdrawals if returns exceed 8%
        upperThresholdAdjustment: 0.05, // Increase by 5% when threshold met
        lowerThresholdReturn: 0.02, // Decrease withdrawals if returns below 2%
        lowerThresholdAdjustment: -0.05, // Decrease by 5% when threshold met
      },
    }
  },
  /** Three-bucket strategy (cash, bonds, stocks) with systematic rebalancing */
  bucket_strategie: segment => {
    if (segment.bucketConfig) return {}
    return {
      bucketConfig: {
        initialCashCushion: 20000, // €20,000 initial cash bucket (covers ~10 months at €2k/month)
        refillThreshold: 5000, // Refill when cash drops below €5,000
        refillPercentage: 0.5, // Refill with 50% bonds, 50% stocks
        baseWithdrawalRate: 0.04, // 4% base rate for withdrawal calculation
        subStrategy: '4prozent', // Use 4% rule for determining withdrawals
        variabelProzent: 4, // 4% for variable percentage sub-strategy
        monatlicheBetrag: 2000, // €2,000 for fixed monthly sub-strategy
        dynamischBasisrate: 4, // 4% base for dynamic sub-strategy
        dynamischObereSchwell: 8, // 8% upper threshold for dynamic sub-strategy
        dynamischObereAnpassung: 5, // 5% adjustment for dynamic sub-strategy
        dynamischUntereSchwell: 2, // 2% lower threshold for dynamic sub-strategy
        dynamischUntereAnpassung: -5, // -5% adjustment for dynamic sub-strategy
      },
    }
  },
  /** RMD (Required Minimum Distribution) based on life expectancy tables */
  rmd: segment => {
    if (segment.rmdConfig) return {}
    return {
      rmdConfig: {
        startAge: 65, // Typical retirement age in Germany
        lifeExpectancyTable: 'german_2020_22', // Official German life expectancy table
        customLifeExpectancy: undefined, // No custom override by default
      },
    }
  },
  // Strategies that use predefined rules without additional configuration
  /** Classic 4% rule (4% of starting capital annually) */
  '4prozent': () => ({}),
  /** Conservative 3% rule (3% of starting capital annually) */
  '3prozent': () => ({}),
  /** Capital preservation strategy (withdraw only returns, preserve principal) */
  kapitalerhalt: () => ({}),
  /** Tax-optimized withdrawal (minimize tax burden through strategic withdrawals) */
  steueroptimiert: () => ({}),
}

/**
 * Get default configuration values for a withdrawal strategy
 *
 * Returns defaults only for configuration values that are not already present
 * in the current segment, allowing users to override defaults without conflict.
 *
 * @param params - Strategy initialization parameters
 * @param params.strategy - The withdrawal strategy type
 * @param params.currentSegment - The current segment configuration
 * @returns Default configuration values for missing parameters
 *
 * @example
 * ```typescript
 * const defaults = getStrategyDefaults({
 *   strategy: 'monatlich_fest',
 *   currentSegment: { id: '1', strategie: 'monatlich_fest' }
 * })
 * // Returns: { monthlyConfig: { monthlyAmount: 2000, ... } }
 * ```
 */
export function getStrategyDefaults(params: StrategyInitParams): StrategyDefaultsResult {
  const { strategy, currentSegment } = params
  const getter = strategyDefaultGetters[strategy]
  return getter ? getter(currentSegment) : {}
}
