import { Card, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent } from '../ui/collapsible'
import { CollapsibleCardHeader } from '../ui/collapsible-card'
import { GrundfreibetragToggle } from './GrundfreibetragToggle'
import { GrundfreibetragInput } from './GrundfreibetragInput'

interface GrundfreibetragConfigurationProps {
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
  recommendedGrundfreibetrag: number
  planningModeLabel: string
  onGrundfreibetragAktivChange: (value: boolean) => void
  onGrundfreibetragBetragChange: (value: number) => void
}

export function GrundfreibetragConfiguration({
  grundfreibetragAktiv,
  grundfreibetragBetrag,
  recommendedGrundfreibetrag,
  planningModeLabel,
  onGrundfreibetragAktivChange,
  onGrundfreibetragBetragChange,
}: GrundfreibetragConfigurationProps) {
  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          🏠 Grundfreibetrag-Konfiguration
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1} className="space-y-6">
            <GrundfreibetragToggle
              grundfreibetragAktiv={grundfreibetragAktiv}
              onGrundfreibetragAktivChange={onGrundfreibetragAktivChange}
            />

            {grundfreibetragAktiv && (
              <GrundfreibetragInput
                grundfreibetragBetrag={grundfreibetragBetrag}
                recommendedGrundfreibetrag={recommendedGrundfreibetrag}
                planningModeLabel={planningModeLabel}
                onGrundfreibetragBetragChange={onGrundfreibetragBetragChange}
              />
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
