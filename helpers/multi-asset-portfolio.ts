/**
 * Multi-Asset Portfolio system with automatic rebalancing
 *
 * This module implements sophisticated portfolio allocation and rebalancing logic
 * for the German compound interest calculator, supporting multiple asset classes
 * with historical correlations and realistic return patterns.
 */

import {
  type VolatilityTargetingConfig,
  createDefaultVolatilityTargetingConfig,
} from './volatility-targeting'
import {
  type Currency,
  type CurrencyHedgingConfig,
  DEFAULT_HEDGING_CONFIG,
} from './currency-risk'

/**
 * Supported asset classes for multi-asset portfolios
 */
export type AssetClass =
  | 'stocks_domestic' // German/European stocks (DAX, EuroStoxx)
  | 'stocks_international' // International stocks (MSCI World ex-Europe)
  | 'bonds_government' // German government bonds (Bunds)
  | 'bonds_corporate' // European corporate bonds
  | 'real_estate' // REITs (Real Estate Investment Trusts)
  | 'commodities' // Commodities (Gold, Energy, Materials)
  | 'cash' // Cash and cash equivalents

/**
 * Asset class configuration with historical parameters
 */
export interface AssetClassConfig {
  /** Display name for the asset class */
  name: string
  /** Expected annual return (e.g., 0.07 for 7%) */
  expectedReturn: number
  /** Annual volatility/standard deviation (e.g., 0.15 for 15%) */
  volatility: number
  /** Target allocation percentage (0-1, e.g., 0.6 for 60%) */
  targetAllocation: number
  /** Whether this asset class is enabled in the portfolio */
  enabled: boolean
  /** Asset class description for UI */
  description: string
  /** German tax treatment category */
  taxCategory: 'equity' | 'bond' | 'reit' | 'commodity' | 'cash'
}

/**
 * Default asset class configurations based on historical German/European data
 */
export const DEFAULT_ASSET_CLASSES: Record<AssetClass, AssetClassConfig> = {
  stocks_domestic: {
    name: 'Deutsche/Europäische Aktien',
    expectedReturn: 0.08, // 8% historical average
    volatility: 0.2, // 20% volatility
    targetAllocation: 0.4, // 40% allocation
    enabled: true,
    description: 'DAX, EuroStoxx 50, deutsche und europäische Einzelaktien',
    taxCategory: 'equity',
  },
  stocks_international: {
    name: 'Internationale Aktien',
    expectedReturn: 0.075, // 7.5% historical average
    volatility: 0.18, // 18% volatility
    targetAllocation: 0.2, // 20% allocation
    enabled: true,
    description: 'MSCI World ex-Europe, US-Aktien, Emerging Markets',
    taxCategory: 'equity',
  },
  bonds_government: {
    name: 'Staatsanleihen',
    expectedReturn: 0.03, // 3% historical average
    volatility: 0.05, // 5% volatility
    targetAllocation: 0.2, // 20% allocation
    enabled: true,
    description: 'Deutsche Bundesanleihen, europäische Staatsanleihen',
    taxCategory: 'bond',
  },
  bonds_corporate: {
    name: 'Unternehmensanleihen',
    expectedReturn: 0.04, // 4% historical average
    volatility: 0.08, // 8% volatility
    targetAllocation: 0.1, // 10% allocation
    enabled: true,
    description: 'Europäische Unternehmensanleihen (Investment Grade)',
    taxCategory: 'bond',
  },
  real_estate: {
    name: 'Immobilien (REITs)',
    expectedReturn: 0.06, // 6% historical average
    volatility: 0.15, // 15% volatility
    targetAllocation: 0.1, // 10% allocation
    enabled: false, // Disabled by default
    description: 'Real Estate Investment Trusts, Immobilienfonds',
    taxCategory: 'reit',
  },
  commodities: {
    name: 'Rohstoffe',
    expectedReturn: 0.04, // 4% historical average
    volatility: 0.25, // 25% volatility (high volatility)
    targetAllocation: 0.0, // 0% allocation (disabled by default)
    enabled: false, // Disabled by default
    description: 'Gold, Öl, Agrarrohstoffe, Industriemetalle',
    taxCategory: 'commodity',
  },
  cash: {
    name: 'Liquidität',
    expectedReturn: 0.01, // 1% (risk-free rate)
    volatility: 0.0, // 0% volatility
    targetAllocation: 0.0, // 0% allocation (automatically calculated)
    enabled: false, // Managed automatically
    description: 'Tagesgeld, Geldmarktfonds, kurzfristige Staatsanleihen',
    taxCategory: 'cash',
  },
}

/**
 * Correlation matrix between asset classes (historical European data)
 * Values range from -1 (perfect negative correlation) to 1 (perfect positive correlation)
 */
export const ASSET_CORRELATION_MATRIX: Record<AssetClass, Record<AssetClass, number>> = {
  stocks_domestic: {
    stocks_domestic: 1.0,
    stocks_international: 0.85, // High correlation with international stocks
    bonds_government: -0.15, // Slightly negative correlation with bonds
    bonds_corporate: 0.25, // Low positive correlation with corporate bonds
    real_estate: 0.7, // High correlation with REITs
    commodities: 0.35, // Moderate correlation with commodities
    cash: 0.0, // No correlation with cash
  },
  stocks_international: {
    stocks_domestic: 0.85,
    stocks_international: 1.0,
    bonds_government: -0.1,
    bonds_corporate: 0.3,
    real_estate: 0.65,
    commodities: 0.4,
    cash: 0.0,
  },
  bonds_government: {
    stocks_domestic: -0.15,
    stocks_international: -0.1,
    bonds_government: 1.0,
    bonds_corporate: 0.8, // High correlation with corporate bonds
    real_estate: 0.05,
    commodities: -0.05,
    cash: 0.2,
  },
  bonds_corporate: {
    stocks_domestic: 0.25,
    stocks_international: 0.3,
    bonds_government: 0.8,
    bonds_corporate: 1.0,
    real_estate: 0.15,
    commodities: 0.1,
    cash: 0.15,
  },
  real_estate: {
    stocks_domestic: 0.7,
    stocks_international: 0.65,
    bonds_government: 0.05,
    bonds_corporate: 0.15,
    real_estate: 1.0,
    commodities: 0.3,
    cash: 0.0,
  },
  commodities: {
    stocks_domestic: 0.35,
    stocks_international: 0.4,
    bonds_government: -0.05,
    bonds_corporate: 0.1,
    real_estate: 0.3,
    commodities: 1.0,
    cash: 0.0,
  },
  cash: {
    stocks_domestic: 0.0,
    stocks_international: 0.0,
    bonds_government: 0.2,
    bonds_corporate: 0.15,
    real_estate: 0.0,
    commodities: 0.0,
    cash: 1.0,
  },
}

/**
 * Multi-asset portfolio configuration
 */
export interface MultiAssetPortfolioConfig {
  /** Whether multi-asset portfolio is enabled */
  enabled: boolean

  /** Asset class configurations */
  assetClasses: Record<AssetClass, AssetClassConfig>

  /** Rebalancing configuration */
  rebalancing: {
    /** Rebalancing frequency */
    frequency: 'never' | 'monthly' | 'quarterly' | 'annually'
    /** Rebalancing threshold (percentage drift from target before rebalancing) */
    threshold: number // e.g., 0.05 for 5% drift
    /** Whether to use threshold-based rebalancing */
    useThreshold: boolean
    /** Transaction cost configuration */
    transactionCosts: {
      /** Percentage-based transaction cost (e.g., 0.001 for 0.1% per trade) */
      percentageCost: number
      /** Fixed cost per transaction in EUR (e.g., 5 EUR per trade) */
      fixedCost: number
      /** Minimum transaction size to avoid (to minimize fixed costs) */
      minTransactionSize: number
    }
    /** Cost-benefit analysis threshold (percentage of portfolio value) */
    costBenefitThreshold: number // e.g., 0.001 for 0.1%
  }

  /** Monte Carlo simulation settings */
  simulation: {
    /** Whether to use correlated returns (true) or independent returns (false) */
    useCorrelation: boolean
    /** Random seed for reproducible results */
    seed?: number
  }

  /** Volatility targeting configuration for dynamic allocation */
  volatilityTargeting: VolatilityTargetingConfig

  /** Currency risk configuration for international investments */
  currencyRisk?: {
    /** Whether currency risk management is enabled */
    enabled: boolean
    /** Currency allocations (sum should be 1.0) */
    currencyAllocations: Array<{
      currency: Currency
      allocation: number
    }>
    /** Hedging configuration */
    hedging: CurrencyHedgingConfig
  }
}

/**
 * Create default multi-asset portfolio configuration
 */
export function createDefaultMultiAssetConfig(): MultiAssetPortfolioConfig {
  return {
    enabled: false,
    assetClasses: { ...DEFAULT_ASSET_CLASSES },
    rebalancing: {
      frequency: 'annually',
      threshold: 0.05, // 5% drift threshold
      useThreshold: false, // Use time-based rebalancing by default
      transactionCosts: {
        percentageCost: 0.001, // 0.1% per trade
        fixedCost: 0, // No fixed cost by default
        minTransactionSize: 100, // Minimum 100 EUR transaction
      },
      costBenefitThreshold: 0.001, // Rebalance if costs < 0.1% of portfolio
    },
    simulation: {
      useCorrelation: true,
      seed: undefined,
    },
    volatilityTargeting: createDefaultVolatilityTargetingConfig(),
    currencyRisk: {
      enabled: false,
      currencyAllocations: [
        { currency: 'EUR', allocation: 0.6 },
        { currency: 'USD', allocation: 0.3 },
        { currency: 'GBP', allocation: 0.1 },
      ],
      hedging: DEFAULT_HEDGING_CONFIG,
    },
  }
}

/**
 * Portfolio holdings for a specific point in time
 */
export interface PortfolioHoldings {
  /** Total portfolio value */
  totalValue: number
  /** Holdings by asset class */
  holdings: Record<
    AssetClass,
    {
      value: number
      allocation: number // Current allocation percentage (0-1)
      targetAllocation: number // Target allocation percentage (0-1)
      drift: number // Drift from target allocation
      costBasis?: number // Cost basis for tax calculations (optional)
    }
  >
  /** Whether rebalancing is needed */
  needsRebalancing: boolean
  /** Rebalancing cost (if any) */
  rebalancingCost: number
}

/**
 * Single transaction in a rebalancing event
 */
export interface RebalancingTransaction {
  /** Asset class being traded */
  assetClass: AssetClass
  /** Trade type: 'buy' for purchases, 'sell' for sales */
  type: 'buy' | 'sell'
  /** Amount in EUR */
  amount: number
  /** Percentage of portfolio value */
  percentageOfPortfolio: number
  /** Capital gains for this transaction (only for sells) */
  capitalGains?: number
  /** Tax on capital gains (only for sells with gains) */
  tax?: number
}

/**
 * Detailed rebalancing protocol for a specific event
 */
export interface RebalancingProtocol {
  /** Year when rebalancing occurred */
  year: number
  /** Month when rebalancing occurred (0-11) */
  month: number
  /** Reason for rebalancing */
  reason: 'threshold' | 'scheduled'
  /** Portfolio value before rebalancing */
  portfolioValueBefore: number
  /** Portfolio value after rebalancing (same unless costs applied) */
  portfolioValueAfter: number
  /** Individual transactions executed */
  transactions: RebalancingTransaction[]
  /** Total capital gains realized */
  totalCapitalGains: number
  /** Total tax paid */
  totalTax: number
  /** Transaction costs (if any) */
  transactionCosts: number
  /** Net cost/benefit of rebalancing */
  netCost: number
  /** Asset allocations before rebalancing */
  allocationsBefore: Record<AssetClass, number>
  /** Asset allocations after rebalancing */
  allocationsAfter: Record<AssetClass, number>
}

/**
 * Result of multi-asset portfolio simulation for one year
 */
export interface MultiAssetYearResult {
  /** Year */
  year: number
  /** Portfolio holdings at start of year */
  startHoldings: PortfolioHoldings
  /** Portfolio holdings at end of year */
  endHoldings: PortfolioHoldings
  /** Returns by asset class */
  assetReturns: Record<AssetClass, number>
  /** Whether rebalancing occurred this year */
  rebalanced: boolean
  /** Detailed rebalancing protocol if rebalancing occurred */
  rebalancingProtocol?: RebalancingProtocol
  /** Total portfolio return for the year */
  totalReturn: number
  /** Contributions added during the year */
  contributions: number
}

/**
 * Complete multi-asset portfolio simulation result
 */
export interface MultiAssetSimulationResult {
  /** Results by year */
  yearResults: Record<number, MultiAssetYearResult>
  /** Final portfolio value */
  finalValue: number
  /** Total contributions over the period */
  totalContributions: number
  /** Total return (final value - total contributions) */
  totalReturn: number
  /** Annualized return rate */
  annualizedReturn: number
  /** Portfolio volatility (standard deviation of annual returns) */
  volatility: number
  /** Sharpe ratio (if risk-free rate is available) */
  sharpeRatio?: number
  /** All rebalancing protocols executed during simulation */
  rebalancingProtocols: RebalancingProtocol[]
}

/**
 * Validate individual asset class configuration
 */
function validateAssetClass(assetConfig: AssetClassConfig): string[] {
  const errors: string[] = []

  if (assetConfig.targetAllocation < 0 || assetConfig.targetAllocation > 1) {
    errors.push(`${assetConfig.name}: Allokation muss zwischen 0% und 100% liegen`)
  }

  if (assetConfig.expectedReturn < -0.5 || assetConfig.expectedReturn > 0.5) {
    errors.push(`${assetConfig.name}: Erwartete Rendite muss zwischen -50% und 50% liegen`)
  }

  if (assetConfig.volatility < 0 || assetConfig.volatility > 1) {
    errors.push(`${assetConfig.name}: Volatilität muss zwischen 0% und 100% liegen`)
  }

  return errors
}

/**
 * Validate total allocation sums to 100%
 */
function validateTotalAllocation(enabledAssets: Array<[string, AssetClassConfig]>): string[] {
  const totalAllocation = enabledAssets.reduce((sum, [_, assetConfig]) => sum + assetConfig.targetAllocation, 0)

  if (Math.abs(totalAllocation - 1.0) > 0.001) {
    return [`Die Gesamtallokation muss 100% betragen (aktuell: ${(totalAllocation * 100).toFixed(1)}%)`]
  }

  return []
}

/**
 * Validate transaction cost configuration
 */
function validateTransactionCosts(config: MultiAssetPortfolioConfig): string[] {
  const errors: string[] = []

  if (config.rebalancing.transactionCosts.percentageCost < 0 || config.rebalancing.transactionCosts.percentageCost > 0.1) {
    errors.push('Prozentuale Transaktionskosten müssen zwischen 0% und 10% liegen')
  }

  if (config.rebalancing.transactionCosts.fixedCost < 0) {
    errors.push('Fixe Transaktionskosten dürfen nicht negativ sein')
  }

  if (config.rebalancing.transactionCosts.minTransactionSize < 0) {
    errors.push('Minimale Transaktionsgröße darf nicht negativ sein')
  }

  if (config.rebalancing.costBenefitThreshold < 0 || config.rebalancing.costBenefitThreshold > 0.1) {
    errors.push('Kosten-Nutzen-Schwellenwert muss zwischen 0% und 10% liegen')
  }

  return errors
}

/**
 * Validate multi-asset portfolio configuration
 */
export function validateMultiAssetConfig(config: MultiAssetPortfolioConfig): string[] {
  const errors: string[] = []

  if (!config.enabled) {
    return errors // No validation needed if disabled
  }

  // Check that enabled asset classes have allocations that sum to 1
  const enabledAssets = Object.entries(config.assetClasses).filter(([_, assetConfig]) => assetConfig.enabled)

  if (enabledAssets.length === 0) {
    errors.push('Mindestens eine Anlageklasse muss aktiviert sein')
    return errors
  }

  // Validate total allocation
  errors.push(...validateTotalAllocation(enabledAssets))

  // Validate individual asset configurations
  for (const [, assetConfig] of enabledAssets) {
    errors.push(...validateAssetClass(assetConfig))
  }

  // Validate rebalancing configuration
  if (config.rebalancing.threshold < 0 || config.rebalancing.threshold > 0.5) {
    errors.push('Rebalancing-Schwellenwert muss zwischen 0% und 50% liegen')
  }

  // Validate transaction costs
  errors.push(...validateTransactionCosts(config))

  return errors
}

/**
 * Get display label for asset class
 */
export function getAssetClassLabel(assetClass: AssetClass): string {
  return DEFAULT_ASSET_CLASSES[assetClass].name
}

/**
 * Get display label for rebalancing frequency
 */
export function getRebalancingFrequencyLabel(frequency: 'never' | 'monthly' | 'quarterly' | 'annually'): string {
  switch (frequency) {
    case 'never':
      return 'Nie'
    case 'monthly':
      return 'Monatlich'
    case 'quarterly':
      return 'Quartalsweise'
    case 'annually':
      return 'Jährlich'
    default:
      return frequency
  }
}
