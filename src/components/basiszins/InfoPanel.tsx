import { Alert, AlertDescription } from '../ui/alert'

/**
 * Renders the information panel about Basiszins usage
 */
export function InfoPanel() {
  return (
    <Alert>
      <AlertDescription>
        Der Basiszins wird zur Berechnung der Vorabpauschale verwendet.
        Die offiziellen Sätze werden jährlich vom Bundesfinanzministerium
        basierend auf Bundesbank-Daten veröffentlicht.
      </AlertDescription>
    </Alert>
  )
}
