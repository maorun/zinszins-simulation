import { Switch } from '../ui/switch'
import { Label } from '../ui/label'
import { generateFormId } from '../../utils/unique-id'
import type { DashboardSectionId } from '../../utils/dashboard-preferences'

interface VisibilityToggleProps {
  sectionId: DashboardSectionId
  visible: boolean
  canToggle: boolean
  onVisibilityChange: (sectionId: DashboardSectionId, visible: boolean) => void
}

/**
 * Toggle switch for section visibility
 */
export function VisibilityToggle({ sectionId, visible, canToggle, onVisibilityChange }: VisibilityToggleProps) {
  const switchId = generateFormId('dashboard-customization', sectionId, 'visibility')

  return (
    <div className="flex items-center gap-2 pt-1">
      <Switch
        id={switchId}
        checked={visible}
        onCheckedChange={(checked) => {
          // Prevent hiding the last visible section
          if (!canToggle && !checked) {
            return
          }

          onVisibilityChange(sectionId, checked)
        }}
        disabled={!canToggle}
      />

      <Label htmlFor={switchId} className="sr-only">
        {visible ? 'Ausblenden' : 'Einblenden'}
      </Label>
    </div>
  )
}
