import type { UserProfile } from '../../utils/profile-storage'

interface ProfileCardInfoProps {
  profile: UserProfile
  isActive: boolean
  formatDate: (dateString: string) => string
}

/** Profile Card Info Component */
export function ProfileCardInfo({ profile, isActive, formatDate }: ProfileCardInfoProps) {
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
