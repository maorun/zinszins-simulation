import { Alert, AlertDescription } from '../ui/alert'

interface StatusDisplayProps {
  hasStoredProfiles: boolean
  profileCount: number
}

/** Status Display Component */
export function StatusDisplay({ hasStoredProfiles, profileCount }: StatusDisplayProps) {
  if (hasStoredProfiles) {
    return (
      <Alert variant="success">
        <AlertDescription>
          ✅ {profileCount} Profile gespeichert - Einstellungen werden automatisch im aktiven Profil gespeichert
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Alert variant="warning">
      <AlertDescription>
        ⚠️ Keine Profile vorhanden - Erstellen Sie ein Profil, um Ihre Einstellungen zu speichern
      </AlertDescription>
    </Alert>
  )
}
