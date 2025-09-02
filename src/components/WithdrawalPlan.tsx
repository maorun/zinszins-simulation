import { Panel } from 'rsuite';
import { EntnahmeSimulationsAusgabe } from './EntnahmeSimulationsAusgabe';
import MonteCarloAnalysis from './MonteCarloAnalysis';
import { useSimulation } from '../contexts/useSimulation';

const WithdrawalPlan = () => {
    const {
        startEnd,
        simulationData,
        setStartEnd,
        setWithdrawalResults,
        steuerlast,
        teilfreistellungsquote,
    } = useSimulation();

    if (!simulationData) return null;

    return (
        <>
            <Panel header="💸 Entnahme" collapsible bordered>
                <EntnahmeSimulationsAusgabe
                    startEnd={startEnd}
                    elemente={simulationData.sparplanElements}
                    dispatchEnd={(val) => setStartEnd(val)}
                    onWithdrawalResultsChange={setWithdrawalResults}
                    steuerlast={steuerlast / 100}
                    teilfreistellungsquote={teilfreistellungsquote / 100}
                />
            </Panel>
            
            <Panel header="🎲 Monte Carlo Analyse" collapsible bordered style={{ marginTop: '1rem' }}>
                <MonteCarloAnalysis />
            </Panel>
        </>
    );
};

export default WithdrawalPlan;
