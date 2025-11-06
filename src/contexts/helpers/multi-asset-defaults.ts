import type { MultiAssetPortfolioConfig } from '../../../helpers/multi-asset-portfolio'

/**
 * Create stocks asset classes for savings phase
 */
function createSavingsStocks() {
  return {
    stocks_domestic: {
      name: 'Deutsche/Europäische Aktien',
      expectedReturn: 0.08,
      volatility: 0.2,
      targetAllocation: 0.4,
      enabled: true,
      description: 'DAX, EuroStoxx 50',
      taxCategory: 'equity' as const,
    },
    stocks_international: {
      name: 'Internationale Aktien',
      expectedReturn: 0.075,
      volatility: 0.18,
      targetAllocation: 0.2,
      enabled: true,
      description: 'MSCI World ex-Europe',
      taxCategory: 'equity' as const,
    },
  }
}

/**
 * Create bonds asset classes for savings phase
 */
function createSavingsBonds() {
  return {
    bonds_government: {
      name: 'Staatsanleihen',
      expectedReturn: 0.03,
      volatility: 0.05,
      targetAllocation: 0.2,
      enabled: true,
      description: 'Deutsche Bundesanleihen',
      taxCategory: 'bond' as const,
    },
    bonds_corporate: {
      name: 'Unternehmensanleihen',
      expectedReturn: 0.04,
      volatility: 0.08,
      targetAllocation: 0.1,
      enabled: true,
      description: 'Europäische Unternehmensanleihen',
      taxCategory: 'bond' as const,
    },
  }
}

/**
 * Create alternative asset classes for savings phase
 */
function createSavingsAlternatives() {
  return {
    real_estate: {
      name: 'Immobilien (REITs)',
      expectedReturn: 0.06,
      volatility: 0.15,
      targetAllocation: 0.1,
      enabled: false,
      description: 'Real Estate Investment Trusts',
      taxCategory: 'reit' as const,
    },
    commodities: {
      name: 'Rohstoffe',
      expectedReturn: 0.04,
      volatility: 0.25,
      targetAllocation: 0.0,
      enabled: false,
      description: 'Gold, Öl, Rohstoffe',
      taxCategory: 'commodity' as const,
    },
    cash: {
      name: 'Liquidität',
      expectedReturn: 0.01,
      volatility: 0.0,
      targetAllocation: 0.0,
      enabled: false,
      description: 'Tagesgeld, Geldmarktfonds',
      taxCategory: 'cash' as const,
    },
  }
}

/**
 * Create default asset classes configuration for savings phase
 */
function createSavingsAssetClasses() {
  return {
    ...createSavingsStocks(),
    ...createSavingsBonds(),
    ...createSavingsAlternatives(),
  }
}

/**
 * Create default rebalancing configuration
 */
function createDefaultRebalancing() {
  return {
    frequency: 'annually' as const,
    threshold: 0.05,
    useThreshold: false,
  }
}

/**
 * Create default simulation configuration
 */
function createDefaultSimulation() {
  return {
    useCorrelation: true,
    seed: undefined,
  }
}

/**
 * Create fallback multi-asset configuration for savings phase
 */
export function createFallbackMultiAssetConfig(): MultiAssetPortfolioConfig {
  return {
    enabled: false,
    assetClasses: createSavingsAssetClasses(),
    rebalancing: createDefaultRebalancing(),
    simulation: createDefaultSimulation(),
  }
}

/**
 * Create stocks asset classes for withdrawal phase
 */
function createWithdrawalStocks() {
  return {
    stocks_domestic: {
      enabled: true,
      targetAllocation: 0.3,
      expectedReturn: 0.06,
      volatility: 0.18,
      taxCategory: 'equity' as const,
      name: '',
      description: '',
    },
    stocks_international: {
      enabled: true,
      targetAllocation: 0.15,
      expectedReturn: 0.055,
      volatility: 0.16,
      taxCategory: 'equity' as const,
      name: '',
      description: '',
    },
  }
}

/**
 * Create bonds asset classes for withdrawal phase
 */
function createWithdrawalBonds() {
  return {
    bonds_government: {
      enabled: true,
      targetAllocation: 0.35,
      expectedReturn: 0.025,
      volatility: 0.04,
      taxCategory: 'bond' as const,
      name: '',
      description: '',
    },
    bonds_corporate: {
      enabled: true,
      targetAllocation: 0.15,
      expectedReturn: 0.035,
      volatility: 0.06,
      taxCategory: 'bond' as const,
      name: '',
      description: '',
    },
  }
}

/**
 * Create alternative asset classes for withdrawal phase
 */
function createWithdrawalAlternatives() {
  return {
    real_estate: {
      enabled: false,
      targetAllocation: 0.0,
      expectedReturn: 0.05,
      volatility: 0.12,
      taxCategory: 'reit' as const,
      name: '',
      description: '',
    },
    commodities: {
      enabled: false,
      targetAllocation: 0.0,
      expectedReturn: 0.04,
      volatility: 0.18,
      taxCategory: 'commodity' as const,
      name: '',
      description: '',
    },
    cash: {
      enabled: false,
      targetAllocation: 0.0,
      expectedReturn: 0.01,
      volatility: 0.0,
      taxCategory: 'cash' as const,
      name: '',
      description: '',
    },
  }
}

/**
 * Create default asset classes configuration for withdrawal phase (conservative)
 */
function createWithdrawalAssetClasses() {
  return {
    ...createWithdrawalStocks(),
    ...createWithdrawalBonds(),
    ...createWithdrawalAlternatives(),
  }
}

/**
 * Create fallback multi-asset configuration for withdrawal phase (conservative)
 */
export function createFallbackWithdrawalConfig(): MultiAssetPortfolioConfig {
  return {
    enabled: false,
    assetClasses: createWithdrawalAssetClasses(),
    rebalancing: createDefaultRebalancing(),
    simulation: createDefaultSimulation(),
  }
}
