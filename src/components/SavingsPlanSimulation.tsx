import { Panel } from 'rsuite';
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe';
import { useSimulation } from '../contexts/SimulationContext';

const SavingsPlanSimulation = () => {
    const { simulationData } = useSimulation();

    if (!simulationData) return null;

    return (
        <Panel header="📊 Sparplan-Simulation" collapsible bordered>
            <SparplanSimulationsAusgabe
                elemente={simulationData.sparplanElements}
            />
        </Panel>
    );
};

export default SavingsPlanSimulation;
