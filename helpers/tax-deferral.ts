/**
 * Tax Deferral Calculator (Steuerstundungs-Kalkulator)
 *
 * This module implements calculations for comparing accumulating (thesaurierende)
 * vs. distributing (ausschüttende) investment funds under German tax law.
 *
 * Key concepts:
 * - Accumulating funds: Reinvest dividends/interest, pay Vorabpauschale annually
 * - Distributing funds: Pay out dividends/interest, pay full tax on distributions annually
 * - Tax deferral effect: Accumulating funds benefit from compound interest on deferred taxes
 */

import { calculateVorabpauschale, calculateSteuerOnVorabpauschale, getBasiszinsForYear } from './steuer'
import type { BasiszinsConfiguration } from '../src/services/bundesbank-api'

/**
 * Configuration for tax deferral comparison calculation
 */
export interface TaxDeferralConfig {
  /** Initial investment amount in euros */
  initialInvestment: number
  /** Annual return rate (e.g., 0.07 for 7%) */
  annualReturn: number
  /** Investment period in years */
  years: number
  /** Capital gains tax rate (Kapitalertragsteuer + Solidaritätszuschlag, e.g., 0.26375) */
  capitalGainsTaxRate: number
  /** Partial exemption rate for fund type (Teilfreistellungsquote, e.g., 0.3 for equity funds) */
  teilfreistellungsquote: number
  /** Annual tax allowance (Freibetrag) in euros */
  freibetrag: number
  /** Starting year for calculation */
  startYear: number
  /** Optional custom Basiszins configuration */
  basiszinsConfig?: BasiszinsConfiguration
}

/**
 * Year-by-year breakdown for a single investment type
 */
export interface YearlyBreakdown {
  year: number
  /** Portfolio value at start of year */
  startValue: number
  /** Portfolio value at end of year before taxes */
  endValueBeforeTax: number
  /** Gross return for the year */
  grossReturn: number
  /** Taxable amount for the year */
  taxableAmount: number
  /** Tax paid in the year */
  taxPaid: number
  /** Portfolio value at end of year after taxes */
  endValueAfterTax: number
  /** Cumulative tax paid up to this year */
  cumulativeTaxPaid: number
}

/**
 * Complete comparison result between accumulating and distributing funds
 */
export interface TaxDeferralComparison {
  config: TaxDeferralConfig
  accumulating: {
    yearlyBreakdown: YearlyBreakdown[]
    finalValue: number
    totalTaxPaid: number
  }
  distributing: {
    yearlyBreakdown: YearlyBreakdown[]
    finalValue: number
    totalTaxPaid: number
  }
  comparison: {
    /** Difference in final value (accumulating - distributing) */
    valueDifference: number
    /** Percentage advantage of accumulating over distributing */
    percentageAdvantage: number
    /** Tax deferral benefit in euros */
    taxDeferralBenefit: number
    /** Difference in total taxes paid */
    taxDifference: number
  }
}

/**
 * Calculate the year-by-year progression for an accumulating fund
 *
 * Accumulating funds reinvest all returns and only pay Vorabpauschale annually.
 * The Vorabpauschale is typically much lower than the actual return, creating
 * a tax deferral advantage.
 */
function calculateAccumulatingFund(config: TaxDeferralConfig): {
  yearlyBreakdown: YearlyBreakdown[]
  finalValue: number
  totalTaxPaid: number
} {
  const yearlyBreakdown: YearlyBreakdown[] = []
  let currentValue = config.initialInvestment
  let cumulativeTaxPaid = 0
  let remainingFreibetrag = config.freibetrag

  for (let i = 0; i < config.years; i++) {
    const year = config.startYear + i
    const startValue = currentValue

    // Calculate gross return
    const grossReturn = startValue * config.annualReturn
    const endValueBeforeTax = startValue + grossReturn

    // Calculate Vorabpauschale (basis for taxation)
    const basiszins = getBasiszinsForYear(year, config.basiszinsConfig)
    const vorabpauschale = calculateVorabpauschale(startValue, endValueBeforeTax, basiszins)

    // Calculate tax on Vorabpauschale
    const taxOnVorabpauschale = calculateSteuerOnVorabpauschale(
      vorabpauschale,
      config.capitalGainsTaxRate,
      config.teilfreistellungsquote,
    )

    // Apply Freibetrag (tax allowance)
    const freibetragUsed = Math.min(remainingFreibetrag, taxOnVorabpauschale)
    const taxPaid = Math.max(0, taxOnVorabpauschale - freibetragUsed)
    remainingFreibetrag = Math.max(0, remainingFreibetrag - taxOnVorabpauschale)

    // Reset Freibetrag at start of each year
    if (i < config.years - 1) {
      remainingFreibetrag = config.freibetrag
    }

    cumulativeTaxPaid += taxPaid
    const endValueAfterTax = endValueBeforeTax - taxPaid

    yearlyBreakdown.push({
      year,
      startValue,
      endValueBeforeTax,
      grossReturn,
      taxableAmount: vorabpauschale,
      taxPaid,
      endValueAfterTax,
      cumulativeTaxPaid,
    })

    currentValue = endValueAfterTax
  }

  return {
    yearlyBreakdown,
    finalValue: currentValue,
    totalTaxPaid: cumulativeTaxPaid,
  }
}

/**
 * Calculate the year-by-year progression for a distributing fund
 *
 * Distributing funds pay out all returns and pay full capital gains tax
 * on the entire distribution each year. This results in less capital
 * available for compounding.
 */
function calculateDistributingFund(config: TaxDeferralConfig): {
  yearlyBreakdown: YearlyBreakdown[]
  finalValue: number
  totalTaxPaid: number
} {
  const yearlyBreakdown: YearlyBreakdown[] = []
  let currentValue = config.initialInvestment
  let cumulativeTaxPaid = 0
  let remainingFreibetrag = config.freibetrag

  for (let i = 0; i < config.years; i++) {
    const year = config.startYear + i
    const startValue = currentValue

    // Calculate gross return (distribution)
    const grossReturn = startValue * config.annualReturn
    const endValueBeforeTax = startValue + grossReturn

    // For distributing funds, the entire distribution is taxable
    const distribution = grossReturn

    // Calculate tax on distribution with Teilfreistellungsquote
    const taxableDistribution = distribution * (1 - config.teilfreistellungsquote)
    const taxOnDistribution = taxableDistribution * config.capitalGainsTaxRate

    // Apply Freibetrag (tax allowance)
    const freibetragUsed = Math.min(remainingFreibetrag, taxOnDistribution)
    const taxPaid = Math.max(0, taxOnDistribution - freibetragUsed)
    remainingFreibetrag = Math.max(0, remainingFreibetrag - taxOnDistribution)

    // Reset Freibetrag at start of each year
    if (i < config.years - 1) {
      remainingFreibetrag = config.freibetrag
    }

    cumulativeTaxPaid += taxPaid

    // After paying tax on distribution, reinvest the after-tax amount
    const afterTaxDistribution = distribution - taxPaid
    const endValueAfterTax = startValue + afterTaxDistribution

    yearlyBreakdown.push({
      year,
      startValue,
      endValueBeforeTax,
      grossReturn,
      taxableAmount: distribution,
      taxPaid,
      endValueAfterTax,
      cumulativeTaxPaid,
    })

    currentValue = endValueAfterTax
  }

  return {
    yearlyBreakdown,
    finalValue: currentValue,
    totalTaxPaid: cumulativeTaxPaid,
  }
}

/**
 * Calculate and compare accumulating vs. distributing fund scenarios
 *
 * This is the main function for the Steuerstundungs-Kalkulator.
 * It calculates both scenarios and provides a detailed comparison
 * of the tax deferral effect.
 *
 * @param config - Configuration for the comparison
 * @returns Complete comparison including yearly breakdowns and summary metrics
 */
export function calculateTaxDeferralComparison(config: TaxDeferralConfig): TaxDeferralComparison {
  // Validate inputs
  if (config.initialInvestment <= 0) {
    throw new Error('Initial investment must be greater than 0')
  }
  if (config.years <= 0) {
    throw new Error('Investment period must be greater than 0')
  }
  if (config.annualReturn < 0) {
    throw new Error('Annual return cannot be negative')
  }

  const accumulating = calculateAccumulatingFund(config)
  const distributing = calculateDistributingFund(config)

  const valueDifference = accumulating.finalValue - distributing.finalValue
  const percentageAdvantage = (valueDifference / distributing.finalValue) * 100
  const taxDifference = distributing.totalTaxPaid - accumulating.totalTaxPaid

  // Tax deferral benefit is the value difference minus any additional taxes paid later
  // For simplicity, we use the value difference as the primary metric
  const taxDeferralBenefit = valueDifference

  return {
    config,
    accumulating,
    distributing,
    comparison: {
      valueDifference,
      percentageAdvantage,
      taxDeferralBenefit,
      taxDifference,
    },
  }
}

/**
 * Helper function to create a default TaxDeferralConfig
 * with typical German investment parameters
 */
export function createDefaultTaxDeferralConfig(): TaxDeferralConfig {
  const currentYear = new Date().getFullYear()

  return {
    initialInvestment: 50000,
    annualReturn: 0.07, // 7% average return
    years: 20,
    capitalGainsTaxRate: 0.26375, // 25% + 5.5% Soli
    teilfreistellungsquote: 0.3, // 30% for equity funds
    freibetrag: 1000, // €1,000 Sparer-Pauschbetrag (single person)
    startYear: currentYear,
  }
}
