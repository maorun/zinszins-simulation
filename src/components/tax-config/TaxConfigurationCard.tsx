import { Card, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent } from '../ui/collapsible'
import { CollapsibleCardHeader } from '../ui/collapsible-card'
import { TaxSectionsContent } from './TaxSectionsContent'

interface SimulationContext {
  performSimulation: () => void
  steuerlast: number
  setSteuerlast: (value: number) => void
  teilfreistellungsquote: number
  setTeilfreistellungsquote: (value: number) => void
  guenstigerPruefungAktiv: boolean
  setGuenstigerPruefungAktiv: (value: boolean) => void
  personalTaxRate: number
  setPersonalTaxRate: (value: number) => void
  kirchensteuerAktiv: boolean
  setKirchensteuerAktiv: (value: boolean) => void
  kirchensteuersatz: number
  setKirchensteuersatz: (value: number) => void
  steuerReduzierenEndkapitalSparphase: boolean
  setSteuerReduzierenEndkapitalSparphase: (value: boolean) => void
  steuerReduzierenEndkapitalEntspharphase: boolean
  setSteuerReduzierenEndkapitalEntspharphase: (value: boolean) => void
  freibetragPerYear: Record<number, number>
  setFreibetragPerYear: (values: Record<number, number>) => void
}

interface TaxConfigurationCardProps {
  simulation: SimulationContext
  yearToday: number
}

export function TaxConfigurationCard({
  simulation,
  yearToday,
}: TaxConfigurationCardProps) {
  return (
    <Card nestingLevel={1}>
      <Collapsible defaultOpen={false}>
        <CollapsibleCardHeader titleClassName="text-left" simplifiedPadding>
          💰 Steuer-Konfiguration
        </CollapsibleCardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <TaxSectionsContent simulation={simulation} yearToday={yearToday} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
