import { describe, it, expect } from 'vitest'
import {
  calculatePensionPointsForYear,
  getAverageGrossSalary,
  calculatePensionPoints,
  createSalaryHistory,
  estimateFutureAverageSalary,
  createProjectedSalaryHistory,
  AVERAGE_GROSS_SALARY_HISTORY,
  CURRENT_PENSION_VALUE_WEST,
  CURRENT_PENSION_VALUE_EAST,
  type PensionPointsConfig,
} from './pension-points'

describe('pension-points', () => {
  describe('calculatePensionPointsForYear', () => {
    it('should return 1.0 points when salary equals average', () => {
      const points = calculatePensionPointsForYear(45358, 45358)
      expect(points).toBe(1.0)
    })

    it('should return 2.0 points when salary is double the average', () => {
      const points = calculatePensionPointsForYear(90716, 45358)
      expect(points).toBe(2.0)
    })

    it('should return 0.5 points when salary is half the average', () => {
      const points = calculatePensionPointsForYear(22679, 45358)
      expect(points).toBe(0.5)
    })

    it('should return 0 points when average salary is 0', () => {
      const points = calculatePensionPointsForYear(50000, 0)
      expect(points).toBe(0)
    })

    it('should handle fractional pension points correctly', () => {
      const points = calculatePensionPointsForYear(50000, 45358)
      expect(points).toBeCloseTo(1.1023, 4)
    })
  })

  describe('getAverageGrossSalary', () => {
    it('should return exact value for known years', () => {
      expect(getAverageGrossSalary(2020)).toBe(40551)
      expect(getAverageGrossSalary(2021)).toBe(41541)
      expect(getAverageGrossSalary(2022)).toBe(43142)
      expect(getAverageGrossSalary(2023)).toBe(45358)
      expect(getAverageGrossSalary(2024)).toBe(45358)
    })

    it('should use most recent historical value for future years', () => {
      expect(getAverageGrossSalary(2025)).toBe(45358) // Uses 2024 value
      expect(getAverageGrossSalary(2030)).toBe(45358) // Uses 2024 value
    })

    it('should use custom history when provided', () => {
      const customHistory = {
        2025: 47000,
        2026: 48000,
      }

      expect(getAverageGrossSalary(2025, customHistory)).toBe(47000)
      expect(getAverageGrossSalary(2026, customHistory)).toBe(48000)
    })

    it('should handle years before first historical entry', () => {
      const customHistory = {
        2020: 40000,
        2021: 41000,
      }

      // Should use 2020 value for 2019
      expect(getAverageGrossSalary(2019, customHistory)).toBe(40000)
    })
  })

  describe('calculatePensionPoints', () => {
    it('should calculate pension points for simple salary history', () => {
      const config: PensionPointsConfig = {
        salaryHistory: {
          2020: 40551, // 1.0 point
          2021: 41541, // 1.0 point
          2022: 43142, // 1.0 point
        },
        region: 'west',
      }

      const result = calculatePensionPoints(config)

      expect(result.contributionYears).toBe(3)
      expect(result.totalPensionPoints).toBeCloseTo(3.0, 1)
      expect(result.pensionValue).toBe(CURRENT_PENSION_VALUE_WEST)
      expect(result.monthlyPension).toBeCloseTo(3.0 * CURRENT_PENSION_VALUE_WEST, 1)
      expect(result.annualPension).toBeCloseTo(3.0 * CURRENT_PENSION_VALUE_WEST * 12, 1)
    })

    it('should handle varying salaries correctly', () => {
      const config: PensionPointsConfig = {
        salaryHistory: {
          2020: 50000, // ~1.23 points
          2021: 60000, // ~1.44 points
          2022: 70000, // ~1.62 points
        },
        region: 'west',
      }

      const result = calculatePensionPoints(config)

      expect(result.contributionYears).toBe(3)
      expect(result.totalPensionPoints).toBeGreaterThan(3.0)
      expect(result.totalPensionPoints).toBeLessThan(5.0)
    })

    it('should use east region pension value when specified', () => {
      const config: PensionPointsConfig = {
        salaryHistory: {
          2020: 40551,
        },
        region: 'east',
      }

      const result = calculatePensionPoints(config)

      expect(result.pensionValue).toBe(CURRENT_PENSION_VALUE_EAST)
      expect(result.monthlyPension).toBeCloseTo(CURRENT_PENSION_VALUE_EAST, 1)
    })

    it('should use custom pension value when provided', () => {
      const customPensionValue = 40.0

      const config: PensionPointsConfig = {
        salaryHistory: {
          2020: 40551, // 1.0 point
        },
        region: 'west',
        customPensionValue,
      }

      const result = calculatePensionPoints(config)

      expect(result.pensionValue).toBe(customPensionValue)
      expect(result.monthlyPension).toBeCloseTo(customPensionValue, 1)
    })

    it('should provide detailed yearly breakdown', () => {
      const config: PensionPointsConfig = {
        salaryHistory: {
          2020: 40551,
          2021: 50000,
        },
        region: 'west',
      }

      const result = calculatePensionPoints(config)

      expect(result.yearlyResults).toHaveLength(2)

      expect(result.yearlyResults[0].year).toBe(2020)
      expect(result.yearlyResults[0].grossSalary).toBe(40551)
      expect(result.yearlyResults[0].averageGrossSalary).toBe(40551)
      expect(result.yearlyResults[0].pensionPoints).toBeCloseTo(1.0, 1)

      expect(result.yearlyResults[1].year).toBe(2021)
      expect(result.yearlyResults[1].grossSalary).toBe(50000)
      expect(result.yearlyResults[1].averageGrossSalary).toBe(41541)
      expect(result.yearlyResults[1].pensionPoints).toBeGreaterThan(1.0)
    })

    it('should handle empty salary history', () => {
      const config: PensionPointsConfig = {
        salaryHistory: {},
        region: 'west',
      }

      const result = calculatePensionPoints(config)

      expect(result.contributionYears).toBe(0)
      expect(result.totalPensionPoints).toBe(0)
      expect(result.monthlyPension).toBe(0)
      expect(result.annualPension).toBe(0)
    })

    it('should use custom average salary history', () => {
      const config: PensionPointsConfig = {
        salaryHistory: {
          2025: 50000,
        },
        region: 'west',
        customAverageSalaryHistory: {
          2025: 50000, // Exactly average
        },
      }

      const result = calculatePensionPoints(config)

      expect(result.yearlyResults[0].pensionPoints).toBeCloseTo(1.0, 4)
    })
  })

  describe('createSalaryHistory', () => {
    it('should create salary history with no increase', () => {
      const history = createSalaryHistory(2020, 2022, 50000, 0)

      expect(history[2020]).toBe(50000)
      expect(history[2021]).toBe(50000)
      expect(history[2022]).toBe(50000)
    })

    it('should create salary history with annual increase', () => {
      const history = createSalaryHistory(2020, 2022, 50000, 5)

      expect(history[2020]).toBe(50000)
      expect(history[2021]).toBe(52500) // 50000 * 1.05
      expect(history[2022]).toBeCloseTo(55125, 0) // 52500 * 1.05
    })

    it('should handle single year history', () => {
      const history = createSalaryHistory(2020, 2020, 60000, 3)

      expect(Object.keys(history)).toHaveLength(1)
      expect(history[2020]).toBe(60000)
    })

    it('should round salaries to nearest integer', () => {
      const history = createSalaryHistory(2020, 2021, 50000, 2.5)

      expect(history[2021]).toBe(51250) // Should be rounded
    })

    it('should create long career salary history', () => {
      const history = createSalaryHistory(1990, 2024, 30000, 2)

      expect(Object.keys(history)).toHaveLength(35) // 35 years
      expect(history[1990]).toBe(30000)
      expect(history[2024]).toBeGreaterThan(30000) // Should grow over time
    })
  })

  describe('estimateFutureAverageSalary', () => {
    it('should return historical value for past years', () => {
      expect(estimateFutureAverageSalary(2020)).toBe(40551)
      expect(estimateFutureAverageSalary(2023)).toBe(45358)
    })

    it('should return base year value for base year', () => {
      expect(estimateFutureAverageSalary(2024)).toBe(45358)
    })

    it('should estimate future values with default growth', () => {
      const estimated2025 = estimateFutureAverageSalary(2025)
      const estimated2026 = estimateFutureAverageSalary(2026)

      expect(estimated2025).toBeGreaterThan(45358)
      expect(estimated2026).toBeGreaterThan(estimated2025)
    })

    it('should use custom growth rate when provided', () => {
      const estimated5Percent = estimateFutureAverageSalary(2025, 5.0)
      const estimated2Percent = estimateFutureAverageSalary(2025, 2.0)

      expect(estimated5Percent).toBeGreaterThan(estimated2Percent)
    })

    it('should estimate multiple years into future correctly', () => {
      const baseValue = 45358
      const growthRate = 2.5
      const yearsDifference = 10

      const estimated = estimateFutureAverageSalary(2034, growthRate)
      const expected = Math.round(baseValue * Math.pow(1.025, yearsDifference))

      expect(estimated).toBe(expected)
    })
  })

  describe('createProjectedSalaryHistory', () => {
    it('should create salary and average salary histories', () => {
      const result = createProjectedSalaryHistory(2020, 2025, 50000, 3.0)

      expect(result.salaryHistory[2020]).toBe(50000)
      expect(Object.keys(result.salaryHistory)).toHaveLength(6)
      expect(result.averageSalaryHistory).toBeDefined()
    })

    it('should include historical average salaries', () => {
      const result = createProjectedSalaryHistory(2020, 2025, 50000, 3.0)

      expect(result.averageSalaryHistory[2020]).toBe(AVERAGE_GROSS_SALARY_HISTORY[2020])
      expect(result.averageSalaryHistory[2023]).toBe(AVERAGE_GROSS_SALARY_HISTORY[2023])
    })

    it('should project future average salaries', () => {
      const result = createProjectedSalaryHistory(2020, 2030, 50000, 3.0)

      // Future years should have estimated values
      expect(result.averageSalaryHistory[2030]).toBeGreaterThan(45358)
    })

    it('should use custom average salary growth rate', () => {
      const result1 = createProjectedSalaryHistory(2024, 2030, 50000, 3.0, 5.0)
      const result2 = createProjectedSalaryHistory(2024, 2030, 50000, 3.0, 2.0)

      // Higher growth should result in higher future average salaries
      expect(result1.averageSalaryHistory[2030]).toBeGreaterThan(result2.averageSalaryHistory[2030])
    })

    it('should handle projections starting in future', () => {
      const result = createProjectedSalaryHistory(2025, 2030, 60000, 4.0)

      expect(result.salaryHistory[2025]).toBe(60000)
      expect(Object.keys(result.salaryHistory)).toHaveLength(6)
    })
  })

  describe('integration scenarios', () => {
    it('should calculate realistic pension for average earner over 45 years', () => {
      // Someone earning exactly average salary their entire career
      const salaryHistory = createSalaryHistory(1980, 2024, 40000, 2.5)

      // For this test, assume all years had average salary matching the history
      const config: PensionPointsConfig = {
        salaryHistory,
        region: 'west',
        customAverageSalaryHistory: salaryHistory, // Exactly average every year
      }

      const result = calculatePensionPoints(config)

      // Should have exactly 45 pension points (1 per year)
      expect(result.totalPensionPoints).toBeCloseTo(45.0, 0)
      expect(result.contributionYears).toBe(45)

      // Monthly pension should be ~1692 EUR (45 * 37.60)
      expect(result.monthlyPension).toBeCloseTo(45 * CURRENT_PENSION_VALUE_WEST, 1)
    })

    it('should calculate pension for high earner', () => {
      // Someone earning 2x average salary
      const baseHistory = createSalaryHistory(2000, 2024, 50000, 3.0)
      const salaryHistory: { [year: number]: number } = {}

      // Double all salaries
      Object.keys(baseHistory).forEach(year => {
        salaryHistory[Number(year)] = baseHistory[Number(year)] * 2
      })

      const config: PensionPointsConfig = {
        salaryHistory,
        region: 'west',
      }

      const result = calculatePensionPoints(config)

      // Should accumulate more than 25 points (1 year = 1 point minimum)
      // Since they earn 2x average, they should get roughly 2 points per year
      // With 3% annual increase and varying historical averages, expect 70-100 points
      expect(result.totalPensionPoints).toBeGreaterThan(25)
      expect(result.totalPensionPoints).toBeLessThan(100) // But not unrealistically high
    })

    it('should project future pension for someone mid-career', () => {
      const { salaryHistory, averageSalaryHistory } = createProjectedSalaryHistory(2000, 2040, 35000, 3.5, 2.5)

      const config: PensionPointsConfig = {
        salaryHistory,
        region: 'west',
        customAverageSalaryHistory: averageSalaryHistory,
      }

      const result = calculatePensionPoints(config)

      expect(result.contributionYears).toBe(41) // 2000 to 2040
      expect(result.totalPensionPoints).toBeGreaterThan(20) // Reasonable accumulation
      expect(result.monthlyPension).toBeGreaterThan(500) // Reasonable pension
      expect(result.annualPension).toBe(result.monthlyPension * 12)
    })
  })
})
