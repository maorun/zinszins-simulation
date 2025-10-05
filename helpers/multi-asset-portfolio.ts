/**
 * Multi-Asset Portfolio system with automatic rebalancing
 * 
 * This module implements sophisticated portfolio allocation and rebalancing logic
 * for the German compound interest calculator, supporting multiple asset classes
 * with historical correlations and realistic return patterns.
 */

/**
 * Supported asset classes for multi-asset portfolios
 */
export type AssetClass = 
  | 'stocks_domestic'     // German/European stocks (DAX, EuroStoxx)
  | 'stocks_international' // International stocks (MSCI World ex-Europe) 
  | 'bonds_government'    // German government bonds (Bunds)
  | 'bonds_corporate'     // European corporate bonds
  | 'real_estate'         // REITs (Real Estate Investment Trusts)
  | 'commodities'         // Commodities (Gold, Energy, Materials)
  | 'cash'               // Cash and cash equivalents

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
    expectedReturn: 0.08,      // 8% historical average
    volatility: 0.20,          // 20% volatility
    targetAllocation: 0.40,    // 40% allocation
    enabled: true,
    description: 'DAX, EuroStoxx 50, deutsche und europäische Einzelaktien',
    taxCategory: 'equity',
  },
  stocks_international: {
    name: 'Internationale Aktien',
    expectedReturn: 0.075,     // 7.5% historical average
    volatility: 0.18,          // 18% volatility
    targetAllocation: 0.20,    // 20% allocation
    enabled: true,
    description: 'MSCI World ex-Europe, US-Aktien, Emerging Markets',
    taxCategory: 'equity',
  },
  bonds_government: {
    name: 'Staatsanleihen',
    expectedReturn: 0.03,      // 3% historical average
    volatility: 0.05,          // 5% volatility
    targetAllocation: 0.20,    // 20% allocation
    enabled: true,
    description: 'Deutsche Bundesanleihen, europäische Staatsanleihen',
    taxCategory: 'bond',
  },
  bonds_corporate: {
    name: 'Unternehmensanleihen',
    expectedReturn: 0.04,      // 4% historical average
    volatility: 0.08,          // 8% volatility
    targetAllocation: 0.10,    // 10% allocation
    enabled: true,
    description: 'Europäische Unternehmensanleihen (Investment Grade)',
    taxCategory: 'bond',
  },
  real_estate: {
    name: 'Immobilien (REITs)',
    expectedReturn: 0.06,      // 6% historical average
    volatility: 0.15,          // 15% volatility
    targetAllocation: 0.10,    // 10% allocation
    enabled: false,            // Disabled by default
    description: 'Real Estate Investment Trusts, Immobilienfonds',
    taxCategory: 'reit',
  },
  commodities: {
    name: 'Rohstoffe',
    expectedReturn: 0.04,      // 4% historical average
    volatility: 0.25,          // 25% volatility (high volatility)
    targetAllocation: 0.00,    // 0% allocation (disabled by default)
    enabled: false,            // Disabled by default
    description: 'Gold, Öl, Agrarrohstoffe, Industriemetalle',
    taxCategory: 'commodity',
  },
  cash: {
    name: 'Liquidität',
    expectedReturn: 0.01,      // 1% (risk-free rate)
    volatility: 0.00,          // 0% volatility
    targetAllocation: 0.00,    // 0% allocation (automatically calculated)
    enabled: false,            // Managed automatically
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
    stocks_domestic: 1.00,
    stocks_international: 0.85,   // High correlation with international stocks
    bonds_government: -0.15,      // Slightly negative correlation with bonds
    bonds_corporate: 0.25,        // Low positive correlation with corporate bonds
    real_estate: 0.70,           // High correlation with REITs
    commodities: 0.35,           // Moderate correlation with commodities
    cash: 0.00,                  // No correlation with cash
  },
  stocks_international: {
    stocks_domestic: 0.85,
    stocks_international: 1.00,
    bonds_government: -0.10,
    bonds_corporate: 0.30,
    real_estate: 0.65,
    commodities: 0.40,
    cash: 0.00,
  },
  bonds_government: {
    stocks_domestic: -0.15,
    stocks_international: -0.10,
    bonds_government: 1.00,
    bonds_corporate: 0.80,       // High correlation with corporate bonds
    real_estate: 0.05,
    commodities: -0.05,
    cash: 0.20,
  },
  bonds_corporate: {
    stocks_domestic: 0.25,
    stocks_international: 0.30,
    bonds_government: 0.80,
    bonds_corporate: 1.00,
    real_estate: 0.15,
    commodities: 0.10,
    cash: 0.15,
  },
  real_estate: {
    stocks_domestic: 0.70,
    stocks_international: 0.65,
    bonds_government: 0.05,
    bonds_corporate: 0.15,
    real_estate: 1.00,
    commodities: 0.30,
    cash: 0.00,
  },
  commodities: {
    stocks_domestic: 0.35,
    stocks_international: 0.40,
    bonds_government: -0.05,
    bonds_corporate: 0.10,
    real_estate: 0.30,
    commodities: 1.00,
    cash: 0.00,
  },
  cash: {
    stocks_domestic: 0.00,
    stocks_international: 0.00,
    bonds_government: 0.20,
    bonds_corporate: 0.15,
    real_estate: 0.00,
    commodities: 0.00,
    cash: 1.00,
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
  }
  
  /** Monte Carlo simulation settings */
  simulation: {
    /** Whether to use correlated returns (true) or independent returns (false) */
    useCorrelation: boolean
    /** Random seed for reproducible results */
    seed?: number
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
    },
    simulation: {
      useCorrelation: true,
      seed: undefined,
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
  holdings: Record<AssetClass, {
    value: number
    allocation: number // Current allocation percentage (0-1)
    targetAllocation: number // Target allocation percentage (0-1)
    drift: number // Drift from target allocation
  }>
  /** Whether rebalancing is needed */
  needsRebalancing: boolean
  /** Rebalancing cost (if any) */
  rebalancingCost: number
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
  const enabledAssets = Object.entries(config.assetClasses)
    .filter(([_, assetConfig]) => assetConfig.enabled)
  
  if (enabledAssets.length === 0) {
    errors.push('Mindestens eine Anlageklasse muss aktiviert sein')
    return errors
  }
  
  const totalAllocation = enabledAssets
    .reduce((sum, [_, assetConfig]) => sum + assetConfig.targetAllocation, 0)
  
  if (Math.abs(totalAllocation - 1.0) > 0.001) {
    errors.push(`Die Gesamtallokation muss 100% betragen (aktuell: ${(totalAllocation * 100).toFixed(1)}%)`)
  }
  
  // Validate individual asset configurations
  for (const [assetClass, assetConfig] of enabledAssets) {
    if (assetConfig.targetAllocation < 0 || assetConfig.targetAllocation > 1) {
      errors.push(`${assetConfig.name}: Allokation muss zwischen 0% und 100% liegen`)
    }
    
    if (assetConfig.expectedReturn < -0.5 || assetConfig.expectedReturn > 0.5) {
      errors.push(`${assetConfig.name}: Erwartete Rendite muss zwischen -50% und 50% liegen`)
    }
    
    if (assetConfig.volatility < 0 || assetConfig.volatility > 1) {
      errors.push(`${assetConfig.name}: Volatilität muss zwischen 0% und 100% liegen`)
    }
  }
  
  // Validate rebalancing configuration
  if (config.rebalancing.threshold < 0 || config.rebalancing.threshold > 0.5) {
    errors.push('Rebalancing-Schwellenwert muss zwischen 0% und 50% liegen')
  }
  
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
    case 'never': return 'Nie'
    case 'monthly': return 'Monatlich'
    case 'quarterly': return 'Quartalsweise'
    case 'annually': return 'Jährlich'
    default: return frequency
  }
}