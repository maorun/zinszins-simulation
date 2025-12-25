import type { WithdrawalResult } from '../../helpers/withdrawal'
import type { EnhancedSummary } from './summary-utils'

/**
 * Retirement-Readiness Score metrics for German retirement planning
 */
export type RetirementReadinessMetrics = {
  // Overall score (0-100%)
  overallScore: number
  scoreLabel: string // German label: "Ausgezeichnet", "Gut", "Befriedigend", "Verbesserungswürdig"

  // Individual metrics
  capitalCoverage: number // Kapitaldeckung (0-100%)
  incomeReplacement: number // Einkommensersatzquote (0-100%)
  sustainabilityYears: number // Years capital will last
  sustainabilityScore: number // Score based on sustainability (0-100%)

  // Detailed breakdown
  totalCapital: number // Total capital at start of retirement
  estimatedAnnualExpenses: number // Estimated annual expenses
  totalWithdrawn: number // Total amount withdrawn over retirement period
  remainingCapital: number // Capital remaining at end of planning period
  monthlyIncome: number // Average monthly income during retirement
}

/**
 * Calculate capital coverage score (40% weight)
 * Based on the 4% safe withdrawal rule: capital should be at least 25x annual expenses
 */
function calculateCapitalCoverage(totalCapital: number, yearlyWithdrawal: number): number {
  const idealCapital = yearlyWithdrawal * 25
  const capitalCoverageRatio = idealCapital > 0 ? (totalCapital / idealCapital) * 100 : 100
  return Math.min(capitalCoverageRatio, 100)
}

/**
 * Calculate income replacement score (30% weight)
 * Based on whether monthly withdrawal provides adequate income
 */
function calculateIncomeReplacement(monthlyWithdrawal: number): number {
  const minMonthlyIncome = 2000
  const goodMonthlyIncome = 3000
  
  if (monthlyWithdrawal >= goodMonthlyIncome) {
    return 100
  } else if (monthlyWithdrawal >= minMonthlyIncome) {
    return 50 + ((monthlyWithdrawal - minMonthlyIncome) / (goodMonthlyIncome - minMonthlyIncome)) * 50
  } else if (monthlyWithdrawal > 0) {
    return (monthlyWithdrawal / minMonthlyIncome) * 50
  }
  return 0
}

/**
 * Calculate sustainability score (30% weight)
 * Based on how well capital lasts relative to life expectancy
 */
function calculateSustainabilityScore(
  remainingCapital: number,
  totalCapital: number,
  planningYears: number,
  lifeExpectancy: number,
): number {
  const sustainabilityRatio = lifeExpectancy > 0 ? planningYears / lifeExpectancy : 1
  
  if (remainingCapital > totalCapital * 0.5) {
    return 100
  } else if (remainingCapital > totalCapital * 0.25) {
    return 80 + (remainingCapital / (totalCapital * 0.5)) * 20
  } else if (remainingCapital > 0) {
    return 40 + (remainingCapital / (totalCapital * 0.25)) * 40
  } else if (sustainabilityRatio >= 1.0) {
    return 60
  }
  return sustainabilityRatio * 60
}

/**
 * Get score label based on German grading system
 */
function getScoreLabel(score: number): string {
  if (score >= 90) return 'Ausgezeichnet'
  if (score >= 75) return 'Gut'
  if (score >= 60) return 'Befriedigend'
  if (score >= 40) return 'Ausreichend'
  return 'Verbesserungswürdig'
}

/**
 * Calculate Retirement-Readiness Score based on German retirement planning standards
 * 
 * The score evaluates multiple dimensions:
 * 1. Capital Coverage (40% weight): How well savings cover expected retirement expenses
 * 2. Income Replacement (30% weight): Ability to maintain living standards
 * 3. Sustainability (30% weight): How long the capital will last
 * 
 * @param enhancedSummary - Summary of savings and withdrawal phases
 * @param withdrawalResult - Detailed year-by-year withdrawal data
 * @param planningYears - Number of years in retirement planning
 * @param lifeExpectancy - Expected years of retirement
 * @returns Comprehensive retirement readiness metrics
 */
export function calculateRetirementReadinessScore(
  enhancedSummary: EnhancedSummary | null,
  withdrawalResult: WithdrawalResult | null,
  planningYears: number,
  lifeExpectancy = 25,
): RetirementReadinessMetrics | null {
  if (!enhancedSummary || !withdrawalResult) {
    return null
  }

  const totalCapital = enhancedSummary.endkapital
  const monthlyWithdrawal = enhancedSummary.monatlicheAuszahlung || 0
  const yearlyWithdrawal = monthlyWithdrawal * 12
  const remainingCapital = enhancedSummary.endkapitalEntspharphase || 0

  const withdrawalYears = Object.keys(withdrawalResult)
  const totalWithdrawn = withdrawalYears.reduce((sum, yearKey) => {
    return sum + withdrawalResult[parseInt(yearKey)].entnahme
  }, 0)

  const capitalCoverage = calculateCapitalCoverage(totalCapital, yearlyWithdrawal)
  const incomeReplacement = calculateIncomeReplacement(monthlyWithdrawal)
  const sustainabilityScore = calculateSustainabilityScore(
    remainingCapital,
    totalCapital,
    planningYears,
    lifeExpectancy,
  )

  const overallScore = Math.round(
    (capitalCoverage * 0.4) + (incomeReplacement * 0.3) + (sustainabilityScore * 0.3)
  )

  return {
    overallScore,
    scoreLabel: getScoreLabel(overallScore),
    capitalCoverage: Math.round(capitalCoverage),
    incomeReplacement: Math.round(incomeReplacement),
    sustainabilityYears: planningYears,
    sustainabilityScore: Math.round(sustainabilityScore),
    totalCapital,
    estimatedAnnualExpenses: yearlyWithdrawal,
    totalWithdrawn,
    remainingCapital,
    monthlyIncome: monthlyWithdrawal,
  }
}

/**
 * Get a descriptive text explaining what the score means
 */
export function getScoreDescription(score: number): string {
  if (score >= 90) {
    return 'Ihre Altersvorsorge ist hervorragend aufgestellt. Sie haben ausreichend Kapital für einen komfortablen Ruhestand.'
  } else if (score >= 75) {
    return 'Ihre Altersvorsorge ist gut aufgestellt. Mit einigen Optimierungen können Sie Ihre finanzielle Sicherheit weiter verbessern.'
  } else if (score >= 60) {
    return 'Ihre Altersvorsorge ist zufriedenstellend, aber es gibt Verbesserungspotenzial. Überprüfen Sie Ihre Sparrate und Anlagestrategie.'
  } else if (score >= 40) {
    return 'Ihre Altersvorsorge benötigt Aufmerksamkeit. Erhöhen Sie Ihre Sparrate oder überdenken Sie Ihre Anlagestrategie.'
  } else {
    return 'Ihre Altersvorsorge ist nicht ausreichend. Dringender Handlungsbedarf: Erhöhen Sie deutlich Ihre Sparrate und optimieren Sie Ihre Strategie.'
  }
}

/**
 * Get specific recommendations based on individual metric scores
 */
export function getScoreRecommendations(metrics: RetirementReadinessMetrics): string[] {
  const recommendations: string[] = []

  if (metrics.capitalCoverage < 75) {
    recommendations.push('💰 Erhöhen Sie Ihre monatlichen Sparraten, um mehr Kapital aufzubauen.')
  }

  if (metrics.incomeReplacement < 75) {
    recommendations.push('📊 Planen Sie eine höhere Entnahmerate oder bauen Sie zusätzliche Einkommensquellen auf.')
  }

  if (metrics.sustainabilityScore < 75) {
    recommendations.push('⏱️ Verlängern Sie die Ansparphase oder reduzieren Sie die Entnahmerate für mehr Nachhaltigkeit.')
  }

  if (metrics.remainingCapital < metrics.totalCapital * 0.25) {
    recommendations.push('⚠️ Ihr Kapital wird voraussichtlich stark schrumpfen. Überdenken Sie Ihre Entnahmestrategie.')
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ Ihre Planung ist solide. Überprüfen Sie regelmäßig Ihre Strategie und passen Sie sie bei Bedarf an.')
  }

  return recommendations
}
