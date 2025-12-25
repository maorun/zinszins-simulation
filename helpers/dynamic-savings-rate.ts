/**
 * Dynamic Savings Rate Helper Functions
 *
 * Implements automatic adjustment of savings rates based on:
 * - Life phases (Berufsstart, Karrieremitte, Pre-Retirement)
 * - Income development (salary increases)
 * - Life events (birth, children leaving, debt payoff, inheritance)
 *
 * @module dynamic-savings-rate
 */

/**
 * Life phase for savings rate adjustment
 */
export type LifePhase =
  | 'berufsstart' // Career start (25-30): Lower savings rate due to lower income
  | 'karrieremitte' // Mid-career (30-50): Highest savings rate with higher income
  | 'pre_retirement' // Pre-retirement (50-67): Maximum savings rate before retirement

/**
 * Configuration for a life phase period
 */
export type LifePhaseConfig = {
  phase: LifePhase
  startAge: number // Age when this phase starts
  endAge: number // Age when this phase ends
  savingsRateMultiplier: number // Multiplier for base savings rate (e.g., 0.5 = 50%, 1.5 = 150%)
}

/**
 * Life event that triggers savings rate adjustment
 */
export type LifeEvent = {
  year: number // Year when the event occurs
  type: 'geburt' | 'auszug_kinder' | 'kreditabbezahlung' | 'erbschaft' // Event type
  savingsRateChange: number // Change in savings rate (e.g., -500 = -500€ per month, +1000 = +1000€ per month)
  description?: string // Optional description of the event
}

/**
 * Income development configuration
 */
export type SalaryIncrease = {
  startAge: number
  endAge: number
  annualIncreasePercent: number // e.g., 3.0 for 3% annual increase
}

export type IncomeDevelopmentConfig = {
  enabled: boolean
  // Percentage of salary increase that goes to savings (e.g., 0.5 = 50% of raise)
  savingsRateOfIncrease: number
  // Expected annual salary increases by age range
  salaryIncreases: SalaryIncrease[]
}

/**
 * Complete configuration for dynamic savings rates
 */
export type DynamicSavingsRateConfig = {
  enabled: boolean
  baseSavingsRate: number // Base monthly/yearly savings amount
  birthYear: number // User's birth year for age calculations
  
  // Life phase-based adjustments
  lifePhases?: LifePhaseConfig[]
  
  // Income development-based adjustments
  incomeDevelopment?: IncomeDevelopmentConfig
  
  // Event-triggered adjustments
  lifeEvents?: LifeEvent[]
}

/**
 * Default life phase configurations (conservative estimates)
 */
export const DEFAULT_LIFE_PHASES: LifePhaseConfig[] = [
  {
    phase: 'berufsstart',
    startAge: 25,
    endAge: 29,
    savingsRateMultiplier: 0.6, // 60% of base rate
  },
  {
    phase: 'karrieremitte',
    startAge: 30,
    endAge: 49,
    savingsRateMultiplier: 1.0, // 100% of base rate
  },
  {
    phase: 'pre_retirement',
    startAge: 50,
    endAge: 67,
    savingsRateMultiplier: 1.3, // 130% of base rate
  },
] as const

/**
 * Calculate age from birth year and current year
 */
export function calculateAge(birthYear: number, currentYear: number): number {
  return currentYear - birthYear
}

/**
 * Get the active life phase for a given year
 */
export function getActiveLifePhase(
  birthYear: number,
  year: number,
  lifePhases: LifePhaseConfig[],
): LifePhaseConfig | null {
  const age = calculateAge(birthYear, year)
  
  for (const phase of lifePhases) {
    if (age >= phase.startAge && age <= phase.endAge) {
      return phase
    }
  }
  
  return null
}

/**
 * Calculate savings rate multiplier based on life phase
 */
export function calculateLifePhaseMultiplier(
  birthYear: number,
  year: number,
  lifePhases?: LifePhaseConfig[],
): number {
  if (!lifePhases || lifePhases.length === 0) {
    return 1.0
  }
  
  const activePhase = getActiveLifePhase(birthYear, year, lifePhases)
  return activePhase?.savingsRateMultiplier ?? 1.0
}

/**
 * Calculate cumulative income development adjustment up to a given year
 */
export function calculateIncomeDevelopmentAdjustment(
  birthYear: number,
  startYear: number,
  currentYear: number,
  baseSavingsRate: number,
  incomeDevelopment?: IncomeDevelopmentConfig,
): number {
  if (!incomeDevelopment?.enabled || !incomeDevelopment.salaryIncreases) {
    return 0
  }
  
  let cumulativeAdjustment = 0
  
  // Calculate for each year from start to current
  for (let year = startYear + 1; year <= currentYear; year++) {
    const age = calculateAge(birthYear, year)
    
    // Find applicable salary increase for this age
    const salaryIncrease = incomeDevelopment.salaryIncreases.find(
      (increase) => age >= increase.startAge && age <= increase.endAge,
    )
    
    if (salaryIncrease) {
      // Calculate the increase in savings from salary growth
      // Assume savings rate applies to the increase
      const salaryGrowthRate = salaryIncrease.annualIncreasePercent / 100
      const savingsIncrease =
        baseSavingsRate * salaryGrowthRate * incomeDevelopment.savingsRateOfIncrease
      cumulativeAdjustment += savingsIncrease
    }
  }
  
  return cumulativeAdjustment
}

/**
 * Calculate cumulative life event adjustments up to a given year
 */
export function calculateLifeEventAdjustments(
  year: number,
  lifeEvents?: LifeEvent[],
): number {
  if (!lifeEvents || lifeEvents.length === 0) {
    return 0
  }
  
  // Sum all event adjustments that have occurred up to this year
  return lifeEvents
    .filter((event) => event.year <= year)
    .reduce((sum, event) => sum + event.savingsRateChange, 0)
}

/**
 * Calculate the adjusted savings rate for a given year
 * This is the main function that combines all adjustment types
 */
export function calculateDynamicSavingsRate(
  year: number,
  startYear: number,
  config: DynamicSavingsRateConfig,
): number {
  if (!config.enabled) {
    return config.baseSavingsRate
  }
  
  // Start with base savings rate
  let adjustedRate = config.baseSavingsRate
  
  // Apply life phase multiplier
  const lifePhaseMultiplier = calculateLifePhaseMultiplier(
    config.birthYear,
    year,
    config.lifePhases,
  )
  adjustedRate *= lifePhaseMultiplier
  
  // Add income development adjustment
  const incomeAdjustment = calculateIncomeDevelopmentAdjustment(
    config.birthYear,
    startYear,
    year,
    config.baseSavingsRate,
    config.incomeDevelopment,
  )
  adjustedRate += incomeAdjustment
  
  // Add life event adjustments
  const eventAdjustment = calculateLifeEventAdjustments(year, config.lifeEvents)
  adjustedRate += eventAdjustment
  
  // Ensure rate doesn't go negative
  return Math.max(0, adjustedRate)
}

/**
 * Get a detailed breakdown of how the savings rate was calculated for a year
 */
export type SavingsRateBreakdown = {
  baseRate: number
  lifePhaseMultiplier: number
  lifePhaseAmount: number
  incomeDevelopmentAdjustment: number
  lifeEventAdjustment: number
  totalRate: number
  activePhase?: LifePhaseConfig
}

export function getSavingsRateBreakdown(
  year: number,
  startYear: number,
  config: DynamicSavingsRateConfig,
): SavingsRateBreakdown {
  const baseRate = config.baseSavingsRate
  const lifePhaseMultiplier = calculateLifePhaseMultiplier(
    config.birthYear,
    year,
    config.lifePhases,
  )
  const lifePhaseAmount = baseRate * lifePhaseMultiplier
  const incomeDevelopmentAdjustment = calculateIncomeDevelopmentAdjustment(
    config.birthYear,
    startYear,
    year,
    baseRate,
    config.incomeDevelopment,
  )
  const lifeEventAdjustment = calculateLifeEventAdjustments(year, config.lifeEvents)
  const totalRate = Math.max(0, lifePhaseAmount + incomeDevelopmentAdjustment + lifeEventAdjustment)
  
  const activePhase = config.lifePhases
    ? getActiveLifePhase(config.birthYear, year, config.lifePhases)
    : undefined
  
  return {
    baseRate,
    lifePhaseMultiplier,
    lifePhaseAmount,
    incomeDevelopmentAdjustment,
    lifeEventAdjustment,
    totalRate,
    activePhase: activePhase ?? undefined,
  }
}

/**
 * Validate dynamic savings rate configuration
 */
export type ValidationError = {
  field: string
  message: string
}

function validateBasicFields(config: DynamicSavingsRateConfig, errors: ValidationError[]): void {
  if (config.baseSavingsRate < 0) {
    errors.push({
      field: 'baseSavingsRate',
      message: 'Basis-Sparrate darf nicht negativ sein',
    })
  }
  
  const currentYear = new Date().getFullYear()
  if (config.birthYear < 1900 || config.birthYear > currentYear) {
    errors.push({
      field: 'birthYear',
      message: `Geburtsjahr muss zwischen 1900 und ${currentYear} liegen`,
    })
  }
}

function validateLifePhaseOverlaps(config: DynamicSavingsRateConfig, errors: ValidationError[]): void {
  if (!config.lifePhases || config.lifePhases.length <= 1) {
    return
  }
  
  for (let i = 0; i < config.lifePhases.length - 1; i++) {
    const current = config.lifePhases[i]
    const next = config.lifePhases[i + 1]
    
    if (current.endAge >= next.startAge) {
      errors.push({
        field: 'lifePhases',
        message: `Lebensphase "${current.phase}" überschneidet sich mit "${next.phase}"`,
      })
    }
  }
}

function validateLifePhaseDetails(config: DynamicSavingsRateConfig, errors: ValidationError[]): void {
  if (!config.lifePhases) {
    return
  }
  
  for (const phase of config.lifePhases) {
    if (phase.savingsRateMultiplier < 0) {
      errors.push({
        field: 'lifePhases',
        message: `Multiplikator für Lebensphase "${phase.phase}" darf nicht negativ sein`,
      })
    }
    if (phase.startAge >= phase.endAge) {
      errors.push({
        field: 'lifePhases',
        message: `Startalter muss kleiner als Endalter sein für Lebensphase "${phase.phase}"`,
      })
    }
  }
}

function validateIncomeDevelopment(config: DynamicSavingsRateConfig, errors: ValidationError[]): void {
  if (!config.incomeDevelopment?.enabled) {
    return
  }
  
  const { savingsRateOfIncrease, salaryIncreases } = config.incomeDevelopment
  
  if (savingsRateOfIncrease < 0 || savingsRateOfIncrease > 1) {
    errors.push({
      field: 'incomeDevelopment.savingsRateOfIncrease',
      message: 'Sparquote der Gehaltserhöhung muss zwischen 0% und 100% liegen',
    })
  }
  
  if (salaryIncreases) {
    for (const increase of salaryIncreases) {
      if (increase.annualIncreasePercent < 0) {
        errors.push({
          field: 'incomeDevelopment.salaryIncreases',
          message: 'Jährliche Gehaltserhöhung darf nicht negativ sein',
        })
      }
    }
  }
}

export function validateDynamicSavingsConfig(
  config: DynamicSavingsRateConfig,
): ValidationError[] {
  const errors: ValidationError[] = []
  
  validateBasicFields(config, errors)
  validateLifePhaseOverlaps(config, errors)
  validateLifePhaseDetails(config, errors)
  validateIncomeDevelopment(config, errors)
  
  return errors
}

/**
 * Create a default dynamic savings rate configuration
 */
export function createDefaultDynamicSavingsConfig(
  baseSavingsRate: number,
  birthYear?: number,
): DynamicSavingsRateConfig {
  const currentYear = new Date().getFullYear()
  const defaultBirthYear = birthYear ?? currentYear - 30 // Default: 30 years old
  
  return {
    enabled: false,
    baseSavingsRate,
    birthYear: defaultBirthYear,
    lifePhases: DEFAULT_LIFE_PHASES,
    incomeDevelopment: {
      enabled: false,
      savingsRateOfIncrease: 0.5, // 50% of salary increase
      salaryIncreases: [
        {
          startAge: 25,
          endAge: 35,
          annualIncreasePercent: 4.0, // 4% annual increase early career
        },
        {
          startAge: 35,
          endAge: 50,
          annualIncreasePercent: 2.5, // 2.5% annual increase mid career
        },
        {
          startAge: 50,
          endAge: 67,
          annualIncreasePercent: 1.5, // 1.5% annual increase late career
        },
      ],
    },
    lifeEvents: [],
  }
}
