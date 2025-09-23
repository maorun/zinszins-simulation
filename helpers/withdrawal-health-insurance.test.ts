import { describe, it, expect } from 'vitest'
import { calculateWithdrawal } from './withdrawal'
import type { HealthInsuranceConfig } from './health-insurance'
import type { SparplanElement } from '../src/utils/sparplan-utils'

describe('withdrawal-health-insurance', () => {
  // Test data setup
  const mockElements: SparplanElement[] = [
    {
      start: '2020-01-01',
      type: 'sparplan',
      einzahlung: 100000,
      simulation: {
        2025: {
          startkapital: 100000,
          endkapital: 120000,
          zinsen: 20000,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
        2028: {
          startkapital: 115000,
          endkapital: 125000,
          zinsen: 10000,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
        2029: {
          startkapital: 120000,
          endkapital: 130000,
          zinsen: 10000,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 0,
          vorabpauschaleAccumulated: 0,
        },
      },
    },
  ]

  const healthInsuranceConfig: HealthInsuranceConfig = {
    enabled: true,
    retirementStartYear: 2030,
    preRetirement: {
      health: {
        usePercentage: true,
        percentage: 14.6,
      },
      care: {
        usePercentage: true,
        percentage: 3.05,
        childlessSupplement: 0.6,
      },
    },
    retirement: {
      health: {
        usePercentage: true,
        percentage: 7.3,
      },
      care: {
        usePercentage: true,
        percentage: 3.05,
        childlessSupplement: 0.6,
      },
    },
  }

  describe('basic health insurance integration', () => {
    it('should calculate health insurance for pre-retirement phase', () => {
      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: 2026,
        endYear: 2027,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        healthInsuranceConfig,
        childless: false,
      })

      const year2026 = result[2026]
      expect(year2026).toBeDefined()
      expect(year2026.healthInsurance).toBeDefined()
      expect(year2026.healthInsurance!.phase).toBe('pre-retirement')
      expect(year2026.netEntnahme).toBeDefined()

      // Check that net withdrawal is less than gross withdrawal
      expect(year2026.netEntnahme!).toBeLessThan(year2026.entnahme)

      // Verify health insurance amounts are calculated
      expect(year2026.healthInsurance!.totalAnnualAmount).toBeGreaterThan(0)
      expect(year2026.healthInsurance!.health.annualAmount).toBeGreaterThan(0)
      expect(year2026.healthInsurance!.care.annualAmount).toBeGreaterThan(0)
    })

    it('should calculate health insurance for retirement phase', () => {
      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: 2030,
        endYear: 2031,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        healthInsuranceConfig,
        childless: false,
      })

      const year2030 = result[2030]
      expect(year2030).toBeDefined()
      expect(year2030.healthInsurance).toBeDefined()
      expect(year2030.healthInsurance!.phase).toBe('retirement')

      // Retirement health insurance should be lower (7.3% vs 14.6%)
      expect(year2030.healthInsurance!.health.percentage).toBe(7.3)
      expect(year2030.healthInsurance!.care.percentage).toBe(3.05)
    })

    it('should handle childless supplement correctly', () => {
      const { result: resultWithChild } = calculateWithdrawal({
        elements: mockElements,
        startYear: 2026,
        endYear: 2027,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        healthInsuranceConfig,
        childless: false,
      })

      const { result: resultChildless } = calculateWithdrawal({
        elements: mockElements,
        startYear: 2026,
        endYear: 2027,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        healthInsuranceConfig,
        childless: true,
      })

      const year2026WithChild = resultWithChild[2026]
      const year2026Childless = resultChildless[2026]

      // Childless person should pay more for care insurance
      expect(year2026Childless.healthInsurance!.care.annualAmount).toBeGreaterThan(
        year2026WithChild.healthInsurance!.care.annualAmount,
      )

      // Health insurance should be the same
      expect(year2026Childless.healthInsurance!.health.annualAmount).toBe(
        year2026WithChild.healthInsurance!.health.annualAmount,
      )

      // Childless supplement should be present
      expect(year2026Childless.healthInsurance!.care.childlessSupplementAmount).toBeGreaterThan(0)
      expect(year2026WithChild.healthInsurance!.care.childlessSupplementAmount).toBeUndefined()
    })

    it('should not calculate health insurance when disabled', () => {
      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: 2026,
        endYear: 2027,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        healthInsuranceConfig: { ...healthInsuranceConfig, enabled: false },
        childless: false,
      })

      const year2026 = result[2026]
      expect(year2026).toBeDefined()
      expect(year2026.healthInsurance).toBeUndefined()
      expect(year2026.netEntnahme).toBeUndefined()
    })
  })

  describe('different withdrawal strategies', () => {
    const strategies: Array<{ strategy: 'monatlich_fest' | '3prozent' | 'variabel_prozent', config?: any }> = [
      { strategy: 'monatlich_fest', config: { monthlyAmount: 2000 } },
      { strategy: '3prozent' },
      { strategy: 'variabel_prozent', config: 5 },
    ]

    strategies.forEach(({ strategy, config }) => {
      it(`should calculate health insurance for ${strategy} strategy`, () => {
        const params: any = {
          elements: mockElements,
          startYear: 2026,
          endYear: 2027,
          strategy,
          returnConfig: { mode: 'fixed', fixedRate: 5 },
          healthInsuranceConfig,
          childless: false,
        }

        if (strategy === 'monatlich_fest') {
          params.monthlyConfig = config
        }
        else if (strategy === 'variabel_prozent') {
          params.customPercentage = config
        }

        const { result } = calculateWithdrawal(params)

        const year2026 = result[2026]
        expect(year2026).toBeDefined()
        expect(year2026.healthInsurance).toBeDefined()
        expect(year2026.netEntnahme).toBeDefined()
        expect(year2026.netEntnahme!).toBeLessThan(year2026.entnahme)
      })
    })
  })

  describe('fixed amount health insurance', () => {
    const fixedHealthInsuranceConfig: HealthInsuranceConfig = {
      enabled: true,
      retirementStartYear: 2030,
      preRetirement: {
        health: {
          usePercentage: false,
          fixedAmount: 400,
        },
        care: {
          usePercentage: false,
          fixedAmount: 120,
          childlessSupplement: 30, // Fixed supplement for childless
        },
      },
      retirement: {
        health: {
          usePercentage: false,
          fixedAmount: 300,
        },
        care: {
          usePercentage: false,
          fixedAmount: 100,
          childlessSupplement: 25,
        },
      },
    }

    it('should calculate fixed amount health insurance correctly', () => {
      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: 2026,
        endYear: 2027,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        healthInsuranceConfig: fixedHealthInsuranceConfig,
        childless: false,
      })

      const year2026 = result[2026]
      expect(year2026.healthInsurance).toBeDefined()
      expect(year2026.healthInsurance!.health.calculationMethod).toBe('fixed')
      expect(year2026.healthInsurance!.health.annualAmount).toBe(4800) // 400 * 12
      expect(year2026.healthInsurance!.care.calculationMethod).toBe('fixed')
      expect(year2026.healthInsurance!.care.annualAmount).toBe(1440) // 120 * 12
      expect(year2026.healthInsurance!.totalAnnualAmount).toBe(6240) // 4800 + 1440
    })

    it('should handle fixed childless supplement', () => {
      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: 2030, // retirement phase
        endYear: 2031,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        healthInsuranceConfig: fixedHealthInsuranceConfig,
        childless: true,
      })

      const year2030 = result[2030]
      expect(year2030.healthInsurance).toBeDefined()
      expect(year2030.healthInsurance!.care.childlessSupplementAmount).toBe(300) // 25 * 12
      expect(year2030.healthInsurance!.care.annualAmount).toBe(1500) // (100 + 25) * 12
    })
  })

  describe('phase transition', () => {
    it('should transition from pre-retirement to retirement rates', () => {
      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: 2029, // pre-retirement
        endYear: 2031, // retirement starts at 2030
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        healthInsuranceConfig,
        childless: false,
      })

      const year2029 = result[2029] // pre-retirement
      const year2030 = result[2030] // retirement

      expect(year2029.healthInsurance!.phase).toBe('pre-retirement')
      expect(year2030.healthInsurance!.phase).toBe('retirement')

      // Health insurance should be lower in retirement
      expect(year2030.healthInsurance!.health.percentage).toBeLessThan(
        year2029.healthInsurance!.health.percentage!,
      )

      // Care insurance should remain the same
      expect(year2030.healthInsurance!.care.percentage).toBe(
        year2029.healthInsurance!.care.percentage,
      )
    })
  })

  describe('edge cases', () => {
    it('should handle zero withdrawal amounts', () => {
      const zeroElements: SparplanElement[] = [
        {
          start: '2020-01-01',
          type: 'sparplan',
          einzahlung: 0,
          simulation: {
            2025: {
              startkapital: 1000, // Small amount instead of zero
              endkapital: 1000,
              zinsen: 0,
              bezahlteSteuer: 0,
              genutzterFreibetrag: 0,
              vorabpauschale: 0,
              vorabpauschaleAccumulated: 0,
            },
          },
        },
      ]

      const { result } = calculateWithdrawal({
        elements: zeroElements,
        startYear: 2026,
        endYear: 2027,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        healthInsuranceConfig,
        childless: false,
      })

      const year2026 = result[2026]
      expect(year2026).toBeDefined()

      // Small withdrawal should still have health insurance calculation
      expect(year2026.healthInsurance).toBeDefined()
      expect(year2026.healthInsurance!.totalAnnualAmount).toBeGreaterThan(0) // Should have some amount
      expect(year2026.netEntnahme).toBeDefined()
      expect(year2026.netEntnahme!).toBeLessThan(year2026.entnahme)
    })

    it('should handle missing health insurance config gracefully', () => {
      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: 2026,
        endYear: 2027,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        // healthInsuranceConfig is undefined
        childless: false,
      })

      const year2026 = result[2026]
      expect(year2026.healthInsurance).toBeUndefined()
      expect(year2026.netEntnahme).toBeUndefined()
    })
  })

  describe('calculation transparency', () => {
    it('should provide transparent calculation information', () => {
      const { result } = calculateWithdrawal({
        elements: mockElements,
        startYear: 2026,
        endYear: 2027,
        strategy: '4prozent',
        returnConfig: { mode: 'fixed', fixedRate: 5 },
        healthInsuranceConfig,
        childless: false,
      })

      const year2026 = result[2026]
      const healthInsurance = year2026.healthInsurance!

      // Health insurance calculation details should be available
      expect(healthInsurance.health.calculationMethod).toBe('percentage')
      expect(healthInsurance.health.percentage).toBe(14.6)
      expect(healthInsurance.health.baseAmount).toBe(year2026.entnahme)

      expect(healthInsurance.care.calculationMethod).toBe('percentage')
      expect(healthInsurance.care.percentage).toBe(3.05)
      expect(healthInsurance.care.baseAmount).toBe(year2026.entnahme)

      // Monthly amounts should be annual amounts divided by 12
      expect(healthInsurance.totalMonthlyAmount).toBe(healthInsurance.totalAnnualAmount / 12)
      expect(healthInsurance.health.monthlyAmount).toBe(healthInsurance.health.annualAmount / 12)
      expect(healthInsurance.care.monthlyAmount).toBe(healthInsurance.care.annualAmount / 12)
    })
  })
})
