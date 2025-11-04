import { Label } from '../ui/label'
import { Switch } from '../ui/switch'

interface PensionEnableSwitchProps {
  enabled: boolean
  onToggle: (enabled: boolean) => void
  switchId: string
  planningMode?: 'individual' | 'couple'
}

export function PensionEnableSwitch({
  enabled,
  onToggle,
  switchId,
  planningMode = 'individual',
}: PensionEnableSwitchProps) {
  const descriptionText = planningMode === 'couple'
    ? 'Aktivieren Sie diese Option, um die gesetzlichen Renten beider Partner in die Entnahmeplanung einzubeziehen. Dies ermöglicht eine realistische Berechnung Ihres privaten Entnahmebedarfs.'
    : 'Aktivieren Sie diese Option, um Ihre gesetzliche Rente in die Entnahmeplanung einzubeziehen. Dies ermöglicht eine realistische Berechnung Ihres privaten Entnahmebedarfs.'

  return (
    <>
      <div className="flex items-center space-x-2">
        <Switch
          checked={enabled}
          onCheckedChange={onToggle}
          id={switchId}
        />
        <Label htmlFor={switchId}>
          Gesetzliche Rente berücksichtigen
        </Label>
      </div>
      <div className="text-sm text-muted-foreground">
        {descriptionText}
      </div>
    </>
  )
}
