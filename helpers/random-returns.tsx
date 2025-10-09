/**
 * Random returns utility for Monte Carlo simulations
 */

export type RandomReturnConfig = {
  averageReturn: number // Average annual return (e.g., 0.07 for 7%)
  standardDeviation?: number // Standard deviation (default: 0.15 for 15%)
  seed?: number // Random seed for reproducible results
}

export type HistoricalReturnConfig = {
  indexId: string // ID of the historical index (e.g., 'dax', 'sp500')
  startYear?: number // Optional: override start year for backtesting period
  endYear?: number // Optional: override end year for backtesting period
}

export type VariableReturnConfig = {
  yearlyReturns: Record<number, number> // Map of year to return rate (e.g., {2023: 0.05, 2024: 0.07})
}

export type ReturnMode = 'fixed' | 'random' | 'variable' | 'historical' | 'multiasset'

export type ReturnConfiguration = {
  mode: ReturnMode
  fixedRate?: number // Used when mode is 'fixed'
  randomConfig?: RandomReturnConfig // Used when mode is 'random'
  variableConfig?: VariableReturnConfig // Used when mode is 'variable'
  historicalConfig?: HistoricalReturnConfig // Used when mode is 'historical'
  multiAssetConfig?: any // Used when mode is 'multiasset' - type defined in multi-asset-portfolio.ts
}

/**
 * Simple Linear Congruential Generator for reproducible random numbers
 * Based on Numerical Recipes parameters
 */
class SeededRandom {
  private seed: number

  constructor(seed: number = Date.now()) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) this.seed += 2147483646
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647
    return (this.seed - 1) / 2147483646
  }
}

/**
 * Box-Muller transformation for generating normally distributed random numbers
 * Returns two independent standard normal variables, but we only use one
 */
function boxMuller(rng: SeededRandom): number {
  let u1 = rng.next()
  const u2 = rng.next()

  // Ensure u1 is not 0 to avoid log(0)
  while (u1 === 0) {
    u1 = rng.next()
  }

  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return z0
}

/**
 * Generate random returns for multiple years using normal distribution
 */
export function generateRandomReturns(
  years: number[],
  config: RandomReturnConfig,
): Record<number, number> {
  const { averageReturn, standardDeviation = 0.15, seed } = config
  const rng = new SeededRandom(seed)
  const returns: Record<number, number> = {}

  for (const year of years) {
    // Generate normally distributed return
    const randomValue = boxMuller(rng)
    const yearReturn = averageReturn + (randomValue * standardDeviation)

    // Clamp to reasonable bounds (prevent extreme negative returns)
    returns[year] = Math.max(yearReturn, -0.5) // Minimum -50% return
  }

  return returns
}

/**
 * Generate multiple simulation runs for Monte Carlo analysis
 */
export function generateMonteCarloReturns(
  years: number[],
  config: RandomReturnConfig,
  runs = 1000,
): Array<Record<number, number>> {
  const results: Array<Record<number, number>> = []

  for (let run = 0; run < runs; run++) {
    // Use different seed for each run if base seed is provided
    const runConfig = config.seed
      ? { ...config, seed: config.seed + run }
      : config

    results.push(generateRandomReturns(years, runConfig))
  }

  return results
}

/**
 * Calculate statistics from multiple Monte Carlo runs
 */
export function calculateMonteCarloStatistics(
  results: number[],
  confidenceLevel = 0.95,
): {
  mean: number
  median: number
  standardDeviation: number
  confidenceInterval: [number, number]
  percentile5: number
  percentile95: number
} {
  const sorted = results.slice().sort((a, b) => a - b)
  const n = sorted.length

  const mean = results.reduce((sum, val) => sum + val, 0) / n
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
    : sorted[Math.floor(n / 2)]

  const variance = results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n
  const standardDeviation = Math.sqrt(variance)

  // Confidence interval calculation
  const alpha = 1 - confidenceLevel
  const lowerIndex = Math.floor(alpha / 2 * n)
  const upperIndex = Math.ceil((1 - alpha / 2) * n) - 1

  return {
    mean,
    median,
    standardDeviation,
    confidenceInterval: [sorted[lowerIndex], sorted[upperIndex]],
    percentile5: sorted[Math.floor(0.05 * n)],
    percentile95: sorted[Math.floor(0.95 * n)],
  }
}
