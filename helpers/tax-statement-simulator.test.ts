/**
 * Tests for Tax Statement Simulator
 */

import { describe, it, expect } from 'vitest'
import {
  generateTaxStatement,
  generateMultiYearTaxStatements,
  exportForTaxFiling,
  type TaxStatementConfig,
} from './tax-statement-simulator'
import type { SimulationResult } from '../src/utils/simulate'

describe('Tax Statement Simulator', () => {
  const defaultConfig: TaxStatementConfig = {
    capitalGainsTaxRate: 0.26375, // 25% + 5.5% Soli
    annualAllowance: 1000,
    partialExemptionRate: 0.3, // 30% for equity funds
    churchTaxActive: false,
  }

  const createMockSimulationResult = (
    year: number,
    zinsen: number,
    startkapital: number,
    endkapital: number,
    vorabpauschale: number,
    genutzterFreibetrag: number,
    bezahlteSteuer: number,
  ): SimulationResult => ({
    [year]: {
      zinsen,
      startkapital,
      endkapital,
      vorabpauschale,
      genutzterFreibetrag,
      bezahlteSteuer,
      vorabpauschaleAccumulated: vorabpauschale,
    },
  })

  describe('generateTaxStatement', () => {
    it('should generate a basic tax statement for a year', () => {
      const simulationResult = createMockSimulationResult(
        2024,
        1000, // zinsen (capital gains)
        10000, // startkapital
        11000, // endkapital
        50, // vorabpauschale
        700, // genutzterFreibetrag
        0, // bezahlteSteuer
      )

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)

      expect(statement).toBeDefined()
      expect(statement?.year).toBe(2024)
      expect(statement?.totalCapitalGains).toBe(1000)
      expect(statement?.vorabpauschale).toBe(50)
      expect(statement?.usedAllowance).toBe(700)
      expect(statement?.remainingAllowance).toBe(300) // 1000 - 700
      expect(statement?.startingCapital).toBe(10000)
      expect(statement?.endingCapital).toBe(11000)
    })

    it('should apply partial exemption correctly', () => {
      const simulationResult = createMockSimulationResult(2024, 1000, 10000, 11000, 50, 0, 0)

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)

      // With 30% partial exemption, taxable gains = 1000 * 0.7 = 700
      // All 700 is taxable (no allowance used yet)
      expect(statement?.taxableAmount).toBe(700)
    })

    it('should calculate remaining allowance correctly when partially used', () => {
      const simulationResult = createMockSimulationResult(2024, 1000, 10000, 11000, 50, 600, 0)

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)

      expect(statement?.usedAllowance).toBe(600)
      expect(statement?.remainingAllowance).toBe(400) // 1000 - 600
    })

    it('should handle case where allowance fully used', () => {
      const simulationResult = createMockSimulationResult(2024, 1000, 10000, 11000, 50, 1000, 0)

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)

      expect(statement?.usedAllowance).toBe(1000)
      expect(statement?.remainingAllowance).toBe(0)
    })

    it('should return null for year not in simulation', () => {
      const simulationResult = createMockSimulationResult(2024, 1000, 10000, 11000, 50, 0, 0)

      const statement = generateTaxStatement(simulationResult, 2025, defaultConfig)

      expect(statement).toBeNull()
    })

    it('should calculate tax components correctly', () => {
      const simulationResult = createMockSimulationResult(2024, 2000, 10000, 12000, 100, 400, 0)

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)

      // Total gains: 2000
      // After partial exemption (30%): 2000 * 0.7 = 1400
      // After allowance (400): 1400 - 400 = 1000 taxable
      // Base tax (25%): 1000 * 0.25 = 250
      // Soli (5.5%): 250 * 0.055 = 13.75
      // Total capital gains tax: 250 + 13.75 = 263.75

      expect(statement?.taxableAmount).toBe(1000)
      expect(statement?.capitalGainsTax).toBeCloseTo(263.75, 2)
      expect(statement?.solidaritySurcharge).toBeCloseTo(13.75, 2)
    })

    it('should handle church tax when active', () => {
      const configWithChurch: TaxStatementConfig = {
        ...defaultConfig,
        churchTaxActive: true,
        churchTaxRate: 0.09, // 9%
      }

      const simulationResult = createMockSimulationResult(2024, 2000, 10000, 12000, 100, 0, 0)

      const statement = generateTaxStatement(simulationResult, 2024, configWithChurch)

      // Taxable amount after partial exemption and no allowance: 2000 * 0.7 = 1400
      // Base tax: 1400 * 0.25 = 350
      // Church tax: 350 * 0.09 = 31.5

      expect(statement?.churchTax).toBeDefined()
      expect(statement?.churchTax).toBeCloseTo(31.5, 2)
    })

    it('should not include church tax when inactive', () => {
      const simulationResult = createMockSimulationResult(2024, 2000, 10000, 12000, 100, 0, 0)

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)

      expect(statement?.churchTax).toBeUndefined()
    })

    it('should handle zero capital gains', () => {
      const simulationResult = createMockSimulationResult(2024, 0, 10000, 10000, 0, 0, 0)

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)

      expect(statement?.totalCapitalGains).toBe(0)
      expect(statement?.taxableAmount).toBe(0)
      expect(statement?.capitalGainsTax).toBe(0)
      expect(statement?.solidaritySurcharge).toBe(0)
      expect(statement?.usedAllowance).toBe(0)
      expect(statement?.remainingAllowance).toBe(1000)
    })

    it('should handle negative capital gains (losses)', () => {
      const simulationResult = createMockSimulationResult(2024, -500, 10000, 9500, 0, 0, 0)

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)

      expect(statement?.totalCapitalGains).toBe(-500)
      expect(statement?.taxableAmount).toBe(0) // No taxable amount with losses
      expect(statement?.capitalGainsTax).toBe(0)
    })

    it('should include loss carryforward information when available', () => {
      const simulationResult: SimulationResult = {
        2024: {
          zinsen: 1000,
          startkapital: 10000,
          endkapital: 11000,
          vorabpauschale: 50,
          genutzterFreibetrag: 0,
          bezahlteSteuer: 184.625,
          vorabpauschaleAccumulated: 50,
          lossAccountState: {
            stockLosses: 500,
            otherLosses: 200,
            year: 2024,
          },
          lossOffsetDetails: {
            capitalGainsBeforeOffset: 1000,
            stockGains: 700,
            otherGains: 300,
            vorabpauschale: 50,
            stockLossesUsed: 100,
            otherLossesUsed: 50,
            totalLossesUsed: 150,
            taxableIncomeAfterOffset: 700,
            taxSavings: 39.5625,
            remainingLosses: {
              stockLosses: 500,
              otherLosses: 200,
              year: 2024,
            },
          },
        },
      }

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)

      expect(statement?.lossCarryforwardPreviousYear).toBeDefined()
      expect(statement?.lossCarryforwardNextYear).toBeDefined()
      expect(statement?.realizedLosses).toBe(150)
    })
  })

  describe('generateMultiYearTaxStatements', () => {
    it('should generate statements for multiple years', () => {
      const simulationResult: SimulationResult = {
        2024: {
          zinsen: 1000,
          startkapital: 10000,
          endkapital: 11000,
          vorabpauschale: 50,
          genutzterFreibetrag: 700,
          bezahlteSteuer: 0,
          vorabpauschaleAccumulated: 50,
        },
        2025: {
          zinsen: 1200,
          startkapital: 11000,
          endkapital: 12200,
          vorabpauschale: 60,
          genutzterFreibetrag: 840,
          bezahlteSteuer: 0,
          vorabpauschaleAccumulated: 110,
        },
        2026: {
          zinsen: 1500,
          startkapital: 12200,
          endkapital: 13700,
          vorabpauschale: 70,
          genutzterFreibetrag: 1000,
          bezahlteSteuer: 78.3125,
          vorabpauschaleAccumulated: 180,
        },
      }

      const statements = generateMultiYearTaxStatements(simulationResult, [2024, 2025, 2026], defaultConfig)

      expect(statements).toHaveLength(3)
      expect(statements[0].year).toBe(2024)
      expect(statements[1].year).toBe(2025)
      expect(statements[2].year).toBe(2026)
    })

    it('should skip years not in simulation', () => {
      const simulationResult: SimulationResult = {
        2024: {
          zinsen: 1000,
          startkapital: 10000,
          endkapital: 11000,
          vorabpauschale: 50,
          genutzterFreibetrag: 700,
          bezahlteSteuer: 0,
          vorabpauschaleAccumulated: 50,
        },
        2026: {
          zinsen: 1500,
          startkapital: 12200,
          endkapital: 13700,
          vorabpauschale: 70,
          genutzterFreibetrag: 1000,
          bezahlteSteuer: 78.3125,
          vorabpauschaleAccumulated: 120,
        },
      }

      const statements = generateMultiYearTaxStatements(simulationResult, [2024, 2025, 2026], defaultConfig)

      expect(statements).toHaveLength(2) // Only 2024 and 2026
      expect(statements[0].year).toBe(2024)
      expect(statements[1].year).toBe(2026)
    })

    it('should handle empty year array', () => {
      const simulationResult = createMockSimulationResult(2024, 1000, 10000, 11000, 50, 0, 0)

      const statements = generateMultiYearTaxStatements(simulationResult, [], defaultConfig)

      expect(statements).toHaveLength(0)
    })
  })

  describe('exportForTaxFiling', () => {
    it('should export tax statement in filing format', () => {
      const simulationResult = createMockSimulationResult(2024, 2000, 10000, 12000, 100, 400, 263.75)

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)
      expect(statement).toBeDefined()

      const exportData = exportForTaxFiling(statement!)

      expect(exportData.year).toBe(2024)
      expect(exportData.line7_capitalGains).toBe(2000)
      expect(exportData.line8_allowanceUsed).toBe(400)
      expect(exportData.vorabpauschaleInfo).toBe(100)
    })

    it('should include church tax in export when applicable', () => {
      const configWithChurch: TaxStatementConfig = {
        ...defaultConfig,
        churchTaxActive: true,
        churchTaxRate: 0.09,
      }

      const simulationResult = createMockSimulationResult(2024, 2000, 10000, 12000, 100, 0, 0)

      const statement = generateTaxStatement(simulationResult, 2024, configWithChurch)
      expect(statement).toBeDefined()

      const exportData = exportForTaxFiling(statement!)

      expect(exportData.line11_churchTax).toBeDefined()
      expect(exportData.line11_churchTax).toBeGreaterThan(0)
    })

    it('should not include church tax in export when not active', () => {
      const simulationResult = createMockSimulationResult(2024, 2000, 10000, 12000, 100, 0, 0)

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)
      expect(statement).toBeDefined()

      const exportData = exportForTaxFiling(statement!)

      expect(exportData.line11_churchTax).toBeUndefined()
    })
  })

  describe('Real-world scenarios', () => {
    it('should handle typical investment year with moderate gains', () => {
      // Scenario: 100,000€ investment, 5% return, 30% partial exemption
      const simulationResult = createMockSimulationResult(
        2024,
        5000, // 5% return
        100000,
        105000,
        245.5, // Vorabpauschale based on typical Basiszins
        1000, // Full allowance used
        789.375, // Tax paid
      )

      const statement = generateTaxStatement(simulationResult, 2024, defaultConfig)

      expect(statement?.totalCapitalGains).toBe(5000)
      expect(statement?.usedAllowance).toBe(1000)
      expect(statement?.taxableAmount).toBeCloseTo(2500, 0) // 5000 * 0.7 - 1000
      expect(statement?.totalTaxPaid).toBeCloseTo(789.375, 2)
    })

    it('should handle couple with higher allowance', () => {
      const coupleConfig: TaxStatementConfig = {
        ...defaultConfig,
        annualAllowance: 2000, // Couple allowance
      }

      const simulationResult = createMockSimulationResult(2024, 3000, 100000, 103000, 150, 2000, 263.75)

      const statement = generateTaxStatement(simulationResult, 2024, coupleConfig)

      expect(statement?.usedAllowance).toBe(2000)
      expect(statement?.remainingAllowance).toBe(0)
      expect(statement?.taxableAmount).toBeCloseTo(100, 0) // 3000 * 0.7 - 2000
    })
  })
})
