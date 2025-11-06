import { describe, it, expect } from 'vitest'
import {
  StatutoryPensionConfig,
  CoupleStatutoryPensionConfig,
  calculateStatutoryPensionForYear,
  calculateStatutoryPension,
  calculateCoupleStatutoryPension,
  createDefaultStatutoryPensionConfig,
  createDefaultCoupleStatutoryPensionConfig,
  calculatePensionStartYear,
  calculateCoupleRetirementStartYear,
  calculateRetirementStartYear,
  estimateMonthlyPensionFromTaxReturn,
  estimateTaxablePercentageFromTaxReturn,
  convertLegacyToCoupleConfig,
} from './statutory-pension'

describe('statutory-pension', () => {
  describe('createDefaultStatutoryPensionConfig', () => {
    it('should create a default configuration', () => {
      const config = createDefaultStatutoryPensionConfig()

      expect(config.enabled).toBe(true)
      expect(config.startYear).toBe(2041)
      expect(config.monthlyAmount).toBe(1500)
      expect(config.annualIncreaseRate).toBe(1.0)
      expect(config.taxablePercentage).toBe(80)
      expect(config.retirementAge).toBe(67)
    })
  })

  describe('calculatePensionStartYear', () => {
    it('should calculate start year from birth year and retirement age', () => {
      expect(calculatePensionStartYear(1974)).toBe(2041) // 1974 + 67 = 2041
      expect(calculatePensionStartYear(1980, 65)).toBe(2045) // 1980 + 65 = 2045
    })
  })

  describe('calculateCoupleRetirementStartYear', () => {
    it('should return the earlier retirement year for couples', () => {
      // Person 1: 1974 + 67 = 2041, Person 2: 1976 + 67 = 2043
      expect(calculateCoupleRetirementStartYear(1974, 1976)).toBe(2041)

      // Person 1: 1980 + 65 = 2045, Person 2: 1978 + 67 = 2045
      expect(calculateCoupleRetirementStartYear(1980, 1978, 65, 67)).toBe(2045)

      // Person 1: 1985 + 67 = 2052, Person 2: 1982 + 65 = 2047
      expect(calculateCoupleRetirementStartYear(1985, 1982, 67, 65)).toBe(2047)
    })

    it('should handle different retirement ages for each person', () => {
      // Person 1: 1970 + 65 = 2035, Person 2: 1975 + 67 = 2042
      expect(calculateCoupleRetirementStartYear(1970, 1975, 65, 67)).toBe(2035)

      // Person 1: 1980 + 67 = 2047, Person 2: 1978 + 63 = 2041
      expect(calculateCoupleRetirementStartYear(1980, 1978, 67, 63)).toBe(2041)
    })
  })

  describe('calculateRetirementStartYear', () => {
    it('should handle individual planning mode', () => {
      expect(calculateRetirementStartYear('individual', 1974)).toBe(2041)
      expect(calculateRetirementStartYear('individual', 1980, undefined, 65)).toBe(2045)
      expect(calculateRetirementStartYear('individual')).toBe(null)
    })

    it('should handle couple planning mode', () => {
      expect(calculateRetirementStartYear('couple', 1974, 1976)).toBe(2041)
      expect(calculateRetirementStartYear('couple', 1980, 1978, 65, 67)).toBe(2045)
      expect(calculateRetirementStartYear('couple', 1974)).toBe(null) // Missing spouse birth year
      expect(calculateRetirementStartYear('couple')).toBe(null) // Missing both birth years
    })

    it('should handle custom retirement ages', () => {
      expect(calculateRetirementStartYear('individual', 1974, undefined, 65)).toBe(2039)
      expect(calculateRetirementStartYear('couple', 1974, 1976, 65, 67)).toBe(2039)
    })
  })

  describe('estimateMonthlyPensionFromTaxReturn', () => {
    it('should calculate monthly pension from annual amount', () => {
      const taxReturnData = {
        taxYear: 2023,
        annualPensionReceived: 18000,
        taxablePortion: 14400,
      }

      expect(estimateMonthlyPensionFromTaxReturn(taxReturnData)).toBe(1500)
    })
  })

  describe('estimateTaxablePercentageFromTaxReturn', () => {
    it('should calculate taxable percentage from tax return data', () => {
      const taxReturnData = {
        taxYear: 2023,
        annualPensionReceived: 18000,
        taxablePortion: 14400,
      }

      expect(estimateTaxablePercentageFromTaxReturn(taxReturnData)).toBe(80)
    })

    it('should return default percentage when annual pension is zero', () => {
      const taxReturnData = {
        taxYear: 2023,
        annualPensionReceived: 0,
        taxablePortion: 0,
      }

      expect(estimateTaxablePercentageFromTaxReturn(taxReturnData)).toBe(80)
    })
  })

  describe('calculateStatutoryPensionForYear', () => {
    const baseConfig: StatutoryPensionConfig = {
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500,
      annualIncreaseRate: 1.0,
      taxablePercentage: 80,
    }

    it('should return zero values when pension is disabled', () => {
      const config = { ...baseConfig, enabled: false }
      const result = calculateStatutoryPensionForYear(config, 2041)

      expect(result.grossAnnualAmount).toBe(0)
      expect(result.grossMonthlyAmount).toBe(0)
      expect(result.taxableAmount).toBe(0)
      expect(result.incomeTax).toBe(0)
      expect(result.netAnnualAmount).toBe(0)
    })

    it('should return zero values before start year', () => {
      const result = calculateStatutoryPensionForYear(baseConfig, 2040)

      expect(result.grossAnnualAmount).toBe(0)
      expect(result.grossMonthlyAmount).toBe(0)
      expect(result.taxableAmount).toBe(0)
      expect(result.incomeTax).toBe(0)
      expect(result.netAnnualAmount).toBe(0)
    })

    it('should calculate pension for the start year without increases', () => {
      const result = calculateStatutoryPensionForYear(baseConfig, 2041)

      expect(result.grossAnnualAmount).toBe(18000) // 1500 * 12
      expect(result.grossMonthlyAmount).toBe(1500)
      expect(result.taxableAmount).toBe(14400) // 18000 * 0.8
      expect(result.incomeTax).toBe(0) // No income tax rate provided
      expect(result.netAnnualAmount).toBe(18000)
      expect(result.adjustmentFactor).toBe(1)
    })

    it('should apply annual increases correctly', () => {
      const result = calculateStatutoryPensionForYear(baseConfig, 2043) // 2 years after start

      const expectedAdjustment = Math.pow(1.01, 2) // 1.01^2 = 1.0201
      const expectedMonthly = 1500 * expectedAdjustment // ~1530.15
      const expectedAnnual = expectedMonthly * 12 // ~18361.8

      expect(result.grossAnnualAmount).toBeCloseTo(expectedAnnual, 2)
      expect(result.grossMonthlyAmount).toBeCloseTo(expectedMonthly, 2)
      expect(result.taxableAmount).toBeCloseTo(expectedAnnual * 0.8, 2)
      expect(result.adjustmentFactor).toBeCloseTo(expectedAdjustment, 4)
    })

    it('should calculate income tax correctly', () => {
      const incomeTaxRate = 25 // 25%
      const grundfreibetrag = 10000 // €10,000 basic allowance

      const result = calculateStatutoryPensionForYear(baseConfig, 2041, incomeTaxRate, grundfreibetrag)

      const taxableAmount = 14400 // 18000 * 0.8
      const taxableAboveAllowance = taxableAmount - grundfreibetrag // 14400 - 10000 = 4400
      const expectedTax = taxableAboveAllowance * 0.25 // 4400 * 0.25 = 1100

      expect(result.incomeTax).toBe(expectedTax)
      expect(result.netAnnualAmount).toBe(18000 - expectedTax) // 18000 - 1100 = 16900
    })

    it('should not apply tax when taxable amount is below grundfreibetrag', () => {
      const incomeTaxRate = 25
      const grundfreibetrag = 20000 // Higher than taxable amount

      const result = calculateStatutoryPensionForYear(baseConfig, 2041, incomeTaxRate, grundfreibetrag)

      expect(result.incomeTax).toBe(0)
      expect(result.netAnnualAmount).toBe(18000)
    })
  })

  describe('calculateStatutoryPension', () => {
    const baseConfig: StatutoryPensionConfig = {
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500,
      annualIncreaseRate: 1.0,
      taxablePercentage: 80,
    }

    it('should calculate pension for multiple years', () => {
      const result = calculateStatutoryPension(baseConfig, 2040, 2043)

      expect(Object.keys(result)).toHaveLength(4)
      expect(result[2040].grossAnnualAmount).toBe(0) // Before start year
      expect(result[2041].grossAnnualAmount).toBe(18000) // Start year
      expect(result[2042].grossAnnualAmount).toBeCloseTo(18180, 2) // 1% increase
      expect(result[2043].grossAnnualAmount).toBeCloseTo(18361.8, 2) // 2% total increase
    })

    it('should apply different grundfreibetrag per year', () => {
      const grundfreibetragPerYear = {
        2041: 10000,
        2042: 10500,
        2043: 11000,
      }
      const incomeTaxRate = 25

      const result = calculateStatutoryPension(baseConfig, 2041, 2043, incomeTaxRate, grundfreibetragPerYear)

      // 2041: taxable 14400, above allowance 4400, tax 1100
      expect(result[2041].incomeTax).toBe(1100)

      // 2042: taxable ~14544, above allowance ~4044, tax ~1011
      expect(result[2042].incomeTax).toBeCloseTo(1011, 0)

      // 2043: taxable ~14690, above allowance ~3690, tax ~922.5
      expect(result[2043].incomeTax).toBeCloseTo(922.5, 0)
    })

    it('should handle disabled pension correctly', () => {
      const config = { ...baseConfig, enabled: false }
      const result = calculateStatutoryPension(config, 2041, 2043)

      Object.values(result).forEach((yearResult) => {
        expect(yearResult.grossAnnualAmount).toBe(0)
        expect(yearResult.netAnnualAmount).toBe(0)
      })
    })
  })

  describe('integration with tax return data', () => {
    it('should work with complete tax return configuration', () => {
      const config: StatutoryPensionConfig = {
        enabled: true,
        startYear: 2041,
        monthlyAmount: 1600, // Will be overridden by tax return data
        annualIncreaseRate: 1.2,
        taxablePercentage: 75, // Will be overridden by tax return data
        birthYear: 1974,
        retirementAge: 67,
        taxReturnData: {
          taxYear: 2023,
          annualPensionReceived: 19200,
          taxablePortion: 15360,
        },
      }

      // Estimate values from tax return
      const estimatedMonthly = estimateMonthlyPensionFromTaxReturn(config.taxReturnData!)
      const estimatedTaxablePercentage = estimateTaxablePercentageFromTaxReturn(config.taxReturnData!)

      expect(estimatedMonthly).toBe(1600)
      expect(estimatedTaxablePercentage).toBe(80)

      // Use estimated values in calculation
      const adjustedConfig = {
        ...config,
        monthlyAmount: estimatedMonthly,
        taxablePercentage: estimatedTaxablePercentage,
      }

      const result = calculateStatutoryPensionForYear(adjustedConfig, 2041)
      expect(result.grossAnnualAmount).toBe(19200)
      expect(result.taxableAmount).toBe(15360)
    })
  })
})

describe('Couple Statutory Pension Calculations', () => {
  it('should create default couple configuration', () => {
    const config = createDefaultCoupleStatutoryPensionConfig()

    expect(config.enabled).toBe(false)
    expect(config.planningMode).toBe('couple')
    expect(config.couple).toBeDefined()
    expect(config.couple!.person1.personId).toBe(1)
    expect(config.couple!.person2.personId).toBe(2)
    expect(config.couple!.person1.personName).toBe('Person 1')
    expect(config.couple!.person2.personName).toBe('Person 2')
  })

  it('should calculate couple pension with different amounts and start years', () => {
    const config: CoupleStatutoryPensionConfig = {
      enabled: true,
      planningMode: 'couple',
      couple: {
        person1: {
          ...createDefaultStatutoryPensionConfig(),
          enabled: true,
          startYear: 2041,
          monthlyAmount: 1500, // €1500/month = €18000/year
          personId: 1,
          personName: 'Person 1',
        },
        person2: {
          ...createDefaultStatutoryPensionConfig(),
          enabled: true,
          startYear: 2043, // Starts 2 years later
          monthlyAmount: 1200, // €1200/month = €14400/year
          personId: 2,
          personName: 'Person 2',
        },
      },
    }

    const result = calculateCoupleStatutoryPension(config, 2041, 2044)

    // 2041: Only person1 gets pension
    expect(result[2041].person1).toBeDefined()
    expect(result[2041].person2).toBeUndefined()
    expect(result[2041].person1!.grossAnnualAmount).toBe(18000)
    expect(result[2041].combined.grossAnnualAmount).toBe(18000)

    // 2042: Only person1 gets pension
    expect(result[2042].person1).toBeDefined()
    expect(result[2042].person2).toBeUndefined()
    expect(result[2042].combined.grossAnnualAmount).toBe(result[2042].person1!.grossAnnualAmount)

    // 2043: Both get pension
    expect(result[2043].person1).toBeDefined()
    expect(result[2043].person2).toBeDefined()
    expect(result[2043].person2!.grossAnnualAmount).toBe(14400)
    expect(result[2043].combined.grossAnnualAmount).toBe(
      result[2043].person1!.grossAnnualAmount + result[2043].person2!.grossAnnualAmount,
    )

    // 2044: Both get pension with annual increases
    expect(result[2044].person1).toBeDefined()
    expect(result[2044].person2).toBeDefined()
    expect(result[2044].combined.grossAnnualAmount).toBeGreaterThan(result[2043].combined.grossAnnualAmount)
  })

  it('should handle individual planning mode within couple config', () => {
    const config: CoupleStatutoryPensionConfig = {
      enabled: true,
      planningMode: 'individual',
      individual: {
        ...createDefaultStatutoryPensionConfig(),
        enabled: true,
        startYear: 2041,
        monthlyAmount: 1500,
      },
    }

    const result = calculateCoupleStatutoryPension(config, 2041, 2042)

    expect(result[2041].person1).toBeUndefined()
    expect(result[2041].person2).toBeUndefined()
    expect(result[2041].combined.grossAnnualAmount).toBe(18000)
  })

  it('should handle disabled couple pension', () => {
    const config: CoupleStatutoryPensionConfig = {
      enabled: false,
      planningMode: 'couple',
      couple: {
        person1: {
          ...createDefaultStatutoryPensionConfig(),
          enabled: true, // Individual configs enabled, but overall disabled
          personId: 1,
        },
        person2: {
          ...createDefaultStatutoryPensionConfig(),
          enabled: true,
          personId: 2,
        },
      },
    }

    const result = calculateCoupleStatutoryPension(config, 2041, 2042)

    expect(result[2041].person1).toBeUndefined()
    expect(result[2041].person2).toBeUndefined()
    expect(result[2041].combined.grossAnnualAmount).toBe(0)
  })

  it('should convert legacy config to couple config for individual mode', () => {
    const legacyConfig: StatutoryPensionConfig = {
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500,
      annualIncreaseRate: 1.0,
      taxablePercentage: 80,
    }

    const coupleConfig = convertLegacyToCoupleConfig(legacyConfig, 'individual')

    expect(coupleConfig.enabled).toBe(true)
    expect(coupleConfig.planningMode).toBe('individual')
    expect(coupleConfig.individual).toEqual(legacyConfig)
  })

  it('should convert legacy config to couple config for couple mode', () => {
    const legacyConfig: StatutoryPensionConfig = {
      enabled: true,
      startYear: 2041,
      monthlyAmount: 1500,
      annualIncreaseRate: 1.0,
      taxablePercentage: 80,
    }

    const coupleConfig = convertLegacyToCoupleConfig(legacyConfig, 'couple')

    expect(coupleConfig.enabled).toBe(true)
    expect(coupleConfig.planningMode).toBe('couple')
    expect(coupleConfig.couple).toBeDefined()
    expect(coupleConfig.couple!.person1.monthlyAmount).toBe(1500)
    expect(coupleConfig.couple!.person2.monthlyAmount).toBe(1500)
    expect(coupleConfig.couple!.person1.personId).toBe(1)
    expect(coupleConfig.couple!.person2.personId).toBe(2)
  })

  it('should handle null legacy config', () => {
    const coupleConfig = convertLegacyToCoupleConfig(null, 'couple')

    expect(coupleConfig.enabled).toBe(false)
    expect(coupleConfig.planningMode).toBe('couple')
    expect(coupleConfig.couple).toBeDefined()
  })
})
