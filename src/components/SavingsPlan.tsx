import { Panel } from 'rsuite';
import { SparplanEingabe } from './SparplanEingabe';
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe';
import SavingsPhaseMonteCarloAnalysis from './SavingsPhaseMonteCarloAnalysis';
import { useSimulation } from '../contexts/useSimulation';
import { convertSparplanToElements } from '../utils/sparplan-utils';

const SavingsPlan = () => {
  const { setSparplan, startEnd, simulationAnnual, setSparplanElemente, simulationData } = useSimulation();

  return (
    <>
      <Panel header="💼 Sparpläne erstellen" collapsible bordered>
        <SparplanEingabe
          dispatch={(sparplan) => {
            setSparplan(sparplan);
            setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual));
          }}
          simulationAnnual={simulationAnnual}
        />
      </Panel>
      
      {simulationData && (
        <Panel header="📊 Sparplan-Verlauf" collapsible bordered style={{ marginTop: '1rem' }}>
          <SparplanSimulationsAusgabe
            elemente={simulationData.sparplanElements}
          />
          
          {/* Monte Carlo Analysis positioned after the summary */}
          <SavingsPhaseMonteCarloAnalysis />
        </Panel>
      )}
    </>
  );
};

export default SavingsPlan;
