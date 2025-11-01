import { toast } from 'sonner'
import {
  createProfile,
  updateProfile,
  setActiveProfile,
  type UserProfile,
} from '../../utils/profile-storage'
import type { SavedConfiguration } from '../../utils/config-storage'

interface ProfileFormData {
  name: string
  description: string
}

interface ProfileFormHandlersParams {
  getCurrentConfiguration: () => SavedConfiguration
  formData: ProfileFormData
  editingProfile: UserProfile | null
  refreshProfiles: () => void
  setIsCreateDialogOpen: (open: boolean) => void
  setIsEditDialogOpen: (open: boolean) => void
  setEditingProfile: (profile: UserProfile | null) => void
  setFormData: (data: ProfileFormData) => void
}

/** Profile form handlers */
// eslint-disable-next-line max-lines-per-function -- Handler collection function
export function createProfileFormHandlers(params: ProfileFormHandlersParams) {
  const {
    getCurrentConfiguration,
    formData,
    editingProfile,
    refreshProfiles,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setEditingProfile,
    setFormData,
  } = params

  const handleCreateProfile = async () => {
    if (!formData.name.trim()) {
      toast.error('Profilname ist erforderlich')
      return
    }

    try {
      const currentConfig = getCurrentConfiguration()
      const newProfile = createProfile(
        formData.name.trim(),
        currentConfig,
        formData.description.trim() || undefined,
      )

      setActiveProfile(newProfile.id)
      refreshProfiles()

      setIsCreateDialogOpen(false)
      setFormData({ name: '', description: '' })
      toast.success(`Profil "${newProfile.name}" wurde erstellt und aktiviert`)
    }
    catch (error) {
      console.error('Failed to create profile:', error)
      toast.error('Fehler beim Erstellen des Profils')
    }
  }

  const handleEditProfile = async () => {
    if (!editingProfile || !formData.name.trim()) {
      toast.error('Profilname ist erforderlich')
      return
    }

    try {
      const success = updateProfile(editingProfile.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
      })

      if (success) {
        refreshProfiles()
        setIsEditDialogOpen(false)
        setEditingProfile(null)
        setFormData({ name: '', description: '' })
        toast.success(`Profil "${formData.name}" wurde aktualisiert`)
      }
      else {
        toast.error('Fehler beim Aktualisieren des Profils')
      }
    }
    catch (error) {
      console.error('Failed to edit profile:', error)
      toast.error('Fehler beim Aktualisieren des Profils')
    }
  }

  const openCreateDialog = () => {
    setFormData({ name: '', description: '' })
    setIsCreateDialogOpen(true)
  }

  const openEditDialog = (profile: UserProfile) => {
    setEditingProfile(profile)
    setFormData({ name: profile.name, description: profile.description || '' })
    setIsEditDialogOpen(true)
  }

  return {
    handleCreateProfile,
    handleEditProfile,
    openCreateDialog,
    openEditDialog,
  }
}
