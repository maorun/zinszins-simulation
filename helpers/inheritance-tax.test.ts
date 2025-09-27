import { describe, it, expect } from 'vitest'
import {
  calculateInheritanceTax,
  getRelationshipTypeLabel,
  getExpenseTypeLabel,
  INHERITANCE_TAX_EXEMPTIONS,
  RELATIONSHIP_TO_TAX_CLASS,
} from './inheritance-tax'

describe('inheritance-tax', () => {
  describe('calculateInheritanceTax', () => {
    it('should handle inheritance below exemption threshold', () => {
      // Child inheriting €300,000 (below €400,000 exemption)
      const result = calculateInheritanceTax(300000, 'child')
      
      expect(result.grossAmount).toBe(300000)
      expect(result.exemption).toBe(400000)
      expect(result.taxableAmount).toBe(0)
      expect(result.tax).toBe(0)
      expect(result.netAmount).toBe(300000)
      expect(result.taxClass).toBe('I')
      expect(result.effectiveTaxRate).toBe(0)
    })

    it('should calculate tax for spouse inheritance above exemption', () => {
      // Spouse inheriting €600,000 (€100,000 above €500,000 exemption)
      const result = calculateInheritanceTax(600000, 'spouse')
      
      expect(result.grossAmount).toBe(600000)
      expect(result.exemption).toBe(500000)
      expect(result.taxableAmount).toBe(100000)
      expect(result.taxClass).toBe('I')
      // First €75,000 at 7%, remaining €25,000 at 11%
      expect(result.tax).toBe(75000 * 0.07 + 25000 * 0.11)
      expect(result.netAmount).toBe(600000 - result.tax)
      expect(result.effectiveTaxRate).toBeCloseTo(result.tax / 600000)
    })

    it('should calculate tax for child inheritance with higher amounts', () => {
      // Child inheriting €1,000,000 (€600,000 above €400,000 exemption)
      const result = calculateInheritanceTax(1000000, 'child')
      
      expect(result.grossAmount).toBe(1000000)
      expect(result.exemption).toBe(400000)
      expect(result.taxableAmount).toBe(600000)
      expect(result.taxClass).toBe('I')
      // Progressive tax calculation:
      // First €75,000 at 7% = €5,250
      // Next €225,000 at 11% = €24,750  
      // Next €300,000 at 15% = €45,000
      // Total = €75,000
      expect(result.tax).toBe(75000 * 0.07 + 225000 * 0.11 + 300000 * 0.15)
      expect(result.netAmount).toBe(1000000 - result.tax)
    })

    it('should calculate tax for siblings with Class II rates', () => {
      // Sibling inheriting €100,000 (€80,000 above €20,000 exemption)
      const result = calculateInheritanceTax(100000, 'sibling')
      
      expect(result.grossAmount).toBe(100000)
      expect(result.exemption).toBe(20000)
      expect(result.taxableAmount).toBe(80000)
      expect(result.taxClass).toBe('II')
      // First €75,000 at 15%, remaining €5,000 at 20%
      expect(result.tax).toBe(75000 * 0.15 + 5000 * 0.20)
      expect(result.netAmount).toBe(100000 - result.tax)
    })

    it('should calculate tax for unrelated persons with Class III rates', () => {
      // Unrelated person inheriting €50,000 (€30,000 above €20,000 exemption)
      const result = calculateInheritanceTax(50000, 'other')
      
      expect(result.grossAmount).toBe(50000)
      expect(result.exemption).toBe(20000)
      expect(result.taxableAmount).toBe(30000)
      expect(result.taxClass).toBe('III')
      // €30,000 at 30% (Class III first bracket)
      expect(result.tax).toBe(30000 * 0.30)
      expect(result.netAmount).toBe(50000 - result.tax)
    })

    it('should handle zero inheritance amount', () => {
      const result = calculateInheritanceTax(0, 'child')
      
      expect(result.grossAmount).toBe(0)
      expect(result.exemption).toBe(400000)
      expect(result.taxableAmount).toBe(0)
      expect(result.tax).toBe(0)
      expect(result.netAmount).toBe(0)
      expect(result.effectiveTaxRate).toBe(0)
    })

    it('should handle very large inheritance amounts', () => {
      // Child inheriting €10,000,000
      const result = calculateInheritanceTax(10000000, 'child')
      
      expect(result.grossAmount).toBe(10000000)
      expect(result.exemption).toBe(400000)
      expect(result.taxableAmount).toBe(9600000)
      expect(result.taxClass).toBe('I')
      expect(result.tax).toBeGreaterThan(0)
      expect(result.netAmount).toBe(10000000 - result.tax)
      expect(result.effectiveTaxRate).toBeGreaterThan(0)
      expect(result.effectiveTaxRate).toBeLessThan(0.30) // Should not exceed maximum rate
    })
  })

  describe('INHERITANCE_TAX_EXEMPTIONS', () => {
    it('should have correct exemption amounts', () => {
      expect(INHERITANCE_TAX_EXEMPTIONS.spouse).toBe(500000)
      expect(INHERITANCE_TAX_EXEMPTIONS.child).toBe(400000)
      expect(INHERITANCE_TAX_EXEMPTIONS.grandchild).toBe(200000)
      expect(INHERITANCE_TAX_EXEMPTIONS.parent_from_descendant).toBe(100000)
      expect(INHERITANCE_TAX_EXEMPTIONS.parent_other).toBe(20000)
      expect(INHERITANCE_TAX_EXEMPTIONS.sibling).toBe(20000)
      expect(INHERITANCE_TAX_EXEMPTIONS.other).toBe(20000)
    })
  })

  describe('RELATIONSHIP_TO_TAX_CLASS', () => {
    it('should assign correct tax classes', () => {
      expect(RELATIONSHIP_TO_TAX_CLASS.spouse).toBe('I')
      expect(RELATIONSHIP_TO_TAX_CLASS.child).toBe('I')
      expect(RELATIONSHIP_TO_TAX_CLASS.grandchild).toBe('I')
      expect(RELATIONSHIP_TO_TAX_CLASS.parent_from_descendant).toBe('I')
      expect(RELATIONSHIP_TO_TAX_CLASS.parent_other).toBe('II')
      expect(RELATIONSHIP_TO_TAX_CLASS.sibling).toBe('II')
      expect(RELATIONSHIP_TO_TAX_CLASS.other).toBe('III')
    })
  })

  describe('getRelationshipTypeLabel', () => {
    it('should return correct German labels', () => {
      expect(getRelationshipTypeLabel('spouse')).toBe('Ehegatte/Ehegattin')
      expect(getRelationshipTypeLabel('child')).toBe('Kind/Stiefkind')
      expect(getRelationshipTypeLabel('grandchild')).toBe('Enkelkind')
      expect(getRelationshipTypeLabel('parent_from_descendant')).toBe('Eltern (von Nachkommen)')
      expect(getRelationshipTypeLabel('parent_other')).toBe('Eltern (sonstige)')
      expect(getRelationshipTypeLabel('sibling')).toBe('Geschwister')
      expect(getRelationshipTypeLabel('other')).toBe('Sonstige/Nicht verwandt')
    })
  })

  describe('getExpenseTypeLabel', () => {
    it('should return correct German labels for expense types', () => {
      expect(getExpenseTypeLabel('car')).toBe('Autokauf')
      expect(getExpenseTypeLabel('real_estate')).toBe('Immobilienkauf')
      expect(getExpenseTypeLabel('education')).toBe('Bildungsausgaben')
      expect(getExpenseTypeLabel('medical')).toBe('Medizinische Ausgaben')
      expect(getExpenseTypeLabel('other')).toBe('Sonstige Ausgaben')
    })

    it('should return original value for unknown expense types', () => {
      expect(getExpenseTypeLabel('unknown_type')).toBe('unknown_type')
    })
  })

  describe('Edge cases and validation', () => {
    it('should handle negative inheritance amounts gracefully', () => {
      const result = calculateInheritanceTax(-100000, 'child')
      
      expect(result.grossAmount).toBe(-100000)
      expect(result.taxableAmount).toBe(0) // Should not be negative
      expect(result.tax).toBe(0)
      expect(result.netAmount).toBe(-100000)
    })

    it('should calculate correct progressive tax across multiple brackets', () => {
      // Test with amount that spans multiple tax brackets
      const result = calculateInheritanceTax(2000000, 'child') // €1,600,000 taxable
      
      expect(result.taxClass).toBe('I')
      expect(result.taxableAmount).toBe(1600000)
      
      // Manual calculation:
      // €75,000 at 7% = €5,250
      // €225,000 at 11% = €24,750  
      // €300,000 at 15% = €45,000
      // €1,000,000 at 19% = €190,000
      // Total = €265,000
      const expectedTax = 75000 * 0.07 + 225000 * 0.11 + 300000 * 0.15 + 1000000 * 0.19
      expect(result.tax).toBe(expectedTax)
    })
  })
})