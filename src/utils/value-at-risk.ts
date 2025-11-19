/**
 * Value at Risk (VaR) calculations for portfolio risk management
 *
 * VaR answers the question: "What is the maximum expected loss over a given time period
 * at a given confidence level?"
 *
 * For example, a 1-year VaR of €10,000 at 95% confidence means:
 * "There is a 95% probability that losses will not exceed €10,000 over the next year"
 * or equivalently "There is only a 5% chance of losing more than €10,000"
 *
 * Implements three VaR calculation methods:
 * 1. Parametric VaR (variance-covariance): Assumes normal distribution
 * 2. Historical VaR: Uses actual historical return distribution
 * 3. Monte Carlo VaR: Uses simulation results
 */

/**
 * VaR confidence levels commonly used in finance
 */
export type VaRConfidenceLevel = 90 | 95 | 99

/**
 * VaR result for a single confidence level
 */
export interface VaRResult {
  /** Confidence level (e.g., 95 for 95%) */
  confidenceLevel: VaRConfidenceLevel

  /** Maximum expected loss in EUR at this confidence level */
  maxExpectedLossEur: number

  /** Maximum expected loss as percentage of portfolio value */
  maxExpectedLossPercent: number

  /** Portfolio value used for calculation */
  portfolioValue: number

  /** Method used for calculation */
  method: 'parametric' | 'historical' | 'montecarlo'
}

/**
 * Complete VaR analysis result with multiple confidence levels
 */
export interface VaRAnalysis {
  /** VaR results for different confidence levels */
  results: VaRResult[]

  /** Time horizon in years */
  timeHorizon: number

  /** Number of simulations or historical data points used */
  dataPoints: number

  /** Average return used in calculation */
  averageReturn?: number

  /** Standard deviation used in calculation */
  standardDeviation?: number
}

/**
 * Z-scores for different confidence levels (one-tailed)
 * These represent standard deviations from the mean in a normal distribution
 */
const Z_SCORES: Record<VaRConfidenceLevel, number> = {
  90: 1.282, // 90% confidence = 10% in tail
  95: 1.645, // 95% confidence = 5% in tail
  99: 2.326, // 99% confidence = 1% in tail
}

/**
 * Calculate Parametric VaR (Variance-Covariance method)
 * Assumes returns are normally distributed
 *
 * @param portfolioValue - Current portfolio value in EUR
 * @param averageReturn - Expected annual return (e.g., 0.07 for 7%)
 * @param standardDeviation - Standard deviation of returns (e.g., 0.15 for 15%)
 * @param timeHorizon - Time horizon in years (default: 1)
 * @param confidenceLevels - Confidence levels to calculate (default: [90, 95, 99])
 * @returns VaR analysis with results for each confidence level
 */
export function calculateParametricVaR(
  portfolioValue: number,
  averageReturn: number,
  standardDeviation: number,
  timeHorizon = 1,
  confidenceLevels: VaRConfidenceLevel[] = [90, 95, 99],
): VaRAnalysis {
  // Adjust for time horizon
  const adjustedReturn = averageReturn * timeHorizon
  const adjustedStdDev = standardDeviation * Math.sqrt(timeHorizon)

  const results: VaRResult[] = confidenceLevels.map(confidenceLevel => {
    const zScore = Z_SCORES[confidenceLevel]

    // VaR = Portfolio Value × (Expected Return - Z-Score × Std Dev)
    // Negative value means loss
    const expectedLoss = portfolioValue * (adjustedReturn - zScore * adjustedStdDev)

    // Convert to positive loss amount (VaR is typically expressed as positive)
    const maxExpectedLossEur = -expectedLoss
    const maxExpectedLossPercent = -(adjustedReturn - zScore * adjustedStdDev) * 100

    return {
      confidenceLevel,
      maxExpectedLossEur,
      maxExpectedLossPercent,
      portfolioValue,
      method: 'parametric',
    }
  })

  return {
    results,
    timeHorizon,
    dataPoints: 0, // Parametric method doesn't use data points
    averageReturn,
    standardDeviation,
  }
}

/**
 * Calculate Historical VaR based on actual return distribution
 * Uses historical percentiles without assuming distribution shape
 *
 * @param portfolioValue - Current portfolio value in EUR
 * @param historicalReturns - Array of historical returns (e.g., [0.10, -0.05, 0.07, ...])
 * @param timeHorizon - Time horizon in years (default: 1)
 * @param confidenceLevels - Confidence levels to calculate (default: [90, 95, 99])
 * @returns VaR analysis with results for each confidence level
 */
export function calculateHistoricalVaR(
  portfolioValue: number,
  historicalReturns: number[],
  timeHorizon = 1,
  confidenceLevels: VaRConfidenceLevel[] = [90, 95, 99],
): VaRAnalysis {
  if (historicalReturns.length === 0) {
    throw new Error('Historical returns array cannot be empty')
  }

  // Sort returns from worst to best
  const sortedReturns = [...historicalReturns].sort((a, b) => a - b)

  // Adjust returns for time horizon if needed
  // For simplicity, we scale by time horizon (this is an approximation)
  const adjustedReturns = sortedReturns.map(r => r * timeHorizon)

  const results: VaRResult[] = confidenceLevels.map(confidenceLevel => {
    // Find the percentile value
    // For 95% confidence, we want the 5th percentile (worst 5% of outcomes)
    const percentile = 100 - confidenceLevel
    const index = Math.floor((percentile / 100) * adjustedReturns.length)
    const percentileReturn = adjustedReturns[Math.max(0, index)]

    // Calculate loss at this percentile
    // If percentileReturn is positive (gain), loss is 0 (no loss expected)
    const maxExpectedLossEur = Math.max(0, -portfolioValue * percentileReturn)
    const maxExpectedLossPercent = Math.max(0, -percentileReturn * 100)

    return {
      confidenceLevel,
      maxExpectedLossEur,
      maxExpectedLossPercent,
      portfolioValue,
      method: 'historical',
    }
  })

  // Calculate average and std dev for reference
  const avgReturn = adjustedReturns.reduce((sum, r) => sum + r, 0) / adjustedReturns.length
  const variance =
    adjustedReturns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / adjustedReturns.length
  const stdDev = Math.sqrt(variance)

  return {
    results,
    timeHorizon,
    dataPoints: historicalReturns.length,
    averageReturn: avgReturn,
    standardDeviation: stdDev,
  }
}

/**
 * Calculate Monte Carlo VaR based on simulation results
 * Uses the distribution of simulated portfolio outcomes
 *
 * @param portfolioValue - Current portfolio value in EUR
 * @param simulatedValues - Array of simulated portfolio values at end of time horizon
 * @param timeHorizon - Time horizon in years (default: 1)
 * @param confidenceLevels - Confidence levels to calculate (default: [90, 95, 99])
 * @returns VaR analysis with results for each confidence level
 */
export function calculateMonteCarloVaR(
  portfolioValue: number,
  simulatedValues: number[],
  timeHorizon = 1,
  confidenceLevels: VaRConfidenceLevel[] = [90, 95, 99],
): VaRAnalysis {
  if (simulatedValues.length === 0) {
    throw new Error('Simulated values array cannot be empty')
  }

  // Sort simulated values from worst to best
  const sortedValues = [...simulatedValues].sort((a, b) => a - b)

  const results: VaRResult[] = confidenceLevels.map(confidenceLevel => {
    // Find the percentile value
    // For 95% confidence, we want the 5th percentile (worst 5% of outcomes)
    const percentile = 100 - confidenceLevel
    const index = Math.floor((percentile / 100) * sortedValues.length)
    const percentileValue = sortedValues[Math.max(0, index)]

    // Calculate loss relative to current portfolio value
    const maxExpectedLossEur = Math.max(0, portfolioValue - percentileValue)
    const maxExpectedLossPercent = (maxExpectedLossEur / portfolioValue) * 100

    return {
      confidenceLevel,
      maxExpectedLossEur,
      maxExpectedLossPercent,
      portfolioValue,
      method: 'montecarlo',
    }
  })

  // Calculate return statistics properly
  const returns = sortedValues.map(v => (v - portfolioValue) / portfolioValue)
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const returnVariance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const returnStdDev = Math.sqrt(returnVariance)

  return {
    results,
    timeHorizon,
    dataPoints: simulatedValues.length,
    averageReturn: avgReturn,
    standardDeviation: returnStdDev,
  }
}

/**
 * Get a human-readable description of a VaR result
 *
 * @param result - VaR result to describe
 * @returns Human-readable description in German
 */
export function getVaRDescription(result: VaRResult): string {
  const { confidenceLevel, maxExpectedLossEur, maxExpectedLossPercent } = result

  const confidence = `${confidenceLevel}%`
  const tailProbability = `${100 - confidenceLevel}%`

  return `Mit ${confidence} Wahrscheinlichkeit wird der Verlust ${maxExpectedLossEur.toLocaleString('de-DE', { 
    style: 'currency', 
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })} (${maxExpectedLossPercent.toFixed(1).replace('.', ',')}%) nicht überschreiten. Es besteht eine ${tailProbability} Wahrscheinlichkeit, dass der Verlust größer ausfällt.`
}

/**
 * Get VaR method description in German
 */
export function getVaRMethodDescription(method: 'parametric' | 'historical' | 'montecarlo'): string {
  const descriptions = {
    parametric: 'Parametrische Methode (Normalverteilung)',
    historical: 'Historische Methode (tatsächliche Renditen)',
    montecarlo: 'Monte-Carlo-Simulation',
  }
  return descriptions[method]
}
