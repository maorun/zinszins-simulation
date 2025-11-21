/**
 * Tests for Factor Investing utilities
 */

import { describe, it, expect } from 'vitest'
import {
  createDefaultFactorPortfolioConfig,
  calculateFactorEnhancedReturn,
  calculateFactorEnhancedVolatility,
  calculateFactorTiltStats,
  getAllFactors,
  getFactorName,
  getFactorDescription,
  validateFactorConfig,
  formatFactorExposure,
  formatFactorPremium,
  DEFAULT_FACTOR_CONFIGS,
  type InvestmentFactor,
} from './factor-investing'

describe('factor-investing', () => {
  describe('createDefaultFactorPortfolioConfig', () => {
    it('should create default configuration with disabled factors', () => {
      const config = createDefaultFactorPortfolioConfig()

      expect(config.enabled).toBe(false)
      expect(config.baseReturn).toBe(0.07)
      expect(config.baseVolatility).toBe(0.15)
      expect(Object.keys(config.factors)).toHaveLength(4)
      expect(config.factors.value.enabled).toBe(false)
      expect(config.factors.growth.enabled).toBe(false)
      expect(config.factors['small-cap'].enabled).toBe(false)
      expect(config.factors.momentum.enabled).toBe(false)
    })

    it('should accept custom base return and volatility', () => {
      const config = createDefaultFactorPortfolioConfig(0.08, 0.2)

      expect(config.baseReturn).toBe(0.08)
      expect(config.baseVolatility).toBe(0.2)
    })

    it('should initialize all factors with zero exposure', () => {
      const config = createDefaultFactorPortfolioConfig()

      Object.values(config.factors).forEach(factor => {
        expect(factor.exposure).toBe(0)
      })
    })
  })

  describe('calculateFactorEnhancedReturn', () => {
    it('should return base return when factor investing is disabled', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = false

      const enhancedReturn = calculateFactorEnhancedReturn(config)

      expect(enhancedReturn).toBe(0.07)
    })

    it('should return base return when no factors are enabled', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      // All factors remain disabled

      const enhancedReturn = calculateFactorEnhancedReturn(config)

      expect(enhancedReturn).toBe(0.07)
    })

    it('should add value factor premium with full exposure', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      config.factors.value.enabled = true
      config.factors.value.exposure = 1.0

      const enhancedReturn = calculateFactorEnhancedReturn(config)

      // Base 7% + Value premium 2.5% = 9.5%
      expect(enhancedReturn).toBeCloseTo(0.095, 5)
    })

    it('should add multiple factor premiums correctly', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      config.factors.value.enabled = true
      config.factors.value.exposure = 1.0
      config.factors.momentum.enabled = true
      config.factors.momentum.exposure = 0.5

      const enhancedReturn = calculateFactorEnhancedReturn(config)

      // Base 7% + Value 2.5% + (Momentum 4% * 0.5) = 11.5%
      expect(enhancedReturn).toBeCloseTo(0.115, 5)
    })

    it('should scale premium by exposure level', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      config.factors['small-cap'].enabled = true
      config.factors['small-cap'].exposure = 0.5

      const enhancedReturn = calculateFactorEnhancedReturn(config)

      // Base 7% + (Small-cap 3% * 0.5) = 8.5%
      expect(enhancedReturn).toBeCloseTo(0.085, 5)
    })
  })

  describe('calculateFactorEnhancedVolatility', () => {
    it('should return base volatility when factor investing is disabled', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = false

      const enhancedVolatility = calculateFactorEnhancedVolatility(config)

      expect(enhancedVolatility).toBe(0.15)
    })

    it('should return base volatility when no factors are enabled', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true

      const enhancedVolatility = calculateFactorEnhancedVolatility(config)

      expect(enhancedVolatility).toBe(0.15)
    })

    it('should increase volatility with value factor exposure', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      config.factors.value.enabled = true
      config.factors.value.exposure = 1.0

      const enhancedVolatility = calculateFactorEnhancedVolatility(config)

      // sqrt(0.15^2 + 0.03^2) ≈ 0.1529
      expect(enhancedVolatility).toBeGreaterThan(0.15)
      expect(enhancedVolatility).toBeCloseTo(0.1529, 3)
    })

    it('should combine multiple factor volatilities correctly', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      config.factors.value.enabled = true
      config.factors.value.exposure = 1.0
      config.factors['small-cap'].enabled = true
      config.factors['small-cap'].exposure = 1.0

      const enhancedVolatility = calculateFactorEnhancedVolatility(config)

      // sqrt(0.15^2 + 0.03^2 + 0.06^2) ≈ 0.1643
      expect(enhancedVolatility).toBeGreaterThan(0.15)
      expect(enhancedVolatility).toBeCloseTo(0.1643, 3)
    })

    it('should scale volatility contribution by exposure', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      config.factors.momentum.enabled = true
      config.factors.momentum.exposure = 0.5

      const enhancedVolatility = calculateFactorEnhancedVolatility(config)

      // sqrt(0.15^2 + (0.05 * 0.5)^2) ≈ 0.1521
      expect(enhancedVolatility).toBeGreaterThan(0.15)
      expect(enhancedVolatility).toBeCloseTo(0.1521, 3)
    })
  })

  describe('calculateFactorTiltStats', () => {
    it('should calculate zero premium and risk when factor investing is disabled', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = false

      const stats = calculateFactorTiltStats(config)

      expect(stats.totalPremium).toBe(0)
      expect(stats.totalAdditionalRisk).toBe(0)
      expect(stats.activeFactorsCount).toBe(0)
    })

    it('should calculate correct stats for single active factor', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      config.factors.value.enabled = true
      config.factors.value.exposure = 1.0

      const stats = calculateFactorTiltStats(config)

      expect(stats.totalPremium).toBeCloseTo(0.025, 5)
      expect(stats.totalAdditionalRisk).toBeGreaterThan(0)
      expect(stats.activeFactorsCount).toBe(1)
      expect(stats.enhancedSharpeRatio).toBeGreaterThan(0)
    })

    it('should calculate correct stats for multiple active factors', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      config.factors.value.enabled = true
      config.factors.value.exposure = 0.5
      config.factors.momentum.enabled = true
      config.factors.momentum.exposure = 0.5

      const stats = calculateFactorTiltStats(config)

      // Value: 2.5% * 0.5 = 1.25%, Momentum: 4% * 0.5 = 2% => Total: 3.25%
      expect(stats.totalPremium).toBeCloseTo(0.0325, 5)
      expect(stats.activeFactorsCount).toBe(2)
      expect(stats.enhancedSharpeRatio).toBeGreaterThan(0)
    })

    it('should calculate Sharpe Ratio correctly', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      config.factors.momentum.enabled = true
      config.factors.momentum.exposure = 1.0

      const stats = calculateFactorTiltStats(config)

      // Enhanced return: 7% + 4% = 11%
      // Risk-free rate: 1%
      // Enhanced volatility: sqrt(0.15^2 + 0.05^2) ≈ 0.158
      // Sharpe: (0.11 - 0.01) / 0.158 ≈ 0.633
      expect(stats.enhancedSharpeRatio).toBeGreaterThan(0.6)
      expect(stats.enhancedSharpeRatio).toBeLessThan(0.7)
    })
  })

  describe('getAllFactors', () => {
    it('should return all four factors', () => {
      const factors = getAllFactors()

      expect(factors).toHaveLength(4)
      expect(factors).toContain('value')
      expect(factors).toContain('growth')
      expect(factors).toContain('small-cap')
      expect(factors).toContain('momentum')
    })
  })

  describe('getFactorName', () => {
    it('should return German names for all factors', () => {
      expect(getFactorName('value')).toBe('Value-Faktor')
      expect(getFactorName('growth')).toBe('Growth-Faktor')
      expect(getFactorName('small-cap')).toBe('Small-Cap-Faktor')
      expect(getFactorName('momentum')).toBe('Momentum-Faktor')
    })
  })

  describe('getFactorDescription', () => {
    it('should return descriptions for all factors', () => {
      const factors: InvestmentFactor[] = ['value', 'growth', 'small-cap', 'momentum']

      factors.forEach(factor => {
        const description = getFactorDescription(factor)
        expect(description).toBeTruthy()
        expect(description.length).toBeGreaterThan(0)
      })
    })
  })

  describe('validateFactorConfig', () => {
    it('should return no errors for valid configuration', () => {
      const config = createDefaultFactorPortfolioConfig()
      config.enabled = true
      config.factors.value.enabled = true
      config.factors.value.exposure = 0.5

      const errors = validateFactorConfig(config)

      expect(errors).toHaveLength(0)
    })

    it('should return error for exposure below 0', () => {
      const config = createDefaultFactorPortfolioConfig()
      config.factors.value.enabled = true
      config.factors.value.exposure = -0.1

      const errors = validateFactorConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('Exposure muss zwischen')
    })

    it('should return error for exposure above 1', () => {
      const config = createDefaultFactorPortfolioConfig()
      config.factors.momentum.enabled = true
      config.factors.momentum.exposure = 1.5

      const errors = validateFactorConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('Exposure muss zwischen')
    })

    it('should warn about conflicting value and growth factors', () => {
      const config = createDefaultFactorPortfolioConfig()
      config.factors.value.enabled = true
      config.factors.value.exposure = 0.7
      config.factors.growth.enabled = true
      config.factors.growth.exposure = 0.6

      const errors = validateFactorConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.includes('gegensätzliche Faktoren'))).toBe(true)
    })

    it('should allow value and growth with total exposure <= 1', () => {
      const config = createDefaultFactorPortfolioConfig()
      config.factors.value.enabled = true
      config.factors.value.exposure = 0.5
      config.factors.growth.enabled = true
      config.factors.growth.exposure = 0.4

      const errors = validateFactorConfig(config)

      expect(errors).toHaveLength(0)
    })
  })

  describe('formatFactorExposure', () => {
    it('should format exposure as percentage', () => {
      expect(formatFactorExposure(0)).toBe('0%')
      expect(formatFactorExposure(0.25)).toBe('25%')
      expect(formatFactorExposure(0.5)).toBe('50%')
      expect(formatFactorExposure(1.0)).toBe('100%')
    })
  })

  describe('formatFactorPremium', () => {
    it('should format positive premium with plus sign', () => {
      expect(formatFactorPremium(0.025)).toBe('+2.50%')
      expect(formatFactorPremium(0.04)).toBe('+4.00%')
    })

    it('should format negative premium with minus sign', () => {
      expect(formatFactorPremium(-0.01)).toBe('-1.00%')
    })

    it('should format zero premium correctly', () => {
      expect(formatFactorPremium(0)).toBe('+0.00%')
    })
  })

  describe('DEFAULT_FACTOR_CONFIGS', () => {
    it('should have positive historical premiums for all factors', () => {
      Object.values(DEFAULT_FACTOR_CONFIGS).forEach(factor => {
        expect(factor.historicalPremium).toBeGreaterThan(0)
      })
    })

    it('should have positive additional volatility for all factors', () => {
      Object.values(DEFAULT_FACTOR_CONFIGS).forEach(factor => {
        expect(factor.additionalVolatility).toBeGreaterThan(0)
      })
    })

    it('should have research basis for all factors', () => {
      Object.values(DEFAULT_FACTOR_CONFIGS).forEach(factor => {
        expect(factor.researchBasis).toBeTruthy()
        expect(factor.researchBasis.length).toBeGreaterThan(0)
      })
    })

    it('should have momentum factor with highest premium', () => {
      const momentumPremium = DEFAULT_FACTOR_CONFIGS.momentum.historicalPremium
      const otherPremiums = [
        DEFAULT_FACTOR_CONFIGS.value.historicalPremium,
        DEFAULT_FACTOR_CONFIGS.growth.historicalPremium,
        DEFAULT_FACTOR_CONFIGS['small-cap'].historicalPremium,
      ]

      expect(momentumPremium).toBeGreaterThanOrEqual(Math.max(...otherPremiums))
    })

    it('should have small-cap factor with highest volatility', () => {
      const smallCapVol = DEFAULT_FACTOR_CONFIGS['small-cap'].additionalVolatility
      const otherVols = [
        DEFAULT_FACTOR_CONFIGS.value.additionalVolatility,
        DEFAULT_FACTOR_CONFIGS.growth.additionalVolatility,
        DEFAULT_FACTOR_CONFIGS.momentum.additionalVolatility,
      ]

      expect(smallCapVol).toBeGreaterThanOrEqual(Math.max(...otherVols))
    })
  })

  describe('Integration tests', () => {
    it('should maintain risk-return tradeoff with factor tilts', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true

      // Test all factors individually
      const factors: InvestmentFactor[] = ['value', 'growth', 'small-cap', 'momentum']

      factors.forEach(factorKey => {
        // Reset config
        config.factors.value.enabled = false
        config.factors.growth.enabled = false
        config.factors['small-cap'].enabled = false
        config.factors.momentum.enabled = false

        // Enable one factor
        config.factors[factorKey].enabled = true
        config.factors[factorKey].exposure = 1.0

        const enhancedReturn = calculateFactorEnhancedReturn(config)
        const enhancedVolatility = calculateFactorEnhancedVolatility(config)

        // Return should increase
        expect(enhancedReturn).toBeGreaterThan(config.baseReturn)
        // Volatility should increase (risk-return tradeoff)
        expect(enhancedVolatility).toBeGreaterThan(config.baseVolatility)
      })
    })

    it('should handle complex multi-factor portfolio', () => {
      const config = createDefaultFactorPortfolioConfig(0.07, 0.15)
      config.enabled = true
      config.factors.value.enabled = true
      config.factors.value.exposure = 0.3
      config.factors['small-cap'].enabled = true
      config.factors['small-cap'].exposure = 0.2
      config.factors.momentum.enabled = true
      config.factors.momentum.exposure = 0.5

      const enhancedReturn = calculateFactorEnhancedReturn(config)
      const enhancedVolatility = calculateFactorEnhancedVolatility(config)
      const stats = calculateFactorTiltStats(config)

      // Verify calculations are consistent
      expect(enhancedReturn).toBeGreaterThan(config.baseReturn)
      expect(enhancedVolatility).toBeGreaterThan(config.baseVolatility)
      expect(stats.activeFactorsCount).toBe(3)
      expect(stats.totalPremium).toBeGreaterThan(0)
      expect(stats.totalAdditionalRisk).toBeGreaterThan(0)
      expect(stats.enhancedSharpeRatio).toBeGreaterThan(0)
    })
  })
})
