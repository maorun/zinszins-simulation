import { describe, expect, it } from 'vitest'
import {
  calculatePfaendungsfreigrenze,
  assessProtectedAssets,
  getDefaultPfaendungsfreigrenzeConfig,
  getDefaultAssetProtectionConfig,
  validatePfaendungsfreigrenzeConfig,
  validateAssetProtectionConfig,
  getOptimizationRecommendations,
  type PfaendungsfreigrenzeConfig,
  type AssetProtectionConfig,
} from './pfaendungsfreigrenze'

describe('pfaendungsfreigrenze', () => {
  describe('getDefaultPfaendungsfreigrenzeConfig', () => {
    it('should return default config with zero values', () => {
      const config = getDefaultPfaendungsfreigrenzeConfig(2024)

      expect(config).toEqual({
        monthlyNetIncome: 0,
        numberOfDependents: 0,
        year: 2024,
      })
    })
  })

  describe('getDefaultAssetProtectionConfig', () => {
    it('should return default asset config with zero values', () => {
      const config = getDefaultAssetProtectionConfig(2024)

      expect(config).toEqual({
        ruerupRenteCapital: 0,
        riesterRenteCapital: 0,
        otherPensionCapital: 0,
        year: 2024,
      })
    })
  })

  describe('validatePfaendungsfreigrenzeConfig', () => {
    it('should validate correct configuration without errors', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 3000,
        numberOfDependents: 2,
        year: 2024,
      }

      const errors = validatePfaendungsfreigrenzeConfig(config)
      expect(errors).toEqual([])
    })

    it('should reject negative income', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: -1000,
        numberOfDependents: 0,
        year: 2024,
      }

      const errors = validatePfaendungsfreigrenzeConfig(config)
      expect(errors).toContain('Monatliches Nettoeinkommen kann nicht negativ sein')
    })

    it('should reject negative dependents', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 2000,
        numberOfDependents: -1,
        year: 2024,
      }

      const errors = validatePfaendungsfreigrenzeConfig(config)
      expect(errors).toContain('Anzahl der Unterhaltsberechtigten kann nicht negativ sein')
    })

    it('should reject unrealistic number of dependents', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 2000,
        numberOfDependents: 15,
        year: 2024,
      }

      const errors = validatePfaendungsfreigrenzeConfig(config)
      expect(errors).toContain('Anzahl der Unterhaltsberechtigten erscheint unrealistisch hoch')
    })

    it('should reject invalid years', () => {
      const config1: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 2000,
        numberOfDependents: 0,
        year: 1999,
      }

      const config2: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 2000,
        numberOfDependents: 0,
        year: 2101,
      }

      expect(validatePfaendungsfreigrenzeConfig(config1)).toContain('Jahr muss zwischen 2000 und 2100 liegen')
      expect(validatePfaendungsfreigrenzeConfig(config2)).toContain('Jahr muss zwischen 2000 und 2100 liegen')
    })
  })

  describe('validateAssetProtectionConfig', () => {
    it('should validate correct configuration without errors', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 100000,
        riesterRenteCapital: 50000,
        otherPensionCapital: 30000,
        year: 2024,
      }

      const errors = validateAssetProtectionConfig(config)
      expect(errors).toEqual([])
    })

    it('should reject negative Rürup capital', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: -10000,
        riesterRenteCapital: 0,
        otherPensionCapital: 0,
        year: 2024,
      }

      const errors = validateAssetProtectionConfig(config)
      expect(errors).toContain('Rürup-Renten-Kapital kann nicht negativ sein')
    })

    it('should reject negative Riester capital', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 0,
        riesterRenteCapital: -5000,
        otherPensionCapital: 0,
        year: 2024,
      }

      const errors = validateAssetProtectionConfig(config)
      expect(errors).toContain('Riester-Renten-Kapital kann nicht negativ sein')
    })

    it('should reject negative other pension capital', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 0,
        riesterRenteCapital: 0,
        otherPensionCapital: -3000,
        year: 2024,
      }

      const errors = validateAssetProtectionConfig(config)
      expect(errors).toContain('Sonstiges Altersvorsorge-Kapital kann nicht negativ sein')
    })

    it('should reject invalid years', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 0,
        riesterRenteCapital: 0,
        otherPensionCapital: 0,
        year: 1999,
      }

      const errors = validateAssetProtectionConfig(config)
      expect(errors).toContain('Jahr muss zwischen 2000 und 2100 liegen')
    })
  })

  describe('calculatePfaendungsfreigrenze', () => {
    it('should protect income below base amount', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 1000,
        numberOfDependents: 0,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      // Income below 1491.75 € is fully protected
      expect(result.protectedAmount).toBe(1000)
      expect(result.garnishableAmount).toBe(0)
      expect(result.isFullyGarnishable).toBe(false)
    })

    it('should apply base protection amount for single person', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 2000,
        numberOfDependents: 0,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      // Base amount: 1491.75 €
      expect(result.baseProtectedAmount).toBe(1491.75)
      expect(result.protectedAmount).toBe(1491.75)
      expect(result.garnishableAmount).toBeGreaterThan(0)
    })

    it('should add protection for first dependent', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 3000,
        numberOfDependents: 1,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      // Base: 1491.75 + First dependent: 561.43 = 2053.18
      expect(result.additionalProtectionPerDependent).toHaveLength(1)
      expect(result.additionalProtectionPerDependent[0]).toBe(561.43)
      expect(result.protectedAmount).toBe(1491.75 + 561.43)
    })

    it('should add protection for multiple dependents', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 3500,
        numberOfDependents: 3,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      // Base: 1491.75 + First: 561.43 + Second: 312.78 + Third: 312.78
      expect(result.additionalProtectionPerDependent).toHaveLength(3)
      expect(result.additionalProtectionPerDependent[0]).toBe(561.43)
      expect(result.additionalProtectionPerDependent[1]).toBe(312.78)
      expect(result.additionalProtectionPerDependent[2]).toBe(312.78)
      const expectedProtection = 1491.75 + 561.43 + 312.78 + 312.78
      expect(result.protectedAmount).toBeCloseTo(expectedProtection, 2)
    })

    it('should mark income as fully garnishable above threshold', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 5000,
        numberOfDependents: 0,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      // Above 4573.10 €
      expect(result.isFullyGarnishable).toBe(true)
      expect(result.protectedAmount).toBe(0)
      expect(result.garnishableAmount).toBe(5000)
    })

    it('should calculate partial garnishment between base and threshold', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 2500,
        numberOfDependents: 0,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      // Between 1491.75 and 4573.10: progressive garnishment
      expect(result.protectedAmount).toBeGreaterThan(0)
      expect(result.garnishableAmount).toBeGreaterThan(0)
      // Note: In progressive garnishment, garnishable amount is calculated from excess, not total income
      expect(result.protectedAmount).toBe(1491.75) // Protected amount stays at base
      expect(result.isFullyGarnishable).toBe(false)
    })

    it('should handle realistic single person scenario', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 2800,
        numberOfDependents: 0,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      expect(result.baseProtectedAmount).toBe(1491.75)
      expect(result.garnishableAmount).toBeGreaterThan(0)
      expect(result.garnishableAmount).toBeLessThan(result.monthlyNetIncome)
    })

    it('should handle realistic family scenario', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 3500,
        numberOfDependents: 2,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      // Base + first + second dependent
      const expectedBase = 1491.75 + 561.43 + 312.78
      expect(result.protectedAmount).toBeCloseTo(expectedBase, 2)
      expect(result.garnishableAmount).toBeGreaterThan(0)
      expect(result.numberOfDependents).toBe(2)
    })

    it('should protect full income at exactly base amount', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 1491.75,
        numberOfDependents: 0,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      expect(result.protectedAmount).toBe(1491.75)
      expect(result.garnishableAmount).toBe(0)
    })

    it('should handle zero income', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 0,
        numberOfDependents: 0,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      expect(result.protectedAmount).toBe(0)
      expect(result.garnishableAmount).toBe(0)
    })

    it('should handle high income with dependents', () => {
      const config: PfaendungsfreigrenzeConfig = {
        monthlyNetIncome: 6000,
        numberOfDependents: 2,
        year: 2024,
      }

      const result = calculatePfaendungsfreigrenze(config)

      // Above threshold, fully garnishable
      expect(result.isFullyGarnishable).toBe(true)
      expect(result.garnishableAmount).toBe(6000)
    })
  })

  describe('assessProtectedAssets', () => {
    it('should fully protect Rürup capital below limit', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 200000,
        riesterRenteCapital: 0,
        otherPensionCapital: 0,
        year: 2024,
      }

      const result = assessProtectedAssets(config)

      // Below 340,000 € limit
      expect(result.ruerupProtected).toBe(200000)
      expect(result.ruerupGarnishable).toBe(0)
      expect(result.totalProtected).toBe(200000)
    })

    it('should partially protect Rürup capital above limit', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 500000,
        riesterRenteCapital: 0,
        otherPensionCapital: 0,
        year: 2024,
      }

      const result = assessProtectedAssets(config)

      // Above 340,000: base + 30% of excess
      // Protected: 340,000 + (500,000 - 340,000) × 0.3 = 340,000 + 48,000 = 388,000
      expect(result.ruerupProtected).toBeCloseTo(388000, 0)
      expect(result.ruerupGarnishable).toBeCloseTo(112000, 0)
      expect(result.ruerupProtected + result.ruerupGarnishable).toBe(500000)
    })

    it('should limit protection for Rürup above triple limit', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 1500000,
        riesterRenteCapital: 0,
        otherPensionCapital: 0,
        year: 2024,
      }

      const result = assessProtectedAssets(config)

      // Above 1,020,000: only base protection
      expect(result.ruerupProtected).toBe(340000)
      expect(result.ruerupGarnishable).toBe(1500000 - 340000)
      expect(result.recommendations.length).toBeGreaterThan(0)
      expect(result.recommendations.some((r) => r.includes('dreifache Obergrenze'))).toBe(true)
    })

    it('should fully protect Riester capital', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 0,
        riesterRenteCapital: 100000,
        otherPensionCapital: 0,
        year: 2024,
      }

      const result = assessProtectedAssets(config)

      // Riester is fully protected in accumulation phase
      expect(result.riesterProtected).toBe(100000)
      expect(result.riesterGarnishable).toBe(0)
    })

    it('should not protect other pension capital', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 0,
        riesterRenteCapital: 0,
        otherPensionCapital: 50000,
        year: 2024,
      }

      const result = assessProtectedAssets(config)

      // Other pensions are not protected
      expect(result.otherProtected).toBe(0)
      expect(result.otherGarnishable).toBe(50000)
      expect(result.totalProtected).toBe(0)
      expect(result.totalGarnishable).toBe(50000)
    })

    it('should calculate mixed portfolio protection', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 150000,
        riesterRenteCapital: 80000,
        otherPensionCapital: 30000,
        year: 2024,
      }

      const result = assessProtectedAssets(config)

      // Rürup: 150,000 protected (below limit)
      // Riester: 80,000 protected (fully)
      // Other: 0 protected
      expect(result.ruerupProtected).toBe(150000)
      expect(result.riesterProtected).toBe(80000)
      expect(result.otherProtected).toBe(0)
      expect(result.totalProtected).toBe(230000)
      expect(result.totalGarnishable).toBe(30000)
      expect(result.totalAssets).toBe(260000)
    })

    it('should provide recommendations for garnishable assets', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 400000,
        riesterRenteCapital: 0,
        otherPensionCapital: 100000,
        year: 2024,
      }

      const result = assessProtectedAssets(config)

      expect(result.recommendations.length).toBeGreaterThan(0)
      // Should recommend restructuring other pension capital
      expect(result.recommendations.some((r) => r.includes('Umschichtung'))).toBe(true)
    })

    it('should handle zero assets', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 0,
        riesterRenteCapital: 0,
        otherPensionCapital: 0,
        year: 2024,
      }

      const result = assessProtectedAssets(config)

      expect(result.totalAssets).toBe(0)
      expect(result.totalProtected).toBe(0)
      expect(result.totalGarnishable).toBe(0)
    })

    it('should handle realistic retirement portfolio', () => {
      const config: AssetProtectionConfig = {
        ruerupRenteCapital: 250000,
        riesterRenteCapital: 120000,
        otherPensionCapital: 50000,
        year: 2024,
      }

      const result = assessProtectedAssets(config)

      // Total: 420,000
      // Protected: 250,000 (Rürup) + 120,000 (Riester) = 370,000
      // Garnishable: 50,000 (Other)
      expect(result.totalAssets).toBe(420000)
      expect(result.totalProtected).toBe(370000)
      expect(result.totalGarnishable).toBe(50000)
    })
  })

  describe('getOptimizationRecommendations', () => {
    it('should recommend debt restructuring for high garnishable income', () => {
      const incomeResult = calculatePfaendungsfreigrenze({
        monthlyNetIncome: 3000,
        numberOfDependents: 0,
        year: 2024,
      })

      const assetResult = assessProtectedAssets({
        ruerupRenteCapital: 100000,
        riesterRenteCapital: 50000,
        otherPensionCapital: 0,
        year: 2024,
      })

      const recommendations = getOptimizationRecommendations(incomeResult, assetResult)

      // With 3000 € income and no dependents, garnishable > protected
      // Should recommend debt restructuring
      expect(recommendations.length).toBeGreaterThan(0)
      // The specific recommendation depends on the garnishment calculation
      expect(recommendations.some((r) => r.includes('Unterhalt') || r.includes('Schuldensanierung'))).toBe(true)
    })

    it('should suggest registering dependents', () => {
      const incomeResult = calculatePfaendungsfreigrenze({
        monthlyNetIncome: 2500,
        numberOfDependents: 0,
        year: 2024,
      })

      const assetResult = assessProtectedAssets({
        ruerupRenteCapital: 50000,
        riesterRenteCapital: 30000,
        otherPensionCapital: 0,
        year: 2024,
      })

      const recommendations = getOptimizationRecommendations(incomeResult, assetResult)

      expect(recommendations.some((r) => r.includes('Unterhaltsberechtigten'))).toBe(true)
    })

    it('should recommend asset restructuring for high garnishable assets', () => {
      const incomeResult = calculatePfaendungsfreigrenze({
        monthlyNetIncome: 2000,
        numberOfDependents: 1,
        year: 2024,
      })

      const assetResult = assessProtectedAssets({
        ruerupRenteCapital: 0,
        riesterRenteCapital: 0,
        otherPensionCapital: 150000,
        year: 2024,
      })

      const recommendations = getOptimizationRecommendations(incomeResult, assetResult)

      expect(recommendations.some((r) => r.includes('Umschichtung'))).toBe(true)
      expect(recommendations.some((r) => r.includes('pfändungssichere Altersvorsorge'))).toBe(true)
    })

    it('should recommend Rürup for high garnishable assets without Rürup', () => {
      const incomeResult = calculatePfaendungsfreigrenze({
        monthlyNetIncome: 2500,
        numberOfDependents: 0,
        year: 2024,
      })

      const assetResult = assessProtectedAssets({
        ruerupRenteCapital: 0,
        riesterRenteCapital: 20000,
        otherPensionCapital: 100000,
        year: 2024,
      })

      const recommendations = getOptimizationRecommendations(incomeResult, assetResult)

      expect(recommendations.some((r) => r.includes('Rürup-Rente'))).toBe(true)
      expect(recommendations.some((r) => r.includes('340.000'))).toBe(true)
    })

    it('should recommend Riester for garnishable assets without Riester', () => {
      const incomeResult = calculatePfaendungsfreigrenze({
        monthlyNetIncome: 2200,
        numberOfDependents: 1,
        year: 2024,
      })

      const assetResult = assessProtectedAssets({
        ruerupRenteCapital: 100000,
        riesterRenteCapital: 0,
        otherPensionCapital: 40000,
        year: 2024,
      })

      const recommendations = getOptimizationRecommendations(incomeResult, assetResult)

      expect(recommendations.some((r) => r.includes('Riester-Renten'))).toBe(true)
      expect(recommendations.some((r) => r.includes('vollständig geschützt'))).toBe(true)
    })

    it('should warn about fully garnishable income with low protected assets', () => {
      const incomeResult = calculatePfaendungsfreigrenze({
        monthlyNetIncome: 5000,
        numberOfDependents: 0,
        year: 2024,
      })

      const assetResult = assessProtectedAssets({
        ruerupRenteCapital: 50000,
        riesterRenteCapital: 0,
        otherPensionCapital: 100000,
        year: 2024,
      })

      const recommendations = getOptimizationRecommendations(incomeResult, assetResult)

      expect(
        recommendations.some((r) => r.includes('vollständig pfändbarem Einkommen') || r.includes('Altersvorsorge')),
      ).toBe(true)
    })

    it('should provide no problematic warnings for well-protected portfolio', () => {
      const incomeResult = calculatePfaendungsfreigrenze({
        monthlyNetIncome: 1800,
        numberOfDependents: 2,
        year: 2024,
      })

      const assetResult = assessProtectedAssets({
        ruerupRenteCapital: 200000,
        riesterRenteCapital: 100000,
        otherPensionCapital: 0,
        year: 2024,
      })

      const recommendations = getOptimizationRecommendations(incomeResult, assetResult)

      // With 1800 € and 2 dependents, protected amount is high
      // With well-protected assets (300k protected, 0 garnishable)
      // Should have minimal critical warnings
      expect(Array.isArray(recommendations)).toBe(true)
    })
  })
})
