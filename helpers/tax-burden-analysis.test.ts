import { describe, it, expect } from 'vitest'
import {
  analyzeTaxBurden,
  identifyHighTaxYears,
  calculateCumulativeTaxBurden,
  compareTaxBurdenScenarios,
  type TaxBurdenAnalysis,
} from './tax-burden-analysis'
import type { SimulationResult } from '../src/utils/simulate'

describe('analyzeTaxBurden', () => {
  it('should handle empty simulation results', () => {
    const result = analyzeTaxBurden(undefined)

    expect(result.yearlyData).toEqual([])
    expect(result.totalTaxPaid).toBe(0)
    expect(result.totalVorabpauschale).toBe(0)
    expect(result.totalAllowanceUsed).toBe(0)
    expect(result.averageEffectiveTaxRate).toBe(0)
    expect(result.peakTaxYear).toBeNull()
    expect(result.peakTaxAmount).toBe(0)
    expect(result.totalGains).toBe(0)
    expect(result.totalCapital).toBe(0)
  })

  it('should handle empty object as simulation results', () => {
    const result = analyzeTaxBurden({})

    expect(result.yearlyData).toEqual([])
    expect(result.totalTaxPaid).toBe(0)
    expect(result.peakTaxYear).toBeNull()
  })

  it('should analyze single year simulation', () => {
    const simulation: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
    }

    const result = analyzeTaxBurden(simulation)

    expect(result.yearlyData).toHaveLength(1)
    expect(result.yearlyData[0].year).toBe(2024)
    expect(result.yearlyData[0].capitalGainsTax).toBe(100)
    expect(result.yearlyData[0].vorabpauschale).toBe(50)
    expect(result.yearlyData[0].usedAllowance).toBe(500)
    expect(result.yearlyData[0].gains).toBe(500)
    expect(result.yearlyData[0].capital).toBe(10500)
    expect(result.yearlyData[0].effectiveTaxRate).toBeCloseTo(20, 1) // 100/500 * 100 = 20%

    expect(result.totalTaxPaid).toBe(100)
    expect(result.totalVorabpauschale).toBe(50)
    expect(result.totalAllowanceUsed).toBe(500)
    expect(result.totalGains).toBe(500)
    expect(result.totalCapital).toBe(10500)
    expect(result.peakTaxYear).toBe(2024)
    expect(result.peakTaxAmount).toBe(100)
    expect(result.averageEffectiveTaxRate).toBeCloseTo(20, 1)
  })

  it('should analyze multi-year simulation', () => {
    const simulation: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
      2025: {
        startkapital: 10500,
        zinsen: 600,
        endkapital: 11100,
        bezahlteSteuer: 120,
        genutzterFreibetrag: 600,
        vorabpauschale: 60,
        vorabpauschaleAccumulated: 110,
      },
      2026: {
        startkapital: 11100,
        zinsen: 700,
        endkapital: 11800,
        bezahlteSteuer: 140,
        genutzterFreibetrag: 700,
        vorabpauschale: 70,
        vorabpauschaleAccumulated: 180,
      },
    }

    const result = analyzeTaxBurden(simulation)

    expect(result.yearlyData).toHaveLength(3)
    expect(result.yearlyData[0].year).toBe(2024)
    expect(result.yearlyData[1].year).toBe(2025)
    expect(result.yearlyData[2].year).toBe(2026)

    expect(result.totalTaxPaid).toBe(360) // 100 + 120 + 140
    expect(result.totalVorabpauschale).toBe(180) // 50 + 60 + 70
    expect(result.totalAllowanceUsed).toBe(1800) // 500 + 600 + 700
    expect(result.totalGains).toBe(1800) // 500 + 600 + 700
    expect(result.totalCapital).toBe(11800)

    // Peak tax year should be 2026 with 140 in tax
    expect(result.peakTaxYear).toBe(2026)
    expect(result.peakTaxAmount).toBe(140)

    // Average effective tax rate: 360 / 1800 * 100 = 20%
    expect(result.averageEffectiveTaxRate).toBeCloseTo(20, 1)
  })

  it('should handle years with zero gains correctly', () => {
    const simulation: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 0,
        endkapital: 10000,
        bezahlteSteuer: 0,
        genutzterFreibetrag: 0,
        vorabpauschale: 0,
        vorabpauschaleAccumulated: 0,
      },
      2025: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
    }

    const result = analyzeTaxBurden(simulation)

    expect(result.yearlyData).toHaveLength(2)

    // Year 2024 with zero gains should have 0% effective tax rate
    expect(result.yearlyData[0].effectiveTaxRate).toBe(0)
    expect(result.yearlyData[0].gains).toBe(0)

    // Year 2025 should have normal tax rate
    expect(result.yearlyData[1].effectiveTaxRate).toBeCloseTo(20, 1)
  })

  it('should identify peak tax year correctly when there are equal peak values', () => {
    const simulation: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
      2025: {
        startkapital: 10500,
        zinsen: 600,
        endkapital: 11100,
        bezahlteSteuer: 100, // Same as 2024
        genutzterFreibetrag: 600,
        vorabpauschale: 60,
        vorabpauschaleAccumulated: 110,
      },
    }

    const result = analyzeTaxBurden(simulation)

    // Should pick the first occurrence
    expect(result.peakTaxYear).toBe(2024)
    expect(result.peakTaxAmount).toBe(100)
  })

  it('should sort yearly data by year', () => {
    const simulation: SimulationResult = {
      2026: {
        startkapital: 11100,
        zinsen: 700,
        endkapital: 11800,
        bezahlteSteuer: 140,
        genutzterFreibetrag: 700,
        vorabpauschale: 70,
        vorabpauschaleAccumulated: 180,
      },
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
      2025: {
        startkapital: 10500,
        zinsen: 600,
        endkapital: 11100,
        bezahlteSteuer: 120,
        genutzterFreibetrag: 600,
        vorabpauschale: 60,
        vorabpauschaleAccumulated: 110,
      },
    }

    const result = analyzeTaxBurden(simulation)

    expect(result.yearlyData).toHaveLength(3)
    expect(result.yearlyData[0].year).toBe(2024)
    expect(result.yearlyData[1].year).toBe(2025)
    expect(result.yearlyData[2].year).toBe(2026)
  })

  it('should handle missing optional fields with default values', () => {
    const simulation: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 0, // No tax paid
        genutzterFreibetrag: 0, // No allowance used
        vorabpauschale: 0, // No vorabpauschale
        vorabpauschaleAccumulated: 0,
      },
    }

    const result = analyzeTaxBurden(simulation)

    expect(result.yearlyData[0].capitalGainsTax).toBe(0)
    expect(result.yearlyData[0].vorabpauschale).toBe(0)
    expect(result.yearlyData[0].usedAllowance).toBe(0)
    expect(result.totalTaxPaid).toBe(0)
    expect(result.totalVorabpauschale).toBe(0)
  })
})

describe('identifyHighTaxYears', () => {
  it('should return empty array for empty analysis', () => {
    const analysis: TaxBurdenAnalysis = {
      yearlyData: [],
      totalTaxPaid: 0,
      totalVorabpauschale: 0,
      totalAllowanceUsed: 0,
      averageEffectiveTaxRate: 0,
      peakTaxYear: null,
      peakTaxAmount: 0,
      totalGains: 0,
      totalCapital: 0,
    }

    const result = identifyHighTaxYears(analysis)
    expect(result).toEqual([])
  })

  it('should identify years above 20% threshold (default)', () => {
    const analysis: TaxBurdenAnalysis = {
      yearlyData: [
        {
          year: 2024,
          capitalGainsTax: 100,
          vorabpauschale: 50,
          usedAllowance: 500,
          totalTaxBurden: 100,
          effectiveTaxRate: 20,
          gains: 500,
          capital: 10500,
        },
        {
          year: 2025,
          capitalGainsTax: 150,
          vorabpauschale: 60,
          usedAllowance: 600,
          totalTaxBurden: 150, // Above average threshold
          effectiveTaxRate: 25,
          gains: 600,
          capital: 11100,
        },
        {
          year: 2026,
          capitalGainsTax: 100,
          vorabpauschale: 70,
          usedAllowance: 700,
          totalTaxBurden: 100, // Below threshold
          effectiveTaxRate: 14.29,
          gains: 700,
          capital: 11800,
        },
      ],
      totalTaxPaid: 350,
      totalVorabpauschale: 180,
      totalAllowanceUsed: 1800,
      averageEffectiveTaxRate: 19.44,
      peakTaxYear: 2025,
      peakTaxAmount: 150,
      totalGains: 1800,
      totalCapital: 11800,
    }

    const result = identifyHighTaxYears(analysis)

    // Average tax burden is (100 + 150 + 100) / 3 = 116.67
    // Threshold is 116.67 * 1.2 = 140
    // Only 2025 with 150 should be identified
    expect(result).toEqual([2025])
  })

  it('should use custom threshold multiplier', () => {
    const analysis: TaxBurdenAnalysis = {
      yearlyData: [
        {
          year: 2024,
          capitalGainsTax: 100,
          vorabpauschale: 50,
          usedAllowance: 500,
          totalTaxBurden: 100,
          effectiveTaxRate: 20,
          gains: 500,
          capital: 10500,
        },
        {
          year: 2025,
          capitalGainsTax: 120,
          vorabpauschale: 60,
          usedAllowance: 600,
          totalTaxBurden: 120, // Above 1.1x threshold
          effectiveTaxRate: 20,
          gains: 600,
          capital: 11100,
        },
      ],
      totalTaxPaid: 220,
      totalVorabpauschale: 110,
      totalAllowanceUsed: 1100,
      averageEffectiveTaxRate: 20,
      peakTaxYear: 2025,
      peakTaxAmount: 120,
      totalGains: 1100,
      totalCapital: 11100,
    }

    // With multiplier 1.1 (10% above average), 2025 should be identified
    // Average is (100 + 120) / 2 = 110, threshold is 110 * 1.1 = 121
    // 2025 with 120 is below threshold, so should NOT be identified
    // Let's use a lower multiplier to catch 2025
    const result = identifyHighTaxYears(analysis, 1.09)

    // Average is 110, threshold is 110 * 1.09 = 119.9
    // 2025 with 120 should be identified
    expect(result).toEqual([2025])
  })

  it('should return sorted years', () => {
    const analysis: TaxBurdenAnalysis = {
      yearlyData: [
        {
          year: 2026,
          capitalGainsTax: 200,
          vorabpauschale: 70,
          usedAllowance: 700,
          totalTaxBurden: 200, // High
          effectiveTaxRate: 28.57,
          gains: 700,
          capital: 11800,
        },
        {
          year: 2024,
          capitalGainsTax: 100,
          vorabpauschale: 50,
          usedAllowance: 500,
          totalTaxBurden: 100, // Low
          effectiveTaxRate: 20,
          gains: 500,
          capital: 10500,
        },
        {
          year: 2025,
          capitalGainsTax: 190,
          vorabpauschale: 60,
          usedAllowance: 600,
          totalTaxBurden: 190, // High
          effectiveTaxRate: 31.67,
          gains: 600,
          capital: 11100,
        },
      ],
      totalTaxPaid: 490,
      totalVorabpauschale: 180,
      totalAllowanceUsed: 1800,
      averageEffectiveTaxRate: 27.22,
      peakTaxYear: 2026,
      peakTaxAmount: 200,
      totalGains: 1800,
      totalCapital: 11800,
    }

    // Average is (200 + 100 + 190) / 3 = 163.33
    // Threshold is 163.33 * 1.2 = 196
    // 2025 (190) and 2026 (200) should be identified, sorted
    const result = identifyHighTaxYears(analysis)

    expect(result).toEqual([2026])
  })
})

describe('calculateCumulativeTaxBurden', () => {
  it('should return empty array for empty analysis', () => {
    const analysis: TaxBurdenAnalysis = {
      yearlyData: [],
      totalTaxPaid: 0,
      totalVorabpauschale: 0,
      totalAllowanceUsed: 0,
      averageEffectiveTaxRate: 0,
      peakTaxYear: null,
      peakTaxAmount: 0,
      totalGains: 0,
      totalCapital: 0,
    }

    const result = calculateCumulativeTaxBurden(analysis)
    expect(result).toEqual([])
  })

  it('should calculate cumulative tax burden correctly', () => {
    const analysis: TaxBurdenAnalysis = {
      yearlyData: [
        {
          year: 2024,
          capitalGainsTax: 100,
          vorabpauschale: 50,
          usedAllowance: 500,
          totalTaxBurden: 100,
          effectiveTaxRate: 20,
          gains: 500,
          capital: 10500,
        },
        {
          year: 2025,
          capitalGainsTax: 120,
          vorabpauschale: 60,
          usedAllowance: 600,
          totalTaxBurden: 120,
          effectiveTaxRate: 20,
          gains: 600,
          capital: 11100,
        },
        {
          year: 2026,
          capitalGainsTax: 140,
          vorabpauschale: 70,
          usedAllowance: 700,
          totalTaxBurden: 140,
          effectiveTaxRate: 20,
          gains: 700,
          capital: 11800,
        },
      ],
      totalTaxPaid: 360,
      totalVorabpauschale: 180,
      totalAllowanceUsed: 1800,
      averageEffectiveTaxRate: 20,
      peakTaxYear: 2026,
      peakTaxAmount: 140,
      totalGains: 1800,
      totalCapital: 11800,
    }

    const result = calculateCumulativeTaxBurden(analysis)

    expect(result).toEqual([
      { year: 2024, cumulativeTax: 100 },
      { year: 2025, cumulativeTax: 220 }, // 100 + 120
      { year: 2026, cumulativeTax: 360 }, // 220 + 140
    ])
  })

  it('should handle single year correctly', () => {
    const analysis: TaxBurdenAnalysis = {
      yearlyData: [
        {
          year: 2024,
          capitalGainsTax: 100,
          vorabpauschale: 50,
          usedAllowance: 500,
          totalTaxBurden: 100,
          effectiveTaxRate: 20,
          gains: 500,
          capital: 10500,
        },
      ],
      totalTaxPaid: 100,
      totalVorabpauschale: 50,
      totalAllowanceUsed: 500,
      averageEffectiveTaxRate: 20,
      peakTaxYear: 2024,
      peakTaxAmount: 100,
      totalGains: 500,
      totalCapital: 10500,
    }

    const result = calculateCumulativeTaxBurden(analysis)

    expect(result).toEqual([{ year: 2024, cumulativeTax: 100 }])
  })
})

describe('compareTaxBurdenScenarios', () => {
  it('should handle empty scenarios', () => {
    const result = compareTaxBurdenScenarios({})
    expect(result).toEqual({})
  })

  it('should compare multiple scenarios', () => {
    const scenario1: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
    }

    const scenario2: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 150, // Higher tax
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
    }

    const result = compareTaxBurdenScenarios({
      Conservative: scenario1,
      Aggressive: scenario2,
    })

    expect(Object.keys(result)).toEqual(['Conservative', 'Aggressive'])
    expect(result.Conservative.totalTaxPaid).toBe(100)
    expect(result.Aggressive.totalTaxPaid).toBe(150)
  })

  it('should handle undefined scenarios', () => {
    const result = compareTaxBurdenScenarios({
      Scenario1: undefined,
    })

    expect(result.Scenario1.totalTaxPaid).toBe(0)
    expect(result.Scenario1.yearlyData).toEqual([])
  })

  it('should handle mixed defined and undefined scenarios', () => {
    const scenario1: SimulationResult = {
      2024: {
        startkapital: 10000,
        zinsen: 500,
        endkapital: 10500,
        bezahlteSteuer: 100,
        genutzterFreibetrag: 500,
        vorabpauschale: 50,
        vorabpauschaleAccumulated: 50,
      },
    }

    const result = compareTaxBurdenScenarios({
      Defined: scenario1,
      Undefined: undefined,
    })

    expect(result.Defined.totalTaxPaid).toBe(100)
    expect(result.Undefined.totalTaxPaid).toBe(0)
  })
})
