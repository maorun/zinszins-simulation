import { Panel } from 'rsuite';
import { SparplanEingabe } from './SparplanEingabe';
import { useSimulation } from '../contexts/useSimulation';
import { convertSparplanToElements } from '../utils/sparplan-utils';

const SavingsPlan = () => {
  const { setSparplan, startEnd, simulationAnnual, setSparplanElemente } = useSimulation();

  return (
    <Panel header="💼 Sparpläne erstellen" collapsible bordered>
      <SparplanEingabe
        dispatch={(sparplan) => {
          setSparplan(sparplan);
          setSparplanElemente(convertSparplanToElements(sparplan, startEnd, simulationAnnual));
        }}
        simulationAnnual={simulationAnnual}
      />
    </Panel>
  );
};

export default SavingsPlan;
