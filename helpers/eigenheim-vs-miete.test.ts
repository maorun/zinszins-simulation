import { describe, it, expect } from 'vitest'
import {
  calculateMonthlyMortgagePayment,
  calculateRemainingMortgage,
  createDefaultHomeOwnershipConfig,
  createDefaultRentalConfig,
  createDefaultComparisonConfig,
  createDefaultEigenheimVsMieteConfig,
  calculateOwnershipCosts,
  calculateRentalCosts,
  compareEigenheimVsMiete,
  type HomeOwnershipConfig,
  type RentalConfig,
} from './eigenheim-vs-miete'

describe('eigenheim-vs-miete', () => {
  describe('calculateMonthlyMortgagePayment', () => {
    it('should calculate correct monthly payment for typical mortgage', () => {
      const payment = calculateMonthlyMortgagePayment(320000, 3.5, 30)
      expect(payment).toBeCloseTo(1436.94, 1)
    })

    it('should handle zero interest rate', () => {
      const payment = calculateMonthlyMortgagePayment(300000, 0, 30)
      expect(payment).toBeCloseTo(833.33, 2)
    })

    it('should return 0 for zero principal', () => {
      const payment = calculateMonthlyMortgagePayment(0, 3.5, 30)
      expect(payment).toBe(0)
    })

    it('should return 0 for zero term', () => {
      const payment = calculateMonthlyMortgagePayment(300000, 3.5, 0)
      expect(payment).toBe(0)
    })
  })

  describe('calculateRemainingMortgage', () => {
    it('should calculate remaining balance correctly after payments', () => {
      const remaining = calculateRemainingMortgage(320000, 3.5, 30, 60)
      expect(remaining).toBeGreaterThan(280000)
      expect(remaining).toBeLessThan(320000)
    })

    it('should return 0 when all payments are made', () => {
      const remaining = calculateRemainingMortgage(300000, 3.5, 30, 360)
      expect(remaining).toBe(0)
    })

    it('should return principal when no payments made', () => {
      const remaining = calculateRemainingMortgage(300000, 3.5, 30, 0)
      expect(remaining).toBe(300000)
    })

    it('should handle zero interest rate', () => {
      const remaining = calculateRemainingMortgage(300000, 0, 30, 120)
      expect(remaining).toBeCloseTo(200000, 0)
    })
  })

  describe('createDefaultHomeOwnershipConfig', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultHomeOwnershipConfig()
      expect(config.purchasePrice).toBeGreaterThan(0)
      expect(config.downPayment).toBeGreaterThan(0)
      expect(config.mortgageInterestRate).toBeGreaterThan(0)
      expect(config.mortgageTerm).toBeGreaterThan(0)
      expect(config.downPayment).toBeLessThan(config.purchasePrice)
    })
  })

  describe('createDefaultRentalConfig', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultRentalConfig()
      expect(config.monthlyRent).toBeGreaterThan(0)
      expect(config.monthlyUtilities).toBeGreaterThan(0)
      expect(config.annualRentIncrease).toBeGreaterThan(0)
    })
  })

  describe('createDefaultComparisonConfig', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultComparisonConfig(2024)
      expect(config.startYear).toBe(2024)
      expect(config.comparisonYears).toBeGreaterThan(0)
      expect(config.investmentReturnRate).toBeGreaterThan(0)
      expect(config.enabled).toBe(false)
    })
  })

  describe('createDefaultEigenheimVsMieteConfig', () => {
    it('should create complete default configuration', () => {
      const config = createDefaultEigenheimVsMieteConfig(2024)
      expect(config.ownership).toBeDefined()
      expect(config.rental).toBeDefined()
      expect(config.comparison).toBeDefined()
      expect(config.comparison.startYear).toBe(2024)
    })
  })

  describe('calculateOwnershipCosts', () => {
    it('should calculate costs for each year', () => {
      const config = createDefaultHomeOwnershipConfig()
      const results = calculateOwnershipCosts(config, 10, 2.0)

      expect(results).toHaveLength(10)
      expect(results[0].year).toBe(1)
      expect(results[9].year).toBe(10)
    })

    it('should show decreasing remaining mortgage over time', () => {
      const config = createDefaultHomeOwnershipConfig()
      const results = calculateOwnershipCosts(config, 30, 2.0)

      expect(results[0].remainingMortgage).toBeGreaterThan(results[29].remainingMortgage)
      expect(results[29].remainingMortgage).toBeLessThan(20000)
    })

    it('should show increasing home value with appreciation', () => {
      const config: HomeOwnershipConfig = {
        ...createDefaultHomeOwnershipConfig(),
        propertyAppreciationRate: 3.0,
      }
      const results = calculateOwnershipCosts(config, 10, 2.0)

      expect(results[9].homeValue).toBeGreaterThan(results[0].homeValue)
      expect(results[9].homeValue).toBeGreaterThan(config.purchasePrice)
    })

    it('should calculate home equity correctly', () => {
      const config = createDefaultHomeOwnershipConfig()
      const results = calculateOwnershipCosts(config, 10, 2.0)

      for (const year of results) {
        expect(year.homeEquity).toBe(year.homeValue - year.remainingMortgage)
        expect(year.homeEquity).toBeGreaterThanOrEqual(0)
      }
    })

    it('should accumulate costs correctly', () => {
      const config = createDefaultHomeOwnershipConfig()
      const results = calculateOwnershipCosts(config, 5, 2.0)

      for (let i = 1; i < results.length; i++) {
        expect(results[i].cumulativeCosts).toBeGreaterThan(results[i - 1].cumulativeCosts)
      }
    })

    it('should apply inflation to recurring costs', () => {
      const config = createDefaultHomeOwnershipConfig()
      const results = calculateOwnershipCosts(config, 10, 2.0)

      // Property tax should increase with inflation
      expect(results[9].propertyTax).toBeGreaterThan(results[0].propertyTax)
      // But mortgage payment should stay constant
      expect(results[9].mortgagePayment).toBeCloseTo(results[0].mortgagePayment, 2)
    })
  })

  describe('calculateRentalCosts', () => {
    it('should calculate costs for each year', () => {
      const config = createDefaultRentalConfig()
      const results = calculateRentalCosts(config, 80000, 40000, 10, 5.0)

      expect(results).toHaveLength(10)
      expect(results[0].year).toBe(1)
      expect(results[9].year).toBe(10)
    })

    it('should show increasing rent over time', () => {
      const config: RentalConfig = {
        ...createDefaultRentalConfig(),
        annualRentIncrease: 3.0,
      }
      const results = calculateRentalCosts(config, 80000, 40000, 10, 5.0)

      expect(results[9].rent).toBeGreaterThan(results[0].rent)
    })

    it('should show growing investment value', () => {
      const config = createDefaultRentalConfig()
      const results = calculateRentalCosts(config, 80000, 40000, 10, 5.0)

      expect(results[9].investmentValue).toBeGreaterThan(results[0].investmentValue)
      expect(results[9].investmentValue).toBeGreaterThan(80000 + 40000 + config.rentalDeposit)
    })

    it('should accumulate costs correctly', () => {
      const config = createDefaultRentalConfig()
      const results = calculateRentalCosts(config, 80000, 40000, 5, 5.0)

      for (let i = 1; i < results.length; i++) {
        expect(results[i].cumulativeCosts).toBeGreaterThan(results[i - 1].cumulativeCosts)
      }
    })
  })

  describe('compareEigenheimVsMiete', () => {
    it('should generate complete comparison results', () => {
      const config = createDefaultEigenheimVsMieteConfig(2024)
      config.comparison.enabled = true
      config.comparison.comparisonYears = 10

      const results = compareEigenheimVsMiete(config)

      expect(results.ownership).toHaveLength(10)
      expect(results.rental).toHaveLength(10)
      expect(results.comparison).toHaveLength(10)
      expect(results.summary).toBeDefined()
    })

    it('should calculate summary correctly', () => {
      const config = createDefaultEigenheimVsMieteConfig(2024)
      config.comparison.comparisonYears = 30

      const results = compareEigenheimVsMiete(config)

      expect(results.summary.totalOwnershipCosts).toBeGreaterThan(0)
      expect(results.summary.totalRentalCosts).toBeGreaterThan(0)
      expect(results.summary.finalHomeEquity).toBeGreaterThan(0)
      expect(results.summary.finalRentalInvestments).toBeGreaterThan(0)
      expect(results.summary.recommendation).toMatch(/ownership|rental|similar/)
    })

    it('should calculate net worth correctly for each year', () => {
      const config = createDefaultEigenheimVsMieteConfig(2024)
      config.comparison.comparisonYears = 10

      const results = compareEigenheimVsMiete(config)

      for (let i = 0; i < results.comparison.length; i++) {
        const comp = results.comparison[i]
        const ownership = results.ownership[i]
        const rental = results.rental[i]

        expect(comp.ownershipNetWorth).toBe(ownership.homeEquity)
        expect(comp.rentalNetWorth).toBeCloseTo(rental.investmentValue + config.rental.rentalDeposit, 1)
      }
    })

    it('should find break-even year when ownership becomes profitable', () => {
      const config = createDefaultEigenheimVsMieteConfig(2024)
      config.comparison.comparisonYears = 30

      const results = compareEigenheimVsMiete(config)

      if (results.summary.breakEvenYear !== null) {
        const breakEvenIndex = results.summary.breakEvenYear - 1
        expect(results.comparison[breakEvenIndex].ownershipNetWorth).toBeGreaterThan(results.comparison[breakEvenIndex].rentalNetWorth)

        if (breakEvenIndex > 0) {
          expect(results.comparison[breakEvenIndex - 1].ownershipNetWorth).toBeLessThanOrEqual(
            results.comparison[breakEvenIndex - 1].rentalNetWorth,
          )
        }
      }
    })

    it('should show ownership advantage with high property appreciation', () => {
      const config = createDefaultEigenheimVsMieteConfig(2024)
      config.ownership.propertyAppreciationRate = 5.0
      config.comparison.investmentReturnRate = 3.0
      config.comparison.comparisonYears = 30

      const results = compareEigenheimVsMiete(config)

      expect(results.summary.netWorthDifference).toBeGreaterThan(0)
      expect(results.summary.recommendation).toBe('ownership')
    })

    it('should show rental advantage with high investment returns', () => {
      const config = createDefaultEigenheimVsMieteConfig(2024)
      config.ownership.propertyAppreciationRate = 1.0
      config.comparison.investmentReturnRate = 7.0
      config.comparison.comparisonYears = 30

      const results = compareEigenheimVsMiete(config)

      expect(results.summary.netWorthDifference).toBeLessThan(0)
      expect(results.summary.recommendation).toBe('rental')
    })

    it('should calculate first year monthly cost difference', () => {
      const config = createDefaultEigenheimVsMieteConfig(2024)
      config.comparison.comparisonYears = 10

      const results = compareEigenheimVsMiete(config)

      const expectedDifference = (results.ownership[0].totalAnnualCost - results.rental[0].totalAnnualCost) / 12

      expect(results.summary.firstYearMonthlyCostDifference).toBeCloseTo(expectedDifference, 2)
    })

    it('should handle short comparison period', () => {
      const config = createDefaultEigenheimVsMieteConfig(2024)
      config.comparison.comparisonYears = 5

      const results = compareEigenheimVsMiete(config)

      expect(results.ownership).toHaveLength(5)
      expect(results.rental).toHaveLength(5)
      expect(results.comparison).toHaveLength(5)
    })

    it('should handle long comparison period', () => {
      const config = createDefaultEigenheimVsMieteConfig(2024)
      config.comparison.comparisonYears = 40

      const results = compareEigenheimVsMiete(config)

      expect(results.ownership).toHaveLength(40)
      expect(results.rental).toHaveLength(40)
      expect(results.comparison).toHaveLength(40)
    })
  })
})
