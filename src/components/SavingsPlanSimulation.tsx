import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Button } from './ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe'
import { useSimulation } from '../contexts/useSimulation'
import { useNestingLevel } from '../lib/nesting-utils'

const SavingsPlanSimulation = () => {
  const { simulationData } = useSimulation()
  const nestingLevel = useNestingLevel()

  if (!simulationData) return null

  return (
    <Collapsible defaultOpen={false}>
      <Card nestingLevel={nestingLevel}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0" asChild>
            <CardHeader nestingLevel={nestingLevel} className="cursor-pointer hover:bg-gray-50/50">
              <div className="flex items-center justify-between w-full">
                <CardTitle>📊 Sparplan-Simulation</CardTitle>
                <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CardHeader>
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent nestingLevel={nestingLevel}>
            <SparplanSimulationsAusgabe elemente={simulationData.sparplanElements} />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}

export default SavingsPlanSimulation
