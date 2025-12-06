/**
 * Converter to transform withdrawal data into pension gap analysis format
 */
import type { WithdrawalResult } from '../../helpers/withdrawal'
import {
  calculatePensionGapAnalysis,
  type YearlyIncomeSources,
  type RetirementLifestyleConfig,
  type PensionGapAnalysisResult,
} from '../../helpers/pension-gap-analysis'

/**
 * Calculate total available income from year data
 */
function calculateTotalAvailableIncome(yearData: WithdrawalResult[number]): number {
  return (
    (yearData.statutoryPension?.netAnnualAmount || 0) +
    (yearData.entnahme || 0) +
    (yearData.otherIncome?.totalNetAmount || 0) -
    (yearData.healthCareInsurance?.totalAnnual || 0)
  )
}

/**
 * Extract income sources from withdrawal result for pension gap analysis
 */
export function convertWithdrawalToPensionGapSources(withdrawalResult: WithdrawalResult): YearlyIncomeSources[] {
  const years = Object.keys(withdrawalResult)
    .map(Number)
    .sort((a, b) => a - b)

  return years.map(year => {
    const yearData = withdrawalResult[year]

    return {
      year,
      statutoryPensionNet: yearData.statutoryPension?.netAnnualAmount || 0,
      portfolioWithdrawal: yearData.entnahme || 0,
      otherIncome: yearData.otherIncome?.totalNetAmount || 0,
      healthCareInsurance: yearData.healthCareInsurance?.totalAnnual || 0,
      totalAvailableIncome: calculateTotalAvailableIncome(yearData),
      desiredAnnualIncome: 0, // Will be calculated based on config
    }
  })
}

/**
 * Calculate pension gap analysis from withdrawal data
 */
export function calculatePensionGapFromWithdrawal(
  withdrawalResult: WithdrawalResult,
  retirementConfig: RetirementLifestyleConfig,
): PensionGapAnalysisResult | null {
  if (!withdrawalResult || Object.keys(withdrawalResult).length === 0) {
    return null
  }

  const incomeSources = convertWithdrawalToPensionGapSources(withdrawalResult)

  if (incomeSources.length === 0) {
    return null
  }

  // Set base year for inflation adjustment if not provided
  const configWithBaseYear: RetirementLifestyleConfig = {
    ...retirementConfig,
    baseYear: retirementConfig.baseYear || incomeSources[0].year,
  }

  return calculatePensionGapAnalysis(incomeSources, configWithBaseYear)
}
