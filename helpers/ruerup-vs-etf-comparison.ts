/**
 * Rürup-Rente vs. ETF Comparison Calculator
 * 
 * This module implements comprehensive comparisons between Rürup-Rente (Basis-Rente)
 * and private ETF savings plans under German tax law.
 * 
 * Key differences:
 * - Rürup: Tax deduction during contribution phase, full taxation in retirement
 * - ETF: No tax deduction, but lower taxation (Vorabpauschale + Teilfreistellung)
 */

import { calculateRuerupTaxDeduction, calculateRuerupPensionTaxation } from './ruerup-rente'
import { calculateVorabpauschale, calculateSteuerOnVorabpauschale, getBasiszinsForYear } from './steuer'
import type { BasiszinsConfiguration } from '../src/services/bundesbank-api'

/**
 * Configuration for Rürup vs. ETF comparison
 */
export interface RuerupVsEtfComparisonConfig {
  /** Annual contribution amount in EUR */
  annualContribution: number
  
  /** Contribution period in years (until retirement) */
  contributionYears: number
  
  /** Starting year for contributions */
  startYear: number
  
  /** Expected annual return rate (e.g., 0.07 for 7%) */
  expectedReturn: number
  
  /** Personal income tax rate during contribution phase (e.g., 0.42 for 42%) */
  contributionPhaseTaxRate: number
  
  /** Personal income tax rate during retirement phase (e.g., 0.25 for 25%) */
  retirementPhaseTaxRate: number
  
  /** Civil status for Rürup limits ('single' or 'married') */
  civilStatus: 'single' | 'married'
  
  /** Capital gains tax rate for ETF (default: 0.26375 including Soli) */
  capitalGainsTaxRate: number
  
  /** Partial exemption rate for ETF (Teilfreistellungsquote, e.g., 0.3 for equity funds) */
  teilfreistellungsquote: number
  
  /** Annual tax allowance (Freibetrag) in EUR */
  freibetrag: number
  
  /** Retirement duration in years (for pension payout comparison) */
  retirementYears: number
  
  /** Optional custom Basiszins configuration for Vorabpauschale */
  basiszinsConfig?: BasiszinsConfiguration
  
  /** Annual TER (Total Expense Ratio) for ETF (e.g., 0.002 for 0.2%) */
  ter: number
  
  /** Annual management costs for Rürup (Verwaltungskosten, e.g., 0.015 for 1.5%) */
  ruerupAnnualCosts: number
  
  /** Upfront costs for Rürup as percentage of total contributions (Abschlusskosten, e.g., 0.04 for 4%) */
  ruerupUpfrontCosts: number
}

/**
 * Year-by-year breakdown for accumulation phase
 */
export interface AccumulationYearBreakdown {
  year: number
  /** Contribution for this year */
  contribution: number
  /** Portfolio value at start of year */
  startValue: number
  /** Gross return for the year */
  grossReturn: number
  /** Tax benefit/payment for the year */
  taxEffect: number
  /** Portfolio value at end of year after taxes and contributions */
  endValue: number
  /** Cumulative contributions up to this year */
  cumulativeContributions: number
  /** Cumulative tax effect (negative = tax savings, positive = tax paid) */
  cumulativeTaxEffect: number
}

/**
 * Year-by-year breakdown for retirement phase
 */
export interface RetirementYearBreakdown {
  year: number
  /** Portfolio/pension value at start of year */
  startValue: number
  /** Annual withdrawal/pension amount (gross) */
  grossWithdrawal: number
  /** Tax paid on withdrawal/pension */
  taxPaid: number
  /** Net amount received */
  netAmount: number
  /** Remaining portfolio value (ETF only) */
  remainingValue: number
}

/**
 * Complete result for one investment option (Rürup or ETF)
 */
export interface InvestmentResult {
  /** Accumulation phase details */
  accumulation: {
    yearlyBreakdown: AccumulationYearBreakdown[]
    finalValue: number
    totalContributions: number
    totalTaxEffect: number // Negative = savings, Positive = paid
    netContributions: number // After tax effects
  }
  
  /** Retirement phase details */
  retirement: {
    yearlyBreakdown: RetirementYearBreakdown[]
    totalGrossWithdrawals: number
    totalTaxPaid: number
    totalNetReceived: number
    finalRemainingValue: number
  }
  
  /** Overall metrics */
  overall: {
    totalMoneyIn: number // Net contributions (after tax effects)
    totalMoneyOut: number // Net received in retirement
    netBenefit: number // Total out - Total in
    effectiveReturnRate: number // Annualized return considering all cash flows
  }
}

/**
 * Complete comparison result between Rürup and ETF
 */
export interface RuerupVsEtfComparison {
  config: RuerupVsEtfComparisonConfig
  ruerup: InvestmentResult
  etf: InvestmentResult
  comparison: {
    /** Which option is better financially */
    recommendation: 'ruerup' | 'etf' | 'similar'
    /** Difference in net benefit (Rürup - ETF) */
    netBenefitDifference: number
    /** Percentage advantage of recommended option */
    advantagePercentage: number
    /** Key factors influencing the result */
    keyFactors: string[]
  }
}

/**
 * Calculate accumulation phase for Rürup-Rente
 */
function calculateRuerupAccumulation(
  config: RuerupVsEtfComparisonConfig
): {
  breakdown: AccumulationYearBreakdown[]
  finalValue: number
  totalContributions: number
  totalTaxSavings: number
} {
  const breakdown: AccumulationYearBreakdown[] = []
  let portfolioValue = 0
  let cumulativeContributions = 0
  let cumulativeTaxSavings = 0
  
  // Calculate total upfront costs (amortized over all years)
  const totalExpectedContributions = config.annualContribution * config.contributionYears
  const totalUpfrontCosts = totalExpectedContributions * config.ruerupUpfrontCosts
  const annualUpfrontCost = totalUpfrontCosts / config.contributionYears

  for (let i = 0; i < config.contributionYears; i++) {
    const year = config.startYear + i
    const startValue = portfolioValue
    
    // Calculate tax deduction for this year's contribution
    const taxDeduction = calculateRuerupTaxDeduction(
      config.annualContribution,
      year,
      config.civilStatus,
      config.contributionPhaseTaxRate
    )
    
    const taxSavings = taxDeduction.estimatedTaxSavings
    
    // Add contribution and deduct upfront costs
    portfolioValue += config.annualContribution - annualUpfrontCost
    
    // Calculate return after annual management costs
    const grossReturn = portfolioValue * (config.expectedReturn - config.ruerupAnnualCosts)
    portfolioValue += grossReturn
    
    cumulativeContributions += config.annualContribution
    cumulativeTaxSavings += taxSavings
    
    breakdown.push({
      year,
      contribution: config.annualContribution,
      startValue,
      grossReturn,
      taxEffect: -taxSavings,
      endValue: portfolioValue,
      cumulativeContributions,
      cumulativeTaxEffect: -cumulativeTaxSavings,
    })
  }

  return {
    breakdown,
    finalValue: portfolioValue,
    totalContributions: cumulativeContributions,
    totalTaxSavings: cumulativeTaxSavings,
  }
}

/**
 * Calculate retirement phase for Rürup-Rente
 */
function calculateRuerupRetirement(
  config: RuerupVsEtfComparisonConfig,
  portfolioValue: number
): {
  breakdown: RetirementYearBreakdown[]
  totalGrossWithdrawals: number
  totalTaxPaid: number
  totalNetReceived: number
} {
  const retirementStartYear = config.startYear + config.contributionYears
  const monthlyPension = portfolioValue / (config.retirementYears * 12)
  const breakdown: RetirementYearBreakdown[] = []
  let totalGrossWithdrawals = 0
  let totalTaxPaid = 0
  let totalNetReceived = 0

  for (let i = 0; i < config.retirementYears; i++) {
    const year = retirementStartYear + i
    
    const pensionTax = calculateRuerupPensionTaxation(
      monthlyPension,
      retirementStartYear,
      year,
      0.01,
      config.retirementPhaseTaxRate
    )
    
    totalGrossWithdrawals += pensionTax.grossAnnualPension
    totalTaxPaid += pensionTax.incomeTax
    totalNetReceived += pensionTax.netAnnualPension
    
    breakdown.push({
      year,
      startValue: 0,
      grossWithdrawal: pensionTax.grossAnnualPension,
      taxPaid: pensionTax.incomeTax,
      netAmount: pensionTax.netAnnualPension,
      remainingValue: 0,
    })
  }

  return {
    breakdown,
    totalGrossWithdrawals,
    totalTaxPaid,
    totalNetReceived,
  }
}

/**
 * Calculate Rürup-Rente investment result
 */
function calculateRuerupResult(config: RuerupVsEtfComparisonConfig): InvestmentResult {
  const accumulation = calculateRuerupAccumulation(config)
  const retirement = calculateRuerupRetirement(config, accumulation.finalValue)

  const totalMoneyIn = accumulation.totalContributions - accumulation.totalTaxSavings
  const totalMoneyOut = retirement.totalNetReceived
  const netBenefit = totalMoneyOut - totalMoneyIn

  return {
    accumulation: {
      yearlyBreakdown: accumulation.breakdown,
      finalValue: accumulation.finalValue,
      totalContributions: accumulation.totalContributions,
      totalTaxEffect: -accumulation.totalTaxSavings,
      netContributions: totalMoneyIn,
    },
    retirement: {
      yearlyBreakdown: retirement.breakdown,
      totalGrossWithdrawals: retirement.totalGrossWithdrawals,
      totalTaxPaid: retirement.totalTaxPaid,
      totalNetReceived: retirement.totalNetReceived,
      finalRemainingValue: 0,
    },
    overall: {
      totalMoneyIn,
      totalMoneyOut,
      netBenefit,
      effectiveReturnRate: calculateAnnualizedReturn(totalMoneyIn, totalMoneyOut, config.contributionYears + config.retirementYears),
    },
  }
}

/**
 * Calculate Vorabpauschale and tax for a single year of ETF accumulation
 */
function calculateYearlyEtfTax(
  portfolioValue: number,
  grossReturn: number,
  year: number,
  config: RuerupVsEtfComparisonConfig
): number {
  const basiszins = config.basiszinsConfig 
    ? getBasiszinsForYear(year, config.basiszinsConfig)
    : 0.025
  
  const vorabStartValue = portfolioValue - grossReturn
  const vorabEndValue = portfolioValue
  const vorabpauschale = calculateVorabpauschale(
    vorabStartValue,
    vorabEndValue,
    basiszins,
    12
  )
  
  return calculateSteuerOnVorabpauschale(
    vorabpauschale,
    config.capitalGainsTaxRate,
    config.teilfreistellungsquote
  )
}

/**
 * Calculate accumulation phase for ETF
 */
function calculateEtfAccumulation(
  config: RuerupVsEtfComparisonConfig
): {
  breakdown: AccumulationYearBreakdown[]
  finalValue: number
  totalContributions: number
  totalTaxPaid: number
} {
  const breakdown: AccumulationYearBreakdown[] = []
  let portfolioValue = 0
  let cumulativeContributions = 0
  let cumulativeTaxPaid = 0

  for (let i = 0; i < config.contributionYears; i++) {
    const year = config.startYear + i
    const yearStartValue = portfolioValue
    
    portfolioValue += config.annualContribution
    const grossReturn = portfolioValue * (config.expectedReturn - config.ter)
    portfolioValue += grossReturn
    
    const taxOnVorabpauschale = calculateYearlyEtfTax(portfolioValue, grossReturn, year, config)
    
    portfolioValue -= taxOnVorabpauschale
    cumulativeContributions += config.annualContribution
    cumulativeTaxPaid += taxOnVorabpauschale
    
    breakdown.push({
      year,
      contribution: config.annualContribution,
      startValue: yearStartValue,
      grossReturn,
      taxEffect: taxOnVorabpauschale,
      endValue: portfolioValue,
      cumulativeContributions,
      cumulativeTaxEffect: cumulativeTaxPaid,
    })
  }

  return {
    breakdown,
    finalValue: portfolioValue,
    totalContributions: cumulativeContributions,
    totalTaxPaid: cumulativeTaxPaid,
  }
}

/**
 * Calculate retirement phase for ETF
 */
function calculateEtfRetirement(
  config: RuerupVsEtfComparisonConfig,
  portfolioValue: number
): {
  breakdown: RetirementYearBreakdown[]
  totalGrossWithdrawals: number
  totalTaxPaid: number
  totalNetReceived: number
  finalRemainingValue: number
} {
  const retirementStartYear = config.startYear + config.contributionYears
  const breakdown: RetirementYearBreakdown[] = []
  let totalGrossWithdrawals = 0
  let totalTaxPaid = 0
  let totalNetReceived = 0
  let remainingValue = portfolioValue

  for (let i = 0; i < config.retirementYears; i++) {
    const year = retirementStartYear + i
    const startValue = remainingValue
    
    const withdrawalRate = 1 / config.retirementYears
    const grossWithdrawal = Math.min(portfolioValue * withdrawalRate * Math.pow(1.02, i), remainingValue)
    
    const gainsPortion = grossWithdrawal * 0.5
    const taxableGains = gainsPortion * (1 - config.teilfreistellungsquote)
    const taxPaid = Math.min(taxableGains * config.capitalGainsTaxRate, taxableGains * config.capitalGainsTaxRate)
    
    const netWithdrawal = grossWithdrawal - taxPaid
    
    remainingValue = remainingValue - grossWithdrawal
    remainingValue = remainingValue * (1 + config.expectedReturn - config.ter)
    
    totalGrossWithdrawals += grossWithdrawal
    totalTaxPaid += taxPaid
    totalNetReceived += netWithdrawal
    
    breakdown.push({
      year,
      startValue,
      grossWithdrawal,
      taxPaid,
      netAmount: netWithdrawal,
      remainingValue: Math.max(0, remainingValue),
    })
  }

  return {
    breakdown,
    totalGrossWithdrawals,
    totalTaxPaid,
    totalNetReceived,
    finalRemainingValue: Math.max(0, remainingValue),
  }
}

/**
 * Calculate ETF investment result
 */
function calculateEtfResult(config: RuerupVsEtfComparisonConfig): InvestmentResult {
  const accumulation = calculateEtfAccumulation(config)
  const retirement = calculateEtfRetirement(config, accumulation.finalValue)

  const totalMoneyIn = accumulation.totalContributions
  const totalMoneyOut = retirement.totalNetReceived
  const netBenefit = totalMoneyOut - totalMoneyIn

  return {
    accumulation: {
      yearlyBreakdown: accumulation.breakdown,
      finalValue: accumulation.finalValue,
      totalContributions: accumulation.totalContributions,
      totalTaxEffect: accumulation.totalTaxPaid,
      netContributions: totalMoneyIn,
    },
    retirement: {
      yearlyBreakdown: retirement.breakdown,
      totalGrossWithdrawals: retirement.totalGrossWithdrawals,
      totalTaxPaid: retirement.totalTaxPaid,
      totalNetReceived: retirement.totalNetReceived,
      finalRemainingValue: retirement.finalRemainingValue,
    },
    overall: {
      totalMoneyIn,
      totalMoneyOut,
      netBenefit,
      effectiveReturnRate: calculateAnnualizedReturn(totalMoneyIn, totalMoneyOut, config.contributionYears + config.retirementYears),
    },
  }
}

/**
 * Calculate annualized return rate from cash flows
 */
function calculateAnnualizedReturn(moneyIn: number, moneyOut: number, years: number): number {
  if (moneyIn <= 0 || moneyOut <= 0 || years <= 0) return 0
  return Math.pow(moneyOut / moneyIn, 1 / years) - 1
}

/**
 * Compare Rürup-Rente vs. ETF investment
 * 
 * @param config - Comparison configuration
 * @returns Complete comparison result with recommendation
 * 
 * @example
 * ```typescript
 * const comparison = compareRuerupVsEtf({
 *   annualContribution: 10000,
 *   contributionYears: 30,
 *   startYear: 2024,
 *   expectedReturn: 0.07,
 *   contributionPhaseTaxRate: 0.42,
 *   retirementPhaseTaxRate: 0.25,
 *   civilStatus: 'single',
 *   capitalGainsTaxRate: 0.26375,
 *   teilfreistellungsquote: 0.30,
 *   freibetrag: 1000,
 *   retirementYears: 25,
 *   ter: 0.002,
 * })
 * ```
 */
export function compareRuerupVsEtf(config: RuerupVsEtfComparisonConfig): RuerupVsEtfComparison {
  const ruerupResult = calculateRuerupResult(config)
  const etfResult = calculateEtfResult(config)

  const netBenefitDifference = ruerupResult.overall.netBenefit - etfResult.overall.netBenefit
  const advantagePercentage = Math.abs(netBenefitDifference) / Math.max(ruerupResult.overall.netBenefit, etfResult.overall.netBenefit) * 100

  let recommendation: 'ruerup' | 'etf' | 'similar'
  const threshold = 0.05 // 5% difference threshold for "similar"
  
  if (Math.abs(netBenefitDifference) / Math.max(ruerupResult.overall.totalMoneyOut, etfResult.overall.totalMoneyOut) < threshold) {
    recommendation = 'similar'
  } else if (netBenefitDifference > 0) {
    recommendation = 'ruerup'
  } else {
    recommendation = 'etf'
  }

  // Identify key factors
  const keyFactors: string[] = []
  
  if (config.contributionPhaseTaxRate >= 0.42) {
    keyFactors.push('Hoher Steuersatz in Beitragsphase begünstigt Rürup')
  }
  
  if (config.retirementPhaseTaxRate <= 0.25) {
    keyFactors.push('Niedriger Steuersatz im Ruhestand begünstigt Rürup')
  }
  
  if (config.teilfreistellungsquote >= 0.30) {
    keyFactors.push('Hohe Teilfreistellung begünstigt ETF')
  }
  
  if (config.ruerupAnnualCosts + config.ruerupUpfrontCosts > 0.05) {
    keyFactors.push('Hohe Rürup-Kosten (Verwaltung + Abschluss) begünstigen ETF')
  }
  
  if (etfResult.retirement.finalRemainingValue > 0) {
    keyFactors.push('ETF bietet Kapitalerhalt für Vererbung')
  }

  return {
    config,
    ruerup: ruerupResult,
    etf: etfResult,
    comparison: {
      recommendation,
      netBenefitDifference,
      advantagePercentage,
      keyFactors,
    },
  }
}

/**
 * Create default configuration for Rürup vs. ETF comparison
 */
export function createDefaultRuerupVsEtfConfig(): RuerupVsEtfComparisonConfig {
  return {
    annualContribution: 10000,
    contributionYears: 30,
    startYear: 2024,
    expectedReturn: 0.07,
    contributionPhaseTaxRate: 0.42,
    retirementPhaseTaxRate: 0.25,
    civilStatus: 'single',
    capitalGainsTaxRate: 0.26375,
    teilfreistellungsquote: 0.30,
    freibetrag: 1000,
    retirementYears: 25,
    ter: 0.002,
    ruerupAnnualCosts: 0.015, // 1.5% typical annual management costs
    ruerupUpfrontCosts: 0.04, // 4% typical upfront/acquisition costs
  }
}
