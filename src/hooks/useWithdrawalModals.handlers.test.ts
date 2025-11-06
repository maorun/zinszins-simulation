import { describe, it, expect, vi } from 'vitest'
import {
  createHandlerContext,
  getExplanationHandler,
  processCalculationInfoClick,
} from './useWithdrawalModals.handlers'
import type { HandlerContext, RowData, WithdrawalSegment } from './useWithdrawalModals.types'

// Mock the calculation helpers
vi.mock('../components/calculationHelpers', () => ({
  createInflationExplanation: vi.fn(() => ({
    title: 'Inflation',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [] },
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
    title: 'Gesetzliche Kranken- & Pflegeversicherung',
    introduction: 'Test',
    steps: [],
    finalResult: { title: 'Result', values: [] },
  })),
}))

describe('useWithdrawalModals.handlers', () => {
  const mockFormValue = {
    inflationsrate: 2,
    rendite: 5,
    einkommensteuersatz: 18,
  }

  const mockWithdrawalData = {
    startingCapital: 500000,
  }

  describe('createHandlerContext', () => {
    it('creates a handler context with all parameters', () => {
      const context = createHandlerContext(mockFormValue, mockWithdrawalData, 2023, 0.26375, 0.3, true, 23208)

      expect(context).toEqual({
        formValue: mockFormValue,
        withdrawalData: mockWithdrawalData,
        startOfIndependence: 2023,
        steuerlast: 0.26375,
        teilfreistellungsquote: 0.3,
        grundfreibetragAktiv: true,
        grundfreibetragBetrag: 23208,
      })
    })
  })

  describe('getExplanationHandler', () => {
    const mockContext: HandlerContext = {
      formValue: mockFormValue,
      withdrawalData: mockWithdrawalData,
      startOfIndependence: 2023,
      steuerlast: 0.26375,
      teilfreistellungsquote: 0.3,
      grundfreibetragAktiv: true,
      grundfreibetragBetrag: 23208,
    }

    it('returns a handler for inflation explanation', () => {
      const rowData: RowData = { year: 2024, inflationAnpassung: 100 }
      const handler = getExplanationHandler('inflation', rowData, mockContext, null)

      expect(handler).toBeDefined()
      expect(handler).toBeInstanceOf(Function)
    })

    it('returns a handler for interest explanation', () => {
      const rowData: RowData = { year: 2024, zinsen: 5000, startkapital: 100000 }
      const handler = getExplanationHandler('interest', rowData, mockContext, null)

      expect(handler).toBeDefined()
      expect(handler).toBeInstanceOf(Function)
    })

    it('returns null for unknown explanation type', () => {
      const rowData: RowData = { year: 2024 }
      const handler = getExplanationHandler('unknown', rowData, mockContext, null)

      expect(handler).toBeNull()
    })
  })

  describe('processCalculationInfoClick', () => {
    const mockContext: HandlerContext = {
      formValue: mockFormValue,
      withdrawalData: mockWithdrawalData,
      startOfIndependence: 2023,
      steuerlast: 0.26375,
      teilfreistellungsquote: 0.3,
      grundfreibetragAktiv: true,
      grundfreibetragBetrag: 23208,
    }

    it('returns empty result for invalid rowData', () => {
      const result = processCalculationInfoClick('inflation', null, false, [], mockContext)

      expect(result).toEqual({
        showCalculation: false,
        calculationDetails: null,
        showVorabpauschale: false,
        vorabDetails: null,
      })
    })

    it('returns empty result for rowData without year property', () => {
      const result = processCalculationInfoClick('inflation', { notYear: 2024 }, false, [], mockContext)

      expect(result).toEqual({
        showCalculation: false,
        calculationDetails: null,
        showVorabpauschale: false,
        vorabDetails: null,
      })
    })

    it('returns Vorabpauschale result when explanationType is vorabpauschale', () => {
      const vorabDetails = {
        basiszins: 0.02,
        basisertrag: 100,
        vorabpauschaleAmount: 100,
        steuerVorFreibetrag: 26.38,
        jahresgewinn: 150,
        anteilImJahr: 12,
      }
      const rowData = {
        year: 2024,
        vorabpauschaleDetails: vorabDetails,
      }

      const result = processCalculationInfoClick('vorabpauschale', rowData, false, [], mockContext)

      expect(result).toEqual({
        showCalculation: false,
        calculationDetails: null,
        showVorabpauschale: true,
        vorabDetails,
      })
    })

    it('returns calculation result for valid inflation explanation', () => {
      const rowData: RowData = {
        year: 2024,
        inflationAnpassung: 100,
      }

      const result = processCalculationInfoClick('inflation', rowData, false, [], mockContext)

      expect(result.showCalculation).toBe(true)
      expect(result.calculationDetails).toBeDefined()
      expect(result.showVorabpauschale).toBe(false)
      expect(result.vorabDetails).toBeNull()
    })

    it('returns empty result for unknown explanation type', () => {
      const rowData: RowData = {
        year: 2024,
      }

      const result = processCalculationInfoClick('unknown', rowData, false, [], mockContext)

      expect(result).toEqual({
        showCalculation: false,
        calculationDetails: null,
        showVorabpauschale: false,
        vorabDetails: null,
      })
    })

    it('works with segmented withdrawal', () => {
      const segments: WithdrawalSegment[] = [
        {
          startYear: 2023,
          endYear: 2030,
          returnConfig: { mode: 'fixed', fixedRate: 0.05 },
          inflationConfig: { inflationRate: 0.02 },
        },
      ]
      const rowData: RowData = {
        year: 2024,
        inflationAnpassung: 100,
      }

      const result = processCalculationInfoClick('inflation', rowData, true, segments, mockContext)

      expect(result.showCalculation).toBe(true)
      expect(result.calculationDetails).toBeDefined()
    })
  })
})
