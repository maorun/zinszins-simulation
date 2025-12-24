/**
 * Portfolio Optimization Algorithms
 *
 * Implements Modern Portfolio Theory (MPT) optimization algorithms for
 * German multi-asset portfolios, including:
 * - Mean-Variance Optimization
 * - Maximum Sharpe Ratio
 * - Minimum Volatility
 * - Target Return Optimization
 */

import {
  ASSET_CORRELATION_MATRIX,
  type AssetClass,
  type MultiAssetPortfolioConfig,
} from '../../helpers/multi-asset-portfolio'

/**
 * Default optimization parameters based on Modern Portfolio Theory best practices.
 */
const OPTIMIZATION_DEFAULTS = {
  /**
   * Default risk-free rate for optimization (1%)
   * Conservative estimate for German government bonds
   */
  DEFAULT_RISK_FREE_RATE: 0.01,

  /**
   * Default minimum allocation per asset (5%)
   * Ensures meaningful diversification
   */
  DEFAULT_MIN_ALLOCATION: 0.05,

  /**
   * Default maximum allocation per asset (60%)
   * Prevents over-concentration in single asset
   */
  DEFAULT_MAX_ALLOCATION: 0.6,

  /**
   * Default maximum iterations for optimization algorithms
   */
  DEFAULT_MAX_ITERATIONS: 1000,

  /**
   * Default convergence tolerance for optimization
   * Balances accuracy with computation time
   */
  DEFAULT_TOLERANCE: 0.0001,

  /**
   * Numerical differentiation step size
   * Used for gradient calculations
   */
  GRADIENT_DELTA: 0.001,

  /**
   * Learning rate for gradient descent
   * Controls optimization step size
   */
  LEARNING_RATE: 0.01,

  /**
   * Small epsilon for numerical stability
   * Prevents division by zero and rounding errors
   */
  NUMERICAL_EPSILON: 0.001,
}

/**
 * Optimization objective for portfolio allocation
 */
export type OptimizationObjective =
  | 'max-sharpe' // Maximize Sharpe Ratio (return/risk)
  | 'min-volatility' // Minimize portfolio volatility
  | 'max-return' // Maximize expected return (with risk constraint)
  | 'target-return' // Achieve target return with minimum risk

/**
 * Optimization configuration
 */
export interface OptimizationConfig {
  /** Optimization objective */
  objective: OptimizationObjective
  /** Target return (only for target-return objective) */
  targetReturn?: number
  /** Maximum volatility constraint */
  maxVolatility?: number
  /** Risk-free rate for Sharpe ratio calculation */
  riskFreeRate?: number
  /** Minimum allocation per asset (e.g., 0.05 for 5%) */
  minAllocation?: number
  /** Maximum allocation per asset (e.g., 0.5 for 50%) */
  maxAllocation?: number
  /** Maximum iterations for optimization */
  maxIterations?: number
  /** Convergence tolerance */
  tolerance?: number
}

/**
 * Optimization result
 */
export interface OptimizationResult {
  /** Optimized allocations by asset class */
  allocations: Record<AssetClass, number>
  /** Expected portfolio return */
  expectedReturn: number
  /** Expected portfolio volatility */
  expectedVolatility: number
  /** Sharpe ratio (if risk-free rate provided) */
  sharpeRatio?: number
  /** Number of iterations performed */
  iterations: number
  /** Whether optimization converged */
  converged: boolean
  /** Optimization objective value */
  objectiveValue: number
}

/**
 * Calculate portfolio variance considering correlations
 */
export function calculatePortfolioVariance(
  allocations: Record<AssetClass, number>,
  config: MultiAssetPortfolioConfig,
): number {
  const enabledAssets = Object.entries(config.assetClasses).filter(([_, asset]) => asset.enabled)

  let variance = 0

  // Calculate variance using full covariance matrix
  for (const [assetA, configA] of enabledAssets) {
    const allocationA = allocations[assetA as AssetClass] || 0

    for (const [assetB, configB] of enabledAssets) {
      const allocationB = allocations[assetB as AssetClass] || 0

      // Correlation between assets
      const correlation = ASSET_CORRELATION_MATRIX[assetA as AssetClass]?.[assetB as AssetClass] ?? 0

      // Covariance = correlation * volatility_a * volatility_b
      const covariance = correlation * configA.volatility * configB.volatility

      // Add to variance
      variance += allocationA * allocationB * covariance
    }
  }

  return variance
}

/**
 * Calculate portfolio expected return
 */
export function calculatePortfolioReturn(
  allocations: Record<AssetClass, number>,
  config: MultiAssetPortfolioConfig,
): number {
  const enabledAssets = Object.entries(config.assetClasses).filter(([_, asset]) => asset.enabled)

  return enabledAssets.reduce((sum, [asset, assetConfig]) => {
    const allocation = allocations[asset as AssetClass] || 0
    return sum + allocation * assetConfig.expectedReturn
  }, 0)
}

/**
 * Calculate Sharpe ratio - a measure of risk-adjusted return
 *
 * The Sharpe ratio helps compare the performance of different investment portfolios
 * by measuring excess return per unit of risk (volatility).
 *
 * Formula: (Expected Return - Risk-Free Rate) / Volatility
 *
 * Interpretation:
 * - Sharpe > 1.0: Good risk-adjusted performance
 * - Sharpe > 2.0: Excellent risk-adjusted performance
 * - Sharpe > 3.0: Outstanding performance (rare)
 * - Sharpe < 1.0: Poor risk-adjusted returns
 *
 * Example:
 * Portfolio A: 7% return, 10% volatility → Sharpe = (0.07 - 0.01) / 0.10 = 0.6
 * Portfolio B: 8% return, 15% volatility → Sharpe = (0.08 - 0.01) / 0.15 = 0.47
 * Portfolio A has better risk-adjusted performance despite lower absolute return
 *
 * @param expectedReturn - Annual expected return as decimal (e.g., 0.07 for 7%)
 * @param volatility - Annual volatility (standard deviation) as decimal
 * @param riskFreeRate - Risk-free rate (e.g., German government bonds), default 1%
 * @returns Sharpe ratio (higher is better)
 */
export function calculateSharpeRatio(
  expectedReturn: number,
  volatility: number,
  riskFreeRate = OPTIMIZATION_DEFAULTS.DEFAULT_RISK_FREE_RATE,
): number {
  if (volatility === 0) return 0
  return (expectedReturn - riskFreeRate) / volatility
}

/**
 * Normalize allocations to sum to 1.0
 */
function normalizeAllocations(allocations: Record<AssetClass, number>): Record<AssetClass, number> {
  const sum = Object.values(allocations).reduce((acc, val) => acc + val, 0)
  if (sum === 0) return allocations

  const normalized: Record<AssetClass, number> = {} as Record<AssetClass, number>
  for (const [asset, allocation] of Object.entries(allocations)) {
    normalized[asset as AssetClass] = allocation / sum
  }
  return normalized
}

/**
 * Create initial equal-weight allocation for enabled assets
 */
function createInitialAllocation(config: MultiAssetPortfolioConfig): Record<AssetClass, number> {
  const enabledAssets = Object.entries(config.assetClasses).filter(([_, asset]) => asset.enabled)
  const equalWeight = enabledAssets.length > 0 ? 1 / enabledAssets.length : 0

  const allocations: Record<AssetClass, number> = {} as Record<AssetClass, number>

  for (const [asset] of enabledAssets) {
    allocations[asset as AssetClass] = equalWeight
  }

  // Set disabled assets to 0
  for (const [asset, assetConfig] of Object.entries(config.assetClasses)) {
    if (!assetConfig.enabled) {
      allocations[asset as AssetClass] = 0
    }
  }

  return allocations
}

/**
 * Apply constraints to allocations
 */
function applyConstraints(
  allocations: Record<AssetClass, number>,
  config: MultiAssetPortfolioConfig,
  minAllocation: number,
  maxAllocation: number,
): Record<AssetClass, number> {
  const constrained = {} as Record<AssetClass, number>

  // Apply min/max constraints
  for (const [asset, allocation] of Object.entries(allocations)) {
    const assetConfig = config.assetClasses[asset as AssetClass]
    if (assetConfig.enabled) {
      constrained[asset as AssetClass] = Math.max(minAllocation, Math.min(maxAllocation, allocation))
    } else {
      constrained[asset as AssetClass] = 0
    }
  }

  // Normalize to ensure sum = 1
  return normalizeAllocations(constrained)
}

/**
 * Calculate gradient for Sharpe ratio optimization
 */
function calculateSharpeGradient(
  allocations: Record<AssetClass, number>,
  enabledAssets: AssetClass[],
  config: MultiAssetPortfolioConfig,
  currentSharpe: number,
  riskFreeRate: number,
  maxAllocation: number,
): Record<AssetClass, number> {
  const gradient = {} as Record<AssetClass, number>
  const delta = OPTIMIZATION_DEFAULTS.GRADIENT_DELTA

  for (const asset of enabledAssets) {
    const tempAllocations = { ...allocations }
    tempAllocations[asset] = Math.min(maxAllocation, allocations[asset] + delta)
    const tempAllocationsNorm = normalizeAllocations(tempAllocations)

    const tempReturn = calculatePortfolioReturn(tempAllocationsNorm, config)
    const tempVariance = calculatePortfolioVariance(tempAllocationsNorm, config)
    const tempVolatility = Math.sqrt(tempVariance)
    const tempSharpe = calculateSharpeRatio(tempReturn, tempVolatility, riskFreeRate)

    gradient[asset] = (tempSharpe - currentSharpe) / delta
  }

  return gradient
}

/**
 * Update allocations using gradient descent
 */
function updateAllocationsWithGradient(
  allocations: Record<AssetClass, number>,
  gradient: Record<AssetClass, number>,
  enabledAssets: AssetClass[],
  learningRate: number,
  tolerance: number,
): { updated: boolean; allocations: Record<AssetClass, number> } {
  let updated = false
  const newAllocations = { ...allocations }

  for (const asset of enabledAssets) {
    const newAllocation = allocations[asset] + learningRate * gradient[asset]
    if (Math.abs(newAllocation - allocations[asset]) > tolerance) {
      updated = true
    }
    newAllocations[asset] = newAllocation
  }

  return { updated, allocations: newAllocations }
}

/**
 * Calculate final optimization result
 */
function createOptimizationResult(
  bestAllocations: Record<AssetClass, number>,
  config: MultiAssetPortfolioConfig,
  iterations: number,
  maxIterations: number,
  objectiveValue: number,
  riskFreeRate?: number,
): OptimizationResult {
  const finalReturn = calculatePortfolioReturn(bestAllocations, config)
  const finalVariance = calculatePortfolioVariance(bestAllocations, config)
  const finalVolatility = Math.sqrt(finalVariance)

  const result: OptimizationResult = {
    allocations: bestAllocations,
    expectedReturn: finalReturn,
    expectedVolatility: finalVolatility,
    iterations,
    converged: iterations < maxIterations,
    objectiveValue,
  }

  if (riskFreeRate !== undefined) {
    result.sharpeRatio = calculateSharpeRatio(finalReturn, finalVolatility, riskFreeRate)
  }

  return result
}

/**
 * Get enabled assets from config
 */
function getEnabledAssets(config: MultiAssetPortfolioConfig): AssetClass[] {
  return Object.entries(config.assetClasses)
    .filter(([_, asset]) => asset.enabled)
    .map(([asset]) => asset as AssetClass)
}

/**
 * Optimize portfolio for maximum Sharpe ratio
 */
function optimizeMaxSharpe(
  config: MultiAssetPortfolioConfig,
  riskFreeRate: number,
  minAllocation: number,
  maxAllocation: number,
  maxIterations: number,
  tolerance: number,
): OptimizationResult {
  let allocations = createInitialAllocation(config)
  let bestSharpe = -Infinity
  let bestAllocations = { ...allocations }
  let iterations = 0

  const enabledAssets = getEnabledAssets(config)
  const learningRate = OPTIMIZATION_DEFAULTS.LEARNING_RATE

  while (iterations < maxIterations) {
    iterations++

    const currentReturn = calculatePortfolioReturn(allocations, config)
    const currentVariance = calculatePortfolioVariance(allocations, config)
    const currentVolatility = Math.sqrt(currentVariance)
    const currentSharpe = calculateSharpeRatio(currentReturn, currentVolatility, riskFreeRate)

    if (currentSharpe > bestSharpe) {
      bestSharpe = currentSharpe
      bestAllocations = { ...allocations }
    }

    const gradient = calculateSharpeGradient(
      allocations,
      enabledAssets,
      config,
      currentSharpe,
      riskFreeRate,
      maxAllocation,
    )

    const { updated, allocations: newAllocations } = updateAllocationsWithGradient(
      allocations,
      gradient,
      enabledAssets,
      learningRate,
      tolerance,
    )

    allocations = applyConstraints(newAllocations, config, minAllocation, maxAllocation)

    if (!updated) {
      break
    }
  }

  return createOptimizationResult(bestAllocations, config, iterations, maxIterations, bestSharpe, riskFreeRate)
}

/**
 * Calculate gradient for volatility optimization
 */
function calculateVolatilityGradient(
  allocations: Record<AssetClass, number>,
  enabledAssets: AssetClass[],
  config: MultiAssetPortfolioConfig,
  currentVolatility: number,
  maxAllocation: number,
): Record<AssetClass, number> {
  const gradient = {} as Record<AssetClass, number>
  const delta = OPTIMIZATION_DEFAULTS.GRADIENT_DELTA

  for (const asset of enabledAssets) {
    const tempAllocations = { ...allocations }
    tempAllocations[asset] = Math.min(maxAllocation, allocations[asset] + delta)
    const tempAllocationsNorm = normalizeAllocations(tempAllocations)

    const tempVariance = calculatePortfolioVariance(tempAllocationsNorm, config)
    const tempVolatility = Math.sqrt(tempVariance)

    gradient[asset] = (tempVolatility - currentVolatility) / delta
  }

  return gradient
}

/**
 * Optimize portfolio for minimum volatility
 */
function optimizeMinVolatility(
  config: MultiAssetPortfolioConfig,
  minAllocation: number,
  maxAllocation: number,
  maxIterations: number,
  tolerance: number,
): OptimizationResult {
  let allocations = createInitialAllocation(config)
  let bestVolatility = Infinity
  let bestAllocations = { ...allocations }
  let iterations = 0

  const enabledAssets = getEnabledAssets(config)
  const learningRate = OPTIMIZATION_DEFAULTS.LEARNING_RATE

  while (iterations < maxIterations) {
    iterations++

    const currentVariance = calculatePortfolioVariance(allocations, config)
    const currentVolatility = Math.sqrt(currentVariance)

    if (currentVolatility < bestVolatility) {
      bestVolatility = currentVolatility
      bestAllocations = { ...allocations }
    }

    const gradient = calculateVolatilityGradient(allocations, enabledAssets, config, currentVolatility, maxAllocation)

    const { updated, allocations: newAllocations } = updateAllocationsWithGradient(
      allocations,
      gradient,
      enabledAssets,
      -learningRate,
      tolerance,
    )

    allocations = applyConstraints(newAllocations, config, minAllocation, maxAllocation)

    if (!updated) {
      break
    }
  }

  return createOptimizationResult(bestAllocations, config, iterations, maxIterations, bestVolatility)
}

/**
 * Optimize portfolio for maximum return
 */
function optimizeMaxReturn(
  config: MultiAssetPortfolioConfig,
  maxVolatility: number | undefined,
  minAllocation: number,
  maxAllocation: number,
  maxIterations: number,
): OptimizationResult {
  const enabledAssets = Object.entries(config.assetClasses)
    .filter(([_, asset]) => asset.enabled)
    .map(([asset, assetConfig]) => ({ asset: asset as AssetClass, return: assetConfig.expectedReturn }))
    .sort((a, b) => b.return - a.return)

  // Simple greedy approach: allocate to highest return assets
  const allocations: Record<AssetClass, number> = {} as Record<AssetClass, number>

  // Initialize all to 0
  for (const [asset] of Object.entries(config.assetClasses)) {
    allocations[asset as AssetClass] = 0
  }

  // Allocate to highest return assets up to max allocation
  let remaining = 1.0
  let assetIndex = 0

  while (remaining > OPTIMIZATION_DEFAULTS.NUMERICAL_EPSILON && assetIndex < enabledAssets.length) {
    const { asset } = enabledAssets[assetIndex]
    const allocationAmount = Math.min(remaining, maxAllocation)
    allocations[asset] = allocationAmount
    remaining -= allocationAmount
    assetIndex++
  }

  // Normalize
  const normalizedAllocations = normalizeAllocations(allocations)

  // Check volatility constraint
  const variance = calculatePortfolioVariance(normalizedAllocations, config)
  const volatility = Math.sqrt(variance)

  if (maxVolatility !== undefined && volatility > maxVolatility) {
    // If volatility constraint is violated, fall back to min volatility with that constraint
    return optimizeMinVolatility(
      config,
      minAllocation,
      maxAllocation,
      maxIterations,
      OPTIMIZATION_DEFAULTS.DEFAULT_TOLERANCE,
    )
  }

  const finalReturn = calculatePortfolioReturn(normalizedAllocations, config)

  return {
    allocations: normalizedAllocations,
    expectedReturn: finalReturn,
    expectedVolatility: volatility,
    iterations: 1,
    converged: true,
    objectiveValue: finalReturn,
  }
}

/**
 * Validate portfolio configuration for optimization
 */
function validateOptimizationConfig(config: MultiAssetPortfolioConfig): void {
  const enabledAssets = Object.values(config.assetClasses).filter(asset => asset.enabled)
  if (enabledAssets.length === 0) {
    throw new Error('Mindestens eine Anlageklasse muss aktiviert sein')
  }
}

/**
 * Execute optimization based on objective
 */
function executeOptimization(
  objective: OptimizationObjective,
  config: MultiAssetPortfolioConfig,
  riskFreeRate: number,
  minAllocation: number,
  maxAllocation: number,
  maxIterations: number,
  tolerance: number,
  maxVolatility: number | undefined,
): OptimizationResult {
  if (objective === 'max-sharpe') {
    return optimizeMaxSharpe(config, riskFreeRate, minAllocation, maxAllocation, maxIterations, tolerance)
  }

  if (objective === 'min-volatility') {
    return optimizeMinVolatility(config, minAllocation, maxAllocation, maxIterations, tolerance)
  }

  if (objective === 'max-return') {
    return optimizeMaxReturn(config, maxVolatility, minAllocation, maxAllocation, maxIterations)
  }

  if (objective === 'target-return') {
    throw new Error('Target-Return Optimierung ist noch nicht implementiert')
  }

  throw new Error(`Unbekanntes Optimierungsziel: ${objective}`)
}

/**
 * Main portfolio optimization function
 */
export function optimizePortfolio(
  config: MultiAssetPortfolioConfig,
  optimizationConfig: OptimizationConfig,
): OptimizationResult {
  const {
    objective,
    riskFreeRate = OPTIMIZATION_DEFAULTS.DEFAULT_RISK_FREE_RATE,
    minAllocation = OPTIMIZATION_DEFAULTS.DEFAULT_MIN_ALLOCATION,
    maxAllocation = OPTIMIZATION_DEFAULTS.DEFAULT_MAX_ALLOCATION,
    maxIterations = OPTIMIZATION_DEFAULTS.DEFAULT_MAX_ITERATIONS,
    tolerance = OPTIMIZATION_DEFAULTS.DEFAULT_TOLERANCE,
    maxVolatility,
  } = optimizationConfig

  validateOptimizationConfig(config)

  return executeOptimization(
    objective,
    config,
    riskFreeRate,
    minAllocation,
    maxAllocation,
    maxIterations,
    tolerance,
    maxVolatility,
  )
}

/**
 * Get German label for optimization objective
 */
export function getOptimizationObjectiveLabel(objective: OptimizationObjective): string {
  switch (objective) {
    case 'max-sharpe':
      return 'Maximale Sharpe Ratio'
    case 'min-volatility':
      return 'Minimales Risiko'
    case 'max-return':
      return 'Maximale Rendite'
    case 'target-return':
      return 'Zielrendite'
    default:
      return objective
  }
}

/**
 * Get description for optimization objective
 */
export function getOptimizationObjectiveDescription(objective: OptimizationObjective): string {
  switch (objective) {
    case 'max-sharpe':
      return 'Optimiert das Rendite-Risiko-Verhältnis (Sharpe Ratio) für die beste risikoadjustierte Rendite'
    case 'min-volatility':
      return 'Minimiert das Portfolio-Risiko bei gegebenen Anlageklassen'
    case 'max-return':
      return 'Maximiert die erwartete Rendite unter Berücksichtigung von Risiko-Beschränkungen'
    case 'target-return':
      return 'Erreicht eine Zielrendite mit minimalem Risiko'
    default:
      return ''
  }
}
