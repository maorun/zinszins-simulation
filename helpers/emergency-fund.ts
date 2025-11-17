/**
 * Emergency Fund / Liquidity Reserve Planning Module (Liquiditätsplanung)
 *
 * Implements emergency fund and cash reserve planning for the Zinseszins-Simulation.
 * Follows German financial planning standards for emergency reserves.
 */

/**
 * Employment type for determining appropriate emergency fund size
 */
export type EmploymentType = 'employee' | 'self-employed' | 'retired'

/**
 * Risk tolerance for cash reserve strategy
 */
export type ReserveStrategy = 'conservative' | 'balanced' | 'aggressive'

/**
 * Emergency fund configuration
 */
export interface EmergencyFundConfig {
  /** Whether emergency fund planning is active */
  enabled: boolean
  /** Monthly expenses in EUR (baseline for calculation) */
  monthlyExpenses: number
  /** Target number of months of expenses to save */
  targetMonths: number
  /** Employment type (affects recommendations) */
  employmentType: EmploymentType
  /** Reserve strategy (affects asset allocation) */
  reserveStrategy: ReserveStrategy
  /** Whether to include emergency fund in investment calculations */
  excludeFromInvestment: boolean
}

/**
 * Emergency fund status and metrics
 */
export interface EmergencyFundStatus {
  /** Current capital allocated to emergency fund in EUR */
  currentAmount: number
  /** Target amount needed in EUR */
  targetAmount: number
  /** Progress toward target (0-100+) */
  progress: number
  /** Whether target is met */
  isFunded: boolean
  /** Shortfall amount in EUR (0 if fully funded) */
  shortfall: number
  /** Number of months covered at current level */
  monthsCovered: number
  /** Recommended months based on employment type */
  recommendedMonths: number
}

/**
 * Get recommended months of emergency fund based on employment type
 *
 * German financial planning standards:
 * - Employees: 3-6 months (default 3)
 * - Self-employed: 6-12 months (default 6)
 * - Retired: 1-3 months (default 2, since they have stable pension income)
 *
 * @param employmentType - Type of employment
 * @param strategy - Reserve strategy (affects recommendation)
 * @returns Recommended number of months
 */
export function getRecommendedMonths(employmentType: EmploymentType, strategy: ReserveStrategy): number {
  const recommendations = {
    employee: {
      conservative: 6,
      balanced: 4,
      aggressive: 3,
    },
    'self-employed': {
      conservative: 12,
      balanced: 9,
      aggressive: 6,
    },
    retired: {
      conservative: 3,
      balanced: 2,
      aggressive: 1,
    },
  }

  return recommendations[employmentType][strategy]
}

/**
 * Calculate emergency fund target amount
 *
 * @param monthlyExpenses - Monthly expenses in EUR
 * @param targetMonths - Target number of months to cover
 * @returns Target amount in EUR
 */
export function calculateTargetAmount(monthlyExpenses: number, targetMonths: number): number {
  return monthlyExpenses * targetMonths
}

/**
 * Calculate emergency fund status
 *
 * @param currentCapital - Current total capital in EUR
 * @param config - Emergency fund configuration
 * @returns Emergency fund status and metrics
 */
export function calculateEmergencyFundStatus(currentCapital: number, config: EmergencyFundConfig): EmergencyFundStatus {
  const targetAmount = calculateTargetAmount(config.monthlyExpenses, config.targetMonths)
  const recommendedMonths = getRecommendedMonths(config.employmentType, config.reserveStrategy)

  // If excludeFromInvestment is true, we track emergency fund separately
  // Otherwise, we consider it part of total capital
  const currentAmount = config.excludeFromInvestment ? Math.min(currentCapital, targetAmount) : currentCapital

  const progress = targetAmount > 0 ? (currentAmount / targetAmount) * 100 : 0
  const isFunded = currentAmount >= targetAmount
  const shortfall = Math.max(0, targetAmount - currentAmount)
  const monthsCovered = config.monthlyExpenses > 0 ? currentAmount / config.monthlyExpenses : 0

  return {
    currentAmount,
    targetAmount,
    progress: Math.max(0, progress),
    isFunded,
    shortfall,
    monthsCovered,
    recommendedMonths,
  }
}

/**
 * Get investment-eligible capital (total capital minus emergency fund if excluded)
 *
 * @param totalCapital - Total available capital in EUR
 * @param config - Emergency fund configuration
 * @returns Capital available for investment in EUR
 */
export function getInvestmentEligibleCapital(totalCapital: number, config: EmergencyFundConfig): number {
  if (!config.enabled || !config.excludeFromInvestment) {
    return totalCapital
  }

  const targetAmount = calculateTargetAmount(config.monthlyExpenses, config.targetMonths)
  return Math.max(0, totalCapital - targetAmount)
}

/**
 * Get emergency fund allocation recommendation based on strategy
 *
 * Conservative: High liquidity focus (checking/savings accounts)
 * Balanced: Mix of liquid and short-term instruments
 * Aggressive: Minimum liquid, more in short-term investments
 *
 * @param strategy - Reserve strategy
 * @returns Allocation percentages
 */
export function getReserveAllocationRecommendation(strategy: ReserveStrategy): {
  checking: number // Girokonto
  savings: number // Tagesgeld
  shortTerm: number // Kurzfristige Anlagen (e.g., money market funds)
} {
  const allocations = {
    conservative: { checking: 30, savings: 60, shortTerm: 10 },
    balanced: { checking: 20, savings: 50, shortTerm: 30 },
    aggressive: { checking: 10, savings: 40, shortTerm: 50 },
  }

  return allocations[strategy]
}

/**
 * Get descriptive label for employment type
 *
 * @param employmentType - Employment type
 * @returns German label
 */
export function getEmploymentTypeLabel(employmentType: EmploymentType): string {
  const labels = {
    employee: 'Angestellter',
    'self-employed': 'Selbstständig',
    retired: 'Rentner',
  }
  return labels[employmentType]
}

/**
 * Get descriptive label for reserve strategy
 *
 * @param strategy - Reserve strategy
 * @returns German label
 */
export function getReserveStrategyLabel(strategy: ReserveStrategy): string {
  const labels = {
    conservative: 'Konservativ',
    balanced: 'Ausgewogen',
    aggressive: 'Aggressiv',
  }
  return labels[strategy]
}

/**
 * Get description for reserve strategy
 *
 * @param strategy - Reserve strategy
 * @returns German description
 */
export function getReserveStrategyDescription(strategy: ReserveStrategy): string {
  const descriptions = {
    conservative:
      'Hohe Liquidität: Schwerpunkt auf sofort verfügbaren Mitteln (Girokonto, Tagesgeld). Geringeres Renditepotenzial, aber maximale Sicherheit.',
    balanced:
      'Ausgewogene Liquidität: Mix aus sofort verfügbaren Mitteln und kurzfristigen Anlagen. Balance zwischen Verfügbarkeit und Rendite.',
    aggressive:
      'Optimierte Rendite: Minimale Liquidität, höherer Anteil in kurzfristigen Anlagen. Höheres Renditepotenzial bei leicht reduzierter sofortiger Verfügbarkeit.',
  }
  return descriptions[strategy]
}

/**
 * Default emergency fund configuration
 */
export const defaultEmergencyFundConfig: EmergencyFundConfig = {
  enabled: false,
  monthlyExpenses: 2000, // Default 2000€ per month
  targetMonths: 3, // Default 3 months for employees
  employmentType: 'employee',
  reserveStrategy: 'balanced',
  excludeFromInvestment: true,
}
