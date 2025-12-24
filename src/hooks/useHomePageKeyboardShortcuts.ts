import { useState, useCallback, useMemo } from 'react'
import { useKeyboardShortcuts, type KeyboardShortcut } from './useKeyboardShortcuts'

/**
 * Create navigation shortcuts
 */
function createNavigationShortcuts(
  switchTab: (tab: string) => void,
  scrollToTop: () => void,
  scrollToOverview: () => void,
): KeyboardShortcut[] {
  return [
    {
      key: '1',
      alt: true,
      description: 'Wechseln zur "Sparen" Ansicht',
      category: 'navigation',
      action: () => switchTab('sparen'),
    },
    {
      key: '2',
      alt: true,
      description: 'Wechseln zur "Entnahme" Ansicht',
      category: 'navigation',
      action: () => switchTab('entnahme'),
    },
    {
      key: '3',
      alt: true,
      description: 'Wechseln zur "Sonstiges" Ansicht',
      category: 'navigation',
      action: () => switchTab('sonstiges'),
    },
    {
      key: 't',
      alt: true,
      description: 'Zum Seitenanfang scrollen',
      category: 'navigation',
      action: scrollToTop,
    },
    {
      key: 'o',
      alt: true,
      description: 'Zur Übersicht scrollen',
      category: 'navigation',
      action: scrollToOverview,
    },
  ]
}

/**
 * Create help shortcuts
 */
function createHelpShortcuts(openHelp: () => void): KeyboardShortcut[] {
  return [
    {
      key: '?',
      shift: true,
      description: 'Tastaturkürzel anzeigen',
      category: 'help',
      action: openHelp,
    },
  ]
}

/**
 * Custom hook to manage keyboard shortcuts for the home page
 * Provides shortcuts for navigation, actions, and help
 */
export function useHomePageKeyboardShortcuts() {
  const [showHelp, setShowHelp] = useState(false)

  const openHelp = useCallback(() => setShowHelp(true), [])
  const closeHelp = useCallback(() => setShowHelp(false), [])

  const switchTab = useCallback((tabValue: string) => {
    const tabTrigger = document.querySelector(`[value="${tabValue}"]`) as HTMLElement
    if (tabTrigger) {
      tabTrigger.click()
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const scrollToOverview = useCallback(() => {
    const overviewSection = document.querySelector('[data-section="overview"]') as HTMLElement
    if (overviewSection) {
      overviewSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const shortcuts = useMemo(
    () => [...createNavigationShortcuts(switchTab, scrollToTop, scrollToOverview), ...createHelpShortcuts(openHelp)],
    [switchTab, scrollToTop, scrollToOverview, openHelp],
  )

  useKeyboardShortcuts({ shortcuts })

  return {
    shortcuts,
    showHelp,
    closeHelp,
  }
}
