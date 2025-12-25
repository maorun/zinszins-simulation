import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useKeyboardShortcuts, formatShortcut, type KeyboardShortcut } from './useKeyboardShortcuts'

describe('useKeyboardShortcuts', () => {
  let actionMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    actionMock = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should register keyboard shortcuts', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: '1',
        alt: true,
        description: 'Navigate to tab 1',
        category: 'navigation',
        action: actionMock,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    // Simulate Alt+1 keypress
    const event = new KeyboardEvent('keydown', {
      key: '1',
      altKey: true,
      bubbles: true,
    })
    window.dispatchEvent(event)

    expect(actionMock).toHaveBeenCalledTimes(1)
  })

  it('should handle multiple shortcuts', () => {
    const action1 = vi.fn()
    const action2 = vi.fn()

    const shortcuts: KeyboardShortcut[] = [
      {
        key: '1',
        alt: true,
        description: 'Action 1',
        category: 'navigation',
        action: action1,
      },
      {
        key: '2',
        alt: true,
        description: 'Action 2',
        category: 'navigation',
        action: action2,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    // Trigger first shortcut
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', altKey: true, bubbles: true }))
    expect(action1).toHaveBeenCalledTimes(1)
    expect(action2).not.toHaveBeenCalled()

    // Trigger second shortcut
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '2', altKey: true, bubbles: true }))
    expect(action1).toHaveBeenCalledTimes(1)
    expect(action2).toHaveBeenCalledTimes(1)
  })

  it('should respect ctrl modifier', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'actions',
        action: actionMock,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    // Without ctrl should not trigger
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', bubbles: true }))
    expect(actionMock).not.toHaveBeenCalled()

    // With ctrl should trigger
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }))
    expect(actionMock).toHaveBeenCalledTimes(1)
  })

  it('should respect shift modifier', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: '?',
        shift: true,
        description: 'Show help',
        category: 'help',
        action: actionMock,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    // With shift should trigger
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: '?', shiftKey: true, bubbles: true }),
    )
    expect(actionMock).toHaveBeenCalledTimes(1)
  })

  it('should be case-insensitive for key matching', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 'A',
        alt: true,
        description: 'Action A',
        category: 'actions',
        action: actionMock,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    // Lowercase 'a' should match uppercase 'A'
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', altKey: true, bubbles: true }))
    expect(actionMock).toHaveBeenCalledTimes(1)
  })

  it('should not trigger shortcuts in input fields', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: '1',
        alt: true,
        description: 'Action',
        category: 'navigation',
        action: actionMock,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    // Create an input element and dispatch event from it
    const input = document.createElement('input')
    document.body.appendChild(input)

    const event = new KeyboardEvent('keydown', {
      key: '1',
      altKey: true,
      bubbles: true,
    })
    Object.defineProperty(event, 'target', { value: input, enumerable: true })
    window.dispatchEvent(event)

    expect(actionMock).not.toHaveBeenCalled()

    document.body.removeChild(input)
  })

  it('should not trigger shortcuts in textarea fields', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: '1',
        alt: true,
        description: 'Action',
        category: 'navigation',
        action: actionMock,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)

    const event = new KeyboardEvent('keydown', {
      key: '1',
      altKey: true,
      bubbles: true,
    })
    Object.defineProperty(event, 'target', { value: textarea, enumerable: true })
    window.dispatchEvent(event)

    expect(actionMock).not.toHaveBeenCalled()

    document.body.removeChild(textarea)
  })

  it('should allow help shortcut even in input fields', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: '?',
        shift: true,
        description: 'Show help',
        category: 'help',
        action: actionMock,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    const input = document.createElement('input')
    document.body.appendChild(input)

    const event = new KeyboardEvent('keydown', {
      key: '?',
      shiftKey: true,
      bubbles: true,
    })
    Object.defineProperty(event, 'target', { value: input, enumerable: true })
    window.dispatchEvent(event)

    expect(actionMock).toHaveBeenCalledTimes(1)

    document.body.removeChild(input)
  })

  it('should respect enabled flag', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: '1',
        alt: true,
        description: 'Action',
        category: 'navigation',
        action: actionMock,
      },
    ]

    const { rerender } = renderHook(
      ({ enabled }) => useKeyboardShortcuts({ shortcuts, enabled }),
      {
        initialProps: { enabled: false },
      },
    )

    // Should not trigger when disabled
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', altKey: true, bubbles: true }))
    expect(actionMock).not.toHaveBeenCalled()

    // Enable and rerender
    rerender({ enabled: true })
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', altKey: true, bubbles: true }))
    expect(actionMock).toHaveBeenCalledTimes(1)
  })

  it('should cleanup event listeners on unmount', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: '1',
        alt: true,
        description: 'Action',
        category: 'navigation',
        action: actionMock,
      },
    ]

    const { unmount } = renderHook(() => useKeyboardShortcuts({ shortcuts }))

    // Trigger before unmount
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', altKey: true, bubbles: true }))
    expect(actionMock).toHaveBeenCalledTimes(1)

    unmount()

    // Should not trigger after unmount
    window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', altKey: true, bubbles: true }))
    expect(actionMock).toHaveBeenCalledTimes(1) // Still 1, not 2
  })

  it('should handle meta key (Cmd on Mac)', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        meta: true,
        description: 'Save',
        category: 'actions',
        action: actionMock,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }))
    expect(actionMock).toHaveBeenCalledTimes(1)
  })

  it('should treat ctrl and meta as equivalent for ctrl shortcuts', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'actions',
        action: actionMock,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    // Both ctrl and meta should trigger ctrl shortcuts
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true }))
    expect(actionMock).toHaveBeenCalledTimes(1)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's', metaKey: true, bubbles: true }))
    expect(actionMock).toHaveBeenCalledTimes(2)
  })

  it('should prevent default behavior when shortcut is triggered', () => {
    const shortcuts: KeyboardShortcut[] = [
      {
        key: 's',
        ctrl: true,
        description: 'Save',
        category: 'actions',
        action: actionMock,
      },
    ]

    renderHook(() => useKeyboardShortcuts({ shortcuts }))

    const event = new KeyboardEvent('keydown', { key: 's', ctrlKey: true, bubbles: true })
    const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

    window.dispatchEvent(event)

    expect(preventDefaultSpy).toHaveBeenCalled()
    expect(actionMock).toHaveBeenCalledTimes(1)
  })
})

describe('formatShortcut', () => {
  it('should format simple key', () => {
    const shortcut: KeyboardShortcut = {
      key: 'a',
      description: 'Action',
      category: 'actions',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('A')
  })

  it('should format Alt+Key combination', () => {
    const shortcut: KeyboardShortcut = {
      key: '1',
      alt: true,
      description: 'Navigate',
      category: 'navigation',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('Alt + 1')
  })

  it('should format Ctrl+Key combination', () => {
    const shortcut: KeyboardShortcut = {
      key: 's',
      ctrl: true,
      description: 'Save',
      category: 'actions',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('Strg + S')
  })

  it('should format Shift+Key combination', () => {
    const shortcut: KeyboardShortcut = {
      key: '?',
      shift: true,
      description: 'Help',
      category: 'help',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('Shift + ?')
  })

  it('should format complex combinations', () => {
    const shortcut: KeyboardShortcut = {
      key: 'z',
      ctrl: true,
      shift: true,
      description: 'Redo',
      category: 'actions',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('Strg + Shift + Z')
  })

  it('should format special keys', () => {
    expect(
      formatShortcut({
        key: ' ',
        description: 'Space',
        category: 'actions',
        action: () => {},
      }),
    ).toBe('Leertaste')

    expect(
      formatShortcut({
        key: 'Enter',
        description: 'Enter',
        category: 'actions',
        action: () => {},
      }),
    ).toBe('Enter')

    expect(
      formatShortcut({
        key: 'Escape',
        description: 'Escape',
        category: 'actions',
        action: () => {},
      }),
    ).toBe('Esc')
  })

  it('should format arrow keys', () => {
    expect(
      formatShortcut({
        key: 'ArrowUp',
        description: 'Up',
        category: 'navigation',
        action: () => {},
      }),
    ).toBe('↑')

    expect(
      formatShortcut({
        key: 'ArrowDown',
        description: 'Down',
        category: 'navigation',
        action: () => {},
      }),
    ).toBe('↓')

    expect(
      formatShortcut({
        key: 'ArrowLeft',
        description: 'Left',
        category: 'navigation',
        action: () => {},
      }),
    ).toBe('←')

    expect(
      formatShortcut({
        key: 'ArrowRight',
        description: 'Right',
        category: 'navigation',
        action: () => {},
      }),
    ).toBe('→')
  })

  it('should format Cmd+Key combination', () => {
    const shortcut: KeyboardShortcut = {
      key: 's',
      meta: true,
      description: 'Save',
      category: 'actions',
      action: () => {},
    }

    expect(formatShortcut(shortcut)).toBe('Cmd + S')
  })
})
