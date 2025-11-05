import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
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
        <CardHeader nestingLevel={1}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left">🏠 Grundfreibetrag-Konfiguration</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
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
