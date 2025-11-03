import type { FC, RefObject, ComponentProps } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
import type { UserProfile } from '../../utils/profile-storage'
import { ProfileContentArea as ProfileContentAreaComponent } from './ProfileContentArea'

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
  nestingLevel: number
  navigationRef: RefObject<HTMLDivElement | null>
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
  ProfileList: FC<ProfileListProps>
  ProfileContentArea: FC<ComponentProps<typeof ProfileContentAreaComponent>>
}

/** Card header with collapsible trigger */
function CardHeaderTrigger() {
  return (
    <CollapsibleTrigger asChild>
      <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
        <CardTitle className="text-left">👤 Profile verwalten</CardTitle>
        <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </div>
    </CollapsibleTrigger>
  )
}

/** Profile Management Card Component */
export function ProfileManagementCard({
  nestingLevel,
  navigationRef,
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
  ProfileContentArea,
}: ProfileCardProps) {
  return (
    <Card nestingLevel={nestingLevel} className="mb-4" ref={navigationRef}>
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={nestingLevel}>
          <CardHeaderTrigger />
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <ProfileContentArea
              activeProfile={activeProfile}
              profiles={profiles}
              hasStoredProfiles={hasStoredProfiles}
              formatDate={formatDate}
              onSwitchProfile={onSwitchProfile}
              onEditProfile={onEditProfile}
              onDuplicateProfile={onDuplicateProfile}
              onDeleteProfile={onDeleteProfile}
              onCreateProfile={onCreateProfile}
              onClearAllProfiles={onClearAllProfiles}
              ProfileList={ProfileList}
            />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
