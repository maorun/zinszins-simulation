import { TrendingUp } from 'lucide-react'
import { CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'

interface ExpandedHeaderProps {
  enabledId: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

export function ExpandedHeader({ enabledId, enabled, onEnabledChange }: ExpandedHeaderProps) {
  return (
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <CardTitle>Immobilien-Leverage-Analyse</CardTitle>
        </div>
        <Switch id={enabledId} checked={enabled} onCheckedChange={onEnabledChange} />
      </div>
      <CardDescription>
        Vergleich verschiedener Finanzierungsszenarien mit unterschiedlichen Eigenkapitalquoten.
      </CardDescription>
    </CardHeader>
  )
}
