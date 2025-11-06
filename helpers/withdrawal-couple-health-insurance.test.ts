import { describe, it, expect } from 'vitest'
import { calculateWithdrawal } from './withdrawal'
import {
  createDefaultHealthCareInsuranceConfig,
  createDefaultCoupleHealthInsuranceConfig,
} from './health-care-insurance'
import type { SparplanElement } from '../src/utils/sparplan-utils'

describe('Withdrawal - Couple Health Insurance Integration', () => {
  // Helper function to create test elements matching existing test pattern
  const createTestElements = (): SparplanElement[] => [
    {
      type: 'sparplan',
      start: '2024-01-01',
      einzahlung: 100000,
      simulation: {
        2040: {
          startkapital: 100000,
          endkapital: 120000,
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

  it('should use couple health insurance calculations when in couple mode', () => {
    const withdrawalStartYear = 2041
    const elements = createTestElements()

    const healthCareInsuranceConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      planningMode: 'couple' as const,
      coupleConfig: {
        ...createDefaultCoupleHealthInsuranceConfig(),
        strategy: 'optimize' as const,
        person1: {
          name: 'Alice',
          birthYear: 1980,
          withdrawalShare: 0.08, // Very low share: 4800*0.08 = 384€ annual = 32€/month (< 505, qualifies)
          otherIncomeAnnual: 0,
          additionalCareInsuranceForChildless: false,
        },
        person2: {
          name: 'Bob',
          birthYear: 1985,
          withdrawalShare: 0.92, // High share: 4800*0.92 = 4416€ annual = 368€/month (< 505, qualifies)
          otherIncomeAnnual: 0,
          additionalCareInsuranceForChildless: false,
        },
      },
    }

    const { result } = calculateWithdrawal({
      elements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: '4prozent',
      returnConfig,
      taxRate: 0.26375,
      teilfreistellungsquote: 0.3,
      freibetragPerYear: { [withdrawalStartYear]: 2000 },
      healthCareInsuranceConfig,
      birthYear: 1980,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()
    expect(resultYear.healthCareInsurance).toBeDefined()
    expect(resultYear.healthCareInsurance!.coupleDetails).toBeDefined()

    // Verify couple-specific data is present
    const coupleDetails = resultYear.healthCareInsurance!.coupleDetails!
    expect(coupleDetails.person1.name).toBe('Alice')
    expect(coupleDetails.person2.name).toBe('Bob')
    expect(coupleDetails.strategyUsed).toBe('family') // Should optimize to family insurance
    expect(coupleDetails.person1.coveredByFamilyInsurance).toBe(false) // Alice pays insurance (primary)
    expect(coupleDetails.person2.coveredByFamilyInsurance).toBe(true) // Bob is family insured
    expect(coupleDetails.totalAnnual).toBeGreaterThan(0)
    expect(coupleDetails.strategyComparison.optimized.savings).toBeGreaterThan(0)
  })

  it('should fall back to individual calculations when not in couple mode', () => {
    const withdrawalStartYear = 2041
    const elements = createTestElements()

    const healthCareInsuranceConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      planningMode: 'individual' as const,
    }

    const { result } = calculateWithdrawal({
      elements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: '4prozent',
      returnConfig,
      taxRate: 0.26375,
      teilfreistellungsquote: 0.3,
      freibetragPerYear: { [withdrawalStartYear]: 2000 },
      healthCareInsuranceConfig,
      birthYear: 1980,
    })

    const resultYear = result[withdrawalStartYear]
    expect(resultYear).toBeDefined()
    expect(resultYear.healthCareInsurance).toBeDefined()
    expect(resultYear.healthCareInsurance!.coupleDetails).toBeUndefined() // No couple details for individual mode

    // Should have individual health insurance data
    expect(resultYear.healthCareInsurance!.totalAnnual).toBeGreaterThan(0)
    expect(resultYear.healthCareInsurance!.isRetirementPhase).toBe(true)
  })

  it('should show different costs for individual vs couple strategies', () => {
    const withdrawalStartYear = 2041
    const elements = createTestElements()

    // Individual mode calculation
    const individualConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      planningMode: 'individual' as const,
    }

    const { result: individualResult } = calculateWithdrawal({
      elements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: '4prozent',
      returnConfig,
      taxRate: 0.26375,
      teilfreistellungsquote: 0.3,
      freibetragPerYear: { [withdrawalStartYear]: 2000 },
      healthCareInsuranceConfig: individualConfig,
      birthYear: 1980,
    })

    // Couple mode calculation with family insurance optimization
    const coupleConfig = {
      ...createDefaultHealthCareInsuranceConfig(),
      planningMode: 'couple' as const,
      coupleConfig: {
        ...createDefaultCoupleHealthInsuranceConfig(),
        strategy: 'optimize' as const,
        person1: {
          name: 'Person 1',
          birthYear: 1980,
          withdrawalShare: 0.1, // Low share for family insurance
          otherIncomeAnnual: 0,
          additionalCareInsuranceForChildless: false,
        },
        person2: {
          name: 'Person 2',
          birthYear: 1980,
          withdrawalShare: 0.9, // High share
          otherIncomeAnnual: 0,
          additionalCareInsuranceForChildless: false,
        },
      },
    }

    const { result: coupleResult } = calculateWithdrawal({
      elements,
      startYear: withdrawalStartYear,
      endYear: withdrawalStartYear,
      strategy: '4prozent',
      returnConfig,
      taxRate: 0.26375,
      teilfreistellungsquote: 0.3,
      freibetragPerYear: { [withdrawalStartYear]: 2000 },
      healthCareInsuranceConfig: coupleConfig,
      birthYear: 1980,
    })

    const individualYear = individualResult[withdrawalStartYear]
    const coupleYear = coupleResult[withdrawalStartYear]

    expect(individualYear.healthCareInsurance).toBeDefined()
    expect(coupleYear.healthCareInsurance).toBeDefined()
    expect(coupleYear.healthCareInsurance!.coupleDetails).toBeDefined()

    // Individual mode: pays for one person
    // Couple mode with optimization: should be cheaper due to family insurance
    const individualCost = individualYear.healthCareInsurance!.totalAnnual
    const coupleCost = coupleYear.healthCareInsurance!.totalAnnual

    expect(individualCost).toBeGreaterThan(0)
    expect(coupleCost).toBeGreaterThan(0)

    // Family insurance should be cheaper than paying for two individuals
    expect(coupleCost).toBeLessThan(individualCost * 2)

    // Verify the optimization worked
    expect(coupleYear.healthCareInsurance!.coupleDetails!.strategyUsed).toBe('family')
  })
})
