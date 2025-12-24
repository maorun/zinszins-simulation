import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useHomePageKeyboardShortcuts } from './useHomePageKeyboardShortcuts'

describe('useHomePageKeyboardShortcuts', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = vi.fn()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should initialize with help dialog closed', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    expect(result.current.showHelp).toBe(false)
  })

  it('should provide an array of shortcuts', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    expect(result.current.shortcuts).toBeInstanceOf(Array)
    expect(result.current.shortcuts.length).toBeGreaterThan(0)
  })

  it('should include navigation shortcuts', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    const navigationShortcuts = result.current.shortcuts.filter(s => s.category === 'navigation')
    expect(navigationShortcuts.length).toBeGreaterThan(0)
  })

  it('should include help shortcuts', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    const helpShortcuts = result.current.shortcuts.filter(s => s.category === 'help')
    expect(helpShortcuts.length).toBeGreaterThan(0)
  })

  it('should have shortcuts for all three tabs', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    const sparenShortcut = result.current.shortcuts.find(
      s => s.description.includes('Sparen') && s.category === 'navigation',
    )
    const entnahmeShortcut = result.current.shortcuts.find(
      s => s.description.includes('Entnahme') && s.category === 'navigation',
    )
    const sonstigesShortcut = result.current.shortcuts.find(
      s => s.description.includes('Sonstiges') && s.category === 'navigation',
    )

    expect(sparenShortcut).toBeDefined()
    expect(entnahmeShortcut).toBeDefined()
    expect(sonstigesShortcut).toBeDefined()
  })

  it('should open help dialog when triggered', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    const helpShortcut = result.current.shortcuts.find(s => s.category === 'help')
    expect(helpShortcut).toBeDefined()

    act(() => {
      helpShortcut!.action()
    })

    expect(result.current.showHelp).toBe(true)
  })

  it('should close help dialog with closeHelp function', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    const helpShortcut = result.current.shortcuts.find(s => s.category === 'help')

    // Open help
    act(() => {
      helpShortcut!.action()
    })
    expect(result.current.showHelp).toBe(true)

    // Close help
    act(() => {
      result.current.closeHelp()
    })
    expect(result.current.showHelp).toBe(false)
  })

  it('should have scroll to top shortcut', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    const scrollTopShortcut = result.current.shortcuts.find(
      s => s.description.includes('Seitenanfang') && s.category === 'navigation',
    )

    expect(scrollTopShortcut).toBeDefined()
    expect(scrollTopShortcut?.key).toBe('t')
    expect(scrollTopShortcut?.alt).toBe(true)
  })

  it('should call window.scrollTo when scroll to top is triggered', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    const scrollTopShortcut = result.current.shortcuts.find(s => s.description.includes('Seitenanfang'))

    act(() => {
      scrollTopShortcut!.action()
    })

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('should have scroll to overview shortcut', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    const scrollOverviewShortcut = result.current.shortcuts.find(
      s => s.description.includes('Übersicht') && s.category === 'navigation',
    )

    expect(scrollOverviewShortcut).toBeDefined()
    expect(scrollOverviewShortcut?.key).toBe('o')
    expect(scrollOverviewShortcut?.alt).toBe(true)
  })

  it('should attempt to scroll to overview when triggered', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    // Create a mock overview element
    const mockOverviewElement = document.createElement('div')
    mockOverviewElement.setAttribute('data-section', 'overview')
    mockOverviewElement.scrollIntoView = vi.fn()
    document.body.appendChild(mockOverviewElement)

    const scrollOverviewShortcut = result.current.shortcuts.find(s => s.description.includes('Übersicht'))

    act(() => {
      scrollOverviewShortcut!.action()
    })

    expect(mockOverviewElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      block: 'start',
    })

    document.body.removeChild(mockOverviewElement)
  })

  it('should have correct Alt+1, Alt+2, Alt+3 key combinations for tabs', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    const sparenShortcut = result.current.shortcuts.find(s => s.description.includes('Sparen'))
    const entnahmeShortcut = result.current.shortcuts.find(s => s.description.includes('Entnahme'))
    const sonstigesShortcut = result.current.shortcuts.find(s => s.description.includes('Sonstiges'))

    expect(sparenShortcut?.key).toBe('1')
    expect(sparenShortcut?.alt).toBe(true)

    expect(entnahmeShortcut?.key).toBe('2')
    expect(entnahmeShortcut?.alt).toBe(true)

    expect(sonstigesShortcut?.key).toBe('3')
    expect(sonstigesShortcut?.alt).toBe(true)
  })

  it('should attempt to switch tabs when tab shortcut is triggered', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    // Create mock tab triggers
    const mockSparenTab = document.createElement('button')
    mockSparenTab.setAttribute('value', 'sparen')
    mockSparenTab.click = vi.fn()
    document.body.appendChild(mockSparenTab)

    const sparenShortcut = result.current.shortcuts.find(s => s.description.includes('Sparen'))

    act(() => {
      sparenShortcut!.action()
    })

    expect(mockSparenTab.click).toHaveBeenCalled()

    document.body.removeChild(mockSparenTab)
  })

  it('should have Shift+? as help shortcut', () => {
    const { result } = renderHook(() => useHomePageKeyboardShortcuts())

    const helpShortcut = result.current.shortcuts.find(s => s.category === 'help')

    expect(helpShortcut?.key).toBe('?')
    expect(helpShortcut?.shift).toBe(true)
  })
})
