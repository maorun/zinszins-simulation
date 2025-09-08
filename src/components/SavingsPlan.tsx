import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { SparplanEingabe } from './SparplanEingabe';
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe';
import RiskAssessment from './RiskAssessment';
import ReturnConfiguration from './ReturnConfiguration';
import { useSimulation } from '../contexts/useSimulation';
import { convertSparplanToElements } from '../utils/sparplan-utils';

const SavingsPlan = () => {
  const { setSparplan, startEnd, simulationAnnual, setSparplanElemente, simulationData } = useSimulation();

  return (
    <>
      <ReturnConfiguration />
      
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>💼 Sparpläne erstellen</CardTitle>
        </CardHeader>
        <CardContent>
          <SparplanEingabe
            dispatch={(sparplan) => {
              setSparplan(sparplan);
              setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual));
            }}
            simulationAnnual={simulationAnnual}
          />
        </CardContent>
      </Card>
      
      {simulationData && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>📊 Sparplan-Verlauf</CardTitle>
          </CardHeader>
          <CardContent>
            <SparplanSimulationsAusgabe
              elemente={simulationData.sparplanElements}
            />
            
            {/* Risk Assessment with Monte Carlo Analysis moved to collapsible panel */}
            <RiskAssessment phase="savings" />
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default SavingsPlan;
