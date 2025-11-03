import { Card, CardHeader, CardTitle, CardContent } from '../ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible'
import { ChevronDown } from 'lucide-react'
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
        <CardHeader nestingLevel={1}>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
              <CardTitle className="text-left">💰 Steuer-Konfiguration</CardTitle>
              <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </div>
          </CollapsibleTrigger>
        </CardHeader>
        <CollapsibleContent>
          <CardContent nestingLevel={1}>
            <TaxSectionsContent simulation={simulation} yearToday={yearToday} />
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
