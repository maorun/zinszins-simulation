import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { useSimulation } from '../contexts/useSimulation'
import { useNestingLevel } from '../lib/nesting-utils'
import { convertSparplanToElements } from '../utils/sparplan-utils'
import CalculationModeSwitch from './CalculationModeSwitch'

const SimulationConfiguration = () => {
  const { simulationAnnual, setSimulationAnnual, setSparplanElemente, sparplan, startEnd } = useSimulation()
  const nestingLevel = useNestingLevel()

  return (
    <Collapsible defaultOpen={false}>
      <Card nestingLevel={nestingLevel} className="mb-4">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0" asChild>
            <CardHeader nestingLevel={nestingLevel} className="cursor-pointer hover:bg-gray-50/50">
              <div className="flex items-center justify-between w-full">
                <CardTitle>⚙️ Simulation-Konfiguration</CardTitle>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <div className="space-y-4">
              <CalculationModeSwitch
                simulationAnnual={simulationAnnual}
                onToggle={(checked) => {
                  const value: import('../utils/simulate').SimulationAnnualType = checked ? 'monthly' : 'yearly'
                  setSimulationAnnual(value)
                  setSparplanElemente(convertSparplanToElements(sparplan, startEnd, value))
                }}
              />
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default SimulationConfiguration
