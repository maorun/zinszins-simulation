import { describe, it, expect } from 'vitest'
import {
  createInterestExplanation,
  createTaxExplanation,
  createEndkapitalExplanation,
  createInflationExplanation,
  createIncomeTaxExplanation,
  createWithdrawalInterestExplanation,
  createTaxableIncomeExplanation,
  createStatutoryPensionExplanation,
} from '../components/calculationHelpers'

// Import helper functions for testing (they are not exported but we can test them through the main function)

describe('calculationHelpers', () => {
  describe('createInterestExplanation', () => {
    it('should create correct interest explanation for savings phase', () => {
      const explanation = createInterestExplanation(10000, 500, 5, 2023)

      expect(explanation.title).toBe('📈 Zinsen-Berechnung Schritt für Schritt')
      expect(explanation.introduction).toContain('Zinsen werden basierend auf dem Startkapital')
      expect(explanation.steps).toHaveLength(2)
      expect(explanation.steps[0].title).toBe('Schritt 1: Startkapital ermitteln')
      expect(explanation.steps[1].title).toBe('Schritt 2: Rendite anwenden')
      expect(explanation.finalResult.values).toHaveLength(3)
    })
  })

  describe('createTaxExplanation', () => {
    it('should create correct tax explanation for savings phase', () => {
      const explanation = createTaxExplanation(150, 1000, 0.26375, 0.3, 2000, 2023)

      expect(explanation.title).toBe('💸 Steuer-Berechnung Schritt für Schritt')
      expect(explanation.introduction).toContain('Steuerberechnung erfolgt basierend auf der Vorabpauschale')
      expect(explanation.steps).toHaveLength(3)
      expect(explanation.steps[0].title).toBe('Schritt 1: Vorabpauschale ermitteln')
      expect(explanation.steps[1].title).toBe('Schritt 2: Steuer vor Sparerpauschbetrag berechnen')
      expect(explanation.steps[2].title).toBe('Schritt 3: Sparerpauschbetrag anwenden')
      expect(explanation.finalResult.values).toHaveLength(4)
    })
  })

  describe('createEndkapitalExplanation', () => {
    it('should create correct endkapital explanation for savings phase', () => {
      const explanation = createEndkapitalExplanation(25000, 20000, 5000, 1000, 100, 2023)

      expect(explanation.title).toBe('🎯 Endkapital-Berechnung Schritt für Schritt')
      expect(explanation.introduction).toContain('Die Endkapital-Berechnung für das Jahr 2023')
      expect(explanation.introduction).toContain('wie sich Ihr Portfolio durch Einzahlungen, Zinserträge und Steuern entwickelt')
      expect(explanation.steps).toHaveLength(4)
      expect(explanation.steps[0].title).toBe('Schritt 1: Startkapital zu Jahresbeginn')
      expect(explanation.steps[1].title).toBe('Schritt 2: Neue Einzahlungen addieren')
      expect(explanation.steps[2].title).toBe('Schritt 3: Zinserträge/Wertzuwachs berücksichtigen')
      expect(explanation.steps[3].title).toBe('Schritt 4: Steuern abziehen')
    })

    it('should calculate step results correctly', () => {
      const explanation = createEndkapitalExplanation(25000, 20000, 5000, 1000, 100, 2023)

      // Check step calculations
      expect(explanation.steps[0].result).toBe('20.000,00 €') // Startkapital
      expect(explanation.steps[1].result).toBe('25.000,00 €') // After contributions: 20000 + 5000
      expect(explanation.steps[2].result).toBe('26.000,00 €') // After interest: 25000 + 1000
      expect(explanation.steps[3].result).toBe('25.000,00 €') // After taxes: 26000 - 100
    })

    it('should handle negative interest correctly', () => {
      const explanation = createEndkapitalExplanation(18000, 20000, 5000, -2000, 0, 2023)

      expect(explanation.steps[2].result).toBe('23.000,00 €') // 25000 + (-2000)
      expect(explanation.steps[2].description).toContain('können auch negativ sein bei Verlusten')
    })

    it('should show final result with all components', () => {
      const explanation = createEndkapitalExplanation(25000, 20000, 5000, 1000, 100, 2023)

      expect(explanation.finalResult.title).toBe('Endergebnis')
      expect(explanation.finalResult.values).toHaveLength(5)
      expect(explanation.finalResult.values[0].label).toBe('Startkapital')
      expect(explanation.finalResult.values[1].label).toBe('Einzahlungen')
      expect(explanation.finalResult.values[2].label).toBe('Zinsen/Wertzuwachs')
      expect(explanation.finalResult.values[3].label).toBe('Bezahlte Steuern')
      expect(explanation.finalResult.values[4].label).toBe('Endkapital')
      expect(explanation.finalResult.values[4].value).toBe('25.000,00 €')
    })
  })

  describe('createInflationExplanation', () => {
    it('should create correct inflation explanation', () => {
      const explanation = createInflationExplanation(20000, 0.02, 5, 2000)

      expect(explanation.title).toBe('📈 Inflation-Anpassung Schritt für Schritt')
      expect(explanation.introduction).toContain('Inflation-Anpassung sorgt dafür')
      expect(explanation.steps).toHaveLength(3)
      expect(explanation.steps[0].title).toBe('Schritt 1: Basis-Entnahmebetrag')
      expect(explanation.steps[1].title).toBe('Schritt 2: Inflationsrate anwenden')
      expect(explanation.steps[2].title).toBe('Schritt 3: Inflations-Anpassung berechnen')
      expect(explanation.finalResult.values).toHaveLength(5)
    })
  })

  describe('createIncomeTaxExplanation', () => {
    it('should create correct income tax explanation', () => {
      const explanation = createIncomeTaxExplanation(20000, 10908, 25, 2273, 10908)

      expect(explanation.title).toBe('🏛️ Einkommensteuer-Berechnung Schritt für Schritt')
      expect(explanation.introduction).toContain('Einkommensteuer wird auf die Entnahme angewendet')
      expect(explanation.steps).toHaveLength(3)
      expect(explanation.steps[0].title).toBe('Schritt 1: Entnahmebetrag ermitteln')
      expect(explanation.steps[1].title).toBe('Schritt 2: Grundfreibetrag anwenden')
      expect(explanation.steps[2].title).toBe('Schritt 3: Einkommensteuer berechnen')
      expect(explanation.finalResult.values).toHaveLength(5)
    })
  })

  describe('createWithdrawalInterestExplanation', () => {
    it('should create correct withdrawal interest explanation', () => {
      const explanation = createWithdrawalInterestExplanation(500000, 25000, 5, 2041)

      expect(explanation.title).toBe('📈 Zinsen-Berechnung (Entnahme-Phase) Schritt für Schritt')
      expect(explanation.introduction).toContain('Auch während der Entnahme-Phase erwirtschaftet')
      expect(explanation.steps).toHaveLength(2)
      expect(explanation.steps[0].title).toBe('Schritt 1: Verfügbares Kapital')
      expect(explanation.steps[1].title).toBe('Schritt 2: Rendite erwirtschaften')
      expect(explanation.finalResult.values).toHaveLength(3)
    })
  })

  describe('createTaxableIncomeExplanation', () => {
    it('should create correct taxable income explanation with portfolio withdrawal only', () => {
      const explanation = createTaxableIncomeExplanation(20000, 10908)

      expect(explanation.title).toBe('💰 Zu versteuerndes Einkommen Schritt für Schritt')
      expect(explanation.introduction).toContain('zu versteuernde Einkommen ergibt sich')
      expect(explanation.steps).toHaveLength(2)
      expect(explanation.steps[0].title).toBe('Schritt 1: Portfolio-Entnahme')
      expect(explanation.steps[1].title).toBe('Schritt 2: Grundfreibetrag abziehen')
      // Portfolio-Entnahme, Gesamte Brutto-Einkünfte, Grundfreibetrag, Zu versteuerndes Einkommen
      expect(explanation.finalResult.values).toHaveLength(4)
    })

    it('should create correct taxable income explanation with all income sources', () => {
      const explanation = createTaxableIncomeExplanation(20000, 10908, 15000, 5000)

      expect(explanation.title).toBe('💰 Zu versteuerndes Einkommen Schritt für Schritt')
      expect(explanation.introduction).toContain('zu versteuernde Einkommen ergibt sich')
      // Portfolio, Pension, Other Income, Total, Grundfreibetrag
      expect(explanation.steps).toHaveLength(5)
      expect(explanation.steps[0].title).toBe('Schritt 1: Portfolio-Entnahme')
      expect(explanation.steps[1].title).toBe('Schritt 2: Gesetzliche Rente (steuerpflichtiger Anteil)')
      expect(explanation.steps[2].title).toBe('Schritt 3: Andere Einkünfte')
      expect(explanation.steps[3].title).toBe('Schritt 4: Gesamte Einkünfte')
      expect(explanation.steps[4].title).toBe('Schritt 5: Grundfreibetrag abziehen')
      // All sources + Total + Grundfreibetrag + Final result
      expect(explanation.finalResult.values).toHaveLength(6)
    })

    it('should create correct taxable income explanation with health care insurance deduction', () => {
      const explanation = createTaxableIncomeExplanation(30000, 11604, 0, 0, 3500)

      expect(explanation.title).toBe('💰 Zu versteuerndes Einkommen Schritt für Schritt')
      expect(explanation.introduction).toContain('steuerlich absetzbarer Beiträge')
      // Portfolio, Health insurance deduction, Total, Grundfreibetrag
      expect(explanation.steps).toHaveLength(4)
      expect(explanation.steps[0].title).toBe('Schritt 1: Portfolio-Entnahme')
      expect(explanation.steps[1].title).toBe('Schritt 2: Krankenversicherung abziehen')
      expect(explanation.steps[2].title).toBe('Schritt 3: Gesamte Einkünfte')
      expect(explanation.steps[3].title).toBe('Schritt 4: Grundfreibetrag abziehen')

      // Verify the health care insurance deduction step
      expect(explanation.steps[1].description).toContain('steuerlich absetzbar')
      expect(explanation.steps[1].calculation).toContain('3.500,00 €')
      expect(explanation.steps[1].result).toBe('-3.500,00 €')

      // Portfolio + Health insurance (absetzbar) + Gesamte Einkünfte + Grundfreibetrag + Final result
      expect(explanation.finalResult.values).toHaveLength(5)
      expect(explanation.finalResult.values[1].label).toBe('Krankenversicherung (absetzbar)')
      expect(explanation.finalResult.values[1].value).toBe('-3.500,00 €')
    })
  })

  describe('createStatutoryPensionExplanation', () => {
    it('should create correct statutory pension explanation', () => {
      const explanation = createStatutoryPensionExplanation(18000, 15000, 3000, 14400, 2041)

      expect(explanation.title).toBe('🏛️ Gesetzliche Rente - Berechnung Schritt für Schritt')
      expect(explanation.introduction).toContain('gesetzliche Rente wird mit dem steuerpflichtigen Anteil versteuert')
      expect(explanation.introduction).toContain('Jahr 2041')
      expect(explanation.steps).toHaveLength(4)
      expect(explanation.steps[0].title).toBe('Schritt 1: Brutto-Renteneinkommen')
      expect(explanation.steps[1].title).toBe('Schritt 2: Steuerpflichtiger Anteil')
      expect(explanation.steps[2].title).toBe('Schritt 3: Einkommensteuer auf Rente')
      expect(explanation.steps[3].title).toBe('Schritt 4: Netto-Renteneinkommen')
      expect(explanation.finalResult.values).toHaveLength(7)
      expect(explanation.finalResult.values[0].label).toBe('Brutto-Rente (jährlich)')
      expect(explanation.finalResult.values[4].label).toBe('Netto-Rente (jährlich)')
      expect(explanation.finalResult.values[5].label).toBe('Netto-Rente (monatlich)')
    })

    it('should handle edge cases correctly', () => {
      const explanation = createStatutoryPensionExplanation(0, 0, 0, 0, 2041)

      expect(explanation.title).toBe('🏛️ Gesetzliche Rente - Berechnung Schritt für Schritt')
      expect(explanation.steps).toHaveLength(4)
      expect(explanation.finalResult.values).toHaveLength(7)
      expect(explanation.finalResult.values[1].value).toBe('0,0%') // Taxable percentage should be 0
    })
  })

  describe('createTaxableIncomeExplanation - Helper Functions Integration', () => {
    it('should handle multiple income sources correctly with all helper functions', () => {
      // Test all helper functions working together
      const explanation = createTaxableIncomeExplanation(
        20000, // entnahme
        11000, // grundfreibetrag
        15000, // statutory pension
        5000, // other income
        3000, // health care insurance
      )

      // Should have all steps: Portfolio + Pension + Other Income + Health Insurance + Total + Grundfreibetrag
      expect(explanation.steps).toHaveLength(6)

      // Verify step titles are numbered correctly
      expect(explanation.steps[0].title).toContain('Schritt 1')
      expect(explanation.steps[1].title).toContain('Schritt 2')
      expect(explanation.steps[2].title).toContain('Schritt 3')
      expect(explanation.steps[3].title).toContain('Schritt 4')
      expect(explanation.steps[4].title).toContain('Schritt 5')
      expect(explanation.steps[5].title).toContain('Schritt 6')

      // Verify correct calculation: 20000 + 15000 + 5000 - 3000 = 37000
      expect(explanation.steps[4].calculation).toContain('37.000,00 €')

      // Verify final result has all components
      expect(explanation.finalResult.values).toHaveLength(7)
      expect(explanation.finalResult.values[0].label).toBe('Portfolio-Entnahme')
      expect(explanation.finalResult.values[1].label).toBe('Gesetzliche Rente (steuerpflichtig)')
      expect(explanation.finalResult.values[2].label).toBe('Andere Einkünfte')
      expect(explanation.finalResult.values[3].label).toBe('Krankenversicherung (absetzbar)')
      expect(explanation.finalResult.values[4].label).toBe('Gesamte Einkünfte')
      expect(explanation.finalResult.values[5].label).toBe('Grundfreibetrag')
      expect(explanation.finalResult.values[6].label).toBe('Zu versteuerndes Einkommen')

      // Verify zu versteuerndes Einkommen: max(0, 37000 - 11000) = 26000
      expect(explanation.finalResult.values[6].value).toBe('26.000,00 €')
    })

    it('should calculate total taxable income correctly when all sources are zero', () => {
      const explanation = createTaxableIncomeExplanation(0, 10000, 0, 0, 0)

      expect(explanation.steps).toHaveLength(2) // Only portfolio and Grundfreibetrag
      // Index 3 is zu versteuerndes Einkommen (0=Portfolio, 1=Gesamte, 2=Grundfreibetrag, 3=Zu versteuerndes)
      const zuVersteuern = explanation.finalResult.values.find(v => v.label === 'Zu versteuerndes Einkommen')
      expect(zuVersteuern?.value).toBe('0,00 €')
    })

    it('should add statutory pension step only when amount is positive', () => {
      const explanation = createTaxableIncomeExplanation(20000, 11000, 0)

      // Should NOT have statutory pension step
      expect(explanation.steps.length).toBeLessThan(3)
      expect(explanation.steps.every(step => !step.title.includes('Gesetzliche Rente'))).toBe(true)
    })

    it('should add other income step only when amount is positive', () => {
      const explanation = createTaxableIncomeExplanation(20000, 11000, 0, 0)

      // Should NOT have other income step
      expect(explanation.steps.every(step => !step.title.includes('Andere Einkünfte'))).toBe(true)
    })

    it('should add health care insurance step only when amount is positive', () => {
      const explanation = createTaxableIncomeExplanation(20000, 11000, 0, 0, 0)

      // Should NOT have health care insurance step
      expect(explanation.steps.every(step => !step.title.includes('Krankenversicherung'))).toBe(true)
    })

    it('should build calculation text correctly for total income', () => {
      const explanation = createTaxableIncomeExplanation(20000, 11000, 15000, 5000, 3000)

      // Find the total income step
      const totalStep = explanation.steps.find(s => s.title.includes('Gesamte Einkünfte'))
      expect(totalStep).toBeDefined()
      expect(totalStep?.calculation).toContain('Portfolio-Entnahme')
      expect(totalStep?.calculation).toContain('Gesetzliche Rente')
      expect(totalStep?.calculation).toContain('Andere Einkünfte')
      expect(totalStep?.calculation).toContain('Krankenversicherung')
      expect(totalStep?.calculation).toContain('20.000,00 €')
      expect(totalStep?.calculation).toContain('15.000,00 €')
      expect(totalStep?.calculation).toContain('5.000,00 €')
      expect(totalStep?.calculation).toContain('3.000,00 €')
    })

    it('should not add total income step when only portfolio withdrawal exists', () => {
      const explanation = createTaxableIncomeExplanation(20000, 11000)

      // Should NOT have total income step since we only have portfolio withdrawal
      expect(explanation.steps.every(s => !s.title.includes('Gesamte Einkünfte'))).toBe(true)
    })

    it('should handle Grundfreibetrag correctly when total income is below it', () => {
      const explanation = createTaxableIncomeExplanation(5000, 11000)

      // Zu versteuerndes Einkommen should be 0 when total < Grundfreibetrag
      const finalValue = explanation.finalResult.values.find(v => v.label === 'Zu versteuerndes Einkommen')
      expect(finalValue?.value).toBe('0,00 €')
    })
  })
})
