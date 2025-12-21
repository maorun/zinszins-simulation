import { Switch } from '../ui/switch'
import { Label } from '../ui/label'

interface SectionHeaderProps {
  enabled: boolean
  enabledSwitchId: string
  onEnabledChange: (enabled: boolean) => void
}

export function SectionHeader({ enabled, enabledSwitchId, onEnabledChange }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <Label className="text-base font-medium">🌍 Quellensteueranrechnung</Label>
        <p className="text-sm text-muted-foreground">
          Anrechnung ausländischer Quellensteuer auf deutsche Kapitalertragsteuer (§ 32d Abs. 5 EStG)
        </p>
      </div>
      <Switch id={enabledSwitchId} checked={enabled} onCheckedChange={onEnabledChange} />
    </div>
  )
}
