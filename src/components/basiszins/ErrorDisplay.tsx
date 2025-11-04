import { Alert, AlertDescription } from '../ui/alert'

interface ErrorDisplayProps {
  error: string | null
}

/**
 * Renders error messages if present
 */
export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) {
    return null
  }

  return (
    <Alert variant="destructive">
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}
