import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Switch } from '../ui/switch'

interface EMRenteDisabledStateProps {
  nestingLevel: number
  enabledSwitchId: string
  onToggle: (enabled: boolean) => void
}

export function EMRenteDisabledState({ nestingLevel, enabledSwitchId, onToggle }: EMRenteDisabledStateProps) {
  return (
    <Card nestingLevel={nestingLevel}>
      <CardHeader nestingLevel={nestingLevel} className="pb-3">
        <CardTitle className="text-base sm:text-lg flex items-center justify-between">
          <span className="flex items-center gap-2">EM-Rente (Erwerbsminderungsrente)</span>
          <Switch checked={false} onCheckedChange={onToggle} id={enabledSwitchId} />
        </CardTitle>
      </CardHeader>
      <CardContent nestingLevel={nestingLevel}>
        <p className="text-sm text-muted-foreground">
          Aktivieren Sie die EM-Rente-Berechnung, um die gesetzliche Erwerbsminderungsrente in Ihre Planung
          einzubeziehen.
        </p>
      </CardContent>
    </Card>
  )
}
