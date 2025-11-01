import { CreateProfileDialog } from './CreateProfileDialog'
import { EditProfileDialog } from './EditProfileDialog'
import { DeleteProfileDialog } from './DeleteProfileDialog'
import { ClearAllProfilesDialog } from './ClearAllProfilesDialog'
import type { UserProfile } from '../../utils/profile-storage'

interface ProfileFormData {
  name: string
  description: string
}

interface ProfileDialogsProps {
  isCreateDialogOpen: boolean
  isEditDialogOpen: boolean
  isClearAllConfirmOpen: boolean
  deleteConfirmProfile: UserProfile | null
  formData: ProfileFormData
  setIsCreateDialogOpen: (open: boolean) => void
  setIsEditDialogOpen: (open: boolean) => void
  setIsClearAllConfirmOpen: (open: boolean) => void
  setDeleteConfirmProfile: (profile: UserProfile | null) => void
  setFormData: (data: ProfileFormData) => void
  onCreateProfile: () => void
  onEditProfile: () => void
  onDeleteProfile: () => void
  onClearAllProfiles: () => void
}

/** Profile Dialogs Component */
export function ProfileDialogs({
  isCreateDialogOpen,
  isEditDialogOpen,
  isClearAllConfirmOpen,
  deleteConfirmProfile,
  formData,
  setIsCreateDialogOpen,
  setIsEditDialogOpen,
  setIsClearAllConfirmOpen,
  setDeleteConfirmProfile,
  setFormData,
  onCreateProfile,
  onEditProfile,
  onDeleteProfile,
  onClearAllProfiles,
}: ProfileDialogsProps) {
  return (
    <>
      <CreateProfileDialog
        isOpen={isCreateDialogOpen}
        formData={formData}
        onOpenChange={setIsCreateDialogOpen}
        onFormDataChange={setFormData}
        onSubmit={onCreateProfile}
      />

      <EditProfileDialog
        isOpen={isEditDialogOpen}
        formData={formData}
        onOpenChange={setIsEditDialogOpen}
        onFormDataChange={setFormData}
        onSubmit={onEditProfile}
      />

      <DeleteProfileDialog
        profile={deleteConfirmProfile}
        onOpenChange={() => setDeleteConfirmProfile(null)}
        onConfirm={onDeleteProfile}
      />

      <ClearAllProfilesDialog
        isOpen={isClearAllConfirmOpen}
        onOpenChange={setIsClearAllConfirmOpen}
        onConfirm={onClearAllProfiles}
      />
    </>
  )
}
