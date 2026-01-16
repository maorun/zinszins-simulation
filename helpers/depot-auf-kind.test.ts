/**
 * Tests for Depot-auf-Kind-Strategie (Child's Depot Tax Optimization)
 */

import { describe, it, expect } from 'vitest'
import {
  simulateDepotAufKind,
  calculateOptimalTransferTiming,
  validateDepotAufKindConfig,
  createDefaultDepotAufKindConfig,
  CHILD_TAX_ALLOWANCES,
  TEILFREISTELLUNG_RATES,
  type DepotAufKindConfig,
} from './depot-auf-kind'

describe('Child Tax Allowances Constants', () => {
  it('should have correct Sparerpauschbetrag for children', () => {
    expect(CHILD_TAX_ALLOWANCES.SPARERPAUSCHBETRAG).toBe(1000)
  })

  it('should have correct Grundfreibetrag', () => {
    expect(CHILD_TAX_ALLOWANCES.GRUNDFREIBETRAG).toBe(11604)
  })

  it('should have correct Teilfreistellung rates', () => {
    expect(TEILFREISTELLUNG_RATES.equity_fund).toBe(0.3) // 30%
    expect(TEILFREISTELLUNG_RATES.mixed_fund).toBe(0.15) // 15%
    expect(TEILFREISTELLUNG_RATES.bond_fund).toBe(0.0) // 0%
    expect(TEILFREISTELLUNG_RATES.savings_account).toBe(0.0) // 0%
  })
})

describe('createDefaultDepotAufKindConfig', () => {
  it('should create valid default configuration', () => {
    const config = createDefaultDepotAufKindConfig('Max', 2015)

    expect(config.childName).toBe('Max')
    expect(config.birthYear).toBe(2015)
    expect(config.initialDepotValue).toBe(50000)
    expect(config.expectedAnnualReturn).toBe(0.05)
    expect(config.assetType).toBe('equity_fund')
    expect(config.hasOtherIncome).toBe(false)
    expect(config.otherAnnualIncome).toBe(0)
    expect(config.parentMarginalTaxRate).toBe(0.42)
    expect(config.simulationYears).toBeGreaterThan(0)
  })

  it('should calculate appropriate simulation years based on child age', () => {
    const currentYear = new Date().getFullYear()
    const youngChild = createDefaultDepotAufKindConfig('Anna', currentYear - 5) // 5 years old
    const olderChild = createDefaultDepotAufKindConfig('Ben', currentYear - 17) // 17 years old

    expect(youngChild.simulationYears).toBeGreaterThan(olderChild.simulationYears)
  })
})

describe('validateDepotAufKindConfig', () => {
  const validConfig: DepotAufKindConfig = {
    childName: 'Emma',
    birthYear: 2010,
    initialDepotValue: 30000,
    expectedAnnualReturn: 0.06,
    assetType: 'equity_fund',
    hasOtherIncome: false,
    otherAnnualIncome: 0,
    parentMarginalTaxRate: 0.35,
    simulationYears: 10,
    startYear: 2024,
  }

  it('should validate correct configuration', () => {
    const result = validateDepotAufKindConfig(validConfig)
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject empty child name', () => {
    const config = { ...validConfig, childName: '' }
    const result = validateDepotAufKindConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Name des Kindes darf nicht leer sein')
  })

  it('should reject invalid birth year', () => {
    const config = { ...validConfig, birthYear: 1800 }
    const result = validateDepotAufKindConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes('Geburtsjahr'))).toBe(true)
  })

  it('should reject negative depot value', () => {
    const config = { ...validConfig, initialDepotValue: -1000 }
    const result = validateDepotAufKindConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes('Depot-Wert'))).toBe(true)
  })

  it('should reject invalid return rate', () => {
    const config = { ...validConfig, expectedAnnualReturn: 1.5 }
    const result = validateDepotAufKindConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes('Rendite'))).toBe(true)
  })

  it('should reject invalid parent tax rate', () => {
    const config = { ...validConfig, parentMarginalTaxRate: 0.5 }
    const result = validateDepotAufKindConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes('Grenzsteuersatz'))).toBe(true)
  })

  it('should reject invalid simulation years', () => {
    const config = { ...validConfig, simulationYears: 0 }
    const result = validateDepotAufKindConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes('Simulationsdauer'))).toBe(true)
  })

  it('should reject negative other income', () => {
    const config = { ...validConfig, hasOtherIncome: true, otherAnnualIncome: -500 }
    const result = validateDepotAufKindConfig(config)
    expect(result.isValid).toBe(false)
    expect(result.errors.some((e) => e.includes('Jahreseinkommen'))).toBe(true)
  })
})

describe('calculateOptimalTransferTiming', () => {
  it('should recommend transfer at age 18 for typical case', () => {
    const result = calculateOptimalTransferTiming(2010, 2029, 5)
    expect(result.recommendedTransferYear).toBe(2028) // Age 18
    expect(result.reasoning).toContain('18 Jahren')
  })

  it('should recommend transfer 2 years before study for younger children', () => {
    const result = calculateOptimalTransferTiming(2015, 2034, 5)
    expect(result.recommendedTransferYear).toBe(2033) // Age 18 (max of 18 or studyStart-2)
    expect(result.reasoning).toContain('steuerfreies Wachstum')
  })

  it('should provide reasoning in German', () => {
    const result = calculateOptimalTransferTiming(2010, 2029, 5)
    expect(result.reasoning).toMatch(/Transfer im Alter von/)
    expect(result.reasoning).toMatch(/empfohlen/)
  })
})

describe('simulateDepotAufKind - Basic Functionality', () => {
  const basicConfig: DepotAufKindConfig = {
    childName: 'Lisa',
    birthYear: 2015,
    initialDepotValue: 10000,
    expectedAnnualReturn: 0.05,
    assetType: 'equity_fund',
    hasOtherIncome: false,
    otherAnnualIncome: 0,
    parentMarginalTaxRate: 0.42,
    simulationYears: 5,
    startYear: 2024,
  }

  it('should return results for all simulation years', () => {
    const result = simulateDepotAufKind(basicConfig)
    expect(result.yearlyResults).toHaveLength(5)
  })

  it('should calculate child age correctly for each year', () => {
    const result = simulateDepotAufKind(basicConfig)
    result.yearlyResults.forEach((yearResult, index) => {
      const expectedAge = 2024 - 2015 + index
      expect(yearResult.childAge).toBe(expectedAge)
    })
  })

  it('should apply investment returns each year', () => {
    const result = simulateDepotAufKind(basicConfig)
    result.yearlyResults.forEach((yearResult) => {
      const expectedReturn = yearResult.startValue * 0.05
      expect(yearResult.investmentReturn).toBeCloseTo(expectedReturn, 2)
    })
  })

  it('should grow depot value over time', () => {
    const result = simulateDepotAufKind(basicConfig)
    let previousValue = basicConfig.initialDepotValue

    result.yearlyResults.forEach((yearResult) => {
      expect(yearResult.endValue).toBeGreaterThan(previousValue * 0.9) // Allow for tax impact
      previousValue = yearResult.endValue
    })
  })
})

describe('simulateDepotAufKind - Tax Calculations', () => {
  const taxConfig: DepotAufKindConfig = {
    childName: 'Tom',
    birthYear: 2010,
    initialDepotValue: 50000,
    expectedAnnualReturn: 0.06,
    assetType: 'equity_fund',
    hasOtherIncome: false,
    otherAnnualIncome: 0,
    parentMarginalTaxRate: 0.42,
    simulationYears: 5,
    startYear: 2024,
  }

  it('should calculate Vorabpauschale correctly', () => {
    const result = simulateDepotAufKind(taxConfig)
    result.yearlyResults.forEach((yearResult) => {
      expect(yearResult.vorabpauschale).toBeGreaterThanOrEqual(0)
      expect(yearResult.vorabpauschale).toBeLessThanOrEqual(yearResult.investmentReturn)
    })
  })

  it('should apply Teilfreistellung for equity funds (30%)', () => {
    const result = simulateDepotAufKind(taxConfig)
    result.yearlyResults.forEach((yearResult) => {
      const expectedTeilfreistellung = yearResult.vorabpauschale * 0.3
      expect(yearResult.teilfreistellungAmount).toBeCloseTo(expectedTeilfreistellung, 2)
    })
  })

  it('should apply Sparerpauschbetrag (€1,000)', () => {
    const result = simulateDepotAufKind(taxConfig)
    result.yearlyResults.forEach((yearResult) => {
      expect(yearResult.sparerpauschbetragApplied).toBeLessThanOrEqual(1000)
      expect(yearResult.sparerpauschbetragApplied).toBeGreaterThanOrEqual(0)
    })
  })

  it('should calculate tax savings vs parent', () => {
    const result = simulateDepotAufKind(taxConfig)
    result.yearlyResults.forEach((yearResult) => {
      expect(yearResult.taxSavedVsParent).toBeGreaterThanOrEqual(0)
    })
  })

  it('should have lower tax burden than parent', () => {
    const result = simulateDepotAufKind(taxConfig)
    expect(result.summary.totalTaxPaidByChild).toBeLessThan(result.summary.totalTaxIfParentDepot)
    expect(result.summary.totalTaxSavings).toBeGreaterThan(0)
  })
})

describe('simulateDepotAufKind - Asset Type Variations', () => {
  it('should apply correct Teilfreistellung for mixed funds (15%)', () => {
    const config: DepotAufKindConfig = {
      childName: 'Sarah',
      birthYear: 2012,
      initialDepotValue: 30000,
      expectedAnnualReturn: 0.05,
      assetType: 'mixed_fund',
      hasOtherIncome: false,
      otherAnnualIncome: 0,
      parentMarginalTaxRate: 0.35,
      simulationYears: 3,
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)
    result.yearlyResults.forEach((yearResult) => {
      const expectedTeilfreistellung = yearResult.vorabpauschale * 0.15
      expect(yearResult.teilfreistellungAmount).toBeCloseTo(expectedTeilfreistellung, 2)
    })
  })

  it('should apply no Teilfreistellung for savings accounts', () => {
    const config: DepotAufKindConfig = {
      childName: 'Paul',
      birthYear: 2013,
      initialDepotValue: 20000,
      expectedAnnualReturn: 0.02,
      assetType: 'savings_account',
      hasOtherIncome: false,
      otherAnnualIncome: 0,
      parentMarginalTaxRate: 0.28,
      simulationYears: 3,
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)
    result.yearlyResults.forEach((yearResult) => {
      expect(yearResult.teilfreistellungAmount).toBe(0)
    })
  })
})

describe('simulateDepotAufKind - Child with Other Income', () => {
  it('should calculate income tax when child has other income', () => {
    const config: DepotAufKindConfig = {
      childName: 'Nina',
      birthYear: 2007,
      initialDepotValue: 40000,
      expectedAnnualReturn: 0.05,
      assetType: 'equity_fund',
      hasOtherIncome: true,
      otherAnnualIncome: 5000, // Apprenticeship income
      parentMarginalTaxRate: 0.38,
      simulationYears: 3,
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)
    result.yearlyResults.forEach((yearResult) => {
      expect(yearResult.otherIncome).toBe(5000)
      expect(yearResult.totalTaxableIncome).toBeGreaterThanOrEqual(yearResult.otherIncome)
    })
  })

  it('should not charge income tax below Grundfreibetrag', () => {
    const config: DepotAufKindConfig = {
      childName: 'Felix',
      birthYear: 2008,
      initialDepotValue: 10000,
      expectedAnnualReturn: 0.03,
      assetType: 'equity_fund',
      hasOtherIncome: true,
      otherAnnualIncome: 8000, // Below Grundfreibetrag
      parentMarginalTaxRate: 0.35,
      simulationYears: 2,
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)
    result.yearlyResults.forEach((yearResult) => {
      // Income tax should be 0 or minimal if total income is below Grundfreibetrag
      if (yearResult.totalTaxableIncome < CHILD_TAX_ALLOWANCES.GRUNDFREIBETRAG) {
        expect(yearResult.incomeTaxOnOtherIncome).toBe(0)
      }
    })
  })
})

describe('simulateDepotAufKind - Summary Statistics', () => {
  const summaryConfig: DepotAufKindConfig = {
    childName: 'Julia',
    birthYear: 2011,
    initialDepotValue: 60000,
    expectedAnnualReturn: 0.07,
    assetType: 'equity_fund',
    hasOtherIncome: false,
    otherAnnualIncome: 0,
    parentMarginalTaxRate: 0.42,
    simulationYears: 8,
    startYear: 2024,
  }

  it('should calculate total returns correctly', () => {
    const result = simulateDepotAufKind(summaryConfig)
    const manualSum = result.yearlyResults.reduce((sum, yr) => sum + yr.investmentReturn, 0)
    expect(result.summary.totalReturns).toBeCloseTo(manualSum, 2)
  })

  it('should calculate total tax paid by child', () => {
    const result = simulateDepotAufKind(summaryConfig)
    const manualSum = result.yearlyResults.reduce((sum, yr) => sum + yr.totalTax, 0)
    expect(result.summary.totalTaxPaidByChild).toBeCloseTo(manualSum, 2)
  })

  it('should calculate effective tax rates', () => {
    const result = simulateDepotAufKind(summaryConfig)
    expect(result.summary.effectiveTaxRateChild).toBeGreaterThan(0)
    expect(result.summary.effectiveTaxRateChild).toBeLessThan(1)
    expect(result.summary.effectiveTaxRateParent).toBeGreaterThan(result.summary.effectiveTaxRateChild)
  })

  it('should calculate average annual tax savings', () => {
    const result = simulateDepotAufKind(summaryConfig)
    const expectedAverage = result.summary.totalTaxSavings / summaryConfig.simulationYears
    expect(result.summary.averageAnnualTaxSavings).toBeCloseTo(expectedAverage, 2)
  })

  it('should show final depot value for child', () => {
    const result = simulateDepotAufKind(summaryConfig)
    expect(result.summary.finalDepotValue).toBeGreaterThan(summaryConfig.initialDepotValue)
  })

  it('should show child depot outperforms parent depot', () => {
    const result = simulateDepotAufKind(summaryConfig)
    expect(result.summary.finalDepotValue).toBeGreaterThan(result.summary.finalDepotValueIfParent)
  })
})

describe('simulateDepotAufKind - Edge Cases', () => {
  it('should handle zero return rate', () => {
    const config: DepotAufKindConfig = {
      childName: 'Zero',
      birthYear: 2010,
      initialDepotValue: 10000,
      expectedAnnualReturn: 0,
      assetType: 'savings_account',
      hasOtherIncome: false,
      otherAnnualIncome: 0,
      parentMarginalTaxRate: 0.30,
      simulationYears: 3,
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)
    result.yearlyResults.forEach((yearResult) => {
      expect(yearResult.investmentReturn).toBe(0)
      expect(yearResult.totalTax).toBe(0)
    })
  })

  it('should handle single year simulation', () => {
    const config: DepotAufKindConfig = {
      childName: 'OneYear',
      birthYear: 2015,
      initialDepotValue: 25000,
      expectedAnnualReturn: 0.04,
      assetType: 'mixed_fund',
      hasOtherIncome: false,
      otherAnnualIncome: 0,
      parentMarginalTaxRate: 0.35,
      simulationYears: 1,
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)
    expect(result.yearlyResults).toHaveLength(1)
    expect(result.yearlyResults[0].year).toBe(2024)
  })

  it('should handle very small depot values', () => {
    const config: DepotAufKindConfig = {
      childName: 'Small',
      birthYear: 2012,
      initialDepotValue: 100,
      expectedAnnualReturn: 0.05,
      assetType: 'equity_fund',
      hasOtherIncome: false,
      otherAnnualIncome: 0,
      parentMarginalTaxRate: 0.30,
      simulationYears: 5,
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)
    expect(result.yearlyResults).toHaveLength(5)
    // With small values, Sparerpauschbetrag should cover all taxes
    result.yearlyResults.forEach((yearResult) => {
      expect(yearResult.capitalGainsTaxAfterExemption).toBe(0)
    })
  })

  it('should handle very large depot values', () => {
    const config: DepotAufKindConfig = {
      childName: 'Large',
      birthYear: 2008,
      initialDepotValue: 500000,
      expectedAnnualReturn: 0.06,
      assetType: 'equity_fund',
      hasOtherIncome: false,
      otherAnnualIncome: 0,
      parentMarginalTaxRate: 0.42,
      simulationYears: 3,
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)
    expect(result.yearlyResults).toHaveLength(3)
    // With large values, Sparerpauschbetrag should be fully utilized
    result.yearlyResults.forEach((yearResult) => {
      expect(yearResult.sparerpauschbetragApplied).toBeLessThanOrEqual(1000)
      expect(yearResult.capitalGainsTaxAfterExemption).toBeGreaterThan(0)
    })
  })
})

describe('simulateDepotAufKind - Realistic Scenarios', () => {
  it('should handle typical middle-class family scenario', () => {
    const config: DepotAufKindConfig = {
      childName: 'Lena',
      birthYear: 2012,
      initialDepotValue: 40000,
      expectedAnnualReturn: 0.055, // 5.5% typical equity fund
      assetType: 'equity_fund',
      hasOtherIncome: false,
      otherAnnualIncome: 0,
      parentMarginalTaxRate: 0.35, // Middle-class tax rate
      simulationYears: 7, // Until age 19 (study start)
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)

    // Should show meaningful tax savings
    expect(result.summary.totalTaxSavings).toBeGreaterThan(1000)
    expect(result.summary.effectiveTaxRateChild).toBeLessThan(0.10) // <10% effective rate
    expect(result.summary.finalDepotValue).toBeGreaterThan(55000) // Significant growth
  })

  it('should handle high-income family scenario', () => {
    const config: DepotAufKindConfig = {
      childName: 'Maximilian',
      birthYear: 2010,
      initialDepotValue: 100000,
      expectedAnnualReturn: 0.06,
      assetType: 'equity_fund',
      hasOtherIncome: false,
      otherAnnualIncome: 0,
      parentMarginalTaxRate: 0.45, // Top tax bracket (Reichensteuer)
      simulationYears: 10,
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)

    // High-income families should see even greater tax savings
    expect(result.summary.totalTaxSavings).toBeGreaterThan(5000)
    expect(result.summary.effectiveTaxRateParent).toBeGreaterThan(0.08) // Adjusted - Vorabpauschale reduces effective rate
    expect(result.summary.effectiveTaxRateChild).toBeLessThan(0.15)
  })

  it('should handle apprenticeship scenario with income', () => {
    const config: DepotAufKindConfig = {
      childName: 'Jonas',
      birthYear: 2008,
      initialDepotValue: 30000,
      expectedAnnualReturn: 0.04,
      assetType: 'mixed_fund',
      hasOtherIncome: true,
      otherAnnualIncome: 10000, // Typical apprenticeship income
      parentMarginalTaxRate: 0.38,
      simulationYears: 3, // 3-year apprenticeship
      startYear: 2024,
    }

    const result = simulateDepotAufKind(config)

    // Even with other income, should still save on taxes
    expect(result.summary.totalTaxSavings).toBeGreaterThan(0)
    // Total income should stay below high tax brackets
    result.yearlyResults.forEach((yearResult) => {
      expect(yearResult.totalTaxableIncome).toBeLessThan(30000)
    })
  })
})
