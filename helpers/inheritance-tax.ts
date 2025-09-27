import type { RelationshipType } from '../src/utils/sparplan-utils'

/**
 * German inheritance tax exemptions (Freibeträge) by relationship type
 * Based on German Erbschaftsteuer- und Schenkungsteuergesetz (ErbStG)
 */
export const INHERITANCE_TAX_EXEMPTIONS: Record<RelationshipType, number> = {
  spouse: 500000, // €500,000 for spouses
  child: 400000, // €400,000 for children and stepchildren
  grandchild: 200000, // €200,000 for grandchildren
  parent_from_descendant: 100000, // €100,000 for parents inheriting from descendants
  parent_other: 20000, // €20,000 for parents in other cases
  sibling: 20000, // €20,000 for siblings
  other: 20000, // €20,000 for other relatives and unrelated persons
}

/**
 * German inheritance tax classes and rates
 * Class I: Spouses, children, grandchildren, parents (favorable rates)
 * Class II: Siblings, grandparents, nephews/nieces, divorced spouses
 * Class III: All other relatives and unrelated persons (highest rates)
 */
export type InheritanceTaxClass = 'I' | 'II' | 'III'

export const RELATIONSHIP_TO_TAX_CLASS: Record<RelationshipType, InheritanceTaxClass> = {
  spouse: 'I',
  child: 'I',
  grandchild: 'I',
  parent_from_descendant: 'I',
  parent_other: 'II',
  sibling: 'II',
  other: 'III',
}

/**
 * Tax rates by tax class and taxable amount ranges
 * Rates are progressive within each class
 */
export const INHERITANCE_TAX_RATES = {
  I: [
    { upTo: 75000, rate: 0.07 }, // 7%
    { upTo: 300000, rate: 0.11 }, // 11%
    { upTo: 600000, rate: 0.15 }, // 15%
    { upTo: 6000000, rate: 0.19 }, // 19%
    { upTo: 13000000, rate: 0.23 }, // 23%
    { upTo: 26000000, rate: 0.27 }, // 27%
    { upTo: Infinity, rate: 0.30 }, // 30%
  ],
  II: [
    { upTo: 75000, rate: 0.15 }, // 15%
    { upTo: 300000, rate: 0.20 }, // 20%
    { upTo: 600000, rate: 0.25 }, // 25%
    { upTo: 6000000, rate: 0.30 }, // 30%
    { upTo: 13000000, rate: 0.35 }, // 35%
    { upTo: 26000000, rate: 0.40 }, // 40%
    { upTo: Infinity, rate: 0.43 }, // 43%
  ],
  III: [
    { upTo: 75000, rate: 0.30 }, // 30%
    { upTo: 300000, rate: 0.35 }, // 35%
    { upTo: 600000, rate: 0.40 }, // 40%
    { upTo: 6000000, rate: 0.43 }, // 43%
    { upTo: 13000000, rate: 0.45 }, // 45%
    { upTo: 26000000, rate: 0.48 }, // 48%
    { upTo: Infinity, rate: 0.50 }, // 50%
  ],
}

/**
 * Calculate German inheritance tax based on relationship and gross inheritance amount
 *
 * @param grossAmount - Gross inheritance amount before tax
 * @param relationshipType - Relationship to deceased person
 * @returns Object with tax calculation details
 */
export function calculateInheritanceTax(
  grossAmount: number,
  relationshipType: RelationshipType,
): {
  grossAmount: number
  exemption: number
  taxableAmount: number
  tax: number
  netAmount: number
  taxClass: InheritanceTaxClass
  effectiveTaxRate: number
} {
  const exemption = INHERITANCE_TAX_EXEMPTIONS[relationshipType]
  const taxClass = RELATIONSHIP_TO_TAX_CLASS[relationshipType]
  const taxableAmount = Math.max(0, grossAmount - exemption)

  // Calculate progressive tax
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

  const netAmount = grossAmount - tax
  const effectiveTaxRate = grossAmount > 0 ? tax / grossAmount : 0

  return {
    grossAmount,
    exemption,
    taxableAmount,
    tax,
    netAmount,
    taxClass,
    effectiveTaxRate,
  }
}

/**
 * Get human-readable relationship type label in German
 */
export function getRelationshipTypeLabel(relationshipType: RelationshipType): string {
  const labels: Record<RelationshipType, string> = {
    spouse: 'Ehegatte/Ehegattin',
    child: 'Kind/Stiefkind',
    grandchild: 'Enkelkind',
    parent_from_descendant: 'Eltern (von Nachkommen)',
    parent_other: 'Eltern (sonstige)',
    sibling: 'Geschwister',
    other: 'Sonstige/Nicht verwandt',
  }
  return labels[relationshipType]
}

/**
 * Get human-readable expense type label in German
 */
export function getExpenseTypeLabel(expenseType: string): string {
  const labels: Record<string, string> = {
    car: 'Autokauf',
    real_estate: 'Immobilienkauf',
    education: 'Bildungsausgaben',
    medical: 'Medizinische Ausgaben',
    other: 'Sonstige Ausgaben',
  }
  return labels[expenseType] || expenseType
}
