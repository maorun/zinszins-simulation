import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useRetirementStartYearAutoCalculation } from './useRetirementStartYearAutoCalculation'

describe('useRetirementStartYearAutoCalculation', () => {
  const mockOnRetirementStartYearChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not call onChange when calculated year equals current year', () => {
    renderHook(() =>
      useRetirementStartYearAutoCalculation({
        planningMode: 'individual',
        birthYear: 1974,
        spouseBirthYear: undefined,
        currentRetirementStartYear: 2041,
        onRetirementStartYearChange: mockOnRetirementStartYearChange,
      }),
    )

    expect(mockOnRetirementStartYearChange).not.toHaveBeenCalled()
  })

  it('calls onChange when calculated year differs from current year', () => {
    renderHook(() =>
      useRetirementStartYearAutoCalculation({
        planningMode: 'individual',
        birthYear: 1974,
        spouseBirthYear: undefined,
        currentRetirementStartYear: 2040,
        onRetirementStartYearChange: mockOnRetirementStartYearChange,
      }),
    )

    expect(mockOnRetirementStartYearChange).toHaveBeenCalledWith(2041)
  })

  it('updates when birth year changes', () => {
    const { rerender } = renderHook(
      ({ birthYear }) =>
        useRetirementStartYearAutoCalculation({
          planningMode: 'individual',
          birthYear,
          spouseBirthYear: undefined,
          currentRetirementStartYear: 2041,
          onRetirementStartYearChange: mockOnRetirementStartYearChange,
        }),
      {
        initialProps: { birthYear: 1974 },
      },
    )

    expect(mockOnRetirementStartYearChange).not.toHaveBeenCalled()

    rerender({ birthYear: 1975 })

    expect(mockOnRetirementStartYearChange).toHaveBeenCalledWith(2042)
  })

  it('handles couple mode with spouse birth year', () => {
    renderHook(() =>
      useRetirementStartYearAutoCalculation({
        planningMode: 'couple',
        birthYear: 1974,
        spouseBirthYear: 1976,
        currentRetirementStartYear: 2040,
        onRetirementStartYearChange: mockOnRetirementStartYearChange,
      }),
    )

    // Should calculate based on the earlier retirement year
    expect(mockOnRetirementStartYearChange).toHaveBeenCalled()
  })

  it('does not call onChange when no birth year is provided', () => {
    renderHook(() =>
      useRetirementStartYearAutoCalculation({
        planningMode: 'individual',
        birthYear: undefined,
        spouseBirthYear: undefined,
        currentRetirementStartYear: 2041,
        onRetirementStartYearChange: mockOnRetirementStartYearChange,
      }),
    )

    expect(mockOnRetirementStartYearChange).not.toHaveBeenCalled()
  })
})
