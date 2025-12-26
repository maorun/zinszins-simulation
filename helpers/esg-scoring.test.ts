import { describe, it, expect } from 'vitest'
import {
  calculateOverallESGScore,
  meetsESGCriteria,
  getESGScore,
  getESGDescription,
  calculatePortfolioESGScore,
  filterAssetClassesByESG,
  createDefaultESGFilterConfig,
  validateESGFilterConfig,
  getESGFilterImpact,
  ASSET_CLASS_ESG_SCORES,
  type ESGFilterConfig,
  type AssetClass,
} from './esg-scoring'

describe('ESG Scoring System', () => {
  describe('calculateOverallESGScore', () => {
    it('should calculate equal-weighted ESG score', () => {
      const overall = calculateOverallESGScore(6, 7, 8)
      expect(overall).toBeCloseTo(7, 2) // (6+7+8)/3 = 7
    })

    it('should calculate custom-weighted ESG score', () => {
      const overall = calculateOverallESGScore(6, 7, 8, {
        environmental: 0.5, // 50% weight
        social: 0.25, // 25% weight
        governance: 0.25, // 25% weight
      })
      // (6*0.5 + 7*0.25 + 8*0.25) / 1.0 = 6.75
      expect(overall).toBeCloseTo(6.75, 2)
    })

    it('should handle edge case with zero weights', () => {
      const overall = calculateOverallESGScore(6, 7, 8, {
        environmental: 0,
        social: 0,
        governance: 1,
      })
      expect(overall).toBe(8)
    })

    it('should handle perfect scores', () => {
      const overall = calculateOverallESGScore(10, 10, 10)
      expect(overall).toBe(10)
    })

    it('should handle minimum scores', () => {
      const overall = calculateOverallESGScore(1, 1, 1)
      expect(overall).toBe(1)
    })
  })

  describe('ASSET_CLASS_ESG_SCORES', () => {
    it('should have scores for all asset classes', () => {
      const assetClasses: AssetClass[] = [
        'stocks_domestic',
        'stocks_international',
        'bonds_government',
        'bonds_corporate',
        'real_estate',
        'commodities',
        'cash',
      ]

      assetClasses.forEach((assetClass: AssetClass) => {
        const score = ASSET_CLASS_ESG_SCORES[assetClass]
        expect(score).toBeDefined()
        expect(score.environmental).toBeGreaterThanOrEqual(1)
        expect(score.environmental).toBeLessThanOrEqual(10)
        expect(score.social).toBeGreaterThanOrEqual(1)
        expect(score.social).toBeLessThanOrEqual(10)
        expect(score.governance).toBeGreaterThanOrEqual(1)
        expect(score.governance).toBeLessThanOrEqual(10)
        expect(score.overall).toBeGreaterThanOrEqual(1)
        expect(score.overall).toBeLessThanOrEqual(10)
      })
    })

    it('should have cash with perfect ESG scores', () => {
      const cash = ASSET_CLASS_ESG_SCORES.cash
      expect(cash.environmental).toBe(10)
      expect(cash.social).toBe(10)
      expect(cash.governance).toBe(10)
      expect(cash.overall).toBe(10)
    })

    it('should have commodities with lowest ESG scores', () => {
      const commodities = ASSET_CLASS_ESG_SCORES.commodities
      expect(commodities.overall).toBeLessThan(5)
    })

    it('should have government bonds with high governance scores', () => {
      const govBonds = ASSET_CLASS_ESG_SCORES.bonds_government
      expect(govBonds.governance).toBeGreaterThanOrEqual(8)
    })
  })

  describe('meetsESGCriteria', () => {
    const config: ESGFilterConfig = {
      enabled: true,
      minimumOverallScore: 6,
      environmentalWeight: 1 / 3,
      socialWeight: 1 / 3,
      governanceWeight: 1 / 3,
    }

    it('should return true when filter is disabled', () => {
      const disabledConfig = { ...config, enabled: false }
      expect(meetsESGCriteria('commodities', disabledConfig)).toBe(true)
    })

    it('should filter out assets below minimum overall score', () => {
      expect(meetsESGCriteria('commodities', config)).toBe(false) // Overall score 4 < 6
      expect(meetsESGCriteria('stocks_domestic', config)).toBe(true) // Overall score 7 >= 6
    })

    it('should apply environmental score threshold', () => {
      const envConfig = { ...config, minimumEnvironmentalScore: 7 }
      expect(meetsESGCriteria('stocks_domestic', envConfig)).toBe(false) // Environmental 6 < 7
      expect(meetsESGCriteria('bonds_government', envConfig)).toBe(true) // Environmental 7 >= 7
    })

    it('should apply social score threshold', () => {
      const socialConfig = { ...config, minimumSocialScore: 8 }
      expect(meetsESGCriteria('stocks_domestic', socialConfig)).toBe(false) // Social 7 < 8
      expect(meetsESGCriteria('bonds_government', socialConfig)).toBe(true) // Social 8 >= 8
    })

    it('should apply governance score threshold', () => {
      const govConfig = { ...config, minimumGovernanceScore: 9 }
      expect(meetsESGCriteria('stocks_domestic', govConfig)).toBe(false) // Governance 8 < 9
      expect(meetsESGCriteria('bonds_government', govConfig)).toBe(true) // Governance 9 >= 9
    })

    it('should require all criteria to be met', () => {
      const strictConfig: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 7,
        minimumEnvironmentalScore: 6,
        minimumSocialScore: 7,
        minimumGovernanceScore: 8,
        environmentalWeight: 1 / 3,
        socialWeight: 1 / 3,
        governanceWeight: 1 / 3,
      }
      expect(meetsESGCriteria('stocks_domestic', strictConfig)).toBe(true) // Meets all
      expect(meetsESGCriteria('stocks_international', strictConfig)).toBe(false) // Overall 6 < 7
    })

    it('should handle cash which meets all criteria', () => {
      const strictConfig: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 10,
        minimumEnvironmentalScore: 10,
        minimumSocialScore: 10,
        minimumGovernanceScore: 10,
        environmentalWeight: 1 / 3,
        socialWeight: 1 / 3,
        governanceWeight: 1 / 3,
      }
      expect(meetsESGCriteria('cash', strictConfig)).toBe(true)
    })
  })

  describe('getESGScore', () => {
    it('should return ESG score for asset class', () => {
      const score = getESGScore('stocks_domestic')
      expect(score).toEqual(ASSET_CLASS_ESG_SCORES.stocks_domestic)
    })

    it('should return all required fields', () => {
      const score = getESGScore('bonds_corporate')
      expect(score.environmental).toBeDefined()
      expect(score.social).toBeDefined()
      expect(score.governance).toBeDefined()
      expect(score.overall).toBeDefined()
    })
  })

  describe('getESGDescription', () => {
    it('should return German description for asset class', () => {
      const description = getESGDescription('stocks_domestic')
      expect(description).toBeTruthy()
      expect(description.length).toBeGreaterThan(20)
    })

    it('should have descriptions for all asset classes', () => {
      const assetClasses: AssetClass[] = [
        'stocks_domestic',
        'stocks_international',
        'bonds_government',
        'bonds_corporate',
        'real_estate',
        'commodities',
        'cash',
      ]

      assetClasses.forEach((assetClass) => {
        const description = getESGDescription(assetClass)
        expect(description).toBeTruthy()
      })
    })
  })

  describe('calculatePortfolioESGScore', () => {
    it('should calculate weighted portfolio ESG score', () => {
      const allocations: Partial<Record<AssetClass, number>> = {
        stocks_domestic: 0.6, // 60%
        bonds_government: 0.4, // 40%
      }

      const config = createDefaultESGFilterConfig()
      const portfolioScore = calculatePortfolioESGScore(allocations, config)

      // Expected: (7*0.6 + 8*0.4) = 7.4 overall
      expect(portfolioScore.overall).toBeCloseTo(7.4, 1)
    })

    it('should handle single asset portfolio', () => {
      const allocations: Partial<Record<AssetClass, number>> = {
        cash: 1.0,
      }

      const config = createDefaultESGFilterConfig()
      const portfolioScore = calculatePortfolioESGScore(allocations, config)

      expect(portfolioScore.overall).toBe(10)
      expect(portfolioScore.environmental).toBe(10)
      expect(portfolioScore.social).toBe(10)
      expect(portfolioScore.governance).toBe(10)
    })

    it('should handle empty portfolio', () => {
      const allocations: Partial<Record<AssetClass, number>> = {}

      const config = createDefaultESGFilterConfig()
      const portfolioScore = calculatePortfolioESGScore(allocations, config)

      expect(portfolioScore.overall).toBe(0)
      expect(portfolioScore.environmental).toBe(0)
      expect(portfolioScore.social).toBe(0)
      expect(portfolioScore.governance).toBe(0)
    })

    it('should apply custom weights in portfolio calculation', () => {
      const allocations: Partial<Record<AssetClass, number>> = {
        stocks_domestic: 0.5,
        bonds_government: 0.5,
      }

      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 6,
        environmentalWeight: 0.5,
        socialWeight: 0.25,
        governanceWeight: 0.25,
      }

      const portfolioScore = calculatePortfolioESGScore(allocations, config)

      // Verify custom weights are applied
      expect(portfolioScore).toBeDefined()
      expect(portfolioScore.overall).toBeGreaterThan(0)
    })

    it('should handle complex multi-asset portfolio', () => {
      const allocations: Partial<Record<AssetClass, number>> = {
        stocks_domestic: 0.3,
        stocks_international: 0.2,
        bonds_government: 0.2,
        bonds_corporate: 0.15,
        real_estate: 0.1,
        cash: 0.05,
      }

      const config = createDefaultESGFilterConfig()
      const portfolioScore = calculatePortfolioESGScore(allocations, config)

      expect(portfolioScore.overall).toBeGreaterThan(5)
      expect(portfolioScore.overall).toBeLessThan(9)
      expect(portfolioScore.environmental).toBeGreaterThan(0)
      expect(portfolioScore.social).toBeGreaterThan(0)
      expect(portfolioScore.governance).toBeGreaterThan(0)
    })

    it('should ignore zero allocations', () => {
      const allocations: Partial<Record<AssetClass, number>> = {
        stocks_domestic: 0.8,
        commodities: 0, // Zero allocation
        cash: 0.2,
      }

      const config = createDefaultESGFilterConfig()
      const portfolioScore = calculatePortfolioESGScore(allocations, config)

      // Should not be affected by commodities' low ESG score
      expect(portfolioScore.overall).toBeGreaterThan(7)
    })
  })

  describe('filterAssetClassesByESG', () => {
    const allAssets: AssetClass[] = [
      'stocks_domestic',
      'stocks_international',
      'bonds_government',
      'bonds_corporate',
      'real_estate',
      'commodities',
      'cash',
    ]

    it('should return all assets when filter is disabled', () => {
      const config = { ...createDefaultESGFilterConfig(), enabled: false }
      const filtered = filterAssetClassesByESG(allAssets, config)
      expect(filtered).toEqual(allAssets)
    })

    it('should filter out low-scoring assets', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 6,
        environmentalWeight: 1 / 3,
        socialWeight: 1 / 3,
        governanceWeight: 1 / 3,
      }

      const filtered = filterAssetClassesByESG(allAssets, config)
      expect(filtered).not.toContain('commodities') // Score 4 < 6
      expect(filtered).toContain('stocks_domestic') // Score 7 >= 6
      expect(filtered).toContain('cash') // Score 10 >= 6
    })

    it('should apply strict ESG criteria', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 8,
        environmentalWeight: 1 / 3,
        socialWeight: 1 / 3,
        governanceWeight: 1 / 3,
      }

      const filtered = filterAssetClassesByESG(allAssets, config)
      expect(filtered.length).toBeLessThan(allAssets.length)
      expect(filtered).toContain('cash') // Score 10
      expect(filtered).toContain('bonds_government') // Score 8
    })

    it('should handle empty asset list', () => {
      const config = createDefaultESGFilterConfig()
      const filtered = filterAssetClassesByESG([], config)
      expect(filtered).toEqual([])
    })

    it('should preserve order of assets', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 6,
        environmentalWeight: 1 / 3,
        socialWeight: 1 / 3,
        governanceWeight: 1 / 3,
      }

      const filtered = filterAssetClassesByESG(allAssets, config)
      const firstIndex = allAssets.indexOf(filtered[0])
      const lastIndex = allAssets.indexOf(filtered[filtered.length - 1])
      expect(firstIndex).toBeLessThan(lastIndex)
    })
  })

  describe('createDefaultESGFilterConfig', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultESGFilterConfig()

      expect(config.enabled).toBe(false)
      expect(config.minimumOverallScore).toBe(6)
      expect(config.environmentalWeight).toBeCloseTo(1 / 3, 2)
      expect(config.socialWeight).toBeCloseTo(1 / 3, 2)
      expect(config.governanceWeight).toBeCloseTo(1 / 3, 2)
    })

    it('should pass validation', () => {
      const config = createDefaultESGFilterConfig()
      const errors = validateESGFilterConfig(config)
      expect(errors).toHaveLength(0)
    })

    it('should create independent configurations', () => {
      const config1 = createDefaultESGFilterConfig()
      const config2 = createDefaultESGFilterConfig()

      config1.minimumOverallScore = 8
      expect(config2.minimumOverallScore).toBe(6)
    })
  })

  describe('validateESGFilterConfig', () => {
    it('should pass validation for valid config', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 7,
        environmentalWeight: 0.4,
        socialWeight: 0.3,
        governanceWeight: 0.3,
      }

      const errors = validateESGFilterConfig(config)
      expect(errors).toHaveLength(0)
    })

    it('should reject minimum score out of range', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 11, // Invalid: > 10
        environmentalWeight: 1 / 3,
        socialWeight: 1 / 3,
        governanceWeight: 1 / 3,
      }

      const errors = validateESGFilterConfig(config)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('1 und 10')
    })

    it('should reject weights that do not sum to 1.0', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 6,
        environmentalWeight: 0.5,
        socialWeight: 0.3,
        governanceWeight: 0.1, // Sum = 0.9, not 1.0
      }

      const errors = validateESGFilterConfig(config)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('100%'))).toBe(true)
    })

    it('should reject negative weights', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 6,
        environmentalWeight: -0.1, // Invalid
        socialWeight: 0.6,
        governanceWeight: 0.5,
      }

      const errors = validateESGFilterConfig(config)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should reject individual scores out of range', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 6,
        minimumEnvironmentalScore: 15, // Invalid
        minimumSocialScore: 0, // Invalid
        minimumGovernanceScore: -1, // Invalid
        environmentalWeight: 1 / 3,
        socialWeight: 1 / 3,
        governanceWeight: 1 / 3,
      }

      const errors = validateESGFilterConfig(config)
      expect(errors.length).toBeGreaterThan(0)
    })

    it('should accept optional individual thresholds', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 6,
        minimumEnvironmentalScore: undefined,
        minimumSocialScore: undefined,
        minimumGovernanceScore: undefined,
        environmentalWeight: 1 / 3,
        socialWeight: 1 / 3,
        governanceWeight: 1 / 3,
      }

      const errors = validateESGFilterConfig(config)
      expect(errors).toHaveLength(0)
    })
  })

  describe('getESGFilterImpact', () => {
    const allAssets: AssetClass[] = [
      'stocks_domestic',
      'stocks_international',
      'bonds_government',
      'commodities',
      'cash',
    ]

    it('should identify excluded assets', () => {
      const afterFilter: AssetClass[] = ['stocks_domestic', 'bonds_government', 'cash']

      const impact = getESGFilterImpact(allAssets, afterFilter)

      expect(impact.excluded).toContain('stocks_international')
      expect(impact.excluded).toContain('commodities')
      expect(impact.exclusionCount).toBe(2)
    })

    it('should identify included assets', () => {
      const afterFilter: AssetClass[] = ['stocks_domestic', 'cash']

      const impact = getESGFilterImpact(allAssets, afterFilter)

      expect(impact.included).toEqual(afterFilter)
      expect(impact.included).toContain('stocks_domestic')
      expect(impact.included).toContain('cash')
    })

    it('should handle no exclusions', () => {
      const impact = getESGFilterImpact(allAssets, allAssets)

      expect(impact.excluded).toHaveLength(0)
      expect(impact.exclusionCount).toBe(0)
      expect(impact.included).toEqual(allAssets)
    })

    it('should handle all exclusions', () => {
      const afterFilter: AssetClass[] = []

      const impact = getESGFilterImpact(allAssets, afterFilter)

      expect(impact.excluded).toEqual(allAssets)
      expect(impact.exclusionCount).toBe(allAssets.length)
      expect(impact.included).toHaveLength(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should support conservative ESG investor', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 8,
        environmentalWeight: 0.4,
        socialWeight: 0.3,
        governanceWeight: 0.3,
      }

      const allAssets: AssetClass[] = [
        'stocks_domestic',
        'stocks_international',
        'bonds_government',
        'bonds_corporate',
        'real_estate',
        'commodities',
        'cash',
      ]

      const filtered = filterAssetClassesByESG(allAssets, config)

      expect(filtered).toContain('cash')
      expect(filtered).toContain('bonds_government')
      expect(filtered).not.toContain('commodities')

      // Calculate portfolio score
      const allocations: Partial<Record<AssetClass, number>> = {}
      filtered.forEach((asset) => {
        allocations[asset] = 1 / filtered.length
      })

      const portfolioScore = calculatePortfolioESGScore(allocations, config)
      expect(portfolioScore.overall).toBeGreaterThanOrEqual(8)
    })

    it('should support balanced ESG investor', () => {
      const config: ESGFilterConfig = {
        enabled: true,
        minimumOverallScore: 6,
        environmentalWeight: 1 / 3,
        socialWeight: 1 / 3,
        governanceWeight: 1 / 3,
      }

      const allAssets: AssetClass[] = [
        'stocks_domestic',
        'stocks_international',
        'bonds_government',
        'bonds_corporate',
        'commodities',
        'cash',
      ]

      const filtered = filterAssetClassesByESG(allAssets, config)

      expect(filtered.length).toBeGreaterThan(3) // Should allow decent diversification
      expect(filtered).not.toContain('commodities') // Low ESG score
    })

    it('should show ESG trade-offs', () => {
      const noFilterConfig = createDefaultESGFilterConfig()
      const strictFilterConfig: ESGFilterConfig = {
        ...noFilterConfig,
        enabled: true,
        minimumOverallScore: 8,
      }

      const allAssets: AssetClass[] = ['stocks_domestic', 'bonds_government', 'commodities', 'cash']

      const noFilter = filterAssetClassesByESG(allAssets, noFilterConfig)
      const strictFilter = filterAssetClassesByESG(allAssets, strictFilterConfig)

      const impact = getESGFilterImpact(noFilter, strictFilter)

      expect(impact.exclusionCount).toBeGreaterThan(0)
      expect(strictFilter.length).toBeLessThan(noFilter.length)
    })
  })
})
