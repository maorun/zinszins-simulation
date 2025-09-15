import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useWithdrawalModals } from './useWithdrawalModals'

// Mock the calculation helpers
vi.mock('../components/calculationHelpers', () => ({
  createInflationExplanation: vi.fn(() => ({ title: 'Inflation', introduction: 'Test', steps: [], finalResult: { title: 'Result', values: [] } })),
  createWithdrawalInterestExplanation: vi.fn(() => ({ title: 'Interest', introduction: 'Test', steps: [], finalResult: { title: 'Result', values: [] } })),
  createTaxExplanation: vi.fn(() => ({ title: 'Tax', introduction: 'Test', steps: [], finalResult: { title: 'Result', values: [] } })),
  createIncomeTaxExplanation: vi.fn(() => ({ title: 'Income Tax', introduction: 'Test', steps: [], finalResult: { title: 'Result', values: [] } })),
  createTaxableIncomeExplanation: vi.fn(() => ({ title: 'Taxable Income', introduction: 'Test', steps: [], finalResult: { title: 'Result', values: [] } })),
}))

const mockFormValue = {
  inflationsrate: 2,
  rendite: 5,
  grundfreibetragAktiv: true,
  grundfreibetragBetrag: 10908,
  einkommensteuersatz: 18,
}

const mockWithdrawalData = {
  startingCapital: 500000,
}

describe('useWithdrawalModals', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useWithdrawalModals(
      mockFormValue,
      false,
      [],
      mockWithdrawalData,
      2023,
      0.26375,
      0.3,
    ))

    expect(result.current.showCalculationModal).toBe(false)
    expect(result.current.calculationDetails).toBe(null)
    expect(result.current.showVorabpauschaleModal).toBe(false)
    expect(result.current.selectedVorabDetails).toBe(null)
    expect(typeof result.current.handleCalculationInfoClick).toBe('function')
  })

  it('handles inflation calculation explanation', () => {
    const { result } = renderHook(() => useWithdrawalModals(
      mockFormValue,
      false,
      [],
      mockWithdrawalData,
      2023,
      0.26375,
      0.3,
    ))

    const rowData = {
      year: 2024,
      inflationAnpassung: 100,
    }

    act(() => {
      result.current.handleCalculationInfoClick('inflation', rowData)
    })

    expect(result.current.showCalculationModal).toBe(true)
    expect(result.current.calculationDetails).toBeDefined()
  })

  it('provides modal state management functions', () => {
    const { result } = renderHook(() => useWithdrawalModals(
      mockFormValue,
      false,
      [],
      mockWithdrawalData,
      2023,
      0.26375,
      0.3,
    ))

    expect(typeof result.current.setShowCalculationModal).toBe('function')
    expect(typeof result.current.setShowVorabpauschaleModal).toBe('function')
  })

  it('handles different explanation types', () => {
    const { result } = renderHook(() => useWithdrawalModals(
      mockFormValue,
      false,
      [],
      mockWithdrawalData,
      2023,
      0.26375,
      0.3,
    ))

    // Test that the function doesn't throw for different explanation types
    act(() => {
      result.current.handleCalculationInfoClick('interest', { year: 2024, zinsen: 5000, startkapital: 100000 })
    })

    act(() => {
      result.current.handleCalculationInfoClick('tax', { year: 2024, bezahlteSteuer: 1000, genutzterFreibetrag: 2000 })
    })

    act(() => {
      result.current.handleCalculationInfoClick('incomeTax', { year: 2024, einkommensteuer: 500, entnahme: 20000 })
    })

    act(() => {
      result.current.handleCalculationInfoClick('vorabpauschale', { year: 2024, vorabpauschaleDetails: { test: 'data' } })
    })

    // Just verify that the function executes without throwing
    expect(typeof result.current.handleCalculationInfoClick).toBe('function')
  })
})
