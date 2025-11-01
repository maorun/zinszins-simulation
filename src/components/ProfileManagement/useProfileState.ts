import { useState, useEffect } from 'react'
import { getAllProfiles, getActiveProfile, type UserProfile } from '../../utils/profile-storage'

interface ProfileFormData {
  name: string
  description: string
}

/** Custom hook for profile state management */
export function useProfileState() {
  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [activeProfile, setActiveProfileState] = useState<UserProfile | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({ name: '', description: '' })
  const [deleteConfirmProfile, setDeleteConfirmProfile] = useState<UserProfile | null>(null)
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false)

  useEffect(() => {
    refreshProfiles()
  }, [])

  const refreshProfiles = () => {
    setProfiles(getAllProfiles())
    setActiveProfileState(getActiveProfile())
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return {
    profiles,
    activeProfile,
    isCreateDialogOpen,
    isEditDialogOpen,
    editingProfile,
    formData,
    deleteConfirmProfile,
    isClearAllConfirmOpen,
    refreshProfiles,
    formatDate,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setEditingProfile,
    setFormData,
    setDeleteConfirmProfile,
    setIsClearAllConfirmOpen,
  }
}
