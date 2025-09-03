import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { SparplanEingabe } from './SparplanEingabe';
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe';
import SavingsPhaseMonteCarloAnalysis from './SavingsPhaseMonteCarloAnalysis';
import { useSimulation } from '../contexts/useSimulation';
import { convertSparplanToElements } from '../utils/sparplan-utils';

const SavingsPlan = () => {
  const { setSparplan, startEnd, simulationAnnual, setSparplanElemente, simulationData } = useSimulation();

  return (
    <>
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
            
            {/* Monte Carlo Analysis positioned after the summary */}
            <SavingsPhaseMonteCarloAnalysis />
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default SavingsPlan;
