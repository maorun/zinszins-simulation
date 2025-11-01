import { toast } from 'sonner'
import {
  setActiveProfile,
  duplicateProfile,
  deleteProfile,
  clearAllProfiles,
  getProfileCount,
  type UserProfile,
} from '../../utils/profile-storage'

interface ProfileActionHandlersParams {
  loadSavedConfiguration: () => void
  resetToDefaults: () => void
  refreshProfiles: () => void
  activeProfile: UserProfile | null
  deleteConfirmProfile: UserProfile | null
  setDeleteConfirmProfile: (profile: UserProfile | null) => void
  setIsClearAllConfirmOpen: (open: boolean) => void
}

/** Profile action handlers */
export function createProfileActionHandlers(params: ProfileActionHandlersParams) {
  const {
    loadSavedConfiguration,
    resetToDefaults,
    refreshProfiles,
    activeProfile,
    deleteConfirmProfile,
    setDeleteConfirmProfile,
    setIsClearAllConfirmOpen,
  } = params

  const handleSwitchProfile = (profile: UserProfile) => {
    if (profile.id === activeProfile?.id) {
      return
    }

    try {
      const success = setActiveProfile(profile.id)
      if (success) {
        refreshProfiles()
        loadSavedConfiguration()
        toast.success(`Zu Profil "${profile.name}" gewechselt`)
      }
      else {
        toast.error('Fehler beim Wechseln des Profils')
      }
    }
    catch (error) {
      console.error('Failed to switch profile:', error)
      toast.error('Fehler beim Wechseln des Profils')
    }
  }

  const handleDuplicateProfile = (profile: UserProfile) => {
    try {
      const duplicatedProfile = duplicateProfile(profile.id, `${profile.name} (Kopie)`)
      if (duplicatedProfile) {
        refreshProfiles()
        toast.success(`Profil "${duplicatedProfile.name}" wurde erstellt`)
      }
      else {
        toast.error('Fehler beim Duplizieren des Profils')
      }
    }
    catch (error) {
      console.error('Failed to duplicate profile:', error)
      toast.error('Fehler beim Duplizieren des Profils')
    }
  }

  const handleDeleteProfile = (profile: UserProfile) => {
    const profileCount = getProfileCount()
    if (profileCount <= 1) {
      toast.error('Das letzte Profil kann nicht gelöscht werden')
      return
    }

    setDeleteConfirmProfile(profile)
  }

  const confirmDeleteProfile = () => {
    if (!deleteConfirmProfile) return

    try {
      const success = deleteProfile(deleteConfirmProfile.id)
      if (success) {
        refreshProfiles()
        if (deleteConfirmProfile.id === activeProfile?.id) {
          loadSavedConfiguration()
        }
        toast.success(`Profil "${deleteConfirmProfile.name}" wurde gelöscht`)
      }
      else {
        toast.error('Fehler beim Löschen des Profils')
      }
    }
    catch (error) {
      console.error('Failed to delete profile:', error)
      toast.error('Fehler beim Löschen des Profils')
    }
    finally {
      setDeleteConfirmProfile(null)
    }
  }

  const handleClearAllProfiles = () => {
    setIsClearAllConfirmOpen(true)
  }

  const confirmClearAllProfiles = () => {
    try {
      clearAllProfiles()
      resetToDefaults()
      refreshProfiles()
      toast.success('Alle Profile wurden gelöscht und auf Standardwerte zurückgesetzt.')
    }
    catch (error) {
      console.error('Failed to clear all profiles:', error)
      toast.error('Fehler beim Löschen aller Profile')
    }
    finally {
      setIsClearAllConfirmOpen(false)
    }
  }

  return {
    handleSwitchProfile,
    handleDuplicateProfile,
    handleDeleteProfile,
    confirmDeleteProfile,
    handleClearAllProfiles,
    confirmClearAllProfiles,
  }
}
