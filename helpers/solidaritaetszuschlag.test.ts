import { describe, expect, it } from 'vitest'
import {
  SOLI_CONSTANTS,
  calculateSolidaritaetszuschlag,
  calculateYearlySoli,
  calculateSoliSavings,
  getSoliFreigrenze,
  getSoliGleitzoneUpper,
  isAffectedBySoliReform,
  getIncomeTaxForSoliExemption,
  getPercentageAffectedByFullSoli,
  type SoliPlanningMode,
} from './solidaritaetszuschlag'

describe('SOLI_CONSTANTS', () => {
  it('should have correct Soli rate of 5.5%', () => {
    expect(SOLI_CONSTANTS.SOLI_RATE).toBe(0.055)
  })

  it('should have correct Freigrenze for individuals', () => {
    expect(SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL).toBe(16956)
  })

  it('should have correct Freigrenze for couples (2× individual)', () => {
    expect(SOLI_CONSTANTS.FREIGRENZE_COUPLE).toBe(33912)
    expect(SOLI_CONSTANTS.FREIGRENZE_COUPLE).toBe(SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL * 2)
  })

  it('should have correct Gleitzone upper limit for individuals', () => {
    expect(SOLI_CONSTANTS.GLEITZONE_UPPER_INDIVIDUAL).toBe(31527)
  })

  it('should have correct Gleitzone upper limit for couples (2× individual)', () => {
    expect(SOLI_CONSTANTS.GLEITZONE_UPPER_COUPLE).toBe(63054)
    expect(SOLI_CONSTANTS.GLEITZONE_UPPER_COUPLE).toBe(SOLI_CONSTANTS.GLEITZONE_UPPER_INDIVIDUAL * 2)
  })
})

describe('calculateSolidaritaetszuschlag', () => {
  describe('Below Freigrenze (Exemption Zone)', () => {
    it('should return zero Soli for individual below Freigrenze', () => {
      const result = calculateSolidaritaetszuschlag(10000, 'individual')

      expect(result.soli).toBe(0)
      expect(result.zone).toBe('below_freigrenze')
      expect(result.isExempt).toBe(true)
      expect(result.effectiveSoliRate).toBe(0)
    })

    it('should return zero Soli for individual exactly at Freigrenze', () => {
      const result = calculateSolidaritaetszuschlag(SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL, 'individual')

      expect(result.soli).toBe(0)
      expect(result.zone).toBe('below_freigrenze')
      expect(result.isExempt).toBe(true)
    })

    it('should return zero Soli for couple below Freigrenze', () => {
      const result = calculateSolidaritaetszuschlag(20000, 'couple')

      expect(result.soli).toBe(0)
      expect(result.zone).toBe('below_freigrenze')
      expect(result.isExempt).toBe(true)
    })

    it('should calculate savings correctly for exemption zone', () => {
      const incomeTax = 10000
      const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

      const expectedSoliWithoutReform = incomeTax * SOLI_CONSTANTS.SOLI_RATE
      expect(result.calculation.soliWithoutReform).toBe(expectedSoliWithoutReform)
      expect(result.calculation.soliSaved).toBe(expectedSoliWithoutReform)
    })

    it('should include correct Freigrenze in result', () => {
      const result = calculateSolidaritaetszuschlag(10000, 'individual')
      expect(result.freigrenze).toBe(SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL)

      const resultCouple = calculateSolidaritaetszuschlag(20000, 'couple')
      expect(resultCouple.freigrenze).toBe(SOLI_CONSTANTS.FREIGRENZE_COUPLE)
    })
  })

  describe('In Gleitzone (Transition Zone)', () => {
    it('should calculate reduced Soli for individual in Gleitzone', () => {
      const incomeTax = 25000
      const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

      expect(result.zone).toBe('gleitzone')
      expect(result.isExempt).toBe(false)
      expect(result.soli).toBeGreaterThan(0)
      expect(result.soli).toBeLessThan(incomeTax * SOLI_CONSTANTS.SOLI_RATE)
    })

    it('should calculate Gleitzone Soli using correct formula', () => {
      const incomeTax = 25000
      const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

      const excessOverFreigrenze = incomeTax - SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL
      const expectedSoli = excessOverFreigrenze * 0.119 // Gleitzone factor

      expect(result.soli).toBeCloseTo(expectedSoli, 2)
    })

    it('should calculate reduced Soli for couple in Gleitzone', () => {
      const incomeTax = 50000
      const result = calculateSolidaritaetszuschlag(incomeTax, 'couple')

      expect(result.zone).toBe('gleitzone')
      expect(result.isExempt).toBe(false)
      expect(result.soli).toBeGreaterThan(0)
      expect(result.soli).toBeLessThan(incomeTax * SOLI_CONSTANTS.SOLI_RATE)
    })

    it('should have effective rate less than full Soli rate in Gleitzone', () => {
      const result = calculateSolidaritaetszuschlag(25000, 'individual')

      expect(result.effectiveSoliRate).toBeGreaterThan(0)
      expect(result.effectiveSoliRate).toBeLessThan(SOLI_CONSTANTS.SOLI_RATE)
    })

    it('should calculate savings correctly for Gleitzone', () => {
      const incomeTax = 25000
      const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

      const soliWithoutReform = incomeTax * SOLI_CONSTANTS.SOLI_RATE
      const expectedSaved = soliWithoutReform - result.soli

      expect(result.calculation.soliWithoutReform).toBe(soliWithoutReform)
      expect(result.calculation.soliSaved).toBeCloseTo(expectedSaved, 2)
      expect(result.calculation.soliSaved).toBeGreaterThan(0)
    })

    it('should be at Gleitzone upper limit exactly', () => {
      const incomeTax = SOLI_CONSTANTS.GLEITZONE_UPPER_INDIVIDUAL
      const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

      expect(result.zone).toBe('gleitzone')
      // At the upper limit, Soli should be very close to full Soli
      const fullSoli = incomeTax * SOLI_CONSTANTS.SOLI_RATE
      expect(result.soli).toBeLessThanOrEqual(fullSoli)
    })
  })

  describe('Above Gleitzone (Full Soli)', () => {
    it('should calculate full 5.5% Soli for individual above Gleitzone', () => {
      const incomeTax = 50000
      const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

      expect(result.zone).toBe('full_soli')
      expect(result.isExempt).toBe(false)
      expect(result.soli).toBe(incomeTax * SOLI_CONSTANTS.SOLI_RATE)
      expect(result.soli).toBe(2750) // 50000 × 5.5%
    })

    it('should calculate full Soli for couple above Gleitzone', () => {
      const incomeTax = 80000
      const result = calculateSolidaritaetszuschlag(incomeTax, 'couple')

      expect(result.zone).toBe('full_soli')
      expect(result.soli).toBe(incomeTax * SOLI_CONSTANTS.SOLI_RATE)
      expect(result.soli).toBe(4400) // 80000 × 5.5%
    })

    it('should have effective rate equal to full Soli rate', () => {
      const result = calculateSolidaritaetszuschlag(50000, 'individual')

      expect(result.effectiveSoliRate).toBe(SOLI_CONSTANTS.SOLI_RATE)
    })

    it('should have zero savings in full Soli zone', () => {
      const result = calculateSolidaritaetszuschlag(50000, 'individual')

      expect(result.calculation.soliSaved).toBe(0)
      expect(result.soli).toBe(result.calculation.soliWithoutReform)
    })

    it('should calculate very high income tax correctly', () => {
      const incomeTax = 500000
      const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

      expect(result.soli).toBe(27500) // 500000 × 5.5%
      expect(result.zone).toBe('full_soli')
    })
  })

  describe('Edge Cases', () => {
    it('should handle zero income tax', () => {
      const result = calculateSolidaritaetszuschlag(0, 'individual')

      expect(result.soli).toBe(0)
      expect(result.zone).toBe('below_freigrenze')
      expect(result.isExempt).toBe(true)
    })

    it('should handle very small income tax', () => {
      const result = calculateSolidaritaetszuschlag(1, 'individual')

      expect(result.soli).toBe(0)
      expect(result.zone).toBe('below_freigrenze')
    })

    it('should default to individual planning mode', () => {
      const resultWithMode = calculateSolidaritaetszuschlag(10000, 'individual')
      const resultDefault = calculateSolidaritaetszuschlag(10000)

      expect(resultDefault.freigrenze).toBe(resultWithMode.freigrenze)
      expect(resultDefault.soli).toBe(resultWithMode.soli)
    })

    it('should handle income tax exactly at Gleitzone boundary', () => {
      // Just above Freigrenze (entering Gleitzone)
      const incomeTax = SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL + 1
      const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

      expect(result.zone).toBe('gleitzone')
      expect(result.soli).toBeGreaterThan(0)
      expect(result.soli).toBeLessThan(incomeTax * SOLI_CONSTANTS.SOLI_RATE)
    })

    it('should handle income tax exactly at Gleitzone upper limit + 1', () => {
      const incomeTax = SOLI_CONSTANTS.GLEITZONE_UPPER_INDIVIDUAL + 1
      const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

      expect(result.zone).toBe('full_soli')
      expect(result.soli).toBe(incomeTax * SOLI_CONSTANTS.SOLI_RATE)
    })
  })

  describe('Explanation Text', () => {
    it('should provide explanation for exemption zone', () => {
      const result = calculateSolidaritaetszuschlag(10000, 'individual')

      expect(result.calculation.explanation).toContain('Freigrenze')
      expect(result.calculation.explanation).toContain('Kein Solidaritätszuschlag')
    })

    it('should provide explanation for Gleitzone', () => {
      const result = calculateSolidaritaetszuschlag(25000, 'individual')

      expect(result.calculation.explanation).toContain('Gleitzone')
      expect(result.calculation.explanation).toContain('Reduzierter Soli')
      expect(result.calculation.explanation).toContain('11,9%')
    })

    it('should provide explanation for full Soli zone', () => {
      const result = calculateSolidaritaetszuschlag(50000, 'individual')

      expect(result.calculation.explanation).toContain('Voller Solidaritätszuschlag')
      expect(result.calculation.explanation).toContain('5,5%')
    })
  })
})

describe('calculateYearlySoli', () => {
  it('should calculate Soli for each year', () => {
    const incomeTaxes = [10000, 20000, 30000, 40000]
    const results = calculateYearlySoli(incomeTaxes, 'individual')

    expect(results).toHaveLength(4)
    results.forEach((result, index) => {
      expect(result.incomeTax).toBe(incomeTaxes[index])
    })
  })

  it('should handle empty array', () => {
    const results = calculateYearlySoli([], 'individual')
    expect(results).toHaveLength(0)
  })

  it('should handle mixed zones across years', () => {
    const incomeTaxes = [
      5000, // Below Freigrenze
      25000, // In Gleitzone
      50000, // Full Soli
    ]
    const results = calculateYearlySoli(incomeTaxes, 'individual')

    expect(results[0].zone).toBe('below_freigrenze')
    expect(results[1].zone).toBe('gleitzone')
    expect(results[2].zone).toBe('full_soli')
  })

  it('should use correct planning mode for all years', () => {
    const incomeTaxes = [20000, 30000]
    const results = calculateYearlySoli(incomeTaxes, 'couple')

    results.forEach((result) => {
      expect(result.freigrenze).toBe(SOLI_CONSTANTS.FREIGRENZE_COUPLE)
    })
  })
})

describe('calculateSoliSavings', () => {
  it('should calculate total Soli across years', () => {
    const incomeTaxes = [10000, 20000, 30000]
    const savings = calculateSoliSavings(incomeTaxes, 'individual')

    const expectedTotal = incomeTaxes.reduce((sum, tax) => {
      const result = calculateSolidaritaetszuschlag(tax, 'individual')
      return sum + result.soli
    }, 0)

    expect(savings.totalSoli).toBeCloseTo(expectedTotal, 2)
  })

  it('should calculate total Soli without reform', () => {
    const incomeTaxes = [10000, 20000, 30000]
    const savings = calculateSoliSavings(incomeTaxes, 'individual')

    const expectedWithoutReform = incomeTaxes.reduce((sum, tax) => sum + tax * SOLI_CONSTANTS.SOLI_RATE, 0)

    expect(savings.totalSoliWithoutReform).toBeCloseTo(expectedWithoutReform, 2)
  })

  it('should calculate total savings', () => {
    const incomeTaxes = [10000, 20000, 30000]
    const savings = calculateSoliSavings(incomeTaxes, 'individual')

    const expectedSaved = savings.totalSoliWithoutReform - savings.totalSoli
    expect(savings.totalSaved).toBeCloseTo(expectedSaved, 2)
    expect(savings.totalSaved).toBeGreaterThanOrEqual(0)
  })

  it('should provide yearly breakdown', () => {
    const incomeTaxes = [10000, 20000, 30000]
    const savings = calculateSoliSavings(incomeTaxes, 'individual')

    expect(savings.yearlyBreakdown).toHaveLength(3)
    savings.yearlyBreakdown.forEach((result, index) => {
      expect(result.incomeTax).toBe(incomeTaxes[index])
    })
  })

  it('should calculate average effective Soli rate', () => {
    const incomeTaxes = [10000, 20000, 30000]
    const savings = calculateSoliSavings(incomeTaxes, 'individual')

    const totalIncomeTax = incomeTaxes.reduce((sum, tax) => sum + tax, 0)
    const expectedRate = savings.totalSoli / totalIncomeTax

    expect(savings.averageEffectiveSoliRate).toBeCloseTo(expectedRate, 5)
    expect(savings.averageEffectiveSoliRate).toBeLessThan(SOLI_CONSTANTS.SOLI_RATE)
  })

  it('should show significant savings for taxpayers below Gleitzone', () => {
    const incomeTaxes = [15000, 15000, 15000] // All below Freigrenze
    const savings = calculateSoliSavings(incomeTaxes, 'individual')

    expect(savings.totalSoli).toBe(0)
    expect(savings.totalSaved).toBeGreaterThan(0)
    expect(savings.averageEffectiveSoliRate).toBe(0)
  })

  it('should show no savings for taxpayers above Gleitzone', () => {
    const incomeTaxes = [50000, 60000, 70000] // All in full Soli zone
    const savings = calculateSoliSavings(incomeTaxes, 'individual')

    expect(savings.totalSaved).toBe(0)
    expect(savings.averageEffectiveSoliRate).toBe(SOLI_CONSTANTS.SOLI_RATE)
  })

  it('should handle zero income taxes', () => {
    const savings = calculateSoliSavings([0, 0, 0], 'individual')

    expect(savings.totalSoli).toBe(0)
    expect(savings.totalSaved).toBe(0)
    expect(savings.averageEffectiveSoliRate).toBe(0)
  })
})

describe('Helper Functions', () => {
  describe('getSoliFreigrenze', () => {
    it('should return individual Freigrenze', () => {
      expect(getSoliFreigrenze('individual')).toBe(SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL)
    })

    it('should return couple Freigrenze', () => {
      expect(getSoliFreigrenze('couple')).toBe(SOLI_CONSTANTS.FREIGRENZE_COUPLE)
    })

    it('should default to individual', () => {
      expect(getSoliFreigrenze()).toBe(SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL)
    })
  })

  describe('getSoliGleitzoneUpper', () => {
    it('should return individual Gleitzone upper limit', () => {
      expect(getSoliGleitzoneUpper('individual')).toBe(SOLI_CONSTANTS.GLEITZONE_UPPER_INDIVIDUAL)
    })

    it('should return couple Gleitzone upper limit', () => {
      expect(getSoliGleitzoneUpper('couple')).toBe(SOLI_CONSTANTS.GLEITZONE_UPPER_COUPLE)
    })

    it('should default to individual', () => {
      expect(getSoliGleitzoneUpper()).toBe(SOLI_CONSTANTS.GLEITZONE_UPPER_INDIVIDUAL)
    })
  })

  describe('isAffectedBySoliReform', () => {
    it('should return true for income tax below Gleitzone', () => {
      expect(isAffectedBySoliReform(10000, 'individual')).toBe(true)
      expect(isAffectedBySoliReform(25000, 'individual')).toBe(true)
    })

    it('should return true for income tax at Gleitzone upper limit', () => {
      expect(isAffectedBySoliReform(SOLI_CONSTANTS.GLEITZONE_UPPER_INDIVIDUAL, 'individual')).toBe(true)
    })

    it('should return false for income tax above Gleitzone', () => {
      expect(isAffectedBySoliReform(50000, 'individual')).toBe(false)
      expect(isAffectedBySoliReform(100000, 'individual')).toBe(false)
    })

    it('should work correctly for couple planning mode', () => {
      expect(isAffectedBySoliReform(40000, 'couple')).toBe(true)
      expect(isAffectedBySoliReform(70000, 'couple')).toBe(false)
    })
  })

  describe('getIncomeTaxForSoliExemption', () => {
    it('should return Freigrenze for individual', () => {
      expect(getIncomeTaxForSoliExemption('individual')).toBe(SOLI_CONSTANTS.FREIGRENZE_INDIVIDUAL)
    })

    it('should return Freigrenze for couple', () => {
      expect(getIncomeTaxForSoliExemption('couple')).toBe(SOLI_CONSTANTS.FREIGRENZE_COUPLE)
    })
  })

  describe('getPercentageAffectedByFullSoli', () => {
    it('should return 10% as per German Ministry of Finance data', () => {
      expect(getPercentageAffectedByFullSoli()).toBe(10)
    })

    it('should indicate that 90% benefit from reform', () => {
      const percentageAffected = getPercentageAffectedByFullSoli()
      const percentageBenefiting = 100 - percentageAffected

      expect(percentageBenefiting).toBe(90)
    })
  })
})

describe('Real-World Scenarios', () => {
  it('should correctly handle typical middle-income taxpayer (individual)', () => {
    // Typical middle-income: ~€40,000 gross income → ~€8,000 income tax
    const incomeTax = 8000
    const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

    expect(result.zone).toBe('below_freigrenze')
    expect(result.soli).toBe(0)
    expect(result.isExempt).toBe(true)

    // Would have paid €440 Soli before reform
    expect(result.calculation.soliSaved).toBeCloseTo(440, 0)
  })

  it('should correctly handle high-income taxpayer (individual)', () => {
    // High income: ~€150,000 gross → ~€50,000 income tax
    const incomeTax = 50000
    const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

    expect(result.zone).toBe('full_soli')
    expect(result.soli).toBe(2750) // 5.5% of 50000
    expect(result.isExempt).toBe(false)
    expect(result.calculation.soliSaved).toBe(0) // No savings at this level
  })

  it('should correctly handle married couple with moderate income', () => {
    // Couple with combined ~€80,000 gross → ~€15,000 income tax
    const incomeTax = 15000
    const result = calculateSolidaritaetszuschlag(incomeTax, 'couple')

    expect(result.zone).toBe('below_freigrenze')
    expect(result.soli).toBe(0)
    expect(result.isExempt).toBe(true)
  })

  it('should show savings over retirement period', () => {
    // Typical retiree with pension: €25,000 gross → ~€2,000 income tax/year
    const yearlyIncomeTax = Array(20).fill(2000) // 20 years of retirement
    const savings = calculateSoliSavings(yearlyIncomeTax, 'individual')

    expect(savings.totalSoli).toBe(0) // All years exempt
    expect(savings.totalSaved).toBeGreaterThan(0)

    // Would have paid €2,200 Soli over 20 years without reform
    expect(savings.totalSoliWithoutReform).toBeCloseTo(2200, 0)
  })

  it('should demonstrate Gleitzone effect for upper-middle income', () => {
    // Income tax in Gleitzone
    const incomeTax = 23000
    const result = calculateSolidaritaetszuschlag(incomeTax, 'individual')

    expect(result.zone).toBe('gleitzone')

    // Calculate how much is saved compared to full Soli
    const fullSoli = incomeTax * SOLI_CONSTANTS.SOLI_RATE
    const savingsAmount = fullSoli - result.soli

    expect(savingsAmount).toBeGreaterThan(0)
    expect(savingsAmount).toBeLessThan(fullSoli)

    // Effective rate should be between 0% and 5.5%
    expect(result.effectiveSoliRate).toBeGreaterThan(0)
    expect(result.effectiveSoliRate).toBeLessThan(SOLI_CONSTANTS.SOLI_RATE)
  })
})

describe('Type Safety', () => {
  it('should accept valid planning modes', () => {
    const modes: SoliPlanningMode[] = ['individual', 'couple']

    modes.forEach((mode) => {
      const result = calculateSolidaritaetszuschlag(10000, mode)
      expect(result).toBeDefined()
    })
  })

  it('should return complete SoliCalculationResult object', () => {
    const result = calculateSolidaritaetszuschlag(10000, 'individual')

    // Check all required fields exist
    expect(result).toHaveProperty('soli')
    expect(result).toHaveProperty('incomeTax')
    expect(result).toHaveProperty('effectiveSoliRate')
    expect(result).toHaveProperty('zone')
    expect(result).toHaveProperty('isExempt')
    expect(result).toHaveProperty('freigrenze')
    expect(result).toHaveProperty('gleitzoneUpper')
    expect(result).toHaveProperty('calculation')

    // Check calculation object
    expect(result.calculation).toHaveProperty('soliSaved')
    expect(result.calculation).toHaveProperty('soliWithoutReform')
    expect(result.calculation).toHaveProperty('explanation')
  })
})
