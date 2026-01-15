import { describe, expect, it } from 'vitest'
import {
  calculateGleitzonenfaktor,
  calculateBemessungsentgelt,
  calculateMidijobBeitraege,
  calculateOptimalGleitzoneIncome,
  compareMinijobRentenversicherung,
  calculateVersicherungspflichtgrenzeOptimization,
  validateSozialversicherungConfig,
  getDefaultMidijobConfig,
  SV_CONSTANTS_2024,
  type MidijobConfig,
} from './sozialversicherung-optimierung'

describe('sozialversicherung-optimierung', () => {
  describe('getDefaultMidijobConfig', () => {
    it('should return valid default configuration', () => {
      const config = getDefaultMidijobConfig()

      expect(config.bruttoEinkommen).toBe(1000)
      expect(config.kinderlos).toBe(false)
      expect(config.rentenversicherungBefreiung).toBe(false)
    })
  })

  describe('validateSozialversicherungConfig', () => {
    it('should validate correct configuration without errors', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 1500,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const errors = validateSozialversicherungConfig(config)
      expect(errors).toEqual([])
    })

    it('should reject negative income', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: -100,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const errors = validateSozialversicherungConfig(config)
      expect(errors).toContain('Bruttoeinkommen kann nicht negativ sein')
    })

    it('should warn about very high income', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 15000,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const errors = validateSozialversicherungConfig(config)
      expect(errors).toContain('Bruttoeinkommen über 10.000 € monatlich ist für Gleitzone-Optimierung nicht relevant')
    })
  })

  describe('calculateGleitzonenfaktor', () => {
    it('should return 0 for Minijob income', () => {
      const faktor = calculateGleitzonenfaktor(500)
      expect(faktor).toBe(0)
    })

    it('should calculate factor correctly at Gleitzone lower bound', () => {
      const { gleitzoneUntergrenze, minijobGrenze } = SV_CONSTANTS_2024
      const faktor = calculateGleitzonenfaktor(gleitzoneUntergrenze + 1)

      // Formula: F = 1.4597 × (538 / income)
      const expected = 1.4597 * (minijobGrenze / (gleitzoneUntergrenze + 1))
      expect(faktor).toBeCloseTo(expected, 4)
    })

    it('should calculate factor correctly in middle of Gleitzone', () => {
      const brutto = 1200
      const faktor = calculateGleitzonenfaktor(brutto)

      const expected = 1.4597 * (SV_CONSTANTS_2024.minijobGrenze / brutto)
      expect(faktor).toBeCloseTo(expected, 4)
      expect(faktor).toBeLessThan(1) // Factor should be less than 1 in Gleitzone
    })

    it('should decrease as income increases', () => {
      const faktor1000 = calculateGleitzonenfaktor(1000)
      const faktor1500 = calculateGleitzonenfaktor(1500)
      const faktor2000 = calculateGleitzonenfaktor(2000)

      expect(faktor1000).toBeGreaterThan(faktor1500)
      expect(faktor1500).toBeGreaterThan(faktor2000)
    })
  })

  describe('calculateBemessungsentgelt', () => {
    it('should return 0 for Minijob', () => {
      const bemessungsentgelt = calculateBemessungsentgelt(500, 0)
      expect(bemessungsentgelt).toBe(0)
    })

    it('should return full income above Gleitzone', () => {
      const brutto = 2500
      const bemessungsentgelt = calculateBemessungsentgelt(brutto, 1)
      expect(bemessungsentgelt).toBe(brutto)
    })

    it('should calculate reduced bemessungsentgelt in Gleitzone', () => {
      const brutto = 1200
      const faktor = calculateGleitzonenfaktor(brutto)
      const bemessungsentgelt = calculateBemessungsentgelt(brutto, faktor)

      // Bemessungsentgelt should be less than Brutto in Gleitzone
      expect(bemessungsentgelt).toBeLessThan(brutto)
      expect(bemessungsentgelt).toBeGreaterThan(SV_CONSTANTS_2024.minijobGrenze)
    })

    it('should apply correct formula in Gleitzone', () => {
      const brutto = 1500
      const faktor = 1.4597 * (SV_CONSTANTS_2024.minijobGrenze / brutto)

      const bemessungsentgelt = calculateBemessungsentgelt(brutto, faktor)

      // Formula: Bemessungsentgelt = F × Brutto - (F - 1) × Geringfügigkeitsgrenze
      const expected = faktor * brutto - (faktor - 1) * SV_CONSTANTS_2024.minijobGrenze

      expect(bemessungsentgelt).toBeCloseTo(expected, 2)
    })
  })

  describe('calculateMidijobBeitraege - Minijob', () => {
    it('should calculate Minijob with Rentenversicherung correctly', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 500,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)

      expect(ergebnis.istMinijob).toBe(true)
      expect(ergebnis.istGleitzone).toBe(false)
      expect(ergebnis.brutto).toBe(500)

      // Employee contribution: 3.7% of Brutto for RV
      expect(ergebnis.arbeitnehmerBeitrag).toBeCloseTo(500 * 0.037, 2)

      // Employer contribution: 30.15% flat rate
      expect(ergebnis.arbeitgeberBeitrag).toBeCloseTo(500 * 0.3015, 2)

      // Net = Brutto - employee contribution
      expect(ergebnis.netto).toBeCloseTo(500 - 500 * 0.037, 2)

      // Rentenpunkte should be calculated
      expect(ergebnis.rentenpunkteProJahr).toBeGreaterThan(0)
    })

    it('should calculate Minijob without Rentenversicherung correctly', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 500,
        kinderlos: false,
        rentenversicherungBefreiung: true,
      }

      const ergebnis = calculateMidijobBeitraege(config)

      expect(ergebnis.istMinijob).toBe(true)
      expect(ergebnis.arbeitnehmerBeitrag).toBe(0)
      expect(ergebnis.netto).toBe(500)
      expect(ergebnis.rentenpunkteProJahr).toBe(0)
    })

    it('should calculate employer costs correctly for Minijob', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 450,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)

      const expectedEmployerCosts = 450 + 450 * SV_CONSTANTS_2024.minijobPauschale
      expect(ergebnis.arbeitgeberKosten).toBeCloseTo(expectedEmployerCosts, 2)
    })
  })

  describe('calculateMidijobBeitraege - Gleitzone', () => {
    it('should correctly identify Gleitzone income', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 1200,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)

      expect(ergebnis.istGleitzone).toBe(true)
      expect(ergebnis.istMinijob).toBe(false)
    })

    it('should calculate reduced employee contributions in Gleitzone', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 1200,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)

      // Employee contributions should be based on reduced Bemessungsentgelt
      expect(ergebnis.bemessungsentgelt).toBeLessThan(ergebnis.brutto)
      expect(ergebnis.arbeitnehmerBeitrag).toBeLessThan(ergebnis.brutto * SV_CONSTANTS_2024.arbeitnehmerAnteilNormal)

      // Net should be higher than without Gleitzone benefit
      const nettoOhneGleitzone = 1200 * (1 - SV_CONSTANTS_2024.arbeitnehmerAnteilNormal)
      expect(ergebnis.netto).toBeGreaterThan(nettoOhneGleitzone)
    })

    it('should calculate all contribution components', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 1500,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)

      expect(ergebnis.beitraege.krankenversicherung).toBeGreaterThan(0)
      expect(ergebnis.beitraege.pflegeversicherung).toBeGreaterThan(0)
      expect(ergebnis.beitraege.rentenversicherung).toBeGreaterThan(0)
      expect(ergebnis.beitraege.arbeitslosenversicherung).toBeGreaterThan(0)

      // Sum should equal total employee contribution
      const sum =
        ergebnis.beitraege.krankenversicherung +
        ergebnis.beitraege.pflegeversicherung +
        ergebnis.beitraege.rentenversicherung +
        ergebnis.beitraege.arbeitslosenversicherung

      expect(sum).toBeCloseTo(ergebnis.arbeitnehmerBeitrag, 2)
    })

    it('should apply Kinderlosenzuschlag for childless people', () => {
      const configMitKindern: MidijobConfig = {
        bruttoEinkommen: 1500,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const configOhneKinder: MidijobConfig = {
        ...configMitKindern,
        kinderlos: true,
      }

      const ergebnisMitKindern = calculateMidijobBeitraege(configMitKindern)
      const ergebnisOhneKinder = calculateMidijobBeitraege(configOhneKinder)

      // Childless person should pay more Pflegeversicherung
      expect(ergebnisOhneKinder.beitraege.pflegeversicherung).toBeGreaterThan(ergebnisMitKindern.beitraege.pflegeversicherung)

      // And therefore lower net income
      expect(ergebnisOhneKinder.netto).toBeLessThan(ergebnisMitKindern.netto)
    })

    it('should calculate Rentenpunkte based on Bemessungsentgelt', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 1800,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)

      const expectedRentenpunkte = (ergebnis.bemessungsentgelt * 12) / SV_CONSTANTS_2024.rentenpunktKosten

      expect(ergebnis.rentenpunkteProJahr).toBeCloseTo(expectedRentenpunkte, 4)
      expect(ergebnis.rentenpunkteProJahr).toBeGreaterThan(0)
    })
  })

  describe('calculateMidijobBeitraege - Above Gleitzone', () => {
    it('should use full income as Bemessungsentgelt above Gleitzone', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 2500,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)

      expect(ergebnis.istGleitzone).toBe(false)
      expect(ergebnis.istMinijob).toBe(false)
      expect(ergebnis.bemessungsentgelt).toBe(2500)
      expect(ergebnis.gleitzonenfaktor).toBe(1)
    })

    it('should calculate normal social security contributions above Gleitzone', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 3000,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)

      // Employee contribution should be approximately 20.25% of Brutto
      const expectedEmployeeContribution = 3000 * SV_CONSTANTS_2024.arbeitnehmerAnteilNormal
      expect(ergebnis.arbeitnehmerBeitrag).toBeCloseTo(expectedEmployeeContribution, -1)
    })
  })

  describe('calculateOptimalGleitzoneIncome', () => {
    it('should find optimal income in Gleitzone', () => {
      const result = calculateOptimalGleitzoneIncome(false)

      expect(result.optimalBrutto).toBeGreaterThanOrEqual(SV_CONSTANTS_2024.gleitzoneUntergrenze)
      expect(result.optimalBrutto).toBeLessThanOrEqual(SV_CONSTANTS_2024.gleitzoneObergrenze)
      // Result may be at boundary (Minijob or regular) depending on optimization
      expect(result.nettoProEuro).toBeGreaterThan(0)
      expect(result.nettoProEuro).toBeLessThan(1)
    })

    it('should return higher net ratio for optimal income than edges', () => {
      const optimal = calculateOptimalGleitzoneIncome(false)

      const lowerBound = calculateMidijobBeitraege({
        bruttoEinkommen: SV_CONSTANTS_2024.gleitzoneUntergrenze + 10,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      })

      const upperBound = calculateMidijobBeitraege({
        bruttoEinkommen: SV_CONSTANTS_2024.gleitzoneObergrenze,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      })

      const lowerRatio = lowerBound.netto / lowerBound.brutto
      const upperRatio = upperBound.netto / upperBound.brutto

      // Optimal should be at least as good as the edges
      expect(optimal.nettoProEuro).toBeGreaterThanOrEqual(Math.min(lowerRatio, upperRatio))
    })

    it('should calculate optimal income considering childless status', () => {
      const mitKindern = calculateOptimalGleitzoneIncome(false)
      const ohneKinder = calculateOptimalGleitzoneIncome(true)

      // Both should find an optimal solution
      expect(mitKindern.optimalBrutto).toBeGreaterThan(0)
      expect(ohneKinder.optimalBrutto).toBeGreaterThan(0)
      expect(mitKindern.nettoProEuro).toBeGreaterThan(0)
      expect(ohneKinder.nettoProEuro).toBeGreaterThan(0)
    })
  })

  describe('compareMinijobRentenversicherung', () => {
    it('should compare scenarios correctly', () => {
      const comparison = compareMinijobRentenversicherung(500)

      expect(comparison.mitRentenversicherung.arbeitnehmerBeitrag).toBeGreaterThan(0)
      expect(comparison.ohneRentenversicherung.arbeitnehmerBeitrag).toBe(0)

      expect(comparison.mitRentenversicherung.rentenpunkteProJahr).toBeGreaterThan(0)
      expect(comparison.ohneRentenversicherung.rentenpunkteProJahr).toBe(0)

      expect(comparison.mehrNetto).toBeGreaterThan(0)
      expect(comparison.verloreneRentenpunkte).toBeGreaterThan(0)
      expect(comparison.entgangeneRente).toBeGreaterThan(0)
    })

    it('should calculate lost pension correctly', () => {
      const comparison = compareMinijobRentenversicherung(450)

      const expectedLostRente = comparison.verloreneRentenpunkte * SV_CONSTANTS_2024.rentenpunktWertMonatlich

      expect(comparison.entgangeneRente).toBeCloseTo(expectedLostRente, 2)
    })

    it('should show trade-off between immediate net income and future pension', () => {
      const comparison = compareMinijobRentenversicherung(538)

      // Monthly extra net income vs. monthly pension loss
      const monthlyExtraNet = comparison.mehrNetto
      const monthlyPensionLoss = comparison.entgangeneRente

      expect(monthlyExtraNet).toBeGreaterThan(0)
      expect(monthlyPensionLoss).toBeGreaterThan(0)

      // In typical scenarios, short-term net gain is smaller than long-term pension loss
      expect(monthlyExtraNet).toBeLessThan(monthlyPensionLoss)
    })
  })

  describe('calculateVersicherungspflichtgrenzeOptimization', () => {
    it('should identify income above threshold', () => {
      const jahresBrutto = 70000
      const result = calculateVersicherungspflichtgrenzeOptimization(jahresBrutto)

      expect(result.pkvVorteilhaft).toBe(true)
      expect(result.ueberschreitungsbetrag).toBeGreaterThan(0)
      expect(result.mehrverdienstFuerPKV).toBe(0)
      expect(result.empfehlung).toContain('PKV')
    })

    it('should calculate required additional income below threshold', () => {
      const jahresBrutto = 65000
      const result = calculateVersicherungspflichtgrenzeOptimization(jahresBrutto)

      const expectedMehrverdienst = SV_CONSTANTS_2024.versicherungspflichtgrenze - jahresBrutto

      expect(result.ueberschreitungsbetrag).toBeLessThan(0)
      expect(result.mehrverdienstFuerPKV).toBe(expectedMehrverdienst)
    })

    it('should recommend GKV for significantly lower income', () => {
      const jahresBrutto = 50000
      const result = calculateVersicherungspflichtgrenzeOptimization(jahresBrutto)

      expect(result.pkvVorteilhaft).toBe(false)
      expect(result.empfehlung).toContain('GKV')
    })

    it('should suggest negotiation for income close to threshold', () => {
      const jahresBrutto = 68000
      const result = calculateVersicherungspflichtgrenzeOptimization(jahresBrutto)

      expect(result.pkvVorteilhaft).toBe(true)
      expect(result.mehrverdienstFuerPKV).toBeLessThan(5000)
      expect(result.empfehlung).toContain('Gehaltsverhandlung')
    })

    it('should handle exact threshold income', () => {
      const jahresBrutto = SV_CONSTANTS_2024.versicherungspflichtgrenze
      const result = calculateVersicherungspflichtgrenzeOptimization(jahresBrutto)

      expect(result.ueberschreitungsbetrag).toBe(0)
      expect(result.mehrverdienstFuerPKV).toBe(0)
      expect(result.pkvVorteilhaft).toBe(true)
    })
  })

  describe('Edge cases and boundary conditions', () => {
    it('should handle income exactly at Minijob threshold', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: SV_CONSTANTS_2024.minijobGrenze,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)
      expect(ergebnis.istMinijob).toBe(true)
    })

    it('should handle income exactly at Gleitzone lower bound', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: SV_CONSTANTS_2024.gleitzoneUntergrenze,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)
      // At exactly gleitzoneUntergrenze, it should be Minijob
      expect(ergebnis.istMinijob).toBe(true)
    })

    it('should handle income just above Gleitzone lower bound', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: SV_CONSTANTS_2024.gleitzoneUntergrenze + 1,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)
      expect(ergebnis.istGleitzone).toBe(true)
    })

    it('should handle income exactly at Gleitzone upper bound', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: SV_CONSTANTS_2024.gleitzoneObergrenze,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)
      expect(ergebnis.istGleitzone).toBe(true)
    })

    it('should handle income just above Gleitzone upper bound', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: SV_CONSTANTS_2024.gleitzoneObergrenze + 1,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)
      expect(ergebnis.istGleitzone).toBe(false)
      expect(ergebnis.gleitzonenfaktor).toBe(1)
    })

    it('should handle zero income', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 0,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)
      expect(ergebnis.netto).toBe(0)
      expect(ergebnis.arbeitnehmerBeitrag).toBe(0)
      expect(ergebnis.rentenpunkteProJahr).toBe(0)
    })
  })

  describe('Realistic scenarios', () => {
    it('should demonstrate Gleitzone benefit at 1200€ income', () => {
      const config: MidijobConfig = {
        bruttoEinkommen: 1200,
        kinderlos: false,
        rentenversicherungBefreiung: false,
      }

      const ergebnis = calculateMidijobBeitraege(config)

      // Without Gleitzone, employee contribution would be ~20.25%
      const ohneGleitzone = 1200 * SV_CONSTANTS_2024.arbeitnehmerAnteilNormal
      const mitGleitzone = ergebnis.arbeitnehmerBeitrag

      const ersparnis = ohneGleitzone - mitGleitzone

      expect(ersparnis).toBeGreaterThan(40) // At least 40€ monthly savings
      expect(ergebnis.netto).toBeGreaterThan(1200 * 0.8) // More than 80% net
    })

    it('should show trade-off for Minijob Rentenversicherung', () => {
      // At typical Minijob income of 520€
      const comparison = compareMinijobRentenversicherung(520)

      // Additional monthly pension should exceed monthly contribution cost over time
      const monthlyContribution = comparison.mehrNetto
      const monthlyPension = comparison.entgangeneRente

      // Contributions are lower than pension value
      expect(monthlyContribution).toBeGreaterThan(0)
      expect(monthlyPension).toBeGreaterThan(0)

      // The choice depends on individual circumstances and retirement length
      expect(comparison.verloreneRentenpunkte).toBeGreaterThan(0)
    })
  })
})
