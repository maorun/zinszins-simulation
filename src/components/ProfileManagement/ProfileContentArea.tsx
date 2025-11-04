import type { ComponentType } from 'react'
import { Alert, AlertDescription } from '../ui/alert'
import type { UserProfile } from '../../utils/profile-storage'
import { ActiveProfileDisplay } from './ActiveProfileDisplay'
import { ActionButtons } from './ActionButtons'
import { StatusDisplay } from './StatusDisplay'

interface ProfileListProps {
  profiles: UserProfile[]
  activeProfileId: string | undefined
  onSwitch: (profile: UserProfile) => void
  onEdit: (profile: UserProfile) => void
  onDuplicate: (profile: UserProfile) => void
  onDelete: (profile: UserProfile) => void
  formatDate: (dateString: string) => string
}

export interface ProfileContentAreaProps {
  activeProfile: UserProfile | null
  profiles: UserProfile[]
  hasStoredProfiles: boolean
  formatDate: (dateString: string) => string
  onSwitchProfile: (profile: UserProfile) => void
  onEditProfile: (profile: UserProfile) => void
  onDuplicateProfile: (profile: UserProfile) => void
  onDeleteProfile: (profile: UserProfile) => void
  onCreateProfile: () => void
  onClearAllProfiles: () => void
  ProfileList: ComponentType<ProfileListProps>
}

/** Profile Content Area Component */
export function ProfileContentArea({
  activeProfile,
  profiles,
  hasStoredProfiles,
  formatDate,
  onSwitchProfile,
  onEditProfile,
  onDuplicateProfile,
  onDeleteProfile,
  onCreateProfile,
  onClearAllProfiles,
  ProfileList,
}: ProfileContentAreaProps) {
  return (
    <>
      <Alert variant="info" className="mb-4">
        <AlertDescription>
          <strong>Profile:</strong>
          {' '}
          Speichern Sie verschiedene Konfigurationen für unterschiedliche Familien oder Testeinstellungen.
          Ihre Einstellungen werden automatisch im aktiven Profil gespeichert.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        {activeProfile && (
          <ActiveProfileDisplay profile={activeProfile} formatDate={formatDate} />
        )}

        <ProfileList
          profiles={profiles}
          activeProfileId={activeProfile?.id}
          onSwitch={onSwitchProfile}
          onEdit={onEditProfile}
          onDuplicate={onDuplicateProfile}
          onDelete={onDeleteProfile}
          formatDate={formatDate}
        />

        <ActionButtons
          hasStoredProfiles={hasStoredProfiles}
          onCreateProfile={onCreateProfile}
          onClearAllProfiles={onClearAllProfiles}
        />

        <StatusDisplay hasStoredProfiles={hasStoredProfiles} profileCount={profiles.length} />
      </div>
    </>
  )
}
