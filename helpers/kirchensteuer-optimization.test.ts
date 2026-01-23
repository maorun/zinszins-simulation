import { describe, it, expect } from 'vitest'
import {
  calculateYearlyKirchensteuer,
  compareKirchensteuerImpact,
  simulateSperrvermerk,
  calculateEffectiveTaxRate,
  validateKirchensteuerConfig,
  type KirchensteuerConfig,
} from './kirchensteuer-optimization'

describe('kirchensteuer-optimization', () => {
  const defaultConfig: KirchensteuerConfig = {
    kirchensteuerAktiv: true,
    kirchensteuersatz: 9,
    kapitalertragsteuer: 26.375,
    teilfreistellungsquote: 30,
  }

  describe('calculateYearlyKirchensteuer', () => {
    it('should calculate church tax correctly for a single year', () => {
      const result = calculateYearlyKirchensteuer(2024, 10000, defaultConfig)

      expect(result.jahr).toBe(2024)
      expect(result.kapitalertrag).toBe(10000)
      expect(result.teilfreigestellterErtrag).toBe(7000) // 10000 * (1 - 0.3)
      expect(result.steuerpflichtigerErtrag).toBe(7000)

      // Abgeltungsteuer: 7000 * 0.26375 = 1846.25
      expect(result.kapitalertragsteuerBetrag).toBeCloseTo(1846.25, 2)

      // Kirchensteuer: (7000 * 0.25) * 0.09 = 157.5
      expect(result.kirchensteuerBetrag).toBeCloseTo(157.5, 2)

      // Total tax: 1846.25 + 157.5 = 2003.75
      expect(result.gesamtsteuer).toBeCloseTo(2003.75, 2)

      // Net gains: 10000 - 2003.75 = 7996.25
      expect(result.nettoertrag).toBeCloseTo(7996.25, 2)
    })

    it('should not calculate church tax when kirchensteuerAktiv is false', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        kirchensteuerAktiv: false,
      }

      const result = calculateYearlyKirchensteuer(2024, 10000, config)

      expect(result.kirchensteuerBetrag).toBe(0)
      expect(result.gesamtsteuer).toBeCloseTo(1846.25, 2) // Only Abgeltungsteuer
      expect(result.nettoertrag).toBeCloseTo(8153.75, 2) // 10000 - 1846.25
    })

    it('should handle 8% church tax rate (Bavaria, Baden-Württemberg)', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        kirchensteuersatz: 8,
      }

      const result = calculateYearlyKirchensteuer(2024, 10000, config)

      // Kirchensteuer: (7000 * 0.25) * 0.08 = 140
      expect(result.kirchensteuerBetrag).toBeCloseTo(140, 2)

      // Total tax: 1846.25 + 140 = 1986.25
      expect(result.gesamtsteuer).toBeCloseTo(1986.25, 2)
    })

    it('should handle zero capital gains', () => {
      const result = calculateYearlyKirchensteuer(2024, 0, defaultConfig)

      expect(result.kapitalertrag).toBe(0)
      expect(result.gesamtsteuer).toBe(0)
      expect(result.nettoertrag).toBe(0)
    })

    it('should handle no partial exemption (0% Teilfreistellung)', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        teilfreistellungsquote: 0,
      }

      const result = calculateYearlyKirchensteuer(2024, 10000, config)

      expect(result.teilfreigestellterErtrag).toBe(10000) // No exemption
      expect(result.steuerpflichtigerErtrag).toBe(10000)

      // Kirchensteuer: (10000 * 0.25) * 0.09 = 225
      expect(result.kirchensteuerBetrag).toBeCloseTo(225, 2)
    })
  })

  describe('compareKirchensteuerImpact', () => {
    it('should compare impact over multiple years', () => {
      const yearlyGains = [
        { jahr: 2024, kapitalertrag: 10000 },
        { jahr: 2025, kapitalertrag: 12000 },
        { jahr: 2026, kapitalertrag: 15000 },
      ]

      const comparison = compareKirchensteuerImpact(yearlyGains, defaultConfig)

      // Verify with church tax
      expect(comparison.mitKirchensteuer.yearlyResults).toHaveLength(3)
      expect(comparison.mitKirchensteuer.gesamtsteuer).toBeGreaterThan(0)

      // Verify without church tax
      expect(comparison.ohneKirchensteuer.yearlyResults).toHaveLength(3)
      expect(comparison.ohneKirchensteuer.gesamtsteuer).toBeGreaterThan(0)

      // Verify additional burden
      expect(comparison.mehrbelastung).toBeGreaterThan(0)
      expect(comparison.mehrbelastung).toBe(
        comparison.mitKirchensteuer.gesamtsteuer - comparison.ohneKirchensteuer.gesamtsteuer,
      )

      // Verify percentage calculation
      const totalGains = 37000 // 10000 + 12000 + 15000
      expect(comparison.mehrbelastungProzent).toBeCloseTo((comparison.mehrbelastung / totalGains) * 100, 2)
    })

    it('should show higher net earnings without church tax', () => {
      const yearlyGains = [{ jahr: 2024, kapitalertrag: 10000 }]

      const comparison = compareKirchensteuerImpact(yearlyGains, defaultConfig)

      expect(comparison.ohneKirchensteuer.nettoertrag).toBeGreaterThan(comparison.mitKirchensteuer.nettoertrag)
    })

    it('should handle empty yearly gains array', () => {
      const comparison = compareKirchensteuerImpact([], defaultConfig)

      expect(comparison.mitKirchensteuer.gesamtsteuer).toBe(0)
      expect(comparison.ohneKirchensteuer.gesamtsteuer).toBe(0)
      expect(comparison.mehrbelastung).toBe(0)
      expect(comparison.mehrbelastungProzent).toBe(0)
    })

    it('should calculate percentage burden correctly for realistic scenario', () => {
      // Realistic 20-year investment scenario
      const yearlyGains = Array.from({ length: 20 }, (_, i) => ({
        jahr: 2024 + i,
        kapitalertrag: 5000 + i * 100, // Growing gains
      }))

      const comparison = compareKirchensteuerImpact(yearlyGains, defaultConfig)

      // Additional burden should be around 1.5-2% of total gains
      expect(comparison.mehrbelastungProzent).toBeGreaterThan(1)
      expect(comparison.mehrbelastungProzent).toBeLessThan(3)
    })
  })

  describe('simulateSperrvermerk', () => {
    it('should simulate Sperrvermerk correctly', () => {
      const simulation = simulateSperrvermerk(10000, defaultConfig)

      // Tax liability is the same with or without Sperrvermerk
      expect(simulation.automatischeAbfuehrung.gesamtsteuer).toBe(simulation.mitSperrvermerk.gesamtsteuer)
      expect(simulation.automatischeAbfuehrung.nettoertrag).toBe(simulation.mitSperrvermerk.nettoertrag)

      // Manual payment equals church tax amount
      expect(simulation.mitSperrvermerk.manuelleZahlung).toBeGreaterThan(0)

      // Hint should be provided
      expect(simulation.hinweis).toContain('Sperrvermerk')
      expect(simulation.hinweis).toContain('automatische')
    })

    it('should show no manual payment when church tax is disabled', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        kirchensteuerAktiv: false,
      }

      const simulation = simulateSperrvermerk(10000, config)

      expect(simulation.mitSperrvermerk.manuelleZahlung).toBe(0)
    })

    it('should calculate manual payment equal to church tax', () => {
      const simulation = simulateSperrvermerk(10000, defaultConfig)
      const result = calculateYearlyKirchensteuer(new Date().getFullYear(), 10000, defaultConfig)

      expect(simulation.mitSperrvermerk.manuelleZahlung).toBeCloseTo(result.kirchensteuerBetrag, 2)
    })
  })

  describe('calculateEffectiveTaxRate', () => {
    it('should calculate effective tax rate with church tax', () => {
      const effectiveRate = calculateEffectiveTaxRate(defaultConfig)

      // Base: 25% + Soli: 1.375% + Kirchensteuer: ~2.25% = ~28.625%
      expect(effectiveRate).toBeCloseTo(28.625, 2)
    })

    it('should calculate effective tax rate without church tax', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        kirchensteuerAktiv: false,
      }

      const effectiveRate = calculateEffectiveTaxRate(config)

      // Base: 25% + Soli: 1.375% = 26.375%
      expect(effectiveRate).toBeCloseTo(26.375, 2)
    })

    it('should handle 8% church tax rate', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        kirchensteuersatz: 8,
      }

      const effectiveRate = calculateEffectiveTaxRate(config)

      // Base: 25% + Soli: 1.375% + Kirchensteuer: 2% = 28.375%
      expect(effectiveRate).toBeCloseTo(28.375, 2)
    })
  })

  describe('validateKirchensteuerConfig', () => {
    it('should validate correct configuration', () => {
      const validation = validateKirchensteuerConfig(defaultConfig)

      expect(validation.valid).toBe(true)
      expect(validation.errors).toHaveLength(0)
    })

    it('should reject invalid church tax rate', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        kirchensteuersatz: 10, // Invalid: must be 8 or 9
      }

      const validation = validateKirchensteuerConfig(config)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toHaveLength(1)
      expect(validation.errors[0]).toContain('Kirchensteuersatz')
    })

    it('should reject invalid capital gains tax rate', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        kapitalertragsteuer: 35, // Too high
      }

      const validation = validateKirchensteuerConfig(config)

      expect(validation.valid).toBe(false)
      expect(validation.errors[0]).toContain('Kapitalertragsteuer')
    })

    it('should reject invalid partial exemption rate', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        teilfreistellungsquote: 150, // Out of range
      }

      const validation = validateKirchensteuerConfig(config)

      expect(validation.valid).toBe(false)
      expect(validation.errors[0]).toContain('Teilfreistellungsquote')
    })

    it('should accumulate multiple errors', () => {
      const config: KirchensteuerConfig = {
        kirchensteuerAktiv: true,
        kirchensteuersatz: 15, // Invalid
        kapitalertragsteuer: 50, // Invalid
        teilfreistellungsquote: 200, // Invalid
      }

      const validation = validateKirchensteuerConfig(config)

      expect(validation.valid).toBe(false)
      expect(validation.errors).toHaveLength(3)
    })

    it('should validate Bavaria/Baden-Württemberg rate (8%)', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        kirchensteuersatz: 8,
      }

      const validation = validateKirchensteuerConfig(config)

      expect(validation.valid).toBe(true)
    })

    it('should validate other states rate (9%)', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        kirchensteuersatz: 9,
      }

      const validation = validateKirchensteuerConfig(config)

      expect(validation.valid).toBe(true)
    })
  })

  describe('integration tests', () => {
    it('should calculate realistic long-term impact', () => {
      // 30-year investment with growing capital gains
      const yearlyGains = Array.from({ length: 30 }, (_, i) => ({
        jahr: 2024 + i,
        kapitalertrag: 3000 + i * 200, // Growing from 3k to 8.8k
      }))

      const comparison = compareKirchensteuerImpact(yearlyGains, defaultConfig)

      // Total gains should be significant
      const totalGains = yearlyGains.reduce((sum, { kapitalertrag }) => sum + kapitalertrag, 0)
      expect(totalGains).toBeGreaterThan(150000)

      // Additional burden should be around 1.5-2% of total gains
      expect(comparison.mehrbelastung).toBeGreaterThan(2000)
      expect(comparison.mehrbelastungProzent).toBeGreaterThan(1)
      expect(comparison.mehrbelastungProzent).toBeLessThan(3)

      // Net earnings difference should equal the additional burden
      const netDifference =
        comparison.ohneKirchensteuer.nettoertrag - comparison.mitKirchensteuer.nettoertrag

      expect(netDifference).toBeCloseTo(comparison.mehrbelastung, 2)
    })

    it('should handle scenario with no partial exemption', () => {
      const config: KirchensteuerConfig = {
        ...defaultConfig,
        teilfreistellungsquote: 0, // No exemption (e.g., bonds)
      }

      const yearlyGains = [{ jahr: 2024, kapitalertrag: 10000 }]
      const comparison = compareKirchensteuerImpact(yearlyGains, config)

      // Church tax burden should be higher without partial exemption
      expect(comparison.mehrbelastungProzent).toBeGreaterThan(2)
    })

    it('should validate effective tax rate matches actual calculations', () => {
      const effectiveRate = calculateEffectiveTaxRate(defaultConfig)
      const result = calculateYearlyKirchensteuer(2024, 10000, {
        ...defaultConfig,
        teilfreistellungsquote: 0, // To simplify calculation
      })

      const actualRate = (result.gesamtsteuer / result.kapitalertrag) * 100

      expect(actualRate).toBeCloseTo(effectiveRate, 1)
    })
  })
})
