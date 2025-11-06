import { describe, it, expect } from 'vitest'
import {
  optimizeFreistellungsauftrag,
  validateFreistellungsauftragConfig,
  calculateEffectiveTaxRates,
  type FreistellungsauftragConfig,
  type BankAccount,
} from './freistellungsauftrag-optimization'

describe('Freistellungsauftrag Optimization', () => {
  const defaultSteuerlast = 0.26375 // 26.375% German capital gains tax
  const defaultTeilfreistellung = 0.3 // 30% partial exemption for equity funds

  describe('optimizeFreistellungsauftrag', () => {
    it('should distribute Freibetrag optimally to account with highest expected gains', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [
          { id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: 0 },
          { id: '2', name: 'Bank B', expectedCapitalGains: 500, assignedFreibetrag: 0 },
          { id: '3', name: 'Bank C', expectedCapitalGains: 1500, assignedFreibetrag: 0 },
        ],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      // Bank A has highest gains (2000), should get priority
      const bankA = result.accounts.find((acc) => acc.id === '1')
      expect(bankA?.assignedFreibetrag).toBe(1000)

      // Bank C has second highest gains (1500), but Freibetrag is exhausted
      const bankC = result.accounts.find((acc) => acc.id === '3')
      expect(bankC?.assignedFreibetrag).toBe(0)

      // Bank B has lowest gains (500), should get nothing
      const bankB = result.accounts.find((acc) => acc.id === '2')
      expect(bankB?.assignedFreibetrag).toBe(0)

      expect(result.totalAssignedFreibetrag).toBe(1000)
      expect(result.remainingFreibetrag).toBe(0)
    })

    it('should handle case where total gains are less than Freibetrag', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 2000,
        accounts: [
          { id: '1', name: 'Bank A', expectedCapitalGains: 1000, assignedFreibetrag: 0 },
          { id: '2', name: 'Bank B', expectedCapitalGains: 500, assignedFreibetrag: 0 },
        ],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      // After Teilfreistellung (30%), taxable gains: Bank A = 700€, Bank B = 350€
      const bankA = result.accounts.find((acc) => acc.id === '1')
      expect(bankA?.assignedFreibetrag).toBe(700) // 1000 * 0.7

      const bankB = result.accounts.find((acc) => acc.id === '2')
      expect(bankB?.assignedFreibetrag).toBe(350) // 500 * 0.7

      expect(result.totalAssignedFreibetrag).toBe(1050)
      expect(result.remainingFreibetrag).toBe(950)
      expect(result.isOptimal).toBe(true)
    })

    it('should account for Teilfreistellungsquote correctly', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [{ id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: 0 }],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      // 2000€ capital gains * (1 - 0.3) = 1400€ taxable
      // Should assign min(1400, 1000) = 1000€
      const bankA = result.accounts.find((acc) => acc.id === '1')
      expect(bankA?.assignedFreibetrag).toBe(1000)
    })

    it('should calculate tax savings correctly', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [{ id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: 0 }],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      // Taxable gains: 2000 * 0.7 = 1400€
      // Tax saved on 1000€ Freibetrag: 1000 * 0.26375 = 263.75€
      expect(result.totalTaxSaved).toBeCloseTo(263.75, 2)
    })

    it('should provide recommendations for unused Freibetrag', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 2000,
        accounts: [{ id: '1', name: 'Bank A', expectedCapitalGains: 500, assignedFreibetrag: 0 }],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      expect(result.remainingFreibetrag).toBeGreaterThan(0)
      expect(result.recommendations.some((r) => r.includes('Freibetrag nicht genutzt'))).toBe(true)
    })

    it('should handle multiple accounts with equal distribution needs', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [
          { id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: 0 },
          { id: '2', name: 'Bank B', expectedCapitalGains: 2000, assignedFreibetrag: 0 },
        ],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      // First account in sorted order should get all Freibetrag
      const totalAssigned = result.accounts.reduce((sum, acc) => sum + acc.assignedFreibetrag, 0)
      expect(totalAssigned).toBe(1000)
    })

    it('should handle zero capital gains gracefully', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [{ id: '1', name: 'Bank A', expectedCapitalGains: 0, assignedFreibetrag: 0 }],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      const bankA = result.accounts.find((acc) => acc.id === '1')
      expect(bankA?.assignedFreibetrag).toBe(0)
      expect(result.remainingFreibetrag).toBe(1000)
    })

    it('should mark distribution as optimal when fully utilized', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [{ id: '1', name: 'Bank A', expectedCapitalGains: 5000, assignedFreibetrag: 0 }],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      expect(result.isOptimal).toBe(true)
      expect(result.remainingFreibetrag).toBe(0)
    })
  })

  describe('validateFreistellungsauftragConfig', () => {
    it('should validate valid configuration', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [
          { id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: 500 },
          { id: '2', name: 'Bank B', expectedCapitalGains: 1000, assignedFreibetrag: 500 },
        ],
      }

      const errors = validateFreistellungsauftragConfig(config)
      expect(errors).toHaveLength(0)
    })

    it('should reject negative total Freibetrag', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: -100,
        accounts: [{ id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: 0 }],
      }

      const errors = validateFreistellungsauftragConfig(config)
      expect(errors).toContain('Gesamt-Freibetrag muss positiv sein')
    })

    it('should reject Freibetrag exceeding legal limit', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 2500, // More than couple limit of 2000€
        accounts: [{ id: '1', name: 'Bank A', expectedCapitalGains: 5000, assignedFreibetrag: 2500 }],
      }

      const errors = validateFreistellungsauftragConfig(config)
      expect(errors).toContain('Gesamt-Freibetrag darf 2.000 € nicht überschreiten (max. für Ehepaare)')
    })

    it('should require at least one account', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [],
      }

      const errors = validateFreistellungsauftragConfig(config)
      expect(errors).toContain('Mindestens ein Konto muss vorhanden sein')
    })

    it('should reject over-assignment of Freibetrag', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [
          { id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: 700 },
          { id: '2', name: 'Bank B', expectedCapitalGains: 1000, assignedFreibetrag: 500 },
        ],
      }

      const errors = validateFreistellungsauftragConfig(config)
      expect(errors.some((e) => e.includes('überschreitet Gesamt-Freibetrag'))).toBe(true)
    })

    it('should reject negative expected capital gains', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [{ id: '1', name: 'Bank A', expectedCapitalGains: -500, assignedFreibetrag: 0 }],
      }

      const errors = validateFreistellungsauftragConfig(config)
      expect(errors.some((e) => e.includes('Erwartete Kapitalerträge müssen positiv sein'))).toBe(true)
    })

    it('should reject negative assigned Freibetrag', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [{ id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: -100 }],
      }

      const errors = validateFreistellungsauftragConfig(config)
      expect(errors.some((e) => e.includes('Zugewiesener Freibetrag muss positiv sein'))).toBe(true)
    })

    it('should detect duplicate account IDs', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000,
        accounts: [
          { id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: 500 },
          { id: '1', name: 'Bank B', expectedCapitalGains: 1000, assignedFreibetrag: 500 },
        ],
      }

      const errors = validateFreistellungsauftragConfig(config)
      expect(errors).toContain('Doppelte Konto-IDs gefunden')
    })
  })

  describe('calculateEffectiveTaxRates', () => {
    it('should calculate effective tax rate for single account', () => {
      const accounts: BankAccount[] = [
        { id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: 1000 },
      ]

      const rates = calculateEffectiveTaxRates(accounts, defaultSteuerlast, defaultTeilfreistellung)

      // Taxable gains: 2000 * 0.7 = 1400€
      // After Freibetrag: 1400 - 1000 = 400€
      // Tax: 400 * 0.26375 = 105.5€
      // Effective rate: 105.5 / 2000 = 5.275%
      expect(rates[0].taxAmount).toBeCloseTo(105.5, 2)
      expect(rates[0].effectiveTaxRate).toBeCloseTo(0.05275, 5)
    })

    it('should calculate effective tax rate for multiple accounts', () => {
      const accounts: BankAccount[] = [
        { id: '1', name: 'Bank A', expectedCapitalGains: 2000, assignedFreibetrag: 1000 },
        { id: '2', name: 'Bank B', expectedCapitalGains: 1000, assignedFreibetrag: 0 },
      ]

      const rates = calculateEffectiveTaxRates(accounts, defaultSteuerlast, defaultTeilfreistellung)

      expect(rates).toHaveLength(2)

      // Bank A: (2000 * 0.7 - 1000) * 0.26375 = 105.5€
      expect(rates[0].taxAmount).toBeCloseTo(105.5, 2)

      // Bank B: (1000 * 0.7 - 0) * 0.26375 = 184.625€
      expect(rates[1].taxAmount).toBeCloseTo(184.625, 2)
    })

    it('should handle zero capital gains', () => {
      const accounts: BankAccount[] = [{ id: '1', name: 'Bank A', expectedCapitalGains: 0, assignedFreibetrag: 0 }]

      const rates = calculateEffectiveTaxRates(accounts, defaultSteuerlast, defaultTeilfreistellung)

      expect(rates[0].taxAmount).toBe(0)
      expect(rates[0].effectiveTaxRate).toBe(0)
    })

    it('should handle full Freibetrag coverage', () => {
      const accounts: BankAccount[] = [{ id: '1', name: 'Bank A', expectedCapitalGains: 1000, assignedFreibetrag: 700 }]

      const rates = calculateEffectiveTaxRates(accounts, defaultSteuerlast, defaultTeilfreistellung)

      // Taxable gains: 1000 * 0.7 = 700€
      // After Freibetrag: 700 - 700 = 0€
      // Tax: 0€
      expect(rates[0].taxAmount).toBe(0)
      expect(rates[0].effectiveTaxRate).toBe(0)
    })
  })

  describe('Real-world scenarios', () => {
    it('should optimize for typical individual investor with 3 accounts', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 1000, // Individual investor
        accounts: [
          { id: '1', name: 'Hausbk DKB', expectedCapitalGains: 3000, assignedFreibetrag: 0 },
          { id: '2', name: 'Trade Republic', expectedCapitalGains: 1500, assignedFreibetrag: 0 },
          { id: '3', name: 'ING', expectedCapitalGains: 800, assignedFreibetrag: 0 },
        ],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      // DKB has highest gains, should get all Freibetrag
      const dkb = result.accounts.find((acc) => acc.name === 'Hausbk DKB')
      expect(dkb?.assignedFreibetrag).toBe(1000)

      // Other accounts should get nothing
      const tr = result.accounts.find((acc) => acc.name === 'Trade Republic')
      expect(tr?.assignedFreibetrag).toBe(0)

      const ing = result.accounts.find((acc) => acc.name === 'ING')
      expect(ing?.assignedFreibetrag).toBe(0)

      expect(result.totalTaxSaved).toBeCloseTo(263.75, 2) // 1000 * 0.26375
    })

    it('should optimize for married couple with higher Freibetrag', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 2000, // Married couple
        accounts: [
          { id: '1', name: 'Gemeinsames Depot', expectedCapitalGains: 8000, assignedFreibetrag: 0 },
          { id: '2', name: 'Partner 1', expectedCapitalGains: 2000, assignedFreibetrag: 0 },
          { id: '3', name: 'Partner 2', expectedCapitalGains: 1500, assignedFreibetrag: 0 },
        ],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      // Gemeinsames Depot has highest gains, should get all 2000€
      const joint = result.accounts.find((acc) => acc.name === 'Gemeinsames Depot')
      expect(joint?.assignedFreibetrag).toBe(2000)

      expect(result.totalAssignedFreibetrag).toBe(2000)
      expect(result.totalTaxSaved).toBeCloseTo(527.5, 2) // 2000 * 0.26375
    })

    it('should handle scenario where Freibetrag exceeds all taxable gains', () => {
      const config: FreistellungsauftragConfig = {
        totalFreibetrag: 2000,
        accounts: [
          { id: '1', name: 'Low-gain Account', expectedCapitalGains: 500, assignedFreibetrag: 0 },
          { id: '2', name: 'Another Low-gain', expectedCapitalGains: 300, assignedFreibetrag: 0 },
        ],
      }

      const result = optimizeFreistellungsauftrag(config, defaultSteuerlast, defaultTeilfreistellung)

      // Total taxable gains: (500 + 300) * 0.7 = 560€
      expect(result.totalAssignedFreibetrag).toBe(560)
      expect(result.remainingFreibetrag).toBe(1440)
      expect(result.recommendations.some((r) => r.includes('1440.00 € Freibetrag nicht genutzt'))).toBe(true)
    })
  })
})
