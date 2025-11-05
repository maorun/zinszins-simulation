import { describe, test, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSegmentRandomReturnHandlers } from '../useSegmentRandomReturnHandlers'
import type { RandomReturnConfig } from '../../../utils/random-returns'

describe('useSegmentRandomReturnHandlers', () => {
  test('should return default values when randomConfig is undefined', () => {
    const onRandomConfigChange = vi.fn()
    const { result } = renderHook(() =>
      useSegmentRandomReturnHandlers({
        randomConfig: undefined,
        onRandomConfigChange,
      }),
    )

    expect(result.current.averageReturn).toBe(0.05)
    expect(result.current.standardDeviation).toBe(0.12)
    expect(result.current.seed).toBeUndefined()
  })

  test('should return values from randomConfig when provided', () => {
    const onRandomConfigChange = vi.fn()
    const randomConfig: RandomReturnConfig = {
      averageReturn: 0.07,
      standardDeviation: 0.15,
      seed: 42,
    }

    const { result } = renderHook(() =>
      useSegmentRandomReturnHandlers({
        randomConfig,
        onRandomConfigChange,
      }),
    )

    expect(result.current.averageReturn).toBe(0.07)
    expect(result.current.standardDeviation).toBe(0.15)
    expect(result.current.seed).toBe(42)
  })

  test('should call onRandomConfigChange when handleAverageReturnChange is invoked', () => {
    const onRandomConfigChange = vi.fn()
    const randomConfig: RandomReturnConfig = {
      averageReturn: 0.05,
      standardDeviation: 0.12,
      seed: 42,
    }

    const { result } = renderHook(() =>
      useSegmentRandomReturnHandlers({
        randomConfig,
        onRandomConfigChange,
      }),
    )

    act(() => {
      result.current.handleAverageReturnChange(0.08)
    })

    expect(onRandomConfigChange).toHaveBeenCalledWith({
      averageReturn: 0.08,
      standardDeviation: 0.12,
      seed: 42,
    })
  })

  test('should call onRandomConfigChange when handleStdDevChange is invoked', () => {
    const onRandomConfigChange = vi.fn()
    const randomConfig: RandomReturnConfig = {
      averageReturn: 0.05,
      standardDeviation: 0.12,
      seed: 42,
    }

    const { result } = renderHook(() =>
      useSegmentRandomReturnHandlers({
        randomConfig,
        onRandomConfigChange,
      }),
    )

    act(() => {
      result.current.handleStdDevChange(0.18)
    })

    expect(onRandomConfigChange).toHaveBeenCalledWith({
      averageReturn: 0.05,
      standardDeviation: 0.18,
      seed: 42,
    })
  })

  test('should call onRandomConfigChange when handleSeedChange is invoked', () => {
    const onRandomConfigChange = vi.fn()
    const randomConfig: RandomReturnConfig = {
      averageReturn: 0.05,
      standardDeviation: 0.12,
      seed: 42,
    }

    const { result } = renderHook(() =>
      useSegmentRandomReturnHandlers({
        randomConfig,
        onRandomConfigChange,
      }),
    )

    act(() => {
      result.current.handleSeedChange(99)
    })

    expect(onRandomConfigChange).toHaveBeenCalledWith({
      averageReturn: 0.05,
      standardDeviation: 0.12,
      seed: 99,
    })
  })

  test('should handle undefined seed value', () => {
    const onRandomConfigChange = vi.fn()
    const randomConfig: RandomReturnConfig = {
      averageReturn: 0.05,
      standardDeviation: 0.12,
      seed: 42,
    }

    const { result } = renderHook(() =>
      useSegmentRandomReturnHandlers({
        randomConfig,
        onRandomConfigChange,
      }),
    )

    act(() => {
      result.current.handleSeedChange(undefined)
    })

    expect(onRandomConfigChange).toHaveBeenCalledWith({
      averageReturn: 0.05,
      standardDeviation: 0.12,
      seed: undefined,
    })
  })

  test('should handle standardDeviation value of 0', () => {
    const onRandomConfigChange = vi.fn()
    const randomConfig: RandomReturnConfig = {
      averageReturn: 0.05,
      standardDeviation: 0,
      seed: undefined,
    }

    const { result } = renderHook(() =>
      useSegmentRandomReturnHandlers({
        randomConfig,
        onRandomConfigChange,
      }),
    )

    expect(result.current.standardDeviation).toBe(0)
  })
})
