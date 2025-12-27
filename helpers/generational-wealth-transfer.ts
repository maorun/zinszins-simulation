import type { RelationshipType } from '../src/utils/sparplan-utils'
import { calculateGiftTax, type Gift, type GiftTaxResult } from './gift-tax'
import { INHERITANCE_TAX_EXEMPTIONS } from './inheritance-tax'

/**
 * Multi-generational wealth transfer planning
 * Extends single-beneficiary gift planning to handle multiple family members across generations
 */

/**
 * Represents a family member in the generational wealth transfer plan
 */
export type FamilyMember = {
  id: string
  name: string
  generation: number // 0 = current generation (donor), 1 = children, 2 = grandchildren, etc.
  relationshipType: RelationshipType
  birthYear?: number
  parentId?: string // Link to parent family member (for tree structure)
}

/**
 * Configuration for multi-generational wealth transfer
 */
export type GenerationalTransferConfig = {
  currentYear: number
  donorId: string // ID of the person transferring wealth
  totalWealth: number // Total wealth to distribute
  familyMembers: FamilyMember[] // All family members who may receive gifts
  timeHorizonYears: number // Planning horizon (e.g., 30 years)
  optimizationGoal: 'minimize_tax' | 'equal_distribution' | 'custom'
  customWeights?: Record<string, number> // Custom distribution weights by beneficiary ID
}

/**
 * Result of a gift in the generational plan
 */
export type GenerationalGiftResult = GiftTaxResult & {
  beneficiaryName: string
  beneficiaryGeneration: number
}

/**
 * Aggregated results by generation
 */
export type GenerationAggregate = {
  generation: number
  totalGross: number
  totalTax: number
  totalNet: number
  beneficiaryCount: number
}

/**
 * Aggregated results by beneficiary
 */
export type BeneficiaryAggregate = {
  beneficiaryId: string
  beneficiaryName: string
  totalGross: number
  totalTax: number
  totalNet: number
  giftsCount: number
}

/**
 * Complete generational transfer plan result
 */
export type GenerationalTransferPlan = {
  config: GenerationalTransferConfig
  gifts: GenerationalGiftResult[]
  totalGifted: number
  totalTax: number
  totalNet: number
  byGeneration: Record<number, GenerationAggregate>
  byBeneficiary: Record<string, BeneficiaryAggregate>
}

/**
 * Calculate the optimal number of 10-year periods available for a beneficiary
 * based on the time horizon and their age
 */
function calculateAvailablePeriods(
  currentYear: number,
  timeHorizonYears: number,
  beneficiaryBirthYear?: number,
): number {
  // If no birth year, assume full time horizon is available
  if (!beneficiaryBirthYear) {
    return Math.floor(timeHorizonYears / 10) + 1
  }

  const beneficiaryAge = currentYear - beneficiaryBirthYear
  const remainingYears = Math.max(0, Math.min(timeHorizonYears, 100 - beneficiaryAge))

  return Math.max(1, Math.floor(remainingYears / 10) + 1)
}

/**
 * Calculate equal distribution across all beneficiaries
 */
function calculateEqualDistribution(
  totalWealth: number,
  familyMembers: FamilyMember[],
): Record<string, number> {
  const distribution: Record<string, number> = {}
  const count = familyMembers.length

  if (count === 0) return distribution

  const amountPerPerson = totalWealth / count

  for (const member of familyMembers) {
    distribution[member.id] = amountPerPerson
  }

  return distribution
}

/**
 * Calculate tax-optimized distribution across beneficiaries
 * Prioritizes beneficiaries with higher exemptions and lower tax rates
 */
function calculateTaxOptimizedDistribution(
  totalWealth: number,
  familyMembers: FamilyMember[],
  currentYear: number,
  timeHorizonYears: number,
): Record<string, number> {
  const distribution: Record<string, number> = {}

  // Sort beneficiaries by exemption amount (descending) and tax efficiency
  const sortedMembers = [...familyMembers].sort((a, b) => {
    const exemptionA = INHERITANCE_TAX_EXEMPTIONS[a.relationshipType]
    const exemptionB = INHERITANCE_TAX_EXEMPTIONS[b.relationshipType]
    return exemptionB - exemptionA
  })

  let remainingWealth = totalWealth

  for (const member of sortedMembers) {
    const exemption = INHERITANCE_TAX_EXEMPTIONS[member.relationshipType]
    const availablePeriods = calculateAvailablePeriods(
      currentYear,
      timeHorizonYears,
      member.birthYear,
    )

    // Calculate maximum that can be transferred tax-free
    const maxTaxFree = exemption * availablePeriods

    // Allocate up to the tax-free amount, or remaining wealth if less
    const allocation = Math.min(maxTaxFree, remainingWealth)
    distribution[member.id] = allocation
    remainingWealth -= allocation

    if (remainingWealth <= 0) break
  }

  // If there's still wealth remaining, distribute proportionally based on exemptions
  if (remainingWealth > 0) {
    const totalExemptions = sortedMembers.reduce(
      (sum, m) => sum + INHERITANCE_TAX_EXEMPTIONS[m.relationshipType],
      0,
    )

    for (const member of sortedMembers) {
      const exemption = INHERITANCE_TAX_EXEMPTIONS[member.relationshipType]
      const proportion = exemption / totalExemptions
      distribution[member.id] = (distribution[member.id] || 0) + remainingWealth * proportion
    }
  }

  return distribution
}

/**
 * Generate gift schedule for a beneficiary to minimize tax
 */
function generateGiftSchedule(
  beneficiary: FamilyMember,
  totalAmount: number,
  currentYear: number,
  timeHorizonYears: number,
): Gift[] {
  const gifts: Gift[] = []
  const exemption = INHERITANCE_TAX_EXEMPTIONS[beneficiary.relationshipType]
  const availablePeriods = calculateAvailablePeriods(
    currentYear,
    timeHorizonYears,
    beneficiary.birthYear,
  )

  let remainingAmount = totalAmount
  const endYear = currentYear + timeHorizonYears

  for (let period = 0; period < availablePeriods && remainingAmount > 0; period++) {
    const giftYear = Math.min(currentYear + period * 10, endYear)

    // Distribute remaining amount across remaining periods
    const remainingPeriods = availablePeriods - period
    const optimalGiftAmount = Math.min(exemption, remainingAmount / remainingPeriods)

    gifts.push({
      year: giftYear,
      amount: optimalGiftAmount,
      beneficiaryId: beneficiary.id,
      relationshipType: beneficiary.relationshipType,
      description: `Generationenübergreifende Schenkung Periode ${period + 1}`,
    })

    remainingAmount -= optimalGiftAmount
  }

  return gifts
}

/**
 * Calculate gift schedule and tax results for all beneficiaries
 */
function calculateAllGiftResults(
  config: GenerationalTransferConfig,
  distribution: Record<string, number>,
): GenerationalGiftResult[] {
  // Generate gift schedules for each beneficiary
  const allGifts: Gift[] = []

  for (const member of config.familyMembers) {
    const allocation = distribution[member.id] || 0
    if (allocation > 0) {
      const memberGifts = generateGiftSchedule(
        member,
        allocation,
        config.currentYear,
        config.timeHorizonYears,
      )
      allGifts.push(...memberGifts)
    }
  }

  // Sort gifts by year
  allGifts.sort((a, b) => a.year - b.year)

  // Calculate tax for each gift
  const giftsByBeneficiary = new Map<string, Gift[]>()
  for (const gift of allGifts) {
    const existing = giftsByBeneficiary.get(gift.beneficiaryId) || []
    giftsByBeneficiary.set(gift.beneficiaryId, [...existing, gift])
  }

  const results: GenerationalGiftResult[] = []

  for (const [beneficiaryId, gifts] of giftsByBeneficiary) {
    const beneficiary = config.familyMembers.find((m) => m.id === beneficiaryId)
    if (!beneficiary) continue

    // Calculate tax for each gift considering prior gifts to same beneficiary
    for (let i = 0; i < gifts.length; i++) {
      const currentGift = gifts[i]
      const priorGifts = gifts.slice(0, i).filter((g) => g.year > currentGift.year - 10)

      const taxResult = calculateGiftTax(currentGift, priorGifts)
      results.push({
        ...taxResult,
        beneficiaryName: beneficiary.name,
        beneficiaryGeneration: beneficiary.generation,
      })
    }
  }

  return results
}

/**
 * Aggregate results by generation
 */
function aggregateByGeneration(results: GenerationalGiftResult[]): Record<number, GenerationAggregate> {
  const byGeneration: Record<number, GenerationAggregate> = {}
  
  for (const result of results) {
    const gen = result.beneficiaryGeneration
    if (!byGeneration[gen]) {
      byGeneration[gen] = {
        generation: gen,
        totalGross: 0,
        totalTax: 0,
        totalNet: 0,
        beneficiaryCount: 0,
      }
    }
    byGeneration[gen].totalGross += result.gift.amount
    byGeneration[gen].totalTax += result.tax
    byGeneration[gen].totalNet += result.netAmount
  }

  // Count unique beneficiaries per generation
  for (const gen of Object.keys(byGeneration)) {
    const uniqueBeneficiaries = new Set(
      results
        .filter((r) => r.beneficiaryGeneration === Number(gen))
        .map((r) => r.gift.beneficiaryId),
    )
    byGeneration[Number(gen)].beneficiaryCount = uniqueBeneficiaries.size
  }

  return byGeneration
}

/**
 * Aggregate results by beneficiary
 */
function aggregateByBeneficiary(results: GenerationalGiftResult[]): Record<string, BeneficiaryAggregate> {
  const byBeneficiary: Record<string, BeneficiaryAggregate> = {}
  
  for (const result of results) {
    const id = result.gift.beneficiaryId
    if (!byBeneficiary[id]) {
      byBeneficiary[id] = {
        beneficiaryId: id,
        beneficiaryName: result.beneficiaryName,
        totalGross: 0,
        totalTax: 0,
        totalNet: 0,
        giftsCount: 0,
      }
    }
    byBeneficiary[id].totalGross += result.gift.amount
    byBeneficiary[id].totalTax += result.tax
    byBeneficiary[id].totalNet += result.netAmount
    byBeneficiary[id].giftsCount += 1
  }

  return byBeneficiary
}

/**
 * Create a comprehensive generational wealth transfer plan
 *
 * @param config - Configuration for the generational transfer
 * @returns Complete transfer plan with tax calculations
 */
export function createGenerationalTransferPlan(
  config: GenerationalTransferConfig,
): GenerationalTransferPlan {
  // Determine distribution based on optimization goal
  let distribution: Record<string, number>

  switch (config.optimizationGoal) {
    case 'equal_distribution':
      distribution = calculateEqualDistribution(config.totalWealth, config.familyMembers)
      break
    case 'custom':
      distribution = config.customWeights || {}
      break
    case 'minimize_tax':
    default:
      distribution = calculateTaxOptimizedDistribution(
        config.totalWealth,
        config.familyMembers,
        config.currentYear,
        config.timeHorizonYears,
      )
      break
  }

  // Calculate all gift results
  const results = calculateAllGiftResults(config, distribution)

  // Aggregate totals
  const totalGifted = results.reduce((sum, r) => sum + r.gift.amount, 0)
  const totalTax = results.reduce((sum, r) => sum + r.tax, 0)
  const totalNet = totalGifted - totalTax

  // Aggregate by generation and beneficiary
  const byGeneration = aggregateByGeneration(results)
  const byBeneficiary = aggregateByBeneficiary(results)

  return {
    config,
    gifts: results,
    totalGifted,
    totalTax,
    totalNet,
    byGeneration,
    byBeneficiary,
  }
}

/**
 * Compare different distribution strategies
 *
 * @param config - Base configuration
 * @returns Comparison of different strategies
 */
export function compareTransferStrategies(config: GenerationalTransferConfig): {
  minimizeTax: GenerationalTransferPlan
  equalDistribution: GenerationalTransferPlan
  custom: GenerationalTransferPlan | null
} {
  const minimizeTax = createGenerationalTransferPlan({
    ...config,
    optimizationGoal: 'minimize_tax',
  })

  const equalDistribution = createGenerationalTransferPlan({
    ...config,
    optimizationGoal: 'equal_distribution',
  })

  const custom = config.customWeights
    ? createGenerationalTransferPlan({
        ...config,
        optimizationGoal: 'custom',
      })
    : null

  return {
    minimizeTax,
    equalDistribution,
    custom,
  }
}

/**
 * Get family members by generation
 */
export function getFamilyMembersByGeneration(
  familyMembers: FamilyMember[],
): Record<number, FamilyMember[]> {
  const byGeneration: Record<number, FamilyMember[]> = {}

  for (const member of familyMembers) {
    if (!byGeneration[member.generation]) {
      byGeneration[member.generation] = []
    }
    byGeneration[member.generation].push(member)
  }

  return byGeneration
}

/**
 * Validate family structure for generational planning
 */
export function validateFamilyStructure(familyMembers: FamilyMember[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for at least one beneficiary
  if (familyMembers.length === 0) {
    errors.push('Mindestens ein Familienmitglied muss angegeben werden')
  }

  // Check for duplicate IDs
  const ids = familyMembers.map((m) => m.id)
  const uniqueIds = new Set(ids)
  if (ids.length !== uniqueIds.size) {
    errors.push('Doppelte Familienmitglieds-IDs gefunden')
  }

  // Check for valid generations
  for (const member of familyMembers) {
    if (member.generation < 1) {
      errors.push(
        `Familienmitglied ${member.name} hat ungültige Generation ${member.generation} (muss >= 1 sein)`,
      )
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
