import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useChartConfig } from './useChartConfig'

describe('useChartConfig', () => {
  it('should return overview configuration for overview mode', () => {
    const { result } = renderHook(() => useChartConfig('overview', 10))

    expect(result.current.isDetailedView).toBe(false)
    expect(result.current.containerHeight).toBe('h-96')
    expect(result.current.marginBottom).toBe(20)
    expect(result.current.xAxisAngle).toBe(0)
    expect(result.current.xAxisTextAnchor).toBe('middle')
    expect(result.current.xAxisHeight).toBe(30)
    expect(result.current.endkapitalDot).toBe(false)
    expect(result.current.taxDot).toBe(false)
    expect(result.current.showBrush).toBe(false)
  })

  it('should return detailed configuration for detailed mode', () => {
    const { result } = renderHook(() => useChartConfig('detailed', 10))

    expect(result.current.isDetailedView).toBe(true)
    expect(result.current.containerHeight).toBe('h-[500px]')
    expect(result.current.marginBottom).toBe(60)
    expect(result.current.xAxisAngle).toBe(-45)
    expect(result.current.xAxisTextAnchor).toBe('end')
    expect(result.current.xAxisHeight).toBe(60)
    expect(result.current.endkapitalDot).toEqual({ fill: '#ef4444', strokeWidth: 2, r: 4 })
    expect(result.current.taxDot).toEqual({ fill: '#f59e0b', strokeWidth: 1, r: 2 })
    expect(result.current.showBrush).toBe(true)
  })

  it('should not show brush for detailed mode with 5 or fewer data points', () => {
    const { result } = renderHook(() => useChartConfig('detailed', 5))

    expect(result.current.showBrush).toBe(false)
  })

  it('should show brush for detailed mode with more than 5 data points', () => {
    const { result } = renderHook(() => useChartConfig('detailed', 6))

    expect(result.current.showBrush).toBe(true)
  })

  it('should memoize config based on chartView and dataLength', () => {
    const { result, rerender } = renderHook(
      ({ view, length }: { view: 'overview' | 'detailed', length: number }) => useChartConfig(view, length),
      { initialProps: { view: 'overview' as 'overview' | 'detailed', length: 10 } },
    )

    const firstResult = result.current
    
    // Rerender with same props should return same object reference
    rerender({ view: 'overview', length: 10 })
    expect(result.current).toBe(firstResult)
    
    // Rerender with different view should return new object
    rerender({ view: 'detailed', length: 10 })
    expect(result.current).not.toBe(firstResult)
  })
})
