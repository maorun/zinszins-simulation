import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { SparplanSimulationsAusgabe } from './SparplanSimulationsAusgabe';
import { useSimulation } from '../contexts/useSimulation';

const SavingsPlanSimulation = () => {
    const { simulationData } = useSimulation();

    if (!simulationData) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>📊 Sparplan-Simulation</CardTitle>
            </CardHeader>
            <CardContent>
                <SparplanSimulationsAusgabe
                    elemente={simulationData.sparplanElements}
                />
            </CardContent>
        </Card>
    );
};

export default SavingsPlanSimulation;
