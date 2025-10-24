import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { Switch } from '../ui/switch'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { Input } from '../ui/input'
import { ChevronDown } from 'lucide-react'
import { GlossaryTerm } from '../GlossaryTerm'
import { GERMAN_TAX_CONSTANTS } from '../../../helpers/steuer'

interface GrundfreibetragConfigurationProps {
  grundfreibetragAktiv: boolean
  grundfreibetragBetrag: number
  recommendedGrundfreibetrag: number
  planningModeLabel: string
  onGrundfreibetragAktivChange: (value: boolean) => void
  onGrundfreibetragBetragChange: (value: number) => void
}

// eslint-disable-next-line max-lines-per-function -- Complex configuration component
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
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <Label htmlFor="grundfreibetragAktiv" className="font-medium">
                  <GlossaryTerm term="grundfreibetrag">
                    Grundfreibetrag
                  </GlossaryTerm>
                  {' '}
                  berücksichtigen
                </Label>
                <p className="text-sm text-muted-foreground">
                  Berücksichtigt den Grundfreibetrag für die Einkommensteuer bei Entnahmen
                  (relevant für Rentner ohne weiteres Einkommen)
                </p>
              </div>
              <Switch
                id="grundfreibetragAktiv"
                checked={grundfreibetragAktiv}
                onCheckedChange={onGrundfreibetragAktivChange}
              />
            </div>

            {grundfreibetragAktiv && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="grundfreibetragBetrag">Grundfreibetrag pro Jahr (€)</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onGrundfreibetragBetragChange(recommendedGrundfreibetrag)}
                    className="text-xs"
                  >
                    Reset (
                    {planningModeLabel}
                    )
                  </Button>
                </div>
                <Input
                  id="grundfreibetragBetrag"
                  type="number"
                  value={grundfreibetragBetrag}
                  min={0}
                  max={50000}
                  step={100}
                  onChange={(e) => {
                    const value = Number(e.target.value)
                    if (!isNaN(value)) {
                      onGrundfreibetragBetragChange(value)
                    }
                  }}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">
                  <p>
                    Aktueller Grundfreibetrag 2024: €
                    {GERMAN_TAX_CONSTANTS.GRUNDFREIBETRAG_2024.toLocaleString()}
                    {' '}
                    pro Person | Empfohlener Wert für
                    {' '}
                    {planningModeLabel}
                    : €
                    {recommendedGrundfreibetrag.toLocaleString()}
                  </p>
                  <p>
                    Der Grundfreibetrag wird automatisch basierend auf dem Planungsmodus
                    (Einzelperson/Ehepaar) gesetzt. Er wird sowohl für einheitliche Strategien
                    als auch für geteilte Entsparphasen berücksichtigt.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
