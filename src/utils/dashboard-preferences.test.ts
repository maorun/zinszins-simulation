import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  loadDashboardPreferences,
  saveDashboardPreferences,
  clearDashboardPreferences,
  hasSavedPreferences,
  updateSectionVisibility,
  updateSectionCollapsed,
  updateSectionOrder,
  getVisibleSections,
  resetToDefaults,
  getDefaultPreferences,
  type DashboardPreferences,
  type DashboardSectionId,
} from './dashboard-preferences'

describe('dashboard-preferences', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
  })

  describe('getDefaultPreferences', () => {
    it('should return default preferences with all sections', () => {
      const defaults = getDefaultPreferences()

      expect(defaults.version).toBe(1)
      expect(defaults.sections).toHaveLength(13)
      expect(defaults.lastUpdated).toBeGreaterThan(0)
    })

    it('should include all required section IDs', () => {
      const defaults = getDefaultPreferences()
      const sectionIds = defaults.sections.map((s) => s.id)

      expect(sectionIds).toContain('introduction')
      expect(sectionIds).toContain('zeitspanne')
      expect(sectionIds).toContain('sparplan-eingabe')
      expect(sectionIds).toContain('return-configuration')
      expect(sectionIds).toContain('tax-configuration')
      expect(sectionIds).toContain('simulation-results')
      expect(sectionIds).toContain('withdrawal-planning')
      expect(sectionIds).toContain('monte-carlo-analysis')
      expect(sectionIds).toContain('special-events')
      expect(sectionIds).toContain('risk-analysis')
      expect(sectionIds).toContain('behavioral-finance')
      expect(sectionIds).toContain('global-planning')
      expect(sectionIds).toContain('data-export')
    })

    it('should have all sections visible by default', () => {
      const defaults = getDefaultPreferences()

      defaults.sections.forEach((section) => {
        expect(section.visible).toBe(true)
      })
    })

    it('should have all sections not collapsed by default', () => {
      const defaults = getDefaultPreferences()

      defaults.sections.forEach((section) => {
        expect(section.collapsed).toBe(false)
      })
    })

    it('should have sections in sequential order', () => {
      const defaults = getDefaultPreferences()

      defaults.sections.forEach((section, index) => {
        expect(section.order).toBe(index)
      })
    })
  })

  describe('loadDashboardPreferences', () => {
    it('should return defaults when no preferences are saved', () => {
      const preferences = loadDashboardPreferences()

      expect(preferences.version).toBe(1)
      expect(preferences.sections).toHaveLength(13)
    })

    it('should load saved preferences from localStorage', () => {
      const testPreferences: DashboardPreferences = {
        version: 1,
        sections: [
          { id: 'introduction', visible: false, collapsed: true, order: 0 },
          { id: 'zeitspanne', visible: true, collapsed: false, order: 1 },
        ],
        lastUpdated: Date.now(),
      }

      localStorage.setItem('dashboard-preferences', JSON.stringify(testPreferences))

      const loaded = loadDashboardPreferences()

      expect(loaded.version).toBe(1)
      // Should merge with defaults, so more than 2 sections
      expect(loaded.sections.length).toBeGreaterThanOrEqual(2)

      // Find our test sections
      const intro = loaded.sections.find((s) => s.id === 'introduction')
      expect(intro?.visible).toBe(false)
      expect(intro?.collapsed).toBe(true)
    })

    it('should return defaults when JSON parsing fails', () => {
      localStorage.setItem('dashboard-preferences', 'invalid-json')

      const preferences = loadDashboardPreferences()

      expect(preferences.version).toBe(1)
      expect(preferences.sections).toHaveLength(13)
    })

    it('should return defaults when version mismatch', () => {
      const invalidVersion = {
        version: 999,
        sections: [],
        lastUpdated: Date.now(),
      }

      localStorage.setItem('dashboard-preferences', JSON.stringify(invalidVersion))

      const preferences = loadDashboardPreferences()

      expect(preferences.version).toBe(1)
      expect(preferences.sections).toHaveLength(13)
    })

    it('should return defaults when sections is not an array', () => {
      const invalidStructure = {
        version: 1,
        sections: 'not-an-array',
        lastUpdated: Date.now(),
      }

      localStorage.setItem('dashboard-preferences', JSON.stringify(invalidStructure))

      const preferences = loadDashboardPreferences()

      expect(preferences.version).toBe(1)
      expect(preferences.sections).toHaveLength(13)
    })

    it('should merge stored sections with defaults', () => {
      const partialPreferences = {
        version: 1,
        sections: [{ id: 'introduction', visible: false, collapsed: true, order: 0 }],
        lastUpdated: Date.now(),
      }

      localStorage.setItem('dashboard-preferences', JSON.stringify(partialPreferences))

      const loaded = loadDashboardPreferences()

      // Should have all default sections
      expect(loaded.sections).toHaveLength(13)

      // Our custom intro preference should be preserved
      const intro = loaded.sections.find((s) => s.id === 'introduction')
      expect(intro?.visible).toBe(false)
      expect(intro?.collapsed).toBe(true)

      // Other sections should use defaults
      const zeitspanne = loaded.sections.find((s) => s.id === 'zeitspanne')
      expect(zeitspanne?.visible).toBe(true)
      expect(zeitspanne?.collapsed).toBe(false)
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.getItem to throw an error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = () => {
        throw new Error('localStorage error')
      }

      const preferences = loadDashboardPreferences()

      expect(preferences.version).toBe(1)
      expect(preferences.sections).toHaveLength(13)

      // Restore
      localStorage.getItem = originalGetItem
    })
  })

  describe('saveDashboardPreferences', () => {
    it('should save preferences to localStorage', () => {
      const preferences = getDefaultPreferences()
      preferences.sections[0].visible = false

      saveDashboardPreferences(preferences)

      const saved = localStorage.getItem('dashboard-preferences')
      expect(saved).toBeTruthy()

      const parsed = JSON.parse(saved!)
      expect(parsed.version).toBe(1)
      expect(parsed.sections[0].visible).toBe(false)
    })

    it('should update lastUpdated timestamp', () => {
      const preferences = getDefaultPreferences()
      const originalTimestamp = preferences.lastUpdated

      // Wait a tiny bit to ensure timestamp changes
      setTimeout(() => {
        saveDashboardPreferences(preferences)

        const saved = localStorage.getItem('dashboard-preferences')
        const parsed = JSON.parse(saved!) as DashboardPreferences

        expect(parsed.lastUpdated).toBeGreaterThan(originalTimestamp)
      }, 10)
    })

    it('should handle localStorage errors gracefully', () => {
      const preferences = getDefaultPreferences()

      // Mock localStorage.setItem to throw an error
      const originalSetItem = localStorage.setItem
      localStorage.setItem = () => {
        throw new Error('localStorage full')
      }

      // Should not throw
      expect(() => saveDashboardPreferences(preferences)).not.toThrow()

      // Restore
      localStorage.setItem = originalSetItem
    })
  })

  describe('clearDashboardPreferences', () => {
    it('should remove preferences from localStorage', () => {
      const preferences = getDefaultPreferences()
      saveDashboardPreferences(preferences)

      expect(localStorage.getItem('dashboard-preferences')).toBeTruthy()

      clearDashboardPreferences()

      expect(localStorage.getItem('dashboard-preferences')).toBeNull()
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.removeItem to throw an error
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = () => {
        throw new Error('localStorage error')
      }

      // Should not throw
      expect(() => clearDashboardPreferences()).not.toThrow()

      // Restore
      localStorage.removeItem = originalRemoveItem
    })
  })

  describe('hasSavedPreferences', () => {
    it('should return false when no preferences are saved', () => {
      expect(hasSavedPreferences()).toBe(false)
    })

    it('should return true when preferences are saved', () => {
      const preferences = getDefaultPreferences()
      saveDashboardPreferences(preferences)

      expect(hasSavedPreferences()).toBe(true)
    })

    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.getItem to throw an error
      const originalGetItem = localStorage.getItem
      localStorage.getItem = () => {
        throw new Error('localStorage error')
      }

      expect(hasSavedPreferences()).toBe(false)

      // Restore
      localStorage.getItem = originalGetItem
    })
  })

  describe('updateSectionVisibility', () => {
    it('should update visibility for a specific section', () => {
      const preferences = getDefaultPreferences()
      const sectionId: DashboardSectionId = 'introduction'

      const updated = updateSectionVisibility(preferences, sectionId, false)

      const section = updated.sections.find((s) => s.id === sectionId)
      expect(section?.visible).toBe(false)
    })

    it('should not modify other sections', () => {
      const preferences = getDefaultPreferences()
      const sectionId: DashboardSectionId = 'introduction'

      const updated = updateSectionVisibility(preferences, sectionId, false)

      const otherSections = updated.sections.filter((s) => s.id !== sectionId)
      otherSections.forEach((section) => {
        expect(section.visible).toBe(true)
      })
    })

    it('should not mutate original preferences', () => {
      const preferences = getDefaultPreferences()
      const sectionId: DashboardSectionId = 'introduction'
      const originalVisible = preferences.sections.find((s) => s.id === sectionId)?.visible

      updateSectionVisibility(preferences, sectionId, false)

      const stillOriginal = preferences.sections.find((s) => s.id === sectionId)?.visible
      expect(stillOriginal).toBe(originalVisible)
    })
  })

  describe('updateSectionCollapsed', () => {
    it('should update collapsed state for a specific section', () => {
      const preferences = getDefaultPreferences()
      const sectionId: DashboardSectionId = 'zeitspanne'

      const updated = updateSectionCollapsed(preferences, sectionId, true)

      const section = updated.sections.find((s) => s.id === sectionId)
      expect(section?.collapsed).toBe(true)
    })

    it('should not modify other sections', () => {
      const preferences = getDefaultPreferences()
      const sectionId: DashboardSectionId = 'zeitspanne'

      const updated = updateSectionCollapsed(preferences, sectionId, true)

      const otherSections = updated.sections.filter((s) => s.id !== sectionId)
      otherSections.forEach((section) => {
        expect(section.collapsed).toBe(false)
      })
    })

    it('should not mutate original preferences', () => {
      const preferences = getDefaultPreferences()
      const sectionId: DashboardSectionId = 'zeitspanne'
      const originalCollapsed = preferences.sections.find((s) => s.id === sectionId)?.collapsed

      updateSectionCollapsed(preferences, sectionId, true)

      const stillOriginal = preferences.sections.find((s) => s.id === sectionId)?.collapsed
      expect(stillOriginal).toBe(originalCollapsed)
    })
  })

  describe('updateSectionOrder', () => {
    it('should reorder sections based on provided array', () => {
      const preferences = getDefaultPreferences()
      const newOrder: DashboardSectionId[] = [
        'data-export',
        'introduction',
        'zeitspanne',
        'sparplan-eingabe',
        'return-configuration',
        'tax-configuration',
        'simulation-results',
        'withdrawal-planning',
        'monte-carlo-analysis',
        'special-events',
        'risk-analysis',
        'behavioral-finance',
        'global-planning',
      ]

      const updated = updateSectionOrder(preferences, newOrder)

      // First section should be data-export
      expect(updated.sections[0].id).toBe('data-export')
      expect(updated.sections[0].order).toBe(0)

      // Second should be introduction
      expect(updated.sections[1].id).toBe('introduction')
      expect(updated.sections[1].order).toBe(1)
    })

    it('should maintain section properties while reordering', () => {
      const preferences = getDefaultPreferences()
      // Modify a section
      preferences.sections[0].visible = false
      preferences.sections[0].collapsed = true

      const newOrder: DashboardSectionId[] = preferences.sections.map((s) => s.id)
      // Reverse the order
      newOrder.reverse()

      const updated = updateSectionOrder(preferences, newOrder)

      const intro = updated.sections.find((s) => s.id === 'introduction')
      expect(intro?.visible).toBe(false)
      expect(intro?.collapsed).toBe(true)
    })

    it('should sort sections by order after update', () => {
      const preferences = getDefaultPreferences()
      const newOrder: DashboardSectionId[] = preferences.sections.map((s) => s.id).reverse()

      const updated = updateSectionOrder(preferences, newOrder)

      // Check that order values are sequential
      updated.sections.forEach((section, index) => {
        expect(section.order).toBe(index)
      })
    })
  })

  describe('getVisibleSections', () => {
    it('should return only visible sections', () => {
      const preferences = getDefaultPreferences()
      // Hide some sections
      preferences.sections[0].visible = false
      preferences.sections[2].visible = false

      const visible = getVisibleSections(preferences)

      expect(visible.length).toBe(11) // 13 - 2 hidden
      expect(visible.every((s) => s.visible)).toBe(true)
    })

    it('should return sections sorted by order', () => {
      const preferences = getDefaultPreferences()

      const visible = getVisibleSections(preferences)

      // Check sequential order
      visible.forEach((section, index) => {
        if (index > 0) {
          expect(section.order).toBeGreaterThan(visible[index - 1].order)
        }
      })
    })

    it('should return empty array when all sections are hidden', () => {
      const preferences = getDefaultPreferences()
      preferences.sections.forEach((section) => {
        section.visible = false
      })

      const visible = getVisibleSections(preferences)

      expect(visible).toHaveLength(0)
    })

    it('should return all sections when all are visible', () => {
      const preferences = getDefaultPreferences()

      const visible = getVisibleSections(preferences)

      expect(visible).toHaveLength(13)
    })
  })

  describe('resetToDefaults', () => {
    it('should return fresh default preferences', () => {
      const reset = resetToDefaults()

      expect(reset.version).toBe(1)
      expect(reset.sections).toHaveLength(13)
      expect(reset.sections.every((s) => s.visible)).toBe(true)
      expect(reset.sections.every((s) => !s.collapsed)).toBe(true)
    })

    it('should have sequential order', () => {
      const reset = resetToDefaults()

      reset.sections.forEach((section, index) => {
        expect(section.order).toBe(index)
      })
    })
  })

  describe('Integration tests', () => {
    it('should handle complete save/load cycle', () => {
      const preferences = getDefaultPreferences()

      // Modify some preferences
      preferences.sections[0].visible = false
      preferences.sections[1].collapsed = true
      preferences.sections[2].order = 10

      // Save
      saveDashboardPreferences(preferences)

      // Load
      const loaded = loadDashboardPreferences()

      // Verify modifications are preserved
      const intro = loaded.sections.find((s) => s.id === 'introduction')
      expect(intro?.visible).toBe(false)

      const zeitspanne = loaded.sections.find((s) => s.id === 'zeitspanne')
      expect(zeitspanne?.collapsed).toBe(true)
    })

    it('should handle multiple updates in sequence', () => {
      let preferences = getDefaultPreferences()

      preferences = updateSectionVisibility(preferences, 'introduction', false)
      preferences = updateSectionCollapsed(preferences, 'zeitspanne', true)
      preferences = updateSectionOrder(preferences, preferences.sections.map((s) => s.id).reverse())

      saveDashboardPreferences(preferences)
      const loaded = loadDashboardPreferences()

      const intro = loaded.sections.find((s) => s.id === 'introduction')
      expect(intro?.visible).toBe(false)

      const zeitspanne = loaded.sections.find((s) => s.id === 'zeitspanne')
      expect(zeitspanne?.collapsed).toBe(true)
    })

    it('should handle clear and reload cycle', () => {
      const preferences = getDefaultPreferences()
      preferences.sections[0].visible = false

      saveDashboardPreferences(preferences)
      expect(hasSavedPreferences()).toBe(true)

      clearDashboardPreferences()
      expect(hasSavedPreferences()).toBe(false)

      const loaded = loadDashboardPreferences()
      expect(loaded.sections[0].visible).toBe(true) // Back to default
    })
  })
})
