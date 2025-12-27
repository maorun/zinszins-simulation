/**
 * Dashboard Preferences Storage
 *
 * This module handles storing and retrieving user preferences for dashboard customization
 * in localStorage. Users can control which sections are visible, collapsed, and their order.
 */

const DASHBOARD_PREFERENCES_KEY = 'dashboard-preferences'
const STORAGE_VERSION = 1

/**
 * Dashboard section identifiers
 */
export type DashboardSectionId =
  | 'introduction'
  | 'zeitspanne'
  | 'sparplan-eingabe'
  | 'return-configuration'
  | 'tax-configuration'
  | 'simulation-results'
  | 'withdrawal-planning'
  | 'monte-carlo-analysis'
  | 'special-events'
  | 'data-export'
  | 'global-planning'
  | 'risk-analysis'
  | 'behavioral-finance'

/**
 * Preferences for a single dashboard section
 */
export interface SectionPreference {
  /** Unique identifier for the section */
  id: DashboardSectionId
  /** Whether the section is visible in the dashboard */
  visible: boolean
  /** Whether the section is currently collapsed (when visible) */
  collapsed: boolean
  /** Display order position (lower numbers appear first) */
  order: number
}

/**
 * Complete dashboard preferences state
 */
export interface DashboardPreferences {
  /** Version number for handling future changes */
  version: number
  /** Preferences for all dashboard sections */
  sections: SectionPreference[]
  /** Timestamp of last update */
  lastUpdated: number
}

/**
 * Default section preferences with reasonable defaults
 */
export const DEFAULT_SECTION_PREFERENCES: SectionPreference[] = [
  { id: 'introduction', visible: true, collapsed: false, order: 0 },
  { id: 'zeitspanne', visible: true, collapsed: false, order: 1 },
  { id: 'sparplan-eingabe', visible: true, collapsed: false, order: 2 },
  { id: 'return-configuration', visible: true, collapsed: false, order: 3 },
  { id: 'tax-configuration', visible: true, collapsed: false, order: 4 },
  { id: 'simulation-results', visible: true, collapsed: false, order: 5 },
  { id: 'withdrawal-planning', visible: true, collapsed: false, order: 6 },
  { id: 'monte-carlo-analysis', visible: true, collapsed: false, order: 7 },
  { id: 'special-events', visible: true, collapsed: false, order: 8 },
  { id: 'risk-analysis', visible: true, collapsed: false, order: 9 },
  { id: 'behavioral-finance', visible: true, collapsed: false, order: 10 },
  { id: 'global-planning', visible: true, collapsed: false, order: 11 },
  { id: 'data-export', visible: true, collapsed: false, order: 12 },
]

/**
 * Get default dashboard preferences
 */
export function getDefaultPreferences(): DashboardPreferences {
  return {
    version: STORAGE_VERSION,
    sections: DEFAULT_SECTION_PREFERENCES.map((section) => ({ ...section })),
    lastUpdated: Date.now(),
  }
}

/**
 * Load dashboard preferences from localStorage
 */
export function loadDashboardPreferences(): DashboardPreferences {
  try {
    const stored = localStorage.getItem(DASHBOARD_PREFERENCES_KEY)
    if (!stored) {
      return getDefaultPreferences()
    }

    const parsed = JSON.parse(stored) as DashboardPreferences

    // Validate version
    if (parsed.version !== STORAGE_VERSION) {
      console.warn('Dashboard preferences version mismatch, using defaults')
      return getDefaultPreferences()
    }

    // Validate structure
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      console.warn('Invalid dashboard preferences structure, using defaults')
      return getDefaultPreferences()
    }

    // Merge with defaults to ensure all sections are present
    const mergedSections = mergeSectionsWithDefaults(parsed.sections)

    return {
      ...parsed,
      sections: mergedSections,
    }
  } catch (error) {
    console.error('Failed to load dashboard preferences from localStorage:', error)
    return getDefaultPreferences()
  }
}

/**
 * Merge stored preferences with defaults to ensure all sections are present
 */
function mergeSectionsWithDefaults(storedSections: SectionPreference[]): SectionPreference[] {
  const merged = new Map<DashboardSectionId, SectionPreference>()

  // Start with defaults
  DEFAULT_SECTION_PREFERENCES.forEach((section) => {
    merged.set(section.id, { ...section })
  })

  // Override with stored preferences
  storedSections.forEach((section) => {
    if (merged.has(section.id)) {
      merged.set(section.id, section)
    }
  })

  // Convert back to array and sort by order
  return Array.from(merged.values()).sort((a, b) => a.order - b.order)
}

/**
 * Save dashboard preferences to localStorage
 */
export function saveDashboardPreferences(preferences: DashboardPreferences): void {
  try {
    const dataToSave: DashboardPreferences = {
      ...preferences,
      version: STORAGE_VERSION,
      lastUpdated: Date.now(),
    }
    localStorage.setItem(DASHBOARD_PREFERENCES_KEY, JSON.stringify(dataToSave))
  } catch (error) {
    console.error('Failed to save dashboard preferences to localStorage:', error)
  }
}

/**
 * Clear dashboard preferences from localStorage
 */
export function clearDashboardPreferences(): void {
  try {
    localStorage.removeItem(DASHBOARD_PREFERENCES_KEY)
  } catch (error) {
    console.error('Failed to clear dashboard preferences from localStorage:', error)
  }
}

/**
 * Check if dashboard preferences exist in localStorage
 */
export function hasSavedPreferences(): boolean {
  try {
    return localStorage.getItem(DASHBOARD_PREFERENCES_KEY) !== null
  } catch {
    return false
  }
}

/**
 * Update visibility for a specific section
 */
export function updateSectionVisibility(
  preferences: DashboardPreferences,
  sectionId: DashboardSectionId,
  visible: boolean,
): DashboardPreferences {
  return {
    ...preferences,
    sections: preferences.sections.map((section) =>
      section.id === sectionId ? { ...section, visible } : section,
    ),
  }
}

/**
 * Update collapsed state for a specific section
 */
export function updateSectionCollapsed(
  preferences: DashboardPreferences,
  sectionId: DashboardSectionId,
  collapsed: boolean,
): DashboardPreferences {
  return {
    ...preferences,
    sections: preferences.sections.map((section) =>
      section.id === sectionId ? { ...section, collapsed } : section,
    ),
  }
}

/**
 * Update order for sections (for drag-and-drop reordering)
 */
export function updateSectionOrder(
  preferences: DashboardPreferences,
  sectionIds: DashboardSectionId[],
): DashboardPreferences {
  const updatedSections = sectionIds.map((id, index) => {
    const existingSection = preferences.sections.find((s) => s.id === id)
    if (!existingSection) {
      // Fallback to default for missing sections
      const defaultSection = DEFAULT_SECTION_PREFERENCES.find((s) => s.id === id)
      return defaultSection ? { ...defaultSection, order: index } : null
    }
    return { ...existingSection, order: index }
  })

  // Filter out null values (should not happen in practice)
  const validSections = updatedSections.filter(
    (section): section is SectionPreference => section !== null,
  )

  return {
    ...preferences,
    sections: validSections.sort((a, b) => a.order - b.order),
  }
}

/**
 * Get visible sections sorted by order
 */
export function getVisibleSections(preferences: DashboardPreferences): SectionPreference[] {
  return preferences.sections.filter((section) => section.visible).sort((a, b) => a.order - b.order)
}

/**
 * Reset preferences to defaults
 */
export function resetToDefaults(): DashboardPreferences {
  return getDefaultPreferences()
}
