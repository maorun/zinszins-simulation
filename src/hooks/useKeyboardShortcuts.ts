import { useEffect, useCallback } from 'react'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  description: string
  category: 'navigation' | 'actions' | 'help'
  action: () => void
}

export interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

/**
 * Custom hook for managing keyboard shortcuts in the application
 * 
 * @param options Configuration options including shortcuts array and enabled flag
 * @returns Object with methods to manage shortcuts
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Exception: Allow '?' to show help even in input fields if Shift is pressed
        if (!(event.key === '?' && event.shiftKey)) {
          return
        }
      }

      // Find matching shortcut
      const matchingShortcut = shortcuts.find(shortcut => {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase()
        
        // For ctrl shortcuts, accept both ctrl and meta keys for cross-platform compatibility
        const ctrlMatches = shortcut.ctrl
          ? event.ctrlKey || event.metaKey
          : true
        
        const altMatches = !!shortcut.alt === event.altKey
        const shiftMatches = !!shortcut.shift === event.shiftKey
        
        // Meta key is handled by ctrl check for cross-platform compatibility
        const metaMatches = shortcut.meta
          ? event.metaKey
          : true

        return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches
      })

      if (matchingShortcut) {
        event.preventDefault()
        matchingShortcut.action()
      }
    },
    [shortcuts],
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyPress)

    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [enabled, handleKeyPress])

  return {
    shortcuts,
  }
}

/**
 * Maps special keys to their display names
 */
const SPECIAL_KEY_MAP: Record<string, string> = {
  ' ': 'Leertaste',
  'Enter': 'Enter',
  'Escape': 'Esc',
  'ArrowUp': '↑',
  'ArrowDown': '↓',
  'ArrowLeft': '←',
  'ArrowRight': '→',
}

/**
 * Format the main key for display
 * 
 * @param key The key to format
 * @returns Formatted key string
 */
function formatMainKey(key: string): string {
  return SPECIAL_KEY_MAP[key] || key.toUpperCase()
}

/**
 * Format shortcut key combination for display
 * 
 * @param shortcut Keyboard shortcut configuration
 * @returns Formatted string representation of the shortcut
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const keys: string[] = []

  if (shortcut.ctrl) keys.push('Strg')
  if (shortcut.alt) keys.push('Alt')
  if (shortcut.shift) keys.push('Shift')
  if (shortcut.meta) keys.push('Cmd')

  keys.push(formatMainKey(shortcut.key))

  return keys.join(' + ')
}
