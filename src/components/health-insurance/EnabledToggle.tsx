import { useMemo } from 'react'
import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { generateFormId } from '../../utils/unique-id'

interface EnabledToggleProps {
  enabled: boolean
  onEnabledChange: (enabled: boolean) => void
  /** Unique identifier for generating stable form IDs */
  idPrefix?: string
}

/**
 * Toggle switch for enabling/disabling health care insurance configuration
 */
export function EnabledToggle({ enabled, onEnabledChange, idPrefix = 'health-care-insurance' }: EnabledToggleProps) {
  const switchId = useMemo(() => generateFormId(idPrefix, 'enabled'), [idPrefix])

  return (
    <div className="flex items-center space-x-2">
      <Switch checked={enabled} onCheckedChange={onEnabledChange} id={switchId} />
      <Label htmlFor={switchId}>Kranken- und Pflegeversicherung berücksichtigen</Label>
    </div>
  )
}
