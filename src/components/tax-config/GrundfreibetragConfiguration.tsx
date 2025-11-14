import { Card, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent } from '../ui/collapsible'
import { CollapsibleCardHeader } from '../ui/collapsible-card'
import { GrundfreibetragToggle } from './GrundfreibetragToggle'
import { GrundfreibetragInput } from './GrundfreibetragInput'
import { EinkommensteuersatzInput } from './EinkommensteuersatzInput'

interface GrundfreibetragConfigurationProps {
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
  recommendedGrundfreibetrag: number
  planningModeLabel: string
  onGrundfreibetragAktivChange: (value: boolean) => void
  onGrundfreibetragBetragChange: (value: number) => void
  // Optional props for Einkommensteuersatz (only needed when Günstigerprüfung is not active)
  guenstigerPruefungAktiv?: boolean
  einkommensteuersatz?: number
  onEinkommensteuersatzChange?: (value: number) => void
}

export function GrundfreibetragConfiguration({
  grundfreibetragAktiv,
  grundfreibetragBetrag,
  recommendedGrundfreibetrag,
  planningModeLabel,
  onGrundfreibetragAktivChange,
  onGrundfreibetragBetragChange,
  guenstigerPruefungAktiv,
  einkommensteuersatz,
  onEinkommensteuersatzChange,
}: GrundfreibetragConfigurationProps) {
  // Show income tax rate input only when:
  // - Grundfreibetrag is active
  // - Günstigerprüfung is NOT active (when it's active, progressive tax is used)
  // - The necessary props are provided
  const showEinkommensteuersatz =
    grundfreibetragAktiv &&
    !guenstigerPruefungAktiv &&
    einkommensteuersatz !== undefined &&
    onEinkommensteuersatzChange !== undefined

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
              <>
                <GrundfreibetragInput
                  grundfreibetragBetrag={grundfreibetragBetrag}
                  recommendedGrundfreibetrag={recommendedGrundfreibetrag}
                  planningModeLabel={planningModeLabel}
                  onGrundfreibetragBetragChange={onGrundfreibetragBetragChange}
                />

                {showEinkommensteuersatz && (
                  <EinkommensteuersatzInput
                    einkommensteuersatz={einkommensteuersatz}
                    onEinkommensteuersatzChange={onEinkommensteuersatzChange}
                  />
                )}
              </>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
