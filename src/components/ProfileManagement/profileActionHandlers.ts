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

/** Handle switching to a different profile */
function createSwitchProfileHandler(
  activeProfile: UserProfile | null,
  refreshProfiles: () => void,
  loadSavedConfiguration: () => void,
) {
  return (profile: UserProfile) => {
    if (profile.id === activeProfile?.id) {
      return
    }

    try {
      const success = setActiveProfile(profile.id)
      if (success) {
        refreshProfiles()
        loadSavedConfiguration()
        toast.success(`Zu Profil "${profile.name}" gewechselt`)
      } else {
        toast.error('Fehler beim Wechseln des Profils')
      }
    } catch (error) {
      console.error('Failed to switch profile:', error)
      toast.error('Fehler beim Wechseln des Profils')
    }
  }
}

/** Handle duplicating a profile */
function createDuplicateProfileHandler(refreshProfiles: () => void) {
  return (profile: UserProfile) => {
    try {
      const duplicatedProfile = duplicateProfile(profile.id, `${profile.name} (Kopie)`)
      if (duplicatedProfile) {
        refreshProfiles()
        toast.success(`Profil "${duplicatedProfile.name}" wurde erstellt`)
      } else {
        toast.error('Fehler beim Duplizieren des Profils')
      }
    } catch (error) {
      console.error('Failed to duplicate profile:', error)
      toast.error('Fehler beim Duplizieren des Profils')
    }
  }
}

/** Handle initiating profile deletion */
function createDeleteProfileHandler(setDeleteConfirmProfile: (profile: UserProfile | null) => void) {
  return (profile: UserProfile) => {
    const profileCount = getProfileCount()
    if (profileCount <= 1) {
      toast.error('Das letzte Profil kann nicht gelöscht werden')
      return
    }

    setDeleteConfirmProfile(profile)
  }
}

/** Handle confirming profile deletion */
function createConfirmDeleteProfileHandler(
  deleteConfirmProfile: UserProfile | null,
  activeProfile: UserProfile | null,
  refreshProfiles: () => void,
  loadSavedConfiguration: () => void,
  setDeleteConfirmProfile: (profile: UserProfile | null) => void,
) {
  return () => {
    if (!deleteConfirmProfile) return

    try {
      const success = deleteProfile(deleteConfirmProfile.id)
      if (success) {
        refreshProfiles()
        if (deleteConfirmProfile.id === activeProfile?.id) {
          loadSavedConfiguration()
        }
        toast.success(`Profil "${deleteConfirmProfile.name}" wurde gelöscht`)
      } else {
        toast.error('Fehler beim Löschen des Profils')
      }
    } catch (error) {
      console.error('Failed to delete profile:', error)
      toast.error('Fehler beim Löschen des Profils')
    } finally {
      setDeleteConfirmProfile(null)
    }
  }
}

/** Handle initiating clearing all profiles */
function createClearAllProfilesHandler(setIsClearAllConfirmOpen: (open: boolean) => void) {
  return () => {
    setIsClearAllConfirmOpen(true)
  }
}

/** Handle confirming clearing all profiles */
function createConfirmClearAllProfilesHandler(
  resetToDefaults: () => void,
  refreshProfiles: () => void,
  setIsClearAllConfirmOpen: (open: boolean) => void,
) {
  return () => {
    try {
      clearAllProfiles()
      resetToDefaults()
      refreshProfiles()
      toast.success('Alle Profile wurden gelöscht und auf Standardwerte zurückgesetzt.')
    } catch (error) {
      console.error('Failed to clear all profiles:', error)
      toast.error('Fehler beim Löschen aller Profile')
    } finally {
      setIsClearAllConfirmOpen(false)
    }
  }
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

  return {
    handleSwitchProfile: createSwitchProfileHandler(activeProfile, refreshProfiles, loadSavedConfiguration),
    handleDuplicateProfile: createDuplicateProfileHandler(refreshProfiles),
    handleDeleteProfile: createDeleteProfileHandler(setDeleteConfirmProfile),
    confirmDeleteProfile: createConfirmDeleteProfileHandler(
      deleteConfirmProfile,
      activeProfile,
      refreshProfiles,
      loadSavedConfiguration,
      setDeleteConfirmProfile,
    ),
    handleClearAllProfiles: createClearAllProfilesHandler(setIsClearAllConfirmOpen),
    confirmClearAllProfiles: createConfirmClearAllProfilesHandler(
      resetToDefaults,
      refreshProfiles,
      setIsClearAllConfirmOpen,
    ),
  }
}
