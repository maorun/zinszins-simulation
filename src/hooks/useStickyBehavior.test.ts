import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStickyBehavior } from './useStickyBehavior'

describe('useStickyBehavior', () => {
  let scrollListeners: any[] = []

  beforeEach(() => {
    scrollListeners = []
    vi.spyOn(window, 'addEventListener').mockImplementation((event, listener) => {
      if (event === 'scroll' && typeof listener === 'function') {
        scrollListeners.push(listener)
      }
    })
    vi.spyOn(window, 'removeEventListener')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns false initially when element is not scrolled past', () => {
    const mockElement = document.createElement('div')
    vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 100,
      top: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    const ref = { current: mockElement }
    const { result } = renderHook(() => useStickyBehavior(ref))

    expect(result.current).toBe(false)
  })

  it('returns true when element is scrolled past (bottom < 0)', () => {
    const mockElement = document.createElement('div')
    vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
      bottom: -10,
      top: -100,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    const ref = { current: mockElement }
    const { result } = renderHook(() => useStickyBehavior(ref))

    expect(result.current).toBe(true)
  })

  it('updates sticky state when scroll event occurs', () => {
    const mockElement = document.createElement('div')
    const getBoundingClientRectSpy = vi.spyOn(mockElement, 'getBoundingClientRect')

    // Initially not scrolled past
    getBoundingClientRectSpy.mockReturnValue({
      bottom: 100,
      top: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    const ref = { current: mockElement }
    const { result, rerender } = renderHook(() => useStickyBehavior(ref))
    expect(result.current).toBe(false)

    // Simulate scrolling past the element
    getBoundingClientRectSpy.mockReturnValue({
      bottom: -50,
      top: -150,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })
    scrollListeners.forEach(listener => listener(new Event('scroll')))
    rerender()

    expect(result.current).toBe(true)
  })

  it('handles null ref gracefully', () => {
    const ref = { current: null }
    const { result } = renderHook(() => useStickyBehavior(ref))

    expect(result.current).toBe(false)

    // Trigger scroll event - should not crash
    scrollListeners.forEach(listener => listener(new Event('scroll')))
  })

  it('cleans up event listener on unmount', () => {
    const mockElement = document.createElement('div')
    vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 100,
      top: 0,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    const ref = { current: mockElement }
    const { unmount } = renderHook(() => useStickyBehavior(ref))

    unmount()
    expect(window.removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function))
  })

  it('handles edge case at exactly bottom = 0', () => {
    const mockElement = document.createElement('div')
    vi.spyOn(mockElement, 'getBoundingClientRect').mockReturnValue({
      bottom: 0,
      top: -100,
      left: 0,
      right: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    const ref = { current: mockElement }
    const { result } = renderHook(() => useStickyBehavior(ref))

    // At exactly 0, should not be sticky
    expect(result.current).toBe(false)
  })
})
