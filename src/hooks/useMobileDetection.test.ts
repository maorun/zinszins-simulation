import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMobileDetection } from './useMobileDetection'
import type { ResizeListener } from '../test-utils/types'

describe('useMobileDetection', () => {
  let resizeListeners: ResizeListener[] = []

  beforeEach(() => {
    resizeListeners = []
    vi.spyOn(window, 'addEventListener').mockImplementation((event, listener) => {
      if (event === 'resize' && typeof listener === 'function') {
        resizeListeners.push(listener as ResizeListener)
      }
    })
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns true when window width is less than 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })

    const { result } = renderHook(() => useMobileDetection())
    expect(result.current).toBe(true)
  })

  it('returns false when window width is 768px or more', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result } = renderHook(() => useMobileDetection())
    expect(result.current).toBe(false)
  })

  it('updates when window is resized', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    const { result, rerender } = renderHook(() => useMobileDetection())
    expect(result.current).toBe(false)

    // Simulate resize to mobile
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500,
    })
    resizeListeners.forEach(listener => listener(new UIEvent('resize')))
    rerender()

    expect(result.current).toBe(true)
  })

  it('cleans up event listener on unmount', () => {
    const { unmount } = renderHook(() => useMobileDetection())
    unmount()
    expect(window.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function))
  })

  it('handles edge case at exactly 768px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    })

    const { result } = renderHook(() => useMobileDetection())
    expect(result.current).toBe(false)
  })

  it('handles edge case at 767px', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    })

    const { result } = renderHook(() => useMobileDetection())
    expect(result.current).toBe(true)
  })
})
