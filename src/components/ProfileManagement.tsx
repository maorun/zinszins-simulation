import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { Alert, AlertDescription } from './ui/alert'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { ChevronDown, Plus, Edit3, Copy, Trash2, UserCheck } from 'lucide-react'
import { toast } from 'sonner'
import { useNestingLevel } from '../lib/nesting-utils'
import { useNavigationItem } from '../hooks/useNavigationItem'
import {
  getAllProfiles,
  getActiveProfile,
  setActiveProfile,
  createProfile,
  updateProfile,
  deleteProfile,
  duplicateProfile,
  clearAllProfiles,
  getProfileCount,
  type UserProfile,
} from '../utils/profile-storage'
import { useSimulation } from '../contexts/useSimulation'

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
}: ProfileListItemProps) {
  return (
    <div
      className={`p-3 border rounded-md ${
        isActive
          ? 'border-blue-300 bg-blue-50'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between">
        <ProfileInfo profile={profile} isActive={isActive} formatDate={formatDate} />
        <ProfileActions
          profile={profile}
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
          <ProfileListItem
            key={profile.id}
            profile={profile}
            isActive={profile.id === activeProfileId}
            canDelete={profiles.length > 1}
            onSwitch={onSwitch}
            onEdit={onEdit}
            onDuplicate={onDuplicate}
            onDelete={onDelete}
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
// eslint-disable-next-line max-lines-per-function -- Large component function
export default function ProfileManagement() {
  const { getCurrentConfiguration, loadSavedConfiguration, resetToDefaults } = useSimulation()
  const nestingLevel = useNestingLevel()

  const [profiles, setProfiles] = useState<UserProfile[]>([])
  const [activeProfile, setActiveProfileState] = useState<UserProfile | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({ name: '', description: '' })
  const [deleteConfirmProfile, setDeleteConfirmProfile] = useState<UserProfile | null>(null)
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false)

  // Load profiles and active profile on component mount
  useEffect(() => {
    refreshProfiles()
  }, [])

  const refreshProfiles = () => {
    setProfiles(getAllProfiles())
    setActiveProfileState(getActiveProfile())
  }

  const handleCreateProfile = async () => {
    if (!formData.name.trim()) {
      toast.error('Profilname ist erforderlich')
      return
    }

    try {
      const currentConfig = getCurrentConfiguration()
      const newProfile = createProfile(formData.name.trim(), currentConfig, formData.description.trim() || undefined)

      // Switch to new profile immediately
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

  const handleSwitchProfile = (profile: UserProfile) => {
    if (profile.id === activeProfile?.id) {
      return // Already active
    }

    try {
      const success = setActiveProfile(profile.id)
      if (success) {
        refreshProfiles()
        // Load the profile's configuration
        loadSavedConfiguration()
        toast.success(`Zu Profil "${profile.name}" gewechselt`)
      }
      else {
        toast.error('Fehler beim Wechseln des Profils')
      }
    }
    catch (error) {
      console.error('Failed to switch profile:', error)
      toast.error('Fehler beim Wechseln des Profils')
    }
  }

  const handleDuplicateProfile = (profile: UserProfile) => {
    try {
      const duplicatedProfile = duplicateProfile(profile.id, `${profile.name} (Kopie)`)
      if (duplicatedProfile) {
        refreshProfiles()
        toast.success(`Profil "${duplicatedProfile.name}" wurde erstellt`)
      }
      else {
        toast.error('Fehler beim Duplizieren des Profils')
      }
    }
    catch (error) {
      console.error('Failed to duplicate profile:', error)
      toast.error('Fehler beim Duplizieren des Profils')
    }
  }

  const handleDeleteProfile = (profile: UserProfile) => {
    const profileCount = getProfileCount()
    if (profileCount <= 1) {
      toast.error('Das letzte Profil kann nicht gelöscht werden')
      return
    }

    setDeleteConfirmProfile(profile)
  }

  const confirmDeleteProfile = () => {
    if (!deleteConfirmProfile) return

    try {
      const success = deleteProfile(deleteConfirmProfile.id)
      if (success) {
        refreshProfiles()
        // If we deleted the active profile, load the new active one
        if (deleteConfirmProfile.id === activeProfile?.id) {
          loadSavedConfiguration()
        }
        toast.success(`Profil "${deleteConfirmProfile.name}" wurde gelöscht`)
      }
      else {
        toast.error('Fehler beim Löschen des Profils')
      }
    }
    catch (error) {
      console.error('Failed to delete profile:', error)
      toast.error('Fehler beim Löschen des Profils')
    }
    finally {
      setDeleteConfirmProfile(null)
    }
  }

  const handleClearAllProfiles = () => {
    setIsClearAllConfirmOpen(true)
  }

  const confirmClearAllProfiles = () => {
    try {
      clearAllProfiles()
      resetToDefaults()
      refreshProfiles()
      toast.success('Alle Profile wurden gelöscht und auf Standardwerte zurückgesetzt.')
    }
    catch (error) {
      console.error('Failed to clear all profiles:', error)
      toast.error('Fehler beim Löschen aller Profile')
    }
    finally {
      setIsClearAllConfirmOpen(false)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const hasStoredProfiles = profiles.length > 0
  const navigationRef = useNavigationItem({
    id: 'profile-management',
    title: 'Profile verwalten',
    icon: '👤',
    level: 0,
  })

  return (
    <Card nestingLevel={nestingLevel} className="mb-4" ref={navigationRef}>
      <Collapsible defaultOpen={false}>
        <CardHeader nestingLevel={nestingLevel}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
              <CardTitle className="text-left">👤 Profile verwalten</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <Alert variant="info" className="mb-4">
              <AlertDescription>
                <strong>Profile:</strong>
                {' '}
                Speichern Sie verschiedene Konfigurationen für unterschiedliche Familien oder Testeinstellungen.
                Ihre Einstellungen werden automatisch im aktiven Profil gespeichert.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {/* Active Profile Display */}
              {activeProfile && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <UserCheck className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-900">Aktives Profil:</span>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium">{activeProfile.name}</div>
                    {activeProfile.description && (
                      <div className="text-gray-600 mt-1">{activeProfile.description}</div>
                    )}
                    <div className="text-gray-500 mt-1">
                      Zuletzt aktualisiert:
                      {' '}
                      {formatDate(activeProfile.updatedAt)}
                    </div>
                  </div>
                </div>
              )}

              {/* Profile List */}
              <ProfileList
                profiles={profiles}
                activeProfileId={activeProfile?.id}
                onSwitch={handleSwitchProfile}
                onEdit={openEditDialog}
                onDuplicate={handleDuplicateProfile}
                onDelete={handleDeleteProfile}
                formatDate={formatDate}
              />

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button onClick={openCreateDialog} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Neues Profil
                </Button>
                <Button
                  variant="destructive"
                  disabled={!hasStoredProfiles}
                  onClick={handleClearAllProfiles}
                >
                  🗑️ Alle Profile löschen
                </Button>
              </div>

              {/* Status Display */}
              {hasStoredProfiles
                ? (
                    <Alert variant="success">
                      <AlertDescription>
                        ✅
                        {' '}
                        {profiles.length}
                        {' '}
                        Profile gespeichert - Einstellungen werden automatisch im aktiven Profil gespeichert
                      </AlertDescription>
                    </Alert>
                  )
                : (
                    <Alert variant="warning">
                      <AlertDescription>
                        ⚠️ Keine Profile vorhanden - Erstellen Sie ein Profil, um Ihre Einstellungen zu speichern
                      </AlertDescription>
                    </Alert>
                  )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      {/* Create Profile Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Neues Profil erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="create-name">Profilname *</Label>
              <Input
                id="create-name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Familie Müller, Test Szenario 1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="create-description">Beschreibung (optional)</Label>
              <Input
                id="create-description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Kurze Beschreibung des Profils"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleCreateProfile}>
                Profil erstellen
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil bearbeiten</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Profilname *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="z.B. Familie Müller, Test Szenario 1"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Beschreibung (optional)</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Kurze Beschreibung des Profils"
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Abbrechen
              </Button>
              <Button onClick={handleEditProfile}>
                Änderungen speichern
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Profile Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirmProfile} onOpenChange={open => !open && setDeleteConfirmProfile(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Profil löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie das Profil "
              {deleteConfirmProfile?.name}
              " wirklich löschen?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteProfile} className="bg-red-600 hover:bg-red-700">
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear All Profiles Confirmation Dialog */}
      <AlertDialog open={isClearAllConfirmOpen} onOpenChange={setIsClearAllConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alle Profile löschen</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie wirklich alle Profile löschen und zu den Standardwerten zurückkehren?
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearAllProfiles} className="bg-red-600 hover:bg-red-700">
              Alle löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
