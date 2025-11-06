import { Switch } from '../ui/switch'
import { Label } from '../ui/label'

interface AssetClassHeaderProps {
  /** Display name of the asset class */
  name: string
  /** Description of the asset class */
  description: string
  /** Whether the asset class is currently enabled */
  isEnabled: boolean
  /** Callback when the enabled state changes */
  onEnabledChange: (enabled: boolean) => void
}

/**
 * Header section of the asset class editor.
 * Displays name, description, and enable/disable toggle.
 */
export function AssetClassHeader({ name, description, isEnabled, onEnabledChange }: AssetClassHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Switch checked={isEnabled} onCheckedChange={onEnabledChange} />
          <Label className="text-sm font-medium">{name}</Label>
        </div>
        <p className="text-xs text-gray-600">{description}</p>
      </div>
    </div>
  )
}
