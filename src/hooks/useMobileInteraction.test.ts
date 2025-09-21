import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useMobileInteraction } from './useMobileInteraction'

describe('useMobileInteraction', () => {
  const originalInnerWidth = window.innerWidth
  const originalMaxTouchPoints = navigator.maxTouchPoints

  beforeEach(() => {
    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    })

    // Mock navigator.maxTouchPoints
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 0,
    })
  })

  afterEach(() => {
    // Restore original values
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: originalInnerWidth,
    })

    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: originalMaxTouchPoints,
    })
  })

  it('should detect desktop as non-mobile', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useMobileInteraction())

    expect(result.current.isMobile).toBe(false)
  })

  it('should detect mobile device when width < 768px', () => {
    window.innerWidth = 600
    const { result } = renderHook(() => useMobileInteraction())

    expect(result.current.isMobile).toBe(true)
  })

  it('should detect touch capability', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      configurable: true,
      value: 5,
    })

    const { result } = renderHook(() => useMobileInteraction())
    expect(result.current.isTouch).toBe(true)
  })

  it('should update mobile state on window resize', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useMobileInteraction())

    expect(result.current.isMobile).toBe(false)

    act(() => {
      window.innerWidth = 600
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current.isMobile).toBe(true)
  })

  it('should return correct mobile interaction classes', () => {
    window.innerWidth = 600
    const { result } = renderHook(() => useMobileInteraction())

    const classes = result.current.getMobileInteractionClasses('base-class')
    expect(classes).toBe('base-class mobile-interactive')
  })

  it('should return correct touch target classes for mobile', () => {
    window.innerWidth = 600
    const { result } = renderHook(() => useMobileInteraction())

    const classes = result.current.getTouchTargetClasses('button-class')
    expect(classes).toBe('button-class mobile-tap-target')
  })

  it('should not add mobile classes for desktop', () => {
    window.innerWidth = 1024
    const { result } = renderHook(() => useMobileInteraction())

    const interactionClasses = result.current.getMobileInteractionClasses('base-class')
    const touchClasses = result.current.getTouchTargetClasses('button-class')

    expect(interactionClasses).toBe('base-class')
    expect(touchClasses).toBe('button-class')
  })
})
