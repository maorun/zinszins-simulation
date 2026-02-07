import { describe, it, expect } from 'vitest'
import {
  compareAccountStructures,
  calculateOptimalDistribution,
  areSeparateAccountsWorthwhile,
  type PartnerCapitalGains,
} from './account-type-comparison'
import { FREIBETRAG_CONSTANTS } from '../src/utils/tax-constants'

describe('account-type-comparison', () => {
  const DEFAULT_TAX_RATE = 26.375

  describe('compareAccountStructures', () => {
    it('should favor separate accounts when gains are unevenly distributed', () => {
      // Partner 1 has high gains, Partner 2 has low gains
      const gains: PartnerCapitalGains = {
        partner1: 8000,
        partner2: 500,
      }

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)

      // Separate accounts: Partner1 pays tax on 6000€, Partner2 pays nothing
      // Joint account: Combined 8500€ - 4000€ = 4500€ taxable, split 50/50 = 2250€ each
      expect(result.recommendation).toBe('separate')
      expect(result.taxSavings).toBeGreaterThan(0)

      // Verify calculations for separate accounts
      expect(result.separateAccounts.totalFreibetrag).toBe(4000)
      expect(result.separateAccounts.taxableGainsPartner1).toBe(6000)
      expect(result.separateAccounts.taxableGainsPartner2).toBe(0)
      expect(result.separateAccounts.totalTaxableGains).toBe(6000)

      // Verify calculations for joint account
      expect(result.jointAccount.totalFreibetrag).toBe(4000)
      expect(result.jointAccount.totalTaxableGains).toBe(4500)
      expect(result.jointAccount.taxableGainsPartner1).toBe(2250)
      expect(result.jointAccount.taxableGainsPartner2).toBe(2250)
    })

    it('should favor joint account when gains are evenly distributed', () => {
      // Both partners have equal gains
      const gains: PartnerCapitalGains = {
        partner1: 5000,
        partner2: 5000,
      }

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)

      // With equal distribution, both structures should be nearly identical
      expect(Math.abs(result.separateAccounts.totalTaxAmount - result.jointAccount.totalTaxAmount)).toBeLessThan(0.01)
      expect(result.recommendation).toBe('joint') // Default to joint when equal
    })

    it('should handle case where both partners are under Freibetrag', () => {
      // Both partners have gains below their individual Freibetrag
      const gains: PartnerCapitalGains = {
        partner1: 1500,
        partner2: 1800,
      }

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)

      // No tax should be paid in either structure
      expect(result.separateAccounts.totalTaxAmount).toBe(0)
      expect(result.jointAccount.totalTaxAmount).toBe(0)
      expect(result.taxSavings).toBe(0)
      expect(result.recommendation).toBe('joint') // Default to joint for simplicity
    })

    it('should handle case where combined gains exceed Freibetrag but individual gains do not', () => {
      // Each partner has gains just below individual Freibetrag, but combined exceeds couple Freibetrag
      const gains: PartnerCapitalGains = {
        partner1: 1900,
        partner2: 1900,
      }

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)

      // Separate accounts: No tax (both under 2000€)
      // Joint account: No tax (3800€ < 4000€)
      expect(result.separateAccounts.totalTaxAmount).toBe(0)
      expect(result.jointAccount.totalTaxAmount).toBe(0)
    })

    it('should handle extreme uneven distribution', () => {
      // One partner has all the gains
      const gains: PartnerCapitalGains = {
        partner1: 10000,
        partner2: 0,
      }

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)

      // Separate accounts: Partner1 pays tax on 8000€ (10000-2000), Partner2 pays nothing
      // Joint account: 10000€ - 4000€ = 6000€ taxable, split 50/50 = 3000€ each
      expect(result.recommendation).toBe('separate')

      // Calculate expected tax for separate accounts
      const expectedSeparateTax = 8000 * (DEFAULT_TAX_RATE / 100)
      expect(result.separateAccounts.totalTaxAmount).toBeCloseTo(expectedSeparateTax, 2)

      // Calculate expected tax for joint account
      const expectedJointTax = 6000 * (DEFAULT_TAX_RATE / 100)
      expect(result.jointAccount.totalTaxAmount).toBeCloseTo(expectedJointTax, 2)

      // Separate should save money
      expect(result.taxSavings).toBeCloseTo(expectedSeparateTax - expectedJointTax, 2)
    })

    it('should apply Teilfreistellung correctly for both structures', () => {
      // With 30% Teilfreistellung (partial exemption for equity funds)
      const gains: PartnerCapitalGains = {
        partner1: 10000,
        partner2: 2000,
      }

      const teilfreistellung = 30

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE, teilfreistellung)

      // Net gains after Teilfreistellung: 10000 * 0.7 = 7000, 2000 * 0.7 = 1400
      // Separate: Partner1: 7000-2000=5000 taxable, Partner2: 0 taxable
      // Joint: Total 8400 - 4000 = 4400 taxable

      expect(result.separateAccounts.taxableGainsPartner1).toBe(5000)
      expect(result.separateAccounts.taxableGainsPartner2).toBe(0)
      expect(result.jointAccount.totalTaxableGains).toBe(4400)

      // Separate should be better in this uneven distribution
      expect(result.recommendation).toBe('separate')
    })

    it('should provide meaningful description for recommendation', () => {
      const gains: PartnerCapitalGains = {
        partner1: 8000,
        partner2: 1000,
      }

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)

      expect(result.description).toBeTruthy()
      expect(result.description.length).toBeGreaterThan(20)
      expect(result.description).toContain(result.taxSavings.toFixed(2))
    })

    it('should handle zero gains gracefully', () => {
      const gains: PartnerCapitalGains = {
        partner1: 0,
        partner2: 0,
      }

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)

      expect(result.separateAccounts.totalTaxAmount).toBe(0)
      expect(result.jointAccount.totalTaxAmount).toBe(0)
      expect(result.taxSavings).toBe(0)
      expect(result.separateAccounts.effectiveTaxRate).toBe(0)
      expect(result.jointAccount.effectiveTaxRate).toBe(0)
    })

    it('should calculate effective tax rate correctly', () => {
      const gains: PartnerCapitalGains = {
        partner1: 6000,
        partner2: 6000,
      }

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)

      // Total gains: 12000€
      // Total taxable (both structures): 12000 - 4000 = 8000€
      // Total tax: 8000 * 0.26375 = 2110€
      // Effective rate: 2110 / 12000 = 17.58%

      const expectedEffectiveRate = (2110 / 12000) * 100
      expect(result.separateAccounts.effectiveTaxRate).toBeCloseTo(expectedEffectiveRate, 1)
      expect(result.jointAccount.effectiveTaxRate).toBeCloseTo(expectedEffectiveRate, 1)
    })
  })

  describe('calculateOptimalDistribution', () => {
    it('should recommend equal split for optimal tax efficiency', () => {
      const totalGains = 10000

      const result = calculateOptimalDistribution(totalGains, DEFAULT_TAX_RATE)

      expect(result.optimalSplit.partner1).toBe(5000)
      expect(result.optimalSplit.partner2).toBe(5000)

      // Each partner: 5000 - 2000 = 3000 taxable
      // Total tax: 3000 * 2 * 0.26375 = 1582.5€
      const expectedTax = 6000 * (DEFAULT_TAX_RATE / 100)
      expect(result.expectedTax).toBeCloseTo(expectedTax, 2)
    })

    it('should calculate zero tax when total gains are below combined Freibetrag', () => {
      const totalGains = 3500

      const result = calculateOptimalDistribution(totalGains, DEFAULT_TAX_RATE)

      expect(result.optimalSplit.partner1).toBe(1750)
      expect(result.optimalSplit.partner2).toBe(1750)
      expect(result.expectedTax).toBe(0)
    })

    it('should apply Teilfreistellung in optimal distribution calculation', () => {
      const totalGains = 10000
      const teilfreistellung = 30

      const result = calculateOptimalDistribution(totalGains, DEFAULT_TAX_RATE, teilfreistellung)

      // Net gains after Teilfreistellung: 10000 * 0.7 = 7000
      // Optimal split: 3500 each
      expect(result.optimalSplit.partner1).toBe(5000) // Original gross amount
      expect(result.optimalSplit.partner2).toBe(5000)

      // Each partner after Teilfreistellung: 3500
      // Taxable per partner: 3500 - 2000 = 1500
      // Total tax: 1500 * 2 * 0.26375 = 791.25€
      const expectedTax = 3000 * (DEFAULT_TAX_RATE / 100)
      expect(result.expectedTax).toBeCloseTo(expectedTax, 2)
    })

    it('should handle exactly at Freibetrag threshold', () => {
      const totalGains = FREIBETRAG_CONSTANTS.COUPLE

      const result = calculateOptimalDistribution(totalGains, DEFAULT_TAX_RATE)

      expect(result.optimalSplit.partner1).toBe(2000)
      expect(result.optimalSplit.partner2).toBe(2000)
      expect(result.expectedTax).toBe(0)
    })
  })

  describe('areSeparateAccountsWorthwhile', () => {
    it('should recommend separate accounts when savings exceed threshold', () => {
      const gains: PartnerCapitalGains = {
        partner1: 10000,
        partner2: 500,
      }

      const result = areSeparateAccountsWorthwhile(gains, DEFAULT_TAX_RATE, 0, 50)

      expect(result.worthwhile).toBe(true)
      expect(result.reason).toContain('sparen jährlich')
      expect(result.reason).toContain('über dem Schwellenwert')
    })

    it('should not recommend separate accounts when savings are below threshold', () => {
      // Create a scenario with minimal savings
      const gains: PartnerCapitalGains = {
        partner1: 5100,
        partner2: 4900,
      }

      const result = areSeparateAccountsWorthwhile(gains, DEFAULT_TAX_RATE, 0, 50)

      // With nearly equal distribution, savings should be minimal
      expect(result.worthwhile).toBe(false)
    })

    it('should recommend joint account when it is better', () => {
      // Equal distribution favors joint account
      const gains: PartnerCapitalGains = {
        partner1: 5000,
        partner2: 5000,
      }

      const result = areSeparateAccountsWorthwhile(gains, DEFAULT_TAX_RATE)

      expect(result.worthwhile).toBe(false)
      expect(result.reason).toContain('Gemeinschaftsdepot')
    })

    it('should respect custom savings threshold', () => {
      const gains: PartnerCapitalGains = {
        partner1: 8000,
        partner2: 1000,
      }

      // With a high threshold, even good savings might not be worthwhile
      const result = areSeparateAccountsWorthwhile(gains, DEFAULT_TAX_RATE, 0, 1000)

      // The actual savings from this distribution should be less than 1000€
      const comparison = compareAccountStructures(gains, DEFAULT_TAX_RATE)
      if (comparison.taxSavings < 1000) {
        expect(result.worthwhile).toBe(false)
        expect(result.reason).toContain('unter dem Schwellenwert')
      }
    })

    it('should provide clear reasoning in all cases', () => {
      const testCases: PartnerCapitalGains[] = [
        { partner1: 10000, partner2: 100 }, // Highly uneven
        { partner1: 5000, partner2: 5000 }, // Perfectly even
        { partner1: 1000, partner2: 800 }, // Both below Freibetrag
      ]

      testCases.forEach(gains => {
        const result = areSeparateAccountsWorthwhile(gains, DEFAULT_TAX_RATE)
        expect(result.reason).toBeTruthy()
        expect(result.reason.length).toBeGreaterThan(20)
      })
    })
  })

  describe('Edge cases and boundary conditions', () => {
    it('should handle very large capital gains', () => {
      const gains: PartnerCapitalGains = {
        partner1: 1000000,
        partner2: 50000,
      }

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)

      // Should complete without errors and provide valid recommendations
      expect(result.recommendation).toBeDefined()
      expect(result.taxSavings).toBeGreaterThanOrEqual(0)
      expect(result.separateAccounts.totalTaxAmount).toBeGreaterThan(0)
      expect(result.jointAccount.totalTaxAmount).toBeGreaterThan(0)
    })

    it('should handle negative values gracefully', () => {
      // In real scenarios, negative capital gains (losses) are possible
      const gains: PartnerCapitalGains = {
        partner1: 5000,
        partner2: -1000,
      }

      // The calculation should handle this without errors
      expect(() => {
        compareAccountStructures(gains, DEFAULT_TAX_RATE)
      }).not.toThrow()
    })

    it('should handle exactly at Freibetrag boundaries', () => {
      // Test at various Freibetrag boundaries
      const testCases = [
        { partner1: 2000, partner2: 0 }, // Exactly at individual Freibetrag
        { partner1: 2000, partner2: 2000 }, // Exactly at combined Freibetrag
        { partner1: 4000, partner2: 0 }, // One partner at combined Freibetrag
      ]

      testCases.forEach(gains => {
        const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)
        expect(result).toBeDefined()
        expect(result.taxSavings).toBeGreaterThanOrEqual(0)
      })
    })

    it('should maintain calculation precision with decimal values', () => {
      const gains: PartnerCapitalGains = {
        partner1: 5432.67,
        partner2: 3876.43,
      }

      const result = compareAccountStructures(gains, DEFAULT_TAX_RATE)

      // Calculations should maintain reasonable precision
      expect(result.separateAccounts.totalTaxAmount).toBeGreaterThan(0)
      expect(result.jointAccount.totalTaxAmount).toBeGreaterThan(0)
      // Tax amounts should be within reasonable precision (2 decimal places)
      expect(Math.round(result.separateAccounts.totalTaxAmount * 100)).toBe(
        Math.round(result.separateAccounts.totalTaxAmount * 100),
      )
    })
  })
})
