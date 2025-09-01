import { Panel } from 'rsuite';
import { MonteCarloResults } from './MonteCarloResults';
import { useSimulation } from '../contexts/useSimulation';
import { unique } from '../utils/array-utils';

const MonteCarloAnalysis = () => {
    const { simulationData, averageReturn, standardDeviation, randomSeed } = useSimulation();

    if (!simulationData) return null;

    const data = unique(simulationData ? (simulationData.sparplanElements.flatMap((v: any) => v.simulation ? Object.keys(v.simulation) : []).map(Number).filter((v: number) => !isNaN(v))) : []) as number[]

    return (
        <Panel header="🎲 Monte Carlo Analyse" collapsible bordered>
            <MonteCarloResults
                years={data}
                accumulationConfig={{
                    averageReturn: averageReturn / 100,
                    standardDeviation: standardDeviation / 100,
                    seed: randomSeed
                }}
                withdrawalConfig={{
                    averageReturn: 0.05, // Default 5% for withdrawal phase (more conservative)
                    standardDeviation: 0.12, // Default 12% volatility (more conservative)
                    seed: randomSeed
                }}
            />
        </Panel>
    );
};

export default MonteCarloAnalysis;
