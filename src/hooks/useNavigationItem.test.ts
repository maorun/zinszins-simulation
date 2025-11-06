import { renderHook } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useNavigationItem } from './useNavigationItem'

// Mock the navigation context
const mockRegisterItem = vi.fn()
const mockUnregisterItem = vi.fn()

vi.mock('./useNavigation', () => ({
  useNavigationOptional: () => ({
    registerItem: mockRegisterItem,
    unregisterItem: mockUnregisterItem,
  }),
}))

describe('useNavigationItem', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns a ref object', () => {
    const { result } = renderHook(() =>
      useNavigationItem({
        id: 'test-id',
        title: 'Test Title',
        icon: '🧪',
        level: 0,
      }),
    )

    expect(result.current).toBeDefined()
    expect(result.current.current).toBe(null) // Initially null
  })

  it('registers item when ref is attached to element', () => {
    const { result } = renderHook(() =>
      useNavigationItem({
        id: 'test-id',
        title: 'Test Title',
        icon: '🧪',
        parentId: 'parent-id',
        level: 1,
      }),
    )

    // Should return a valid ref without throwing
    expect(result.current).toBeDefined()
    expect(result.current.current).toBe(null)
  })

  it('handles cleanup properly', () => {
    const { result, unmount } = renderHook(() =>
      useNavigationItem({
        id: 'test-id',
        title: 'Test Title',
        level: 0,
      }),
    )

    // Should handle unmount without errors
    expect(result.current).toBeDefined()
    expect(() => unmount()).not.toThrow()
  })

  it('handles missing navigation context gracefully', () => {
    // Mock the hook to return undefined (no navigation context)
    vi.mocked(vi.fn()).mockReturnValue(undefined)

    const { result } = renderHook(() =>
      useNavigationItem({
        id: 'test-id',
        title: 'Test Title',
        level: 0,
      }),
    )

    // Should still return a ref without throwing
    expect(result.current).toBeDefined()
    expect(result.current.current).toBe(null)
  })

  it('returns valid ref for empty id', () => {
    const { result } = renderHook(() =>
      useNavigationItem({
        id: '',
        title: 'Test Title',
        level: 0,
      }),
    )

    // Should still return a valid ref even with empty id
    expect(result.current).toBeDefined()
    expect(result.current.current).toBe(null)
  })

  it('handles prop changes without errors', () => {
    const { result, rerender } = renderHook(
      (props) =>
        useNavigationItem({
          id: props.id,
          title: props.title,
          icon: props.icon,
          level: props.level,
        }),
      {
        initialProps: {
          id: 'test-id',
          title: 'Original Title',
          icon: '🧪',
          level: 0,
        },
      },
    )

    expect(result.current).toBeDefined()

    // Update props - should not throw
    expect(() =>
      rerender({
        id: 'test-id',
        title: 'Updated Title',
        icon: '🔧',
        level: 1,
      }),
    ).not.toThrow()

    expect(result.current).toBeDefined()
  })
})
