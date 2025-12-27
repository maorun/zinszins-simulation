import { useState, useCallback, useEffect, ReactNode } from 'react'
import { DashboardPreferencesContext } from './DashboardPreferencesContext'
import {
  loadDashboardPreferences,
  saveDashboardPreferences,
  updateSectionVisibility as updateVisibility,
  updateSectionCollapsed as updateCollapsed,
  updateSectionOrder as updateOrder,
  resetToDefaults,
  type DashboardPreferences,
  type DashboardSectionId,
} from '../utils/dashboard-preferences'

interface DashboardPreferencesProviderProps {
  children: ReactNode
}

export function DashboardPreferencesProvider({ children }: DashboardPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<DashboardPreferences>(() => loadDashboardPreferences())
  const [isLoading] = useState(false)

  // Load preferences on mount
  useEffect(() => {
    const loaded = loadDashboardPreferences()
    setPreferences(loaded)
  }, [])

  // Save preferences whenever they change
  useEffect(() => {
    saveDashboardPreferences(preferences)
  }, [preferences])

  const updateSectionVisibility = useCallback((sectionId: DashboardSectionId, visible: boolean) => {
    setPreferences((prev) => updateVisibility(prev, sectionId, visible))
  }, [])

  const updateSectionCollapsed = useCallback((sectionId: DashboardSectionId, collapsed: boolean) => {
    setPreferences((prev) => updateCollapsed(prev, sectionId, collapsed))
  }, [])

  const updateSectionOrder = useCallback((sectionIds: DashboardSectionId[]) => {
    setPreferences((prev) => updateOrder(prev, sectionIds))
  }, [])

  const resetPreferences = useCallback(() => {
    const defaults = resetToDefaults()
    setPreferences(defaults)
  }, [])

  return (
    <DashboardPreferencesContext.Provider
      value={{
        preferences,
        updateSectionVisibility,
        updateSectionCollapsed,
        updateSectionOrder,
        resetPreferences,
        isLoading,
      }}
    >
      {children}
    </DashboardPreferencesContext.Provider>
  )
}
