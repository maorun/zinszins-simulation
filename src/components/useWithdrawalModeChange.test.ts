import { renderHook } from '@testing-library/react'
import { describe, test, expect, vi } from 'vitest'
import { useWithdrawalModeChange } from './useWithdrawalModeChange'
import type { WithdrawalSegment } from '../utils/segmented-withdrawal'

describe('useWithdrawalModeChange', () => {
  test('returns a function', () => {
    const withdrawalSegments: WithdrawalSegment[] = []
    const onConfigUpdate = vi.fn()

    const { result } = renderHook(() =>
      useWithdrawalModeChange({
        withdrawalSegments,
        startOfIndependence: 2023,
        globalEndOfLife: 2050,
        onConfigUpdate,
      }),
    )

    expect(typeof result.current).toBe('function')
  })

  test('returns the same function reference when dependencies do not change', () => {
    const withdrawalSegments: WithdrawalSegment[] = []
    const onConfigUpdate = vi.fn()

    const { result, rerender } = renderHook(() =>
      useWithdrawalModeChange({
        withdrawalSegments,
        startOfIndependence: 2023,
        globalEndOfLife: 2050,
        onConfigUpdate,
      }),
    )

    const firstFunction = result.current
    rerender()
    const secondFunction = result.current

    expect(firstFunction).toBe(secondFunction)
  })

  test('returns a new function reference when start year changes', () => {
    const withdrawalSegments: WithdrawalSegment[] = []
    const onConfigUpdate = vi.fn()

    const { result, rerender } = renderHook(
      ({ year }) =>
        useWithdrawalModeChange({
          withdrawalSegments,
          startOfIndependence: year,
          globalEndOfLife: 2050,
          onConfigUpdate,
        }),
      { initialProps: { year: 2023 } },
    )

    const firstFunction = result.current

    // Change dependency
    rerender({ year: 2024 })
    const secondFunction = result.current

    expect(firstFunction).not.toBe(secondFunction)
  })
})
