import { describe, it, expect } from 'vitest'
import {
  type PensionComparisonConfig,
  comparePensionTypes,
} from './pension-comparison'
import type { StatutoryPensionConfig } from './statutory-pension'
import type { RiesterRenteConfig } from './riester-rente'
import type { RuerupRenteConfig } from './ruerup-rente'
import type { BetriebsrenteConfig } from './betriebsrente'

describe('pension-comparison', () => {
  const baseConfig: PensionComparisonConfig = {
    currentYear: 2024,
    pensionStartYear: 2050,
    pensionEndYear: 2075,
    personalTaxRate: 0.35,
    pensionTaxRate: 0.25,
    annualGrossIncome: 60000,
    socialSecurityRate: 0.20,
    inStatutoryHealthInsurance: true,
    hasChildren: true,
  }

  describe('comparePensionTypes', () => {
    it('should return empty comparisons when no pension types are enabled', () => {
      const result = comparePensionTypes(baseConfig)

      expect(result.comparisons).toHaveLength(4)
      expect(result.comparisons.every((c) => !c.enabled)).toBe(true)
      expect(result.summary.totalAnnualContributions).toBe(0)
      expect(result.summary.totalMonthlyPensionNet).toBe(0)
      expect(result.bestROI).toBeNull()
      expect(result.bestNetBenefit).toBeNull()
    })

    it('should compare statutory pension correctly', () => {
      const statutoryPension: StatutoryPensionConfig = {
        enabled: true,
        startYear: 2050,
        monthlyAmount: 1500,
        annualIncreaseRate: 0.01,
        taxablePercentage: 80,
      }

      const result = comparePensionTypes({
        ...baseConfig,
        statutoryPension,
      })

      const statutory = result.comparisons.find((c) => c.type === 'statutory')
      expect(statutory).toBeDefined()
      expect(statutory!.enabled).toBe(true)
      expect(statutory!.monthlyPensionGross).toBe(1500)
      expect(statutory!.annualContribution).toBe(0) // Paid through social security
    })

    it('should compare Riester-Rente correctly', () => {
      const riesterRente: RiesterRenteConfig = {
        enabled: true,
        annualGrossIncome: 60000,
        annualContribution: 2400,
        numberOfChildren: 2,
        childrenBirthYears: [2015, 2018],
        pensionStartYear: 2050,
        expectedMonthlyPension: 400,
        pensionIncreaseRate: 0.01,
        useWohnRiester: false,
      }

      const result = comparePensionTypes({
        ...baseConfig,
        riesterRente,
      })

      const riester = result.comparisons.find((c) => c.type === 'riester')
      expect(riester).toBeDefined()
      expect(riester!.enabled).toBe(true)
      expect(riester!.annualContribution).toBe(2400)
      expect(riester!.monthlyPensionGross).toBe(400)
      expect(riester!.annualTaxBenefit).toBeGreaterThan(0)
    })

    it('should compare Rürup-Rente correctly', () => {
      const ruerupRente: RuerupRenteConfig = {
        enabled: true,
        annualContribution: 5000,
        pensionStartYear: 2050,
        expectedMonthlyPension: 800,
        civilStatus: 'single',
        pensionIncreaseRate: 0.01,
      }

      const result = comparePensionTypes({
        ...baseConfig,
        ruerupRente,
      })

      const ruerup = result.comparisons.find((c) => c.type === 'ruerup')
      expect(ruerup).toBeDefined()
      expect(ruerup!.enabled).toBe(true)
      expect(ruerup!.annualContribution).toBe(5000)
      expect(ruerup!.monthlyPensionGross).toBe(800)
      expect(ruerup!.annualTaxBenefit).toBeGreaterThan(0)
    })

    it('should compare Betriebsrente correctly', () => {
      const betriebsrente: BetriebsrenteConfig = {
        enabled: true,
        annualEmployeeContribution: 3600,
        annualEmployerContribution: 1800,
        pensionStartYear: 2050,
        expectedMonthlyPension: 500,
        pensionIncreaseRate: 0.01,
        implementationType: 'direktversicherung',
      }

      const result = comparePensionTypes({
        ...baseConfig,
        betriebsrente,
      })

      const bav = result.comparisons.find((c) => c.type === 'betriebsrente')
      expect(bav).toBeDefined()
      expect(bav!.enabled).toBe(true)
      expect(bav!.annualContribution).toBe(3600)
      expect(bav!.annualEmployerContribution).toBe(1800)
      expect(bav!.monthlyPensionGross).toBe(500)
      expect(bav!.annualTaxBenefit).toBeGreaterThan(0)
    })

    it('should calculate combined summary correctly', () => {
      const riesterRente: RiesterRenteConfig = {
        enabled: true,
        annualGrossIncome: 60000,
        annualContribution: 2400,
        numberOfChildren: 2,
        childrenBirthYears: [2015, 2018],
        pensionStartYear: 2050,
        expectedMonthlyPension: 400,
        pensionIncreaseRate: 0.01,
        useWohnRiester: false,
      }

      const betriebsrente: BetriebsrenteConfig = {
        enabled: true,
        annualEmployeeContribution: 3600,
        annualEmployerContribution: 1800,
        pensionStartYear: 2050,
        expectedMonthlyPension: 500,
        pensionIncreaseRate: 0.01,
        implementationType: 'direktversicherung',
      }

      const result = comparePensionTypes({
        ...baseConfig,
        riesterRente,
        betriebsrente,
      })

      // Total annual contributions should be sum of Riester + Betriebsrente employee
      expect(result.summary.totalAnnualContributions).toBe(2400 + 3600)

      // Total monthly pension should be sum of both
      expect(result.summary.totalMonthlyPensionNet).toBeGreaterThan(0)

      // Tax benefits should be combined
      expect(result.summary.totalAnnualTaxBenefits).toBeGreaterThan(0)

      // Should have two enabled comparisons
      const enabledComparisons = result.comparisons.filter((c) => c.enabled)
      expect(enabledComparisons).toHaveLength(2)
    })

    it('should identify best ROI correctly', () => {
      const riesterRente: RiesterRenteConfig = {
        enabled: true,
        annualGrossIncome: 60000,
        annualContribution: 2400,
        numberOfChildren: 2,
        childrenBirthYears: [2015, 2018],
        pensionStartYear: 2050,
        expectedMonthlyPension: 400,
        pensionIncreaseRate: 0.01,
        useWohnRiester: false,
      }

      const ruerupRente: RuerupRenteConfig = {
        enabled: true,
        annualContribution: 5000,
        pensionStartYear: 2050,
        expectedMonthlyPension: 800,
        civilStatus: 'single',
        pensionIncreaseRate: 0.01,
      }

      const result = comparePensionTypes({
        ...baseConfig,
        riesterRente,
        ruerupRente,
      })

      expect(result.bestROI).not.toBeNull()
      expect(result.bestROI!.type).toMatch(/riester|ruerup/)
      expect(result.bestROI!.roi).toBeGreaterThan(0)

      // Best ROI should have highest ROI among enabled pensions
      const enabledComparisons = result.comparisons.filter((c) => c.enabled)
      const maxROI = Math.max(...enabledComparisons.map((c) => c.roi))
      expect(result.bestROI!.roi).toBe(maxROI)
    })

    it('should identify best net benefit correctly', () => {
      const riesterRente: RiesterRenteConfig = {
        enabled: true,
        annualGrossIncome: 60000,
        annualContribution: 2400,
        numberOfChildren: 2,
        childrenBirthYears: [2015, 2018],
        pensionStartYear: 2050,
        expectedMonthlyPension: 400,
        pensionIncreaseRate: 0.01,
        useWohnRiester: false,
      }

      const betriebsrente: BetriebsrenteConfig = {
        enabled: true,
        annualEmployeeContribution: 3600,
        annualEmployerContribution: 1800,
        pensionStartYear: 2050,
        expectedMonthlyPension: 500,
        pensionIncreaseRate: 0.01,
        implementationType: 'direktversicherung',
      }

      const result = comparePensionTypes({
        ...baseConfig,
        riesterRente,
        betriebsrente,
      })

      expect(result.bestNetBenefit).not.toBeNull()
      expect(result.bestNetBenefit!.type).toMatch(/riester|betriebsrente/)
      expect(result.bestNetBenefit!.netLifetimeBenefit).toBeGreaterThan(0)

      // Best net benefit should have highest net lifetime benefit
      const enabledComparisons = result.comparisons.filter((c) => c.enabled)
      const maxNetBenefit = Math.max(...enabledComparisons.map((c) => c.netLifetimeBenefit))
      expect(result.bestNetBenefit!.netLifetimeBenefit).toBe(maxNetBenefit)
    })

    it('should handle all pension types enabled', () => {
      const statutoryPension: StatutoryPensionConfig = {
        enabled: true,
        startYear: 2050,
        monthlyAmount: 1500,
        annualIncreaseRate: 0.01,
        taxablePercentage: 80,
      }

      const riesterRente: RiesterRenteConfig = {
        enabled: true,
        annualGrossIncome: 60000,
        annualContribution: 2400,
        numberOfChildren: 2,
        childrenBirthYears: [2015, 2018],
        pensionStartYear: 2050,
        expectedMonthlyPension: 400,
        pensionIncreaseRate: 0.01,
        useWohnRiester: false,
      }

      const ruerupRente: RuerupRenteConfig = {
        enabled: true,
        annualContribution: 5000,
        pensionStartYear: 2050,
        expectedMonthlyPension: 800,
        civilStatus: 'single',
        pensionIncreaseRate: 0.01,
      }

      const betriebsrente: BetriebsrenteConfig = {
        enabled: true,
        annualEmployeeContribution: 3600,
        annualEmployerContribution: 1800,
        pensionStartYear: 2050,
        expectedMonthlyPension: 500,
        pensionIncreaseRate: 0.01,
        implementationType: 'direktversicherung',
      }

      const result = comparePensionTypes({
        ...baseConfig,
        statutoryPension,
        riesterRente,
        ruerupRente,
        betriebsrente,
      })

      const enabledComparisons = result.comparisons.filter((c) => c.enabled)
      expect(enabledComparisons).toHaveLength(4)

      // All pension types should be present
      expect(result.comparisons.find((c) => c.type === 'statutory')!.enabled).toBe(true)
      expect(result.comparisons.find((c) => c.type === 'riester')!.enabled).toBe(true)
      expect(result.comparisons.find((c) => c.type === 'ruerup')!.enabled).toBe(true)
      expect(result.comparisons.find((c) => c.type === 'betriebsrente')!.enabled).toBe(true)

      // Summary should reflect all pensions
      expect(result.summary.totalMonthlyPensionNet).toBeGreaterThan(0)
      expect(result.summary.totalAnnualContributions).toBeGreaterThan(0)
    })

    it('should calculate realistic scenario correctly', () => {
      // Realistic scenario: Average employee with statutory + company pension
      const statutoryPension: StatutoryPensionConfig = {
        enabled: true,
        startYear: 2050,
        monthlyAmount: 1800, // Average statutory pension
        annualIncreaseRate: 0.01,
        taxablePercentage: 80,
      }

      const betriebsrente: BetriebsrenteConfig = {
        enabled: true,
        annualEmployeeContribution: 2400, // 200€/month
        annualEmployerContribution: 1200, // 100€/month employer contribution
        pensionStartYear: 2050,
        expectedMonthlyPension: 400,
        pensionIncreaseRate: 0.01,
        implementationType: 'direktversicherung',
      }

      const result = comparePensionTypes({
        ...baseConfig,
        statutoryPension,
        betriebsrente,
      })

      const enabledComparisons = result.comparisons.filter((c) => c.enabled)
      expect(enabledComparisons).toHaveLength(2)

      // Total monthly pension should be reasonable (after taxes)
      // Statutory: 1800 * (1 - 0.80) = 360 (simplified, ignoring tax rate)
      // Betriebsrente: ~300 after taxes and social security
      expect(result.summary.totalMonthlyPensionNet).toBeGreaterThan(500)
      expect(result.summary.totalMonthlyPensionNet).toBeLessThan(1500)

      // Should have positive combined ROI
      expect(result.summary.combinedROI).toBeGreaterThan(0)

      // Best options should be identified
      expect(result.bestROI).not.toBeNull()
      expect(result.bestNetBenefit).not.toBeNull()
    })

    it('should handle different tax rates correctly', () => {
      const riesterRente: RiesterRenteConfig = {
        enabled: true,
        annualGrossIncome: 60000,
        annualContribution: 2400,
        numberOfChildren: 0,
        childrenBirthYears: [],
        pensionStartYear: 2050,
        expectedMonthlyPension: 400,
        pensionIncreaseRate: 0.01,
        useWohnRiester: false,
      }

      const resultHighTax = comparePensionTypes({
        ...baseConfig,
        personalTaxRate: 0.42,
        pensionTaxRate: 0.35,
        riesterRente,
      })

      const resultLowTax = comparePensionTypes({
        ...baseConfig,
        personalTaxRate: 0.25,
        pensionTaxRate: 0.15,
        riesterRente,
      })

      const riesterHighTax = resultHighTax.comparisons.find((c) => c.type === 'riester')!
      const riesterLowTax = resultLowTax.comparisons.find((c) => c.type === 'riester')!

      // Higher working tax rate should mean higher tax benefits
      expect(riesterHighTax.annualTaxBenefit).toBeGreaterThan(riesterLowTax.annualTaxBenefit)

      // Lower pension tax rate should mean higher net pension
      expect(riesterLowTax.monthlyPensionNet).toBeGreaterThan(riesterHighTax.monthlyPensionNet)
    })
  })

  describe('Edge cases', () => {
    it('should handle zero contributions gracefully', () => {
      const betriebsrente: BetriebsrenteConfig = {
        enabled: true,
        annualEmployeeContribution: 0,
        annualEmployerContribution: 0,
        pensionStartYear: 2050,
        expectedMonthlyPension: 0,
        pensionIncreaseRate: 0.01,
        implementationType: 'direktversicherung',
      }

      const result = comparePensionTypes({
        ...baseConfig,
        betriebsrente,
      })

      const bav = result.comparisons.find((c) => c.type === 'betriebsrente')!
      expect(bav.enabled).toBe(true)
      expect(bav.annualContribution).toBe(0)
      expect(bav.monthlyPensionNet).toBe(0)
      expect(bav.roi).toBe(0)
    })

    it('should handle very short retirement period', () => {
      const riesterRente: RiesterRenteConfig = {
        enabled: true,
        annualGrossIncome: 60000,
        annualContribution: 2400,
        numberOfChildren: 0,
        childrenBirthYears: [],
        pensionStartYear: 2050,
        expectedMonthlyPension: 400,
        pensionIncreaseRate: 0.01,
        useWohnRiester: false,
      }

      const result = comparePensionTypes({
        ...baseConfig,
        pensionStartYear: 2050,
        pensionEndYear: 2055, // Only 5 years
        riesterRente,
      })

      const riester = result.comparisons.find((c) => c.type === 'riester')!
      expect(riester.enabled).toBe(true)
      expect(riester.totalNetPension).toBeGreaterThan(0)
      expect(riester.roi).toBeLessThan(1) // Lower ROI for short period
    })

    it('should handle very long retirement period', () => {
      const ruerupRente: RuerupRenteConfig = {
        enabled: true,
        annualContribution: 5000,
        pensionStartYear: 2050,
        expectedMonthlyPension: 800,
        civilStatus: 'single',
        pensionIncreaseRate: 0.01,
      }

      const result = comparePensionTypes({
        ...baseConfig,
        pensionStartYear: 2050,
        pensionEndYear: 2100, // 50 years!
        ruerupRente,
      })

      const ruerup = result.comparisons.find((c) => c.type === 'ruerup')!
      expect(ruerup.enabled).toBe(true)
      expect(ruerup.totalNetPension).toBeGreaterThan(0)
      expect(ruerup.roi).toBeGreaterThan(1) // High ROI for long period
    })
  })
})
