import { describe, it, expect } from 'vitest'
import {
  calculateAnnuity,
  calculateTotalInterestCost,
  calculateFirstYearInterest,
  calculateAfa,
  calculateUnleveragedReturn,
  assessRiskLevel,
  calculateLeverageScenario,
  compareLeverageScenarios,
  createStandardLeverageScenarios,
  createDefaultPropertyFinancingConfig,
  type LeverageScenario,
} from './immobilien-leverage'

describe('Immobilien-Leverage Helper Functions', () => {
  describe('calculateAnnuity', () => {
    it('should calculate monthly payment for standard 30-year mortgage', () => {
      const loanAmount = 320000
      const interestRate = 3.5
      const termYears = 30

      const monthlyPayment = calculateAnnuity(loanAmount, interestRate, termYears)

      // Expected: ~1436.94 EUR/month for this scenario
      expect(monthlyPayment).toBeGreaterThan(1400)
      expect(monthlyPayment).toBeLessThan(1500)
      expect(monthlyPayment).toBeCloseTo(1436.94, 1)
    })

    it('should return 0 for zero loan amount', () => {
      expect(calculateAnnuity(0, 3.5, 30)).toBe(0)
    })

    it('should return 0 for zero term', () => {
      expect(calculateAnnuity(100000, 3.5, 0)).toBe(0)
    })

    it('should handle 0% interest rate', () => {
      const loanAmount = 300000
      const termYears = 30

      const monthlyPayment = calculateAnnuity(loanAmount, 0, termYears)

      // With 0% interest, payment = principal / months
      expect(monthlyPayment).toBeCloseTo(loanAmount / (termYears * 12), 2)
    })

    it('should calculate higher payments for higher interest rates', () => {
      const loanAmount = 200000
      const termYears = 25

      const payment3Percent = calculateAnnuity(loanAmount, 3, termYears)
      const payment5Percent = calculateAnnuity(loanAmount, 5, termYears)

      expect(payment5Percent).toBeGreaterThan(payment3Percent)
    })

    it('should calculate higher payments for shorter terms', () => {
      const loanAmount = 200000
      const interestRate = 3.5

      const payment30Years = calculateAnnuity(loanAmount, interestRate, 30)
      const payment20Years = calculateAnnuity(loanAmount, interestRate, 20)

      expect(payment20Years).toBeGreaterThan(payment30Years)
    })
  })

  describe('calculateTotalInterestCost', () => {
    it('should calculate total interest over loan life', () => {
      const loanAmount = 300000
      const interestRate = 3.5
      const termYears = 30

      const totalInterest = calculateTotalInterestCost(loanAmount, interestRate, termYears)

      // Total interest should be significant for a 30-year loan
      expect(totalInterest).toBeGreaterThan(150000)
      expect(totalInterest).toBeLessThan(250000)
    })

    it('should return 0 for 0% interest', () => {
      const totalInterest = calculateTotalInterestCost(300000, 0, 30)
      expect(totalInterest).toBe(0)
    })

    it('should calculate more interest for longer terms', () => {
      const loanAmount = 200000
      const interestRate = 4

      const interest20Years = calculateTotalInterestCost(loanAmount, interestRate, 20)
      const interest30Years = calculateTotalInterestCost(loanAmount, interestRate, 30)

      expect(interest30Years).toBeGreaterThan(interest20Years)
    })

    it('should calculate more interest for higher rates', () => {
      const loanAmount = 200000
      const termYears = 25

      const interest3Percent = calculateTotalInterestCost(loanAmount, 3, termYears)
      const interest5Percent = calculateTotalInterestCost(loanAmount, 5, termYears)

      expect(interest5Percent).toBeGreaterThan(interest3Percent)
    })
  })

  describe('calculateFirstYearInterest', () => {
    it('should calculate first year interest payment', () => {
      const loanAmount = 300000
      const interestRate = 3.5
      const termYears = 30

      const firstYearInterest = calculateFirstYearInterest(loanAmount, interestRate, termYears)

      // First year interest should be close to full year interest on principal
      // For 300k at 3.5%, approximately 10,408 EUR
      expect(firstYearInterest).toBeGreaterThan(10000)
      expect(firstYearInterest).toBeLessThan(11000)
      expect(firstYearInterest).toBeCloseTo(10408, 0)
    })

    it('should return 0 for 0% interest', () => {
      expect(calculateFirstYearInterest(300000, 0, 30)).toBe(0)
    })

    it('should return 0 for zero loan amount', () => {
      expect(calculateFirstYearInterest(0, 3.5, 30)).toBe(0)
    })

    it('should calculate higher interest for higher loan amounts', () => {
      const interestRate = 4
      const termYears = 25

      const interest200k = calculateFirstYearInterest(200000, interestRate, termYears)
      const interest400k = calculateFirstYearInterest(400000, interestRate, termYears)

      expect(interest400k).toBeCloseTo(interest200k * 2, -1)
    })
  })

  describe('calculateAfa', () => {
    it('should calculate 3% AfA for buildings after 2022', () => {
      const buildingValue = 300000
      const buildingYear = 2023

      const afa = calculateAfa(buildingValue, buildingYear)

      expect(afa).toBe(300000 * 0.03)
      expect(afa).toBe(9000)
    })

    it('should calculate 2% AfA for buildings between 1925 and 2022', () => {
      const buildingValue = 250000
      const buildingYear = 2000

      const afa = calculateAfa(buildingValue, buildingYear)

      expect(afa).toBe(250000 * 0.02)
      expect(afa).toBe(5000)
    })

    it('should calculate 2.5% AfA for buildings before 1925', () => {
      const buildingValue = 200000
      const buildingYear = 1900

      const afa = calculateAfa(buildingValue, buildingYear)

      expect(afa).toBe(200000 * 0.025)
      expect(afa).toBe(5000)
    })

    it('should handle edge case: exactly 1925', () => {
      const buildingValue = 300000
      const buildingYear = 1925

      const afa = calculateAfa(buildingValue, buildingYear)

      // 1925 should use 2% rate (>= 1925 condition)
      expect(afa).toBe(300000 * 0.02)
    })

    it('should handle edge case: exactly 2023', () => {
      const buildingValue = 300000
      const buildingYear = 2023

      const afa = calculateAfa(buildingValue, buildingYear)

      // 2023 should use 3% rate (>= 2023 condition)
      expect(afa).toBe(300000 * 0.03)
    })
  })

  describe('calculateUnleveragedReturn', () => {
    it('should calculate return without leverage', () => {
      const annualRentalIncome = 24000
      const operatingCostsRate = 25
      const totalPurchasePrice = 400000
      const annualAfa = 9000
      const personalTaxRate = 35

      const returnPercent = calculateUnleveragedReturn(
        annualRentalIncome,
        operatingCostsRate,
        totalPurchasePrice,
        annualAfa,
        personalTaxRate,
      )

      // Net operating income = 24000 - 6000 = 18000
      // Tax benefit from AfA = 9000 * 0.35 = 3150
      // Total = 21150
      // Return = 21150 / 400000 = 5.2875%
      expect(returnPercent).toBeCloseTo(5.29, 1)
    })

    it('should be higher with lower operating costs', () => {
      const config = {
        annualRentalIncome: 24000,
        totalPurchasePrice: 400000,
        annualAfa: 9000,
        personalTaxRate: 35,
      }

      const return20Percent = calculateUnleveragedReturn(config.annualRentalIncome, 20, config.totalPurchasePrice, config.annualAfa, config.personalTaxRate)
      const return30Percent = calculateUnleveragedReturn(config.annualRentalIncome, 30, config.totalPurchasePrice, config.annualAfa, config.personalTaxRate)

      expect(return20Percent).toBeGreaterThan(return30Percent)
    })

    it('should be higher with higher tax rate (more AfA benefit)', () => {
      const config = {
        annualRentalIncome: 24000,
        operatingCostsRate: 25,
        totalPurchasePrice: 400000,
        annualAfa: 9000,
      }

      const return25Percent = calculateUnleveragedReturn(
        config.annualRentalIncome,
        config.operatingCostsRate,
        config.totalPurchasePrice,
        config.annualAfa,
        25,
      )
      const return42Percent = calculateUnleveragedReturn(
        config.annualRentalIncome,
        config.operatingCostsRate,
        config.totalPurchasePrice,
        config.annualAfa,
        42,
      )

      expect(return42Percent).toBeGreaterThan(return25Percent)
    })
  })

  describe('assessRiskLevel', () => {
    it('should assess low risk for conservative financing', () => {
      const indicators = {
        loanToValue: 50,
        interestCoverageRatio: 3.0,
        debtServiceCoverageRatio: 2.0,
        mortgageToIncomeRatio: 50,
      }

      const assessment = assessRiskLevel(indicators)

      expect(assessment.riskLevel).toBe('niedrig')
      expect(assessment.warnings).toHaveLength(0)
    })

    it('should assess medium risk for balanced financing', () => {
      const indicators = {
        loanToValue: 70,
        interestCoverageRatio: 2.0,
        debtServiceCoverageRatio: 1.5,
        mortgageToIncomeRatio: 60,
      }

      const assessment = assessRiskLevel(indicators)

      expect(assessment.riskLevel).toBe('mittel')
    })

    it('should assess high risk for aggressive financing', () => {
      const indicators = {
        loanToValue: 85,
        interestCoverageRatio: 1.4,
        debtServiceCoverageRatio: 1.3,
        mortgageToIncomeRatio: 75,
      }

      const assessment = assessRiskLevel(indicators)

      // With LTV 85 this becomes 'sehr hoch' due to our risk logic
      expect(assessment.riskLevel).toBe('sehr hoch')
      expect(assessment.warnings.length).toBeGreaterThan(0)
    })

    it('should assess very high risk for very aggressive financing', () => {
      const indicators = {
        loanToValue: 95,
        interestCoverageRatio: 1.2,
        debtServiceCoverageRatio: 1.1,
        mortgageToIncomeRatio: 85,
      }

      const assessment = assessRiskLevel(indicators)

      expect(assessment.riskLevel).toBe('sehr hoch')
      expect(assessment.warnings.length).toBeGreaterThan(2)
    })

    it('should warn about high LTV ratio', () => {
      const indicators = {
        loanToValue: 91,
        interestCoverageRatio: 2.0,
        debtServiceCoverageRatio: 1.5,
        mortgageToIncomeRatio: 60,
      }

      const assessment = assessRiskLevel(indicators)

      expect(assessment.warnings.some(w => w.includes('Sehr hoher Beleihungsauslauf'))).toBe(true)
    })

    it('should warn about low interest coverage', () => {
      const indicators = {
        loanToValue: 70,
        interestCoverageRatio: 1.3,
        debtServiceCoverageRatio: 1.5,
        mortgageToIncomeRatio: 60,
      }

      const assessment = assessRiskLevel(indicators)

      expect(assessment.warnings.some(w => w.includes('Niedrige Zinsdeckung'))).toBe(true)
    })

    it('should warn about critical debt service coverage', () => {
      const indicators = {
        loanToValue: 70,
        interestCoverageRatio: 2.0,
        debtServiceCoverageRatio: 1.15,
        mortgageToIncomeRatio: 60,
      }

      const assessment = assessRiskLevel(indicators)

      expect(assessment.warnings.some(w => w.includes('Kritische Schuldendienstdeckung'))).toBe(true)
    })

    it('should warn about high mortgage to income ratio', () => {
      const indicators = {
        loanToValue: 70,
        interestCoverageRatio: 2.0,
        debtServiceCoverageRatio: 1.5,
        mortgageToIncomeRatio: 85,
      }

      const assessment = assessRiskLevel(indicators)

      expect(assessment.warnings.some(w => w.includes('Sehr hohe Belastungsquote'))).toBe(true)
    })
  })

  describe('calculateLeverageScenario', () => {
    it('should calculate complete leverage scenario results', () => {
      const scenario: LeverageScenario = {
        name: 'Test Scenario',
        downPaymentPercent: 30,
        interestRate: 3.5,
        termYears: 30,
      }

      const config = createDefaultPropertyFinancingConfig()
      const results = calculateLeverageScenario(scenario, config)

      // Verify basic calculations
      expect(results.downPayment).toBe(400000 * 0.3)
      expect(results.loanAmount).toBe(400000 * 0.7)
      expect(results.loanToValue).toBe(70)

      // Verify mortgage calculations
      expect(results.annualMortgagePayment).toBeGreaterThan(0)
      expect(results.annualInterest).toBeGreaterThan(0)
      expect(results.annualPrincipal).toBeGreaterThan(0)
      expect(results.annualMortgagePayment).toBeCloseTo(results.annualInterest + results.annualPrincipal, 0)

      // Verify tax benefits exist
      expect(results.taxBenefitInterest).toBeGreaterThan(0)
      expect(results.taxBenefitAfa).toBeGreaterThan(0)
      expect(results.totalTaxBenefit).toBe(results.taxBenefitInterest + results.taxBenefitAfa)

      // Verify return calculations
      expect(results.cashOnCashReturn).toBeDefined()
      expect(results.returnWithoutLeverage).toBeDefined()
      expect(results.leverageEffect).toBeDefined()

      // Verify risk indicators
      expect(results.riskIndicators.riskLevel).toBeDefined()
      expect(['niedrig', 'mittel', 'hoch', 'sehr hoch']).toContain(results.riskIndicators.riskLevel)
    })

    it('should show positive leverage effect with lower equity', () => {
      const config = createDefaultPropertyFinancingConfig()

      const scenario40Percent: LeverageScenario = {
        name: '40% Equity',
        downPaymentPercent: 40,
        interestRate: 3.5,
        termYears: 30,
      }

      const scenario20Percent: LeverageScenario = {
        name: '20% Equity',
        downPaymentPercent: 20,
        interestRate: 3.5,
        termYears: 30,
      }

      const results40 = calculateLeverageScenario(scenario40Percent, config)
      const results20 = calculateLeverageScenario(scenario20Percent, config)

      // Higher leverage (20% equity) should generally have higher cash-on-cash return
      // (assuming the property generates positive cash flow)
      expect(results20.cashOnCashReturn).toBeGreaterThan(results40.cashOnCashReturn)
    })

    it('should have higher risk indicators with higher leverage', () => {
      const config = createDefaultPropertyFinancingConfig()

      const scenarioLowLeverage: LeverageScenario = {
        name: 'Low Leverage',
        downPaymentPercent: 50,
        interestRate: 3.0,
        termYears: 25,
      }

      const scenarioHighLeverage: LeverageScenario = {
        name: 'High Leverage',
        downPaymentPercent: 10,
        interestRate: 4.0,
        termYears: 30,
      }

      const resultsLow = calculateLeverageScenario(scenarioLowLeverage, config)
      const resultsHigh = calculateLeverageScenario(scenarioHighLeverage, config)

      expect(resultsHigh.loanToValue).toBeGreaterThan(resultsLow.loanToValue)
      expect(resultsHigh.riskIndicators.warnings.length).toBeGreaterThan(resultsLow.riskIndicators.warnings.length)
    })

    it('should calculate AfA correctly based on building year', () => {
      const scenario: LeverageScenario = {
        name: 'Test',
        downPaymentPercent: 30,
        interestRate: 3.5,
        termYears: 30,
      }

      const configNew = createDefaultPropertyFinancingConfig()
      configNew.buildingYear = 2023
      const resultsNew = calculateLeverageScenario(scenario, configNew)

      const configOld = createDefaultPropertyFinancingConfig()
      configOld.buildingYear = 2000
      const resultsOld = calculateLeverageScenario(scenario, configOld)

      // New building should have 3% AfA, old 2%
      expect(resultsNew.annualAfa).toBeGreaterThan(resultsOld.annualAfa)
      expect(resultsNew.annualAfa).toBe(configNew.buildingValue * 0.03)
      expect(resultsOld.annualAfa).toBe(configOld.buildingValue * 0.02)
    })
  })

  describe('compareLeverageScenarios', () => {
    it('should compare multiple scenarios and provide recommendations', () => {
      const scenarios = createStandardLeverageScenarios(3.5)
      const config = createDefaultPropertyFinancingConfig()

      const comparison = compareLeverageScenarios(scenarios, config)

      // Should have results for all scenarios
      expect(comparison.scenarios).toHaveLength(4)

      // Should have recommendations
      expect(comparison.recommendedScenario).toBeDefined()
      expect(comparison.bestByReturn).toBeDefined()
      expect(comparison.bestByRisk).toBeDefined()

      // Summary should be calculated
      expect(comparison.summary.minDownPayment).toBeLessThan(comparison.summary.maxDownPayment)
      expect(comparison.summary.minCashOnCashReturn).toBeDefined()
      expect(comparison.summary.maxCashOnCashReturn).toBeDefined()
      expect(comparison.summary.avgLeverageEffect).toBeDefined()
    })

    it('should identify highest return scenario', () => {
      const scenarios = createStandardLeverageScenarios(3.5)
      const config = createDefaultPropertyFinancingConfig()

      const comparison = compareLeverageScenarios(scenarios, config)

      const bestReturnScenario = comparison.scenarios.find(s => s.scenario.name === comparison.bestByReturn)
      expect(bestReturnScenario).toBeDefined()

      // Best return should have the highest cash-on-cash return
      const allReturns = comparison.scenarios.map(s => s.cashOnCashReturn)
      expect(bestReturnScenario!.cashOnCashReturn).toBe(Math.max(...allReturns))
    })

    it('should identify lowest risk scenario', () => {
      const scenarios = createStandardLeverageScenarios(3.5)
      const config = createDefaultPropertyFinancingConfig()

      const comparison = compareLeverageScenarios(scenarios, config)

      const bestRiskScenario = comparison.scenarios.find(s => s.scenario.name === comparison.bestByRisk)
      expect(bestRiskScenario).toBeDefined()

      // Best risk should have lowest LTV
      const allLTVs = comparison.scenarios.map(s => s.loanToValue)
      expect(bestRiskScenario!.loanToValue).toBe(Math.min(...allLTVs))
    })

    it('should calculate summary statistics correctly', () => {
      const scenarios: LeverageScenario[] = [
        { name: 'Scenario 1', downPaymentPercent: 20, interestRate: 3.5, termYears: 30 },
        { name: 'Scenario 2', downPaymentPercent: 40, interestRate: 3.0, termYears: 25 },
      ]
      const config = createDefaultPropertyFinancingConfig()

      const comparison = compareLeverageScenarios(scenarios, config)

      expect(comparison.summary.minDownPayment).toBe(400000 * 0.2)
      expect(comparison.summary.maxDownPayment).toBe(400000 * 0.4)
      expect(comparison.summary.minCashOnCashReturn).toBeLessThan(comparison.summary.maxCashOnCashReturn)
      expect(comparison.summary.avgLeverageEffect).toBeGreaterThan(0)
    })
  })

  describe('createStandardLeverageScenarios', () => {
    it('should create 4 standard scenarios', () => {
      const scenarios = createStandardLeverageScenarios(3.5)

      expect(scenarios).toHaveLength(4)
    })

    it('should create scenarios with increasing leverage', () => {
      const scenarios = createStandardLeverageScenarios(3.5)

      // Should have decreasing down payments (increasing leverage)
      expect(scenarios[0].downPaymentPercent).toBeGreaterThan(scenarios[1].downPaymentPercent)
      expect(scenarios[1].downPaymentPercent).toBeGreaterThan(scenarios[2].downPaymentPercent)
      expect(scenarios[2].downPaymentPercent).toBeGreaterThan(scenarios[3].downPaymentPercent)
    })

    it('should adjust interest rates based on LTV', () => {
      const baseRate = 3.5
      const scenarios = createStandardLeverageScenarios(baseRate)

      // Higher leverage (lower down payment) should have higher interest rates
      const conservativeRate = scenarios[0].interestRate
      const aggressiveRate = scenarios[3].interestRate

      expect(aggressiveRate).toBeGreaterThan(conservativeRate)
      expect(conservativeRate).toBeLessThan(baseRate)
      expect(aggressiveRate).toBeGreaterThan(baseRate)
    })

    it('should use different base interest rate', () => {
      const scenarios4Percent = createStandardLeverageScenarios(4.0)
      const scenarios3Percent = createStandardLeverageScenarios(3.0)

      // All scenarios should be shifted by the base rate difference
      scenarios4Percent.forEach((scenario, index) => {
        expect(scenario.interestRate).toBeGreaterThan(scenarios3Percent[index].interestRate)
      })
    })
  })

  describe('createDefaultPropertyFinancingConfig', () => {
    it('should create valid default configuration', () => {
      const config = createDefaultPropertyFinancingConfig()

      expect(config.totalPurchasePrice).toBe(400000)
      expect(config.buildingValue).toBe(300000)
      expect(config.landValue).toBe(100000)
      expect(config.buildingValue + config.landValue).toBe(config.totalPurchasePrice)

      expect(config.annualRentalIncome).toBeGreaterThan(0)
      expect(config.operatingCostsRate).toBeGreaterThan(0)
      expect(config.operatingCostsRate).toBeLessThan(100)
      expect(config.appreciationRate).toBeGreaterThan(0)
      expect(config.personalTaxRate).toBeGreaterThan(0)
      expect(config.personalTaxRate).toBeLessThan(100)
      expect(config.buildingYear).toBeGreaterThan(1900)
    })

    it('should have realistic rental yield', () => {
      const config = createDefaultPropertyFinancingConfig()

      const grossYield = (config.annualRentalIncome / config.totalPurchasePrice) * 100

      // German rental yields typically 4-8%
      expect(grossYield).toBeGreaterThan(4)
      expect(grossYield).toBeLessThan(8)
    })
  })

  describe('Integration: Complete leverage analysis workflow', () => {
    it('should perform complete analysis from configuration to recommendations', () => {
      // Create property config
      const propertyConfig = createDefaultPropertyFinancingConfig()

      // Create scenarios
      const scenarios = createStandardLeverageScenarios(3.5)

      // Perform comparison
      const comparison = compareLeverageScenarios(scenarios, propertyConfig)

      // Verify complete workflow
      expect(comparison.scenarios).toHaveLength(4)
      expect(comparison.recommendedScenario).toBeTruthy()
      expect(comparison.bestByReturn).toBeTruthy()
      expect(comparison.bestByRisk).toBeTruthy()

      // All scenarios should have complete data
      comparison.scenarios.forEach(result => {
        expect(result.downPayment).toBeGreaterThan(0)
        expect(result.loanAmount).toBeGreaterThan(0)
        expect(result.annualMortgagePayment).toBeGreaterThan(0)
        expect(result.cashOnCashReturn).toBeDefined()
        expect(result.riskIndicators.riskLevel).toBeTruthy()
      })
    })

    it('should demonstrate leverage effect', () => {
      const propertyConfig = createDefaultPropertyFinancingConfig()
      const scenarios = createStandardLeverageScenarios(3.5)
      const comparison = compareLeverageScenarios(scenarios, propertyConfig)

      // Find conservative and aggressive scenarios
      const conservative = comparison.scenarios.find(s => s.scenario.downPaymentPercent === 40)!
      const aggressive = comparison.scenarios.find(s => s.scenario.downPaymentPercent === 10)!

      // Aggressive leverage should amplify returns (positive or negative)
      expect(Math.abs(aggressive.leverageEffect)).toBeGreaterThan(Math.abs(conservative.leverageEffect))

      // Cash-on-cash return should be higher with more leverage (for positive cash flow properties)
      if (aggressive.annualNetCashFlow > 0) {
        expect(aggressive.cashOnCashReturn).toBeGreaterThan(conservative.cashOnCashReturn)
      }
    })

    it('should balance risk and return in recommendation', () => {
      const propertyConfig = createDefaultPropertyFinancingConfig()
      const scenarios = createStandardLeverageScenarios(3.5)
      const comparison = compareLeverageScenarios(scenarios, propertyConfig)

      const recommended = comparison.scenarios.find(s => s.scenario.name === comparison.recommendedScenario)!
      const bestReturn = comparison.scenarios.find(s => s.scenario.name === comparison.bestByReturn)!

      // Recommended should not be the riskiest scenario (unless it's also best return)
      if (recommended.scenario.name !== bestReturn.scenario.name) {
        const riskLevels = { niedrig: 1, mittel: 2, hoch: 3, 'sehr hoch': 4 }
        expect(riskLevels[recommended.riskIndicators.riskLevel]).toBeLessThanOrEqual(riskLevels[bestReturn.riskIndicators.riskLevel])
      }
    })
  })
})
