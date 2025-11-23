/**
 * Goal Adjustments Module
 *
 * Provides intelligent recommendations for adjusting financial strategies
 * when users are off-track to meet their financial goals.
 *
 * Uses rule-based logic (not ML/AI) for transparent, understandable recommendations.
 */

import { type FinancialGoal } from './financial-goals'

/**
 * Type of adjustment recommendation
 */
export type AdjustmentType =
  | 'increase-savings' // Sparrate erhöhen
  | 'adjust-timeline' // Zeithorizont anpassen
  | 'adjust-expectations' // Ziel anpassen
  | 'improve-returns' // Rendite optimieren
  | 'reduce-costs' // Kosten reduzieren
  | 'on-track' // Auf Kurs

/**
 * Severity level of the adjustment needed
 */
export type AdjustmentSeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * Individual adjustment recommendation
 */
export interface AdjustmentRecommendation {
  /** Type of adjustment */
  type: AdjustmentType
  /** Severity of the adjustment needed */
  severity: AdjustmentSeverity
  /** German title for the recommendation */
  title: string
  /** Detailed German description of the recommendation */
  description: string
  /** Specific actionable steps (German) */
  actionItems: string[]
  /** Estimated impact description (German) */
  impact?: string
  /** Priority order (lower number = higher priority) */
  priority: number
}

/**
 * Result of goal adjustment analysis
 */
export interface GoalAdjustmentAnalysis {
  /** The financial goal being analyzed */
  goal: FinancialGoal
  /** Current capital amount */
  currentAmount: number
  /** Years until target year (if specified) */
  yearsRemaining?: number
  /** Current monthly savings rate (if provided) */
  monthlySavingsRate?: number
  /** Current expected annual return rate (if provided) */
  expectedReturn?: number
  /** Whether the goal is on track */
  onTrack: boolean
  /** Progress percentage */
  progressPercentage: number
  /** Array of recommendations */
  recommendations: AdjustmentRecommendation[]
  /** Expected timeline to reach goal with current trajectory */
  expectedYearsToGoal?: number
}

/**
 * Parameters for analyzing goal adjustments
 */
export interface GoalAdjustmentParams {
  /** The financial goal */
  goal: FinancialGoal
  /** Current capital amount */
  currentAmount: number
  /** Current monthly savings rate (optional) */
  monthlySavingsRate?: number
  /** Expected annual return rate as decimal (e.g., 0.07 for 7%) */
  expectedReturn?: number
  /** Current year */
  currentYear: number
}

/**
 * Calculate how many years it will take to reach a goal
 * given current capital, monthly savings, and expected return
 */
export function calculateYearsToGoal(
  currentAmount: number,
  targetAmount: number,
  monthlySavingsRate: number,
  annualReturn: number,
): number {
  if (currentAmount >= targetAmount) return 0
  if (monthlySavingsRate <= 0) return Infinity

  const monthlyReturn = annualReturn / 12
  
  // Use iterative approach to calculate months needed
  let amount = currentAmount
  let months = 0
  const maxMonths = 100 * 12 // 100 years max

  while (amount < targetAmount && months < maxMonths) {
    amount = amount * (1 + monthlyReturn) + monthlySavingsRate
    months++
  }

  return months >= maxMonths ? Infinity : months / 12
}

/**
 * Calculate required monthly savings to reach goal by target year
 */
export function calculateRequiredMonthlySavings(
  currentAmount: number,
  targetAmount: number,
  yearsRemaining: number,
  annualReturn: number,
): number {
  if (yearsRemaining <= 0) return Infinity
  if (currentAmount >= targetAmount) return 0

  const monthlyReturn = annualReturn / 12
  const months = yearsRemaining * 12

  // Special case: zero return
  if (monthlyReturn === 0) {
    return (targetAmount - currentAmount) / months
  }

  // Future value calculation with compound interest
  // FV = PV * (1 + r)^n + PMT * ((1 + r)^n - 1) / r
  // Solving for PMT:
  // PMT = (FV - PV * (1 + r)^n) * r / ((1 + r)^n - 1)

  const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyReturn, months)
  const remaining = targetAmount - futureValueOfCurrent

  if (remaining <= 0) return 0

  const annuityFactor = (Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn

  if (annuityFactor <= 0) return Infinity

  return remaining / annuityFactor
}

/**
 * Determine if goal is on track based on progress and timeline
 */
function isGoalOnTrack(
  currentAmount: number,
  targetAmount: number,
  currentYear: number,
  targetYear?: number,
): boolean {
  const progress = (currentAmount / targetAmount) * 100

  // If no target year specified, use progress threshold
  if (!targetYear) {
    return progress >= 25 // At least 25% progress considered on track
  }

  const yearsRemaining = targetYear - currentYear
  
  // If already past target year, definitely off track
  if (yearsRemaining <= 0) {
    return progress >= 100
  }

  // Estimate what progress should be based on time remaining
  // Assume a typical investment horizon of 20 years
  const assumedTotalYears = 20
  const estimatedElapsed = Math.max(0, assumedTotalYears - yearsRemaining)
  const estimatedElapsedRatio = estimatedElapsed / assumedTotalYears
  const expectedProgress = estimatedElapsedRatio * 100

  // Allow 30% tolerance for being on track
  return progress >= expectedProgress * 0.7
}

/**
 * Generate recommendations for increasing savings rate
 */
function generateIncreaseSavingsRecommendation(
  currentSavings: number,
  requiredSavings: number,
  severity: AdjustmentSeverity,
): AdjustmentRecommendation {
  const increase = requiredSavings - currentSavings
  const increasePercentage = ((increase / currentSavings) * 100).toFixed(0)

  return {
    type: 'increase-savings',
    severity,
    title: 'Sparrate erhöhen',
    description: `Um Ihr Ziel rechtzeitig zu erreichen, sollten Sie Ihre monatliche Sparrate um ca. ${increasePercentage}% erhöhen (von ${currentSavings.toFixed(0)}€ auf ${requiredSavings.toFixed(0)}€ pro Monat).`,
    actionItems: [
      'Überprüfen Sie Ihr Budget auf Einsparpotenziale',
      'Automatisieren Sie die erhöhte Sparrate',
      'Nutzen Sie Gehaltserhöhungen für zusätzliche Sparraten',
      'Erwägen Sie Nebeneinkünfte zur Erhöhung der Sparrate',
    ],
    impact: `Erhöht die Wahrscheinlichkeit, Ihr Ziel rechtzeitig zu erreichen`,
    priority: 1,
  }
}

/**
 * Generate recommendations for adjusting timeline
 */
function generateAdjustTimelineRecommendation(
  expectedYears: number,
  targetYear: number,
  currentYear: number,
  severity: AdjustmentSeverity,
): AdjustmentRecommendation {
  const suggestedYear = Math.ceil(currentYear + expectedYears)
  const yearDifference = suggestedYear - targetYear

  return {
    type: 'adjust-timeline',
    severity,
    title: 'Zeithorizont anpassen',
    description: `Mit Ihrer aktuellen Strategie benötigen Sie ca. ${Math.ceil(expectedYears)} Jahre. Erwägen Sie, Ihr Ziel um ${yearDifference} Jahre nach hinten zu verschieben (von ${targetYear} auf ${suggestedYear}).`,
    actionItems: [
      'Überdenken Sie, ob das ursprüngliche Zieljahr realistisch war',
      'Passen Sie Ihre Lebensplanung entsprechend an',
      'Nutzen Sie die zusätzliche Zeit für stetiges Wachstum',
      'Vermeiden Sie übermäßiges Risiko durch Zeitdruck',
    ],
    impact: `Macht Ihr Ziel mit der aktuellen Sparrate erreichbar`,
    priority: 2,
  }
}

/**
 * Generate recommendations for adjusting expectations
 */
function generateAdjustExpectationsRecommendation(
  targetAmount: number,
  achievableAmount: number,
  severity: AdjustmentSeverity,
): AdjustmentRecommendation {
  const reduction = targetAmount - achievableAmount
  const reductionPercentage = ((reduction / targetAmount) * 100).toFixed(0)

  return {
    type: 'adjust-expectations',
    severity,
    title: 'Zielwert anpassen',
    description: `Mit Ihrer aktuellen Strategie erreichen Sie voraussichtlich ${achievableAmount.toFixed(0)}€ statt ${targetAmount.toFixed(0)}€. Erwägen Sie, Ihr Ziel um ca. ${reductionPercentage}% zu reduzieren.`,
    actionItems: [
      'Überprüfen Sie, ob Ihr ursprüngliches Ziel realistisch war',
      'Passen Sie Ihre Ausgabenpläne für die Zukunft an',
      'Suchen Sie nach alternativen Einkommensquellen',
      'Erwägen Sie Teilziele als Zwischenschritte',
    ],
    impact: `Macht Ihr Ziel mit den aktuellen Rahmenbedingungen erreichbar`,
    priority: 3,
  }
}

/**
 * Generate recommendations for improving returns
 */
function generateImproveReturnsRecommendation(
  currentReturn: number,
  requiredReturn: number,
  severity: AdjustmentSeverity,
): AdjustmentRecommendation {
  const currentReturnPercent = (currentReturn * 100).toFixed(1)
  const requiredReturnPercent = (requiredReturn * 100).toFixed(1)

  return {
    type: 'improve-returns',
    severity,
    title: 'Rendite optimieren',
    description: `Ihre erwartete Rendite von ${currentReturnPercent}% könnte optimiert werden. Eine Rendite von ca. ${requiredReturnPercent}% würde helfen, Ihr Ziel zu erreichen.`,
    actionItems: [
      'Überprüfen Sie Ihre Asset-Allocation',
      'Erwägen Sie kostengünstige ETFs statt aktiver Fonds',
      'Diversifizieren Sie in wachstumsorientierte Anlageklassen',
      'Beachten Sie: Höhere Rendite bedeutet höheres Risiko',
      'Holen Sie professionelle Beratung ein',
    ],
    impact: `Kann das Kapitalwachstum beschleunigen`,
    priority: 4,
  }
}

/**
 * Generate recommendations for reducing costs
 */
function generateReduceCostsRecommendation(severity: AdjustmentSeverity): AdjustmentRecommendation {
  return {
    type: 'reduce-costs',
    severity,
    title: 'Kosten reduzieren',
    description: `Hohe Gebühren und Kosten können Ihre Rendite erheblich schmälern. Überprüfen Sie die Kostenstruktur Ihrer Anlagen.`,
    actionItems: [
      'Wechseln Sie zu günstigen ETFs oder Indexfonds',
      'Vermeiden Sie aktives Trading (Transaktionskosten)',
      'Prüfen Sie TER (Total Expense Ratio) Ihrer Fonds',
      'Nutzen Sie günstige Online-Broker',
      'Vermeiden Sie unnötige Beratergebühren',
    ],
    impact: `Jedes eingesparte Prozent an Kosten verbessert Ihre Rendite`,
    priority: 5,
  }
}

/**
 * Generate on-track confirmation
 */
function generateOnTrackConfirmation(): AdjustmentRecommendation {
  return {
    type: 'on-track',
    severity: 'low',
    title: 'Auf Kurs! 🎯',
    description: `Glückwunsch! Sie sind auf einem guten Weg, Ihr Ziel zu erreichen. Bleiben Sie diszipliniert bei Ihrer Strategie.`,
    actionItems: [
      'Führen Sie Ihre regelmäßigen Sparraten fort',
      'Überprüfen Sie Ihre Strategie einmal jährlich',
      'Passen Sie bei Lebensveränderungen an',
      'Bleiben Sie langfristig orientiert',
    ],
    impact: `Kontinuität führt zum Erfolg`,
    priority: 0,
  }
}

/**
 * Determine severity based on progress gap
 */
function calculateSeverity(progressGap: number): AdjustmentSeverity {
  if (progressGap <= 10) return 'low'
  if (progressGap <= 30) return 'medium'
  if (progressGap <= 50) return 'high'
  return 'critical'
}

/**
 * Generate recommendations for when goal already achieved
 */
function generateAchievedGoalAnalysis(
  goal: FinancialGoal,
  currentAmount: number,
  monthlySavingsRate: number,
  expectedReturn: number,
  currentYear: number,
): GoalAdjustmentAnalysis {
  return {
    goal,
    currentAmount,
    yearsRemaining: goal.targetYear ? goal.targetYear - currentYear : undefined,
    monthlySavingsRate,
    expectedReturn,
    onTrack: true,
    progressPercentage: (currentAmount / goal.targetAmount) * 100,
    recommendations: [generateOnTrackConfirmation()],
    expectedYearsToGoal: 0,
  }
}

/**
 * Generate recommendations for when goal is on track
 */
function generateOnTrackAnalysis(
  goal: FinancialGoal,
  currentAmount: number,
  monthlySavingsRate: number,
  expectedReturn: number,
  currentYear: number,
): GoalAdjustmentAnalysis {
  return {
    goal,
    currentAmount,
    yearsRemaining: goal.targetYear ? goal.targetYear - currentYear : undefined,
    monthlySavingsRate,
    expectedReturn,
    onTrack: true,
    progressPercentage: (currentAmount / goal.targetAmount) * 100,
    recommendations: [
      generateOnTrackConfirmation(),
      generateReduceCostsRecommendation('low'),
    ],
  }
}

/**
 * Generate recommendations when goal has target year and active savings
 */
function generateRecommendationsWithTargetYear(
  goal: FinancialGoal,
  currentAmount: number,
  monthlySavingsRate: number,
  expectedReturn: number,
  currentYear: number,
  severity: AdjustmentSeverity,
  expectedYearsToGoal: number | undefined,
): AdjustmentRecommendation[] {
  const recommendations: AdjustmentRecommendation[] = []
  const yearsRemaining = goal.targetYear! - currentYear

  if (yearsRemaining > 0) {
    const requiredSavings = calculateRequiredMonthlySavings(
      currentAmount,
      goal.targetAmount,
      yearsRemaining,
      expectedReturn,
    )

    if (requiredSavings < monthlySavingsRate * 3) {
      recommendations.push(generateIncreaseSavingsRecommendation(monthlySavingsRate, requiredSavings, severity))
    } else {
      recommendations.push(generateAdjustExpectationsRecommendation(
        goal.targetAmount,
        currentAmount * 1.5,
        severity,
      ))
    }

    if (expectedYearsToGoal && expectedYearsToGoal > yearsRemaining) {
      recommendations.push(
        generateAdjustTimelineRecommendation(expectedYearsToGoal, goal.targetYear!, currentYear, severity),
      )
    }
  } else {
    recommendations.push(
      generateAdjustTimelineRecommendation(
        expectedYearsToGoal || 5,
        goal.targetYear!,
        currentYear,
        'critical',
      ),
    )
  }

  return recommendations
}

/**
 * Generate recommendations when no target year or no savings
 */
function generateRecommendationsWithoutTargetYear(
  goal: FinancialGoal,
  currentAmount: number,
  monthlySavingsRate: number,
): AdjustmentRecommendation[] {
  const recommendations: AdjustmentRecommendation[] = []

  if (monthlySavingsRate <= 0) {
    const estimatedRequiredSavings = (goal.targetAmount - currentAmount) / (10 * 12)
    recommendations.push(generateIncreaseSavingsRecommendation(0, estimatedRequiredSavings, 'high'))
  }

  return recommendations
}

/**
 * Determine severity based on how far off track
 */
function calculateProgressSeverity(
  currentAmount: number,
  targetAmount: number,
  currentYear: number,
  targetYear: number | undefined,
): AdjustmentSeverity {
  const progressPercentage = (currentAmount / targetAmount) * 100
  const expectedProgress = targetYear
    ? ((currentYear - (targetYear - 20)) / 20) * 100
    : 50

  const progressGap = Math.max(0, expectedProgress - progressPercentage)
  return calculateSeverity(progressGap)
}

/**
 * Add optional optimization recommendations
 */
function addOptionalRecommendations(
  recommendations: AdjustmentRecommendation[],
  expectedReturn: number,
  severity: AdjustmentSeverity,
): void {
  if (expectedReturn < 0.07 && severity !== 'low') {
    recommendations.push(generateImproveReturnsRecommendation(expectedReturn, 0.07, 'medium'))
  }
  recommendations.push(generateReduceCostsRecommendation(severity))
}

/**
 * Generate off-track recommendations
 */
function generateOffTrackRecommendations(
  goal: FinancialGoal,
  currentAmount: number,
  monthlySavingsRate: number,
  expectedReturn: number,
  currentYear: number,
  expectedYearsToGoal: number | undefined,
): AdjustmentRecommendation[] {
  const severity = calculateProgressSeverity(currentAmount, goal.targetAmount, currentYear, goal.targetYear)
  const recommendations: AdjustmentRecommendation[] = []
  const hasTargetYearAndSavings = goal.targetYear && monthlySavingsRate > 0

  if (hasTargetYearAndSavings) {
    recommendations.push(...generateRecommendationsWithTargetYear(
      goal,
      currentAmount,
      monthlySavingsRate,
      expectedReturn,
      currentYear,
      severity,
      expectedYearsToGoal,
    ))
  } else {
    recommendations.push(...generateRecommendationsWithoutTargetYear(goal, currentAmount, monthlySavingsRate))
  }

  addOptionalRecommendations(recommendations, expectedReturn, severity)
  recommendations.sort((a, b) => a.priority - b.priority)

  return recommendations
}

/**
 * Analyze goal and generate adjustment recommendations
 *
 * @param params - Parameters for goal analysis
 * @returns Complete analysis with recommendations
 */
export function analyzeGoalAdjustments(params: GoalAdjustmentParams): GoalAdjustmentAnalysis {
  const { goal, currentAmount, monthlySavingsRate = 0, expectedReturn = 0.05, currentYear } = params

  const progressPercentage = (currentAmount / goal.targetAmount) * 100
  const onTrack = isGoalOnTrack(currentAmount, goal.targetAmount, currentYear, goal.targetYear)

  // If already achieved, return success
  if (currentAmount >= goal.targetAmount) {
    return generateAchievedGoalAnalysis(goal, currentAmount, monthlySavingsRate, expectedReturn, currentYear)
  }

  // If on track, provide encouragement
  if (onTrack) {
    return generateOnTrackAnalysis(goal, currentAmount, monthlySavingsRate, expectedReturn, currentYear)
  }

  // Calculate expected years to reach goal
  const expectedYearsToGoal = monthlySavingsRate > 0
    ? calculateYearsToGoal(currentAmount, goal.targetAmount, monthlySavingsRate, expectedReturn)
    : undefined

  // Generate recommendations for off-track goal
  const recommendations = generateOffTrackRecommendations(
    goal,
    currentAmount,
    monthlySavingsRate,
    expectedReturn,
    currentYear,
    expectedYearsToGoal,
  )

  return {
    goal,
    currentAmount,
    yearsRemaining: goal.targetYear ? goal.targetYear - currentYear : undefined,
    monthlySavingsRate,
    expectedReturn,
    onTrack,
    progressPercentage,
    recommendations,
    expectedYearsToGoal,
  }
}
