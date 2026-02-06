/**
 * Account Type Comparison for Married Couples
 * 
 * This module provides functionality to compare tax implications of:
 * 1. Two separate individual accounts (2 × 2.000€ Freibetrag)
 * 2. One joint account (1 × 4.000€ Freibetrag)
 * 
 * For married couples in Germany, the total Sparerpauschbetrag is the same (4.000€),
 * but the tax optimization opportunities differ based on how capital gains are distributed.
 */

import { FREIBETRAG_CONSTANTS } from '../src/utils/tax-constants'

export type AccountStructure = 'separate' | 'joint'

export interface PartnerCapitalGains {
  partner1: number
  partner2: number
}

export interface AccountTypeComparison {
  structure: AccountStructure
  totalFreibetrag: number
  taxableGainsPartner1: number
  taxableGainsPartner2: number
  totalTaxableGains: number
  taxAmountPartner1: number
  taxAmountPartner2: number
  totalTaxAmount: number
  effectiveTaxRate: number
}

export interface ComparisonResult {
  separateAccounts: AccountTypeComparison
  jointAccount: AccountTypeComparison
  recommendation: AccountStructure
  taxSavings: number
  description: string
}

/**
 * Calculate taxable gains and tax amount for separate accounts
 * Each partner has their own 2.000€ Freibetrag
 */
function calculateSeparateAccountsTax(
  gains: PartnerCapitalGains,
  taxRate: number,
  teilfreistellung = 0,
): AccountTypeComparison {
  const freibetragPerPerson = FREIBETRAG_CONSTANTS.INDIVIDUAL

  // Calculate net gains after Teilfreistellung (partial exemption for equity funds)
  const netGainsPartner1 = gains.partner1 * (1 - teilfreistellung / 100)
  const netGainsPartner2 = gains.partner2 * (1 - teilfreistellung / 100)

  // Each partner can use their own Freibetrag
  const taxablePartner1 = Math.max(0, netGainsPartner1 - freibetragPerPerson)
  const taxablePartner2 = Math.max(0, netGainsPartner2 - freibetragPerPerson)

  const taxPartner1 = taxablePartner1 * (taxRate / 100)
  const taxPartner2 = taxablePartner2 * (taxRate / 100)

  const totalTaxable = taxablePartner1 + taxablePartner2
  const totalTax = taxPartner1 + taxPartner2
  const totalGains = netGainsPartner1 + netGainsPartner2

  return {
    structure: 'separate',
    totalFreibetrag: freibetragPerPerson * 2,
    taxableGainsPartner1: taxablePartner1,
    taxableGainsPartner2: taxablePartner2,
    totalTaxableGains: totalTaxable,
    taxAmountPartner1: taxPartner1,
    taxAmountPartner2: taxPartner2,
    totalTaxAmount: totalTax,
    effectiveTaxRate: totalGains > 0 ? (totalTax / totalGains) * 100 : 0,
  }
}

/**
 * Calculate taxable gains and tax amount for joint account
 * Combined 4.000€ Freibetrag, but tax is split 50/50
 */
function calculateJointAccountTax(
  gains: PartnerCapitalGains,
  taxRate: number,
  teilfreistellung = 0,
): AccountTypeComparison {
  const totalFreibetrag = FREIBETRAG_CONSTANTS.COUPLE

  // Combined gains after Teilfreistellung
  const totalGrossGains = gains.partner1 + gains.partner2
  const totalNetGains = totalGrossGains * (1 - teilfreistellung / 100)

  // Apply combined Freibetrag
  const totalTaxable = Math.max(0, totalNetGains - totalFreibetrag)

  // Tax is split evenly between partners (50/50)
  const taxablePerPartner = totalTaxable / 2
  const taxPerPartner = taxablePerPartner * (taxRate / 100)

  const totalTax = taxPerPartner * 2

  return {
    structure: 'joint',
    totalFreibetrag: totalFreibetrag,
    taxableGainsPartner1: taxablePerPartner,
    taxableGainsPartner2: taxablePerPartner,
    totalTaxableGains: totalTaxable,
    taxAmountPartner1: taxPerPartner,
    taxAmountPartner2: taxPerPartner,
    totalTaxAmount: totalTax,
    effectiveTaxRate: totalNetGains > 0 ? (totalTax / totalNetGains) * 100 : 0,
  }
}

/**
 * Compare separate vs. joint account structures for married couples
 * 
 * @param gains - Capital gains distribution between partners
 * @param taxRate - Capital gains tax rate (Kapitalertragsteuer, default 26.375%)
 * @param teilfreistellung - Partial exemption percentage for equity funds (default 0%)
 * @returns Comparison result with recommendation
 */
export function compareAccountStructures(
  gains: PartnerCapitalGains,
  taxRate = 26.375,
  teilfreistellung = 0,
): ComparisonResult {
  const separateAccounts = calculateSeparateAccountsTax(gains, taxRate, teilfreistellung)
  const jointAccount = calculateJointAccountTax(gains, taxRate, teilfreistellung)

  const taxDifference = separateAccounts.totalTaxAmount - jointAccount.totalTaxAmount
  const isSeparateBetter = taxDifference > 0

  let description: string
  let recommendation: AccountStructure

  if (Math.abs(taxDifference) < 0.01) {
    // Essentially equal
    recommendation = 'joint' // Default to joint for simplicity
    description =
      'Beide Kontostrukturen führen zu nahezu identischer Steuerlast. Ein Gemeinschaftsdepot ist administrativ einfacher.'
  } else if (isSeparateBetter) {
    recommendation = 'separate'
    description = `Getrennte Konten sind steuerlich vorteilhafter und sparen ${Math.abs(taxDifference).toFixed(2)} € pro Jahr. Dies liegt an der ungleichen Verteilung der Kapitalerträge zwischen den Partnern.`
  } else {
    recommendation = 'joint'
    description = `Ein Gemeinschaftsdepot ist steuerlich vorteilhafter und spart ${Math.abs(taxDifference).toFixed(2)} € pro Jahr. Die kombinierte Nutzung des Freibetrags ist bei dieser Ertragsverteilung effizienter.`
  }

  return {
    separateAccounts,
    jointAccount,
    recommendation,
    taxSavings: Math.abs(taxDifference),
    description,
  }
}

/**
 * Calculate optimal gain distribution for separate accounts
 * This helps users understand how to distribute gains for maximum tax efficiency
 * 
 * @param totalGains - Total capital gains for the couple
 * @param taxRate - Capital gains tax rate
 * @param teilfreistellung - Partial exemption percentage
 * @returns Optimal distribution and expected tax
 */
export function calculateOptimalDistribution(
  totalGains: number,
  taxRate = 26.375,
  teilfreistellung = 0,
): { optimalSplit: PartnerCapitalGains; expectedTax: number } {
  const freibetragPerPerson = FREIBETRAG_CONSTANTS.INDIVIDUAL
  const netTotalGains = totalGains * (1 - teilfreistellung / 100)
  const totalFreibetrag = freibetragPerPerson * 2

  // For separate accounts, optimal is to use both Freibeträge equally
  // Split gains as evenly as possible to maximize Freibetrag usage
  const optimalPerPartner = netTotalGains / 2

  let expectedTax = 0
  if (netTotalGains > totalFreibetrag) {
    // If total gains exceed combined Freibetrag, calculate tax
    const taxablePerPartner = Math.max(0, optimalPerPartner - freibetragPerPerson)
    expectedTax = taxablePerPartner * 2 * (taxRate / 100)
  }

  return {
    optimalSplit: {
      partner1: totalGains / 2,
      partner2: totalGains / 2,
    },
    expectedTax,
  }
}

/**
 * Determine if separate accounts provide meaningful benefits
 * Takes into account administrative overhead vs. tax savings
 * 
 * @param gains - Capital gains distribution
 * @param taxRate - Capital gains tax rate
 * @param teilfreistellung - Partial exemption percentage
 * @param minSavingsThreshold - Minimum annual savings to justify separate accounts (default: 50€)
 * @returns Whether separate accounts are worthwhile
 */
export function areSeparateAccountsWorthwhile(
  gains: PartnerCapitalGains,
  taxRate = 26.375,
  teilfreistellung = 0,
  minSavingsThreshold = 50,
): { worthwhile: boolean; reason: string } {
  const comparison = compareAccountStructures(gains, taxRate, teilfreistellung)

  if (comparison.recommendation === 'separate' && comparison.taxSavings >= minSavingsThreshold) {
    return {
      worthwhile: true,
      reason: `Getrennte Konten sparen jährlich ${comparison.taxSavings.toFixed(2)} € Steuern (über dem Schwellenwert von ${minSavingsThreshold} €).`,
    }
  }

  if (comparison.recommendation === 'joint') {
    return {
      worthwhile: false,
      reason: 'Ein Gemeinschaftsdepot ist steuerlich gleich gut oder besser und administrativ einfacher.',
    }
  }

  return {
    worthwhile: false,
    reason: `Die Steuerersparnis (${comparison.taxSavings.toFixed(2)} €/Jahr) liegt unter dem Schwellenwert von ${minSavingsThreshold} € und rechtfertigt nicht den zusätzlichen Verwaltungsaufwand.`,
  }
}
