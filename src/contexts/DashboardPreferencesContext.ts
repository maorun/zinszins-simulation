import { createContext, useContext } from 'react'
import type { DashboardPreferences, DashboardSectionId } from '../utils/dashboard-preferences'

export interface DashboardPreferencesContextType {
  preferences: DashboardPreferences
  updateSectionVisibility: (sectionId: DashboardSectionId, visible: boolean) => void
  updateSectionCollapsed: (sectionId: DashboardSectionId, collapsed: boolean) => void
  updateSectionOrder: (sectionIds: DashboardSectionId[]) => void
  resetPreferences: () => void
  isLoading: boolean
}

export const DashboardPreferencesContext = createContext<DashboardPreferencesContextType | undefined>(undefined)

export function useDashboardPreferences() {
  const context = useContext(DashboardPreferencesContext)
  if (context === undefined) {
    throw new Error('useDashboardPreferences must be used within a DashboardPreferencesProvider')
  }
  return context
}
