import { describe, it, expect } from 'vitest'
import {
  getDefaultPhaseConfig,
  getDefaultMedicalCostConfig,
  getDefaultDynamicSpendingConfig,
  getRetirementPhase,
  getPhaseMultiplier,
  calculateMedicalCosts,
  getLargeExpensesForYear,
  calculateDynamicSpendingForYear,
  calculateDynamicSpending,
  calculateDynamicSpendingSummary,
  validateDynamicSpendingConfig,
  getPhaseNameGerman,
  getPhaseDescriptionGerman,
  getExpenseCategoryNameGerman,
  type DynamicSpendingConfig,
  type LargeExpense,
  type RetirementPhaseConfig,
  type MedicalCostConfig,
} from './dynamic-spending'

describe('dynamic-spending', () => {
  describe('getDefaultPhaseConfig', () => {
    it('should return default retirement phase configuration', () => {
      const config = getDefaultPhaseConfig()

      expect(config.goGoStartAge).toBe(67)
      expect(config.slowGoStartAge).toBe(76)
      expect(config.noGoStartAge).toBe(86)
      expect(config.goGoMultiplier).toBe(1.0)
      expect(config.slowGoMultiplier).toBe(0.75)
      expect(config.noGoMultiplier).toBe(0.6)
    })
  })

  describe('getDefaultMedicalCostConfig', () => {
    it('should return default medical cost configuration', () => {
      const config = getDefaultMedicalCostConfig()

      expect(config.enabled).toBe(true)
      expect(config.baseMedicalCosts).toBe(2000)
      expect(config.medicalInflationRate).toBe(0.04)
      expect(config.accelerationAge).toBe(75)
      expect(config.acceleratedRate).toBe(0.06)
    })
  })

  describe('getDefaultDynamicSpendingConfig', () => {
    it('should return complete default configuration', () => {
      const config = getDefaultDynamicSpendingConfig(1955, 40000)

      expect(config.enabled).toBe(true)
      expect(config.baseAnnualSpending).toBe(40000)
      expect(config.birthYear).toBe(1955)
      expect(config.phaseConfig).toBeDefined()
      expect(config.medicalCostConfig).toBeDefined()
      expect(config.largeExpenses).toEqual([])
      expect(config.annualGifts).toBe(0)
    })
  })

  describe('getRetirementPhase', () => {
    const phaseConfig = getDefaultPhaseConfig()

    it('should return go-go phase for ages 67-75', () => {
      expect(getRetirementPhase(67, phaseConfig)).toBe('go-go')
      expect(getRetirementPhase(70, phaseConfig)).toBe('go-go')
      expect(getRetirementPhase(75, phaseConfig)).toBe('go-go')
    })

    it('should return slow-go phase for ages 76-85', () => {
      expect(getRetirementPhase(76, phaseConfig)).toBe('slow-go')
      expect(getRetirementPhase(80, phaseConfig)).toBe('slow-go')
      expect(getRetirementPhase(85, phaseConfig)).toBe('slow-go')
    })

    it('should return no-go phase for ages 86+', () => {
      expect(getRetirementPhase(86, phaseConfig)).toBe('no-go')
      expect(getRetirementPhase(90, phaseConfig)).toBe('no-go')
      expect(getRetirementPhase(95, phaseConfig)).toBe('no-go')
    })

    it('should handle custom phase boundaries', () => {
      const customConfig: RetirementPhaseConfig = {
        goGoStartAge: 65,
        slowGoStartAge: 75,
        noGoStartAge: 85,
        goGoMultiplier: 1.0,
        slowGoMultiplier: 0.8,
        noGoMultiplier: 0.7,
      }

      expect(getRetirementPhase(70, customConfig)).toBe('go-go')
      expect(getRetirementPhase(77, customConfig)).toBe('slow-go')
      expect(getRetirementPhase(87, customConfig)).toBe('no-go')
    })
  })

  describe('getPhaseMultiplier', () => {
    const phaseConfig = getDefaultPhaseConfig()

    it('should return correct multiplier for go-go phase', () => {
      expect(getPhaseMultiplier('go-go', phaseConfig)).toBe(1.0)
    })

    it('should return correct multiplier for slow-go phase', () => {
      expect(getPhaseMultiplier('slow-go', phaseConfig)).toBe(0.75)
    })

    it('should return correct multiplier for no-go phase', () => {
      expect(getPhaseMultiplier('no-go', phaseConfig)).toBe(0.6)
    })

    it('should handle custom multipliers', () => {
      const customConfig: RetirementPhaseConfig = {
        goGoStartAge: 67,
        slowGoStartAge: 76,
        noGoStartAge: 86,
        goGoMultiplier: 1.2,
        slowGoMultiplier: 0.9,
        noGoMultiplier: 0.5,
      }

      expect(getPhaseMultiplier('go-go', customConfig)).toBe(1.2)
      expect(getPhaseMultiplier('slow-go', customConfig)).toBe(0.9)
      expect(getPhaseMultiplier('no-go', customConfig)).toBe(0.5)
    })
  })

  describe('calculateMedicalCosts', () => {
    it('should return 0 when medical costs are disabled', () => {
      const config: MedicalCostConfig = {
        enabled: false,
        baseMedicalCosts: 2000,
        medicalInflationRate: 0.04,
        accelerationAge: 75,
        acceleratedRate: 0.06,
      }

      expect(calculateMedicalCosts(70, 3, config)).toBe(0)
    })

    it('should calculate costs with normal inflation before acceleration age', () => {
      const config = getDefaultMedicalCostConfig()
      const costs = calculateMedicalCosts(70, 3, config)

      // 2000 * (1.04)^3 = 2249.73
      expect(costs).toBeCloseTo(2249.73, 1)
    })

    it('should calculate costs with accelerated rate after acceleration age', () => {
      const config = getDefaultMedicalCostConfig() // acceleration age 75
      const costs = calculateMedicalCosts(78, 11, config)

      // Years at normal rate: 8 (from 67 to 75)
      // Years at accelerated rate: 3 (from 75 to 78)
      // 2000 * (1.04)^8 * (1.06)^3 = 2000 * 1.3686 * 1.1910 = 3259.62
      expect(costs).toBeCloseTo(3259.62, 0)
    })

    it('should handle year 0 (retirement start)', () => {
      const config = getDefaultMedicalCostConfig()
      const costs = calculateMedicalCosts(67, 0, config)

      expect(costs).toBe(2000) // Base cost, no inflation yet
    })

    it('should handle high age with many years of acceleration', () => {
      const config = getDefaultMedicalCostConfig()
      const costs = calculateMedicalCosts(90, 23, config)

      // Years at normal rate: 8 (from 67 to 75)
      // Years at accelerated rate: 15 (from 75 to 90)
      // 2000 * (1.04)^8 * (1.06)^15
      expect(costs).toBeGreaterThan(6000)
      expect(costs).toBeLessThan(8000)
    })
  })

  describe('getLargeExpensesForYear', () => {
    const expenses: LargeExpense[] = [
      { year: 2025, amount: 10000, description: 'Weltreise', category: 'reise' },
      { year: 2027, amount: 5000, description: 'Neues Auto', category: 'auto' },
      { year: 2027, amount: 8000, description: 'Wohnungsrenovierung', category: 'renovierung' },
      { year: 2030, amount: 3000, description: 'Geburtstagsfeier', category: 'familie' },
    ]

    it('should return 0 for year with no expenses', () => {
      expect(getLargeExpensesForYear(2024, expenses)).toBe(0)
      expect(getLargeExpensesForYear(2026, expenses)).toBe(0)
    })

    it('should return single expense amount', () => {
      expect(getLargeExpensesForYear(2025, expenses)).toBe(10000)
      expect(getLargeExpensesForYear(2030, expenses)).toBe(3000)
    })

    it('should sum multiple expenses in same year', () => {
      expect(getLargeExpensesForYear(2027, expenses)).toBe(13000) // 5000 + 8000
    })

    it('should return 0 for empty expenses array', () => {
      expect(getLargeExpensesForYear(2025, [])).toBe(0)
    })
  })

  describe('calculateDynamicSpendingForYear', () => {
    const baseConfig = getDefaultDynamicSpendingConfig(1955, 40000)
    const retirementStartYear = 2022 // Age 67

    it('should calculate spending for go-go phase', () => {
      const result = calculateDynamicSpendingForYear(2024, baseConfig, retirementStartYear)

      expect(result.year).toBe(2024)
      expect(result.age).toBe(69)
      expect(result.phase).toBe('go-go')
      expect(result.baseSpending).toBe(40000)
      expect(result.phaseMultiplier).toBe(1.0)
      expect(result.phaseAdjustedSpending).toBe(40000)
      expect(result.medicalCosts).toBeGreaterThan(0)
      expect(result.largeExpenses).toBe(0)
      expect(result.gifts).toBe(0)
      expect(result.totalSpending).toBeGreaterThan(40000)
      expect(result.explanation).toContain('Go-Go-Phase')
    })

    it('should calculate spending for slow-go phase', () => {
      const result = calculateDynamicSpendingForYear(2033, baseConfig, retirementStartYear)

      expect(result.year).toBe(2033)
      expect(result.age).toBe(78)
      expect(result.phase).toBe('slow-go')
      expect(result.baseSpending).toBe(40000)
      expect(result.phaseMultiplier).toBe(0.75)
      expect(result.phaseAdjustedSpending).toBe(30000) // 40000 * 0.75
      expect(result.explanation).toContain('Slow-Go-Phase')
    })

    it('should calculate spending for no-go phase', () => {
      const result = calculateDynamicSpendingForYear(2043, baseConfig, retirementStartYear)

      expect(result.year).toBe(2043)
      expect(result.age).toBe(88)
      expect(result.phase).toBe('no-go')
      expect(result.baseSpending).toBe(40000)
      expect(result.phaseMultiplier).toBe(0.6)
      expect(result.phaseAdjustedSpending).toBe(24000) // 40000 * 0.6
      expect(result.explanation).toContain('No-Go-Phase')
    })

    it('should include large expenses in calculation', () => {
      const configWithExpenses: DynamicSpendingConfig = {
        ...baseConfig,
        largeExpenses: [{ year: 2025, amount: 15000, description: 'Weltreise', category: 'reise' }],
      }

      const result = calculateDynamicSpendingForYear(2025, configWithExpenses, retirementStartYear)

      expect(result.largeExpenses).toBe(15000)
      expect(result.totalSpending).toBeGreaterThan(55000) // 40000 + medical + 15000
      expect(result.explanation).toContain('Weltreise')
      expect(result.explanation).toContain('15000€')
    })

    it('should include annual gifts in calculation', () => {
      const configWithGifts: DynamicSpendingConfig = {
        ...baseConfig,
        annualGifts: 5000,
      }

      const result = calculateDynamicSpendingForYear(2024, configWithGifts, retirementStartYear)

      expect(result.gifts).toBe(5000)
      expect(result.totalSpending).toBeGreaterThan(45000)
      expect(result.explanation).toContain('Geschenke/Spenden')
      expect(result.explanation).toContain('5000€')
    })

    it('should include all expense types', () => {
      const fullConfig: DynamicSpendingConfig = {
        ...baseConfig,
        annualGifts: 3000,
        largeExpenses: [
          { year: 2025, amount: 10000, description: 'Weltreise', category: 'reise' },
          { year: 2025, amount: 5000, description: 'Neues Auto', category: 'auto' },
        ],
      }

      const result = calculateDynamicSpendingForYear(2025, fullConfig, retirementStartYear)

      expect(result.phaseAdjustedSpending).toBe(40000)
      expect(result.largeExpenses).toBe(15000)
      expect(result.gifts).toBe(3000)
      expect(result.medicalCosts).toBeGreaterThan(0)
      expect(result.totalSpending).toBeGreaterThan(58000)
    })
  })

  describe('calculateDynamicSpending', () => {
    const config = getDefaultDynamicSpendingConfig(1955, 40000)
    const startYear = 2022
    const endYear = 2031 // 10 years

    it('should calculate spending for all years', () => {
      const results = calculateDynamicSpending(startYear, endYear, config)

      expect(results).toHaveLength(10)
      expect(results[0].year).toBe(2022)
      expect(results[9].year).toBe(2031)
    })

    it('should show progression through retirement phases', () => {
      const results = calculateDynamicSpending(2022, 2045, config) // 24 years, through all phases

      const goGoYears = results.filter((r) => r.phase === 'go-go')
      const slowGoYears = results.filter((r) => r.phase === 'slow-go')
      const noGoYears = results.filter((r) => r.phase === 'no-go')

      expect(goGoYears.length).toBeGreaterThan(0)
      expect(slowGoYears.length).toBeGreaterThan(0)
      expect(noGoYears.length).toBeGreaterThan(0)
    })

    it('should show increasing medical costs over time', () => {
      const results = calculateDynamicSpending(startYear, endYear, config)

      const firstYearMedical = results[0].medicalCosts
      const lastYearMedical = results[results.length - 1].medicalCosts

      expect(lastYearMedical).toBeGreaterThan(firstYearMedical)
    })

    it('should handle single year correctly', () => {
      const results = calculateDynamicSpending(2025, 2025, config)

      expect(results).toHaveLength(1)
      expect(results[0].year).toBe(2025)
    })
  })

  describe('calculateDynamicSpendingSummary', () => {
    const config = getDefaultDynamicSpendingConfig(1955, 40000)
    const results = calculateDynamicSpending(2022, 2045, config) // 24 years

    it('should calculate basic summary statistics', () => {
      const summary = calculateDynamicSpendingSummary(results)

      expect(summary.totalYears).toBe(24)
      expect(summary.averageAnnualSpending).toBeGreaterThan(0)
      expect(summary.totalSpending).toBeGreaterThan(0)
    })

    it('should identify peak and lowest spending years', () => {
      const summary = calculateDynamicSpendingSummary(results)

      expect(summary.peakSpendingYear).toBeGreaterThanOrEqual(2022)
      expect(summary.peakSpendingYear).toBeLessThanOrEqual(2045)
      expect(summary.peakSpendingAmount).toBeGreaterThan(0)

      expect(summary.lowestSpendingYear).toBeGreaterThanOrEqual(2022)
      expect(summary.lowestSpendingYear).toBeLessThanOrEqual(2045)
      expect(summary.lowestSpendingAmount).toBeGreaterThan(0)
    })

    it('should count years in each phase', () => {
      const summary = calculateDynamicSpendingSummary(results)

      expect(summary.goGoYears).toBeGreaterThan(0)
      expect(summary.slowGoYears).toBeGreaterThan(0)
      expect(summary.noGoYears).toBeGreaterThan(0)
      expect(summary.goGoYears + summary.slowGoYears + summary.noGoYears).toBe(24)
    })

    it('should sum medical and large expenses correctly', () => {
      const configWithExpenses: DynamicSpendingConfig = {
        ...config,
        largeExpenses: [
          { year: 2025, amount: 10000, description: 'Reise', category: 'reise' },
          { year: 2030, amount: 8000, description: 'Auto', category: 'auto' },
        ],
      }

      const resultsWithExpenses = calculateDynamicSpending(2022, 2045, configWithExpenses)
      const summary = calculateDynamicSpendingSummary(resultsWithExpenses)

      expect(summary.totalLargeExpenses).toBe(18000)
      expect(summary.totalMedicalCosts).toBeGreaterThan(0)
    })

    it('should throw error for empty results', () => {
      expect(() => calculateDynamicSpendingSummary([])).toThrow('Cannot calculate summary for empty results')
    })

    it('should show realistic spending decline', () => {
      const summary = calculateDynamicSpendingSummary(results)

      // Peak should typically be in early retirement (Go-Go phase)
      // Lowest should typically be in late retirement (No-Go phase) when excluding large expenses
      expect(summary.peakSpendingAmount).toBeGreaterThan(summary.lowestSpendingAmount)
    })
  })

  describe('validateDynamicSpendingConfig', () => {
    const validConfig = getDefaultDynamicSpendingConfig(1955, 40000)

    it('should return no errors for valid configuration', () => {
      const errors = validateDynamicSpendingConfig(validConfig)
      expect(errors).toEqual([])
    })

    it('should validate base annual spending', () => {
      const invalidConfig = { ...validConfig, baseAnnualSpending: 0 }
      const errors = validateDynamicSpendingConfig(invalidConfig)

      expect(errors).toContain('Basis-Jahresausgaben müssen größer als 0 sein')
    })

    it('should validate birth year', () => {
      const invalidConfig1 = { ...validConfig, birthYear: 1800 }
      const errors1 = validateDynamicSpendingConfig(invalidConfig1)
      expect(errors1).toContain('Geburtsjahr muss zwischen 1900 und 2100 liegen')

      const invalidConfig2 = { ...validConfig, birthYear: 2200 }
      const errors2 = validateDynamicSpendingConfig(invalidConfig2)
      expect(errors2).toContain('Geburtsjahr muss zwischen 1900 und 2100 liegen')
    })

    it('should validate phase age boundaries', () => {
      const invalidConfig1: DynamicSpendingConfig = {
        ...validConfig,
        phaseConfig: {
          goGoStartAge: 70,
          slowGoStartAge: 65, // Invalid: before go-go
          noGoStartAge: 80,
          goGoMultiplier: 1.0,
          slowGoMultiplier: 0.75,
          noGoMultiplier: 0.6,
        },
      }

      const errors1 = validateDynamicSpendingConfig(invalidConfig1)
      expect(errors1).toContain('Slow-Go-Phase muss nach Go-Go-Phase beginnen')

      const invalidConfig2: DynamicSpendingConfig = {
        ...validConfig,
        phaseConfig: {
          goGoStartAge: 67,
          slowGoStartAge: 76,
          noGoStartAge: 70, // Invalid: before slow-go
          goGoMultiplier: 1.0,
          slowGoMultiplier: 0.75,
          noGoMultiplier: 0.6,
        },
      }

      const errors2 = validateDynamicSpendingConfig(invalidConfig2)
      expect(errors2).toContain('No-Go-Phase muss nach Slow-Go-Phase beginnen')
    })

    it('should validate phase multipliers', () => {
      const invalidConfig: DynamicSpendingConfig = {
        ...validConfig,
        phaseConfig: {
          goGoStartAge: 67,
          slowGoStartAge: 76,
          noGoStartAge: 86,
          goGoMultiplier: 2.5, // Invalid: > 2
          slowGoMultiplier: -0.1, // Invalid: < 0
          noGoMultiplier: 0.6,
        },
      }

      const errors = validateDynamicSpendingConfig(invalidConfig)
      expect(errors).toContain('Phasen-Multiplikatoren müssen zwischen 0 und 2 liegen')
    })

    it('should validate medical cost configuration', () => {
      const invalidConfig: DynamicSpendingConfig = {
        ...validConfig,
        medicalCostConfig: {
          enabled: true,
          baseMedicalCosts: -100, // Invalid: negative
          medicalInflationRate: 0.04,
          accelerationAge: 75,
          acceleratedRate: 0.06,
        },
      }

      const errors = validateDynamicSpendingConfig(invalidConfig)
      expect(errors).toContain('Basis-Gesundheitskosten können nicht negativ sein')
    })

    it('should validate medical inflation rates', () => {
      const invalidConfig: DynamicSpendingConfig = {
        ...validConfig,
        medicalCostConfig: {
          enabled: true,
          baseMedicalCosts: 2000,
          medicalInflationRate: 0.6, // Invalid: > 50%
          accelerationAge: 75,
          acceleratedRate: -0.2, // Invalid: < -10%
        },
      }

      const errors = validateDynamicSpendingConfig(invalidConfig)
      expect(errors).toContain('Medizinische Inflationsrate muss zwischen -10% und 50% liegen')
      expect(errors).toContain('Beschleunigte Inflationsrate muss zwischen -10% und 50% liegen')
    })

    it('should validate acceleration age', () => {
      const invalidConfig: DynamicSpendingConfig = {
        ...validConfig,
        medicalCostConfig: {
          enabled: true,
          baseMedicalCosts: 2000,
          medicalInflationRate: 0.04,
          accelerationAge: 110, // Invalid: > 100
          acceleratedRate: 0.06,
        },
      }

      const errors = validateDynamicSpendingConfig(invalidConfig)
      expect(errors).toContain('Beschleunigungsalter muss zwischen 60 und 100 liegen')
    })

    it('should validate large expenses', () => {
      const invalidConfig: DynamicSpendingConfig = {
        ...validConfig,
        largeExpenses: [
          { year: 2025, amount: 0, description: 'Invalid', category: 'reise' }, // Invalid amount
          { year: 1990, amount: 5000, description: 'Old', category: 'auto' }, // Invalid year
          { year: 2030, amount: 3000, description: '', category: 'renovierung' }, // Empty description
        ],
      }

      const errors = validateDynamicSpendingConfig(invalidConfig)
      expect(errors).toContain('Großausgabe 1: Betrag muss größer als 0 sein')
      expect(errors).toContain('Großausgabe 2: Jahr muss zwischen 2000 und 2150 liegen')
      expect(errors).toContain('Großausgabe 3: Beschreibung erforderlich')
    })

    it('should validate annual gifts', () => {
      const invalidConfig: DynamicSpendingConfig = {
        ...validConfig,
        annualGifts: -1000, // Invalid: negative
      }

      const errors = validateDynamicSpendingConfig(invalidConfig)
      expect(errors).toContain('Jährliche Geschenke/Spenden können nicht negativ sein')
    })

    it('should accumulate multiple errors', () => {
      const invalidConfig: DynamicSpendingConfig = {
        ...validConfig,
        baseAnnualSpending: 0,
        birthYear: 1800,
        annualGifts: -500,
      }

      const errors = validateDynamicSpendingConfig(invalidConfig)
      expect(errors.length).toBeGreaterThanOrEqual(3)
    })
  })

  describe('helper functions', () => {
    describe('getPhaseNameGerman', () => {
      it('should return German phase names', () => {
        expect(getPhaseNameGerman('go-go')).toBe('Go-Go-Phase')
        expect(getPhaseNameGerman('slow-go')).toBe('Slow-Go-Phase')
        expect(getPhaseNameGerman('no-go')).toBe('No-Go-Phase')
      })
    })

    describe('getPhaseDescriptionGerman', () => {
      it('should return German phase descriptions', () => {
        expect(getPhaseDescriptionGerman('go-go')).toContain('Aktiver Ruhestand')
        expect(getPhaseDescriptionGerman('slow-go')).toContain('Reduzierte Aktivitäten')
        expect(getPhaseDescriptionGerman('no-go')).toContain('häuslicher Lebensstil')
      })
    })

    describe('getExpenseCategoryNameGerman', () => {
      it('should return German category names', () => {
        expect(getExpenseCategoryNameGerman('reise')).toBe('Reise')
        expect(getExpenseCategoryNameGerman('renovierung')).toBe('Renovierung')
        expect(getExpenseCategoryNameGerman('auto')).toBe('Auto')
        expect(getExpenseCategoryNameGerman('gesundheit')).toBe('Gesundheit')
        expect(getExpenseCategoryNameGerman('familie')).toBe('Familie')
        expect(getExpenseCategoryNameGerman('sonstiges')).toBe('Sonstiges')
      })
    })
  })

  describe('realistic scenarios', () => {
    it('should model typical retirement spending pattern', () => {
      const config = getDefaultDynamicSpendingConfig(1955, 48000)
      const results = calculateDynamicSpending(2022, 2045, config)
      const summary = calculateDynamicSpendingSummary(results)

      // Early years should have higher spending (Go-Go phase)
      const earlyYears = results.filter((r) => r.year <= 2030)
      const lateYears = results.filter((r) => r.year > 2038)

      const avgEarlySpending = earlyYears.reduce((s, r) => s + r.phaseAdjustedSpending, 0) / earlyYears.length
      const avgLateSpending = lateYears.reduce((s, r) => s + r.phaseAdjustedSpending, 0) / lateYears.length

      // Late retirement spending should be lower than early
      expect(avgLateSpending).toBeLessThan(avgEarlySpending)

      // Summary should show reasonable distribution
      expect(summary.goGoYears).toBeGreaterThanOrEqual(9) // 2022-2030
      expect(summary.slowGoYears).toBeGreaterThanOrEqual(10) // 2031-2040
      expect(summary.noGoYears).toBeGreaterThanOrEqual(5) // 2041-2045
    })

    it('should model retirement with major expenses', () => {
      const config: DynamicSpendingConfig = {
        ...getDefaultDynamicSpendingConfig(1955, 40000),
        largeExpenses: [
          { year: 2023, amount: 25000, description: 'Weltreise Südamerika', category: 'reise' },
          { year: 2025, amount: 15000, description: 'Neues Auto', category: 'auto' },
          { year: 2028, amount: 20000, description: 'Badezimmerrenovierung', category: 'renovierung' },
        ],
        annualGifts: 5000, // Regular gifts to children/grandchildren
      }

      const results = calculateDynamicSpending(2022, 2035, config)
      const summary = calculateDynamicSpendingSummary(results)

      // Peak spending should be in year with large expense
      expect([2023, 2025, 2028]).toContain(summary.peakSpendingYear)

      // Total large expenses should match
      expect(summary.totalLargeExpenses).toBe(60000)

      // All years should include gifts
      results.forEach((r) => {
        expect(r.gifts).toBe(5000)
      })
    })

    it('should model high medical costs in late retirement', () => {
      const config = getDefaultDynamicSpendingConfig(1955, 35000)
      const results = calculateDynamicSpending(2022, 2050, config) // To age 95

      // Medical costs should increase significantly after age 75
      const beforeAcceleration = results.filter((r) => r.age < 75)
      const afterAcceleration = results.filter((r) => r.age >= 75)

      const avgMedicalBefore =
        beforeAcceleration.reduce((s, r) => s + r.medicalCosts, 0) / Math.max(1, beforeAcceleration.length)
      const avgMedicalAfter =
        afterAcceleration.reduce((s, r) => s + r.medicalCosts, 0) / Math.max(1, afterAcceleration.length)

      expect(avgMedicalAfter).toBeGreaterThan(avgMedicalBefore * 1.3) // At least 30% higher
    })

    it('should handle early retirement (age 60)', () => {
      const config = getDefaultDynamicSpendingConfig(1960, 45000)
      const results = calculateDynamicSpending(2020, 2040, config) // Retirement at 60

      // All years should be in go-go phase until age 76
      const goGoYears = results.filter((r) => r.phase === 'go-go')
      expect(goGoYears.length).toBeGreaterThan(10)

      // Should have high spending in early years
      const firstYear = results[0]
      expect(firstYear.age).toBe(60)
      expect(firstYear.phaseAdjustedSpending).toBe(45000)
    })
  })

  describe('edge cases', () => {
    it('should handle very long retirement (to age 100)', () => {
      const config = getDefaultDynamicSpendingConfig(1950, 40000)
      const results = calculateDynamicSpending(2017, 2050, config) // Age 67 to 100

      expect(results).toHaveLength(34)
      expect(results[results.length - 1].age).toBe(100)

      const summary = calculateDynamicSpendingSummary(results)
      expect(summary.noGoYears).toBeGreaterThan(10) // Many years in no-go phase
    })

    it('should handle minimal configuration (no optional features)', () => {
      const config: DynamicSpendingConfig = {
        enabled: true,
        baseAnnualSpending: 30000,
        birthYear: 1955,
        phaseConfig: getDefaultPhaseConfig(),
        medicalCostConfig: {
          enabled: false,
          baseMedicalCosts: 0,
          medicalInflationRate: 0,
          accelerationAge: 75,
          acceleratedRate: 0,
        },
        largeExpenses: [],
        annualGifts: 0,
      }

      const results = calculateDynamicSpending(2022, 2030, config)

      results.forEach((r) => {
        expect(r.medicalCosts).toBe(0)
        expect(r.largeExpenses).toBe(0)
        expect(r.gifts).toBe(0)
        expect(r.totalSpending).toBe(r.phaseAdjustedSpending)
      })
    })

    it('should handle custom phase boundaries at extremes', () => {
      const config: DynamicSpendingConfig = {
        ...getDefaultDynamicSpendingConfig(1955, 40000),
        phaseConfig: {
          goGoStartAge: 65,
          slowGoStartAge: 70,
          noGoStartAge: 75,
          goGoMultiplier: 1.0,
          slowGoMultiplier: 0.8,
          noGoMultiplier: 0.5,
        },
      }

      const results = calculateDynamicSpending(2020, 2035, config) // Age 65-80

      const phaseTransitions = results.filter((r, i) => i > 0 && r.phase !== results[i - 1].phase)
      expect(phaseTransitions.length).toBe(2) // Two phase transitions
    })

    it('should handle very high spending levels', () => {
      const config = getDefaultDynamicSpendingConfig(1955, 100000)
      const results = calculateDynamicSpending(2022, 2030, config)

      results.forEach((r) => {
        expect(r.baseSpending).toBe(100000)
        expect(r.phaseAdjustedSpending).toBeGreaterThanOrEqual(60000) // Minimum 60% in no-go
        expect(r.phaseAdjustedSpending).toBeLessThanOrEqual(100000)
      })
    })
  })
})
