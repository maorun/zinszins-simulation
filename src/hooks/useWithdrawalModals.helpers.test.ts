import { describe, it, expect, vi } from 'vitest'
import {
  findApplicableSegment,
  handleInflationExplanation,
  handleInterestExplanation,
  handleTaxExplanation,
  handleIncomeTaxExplanation,
  handleTaxableIncomeExplanation,
  handleOtherIncomeExplanation,
  handleStatutoryPensionExplanation,
  handleEndkapitalExplanation,
  handleHealthCareInsuranceExplanation,
} from './useWithdrawalModals.helpers'

// Mock the calculation helpers
vi.mock('../components/calculationHelpers', () => ({
  createInflationExplanation: vi.fn((_base, _rate, _years, amount) => ({
    title: 'Inflation',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [{ label: 'Amount', value: amount.toString() }] },
  })),
  createWithdrawalInterestExplanation: vi.fn(() => ({
    title: 'Interest',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [] },
  })),
  createTaxExplanation: vi.fn(() => ({
    title: 'Tax',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [] },
  })),
  createIncomeTaxExplanation: vi.fn(() => ({
    title: 'Income Tax',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [] },
  })),
  createTaxableIncomeExplanation: vi.fn(() => ({
    title: 'Taxable Income',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [] },
  })),
  createOtherIncomeExplanation: vi.fn(() => ({
    title: 'Other Income',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [] },
  })),
  createStatutoryPensionExplanation: vi.fn(() => ({
    title: 'Statutory Pension',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [] },
  })),
  createEndkapitalExplanation: vi.fn(() => ({
    title: 'Endkapital',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [] },
  })),
  createHealthCareInsuranceExplanation: vi.fn(() => ({
    title: 'Health Care Insurance',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [] },
  })),
}))

describe('useWithdrawalModals.helpers', () => {
  describe('findApplicableSegment', () => {
    it('should return null when useSegmentedWithdrawal is false', () => {
      const result = findApplicableSegment(false, [], 2024)
      expect(result).toBeNull()
    })

    it('should return null when no segments match', () => {
      const segments = [
        { startYear: 2020, endYear: 2022 },
        { startYear: 2025, endYear: 2027 },
      ]
      const result = findApplicableSegment(true, segments, 2024)
      expect(result).toBeNull()
    })

    it('should return matching segment', () => {
      const segments = [
        { startYear: 2020, endYear: 2022 },
        { startYear: 2023, endYear: 2025 },
      ]
      const result = findApplicableSegment(true, segments, 2024)
      expect(result).toEqual({ startYear: 2023, endYear: 2025 })
    })
  })

  describe('handleInflationExplanation', () => {
    it('should return null when inflationAnpassung is undefined', () => {
      const rowData = { year: 2024 }
      const context = {
        formValue: {},
        withdrawalData: { startingCapital: 500000 },
        startOfIndependence: 2023,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        grundfreibetragAktiv: false,
        grundfreibetragBetrag: 0,
      }
      const result = handleInflationExplanation({ rowData, context, applicableSegment: null })
      expect(result).toBeNull()
    })

    it('should create inflation explanation', () => {
      const rowData = { year: 2024, inflationAnpassung: 100 }
      const context = {
        formValue: { inflationsrate: 2 },
        withdrawalData: { startingCapital: 500000 },
        startOfIndependence: 2023,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        grundfreibetragAktiv: false,
        grundfreibetragBetrag: 0,
      }
      const result = handleInflationExplanation({ rowData, context, applicableSegment: null })
      expect(result).toBeDefined()
      expect(result?.title).toBe('Inflation')
    })
  })

  describe('handleInterestExplanation', () => {
    it('should return null when zinsen is not provided', () => {
      const rowData = { year: 2024 }
      const context = {
        formValue: {},
        withdrawalData: { startingCapital: 500000 },
        startOfIndependence: 2023,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        grundfreibetragAktiv: false,
        grundfreibetragBetrag: 0,
      }
      const result = handleInterestExplanation({ rowData, context, applicableSegment: null })
      expect(result).toBeNull()
    })

    it('should create interest explanation', () => {
      const rowData = { year: 2024, zinsen: 5000, startkapital: 100000 }
      const context = {
        formValue: { rendite: 5 },
        withdrawalData: { startingCapital: 500000 },
        startOfIndependence: 2023,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        grundfreibetragAktiv: false,
        grundfreibetragBetrag: 0,
      }
      const result = handleInterestExplanation({ rowData, context, applicableSegment: null })
      expect(result).toBeDefined()
      expect(result?.title).toBe('Interest')
    })
  })

  describe('handleTaxExplanation', () => {
    it('should return null when bezahlteSteuer is not provided', () => {
      const rowData = { year: 2024 }
      const context = {
        formValue: {},
        withdrawalData: { startingCapital: 500000 },
        startOfIndependence: 2023,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        grundfreibetragAktiv: false,
        grundfreibetragBetrag: 0,
      }
      const result = handleTaxExplanation({ rowData, context })
      expect(result).toBeNull()
    })

    it('should create tax explanation', () => {
      const rowData = { year: 2024, bezahlteSteuer: 1000 }
      const context = {
        formValue: {},
        withdrawalData: { startingCapital: 500000 },
        startOfIndependence: 2023,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        grundfreibetragAktiv: false,
        grundfreibetragBetrag: 0,
      }
      const result = handleTaxExplanation({ rowData, context })
      expect(result).toBeDefined()
      expect(result?.title).toBe('Tax')
    })
  })

  describe('handleIncomeTaxExplanation', () => {
    it('should return null when einkommensteuer is undefined', () => {
      const rowData = { year: 2024 }
      const context = {
        formValue: {},
        withdrawalData: { startingCapital: 500000 },
        startOfIndependence: 2023,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        grundfreibetragAktiv: false,
        grundfreibetragBetrag: 0,
      }
      const result = handleIncomeTaxExplanation({ rowData, context, applicableSegment: null })
      expect(result).toBeNull()
    })

    it('should create income tax explanation', () => {
      const rowData = { year: 2024, einkommensteuer: 500, entnahme: 20000 }
      const context = {
        formValue: { einkommensteuersatz: 18 },
        withdrawalData: { startingCapital: 500000 },
        startOfIndependence: 2023,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        grundfreibetragAktiv: true,
        grundfreibetragBetrag: 10908,
      }
      const result = handleIncomeTaxExplanation({ rowData, context, applicableSegment: null })
      expect(result).toBeDefined()
      expect(result?.title).toBe('Income Tax')
    })
  })

  describe('handleTaxableIncomeExplanation', () => {
    it('should create taxable income explanation', () => {
      const rowData = {
        year: 2024,
        entnahme: 20000,
        statutoryPension: { taxableAmount: 5000 },
        otherIncome: {
          sources: [{ grossAnnualAmount: 3000 }],
        },
        healthCareInsurance: { totalAnnual: 4000 },
      }
      const context = {
        formValue: {},
        withdrawalData: { startingCapital: 500000 },
        startOfIndependence: 2023,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        grundfreibetragAktiv: true,
        grundfreibetragBetrag: 10908,
      }
      const result = handleTaxableIncomeExplanation({ rowData, context })
      expect(result).toBeDefined()
      expect(result?.title).toBe('Taxable Income')
    })
  })

  describe('handleOtherIncomeExplanation', () => {
    it('should return null when otherIncome is not provided', () => {
      const rowData = { year: 2024 }
      const result = handleOtherIncomeExplanation({ rowData })
      expect(result).toBeNull()
    })

    it('should create other income explanation', () => {
      const rowData = {
        year: 2024,
        otherIncome: {
          totalNetAmount: 2500,
          totalTaxAmount: 500,
          sourceCount: 2,
        },
      }
      const result = handleOtherIncomeExplanation({ rowData })
      expect(result).toBeDefined()
      expect(result?.title).toBe('Other Income')
    })
  })

  describe('handleStatutoryPensionExplanation', () => {
    it('should return null when statutoryPension is not provided', () => {
      const rowData = { year: 2024 }
      const result = handleStatutoryPensionExplanation({ rowData })
      expect(result).toBeNull()
    })

    it('should create statutory pension explanation', () => {
      const rowData = {
        year: 2024,
        statutoryPension: {
          grossAnnualAmount: 15000,
          netAnnualAmount: 13000,
          incomeTax: 2000,
          taxableAmount: 12000,
        },
      }
      const result = handleStatutoryPensionExplanation({ rowData })
      expect(result).toBeDefined()
      expect(result?.title).toBe('Statutory Pension')
    })
  })

  describe('handleEndkapitalExplanation', () => {
    it('should create endkapital explanation', () => {
      const rowData = {
        year: 2024,
        endkapital: 480000,
        startkapital: 500000,
        zinsen: 5000,
        entnahme: 20000,
        bezahlteSteuer: 1000,
        terCosts: 500,
        transactionCosts: 300,
      }
      const result = handleEndkapitalExplanation({ rowData })
      expect(result).toBeDefined()
      expect(result?.title).toBe('Endkapital')
    })
  })

  describe('handleHealthCareInsuranceExplanation', () => {
    it('should return null when healthCareInsurance is not provided', () => {
      const rowData = { year: 2024 }
      const result = handleHealthCareInsuranceExplanation({ rowData })
      expect(result).toBeNull()
    })

    it('should create health care insurance explanation', () => {
      const rowData = {
        year: 2024,
        healthCareInsurance: {
          healthInsuranceAnnual: 2920,
          careInsuranceAnnual: 1220,
          totalAnnual: 4140,
          insuranceType: 'statutory' as const,
          effectiveHealthInsuranceRate: 7.3,
          effectiveCareInsuranceRate: 3.05,
          baseIncomeForCalculation: 40000,
          isRetirementPhase: true,
          includesEmployerContribution: false,
          inflationAdjustmentFactor: 1.02,
        },
      }
      const result = handleHealthCareInsuranceExplanation({ rowData })
      expect(result).toBeDefined()
      expect(result?.title).toBe('Health Care Insurance')
    })
  })
})
