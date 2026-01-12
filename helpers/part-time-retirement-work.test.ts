import { describe, it, expect } from 'vitest'
import {
  calculatePartTimeNetIncome,
  simulatePartTimeRetirementWork,
  createDefaultPartTimeRetirementWorkConfig,
  validatePartTimeWorkPhase,
  calculatePortfolioLongevityImpact,
  DEFAULT_SOCIAL_SECURITY_RATES,
  type PartTimeWorkPhase,
  type PartTimeRetirementWorkConfig,
} from './part-time-retirement-work'

describe('part-time-retirement-work', () => {
  describe('calculatePartTimeNetIncome', () => {
    it('should calculate net income correctly for typical part-time income', () => {
      const grossIncome = 12000 // 1000€/month
      const otherIncome = 0
      const basicAllowance = 11604 // 2024 Grundfreibetrag
      const isChildless = false

      const result = calculatePartTimeNetIncome(
        grossIncome,
        otherIncome,
        basicAllowance,
        DEFAULT_SOCIAL_SECURITY_RATES,
        isChildless
      )

      expect(result.netIncome).toBeGreaterThan(0)
      expect(result.netIncome).toBeLessThan(grossIncome)
      expect(result.healthInsurance).toBeGreaterThan(0)
      expect(result.careInsurance).toBeGreaterThan(0)
      expect(result.socialSecurityTotal).toBeGreaterThan(0)
      expect(result.incomeTax).toBeGreaterThanOrEqual(0)
    })

    it('should calculate higher social security for childless persons', () => {
      const grossIncome = 24000 // 2000€/month
      const otherIncome = 0
      const basicAllowance = 11604

      const withChildren = calculatePartTimeNetIncome(
        grossIncome,
        otherIncome,
        basicAllowance,
        DEFAULT_SOCIAL_SECURITY_RATES,
        false
      )

      const childless = calculatePartTimeNetIncome(
        grossIncome,
        otherIncome,
        basicAllowance,
        DEFAULT_SOCIAL_SECURITY_RATES,
        true
      )

      expect(childless.careInsurance).toBeGreaterThan(withChildren.careInsurance)
      expect(childless.socialSecurityTotal).toBeGreaterThan(withChildren.socialSecurityTotal)
    })

    it('should not apply income tax if total income is below basic allowance', () => {
      const grossIncome = 10000
      const otherIncome = 0
      const basicAllowance = 11604

      const result = calculatePartTimeNetIncome(
        grossIncome,
        otherIncome,
        basicAllowance,
        DEFAULT_SOCIAL_SECURITY_RATES,
        false
      )

      expect(result.incomeTax).toBe(0)
    })

    it('should calculate tax on combined income correctly', () => {
      const grossIncome = 20000 // Part-time work
      const otherIncome = 15000 // Pension
      const basicAllowance = 11604

      const result = calculatePartTimeNetIncome(
        grossIncome,
        otherIncome,
        basicAllowance,
        DEFAULT_SOCIAL_SECURITY_RATES,
        false
      )

      // With 35k total income, there should be income tax
      expect(result.incomeTax).toBeGreaterThan(0)
    })

    it('should handle zero gross income', () => {
      const grossIncome = 0
      const otherIncome = 0
      const basicAllowance = 11604

      const result = calculatePartTimeNetIncome(
        grossIncome,
        otherIncome,
        basicAllowance,
        DEFAULT_SOCIAL_SECURITY_RATES,
        false
      )

      expect(result.netIncome).toBe(0)
      expect(result.healthInsurance).toBe(0)
      expect(result.careInsurance).toBe(0)
      expect(result.incomeTax).toBe(0)
    })
  })

  describe('simulatePartTimeRetirementWork', () => {
    it('should simulate a single work phase correctly', () => {
      const workPhase: PartTimeWorkPhase = {
        startYear: 2025,
        endYear: 2027,
        monthlyGrossIncome: 1500,
        weeklyHours: 20,
        description: 'Beratungstätigkeit',
      }

      const config: PartTimeRetirementWorkConfig = {
        workPhases: [workPhase],
        reduceWithdrawals: true,
        withdrawalReductionPercent: 50,
        calculateSocialSecurity: true,
      }

      const plannedWithdrawals = [40000, 40000, 40000, 40000] // 4 years
      const otherAnnualIncome = [20000, 20000, 20000, 20000]
      const basicAllowance = 11604

      const result = simulatePartTimeRetirementWork(
        config,
        2025,
        2028,
        plannedWithdrawals,
        otherAnnualIncome,
        basicAllowance,
        false
      )

      expect(result.yearlyResults).toHaveLength(4)
      expect(result.yearsWorked).toBe(3)
      expect(result.totalGrossIncome).toBeGreaterThan(0)
      expect(result.totalNetIncome).toBeGreaterThan(0)
      expect(result.totalNetIncome).toBeLessThan(result.totalGrossIncome)
      expect(result.totalTaxesPaid).toBeGreaterThan(0)
      expect(result.totalSocialSecurityPaid).toBeGreaterThan(0)
      expect(result.totalPortfolioSavings).toBeGreaterThan(0)

      // Check first year (working)
      expect(result.yearlyResults[0].isWorking).toBe(true)
      expect(result.yearlyResults[0].annualGrossIncome).toBe(18000) // 1500 * 12
      expect(result.yearlyResults[0].portfolioWithdrawal).toBeLessThan(
        result.yearlyResults[0].originalPortfolioWithdrawal
      )

      // Check last year (not working)
      expect(result.yearlyResults[3].isWorking).toBe(false)
      expect(result.yearlyResults[3].annualGrossIncome).toBe(0)
      expect(result.yearlyResults[3].portfolioWithdrawal).toBe(
        result.yearlyResults[3].originalPortfolioWithdrawal
      )
    })

    it('should simulate multiple work phases correctly', () => {
      const workPhase1: PartTimeWorkPhase = {
        startYear: 2025,
        endYear: 2026,
        monthlyGrossIncome: 1000,
        weeklyHours: 15,
        description: 'Aushilfstätigkeit',
      }

      const workPhase2: PartTimeWorkPhase = {
        startYear: 2028,
        endYear: 2029,
        monthlyGrossIncome: 1500,
        weeklyHours: 20,
        description: 'Beratung',
      }

      const config: PartTimeRetirementWorkConfig = {
        workPhases: [workPhase1, workPhase2],
        reduceWithdrawals: true,
        withdrawalReductionPercent: 50,
        calculateSocialSecurity: true,
      }

      const plannedWithdrawals = [40000, 40000, 40000, 40000, 40000]
      const otherAnnualIncome = [20000, 20000, 20000, 20000, 20000]
      const basicAllowance = 11604

      const result = simulatePartTimeRetirementWork(
        config,
        2025,
        2029,
        plannedWithdrawals,
        otherAnnualIncome,
        basicAllowance,
        false
      )

      expect(result.yearsWorked).toBe(4) // 2025, 2026, 2028, 2029
      expect(result.yearlyResults[0].isWorking).toBe(true) // 2025
      expect(result.yearlyResults[1].isWorking).toBe(true) // 2026
      expect(result.yearlyResults[2].isWorking).toBe(false) // 2027
      expect(result.yearlyResults[3].isWorking).toBe(true) // 2028
      expect(result.yearlyResults[4].isWorking).toBe(true) // 2029
    })

    it('should not reduce withdrawals when reduceWithdrawals is false', () => {
      const workPhase: PartTimeWorkPhase = {
        startYear: 2025,
        endYear: 2026,
        monthlyGrossIncome: 2000,
        weeklyHours: 25,
        description: 'Teilzeit',
      }

      const config: PartTimeRetirementWorkConfig = {
        workPhases: [workPhase],
        reduceWithdrawals: false,
        withdrawalReductionPercent: 50,
        calculateSocialSecurity: true,
      }

      const plannedWithdrawals = [40000, 40000]
      const otherAnnualIncome = [20000, 20000]
      const basicAllowance = 11604

      const result = simulatePartTimeRetirementWork(
        config,
        2025,
        2026,
        plannedWithdrawals,
        otherAnnualIncome,
        basicAllowance,
        false
      )

      result.yearlyResults.forEach((year) => {
        expect(year.portfolioWithdrawal).toBe(year.originalPortfolioWithdrawal)
        expect(year.portfolioSavings).toBe(0)
      })
    })

    it('should calculate different reduction percentages correctly', () => {
      const workPhase: PartTimeWorkPhase = {
        startYear: 2025,
        endYear: 2025,
        monthlyGrossIncome: 1500,
        weeklyHours: 20,
        description: 'Beratung',
      }

      const config75: PartTimeRetirementWorkConfig = {
        workPhases: [workPhase],
        reduceWithdrawals: true,
        withdrawalReductionPercent: 75,
        calculateSocialSecurity: true,
      }

      const config25: PartTimeRetirementWorkConfig = {
        workPhases: [workPhase],
        reduceWithdrawals: true,
        withdrawalReductionPercent: 25,
        calculateSocialSecurity: true,
      }

      const plannedWithdrawals = [40000]
      const otherAnnualIncome = [20000]
      const basicAllowance = 11604

      const result75 = simulatePartTimeRetirementWork(
        config75,
        2025,
        2025,
        plannedWithdrawals,
        otherAnnualIncome,
        basicAllowance,
        false
      )

      const result25 = simulatePartTimeRetirementWork(
        config25,
        2025,
        2025,
        plannedWithdrawals,
        otherAnnualIncome,
        basicAllowance,
        false
      )

      expect(result75.totalPortfolioSavings).toBeGreaterThan(result25.totalPortfolioSavings)
    })

    it('should handle empty work phases', () => {
      const config: PartTimeRetirementWorkConfig = {
        workPhases: [],
        reduceWithdrawals: true,
        withdrawalReductionPercent: 50,
        calculateSocialSecurity: true,
      }

      const plannedWithdrawals = [40000, 40000]
      const otherAnnualIncome = [20000, 20000]
      const basicAllowance = 11604

      const result = simulatePartTimeRetirementWork(
        config,
        2025,
        2026,
        plannedWithdrawals,
        otherAnnualIncome,
        basicAllowance,
        false
      )

      expect(result.yearsWorked).toBe(0)
      expect(result.totalGrossIncome).toBe(0)
      expect(result.totalNetIncome).toBe(0)
      expect(result.totalPortfolioSavings).toBe(0)
    })
  })

  describe('createDefaultPartTimeRetirementWorkConfig', () => {
    it('should create a valid default configuration', () => {
      const config = createDefaultPartTimeRetirementWorkConfig()

      expect(config.workPhases).toEqual([])
      expect(config.reduceWithdrawals).toBe(true)
      expect(config.withdrawalReductionPercent).toBeGreaterThan(0)
      expect(config.withdrawalReductionPercent).toBeLessThanOrEqual(100)
      expect(config.calculateSocialSecurity).toBe(true)
    })
  })

  describe('validatePartTimeWorkPhase', () => {
    it('should pass validation for valid phase', () => {
      const phase: PartTimeWorkPhase = {
        startYear: 2025,
        endYear: 2027,
        monthlyGrossIncome: 1500,
        weeklyHours: 20,
        description: 'Beratungstätigkeit',
      }

      const errors = validatePartTimeWorkPhase(phase)
      expect(errors).toHaveLength(0)
    })

    it('should fail validation for invalid start year', () => {
      const phase: PartTimeWorkPhase = {
        startYear: 2019,
        endYear: 2025,
        monthlyGrossIncome: 1500,
        weeklyHours: 20,
        description: 'Beratung',
      }

      const errors = validatePartTimeWorkPhase(phase)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors[0]).toContain('Startjahr')
    })

    it('should fail validation for end year before start year', () => {
      const phase: PartTimeWorkPhase = {
        startYear: 2027,
        endYear: 2025,
        monthlyGrossIncome: 1500,
        weeklyHours: 20,
        description: 'Beratung',
      }

      const errors = validatePartTimeWorkPhase(phase)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Endjahr'))).toBe(true)
    })

    it('should fail validation for negative monthly income', () => {
      const phase: PartTimeWorkPhase = {
        startYear: 2025,
        endYear: 2027,
        monthlyGrossIncome: -1000,
        weeklyHours: 20,
        description: 'Beratung',
      }

      const errors = validatePartTimeWorkPhase(phase)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Bruttoeinkommen'))).toBe(true)
    })

    it('should fail validation for excessive weekly hours', () => {
      const phase: PartTimeWorkPhase = {
        startYear: 2025,
        endYear: 2027,
        monthlyGrossIncome: 1500,
        weeklyHours: 50,
        description: 'Beratung',
      }

      const errors = validatePartTimeWorkPhase(phase)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Wochenstunden'))).toBe(true)
    })

    it('should fail validation for empty description', () => {
      const phase: PartTimeWorkPhase = {
        startYear: 2025,
        endYear: 2027,
        monthlyGrossIncome: 1500,
        weeklyHours: 20,
        description: '',
      }

      const errors = validatePartTimeWorkPhase(phase)
      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((e) => e.includes('Beschreibung'))).toBe(true)
    })
  })

  describe('calculatePortfolioLongevityImpact', () => {
    it('should calculate additional years correctly for simple case', () => {
      const totalPortfolioSavings = 100000
      const averageAnnualWithdrawal = 20000
      const portfolioReturnRate = 0.05

      const additionalYears = calculatePortfolioLongevityImpact(
        totalPortfolioSavings,
        averageAnnualWithdrawal,
        portfolioReturnRate
      )

      expect(additionalYears).toBeGreaterThan(0)
      // Base calculation would be 5 years (100k / 20k)
      // With compound interest effect, should be more
      expect(additionalYears).toBeGreaterThan(5)
    })

    it('should return zero for zero withdrawal', () => {
      const totalPortfolioSavings = 100000
      const averageAnnualWithdrawal = 0
      const portfolioReturnRate = 0.05

      const additionalYears = calculatePortfolioLongevityImpact(
        totalPortfolioSavings,
        averageAnnualWithdrawal,
        portfolioReturnRate
      )

      expect(additionalYears).toBe(0)
    })

    it('should handle zero portfolio savings', () => {
      const totalPortfolioSavings = 0
      const averageAnnualWithdrawal = 20000
      const portfolioReturnRate = 0.05

      const additionalYears = calculatePortfolioLongevityImpact(
        totalPortfolioSavings,
        averageAnnualWithdrawal,
        portfolioReturnRate
      )

      expect(additionalYears).toBe(0)
    })

    it('should calculate higher impact for higher return rates', () => {
      const totalPortfolioSavings = 100000
      const averageAnnualWithdrawal = 20000

      const impact5percent = calculatePortfolioLongevityImpact(totalPortfolioSavings, averageAnnualWithdrawal, 0.05)

      const impact8percent = calculatePortfolioLongevityImpact(totalPortfolioSavings, averageAnnualWithdrawal, 0.08)

      expect(impact8percent).toBeGreaterThan(impact5percent)
    })
  })

  describe('Integration tests', () => {
    it('should calculate realistic scenario: retiree working 3 years part-time', () => {
      const workPhase: PartTimeWorkPhase = {
        startYear: 2025,
        endYear: 2027,
        monthlyGrossIncome: 1800, // ~21.6k annual
        weeklyHours: 20,
        description: 'Beratungstätigkeit im Fachgebiet',
      }

      const config: PartTimeRetirementWorkConfig = {
        workPhases: [workPhase],
        reduceWithdrawals: true,
        withdrawalReductionPercent: 60, // Reduce withdrawals by 60%
        calculateSocialSecurity: true,
      }

      // Retiree plans to withdraw 45k/year, has 18k pension
      const plannedWithdrawals = [45000, 45000, 45000, 45000, 45000]
      const otherAnnualIncome = [18000, 18000, 18000, 18000, 18000] // Pension
      const basicAllowance = 11604

      const result = simulatePartTimeRetirementWork(
        config,
        2025,
        2029,
        plannedWithdrawals,
        otherAnnualIncome,
        basicAllowance,
        false // Has children
      )

      // Verify overall results
      expect(result.yearsWorked).toBe(3)
      expect(result.totalGrossIncome).toBe(64800) // 21.6k * 3 years
      expect(result.totalNetIncome).toBeGreaterThan(40000) // Should be reasonable after taxes
      expect(result.totalNetIncome).toBeLessThan(result.totalGrossIncome)
      expect(result.totalPortfolioSavings).toBeGreaterThan(60000) // 45k * 0.6 * 3 years = 81k

      // Check individual years
      const workingYears = result.yearlyResults.filter((y) => y.isWorking)
      expect(workingYears).toHaveLength(3)

      workingYears.forEach((year) => {
        expect(year.annualGrossIncome).toBe(21600)
        expect(year.annualNetIncome).toBeGreaterThan(0)
        expect(year.portfolioWithdrawal).toBe(18000) // 45k * 0.4 (60% reduction)
        expect(year.portfolioSavings).toBe(27000) // 45k * 0.6
      })

      // Non-working years should have full withdrawals
      const nonWorkingYears = result.yearlyResults.filter((y) => !y.isWorking)
      expect(nonWorkingYears).toHaveLength(2)

      nonWorkingYears.forEach((year) => {
        expect(year.portfolioWithdrawal).toBe(45000)
        expect(year.portfolioSavings).toBe(0)
      })
    })

    it('should calculate scenario with overlapping income sources', () => {
      const workPhase: PartTimeWorkPhase = {
        startYear: 2025,
        endYear: 2026,
        monthlyGrossIncome: 2500, // 30k annual
        weeklyHours: 25,
        description: 'Selbstständige Beratung',
      }

      const config: PartTimeRetirementWorkConfig = {
        workPhases: [workPhase],
        reduceWithdrawals: true,
        withdrawalReductionPercent: 80, // Aggressive reduction
        calculateSocialSecurity: true,
      }

      const plannedWithdrawals = [50000, 50000]
      const otherAnnualIncome = [25000, 25000] // Substantial pension
      const basicAllowance = 11604

      const result = simulatePartTimeRetirementWork(
        config,
        2025,
        2026,
        plannedWithdrawals,
        otherAnnualIncome,
        basicAllowance,
        true // Childless - higher social security
      )

      // With 30k work + 25k pension = 55k total income
      // Should result in meaningful tax payments
      expect(result.totalTaxesPaid).toBeGreaterThan(5000)
      expect(result.totalSocialSecurityPaid).toBeGreaterThan(3000)

      // Portfolio savings should be substantial (50k * 0.8 * 2 years)
      expect(result.totalPortfolioSavings).toBe(80000)
    })
  })
})
