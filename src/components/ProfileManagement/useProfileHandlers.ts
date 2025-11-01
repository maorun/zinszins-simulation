import type { UserProfile } from '../../utils/profile-storage'
import type { SavedConfiguration } from '../../utils/config-storage'
import { createProfileFormHandlers } from './profileFormHandlers'
import { createProfileActionHandlers } from './profileActionHandlers'

interface ProfileFormData {
  name: string
  description: string
}

interface ProfileHandlersParams {
  getCurrentConfiguration: () => SavedConfiguration
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

/** Custom hook for profile handlers */
export function useProfileHandlers(params: ProfileHandlersParams) {
  const formHandlers = createProfileFormHandlers({
    getCurrentConfiguration: params.getCurrentConfiguration,
    formData: params.formData,
    editingProfile: params.editingProfile,
    refreshProfiles: params.refreshProfiles,
    setIsCreateDialogOpen: params.setIsCreateDialogOpen,
    setIsEditDialogOpen: params.setIsEditDialogOpen,
    setEditingProfile: params.setEditingProfile,
    setFormData: params.setFormData,
  })

  const actionHandlers = createProfileActionHandlers({
    loadSavedConfiguration: params.loadSavedConfiguration,
    resetToDefaults: params.resetToDefaults,
    refreshProfiles: params.refreshProfiles,
    activeProfile: params.activeProfile,
    deleteConfirmProfile: params.deleteConfirmProfile,
    setDeleteConfirmProfile: params.setDeleteConfirmProfile,
    setIsClearAllConfirmOpen: params.setIsClearAllConfirmOpen,
  })

  return {
    ...formHandlers,
    ...actionHandlers,
  }
}
