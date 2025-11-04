import type { ComponentType, RefObject } from 'react'
import type { UserProfile } from '../../utils/profile-storage'
import { ProfileManagementCard } from './ProfileManagementCard'
import { ProfileDialogs } from './ProfileDialogs'
import type { ProfileContentAreaProps } from './ProfileContentArea'

interface ProfileFormData {
  name: string
  description: string
}

interface ProfileListProps {
  profiles: UserProfile[]
  activeProfileId: string | undefined
  onSwitch: (profile: UserProfile) => void
  onEdit: (profile: UserProfile) => void
  onDuplicate: (profile: UserProfile) => void
  onDelete: (profile: UserProfile) => void
  formatDate: (dateString: string) => string
}

interface ProfileManagementViewProps {
  nestingLevel: number
  navigationRef: RefObject<HTMLDivElement | null>
  state: {
    profiles: UserProfile[]
    activeProfile: UserProfile | null
    isCreateDialogOpen: boolean
    isEditDialogOpen: boolean
    isClearAllConfirmOpen: boolean
    deleteConfirmProfile: UserProfile | null
    formData: ProfileFormData
    formatDate: (dateString: string) => string
    setIsCreateDialogOpen: (open: boolean) => void
    setIsEditDialogOpen: (open: boolean) => void
    setIsClearAllConfirmOpen: (open: boolean) => void
    setDeleteConfirmProfile: (profile: UserProfile | null) => void
    setFormData: (data: ProfileFormData) => void
  }
  handlers: {
    handleSwitchProfile: (profile: UserProfile) => void
    openEditDialog: (profile: UserProfile) => void
    handleDuplicateProfile: (profile: UserProfile) => void
    handleDeleteProfile: (profile: UserProfile) => void
    openCreateDialog: () => void
    handleClearAllProfiles: () => void
    handleCreateProfile: () => void
    handleEditProfile: () => void
    confirmDeleteProfile: () => void
    confirmClearAllProfiles: () => void
  }
  ProfileList: ComponentType<ProfileListProps>
  ProfileContentArea: ComponentType<ProfileContentAreaProps>
}

/** Profile Management View Component */
export function ProfileManagementView({
  nestingLevel,
  navigationRef,
  state,
  handlers,
  ProfileList,
  ProfileContentArea,
}: ProfileManagementViewProps) {
  return (
    <>
      <ProfileManagementCard
        nestingLevel={nestingLevel}
        navigationRef={navigationRef}
        activeProfile={state.activeProfile}
        profiles={state.profiles}
        hasStoredProfiles={state.profiles.length > 0}
        formatDate={state.formatDate}
        onSwitchProfile={handlers.handleSwitchProfile}
        onEditProfile={handlers.openEditDialog}
        onDuplicateProfile={handlers.handleDuplicateProfile}
        onDeleteProfile={handlers.handleDeleteProfile}
        onCreateProfile={handlers.openCreateDialog}
        onClearAllProfiles={handlers.handleClearAllProfiles}
        ProfileList={ProfileList}
        ProfileContentArea={ProfileContentArea}
      />

      <ProfileDialogs
        isCreateDialogOpen={state.isCreateDialogOpen}
        isEditDialogOpen={state.isEditDialogOpen}
        isClearAllConfirmOpen={state.isClearAllConfirmOpen}
        deleteConfirmProfile={state.deleteConfirmProfile}
        formData={state.formData}
        setIsCreateDialogOpen={state.setIsCreateDialogOpen}
        setIsEditDialogOpen={state.setIsEditDialogOpen}
        setIsClearAllConfirmOpen={state.setIsClearAllConfirmOpen}
        setDeleteConfirmProfile={state.setDeleteConfirmProfile}
        setFormData={state.setFormData}
        onCreateProfile={handlers.handleCreateProfile}
        onEditProfile={handlers.handleEditProfile}
        onDeleteProfile={handlers.confirmDeleteProfile}
        onClearAllProfiles={handlers.confirmClearAllProfiles}
      />
    </>
  )
}
