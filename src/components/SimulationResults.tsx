import SavingsPlanSimulation from './SavingsPlanSimulation';
import MonteCarloAnalysis from './MonteCarloAnalysis';
import DetailedSimulation from './DetailedSimulation';

const SimulationResults = () => {
    return (
        <>
            <SavingsPlanSimulation />
            <MonteCarloAnalysis />
            <DetailedSimulation />
        </>
    );
};

export default SimulationResults;
