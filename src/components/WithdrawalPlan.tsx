import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { EntnahmeSimulationsAusgabe } from './EntnahmeSimulationsAusgabe';
import WithdrawalPhaseMonteCarloAnalysis from './WithdrawalPhaseMonteCarloAnalysis';
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
        <Card className="mb-4">
            <CardHeader>
                <CardTitle>💸 Entnahme</CardTitle>
            </CardHeader>
            <CardContent>
                <EntnahmeSimulationsAusgabe
                    startEnd={startEnd}
                    elemente={simulationData.sparplanElements}
                    dispatchEnd={(val) => setStartEnd(val)}
                    onWithdrawalResultsChange={setWithdrawalResults}
                    steuerlast={steuerlast / 100}
                    teilfreistellungsquote={teilfreistellungsquote / 100}
                />
                
                {/* Monte Carlo Analysis positioned after the withdrawal summary */}
                <WithdrawalPhaseMonteCarloAnalysis />
            </CardContent>
        </Card>
    );
};

export default WithdrawalPlan;
