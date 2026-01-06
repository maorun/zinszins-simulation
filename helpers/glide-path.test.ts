/**
 * Tests for glide path (Gleitpfad) calculations
 */

import { describe, it, expect } from 'vitest'
import {
  createDefaultGlidePathConfig,
  calculateGermanFormulaAllocation,
  calculateEquityAllocation,
  applyGlidePath,
  validateGlidePathConfig,
  getGlidePathCurveDescription,
  type GlidePathConfig,
} from './glide-path'
import { DEFAULT_ASSET_CLASSES, type AssetClass, type AssetClassConfig } from './multi-asset-portfolio'

describe('glide-path', () => {
  describe('createDefaultGlidePathConfig', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultGlidePathConfig()

      expect(config.enabled).toBe(false)
      expect(config.startEquityAllocation).toBe(0.9)
      expect(config.targetEquityAllocation).toBe(0.3)
      expect(config.startAge).toBe(25)
      expect(config.targetAge).toBe(67)
      expect(config.curve).toBe('linear')
      expect(config.useGermanFormula).toBe(false)
      expect(config.formulaOffset).toBe(100)
    })

    it('should pass validation', () => {
      const config = createDefaultGlidePathConfig()
      const errors = validateGlidePathConfig(config)

      expect(errors).toHaveLength(0)
    })
  })

  describe('calculateGermanFormulaAllocation', () => {
    it('should calculate correct allocation using German formula', () => {
      // Standard formula: 100 - age
      expect(calculateGermanFormulaAllocation(25)).toBeCloseTo(0.75) // 75% at age 25
      expect(calculateGermanFormulaAllocation(40)).toBeCloseTo(0.6) // 60% at age 40
      expect(calculateGermanFormulaAllocation(50)).toBeCloseTo(0.5) // 50% at age 50
      expect(calculateGermanFormulaAllocation(67)).toBeCloseTo(0.33) // 33% at age 67
      expect(calculateGermanFormulaAllocation(80)).toBeCloseTo(0.2) // 20% at age 80
    })

    it('should handle custom offset', () => {
      // Conservative formula: 90 - age
      expect(calculateGermanFormulaAllocation(25, 90)).toBeCloseTo(0.65) // 65% at age 25
      expect(calculateGermanFormulaAllocation(40, 90)).toBeCloseTo(0.5) // 50% at age 40
      expect(calculateGermanFormulaAllocation(67, 90)).toBeCloseTo(0.23) // 23% at age 67

      // Aggressive formula: 110 - age
      expect(calculateGermanFormulaAllocation(25, 110)).toBeCloseTo(0.85) // 85% at age 25
      expect(calculateGermanFormulaAllocation(40, 110)).toBeCloseTo(0.7) // 70% at age 40
      expect(calculateGermanFormulaAllocation(67, 110)).toBeCloseTo(0.43) // 43% at age 67
    })

    it('should cap allocation at 0% and 100%', () => {
      expect(calculateGermanFormulaAllocation(100)).toBe(0) // Can't go below 0%
      expect(calculateGermanFormulaAllocation(110)).toBe(0) // Can't go below 0%
      expect(calculateGermanFormulaAllocation(18, 120)).toBe(1) // Cap at 100%
      expect(calculateGermanFormulaAllocation(10, 120)).toBe(1) // Cap at 100%
    })
  })

  describe('calculateEquityAllocation', () => {
    it('should calculate linear glide path correctly', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        startAge: 25,
        targetAge: 67, // 42 years
        startEquityAllocation: 0.9,
        targetEquityAllocation: 0.3,
        curve: 'linear',
      }

      // At start age: 90%
      expect(calculateEquityAllocation(config, 25)).toBeCloseTo(0.9)

      // At midpoint (age 46): should be 60% (halfway between 90% and 30%)
      expect(calculateEquityAllocation(config, 46)).toBeCloseTo(0.6)

      // At target age: 30%
      expect(calculateEquityAllocation(config, 67)).toBeCloseTo(0.3)

      // Beyond target age: stays at 30%
      expect(calculateEquityAllocation(config, 80)).toBeCloseTo(0.3)

      // Before start age: stays at 90%
      expect(calculateEquityAllocation(config, 20)).toBeCloseTo(0.9)
    })

    it('should calculate convex glide path correctly', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        startAge: 25,
        targetAge: 67,
        startEquityAllocation: 0.9,
        targetEquityAllocation: 0.3,
        curve: 'convex', // Faster adjustment early
      }

      const age40 = calculateEquityAllocation(config, 40) // 15 of 42 years
      const age46 = calculateEquityAllocation(config, 46) // 21 of 42 years (midpoint)

      // With convex curve, should adjust more quickly early
      // At midpoint, should be below 60% (linear midpoint)
      expect(age46).toBeLessThan(0.6)

      // Should be continuously decreasing
      expect(age40).toBeGreaterThan(age46)
    })

    it('should calculate concave glide path correctly', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        startAge: 25,
        targetAge: 67,
        startEquityAllocation: 0.9,
        targetEquityAllocation: 0.3,
        curve: 'concave', // Slower adjustment early
      }

      const age40 = calculateEquityAllocation(config, 40)
      const age46 = calculateEquityAllocation(config, 46) // midpoint

      // With concave curve, should adjust more slowly early
      // At midpoint, should be above 60% (linear midpoint)
      expect(age46).toBeGreaterThan(0.6)

      // Should be continuously decreasing
      expect(age40).toBeGreaterThan(age46)
    })

    it('should use German formula when enabled', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        useGermanFormula: true,
        formulaOffset: 100,
      }

      expect(calculateEquityAllocation(config, 25)).toBeCloseTo(0.75)
      expect(calculateEquityAllocation(config, 50)).toBeCloseTo(0.5)
      expect(calculateEquityAllocation(config, 67)).toBeCloseTo(0.33)
    })
  })

  describe('applyGlidePath', () => {
    const createTestAssetClasses = (): Record<AssetClass, AssetClassConfig> => ({
      ...DEFAULT_ASSET_CLASSES,
      stocks_domestic: {
        ...DEFAULT_ASSET_CLASSES.stocks_domestic,
        enabled: true,
        targetAllocation: 0.5,
      },
      stocks_international: {
        ...DEFAULT_ASSET_CLASSES.stocks_international,
        enabled: true,
        targetAllocation: 0.3,
      },
      bonds_government: {
        ...DEFAULT_ASSET_CLASSES.bonds_government,
        enabled: true,
        targetAllocation: 0.2,
      },
      bonds_corporate: {
        ...DEFAULT_ASSET_CLASSES.bonds_corporate,
        enabled: false,
      },
      real_estate: {
        ...DEFAULT_ASSET_CLASSES.real_estate,
        enabled: false,
      },
      commodities: {
        ...DEFAULT_ASSET_CLASSES.commodities,
        enabled: false,
      },
      cash: {
        ...DEFAULT_ASSET_CLASSES.cash,
        enabled: false,
      },
    })

    it('should return original allocations when disabled', () => {
      const config = createDefaultGlidePathConfig() // disabled by default
      const assetClasses = createTestAssetClasses()

      const result = applyGlidePath(config, assetClasses, 40)

      expect(result.wasAdjusted).toBe(false)
      expect(result.adjustedAllocations.stocks_domestic).toBeCloseTo(0.5)
      expect(result.adjustedAllocations.stocks_international).toBeCloseTo(0.3)
      expect(result.adjustedAllocations.bonds_government).toBeCloseTo(0.2)
      expect(result.explanation).toContain('deaktiviert')
    })

    it('should adjust allocations based on age', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        enabled: true,
        startAge: 25,
        targetAge: 67,
        startEquityAllocation: 0.8,
        targetEquityAllocation: 0.3,
        curve: 'linear',
      }
      const assetClasses = createTestAssetClasses()

      // At age 40 (15 of 42 years)
      const result = applyGlidePath(config, assetClasses, 40)

      expect(result.wasAdjusted).toBe(true)
      expect(result.currentAge).toBe(40)
      expect(result.yearsToRetirement).toBe(27)

      // Linear progress: 15/42 ≈ 0.357
      // Equity at age 40: 0.8 - (0.8 - 0.3) * 0.357 ≈ 0.621
      expect(result.equityAllocation).toBeCloseTo(0.621, 2)

      // Total equity should match target equity allocation
      const totalEquity =
        result.adjustedAllocations.stocks_domestic + result.adjustedAllocations.stocks_international
      expect(totalEquity).toBeCloseTo(result.equityAllocation, 2)

      // Total bonds should match target bond allocation
      const totalBonds = result.adjustedAllocations.bonds_government
      expect(totalBonds).toBeCloseTo(result.bondAllocation, 2)

      // All allocations should sum to 1
      const totalAllocation = totalEquity + totalBonds
      expect(totalAllocation).toBeCloseTo(1, 2)
    })

    it('should maintain proportions among equity assets', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        enabled: true,
        startAge: 25,
        targetAge: 67,
        startEquityAllocation: 0.8,
        targetEquityAllocation: 0.4,
      }
      const assetClasses = createTestAssetClasses()

      // Original equity split: 50% / 30% = 5:3 ratio
      const result = applyGlidePath(config, assetClasses, 46) // midpoint

      const domesticRatio =
        result.adjustedAllocations.stocks_domestic /
        (result.adjustedAllocations.stocks_domestic + result.adjustedAllocations.stocks_international)
      const internationalRatio =
        result.adjustedAllocations.stocks_international /
        (result.adjustedAllocations.stocks_domestic + result.adjustedAllocations.stocks_international)

      // Should maintain original 5:3 ratio = 62.5% : 37.5%
      expect(domesticRatio).toBeCloseTo(0.625, 2)
      expect(internationalRatio).toBeCloseTo(0.375, 2)
    })

    it('should create cash allocation if no bonds exist', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        enabled: true,
        startAge: 30,
        targetAge: 70,
        startEquityAllocation: 0.8, // 80% at start
        targetEquityAllocation: 0.2, // 20% at end
      }

      const assetClasses: Record<AssetClass, AssetClassConfig> = {
        ...DEFAULT_ASSET_CLASSES,
        stocks_domestic: {
          ...DEFAULT_ASSET_CLASSES.stocks_domestic,
          enabled: true,
          targetAllocation: 1.0, // 100% equity
        },
        stocks_international: {
          ...DEFAULT_ASSET_CLASSES.stocks_international,
          enabled: false,
        },
        bonds_government: {
          ...DEFAULT_ASSET_CLASSES.bonds_government,
          enabled: false, // No bonds
        },
        bonds_corporate: {
          ...DEFAULT_ASSET_CLASSES.bonds_corporate,
          enabled: false,
        },
        real_estate: {
          ...DEFAULT_ASSET_CLASSES.real_estate,
          enabled: false,
        },
        commodities: {
          ...DEFAULT_ASSET_CLASSES.commodities,
          enabled: false,
        },
        cash: {
          ...DEFAULT_ASSET_CLASSES.cash,
          enabled: false,
        },
      }

      // At age 50 (midpoint between 30 and 70), should be at 50% equity
      const result = applyGlidePath(config, assetClasses, 50)

      // Should create cash allocation for missing bonds
      // At age 50: (80% - 20%) * 0.5 = 30% reduction, so 50% equity, 50% bonds
      expect(result.adjustedAllocations.cash).toBeCloseTo(0.5)
      expect(result.adjustedAllocations.stocks_domestic).toBeCloseTo(0.5)
    })

    it('should include REITs as equity-like assets', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        enabled: true,
        startEquityAllocation: 0.8,
        targetEquityAllocation: 0.4,
      }

      const assetClasses: Record<AssetClass, AssetClassConfig> = {
        ...DEFAULT_ASSET_CLASSES,
        stocks_domestic: {
          ...DEFAULT_ASSET_CLASSES.stocks_domestic,
          enabled: true,
          targetAllocation: 0.4,
        },
        real_estate: {
          ...DEFAULT_ASSET_CLASSES.real_estate,
          enabled: true,
          targetAllocation: 0.2, // REITs count as equity
        },
        bonds_government: {
          ...DEFAULT_ASSET_CLASSES.bonds_government,
          enabled: true,
          targetAllocation: 0.4,
        },
        stocks_international: {
          ...DEFAULT_ASSET_CLASSES.stocks_international,
          enabled: false,
        },
        bonds_corporate: {
          ...DEFAULT_ASSET_CLASSES.bonds_corporate,
          enabled: false,
        },
        commodities: {
          ...DEFAULT_ASSET_CLASSES.commodities,
          enabled: false,
        },
        cash: {
          ...DEFAULT_ASSET_CLASSES.cash,
          enabled: false,
        },
      }

      const result = applyGlidePath(config, assetClasses, 46) // midpoint

      // Total equity (including REITs) should match target
      const totalEquity = result.adjustedAllocations.stocks_domestic + result.adjustedAllocations.real_estate
      expect(totalEquity).toBeCloseTo(result.equityAllocation, 2)
    })

    it('should generate German explanation', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        enabled: true,
        startAge: 30,
        targetAge: 67,
      }
      const assetClasses = createTestAssetClasses()

      const result = applyGlidePath(config, assetClasses, 45)

      expect(result.explanation).toContain('Gleitpfad aktiv')
      expect(result.explanation).toContain('Alter 45')
      expect(result.explanation).toContain('Aktien')
      expect(result.explanation).toContain('Anleihen')
      expect(result.explanation).toContain('Jahre bis Rente')
    })

    it('should handle German formula in explanation', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        enabled: true,
        useGermanFormula: true,
        formulaOffset: 100,
      }
      const assetClasses = createTestAssetClasses()

      const result = applyGlidePath(config, assetClasses, 50)

      expect(result.explanation).toContain('Lebensalter-Faustformel')
      expect(result.explanation).toContain('100 - Alter')
    })
  })

  describe('validateGlidePathConfig', () => {
    it('should validate correct configuration', () => {
      const config = createDefaultGlidePathConfig()
      const errors = validateGlidePathConfig(config)

      expect(errors).toHaveLength(0)
    })

    it('should reject age below 18', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        startAge: 16,
      }
      const errors = validateGlidePathConfig(config)

      expect(errors).toContain('Startalter muss mindestens 18 Jahre sein')
    })

    it('should reject age above 100', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        targetAge: 105,
      }
      const errors = validateGlidePathConfig(config)

      expect(errors).toContain('Zielalter darf maximal 100 Jahre sein')
    })

    it('should reject start age >= target age', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        startAge: 67,
        targetAge: 67,
      }
      const errors = validateGlidePathConfig(config)

      expect(errors).toContain('Startalter muss kleiner als Zielalter sein')
    })

    it('should reject invalid allocations', () => {
      const config1: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        startEquityAllocation: 1.5,
      }
      const errors1 = validateGlidePathConfig(config1)
      expect(errors1).toContain('Start-Aktienquote muss zwischen 0% und 100% liegen')

      const config2: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        targetEquityAllocation: -0.1,
      }
      const errors2 = validateGlidePathConfig(config2)
      expect(errors2).toContain('Ziel-Aktienquote muss zwischen 0% und 100% liegen')
    })

    it('should reject start allocation <= target allocation', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        startEquityAllocation: 0.3,
        targetEquityAllocation: 0.5,
      }
      const errors = validateGlidePathConfig(config)

      expect(errors).toContain('Start-Aktienquote sollte höher als Ziel-Aktienquote sein')
    })

    it('should reject invalid formula offset', () => {
      const config1: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        useGermanFormula: true,
        formulaOffset: 30,
      }
      const errors1 = validateGlidePathConfig(config1)
      expect(errors1).toContain('Formel-Offset sollte zwischen 50 und 120 liegen')

      const config2: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        useGermanFormula: true,
        formulaOffset: 150,
      }
      const errors2 = validateGlidePathConfig(config2)
      expect(errors2).toContain('Formel-Offset sollte zwischen 50 und 120 liegen')
    })

    it('should allow formula offset outside range when not using German formula', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        useGermanFormula: false,
        formulaOffset: 30, // Invalid for German formula, but not used
      }
      const errors = validateGlidePathConfig(config)

      expect(errors).toHaveLength(0)
    })
  })

  describe('getGlidePathCurveDescription', () => {
    it('should return description for linear curve', () => {
      const description = getGlidePathCurveDescription('linear')
      expect(description).toContain('Lineare')
      expect(description).toContain('Gleichmäßige')
    })

    it('should return description for convex curve', () => {
      const description = getGlidePathCurveDescription('convex')
      expect(description).toContain('Konvexe')
      expect(description).toContain('Schnelle')
      expect(description).toContain('Vorsichtig')
    })

    it('should return description for concave curve', () => {
      const description = getGlidePathCurveDescription('concave')
      expect(description).toContain('Konkave')
      expect(description).toContain('Langsame')
      expect(description).toContain('Aggressiv')
    })
  })

  describe('edge cases', () => {
    it('should handle progress exactly at boundaries', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        enabled: true,
        startAge: 30,
        targetAge: 60,
        startEquityAllocation: 0.8,
        targetEquityAllocation: 0.3,
      }

      // Exactly at start
      const resultStart = calculateEquityAllocation(config, 30)
      expect(resultStart).toBeCloseTo(0.8)

      // Exactly at target
      const resultTarget = calculateEquityAllocation(config, 60)
      expect(resultTarget).toBeCloseTo(0.3)

      // Before start
      const resultBefore = calculateEquityAllocation(config, 25)
      expect(resultBefore).toBeCloseTo(0.8)

      // After target
      const resultAfter = calculateEquityAllocation(config, 70)
      expect(resultAfter).toBeCloseTo(0.3)
    })

    it('should handle single year glide path', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        enabled: true,
        startAge: 30,
        targetAge: 31, // Only 1 year
        startEquityAllocation: 0.8,
        targetEquityAllocation: 0.3,
      }

      // At exactly 30.5 years, should be at midpoint
      const result = applyGlidePath(config, DEFAULT_ASSET_CLASSES, 30)
      expect(result.equityAllocation).toBeCloseTo(0.8)
    })

    it('should handle 100% equity start allocation', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        enabled: true,
        startEquityAllocation: 1.0, // 100% equity
        targetEquityAllocation: 0.2,
      }

      const result = calculateEquityAllocation(config, 35)
      expect(result).toBeGreaterThan(0.2)
      expect(result).toBeLessThanOrEqual(1.0)
    })

    it('should handle 0% target equity allocation', () => {
      const config: GlidePathConfig = {
        ...createDefaultGlidePathConfig(),
        enabled: true,
        startEquityAllocation: 0.8,
        targetEquityAllocation: 0.0, // 100% bonds at target
      }

      const result = calculateEquityAllocation(config, config.targetAge)
      expect(result).toBeCloseTo(0.0)
    })
  })

  describe('integration with multi-asset portfolio', () => {
    it('should work with realistic portfolio configuration', () => {
      const config: GlidePathConfig = {
        enabled: true,
        startEquityAllocation: 0.9,
        targetEquityAllocation: 0.3,
        startAge: 25,
        targetAge: 67,
        curve: 'linear',
        useGermanFormula: false,
        formulaOffset: 100,
      }

      const assetClasses: Record<AssetClass, AssetClassConfig> = {
        stocks_domestic: {
          ...DEFAULT_ASSET_CLASSES.stocks_domestic,
          enabled: true,
          targetAllocation: 0.4,
        },
        stocks_international: {
          ...DEFAULT_ASSET_CLASSES.stocks_international,
          enabled: true,
          targetAllocation: 0.4,
        },
        bonds_government: {
          ...DEFAULT_ASSET_CLASSES.bonds_government,
          enabled: true,
          targetAllocation: 0.15,
        },
        bonds_corporate: {
          ...DEFAULT_ASSET_CLASSES.bonds_corporate,
          enabled: true,
          targetAllocation: 0.05,
        },
        real_estate: {
          ...DEFAULT_ASSET_CLASSES.real_estate,
          enabled: false,
        },
        commodities: {
          ...DEFAULT_ASSET_CLASSES.commodities,
          enabled: false,
        },
        cash: {
          ...DEFAULT_ASSET_CLASSES.cash,
          enabled: false,
        },
      }

      // Test at different ages
      const ages = [25, 35, 45, 55, 67]
      const results = ages.map((age) => applyGlidePath(config, assetClasses, age))

      // Verify equity allocation decreases with age
      for (let i = 1; i < results.length; i++) {
        expect(results[i].equityAllocation).toBeLessThan(results[i - 1].equityAllocation)
      }

      // Verify all allocations sum to 1
      results.forEach((result) => {
        const total = Object.values(result.adjustedAllocations).reduce((sum, alloc) => sum + alloc, 0)
        expect(total).toBeCloseTo(1, 2)
      })

      // Verify first and last match expected values
      expect(results[0].equityAllocation).toBeCloseTo(0.9) // Age 25
      expect(results[results.length - 1].equityAllocation).toBeCloseTo(0.3) // Age 67
    })
  })
})
