import { toast } from 'sonner'
import { createProfile, updateProfile, setActiveProfile, type UserProfile } from '../../utils/profile-storage'
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

/** Helper function to handle profile creation */
function executeProfileCreation(
  formData: ProfileFormData,
  getCurrentConfiguration: () => SavedConfiguration,
  refreshProfiles: () => void,
  setIsCreateDialogOpen: (open: boolean) => void,
  setFormData: (data: ProfileFormData) => void,
) {
  if (!formData.name.trim()) {
    toast.error('Profilname ist erforderlich')
    return
  }

  try {
    const currentConfig = getCurrentConfiguration()
    const newProfile = createProfile(formData.name.trim(), currentConfig, formData.description.trim() || undefined)

    setActiveProfile(newProfile.id)
    refreshProfiles()

    setIsCreateDialogOpen(false)
    setFormData({ name: '', description: '' })
    toast.success(`Profil "${newProfile.name}" wurde erstellt und aktiviert`)
  } catch (error) {
    console.error('Failed to create profile:', error)
    toast.error('Fehler beim Erstellen des Profils')
  }
}

/** Helper function to handle profile editing */
function executeProfileEdit(
  formData: ProfileFormData,
  editingProfile: UserProfile,
  refreshProfiles: () => void,
  setIsEditDialogOpen: (open: boolean) => void,
  setEditingProfile: (profile: UserProfile | null) => void,
  setFormData: (data: ProfileFormData) => void,
) {
  if (!formData.name.trim()) {
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
    } else {
      toast.error('Fehler beim Aktualisieren des Profils')
    }
  } catch (error) {
    console.error('Failed to edit profile:', error)
    toast.error('Fehler beim Aktualisieren des Profils')
  }
}

/** Helper function to create profile creation handler */
function createHandleCreateProfile(
  formData: ProfileFormData,
  getCurrentConfiguration: () => SavedConfiguration,
  refreshProfiles: () => void,
  setIsCreateDialogOpen: (open: boolean) => void,
  setFormData: (data: ProfileFormData) => void,
) {
  return async () => {
    executeProfileCreation(formData, getCurrentConfiguration, refreshProfiles, setIsCreateDialogOpen, setFormData)
  }
}

/** Helper function to create profile edit handler */
function createHandleEditProfile(
  formData: ProfileFormData,
  editingProfile: UserProfile | null,
  refreshProfiles: () => void,
  setIsEditDialogOpen: (open: boolean) => void,
  setEditingProfile: (profile: UserProfile | null) => void,
  setFormData: (data: ProfileFormData) => void,
) {
  return async () => {
    if (!editingProfile) {
      toast.error('Profilname ist erforderlich')
      return
    }

    executeProfileEdit(formData, editingProfile, refreshProfiles, setIsEditDialogOpen, setEditingProfile, setFormData)
  }
}

/** Helper function to create dialog opener for creating profiles */
function createOpenCreateDialog(
  setFormData: (data: ProfileFormData) => void,
  setIsCreateDialogOpen: (open: boolean) => void,
) {
  return () => {
    setFormData({ name: '', description: '' })
    setIsCreateDialogOpen(true)
  }
}

/** Helper function to create dialog opener for editing profiles */
function createOpenEditDialog(
  setEditingProfile: (profile: UserProfile | null) => void,
  setFormData: (data: ProfileFormData) => void,
  setIsEditDialogOpen: (open: boolean) => void,
) {
  return (profile: UserProfile) => {
    setEditingProfile(profile)
    setFormData({ name: profile.name, description: profile.description || '' })
    setIsEditDialogOpen(true)
  }
}

/** Profile form handlers */
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

  return {
    handleCreateProfile: createHandleCreateProfile(
      formData,
      getCurrentConfiguration,
      refreshProfiles,
      setIsCreateDialogOpen,
      setFormData,
    ),
    handleEditProfile: createHandleEditProfile(
      formData,
      editingProfile,
      refreshProfiles,
      setIsEditDialogOpen,
      setEditingProfile,
      setFormData,
    ),
    openCreateDialog: createOpenCreateDialog(setFormData, setIsCreateDialogOpen),
    openEditDialog: createOpenEditDialog(setEditingProfile, setFormData, setIsEditDialogOpen),
  }
}
