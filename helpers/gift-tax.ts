import type { RelationshipType } from '../src/utils/sparplan-utils'
import {
  INHERITANCE_TAX_EXEMPTIONS,
  RELATIONSHIP_TO_TAX_CLASS,
  INHERITANCE_TAX_RATES,
  type InheritanceTaxClass,
} from './inheritance-tax'

/**
 * German gift tax (Schenkungssteuer) calculations
 *
 * Gift tax uses the same exemptions and tax classes as inheritance tax,
 * but exemptions reset every 10 years when gifting to the same person.
 * This allows for strategic lifetime wealth transfer planning.
 */

/**
 * Represents a single gift to a beneficiary
 */
export type Gift = {
  year: number
  amount: number
  beneficiaryId: string
  relationshipType: RelationshipType
  description?: string
}

/**
 * Beneficiary receiving gifts
 */
export type Beneficiary = {
  id: string
  name: string
  relationshipType: RelationshipType
}

/**
 * Result of gift tax calculation for a single gift
 */
export type GiftTaxResult = {
  gift: Gift
  exemption: number
  taxableAmount: number
  tax: number
  netAmount: number
  taxClass: InheritanceTaxClass
  effectiveTaxRate: number
  periodUsedExemption: number // Total exemption used in this 10-year period
}

/**
 * Calculate gift tax for a single gift, considering prior gifts in the same 10-year period
 *
 * @param gift - The gift to calculate tax for
 * @param priorGiftsInPeriod - Gifts to the same person in the last 10 years
 * @returns Gift tax calculation result
 */
export function calculateGiftTax(gift: Gift, priorGiftsInPeriod: Gift[] = []): GiftTaxResult {
  const totalExemption = INHERITANCE_TAX_EXEMPTIONS[gift.relationshipType]
  const taxClass = RELATIONSHIP_TO_TAX_CLASS[gift.relationshipType]

  // Calculate how much exemption has already been used in this 10-year period
  const usedExemption = priorGiftsInPeriod.reduce((sum, priorGift) => {
    return sum + Math.min(priorGift.amount, totalExemption)
  }, 0)

  // Remaining exemption for this gift
  const remainingExemption = Math.max(0, totalExemption - usedExemption)
  const effectiveExemption = Math.min(gift.amount, remainingExemption)

  // Calculate taxable amount
  const taxableAmount = Math.max(0, gift.amount - effectiveExemption)

  // Calculate progressive tax using same rates as inheritance tax
  let tax = 0
  let remainingAmount = taxableAmount
  const rates = INHERITANCE_TAX_RATES[taxClass]
  let previousThreshold = 0

  for (const bracket of rates) {
    const bracketSize = bracket.upTo - previousThreshold
    const taxableInBracket = Math.min(remainingAmount, bracketSize)
    tax += taxableInBracket * bracket.rate
    remainingAmount -= taxableInBracket
    previousThreshold = bracket.upTo

    if (remainingAmount <= 0) break
  }

  const netAmount = gift.amount - tax
  const effectiveTaxRate = gift.amount > 0 ? tax / gift.amount : 0
  const periodUsedExemption = usedExemption + effectiveExemption

  return {
    gift,
    exemption: effectiveExemption,
    taxableAmount,
    tax,
    netAmount,
    taxClass,
    effectiveTaxRate,
    periodUsedExemption,
  }
}

/**
 * Groups gifts by 10-year periods for the same beneficiary
 *
 * @param gifts - All gifts to a beneficiary, sorted by year
 * @returns Array of gift groups, each representing a 10-year period
 */
export function groupGiftsByPeriod(gifts: Gift[]): Gift[][] {
  if (gifts.length === 0) return []

  const sortedGifts = [...gifts].sort((a, b) => a.year - b.year)
  const periods: Gift[][] = []
  let currentPeriod: Gift[] = []
  let periodStartYear = sortedGifts[0].year

  for (const gift of sortedGifts) {
    // If this gift is more than 10 years after the period start, start a new period
    if (gift.year >= periodStartYear + 10) {
      if (currentPeriod.length > 0) {
        periods.push(currentPeriod)
      }
      currentPeriod = [gift]
      periodStartYear = gift.year
    } else {
      currentPeriod.push(gift)
    }
  }

  if (currentPeriod.length > 0) {
    periods.push(currentPeriod)
  }

  return periods
}

/**
 * Calculate total gift tax for all gifts to a beneficiary over time
 *
 * @param gifts - All gifts to the beneficiary
 * @returns Array of tax results for each gift
 */
export function calculateGiftTaxSchedule(gifts: Gift[]): GiftTaxResult[] {
  const results: GiftTaxResult[] = []
  const sortedGifts = [...gifts].sort((a, b) => a.year - b.year)

  for (let i = 0; i < sortedGifts.length; i++) {
    const currentGift = sortedGifts[i]
    const currentYear = currentGift.year

    // Find all prior gifts in the same 10-year period
    // A gift is in the same period if it's less than 10 years before (not equal to 10)
    const priorGiftsInPeriod = sortedGifts
      .slice(0, i)
      .filter(g => g.beneficiaryId === currentGift.beneficiaryId && g.year > currentYear - 10)

    const result = calculateGiftTax(currentGift, priorGiftsInPeriod)
    results.push(result)
  }

  return results
}

/**
 * Generate optimal gift distribution across available periods
 */
function generateOptimalGifts(
  targetAmount: number,
  exemption: number,
  startYear: number,
  numberOfPeriods: number,
): Array<{ year: number; amount: number }> {
  const suggestedGifts: Array<{ year: number; amount: number }> = []
  let remainingAmount = targetAmount

  for (let period = 0; period < numberOfPeriods && remainingAmount > 0; period++) {
    const giftYear = startYear + period * 10
    const giftAmount = Math.min(exemption, remainingAmount)

    suggestedGifts.push({
      year: giftYear,
      amount: giftAmount,
    })

    remainingAmount -= giftAmount
  }

  // If there's still amount remaining, add it to the last gift
  if (remainingAmount > 0 && suggestedGifts.length > 0) {
    const lastGift = suggestedGifts[suggestedGifts.length - 1]
    lastGift.amount += remainingAmount
  }

  return suggestedGifts
}

/**
 * Calculate optimal gift strategy to minimize total tax
 *
 * This function suggests an optimal gifting schedule to transfer a target amount
 * while minimizing gift and estate taxes.
 *
 * @param targetAmount - Total amount to transfer
 * @param relationshipType - Relationship to beneficiary
 * @param startYear - Year to start gifting
 * @param yearsAvailable - Number of years available for gifting
 * @returns Suggested gift schedule
 */
export function optimizeGiftStrategy(
  targetAmount: number,
  relationshipType: RelationshipType,
  startYear: number,
  yearsAvailable: number,
): {
  suggestedGifts: Array<{ year: number; amount: number }>
  totalTax: number
  totalNet: number
  savings: number // Savings compared to single transfer
} {
  const exemption = INHERITANCE_TAX_EXEMPTIONS[relationshipType]
  const numberOfPeriods = Math.floor(yearsAvailable / 10) + 1

  // Generate optimal gift distribution
  const suggestedGifts = generateOptimalGifts(targetAmount, exemption, startYear, numberOfPeriods)

  // Calculate total tax for the suggested strategy
  const giftObjects: Gift[] = suggestedGifts.map((g, index) => ({
    year: g.year,
    amount: g.amount,
    beneficiaryId: 'beneficiary',
    relationshipType,
    description: `Optimierte Schenkung ${index + 1}`,
  }))

  const results = calculateGiftTaxSchedule(giftObjects)
  const totalTax = results.reduce((sum, r) => sum + r.tax, 0)
  const totalNet = targetAmount - totalTax

  // Calculate tax for single transfer (baseline for comparison)
  const singleTransferGift: Gift = {
    year: startYear,
    amount: targetAmount,
    beneficiaryId: 'beneficiary',
    relationshipType,
  }
  const singleTransferResult = calculateGiftTax(singleTransferGift, [])
  const savings = singleTransferResult.tax - totalTax

  return {
    suggestedGifts,
    totalTax,
    totalNet,
    savings,
  }
}

/**
 * Calculate chain gifting strategy (multi-generational)
 *
 * For example, gifting to children who then gift to grandchildren
 * can maximize exemption usage across generations.
 *
 * @param amount - Amount to transfer
 * @param chain - Array of relationship types in the chain
 * @param startYear - Starting year
 * @returns Results for each step in the chain
 */
export function calculateChainGiftStrategy(
  amount: number,
  chain: RelationshipType[],
  startYear: number,
): {
  steps: Array<{
    relationshipType: RelationshipType
    year: number
    grossAmount: number
    tax: number
    netAmount: number
  }>
  totalTax: number
  finalNetAmount: number
} {
  const steps: Array<{
    relationshipType: RelationshipType
    year: number
    grossAmount: number
    tax: number
    netAmount: number
  }> = []

  let currentAmount = amount
  let currentYear = startYear

  for (const relationshipType of chain) {
    const gift: Gift = {
      year: currentYear,
      amount: currentAmount,
      beneficiaryId: `step-${steps.length}`,
      relationshipType,
    }

    const result = calculateGiftTax(gift, [])

    steps.push({
      relationshipType,
      year: currentYear,
      grossAmount: currentAmount,
      tax: result.tax,
      netAmount: result.netAmount,
    })

    currentAmount = result.netAmount
    currentYear += 1 // Chain gifts happen in subsequent years
  }

  const totalTax = steps.reduce((sum, step) => sum + step.tax, 0)
  const finalNetAmount = currentAmount

  return {
    steps,
    totalTax,
    finalNetAmount,
  }
}

/**
 * Calculate remaining exemption for a beneficiary
 *
 * @param relationshipType - Relationship to beneficiary
 * @param giftsInLast10Years - Gifts to this beneficiary in the last 10 years
 * @returns Remaining exemption amount
 */
export function getRemainingExemption(relationshipType: RelationshipType, giftsInLast10Years: Gift[]): number {
  const totalExemption = INHERITANCE_TAX_EXEMPTIONS[relationshipType]
  const usedExemption = giftsInLast10Years.reduce((sum, gift) => sum + Math.min(gift.amount, totalExemption), 0)
  return Math.max(0, totalExemption - usedExemption)
}
