import { describe, it, expect } from 'vitest'
import {
  createDefaultTeilverkaufConfig,
  createDefaultComparisonConfig,
  createDefaultImmobilienTeilverkaufConfig,
  calculateInitialLiquidity,
  calculateAnnualNiessbrauchFee,
  calculateAppreciatedValue,
  calculateTeilverkauf,
  calculateFullSaleRent,
  calculateLeibrente,
  compareTeilverkaufStrategies,
  type TeilverkaufConfig,
  type TeilverkaufComparisonConfig,
} from './immobilien-teilverkauf'

describe('immobilien-teilverkauf', () => {
  describe('createDefaultTeilverkaufConfig', () => {
    it('should create valid default config', () => {
      const config = createDefaultTeilverkaufConfig()

      expect(config.propertyValue).toBe(500000)
      expect(config.salePercentage).toBe(30)
      expect(config.saleAge).toBe(67)
      expect(config.niessbrauchFeeRate).toBe(4.5)
      expect(config.transactionCostsRate).toBe(5.0)
      expect(config.appreciationRate).toBe(2.0)
      expect(config.enabled).toBe(false)
    })
  })

  describe('createDefaultComparisonConfig', () => {
    it('should create valid default comparison config', () => {
      const config = createDefaultComparisonConfig()

      expect(config.alternativeMonthlyRent).toBe(1500)
      expect(config.rentIncreaseRate).toBe(2.5)
      expect(config.investmentReturnRate).toBe(5.0)
      expect(config.leibrenteMonthlyPayment).toBe(800)
    })
  })

  describe('createDefaultImmobilienTeilverkaufConfig', () => {
    it('should create complete config with both teilverkauf and comparison', () => {
      const config = createDefaultImmobilienTeilverkaufConfig()

      expect(config.teilverkauf).toBeDefined()
      expect(config.comparison).toBeDefined()
      expect(config.teilverkauf.propertyValue).toBe(500000)
      expect(config.comparison.alternativeMonthlyRent).toBe(1500)
    })
  })

  describe('calculateInitialLiquidity', () => {
    it('should calculate correct liquidity for 30% sale', () => {
      const result = calculateInitialLiquidity(500000, 30, 5.0)

      expect(result.soldValue).toBe(150000) // 30% of 500k
      expect(result.transactionCosts).toBe(7500) // 5% of 150k
      expect(result.liquidity).toBe(142500) // 150k - 7.5k
    })

    it('should calculate correct liquidity for 50% sale', () => {
      const result = calculateInitialLiquidity(600000, 50, 4.0)

      expect(result.soldValue).toBe(300000) // 50% of 600k
      expect(result.transactionCosts).toBe(12000) // 4% of 300k
      expect(result.liquidity).toBe(288000) // 300k - 12k
    })

    it('should handle 20% sale with different costs', () => {
      const result = calculateInitialLiquidity(400000, 20, 6.0)

      expect(result.soldValue).toBe(80000) // 20% of 400k
      expect(result.transactionCosts).toBe(4800) // 6% of 80k
      expect(result.liquidity).toBe(75200) // 80k - 4.8k
    })

    it('should handle zero transaction costs', () => {
      const result = calculateInitialLiquidity(500000, 30, 0)

      expect(result.soldValue).toBe(150000)
      expect(result.transactionCosts).toBe(0)
      expect(result.liquidity).toBe(150000)
    })
  })

  describe('calculateAnnualNiessbrauchFee', () => {
    it('should calculate correct annual fee for typical scenario', () => {
      const fee = calculateAnnualNiessbrauchFee(150000, 4.5)

      expect(fee).toBe(6750) // 4.5% of 150k
    })

    it('should calculate correct fee for different rates', () => {
      const fee1 = calculateAnnualNiessbrauchFee(200000, 5.0)
      const fee2 = calculateAnnualNiessbrauchFee(200000, 3.5)

      expect(fee1).toBe(10000) // 5% of 200k
      expect(fee2).toBeCloseTo(7000, 1) // 3.5% of 200k
    })

    it('should return zero for zero rate', () => {
      const fee = calculateAnnualNiessbrauchFee(150000, 0)

      expect(fee).toBe(0)
    })

    it('should return zero for zero value', () => {
      const fee = calculateAnnualNiessbrauchFee(0, 4.5)

      expect(fee).toBe(0)
    })
  })

  describe('calculateAppreciatedValue', () => {
    it('should calculate correct appreciation over 10 years', () => {
      const value = calculateAppreciatedValue(500000, 2.0, 10)

      expect(value).toBeCloseTo(609497.21, 0) // 500k * (1.02)^10
    })

    it('should calculate correct appreciation over 5 years', () => {
      const value = calculateAppreciatedValue(400000, 2.5, 5)

      expect(value).toBeCloseTo(452563.29, 0) // 400k * (1.025)^5
    })

    it('should return same value for zero years', () => {
      const value = calculateAppreciatedValue(500000, 2.0, 0)

      expect(value).toBe(500000)
    })

    it('should handle zero appreciation rate', () => {
      const value = calculateAppreciatedValue(500000, 0, 10)

      expect(value).toBe(500000)
    })

    it('should handle negative appreciation (depreciation)', () => {
      const value = calculateAppreciatedValue(500000, -2.0, 5)

      expect(value).toBeCloseTo(451960.48, 0) // 500k * (0.98)^5
    })
  })

  describe('calculateTeilverkauf', () => {
    it('should calculate complete Teilverkauf scenario', () => {
      const config: TeilverkaufConfig = {
        propertyValue: 500000,
        salePercentage: 30,
        saleAge: 67,
        niessbrauchFeeRate: 4.5,
        transactionCostsRate: 5.0,
        appreciationRate: 2.0,
        enabled: true,
      }

      const result = calculateTeilverkauf(config, 67, 77)

      expect(result.initialLiquidity).toBe(142500) // (500k * 0.3) - 5% costs
      expect(result.transactionCosts).toBe(7500)
      expect(result.soldPortionValue).toBe(150000)
      expect(result.ownedPortionValue).toBe(350000) // 70% of 500k
      expect(result.yearlyResults.length).toBe(11) // 67 to 77 inclusive
      expect(result.totalNiessbrauchPaid).toBeGreaterThan(0)
    })

    it('should calculate yearly results correctly', () => {
      const config: TeilverkaufConfig = {
        propertyValue: 500000,
        salePercentage: 30,
        saleAge: 67,
        niessbrauchFeeRate: 4.5,
        transactionCostsRate: 5.0,
        appreciationRate: 2.0,
        enabled: true,
      }

      const result = calculateTeilverkauf(config, 67, 69)

      // First year (age 67 - sale year)
      expect(result.yearlyResults[0].age).toBe(67)
      expect(result.yearlyResults[0].annualNiessbrauchFee).toBeGreaterThan(0)

      // Second year (age 68)
      expect(result.yearlyResults[1].age).toBe(68)
      expect(result.yearlyResults[1].propertyValue).toBeGreaterThan(result.yearlyResults[0].propertyValue)
    })

    it('should not charge Nießbrauch fee before sale age', () => {
      const config: TeilverkaufConfig = {
        propertyValue: 500000,
        salePercentage: 30,
        saleAge: 70,
        niessbrauchFeeRate: 4.5,
        transactionCostsRate: 5.0,
        appreciationRate: 2.0,
        enabled: true,
      }

      const result = calculateTeilverkauf(config, 67, 72)

      // Ages 67-69: no fee
      expect(result.yearlyResults[0].annualNiessbrauchFee).toBe(0) // Age 67
      expect(result.yearlyResults[1].annualNiessbrauchFee).toBe(0) // Age 68
      expect(result.yearlyResults[2].annualNiessbrauchFee).toBe(0) // Age 69

      // Age 70+: fee charged
      expect(result.yearlyResults[3].annualNiessbrauchFee).toBeGreaterThan(0) // Age 70
      expect(result.yearlyResults[4].annualNiessbrauchFee).toBeGreaterThan(0) // Age 71
    })

    it('should accumulate costs correctly', () => {
      const config: TeilverkaufConfig = {
        propertyValue: 500000,
        salePercentage: 30,
        saleAge: 67,
        niessbrauchFeeRate: 4.5,
        transactionCostsRate: 5.0,
        appreciationRate: 2.0,
        enabled: true,
      }

      const result = calculateTeilverkauf(config, 67, 69)

      // First year includes transaction costs
      expect(result.yearlyResults[0].cumulativeCosts).toBeGreaterThan(result.transactionCosts)

      // Second year should have higher cumulative costs
      expect(result.yearlyResults[1].cumulativeCosts).toBeGreaterThan(result.yearlyResults[0].cumulativeCosts)
    })

    it('should handle 50% sale percentage', () => {
      const config: TeilverkaufConfig = {
        propertyValue: 600000,
        salePercentage: 50,
        saleAge: 65,
        niessbrauchFeeRate: 5.0,
        transactionCostsRate: 4.0,
        appreciationRate: 2.5,
        enabled: true,
      }

      const result = calculateTeilverkauf(config, 65, 75)

      expect(result.soldPortionValue).toBe(300000) // 50% of 600k
      expect(result.ownedPortionValue).toBe(300000) // 50% of 600k
      expect(result.initialLiquidity).toBe(288000) // 300k - 4% costs
    })
  })

  describe('calculateFullSaleRent', () => {
    it('should calculate full sale + rent scenario correctly', () => {
      const result = calculateFullSaleRent(500000, 1500, 2.5, 5.0, 5.0, 67, 77)

      expect(result.initialLiquidity).toBe(475000) // 500k - 5% costs
      expect(result.totalRentPaid).toBeGreaterThan(0)
      expect(result.finalWealth).toBeDefined()
    })

    it('should accumulate rent correctly over years', () => {
      const result = calculateFullSaleRent(500000, 1000, 0, 0, 5.0, 67, 71) // 5 years, no increases

      // 1000 * 12 * 5 = 60,000
      expect(result.totalRentPaid).toBe(60000)
    })

    it('should apply rent increases annually', () => {
      const result1 = calculateFullSaleRent(500000, 1000, 0, 0, 5.0, 67, 71) // No increase
      const result2 = calculateFullSaleRent(500000, 1000, 3.0, 0, 5.0, 67, 71) // 3% increase

      expect(result2.totalRentPaid).toBeGreaterThan(result1.totalRentPaid)
    })

    it('should grow invested wealth with investment returns', () => {
      const noReturn = calculateFullSaleRent(500000, 1000, 2.0, 0, 5.0, 67, 71)
      const withReturn = calculateFullSaleRent(500000, 1000, 2.0, 5.0, 5.0, 67, 71)

      expect(withReturn.finalWealth).toBeGreaterThan(noReturn.finalWealth)
    })

    it('should not have negative final wealth', () => {
      // High rent that exceeds liquidity
      const result = calculateFullSaleRent(100000, 10000, 5.0, 2.0, 5.0, 67, 87)

      expect(result.finalWealth).toBeGreaterThanOrEqual(0)
    })
  })

  describe('calculateLeibrente', () => {
    it('should calculate Leibrente payments correctly', () => {
      const result = calculateLeibrente(800, 67, 77) // 11 years

      expect(result.initialLiquidity).toBe(0)
      expect(result.totalPaymentsReceived).toBe(800 * 12 * 11) // 105,600
      expect(result.finalWealth).toBe(result.totalPaymentsReceived)
    })

    it('should calculate for different payment amounts', () => {
      const result1 = calculateLeibrente(500, 67, 77)
      const result2 = calculateLeibrente(1000, 67, 77)

      expect(result2.totalPaymentsReceived).toBe(result1.totalPaymentsReceived * 2)
    })

    it('should calculate for different time periods', () => {
      const result1 = calculateLeibrente(800, 67, 71) // 5 years
      const result2 = calculateLeibrente(800, 67, 81) // 15 years

      expect(result2.totalPaymentsReceived).toBe(result1.totalPaymentsReceived * 3)
    })

    it('should handle single year', () => {
      const result = calculateLeibrente(1000, 67, 67) // 1 year

      expect(result.totalPaymentsReceived).toBe(12000) // 1000 * 12 * 1
    })
  })

  describe('compareTeilverkaufStrategies', () => {
    it('should compare all three strategies correctly', () => {
      const teilverkaufConfig: TeilverkaufConfig = {
        propertyValue: 500000,
        salePercentage: 30,
        saleAge: 67,
        niessbrauchFeeRate: 4.5,
        transactionCostsRate: 5.0,
        appreciationRate: 2.0,
        enabled: true,
      }

      const comparisonConfig: TeilverkaufComparisonConfig = {
        alternativeMonthlyRent: 1500,
        rentIncreaseRate: 2.5,
        investmentReturnRate: 5.0,
        leibrenteMonthlyPayment: 800,
      }

      const result = compareTeilverkaufStrategies(teilverkaufConfig, comparisonConfig, 67, 77)

      // All strategies should have valid results
      expect(result.teilverkauf.initialLiquidity).toBeGreaterThan(0)
      expect(result.teilverkauf.totalCosts).toBeGreaterThan(0)
      expect(result.teilverkauf.finalWealth).toBeGreaterThan(0)

      expect(result.fullSaleRent.initialLiquidity).toBeGreaterThan(0)
      expect(result.fullSaleRent.totalRentPaid).toBeGreaterThan(0)
      expect(result.fullSaleRent.finalWealth).toBeGreaterThan(0)

      expect(result.leibrente.initialLiquidity).toBe(0)
      expect(result.leibrente.totalPaymentsReceived).toBeGreaterThan(0)
      expect(result.leibrente.finalWealth).toBeGreaterThan(0)
    })

    it('should show Teilverkauf has lower initial liquidity than full sale', () => {
      const teilverkaufConfig: TeilverkaufConfig = {
        propertyValue: 500000,
        salePercentage: 30,
        saleAge: 67,
        niessbrauchFeeRate: 4.5,
        transactionCostsRate: 5.0,
        appreciationRate: 2.0,
        enabled: true,
      }

      const comparisonConfig: TeilverkaufComparisonConfig = {
        alternativeMonthlyRent: 1500,
        rentIncreaseRate: 2.5,
        investmentReturnRate: 5.0,
        leibrenteMonthlyPayment: 800,
      }

      const result = compareTeilverkaufStrategies(teilverkaufConfig, comparisonConfig, 67, 77)

      expect(result.fullSaleRent.initialLiquidity).toBeGreaterThan(result.teilverkauf.initialLiquidity)
    })

    it('should show Leibrente has no initial liquidity', () => {
      const teilverkaufConfig: TeilverkaufConfig = {
        propertyValue: 500000,
        salePercentage: 30,
        saleAge: 67,
        niessbrauchFeeRate: 4.5,
        transactionCostsRate: 5.0,
        appreciationRate: 2.0,
        enabled: true,
      }

      const comparisonConfig: TeilverkaufComparisonConfig = {
        alternativeMonthlyRent: 1500,
        rentIncreaseRate: 2.5,
        investmentReturnRate: 5.0,
        leibrenteMonthlyPayment: 800,
      }

      const result = compareTeilverkaufStrategies(teilverkaufConfig, comparisonConfig, 67, 77)

      expect(result.leibrente.initialLiquidity).toBe(0)
      expect(result.teilverkauf.initialLiquidity).toBeGreaterThan(0)
      expect(result.fullSaleRent.initialLiquidity).toBeGreaterThan(0)
    })

    it('should calculate final wealth including property value for Teilverkauf', () => {
      const teilverkaufConfig: TeilverkaufConfig = {
        propertyValue: 500000,
        salePercentage: 30,
        saleAge: 67,
        niessbrauchFeeRate: 4.5,
        transactionCostsRate: 5.0,
        appreciationRate: 2.0,
        enabled: true,
      }

      const comparisonConfig: TeilverkaufComparisonConfig = {
        alternativeMonthlyRent: 1500,
        rentIncreaseRate: 2.5,
        investmentReturnRate: 5.0,
        leibrenteMonthlyPayment: 800,
      }

      const result = compareTeilverkaufStrategies(teilverkaufConfig, comparisonConfig, 67, 77)

      // Teilverkauf final wealth should include liquidity + owned portion value
      expect(result.teilverkauf.finalWealth).toBeGreaterThan(result.teilverkauf.initialLiquidity)
    })
  })
})
