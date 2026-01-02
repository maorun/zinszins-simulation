/**
 * Tests for Geographic Diversification Module
 */

import { describe, it, expect } from 'vitest'
import {
  type GeographicRegion,
  DEFAULT_GEOGRAPHIC_REGIONS,
  createDefaultGeographicDiversificationConfig,
  validateGeographicDiversificationConfig,
  normalizeGeographicAllocations,
  calculateGeographicPortfolioReturn,
  calculateGeographicPortfolioVolatility,
  calculateGeographicWithholdingTax,
  getRegionCountryInfo,
  getAllGeographicRegions,
  getGeographicRegionName,
} from './geographic-diversification'

describe('Geographic Diversification', () => {
  describe('DEFAULT_GEOGRAPHIC_REGIONS', () => {
    it('should have all four regions defined', () => {
      expect(DEFAULT_GEOGRAPHIC_REGIONS).toHaveProperty('north_america')
      expect(DEFAULT_GEOGRAPHIC_REGIONS).toHaveProperty('europe')
      expect(DEFAULT_GEOGRAPHIC_REGIONS).toHaveProperty('asia_pacific')
      expect(DEFAULT_GEOGRAPHIC_REGIONS).toHaveProperty('emerging_markets')
    })

    it('should have valid return expectations', () => {
      Object.values(DEFAULT_GEOGRAPHIC_REGIONS).forEach((region) => {
        expect(region.expectedReturn).toBeGreaterThan(0)
        expect(region.expectedReturn).toBeLessThanOrEqual(0.15) // Max 15% return
      })
    })

    it('should have valid volatility values', () => {
      Object.values(DEFAULT_GEOGRAPHIC_REGIONS).forEach((region) => {
        expect(region.volatility).toBeGreaterThanOrEqual(0)
        expect(region.volatility).toBeLessThanOrEqual(0.5) // Max 50% volatility
      })
    })

    it('should have valid withholding tax rates', () => {
      Object.values(DEFAULT_GEOGRAPHIC_REGIONS).forEach((region) => {
        expect(region.withholdingTaxRate).toBeGreaterThanOrEqual(0)
        expect(region.withholdingTaxRate).toBeLessThanOrEqual(0.35) // Max 35%
      })
    })

    it('should have valid dividend yields', () => {
      Object.values(DEFAULT_GEOGRAPHIC_REGIONS).forEach((region) => {
        expect(region.dividendYield).toBeGreaterThanOrEqual(0)
        expect(region.dividendYield).toBeLessThanOrEqual(0.05) // Max 5% dividend yield
      })
    })

    it('should have enabled regions sum to 1.0', () => {
      const enabledRegions = Object.values(DEFAULT_GEOGRAPHIC_REGIONS).filter(
        (r) => r.enabled,
      )
      const total = enabledRegions.reduce(
        (sum, region) => sum + region.targetAllocation,
        0,
      )
      expect(total).toBeCloseTo(1.0, 2)
    })
  })

  describe('createDefaultGeographicDiversificationConfig', () => {
    it('should create a valid default configuration', () => {
      const config = createDefaultGeographicDiversificationConfig()

      expect(config.enabled).toBe(false)
      expect(config.automaticWithholdingTaxCalculation).toBe(true)
      expect(config.regions).toBeDefined()
      expect(Object.keys(config.regions)).toHaveLength(4)
    })

    it('should have independent region objects', () => {
      const config = createDefaultGeographicDiversificationConfig()

      // Modify one region
      config.regions.north_america.targetAllocation = 0.8

      // Default should remain unchanged
      expect(DEFAULT_GEOGRAPHIC_REGIONS.north_america.targetAllocation).toBe(0.55)
    })
  })

  describe('validateGeographicDiversificationConfig', () => {
    it('should pass validation for default config when enabled', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true

      const errors = validateGeographicDiversificationConfig(config)

      expect(errors).toHaveLength(0)
    })

    it('should pass validation when disabled', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = false
      config.regions.north_america.targetAllocation = 999 // Invalid, but ignored when disabled

      const errors = validateGeographicDiversificationConfig(config)

      expect(errors).toHaveLength(0)
    })

    it('should fail if no regions are enabled', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true

      // Disable all regions
      Object.keys(config.regions).forEach((key) => {
        config.regions[key as GeographicRegion].enabled = false
      })

      const errors = validateGeographicDiversificationConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('Mindestens eine geografische Region')
    })

    it('should fail if allocations do not sum to 1.0', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      // Keep europe and asia_pacific enabled to ensure at least one region is enabled
      config.regions.north_america.targetAllocation = 0.6
      config.regions.europe.targetAllocation = 0.6 // Total > 1.0

      const errors = validateGeographicDiversificationConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('100%')
    })

    it('should fail if allocation is negative', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      // Ensure other regions compensate
      config.regions.north_america.targetAllocation = -0.1
      config.regions.europe.targetAllocation = 0.6
      config.regions.asia_pacific.targetAllocation = 0.5

      const errors = validateGeographicDiversificationConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Allokation'))).toBe(true)
    })

    it('should fail if expected return is out of range', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      config.regions.north_america.expectedReturn = 2.0 // 200% return

      const errors = validateGeographicDiversificationConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Erwartete Rendite'))).toBe(true)
    })

    it('should fail if volatility is out of range', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      config.regions.north_america.volatility = 3.0 // 300% volatility

      const errors = validateGeographicDiversificationConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Volatilität'))).toBe(true)
    })

    it('should fail if withholding tax rate is out of range', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      config.regions.north_america.withholdingTaxRate = 1.5 // 150%

      const errors = validateGeographicDiversificationConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Quellensteuersatz'))).toBe(true)
    })

    it('should fail if dividend yield is out of range', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      config.regions.north_america.dividendYield = 0.3 // 30% dividend yield

      const errors = validateGeographicDiversificationConfig(config)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Dividendenrendite'))).toBe(true)
    })
  })

  describe('normalizeGeographicAllocations', () => {
    it('should normalize allocations to sum to 1.0', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      // All three enabled regions get non-standard allocations
      config.regions.north_america.targetAllocation = 0.6
      config.regions.europe.targetAllocation = 0.6
      config.regions.asia_pacific.targetAllocation = 0.3

      const normalized = normalizeGeographicAllocations(config)

      const enabledRegions = Object.values(normalized.regions).filter(
        (r) => r.enabled,
      )
      const total = enabledRegions.reduce(
        (sum, region) => sum + region.targetAllocation,
        0,
      )

      expect(total).toBeCloseTo(1.0, 10)
    })

    it('should distribute equally if all allocations are zero', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      config.regions.north_america.targetAllocation = 0
      config.regions.europe.targetAllocation = 0
      config.regions.asia_pacific.targetAllocation = 0

      const normalized = normalizeGeographicAllocations(config)

      const enabledRegions = Object.values(normalized.regions).filter(
        (r) => r.enabled,
      )

      enabledRegions.forEach((region) => {
        expect(region.targetAllocation).toBeCloseTo(
          1.0 / enabledRegions.length,
          10,
        )
      })
    })

    it('should not modify disabled config', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = false
      config.regions.north_america.targetAllocation = 0.6

      const normalized = normalizeGeographicAllocations(config)

      expect(normalized.regions.north_america.targetAllocation).toBe(0.6)
    })

    it('should only normalize enabled regions', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      config.regions.north_america.enabled = true
      config.regions.north_america.targetAllocation = 0.5
      config.regions.europe.enabled = true
      config.regions.europe.targetAllocation = 0.5
      config.regions.asia_pacific.enabled = false
      config.regions.asia_pacific.targetAllocation = 0.5 // Should be ignored
      config.regions.emerging_markets.enabled = false

      const normalized = normalizeGeographicAllocations(config)

      expect(normalized.regions.north_america.targetAllocation).toBeCloseTo(
        0.5,
        10,
      )
      expect(normalized.regions.europe.targetAllocation).toBeCloseTo(0.5, 10)
      // Disabled regions should not be affected
      expect(normalized.regions.asia_pacific.targetAllocation).toBe(0.5)
    })
  })

  describe('calculateGeographicPortfolioReturn', () => {
    it('should calculate weighted portfolio return', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true

      const expectedReturn = calculateGeographicPortfolioReturn(config)

      // Calculate manually
      const enabledRegions = Object.values(config.regions).filter(
        (r) => r.enabled,
      )
      const manualReturn = enabledRegions.reduce(
        (sum, r) => sum + r.expectedReturn * r.targetAllocation,
        0,
      )

      expect(expectedReturn).toBeCloseTo(manualReturn, 10)
    })

    it('should return 0 when disabled', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = false

      const expectedReturn = calculateGeographicPortfolioReturn(config)

      expect(expectedReturn).toBe(0)
    })

    it('should return 0 when no regions are enabled', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true

      Object.keys(config.regions).forEach((key) => {
        config.regions[key as GeographicRegion].enabled = false
      })

      const expectedReturn = calculateGeographicPortfolioReturn(config)

      expect(expectedReturn).toBe(0)
    })

    it('should handle 100% allocation to one region', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      config.regions.north_america.enabled = true
      config.regions.north_america.targetAllocation = 1.0
      config.regions.europe.enabled = false
      config.regions.asia_pacific.enabled = false
      config.regions.emerging_markets.enabled = false

      const expectedReturn = calculateGeographicPortfolioReturn(config)

      expect(expectedReturn).toBeCloseTo(
        config.regions.north_america.expectedReturn,
        10,
      )
    })
  })

  describe('calculateGeographicPortfolioVolatility', () => {
    it('should calculate weighted portfolio volatility', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true

      const volatility = calculateGeographicPortfolioVolatility(config)

      // Calculate manually
      const enabledRegions = Object.values(config.regions).filter(
        (r) => r.enabled,
      )
      const manualVolatility = enabledRegions.reduce(
        (sum, r) => sum + r.volatility * r.targetAllocation,
        0,
      )

      expect(volatility).toBeCloseTo(manualVolatility, 10)
    })

    it('should return 0 when disabled', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = false

      const volatility = calculateGeographicPortfolioVolatility(config)

      expect(volatility).toBe(0)
    })

    it('should return 0 when no regions are enabled', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true

      Object.keys(config.regions).forEach((key) => {
        config.regions[key as GeographicRegion].enabled = false
      })

      const volatility = calculateGeographicPortfolioVolatility(config)

      expect(volatility).toBe(0)
    })
  })

  describe('calculateGeographicWithholdingTax', () => {
    const GERMAN_TAX_RATE = 0.26375 // 26.375%
    const TEILFREISTELLUNG = 0.3 // 30% for equity funds

    it('should calculate withholding tax for enabled regions', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true

      const internationalHoldings = 100000 // 100,000 EUR

      const result = calculateGeographicWithholdingTax(
        internationalHoldings,
        config,
        GERMAN_TAX_RATE,
        TEILFREISTELLUNG,
      )

      expect(result.totalWithholdingTaxPaid).toBeGreaterThan(0)
      expect(result.totalCreditableAmount).toBeGreaterThan(0)
      expect(result.regionalBreakdown.length).toBeGreaterThan(0)

      // Verify breakdown sums match totals
      const sumWithholdingTax = result.regionalBreakdown.reduce(
        (sum, r) => sum + r.withholdingTaxPaid,
        0,
      )
      expect(sumWithholdingTax).toBeCloseTo(
        result.totalWithholdingTaxPaid,
        10,
      )
    })

    it('should return zero when disabled', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = false

      const result = calculateGeographicWithholdingTax(
        100000,
        config,
        GERMAN_TAX_RATE,
        TEILFREISTELLUNG,
      )

      expect(result.totalWithholdingTaxPaid).toBe(0)
      expect(result.totalCreditableAmount).toBe(0)
      expect(result.regionalBreakdown).toHaveLength(0)
    })

    it('should limit credit to German tax due', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true

      // Set very high withholding tax rate
      config.regions.north_america.withholdingTaxRate = 0.5 // 50%
      config.regions.north_america.enabled = true
      config.regions.north_america.targetAllocation = 1.0
      config.regions.europe.enabled = false
      config.regions.asia_pacific.enabled = false
      config.regions.emerging_markets.enabled = false

      const result = calculateGeographicWithholdingTax(
        100000,
        config,
        GERMAN_TAX_RATE,
        TEILFREISTELLUNG,
      )

      // Credit should be limited to German tax due
      const breakdown = result.regionalBreakdown[0]
      expect(breakdown.creditableAmount).toBeLessThan(
        breakdown.withholdingTaxPaid,
      )

      // German tax due calculation
      const taxableDividendIncome =
        breakdown.dividendIncome * (1 - TEILFREISTELLUNG)
      const germanTaxDue = taxableDividendIncome * GERMAN_TAX_RATE

      expect(breakdown.creditableAmount).toBeCloseTo(germanTaxDue, 2)
    })

    it('should handle zero international holdings', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true

      const result = calculateGeographicWithholdingTax(
        0,
        config,
        GERMAN_TAX_RATE,
        TEILFREISTELLUNG,
      )

      expect(result.totalWithholdingTaxPaid).toBe(0)
      expect(result.totalCreditableAmount).toBe(0)
    })

    it('should calculate correctly with Teilfreistellung', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true
      config.regions.north_america.enabled = true
      config.regions.north_america.targetAllocation = 1.0
      config.regions.europe.enabled = false
      config.regions.asia_pacific.enabled = false
      config.regions.emerging_markets.enabled = false

      const internationalHoldings = 100000

      const result = calculateGeographicWithholdingTax(
        internationalHoldings,
        config,
        GERMAN_TAX_RATE,
        TEILFREISTELLUNG,
      )

      const breakdown = result.regionalBreakdown[0]

      // Calculate expected values
      const dividendIncome =
        internationalHoldings * config.regions.north_america.dividendYield
      const withholdingTaxPaid =
        dividendIncome * config.regions.north_america.withholdingTaxRate
      const taxableDividendIncome = dividendIncome * (1 - TEILFREISTELLUNG)
      const germanTaxDue = taxableDividendIncome * GERMAN_TAX_RATE

      expect(breakdown.dividendIncome).toBeCloseTo(dividendIncome, 2)
      expect(breakdown.withholdingTaxPaid).toBeCloseTo(withholdingTaxPaid, 2)
      expect(breakdown.creditableAmount).toBeCloseTo(
        Math.min(withholdingTaxPaid, germanTaxDue),
        2,
      )
    })

    it('should allocate holdings proportionally across regions', () => {
      const config = createDefaultGeographicDiversificationConfig()
      config.enabled = true

      const internationalHoldings = 100000

      const result = calculateGeographicWithholdingTax(
        internationalHoldings,
        config,
        GERMAN_TAX_RATE,
        TEILFREISTELLUNG,
      )

      // Verify each region's holdings match its allocation
      result.regionalBreakdown.forEach((breakdown) => {
        const region = config.regions[breakdown.region]
        const expectedHoldings = internationalHoldings * region.targetAllocation

        expect(breakdown.holdingsValue).toBeCloseTo(expectedHoldings, 2)
      })
    })
  })

  describe('getRegionCountryInfo', () => {
    it('should return country info for North America', () => {
      const countries = getRegionCountryInfo('north_america')

      expect(countries.length).toBeGreaterThan(0)
      expect(countries.some((c) => c.countryCode === 'US')).toBe(true)
    })

    it('should return country info for Europe', () => {
      const countries = getRegionCountryInfo('europe')

      expect(countries.length).toBeGreaterThan(0)
      expect(countries.some((c) => c.countryCode === 'GB')).toBe(true)
    })

    it('should return country info for Asia-Pacific', () => {
      const countries = getRegionCountryInfo('asia_pacific')

      expect(countries.length).toBeGreaterThan(0)
      expect(countries.some((c) => c.countryCode === 'JP')).toBe(true)
    })

    it('should return country info for Emerging Markets', () => {
      const countries = getRegionCountryInfo('emerging_markets')

      // Emerging markets may have limited DBA data in COMMON_WITHHOLDING_TAX_RATES
      expect(Array.isArray(countries)).toBe(true)
    })
  })

  describe('getAllGeographicRegions', () => {
    it('should return all four regions', () => {
      const regions = getAllGeographicRegions()

      expect(regions).toHaveLength(4)
      expect(regions).toContain('north_america')
      expect(regions).toContain('europe')
      expect(regions).toContain('asia_pacific')
      expect(regions).toContain('emerging_markets')
    })
  })

  describe('getGeographicRegionName', () => {
    it('should return correct names for all regions', () => {
      expect(getGeographicRegionName('north_america')).toBe('Nordamerika')
      expect(getGeographicRegionName('europe')).toBe('Europa (ex-Deutschland)')
      expect(getGeographicRegionName('asia_pacific')).toBe('Asien-Pazifik')
      expect(getGeographicRegionName('emerging_markets')).toBe('Schwellenländer')
    })
  })
})
