import { CollapsibleCard, CollapsibleCardContent, CollapsibleCardHeader } from '../ui/collapsible-card'
import { EnabledToggle } from './EnabledToggle'

interface DisabledStateViewProps {
  onEnabledChange: (enabled: boolean) => void
}

/**
 * View shown when health care insurance configuration is disabled
 */
export function DisabledStateView({ onEnabledChange }: DisabledStateViewProps) {
  return (
    <CollapsibleCard>
      <CollapsibleCardHeader>🏥 Kranken- und Pflegeversicherung</CollapsibleCardHeader>
      <CollapsibleCardContent>
        <div className="space-y-4">
          <EnabledToggle enabled={false} onEnabledChange={onEnabledChange} />
          <div className="text-sm text-muted-foreground">
            Aktivieren Sie diese Option, um Kranken- und Pflegeversicherungsbeiträge in die Entnahmeplanung
            einzubeziehen. Berücksichtigt unterschiedliche Versicherungsarten und Beitragssätze.
          </div>
        </div>
      </CollapsibleCardContent>
    </CollapsibleCard>
  )
}
