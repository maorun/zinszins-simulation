import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible'
import { ChevronDown } from 'lucide-react'
import { SparplanEingabe } from './SparplanEingabe'
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe'
import RiskAssessment from './RiskAssessment'
import ReturnConfiguration from './ReturnConfiguration'
import { useSimulation } from '../contexts/useSimulation'
import { convertSparplanToElements } from '../utils/sparplan-utils'

const SavingsPlan = () => {
  const { setSparplan, sparplan, startEnd, simulationAnnual, setSparplanElemente, simulationData } = useSimulation()

  return (
    <>
      <ReturnConfiguration />

      <Card className="mb-4">
        <Collapsible defaultOpen={false}>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                <CardTitle className="text-left">💼 Sparpläne erstellen</CardTitle>
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <SparplanEingabe
                dispatch={(sparplan) => {
                  setSparplan(sparplan)
                  setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual))
                }}
                simulationAnnual={simulationAnnual}
                currentSparplans={sparplan}
              />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {simulationData && (
        <Card className="mb-4">
          <Collapsible defaultOpen={false}>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors group">
                  <CardTitle className="text-left">📊 Sparplan-Verlauf</CardTitle>
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <SparplanSimulationsAusgabe
                  elemente={simulationData.sparplanElements}
                />

                {/* Risk Assessment with Monte Carlo Analysis moved to collapsible panel */}
                <RiskAssessment phase="savings" />
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}
    </>
  )
}

export default SavingsPlan
