import { describe, it, expect } from 'vitest'
import { calculateWithdrawal } from './withdrawal'
import { createDefaultHealthCareInsuranceConfig } from './health-care-insurance'
import type { SparplanElement } from '../src/utils/sparplan-utils'

describe('Withdrawal with Health Care Insurance Integration', () => {
  // Helper function to create test elements
  const createTestElements = (): SparplanElement[] => [
    {
      id: 'test-1',
      name: 'Test Investment',
      type: 'sparplan',
      start: '2024-01-01',
      einzahlung: 24000,
      betrag: 2000,
      jahresrendite: 0.05,
      teilfreistellungsquote: 0.3,
      thesaurierend: true,
      simulation: {
        2039: {
          startkapital: 480000,
          endkapital: 500000,
          zinsen: 20000,
          bezahlteSteuer: 0,
          genutzterFreibetrag: 0,
          vorabpauschale: 100,
          vorabpauschaleAccumulated: 1000,
        },
      },
    },
  ]

  const returnConfig = {
    mode: 'fixed' as const,
    fixedRate: 0.05,
  }

  it('should calculate withdrawal without health care insurance when disabled', () => {
    const elements = createTestElements()
    const healthCareInsuranceConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      enabled: false,
    }

    const { result } = calculateWithdrawal({
      elements,
      startYear: 2040,
      endYear: 2042,
      strategy: '4prozent',
      returnConfig,
      healthCareInsuranceConfig,
      birthYear: 1973,
    })

    // Should not have health care insurance data
    expect(result[2040].healthCareInsurance).toBeUndefined()
    expect(result[2041].healthCareInsurance).toBeUndefined()
    expect(result[2042].healthCareInsurance).toBeUndefined()

    // Should have normal withdrawal amounts
    expect(result[2040].entnahme).toBeGreaterThan(0)
  })

  it('should calculate health care insurance contributions when enabled', () => {
    const elements = createTestElements()
    const healthCareInsuranceConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      enabled: true,
      healthInsuranceRatePreRetirement: 14.6,
      careInsuranceRatePreRetirement: 3.05,
      healthInsuranceRateRetirement: 7.3,
      careInsuranceRateRetirement: 3.05,
      retirementStartYear: 2041,
    }

    const { result } = calculateWithdrawal({
      elements,
      startYear: 2040,
      endYear: 2042,
      strategy: '4prozent',
      returnConfig,
      healthCareInsuranceConfig,
      birthYear: 1973, // Age 67 in 2040
    })

    // 2040: Pre-retirement phase (higher rates)
    expect(result[2040].healthCareInsurance).toBeDefined()
    expect(result[2040].healthCareInsurance!.isRetirementPhase).toBe(false)
    expect(result[2040].healthCareInsurance!.effectiveHealthInsuranceRate).toBe(14.6)
    expect(result[2040].healthCareInsurance!.effectiveCareInsuranceRate).toBe(3.05)
    expect(result[2040].healthCareInsurance!.totalAnnual).toBeGreaterThan(0)

    // 2041: Retirement phase starts (lower rates)
    expect(result[2041].healthCareInsurance).toBeDefined()
    expect(result[2041].healthCareInsurance!.isRetirementPhase).toBe(true)
    expect(result[2041].healthCareInsurance!.effectiveHealthInsuranceRate).toBe(7.3)
    expect(result[2041].healthCareInsurance!.effectiveCareInsuranceRate).toBe(3.05)

    // Pre-retirement should have higher health insurance than retirement
    expect(result[2040].healthCareInsurance!.healthInsuranceAnnual)
      .toBeGreaterThan(result[2041].healthCareInsurance!.healthInsuranceAnnual)
  })

  it('should use fixed amounts when configured', () => {
    const elements = createTestElements()
    const healthCareInsuranceConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      enabled: true,
      useFixedAmounts: true,
      fixedHealthInsuranceMonthly: 400,
      fixedCareInsuranceMonthly: 150,
    }

    const { result } = calculateWithdrawal({
      elements,
      startYear: 2040,
      endYear: 2041,
      strategy: '4prozent',
      returnConfig,
      healthCareInsuranceConfig,
      birthYear: 1973,
    })

    expect(result[2040].healthCareInsurance).toBeDefined()
    expect(result[2040].healthCareInsurance!.usedFixedAmounts).toBe(true)
    expect(result[2040].healthCareInsurance!.healthInsuranceMonthly).toBe(400)
    expect(result[2040].healthCareInsurance!.careInsuranceMonthly).toBe(150)
    expect(result[2040].healthCareInsurance!.totalMonthly).toBe(550)
    expect(result[2040].healthCareInsurance!.totalAnnual).toBe(6600) // 550 * 12
  })

  it('should calculate health care insurance based on withdrawal + pension amounts', () => {
    const elements = createTestElements()
    const healthCareInsuranceConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      enabled: true,
      healthInsuranceRateRetirement: 7.3,
      careInsuranceRateRetirement: 3.05,
      retirementStartYear: 2040,
    }

    const statutoryPensionConfig = {
      enabled: true,
      startYear: 2040,
      monthlyAmount: 1500,
      annualIncreaseRate: 1.0,
      taxablePercentage: 80,
    }

    const { result } = calculateWithdrawal({
      elements,
      startYear: 2040,
      endYear: 2040,
      strategy: '4prozent',
      returnConfig,
      healthCareInsuranceConfig,
      statutoryPensionConfig,
      birthYear: 1973,
    })

    const withdrawalAmount = result[2040].entnahme
    const pensionAmount = result[2040].statutoryPension?.grossAnnualAmount || 0
    const totalIncome = withdrawalAmount + pensionAmount
    const expectedHealthInsurance = totalIncome * 0.073 // 7.3%
    const expectedCareInsurance = totalIncome * 0.0305 // 3.05%

    expect(result[2040].healthCareInsurance).toBeDefined()
    expect(result[2040].healthCareInsurance!.healthInsuranceAnnual).toBeCloseTo(expectedHealthInsurance, 1)
    expect(result[2040].healthCareInsurance!.careInsuranceAnnual).toBeCloseTo(expectedCareInsurance, 1)
  })

  it('should apply additional care insurance for childless individuals', () => {
    const elements = createTestElements()
    const healthCareInsuranceConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      enabled: true,
      careInsuranceRateRetirement: 3.05,
      additionalCareInsuranceForChildless: true,
      additionalCareInsuranceAge: 23,
      retirementStartYear: 2040,
    }

    const { result } = calculateWithdrawal({
      elements,
      startYear: 2040,
      endYear: 2040,
      strategy: '4prozent',
      returnConfig,
      healthCareInsuranceConfig,
      birthYear: 1973, // Age 67 in 2040, over 23
    })

    expect(result[2040].healthCareInsurance).toBeDefined()
    expect(result[2040].healthCareInsurance!.effectiveCareInsuranceRate).toBe(3.65) // 3.05 + 0.6
  })

  it('should apply income thresholds correctly', () => {
    const elements = createTestElements()
    const healthCareInsuranceConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      enabled: true,
      healthInsuranceRateRetirement: 7.3,
      healthInsuranceIncomeThreshold: 15000, // Lower threshold to test capping (4% of 500k = 20k)
      retirementStartYear: 2040,
    }

    const { result } = calculateWithdrawal({
      elements,
      startYear: 2040,
      endYear: 2040,
      strategy: '4prozent',
      returnConfig,
      healthCareInsuranceConfig,
      birthYear: 1973,
    })

    const withdrawalAmount = result[2040].entnahme
    expect(withdrawalAmount).toBe(20000) // 4% of 500k

    // But health insurance should be calculated on threshold amount, not full withdrawal
    const expectedHealthInsurance = 15000 * 0.073 // 7.3% of threshold
    expect(result[2040].healthCareInsurance!.healthInsuranceAnnual).toBeCloseTo(expectedHealthInsurance, 1)
  })

  it('should handle small withdrawal amounts gracefully', () => {
    // Create elements with small capital
    const elements: SparplanElement[] = [
      {
        id: 'test-1',
        name: 'Test Investment',
        type: 'sparplan',
        start: '2024-01-01',
        einzahlung: 1000,
        betrag: 100,
        jahresrendite: 0.05,
        teilfreistellungsquote: 0.3,
        thesaurierend: true,
        simulation: {
          2039: {
            startkapital: 950,
            endkapital: 1000, // Small amount
            zinsen: 50,
            bezahlteSteuer: 0,
            genutzterFreibetrag: 0,
            vorabpauschale: 10,
            vorabpauschaleAccumulated: 0,
          },
        },
      },
    ]

    const healthCareInsuranceConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      enabled: true,
      retirementStartYear: 2040, // Make 2040 the retirement year
    }

    const { result } = calculateWithdrawal({
      elements,
      startYear: 2040,
      endYear: 2040,
      strategy: '4prozent',
      returnConfig,
      healthCareInsuranceConfig,
      birthYear: 1973,
    })

    // Should calculate for small withdrawal amounts correctly
    expect(result[2040]).toBeDefined()
    expect(result[2040].entnahme).toBe(40) // 4% of 1000
    expect(result[2040].healthCareInsurance).toBeDefined()
    expect(result[2040].healthCareInsurance!.totalAnnual).toBeGreaterThan(0)
    expect(result[2040].healthCareInsurance!.isRetirementPhase).toBe(true)

    // Health care insurance should be calculated based on the small withdrawal amount
    const expectedHealthInsurance = 40 * 0.073 // 7.3% (retirement rate)
    const expectedCareInsurance = 40 * 0.0305 // 3.05%
    expect(result[2040].healthCareInsurance!.healthInsuranceAnnual).toBeCloseTo(expectedHealthInsurance, 2)
    expect(result[2040].healthCareInsurance!.careInsuranceAnnual).toBeCloseTo(expectedCareInsurance, 2)
  })
})
