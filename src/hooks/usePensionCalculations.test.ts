import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePensionCalculations } from './usePensionCalculations'

const mockOnChange = {
  onStartYearChange: vi.fn(),
  onMonthlyAmountChange: vi.fn(),
  onTaxablePercentageChange: vi.fn(),
}

const defaultValues = {
  hasTaxReturnData: false,
  taxYear: 2023,
  annualPensionReceived: 0,
  taxablePortion: 0,
  startYear: 2041,
  retirementAge: 67,
}

describe('usePensionCalculations', () => {
  it('should calculate start year on mount when birth year is provided', () => {
    renderHook(() =>
      usePensionCalculations({
        values: { ...defaultValues, startYear: 2040 }, // Different from expected
        onChange: mockOnChange,
        birthYear: 1974,
        planningMode: 'individual',
      }),
    )

    // 1974 + 67 = 2041, different from current 2040, so should call onStartYearChange
    expect(mockOnChange.onStartYearChange).toHaveBeenCalledWith(2041)
  })

  it('should not call onStartYearChange when start year is already correct', () => {
    mockOnChange.onStartYearChange.mockClear()

    renderHook(() =>
      usePensionCalculations({
        values: { ...defaultValues, startYear: 2041 }, // Correct value
        onChange: mockOnChange,
        birthYear: 1974,
        planningMode: 'individual',
      }),
    )

    // Start year is already correct, so should not call onStartYearChange
    expect(mockOnChange.onStartYearChange).not.toHaveBeenCalled()
  })

  it('should recalculate start year when retirement age changes', () => {
    mockOnChange.onStartYearChange.mockClear()

    const { rerender } = renderHook(
      ({ retirementAge }) =>
        usePensionCalculations({
          values: { ...defaultValues, retirementAge, startYear: 2041 },
          onChange: mockOnChange,
          birthYear: 1974,
          planningMode: 'individual',
        }),
      { initialProps: { retirementAge: 67 } },
    )

    // Initial render with 67 should not call (already correct)
    expect(mockOnChange.onStartYearChange).not.toHaveBeenCalled()

    // Change retirement age to 65
    rerender({ retirementAge: 65 })

    // 1974 + 65 = 2039, different from current 2041, so should call onStartYearChange
    expect(mockOnChange.onStartYearChange).toHaveBeenCalledWith(2039)
  })

  it('should calculate start year for couple mode using earlier birth year', () => {
    mockOnChange.onStartYearChange.mockClear()

    renderHook(() =>
      usePensionCalculations({
        values: { ...defaultValues, startYear: 2040 },
        onChange: mockOnChange,
        birthYear: 1974,
        spouseBirthYear: 1976,
        planningMode: 'couple',
      }),
    )

    // Earlier partner: 1974 + 67 = 2041
    expect(mockOnChange.onStartYearChange).toHaveBeenCalledWith(2041)
  })

  it('should import values from tax return data correctly', () => {
    mockOnChange.onMonthlyAmountChange.mockClear()
    mockOnChange.onTaxablePercentageChange.mockClear()

    const { result } = renderHook(() =>
      usePensionCalculations({
        values: {
          ...defaultValues,
          hasTaxReturnData: true,
          annualPensionReceived: 19200,
          taxablePortion: 15360,
        },
        onChange: mockOnChange,
        birthYear: 1974,
        planningMode: 'individual',
      }),
    )

    // Call the import handler
    result.current.handleImportFromTaxReturn()

    // 19200 / 12 = 1600
    expect(mockOnChange.onMonthlyAmountChange).toHaveBeenCalledWith(1600)
    // 15360 / 19200 * 100 = 80%
    expect(mockOnChange.onTaxablePercentageChange).toHaveBeenCalledWith(80)
  })

  it('should not import when hasTaxReturnData is false', () => {
    mockOnChange.onMonthlyAmountChange.mockClear()
    mockOnChange.onTaxablePercentageChange.mockClear()

    const { result } = renderHook(() =>
      usePensionCalculations({
        values: {
          ...defaultValues,
          hasTaxReturnData: false,
          annualPensionReceived: 19200,
          taxablePortion: 15360,
        },
        onChange: mockOnChange,
        birthYear: 1974,
        planningMode: 'individual',
      }),
    )

    // Call the import handler
    result.current.handleImportFromTaxReturn()

    // Should not call onChange methods when hasTaxReturnData is false
    expect(mockOnChange.onMonthlyAmountChange).not.toHaveBeenCalled()
    expect(mockOnChange.onTaxablePercentageChange).not.toHaveBeenCalled()
  })

  it('should not import when annualPensionReceived is 0', () => {
    mockOnChange.onMonthlyAmountChange.mockClear()
    mockOnChange.onTaxablePercentageChange.mockClear()

    const { result } = renderHook(() =>
      usePensionCalculations({
        values: {
          ...defaultValues,
          hasTaxReturnData: true,
          annualPensionReceived: 0,
        },
        onChange: mockOnChange,
        birthYear: 1974,
        planningMode: 'individual',
      }),
    )

    // Call the import handler
    result.current.handleImportFromTaxReturn()

    // Should not call onChange methods when annualPensionReceived is 0
    expect(mockOnChange.onMonthlyAmountChange).not.toHaveBeenCalled()
    expect(mockOnChange.onTaxablePercentageChange).not.toHaveBeenCalled()
  })
})
