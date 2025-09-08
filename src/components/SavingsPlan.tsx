import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { SparplanEingabe } from './SparplanEingabe';
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe';
import RiskAssessment from './RiskAssessment';
import ReturnConfiguration from './ReturnConfiguration';
import { useSimulation } from '../contexts/useSimulation';
import { convertSparplanToElements } from '../utils/sparplan-utils';

const SavingsPlan = () => {
  const [isSparpläneOpen, setIsSparpläneOpen] = useState(false); // Default to closed
  const [isSparplanVerlaufOpen, setIsSparplanVerlaufOpen] = useState(false); // Default to closed
  const { setSparplan, startEnd, simulationAnnual, setSparplanElemente, simulationData } = useSimulation();

  return (
    <>
      <ReturnConfiguration />
      
      <Card className="mb-4">
        <Collapsible open={isSparpläneOpen} onOpenChange={setIsSparpläneOpen}>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                <CardTitle className="text-left">💼 Sparpläne erstellen</CardTitle>
                {isSparpläneOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
          <SparplanEingabe
            dispatch={(sparplan) => {
              setSparplan(sparplan);
              setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual));
            }}
            simulationAnnual={simulationAnnual}
          />
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
      
      {simulationData && (
        <Card className="mb-4">
          <Collapsible open={isSparplanVerlaufOpen} onOpenChange={setIsSparplanVerlaufOpen}>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between w-full cursor-pointer hover:bg-gray-50 rounded-md p-2 -m-2 transition-colors">
                  <CardTitle className="text-left">📊 Sparplan-Verlauf</CardTitle>
                  {isSparplanVerlaufOpen ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
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
  );
};

export default SavingsPlan;
