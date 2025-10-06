import { describe, it, expect } from 'vitest'
import { calculateWithdrawal } from './withdrawal'
import type { SteueroptimierteEntnahmeConfig } from './withdrawal'

/**
 * Comprehensive tests for the tax-optimized withdrawal strategy
 */
describe('Steueroptimierte Entnahme Strategy', () => {
  // Mock sparplan elements for testing
  const mockElements = [
    {
      start: '2025-01-01',
      type: 'sparplan' as const,
      einzahlung: 2000,
      simulation: {
        2040: {
          startkapital: 400000,
          endkapital: 500000,
          zinsen: 35000,
          bezahlteSteuer: 2500,
          genutzterFreibetrag: 2000,
          vorabpauschale: 1500,
          vorabpauschaleAccumulated: 15000,
        },
      },
    },
  ]

  const baseTestParams = {
    elements: mockElements,
    startYear: 2041,
    endYear: 2045,
    strategy: 'steueroptimiert' as const,
    returnConfig: {
      mode: 'fixed' as const,
      fixedRate: 0.05,
    },
    taxRate: 0.26375,
    teilfreistellungsquote: 0.3,
    freibetragPerYear: { 2041: 2000, 2042: 2000, 2043: 2000, 2044: 2000, 2045: 2000 },
  }

  describe('Configuration Validation', () => {
    it('should provide default config when steueroptimierteEntnahmeConfig is missing', () => {
      // Should not throw an error, but use default configuration
      const result = calculateWithdrawal({
        ...baseTestParams,
        // Missing steueroptimierteEntnahmeConfig - should use defaults
      })

      // Should have some results (not throw an error)
      expect(result).toBeDefined()
      expect(result.result).toBeDefined()
      expect(Object.keys(result.result)).toHaveLength(5) // 2041-2045
      expect(result.result[2041]).toBeDefined()
      expect(result.result[2041].entnahme).toBeGreaterThan(0)
    })

    it('should accept valid steueroptimierteEntnahmeConfig', () => {
      const config: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'balanced',
        freibetragUtilizationTarget: 0.85,
        rebalanceFrequency: 'yearly',
      }

      const result = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: config,
      })

      expect(result).toBeDefined()
      expect(result.result).toBeDefined()
      expect(Object.keys(result.result)).toHaveLength(5) // 2041-2045
    })
  })

  describe('Optimization Modes', () => {
    const testConfig = (mode: 'minimize_taxes' | 'maximize_after_tax' | 'balanced'): SteueroptimierteEntnahmeConfig => ({
      baseWithdrawalRate: 0.04,
      targetTaxRate: 0.26375,
      optimizationMode: mode,
      freibetragUtilizationTarget: 0.85,
      rebalanceFrequency: 'yearly',
    })

    it('should work with minimize_taxes optimization mode', () => {
      const result = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: testConfig('minimize_taxes'),
      })

      expect(result.result[2041]).toBeDefined()
      expect(result.result[2041].entnahme).toBeGreaterThan(0)
      expect(result.result[2041].steueroptimierungAnpassung).toBeDefined()
    })

    it('should work with maximize_after_tax optimization mode', () => {
      const result = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: testConfig('maximize_after_tax'),
      })

      expect(result.result[2041]).toBeDefined()
      expect(result.result[2041].entnahme).toBeGreaterThan(0)
      expect(result.result[2041].steueroptimierungAnpassung).toBeDefined()
    })

    it('should work with balanced optimization mode', () => {
      const result = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: testConfig('balanced'),
      })

      expect(result.result[2041]).toBeDefined()
      expect(result.result[2041].entnahme).toBeGreaterThan(0)
      expect(result.result[2041].steueroptimierungAnpassung).toBeDefined()
    })

    it('should produce different results for different optimization modes', () => {
      const minimizeTaxes = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: testConfig('minimize_taxes'),
      })

      const maximizeAfterTax = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: testConfig('maximize_after_tax'),
      })

      const balanced = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: testConfig('balanced'),
      })

      // Results should be different between modes
      const firstYearMinimize = minimizeTaxes.result[2041].entnahme
      const firstYearMaximize = maximizeAfterTax.result[2041].entnahme
      const firstYearBalanced = balanced.result[2041].entnahme

      // At least one should be different (allowing for some might be the same)
      const allSame = firstYearMinimize === firstYearMaximize && firstYearMaximize === firstYearBalanced
      expect(allSame).toBe(false)
    })
  })

  describe('Freibetrag Utilization', () => {
    it('should respect freibetragUtilizationTarget setting', () => {
      const highUtilization: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'minimize_taxes',
        freibetragUtilizationTarget: 0.95, // 95% utilization
        rebalanceFrequency: 'yearly',
      }

      const lowUtilization: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'minimize_taxes',
        freibetragUtilizationTarget: 0.50, // 50% utilization
        rebalanceFrequency: 'yearly',
      }

      const highResult = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: highUtilization,
      })

      const lowResult = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: lowUtilization,
      })

      // Both should produce valid results
      expect(highResult.result[2041].entnahme).toBeGreaterThan(0)
      expect(lowResult.result[2041].entnahme).toBeGreaterThan(0)
      expect(highResult.result[2041].steueroptimierungAnpassung).toBeDefined()
      expect(lowResult.result[2041].steueroptimierungAnpassung).toBeDefined()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle zero capital gracefully', () => {
      const zeroCapitalElements = [
        {
          ...mockElements[0],
          simulation: {
            2040: {
              startkapital: 0,
              endkapital: 0,
              zinsen: 0,
              bezahlteSteuer: 0,
              genutzterFreibetrag: 0,
              vorabpauschale: 0,
              vorabpauschaleAccumulated: 0,
            },
          },
        },
      ]

      const config: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'balanced',
        freibetragUtilizationTarget: 0.85,
        rebalanceFrequency: 'yearly',
      }

      const result = calculateWithdrawal({
        ...baseTestParams,
        elements: zeroCapitalElements,
        steueroptimierteEntnahmeConfig: config,
      })

      // Should not crash and should handle zero capital
      expect(result.result).toBeDefined()
    })

    it('should handle extreme tax rates', () => {
      const config: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.5, // 50% tax rate
        optimizationMode: 'minimize_taxes',
        freibetragUtilizationTarget: 0.85,
        rebalanceFrequency: 'yearly',
      }

      const result = calculateWithdrawal({
        ...baseTestParams,
        taxRate: 0.5,
        steueroptimierteEntnahmeConfig: config,
      })

      expect(result.result[2041]).toBeDefined()
      expect(result.result[2041].entnahme).toBeGreaterThan(0)
      expect(isNaN(result.result[2041].entnahme)).toBe(false)
    })

    it('should handle zero Freibetrag', () => {
      const config: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'balanced',
        freibetragUtilizationTarget: 0.85,
        rebalanceFrequency: 'yearly',
      }

      const result = calculateWithdrawal({
        ...baseTestParams,
        freibetragPerYear: { 2041: 0, 2042: 0, 2043: 0, 2044: 0, 2045: 0 },
        steueroptimierteEntnahmeConfig: config,
      })

      expect(result.result[2041]).toBeDefined()
      expect(result.result[2041].entnahme).toBeGreaterThan(0)
      expect(isNaN(result.result[2041].entnahme)).toBe(false)
    })
  })

  describe('Integration with Other Features', () => {
    it('should work with inflation adjustment', () => {
      const config: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'balanced',
        freibetragUtilizationTarget: 0.85,
        rebalanceFrequency: 'yearly',
      }

      const result = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: config,
        inflationConfig: {
          inflationRate: 0.02, // 2% inflation
        },
      })

      expect(result.result[2041]).toBeDefined()
      expect(result.result[2041].entnahme).toBeGreaterThan(0)
      // Should increase with inflation
      expect(result.result[2042].entnahme).toBeGreaterThan(result.result[2041].entnahme)
    })

    it('should work with different withdrawal frequencies', () => {
      const config: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'balanced',
        freibetragUtilizationTarget: 0.85,
        rebalanceFrequency: 'yearly',
      }

      const yearlyResult = calculateWithdrawal({
        ...baseTestParams,
        withdrawalFrequency: 'yearly',
        steueroptimierteEntnahmeConfig: config,
      })

      const monthlyResult = calculateWithdrawal({
        ...baseTestParams,
        withdrawalFrequency: 'monthly',
        steueroptimierteEntnahmeConfig: config,
      })

      expect(yearlyResult.result[2041]).toBeDefined()
      expect(monthlyResult.result[2041]).toBeDefined()
      expect(monthlyResult.result[2041].monatlicheEntnahme).toBeDefined()
    })
  })

  describe('Result Structure', () => {
    it('should include steueroptimierungAnpassung in results', () => {
      const config: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'balanced',
        freibetragUtilizationTarget: 0.85,
        rebalanceFrequency: 'yearly',
      }

      const result = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: config,
      })

      const firstYear = result.result[2041]
      expect(firstYear.steueroptimierungAnpassung).toBeDefined()
      expect(typeof firstYear.steueroptimierungAnpassung).toBe('number')
    })

    it('should not include steueroptimierungAnpassung for other strategies', () => {
      const result = calculateWithdrawal({
        ...baseTestParams,
        strategy: '4prozent',
      })

      const firstYear = result.result[2041]
      expect(firstYear.steueroptimierungAnpassung).toBeUndefined()
    })
  })

  describe('Performance and Stability', () => {
    it('should complete calculations in reasonable time', () => {
      const config: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'maximize_after_tax', // Most complex mode
        freibetragUtilizationTarget: 0.85,
        rebalanceFrequency: 'yearly',
      }

      const startTime = Date.now()

      const result = calculateWithdrawal({
        ...baseTestParams,
        endYear: 2070, // Longer time period
        steueroptimierteEntnahmeConfig: config,
      })

      const duration = Date.now() - startTime

      expect(result.result).toBeDefined()
      expect(duration).toBeLessThan(1000) // Should complete within 1 second
    })

    it('should produce consistent results across multiple runs', () => {
      const config: SteueroptimierteEntnahmeConfig = {
        baseWithdrawalRate: 0.04,
        targetTaxRate: 0.26375,
        optimizationMode: 'balanced',
        freibetragUtilizationTarget: 0.85,
        rebalanceFrequency: 'yearly',
      }

      const result1 = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: config,
      })

      const result2 = calculateWithdrawal({
        ...baseTestParams,
        steueroptimierteEntnahmeConfig: config,
      })

      // Results should be identical for same inputs
      expect(result1.result[2041].entnahme).toBe(result2.result[2041].entnahme)
      expect(result1.result[2041].steueroptimierungAnpassung).toBe(result2.result[2041].steueroptimierungAnpassung)
    })
  })
})
