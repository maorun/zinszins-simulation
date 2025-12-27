import { TrendingUp } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'

interface CollapsedLeverageCardProps {
  enabledId: string
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
}

export function CollapsedLeverageCard({ enabledId, enabled, onEnabledChange }: CollapsedLeverageCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <CardTitle>Immobilien-Leverage-Analyse</CardTitle>
          </div>
          <Switch id={enabledId} checked={enabled} onCheckedChange={onEnabledChange} />
        </div>
        <CardDescription>
          Optimale Finanzierungsstrukturen für Immobilieninvestitionen analysieren und vergleichen. Verstehen Sie den
          Hebeleffekt (Leverage) und dessen Auswirkungen auf Rendite und Risiko.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
