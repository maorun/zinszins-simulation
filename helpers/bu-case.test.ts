import { describe, it, expect } from 'vitest'
import {
  getErtragsanteil,
  calculateAgeAtBUStart,
  calculateBUCaseForYear,
  type BUCaseConfig,
} from './bu-case'

describe('getErtragsanteil', () => {
  it('returns correct value for age 1', () => {
    expect(getErtragsanteil(1)).toBe(59)
  })

  it('returns 59 - age for ages 2-17 (Sonderregel)', () => {
    expect(getErtragsanteil(2)).toBe(57)
    expect(getErtragsanteil(10)).toBe(49)
    expect(getErtragsanteil(17)).toBe(42)
  })

  it('returns correct value for age 27', () => {
    expect(getErtragsanteil(27)).toBe(42)
  })

  it('returns correct value for age 40', () => {
    expect(getErtragsanteil(40)).toBe(36)
  })

  it('returns correct value for age 50', () => {
    expect(getErtragsanteil(50)).toBe(32)
  })

  it('returns correct value for age 60', () => {
    expect(getErtragsanteil(60)).toBe(28)
  })

  it('returns 21 for age above 67 (Mindestwert)', () => {
    expect(getErtragsanteil(70)).toBe(21)
    expect(getErtragsanteil(100)).toBe(21)
  })
})

describe('calculateAgeAtBUStart', () => {
  it('calculates age correctly', () => {
    expect(calculateAgeAtBUStart(1980, 2025)).toBe(45)
    expect(calculateAgeAtBUStart(1990, 2030)).toBe(40)
  })
})

describe('calculateBUCaseForYear', () => {
  const baseConfig: BUCaseConfig = {
    startYear: 2025,
    endYear: null,
    monthlyBUPension: 2000,
    monthlyIncomeReduction: 3000,
    birthYear: 1980,
    applyLeibrentenBesteuerung: true,
  }

  it('returns zero effect for years before BU start', () => {
    const result = calculateBUCaseForYear(baseConfig, 2024)
    expect(result.annualNetEffect).toBe(0)
    expect(result.annualBUPension).toBe(0)
    expect(result.annualIncomeReduction).toBe(0)
  })

  it('calculates correct annual amounts during BU period', () => {
    const result = calculateBUCaseForYear(baseConfig, 2025)
    expect(result.annualBUPension).toBe(24000) // 2000 × 12
    expect(result.annualIncomeReduction).toBe(36000) // 3000 × 12
    expect(result.annualNetEffect).toBe(-12000) // 24000 - 36000
  })

  it('calculates age at BU start correctly', () => {
    const result = calculateBUCaseForYear(baseConfig, 2025)
    expect(result.ageAtBUStart).toBe(45) // 2025 - 1980
  })

  it('returns ertragsanteil when Leibrenten-Besteuerung is active', () => {
    const result = calculateBUCaseForYear(baseConfig, 2025)
    expect(result.ertragsanteil).toBe(34) // Age 45 → 34%
  })

  it('returns null ertragsanteil when Leibrenten-Besteuerung is inactive', () => {
    const config = { ...baseConfig, applyLeibrentenBesteuerung: false }
    const result = calculateBUCaseForYear(config, 2025)
    expect(result.ertragsanteil).toBeNull()
  })

  it('marks permanent BU as not temporary', () => {
    const result = calculateBUCaseForYear(baseConfig, 2025)
    expect(result.isTemporary).toBe(false)
    expect(result.durationYears).toBe(0)
  })

  describe('time-limited BU case', () => {
    const temporaryConfig: BUCaseConfig = {
      ...baseConfig,
      endYear: 2030,
    }

    it('marks time-limited BU as temporary', () => {
      const result = calculateBUCaseForYear(temporaryConfig, 2025)
      expect(result.isTemporary).toBe(true)
      expect(result.durationYears).toBe(5) // 2030 - 2025
    })

    it('calculates amounts during BU period', () => {
      const result = calculateBUCaseForYear(temporaryConfig, 2028)
      expect(result.annualBUPension).toBe(24000)
      expect(result.annualIncomeReduction).toBe(36000)
      expect(result.annualNetEffect).toBe(-12000)
    })

    it('returns zero effect after BU end year', () => {
      const result = calculateBUCaseForYear(temporaryConfig, 2030)
      expect(result.annualNetEffect).toBe(0)
      expect(result.annualBUPension).toBe(0)
    })

    it('returns zero effect in the year of BU end (exclusive)', () => {
      const result = calculateBUCaseForYear(temporaryConfig, 2030)
      expect(result.annualNetEffect).toBe(0)
    })
  })

  it('handles BU-Rente greater than income reduction (positive net effect)', () => {
    const config: BUCaseConfig = {
      ...baseConfig,
      monthlyBUPension: 4000,
      monthlyIncomeReduction: 2000,
    }
    const result = calculateBUCaseForYear(config, 2025)
    expect(result.annualNetEffect).toBe(24000) // (4000 - 2000) × 12
  })

  it('handles zero income reduction', () => {
    const config: BUCaseConfig = {
      ...baseConfig,
      monthlyIncomeReduction: 0,
    }
    const result = calculateBUCaseForYear(config, 2025)
    expect(result.annualNetEffect).toBe(24000) // 2000 × 12
  })

  it('handles zero BU pension', () => {
    const config: BUCaseConfig = {
      ...baseConfig,
      monthlyBUPension: 0,
    }
    const result = calculateBUCaseForYear(config, 2025)
    expect(result.annualNetEffect).toBe(-36000) // -3000 × 12
  })
})
