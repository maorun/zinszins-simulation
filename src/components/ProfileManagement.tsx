import { useNestingLevel } from '../lib/nesting-utils'
import { useNavigationItem } from '../hooks/useNavigationItem'
import type { UserProfile } from '../utils/profile-storage'
import { useSimulation } from '../contexts/useSimulation'
import { ProfileCardInfo } from './ProfileManagement/ProfileCardInfo'
import { ProfileCardActions } from './ProfileManagement/ProfileCardActions'
import { ProfileContentArea } from './ProfileManagement/ProfileContentArea'
import { ProfileManagementView } from './ProfileManagement/ProfileManagementView'
import { useProfileHandlers } from './ProfileManagement/useProfileHandlers'
import { useProfileState } from './ProfileManagement/useProfileState'

interface ProfileListProps {
  profiles: UserProfile[]
  activeProfileId: string | undefined
  onSwitch: (profile: UserProfile) => void
  onEdit: (profile: UserProfile) => void
  onDuplicate: (profile: UserProfile) => void
  onDelete: (profile: UserProfile) => void
  formatDate: (dateString: string) => string
}

interface ProfileCardProps {
  profile: UserProfile
  isActive: boolean
  canDelete: boolean
  onSwitch: () => void
  onEdit: () => void
  onDuplicate: () => void
  onDelete: () => void
  formatDate: (dateString: string) => string
}

/** Profile Card Component */
function ProfileCard({
interface ProfileInfoProps {
  profile: UserProfile
  isActive: boolean
  formatDate: (dateString: string) => string
}

interface ProfileActionsProps {
  profile: UserProfile
  isActive: boolean
  canDelete: boolean
  onSwitch: (profile: UserProfile) => void
  onEdit: (profile: UserProfile) => void
  onDuplicate: (profile: UserProfile) => void
  onDelete: (profile: UserProfile) => void
}

interface ProfileListItemProps {
  profile: UserProfile
  isActive: boolean
  canDelete: boolean
  onSwitch: (profile: UserProfile) => void
  onEdit: (profile: UserProfile) => void
  onDuplicate: (profile: UserProfile) => void
  onDelete: (profile: UserProfile) => void
  formatDate: (dateString: string) => string
}

/** Profile information display component */
function ProfileInfo({ profile, isActive, formatDate }: ProfileInfoProps) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="font-medium">{profile.name}</span>
        {isActive && (
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            Aktiv
          </span>
        )}
      </div>
      {profile.description && (
        <div className="text-sm text-gray-600 mt-1">{profile.description}</div>
      )}
      <div className="text-xs text-gray-500 mt-1">
        Erstellt:
        {' '}
        {formatDate(profile.createdAt)}
      </div>
    </div>
  )
}

/** Profile action buttons component */
function ProfileActions({
  profile,
  isActive,
  canDelete,
  onSwitch,
  onEdit,
  onDuplicate,
  onDelete,
}: ProfileActionsProps) {
  return (
    <div className="flex items-center gap-1 ml-2">
      {!isActive && (
        <Button variant="outline" size="sm" onClick={() => onSwitch(profile)} title="Profil aktivieren">
          Aktivieren
        </Button>
      )}
      <Button variant="outline" size="sm" onClick={() => onEdit(profile)} title="Profil bearbeiten">
        <Edit3 className="h-3 w-3" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => onDuplicate(profile)} title="Profil duplizieren">
        <Copy className="h-3 w-3" />
      </Button>
      {canDelete && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(profile)}
          title="Profil löschen"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

/** Profile list item component */
function ProfileListItem({
  profile,
  isActive,
  canDelete,
  onSwitch,
  onEdit,
  onDuplicate,
  onDelete,
  formatDate,
}: ProfileCardProps) {
  return (
    <div
      className={`p-3 border rounded-md ${
        isActive
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <ProfileCardInfo profile={profile} isActive={isActive} formatDate={formatDate} />
        <ProfileCardActions
          isActive={isActive}
          canDelete={canDelete}
          onSwitch={onSwitch}
          onEdit={onEdit}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
        />
      </div>
    </div>
  )
}

/** Profile list component */
function ProfileList({
  profiles,
  activeProfileId,
  onSwitch,
  onEdit,
  onDuplicate,
  onDelete,
  formatDate,
}: ProfileListProps) {
  if (profiles.length === 0) return null

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-gray-700">
        Verfügbare Profile (
        {profiles.length}
        )
      </h4>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {profiles.map(profile => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isActive={profile.id === activeProfileId}
            canDelete={profiles.length > 1}
            onSwitch={() => onSwitch(profile)}
            onEdit={() => onEdit(profile)}
            onDuplicate={() => onDuplicate(profile)}
            onDelete={() => onDelete(profile)}
            formatDate={formatDate}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Profile Management Component
 * Provides comprehensive profile management including create, edit, switch, duplicate, and delete
 */
export default function ProfileManagement() {
  const { getCurrentConfiguration, loadSavedConfiguration, resetToDefaults } = useSimulation()
  const nestingLevel = useNestingLevel()
  const state = useProfileState()

  const handlers = useProfileHandlers({
    getCurrentConfiguration,
    loadSavedConfiguration,
    resetToDefaults,
    refreshProfiles: state.refreshProfiles,
    activeProfile: state.activeProfile,
    formData: state.formData,
    editingProfile: state.editingProfile,
    setFormData: state.setFormData,
    setIsCreateDialogOpen: state.setIsCreateDialogOpen,
    setIsEditDialogOpen: state.setIsEditDialogOpen,
    setEditingProfile: state.setEditingProfile,
    setDeleteConfirmProfile: state.setDeleteConfirmProfile,
    setIsClearAllConfirmOpen: state.setIsClearAllConfirmOpen,
    deleteConfirmProfile: state.deleteConfirmProfile,
  })

  const navigationRef = useNavigationItem({
    id: 'profile-management',
    title: 'Profile verwalten',
    icon: '👤',
    level: 0,
  })

  return (
    <ProfileManagementView
      nestingLevel={nestingLevel}
      navigationRef={navigationRef}
      state={state}
      handlers={handlers}
      ProfileList={ProfileList}
      ProfileContentArea={ProfileContentArea}
    />
  )
}
