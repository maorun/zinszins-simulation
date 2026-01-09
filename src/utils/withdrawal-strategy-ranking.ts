/**
 * Withdrawal Strategy Ranking and Comparison Utilities
 * Provides comprehensive comparison and ranking of different withdrawal strategies
 */

import type { WithdrawalStrategy } from '../../helpers/withdrawal'

/**
 * Risk profile for strategy recommendations
 */
export type RiskProfile = 'conservative' | 'balanced' | 'aggressive'

/**
 * Comprehensive strategy comparison result
 */
export interface StrategyComparisonResult {
  strategy: WithdrawalStrategy
  displayName: string
  returnRate: number
  
  // Core metrics
  finalCapital: number
  totalWithdrawal: number
  averageAnnualWithdrawal: number
  portfolioLifeYears: number | 'unlimited'
  
  // Risk metrics
  successRate: number // 0-1, probability portfolio survives planned duration
  downsideRisk: number // Standard deviation of negative returns or worst-case scenarios
  
  // Scoring
  overallScore: number // 0-100, weighted composite score
  rank: number // 1-based ranking
}

/**
 * Weighting factors for strategy scoring
 */
export interface ScoringWeights {
  portfolioLife: number // Weight for portfolio longevity
  totalWithdrawal: number // Weight for total amount withdrawn
  capitalPreservation: number // Weight for final capital remaining
  stability: number // Weight for withdrawal stability (low downside risk)
}

/**
 * Default scoring weights for balanced profile
 */
export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  portfolioLife: 0.35,
  totalWithdrawal: 0.30,
  capitalPreservation: 0.20,
  stability: 0.15,
}

/**
 * Risk profile specific scoring weights
 */
export const RISK_PROFILE_WEIGHTS: Record<RiskProfile, ScoringWeights> = {
  conservative: {
    portfolioLife: 0.40,
    totalWithdrawal: 0.15,
    capitalPreservation: 0.30,
    stability: 0.15,
  },
  balanced: DEFAULT_SCORING_WEIGHTS,
  aggressive: {
    portfolioLife: 0.20,
    totalWithdrawal: 0.45,
    capitalPreservation: 0.15,
    stability: 0.20,
  },
}

/**
 * Normalize a value to 0-100 scale
 */
function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 50 // If all values are the same, return middle score
  return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100))
}

/**
 * Calculate portfolio life score
 * Higher score for longer portfolio survival
 */
function calculatePortfolioLifeScore(
  years: number | 'unlimited',
  allResults: StrategyComparisonResult[],
): number {
  if (years === 'unlimited') return 100
  
  const numericYears = allResults
    .map(r => r.portfolioLifeYears)
    .filter((y): y is number => typeof y === 'number')
  
  if (numericYears.length === 0) return 100
  
  const min = Math.min(...numericYears)
  const max = Math.max(...numericYears)
  
  return normalizeValue(years, min, max)
}

/**
 * Calculate total withdrawal score
 * Higher score for greater total withdrawals
 */
function calculateTotalWithdrawalScore(
  total: number,
  allResults: StrategyComparisonResult[],
): number {
  const totals = allResults.map(r => r.totalWithdrawal)
  const min = Math.min(...totals)
  const max = Math.max(...totals)
  
  return normalizeValue(total, min, max)
}

/**
 * Calculate capital preservation score
 * Higher score for more remaining capital
 */
function calculateCapitalPreservationScore(
  finalCapital: number,
  allResults: StrategyComparisonResult[],
): number {
  const capitals = allResults.map(r => r.finalCapital)
  const min = Math.min(...capitals)
  const max = Math.max(...capitals)
  
  return normalizeValue(finalCapital, min, max)
}

/**
 * Calculate stability score
 * Higher score for lower downside risk (more stability)
 */
function calculateStabilityScore(
  downsideRisk: number,
  allResults: StrategyComparisonResult[],
): number {
  const risks = allResults.map(r => r.downsideRisk)
  const min = Math.min(...risks)
  const max = Math.max(...risks)
  
  // Invert the score - lower risk = higher score
  return 100 - normalizeValue(downsideRisk, min, max)
}

/**
 * Calculate overall score for a strategy
 */
export function calculateOverallScore(
  result: StrategyComparisonResult,
  allResults: StrategyComparisonResult[],
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
): number {
  const portfolioLifeScore = calculatePortfolioLifeScore(result.portfolioLifeYears, allResults)
  const totalWithdrawalScore = calculateTotalWithdrawalScore(result.totalWithdrawal, allResults)
  const capitalPreservationScore = calculateCapitalPreservationScore(result.finalCapital, allResults)
  const stabilityScore = calculateStabilityScore(result.downsideRisk, allResults)
  
  return (
    portfolioLifeScore * weights.portfolioLife +
    totalWithdrawalScore * weights.totalWithdrawal +
    capitalPreservationScore * weights.capitalPreservation +
    stabilityScore * weights.stability
  )
}

/**
 * Rank strategies by their overall scores
 * Returns strategies sorted by rank (best first)
 */
export function rankStrategies(
  results: StrategyComparisonResult[],
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
): StrategyComparisonResult[] {
  // Calculate scores for all strategies
  const resultsWithScores = results.map(result => ({
    ...result,
    overallScore: calculateOverallScore(result, results, weights),
  }))
  
  // Sort by score (descending)
  resultsWithScores.sort((a, b) => b.overallScore - a.overallScore)
  
  // Assign ranks
  return resultsWithScores.map((result, index) => ({
    ...result,
    rank: index + 1,
  }))
}

/**
 * Get recommended strategies based on risk profile
 * Returns top 3 strategies for the given risk profile
 */
export function getRecommendedStrategies(
  results: StrategyComparisonResult[],
  riskProfile: RiskProfile,
): StrategyComparisonResult[] {
  const weights = RISK_PROFILE_WEIGHTS[riskProfile]
  const ranked = rankStrategies(results, weights)
  return ranked.slice(0, 3)
}

/**
 * Calculate success rate for a strategy
 * Based on whether portfolio survives the planned duration
 */
export function calculateSuccessRate(
  portfolioLifeYears: number | 'unlimited',
  plannedDuration: number,
): number {
  if (portfolioLifeYears === 'unlimited') return 1.0
  return portfolioLifeYears >= plannedDuration ? 1.0 : portfolioLifeYears / plannedDuration
}

/**
 * Calculate downside risk metric
 * Simplified version using coefficient of variation of withdrawals
 */
export function calculateDownsideRisk(
  yearlyWithdrawals: number[],
  averageWithdrawal: number,
): number {
  if (yearlyWithdrawals.length === 0 || averageWithdrawal === 0) return 0
  
  // Calculate standard deviation
  const squaredDiffs = yearlyWithdrawals.map(w => Math.pow(w - averageWithdrawal, 2))
  const variance = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / yearlyWithdrawals.length
  const stdDev = Math.sqrt(variance)
  
  // Return coefficient of variation as risk metric
  return (stdDev / averageWithdrawal) * 100
}
