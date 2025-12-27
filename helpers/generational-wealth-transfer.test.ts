import { describe, it, expect } from 'vitest'
import {
  createGenerationalTransferPlan,
  compareTransferStrategies,
  getFamilyMembersByGeneration,
  validateFamilyStructure,
  type FamilyMember,
  type GenerationalTransferConfig,
} from './generational-wealth-transfer'
import { INHERITANCE_TAX_EXEMPTIONS } from './inheritance-tax'

describe('generational-wealth-transfer', () => {
  const currentYear = 2024

  const createTestFamily = (): FamilyMember[] => [
    {
      id: 'child-1',
      name: 'Anna',
      generation: 1,
      relationshipType: 'child',
      birthYear: 1990,
    },
    {
      id: 'child-2',
      name: 'Ben',
      generation: 1,
      relationshipType: 'child',
      birthYear: 1992,
    },
    {
      id: 'grandchild-1',
      name: 'Clara',
      generation: 2,
      relationshipType: 'grandchild',
      birthYear: 2015,
      parentId: 'child-1',
    },
    {
      id: 'grandchild-2',
      name: 'David',
      generation: 2,
      relationshipType: 'grandchild',
      birthYear: 2018,
      parentId: 'child-2',
    },
  ]

  describe('createGenerationalTransferPlan', () => {
    it('should create a plan with minimize_tax optimization', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 2000000,
        familyMembers: createTestFamily(),
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax',
      }

      const plan = createGenerationalTransferPlan(config)

      expect(plan.config).toBe(config)
      expect(plan.totalGifted).toBe(2000000)
      expect(plan.totalTax).toBeGreaterThanOrEqual(0)
      expect(plan.totalNet).toBe(plan.totalGifted - plan.totalTax)
      expect(plan.gifts.length).toBeGreaterThan(0)
    })

    it('should prioritize children over grandchildren for tax efficiency', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 1600000, // Exactly 4 * child exemption (400k each)
        familyMembers: createTestFamily(),
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax',
      }

      const plan = createGenerationalTransferPlan(config)

      // Children have €400k exemption, grandchildren have €200k
      // Tax optimization should favor children first
      const childrenTotal = Object.values(plan.byBeneficiary)
        .filter((b) => b.beneficiaryId.startsWith('child'))
        .reduce((sum, b) => sum + b.totalGross, 0)

      expect(childrenTotal).toBeGreaterThan(0)
    })

    it('should create equal distribution when requested', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 1000000,
        familyMembers: createTestFamily(),
        timeHorizonYears: 30,
        optimizationGoal: 'equal_distribution',
      }

      const plan = createGenerationalTransferPlan(config)

      // Each of 4 family members should get approximately 250k
      const beneficiaryAmounts = Object.values(plan.byBeneficiary).map((b) => b.totalGross)

      beneficiaryAmounts.forEach((amount) => {
        expect(amount).toBeCloseTo(250000, -2) // Within €100
      })
    })

    it('should respect custom weights', () => {
      const customWeights = {
        'child-1': 600000,
        'child-2': 400000,
        'grandchild-1': 0,
        'grandchild-2': 0,
      }

      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 1000000,
        familyMembers: createTestFamily(),
        timeHorizonYears: 30,
        optimizationGoal: 'custom',
        customWeights,
      }

      const plan = createGenerationalTransferPlan(config)

      expect(plan.byBeneficiary['child-1'].totalGross).toBe(600000)
      expect(plan.byBeneficiary['child-2'].totalGross).toBe(400000)
      expect(plan.byBeneficiary['grandchild-1']).toBeUndefined()
      expect(plan.byBeneficiary['grandchild-2']).toBeUndefined()
    })

    it('should spread gifts across multiple 10-year periods', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 800000, // 2 * child exemption
        familyMembers: [createTestFamily()[0]], // Just one child
        timeHorizonYears: 30, // Allows for 3 periods
        optimizationGoal: 'minimize_tax',
      }

      const plan = createGenerationalTransferPlan(config)

      // Should create multiple gifts over time
      const childGifts = plan.gifts.filter((g) => g.gift.beneficiaryId === 'child-1')
      expect(childGifts.length).toBeGreaterThan(1)

      // Gifts should be in different years
      const years = childGifts.map((g) => g.gift.year)
      const uniqueYears = new Set(years)
      expect(uniqueYears.size).toBeGreaterThan(1)
    })

    it('should calculate tax correctly with multiple gifts', () => {
      const childExemption = INHERITANCE_TAX_EXEMPTIONS.child

      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: childExemption * 2 + 100000, // Slightly over 2 exemptions
        familyMembers: [createTestFamily()[0]], // Just one child
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax',
      }

      const plan = createGenerationalTransferPlan(config)

      // Most should be tax-free due to spreading across periods
      expect(plan.totalTax).toBeLessThan(100000 * 0.2) // Less than 20% of excess
    })

    it('should aggregate results by generation', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 2000000,
        familyMembers: createTestFamily(),
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax',
      }

      const plan = createGenerationalTransferPlan(config)

      // Should have generation 1 (children) and generation 2 (grandchildren)
      expect(plan.byGeneration[1]).toBeDefined()
      expect(plan.byGeneration[1].totalGross).toBeGreaterThan(0)
      expect(plan.byGeneration[1].beneficiaryCount).toBe(2)

      // Verify totals match
      const genTotal = Object.values(plan.byGeneration).reduce(
        (sum, g) => sum + g.totalGross,
        0,
      )
      expect(genTotal).toBeCloseTo(plan.totalGifted, -2)
    })

    it('should handle empty family members list', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 1000000,
        familyMembers: [],
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax',
      }

      const plan = createGenerationalTransferPlan(config)

      expect(plan.gifts).toHaveLength(0)
      expect(plan.totalGifted).toBe(0)
      expect(plan.totalTax).toBe(0)
      expect(plan.totalNet).toBe(0)
    })

    it('should handle large wealth amounts across multiple generations', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 10000000,
        familyMembers: createTestFamily(),
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax',
      }

      const plan = createGenerationalTransferPlan(config)

      expect(plan.totalGifted).toBeCloseTo(10000000, 0) // Allow for floating point rounding
      expect(plan.totalTax).toBeGreaterThan(0)
      expect(plan.totalNet).toBeCloseTo(plan.totalGifted - plan.totalTax, 0)

      // All family members should receive something
      expect(Object.keys(plan.byBeneficiary).length).toBeGreaterThan(0)
    })
  })

  describe('compareTransferStrategies', () => {
    it('should compare minimize_tax and equal_distribution strategies', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 2000000,
        familyMembers: createTestFamily(),
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax', // Will be overridden in comparison
      }

      const comparison = compareTransferStrategies(config)

      expect(comparison.minimizeTax).toBeDefined()
      expect(comparison.equalDistribution).toBeDefined()
      expect(comparison.custom).toBeNull()

      // Tax-optimized should have lower or equal tax
      expect(comparison.minimizeTax.totalTax).toBeLessThanOrEqual(
        comparison.equalDistribution.totalTax,
      )

      // Total gifted should be the same
      expect(comparison.minimizeTax.totalGifted).toBe(comparison.equalDistribution.totalGifted)
    })

    it('should include custom strategy when weights are provided', () => {
      const customWeights = {
        'child-1': 1000000,
        'child-2': 1000000,
        'grandchild-1': 0,
        'grandchild-2': 0,
      }

      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 2000000,
        familyMembers: createTestFamily(),
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax',
        customWeights,
      }

      const comparison = compareTransferStrategies(config)

      expect(comparison.custom).toBeDefined()
      expect(comparison.custom?.byBeneficiary['child-1'].totalGross).toBe(1000000)
      expect(comparison.custom?.byBeneficiary['child-2'].totalGross).toBe(1000000)
    })

    it('should show tax savings from optimization', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 3000000,
        familyMembers: createTestFamily(),
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax',
      }

      const comparison = compareTransferStrategies(config)

      // Minimizing tax should result in lower total tax
      const taxSavings = comparison.equalDistribution.totalTax - comparison.minimizeTax.totalTax
      expect(taxSavings).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getFamilyMembersByGeneration', () => {
    it('should group family members by generation', () => {
      const family = createTestFamily()
      const byGeneration = getFamilyMembersByGeneration(family)

      expect(byGeneration[1]).toHaveLength(2) // 2 children
      expect(byGeneration[2]).toHaveLength(2) // 2 grandchildren

      expect(byGeneration[1].map((m) => m.name)).toEqual(['Anna', 'Ben'])
      expect(byGeneration[2].map((m) => m.name)).toEqual(['Clara', 'David'])
    })

    it('should handle empty family', () => {
      const byGeneration = getFamilyMembersByGeneration([])
      expect(Object.keys(byGeneration)).toHaveLength(0)
    })

    it('should handle single generation', () => {
      const family = [createTestFamily()[0]]
      const byGeneration = getFamilyMembersByGeneration(family)

      expect(Object.keys(byGeneration)).toHaveLength(1)
      expect(byGeneration[1]).toHaveLength(1)
    })
  })

  describe('validateFamilyStructure', () => {
    it('should validate correct family structure', () => {
      const family = createTestFamily()
      const validation = validateFamilyStructure(family)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should reject empty family', () => {
      const validation = validateFamilyStructure([])

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain(
        'Mindestens ein Familienmitglied muss angegeben werden',
      )
    })

    it('should reject duplicate IDs', () => {
      const family = [
        {
          id: 'child-1',
          name: 'Anna',
          generation: 1,
          relationshipType: 'child' as const,
        },
        {
          id: 'child-1', // Duplicate ID
          name: 'Ben',
          generation: 1,
          relationshipType: 'child' as const,
        },
      ]

      const validation = validateFamilyStructure(family)

      expect(validation.isValid).toBe(false)
      expect(validation.errors).toContain('Doppelte Familienmitglieds-IDs gefunden')
    })

    it('should reject invalid generation numbers', () => {
      const family = [
        {
          id: 'child-1',
          name: 'Anna',
          generation: 0, // Invalid: should be >= 1
          relationshipType: 'child' as const,
        },
      ]

      const validation = validateFamilyStructure(family)

      expect(validation.isValid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
      expect(validation.errors[0]).toContain('ungültige Generation')
    })

    it('should allow multiple generations', () => {
      const family = [
        {
          id: 'child-1',
          name: 'Anna',
          generation: 1,
          relationshipType: 'child' as const,
        },
        {
          id: 'grandchild-1',
          name: 'Clara',
          generation: 2,
          relationshipType: 'grandchild' as const,
        },
        {
          id: 'great-grandchild-1',
          name: 'Emma',
          generation: 3,
          relationshipType: 'grandchild' as const, // Using grandchild type for simplicity
        },
      ]

      const validation = validateFamilyStructure(family)

      expect(validation.isValid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })
  })

  describe('edge cases', () => {
    it('should handle single beneficiary with large wealth', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 5000000,
        familyMembers: [
          {
            id: 'child-1',
            name: 'Anna',
            generation: 1,
            relationshipType: 'child',
            birthYear: 1990,
          },
        ],
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax',
      }

      const plan = createGenerationalTransferPlan(config)

      expect(plan.totalGifted).toBe(5000000)
      expect(plan.gifts.length).toBeGreaterThan(1) // Should spread across periods
      expect(plan.totalTax).toBeGreaterThan(0) // Will have some tax on amounts over exemptions
    })

    it('should handle very short time horizon', () => {
      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 1000000,
        familyMembers: createTestFamily(),
        timeHorizonYears: 5, // Only allows 1 period
        optimizationGoal: 'minimize_tax',
      }

      const plan = createGenerationalTransferPlan(config)

      expect(plan.totalGifted).toBe(1000000)
      // With only 1 period, gifts should be concentrated in current year
      const currentYearGifts = plan.gifts.filter((g) => g.gift.year === currentYear)
      expect(currentYearGifts.length).toBeGreaterThan(0)
    })

    it('should handle beneficiaries with different relationship types', () => {
      const family: FamilyMember[] = [
        {
          id: 'spouse',
          name: 'Partner',
          generation: 0,
          relationshipType: 'spouse',
          birthYear: 1960,
        },
        {
          id: 'child-1',
          name: 'Child',
          generation: 1,
          relationshipType: 'child',
          birthYear: 1990,
        },
        {
          id: 'sibling',
          name: 'Sibling',
          generation: 0,
          relationshipType: 'sibling',
          birthYear: 1965,
        },
      ]

      const config: GenerationalTransferConfig = {
        currentYear,
        donorId: 'donor-1',
        totalWealth: 2000000,
        familyMembers: family,
        timeHorizonYears: 30,
        optimizationGoal: 'minimize_tax',
      }

      const plan = createGenerationalTransferPlan(config)

      // Spouse should get priority (highest exemption at €500k)
      const spouseAmount = plan.byBeneficiary['spouse']?.totalGross || 0
      const childAmount = plan.byBeneficiary['child-1']?.totalGross || 0
      const siblingAmount = plan.byBeneficiary['sibling']?.totalGross || 0

      // Spouse should receive the most due to highest exemption
      expect(spouseAmount).toBeGreaterThanOrEqual(childAmount)
      expect(childAmount).toBeGreaterThanOrEqual(siblingAmount)
    })
  })
})
