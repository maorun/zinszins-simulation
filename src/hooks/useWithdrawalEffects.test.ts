import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useWithdrawalEffects } from './useWithdrawalEffects'
import { createDefaultWithdrawalSegment } from '../utils/segmented-withdrawal'
import type { WithdrawalResult } from '../../helpers/withdrawal'

interface WithdrawalData {
  startingCapital: number
  withdrawalArray: Array<{
    year: number
    [key: string]: unknown
  }>
  withdrawalResult: WithdrawalResult
  duration: number | 'unbegrenzt'
}

describe('useWithdrawalEffects', () => {
  const createMockWithdrawalData = (): WithdrawalData => ({
    startingCapital: 500000,
    withdrawalArray: [],
    withdrawalResult: {
      endalter: 85,
      todInJahr: 2050,
      endkapital: 100000,
      gesamtEntnahme: 50000,
      endOfLifeExceeded: false,
      portfolioDuration: 25,
    } as WithdrawalResult,
    duration: 25,
  })

  it('should call onWithdrawalResultsChange when withdrawal data changes', () => {
    const mockCallback = vi.fn()
    const mockWithdrawalData = createMockWithdrawalData()

    renderHook(() =>
      useWithdrawalEffects({
        onWithdrawalResultsChange: mockCallback,
        withdrawalData: mockWithdrawalData,
        useSegmentedWithdrawal: false,
        withdrawalSegments: [],
        startOfIndependence: 2040,
        updateConfig: vi.fn(),
      }),
    )

    expect(mockCallback).toHaveBeenCalledWith(mockWithdrawalData.withdrawalResult)
  })

  it('should not call onWithdrawalResultsChange when callback is undefined', () => {
    const mockWithdrawalData = createMockWithdrawalData()

    // Should not throw
    renderHook(() =>
      useWithdrawalEffects({
        onWithdrawalResultsChange: undefined,
        withdrawalData: mockWithdrawalData,
        useSegmentedWithdrawal: false,
        withdrawalSegments: [],
        startOfIndependence: 2040,
        updateConfig: vi.fn(),
      }),
    )
  })

  it('should not call onWithdrawalResultsChange when withdrawal data is null', () => {
    const mockCallback = vi.fn()

    renderHook(() =>
      useWithdrawalEffects({
        onWithdrawalResultsChange: mockCallback,
        withdrawalData: null,
        useSegmentedWithdrawal: false,
        withdrawalSegments: [],
        startOfIndependence: 2040,
        updateConfig: vi.fn(),
      }),
    )

    expect(mockCallback).not.toHaveBeenCalled()
  })

  it('should update withdrawal segments when startOfIndependence changes', () => {
    const mockUpdateConfig = vi.fn()
    // Create segment that starts at 2041 (which is 2040 + 1, so it's already correct)
    const mockSegments = [
      createDefaultWithdrawalSegment('segment1', 'Segment 1', 2041, 2050),
    ]

    const { rerender } = renderHook(
      ({ startYear }) =>
        useWithdrawalEffects({
          onWithdrawalResultsChange: undefined,
          withdrawalData: null,
          useSegmentedWithdrawal: true,
          withdrawalSegments: mockSegments,
          startOfIndependence: startYear,
          updateConfig: mockUpdateConfig,
        }),
      { initialProps: { startYear: 2040 } },
    )

    // Initial render should not trigger update (segment already starts at 2041 = 2040 + 1)
    expect(mockUpdateConfig).not.toHaveBeenCalled()

    // Change startOfIndependence
    rerender({ startYear: 2045 })

    // Should update first segment to new start year + 1
    expect(mockUpdateConfig).toHaveBeenCalledWith({
      withdrawalSegments: [
        {
          ...mockSegments[0],
          startYear: 2046, // 2045 + 1
        },
      ],
    })
  })

  it('should not update segments when segmented withdrawal is disabled', () => {
    const mockUpdateConfig = vi.fn()
    const mockSegments = [
      createDefaultWithdrawalSegment('segment1', 'Segment 1', 2040, 2050),
    ]

    const { rerender } = renderHook(
      ({ startYear }) =>
        useWithdrawalEffects({
          onWithdrawalResultsChange: undefined,
          withdrawalData: null,
          useSegmentedWithdrawal: false,
          withdrawalSegments: mockSegments,
          startOfIndependence: startYear,
          updateConfig: mockUpdateConfig,
        }),
      { initialProps: { startYear: 2040 } },
    )

    // Change startOfIndependence
    rerender({ startYear: 2045 })

    // Should not update segments when not using segmented withdrawal
    expect(mockUpdateConfig).not.toHaveBeenCalled()
  })

  it('should not update segments when segments array is empty', () => {
    const mockUpdateConfig = vi.fn()

    const { rerender } = renderHook(
      ({ startYear }) =>
        useWithdrawalEffects({
          onWithdrawalResultsChange: undefined,
          withdrawalData: null,
          useSegmentedWithdrawal: true,
          withdrawalSegments: [],
          startOfIndependence: startYear,
          updateConfig: mockUpdateConfig,
        }),
      { initialProps: { startYear: 2040 } },
    )

    // Change startOfIndependence
    rerender({ startYear: 2045 })

    // Should not update when segments array is empty
    expect(mockUpdateConfig).not.toHaveBeenCalled()
  })

  it('should only update first segment, not subsequent segments', () => {
    const mockUpdateConfig = vi.fn()
    const mockSegments = [
      createDefaultWithdrawalSegment('segment1', 'Segment 1', 2041, 2050),
      createDefaultWithdrawalSegment('segment2', 'Segment 2', 2051, 2060),
    ]

    const { rerender } = renderHook(
      ({ startYear }) =>
        useWithdrawalEffects({
          onWithdrawalResultsChange: undefined,
          withdrawalData: null,
          useSegmentedWithdrawal: true,
          withdrawalSegments: mockSegments,
          startOfIndependence: startYear,
          updateConfig: mockUpdateConfig,
        }),
      { initialProps: { startYear: 2040 } },
    )

    // Change startOfIndependence
    rerender({ startYear: 2045 })

    // Only first segment should be updated
    expect(mockUpdateConfig).toHaveBeenCalledWith({
      withdrawalSegments: [
        {
          ...mockSegments[0],
          startYear: 2046, // Updated
        },
        mockSegments[1], // Not updated
      ],
    })
  })

  it('should not trigger update if start year has not changed', () => {
    const mockUpdateConfig = vi.fn()
    const mockSegments = [
      createDefaultWithdrawalSegment('segment1', 'Segment 1', 2041, 2050),
    ]

    renderHook(() =>
      useWithdrawalEffects({
        onWithdrawalResultsChange: undefined,
        withdrawalData: null,
        useSegmentedWithdrawal: true,
        withdrawalSegments: mockSegments,
        startOfIndependence: 2040, // First segment should already be 2041
        updateConfig: mockUpdateConfig,
      }),
    )

    // Should not update if start year is already correct
    expect(mockUpdateConfig).not.toHaveBeenCalled()
  })
})
