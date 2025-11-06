import { UserCheck } from 'lucide-react'
import type { UserProfile } from '../../utils/profile-storage'

interface ActiveProfileDisplayProps {
  profile: UserProfile
  formatDate: (dateString: string) => string
}

/** Active Profile Display Component */
export function ActiveProfileDisplay({ profile, formatDate }: ActiveProfileDisplayProps) {
  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
      <div className="flex items-center gap-2 mb-2">
        <UserCheck className="h-4 w-4 text-blue-600" />
        <span className="font-medium text-blue-900">Aktives Profil:</span>
      </div>
      <div className="text-sm">
        <div className="font-medium">{profile.name}</div>
        {profile.description && <div className="text-gray-600 mt-1">{profile.description}</div>}
        <div className="text-gray-500 mt-1">Zuletzt aktualisiert: {formatDate(profile.updatedAt)}</div>
      </div>
    </div>
  )
}
