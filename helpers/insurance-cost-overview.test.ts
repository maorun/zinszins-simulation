/**
 * Tests for insurance cost overview helper functions
 */

import { describe, it, expect } from 'vitest'
import {
  calculateHealthCareInsuranceCost,
  calculateTermLifeInsuranceCost,
  calculateCareInsuranceCost,
  extractInsuranceCostsFromOtherIncome,
  calculateYearlyInsuranceCosts,
  calculateInsuranceCostSummary,
  generateOptimizationRecommendations,
  type InsuranceCostSummary,
} from './insurance-cost-overview'

import type { HealthCareInsuranceConfig } from './health-care-insurance'
import type { TermLifeInsuranceConfig } from './term-life-insurance'
import type { CareInsuranceConfig } from './care-insurance'

describe('calculateHealthCareInsuranceCost', () => {
  it('should return null if config is undefined', () => {
    const result = calculateHealthCareInsuranceCost(undefined, 2024)
    expect(result).toBeNull()
  })

  it('should return null if config is disabled', () => {
    const config: HealthCareInsuranceConfig = {
      enabled: false,
      planningMode: 'individual',
      insuranceType: 'statutory',
      includeEmployerContribution: true,
      statutoryHealthInsuranceRate: 0.146,
      statutoryCareInsuranceRate: 0.0305,
      statutoryMinimumIncomeBase: 18000,
      statutoryMaximumIncomeBase: 62100,
      privateHealthInsuranceMonthly: 0,
      privateCareInsuranceMonthly: 0,
      privateInsuranceInflationRate: 0.02,
      retirementStartYear: 2040,
      additionalCareInsuranceForChildless: false,
      additionalCareInsuranceAge: 23,
    }
    const result = calculateHealthCareInsuranceCost(config, 2024)
    expect(result).toBeNull()
  })

  it('should calculate private health insurance cost correctly', () => {
    const config: HealthCareInsuranceConfig = {
      enabled: true,
      planningMode: 'individual',
      insuranceType: 'private',
      includeEmployerContribution: false,
      statutoryHealthInsuranceRate: 0.146,
      statutoryCareInsuranceRate: 0.0305,
      statutoryMinimumIncomeBase: 18000,
      statutoryMaximumIncomeBase: 62100,
      privateHealthInsuranceMonthly: 500,
      privateCareInsuranceMonthly: 100,
      privateInsuranceInflationRate: 0.02,
      retirementStartYear: 2040,
      additionalCareInsuranceForChildless: false,
      additionalCareInsuranceAge: 23,
    }
    
    const result = calculateHealthCareInsuranceCost(config, 2024)
    
    expect(result).not.toBeNull()
    expect(result?.category).toBe('health')
    expect(result?.name).toBe('Private Krankenversicherung')
    expect(result?.year).toBe(2024)
    expect(result?.annualCost).toBe(7200) // (500 + 100) * 12
    expect(result?.enabled).toBe(true)
  })

  it('should calculate statutory health insurance cost correctly', () => {
    const config: HealthCareInsuranceConfig = {
      enabled: true,
      planningMode: 'individual',
      insuranceType: 'statutory',
      includeEmployerContribution: true,
      statutoryHealthInsuranceRate: 0.146,
      statutoryCareInsuranceRate: 0.0305,
      statutoryMinimumIncomeBase: 20000,
      statutoryMaximumIncomeBase: 62100,
      privateHealthInsuranceMonthly: 0,
      privateCareInsuranceMonthly: 0,
      privateInsuranceInflationRate: 0.02,
      retirementStartYear: 2040,
      additionalCareInsuranceForChildless: false,
      additionalCareInsuranceAge: 23,
    }
    
    const result = calculateHealthCareInsuranceCost(config, 2024)
    
    expect(result).not.toBeNull()
    expect(result?.category).toBe('health')
    expect(result?.name).toBe('Gesetzliche Krankenversicherung')
    expect(result?.year).toBe(2024)
    // 20000 * (0.146 + 0.0305) = 3530
    expect(result?.annualCost).toBe(3530)
    expect(result?.enabled).toBe(true)
  })
})

describe('calculateTermLifeInsuranceCost', () => {
  const baseConfig: TermLifeInsuranceConfig = {
    name: 'Meine RLV',
    startYear: 2024,
    endYear: 2040,
    coverageAmount: 200000,
    coverageType: 'level',
    annualDecreasePercent: 5,
    birthYear: 1990,
    gender: 'male',
    healthStatus: 'good',
    smokingStatus: 'non-smoker',
    enabled: true,
  }

  it('should return null if config is undefined', () => {
    const result = calculateTermLifeInsuranceCost(undefined, 2024)
    expect(result).toBeNull()
  })

  it('should return null if config is disabled', () => {
    const config = { ...baseConfig, enabled: false }
    const result = calculateTermLifeInsuranceCost(config, 2024)
    expect(result).toBeNull()
  })

  it('should return null if year is before start year', () => {
    const result = calculateTermLifeInsuranceCost(baseConfig, 2023)
    expect(result).toBeNull()
  })

  it('should return null if year is after end year', () => {
    const result = calculateTermLifeInsuranceCost(baseConfig, 2041)
    expect(result).toBeNull()
  })

  it('should calculate cost for level coverage correctly', () => {
    const result = calculateTermLifeInsuranceCost(baseConfig, 2024)
    
    expect(result).not.toBeNull()
    expect(result?.category).toBe('life')
    expect(result?.name).toBe('Meine RLV')
    expect(result?.year).toBe(2024)
    expect(result?.coverageAmount).toBe(200000)
    expect(result?.enabled).toBe(true)
    // Age 34: base rate 0.5, good health 0.9, non-smoker 1.0
    // (200000 / 1000) * 0.5 * 0.9 * 1.0 = 90
    expect(result?.annualCost).toBeCloseTo(90, 1)
  })

  it('should calculate cost for decreasing coverage correctly', () => {
    const config = { ...baseConfig, coverageType: 'decreasing' as const, annualDecreasePercent: 10 }
    const result = calculateTermLifeInsuranceCost(config, 2024) // Year 0
    
    expect(result).not.toBeNull()
    expect(result?.coverageAmount).toBe(200000) // No decrease in first year
    
    // Second year
    const result2 = calculateTermLifeInsuranceCost(config, 2025)
    expect(result2?.coverageAmount).toBeCloseTo(180000, 0) // 200000 * 0.9
  })

  it('should apply age-based premium adjustments', () => {
    // Young person (age 25)
    const youngConfig = { ...baseConfig, birthYear: 1999 }
    const youngResult = calculateTermLifeInsuranceCost(youngConfig, 2024)
    
    // Middle-aged person (age 45)
    const middleConfig = { ...baseConfig, birthYear: 1979 }
    const middleResult = calculateTermLifeInsuranceCost(middleConfig, 2024)
    
    // Older person (age 55)
    const olderConfig = { ...baseConfig, birthYear: 1969 }
    const olderResult = calculateTermLifeInsuranceCost(olderConfig, 2024)
    
    expect(youngResult?.annualCost).toBeLessThan(middleResult?.annualCost || 0)
    expect(middleResult?.annualCost).toBeLessThan(olderResult?.annualCost || 0)
  })

  it('should apply gender-based premium adjustments', () => {
    const maleConfig = { ...baseConfig, gender: 'male' as const }
    const femaleConfig = { ...baseConfig, gender: 'female' as const }
    
    const maleResult = calculateTermLifeInsuranceCost(maleConfig, 2024)
    const femaleResult = calculateTermLifeInsuranceCost(femaleConfig, 2024)
    
    // Females typically pay less
    expect(femaleResult?.annualCost).toBeLessThan(maleResult?.annualCost || 0)
  })

  it('should apply health status adjustments', () => {
    const excellentConfig = { ...baseConfig, healthStatus: 'excellent' as const }
    const poorConfig = { ...baseConfig, healthStatus: 'poor' as const }
    
    const excellentResult = calculateTermLifeInsuranceCost(excellentConfig, 2024)
    const poorResult = calculateTermLifeInsuranceCost(poorConfig, 2024)
    
    expect(excellentResult?.annualCost).toBeLessThan(poorResult?.annualCost || 0)
  })

  it('should apply smoking status adjustments', () => {
    const nonSmokerConfig = { ...baseConfig, smokingStatus: 'non-smoker' as const }
    const smokerConfig = { ...baseConfig, smokingStatus: 'smoker' as const }
    
    const nonSmokerResult = calculateTermLifeInsuranceCost(nonSmokerConfig, 2024)
    const smokerResult = calculateTermLifeInsuranceCost(smokerConfig, 2024)
    
    expect(nonSmokerResult?.annualCost).toBeLessThan(smokerResult?.annualCost || 0)
  })
})

describe('calculateCareInsuranceCost', () => {
  const baseConfig: CareInsuranceConfig = {
    name: 'Test Pflege',
    startYear: 2024,
    endYear: 2064,
    policyType: 'pflegetagegeld',
    monthlyPremium: 50,
    dailyBenefitPflegegrad5: 50,
    birthYear: 1979,
    gender: 'male',
    isPflegeBahr: false,
    enabled: true,
  }

  it('should return null if config is undefined', () => {
    const result = calculateCareInsuranceCost(undefined, 2024)
    expect(result).toBeNull()
  })

  it('should return null if config is disabled', () => {
    const config = { ...baseConfig, enabled: false }
    const result = calculateCareInsuranceCost(config, 2024)
    expect(result).toBeNull()
  })

  it('should return null if year is before startYear', () => {
    const result = calculateCareInsuranceCost(baseConfig, 2023)
    expect(result).toBeNull()
  })

  it('should return null if year is after endYear', () => {
    const result = calculateCareInsuranceCost(baseConfig, 2065)
    expect(result).toBeNull()
  })

  it('should calculate care insurance cost correctly', () => {
    const result = calculateCareInsuranceCost(baseConfig, 2024)
    
    expect(result).not.toBeNull()
    expect(result?.category).toBe('care')
    expect(result?.name).toBe('Test Pflege')
    expect(result?.year).toBe(2024)
    expect(result?.annualCost).toBe(600) // 50 * 12
    expect(result?.coverageAmount).toBeCloseTo(1521, 0) // 50 * 30.42
    expect(result?.enabled).toBe(true)
  })

  it('should apply Pflege-Bahr subsidy when enabled', () => {
    const pflegeBahrConfig: CareInsuranceConfig = {
      ...baseConfig,
      isPflegeBahr: true,
      monthlyPremium: 60, // Must be at least 10 EUR
    }
    
    const result = calculateCareInsuranceCost(pflegeBahrConfig, 2024)
    
    expect(result).not.toBeNull()
    expect(result?.annualCost).toBe(660) // 720 - 60 subsidy
  })

  it('should not apply Pflege-Bahr subsidy if premium below minimum', () => {
    const lowPremiumConfig: CareInsuranceConfig = {
      ...baseConfig,
      isPflegeBahr: true,
      monthlyPremium: 8, // Below 10 EUR minimum
    }
    
    const result = calculateCareInsuranceCost(lowPremiumConfig, 2024)
    
    expect(result).not.toBeNull()
    expect(result?.annualCost).toBe(96) // 8 * 12, no subsidy
  })

  it('should calculate maximum monthly benefit correctly', () => {
    const config: CareInsuranceConfig = {
      ...baseConfig,
      dailyBenefitPflegegrad5: 75,
    }
    
    const result = calculateCareInsuranceCost(config, 2024)
    
    expect(result).not.toBeNull()
    expect(result?.coverageAmount).toBeCloseTo(2281.5, 1) // 75 * 30.42
  })
})

describe('extractInsuranceCostsFromOtherIncome', () => {
  it('should return empty array if no other income sources', () => {
    const result = extractInsuranceCostsFromOtherIncome(undefined, 2024)
    expect(result).toEqual([])
  })

  it('should return empty array (not currently implemented)', () => {
    // This function is a placeholder for future implementation
    // Currently returns empty array since OtherIncomeSource doesn't track insurance premiums
    const result = extractInsuranceCostsFromOtherIncome([], 2024)
    expect(result).toEqual([])
  })
})

describe('calculateYearlyInsuranceCosts', () => {
  const healthConfig: HealthCareInsuranceConfig = {
    enabled: true,
    planningMode: 'individual',
    insuranceType: 'private',
    includeEmployerContribution: false,
    statutoryHealthInsuranceRate: 0.146,
    statutoryCareInsuranceRate: 0.0305,
    statutoryMinimumIncomeBase: 18000,
    statutoryMaximumIncomeBase: 62100,
    privateHealthInsuranceMonthly: 500,
    privateCareInsuranceMonthly: 100,
    privateInsuranceInflationRate: 0.02,
    retirementStartYear: 2040,
    additionalCareInsuranceForChildless: false,
    additionalCareInsuranceAge: 23,
  }

  const termLifeConfig: TermLifeInsuranceConfig = {
    name: 'RLV',
    startYear: 2024,
    endYear: 2040,
    coverageAmount: 200000,
    coverageType: 'level',
    annualDecreasePercent: 0,
    birthYear: 1990,
    gender: 'male',
    healthStatus: 'good',
    smokingStatus: 'non-smoker',
    enabled: true,
  }

  it('should aggregate all insurance costs', () => {
    const result = calculateYearlyInsuranceCosts(2024, healthConfig, termLifeConfig, undefined, undefined)
    
    expect(result.year).toBe(2024)
    expect(result.entries).toHaveLength(2)
    expect(result.activeInsuranceCount).toBe(2)
    expect(result.totalCost).toBeGreaterThan(0)
    expect(result.costByCategory.health).toBe(7200)
    expect(result.costByCategory.life).toBeGreaterThan(0)
  })

  it('should handle no insurances', () => {
    const result = calculateYearlyInsuranceCosts(2024, undefined, undefined, undefined, undefined)
    
    expect(result.year).toBe(2024)
    expect(result.entries).toHaveLength(0)
    expect(result.activeInsuranceCount).toBe(0)
    expect(result.totalCost).toBe(0)
  })

  it('should correctly categorize costs', () => {
    const result = calculateYearlyInsuranceCosts(2024, healthConfig, termLifeConfig, undefined, undefined)
    
    expect(result.costByCategory.health).toBeGreaterThan(0)
    expect(result.costByCategory.life).toBeGreaterThan(0)
    expect(result.costByCategory.care).toBe(0)
  })

  it('should include care insurance costs when configured', () => {
    const careConfig: CareInsuranceConfig = {
      name: 'Pflegezusatz',
      startYear: 2024,
      endYear: 2064,
      policyType: 'pflegetagegeld',
      monthlyPremium: 50,
      dailyBenefitPflegegrad5: 50,
      birthYear: 1979,
      gender: 'male',
      isPflegeBahr: false,
      enabled: true,
    }

    const result = calculateYearlyInsuranceCosts(2024, healthConfig, termLifeConfig, careConfig, undefined)
    
    expect(result.entries).toHaveLength(3)
    expect(result.activeInsuranceCount).toBe(3)
    expect(result.costByCategory.health).toBeGreaterThan(0)
    expect(result.costByCategory.life).toBeGreaterThan(0)
    expect(result.costByCategory.care).toBe(600) // 50 * 12
  })
})

describe('calculateInsuranceCostSummary', () => {
  const healthConfig: HealthCareInsuranceConfig = {
    enabled: true,
    planningMode: 'individual',
    insuranceType: 'private',
    includeEmployerContribution: false,
    statutoryHealthInsuranceRate: 0.146,
    statutoryCareInsuranceRate: 0.0305,
    statutoryMinimumIncomeBase: 18000,
    statutoryMaximumIncomeBase: 62100,
    privateHealthInsuranceMonthly: 500,
    privateCareInsuranceMonthly: 100,
    privateInsuranceInflationRate: 0.02,
    retirementStartYear: 2040,
    additionalCareInsuranceForChildless: false,
    additionalCareInsuranceAge: 23,
  }

  const termLifeConfig: TermLifeInsuranceConfig = {
    name: 'RLV',
    startYear: 2024,
    endYear: 2030, // Only 6 years
    coverageAmount: 200000,
    coverageType: 'level',
    annualDecreasePercent: 0,
    birthYear: 1990,
    gender: 'male',
    healthStatus: 'good',
    smokingStatus: 'non-smoker',
    enabled: true,
  }

  it('should calculate summary across multiple years', () => {
    const summary = calculateInsuranceCostSummary(2024, 2040, healthConfig, termLifeConfig, undefined, undefined)
    
    expect(summary.yearlyResults).toHaveLength(17) // 2024-2040
    expect(summary.totalCost).toBeGreaterThan(0)
    expect(summary.averageAnnualCost).toBeGreaterThan(0)
    expect(summary.peakAnnualCost).toBeGreaterThan(0)
    expect(summary.peakCostYear).toBeGreaterThanOrEqual(2024)
    expect(summary.peakCostYear).toBeLessThanOrEqual(2040)
  })

  it('should identify peak cost year correctly', () => {
    const summary = calculateInsuranceCostSummary(2024, 2040, healthConfig, termLifeConfig, undefined, undefined)
    
    // Find the year with highest cost manually
    let maxCost = 0
    let maxYear = 2024
    for (const yr of summary.yearlyResults) {
      if (yr.totalCost > maxCost) {
        maxCost = yr.totalCost
        maxYear = yr.year
      }
    }
    
    expect(summary.peakCostYear).toBe(maxYear)
    expect(summary.peakAnnualCost).toBe(maxCost)
  })

  it('should calculate average costs by category', () => {
    const summary = calculateInsuranceCostSummary(2024, 2040, healthConfig, termLifeConfig, undefined, undefined)
    
    expect(summary.averageCostByCategory.health).toBeGreaterThan(0)
    // Life insurance only exists 2024-2030, so average will be lower
    expect(summary.averageCostByCategory.life).toBeGreaterThan(0)
    expect(summary.averageCostByCategory.life).toBeLessThan(summary.averageCostByCategory.health)
  })

  it('should list all insurance types', () => {
    const summary = calculateInsuranceCostSummary(2024, 2040, healthConfig, termLifeConfig, undefined, undefined)
    
    expect(summary.insuranceTypes).toContain('Private Krankenversicherung')
    expect(summary.insuranceTypes).toContain('RLV')
  })

  it('should handle empty configuration', () => {
    const summary = calculateInsuranceCostSummary(2024, 2040, undefined, undefined, undefined, undefined)
    
    expect(summary.yearlyResults).toHaveLength(17)
    expect(summary.totalCost).toBe(0)
    expect(summary.averageAnnualCost).toBe(0)
    expect(summary.insuranceTypes).toHaveLength(0)
  })
})

describe('generateOptimizationRecommendations', () => {
  it('should warn about high insurance costs relative to withdrawal', () => {
    const summary: import('./insurance-cost-overview').InsuranceCostSummary = {
      yearlyResults: [],
      averageAnnualCost: 15000,
      totalCost: 150000,
      peakAnnualCost: 18000,
      peakCostYear: 2024,
      averageCostByCategory: {
        health: 12000,
        life: 3000,
        disability: 0,
        care: 0,
        other: 0,
      },
      insuranceTypes: ['PKV', 'RLV'],
    }
    
    const recommendations = generateOptimizationRecommendations(summary, 40000)
    
    const highCostWarning = recommendations.find(r => r.title === 'Hohe Versicherungskosten')
    expect(highCostWarning).toBeDefined()
    expect(highCostWarning?.level).toBe('warning')
  })

  it('should recommend PKV review for high costs', () => {
    const summary: import('./insurance-cost-overview').InsuranceCostSummary = {
      yearlyResults: [],
      averageAnnualCost: 10000,
      totalCost: 100000,
      peakAnnualCost: 12000,
      peakCostYear: 2024,
      averageCostByCategory: {
        health: 9000,
        life: 1000,
        disability: 0,
        care: 0,
        other: 0,
      },
      insuranceTypes: ['PKV'],
    }
    
    const recommendations = generateOptimizationRecommendations(summary)
    
    const pkvRecommendation = recommendations.find(r => r.category === 'health')
    expect(pkvRecommendation).toBeDefined()
    expect(pkvRecommendation?.title).toBe('PKV-Kostenprüfung')
  })

  it('should warn about term life insurance in retirement', () => {
    const summary: import('./insurance-cost-overview').InsuranceCostSummary = {
      yearlyResults: [
        {
          year: 2045,
          totalCost: 5000,
          costByCategory: {
            health: 4000,
            life: 1000, // Still paying for term life in retirement
            disability: 0,
            care: 0,
            other: 0,
          },
          entries: [],
          activeInsuranceCount: 2,
        },
      ],
      averageAnnualCost: 5000,
      totalCost: 5000,
      peakAnnualCost: 5000,
      peakCostYear: 2045,
      averageCostByCategory: {
        health: 4000,
        life: 1000,
        disability: 0,
        care: 0,
        other: 0,
      },
      insuranceTypes: ['PKV', 'RLV'],
    }
    
    const recommendations = generateOptimizationRecommendations(summary)
    
    const retirementWarning = recommendations.find(r => r.category === 'life')
    expect(retirementWarning).toBeDefined()
    expect(retirementWarning?.title).toBe('Risikolebensversicherung im Ruhestand')
  })

  it('should inform when no insurances are configured', () => {
    const summary: import('./insurance-cost-overview').InsuranceCostSummary = {
      yearlyResults: [],
      averageAnnualCost: 0,
      totalCost: 0,
      peakAnnualCost: 0,
      peakCostYear: 2024,
      averageCostByCategory: {
        health: 0,
        life: 0,
        disability: 0,
        care: 0,
        other: 0,
      },
      insuranceTypes: [],
    }
    
    const recommendations = generateOptimizationRecommendations(summary)
    
    const noInsuranceInfo = recommendations.find(r => r.title === 'Keine Versicherungen konfiguriert')
    expect(noInsuranceInfo).toBeDefined()
    expect(noInsuranceInfo?.level).toBe('info')
  })

  it('should return empty array for well-optimized insurance portfolio', () => {
    const summary: import('./insurance-cost-overview').InsuranceCostSummary = {
      yearlyResults: [],
      averageAnnualCost: 5000,
      totalCost: 50000,
      peakAnnualCost: 6000,
      peakCostYear: 2024,
      averageCostByCategory: {
        health: 4000,
        life: 1000,
        disability: 0,
        care: 0,
        other: 0,
      },
      insuranceTypes: ['GKV', 'RLV'],
    }
    
    const recommendations = generateOptimizationRecommendations(summary, 50000)
    
    // Should have no warnings, only potentially the retirement check if applicable
    const warnings = recommendations.filter(r => r.level === 'warning')
    expect(warnings).toHaveLength(0)
  })

  it('should recommend care insurance when not configured and planning for retirement', () => {
    const summary: InsuranceCostSummary = {
      yearlyResults: [],
      averageAnnualCost: 5000,
      totalCost: 85000,
      peakAnnualCost: 6000,
      peakCostYear: 2055,
      averageCostByCategory: {
        health: 5000,
        life: 0,
        disability: 0,
        care: 0, // No care insurance
        other: 0,
      },
      insuranceTypes: ['PKV'],
    }

    // Create yearly results that include years when user is 60+
    for (let year = 2024; year <= 2060; year++) {
      summary.yearlyResults.push({
        year,
        totalCost: 5000,
        costByCategory: { ...summary.averageCostByCategory },
        entries: [],
        activeInsuranceCount: 1,
      })
    }

    const recommendations = generateOptimizationRecommendations(summary)

    const careRecommendation = recommendations.find(r => r.category === 'care')
    expect(careRecommendation).toBeDefined()
    expect(careRecommendation?.title).toContain('Pflegezusatzversicherung')
  })

  it('should warn about high care insurance costs', () => {
    const summary: InsuranceCostSummary = {
      yearlyResults: [],
      averageAnnualCost: 10000,
      totalCost: 170000,
      peakAnnualCost: 12000,
      peakCostYear: 2040,
      averageCostByCategory: {
        health: 5000,
        life: 0,
        disability: 0,
        care: 1500, // High care insurance costs (>100 EUR/month)
        other: 0,
      },
      insuranceTypes: ['PKV', 'Pflegezusatz'],
    }

    const recommendations = generateOptimizationRecommendations(summary)

    const careRecommendation = recommendations.find(r => 
      r.category === 'care' && r.title.includes('Hohe')
    )
    expect(careRecommendation).toBeDefined()
    expect(careRecommendation?.message).toContain('1500')
  })
})
