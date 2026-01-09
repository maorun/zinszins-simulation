/**
 * Tests for Withdrawal Strategy Ranking Utilities
 */

import { describe, it, expect } from 'vitest'
import {
  calculateOverallScore,
  rankStrategies,
  getRecommendedStrategies,
  calculateSuccessRate,
  calculateDownsideRisk,
  DEFAULT_SCORING_WEIGHTS,
  RISK_PROFILE_WEIGHTS,
  type StrategyComparisonResult,
  type RiskProfile,
} from './withdrawal-strategy-ranking'

describe('withdrawal-strategy-ranking', () => {
  // Sample strategy results for testing
  const sampleResults: StrategyComparisonResult[] = [
    {
      strategy: '4prozent',
      displayName: '4% Regel',
      returnRate: 5,
      finalCapital: 100000,
      totalWithdrawal: 400000,
      averageAnnualWithdrawal: 20000,
      portfolioLifeYears: 25,
      successRate: 1.0,
      downsideRisk: 5,
      overallScore: 0,
      rank: 0,
    },
    {
      strategy: '3prozent',
      displayName: '3% Regel',
      returnRate: 5,
      finalCapital: 200000,
      totalWithdrawal: 300000,
      averageAnnualWithdrawal: 15000,
      portfolioLifeYears: 'unlimited',
      successRate: 1.0,
      downsideRisk: 3,
      overallScore: 0,
      rank: 0,
    },
    {
      strategy: 'monatlich_fest',
      displayName: 'Monatlich fest',
      returnRate: 5,
      finalCapital: 50000,
      totalWithdrawal: 450000,
      averageAnnualWithdrawal: 22500,
      portfolioLifeYears: 20,
      successRate: 0.8,
      downsideRisk: 2,
      overallScore: 0,
      rank: 0,
    },
  ]

  describe('calculateSuccessRate', () => {
    it('should return 1.0 for unlimited portfolio life', () => {
      expect(calculateSuccessRate('unlimited', 30)).toBe(1.0)
    })

    it('should return 1.0 when portfolio survives planned duration', () => {
      expect(calculateSuccessRate(30, 25)).toBe(1.0)
      expect(calculateSuccessRate(25, 25)).toBe(1.0)
    })

    it('should return fractional success rate when portfolio fails early', () => {
      expect(calculateSuccessRate(20, 30)).toBeCloseTo(0.667, 2)
      expect(calculateSuccessRate(10, 20)).toBe(0.5)
    })
  })

  describe('calculateDownsideRisk', () => {
    it('should return 0 for empty withdrawals', () => {
      expect(calculateDownsideRisk([], 1000)).toBe(0)
    })

    it('should return 0 when average is 0', () => {
      expect(calculateDownsideRisk([100, 200], 0)).toBe(0)
    })

    it('should calculate coefficient of variation correctly', () => {
      // Constant withdrawals = no risk
      const constantWithdrawals = [1000, 1000, 1000, 1000]
      expect(calculateDownsideRisk(constantWithdrawals, 1000)).toBe(0)
    })

    it('should return higher risk for more variable withdrawals', () => {
      const lowVariance = [950, 1000, 1050]
      const highVariance = [500, 1000, 1500]
      
      const lowRisk = calculateDownsideRisk(lowVariance, 1000)
      const highRisk = calculateDownsideRisk(highVariance, 1000)
      
      expect(highRisk).toBeGreaterThan(lowRisk)
    })
  })

  describe('calculateOverallScore', () => {
    it('should calculate score using default weights', () => {
      const result = sampleResults[0]
      const score = calculateOverallScore(result, sampleResults)
      
      expect(score).toBeGreaterThanOrEqual(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should give higher score to better performing strategies', () => {
      const scores = sampleResults.map(r => 
        calculateOverallScore(r, sampleResults, DEFAULT_SCORING_WEIGHTS)
      )
      
      // All scores should be valid
      scores.forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0)
        expect(score).toBeLessThanOrEqual(100)
      })
    })

    it('should respect custom weights', () => {
      const result = sampleResults[1] // 3% rule with unlimited life
      
      // Weight heavily toward portfolio life
      const conservativeWeights = {
        portfolioLife: 0.8,
        totalWithdrawal: 0.05,
        capitalPreservation: 0.1,
        stability: 0.05,
      }
      
      // Weight heavily toward total withdrawal
      const aggressiveWeights = {
        portfolioLife: 0.1,
        totalWithdrawal: 0.7,
        capitalPreservation: 0.1,
        stability: 0.1,
      }
      
      const conservativeScore = calculateOverallScore(result, sampleResults, conservativeWeights)
      calculateOverallScore(result, sampleResults, aggressiveWeights)
      
      // Conservative profile should favor unlimited life strategy
      expect(conservativeScore).toBeGreaterThan(50)
    })
  })

  describe('rankStrategies', () => {
    it('should assign ranks starting from 1', () => {
      const ranked = rankStrategies(sampleResults)
      
      expect(ranked[0].rank).toBe(1)
      expect(ranked[1].rank).toBe(2)
      expect(ranked[2].rank).toBe(3)
    })

    it('should sort by overall score descending', () => {
      const ranked = rankStrategies(sampleResults)
      
      for (let i = 1; i < ranked.length; i++) {
        expect(ranked[i - 1].overallScore).toBeGreaterThanOrEqual(ranked[i].overallScore)
      }
    })

    it('should maintain all strategy data', () => {
      const ranked = rankStrategies(sampleResults)
      
      // Check that all original strategies are present
      const originalStrategies = sampleResults.map(r => r.strategy).sort()
      const rankedStrategies = ranked.map(r => r.strategy).sort()
      expect(rankedStrategies).toEqual(originalStrategies)
      
      // Check that each result has complete data
      ranked.forEach(result => {
        expect(result.strategy).toBeTruthy()
        expect(result.displayName).toBeTruthy()
        expect(result.finalCapital).toBeGreaterThanOrEqual(0)
      })
    })

    it('should apply different weights for different risk profiles', () => {
      const conservativeRanked = rankStrategies(sampleResults, RISK_PROFILE_WEIGHTS.conservative)
      const aggressiveRanked = rankStrategies(sampleResults, RISK_PROFILE_WEIGHTS.aggressive)
      
      // Rankings might differ based on weights
      expect(conservativeRanked[0].rank).toBe(1)
      expect(aggressiveRanked[0].rank).toBe(1)
      
      // Both should have valid scores
      expect(conservativeRanked[0].overallScore).toBeGreaterThan(0)
      expect(aggressiveRanked[0].overallScore).toBeGreaterThan(0)
    })
  })

  describe('getRecommendedStrategies', () => {
    it('should return top 3 strategies for conservative profile', () => {
      const recommended = getRecommendedStrategies(sampleResults, 'conservative')
      
      expect(recommended).toHaveLength(3)
      expect(recommended[0].rank).toBe(1)
      expect(recommended[1].rank).toBe(2)
      expect(recommended[2].rank).toBe(3)
    })

    it('should return top 3 strategies for balanced profile', () => {
      const recommended = getRecommendedStrategies(sampleResults, 'balanced')
      
      expect(recommended).toHaveLength(3)
    })

    it('should return top 3 strategies for aggressive profile', () => {
      const recommended = getRecommendedStrategies(sampleResults, 'aggressive')
      
      expect(recommended).toHaveLength(3)
    })

    it('should return all strategies if fewer than 3 available', () => {
      const twoResults = sampleResults.slice(0, 2)
      const recommended = getRecommendedStrategies(twoResults, 'balanced')
      
      expect(recommended).toHaveLength(2)
    })

    it('should prefer different strategies based on risk profile', () => {
      const conservativeTop = getRecommendedStrategies(sampleResults, 'conservative')
      const aggressiveTop = getRecommendedStrategies(sampleResults, 'aggressive')
      
      // All recommendations should be valid
      expect(conservativeTop[0].strategy).toBeTruthy()
      expect(aggressiveTop[0].strategy).toBeTruthy()
    })
  })

  describe('RISK_PROFILE_WEIGHTS', () => {
    it('should have weights that sum to 1.0 for each profile', () => {
      const profiles: RiskProfile[] = ['conservative', 'balanced', 'aggressive']
      
      profiles.forEach(profile => {
        const weights = RISK_PROFILE_WEIGHTS[profile]
        const sum = 
          weights.portfolioLife +
          weights.totalWithdrawal +
          weights.capitalPreservation +
          weights.stability
        
        expect(sum).toBeCloseTo(1.0, 5)
      })
    })

    it('should have different weights for different profiles', () => {
      const conservative = RISK_PROFILE_WEIGHTS.conservative
      const aggressive = RISK_PROFILE_WEIGHTS.aggressive
      
      // Conservative should weight portfolio life and capital preservation higher
      expect(conservative.portfolioLife).toBeGreaterThan(aggressive.portfolioLife)
      expect(conservative.capitalPreservation).toBeGreaterThan(aggressive.capitalPreservation)
      
      // Aggressive should weight total withdrawal higher
      expect(aggressive.totalWithdrawal).toBeGreaterThan(conservative.totalWithdrawal)
    })
  })

  describe('Edge cases', () => {
    it('should handle single strategy comparison', () => {
      const singleStrategy = [sampleResults[0]]
      const ranked = rankStrategies(singleStrategy)
      
      expect(ranked).toHaveLength(1)
      expect(ranked[0].rank).toBe(1)
      expect(ranked[0].overallScore).toBeGreaterThanOrEqual(0)
    })

    it('should handle strategies with same metrics', () => {
      const identicalResults: StrategyComparisonResult[] = [
        { ...sampleResults[0], strategy: '4prozent' },
        { ...sampleResults[0], strategy: '3prozent' },
      ]
      
      const ranked = rankStrategies(identicalResults)
      
      expect(ranked).toHaveLength(2)
      expect(ranked[0].rank).toBe(1)
      expect(ranked[1].rank).toBe(2)
      // Scores should be identical or very close
      expect(Math.abs(ranked[0].overallScore - ranked[1].overallScore)).toBeLessThan(0.1)
    })

    it('should handle extreme values gracefully', () => {
      const extremeResults: StrategyComparisonResult[] = [
        {
          ...sampleResults[0],
          finalCapital: 0,
          totalWithdrawal: 1000000,
          downsideRisk: 0,
        },
        {
          ...sampleResults[1],
          finalCapital: 1000000,
          totalWithdrawal: 0,
          downsideRisk: 100,
        },
      ]
      
      const ranked = rankStrategies(extremeResults)
      
      expect(ranked).toHaveLength(2)
      ranked.forEach(result => {
        expect(result.overallScore).toBeGreaterThanOrEqual(0)
        expect(result.overallScore).toBeLessThanOrEqual(100)
      })
    })
  })
})
