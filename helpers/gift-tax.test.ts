import { describe, it, expect } from 'vitest'
import type { RelationshipType } from '../src/utils/sparplan-utils'
import {
  calculateGiftTax,
  groupGiftsByPeriod,
  calculateGiftTaxSchedule,
  optimizeGiftStrategy,
  calculateChainGiftStrategy,
  getRemainingExemption,
  type Gift,
} from './gift-tax'
import { INHERITANCE_TAX_EXEMPTIONS } from './inheritance-tax'

describe('gift-tax', () => {
  describe('calculateGiftTax', () => {
    it('should calculate zero tax for gift below exemption', () => {
      const gift: Gift = {
        year: 2024,
        amount: 300000,
        beneficiaryId: 'child-1',
        relationshipType: 'child',
      }

      const result = calculateGiftTax(gift, [])

      expect(result.gift).toBe(gift)
      expect(result.exemption).toBe(300000) // Full amount is exempt
      expect(result.taxableAmount).toBe(0)
      expect(result.tax).toBe(0)
      expect(result.netAmount).toBe(300000)
      expect(result.taxClass).toBe('I')
      expect(result.effectiveTaxRate).toBe(0)
      expect(result.periodUsedExemption).toBe(300000)
    })

    it('should calculate tax for gift exceeding exemption', () => {
      const gift: Gift = {
        year: 2024,
        amount: 500000, // €100,000 above child exemption of €400,000
        beneficiaryId: 'child-1',
        relationshipType: 'child',
      }

      const result = calculateGiftTax(gift, [])

      expect(result.exemption).toBe(400000)
      expect(result.taxableAmount).toBe(100000)
      expect(result.taxClass).toBe('I')
      // First €75,000 at 7% + remaining €25,000 at 11%
      const expectedTax = 75000 * 0.07 + 25000 * 0.11
      expect(result.tax).toBe(expectedTax)
      expect(result.netAmount).toBe(500000 - expectedTax)
      expect(result.periodUsedExemption).toBe(400000)
    })

    it('should consider prior gifts in the same 10-year period', () => {
      const priorGift: Gift = {
        year: 2020,
        amount: 200000,
        beneficiaryId: 'child-1',
        relationshipType: 'child',
      }

      const currentGift: Gift = {
        year: 2024,
        amount: 300000,
        beneficiaryId: 'child-1',
        relationshipType: 'child',
      }

      const result = calculateGiftTax(currentGift, [priorGift])

      // Child exemption is €400,000
      // Prior gift used €200,000
      // Current gift has €200,000 remaining exemption
      expect(result.exemption).toBe(200000)
      expect(result.taxableAmount).toBe(100000) // 300,000 - 200,000
      expect(result.periodUsedExemption).toBe(400000) // Total used in period
    })

    it('should handle spouse gifts with higher exemption', () => {
      const gift: Gift = {
        year: 2024,
        amount: 600000, // €100,000 above spouse exemption of €500,000
        beneficiaryId: 'spouse-1',
        relationshipType: 'spouse',
      }

      const result = calculateGiftTax(gift, [])

      expect(result.exemption).toBe(500000)
      expect(result.taxableAmount).toBe(100000)
      expect(result.taxClass).toBe('I')
      // Same tax calculation as child for this amount
      const expectedTax = 75000 * 0.07 + 25000 * 0.11
      expect(result.tax).toBe(expectedTax)
    })

    it('should handle gifts to siblings with lower exemption and higher tax class', () => {
      const gift: Gift = {
        year: 2024,
        amount: 50000, // €30,000 above sibling exemption of €20,000
        beneficiaryId: 'sibling-1',
        relationshipType: 'sibling',
      }

      const result = calculateGiftTax(gift, [])

      expect(result.exemption).toBe(20000)
      expect(result.taxableAmount).toBe(30000)
      expect(result.taxClass).toBe('II')
      // Tax class II: first €30,000 at 15%
      expect(result.tax).toBe(30000 * 0.15)
    })

    it('should handle multiple prior gifts exhausting exemption', () => {
      const priorGifts: Gift[] = [
        {
          year: 2020,
          amount: 200000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2022,
          amount: 200000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
      ]

      const currentGift: Gift = {
        year: 2024,
        amount: 100000,
        beneficiaryId: 'child-1',
        relationshipType: 'child',
      }

      const result = calculateGiftTax(currentGift, priorGifts)

      // All exemption (€400,000) already used
      expect(result.exemption).toBe(0)
      expect(result.taxableAmount).toBe(100000)
      expect(result.periodUsedExemption).toBe(400000)
    })
  })

  describe('groupGiftsByPeriod', () => {
    it('should group gifts into single period if all within 10 years', () => {
      const gifts: Gift[] = [
        {
          year: 2020,
          amount: 100000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2024,
          amount: 100000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2028,
          amount: 100000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
      ]

      const periods = groupGiftsByPeriod(gifts)

      expect(periods).toHaveLength(1)
      expect(periods[0]).toHaveLength(3)
    })

    it('should split gifts into multiple periods if spanning more than 10 years', () => {
      const gifts: Gift[] = [
        {
          year: 2020,
          amount: 100000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2025,
          amount: 100000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2030,
          amount: 100000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2035,
          amount: 100000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
      ]

      const periods = groupGiftsByPeriod(gifts)

      expect(periods).toHaveLength(2)
      expect(periods[0]).toHaveLength(2) // 2020, 2025 (2030 is >= 10 years later)
      expect(periods[1]).toHaveLength(2) // 2030, 2035
    })

    it('should handle empty gift array', () => {
      const periods = groupGiftsByPeriod([])
      expect(periods).toHaveLength(0)
    })

    it('should handle unsorted gifts correctly', () => {
      const gifts: Gift[] = [
        {
          year: 2030,
          amount: 100000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2020,
          amount: 100000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2025,
          amount: 100000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
      ]

      const periods = groupGiftsByPeriod(gifts)

      expect(periods).toHaveLength(2)
      expect(periods[0][0].year).toBe(2020)
      expect(periods[1][0].year).toBe(2030)
    })
  })

  describe('calculateGiftTaxSchedule', () => {
    it('should calculate tax for multiple gifts respecting 10-year periods', () => {
      const gifts: Gift[] = [
        {
          year: 2020,
          amount: 400000, // Use full exemption
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2024,
          amount: 100000, // Within same period, should be taxed
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2035,
          amount: 400000, // New period (>10 years after both prior gifts), full exemption
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
      ]

      const results = calculateGiftTaxSchedule(gifts)

      expect(results).toHaveLength(3)

      // First gift: fully exempt
      expect(results[0].tax).toBe(0)
      expect(results[0].exemption).toBe(400000)

      // Second gift: fully taxed (in same period, exemption exhausted)
      expect(results[1].taxableAmount).toBe(100000)
      expect(results[1].tax).toBeGreaterThan(0)

      // Third gift: fully exempt (new period - more than 10 years after all prior gifts)
      expect(results[2].tax).toBe(0)
      expect(results[2].exemption).toBe(400000)
    })

    it('should handle gifts to different beneficiaries independently', () => {
      const gifts: Gift[] = [
        {
          year: 2020,
          amount: 400000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2020,
          amount: 400000,
          beneficiaryId: 'child-2',
          relationshipType: 'child',
        },
      ]

      const results = calculateGiftTaxSchedule(gifts)

      // Both should be fully exempt as they're to different beneficiaries
      expect(results[0].tax).toBe(0)
      expect(results[1].tax).toBe(0)
    })

    it('should calculate progressive tax correctly for large gifts', () => {
      const gifts: Gift[] = [
        {
          year: 2024,
          amount: 1000000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
      ]

      const results = calculateGiftTaxSchedule(gifts)

      expect(results[0].taxableAmount).toBe(600000) // 1M - 400K exemption
      expect(results[0].taxClass).toBe('I')
      // Progressive tax calculation:
      // €75,000 at 7% = €5,250
      // €225,000 at 11% = €24,750
      // €300,000 at 15% = €45,000
      // Total: €75,000
      const expectedTax = 75000 * 0.07 + 225000 * 0.11 + 300000 * 0.15
      expect(results[0].tax).toBeCloseTo(expectedTax, 2)
    })
  })

  describe('optimizeGiftStrategy', () => {
    it('should suggest using full exemption when amount equals exemption', () => {
      const result = optimizeGiftStrategy(400000, 'child', 2024, 5)

      expect(result.suggestedGifts).toHaveLength(1)
      expect(result.suggestedGifts[0].amount).toBe(400000)
      expect(result.suggestedGifts[0].year).toBe(2024)
      expect(result.totalTax).toBe(0)
      expect(result.savings).toBeGreaterThanOrEqual(0)
    })

    it('should split large amount across multiple 10-year periods', () => {
      const result = optimizeGiftStrategy(800000, 'child', 2024, 20)

      expect(result.suggestedGifts).toHaveLength(2)
      expect(result.suggestedGifts[0].year).toBe(2024)
      expect(result.suggestedGifts[0].amount).toBe(400000)
      expect(result.suggestedGifts[1].year).toBe(2034)
      expect(result.suggestedGifts[1].amount).toBe(400000)
      // Both gifts are fully exempt (€400,000 each in separate periods)
      expect(result.totalTax).toBe(0)
    })

    it('should minimize tax compared to single large transfer', () => {
      const targetAmount = 1000000
      const result = optimizeGiftStrategy(targetAmount, 'child', 2024, 20)

      // Calculate what single transfer would cost
      const singleTransferTaxableAmount = targetAmount - INHERITANCE_TAX_EXEMPTIONS.child
      expect(singleTransferTaxableAmount).toBe(600000)

      // Optimized strategy should save money
      expect(result.savings).toBeGreaterThan(0)
      expect(result.totalTax).toBeLessThan(
        75000 * 0.07 + 225000 * 0.11 + 300000 * 0.15, // Single transfer tax
      )
    })

    it('should handle spouse gifts with higher exemption', () => {
      const result = optimizeGiftStrategy(500000, 'spouse', 2024, 5)

      expect(result.suggestedGifts).toHaveLength(1)
      expect(result.suggestedGifts[0].amount).toBe(500000)
      expect(result.totalTax).toBe(0)
    })

    it('should handle amount exceeding available periods', () => {
      const result = optimizeGiftStrategy(1200000, 'child', 2024, 15)

      // Can fit 2 periods in 15 years: 2024 and 2034
      // First period: €400,000
      // Second period: €400,000
      // Remaining: €400,000 added to last gift
      expect(result.suggestedGifts).toHaveLength(2)
      expect(result.suggestedGifts[0].amount).toBe(400000)
      expect(result.suggestedGifts[1].amount).toBe(800000) // 400k + 400k remainder
    })

    it('should optimize for siblings with lower exemption', () => {
      const result = optimizeGiftStrategy(100000, 'sibling', 2024, 20)

      // Sibling exemption is €20,000
      // Can use 5 periods in 20 years
      expect(result.suggestedGifts.length).toBeGreaterThan(0)
      expect(result.suggestedGifts[0].amount).toBe(20000)
    })
  })

  describe('calculateChainGiftStrategy', () => {
    it('should calculate tax for direct transfer vs chain', () => {
      const amount = 500000
      const chain: RelationshipType[] = ['child', 'grandchild']

      const result = calculateChainGiftStrategy(amount, chain, 2024)

      expect(result.steps).toHaveLength(2)

      // Step 1: Parent to child (€500,000 with €400,000 exemption)
      expect(result.steps[0].relationshipType).toBe('child')
      expect(result.steps[0].grossAmount).toBe(500000)
      // €100,000 is taxable at 7% = €7,000 + €25,000 at 11% = €2,750 = total ~€7,750
      const expectedTaxStep1 = 75000 * 0.07 + 25000 * 0.11
      expect(result.steps[0].tax).toBeCloseTo(expectedTaxStep1, 0)

      // Step 2: Child to grandchild (receives net from step 1)
      expect(result.steps[1].relationshipType).toBe('grandchild')
      expect(result.steps[1].grossAmount).toBe(result.steps[0].netAmount)

      expect(result.finalNetAmount).toBeLessThanOrEqual(amount)
      expect(result.totalTax).toBeGreaterThanOrEqual(0)
    })

    it('should show chain gifting may have more total tax but reach further generation', () => {
      const amount = 300000
      const chain: RelationshipType[] = ['child', 'grandchild']

      const result = calculateChainGiftStrategy(amount, chain, 2024)

      // First step: €300,000 to child (below €400,000 exemption) - no tax
      expect(result.steps[0].tax).toBe(0)
      // Second step: €300,000 to grandchild (above €200,000 exemption)
      // €100,000 is taxable at tax class I rates
      const expectedTaxStep2 = 75000 * 0.07 + 25000 * 0.11
      expect(result.steps[1].tax).toBeCloseTo(expectedTaxStep2, 0)
    })

    it('should handle longer chains', () => {
      const amount = 200000
      const chain: RelationshipType[] = ['child', 'grandchild', 'child']

      const result = calculateChainGiftStrategy(amount, chain, 2024)

      expect(result.steps).toHaveLength(3)
      expect(result.finalNetAmount).toBeLessThanOrEqual(amount)
    })

    it('should show immediate effect of low exemption relationships in chain', () => {
      const amount = 100000
      const chain: RelationshipType[] = ['other', 'other'] // €20,000 exemption each

      const result = calculateChainGiftStrategy(amount, chain, 2024)

      // Both steps should have significant tax due to low exemption
      expect(result.totalTax).toBeGreaterThan(0)
      expect(result.finalNetAmount).toBeLessThan(amount * 0.6) // Significant tax loss
    })
  })

  describe('getRemainingExemption', () => {
    it('should return full exemption when no gifts in last 10 years', () => {
      const remaining = getRemainingExemption('child', [])
      expect(remaining).toBe(INHERITANCE_TAX_EXEMPTIONS.child)
    })

    it('should return reduced exemption when some used', () => {
      const gifts: Gift[] = [
        {
          year: 2020,
          amount: 200000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
      ]

      const remaining = getRemainingExemption('child', gifts)
      expect(remaining).toBe(200000) // 400,000 - 200,000
    })

    it('should return zero when exemption fully used', () => {
      const gifts: Gift[] = [
        {
          year: 2020,
          amount: 250000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
        {
          year: 2022,
          amount: 150000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
      ]

      const remaining = getRemainingExemption('child', gifts)
      expect(remaining).toBe(0) // 400,000 - 400,000
    })

    it('should return zero when gifts exceed exemption', () => {
      const gifts: Gift[] = [
        {
          year: 2020,
          amount: 500000,
          beneficiaryId: 'child-1',
          relationshipType: 'child',
        },
      ]

      const remaining = getRemainingExemption('child', gifts)
      expect(remaining).toBe(0)
    })

    it('should handle different relationship types', () => {
      const spouseRemaining = getRemainingExemption('spouse', [])
      expect(spouseRemaining).toBe(500000)

      const grandchildRemaining = getRemainingExemption('grandchild', [])
      expect(grandchildRemaining).toBe(200000)

      const siblingRemaining = getRemainingExemption('sibling', [])
      expect(siblingRemaining).toBe(20000)
    })
  })
})
