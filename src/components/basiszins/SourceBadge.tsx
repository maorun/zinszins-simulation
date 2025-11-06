interface SourceBadgeProps {
  source: 'api' | 'manual' | 'fallback'
}

/**
 * Renders a badge indicating the source of the basiszins data
 */
export function SourceBadge({ source }: SourceBadgeProps) {
  const styles = {
    api: 'bg-green-100 text-green-800',
    manual: 'bg-blue-100 text-blue-800',
    fallback: 'bg-gray-100 text-gray-800',
  }

  const labels = {
    api: '🏛️ API',
    manual: '✏️ Manuell',
    fallback: '📋 Standard',
  }

  const styleClass = styles[source] || styles.fallback
  const label = labels[source] || labels.fallback

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${styleClass}`}>{label}</span>
  )
}
