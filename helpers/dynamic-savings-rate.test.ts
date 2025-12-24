import { describe, it, expect } from 'vitest'
import {
  calculateAge,
  calculateDynamicSavingsRate,
  calculateIncomeDevelopmentAdjustment,
  calculateLifeEventAdjustments,
  calculateLifePhaseMultiplier,
  createDefaultDynamicSavingsConfig,
  DEFAULT_LIFE_PHASES,
  getActiveLifePhase,
  getSavingsRateBreakdown,
  validateDynamicSavingsConfig,
  type DynamicSavingsRateConfig,
  type LifeEvent,
} from './dynamic-savings-rate'

describe('dynamic-savings-rate', () => {
  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      expect(calculateAge(1990, 2024)).toBe(34)
      expect(calculateAge(1985, 2024)).toBe(39)
      expect(calculateAge(2000, 2024)).toBe(24)
    })
  })

  describe('getActiveLifePhase', () => {
    it('should return correct life phase for given age', () => {
      const birthYear = 1990

      // Age 28 (year 2018) -> Berufsstart (25-30)
      const phase2018 = getActiveLifePhase(birthYear, 2018, DEFAULT_LIFE_PHASES)
      expect(phase2018?.phase).toBe('berufsstart')
      expect(phase2018?.savingsRateMultiplier).toBe(0.6)

      // Age 35 (year 2025) -> Karrieremitte (30-50)
      const phase2025 = getActiveLifePhase(birthYear, 2025, DEFAULT_LIFE_PHASES)
      expect(phase2025?.phase).toBe('karrieremitte')
      expect(phase2025?.savingsRateMultiplier).toBe(1.0)

      // Age 55 (year 2045) -> Pre-retirement (50-67)
      const phase2045 = getActiveLifePhase(birthYear, 2045, DEFAULT_LIFE_PHASES)
      expect(phase2045?.phase).toBe('pre_retirement')
      expect(phase2045?.savingsRateMultiplier).toBe(1.3)
    })

    it('should return null if no phase matches', () => {
      const birthYear = 1990
      // Age 20 (year 2010) -> Before any phase starts
      const phase = getActiveLifePhase(birthYear, 2010, DEFAULT_LIFE_PHASES)
      expect(phase).toBeNull()
    })
  })

  describe('calculateLifePhaseMultiplier', () => {
    it('should return correct multiplier for each life phase', () => {
      const birthYear = 1990

      expect(calculateLifePhaseMultiplier(birthYear, 2018, DEFAULT_LIFE_PHASES)).toBe(0.6) // Berufsstart
      expect(calculateLifePhaseMultiplier(birthYear, 2025, DEFAULT_LIFE_PHASES)).toBe(1.0) // Karrieremitte
      expect(calculateLifePhaseMultiplier(birthYear, 2045, DEFAULT_LIFE_PHASES)).toBe(1.3) // Pre-retirement
    })

    it('should return 1.0 if no phases defined', () => {
      expect(calculateLifePhaseMultiplier(1990, 2024, undefined)).toBe(1.0)
      expect(calculateLifePhaseMultiplier(1990, 2024, [])).toBe(1.0)
    })

    it('should return 1.0 if age does not match any phase', () => {
      const birthYear = 1990
      expect(calculateLifePhaseMultiplier(birthYear, 2010, DEFAULT_LIFE_PHASES)).toBe(1.0) // Age 20
    })
  })

  describe('calculateIncomeDevelopmentAdjustment', () => {
    it('should return 0 when income development is disabled', () => {
      const adjustment = calculateIncomeDevelopmentAdjustment(1990, 2024, 2025, 2000, {
        enabled: false,
        savingsRateOfIncrease: 0.5,
        salaryIncreases: [],
      })
      expect(adjustment).toBe(0)
    })

    it('should return 0 when income development is undefined', () => {
      const adjustment = calculateIncomeDevelopmentAdjustment(1990, 2024, 2025, 2000, undefined)
      expect(adjustment).toBe(0)
    })

    it('should calculate cumulative adjustments correctly', () => {
      const config = createDefaultDynamicSavingsConfig(2000, 1990)
      config.incomeDevelopment!.enabled = true

      // After 1 year (age 35): 2000 * 0.04 * 0.5 = 40€ increase
      const adj1Year = calculateIncomeDevelopmentAdjustment(1990, 2024, 2025, 2000, config.incomeDevelopment)
      expect(adj1Year).toBeCloseTo(40, 1)

      // After 2 years: cumulative (age 35: 40€, age 36: 25€ = 65€ total)
      // Note: age 36 switches to the 2.5% salary increase rate
      const adj2Years = calculateIncomeDevelopmentAdjustment(1990, 2024, 2026, 2000, config.incomeDevelopment)
      expect(adj2Years).toBeGreaterThan(adj1Year)
      expect(adj2Years).toBeCloseTo(65, 1) // 40 + 25
    })

    it('should use different salary increase rates based on age', () => {
      const birthYear = 1990 // Will be 34 in 2024, 35 in 2025
      const baseSavingsRate = 2000

      const config = createDefaultDynamicSavingsConfig(baseSavingsRate, birthYear)
      config.incomeDevelopment!.enabled = true

      // At age 34 (2024): should use 4% annual increase
      const adjAtAge34 = calculateIncomeDevelopmentAdjustment(
        birthYear,
        2024,
        2025,
        baseSavingsRate,
        config.incomeDevelopment,
      )
      expect(adjAtAge34).toBeCloseTo(40, 1) // 2000 * 0.04 * 0.5

      // At age 40 (after switching to 2.5% at age 35): different rate
      const adjAtAge40 = calculateIncomeDevelopmentAdjustment(
        birthYear,
        2030,
        2031,
        baseSavingsRate,
        config.incomeDevelopment,
      )
      expect(adjAtAge40).toBeCloseTo(25, 1) // 2000 * 0.025 * 0.5
    })
  })

  describe('calculateLifeEventAdjustments', () => {
    it('should return 0 when no life events are defined', () => {
      expect(calculateLifeEventAdjustments(2024, undefined)).toBe(0)
      expect(calculateLifeEventAdjustments(2024, [])).toBe(0)
    })

    it('should sum up all events up to the given year', () => {
      const events: LifeEvent[] = [
        { year: 2022, type: 'geburt', savingsRateChange: -500 },
        { year: 2024, type: 'kreditabbezahlung', savingsRateChange: 300 },
        { year: 2026, type: 'auszug_kinder', savingsRateChange: 400 },
      ]

      expect(calculateLifeEventAdjustments(2021, events)).toBe(0) // Before any events
      expect(calculateLifeEventAdjustments(2022, events)).toBe(-500) // After first event
      expect(calculateLifeEventAdjustments(2024, events)).toBe(-200) // After two events
      expect(calculateLifeEventAdjustments(2026, events)).toBe(200) // After all events
      expect(calculateLifeEventAdjustments(2030, events)).toBe(200) // After all events
    })

    it('should handle multiple events in the same year', () => {
      const events: LifeEvent[] = [
        { year: 2024, type: 'geburt', savingsRateChange: -500 },
        { year: 2024, type: 'kreditabbezahlung', savingsRateChange: 300 },
      ]

      expect(calculateLifeEventAdjustments(2024, events)).toBe(-200)
    })
  })

  describe('calculateDynamicSavingsRate', () => {
    it('should return base rate when disabled', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: false,
        baseSavingsRate: 2000,
        birthYear: 1990,
      }

      expect(calculateDynamicSavingsRate(2024, 2024, config)).toBe(2000)
      expect(calculateDynamicSavingsRate(2025, 2024, config)).toBe(2000)
    })

    it('should apply life phase multiplier only', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: true,
        baseSavingsRate: 2000,
        birthYear: 1990, // Age 34 in 2024
        lifePhases: DEFAULT_LIFE_PHASES,
      }

      // Age 34 -> Karrieremitte -> 1.0 multiplier
      const rate2024 = calculateDynamicSavingsRate(2024, 2024, config)
      expect(rate2024).toBe(2000)

      // Age 55 -> Pre-retirement -> 1.3 multiplier
      const rate2045 = calculateDynamicSavingsRate(2045, 2024, config)
      expect(rate2045).toBe(2600)
    })

    it('should combine life phase and income development', () => {
      const config = createDefaultDynamicSavingsConfig(2000, 1990)
      config.enabled = true
      config.incomeDevelopment!.enabled = true

      // Age 34 in 2024 -> Karrieremitte (1.0) + income development
      const rate2025 = calculateDynamicSavingsRate(2025, 2024, config)
      expect(rate2025).toBeGreaterThan(2000) // Should include income adjustment
      expect(rate2025).toBeCloseTo(2040, 1) // 2000 * 1.0 + 40
    })

    it('should combine all three adjustment types', () => {
      const config = createDefaultDynamicSavingsConfig(2000, 1990)
      config.enabled = true
      config.incomeDevelopment!.enabled = true
      config.lifeEvents = [{ year: 2025, type: 'kreditabbezahlung', savingsRateChange: 500 }]

      // Age 34 in 2024 -> Karrieremitte (1.0) + income development + event adjustment
      const rate2025 = calculateDynamicSavingsRate(2025, 2024, config)
      expect(rate2025).toBeGreaterThan(2500) // Should include all adjustments
      expect(rate2025).toBeCloseTo(2540, 1) // 2000 * 1.0 + 40 + 500
    })

    it('should not allow negative savings rates', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: true,
        baseSavingsRate: 500,
        birthYear: 1990,
        lifeEvents: [{ year: 2024, type: 'geburt', savingsRateChange: -1000 }],
      }

      const rate = calculateDynamicSavingsRate(2024, 2024, config)
      expect(rate).toBe(0) // Should be clamped to 0, not negative
    })
  })

  describe('getSavingsRateBreakdown', () => {
    it('should provide detailed breakdown of calculations', () => {
      const config = createDefaultDynamicSavingsConfig(2000, 1990)
      config.enabled = true
      config.incomeDevelopment!.enabled = true
      config.lifeEvents = [{ year: 2025, type: 'kreditabbezahlung', savingsRateChange: 500 }]

      const breakdown = getSavingsRateBreakdown(2025, 2024, config)

      expect(breakdown.baseRate).toBe(2000)
      expect(breakdown.lifePhaseMultiplier).toBe(1.0) // Age 35 -> Karrieremitte
      expect(breakdown.lifePhaseAmount).toBe(2000)
      expect(breakdown.incomeDevelopmentAdjustment).toBeCloseTo(40, 1)
      expect(breakdown.lifeEventAdjustment).toBe(500)
      expect(breakdown.totalRate).toBeCloseTo(2540, 1)
      expect(breakdown.activePhase?.phase).toBe('karrieremitte')
    })

    it('should show correct breakdown when disabled', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: false,
        baseSavingsRate: 2000,
        birthYear: 1990,
      }

      const breakdown = getSavingsRateBreakdown(2024, 2024, config)

      expect(breakdown.baseRate).toBe(2000)
      expect(breakdown.lifePhaseMultiplier).toBe(1.0)
      expect(breakdown.totalRate).toBe(2000)
    })
  })

  describe('validateDynamicSavingsConfig', () => {
    it('should validate base savings rate', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: true,
        baseSavingsRate: -100,
        birthYear: 1990,
      }

      const errors = validateDynamicSavingsConfig(config)
      expect(errors).toHaveLength(1)
      expect(errors[0].field).toBe('baseSavingsRate')
      expect(errors[0].message).toContain('negativ')
    })

    it('should validate birth year', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: true,
        baseSavingsRate: 2000,
        birthYear: 1800,
      }

      const errors = validateDynamicSavingsConfig(config)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some(e => e.field === 'birthYear')).toBe(true)
    })

    it('should detect overlapping life phases', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: true,
        baseSavingsRate: 2000,
        birthYear: 1990,
        lifePhases: [
          { phase: 'berufsstart', startAge: 25, endAge: 35, savingsRateMultiplier: 0.6 },
          { phase: 'karrieremitte', startAge: 30, endAge: 50, savingsRateMultiplier: 1.0 }, // Overlaps!
        ],
      }

      const errors = validateDynamicSavingsConfig(config)
      expect(errors.some(e => e.field === 'lifePhases' && e.message.includes('überschneidet'))).toBe(true)
    })

    it('should validate life phase age ranges', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: true,
        baseSavingsRate: 2000,
        birthYear: 1990,
        lifePhases: [
          { phase: 'berufsstart', startAge: 35, endAge: 25, savingsRateMultiplier: 0.6 }, // Invalid range
        ],
      }

      const errors = validateDynamicSavingsConfig(config)
      expect(errors.some(e => e.field === 'lifePhases' && e.message.includes('Startalter muss kleiner'))).toBe(true)
    })

    it('should validate negative multipliers', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: true,
        baseSavingsRate: 2000,
        birthYear: 1990,
        lifePhases: [{ phase: 'berufsstart', startAge: 25, endAge: 30, savingsRateMultiplier: -0.5 }],
      }

      const errors = validateDynamicSavingsConfig(config)
      expect(errors.some(e => e.field === 'lifePhases' && e.message.includes('darf nicht negativ sein'))).toBe(true)
    })

    it('should validate income development savings rate', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: true,
        baseSavingsRate: 2000,
        birthYear: 1990,
        incomeDevelopment: {
          enabled: true,
          savingsRateOfIncrease: 1.5, // Invalid: > 100%
          salaryIncreases: [],
        },
      }

      const errors = validateDynamicSavingsConfig(config)
      expect(errors.some(e => e.field === 'incomeDevelopment.savingsRateOfIncrease')).toBe(true)
    })

    it('should validate negative salary increases', () => {
      const config: DynamicSavingsRateConfig = {
        enabled: true,
        baseSavingsRate: 2000,
        birthYear: 1990,
        incomeDevelopment: {
          enabled: true,
          savingsRateOfIncrease: 0.5,
          salaryIncreases: [
            { startAge: 25, endAge: 35, annualIncreasePercent: -2.0 }, // Invalid
          ],
        },
      }

      const errors = validateDynamicSavingsConfig(config)
      expect(errors.some(e => e.field === 'incomeDevelopment.salaryIncreases')).toBe(true)
    })

    it('should return no errors for valid configuration', () => {
      const config = createDefaultDynamicSavingsConfig(2000, 1990)
      const errors = validateDynamicSavingsConfig(config)
      expect(errors).toHaveLength(0)
    })
  })

  describe('createDefaultDynamicSavingsConfig', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultDynamicSavingsConfig(2000, 1990)

      expect(config.enabled).toBe(false)
      expect(config.baseSavingsRate).toBe(2000)
      expect(config.birthYear).toBe(1990)
      expect(config.lifePhases).toEqual(DEFAULT_LIFE_PHASES)
      expect(config.incomeDevelopment).toBeDefined()
      expect(config.incomeDevelopment?.enabled).toBe(false)
      expect(config.lifeEvents).toEqual([])

      // Validate the default config
      const errors = validateDynamicSavingsConfig(config)
      expect(errors).toHaveLength(0)
    })

    it('should use default birth year if not provided', () => {
      const config = createDefaultDynamicSavingsConfig(2000)
      const currentYear = new Date().getFullYear()

      expect(config.birthYear).toBe(currentYear - 30)
    })
  })

  describe('Integration: Real-world scenarios', () => {
    it('should calculate realistic savings progression for career development', () => {
      const config = createDefaultDynamicSavingsConfig(1500, 1990)
      config.enabled = true
      config.incomeDevelopment!.enabled = true

      // Year 2024: Age 34, Karrieremitte phase (1.0 multiplier)
      const rate2024 = calculateDynamicSavingsRate(2024, 2024, config)
      expect(rate2024).toBe(1500) // Just base rate in first year

      // Year 2025: Age 35, with income adjustment
      const rate2025 = calculateDynamicSavingsRate(2025, 2024, config)
      expect(rate2025).toBeCloseTo(1530, 1) // 1500 + 30 (4% salary increase * 50%)

      // Year 2030: Age 40, cumulative income adjustments
      const rate2030 = calculateDynamicSavingsRate(2030, 2024, config)
      expect(rate2030).toBeGreaterThan(1600)

      // Year 2045: Age 55, Pre-retirement phase (1.3 multiplier) + cumulative adjustments
      const rate2045 = calculateDynamicSavingsRate(2045, 2024, config)
      expect(rate2045).toBeGreaterThan(2000) // Should be significantly higher
    })

    it('should handle birth of child reducing savings, then recovery', () => {
      const config = createDefaultDynamicSavingsConfig(2000, 1990)
      config.enabled = true
      config.lifeEvents = [
        { year: 2025, type: 'geburt', savingsRateChange: -800 }, // Birth reduces savings
        { year: 2045, type: 'auszug_kinder', savingsRateChange: 800 }, // Child leaves, increase savings
      ]

      // Before birth (Age 34 -> Karrieremitte phase, 1.0 multiplier)
      const rate2024 = calculateDynamicSavingsRate(2024, 2024, config)
      expect(rate2024).toBe(2000)

      // After birth (Age 36 -> Karrieremitte phase, 1.0 multiplier, -800 event)
      const rate2026 = calculateDynamicSavingsRate(2026, 2024, config)
      expect(rate2026).toBe(1200) // 2000 * 1.0 - 800

      // After child leaves (Age 56 -> Pre-retirement phase, 1.3 multiplier, +0 events)
      const rate2046 = calculateDynamicSavingsRate(2046, 2024, config)
      expect(rate2046).toBe(2600) // 2000 * 1.3 - 800 + 800 = 2600
    })

    it('should handle debt payoff increasing savings', () => {
      const config = createDefaultDynamicSavingsConfig(1000, 1990)
      config.enabled = true
      config.lifeEvents = [
        { year: 2030, type: 'kreditabbezahlung', savingsRateChange: 500 }, // Debt paid off
      ]

      // Before debt payoff
      const rate2029 = calculateDynamicSavingsRate(2029, 2024, config)
      expect(rate2029).toBe(1000)

      // After debt payoff
      const rate2031 = calculateDynamicSavingsRate(2031, 2024, config)
      expect(rate2031).toBe(1500) // Can now save the 500€ that went to debt
    })
  })
})
