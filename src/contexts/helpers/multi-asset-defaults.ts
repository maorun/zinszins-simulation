import type {
  MultiAssetPortfolioConfig,
  AssetClassConfig,
} from '../../../helpers/multi-asset-portfolio'

/**
 * Create fallback multi-asset configuration for savings phase
 */
// eslint-disable-next-line max-lines-per-function -- Large component function
export function createFallbackMultiAssetConfig(): MultiAssetPortfolioConfig {
  return {
    enabled: false,
    assetClasses: {
      stocks_domestic: {
        name: 'Deutsche/Europäische Aktien',
        expectedReturn: 0.08,
        volatility: 0.20,
        targetAllocation: 0.40,
        enabled: true,
        description: 'DAX, EuroStoxx 50',
        taxCategory: 'equity' as const,
      },
      stocks_international: {
        name: 'Internationale Aktien',
        expectedReturn: 0.075,
        volatility: 0.18,
        targetAllocation: 0.20,
        enabled: true,
        description: 'MSCI World ex-Europe',
        taxCategory: 'equity' as const,
      },
      bonds_government: {
        name: 'Staatsanleihen',
        expectedReturn: 0.03,
        volatility: 0.05,
        targetAllocation: 0.20,
        enabled: true,
        description: 'Deutsche Bundesanleihen',
        taxCategory: 'bond' as const,
      },
      bonds_corporate: {
        name: 'Unternehmensanleihen',
        expectedReturn: 0.04,
        volatility: 0.08,
        targetAllocation: 0.10,
        enabled: true,
        description: 'Europäische Unternehmensanleihen',
        taxCategory: 'bond' as const,
      },
      real_estate: {
        name: 'Immobilien (REITs)',
        expectedReturn: 0.06,
        volatility: 0.15,
        targetAllocation: 0.10,
        enabled: false,
        description: 'Real Estate Investment Trusts',
        taxCategory: 'reit' as const,
      },
      commodities: {
        name: 'Rohstoffe',
        expectedReturn: 0.04,
        volatility: 0.25,
        targetAllocation: 0.00,
        enabled: false,
        description: 'Gold, Öl, Rohstoffe',
        taxCategory: 'commodity' as const,
      },
      cash: {
        name: 'Liquidität',
        expectedReturn: 0.01,
        volatility: 0.00,
        targetAllocation: 0.00,
        enabled: false,
        description: 'Tagesgeld, Geldmarktfonds',
        taxCategory: 'cash' as const,
      },
    },
    rebalancing: {
      frequency: 'annually' as const,
      threshold: 0.05,
      useThreshold: false,
    },
    simulation: {
      useCorrelation: true,
      seed: undefined,
    },
  }
}

/**
 * Helper function to create a minimal asset class configuration for withdrawal phase
 */
function createWithdrawalAssetClass(
  enabled: boolean,
  targetAllocation: number,
  expectedReturn: number,
  volatility: number,
  taxCategory: 'equity' | 'bond' | 'reit' | 'commodity' | 'cash',
): AssetClassConfig {
  return {
    enabled,
    targetAllocation,
    expectedReturn,
    volatility,
    taxCategory,
    name: '',
    description: '',
  }
}

/**
 * Helper function to create asset classes for withdrawal phase
 */
function createWithdrawalAssetClasses(): MultiAssetPortfolioConfig['assetClasses'] {
  return {
    stocks_domestic: createWithdrawalAssetClass(true, 0.3, 0.06, 0.18, 'equity'),
    stocks_international: createWithdrawalAssetClass(true, 0.15, 0.055, 0.16, 'equity'),
    bonds_government: createWithdrawalAssetClass(true, 0.35, 0.025, 0.04, 'bond'),
    bonds_corporate: createWithdrawalAssetClass(true, 0.15, 0.035, 0.06, 'bond'),
    real_estate: createWithdrawalAssetClass(false, 0.0, 0.05, 0.12, 'reit'),
    commodities: createWithdrawalAssetClass(false, 0.0, 0.04, 0.18, 'commodity'),
    cash: createWithdrawalAssetClass(false, 0.0, 0.01, 0.00, 'cash'),
  }
}

/**
 * Helper function to create rebalancing configuration
 */
function createRebalancingConfig(): MultiAssetPortfolioConfig['rebalancing'] {
  return {
    frequency: 'annually' as const,
    threshold: 0.05,
    useThreshold: false,
  }
}

/**
 * Helper function to create simulation configuration
 */
function createSimulationConfig(): MultiAssetPortfolioConfig['simulation'] {
  return {
    useCorrelation: true,
    seed: undefined,
  }
}

/**
 * Create fallback multi-asset configuration for withdrawal phase (conservative)
 */
export function createFallbackWithdrawalConfig(): MultiAssetPortfolioConfig {
  return {
    enabled: false,
    assetClasses: createWithdrawalAssetClasses(),
    rebalancing: createRebalancingConfig(),
    simulation: createSimulationConfig(),
  }
}
