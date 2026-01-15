/**
 * Dynamic Spending Adjustment in Retirement
 *
 * Implements realistic age-based spending patterns in retirement based on research
 * showing that retirees typically spend less as they age (Go-Go, Slow-Go, No-Go phases).
 *
 * Research basis:
 * - Spending tends to decline by ~1-2% annually in real terms during retirement
 * - Active early retirement (Go-Go): 67-75 years - 100% spending
 * - Less active middle retirement (Slow-Go): 76-85 years - 75% spending  
 * - Sedentary late retirement (No-Go): 85+ years - 60% spending (offset by higher care costs)
 */

/**
 * Retirement spending phase definitions
 */
export type RetirementPhase = 'go-go' | 'slow-go' | 'no-go'

/**
 * Configuration for a spontaneous large expense
 */
export interface LargeExpense {
  /** Year when the expense occurs */
  year: number
  /** Amount of the expense in euros */
  amount: number
  /** Description of the expense (e.g., "Weltreise", "Wohnungsrenovierung", "Neues Auto") */
  description: string
  /** Category of the expense */
  category: 'reise' | 'renovierung' | 'auto' | 'gesundheit' | 'familie' | 'sonstiges'
}

/**
 * Configuration for age-based spending phases
 */
export interface RetirementPhaseConfig {
  /** Starting age for Go-Go phase (typically 67) */
  goGoStartAge: number
  /** Starting age for Slow-Go phase (typically 76) */
  slowGoStartAge: number
  /** Starting age for No-Go phase (typically 86) */
  noGoStartAge: number
  /** Spending multiplier for Go-Go phase (default: 1.0 = 100%) */
  goGoMultiplier: number
  /** Spending multiplier for Slow-Go phase (default: 0.75 = 75%) */
  slowGoMultiplier: number
  /** Spending multiplier for No-Go phase (default: 0.6 = 60%) */
  noGoMultiplier: number
}

/**
 * Configuration for medical cost progression with age
 */
export interface MedicalCostConfig {
  /** Enable medical cost progression */
  enabled: boolean
  /** Base annual medical costs at retirement start (in euros) */
  baseMedicalCosts: number
  /** Annual increase rate for medical costs (e.g., 0.04 = 4% per year) */
  medicalInflationRate: number
  /** Age when medical costs start increasing significantly (default: 75) */
  accelerationAge: number
  /** Accelerated increase rate after acceleration age (e.g., 0.06 = 6% per year) */
  acceleratedRate: number
}

/**
 * Complete configuration for dynamic spending adjustment
 */
export interface DynamicSpendingConfig {
  /** Enable dynamic spending adjustment */
  enabled: boolean
  /** Base annual spending amount (target spending at retirement start) */
  baseAnnualSpending: number
  /** Birth year of retiree for age calculation */
  birthYear: number
  /** Retirement phase configuration */
  phaseConfig: RetirementPhaseConfig
  /** Medical cost progression configuration */
  medicalCostConfig: MedicalCostConfig
  /** List of planned large expenses */
  largeExpenses: LargeExpense[]
  /** Annual gift/donation budget (optional) */
  annualGifts?: number
}

/**
 * Result of dynamic spending calculation for a single year
 */
export interface DynamicSpendingYearResult {
  /** The year */
  year: number
  /** Age of retiree in this year */
  age: number
  /** Current retirement phase */
  phase: RetirementPhase
  /** Base spending before adjustments */
  baseSpending: number
  /** Phase multiplier applied */
  phaseMultiplier: number
  /** Spending after phase adjustment */
  phaseAdjustedSpending: number
  /** Medical costs for this year */
  medicalCosts: number
  /** Large expenses in this year */
  largeExpenses: number
  /** Annual gifts/donations */
  gifts: number
  /** Total spending for the year */
  totalSpending: number
  /** Explanation of calculation */
  explanation: string
}

/**
 * Summary of dynamic spending over retirement period
 */
export interface DynamicSpendingSummary {
  /** Total years analyzed */
  totalYears: number
  /** Average annual spending */
  averageAnnualSpending: number
  /** Peak spending year */
  peakSpendingYear: number
  /** Peak spending amount */
  peakSpendingAmount: number
  /** Lowest spending year (excluding large expenses) */
  lowestSpendingYear: number
  /** Lowest spending amount */
  lowestSpendingAmount: number
  /** Total spending over all years */
  totalSpending: number
  /** Years in Go-Go phase */
  goGoYears: number
  /** Years in Slow-Go phase */
  slowGoYears: number
  /** Years in No-Go phase */
  noGoYears: number
  /** Total medical costs over all years */
  totalMedicalCosts: number
  /** Total large expenses */
  totalLargeExpenses: number
}

/**
 * Get default retirement phase configuration
 */
export function getDefaultPhaseConfig(): RetirementPhaseConfig {
  return {
    goGoStartAge: 67,
    slowGoStartAge: 76,
    noGoStartAge: 86,
    goGoMultiplier: 1.0,
    slowGoMultiplier: 0.75,
    noGoMultiplier: 0.6,
  }
}

/**
 * Get default medical cost configuration
 */
export function getDefaultMedicalCostConfig(): MedicalCostConfig {
  return {
    enabled: true,
    baseMedicalCosts: 2000,
    medicalInflationRate: 0.04,
    accelerationAge: 75,
    acceleratedRate: 0.06,
  }
}

/**
 * Get default dynamic spending configuration
 */
export function getDefaultDynamicSpendingConfig(birthYear: number, baseAnnualSpending: number): DynamicSpendingConfig {
  return {
    enabled: true,
    baseAnnualSpending,
    birthYear,
    phaseConfig: getDefaultPhaseConfig(),
    medicalCostConfig: getDefaultMedicalCostConfig(),
    largeExpenses: [],
    annualGifts: 0,
  }
}

/**
 * Determine retirement phase based on age
 */
export function getRetirementPhase(age: number, phaseConfig: RetirementPhaseConfig): RetirementPhase {
  if (age >= phaseConfig.noGoStartAge) {
    return 'no-go'
  }
  if (age >= phaseConfig.slowGoStartAge) {
    return 'slow-go'
  }
  return 'go-go'
}

/**
 * Get phase multiplier for a given phase
 */
export function getPhaseMultiplier(phase: RetirementPhase, phaseConfig: RetirementPhaseConfig): number {
  switch (phase) {
    case 'go-go':
      return phaseConfig.goGoMultiplier
    case 'slow-go':
      return phaseConfig.slowGoMultiplier
    case 'no-go':
      return phaseConfig.noGoMultiplier
  }
}

/**
 * Calculate medical costs for a given year
 */
export function calculateMedicalCosts(
  age: number,
  yearsSinceRetirement: number,
  medicalCostConfig: MedicalCostConfig,
): number {
  if (!medicalCostConfig.enabled) {
    return 0
  }

  const yearsAtAcceleratedRate = Math.max(0, age - medicalCostConfig.accelerationAge)
  const yearsAtNormalRate = Math.max(0, yearsSinceRetirement - yearsAtAcceleratedRate)

  // Calculate costs with compound growth
  // Normal rate until acceleration age, then accelerated rate
  let costs = medicalCostConfig.baseMedicalCosts

  // Apply normal rate for years before acceleration
  costs *= Math.pow(1 + medicalCostConfig.medicalInflationRate, yearsAtNormalRate)

  // Apply accelerated rate for years after acceleration age
  costs *= Math.pow(1 + medicalCostConfig.acceleratedRate, yearsAtAcceleratedRate)

  return costs
}

/**
 * Get large expenses for a specific year
 */
export function getLargeExpensesForYear(year: number, largeExpenses: LargeExpense[]): number {
  return largeExpenses.filter((expense) => expense.year === year).reduce((sum, expense) => sum + expense.amount, 0)
}

/**
 * Calculate dynamic spending for a single year
 */
export function calculateDynamicSpendingForYear(
  year: number,
  config: DynamicSpendingConfig,
  retirementStartYear: number,
): DynamicSpendingYearResult {
  const age = year - config.birthYear
  const yearsSinceRetirement = year - retirementStartYear

  // Determine phase
  const phase = getRetirementPhase(age, config.phaseConfig)
  const phaseMultiplier = getPhaseMultiplier(phase, config.phaseConfig)

  // Calculate phase-adjusted spending
  const baseSpending = config.baseAnnualSpending
  const phaseAdjustedSpending = baseSpending * phaseMultiplier

  // Calculate medical costs
  const medicalCosts = calculateMedicalCosts(age, yearsSinceRetirement, config.medicalCostConfig)

  // Get large expenses
  const largeExpenses = getLargeExpensesForYear(year, config.largeExpenses)

  // Annual gifts
  const gifts = config.annualGifts || 0

  // Total spending
  const totalSpending = phaseAdjustedSpending + medicalCosts + largeExpenses + gifts

  // Generate explanation
  const phaseNames = {
    'go-go': 'Go-Go-Phase (aktiver Ruhestand)',
    'slow-go': 'Slow-Go-Phase (reduzierte Aktivität)',
    'no-go': 'No-Go-Phase (überwiegend häuslich)',
  }

  let explanation = `${phaseNames[phase]}: ${(phaseMultiplier * 100).toFixed(0)}% der Basis-Ausgaben`

  if (medicalCosts > 0) {
    explanation += `, medizinische Kosten: ${medicalCosts.toFixed(0)}€`
  }

  if (largeExpenses > 0) {
    const expenseList = config.largeExpenses
      .filter((e) => e.year === year)
      .map((e) => e.description)
      .join(', ')
    explanation += `, Großausgaben: ${expenseList} (${largeExpenses.toFixed(0)}€)`
  }

  if (gifts > 0) {
    explanation += `, Geschenke/Spenden: ${gifts.toFixed(0)}€`
  }

  return {
    year,
    age,
    phase,
    baseSpending,
    phaseMultiplier,
    phaseAdjustedSpending,
    medicalCosts,
    largeExpenses,
    gifts,
    totalSpending,
    explanation,
  }
}

/**
 * Calculate dynamic spending for all years in retirement
 */
export function calculateDynamicSpending(
  startYear: number,
  endYear: number,
  config: DynamicSpendingConfig,
): DynamicSpendingYearResult[] {
  const results: DynamicSpendingYearResult[] = []

  for (let year = startYear; year <= endYear; year++) {
    results.push(calculateDynamicSpendingForYear(year, config, startYear))
  }

  return results
}

/**
 * Calculate summary statistics for dynamic spending
 */
export function calculateDynamicSpendingSummary(results: DynamicSpendingYearResult[]): DynamicSpendingSummary {
  if (results.length === 0) {
    throw new Error('Cannot calculate summary for empty results')
  }

  const totalYears = results.length
  const totalSpending = results.reduce((sum, r) => sum + r.totalSpending, 0)
  const averageAnnualSpending = totalSpending / totalYears

  // Find peak spending (excluding large expenses for more meaningful comparison)
  const baseSpending = results.map((r) => r.phaseAdjustedSpending + r.medicalCosts + r.gifts)
  const peakSpendingIndex = results.findIndex((r) => r.totalSpending === Math.max(...results.map((res) => res.totalSpending)))
  const lowestSpendingIndex = results.findIndex((_r, i) => baseSpending[i] === Math.min(...baseSpending))

  // Count years in each phase
  const goGoYears = results.filter((r) => r.phase === 'go-go').length
  const slowGoYears = results.filter((r) => r.phase === 'slow-go').length
  const noGoYears = results.filter((r) => r.phase === 'no-go').length

  // Sum costs
  const totalMedicalCosts = results.reduce((sum, r) => sum + r.medicalCosts, 0)
  const totalLargeExpenses = results.reduce((sum, r) => sum + r.largeExpenses, 0)

  return {
    totalYears,
    averageAnnualSpending,
    peakSpendingYear: results[peakSpendingIndex].year,
    peakSpendingAmount: results[peakSpendingIndex].totalSpending,
    lowestSpendingYear: results[lowestSpendingIndex].year,
    lowestSpendingAmount: baseSpending[lowestSpendingIndex],
    totalSpending,
    goGoYears,
    slowGoYears,
    noGoYears,
    totalMedicalCosts,
    totalLargeExpenses,
  }
}

/**
 * Validate basic configuration fields
 */
function validateBasicConfig(config: DynamicSpendingConfig): string[] {
  const errors: string[] = []

  if (config.baseAnnualSpending <= 0) {
    errors.push('Basis-Jahresausgaben müssen größer als 0 sein')
  }

  if (config.birthYear < 1900 || config.birthYear > 2100) {
    errors.push('Geburtsjahr muss zwischen 1900 und 2100 liegen')
  }

  if (config.annualGifts && config.annualGifts < 0) {
    errors.push('Jährliche Geschenke/Spenden können nicht negativ sein')
  }

  return errors
}

/**
 * Validate phase configuration
 */
function validatePhaseConfig(phaseConfig: RetirementPhaseConfig): string[] {
  const errors: string[] = []

  if (phaseConfig.slowGoStartAge <= phaseConfig.goGoStartAge) {
    errors.push('Slow-Go-Phase muss nach Go-Go-Phase beginnen')
  }

  if (phaseConfig.noGoStartAge <= phaseConfig.slowGoStartAge) {
    errors.push('No-Go-Phase muss nach Slow-Go-Phase beginnen')
  }

  const multipliers = [phaseConfig.goGoMultiplier, phaseConfig.slowGoMultiplier, phaseConfig.noGoMultiplier]
  const invalidMultiplier = multipliers.some((m) => m < 0 || m > 2)

  if (invalidMultiplier) {
    errors.push('Phasen-Multiplikatoren müssen zwischen 0 und 2 liegen')
  }

  return errors
}

/**
 * Check if rate is within valid range
 */
function isValidInflationRate(rate: number): boolean {
  return rate >= -0.1 && rate <= 0.5
}

/**
 * Validate medical cost configuration
 */
function validateMedicalConfig(medicalConfig: MedicalCostConfig): string[] {
  const errors: string[] = []

  if (!medicalConfig.enabled) {
    return errors
  }

  if (medicalConfig.baseMedicalCosts < 0) {
    errors.push('Basis-Gesundheitskosten können nicht negativ sein')
  }

  if (!isValidInflationRate(medicalConfig.medicalInflationRate)) {
    errors.push('Medizinische Inflationsrate muss zwischen -10% und 50% liegen')
  }

  if (!isValidInflationRate(medicalConfig.acceleratedRate)) {
    errors.push('Beschleunigte Inflationsrate muss zwischen -10% und 50% liegen')
  }

  if (medicalConfig.accelerationAge < 60 || medicalConfig.accelerationAge > 100) {
    errors.push('Beschleunigungsalter muss zwischen 60 und 100 liegen')
  }

  return errors
}

/**
 * Validate large expenses
 */
function validateLargeExpenses(expenses: LargeExpense[]): string[] {
  const errors: string[] = []

  expenses.forEach((expense, index) => {
    if (expense.amount <= 0) {
      errors.push(`Großausgabe ${index + 1}: Betrag muss größer als 0 sein`)
    }

    if (expense.year < 2000 || expense.year > 2150) {
      errors.push(`Großausgabe ${index + 1}: Jahr muss zwischen 2000 und 2150 liegen`)
    }

    if (!expense.description || expense.description.trim().length === 0) {
      errors.push(`Großausgabe ${index + 1}: Beschreibung erforderlich`)
    }
  })

  return errors
}

/**
 * Validate dynamic spending configuration
 */
export function validateDynamicSpendingConfig(config: DynamicSpendingConfig): string[] {
  return [
    ...validateBasicConfig(config),
    ...validatePhaseConfig(config.phaseConfig),
    ...validateMedicalConfig(config.medicalCostConfig),
    ...validateLargeExpenses(config.largeExpenses),
  ]
}

/**
 * Get human-readable phase name in German
 */
export function getPhaseNameGerman(phase: RetirementPhase): string {
  const names = {
    'go-go': 'Go-Go-Phase',
    'slow-go': 'Slow-Go-Phase',
    'no-go': 'No-Go-Phase',
  }
  return names[phase]
}

/**
 * Get phase description in German
 */
export function getPhaseDescriptionGerman(phase: RetirementPhase): string {
  const descriptions = {
    'go-go': 'Aktiver Ruhestand mit Reisen, Hobbys und hoher Mobilität',
    'slow-go': 'Reduzierte Aktivitäten, weniger Reisen, mehr Zeit zu Hause',
    'no-go': 'Überwiegend häuslicher Lebensstil mit höheren Pflegekosten',
  }
  return descriptions[phase]
}

/**
 * Get expense category name in German
 */
export function getExpenseCategoryNameGerman(category: LargeExpense['category']): string {
  const names = {
    reise: 'Reise',
    renovierung: 'Renovierung',
    auto: 'Auto',
    gesundheit: 'Gesundheit',
    familie: 'Familie',
    sonstiges: 'Sonstiges',
  }
  return names[category]
}
