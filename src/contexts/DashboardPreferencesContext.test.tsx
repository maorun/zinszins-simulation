import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { DashboardPreferencesProvider } from './DashboardPreferencesProvider'
import { useDashboardPreferences } from './DashboardPreferencesContext'
import * as dashboardPreferencesModule from '../utils/dashboard-preferences'

describe('DashboardPreferencesContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('useDashboardPreferences', () => {
    it('should throw error when used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error
      console.error = vi.fn()

      expect(() => {
        renderHook(() => useDashboardPreferences())
      }).toThrow('useDashboardPreferences must be used within a DashboardPreferencesProvider')

      console.error = originalError
    })

    it('should provide preferences when used within provider', () => {
      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      expect(result.current.preferences).toBeDefined()
      expect(result.current.preferences.sections).toHaveLength(13)
    })
  })

  describe('DashboardPreferencesProvider', () => {
    it('should load preferences on mount', () => {
      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      expect(result.current.preferences.version).toBe(1)
      expect(result.current.preferences.sections).toHaveLength(13)
    })

    it('should provide all required context values', () => {
      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      expect(result.current.preferences).toBeDefined()
      expect(result.current.updateSectionVisibility).toBeDefined()
      expect(result.current.updateSectionCollapsed).toBeDefined()
      expect(result.current.updateSectionOrder).toBeDefined()
      expect(result.current.resetPreferences).toBeDefined()
      expect(result.current.isLoading).toBeDefined()
    })

    it('should update section visibility', async () => {
      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      const introSection = result.current.preferences.sections.find((s) => s.id === 'introduction')
      expect(introSection?.visible).toBe(true)

      act(() => {
        result.current.updateSectionVisibility('introduction', false)
      })

      await waitFor(() => {
        const updatedIntro = result.current.preferences.sections.find((s) => s.id === 'introduction')
        expect(updatedIntro?.visible).toBe(false)
      })
    })

    it('should update section collapsed state', async () => {
      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      const zeitspanneSection = result.current.preferences.sections.find((s) => s.id === 'zeitspanne')
      expect(zeitspanneSection?.collapsed).toBe(false)

      act(() => {
        result.current.updateSectionCollapsed('zeitspanne', true)
      })

      await waitFor(() => {
        const updatedZeitspanne = result.current.preferences.sections.find((s) => s.id === 'zeitspanne')
        expect(updatedZeitspanne?.collapsed).toBe(true)
      })
    })

    it('should update section order', async () => {
      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      const originalOrder = result.current.preferences.sections.map((s) => s.id)
      const newOrder = [...originalOrder].reverse()

      act(() => {
        result.current.updateSectionOrder(newOrder)
      })

      await waitFor(() => {
        const updatedOrder = result.current.preferences.sections
          .sort((a, b) => a.order - b.order)
          .map((s) => s.id)
        expect(updatedOrder).toEqual(newOrder)
      })
    })

    it('should reset preferences to defaults', async () => {
      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      // Modify preferences
      act(() => {
        result.current.updateSectionVisibility('introduction', false)
        result.current.updateSectionCollapsed('zeitspanne', true)
      })

      await waitFor(() => {
        const intro = result.current.preferences.sections.find((s) => s.id === 'introduction')
        expect(intro?.visible).toBe(false)
      })

      // Reset to defaults
      act(() => {
        result.current.resetPreferences()
      })

      await waitFor(() => {
        const intro = result.current.preferences.sections.find((s) => s.id === 'introduction')
        const zeitspanne = result.current.preferences.sections.find((s) => s.id === 'zeitspanne')
        expect(intro?.visible).toBe(true)
        expect(zeitspanne?.collapsed).toBe(false)
      })
    })

    it('should save preferences to localStorage when they change', async () => {
      const saveSpy = vi.spyOn(dashboardPreferencesModule, 'saveDashboardPreferences')

      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      act(() => {
        result.current.updateSectionVisibility('introduction', false)
      })

      await waitFor(() => {
        expect(saveSpy).toHaveBeenCalled()
      })
    })

    it('should maintain isLoading state', () => {
      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      expect(result.current.isLoading).toBe(false)
    })

    it('should handle multiple updates correctly', async () => {
      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      act(() => {
        result.current.updateSectionVisibility('introduction', false)
        result.current.updateSectionVisibility('zeitspanne', false)
        result.current.updateSectionCollapsed('sparplan-eingabe', true)
      })

      await waitFor(() => {
        const intro = result.current.preferences.sections.find((s) => s.id === 'introduction')
        const zeitspanne = result.current.preferences.sections.find((s) => s.id === 'zeitspanne')
        const sparplan = result.current.preferences.sections.find((s) => s.id === 'sparplan-eingabe')

        expect(intro?.visible).toBe(false)
        expect(zeitspanne?.visible).toBe(false)
        expect(sparplan?.collapsed).toBe(true)
      })
    })

    it('should persist preferences across provider remounts', async () => {
      // First mount
      const { result: result1, unmount } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      act(() => {
        result1.current.updateSectionVisibility('introduction', false)
      })

      await waitFor(() => {
        const intro = result1.current.preferences.sections.find((s) => s.id === 'introduction')
        expect(intro?.visible).toBe(false)
      })

      unmount()

      // Second mount - should load persisted preferences
      const { result: result2 } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      await waitFor(() => {
        const intro = result2.current.preferences.sections.find((s) => s.id === 'introduction')
        expect(intro?.visible).toBe(false)
      })
    })
  })

  describe('Integration with dashboard-preferences utilities', () => {
    it('should use loadDashboardPreferences on initialization', () => {
      const loadSpy = vi.spyOn(dashboardPreferencesModule, 'loadDashboardPreferences')

      renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      expect(loadSpy).toHaveBeenCalled()
    })

    it('should use updateSectionVisibility utility', async () => {
      const updateVisibilitySpy = vi.spyOn(dashboardPreferencesModule, 'updateSectionVisibility')

      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      act(() => {
        result.current.updateSectionVisibility('introduction', false)
      })

      await waitFor(() => {
        expect(updateVisibilitySpy).toHaveBeenCalledWith(expect.anything(), 'introduction', false)
      })
    })

    it('should use updateSectionCollapsed utility', async () => {
      const updateCollapsedSpy = vi.spyOn(dashboardPreferencesModule, 'updateSectionCollapsed')

      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      act(() => {
        result.current.updateSectionCollapsed('zeitspanne', true)
      })

      await waitFor(() => {
        expect(updateCollapsedSpy).toHaveBeenCalledWith(expect.anything(), 'zeitspanne', true)
      })
    })

    it('should use updateSectionOrder utility', async () => {
      const updateOrderSpy = vi.spyOn(dashboardPreferencesModule, 'updateSectionOrder')

      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      const newOrder = result.current.preferences.sections.map((s) => s.id).reverse()

      act(() => {
        result.current.updateSectionOrder(newOrder)
      })

      await waitFor(() => {
        expect(updateOrderSpy).toHaveBeenCalledWith(expect.anything(), newOrder)
      })
    })

    it('should use resetToDefaults utility', async () => {
      const resetSpy = vi.spyOn(dashboardPreferencesModule, 'resetToDefaults')

      const { result } = renderHook(() => useDashboardPreferences(), {
        wrapper: DashboardPreferencesProvider,
      })

      act(() => {
        result.current.resetPreferences()
      })

      await waitFor(() => {
        expect(resetSpy).toHaveBeenCalled()
      })
    })
  })
})
