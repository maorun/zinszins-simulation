import { useProfileHandlers } from './useProfileHandlers'
import type { UserProfile } from '../../utils/profile-storage'

interface ProfileFormData {
  name: string
  description: string
}

interface UseProfileSetupParams {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Configuration object type from SimulationContext
  getCurrentConfiguration: () => any
  loadSavedConfiguration: () => void
  resetToDefaults: () => void
  refreshProfiles: () => void
  activeProfile: UserProfile | null
  formData: ProfileFormData
  editingProfile: UserProfile | null
  setFormData: (data: ProfileFormData) => void
  setIsCreateDialogOpen: (open: boolean) => void
  setIsEditDialogOpen: (open: boolean) => void
  setEditingProfile: (profile: UserProfile | null) => void
  setDeleteConfirmProfile: (profile: UserProfile | null) => void
  setIsClearAllConfirmOpen: (open: boolean) => void
  deleteConfirmProfile: UserProfile | null
}

/** Custom hook for profile setup */
export function useProfileSetup(params: UseProfileSetupParams) {
  return useProfileHandlers(params)
}
