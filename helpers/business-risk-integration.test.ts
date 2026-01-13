import { describe, it, expect } from 'vitest'
import {
  type SeasonalPattern,
  type KrankentagegeldConfig,
  type IncomeFailureScenario,
  createDefaultBusinessRiskConfig,
  calculateMonthlyBusinessIncome,
  calculateYearlyBusinessRisk,
  validateBusinessRiskConfig,
  getVolatilityPercent,
  getRecommendedEmergencyMonths,
  getSeasonalPatternName,
  getEmploymentStatusName,
  getVolatilityLevelName,
  formatBusinessCurrency,
  formatBusinessPercent,
  DEFAULT_VOLATILITY_LEVELS,
  PREDEFINED_SEASONAL_PATTERNS,
  DEFAULT_KRANKENTAGEGELD_CONFIG,
} from './business-risk-integration'

describe('Business Risk Integration', () => {
  describe('createDefaultBusinessRiskConfig', () => {
    it('should create default configuration with correct values', () => {
      const config = createDefaultBusinessRiskConfig()

      expect(config.enabled).toBe(false)
      expect(config.employmentStatus).toBe('selbstständig')
      expect(config.averageMonthlyIncome).toBe(3000)
      expect(config.volatilityLevel).toBe('medium')
      expect(config.krankentagegeld.enabled).toBe(false)
      expect(config.seasonalCycle.pattern).toBe('none')
      expect(config.seasonalCycle.monthlyMultipliers).toHaveLength(12)
      expect(config.emergencyReserve.targetMonths).toBe(15)
      expect(config.failureScenarios).toHaveLength(0)
    })

    it('should create configuration with custom average income', () => {
      const config = createDefaultBusinessRiskConfig(5000)

      expect(config.averageMonthlyIncome).toBe(5000)
    })
  })

  describe('calculateMonthlyBusinessIncome', () => {
    it('should return base income when business risk is disabled', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = false

      const result = calculateMonthlyBusinessIncome(config, 1, 2024)

      expect(result.baseIncome).toBe(3000)
      expect(result.finalIncome).toBe(3000)
      expect(result.seasonalMultiplier).toBe(1.0)
      expect(result.volatilityAdjustment).toBe(0)
      expect(result.incomeFailure).toBe(false)
      expect(result.krankentagegeldBenefit).toBe(0)
    })

    it('should apply seasonal multiplier correctly', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.volatilityLevel = 'low' // Minimize volatility effect
      config.seasonalCycle.pattern = 'spring_summer'
      config.seasonalCycle.monthlyMultipliers = PREDEFINED_SEASONAL_PATTERNS.spring_summer

      // January (winter) - should be lower (0.6x)
      const januaryResult = calculateMonthlyBusinessIncome(config, 1, 2024)
      expect(januaryResult.seasonalMultiplier).toBe(0.6)

      // June (summer) - should be higher (1.5x)
      const juneResult = calculateMonthlyBusinessIncome(config, 6, 2024)
      expect(juneResult.seasonalMultiplier).toBe(1.5)
    })

    it('should apply volatility adjustment based on level', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.volatilityLevel = 'very_high'
      config.seasonalCycle.pattern = 'none'

      const results: number[] = []
      for (let month = 1; month <= 12; month++) {
        const result = calculateMonthlyBusinessIncome(config, month, 2024)
        results.push(result.finalIncome)
      }

      // With very high volatility, income should vary significantly
      const minIncome = Math.min(...results)
      const maxIncome = Math.max(...results)
      const range = maxIncome - minIncome

      // Range should be substantial for very high volatility
      expect(range).toBeGreaterThan(1000)
    })

    it('should handle income failure scenarios', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.volatilityLevel = 'low'

      const failureScenario: IncomeFailureScenario = {
        failureYear: 2024,
        durationMonths: 3,
        incomeLossPercent: 0.5, // 50% loss
        coveredByKrankentagegeld: false,
      }
      config.failureScenarios = [failureScenario]

      // March 2024 should be in failure period
      const marchResult = calculateMonthlyBusinessIncome(config, 3, 2024)
      expect(marchResult.incomeFailure).toBe(true)
      expect(marchResult.finalIncome).toBeLessThan(config.averageMonthlyIncome)

      // June 2024 should be after failure period
      const juneResult = calculateMonthlyBusinessIncome(config, 6, 2024)
      expect(juneResult.incomeFailure).toBe(false)
    })

    it('should apply Krankentagegeld benefits during covered failure', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.volatilityLevel = 'low'

      const krankentagegeld: KrankentagegeldConfig = {
        enabled: true,
        dailyBenefit: 50,
        waitingPeriodDays: 42,
        monthlyPremium: 100,
        maxBenefitDays: 365,
        incomeCoveragePercent: 80,
      }
      config.krankentagegeld = krankentagegeld

      const failureScenario: IncomeFailureScenario = {
        failureYear: 2024,
        durationMonths: 2,
        incomeLossPercent: 1.0, // 100% loss
        coveredByKrankentagegeld: true,
      }
      config.failureScenarios = [failureScenario]

      const februaryResult = calculateMonthlyBusinessIncome(config, 2, 2024)
      expect(februaryResult.incomeFailure).toBe(true)
      expect(februaryResult.krankentagegeldBenefit).toBeGreaterThan(0)
      expect(februaryResult.finalIncome).toBeGreaterThan(0) // Covered by insurance
    })

    it('should respect income coverage percentage limit', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true

      const krankentagegeld: KrankentagegeldConfig = {
        enabled: true,
        dailyBenefit: 200, // Very high benefit
        waitingPeriodDays: 0,
        monthlyPremium: 100,
        maxBenefitDays: 365,
        incomeCoveragePercent: 80, // But only 80% coverage
      }
      config.krankentagegeld = krankentagegeld

      const failureScenario: IncomeFailureScenario = {
        failureYear: 2024,
        durationMonths: 1,
        incomeLossPercent: 1.0,
        coveredByKrankentagegeld: true,
      }
      config.failureScenarios = [failureScenario]

      const januaryResult = calculateMonthlyBusinessIncome(config, 1, 2024)
      const maxAllowedBenefit = (config.averageMonthlyIncome * 80) / 100

      expect(januaryResult.krankentagegeldBenefit).toBeLessThanOrEqual(maxAllowedBenefit)
    })

    it('should ensure non-negative final income', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true

      const failureScenario: IncomeFailureScenario = {
        failureYear: 2024,
        durationMonths: 12,
        incomeLossPercent: 1.5, // More than 100% loss (edge case)
        coveredByKrankentagegeld: false,
      }
      config.failureScenarios = [failureScenario]

      const januaryResult = calculateMonthlyBusinessIncome(config, 1, 2024)
      expect(januaryResult.finalIncome).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateYearlyBusinessRisk', () => {
    it('should calculate correct yearly statistics', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.volatilityLevel = 'medium'

      const analysis = calculateYearlyBusinessRisk(config, 2024, 2500)

      expect(analysis.year).toBe(2024)
      expect(analysis.totalIncome).toBeGreaterThan(0)
      expect(analysis.averageMonthlyIncome).toBeGreaterThan(0)
      expect(analysis.minMonthlyIncome).toBeLessThanOrEqual(analysis.averageMonthlyIncome)
      expect(analysis.maxMonthlyIncome).toBeGreaterThanOrEqual(analysis.averageMonthlyIncome)
      expect(analysis.incomeVolatility).toBeGreaterThan(0)
      expect(analysis.monthsBelowAverage).toBeGreaterThanOrEqual(0)
      expect(analysis.monthsBelowAverage).toBeLessThanOrEqual(12)
    })

    it('should calculate Krankentagegeld premiums correctly', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true

      config.krankentagegeld = {
        enabled: true,
        dailyBenefit: 50,
        waitingPeriodDays: 42,
        monthlyPremium: 150,
        maxBenefitDays: 365,
        incomeCoveragePercent: 80,
      }

      const analysis = calculateYearlyBusinessRisk(config, 2024, 2500)

      expect(analysis.totalKrankentagegeldPremiums).toBe(150 * 12)
    })

    it('should check emergency reserve target correctly', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true

      const monthlyExpenses = 2500
      config.emergencyReserve.targetMonths = 15
      config.emergencyReserve.currentBalance = 40000 // More than 15 * 2500

      const analysis = calculateYearlyBusinessRisk(config, 2024, monthlyExpenses)

      expect(analysis.emergencyReserveTargetMet).toBe(true)
      expect(analysis.emergencyReserveBalance).toBe(40000)
    })

    it('should detect when emergency reserve target is not met', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true

      const monthlyExpenses = 2500
      config.emergencyReserve.targetMonths = 15
      config.emergencyReserve.currentBalance = 10000 // Less than 15 * 2500

      const analysis = calculateYearlyBusinessRisk(config, 2024, monthlyExpenses)

      expect(analysis.emergencyReserveTargetMet).toBe(false)
    })

    it('should handle seasonal income patterns correctly', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.volatilityLevel = 'low' // Minimize volatility
      config.seasonalCycle.pattern = 'spring_summer'
      config.seasonalCycle.monthlyMultipliers = PREDEFINED_SEASONAL_PATTERNS.spring_summer

      const analysis = calculateYearlyBusinessRisk(config, 2024, 2500)

      // Total income should still be around 12 * 3000 despite seasonality
      // (seasonal multipliers average to ~1.0)
      expect(analysis.totalIncome).toBeGreaterThan(30000)
      expect(analysis.totalIncome).toBeLessThan(40000)
    })
  })

  describe('validateBusinessRiskConfig', () => {
    it('should validate valid configuration without errors', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toHaveLength(0)
    })

    it('should detect negative average income', () => {
      const config = createDefaultBusinessRiskConfig(-1000)
      config.enabled = true

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toContain('Durchschnittseinkommen kann nicht negativ sein')
    })

    it('should detect invalid custom volatility percentage', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.customVolatilityPercent = 150 // Over 100%

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toContain('Volatilität muss zwischen 0% und 100% liegen')
    })

    it('should detect invalid seasonal multipliers length', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.seasonalCycle.monthlyMultipliers = [1.0, 1.0] // Only 2 values

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toContain('Saisonale Multiplikatoren müssen genau 12 Werte enthalten (einen pro Monat)')
    })

    it('should detect negative Krankentagegeld daily benefit', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.krankentagegeld.enabled = true
      config.krankentagegeld.dailyBenefit = -50

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toContain('Krankentagegeld-Leistung kann nicht negativ sein')
    })

    it('should detect negative waiting period days', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.krankentagegeld.enabled = true
      config.krankentagegeld.waitingPeriodDays = -10

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toContain('Karenzzeit kann nicht negativ sein')
    })

    it('should detect invalid income coverage percentage', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.krankentagegeld.enabled = true
      config.krankentagegeld.incomeCoveragePercent = 150

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toContain('Einkommensabsicherung muss zwischen 0% und 100% liegen')
    })

    it('should detect negative emergency reserve target months', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true
      config.emergencyReserve.targetMonths = -5

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toContain('Notfallreserve-Ziel kann nicht negativ sein')
    })

    it('should detect invalid failure scenario duration', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true

      const failureScenario: IncomeFailureScenario = {
        failureYear: 2024,
        durationMonths: 0,
        incomeLossPercent: 0.5,
        coveredByKrankentagegeld: false,
      }
      config.failureScenarios = [failureScenario]

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toContain('Ausfalldauer muss mindestens 1 Monat betragen')
    })

    it('should detect invalid income loss percentage', () => {
      const config = createDefaultBusinessRiskConfig(3000)
      config.enabled = true

      const failureScenario: IncomeFailureScenario = {
        failureYear: 2024,
        durationMonths: 3,
        incomeLossPercent: 1.5, // Over 100%
        coveredByKrankentagegeld: false,
      }
      config.failureScenarios = [failureScenario]

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toContain('Einkommensverlust muss zwischen 0% und 100% liegen')
    })

    it('should not validate when business risk is disabled', () => {
      const config = createDefaultBusinessRiskConfig(-1000) // Invalid income
      config.enabled = false

      const errors = validateBusinessRiskConfig(config)

      expect(errors).toHaveLength(0) // No validation when disabled
    })
  })

  describe('getVolatilityPercent', () => {
    it('should return correct percentages for all levels', () => {
      expect(getVolatilityPercent('low')).toBe(0.10)
      expect(getVolatilityPercent('medium')).toBe(0.20)
      expect(getVolatilityPercent('high')).toBe(0.35)
      expect(getVolatilityPercent('very_high')).toBe(0.50)
    })
  })

  describe('getRecommendedEmergencyMonths', () => {
    it('should return correct recommendations by employment status', () => {
      expect(getRecommendedEmergencyMonths('angestellt')).toBe(3)
      expect(getRecommendedEmergencyMonths('freiberufler')).toBe(12)
      expect(getRecommendedEmergencyMonths('selbstständig')).toBe(15)
    })
  })

  describe('getSeasonalPatternName', () => {
    it('should return correct German names for all patterns', () => {
      expect(getSeasonalPatternName('none')).toBe('Keine Saisonalität')
      expect(getSeasonalPatternName('spring_summer')).toBe('Frühjahr/Sommer-Geschäft')
      expect(getSeasonalPatternName('autumn_winter')).toBe('Herbst/Winter-Geschäft')
      expect(getSeasonalPatternName('quarterly')).toBe('Quartalsweise Schwankungen')
      expect(getSeasonalPatternName('custom')).toBe('Benutzerdefiniert')
    })
  })

  describe('getEmploymentStatusName', () => {
    it('should return correct German names for all statuses', () => {
      expect(getEmploymentStatusName('selbstständig')).toBe('Selbstständig')
      expect(getEmploymentStatusName('angestellt')).toBe('Angestellt')
      expect(getEmploymentStatusName('freiberufler')).toBe('Freiberufler')
    })
  })

  describe('getVolatilityLevelName', () => {
    it('should return correct German names with percentages', () => {
      expect(getVolatilityLevelName('low')).toBe('Niedrig (±10%)')
      expect(getVolatilityLevelName('medium')).toBe('Mittel (±20%)')
      expect(getVolatilityLevelName('high')).toBe('Hoch (±35%)')
      expect(getVolatilityLevelName('very_high')).toBe('Sehr hoch (±50%)')
    })
  })

  describe('formatBusinessCurrency', () => {
    it('should format currency in German format', () => {
      // Note: Intl.NumberFormat may use non-breaking space (U+00A0) instead of regular space
      const formatted1 = formatBusinessCurrency(1234.56)
      expect(formatted1).toMatch(/1\.234,56\s€/) // Use regex to accept any space character
      
      const formatted2 = formatBusinessCurrency(1000000)
      expect(formatted2).toMatch(/1\.000\.000,00\s€/)
      
      const formatted3 = formatBusinessCurrency(0)
      expect(formatted3).toMatch(/0,00\s€/)
    })
  })

  describe('formatBusinessPercent', () => {
    it('should format percentages correctly', () => {
      expect(formatBusinessPercent(0.1234)).toBe('12.3%')
      expect(formatBusinessPercent(0.5)).toBe('50.0%')
      expect(formatBusinessPercent(1.0)).toBe('100.0%')
    })
  })

  describe('DEFAULT_VOLATILITY_LEVELS', () => {
    it('should have all volatility levels defined', () => {
      expect(DEFAULT_VOLATILITY_LEVELS).toHaveProperty('low')
      expect(DEFAULT_VOLATILITY_LEVELS).toHaveProperty('medium')
      expect(DEFAULT_VOLATILITY_LEVELS).toHaveProperty('high')
      expect(DEFAULT_VOLATILITY_LEVELS).toHaveProperty('very_high')
    })

    it('should have increasing volatility values', () => {
      expect(DEFAULT_VOLATILITY_LEVELS.low).toBeLessThan(DEFAULT_VOLATILITY_LEVELS.medium)
      expect(DEFAULT_VOLATILITY_LEVELS.medium).toBeLessThan(DEFAULT_VOLATILITY_LEVELS.high)
      expect(DEFAULT_VOLATILITY_LEVELS.high).toBeLessThan(DEFAULT_VOLATILITY_LEVELS.very_high)
    })
  })

  describe('PREDEFINED_SEASONAL_PATTERNS', () => {
    it('should have all seasonal patterns defined', () => {
      expect(PREDEFINED_SEASONAL_PATTERNS).toHaveProperty('none')
      expect(PREDEFINED_SEASONAL_PATTERNS).toHaveProperty('spring_summer')
      expect(PREDEFINED_SEASONAL_PATTERNS).toHaveProperty('autumn_winter')
      expect(PREDEFINED_SEASONAL_PATTERNS).toHaveProperty('quarterly')
      expect(PREDEFINED_SEASONAL_PATTERNS).toHaveProperty('custom')
    })

    it('should have 12 months for each pattern', () => {
      Object.values(PREDEFINED_SEASONAL_PATTERNS).forEach(pattern => {
        expect(pattern).toHaveLength(12)
      })
    })

    it('should have approximately average multiplier of 1.0 for seasonal patterns', () => {
      const patterns: SeasonalPattern[] = ['spring_summer', 'autumn_winter', 'quarterly']

      patterns.forEach(patternName => {
        const pattern = PREDEFINED_SEASONAL_PATTERNS[patternName]
        const average = pattern.reduce((sum, val) => sum + val, 0) / 12
        expect(average).toBeCloseTo(1.0, 0) // Within 0.5
      })
    })

    it('should have all 1.0 multipliers for none pattern', () => {
      const nonePattern = PREDEFINED_SEASONAL_PATTERNS.none
      expect(nonePattern.every(val => val === 1.0)).toBe(true)
    })
  })

  describe('DEFAULT_KRANKENTAGEGELD_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_KRANKENTAGEGELD_CONFIG.enabled).toBe(false)
      expect(DEFAULT_KRANKENTAGEGELD_CONFIG.dailyBenefit).toBe(0)
      expect(DEFAULT_KRANKENTAGEGELD_CONFIG.waitingPeriodDays).toBe(42)
      expect(DEFAULT_KRANKENTAGEGELD_CONFIG.maxBenefitDays).toBe(365)
      expect(DEFAULT_KRANKENTAGEGELD_CONFIG.incomeCoveragePercent).toBe(80)
    })
  })
})
