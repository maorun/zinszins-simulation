import { describe, it, expect } from 'vitest'
import {
  createDefaultPhaseConfig,
  createDefaultBafoegConfig,
  createDefaultAusbildungsfreibetragConfig,
  calculateBafoegEligibility,
  calculateBafoegAmount,
  isEligibleForAusbildungsfreibetrag,
  calculateAusbildungsfreibetrag,
  calculateEducationCostsForYear,
  calculateTotalEducationCosts,
  createStandardEducationPath,
  createVocationalEducationPath,
  getEducationPhaseDisplayName,
  getEducationPhaseDescription,
  validateChildrenEducationConfig,
  DEFAULT_EDUCATION_COSTS,
  BAFOEG_CONSTANTS,
  AUSBILDUNGSFREIBETRAG_CONSTANTS,
  type ChildrenEducationConfig,
  type BafoegConfig,
} from './children-education'

describe('children-education', () => {
  const currentYear = 2024
  const childBirthYear = 2020

  describe('createDefaultPhaseConfig', () => {
    it('should create default kita configuration', () => {
      const config = createDefaultPhaseConfig('kita', childBirthYear, currentYear)

      expect(config.phase).toBe('kita')
      expect(config.monthlyCost).toBe(DEFAULT_EDUCATION_COSTS.kita)
      expect(config.startYear).toBe(2024) // max(2024, 2020+1=2021) = 2024
      expect(config.endYear).toBe(2026) // 2020+6
      expect(config.inflationRate).toBe(2.0)
      expect(config.taxDeductible).toBe(false)
    })

    it('should create default studium configuration', () => {
      const config = createDefaultPhaseConfig('studium', childBirthYear, currentYear)

      expect(config.phase).toBe('studium')
      expect(config.monthlyCost).toBe(DEFAULT_EDUCATION_COSTS.studium)
      expect(config.startYear).toBe(2039) // 2020+19
      expect(config.endYear).toBe(2045) // 2020+25
      expect(config.taxDeductible).toBe(true) // University is tax-deductible
    })

    it('should create default ausbildung configuration', () => {
      const config = createDefaultPhaseConfig('ausbildung', childBirthYear, currentYear)

      expect(config.phase).toBe('ausbildung')
      expect(config.taxDeductible).toBe(true) // Vocational training is tax-deductible
    })
  })

  describe('createDefaultBafoegConfig', () => {
    it('should create default BAföG configuration', () => {
      const config = createDefaultBafoegConfig(2000, currentYear)

      expect(config.enabled).toBe(false)
      expect(config.monthlyAmount).toBe(BAFOEG_CONSTANTS.maxMonthlyAmountAwayFromParents)
      expect(config.startYear).toBe(2024) // max(2024, 2000+19=2019) = 2024
      expect(config.endYear).toBe(2028) // startYear + 4
      expect(config.livingWithParents).toBe(false)
      expect(config.eligibility).toBe('eligible')
      expect(config.repaymentRate).toBe(50)
    })

    it('should set correct start year for future student', () => {
      const config = createDefaultBafoegConfig(2010, currentYear)

      expect(config.startYear).toBe(2029) // 2010+19
      expect(config.endYear).toBe(2033) // 2029+4
    })
  })

  describe('calculateBafoegEligibility', () => {
    const baseConfig: BafoegConfig = {
      enabled: true,
      monthlyAmount: 934,
      startYear: 2024,
      endYear: 2028,
      livingWithParents: false,
      parentalIncome: 40000,
      siblingsInEducation: 0,
      hasOwnIncome: false,
      ownIncome: 0,
      eligibility: 'eligible',
      repaymentRate: 50,
    }

    it('should return eligible for low parental income', () => {
      const config = { ...baseConfig, parentalIncome: 25000 }
      expect(calculateBafoegEligibility(config)).toBe('eligible')
    })

    it('should return partial for medium parental income', () => {
      const config = { ...baseConfig, parentalIncome: 45000 }
      expect(calculateBafoegEligibility(config)).toBe('partial')
    })

    it('should return ineligible for high parental income', () => {
      const config = { ...baseConfig, parentalIncome: 70000 }
      expect(calculateBafoegEligibility(config)).toBe('ineligible')
    })

    it('should return ineligible if student has excessive own income', () => {
      const config = { ...baseConfig, hasOwnIncome: true, ownIncome: 10000 }
      expect(calculateBafoegEligibility(config)).toBe('ineligible')
    })

    it('should remain eligible if student income is below allowance', () => {
      const config = { ...baseConfig, hasOwnIncome: true, ownIncome: 5000, parentalIncome: 25000 }
      expect(calculateBafoegEligibility(config)).toBe('eligible')
    })
  })

  describe('calculateBafoegAmount', () => {
    const baseConfig: BafoegConfig = {
      enabled: true,
      monthlyAmount: 934,
      startYear: 2024,
      endYear: 2028,
      livingWithParents: false,
      parentalIncome: 40000,
      siblingsInEducation: 0,
      hasOwnIncome: false,
      ownIncome: 0,
      eligibility: 'eligible',
      repaymentRate: 50,
    }

    it('should return full amount for eligible students living away from parents', () => {
      const config = { ...baseConfig, parentalIncome: 25000 }
      expect(calculateBafoegAmount(config)).toBe(BAFOEG_CONSTANTS.maxMonthlyAmountAwayFromParents)
    })

    it('should return reduced amount for students living with parents', () => {
      const config = { ...baseConfig, livingWithParents: true, parentalIncome: 25000 }
      expect(calculateBafoegAmount(config)).toBe(BAFOEG_CONSTANTS.maxMonthlyAmountWithParents)
    })

    it('should return 0 for ineligible students', () => {
      const config = { ...baseConfig, parentalIncome: 70000 }
      expect(calculateBafoegAmount(config)).toBe(0)
    })

    it('should return partial amount for partial eligibility', () => {
      const config = { ...baseConfig, parentalIncome: 45000 }
      const amount = calculateBafoegAmount(config)
      expect(amount).toBeGreaterThan(0)
      expect(amount).toBeLessThan(BAFOEG_CONSTANTS.maxMonthlyAmountAwayFromParents)
    })

    it('should respect custom monthly amount if lower than maximum', () => {
      const config = { ...baseConfig, monthlyAmount: 700, parentalIncome: 25000 }
      expect(calculateBafoegAmount(config)).toBe(700)
    })

    it('should cap at maximum even if custom amount is higher', () => {
      const config = { ...baseConfig, monthlyAmount: 1200, parentalIncome: 25000 }
      expect(calculateBafoegAmount(config)).toBe(BAFOEG_CONSTANTS.maxMonthlyAmountAwayFromParents)
    })
  })

  describe('calculateEducationCostsForYear', () => {
    it('should calculate costs for active kita phase', () => {
      const config: ChildrenEducationConfig = {
        childName: 'Max',
        birthYear: 2020,
        educationPath: 'individuell',
        phases: [
          {
            phase: 'kita',
            monthlyCost: 300,
            startYear: 2024,
            endYear: 2026,
            inflationRate: 2.0,
            taxDeductible: false,
            maxAnnualTaxDeduction: 0,
          },
        ],
        includeKindergeld: true,
      }

      const result = calculateEducationCostsForYear(config, 2024)

      expect(result.totalMonthlyCost).toBe(300)
      expect(result.totalAnnualCost).toBe(3600)
      expect(result.bafoegSupport).toBe(0)
      expect(result.netAnnualCost).toBe(3600)
      expect(result.activePhases).toHaveLength(1)
      expect(result.taxDeduction).toBe(0)
    })

    it('should apply inflation correctly', () => {
      const config: ChildrenEducationConfig = {
        childName: 'Max',
        birthYear: 2020,
        educationPath: 'individuell',
        phases: [
          {
            phase: 'kita',
            monthlyCost: 300,
            startYear: 2024,
            endYear: 2026,
            inflationRate: 2.0,
            taxDeductible: false,
            maxAnnualTaxDeduction: 0,
          },
        ],
        includeKindergeld: true,
      }

      // Year 2025 (1 year after start)
      const result2025 = calculateEducationCostsForYear(config, 2025)
      expect(result2025.totalMonthlyCost).toBeCloseTo(306, 1) // 300 * 1.02

      // Year 2026 (2 years after start)
      const result2026 = calculateEducationCostsForYear(config, 2026)
      expect(result2026.totalMonthlyCost).toBeCloseTo(312.12, 1) // 300 * 1.02^2
    })

    it('should calculate BAföG support correctly', () => {
      const config: ChildrenEducationConfig = {
        childName: 'Anna',
        birthYear: 2000,
        educationPath: 'regelweg',
        phases: [
          {
            phase: 'studium',
            monthlyCost: 850,
            startYear: 2024,
            endYear: 2028,
            inflationRate: 2.0,
            taxDeductible: true,
            maxAnnualTaxDeduction: 6000,
          },
        ],
        bafoegConfig: {
          enabled: true,
          monthlyAmount: 934,
          startYear: 2024,
          endYear: 2028,
          livingWithParents: false,
          parentalIncome: 25000,
          siblingsInEducation: 0,
          hasOwnIncome: false,
          ownIncome: 0,
          eligibility: 'eligible',
          repaymentRate: 50,
        },
        includeKindergeld: true,
      }

      const result = calculateEducationCostsForYear(config, 2024)

      expect(result.totalAnnualCost).toBe(850 * 12)
      expect(result.bafoegSupport).toBe(934 * 12)
      expect(result.netAnnualCost).toBe(0) // BAföG covers more than costs
    })

    it('should calculate tax deduction for tax-deductible phases', () => {
      const config: ChildrenEducationConfig = {
        childName: 'Tom',
        birthYear: 2005,
        educationPath: 'ausbildung',
        phases: [
          {
            phase: 'ausbildung',
            monthlyCost: 150,
            startYear: 2024,
            endYear: 2026,
            inflationRate: 0,
            taxDeductible: true,
            maxAnnualTaxDeduction: 6000,
          },
        ],
        includeKindergeld: true,
      }

      const result = calculateEducationCostsForYear(config, 2024)

      expect(result.taxDeduction).toBe(150 * 12) // Full amount is deductible
    })

    it('should cap tax deduction at maximum', () => {
      const config: ChildrenEducationConfig = {
        childName: 'Sarah',
        birthYear: 2000,
        educationPath: 'regelweg',
        phases: [
          {
            phase: 'studium',
            monthlyCost: 1000,
            startYear: 2024,
            endYear: 2028,
            inflationRate: 0,
            taxDeductible: true,
            maxAnnualTaxDeduction: 6000,
          },
        ],
        includeKindergeld: true,
      }

      const result = calculateEducationCostsForYear(config, 2024)

      expect(result.taxDeduction).toBe(6000) // Capped at max
      expect(result.totalAnnualCost).toBe(12000)
    })

    it('should handle multiple active phases', () => {
      const config: ChildrenEducationConfig = {
        childName: 'Lisa',
        birthYear: 2015,
        educationPath: 'individuell',
        phases: [
          {
            phase: 'kita',
            monthlyCost: 300,
            startYear: 2020,
            endYear: 2024,
            inflationRate: 0,
            taxDeductible: false,
            maxAnnualTaxDeduction: 0,
          },
          {
            phase: 'grundschule',
            monthlyCost: 50,
            startYear: 2024,
            endYear: 2028,
            inflationRate: 0,
            taxDeductible: false,
            maxAnnualTaxDeduction: 0,
          },
        ],
        includeKindergeld: true,
      }

      const result = calculateEducationCostsForYear(config, 2024)

      expect(result.totalMonthlyCost).toBe(350) // Both phases active
      expect(result.activePhases).toHaveLength(2)
    })

    it('should return zero costs for inactive years', () => {
      const config: ChildrenEducationConfig = {
        childName: 'Max',
        birthYear: 2020,
        educationPath: 'individuell',
        phases: [
          {
            phase: 'kita',
            monthlyCost: 300,
            startYear: 2024,
            endYear: 2026,
            inflationRate: 0,
            taxDeductible: false,
            maxAnnualTaxDeduction: 0,
          },
        ],
        includeKindergeld: true,
      }

      const result = calculateEducationCostsForYear(config, 2030)

      expect(result.totalMonthlyCost).toBe(0)
      expect(result.totalAnnualCost).toBe(0)
      expect(result.activePhases).toHaveLength(0)
    })
  })

  describe('calculateTotalEducationCosts', () => {
    it('should calculate total costs for single child', () => {
      const child: ChildrenEducationConfig = {
        childName: 'Max',
        birthYear: 2020,
        educationPath: 'individuell',
        phases: [
          {
            phase: 'kita',
            monthlyCost: 300,
            startYear: 2024,
            endYear: 2026,
            inflationRate: 0,
            taxDeductible: false,
            maxAnnualTaxDeduction: 0,
          },
        ],
        includeKindergeld: true,
      }

      const result = calculateTotalEducationCosts([child], 2024, 2026)

      expect(result.totalCosts).toBe(300 * 12 * 3) // 3 years
      expect(result.totalBafoegSupport).toBe(0)
      expect(result.yearlyBreakdown).toHaveLength(3)
    })

    it('should calculate costs for multiple children', () => {
      const child1: ChildrenEducationConfig = {
        childName: 'Max',
        birthYear: 2020,
        educationPath: 'individuell',
        phases: [
          {
            phase: 'kita',
            monthlyCost: 300,
            startYear: 2024,
            endYear: 2026,
            inflationRate: 0,
            taxDeductible: false,
            maxAnnualTaxDeduction: 0,
          },
        ],
        includeKindergeld: true,
      }

      const child2: ChildrenEducationConfig = {
        childName: 'Anna',
        birthYear: 2018,
        educationPath: 'individuell',
        phases: [
          {
            phase: 'grundschule',
            monthlyCost: 50,
            startYear: 2024,
            endYear: 2026,
            inflationRate: 0,
            taxDeductible: false,
            maxAnnualTaxDeduction: 0,
          },
        ],
        includeKindergeld: true,
      }

      const result = calculateTotalEducationCosts([child1, child2], 2024, 2026)

      expect(result.totalCosts).toBe((300 + 50) * 12 * 3)
      expect(result.yearlyBreakdown[0].childrenDetails).toHaveLength(2)
    })

    it('should sum up BAföG support correctly', () => {
      const child: ChildrenEducationConfig = {
        childName: 'Anna',
        birthYear: 2000,
        educationPath: 'regelweg',
        phases: [
          {
            phase: 'studium',
            monthlyCost: 850,
            startYear: 2024,
            endYear: 2026,
            inflationRate: 0,
            taxDeductible: true,
            maxAnnualTaxDeduction: 6000,
          },
        ],
        bafoegConfig: {
          enabled: true,
          monthlyAmount: 934,
          startYear: 2024,
          endYear: 2026,
          livingWithParents: false,
          parentalIncome: 25000,
          siblingsInEducation: 0,
          hasOwnIncome: false,
          ownIncome: 0,
          eligibility: 'eligible',
          repaymentRate: 50,
        },
        includeKindergeld: true,
      }

      const result = calculateTotalEducationCosts([child], 2024, 2026)

      expect(result.totalBafoegSupport).toBe(934 * 12 * 3)
    })

    it('should aggregate tax deductions correctly', () => {
      const child: ChildrenEducationConfig = {
        childName: 'Tom',
        birthYear: 2005,
        educationPath: 'ausbildung',
        phases: [
          {
            phase: 'ausbildung',
            monthlyCost: 150,
            startYear: 2024,
            endYear: 2026,
            inflationRate: 0,
            taxDeductible: true,
            maxAnnualTaxDeduction: 6000,
          },
        ],
        includeKindergeld: true,
      }

      const result = calculateTotalEducationCosts([child], 2024, 2026)

      expect(result.totalTaxDeductions).toBe(150 * 12 * 3)
    })

    it('should exclude years with no costs or support', () => {
      const child: ChildrenEducationConfig = {
        childName: 'Max',
        birthYear: 2020,
        educationPath: 'individuell',
        phases: [
          {
            phase: 'kita',
            monthlyCost: 300,
            startYear: 2024,
            endYear: 2024,
            inflationRate: 0,
            taxDeductible: false,
            maxAnnualTaxDeduction: 0,
          },
        ],
        includeKindergeld: true,
      }

      const result = calculateTotalEducationCosts([child], 2024, 2030)

      expect(result.yearlyBreakdown).toHaveLength(1) // Only 2024 has costs
      expect(result.yearlyBreakdown[0].year).toBe(2024)
    })
  })

  describe('createStandardEducationPath', () => {
    it('should create standard path with all required phases', () => {
      const config = createStandardEducationPath('Max', 2020, 2024)

      expect(config.childName).toBe('Max')
      expect(config.birthYear).toBe(2020)
      expect(config.educationPath).toBe('regelweg')
      expect(config.phases).toHaveLength(4) // Kita, Grundschule, Weiterführend, Studium
      expect(config.phases[0].phase).toBe('kita')
      expect(config.phases[1].phase).toBe('grundschule')
      expect(config.phases[2].phase).toBe('weiterfuehrend')
      expect(config.phases[3].phase).toBe('studium')
      expect(config.bafoegConfig).toBeDefined()
    })

    it('should set correct year ranges for phases', () => {
      const config = createStandardEducationPath('Anna', 2015, 2024)

      const kitaPhase = config.phases.find((p) => p.phase === 'kita')!
      expect(kitaPhase.endYear).toBe(2021) // 2015 + 6

      const grundschulePhase = config.phases.find((p) => p.phase === 'grundschule')!
      expect(grundschulePhase.endYear).toBe(2025) // 2015 + 10

      const studiumPhase = config.phases.find((p) => p.phase === 'studium')!
      expect(studiumPhase.startYear).toBe(2034) // 2015 + 19
    })
  })

  describe('createVocationalEducationPath', () => {
    it('should create vocational path with ausbildung instead of studium', () => {
      const config = createVocationalEducationPath('Tom', 2020, 2024)

      expect(config.childName).toBe('Tom')
      expect(config.birthYear).toBe(2020)
      expect(config.educationPath).toBe('ausbildung')
      expect(config.phases).toHaveLength(4) // Kita, Grundschule, Weiterführend, Ausbildung
      expect(config.phases[3].phase).toBe('ausbildung')
      expect(config.bafoegConfig).toBeUndefined() // No BAföG for ausbildung
    })
  })

  describe('getEducationPhaseDisplayName', () => {
    it('should return correct display names', () => {
      expect(getEducationPhaseDisplayName('kita')).toBe('Kita/Kindergarten')
      expect(getEducationPhaseDisplayName('grundschule')).toBe('Grundschule')
      expect(getEducationPhaseDisplayName('weiterfuehrend')).toBe('Weiterführende Schule')
      expect(getEducationPhaseDisplayName('ausbildung')).toBe('Berufsausbildung')
      expect(getEducationPhaseDisplayName('studium')).toBe('Studium/Universität')
      expect(getEducationPhaseDisplayName('sonstiges')).toBe('Sonstige Bildung')
    })
  })

  describe('getEducationPhaseDescription', () => {
    it('should return correct descriptions', () => {
      expect(getEducationPhaseDescription('kita')).toContain('1-6 Jahre')
      expect(getEducationPhaseDescription('grundschule')).toContain('6-10 Jahre')
      expect(getEducationPhaseDescription('studium')).toContain('19-25 Jahre')
    })
  })

  describe('validateChildrenEducationConfig', () => {
    const validConfig: ChildrenEducationConfig = {
      childName: 'Max',
      birthYear: 2020,
      educationPath: 'regelweg',
      phases: [
        {
          phase: 'kita',
          monthlyCost: 300,
          startYear: 2024,
          endYear: 2026,
          inflationRate: 2.0,
          taxDeductible: false,
          maxAnnualTaxDeduction: 0,
        },
      ],
      includeKindergeld: true,
    }

    it('should pass validation for valid config', () => {
      const errors = validateChildrenEducationConfig(validConfig)
      expect(errors).toHaveLength(0)
    })

    it('should fail if child name is empty', () => {
      const config = { ...validConfig, childName: '' }
      const errors = validateChildrenEducationConfig(config)
      expect(errors).toContain('Name des Kindes muss angegeben werden.')
    })

    it('should fail if birth year is in the future', () => {
      const config = { ...validConfig, birthYear: 2030 }
      const errors = validateChildrenEducationConfig(config)
      expect(errors.some((e) => e.includes('Zukunft'))).toBe(true)
    })

    it('should fail if birth year is unrealistic', () => {
      const config = { ...validConfig, birthYear: 1990 }
      const errors = validateChildrenEducationConfig(config)
      expect(errors.some((e) => e.includes('unrealistisch'))).toBe(true)
    })

    it('should fail if no phases are configured', () => {
      const config = { ...validConfig, phases: [] }
      const errors = validateChildrenEducationConfig(config)
      expect(errors).toContain('Mindestens eine Bildungsphase muss konfiguriert werden.')
    })

    it('should fail if monthly cost is negative', () => {
      const config: ChildrenEducationConfig = {
        ...validConfig,
        phases: [{ ...validConfig.phases[0], monthlyCost: -100 }],
      }
      const errors = validateChildrenEducationConfig(config)
      expect(errors.some((e) => e.includes('negativ'))).toBe(true)
    })

    it('should fail if start year is after end year', () => {
      const config: ChildrenEducationConfig = {
        ...validConfig,
        phases: [{ ...validConfig.phases[0], startYear: 2026, endYear: 2024 }],
      }
      const errors = validateChildrenEducationConfig(config)
      expect(errors.some((e) => e.includes('Startjahr') && e.includes('Endjahr'))).toBe(true)
    })

    it('should fail if inflation rate is out of range', () => {
      const config: ChildrenEducationConfig = {
        ...validConfig,
        phases: [{ ...validConfig.phases[0], inflationRate: 25 }],
      }
      const errors = validateChildrenEducationConfig(config)
      expect(errors.some((e) => e.includes('Inflationsrate'))).toBe(true)
    })

    it('should validate BAföG configuration', () => {
      const config: ChildrenEducationConfig = {
        ...validConfig,
        bafoegConfig: {
          enabled: true,
          monthlyAmount: -100,
          startYear: 2024,
          endYear: 2028,
          livingWithParents: false,
          parentalIncome: 40000,
          siblingsInEducation: 0,
          hasOwnIncome: false,
          ownIncome: 0,
          eligibility: 'eligible',
          repaymentRate: 50,
        },
      }
      const errors = validateChildrenEducationConfig(config)
      expect(errors.some((e) => e.includes('BAföG'))).toBe(true)
    })

    it('should fail if BAföG amount exceeds legal maximum', () => {
      const config: ChildrenEducationConfig = {
        ...validConfig,
        bafoegConfig: {
          enabled: true,
          monthlyAmount: 2000,
          startYear: 2024,
          endYear: 2028,
          livingWithParents: false,
          parentalIncome: 40000,
          siblingsInEducation: 0,
          hasOwnIncome: false,
          ownIncome: 0,
          eligibility: 'eligible',
          repaymentRate: 50,
        },
      }
      const errors = validateChildrenEducationConfig(config)
      expect(errors.some((e) => e.includes('gesetzliches Maximum'))).toBe(true)
    })

    it('should fail if BAföG start year is after end year', () => {
      const config: ChildrenEducationConfig = {
        ...validConfig,
        bafoegConfig: {
          enabled: true,
          monthlyAmount: 934,
          startYear: 2028,
          endYear: 2024,
          livingWithParents: false,
          parentalIncome: 40000,
          siblingsInEducation: 0,
          hasOwnIncome: false,
          ownIncome: 0,
          eligibility: 'eligible',
          repaymentRate: 50,
        },
      }
      const errors = validateChildrenEducationConfig(config)
      expect(errors.some((e) => e.includes('BAföG-Startjahr'))).toBe(true)
    })

    it('should fail if parental income is negative', () => {
      const config: ChildrenEducationConfig = {
        ...validConfig,
        bafoegConfig: {
          enabled: true,
          monthlyAmount: 934,
          startYear: 2024,
          endYear: 2028,
          livingWithParents: false,
          parentalIncome: -10000,
          siblingsInEducation: 0,
          hasOwnIncome: false,
          ownIncome: 0,
          eligibility: 'eligible',
          repaymentRate: 50,
        },
      }
      const errors = validateChildrenEducationConfig(config)
      expect(errors.some((e) => e.includes('Elterneinkommen'))).toBe(true)
    })
  })

  describe('§ 33a Ausbildungsfreibetrag', () => {
    describe('createDefaultAusbildungsfreibetragConfig', () => {
      it('should create default configuration with correct year ranges', () => {
        const config = createDefaultAusbildungsfreibetragConfig(2005, 2024)

        expect(config.enabled).toBe(false)
        expect(config.livingAwayFromParents).toBe(true)
        expect(config.startYear).toBe(2024) // max(2024, 2005+18=2023) = 2024
        expect(config.endYear).toBe(2030) // 2005+25
      })

      it('should handle future start year correctly', () => {
        const config = createDefaultAusbildungsfreibetragConfig(2010, 2024)

        expect(config.startYear).toBe(2028) // 2010+18
        expect(config.endYear).toBe(2035) // 2010+25
      })

      it('should respect minimum age requirement', () => {
        const config = createDefaultAusbildungsfreibetragConfig(2006, 2024)

        expect(config.startYear).toBe(2024) // 2006+18=2024
        expect(config.endYear).toBe(2031) // 2006+25
      })
    })

    describe('isEligibleForAusbildungsfreibetrag', () => {
      const baseConfig: ChildrenEducationConfig = {
        childName: 'Anna',
        birthYear: 2005,
        educationPath: 'regelweg',
        phases: [
          {
            phase: 'studium',
            monthlyCost: 850,
            startYear: 2024,
            endYear: 2027,
            inflationRate: 2.0,
            taxDeductible: true,
            maxAnnualTaxDeduction: 6000,
          },
        ],
        ausbildungsfreibetragConfig: {
          enabled: true,
          livingAwayFromParents: true,
          startYear: 2023,
          endYear: 2030,
        },
        includeKindergeld: true,
      }

      it('should return true when all conditions are met', () => {
        expect(isEligibleForAusbildungsfreibetrag(baseConfig, 2024)).toBe(true)
      })

      it('should return false when disabled', () => {
        const config = {
          ...baseConfig,
          ausbildungsfreibetragConfig: {
            ...baseConfig.ausbildungsfreibetragConfig!,
            enabled: false,
          },
        }
        expect(isEligibleForAusbildungsfreibetrag(config, 2024)).toBe(false)
      })

      it('should return false when not living away from parents', () => {
        const config = {
          ...baseConfig,
          ausbildungsfreibetragConfig: {
            ...baseConfig.ausbildungsfreibetragConfig!,
            livingAwayFromParents: false,
          },
        }
        expect(isEligibleForAusbildungsfreibetrag(config, 2024)).toBe(false)
      })

      it('should return false when year is before start year', () => {
        expect(isEligibleForAusbildungsfreibetrag(baseConfig, 2022)).toBe(false)
      })

      it('should return false when year is after end year', () => {
        expect(isEligibleForAusbildungsfreibetrag(baseConfig, 2031)).toBe(false)
      })

      it('should return false when not in applicable phase', () => {
        const config = {
          ...baseConfig,
          phases: [
            {
              phase: 'kita' as const,
              monthlyCost: 300,
              startYear: 2024,
              endYear: 2027,
              inflationRate: 2.0,
              taxDeductible: false,
              maxAnnualTaxDeduction: 0,
            },
          ],
        }
        expect(isEligibleForAusbildungsfreibetrag(config, 2024)).toBe(false)
      })

      it('should return true for Ausbildung phase', () => {
        const config = {
          ...baseConfig,
          phases: [
            {
              phase: 'ausbildung' as const,
              monthlyCost: 150,
              startYear: 2024,
              endYear: 2027,
              inflationRate: 2.0,
              taxDeductible: true,
              maxAnnualTaxDeduction: 6000,
            },
          ],
        }
        expect(isEligibleForAusbildungsfreibetrag(config, 2024)).toBe(true)
      })

      it('should return false when child is too young', () => {
        const config = {
          ...baseConfig,
          birthYear: 2010, // 14 years old in 2024
        }
        expect(isEligibleForAusbildungsfreibetrag(config, 2024)).toBe(false)
      })

      it('should return false when child is too old', () => {
        const config = {
          ...baseConfig,
          birthYear: 1998, // 26 years old in 2024
        }
        expect(isEligibleForAusbildungsfreibetrag(config, 2024)).toBe(false)
      })

      it('should return true when child is exactly 18', () => {
        const config = {
          ...baseConfig,
          birthYear: 2006, // 18 years old in 2024
        }
        expect(isEligibleForAusbildungsfreibetrag(config, 2024)).toBe(true)
      })

      it('should return true when child is exactly 25', () => {
        const config = {
          ...baseConfig,
          birthYear: 1999, // 25 years old in 2024
        }
        expect(isEligibleForAusbildungsfreibetrag(config, 2024)).toBe(true)
      })

      it('should return false when config is undefined', () => {
        const config = {
          ...baseConfig,
          ausbildungsfreibetragConfig: undefined,
        }
        expect(isEligibleForAusbildungsfreibetrag(config, 2024)).toBe(false)
      })
    })

    describe('calculateAusbildungsfreibetrag', () => {
      const baseConfig: ChildrenEducationConfig = {
        childName: 'Max',
        birthYear: 2005,
        educationPath: 'regelweg',
        phases: [
          {
            phase: 'studium',
            monthlyCost: 850,
            startYear: 2024,
            endYear: 2027,
            inflationRate: 2.0,
            taxDeductible: true,
            maxAnnualTaxDeduction: 6000,
          },
        ],
        ausbildungsfreibetragConfig: {
          enabled: true,
          livingAwayFromParents: true,
          startYear: 2023,
          endYear: 2030,
        },
        includeKindergeld: true,
      }

      it('should return correct annual deduction when eligible', () => {
        const result = calculateAusbildungsfreibetrag(baseConfig, 2024)
        expect(result).toBe(AUSBILDUNGSFREIBETRAG_CONSTANTS.annualDeduction)
        expect(result).toBe(1200)
      })

      it('should return 0 when not eligible', () => {
        const config = {
          ...baseConfig,
          ausbildungsfreibetragConfig: {
            ...baseConfig.ausbildungsfreibetragConfig!,
            enabled: false,
          },
        }
        expect(calculateAusbildungsfreibetrag(config, 2024)).toBe(0)
      })

      it('should return 0 when living with parents', () => {
        const config = {
          ...baseConfig,
          ausbildungsfreibetragConfig: {
            ...baseConfig.ausbildungsfreibetragConfig!,
            livingAwayFromParents: false,
          },
        }
        expect(calculateAusbildungsfreibetrag(config, 2024)).toBe(0)
      })

      it('should return 0 for years outside range', () => {
        expect(calculateAusbildungsfreibetrag(baseConfig, 2022)).toBe(0)
        expect(calculateAusbildungsfreibetrag(baseConfig, 2031)).toBe(0)
      })

      it('should work for Ausbildung phase', () => {
        const config = {
          ...baseConfig,
          phases: [
            {
              phase: 'ausbildung' as const,
              monthlyCost: 150,
              startYear: 2024,
              endYear: 2027,
              inflationRate: 2.0,
              taxDeductible: true,
              maxAnnualTaxDeduction: 6000,
            },
          ],
        }
        expect(calculateAusbildungsfreibetrag(config, 2024)).toBe(1200)
      })
    })

    describe('calculateEducationCostsForYear with Ausbildungsfreibetrag', () => {
      it('should include Ausbildungsfreibetrag in tax deduction', () => {
        const config: ChildrenEducationConfig = {
          childName: 'Lisa',
          birthYear: 2005,
          educationPath: 'regelweg',
          phases: [
            {
              phase: 'studium',
              monthlyCost: 850,
              startYear: 2024,
              endYear: 2027,
              inflationRate: 0,
              taxDeductible: true,
              maxAnnualTaxDeduction: 6000,
            },
          ],
          ausbildungsfreibetragConfig: {
            enabled: true,
            livingAwayFromParents: true,
            startYear: 2023,
            endYear: 2030,
          },
          includeKindergeld: true,
        }

        const result = calculateEducationCostsForYear(config, 2024)

        // Tax deduction should be phase deduction (6000) + Ausbildungsfreibetrag (1200)
        expect(result.taxDeduction).toBe(6000 + 1200)
        expect(result.ausbildungsfreibetrag).toBe(1200)
      })

      it('should return separate ausbildungsfreibetrag value', () => {
        const config: ChildrenEducationConfig = {
          childName: 'Tom',
          birthYear: 2005,
          educationPath: 'regelweg',
          phases: [
            {
              phase: 'studium',
              monthlyCost: 850,
              startYear: 2024,
              endYear: 2027,
              inflationRate: 0,
              taxDeductible: true,
              maxAnnualTaxDeduction: 6000,
            },
          ],
          ausbildungsfreibetragConfig: {
            enabled: true,
            livingAwayFromParents: true,
            startYear: 2023,
            endYear: 2030,
          },
          includeKindergeld: true,
        }

        const result = calculateEducationCostsForYear(config, 2024)

        expect(result).toHaveProperty('ausbildungsfreibetrag')
        expect(result.ausbildungsfreibetrag).toBe(1200)
      })

      it('should not add Ausbildungsfreibetrag when disabled', () => {
        const config: ChildrenEducationConfig = {
          childName: 'Anna',
          birthYear: 2005,
          educationPath: 'regelweg',
          phases: [
            {
              phase: 'studium',
              monthlyCost: 850,
              startYear: 2024,
              endYear: 2027,
              inflationRate: 0,
              taxDeductible: true,
              maxAnnualTaxDeduction: 6000,
            },
          ],
          ausbildungsfreibetragConfig: {
            enabled: false,
            livingAwayFromParents: true,
            startYear: 2023,
            endYear: 2030,
          },
          includeKindergeld: true,
        }

        const result = calculateEducationCostsForYear(config, 2024)

        expect(result.taxDeduction).toBe(6000) // Only phase deduction, no Ausbildungsfreibetrag
        expect(result.ausbildungsfreibetrag).toBe(0)
      })

      it('should work without ausbildungsfreibetragConfig', () => {
        const config: ChildrenEducationConfig = {
          childName: 'Max',
          birthYear: 2005,
          educationPath: 'regelweg',
          phases: [
            {
              phase: 'studium',
              monthlyCost: 850,
              startYear: 2024,
              endYear: 2027,
              inflationRate: 0,
              taxDeductible: true,
              maxAnnualTaxDeduction: 6000,
            },
          ],
          includeKindergeld: true,
        }

        const result = calculateEducationCostsForYear(config, 2024)

        expect(result.taxDeduction).toBe(6000)
        expect(result.ausbildungsfreibetrag).toBe(0)
      })
    })

    describe('AUSBILDUNGSFREIBETRAG_CONSTANTS', () => {
      it('should have correct annual deduction amount', () => {
        expect(AUSBILDUNGSFREIBETRAG_CONSTANTS.annualDeduction).toBe(1200)
      })

      it('should have correct age limits', () => {
        expect(AUSBILDUNGSFREIBETRAG_CONSTANTS.minAge).toBe(18)
        expect(AUSBILDUNGSFREIBETRAG_CONSTANTS.maxAge).toBe(25)
      })

      it('should require living away from parents', () => {
        expect(AUSBILDUNGSFREIBETRAG_CONSTANTS.requiresLivingAway).toBe(true)
      })

      it('should have correct applicable phases', () => {
        expect(AUSBILDUNGSFREIBETRAG_CONSTANTS.applicablePhases).toEqual(['ausbildung', 'studium'])
      })
    })
  })
})
