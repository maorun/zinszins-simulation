import { describe, it, expect } from 'vitest'
import {
  type BetriebsrenteConfig,
  getBetriebsrenteTaxLimits,
  calculateBetriebsrenteTaxBenefit,
  calculateBetriebsrentePensionTaxation,
  calculateBetriebsrenteLifetimeBenefit,
} from './betriebsrente'

describe('betriebsrente', () => {
  describe('getBetriebsrenteTaxLimits', () => {
    it('should return correct limits for 2023', () => {
      const limits = getBetriebsrenteTaxLimits(2023)

      expect(limits.year).toBe(2023)
      expect(limits.contributionAssessmentCeilingWest).toBe(87600)
      // 8% of BBG
      expect(limits.maxTaxFreeEmployerContribution).toBe(7008)
      // 4% of BBG
      expect(limits.maxSocialSecurityFreeContribution).toBe(3504)
    })

    it('should return correct limits for 2024', () => {
      const limits = getBetriebsrenteTaxLimits(2024)

      expect(limits.year).toBe(2024)
      expect(limits.contributionAssessmentCeilingWest).toBe(90600)
      // 8% of BBG
      expect(limits.maxTaxFreeEmployerContribution).toBe(7248)
      // 4% of BBG
      expect(limits.maxSocialSecurityFreeContribution).toBe(3624)
    })

    it('should return correct limits for 2025', () => {
      const limits = getBetriebsrenteTaxLimits(2025)

      expect(limits.year).toBe(2025)
      expect(limits.contributionAssessmentCeilingWest).toBe(93300)
      // 8% of BBG
      expect(limits.maxTaxFreeEmployerContribution).toBe(7464)
      // 4% of BBG
      expect(limits.maxSocialSecurityFreeContribution).toBe(3732)
    })

    it('should project limits for future years with 3% annual increase', () => {
      const limits2026 = getBetriebsrenteTaxLimits(2026)
      const limits2027 = getBetriebsrenteTaxLimits(2027)

      // 2026: 93300 * 1.03 = 96099
      expect(limits2026.contributionAssessmentCeilingWest).toBeCloseTo(96099, 0)
      expect(limits2026.maxTaxFreeEmployerContribution).toBeCloseTo(7687.92, 1)
      expect(limits2026.maxSocialSecurityFreeContribution).toBeCloseTo(3843.96, 1)

      // 2027: 93300 * 1.03^2 = 98981.97
      expect(limits2027.contributionAssessmentCeilingWest).toBeCloseTo(98981.97, 0)
      expect(limits2027.maxTaxFreeEmployerContribution).toBeCloseTo(7918.56, 1)
      expect(limits2027.maxSocialSecurityFreeContribution).toBeCloseTo(3959.28, 1)
    })
  })

  describe('calculateBetriebsrenteTaxBenefit', () => {
    it('should calculate correct benefits when within all limits', () => {
      const result = calculateBetriebsrenteTaxBenefit(
        3000, // employee contribution (within 4% BBG limit)
        2000, // employer contribution (within 8% BBG limit)
        2024,
        0.35, // 35% tax rate
        0.2, // 20% social security rate
      )

      expect(result.totalContribution).toBe(5000)
      expect(result.employeeContribution).toBe(3000)
      expect(result.employerContribution).toBe(2000)
      expect(result.taxFreeEmployerContribution).toBe(2000)
      expect(result.socialSecurityFreeEmployeeContribution).toBe(3000)

      // Tax savings: 3000 * 0.35 = 1050
      expect(result.taxSavingsEmployee).toBe(1050)
      // Social security savings: 3000 * 0.20 = 600
      expect(result.socialSecuritySavingsEmployee).toBe(600)
      // Total: 1050 + 600 = 1650
      expect(result.totalBenefit).toBe(1650)

      expect(result.exceedsTaxLimits).toBe(false)
      expect(result.exceedsSocialSecurityLimits).toBe(false)
    })

    it('should handle employee contribution exceeding 4% BBG limit', () => {
      const result = calculateBetriebsrenteTaxBenefit(
        5000, // employee contribution (exceeds 4% BBG limit of 3624 for 2024)
        2000,
        2024,
        0.35,
        0.2,
      )

      expect(result.employeeContribution).toBe(5000)
      // Social security free only up to 3624 (4% of 90600)
      expect(result.socialSecurityFreeEmployeeContribution).toBe(3624)

      // Tax savings still on full amount: 5000 * 0.35 = 1750
      expect(result.taxSavingsEmployee).toBe(1750)
      // Social security savings only on limit: 3624 * 0.20 = 724.8
      expect(result.socialSecuritySavingsEmployee).toBeCloseTo(724.8, 1)

      expect(result.exceedsSocialSecurityLimits).toBe(true)
    })

    it('should handle employer contribution exceeding 8% BBG limit', () => {
      const result = calculateBetriebsrenteTaxBenefit(
        3000,
        8000, // employer contribution (exceeds 8% BBG limit of 7248 for 2024)
        2024,
        0.35,
        0.2,
      )

      expect(result.employerContribution).toBe(8000)
      // Tax free only up to 7248 (8% of 90600)
      expect(result.taxFreeEmployerContribution).toBe(7248)

      expect(result.exceedsTaxLimits).toBe(true)
    })

    it('should calculate correctly with different tax rates', () => {
      const result42 = calculateBetriebsrenteTaxBenefit(3000, 2000, 2024, 0.42, 0.2)
      const result25 = calculateBetriebsrenteTaxBenefit(3000, 2000, 2024, 0.25, 0.2)

      // Tax savings with 42% rate: 3000 * 0.42 = 1260
      expect(result42.taxSavingsEmployee).toBe(1260)
      // Tax savings with 25% rate: 3000 * 0.25 = 750
      expect(result25.taxSavingsEmployee).toBe(750)

      // Social security savings should be the same
      expect(result42.socialSecuritySavingsEmployee).toBe(600)
      expect(result25.socialSecuritySavingsEmployee).toBe(600)
    })

    it('should handle zero contributions', () => {
      const result = calculateBetriebsrenteTaxBenefit(0, 0, 2024, 0.35, 0.2)

      expect(result.totalContribution).toBe(0)
      expect(result.taxSavingsEmployee).toBe(0)
      expect(result.socialSecuritySavingsEmployee).toBe(0)
      expect(result.totalBenefit).toBe(0)
      expect(result.exceedsTaxLimits).toBe(false)
      expect(result.exceedsSocialSecurityLimits).toBe(false)
    })
  })

  describe('calculateBetriebsrentePensionTaxation', () => {
    it('should calculate correct taxation for first year of pension', () => {
      const result = calculateBetriebsrentePensionTaxation(
        2000, // monthly pension
        2040, // payout year
        2040, // pension start year
        0.01, // 1% annual increase
        0.25, // 25% tax rate
        true, // statutory health insurance
        true, // has children
      )

      expect(result.grossMonthlyPension).toBe(2000)
      expect(result.grossAnnualPension).toBe(24000)

      // 100% taxable for bAV
      expect(result.taxablePercentage).toBe(100)
      expect(result.taxableAmount).toBe(24000)

      // Income tax: 24000 * 0.25 = 6000
      expect(result.incomeTax).toBe(6000)

      // Health insurance: 24000 * 0.073 = 1752
      expect(result.healthInsuranceContribution).toBeCloseTo(1752, 0)

      // Care insurance (with children): 24000 * 0.0305 = 732
      expect(result.careInsuranceContribution).toBeCloseTo(732, 0)

      // Total social security: 1752 + 732 = 2484
      expect(result.totalSocialSecurityContributions).toBeCloseTo(2484, 0)

      // Net pension: 24000 - 6000 - 2484 = 15516
      expect(result.netAnnualPension).toBeCloseTo(15516, 0)
    })

    it('should apply pension increase correctly', () => {
      const firstYear = calculateBetriebsrentePensionTaxation(2000, 2040, 2040, 0.02, 0.25, true, true)
      const thirdYear = calculateBetriebsrentePensionTaxation(2000, 2042, 2040, 0.02, 0.25, true, true)

      // First year: 2000
      expect(firstYear.grossMonthlyPension).toBe(2000)

      // Third year (2 years later): 2000 * 1.02^2 = 2080.8
      expect(thirdYear.grossMonthlyPension).toBeCloseTo(2080.8, 1)
      expect(thirdYear.grossAnnualPension).toBeCloseTo(24969.6, 0)
    })

    it('should calculate higher care insurance for childless individuals', () => {
      const withChildren = calculateBetriebsrentePensionTaxation(2000, 2040, 2040, 0.01, 0.25, true, true)
      const withoutChildren = calculateBetriebsrentePensionTaxation(2000, 2040, 2040, 0.01, 0.25, true, false)

      // With children: 24000 * 0.0305 = 732
      expect(withChildren.careInsuranceContribution).toBeCloseTo(732, 0)

      // Without children (childless surcharge): 24000 * 0.04 = 960
      expect(withoutChildren.careInsuranceContribution).toBeCloseTo(960, 0)

      // Net pension should be lower without children
      expect(withoutChildren.netAnnualPension).toBeLessThan(withChildren.netAnnualPension)
    })

    it('should not charge social security for private health insurance', () => {
      const statutory = calculateBetriebsrentePensionTaxation(2000, 2040, 2040, 0.01, 0.25, true, true)
      const privateInsurance = calculateBetriebsrentePensionTaxation(2000, 2040, 2040, 0.01, 0.25, false, true)

      // Statutory: should have health and care insurance
      expect(statutory.healthInsuranceContribution).toBeGreaterThan(0)
      expect(statutory.careInsuranceContribution).toBeGreaterThan(0)
      expect(statutory.totalSocialSecurityContributions).toBeGreaterThan(0)

      // Private: no social security contributions
      expect(privateInsurance.healthInsuranceContribution).toBe(0)
      expect(privateInsurance.careInsuranceContribution).toBe(0)
      expect(privateInsurance.totalSocialSecurityContributions).toBe(0)

      // Net pension should be higher with private insurance
      expect(privateInsurance.netAnnualPension).toBeGreaterThan(statutory.netAnnualPension)
    })

    it('should handle different tax rates correctly', () => {
      const lowTax = calculateBetriebsrentePensionTaxation(2000, 2040, 2040, 0.01, 0.15, true, true)
      const highTax = calculateBetriebsrentePensionTaxation(2000, 2040, 2040, 0.01, 0.42, true, true)

      // Low tax: 24000 * 0.15 = 3600
      expect(lowTax.incomeTax).toBe(3600)
      // High tax: 24000 * 0.42 = 10080
      expect(highTax.incomeTax).toBe(10080)

      // Social security should be the same
      expect(lowTax.totalSocialSecurityContributions).toBeCloseTo(highTax.totalSocialSecurityContributions, 0)

      // Net pension should be higher with lower tax
      expect(lowTax.netAnnualPension).toBeGreaterThan(highTax.netAnnualPension)
    })
  })

  describe('calculateBetriebsrenteLifetimeBenefit', () => {
    const basicConfig: BetriebsrenteConfig = {
      enabled: true,
      annualEmployeeContribution: 3600,
      annualEmployerContribution: 1800,
      pensionStartYear: 2050,
      expectedMonthlyPension: 500,
      pensionIncreaseRate: 0.01,
      implementationType: 'direktversicherung',
    }

    it('should calculate lifetime benefit correctly for typical scenario', () => {
      const result = calculateBetriebsrenteLifetimeBenefit(
        basicConfig,
        2024, // start contributions
        2049, // end contributions (26 years)
        2074, // end pension payments (25 years of pension)
        0.35, // working tax rate
        0.25, // pension tax rate
        0.2, // social security rate
        true, // statutory health insurance
        true, // has children
      )

      // 26 years of contributions: (3600 + 1800) * 26 = 140,400
      expect(result.totalContributions).toBe(140400)

      // Tax benefits during contribution should be positive
      expect(result.totalTaxBenefitsContribution).toBeGreaterThan(0)

      // Should receive pension for 25 years
      expect(result.totalGrossPension).toBeGreaterThan(0)
      expect(result.totalNetPension).toBeGreaterThan(0)
      expect(result.totalNetPension).toBeLessThan(result.totalGrossPension)

      // Should pay taxes
      expect(result.totalTaxesPaid).toBeGreaterThan(0)
      expect(result.totalSocialSecurityPaid).toBeGreaterThan(0)

      // Net lifetime benefit should be positive (pension is worth it)
      expect(result.netLifetimeBenefit).toBeGreaterThan(0)

      // ROI should be positive
      expect(result.roi).toBeGreaterThan(0)
    })

    it('should show employer contributions increase total benefit', () => {
      const withEmployer = calculateBetriebsrenteLifetimeBenefit(
        basicConfig,
        2024,
        2049,
        2074,
        0.35,
        0.25,
        0.2,
        true,
        true,
      )

      const configWithoutEmployer = {
        ...basicConfig,
        annualEmployerContribution: 0,
        // Lower expected pension without employer contributions (realistic scenario)
        expectedMonthlyPension: 333, // 500 * (3600/5400) = approximately 333
      }

      const withoutEmployer = calculateBetriebsrenteLifetimeBenefit(
        configWithoutEmployer,
        2024,
        2049,
        2074,
        0.35,
        0.25,
        0.2,
        true,
        true,
      )

      // Total contributions are different
      expect(withEmployer.totalContributions).toBeGreaterThan(withoutEmployer.totalContributions)

      // With employer contributions, pension should be higher
      expect(withEmployer.totalGrossPension).toBeGreaterThan(withoutEmployer.totalGrossPension)

      // Net lifetime benefit should be higher with employer contribution
      // (more pension received for the same employee input)
      expect(withEmployer.netLifetimeBenefit).toBeGreaterThan(withoutEmployer.netLifetimeBenefit)

      // ROI should be much higher with employer contribution
      expect(withEmployer.roi).toBeGreaterThan(withoutEmployer.roi)
    })

    it('should calculate higher benefit with lower pension tax rate', () => {
      const lowPensionTax = calculateBetriebsrenteLifetimeBenefit(
        basicConfig,
        2024,
        2049,
        2074,
        0.35,
        0.15,
        0.2,
        true,
        true,
      )
      const highPensionTax = calculateBetriebsrenteLifetimeBenefit(
        basicConfig,
        2024,
        2049,
        2074,
        0.35,
        0.42,
        0.2,
        true,
        true,
      )

      // Lower pension tax should result in higher net pension
      expect(lowPensionTax.totalNetPension).toBeGreaterThan(highPensionTax.totalNetPension)
      expect(lowPensionTax.totalTaxesPaid).toBeLessThan(highPensionTax.totalTaxesPaid)

      // And higher net lifetime benefit
      expect(lowPensionTax.netLifetimeBenefit).toBeGreaterThan(highPensionTax.netLifetimeBenefit)
      expect(lowPensionTax.roi).toBeGreaterThan(highPensionTax.roi)
    })

    it('should show benefit of private vs statutory health insurance in retirement', () => {
      const statutory = calculateBetriebsrenteLifetimeBenefit(
        basicConfig,
        2024,
        2049,
        2074,
        0.35,
        0.25,
        0.2,
        true,
        true,
      )
      const privateInsurance = calculateBetriebsrenteLifetimeBenefit(
        basicConfig,
        2024,
        2049,
        2074,
        0.35,
        0.25,
        0.2,
        false,
        true,
      )

      // Private insurance: no social security contributions on pension
      expect(privateInsurance.totalSocialSecurityPaid).toBe(0)
      expect(statutory.totalSocialSecurityPaid).toBeGreaterThan(0)

      // Private should have higher net pension
      expect(privateInsurance.totalNetPension).toBeGreaterThan(statutory.totalNetPension)
      expect(privateInsurance.netLifetimeBenefit).toBeGreaterThan(statutory.netLifetimeBenefit)
    })

    it('should handle shorter contribution period', () => {
      const longContribution = calculateBetriebsrenteLifetimeBenefit(
        basicConfig,
        2024,
        2049,
        2074,
        0.35,
        0.25,
        0.2,
        true,
        true,
      )
      const shortContribution = calculateBetriebsrenteLifetimeBenefit(
        basicConfig,
        2034,
        2049,
        2074,
        0.35,
        0.25,
        0.2,
        true,
        true,
      )

      // Shorter contribution period means less total contributions
      expect(shortContribution.totalContributions).toBeLessThan(longContribution.totalContributions)

      // But same pension payout (assuming same monthly amount)
      expect(shortContribution.totalGrossPension).toBe(longContribution.totalGrossPension)

      // ROI should be higher for shorter contribution period (same output, less input)
      expect(shortContribution.roi).toBeGreaterThan(longContribution.roi)
    })

    it('should handle edge case of zero contributions', () => {
      const zeroConfig: BetriebsrenteConfig = {
        ...basicConfig,
        annualEmployeeContribution: 0,
        annualEmployerContribution: 0,
        expectedMonthlyPension: 0,
      }

      const result = calculateBetriebsrenteLifetimeBenefit(zeroConfig, 2024, 2049, 2074, 0.35, 0.25, 0.2, true, true)

      expect(result.totalContributions).toBe(0)
      expect(result.totalTaxBenefitsContribution).toBe(0)
      expect(result.totalGrossPension).toBe(0)
      expect(result.totalNetPension).toBe(0)
      expect(result.netLifetimeBenefit).toBe(0)
      expect(result.roi).toBe(0)
    })
  })

  describe('Integration scenarios', () => {
    it('should demonstrate typical employee scenario', () => {
      // Typical employee: 60k salary, converts 200€/month (2400€/year), employer adds 100€/month (1200€/year)
      const benefit2024 = calculateBetriebsrenteTaxBenefit(2400, 1200, 2024, 0.35, 0.2)

      // Total contribution: 3600€
      expect(benefit2024.totalContribution).toBe(3600)

      // Within all limits (4% of BBG 2024 = 3624€)
      expect(benefit2024.exceedsTaxLimits).toBe(false)
      expect(benefit2024.exceedsSocialSecurityLimits).toBe(false)

      // Tax savings: 2400 * 0.35 = 840€
      expect(benefit2024.taxSavingsEmployee).toBe(840)
      // Social security savings: 2400 * 0.20 = 480€
      expect(benefit2024.socialSecuritySavingsEmployee).toBe(480)
      // Total annual benefit: 1320€
      expect(benefit2024.totalBenefit).toBe(1320)
    })

    it('should demonstrate high-earner scenario exceeding limits', () => {
      // High earner: converts 500€/month (6000€/year), employer adds 300€/month (3600€/year)
      const benefit2024 = calculateBetriebsrenteTaxBenefit(6000, 3600, 2024, 0.42, 0.2)

      // Total contribution: 9600€
      expect(benefit2024.totalContribution).toBe(9600)

      // Exceeds 4% BBG limit (3624€) for social security
      expect(benefit2024.exceedsSocialSecurityLimits).toBe(true)
      expect(benefit2024.socialSecurityFreeEmployeeContribution).toBe(3624)

      // Full tax savings on 6000€: 6000 * 0.42 = 2520€
      expect(benefit2024.taxSavingsEmployee).toBe(2520)
      // But social security savings only on 3624€: 3624 * 0.20 = 724.8€
      expect(benefit2024.socialSecuritySavingsEmployee).toBeCloseTo(724.8, 1)
    })

    it('should compare early vs late retirement', () => {
      const config: BetriebsrenteConfig = {
        enabled: true,
        annualEmployeeContribution: 3600,
        annualEmployerContribution: 1800,
        pensionStartYear: 2050,
        expectedMonthlyPension: 500,
        pensionIncreaseRate: 0.01,
        implementationType: 'direktversicherung',
      }

      // Retire at 67, live to 92 (25 years of pension)
      const normalRetirement = calculateBetriebsrenteLifetimeBenefit(
        config,
        2024,
        2049,
        2074,
        0.35,
        0.25,
        0.2,
        true,
        true,
      )

      // Retire at 67, live to 87 (20 years of pension)
      const shorterLife = calculateBetriebsrenteLifetimeBenefit(config, 2024, 2049, 2069, 0.35, 0.25, 0.2, true, true)

      // Same contributions
      expect(normalRetirement.totalContributions).toBe(shorterLife.totalContributions)
      expect(normalRetirement.totalTaxBenefitsContribution).toBe(shorterLife.totalTaxBenefitsContribution)

      // But different pension amounts
      expect(normalRetirement.totalGrossPension).toBeGreaterThan(shorterLife.totalGrossPension)
      expect(normalRetirement.totalNetPension).toBeGreaterThan(shorterLife.totalNetPension)

      // Better lifetime benefit with longer life
      expect(normalRetirement.netLifetimeBenefit).toBeGreaterThan(shorterLife.netLifetimeBenefit)
      expect(normalRetirement.roi).toBeGreaterThan(shorterLife.roi)
    })
  })
})
