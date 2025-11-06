import { Download, RefreshCw } from 'lucide-react'
import { Button } from '../ui/button'

interface ApiActionsSectionProps {
  handleFetchFromApi: () => void
  isLoading: boolean
  lastApiUpdate: string | null
}

/**
 * Renders the action buttons for fetching data from the API
 */
export function ApiActionsSection({ handleFetchFromApi, isLoading, lastApiUpdate }: ApiActionsSectionProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={handleFetchFromApi} disabled={isLoading}>
        {isLoading ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
        Von Bundesbank aktualisieren
      </Button>

      {lastApiUpdate && (
        <div className="text-sm text-muted-foreground self-center">
          Zuletzt aktualisiert: {new Date(lastApiUpdate).toLocaleDateString('de-DE')}
        </div>
      )}
    </div>
  )
}
