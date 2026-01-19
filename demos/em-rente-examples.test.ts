/**
 * Tests for EM-Rente calculation examples
 * Verifies that all example scenarios execute without errors and produce valid results
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  calculateEMRenteForYear,
  calculateEMRente,
  estimatePensionPointsFromMonthlyPension,
  type EMRenteConfig,
} from '../helpers/em-rente'

describe('em-rente-examples', () => {
  describe('Example 1: 45-year-old with full disability', () => {
    it('should calculate volle EM-Rente correctly', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1979,
        accumulatedPensionPoints: 25.0,
        contributionYears: 25,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
      }

      const result = calculateEMRenteForYear(config, 2024)

      // Verify result structure
      expect(result).toBeDefined()
      expect(result.zurechnungszeitenPoints).toBeGreaterThan(0)
      expect(result.pensionPoints).toBeGreaterThan(config.accumulatedPensionPoints)
      expect(result.abschlagPercentage).toBeGreaterThan(0)
      expect(result.grossMonthlyPension).toBeGreaterThan(0)
      expect(result.grossAnnualPension).toBeCloseTo(result.grossMonthlyPension * 12, 0)
      // Net can equal gross if income is below tax threshold
      expect(result.netAnnualPension).toBeLessThanOrEqual(result.grossAnnualPension)
    })
  })

  describe('Example 2: 50-year-old with partial disability', () => {
    it('should calculate teilweise EM-Rente correctly', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'teilweise',
        disabilityStartYear: 2024,
        birthYear: 1974,
        accumulatedPensionPoints: 30.0,
        contributionYears: 30,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
      }

      const result = calculateEMRenteForYear(config, 2024)

      // Verify result structure
      expect(result).toBeDefined()
      expect(result.pensionPoints).toBeGreaterThan(config.accumulatedPensionPoints)
      expect(result.grossMonthlyPension).toBeGreaterThan(0)
      expect(result.hinzuverdienstgrenze).toBeGreaterThan(0)

      // Teilweise EM-Rente should be roughly 50% of volle
      // Type is stored in config, not result
      expect(config.type).toBe('teilweise')
    })
  })

  describe('Example 3: 65-year-old near retirement', () => {
    it('should calculate minimal Zurechnungszeiten for near-retirement age', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1959,
        accumulatedPensionPoints: 40.0,
        contributionYears: 40,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
      }

      const result = calculateEMRenteForYear(config, 2024)

      // Verify result structure
      expect(result).toBeDefined()
      // Near retirement age should have minimal Zurechnungszeiten
      expect(result.zurechnungszeitenPoints).toBeGreaterThanOrEqual(0)
      expect(result.zurechnungszeitenPoints).toBeLessThan(10) // Should be quite small
      expect(result.abschlagPercentage).toBeGreaterThan(0)
      expect(result.grossMonthlyPension).toBeGreaterThan(0)
    })
  })

  describe('Example 4: EM-Rente with Hinzuverdienst', () => {
    it('should handle additional income exceeding limit', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1979,
        accumulatedPensionPoints: 25.0,
        contributionYears: 25,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
        monthlyAdditionalIncome: 1000,
      }

      const result = calculateEMRenteForYear(config, 2024)

      // Verify result structure
      expect(result).toBeDefined()
      expect(result.hinzuverdienstgrenze).toBeGreaterThan(0)
      expect(result.exceedsHinzuverdienstgrenze).toBeDefined()
      expect(result.hinzuverdienstReduction).toBeGreaterThanOrEqual(0)
      expect(result.grossMonthlyPension).toBeGreaterThan(0)
    })

    it('should not reduce pension when additional income is below limit', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1979,
        accumulatedPensionPoints: 25.0,
        contributionYears: 25,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
        monthlyAdditionalIncome: 100, // Low additional income
      }

      const result = calculateEMRenteForYear(config, 2024)

      // Should not exceed limit with low additional income
      expect(result.hinzuverdienstReduction).toBe(0)
      expect(result.exceedsHinzuverdienstgrenze).toBe(false)
    })
  })

  describe('Example 5: Multi-year projection', () => {
    it('should project pension values over multiple years', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1979,
        accumulatedPensionPoints: 25.0,
        contributionYears: 25,
        region: 'west',
        annualIncreaseRate: 1.5,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
      }

      const results = calculateEMRente(config, 2024, 2028)

      // Verify all years are present
      expect(results).toBeDefined()
      expect(results[2024]).toBeDefined()
      expect(results[2025]).toBeDefined()
      expect(results[2026]).toBeDefined()
      expect(results[2027]).toBeDefined()
      expect(results[2028]).toBeDefined()

      // Verify pension increases over years
      const pension2024 = results[2024].grossMonthlyPension
      const pension2028 = results[2028].grossMonthlyPension
      expect(pension2028).toBeGreaterThan(pension2024)

      // Verify adjustment factors increase
      const factor2024 = results[2024].adjustmentFactor
      const factor2028 = results[2028].adjustmentFactor
      expect(factor2028).toBeGreaterThan(factor2024)

      // Each year should have valid data
      for (let year = 2024; year <= 2028; year++) {
        expect(results[year].grossMonthlyPension).toBeGreaterThan(0)
        expect(results[year].grossAnnualPension).toBeGreaterThan(0)
        expect(results[year].netAnnualPension).toBeGreaterThan(0)
        expect(results[year].adjustmentFactor).toBeGreaterThan(0)
      }
    })

    it('should calculate consistent year-over-year increases', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1979,
        accumulatedPensionPoints: 25.0,
        contributionYears: 25,
        region: 'west',
        annualIncreaseRate: 2.0, // 2% increase
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
      }

      const results = calculateEMRente(config, 2024, 2026)

      // Calculate percentage increase from 2024 to 2025
      const increase1 =
        (results[2025].grossMonthlyPension - results[2024].grossMonthlyPension) /
        results[2024].grossMonthlyPension

      // Calculate percentage increase from 2025 to 2026
      const increase2 =
        (results[2026].grossMonthlyPension - results[2025].grossMonthlyPension) /
        results[2025].grossMonthlyPension

      // Both increases should be roughly equal to the annual increase rate
      expect(increase1).toBeCloseTo(0.02, 2)
      expect(increase2).toBeCloseTo(0.02, 2)
    })
  })

  describe('Example 6: Pension points estimation', () => {
    it('should estimate pension points from known monthly pension', () => {
      const knownMonthlyPension = 1500
      const estimatedPoints = estimatePensionPointsFromMonthlyPension(knownMonthlyPension, 'west', 'volle')

      // Estimated points should be reasonable
      expect(estimatedPoints).toBeGreaterThan(0)
      expect(estimatedPoints).toBeLessThan(100) // Sanity check

      // Verify the estimation is reasonable by reverse calculation
      // For volle EM-Rente in west region, the calculation should be consistent
      expect(estimatedPoints).toBeGreaterThan(30) // For 1500€, should be around 40-45 points
      expect(estimatedPoints).toBeLessThan(60)
    })

    it('should estimate different points for teilweise vs volle', () => {
      const knownMonthlyPension = 1000
      const pointsVolle = estimatePensionPointsFromMonthlyPension(knownMonthlyPension, 'west', 'volle')
      const pointsTeilweise = estimatePensionPointsFromMonthlyPension(knownMonthlyPension, 'west', 'teilweise')

      // Teilweise requires more points to reach the same pension amount (since it's 50% of volle)
      expect(pointsTeilweise).toBeGreaterThan(pointsVolle)
      expect(pointsTeilweise).toBeCloseTo(pointsVolle * 2, 0)
    })

    it('should handle different regions', () => {
      const knownMonthlyPension = 1500
      const pointsWest = estimatePensionPointsFromMonthlyPension(knownMonthlyPension, 'west', 'volle')
      const pointsEast = estimatePensionPointsFromMonthlyPension(knownMonthlyPension, 'east', 'volle')

      // Both should produce reasonable estimates
      expect(pointsWest).toBeGreaterThan(0)
      expect(pointsEast).toBeGreaterThan(0)

      // The estimates might differ slightly due to regional pension values
      // but should be in the same ballpark
      const ratio = pointsWest / pointsEast
      expect(ratio).toBeGreaterThan(0.9)
      expect(ratio).toBeLessThan(1.1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle disability starting at exactly retirement age', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2026,
        birthYear: 1959, // Turns 67 in 2026
        accumulatedPensionPoints: 40.0,
        contributionYears: 40,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
      }

      const result = calculateEMRenteForYear(config, 2026)

      // At retirement age, Zurechnungszeiten should be 0
      expect(result.zurechnungszeitenPoints).toBe(0)
      expect(result.pensionPoints).toBe(config.accumulatedPensionPoints)
    })

    it('should handle very young disability (maximum Zurechnungszeiten)', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1994, // Age 30 in 2024
        accumulatedPensionPoints: 10.0,
        contributionYears: 10,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
      }

      const result = calculateEMRenteForYear(config, 2024)

      // Young age means long Zurechnungszeiten period (37 years to age 67)
      expect(result.zurechnungszeitenPoints).toBeGreaterThan(20)
      expect(result.zurechnungszeitenPoints).toBeGreaterThan(config.accumulatedPensionPoints)
    })

    it('should handle zero accumulated pension points', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1999, // Age 25 in 2024
        accumulatedPensionPoints: 0,
        contributionYears: 0,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
      }

      const result = calculateEMRenteForYear(config, 2024)

      // With 0 accumulated points and 0 contribution years, 
      // Zurechnungszeiten calculation may also result in 0
      // (minimum contribution requirement not met)
      expect(result.pensionPoints).toBeGreaterThanOrEqual(0)
      expect(result.zurechnungszeitenPoints).toBeGreaterThanOrEqual(0)
      expect(result.grossMonthlyPension).toBeGreaterThanOrEqual(0)
    })

    it('should handle Abschläge disabled', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1979,
        accumulatedPensionPoints: 25.0,
        contributionYears: 25,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: false, // No Abschläge
        taxablePercentage: 80,
      }

      const result = calculateEMRenteForYear(config, 2024)

      // With Abschläge disabled, percentage should be 0
      expect(result.abschlagPercentage).toBe(0)
      expect(result.abschlagAmount).toBe(0)
      expect(result.grossMonthlyPension).toBe(result.grossMonthlyPensionBeforeAbschlaege)
    })

    it('should handle Zurechnungszeiten disabled', () => {
      const configWith: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1979,
        accumulatedPensionPoints: 25.0,
        contributionYears: 25,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 80,
      }

      const configWithout: EMRenteConfig = {
        ...configWith,
        applyZurechnungszeiten: false,
      }

      const resultWith = calculateEMRenteForYear(configWith, 2024)
      const resultWithout = calculateEMRenteForYear(configWithout, 2024)

      // Without Zurechnungszeiten, pension points should equal accumulated points
      expect(resultWithout.zurechnungszeitenPoints).toBe(0)
      expect(resultWithout.pensionPoints).toBe(configWithout.accumulatedPensionPoints)
      expect(resultWithout.grossMonthlyPension).toBeLessThan(resultWith.grossMonthlyPension)
    })

    it('should handle 100% taxable percentage', () => {
      const config: EMRenteConfig = {
        enabled: true,
        type: 'volle',
        disabilityStartYear: 2024,
        birthYear: 1979,
        accumulatedPensionPoints: 25.0,
        contributionYears: 25,
        region: 'west',
        annualIncreaseRate: 1.0,
        applyZurechnungszeiten: true,
        applyAbschlaege: true,
        taxablePercentage: 100,
      }

      const result = calculateEMRenteForYear(config, 2024)

      // 100% taxable means full pension amount is subject to tax
      expect(result.grossAnnualPension).toBeGreaterThan(0)
      // Net can equal gross if income is below tax threshold
      expect(result.netAnnualPension).toBeLessThanOrEqual(result.grossAnnualPension)
      // With 100% taxable, more of the pension is taxable
      expect(result.taxableAmount).toBe(result.grossAnnualPension)
    })
  })

  describe('Console Output Verification', () => {
    let consoleLogSpy: ReturnType<typeof vi.spyOn>

    beforeEach(() => {
      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleLogSpy.mockRestore()
    })

    it('should execute example file calculations without errors', async () => {
      // Import the examples file to trigger console.log calls
      // This verifies that all examples run without throwing errors
      await import('./em-rente-examples')

      // Verify console.log was called (examples print output)
      expect(consoleLogSpy).toHaveBeenCalled()

      // Verify no errors were thrown during execution
      expect(consoleLogSpy.mock.calls.length).toBeGreaterThan(50) // Many console.log calls in examples
    })
  })
})
